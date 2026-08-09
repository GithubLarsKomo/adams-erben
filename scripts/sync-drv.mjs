import AdmZip from 'adm-zip';
import * as cheerio from 'cheerio';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DRV_ORIGIN = 'https://www.rudern.de';
const DIRECTORY_URL = `${DRV_ORIGIN}/service/vereinssuche`;
const ROBOTS_URL = `${DRV_ORIGIN}/robots.txt`;
const GEONAMES_URL = 'https://download.geonames.org/export/zip/DE.zip';
const USER_AGENT = process.env.DRV_SYNC_USER_AGENT || 'adams-erben/0.1 (+https://adams-erben.de; public rowing-club finder)';
const CONCURRENCY = Math.max(1, Math.min(6, Number(process.env.DRV_SYNC_CONCURRENCY || 3)));
const DELAY_MS = Math.max(100, Number(process.env.DRV_SYNC_DELAY_MS || 250));
const LIMIT = Number(process.env.DRV_SYNC_LIMIT || 0);
const REQUIRE = process.env.REQUIRE_DRV_SYNC === '1';

const LRV_BY_DRV_ID = new Map([
  ['30010', 'Baden-Württemberg'],
  ['30011', 'Bayern'],
  ['30012', 'Berlin'],
  ['30013', 'Brandenburg'],
  ['30014', 'Bremen'],
  ['30015', 'Hamburg'],
  ['30016', 'Hessen'],
  ['30017', 'Mecklenburg-Vorpommern'],
  ['30018', 'Niedersachsen'],
  ['30019', 'Nordrhein-Westfalen'],
  ['30020', 'Rheinland-Pfalz'],
  ['30021', 'Saarland'],
  ['30022', 'Sachsen'],
  ['30023', 'Sachsen-Anhalt'],
  ['30024', 'Schleswig-Holstein'],
  ['30025', 'Thüringen']
]);

const OTHER_MEMBER_PATTERN = /(Bundesstützpunkt|Olympiastützpunkt|Gymnasium|Schule|Schülerruder|Hochschule|Universität|Institut|Regattaverband|Ruderjugend)/i;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (value = '') => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

async function fetchResponse(url, { allow404 = false } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timeout);
      if (allow404 && response.status === 404) return response;
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < 3) await sleep(400 * attempt);
    }
  }
  throw new Error(`Fetch failed for ${url}: ${lastError?.message || 'unknown error'}`);
}

async function fetchText(url, options) {
  const response = await fetchResponse(url, options);
  return response.status === 404 ? '' : response.text();
}

function robotsDisallowsService(robotsText) {
  if (!robotsText) return false;
  const lines = robotsText.split(/\r?\n/).map((line) => line.replace(/#.*/, '').trim()).filter(Boolean);
  let applies = false;
  const disallowed = [];
  for (const line of lines) {
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey.toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') applies = value === '*';
    if (applies && key === 'disallow' && value) disallowed.push(value);
  }
  return disallowed.some((rule) => rule === '/' || '/service/vereinssuche'.startsWith(rule) || '/service/vereine/'.startsWith(rule));
}

async function assertRobotsPermission() {
  const robots = await fetchText(ROBOTS_URL, { allow404: true });
  if (robotsDisallowsService(robots) && process.env.DRV_SYNC_OVERRIDE_ROBOTS !== '1') {
    throw new Error('rudern.de robots.txt disallows the required /service paths; sync aborted');
  }
}

async function loadPostalStateMap() {
  try {
    const response = await fetchResponse(GEONAMES_URL);
    const buffer = Buffer.from(await response.arrayBuffer());
    const zip = new AdmZip(buffer);
    const entry = zip.getEntry('DE.txt') || zip.getEntries().find((item) => item.entryName.endsWith('/DE.txt'));
    if (!entry) throw new Error('DE.txt missing in GeoNames archive');
    const rows = entry.getData().toString('utf8').split(/\r?\n/);
    const map = new Map();
    for (const row of rows) {
      if (!row) continue;
      const cols = row.split('\t');
      const postalCode = cols[1];
      const place = clean(cols[2]);
      const state = clean(cols[3]);
      if (!/^\d{5}$/.test(postalCode) || !state) continue;
      const current = map.get(postalCode) || { state, places: [] };
      if (place && !current.places.includes(place)) current.places.push(place);
      map.set(postalCode, current);
    }
    return map;
  } catch (error) {
    console.warn(`[sync] GeoNames state mapping unavailable: ${error.message}`);
    return new Map();
  }
}

function extractProfileLinks(html) {
  const $ = cheerio.load(html);
  const urls = new Set();
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    let url;
    try { url = new URL(href, DRV_ORIGIN); } catch { return; }
    if (url.origin === DRV_ORIGIN && /^\/service\/vereine\/[a-z0-9-]+\/?$/i.test(url.pathname)) {
      urls.add(url.toString().replace(/\/$/, ''));
    }
  });
  return [...urls];
}

function extractPostalSection(text) {
  for (const marker of ['Bootshaus', 'Anschriften', 'Anschrift']) {
    const index = text.indexOf(marker);
    if (index < 0) continue;
    const section = text.slice(index, index + 500);
    const zipMatch = section.match(/\b(\d{5})\b/);
    if (!zipMatch) continue;
    const postalCode = zipMatch[1];
    const before = section.slice(0, zipMatch.index).replace(/Route planen.*$/i, '').trim();
    const cityMatch = before.match(/([A-ZÄÖÜ][\p{L}ÄÖÜäöüß.'’()\/-]*(?:\s+[\p{L}ÄÖÜäöüß.'’()\/-]+){0,4})\s*$/u);
    return { postalCode, parsedCity: clean(cityMatch?.[1] || '') };
  }
  return { postalCode: '', parsedCity: '' };
}

function firstPublicEmail($) {
  const anchors = $('a[href^="mailto:"]').toArray();
  for (const element of anchors) {
    const href = $(element).attr('href') || '';
    const raw = href.slice('mailto:'.length).split('?')[0];
    let email = raw;
    try { email = decodeURIComponent(raw); } catch { /* keep raw */ }
    email = clean(email).toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return email;
  }
  return '';
}

function firstExternalWebsite($) {
  for (const element of $('a[href]').toArray()) {
    const href = $(element).attr('href');
    if (!href || !/^https?:/i.test(href)) continue;
    try {
      const url = new URL(href);
      if (url.hostname.endsWith('rudern.de')) continue;
      if (/google\.|openstreetmap|maps\./i.test(url.hostname)) continue;
      return url.toString();
    } catch { /* ignore malformed links */ }
  }
  return '';
}

function parseProfile(url, html, postalStates) {
  const $ = cheerio.load(html);
  const name = clean($('h1').first().text());
  const text = clean($('body').text());
  const drvId = text.match(/DRV-ID\s+(\d{4,6})/i)?.[1] || '';
  const { postalCode, parsedCity } = extractPostalSection(text);
  const postalInfo = postalStates.get(postalCode);
  const state = LRV_BY_DRV_ID.get(drvId) || postalInfo?.state || '';
  const city = parsedCity || postalInfo?.places?.[0] || '';
  const email = firstPublicEmail($);
  const website = firstExternalWebsite($);
  const slug = new URL(url).pathname.split('/').filter(Boolean).pop();
  const featured = slug === 'ratzeburger-ruderclub-ev' || drvId === '12420';
  const type = LRV_BY_DRV_ID.has(drvId) ? 'lrv' : (OTHER_MEMBER_PATTERN.test(name) ? 'member' : 'club');

  return {
    public: {
      id: slug,
      name,
      drvId,
      type,
      city,
      postalCode,
      state,
      website,
      profileUrl: url,
      hasDirectContact: Boolean(email),
      featured
    },
    email
  };
}

async function mapWithConcurrency(items, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        results[index] = { error };
      }
      await sleep(DELAY_MS);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, run));
  return results;
}

await assertRobotsPermission();
const postalStates = await loadPostalStateMap();
const directoryHtml = await fetchText(DIRECTORY_URL);
let profileUrls = extractProfileLinks(directoryHtml);
if (LIMIT > 0) profileUrls = profileUrls.slice(0, LIMIT);
if (!profileUrls.length) throw new Error('No DRV profile links found in Vereinssuche');

console.log(`[sync] ${profileUrls.length} DRV profiles discovered; concurrency=${CONCURRENCY}, delay=${DELAY_MS}ms`);

const rawResults = await mapWithConcurrency(profileUrls, async (url, index) => {
  if ((index + 1) % 50 === 0) console.log(`[sync] ${index + 1}/${profileUrls.length}`);
  const html = await fetchText(url);
  return parseProfile(url, html, postalStates);
});

const failures = rawResults.filter((item) => item?.error);
const parsed = rawResults.filter((item) => item && !item.error && item.public?.name);
const coverage = parsed.length / profileUrls.length;
if (REQUIRE && coverage < 0.9) {
  throw new Error(`DRV sync coverage ${(coverage * 100).toFixed(1)}% is below required 90% (${failures.length} failures)`);
}

const lrvEmails = new Map();
for (const item of parsed) {
  if (item.public.type === 'lrv' && item.public.state && item.email) lrvEmails.set(item.public.state, item.email);
}

const drv = {
  name: 'Deutscher Ruderverband e.V.',
  email: process.env.DRV_FALLBACK_EMAIL || 'info@rudern.de'
};

const recipients = {};
const organizations = parsed.map((item) => {
  let routeLevel = 'drv';
  let resolvedEmail = drv.email;
  if (item.email) {
    routeLevel = item.public.type === 'lrv' ? 'lrv' : 'club';
    resolvedEmail = item.email;
  } else if (item.public.state && lrvEmails.get(item.public.state)) {
    routeLevel = 'lrv';
    resolvedEmail = lrvEmails.get(item.public.state);
  }
  recipients[item.public.id] = {
    organizationName: item.public.name,
    state: item.public.state,
    routeLevel,
    email: resolvedEmail
  };
  return { ...item.public, contactRouteLevel: routeLevel };
});

organizations.push({
  id: 'deutscher-ruderverband',
  name: drv.name,
  drvId: '',
  type: 'drv',
  city: 'Hannover',
  postalCode: '30169',
  state: 'Niedersachsen',
  website: 'https://www.rudern.de/',
  profileUrl: 'https://www.rudern.de/verband/geschaeftsstelle',
  hasDirectContact: true,
  contactRouteLevel: 'drv',
  featured: false
});
recipients['deutscher-ruderverband'] = {
  organizationName: drv.name,
  state: 'Niedersachsen',
  routeLevel: 'drv',
  email: drv.email
};

organizations.sort((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  const rank = { club: 0, member: 1, lrv: 2, drv: 3 };
  if (rank[a.type] !== rank[b.type]) return rank[a.type] - rank[b.type];
  return a.name.localeCompare(b.name, 'de');
});

const root = process.cwd();
await mkdir(path.join(root, 'dist', 'data'), { recursive: true });
await mkdir(path.join(root, 'build-private'), { recursive: true });

await writeFile(path.join(root, 'dist', 'data', 'clubs.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: DIRECTORY_URL,
  sourceLabel: 'Deutscher Ruderverband – Vereinssuche',
  count: organizations.length,
  organizations
}, null, 2));

await writeFile(path.join(root, 'build-private', 'recipients.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: DIRECTORY_URL,
  recipients,
  drv
}, null, 2));

console.log(`[sync] wrote ${organizations.length} public organizations; ${failures.length} profile failures; emails kept server-private`);
