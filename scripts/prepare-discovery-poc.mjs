import AdmZip from 'adm-zip';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  DRV_ORIGIN,
  clean,
  discoveryRecordFromRegistry,
  extractProfileLinks,
  parseDrvRegistryProfile
} from './lib/drv-registry.mjs';

const DIRECTORY_URL = `${DRV_ORIGIN}/service/vereinssuche`;
const GEONAMES_URL = 'https://download.geonames.org/export/zip/DE.zip';
const TARGET = Math.max(5, Number(process.env.DISCOVERY_SAMPLE_TARGET || 25));
const MIN_STATES = Math.max(1, Number(process.env.DISCOVERY_SAMPLE_MIN_STATES || 5));
const MAX_PER_STATE = Math.max(1, Number(process.env.DISCOVERY_SAMPLE_MAX_PER_STATE || 5));
const MAX_SCANS = Math.max(TARGET, Number(process.env.DISCOVERY_SAMPLE_MAX_SCANS || 250));
const DELAY_MS = Math.max(250, Number(process.env.DISCOVERY_SAMPLE_DELAY_MS || 400));
const OUTPUT = process.env.DISCOVERY_INPUT || 'build-private/website-discovery-input.json';
const REGISTRY_QUEUE = process.env.DISCOVERY_REGISTRY_QUEUE || 'build-private/website-missing.json';
const USER_AGENT = process.env.ENRICH_USER_AGENT || 'adams-erben-discovery-prep/0.1 (+https://github.com/GithubLarsKomo/adams-erben)';

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

async function loadRegistryQueue() {
  try {
    const parsed = JSON.parse(await readFile(REGISTRY_QUEUE, 'utf8'));
    if (!Array.isArray(parsed.organizations)) return [];
    return parsed.organizations;
  } catch (error) {
    if (error?.code !== 'ENOENT') console.warn(`[prepare-discovery] registry queue unavailable: ${error.message}`);
    return [];
  }
}

async function scanDrvFallback() {
  console.warn(`[prepare-discovery] ${REGISTRY_QUEUE} not found; falling back to a bounded DRV profile scan`);
  const postalStates = await loadPostalStates();
  const directory = await (await fetchResponse(DIRECTORY_URL)).text();
  const links = extractProfileLinks(directory).slice(0, MAX_SCANS);
  const parsed = [];
  for (let i = 0; i < links.length; i += 1) {
    try {
      const html = await (await fetchResponse(links[i])).text();
      const record = parseDrvRegistryProfile(links[i], html, postalStates);
      if (record.type === 'club' && record.websiteStatus === 'missing') parsed.push(discoveryRecordFromRegistry(record));
    } catch (error) {
      console.warn(`[prepare-discovery] ${links[i]}: ${error.message}`);
    }
    await sleep(DELAY_MS);
  }
  return parsed;
}

async function main() {
  let candidates = await loadRegistryQueue();
  let source = REGISTRY_QUEUE;
  if (!candidates.length) {
    candidates = await scanDrvFallback();
    source = DIRECTORY_URL;
  }

  const selected = chooseMissingWebsiteSample(candidates);
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify({
    generatedAt: new Date().toISOString(),
    source,
    organizations: selected
  }, null, 2));
  console.log(`[prepare-discovery] selected ${selected.length} clubs across ${new Set(selected.map((item) => item.state)).size} states from ${source} -> ${OUTPUT}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
