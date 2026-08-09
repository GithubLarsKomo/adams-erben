import AdmZip from 'adm-zip';
import * as cheerio from 'cheerio';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DRV_ORIGIN = 'https://www.rudern.de';
const DIRECTORY_URL = `${DRV_ORIGIN}/service/vereinssuche`;
const GEONAMES_URL = 'https://download.geonames.org/export/zip/DE.zip';
const TARGET = Math.max(5, Number(process.env.DISCOVERY_SAMPLE_TARGET || 25));
const MIN_STATES = Math.max(1, Number(process.env.DISCOVERY_SAMPLE_MIN_STATES || 5));
const MAX_PER_STATE = Math.max(1, Number(process.env.DISCOVERY_SAMPLE_MAX_PER_STATE || 5));
const MAX_SCANS = Math.max(TARGET, Number(process.env.DISCOVERY_SAMPLE_MAX_SCANS || 250));
const DELAY_MS = Math.max(250, Number(process.env.DISCOVERY_SAMPLE_DELAY_MS || 400));
const OUTPUT = process.env.DISCOVERY_INPUT || 'build-private/website-discovery-input.json';
const USER_AGENT = process.env.ENRICH_USER_AGENT || 'adams-erben-discovery-prep/0.1 (+https://github.com/GithubLarsKomo/adams-erben)';

const OTHER_MEMBER_PATTERN = /(Bundesstützpunkt|Olympiastützpunkt|Gymnasium|Schule|Schülerruder|Hochschule|Universität|Institut|Regattaverband|Ruderjugend)/i;
const LRV_IDS = new Set(['30010','30011','30012','30013','30014','30015','30016','30017','30018','30019','30020','30021','30022','30023','30024','30025']);

const clean = (value = '') => String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchResponse(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: '*/*' }, redirect: 'follow' });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response;
}

async function loadPostalStates() {
  const response = await fetchResponse(GEONAMES_URL);
  const zip = new AdmZip(Buffer.from(await response.arrayBuffer()));
  const entry = zip.getEntry('DE.txt') || zip.getEntries().find((item) => item.entryName.endsWith('/DE.txt'));
  const map = new Map();
  for (const row of entry.getData().toString('utf8').split(/\r?\n/)) {
    if (!row) continue;
    const cols = row.split('\t');
    if (/^\d{5}$/.test(cols[1]) && cols[3]) map.set(cols[1], clean(cols[3]));
  }
  return map;
}

function extractProfileLinks(html) {
  const $ = cheerio.load(html);
  const links = new Set();
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    try {
      const url = new URL(href, DRV_ORIGIN);
      if (url.origin === DRV_ORIGIN && /^\/service\/vereine\/[a-z0-9-]+\/?$/i.test(url.pathname)) links.add(url.toString().replace(/\/$/, ''));
    } catch { /* ignore */ }
  });
  return [...links];
}

function externalWebsite($) {
  for (const element of $('a[href]').toArray()) {
    const href = $(element).attr('href');
    if (!href) continue;
    let candidate = href;
    if (/^www\./i.test(candidate)) candidate = `https://${candidate}`;
    if (!/^https?:/i.test(candidate)) continue;
    try {
      const url = new URL(candidate);
      if (url.hostname.endsWith('rudern.de')) continue;
      if (/google\.|openstreetmap|maps\.|facebook\.|instagram\.|youtube\.|youtu\.be/i.test(url.hostname)) continue;
      return url.toString();
    } catch { /* ignore */ }
  }
  return '';
}

function parseProfile(url, html, postalStates) {
  const $ = cheerio.load(html);
  const name = clean($('h1').first().text());
  const text = clean($('body').text());
  const drvId = text.match(/DRV-ID\s+(\d{4,6})/i)?.[1] || '';
  const zip = text.match(/\b(\d{5})\b/)?.[1] || '';
  const state = postalStates.get(zip) || '';
  const cityMatch = text.match(new RegExp(`${zip}\\s+([A-ZÄÖÜ][\\p{L}ÄÖÜäöüß.'’()\\/-]*(?:\\s+[\\p{L}ÄÖÜäöüß.'’()\\/-]+){0,4})`, 'u'));
  const city = clean(cityMatch?.[1] || '');
  const type = LRV_IDS.has(drvId) ? 'lrv' : (OTHER_MEMBER_PATTERN.test(name) ? 'member' : 'club');
  return {
    organizationId: drvId || new URL(url).pathname.split('/').filter(Boolean).pop(),
    drvId,
    name,
    type,
    postalCode: zip,
    city,
    state,
    drvProfileUrl: url,
    websiteFromDrv: externalWebsite($)
  };
}

export function chooseMissingWebsiteSample(items, { target = TARGET, minStates = MIN_STATES, maxPerState = MAX_PER_STATE } = {}) {
  const candidates = items
    .filter((item) => item.type === 'club' && !item.websiteFromDrv && item.state)
    .sort((a, b) => `${a.state}|${a.organizationId}`.localeCompare(`${b.state}|${b.organizationId}`, 'de'));
  const selected = [];
  const counts = new Map();

  while (selected.length < target) {
    let added = false;
    for (const item of candidates) {
      if (selected.includes(item)) continue;
      const count = counts.get(item.state) || 0;
      if (count >= maxPerState) continue;
      selected.push(item);
      counts.set(item.state, count + 1);
      added = true;
      if (selected.length >= target) break;
    }
    if (!added) break;
  }

  const states = new Set(selected.map((item) => item.state));
  if (selected.length < target || states.size < minStates) {
    throw new Error(`Could only select ${selected.length}/${target} missing-website clubs across ${states.size}/${minStates} states`);
  }
  return selected;
}

async function main() {
  const postalStates = await loadPostalStates();
  const directory = await (await fetchResponse(DIRECTORY_URL)).text();
  const links = extractProfileLinks(directory).slice(0, MAX_SCANS);
  const parsed = [];
  for (let i = 0; i < links.length; i += 1) {
    try {
      const html = await (await fetchResponse(links[i])).text();
      parsed.push(parseProfile(links[i], html, postalStates));
    } catch (error) {
      console.warn(`[prepare-discovery] ${links[i]}: ${error.message}`);
    }
    await sleep(DELAY_MS);
  }
  const selected = chooseMissingWebsiteSample(parsed);
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify({ generatedAt: new Date().toISOString(), source: DIRECTORY_URL, organizations: selected }, null, 2));
  console.log(`[prepare-discovery] selected ${selected.length} clubs across ${new Set(selected.map((item) => item.state)).size} states -> ${OUTPUT}`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) await main();
