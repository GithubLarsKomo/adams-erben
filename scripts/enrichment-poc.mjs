import AdmZip from 'adm-zip';
import * as cheerio from 'cheerio';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DRV_ORIGIN,
  clean,
  extractProfileLinks,
  parseDrvRegistryProfile
} from './lib/drv-registry.mjs';

const DIRECTORY_URL = `${DRV_ORIGIN}/service/vereinssuche`;
const GEONAMES_URL = 'https://download.geonames.org/export/zip/DE.zip';
const USER_AGENT = process.env.ENRICH_USER_AGENT || 'adams-erben-enrichment-poc/0.3 (+https://github.com/GithubLarsKomo/adams-erben)';

const TARGET = Math.max(5, Number(process.env.ENRICH_TARGET || 25));
const MIN_STATES = Math.max(1, Number(process.env.ENRICH_MIN_STATES || 5));
const MAX_PER_STATE = Math.max(1, Number(process.env.ENRICH_MAX_PER_STATE || 5));
const MAX_PROFILE_SCANS = Math.max(TARGET, Number(process.env.ENRICH_MAX_PROFILE_SCANS || 160));
const PROFILE_CONCURRENCY = Math.max(1, Math.min(4, Number(process.env.ENRICH_PROFILE_CONCURRENCY || 3)));
const PROFILE_DELAY_MS = Math.max(150, Number(process.env.ENRICH_PROFILE_DELAY_MS || 350));
const SITE_CONCURRENCY = Math.max(1, Math.min(3, Number(process.env.ENRICH_SITE_CONCURRENCY || 2)));
const SITE_DELAY_MS = Math.max(500, Number(process.env.ENRICH_SITE_DELAY_MS || 900));
const MAX_SITE_PAGES = Math.max(1, Math.min(8, Number(process.env.ENRICH_MAX_SITE_PAGES || 5)));
const MAX_SITE_ATTEMPTS = Math.max(MAX_SITE_PAGES, Math.min(12, Number(process.env.ENRICH_MAX_SITE_ATTEMPTS || 8)));
const TIMEOUT_MS = Math.max(5_000, Number(process.env.ENRICH_TIMEOUT_MS || 18_000));

const CONTACT_LINK_PATTERN = /(kontakt|contact|impressum|imprint|vorstand|ansprech|geschäft|geschaeft|verein|über-uns|ueber-uns|team|office|büro|buero)/i;
const STANDARD_CONTACT_PATHS = [
  '/kontakt', '/kontakt/', '/kontakt.html',
  '/impressum', '/impressum/', '/impressum.html',
  '/ansprechpartner', '/vorstand', '/verein/vorstand'
];
const FUNCTIONAL_LOCAL_PARTS = [
  'info', 'kontakt', 'contact', 'mail', 'office', 'buero', 'büro', 'geschaeftsstelle',
  'geschäftsstelle', 'verwaltung', 'sekretariat', 'vorstand', 'presse', 'sport', 'rudern',
  'verein', 'post', 'anfrage', 'service', 'webmaster', 'jugend', 'trainer', 'vorsitz',
  'vorsitzender', 'vorsitzende', 'ruderwart', 'sportwart', 'jugendwart', 'schriftwart', 'kasse'
];
const ROLE_PATTERN = /(1\.?\s*vorsitzende?r?|2\.?\s*vorsitzende?r?|vorsitzende?r?|vorstand|geschäftsführ\w*|geschaeftsfuehr\w*|geschäftsstelle|geschaeftsstelle|ruderwart\w*|jugendwart\w*|trainer\w*|presse\w*|schriftwart\w*|sportwart\w*|verwaltung|sekretariat|büro|buero)/i;
const GENERIC_NAME_TOKENS = new Set([
  'ruder', 'rudern', 'ruderclub', 'ruderverein', 'rudergesellschaft', 'ruderklub', 'ruder-club',
  'ruder-verein', 'ruder-klub', 'gesellschaft', 'club', 'klub', 'verein', 'ev', 'e', 'v', 'von',
  'der', 'die', 'das', 'und', 'zu', 'zur', 'im', 'in', 'am', 'an', 'deutschland', 'deutscher'
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nowIso = () => new Date().toISOString();

function stableHash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizedHost(value = '') {
  return String(value).toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
}

function sameSiteHost(a, b) {
  const left = normalizedHost(a);
  const right = normalizedHost(b);
  return left === right || left.endsWith(`.${right}`) || right.endsWith(`.${left}`);
}

async function fetchResponse(url, { accept = 'text/html,application/xhtml+xml,*/*;q=0.8', allow404 = false } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
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
      if (attempt < 3) await sleep(450 * attempt);
    }
  }
  throw new Error(`Fetch failed for ${url}: ${lastError?.message || 'unknown error'}`);
}

async function fetchText(url, options) {
  const response = await fetchResponse(url, options);
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 404) return { text: '', response };
  if (contentType && !/text|html|xml|json/i.test(contentType)) {
    throw new Error(`Unsupported content-type ${contentType} for ${url}`);
  }
  return { text: await response.text(), response };
}

async function loadPostalStateMap() {
  try {
    const response = await fetchResponse(GEONAMES_URL, { accept: 'application/zip,*/*' });
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
  } catch (error) {
    console.warn(`[poc] GeoNames unavailable: ${error.message}`);
    return new Map();
  }
}

function tokeniseClubName(name) {
  return clean(name)
    .toLocaleLowerCase('de-DE')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !GENERIC_NAME_TOKENS.has(token));
}

function identityScore(org, html, finalUrl) {
  const text = clean(cheerio.load(html)('body').text()).toLocaleLowerCase('de-DE');
  const tokens = tokeniseClubName(org.name);
  const tokenHits = tokens.filter((token) => text.includes(token)).length;
  let score = Math.min(0.55, tokenHits * 0.14);
  if (org.city && text.includes(org.city.toLocaleLowerCase('de-DE'))) score += 0.2;
  if (org.postalCode && text.includes(org.postalCode)) score += 0.15;
  try {
    const host = normalizedHost(new URL(finalUrl).hostname);
    if (tokens.some((token) => host.includes(token))) score += 0.15;
  } catch { /* ignore */ }
  return Math.min(1, score);
}

function parseRobots(robotsText, userAgentToken = '*') {
  const groups = [];
  let current = null;
  for (const rawLine of robotsText.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const index = line.indexOf(':');
    if (index < 0) continue;
    const key = line.slice(0, index).trim().toLowerCase();
    const value = line.slice(index + 1).trim();
    if (key === 'user-agent') {
      if (!current || current.rules.length) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (current && (key === 'allow' || key === 'disallow')) {
      current.rules.push({ type: key, path: value });
    }
  }
  const ua = userAgentToken.toLowerCase();
  return groups
    .filter((group) => group.agents.some((agent) => agent === '*' || ua.includes(agent)))
    .flatMap((group) => group.rules);
}

function robotsAllowsPath(rules, pathname) {
  let best = null;
  for (const rule of rules) {
    if (!rule.path) continue;
    const prefix = rule.path.replace(/\*.*$/, '');
    if (!prefix || !pathname.startsWith(prefix)) continue;
    if (!best || prefix.length > best.prefix.length || (prefix.length === best.prefix.length && rule.type === 'allow')) {
      best = { prefix, type: rule.type };
    }
  }
  return !best || best.type !== 'disallow';
}

const robotsCache = new Map();
async function getRobots(origin) {
  if (robotsCache.has(origin)) return robotsCache.get(origin);
  try {
    const { text } = await fetchText(new URL('/robots.txt', origin).toString(), { allow404: true });
    const value = { rules: parseRobots(text || '', 'adams-erben-enrichment-poc'), status: text ? 'loaded' : 'missing' };
    robotsCache.set(origin, value);
  } catch (error) {
    robotsCache.set(origin, { rules: [], status: 'unavailable', error: error.message });
  }
  return robotsCache.get(origin);
}

function emailContext(text, index, length) {
  const from = Math.max(0, index - 100);
  const to = Math.min(text.length, index + length + 100);
  return clean(text.slice(from, to));
}

function extractEmailsFromPage($, sourceUrl) {
  const found = new Map();
  function add(rawEmail, context = '') {
    let email = clean(rawEmail).replace(/[),.;:]+$/, '').toLowerCase();
    try { email = decodeURIComponent(email); } catch { /* ignore */ }
    if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) return;
    if (/example\.(com|org|net)$/i.test(email.split('@')[1])) return;
    const record = { email, sourceUrl, context: clean(context).slice(0, 300) };
    const previous = found.get(email);
    if (!previous || record.context.length > previous.context.length) found.set(email, record);
  }

  $('a[href^="mailto:"]').each((_, element) => {
    const href = $(element).attr('href') || '';
    const raw = href.slice('mailto:'.length).split('?')[0];
    const context = clean($(element).closest('li,p,div,tr,section,article').first().text() || $(element).parent().text());
    add(raw, context);
  });

  const bodyText = $('body').text();
  for (const match of bodyText.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
    add(match[0], emailContext(bodyText, match.index || 0, match[0].length));
  }

  const deobfuscated = bodyText
    .replace(/\s*(?:\[at\]|\(at\)|\sat\s)\s*/gi, '@')
    .replace(/\s*(?:\[dot\]|\(dot\)|\sdot\s)\s*/gi, '.');
  for (const match of deobfuscated.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
    add(match[0], emailContext(deobfuscated, match.index || 0, match[0].length));
  }
  return [...found.values()];
}

function classifyEmail(record, siteHost) {
  const [local, domain = ''] = record.email.split('@');
  const localNorm = local.toLocaleLowerCase('de-DE');
  const functional = FUNCTIONAL_LOCAL_PARTS.some((prefix) => localNorm === prefix || localNorm.startsWith(`${prefix}.`) || localNorm.startsWith(`${prefix}-`) || localNorm.startsWith(`${prefix}_`));
  const sameDomain = sameSiteHost(domain, siteHost);
  const role = record.context.match(ROLE_PATTERN)?.[0] || '';
  return { ...record, kind: functional ? 'functional' : 'personal', sameDomain, role: clean(role) };
}

function contactLinkScore(url, text) {
  const target = `${url.pathname} ${url.search} ${text}`.toLocaleLowerCase('de-DE');
  let score = 0;
  if (/kontakt|contact/.test(target)) score += 100;
  if (/impressum|imprint/.test(target)) score += 90;
  if (/vorstand|ansprech|team/.test(target)) score += 75;
  if (/geschäft|geschaeft|office|büro|buero/.test(target)) score += 65;
  if (/verein|über-uns|ueber-uns/.test(target)) score += 45;
  return score;
}

function candidateContactLinks($, baseUrl) {
  const base = new URL(baseUrl);
  const candidates = new Map();
  function add(url, score) {
    url.hash = '';
    const key = url.toString();
    if (!candidates.has(key) || candidates.get(key).score < score) candidates.set(key, { url: key, score });
  }

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    try {
      const url = new URL(href, base);
      if (!/^https?:$/.test(url.protocol) || !sameSiteHost(url.hostname, base.hostname)) return;
      const text = clean($(element).text());
      if (!CONTACT_LINK_PATTERN.test(`${url.pathname} ${url.search} ${text}`)) return;
      add(url, contactLinkScore(url, text) + 20);
    } catch { /* ignore */ }
  });

  for (const pathname of STANDARD_CONTACT_PATHS) {
    const url = new URL(pathname, base.origin);
    add(url, contactLinkScore(url, '') - 5);
  }

  return [...candidates.values()].sort((a, b) => b.score - a.score).map((item) => item.url);
}

async function enrichOrganization(org) {
  const startedAt = Date.now();
  const initialUrl = org.websiteFromDrv;
  if (!initialUrl) return { ...org, status: 'website_missing', websiteReachable: false, pagesFetched: 0, pagesAttempted: 0, contactKind: 'none', emailCount: 0, durationMs: Date.now() - startedAt };

  let homepage;
  let homepageResponse;
  try {
    const initial = new URL(initialUrl);
    const robots = await getRobots(initial.origin);
    if (!robotsAllowsPath(robots.rules, initial.pathname || '/')) {
      return { ...org, status: 'robots_blocked', robotsStatus: robots.status, websiteReachable: false, pagesFetched: 0, pagesAttempted: 0, contactKind: 'none', emailCount: 0, durationMs: Date.now() - startedAt };
    }
    ({ text: homepage, response: homepageResponse } = await fetchText(initialUrl));
  } catch (error) {
    return { ...org, status: 'homepage_fetch_error', error: error.message, websiteReachable: false, pagesFetched: 0, pagesAttempted: 1, contactKind: 'none', emailCount: 0, durationMs: Date.now() - startedAt };
  }

  const finalHomeUrl = homepageResponse.url;
  const homeRobots = await getRobots(new URL(finalHomeUrl).origin);
  const score = identityScore(org, homepage, finalHomeUrl);
  const pages = [{ url: finalHomeUrl, html: homepage }];
  const seen = new Set([finalHomeUrl]);
  let attempts = 0;

  for (const url of candidateContactLinks(cheerio.load(homepage), finalHomeUrl)) {
    if (pages.length >= MAX_SITE_PAGES || attempts >= MAX_SITE_ATTEMPTS) break;
    if (seen.has(url)) continue;
    seen.add(url);
    attempts += 1;
    const parsed = new URL(url);
    const robots = parsed.origin === new URL(finalHomeUrl).origin ? homeRobots : await getRobots(parsed.origin);
    if (!robotsAllowsPath(robots.rules, parsed.pathname || '/')) continue;
    try {
      await sleep(SITE_DELAY_MS);
      const { text, response } = await fetchText(url);
      if (!sameSiteHost(new URL(response.url).hostname, new URL(finalHomeUrl).hostname)) continue;
      pages.push({ url: response.url, html: text });
    } catch { /* bounded page-level misses are coverage data */ }
  }

  const emailMap = new Map();
  for (const page of pages) {
    for (const record of extractEmailsFromPage(cheerio.load(page.html), page.url)) {
      const previous = emailMap.get(record.email);
      if (!previous || record.context.length > previous.context.length) emailMap.set(record.email, record);
    }
  }

  const siteHost = new URL(finalHomeUrl).hostname;
  const classified = [...emailMap.values()].map((record) => classifyEmail(record, siteHost));
  classified.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'functional' ? -1 : 1;
    if (a.sameDomain !== b.sameDomain) return a.sameDomain ? -1 : 1;
    if (Boolean(a.role) !== Boolean(b.role)) return a.role ? -1 : 1;
    return a.email.localeCompare(b.email);
  });

  const preferred = classified[0] || null;
  const drvEmail = clean(org.emailFromDrv).toLowerCase();
  return {
    ...org,
    website: org.websiteFromDrv,
    status: preferred ? (preferred.kind === 'functional' ? 'functional_contact_found' : 'personal_contact_only') : 'no_email_found',
    websiteReachable: true,
    finalWebsite: finalHomeUrl,
    websiteDomain: normalizedHost(siteHost),
    identityScore: Number(score.toFixed(2)),
    robotsStatus: homeRobots.status,
    pagesFetched: pages.length,
    pagesAttempted: attempts,
    contactKind: preferred?.kind || 'none',
    emailCount: classified.length,
    functionalEmailCount: classified.filter((item) => item.kind === 'functional').length,
    personalEmailCount: classified.filter((item) => item.kind === 'personal').length,
    preferredSameDomain: preferred?.sameDomain || false,
    preferredRoleDetected: preferred?.role || '',
    drvEmailSeenOnClubSite: Boolean(drvEmail && classified.some((item) => item.email === drvEmail)),
    preferredSourceUrl: preferred?.sourceUrl || '',
    durationMs: Date.now() - startedAt,
    _private: { emails: classified }
  };
}

async function mapWithConcurrency(items, concurrency, delayMs, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      try { results[index] = await worker(items[index], index); }
      catch (error) { results[index] = { error }; }
      if (delayMs) await sleep(delayMs);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

async function selectSample(profileUrls, postalStates) {
  const ratzeburg = profileUrls.find((url) => /\/ratzeburger-ruderclub-ev$/.test(url));
  const rest = profileUrls.filter((url) => url !== ratzeburg).sort((a, b) => stableHash(a).localeCompare(stableHash(b)));
  const ordered = ratzeburg ? [ratzeburg, ...rest] : rest;
  const selected = [];
  const counts = new Map();
  let scanned = 0;

  for (let start = 0; start < ordered.length && scanned < MAX_PROFILE_SCANS && selected.length < TARGET; start += PROFILE_CONCURRENCY) {
    const batch = ordered.slice(start, Math.min(start + PROFILE_CONCURRENCY, MAX_PROFILE_SCANS));
    const parsedBatch = await mapWithConcurrency(batch, PROFILE_CONCURRENCY, PROFILE_DELAY_MS, async (url) => {
      const { text } = await fetchText(url);
      return parseDrvRegistryProfile(url, text, postalStates);
    });
    scanned += batch.length;
    for (const parsed of parsedBatch) {
      if (!parsed || parsed.error || parsed.type !== 'club' || !parsed.websiteFromDrv || !parsed.state) continue;
      const stateCount = counts.get(parsed.state) || 0;
      if (stateCount >= MAX_PER_STATE) continue;
      selected.push(parsed);
      counts.set(parsed.state, stateCount + 1);
      if (selected.length >= TARGET) break;
    }
  }

  const uniqueStates = new Set(selected.map((item) => item.state));
  if (selected.length < TARGET || uniqueStates.size < MIN_STATES) {
    throw new Error(`Could only select ${selected.length}/${TARGET} clubs across ${uniqueStates.size}/${MIN_STATES} states after ${scanned} DRV profiles`);
  }
  return { selected, scanned };
}

function publicResult(item) {
  const { _private, emailFromDrv, ...rest } = item;
  return rest;
}

function buildSummary(results, scannedProfiles) {
  const successful = results.filter((item) => !item.error);
  const reachable = successful.filter((item) => item.websiteReachable);
  const functional = successful.filter((item) => item.contactKind === 'functional');
  const personalOnly = successful.filter((item) => item.contactKind === 'personal');
  const none = successful.filter((item) => item.contactKind === 'none');
  const strongIdentity = successful.filter((item) => Number(item.identityScore || 0) >= 0.5);
  const states = new Map();
  for (const item of successful) states.set(item.state, (states.get(item.state) || 0) + 1);
  const total = successful.length || 1;
  return {
    generatedAt: nowIso(),
    target: TARGET,
    sampleSize: successful.length,
    scannedDrvProfiles: scannedProfiles,
    stateCount: states.size,
    states: Object.fromEntries([...states.entries()].sort((a, b) => a[0].localeCompare(b[0], 'de'))),
    websiteReachable: reachable.length,
    websiteReachablePct: Number((reachable.length / total * 100).toFixed(1)),
    functionalContact: functional.length,
    functionalContactPct: Number((functional.length / total * 100).toFixed(1)),
    personalOnly: personalOnly.length,
    personalOnlyPct: Number((personalOnly.length / total * 100).toFixed(1)),
    noContact: none.length,
    noContactPct: Number((none.length / total * 100).toFixed(1)),
    robotsBlocked: successful.filter((item) => item.status === 'robots_blocked').length,
    homepageFetchErrors: successful.filter((item) => item.status === 'homepage_fetch_error').length,
    strongIdentityMatch: strongIdentity.length,
    strongIdentityMatchPct: Number((strongIdentity.length / total * 100).toFixed(1)),
    averagePagesFetched: Number((reachable.length ? reachable.reduce((sum, item) => sum + item.pagesFetched, 0) / reachable.length : 0).toFixed(2)),
    averagePagesAttempted: Number((reachable.length ? reachable.reduce((sum, item) => sum + (item.pagesAttempted || 0), 0) / reachable.length : 0).toFixed(2)),
    averageDurationMs: Math.round(successful.reduce((sum, item) => sum + (item.durationMs || 0), 0) / total)
  };
}

function markdownReport(summary, results) {
  const rows = results.map((item) => `| ${item.name.replace(/\|/g, '\\|')} | ${item.state} | ${item.websiteReachable ? 'ja' : 'nein'} | ${item.identityScore == null ? '–' : item.identityScore.toFixed(2)} | ${item.contactKind} | ${item.emailCount || 0} | ${item.pagesFetched || 0}/${item.pagesAttempted || 0} | ${item.status} |`).join('\n');
  return `# Enrichment PoC – Coverage Report\n\nStand: ${summary.generatedAt}\n\n## Kennzahlen\n\n- Stichprobe: **${summary.sampleSize} Vereine** in **${summary.stateCount} Bundesländern**\n- Dafür geprüfte DRV-Profile: **${summary.scannedDrvProfiles}**\n- Vereinswebsite erreichbar: **${summary.websiteReachable}/${summary.sampleSize} (${summary.websiteReachablePct} %)**\n- Funktionsadresse gefunden: **${summary.functionalContact}/${summary.sampleSize} (${summary.functionalContactPct} %)**\n- Nur personenbezogene Adresse gefunden: **${summary.personalOnly}/${summary.sampleSize} (${summary.personalOnlyPct} %)**\n- Keine verwendbare E-Mail / Websiteproblem: **${summary.noContact}/${summary.sampleSize} (${summary.noContactPct} %)**\n- robots.txt blockiert: **${summary.robotsBlocked}**\n- Homepage-Fetchfehler: **${summary.homepageFetchErrors}**\n- Starker automatischer Identitätsabgleich (Score >= 0,50): **${summary.strongIdentityMatch}/${summary.sampleSize} (${summary.strongIdentityMatchPct} %)**\n- Ø erfolgreiche Seiten je erreichbarer Vereinswebsite: **${summary.averagePagesFetched}**\n- Ø zusätzliche Seitenversuche je erreichbarer Vereinswebsite: **${summary.averagePagesAttempted}**\n\n## Einzelergebnisse\n\n| Verein | Bundesland | Website | Identität | Kontaktklasse | Treffer | Seiten/Versuche | Status |\n| --- | --- | --- | ---: | --- | ---: | ---: | --- |\n${rows}\n\nDer öffentliche Report enthält bewusst keine E-Mail-Adressen.\n`;
}

console.log(`[poc] target=${TARGET}, minStates=${MIN_STATES}, maxPerState=${MAX_PER_STATE}`);
const postalStates = await loadPostalStateMap();
const { text: directoryHtml } = await fetchText(DIRECTORY_URL);
const profileUrls = extractProfileLinks(directoryHtml);
if (!profileUrls.length) throw new Error('No DRV profile links discovered');

const { selected, scanned } = await selectSample(profileUrls, postalStates);
console.log(`[poc] selected ${selected.length} clubs across ${new Set(selected.map((item) => item.state)).size} states after scanning ${scanned} DRV profiles`);

const enriched = await mapWithConcurrency(selected, SITE_CONCURRENCY, SITE_DELAY_MS, async (org, index) => {
  console.log(`[poc] enrich ${index + 1}/${selected.length}: ${org.name} -> ${org.websiteFromDrv}`);
  return enrichOrganization(org);
});

const results = enriched.map((item, index) => item?.error
  ? { ...selected[index], status: 'unexpected_error', error: item.error.message, websiteReachable: false, pagesFetched: 0, pagesAttempted: 0, contactKind: 'none', emailCount: 0, durationMs: 0 }
  : item);

const summary = buildSummary(results, scanned);
const publicResults = results.map(publicResult);
const privateContacts = results.map((item) => ({
  organizationId: item.id,
  drvId: item.drvId,
  name: item.name,
  website: item.finalWebsite || item.websiteFromDrv,
  status: item.status,
  contacts: item._private?.emails || []
}));

const root = process.cwd();
const reportDir = path.join(root, 'artifacts', 'enrichment-poc');
const privateDir = path.join(root, 'build-private');
await mkdir(reportDir, { recursive: true });
await mkdir(privateDir, { recursive: true });
await writeFile(path.join(reportDir, 'report.json'), JSON.stringify({ summary, results: publicResults }, null, 2));
await writeFile(path.join(reportDir, 'report.md'), markdownReport(summary, publicResults));
await writeFile(path.join(privateDir, 'enrichment-poc-contacts.json'), JSON.stringify({ generatedAt: summary.generatedAt, contacts: privateContacts }, null, 2));

console.log(`[poc] complete: functional=${summary.functionalContact}, personalOnly=${summary.personalOnly}, none=${summary.noContact}, reachable=${summary.websiteReachable}, strongIdentity=${summary.strongIdentityMatch}`);
