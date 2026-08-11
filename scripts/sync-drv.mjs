import AdmZip from 'adm-zip';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DRV_ORIGIN,
  DRV_REGISTRY_PARSER_VERSION,
  LRV_PROFILES,
  clean,
  discoveryRecordFromRegistry,
  extractProfileLinks,
  isApprovedRegistryDirectContact,
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
      const latitude = Number(cols[9]);
      const longitude = Number(cols[10]);
      if (!/^\d{5}$/.test(postalCode) || !state) continue;
      const current = map.get(postalCode) || { state, places: [], latitude: null, longitude: null };
      if (place && !current.places.includes(place)) current.places.push(place);
      if (!Number.isFinite(current.latitude) && Number.isFinite(latitude)) current.latitude = latitude;
      if (!Number.isFinite(current.longitude) && Number.isFinite(longitude)) current.longitude = longitude;
      map.set(postalCode, current);
    }
    return map;
  } catch (error) {
    console.warn(`[sync] GeoNames state mapping unavailable: ${error.message}`);
    return new Map();
  }
}

function publicPostalLocations(postalStates) {
  return [...postalStates.entries()]
    .filter(([, info]) => Number.isFinite(info.latitude) && Number.isFinite(info.longitude))
    .map(([postalCode, info]) => ({
      postalCode,
      places: info.places,
      state: info.state,
      latitude: info.latitude,
      longitude: info.longitude
    }))
    .sort((a, b) => a.postalCode.localeCompare(b.postalCode));
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

function buildRegistryReport({ directoryProfileCount, profileUrls, registry, failures, generatedAt }) {
  const clubs = registry.filter((item) => item.type === 'club');
  const lrvs = registry.filter((item) => item.type === 'lrv');
  const websitePresent = clubs.filter((item) => item.websiteStatus === 'present').length;
  const websiteMissing = clubs.filter((item) => item.websiteStatus === 'missing').length;
  const emailPresent = clubs.filter((item) => Boolean(item.emailFromDrv)).length;
  const emailApproved = clubs.filter(isApprovedRegistryDirectContact).length;
  const coverage = profileUrls.length ? registry.length / profileUrls.length : 0;
  const lrvIds = new Set(lrvs.map((item) => item.drvId));
  const missingLrvIds = LRV_PROFILES.filter((item) => !lrvIds.has(item.drvId)).map((item) => item.drvId);
  return {
    generatedAt,
    source: DIRECTORY_URL,
    parserVersion: DRV_REGISTRY_PARSER_VERSION,
    directoryProfiles: directoryProfileCount,
    supplementalLrvProfiles: profileUrls.length - directoryProfileCount,
    discoveredProfiles: profileUrls.length,
    parsedProfiles: registry.length,
    coveragePct: Number((coverage * 100).toFixed(1)),
    failedProfiles: failures.length,
    clubs: clubs.length,
    lrv: lrvs.length,
    expectedLrv: LRV_PROFILES.length,
    lrvCoveragePct: Number((lrvs.length / LRV_PROFILES.length * 100).toFixed(1)),
    missingLrvIds,
    otherMembers: registry.filter((item) => item.type === 'member').length,
    clubsWithWebsiteFromDrv: websitePresent,
    clubsMissingWebsiteFromDrv: websiteMissing,
    clubsWithEmailFromDrv: emailPresent,
    clubsWithAutoApprovedDrvEmail: emailApproved,
    failures: failures.map((item) => ({ sourceUrl: item.sourceUrl || '', error: item.error?.message || 'unknown error' }))
  };
}

function registryReportMarkdown(report) {
  return `# DRV Registry – Quality Report\n\nStand: ${report.generatedAt}\n\n- Parser-Version: **${report.parserVersion}**\n- Profile aus Vereinssuche: **${report.directoryProfiles}**\n- zusätzliche offizielle LRV-Profile: **${report.supplementalLrvProfiles}**\n- Registry-Profile gesamt: **${report.discoveredProfiles}**\n- erfolgreich geparst: **${report.parsedProfiles} (${report.coveragePct} %)**\n- fehlgeschlagen: **${report.failedProfiles}**\n- Vereine: **${report.clubs}**\n- Landesruderverbände: **${report.lrv}/${report.expectedLrv} (${report.lrvCoveragePct} %)**\n- sonstige Mitglieder: **${report.otherMembers}**\n- Vereine mit DRV-Weblink: **${report.clubsWithWebsiteFromDrv}**\n- Vereine ohne DRV-Weblink: **${report.clubsMissingWebsiteFromDrv}**\n- Vereine mit irgendeiner DRV-E-Mail: **${report.clubsWithEmailFromDrv}**\n- davon konservativ Auto-Direct-fähig: **${report.clubsWithAutoApprovedDrvEmail}**\n\nDer Report enthält bewusst keine E-Mail-Adressen. Eine im DRV-Profil gefundene Adresse ist nur ein Kandidat und wird nicht automatisch Direct Route. Vereine ohne freigegebene direkte E-Mail erhalten kein Verbands-Fallback.\n`;
}

await assertRobotsPermission();
const postalStates = await loadPostalStateMap();
const directoryHtml = await fetchText(DIRECTORY_URL);
const directoryProfileUrls = extractProfileLinks(directoryHtml);
let profileUrls = [...new Set([...directoryProfileUrls, ...LRV_PROFILES.map((item) => item.url)])];
if (LIMIT > 0) profileUrls = profileUrls.slice(0, LIMIT);
if (!profileUrls.length) throw new Error('No DRV profile links found');

console.log(`[sync] ${directoryProfileUrls.length} directory profiles + ${profileUrls.length - directoryProfileUrls.length} supplemental LRV profiles; concurrency=${CONCURRENCY}, delay=${DELAY_MS}ms`);

const rawResults = await mapWithConcurrency(profileUrls, async (url, index) => {
  if ((index + 1) % 50 === 0) console.log(`[sync] ${index + 1}/${profileUrls.length}`);
  const html = await fetchText(url);
  const parsed = parseDrvRegistryProfile(url, html, postalStates);
  const geo = postalStates.get(parsed.postalCode);
  return {
    ...parsed,
    latitude: Number.isFinite(geo?.latitude) ? geo.latitude : null,
    longitude: Number.isFinite(geo?.longitude) ? geo.longitude : null
  };
});

const failures = rawResults.filter((item) => item?.error);
const registry = rawResults.filter((item) => item && !item.error && item.name);
const coverage = registry.length / profileUrls.length;
const lrvIds = new Set(registry.filter((item) => item.type === 'lrv').map((item) => item.drvId));
const missingLrvProfiles = LRV_PROFILES.filter((item) => !lrvIds.has(item.drvId));
if (REQUIRE && coverage < REQUIRED_COVERAGE) {
  throw new Error(`DRV sync coverage ${(coverage * 100).toFixed(1)}% is below required ${(REQUIRED_COVERAGE * 100).toFixed(1)}% (${failures.length} failures)`);
}
if (REQUIRE && missingLrvProfiles.length) {
  throw new Error(`LRV registry incomplete: missing DRV IDs ${missingLrvProfiles.map((item) => item.drvId).join(', ')}`);
}

const drv = {
  name: 'Deutscher Ruderverband e.V.',
  email: process.env.DRV_FALLBACK_EMAIL || 'info@rudern.de',
  sourceUrl: 'https://www.rudern.de/verband/geschaeftsstelle'
};

const recipients = {};
const organizations = registry.map((item) => {
  const approvedDirect = isApprovedRegistryDirectContact(item);
  const routeLevel = approvedDirect ? (item.type === 'lrv' ? 'lrv' : 'club') : 'none';

  if (approvedDirect) {
    recipients[item.id] = {
      organizationName: item.name,
      organizationId: item.organizationId,
      state: item.state,
      states: item.states,
      routeLevel,
      email: item.emailFromDrv,
      routeOrganizationId: item.organizationId,
      routeOrganizationName: item.name,
      sourceUrl: item.sourceUrl,
      verifiedAt: item.fetchedAt,
      drvEmailCandidatePresent: true,
      drvEmailCandidateApproved: true
    };
  }

  return {
    ...publicOrganizationFromRegistry(item, routeLevel, approvedDirect),
    latitude: item.latitude,
    longitude: item.longitude
  };
});

const drvGeo = postalStates.get('30169');
organizations.push({
  id: 'deutscher-ruderverband',
  organizationId: 'drv',
  name: drv.name,
  drvId: '',
  type: 'drv',
  city: 'Hannover',
  postalCode: '30169',
  state: 'Niedersachsen',
  states: ['Niedersachsen'],
  website: 'https://www.rudern.de/',
  profileUrl: drv.sourceUrl,
  websiteStatus: 'present',
  hasDirectContact: true,
  contactRouteLevel: 'drv',
  latitude: Number.isFinite(drvGeo?.latitude) ? drvGeo.latitude : null,
  longitude: Number.isFinite(drvGeo?.longitude) ? drvGeo.longitude : null,
  featured: false
});
recipients['deutscher-ruderverband'] = {
  organizationName: drv.name,
  organizationId: 'drv',
  state: 'Niedersachsen',
  states: ['Niedersachsen'],
  routeLevel: 'drv',
  email: drv.email,
  routeOrganizationId: 'drv',
  routeOrganizationName: drv.name,
  sourceUrl: drv.sourceUrl,
  verifiedAt: new Date().toISOString(),
  drvEmailCandidatePresent: true,
  drvEmailCandidateApproved: true
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
const report = buildRegistryReport({ directoryProfileCount: directoryProfileUrls.length, profileUrls, registry, failures, generatedAt });
const postalLocations = publicPostalLocations(postalStates);

const root = process.cwd();
await mkdir(path.join(root, 'dist', 'data'), { recursive: true });
await mkdir(path.join(root, 'build-private'), { recursive: true });
await mkdir(path.join(root, 'artifacts', 'drv-registry'), { recursive: true });

await writeFile(path.join(root, 'dist', 'data', 'clubs.json'), JSON.stringify({
  generatedAt,
  source: DIRECTORY_URL,
  sourceLabel: 'Deutscher Ruderverband – Vereinssuche + Länderrat/LRV-Profile',
  parserVersion: DRV_REGISTRY_PARSER_VERSION,
  count: organizations.length,
  organizations
}, null, 2));

await writeFile(path.join(root, 'dist', 'data', 'postal-locations.json'), JSON.stringify({
  generatedAt,
  source: 'GeoNames DE postal codes (build-time snapshot)',
  count: postalLocations.length,
  locations: postalLocations
}, null, 2));

await writeFile(path.join(root, 'build-private', 'recipients.json'), JSON.stringify({
  generatedAt,
  source: DIRECTORY_URL,
  parserVersion: DRV_REGISTRY_PARSER_VERSION,
  routingMode: 'direct-only',
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

console.log(`[sync] registry=${registry.length}/${profileUrls.length} (${report.coveragePct}%); clubs=${report.clubs}; lrv=${report.lrv}/${report.expectedLrv}; website-missing=${websiteMissing.length}; direct-club=${report.clubsWithAutoApprovedDrvEmail}; postal-locations=${postalLocations.length}; failures=${failures.length}`);
console.log('[sync] emails remain server-private; clubs without approved direct email receive no association fallback');
