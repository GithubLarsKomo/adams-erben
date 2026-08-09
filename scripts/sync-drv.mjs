import AdmZip from 'adm-zip';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DRV_ORIGIN,
  DRV_REGISTRY_PARSER_VERSION,
  clean,
  discoveryRecordFromRegistry,
  extractProfileLinks,
  parseDrvRegistryProfile,
  publicOrganizationFromRegistry
} from './lib/drv-registry.mjs';

const DIRECTORY_URL = `${DRV_ORIGIN}/service/vereinssuche`;
const ROBOTS_URL = `${DRV_ORIGIN}/robots.txt`;
const GEONAMES_URL = 'https://download.geonames.org/export/zip/DE.zip';
const USER_AGENT = process.env.DRV_SYNC_USER_AGENT || 'adams-erben/0.1 (+https://adams-erben.de; public rowing-club finder)';
const CONCURRENCY = Math.max(1, Math.min(6, Number(process.env.DRV_SYNC_CONCURRENCY || 3)));
const DELAY_MS = Math.max(100, Number(process.env.DRV_SYNC_DELAY_MS || 250));
const LIMIT = Number(process.env.DRV_SYNC_LIMIT || 0);
const REQUIRE = process.env.REQUIRE_DRV_SYNC === '1';
const REQUIRED_COVERAGE = Math.max(0, Math.min(1, Number(process.env.DRV_SYNC_REQUIRED_COVERAGE || 0.95)));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchResponse(url, { allow404 = false, accept = 'text/html,application/xhtml+xml,*/*;q=0.8' } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: accept },
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
    const response = await fetchResponse(GEONAMES_URL, { accept: 'application/zip,*/*' });
    const buffer = Buffer.from(await response.arrayBuffer());
    const zip = new AdmZip(buffer);
    const entry = zip.getEntry('DE.txt') || zip.getEntries().find((item) => item.entryName.endsWith('/DE.txt'));
    if (!entry) throw new Error('DE.txt missing in GeoNames archive');
    const map = new Map();
    for (const row of entry.getData().toString('utf8').split(/\r?\n/)) {
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
        results[index] = { error, sourceUrl: items[index] };
      }
      await sleep(DELAY_MS);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, run));
  return results;
}

function buildRegistryReport(profileUrls, registry, failures, generatedAt) {
  const clubs = registry.filter((item) => item.type === 'club');
  const websitePresent = clubs.filter((item) => item.websiteStatus === 'present').length;
  const websiteMissing = clubs.filter((item) => item.websiteStatus === 'missing').length;
  const emailPresent = clubs.filter((item) => Boolean(item.emailFromDrv)).length;
  const coverage = profileUrls.length ? registry.length / profileUrls.length : 0;
  return {
    generatedAt,
    source: DIRECTORY_URL,
    parserVersion: DRV_REGISTRY_PARSER_VERSION,
    discoveredProfiles: profileUrls.length,
    parsedProfiles: registry.length,
    coveragePct: Number((coverage * 100).toFixed(1)),
    failedProfiles: failures.length,
    clubs: clubs.length,
    lrv: registry.filter((item) => item.type === 'lrv').length,
    otherMembers: registry.filter((item) => item.type === 'member').length,
    clubsWithWebsiteFromDrv: websitePresent,
    clubsMissingWebsiteFromDrv: websiteMissing,
    clubsWithEmailFromDrv: emailPresent,
    failures: failures.map((item) => ({ sourceUrl: item.sourceUrl || '', error: item.error?.message || 'unknown error' }))
  };
}

function registryReportMarkdown(report) {
  return `# DRV Registry – Quality Report\n\nStand: ${report.generatedAt}\n\n- Parser-Version: **${report.parserVersion}**\n- gefundene DRV-Profile: **${report.discoveredProfiles}**\n- erfolgreich geparst: **${report.parsedProfiles} (${report.coveragePct} %)**\n- fehlgeschlagen: **${report.failedProfiles}**\n- Vereine: **${report.clubs}**\n- Landesruderverbände: **${report.lrv}**\n- sonstige Mitglieder: **${report.otherMembers}**\n- Vereine mit DRV-Weblink: **${report.clubsWithWebsiteFromDrv}**\n- Vereine ohne DRV-Weblink: **${report.clubsMissingWebsiteFromDrv}**\n- Vereine mit DRV-E-Mail: **${report.clubsWithEmailFromDrv}**\n\nDer Report enthält bewusst keine E-Mail-Adressen.\n`;
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
  return parseDrvRegistryProfile(url, html, postalStates);
});

const failures = rawResults.filter((item) => item?.error);
const registry = rawResults.filter((item) => item && !item.error && item.name);
const coverage = registry.length / profileUrls.length;
if (REQUIRE && coverage < REQUIRED_COVERAGE) {
  throw new Error(`DRV sync coverage ${(coverage * 100).toFixed(1)}% is below required ${(REQUIRED_COVERAGE * 100).toFixed(1)}% (${failures.length} failures)`);
}

const lrvEmails = new Map();
for (const item of registry) {
  if (item.type === 'lrv' && item.state && item.emailFromDrv) lrvEmails.set(item.state, item.emailFromDrv);
}

const drv = {
  name: 'Deutscher Ruderverband e.V.',
  email: process.env.DRV_FALLBACK_EMAIL || 'info@rudern.de'
};

const recipients = {};
const organizations = registry.map((item) => {
  let routeLevel = 'drv';
  let resolvedEmail = drv.email;
  if (item.emailFromDrv) {
    routeLevel = item.type === 'lrv' ? 'lrv' : 'club';
    resolvedEmail = item.emailFromDrv;
  } else if (item.state && lrvEmails.get(item.state)) {
    routeLevel = 'lrv';
    resolvedEmail = lrvEmails.get(item.state);
  }
  recipients[item.id] = {
    organizationName: item.name,
    organizationId: item.organizationId,
    state: item.state,
    routeLevel,
    email: resolvedEmail,
    sourceUrl: item.sourceUrl,
    verifiedAt: item.fetchedAt
  };
  return publicOrganizationFromRegistry(item, routeLevel);
});

organizations.push({
  id: 'deutscher-ruderverband',
  organizationId: 'drv',
  name: drv.name,
  drvId: '',
  type: 'drv',
  city: 'Hannover',
  postalCode: '30169',
  state: 'Niedersachsen',
  website: 'https://www.rudern.de/',
  profileUrl: 'https://www.rudern.de/verband/geschaeftsstelle',
  websiteStatus: 'present',
  hasDirectContact: true,
  contactRouteLevel: 'drv',
  featured: false
});
recipients['deutscher-ruderverband'] = {
  organizationName: drv.name,
  organizationId: 'drv',
  state: 'Niedersachsen',
  routeLevel: 'drv',
  email: drv.email,
  sourceUrl: 'https://www.rudern.de/verband/geschaeftsstelle',
  verifiedAt: new Date().toISOString()
};

organizations.sort((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  const rank = { club: 0, member: 1, lrv: 2, drv: 3 };
  if (rank[a.type] !== rank[b.type]) return rank[a.type] - rank[b.type];
  return a.name.localeCompare(b.name, 'de');
});

const generatedAt = new Date().toISOString();
const websiteMissing = registry
  .filter((item) => item.type === 'club' && item.websiteStatus === 'missing')
  .map(discoveryRecordFromRegistry);
const report = buildRegistryReport(profileUrls, registry, failures, generatedAt);

const root = process.cwd();
await mkdir(path.join(root, 'dist', 'data'), { recursive: true });
await mkdir(path.join(root, 'build-private'), { recursive: true });
await mkdir(path.join(root, 'artifacts', 'drv-registry'), { recursive: true });

await writeFile(path.join(root, 'dist', 'data', 'clubs.json'), JSON.stringify({
  generatedAt,
  source: DIRECTORY_URL,
  sourceLabel: 'Deutscher Ruderverband – Vereinssuche',
  parserVersion: DRV_REGISTRY_PARSER_VERSION,
  count: organizations.length,
  organizations
}, null, 2));

await writeFile(path.join(root, 'build-private', 'recipients.json'), JSON.stringify({
  generatedAt,
  source: DIRECTORY_URL,
  parserVersion: DRV_REGISTRY_PARSER_VERSION,
  recipients,
  drv
}, null, 2));

await writeFile(path.join(root, 'build-private', 'drv-registry.json'), JSON.stringify({
  generatedAt,
  source: DIRECTORY_URL,
  parserVersion: DRV_REGISTRY_PARSER_VERSION,
  organizations: registry
}, null, 2));

await writeFile(path.join(root, 'build-private', 'website-missing.json'), JSON.stringify({
  generatedAt,
  source: DIRECTORY_URL,
  parserVersion: DRV_REGISTRY_PARSER_VERSION,
  organizations: websiteMissing
}, null, 2));

await writeFile(path.join(root, 'artifacts', 'drv-registry', 'report.json'), JSON.stringify(report, null, 2));
await writeFile(path.join(root, 'artifacts', 'drv-registry', 'report.md'), registryReportMarkdown(report));

console.log(`[sync] registry=${registry.length}/${profileUrls.length} (${report.coveragePct}%); clubs=${report.clubs}; website-missing=${websiteMissing.length}; failures=${failures.length}`);
console.log('[sync] emails remain server-private; public registry report contains no addresses');
