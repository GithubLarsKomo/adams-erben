import * as cheerio from 'cheerio';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { evaluateSnapshotEligibility } from './lib/contact-governance.mjs';

export const PILOT_RUNNER_VERSION = 'pilot-100-run/1.0.0';

const INPUT_FILE = process.env.PILOT_RUN_INPUT || 'build-private/pilot-100-input.json';
const PRIVATE_CONTACTS_FILE = process.env.PILOT_RUN_CONTACTS_FILE || 'build-private/pilot-100-contacts.json';
const PRIVATE_DECISIONS_FILE = process.env.PILOT_RUN_DECISIONS_FILE || 'build-private/pilot-100-decisions.json';
const REPORT_DIR = process.env.PILOT_RUN_REPORT_DIR || 'artifacts/pilot-100-run';
const USER_AGENT = process.env.PILOT_RUN_USER_AGENT || 'adams-erben-pilot-100/1.0 (+https://adams-erben.de)';
const SITE_CONCURRENCY = Math.max(1, Math.min(4, Number(process.env.PILOT_RUN_CONCURRENCY || 3)));
const PAGE_DELAY_MS = Math.max(250, Number(process.env.PILOT_RUN_PAGE_DELAY_MS || 450));
const MAX_PAGES = Math.max(1, Math.min(5, Number(process.env.PILOT_RUN_MAX_PAGES || 5)));
const MAX_ATTEMPTS = Math.max(MAX_PAGES, Math.min(8, Number(process.env.PILOT_RUN_MAX_ATTEMPTS || 8)));
const TIMEOUT_MS = Math.max(4_000, Number(process.env.PILOT_RUN_TIMEOUT_MS || 12_000));
const MAX_REDIRECTS = Math.max(1, Math.min(6, Number(process.env.PILOT_RUN_MAX_REDIRECTS || 5)));
const CROSS_DOMAIN_IDENTITY_THRESHOLD = Math.max(0.2, Math.min(0.9, Number(process.env.PILOT_RUN_IDENTITY_THRESHOLD || 0.45)));

const CONTACT_LINK_PATTERN = /(kontakt|contact|impressum|imprint|vorstand|ansprech|geschäft|geschaeft|verein|über-uns|ueber-uns|team|office|büro|buero)/i;
const STANDARD_CONTACT_PATHS = ['/kontakt', '/kontakt/', '/impressum', '/impressum/', '/vorstand', '/ansprechpartner'];
const SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'linkedin.com', 'youtube.com', 'youtu.be', 'x.com', 'twitter.com', 'tiktok.com'];
const GENERIC_NAME_TOKENS = new Set([
  'ruder', 'rudern', 'ruderclub', 'ruderverein', 'rudergesellschaft', 'ruderklub', 'ruder',
  'club', 'klub', 'verein', 'gesellschaft', 'ev', 'e', 'v', 'von', 'der', 'die', 'das', 'und',
  'zu', 'zur', 'im', 'in', 'am', 'an', 'deutscher', 'deutsche', 'deutschland'
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (value = '') => String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const normalizeHost = (value = '') => String(value).trim().toLowerCase().replace(/^www\./, '').replace(/\.$/, '');

export function relatedHost(a, b) {
  const left = normalizeHost(a);
  const right = normalizeHost(b);
  if (!left || !right) return false;
  return left === right || left.endsWith(`.${right}`) || right.endsWith(`.${left}`);
}

function socialHost(host = '') {
  const normalized = normalizeHost(host);
  return SOCIAL_HOSTS.some((suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`));
}

function normalizeText(value = '') {
  return clean(value)
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss');
}

function clubNameTokens(name = '') {
  return normalizeText(name)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !GENERIC_NAME_TOKENS.has(token));
}

export function scoreWebsiteIdentity(org, html, finalUrl) {
  const $ = cheerio.load(html || '');
  const text = normalizeText($('body').text());
  const tokens = clubNameTokens(org.name);
  const tokenHits = tokens.filter((token) => text.includes(token)).length;
  let score = Math.min(0.55, tokenHits * 0.14);
  if (org.city && text.includes(normalizeText(org.city))) score += 0.2;
  if (org.postalCode && text.includes(String(org.postalCode))) score += 0.15;
  try {
    const host = normalizeHost(new URL(finalUrl).hostname);
    if (tokens.some((token) => host.includes(token))) score += 0.1;
  } catch { /* ignore */ }
  return Math.min(1, Number(score.toFixed(3)));
}

export function parseRobots(robotsText, userAgent = USER_AGENT) {
  const groups = [];
  let current = null;
  for (const raw of String(robotsText || '').split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
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
  const ua = userAgent.toLowerCase();
  return groups
    .filter((group) => group.agents.some((agent) => agent === '*' || ua.includes(agent)))
    .flatMap((group) => group.rules);
}

export function robotsAllowsPath(rules, pathname) {
  let best = null;
  for (const rule of rules || []) {
    if (!rule.path) continue;
    const prefix = rule.path.replace(/\*.*$/, '');
    if (!prefix || !String(pathname || '/').startsWith(prefix)) continue;
    if (!best || prefix.length > best.prefix.length || (prefix.length === best.prefix.length && rule.type === 'allow')) {
      best = { prefix, type: rule.type };
    }
  }
  return !best || best.type !== 'disallow';
}

function rawFetch(url, { redirect = 'manual', accept = 'text/html,application/xhtml+xml,*/*;q=0.8' } = {}) {
  return new Promise(async (resolve, reject) => {
    let lastError;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': USER_AGENT, Accept: accept },
          redirect,
          signal: controller.signal
        });
        clearTimeout(timeout);
        return resolve(response);
      } catch (error) {
        clearTimeout(timeout);
        lastError = error;
        if (attempt < 2) await sleep(350 * attempt);
      }
    }
    reject(lastError || new Error(`fetch failed: ${url}`));
  });
}

const robotsCache = new Map();
async function robotsForOrigin(origin) {
  if (robotsCache.has(origin)) return robotsCache.get(origin);
  let result;
  try {
    const response = await rawFetch(new URL('/robots.txt', origin).toString(), { redirect: 'follow', accept: 'text/plain,*/*;q=0.5' });
    if (response.status === 404) {
      result = { status: 'missing', rules: [], crawlAllowed: true };
    } else if (response.status === 401 || response.status === 403) {
      result = { status: `blocked_${response.status}`, rules: [], crawlAllowed: false };
    } else if (!response.ok) {
      result = { status: `unavailable_${response.status}`, rules: [], crawlAllowed: false };
    } else {
      const rules = parseRobots(await response.text());
      result = { status: 'loaded', rules, crawlAllowed: true };
    }
  } catch (error) {
    result = { status: 'unavailable_network', rules: [], crawlAllowed: false, error: error?.name || 'network_error' };
  }
  robotsCache.set(origin, result);
  return result;
}

async function fetchHtmlRespectingRobots(initialUrl) {
  let current = new URL(initialUrl);
  const redirects = [];
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const robots = await robotsForOrigin(current.origin);
    if (!robots.crawlAllowed) {
      return { ok: false, status: 'robots_unavailable', robotsStatus: robots.status, url: current.toString(), redirects };
    }
    if (!robotsAllowsPath(robots.rules, current.pathname || '/')) {
      return { ok: false, status: 'robots_blocked', robotsStatus: robots.status, url: current.toString(), redirects };
    }

    let response;
    try {
      response = await rawFetch(current.toString(), { redirect: 'manual' });
    } catch (error) {
      return { ok: false, status: 'network_error', errorCode: error?.name || 'fetch_error', robotsStatus: robots.status, url: current.toString(), redirects };
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) return { ok: false, status: 'redirect_without_location', robotsStatus: robots.status, url: current.toString(), redirects };
      const next = new URL(location, current);
      if (!/^https?:$/.test(next.protocol)) return { ok: false, status: 'unsupported_redirect', robotsStatus: robots.status, url: next.toString(), redirects };
      redirects.push({ fromHost: normalizeHost(current.hostname), toHost: normalizeHost(next.hostname) });
      current = next;
      continue;
    }

    if (!response.ok) {
      return { ok: false, status: 'http_error', httpStatus: response.status, robotsStatus: robots.status, url: current.toString(), redirects };
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType && !/html|xhtml|text/i.test(contentType)) {
      return { ok: false, status: 'unsupported_content', contentType: contentType.slice(0, 80), robotsStatus: robots.status, url: current.toString(), redirects };
    }
    return {
      ok: true,
      status: 'ok',
      html: await response.text(),
      finalUrl: current.toString(),
      robotsStatus: robots.status,
      httpStatus: response.status,
      redirects
    };
  }
  return { ok: false, status: 'redirect_limit', url: current.toString(), redirects };
}

function contextAround(text, index, length) {
  return clean(text.slice(Math.max(0, index - 120), Math.min(text.length, index + length + 120))).slice(0, 350);
}

export function extractContactsFromHtml(html, sourceUrl, verifiedAt) {
  const $ = cheerio.load(html || '');
  const found = new Map();
  function add(rawEmail, context = '') {
    let email = clean(rawEmail).replace(/[),.;:]+$/, '').toLowerCase();
    try { email = decodeURIComponent(email); } catch { /* keep raw */ }
    if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) return;
    if (/example\.(com|org|net)$/i.test(email.split('@')[1] || '')) return;
    const item = { email, sourceUrl, verifiedAt, context: clean(context).slice(0, 350), sourceType: 'club-website' };
    const previous = found.get(email);
    if (!previous || item.context.length > previous.context.length) found.set(email, item);
  }

  $('a[href^="mailto:"]').each((_, element) => {
    const href = $(element).attr('href') || '';
    const raw = href.slice('mailto:'.length).split('?')[0];
    const context = clean($(element).closest('li,p,div,tr,section,article').first().text() || $(element).parent().text());
    add(raw, context);
  });

  const bodyText = $('body').text();
  for (const match of bodyText.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
    add(match[0], contextAround(bodyText, match.index || 0, match[0].length));
  }
  const deobfuscated = bodyText
    .replace(/\s*(?:\[at\]|\(at\)|\sat\s)\s*/gi, '@')
    .replace(/\s*(?:\[dot\]|\(dot\)|\sdot\s)\s*/gi, '.');
  for (const match of deobfuscated.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
    add(match[0], contextAround(deobfuscated, match.index || 0, match[0].length));
  }
  return [...found.values()];
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

function contactLinksFromHome(html, finalUrl) {
  const $ = cheerio.load(html || '');
  const base = new URL(finalUrl);
  const candidates = new Map();
  function add(url, score) {
    url.hash = '';
    const key = url.toString();
    if (!candidates.has(key) || candidates.get(key) < score) candidates.set(key, score);
  }
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    try {
      const url = new URL(href, base);
      if (!/^https?:$/.test(url.protocol) || !relatedHost(url.hostname, base.hostname)) return;
      const text = clean($(element).text());
      if (!CONTACT_LINK_PATTERN.test(`${url.pathname} ${url.search} ${text}`)) return;
      add(url, contactLinkScore(url, text) + 20);
    } catch { /* ignore */ }
  });
  for (const pathname of STANDARD_CONTACT_PATHS) {
    add(new URL(pathname, base.origin), contactLinkScore(new URL(pathname, base.origin), '') - 5);
  }
  return [...candidates.entries()].sort((a, b) => b[1] - a[1]).map(([url]) => url);
}

function candidateCounts(evaluated) {
  return {
    contactCandidates: evaluated.length,
    autoApprovedCandidates: evaluated.filter((item) => item.snapshotEligible).length,
    reviewCandidates: evaluated.filter((item) => item.governanceState.startsWith('review')).length,
    functionalCandidates: evaluated.filter((item) => ['functional', 'role-functional'].includes(item.contactKind)).length,
    personalCandidates: evaluated.filter((item) => item.contactKind === 'personal').length,
    thirdPartyCandidates: evaluated.filter((item) => item.contactKind === 'third-party').length
  };
}

function publicOrgResult(org, extra = {}) {
  return {
    organizationId: org.organizationId,
    drvId: org.drvId || '',
    name: org.name,
    state: org.state || '',
    websiteStatus: org.websiteStatus,
    baseRouteLevel: org.routeLevel || 'drv',
    proposedRouteLevel: extra.proposedRouteLevel || org.routeLevel || 'drv',
    status: extra.status || 'unknown',
    websiteReachable: Boolean(extra.websiteReachable),
    finalHost: extra.finalHost || '',
    crossDomainRedirect: Boolean(extra.crossDomainRedirect),
    identityScore: extra.identityScore ?? null,
    identityStatus: extra.identityStatus || '',
    robotsStatus: extra.robotsStatus || '',
    pagesFetched: extra.pagesFetched || 0,
    pagesAttempted: extra.pagesAttempted || 0,
    contactOutcome: extra.contactOutcome || 'fallback',
    ...candidateCounts(extra.evaluated || []),
    errorCode: extra.errorCode || '',
    runtimeMs: extra.runtimeMs || 0
  };
}

async function runOrganization(org) {
  const startedAt = Date.now();
  if (org.websiteStatus === 'missing' || !org.website) {
    return {
      public: publicOrgResult(org, {
        status: 'discovery_pending_provider',
        contactOutcome: 'discovery_pending_provider',
        runtimeMs: Date.now() - startedAt
      }),
      private: { organizationId: org.organizationId, candidates: [], decision: 'discovery_pending_provider' }
    };
  }

  const initial = new URL(org.website);
  const home = await fetchHtmlRespectingRobots(initial.toString());
  if (!home.ok) {
    return {
      public: publicOrgResult(org, {
        status: home.status,
        robotsStatus: home.robotsStatus || '',
        errorCode: home.httpStatus ? `http_${home.httpStatus}` : (home.errorCode || home.status),
        pagesAttempted: home.status === 'robots_blocked' || home.status === 'robots_unavailable' ? 0 : 1,
        runtimeMs: Date.now() - startedAt
      }),
      private: { organizationId: org.organizationId, candidates: [], decision: home.status }
    };
  }

  const final = new URL(home.finalUrl);
  const initialHost = normalizeHost(initial.hostname);
  const finalHost = normalizeHost(final.hostname);
  const crossDomainRedirect = !relatedHost(initialHost, finalHost);
  const identityScore = scoreWebsiteIdentity(org, home.html, home.finalUrl);
  const identityStatus = socialHost(finalHost)
    ? 'blocked-social-redirect'
    : crossDomainRedirect && identityScore < CROSS_DOMAIN_IDENTITY_THRESHOLD
      ? 'review-cross-domain-identity'
      : crossDomainRedirect
        ? 'accepted-cross-domain-identity'
        : 'drv-domain-consistent';

  if (identityStatus === 'blocked-social-redirect' || identityStatus === 'review-cross-domain-identity') {
    return {
      public: publicOrgResult(org, {
        status: 'identity_review', websiteReachable: true, finalHost, crossDomainRedirect,
        identityScore, identityStatus, robotsStatus: home.robotsStatus, pagesFetched: 1, pagesAttempted: 1,
        contactOutcome: 'review', runtimeMs: Date.now() - startedAt
      }),
      private: { organizationId: org.organizationId, candidates: [], decision: 'identity_review', finalUrl: home.finalUrl }
    };
  }

  const verifiedAt = new Date().toISOString();
  const pages = [{ url: home.finalUrl, html: home.html }];
  const candidates = contactLinksFromHome(home.html, home.finalUrl);
  const seen = new Set([home.finalUrl]);
  let attempts = 1;
  for (const candidateUrl of candidates) {
    if (pages.length >= MAX_PAGES || attempts >= MAX_ATTEMPTS) break;
    if (seen.has(candidateUrl)) continue;
    seen.add(candidateUrl);
    attempts += 1;
    await sleep(PAGE_DELAY_MS);
    const page = await fetchHtmlRespectingRobots(candidateUrl);
    if (page.ok) {
      const pageHost = normalizeHost(new URL(page.finalUrl).hostname);
      if (relatedHost(pageHost, finalHost)) pages.push({ url: page.finalUrl, html: page.html });
    }
  }

  const rawContacts = [];
  for (const page of pages) rawContacts.push(...extractContactsFromHtml(page.html, page.url, verifiedAt));
  const byEmail = new Map();
  for (const contact of rawContacts) {
    const previous = byEmail.get(contact.email);
    if (!previous || contact.context.length > previous.context.length) byEmail.set(contact.email, contact);
  }
  const evaluated = [...byEmail.values()].map((contact) => evaluateSnapshotEligibility(contact, home.finalUrl, { verifiedAt, now: new Date() }));
  evaluated.sort((a, b) => Number(b.snapshotEligible) - Number(a.snapshotEligible) || (b.rank || 0) - (a.rank || 0));
  const direct = evaluated.find((item) => item.snapshotEligible) || null;
  const review = evaluated.some((item) => item.governanceState.startsWith('review'));
  const contactOutcome = direct ? 'auto_direct' : review ? 'review' : 'fallback';
  const proposedRouteLevel = direct ? 'club' : (org.routeLevel || 'drv');

  return {
    public: publicOrgResult(org, {
      status: 'processed', websiteReachable: true, finalHost, crossDomainRedirect, identityScore, identityStatus,
      robotsStatus: home.robotsStatus, pagesFetched: pages.length, pagesAttempted: attempts,
      contactOutcome, proposedRouteLevel, evaluated, runtimeMs: Date.now() - startedAt
    }),
    private: {
      organizationId: org.organizationId,
      baseRouteLevel: org.routeLevel || 'drv',
      proposedRouteLevel,
      finalUrl: home.finalUrl,
      identityScore,
      identityStatus,
      pages: pages.map((page) => page.url),
      decision: contactOutcome,
      candidates: evaluated
    }
  };
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        const org = items[index];
        results[index] = {
          public: publicOrgResult(org, { status: 'unexpected_error', errorCode: error?.name || 'unexpected_error' }),
          private: { organizationId: org.organizationId, candidates: [], decision: 'unexpected_error', error: error?.message || 'unknown' }
        };
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

function countBy(rows, keyFn) {
  const counts = {};
  for (const row of rows) {
    const key = String(keyFn(row) || '<missing>');
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, 'de')));
}

export function summarizePilotRun(rows, startedAt, endedAt) {
  const known = rows.filter((row) => row.websiteStatus === 'present');
  const pending = rows.filter((row) => row.status === 'discovery_pending_provider');
  return {
    runnerVersion: PILOT_RUNNER_VERSION,
    total: rows.length,
    knownWebsite: known.length,
    discoveryPending: pending.length,
    processed: rows.filter((row) => row.status === 'processed').length,
    reachable: rows.filter((row) => row.websiteReachable).length,
    robotsBlocked: rows.filter((row) => row.status === 'robots_blocked').length,
    robotsUnavailable: rows.filter((row) => row.status === 'robots_unavailable').length,
    identityReview: rows.filter((row) => row.status === 'identity_review').length,
    networkOrHttpErrors: rows.filter((row) => ['network_error', 'http_error', 'unsupported_content', 'redirect_limit', 'redirect_without_location', 'unsupported_redirect'].includes(row.status)).length,
    contactOutcomes: countBy(rows, (row) => row.contactOutcome),
    routeBefore: countBy(rows, (row) => row.baseRouteLevel),
    routeAfter: countBy(rows, (row) => row.proposedRouteLevel),
    directUpgrades: rows.filter((row) => row.baseRouteLevel !== 'club' && row.proposedRouteLevel === 'club').length,
    pagesFetched: rows.reduce((sum, row) => sum + row.pagesFetched, 0),
    pagesAttempted: rows.reduce((sum, row) => sum + row.pagesAttempted, 0),
    maxPagesFetched: Math.max(0, ...rows.map((row) => row.pagesFetched)),
    maxPagesAttempted: Math.max(0, ...rows.map((row) => row.pagesAttempted)),
    statusCounts: countBy(rows, (row) => row.status),
    errorCounts: countBy(rows.filter((row) => row.errorCode), (row) => row.errorCode),
    startedAt,
    endedAt,
    runtimeMs: Math.max(0, new Date(endedAt).getTime() - new Date(startedAt).getTime())
  };
}

function reportMarkdown(report) {
  const status = Object.entries(report.statusCounts).map(([key, value]) => `- ${key}: **${value}**`).join('\n');
  const contacts = Object.entries(report.contactOutcomes).map(([key, value]) => `- ${key}: **${value}**`).join('\n');
  return `# 100er-Pilot – realer bounded Run\n\n- Runner: **${report.runnerVersion}**\n- Organisationen: **${report.total}**\n- bekannte Websites: **${report.knownWebsite}**\n- Discovery pending: **${report.discoveryPending}**\n- Website erreichbar: **${report.reachable}**\n- verarbeitet: **${report.processed}**\n- Robots blocked: **${report.robotsBlocked}**\n- Robots unavailable: **${report.robotsUnavailable}**\n- Identity Review: **${report.identityReview}**\n- Netzwerk/HTTP/Content-Fehler: **${report.networkOrHttpErrors}**\n- Seiten erfolgreich: **${report.pagesFetched}**\n- Seitenversuche: **${report.pagesAttempted}**\n- max. erfolgreich je Organisation: **${report.maxPagesFetched}**\n- max. Versuche je Organisation: **${report.maxPagesAttempted}**\n- neue Direct-Upgrades durch Website-Kontakt: **${report.directUpgrades}**\n- Laufzeit: **${Math.round(report.runtimeMs / 1000)} s**\n\n## Kontakt-Ergebnis\n\n${contacts}\n\n## Status\n\n${status}\n\n## Routing vorher\n\n${Object.entries(report.routeBefore).map(([key, value]) => `- ${key}: **${value}**`).join('\n')}\n\n## Routing nach Pilot-Enrichment\n\n${Object.entries(report.routeAfter).map(([key, value]) => `- ${key}: **${value}**`).join('\n')}\n\nÖffentliche Pilot-Artefakte enthalten keine E-Mail-Adressen. Die 23 Fälle ohne bestätigte Website werden ohne realen Search Provider ausdrücklich nicht geraten oder gecrawlt.\n`;
}

async function main() {
  const input = JSON.parse(await readFile(INPUT_FILE, 'utf8'));
  const organizations = input.organizations || [];
  if (organizations.length !== 100) throw new Error(`pilot run expects exactly 100 organizations, got ${organizations.length}`);
  const startedAt = new Date().toISOString();
  const results = await mapWithConcurrency(organizations, SITE_CONCURRENCY, async (org, index) => {
    if ((index + 1) % 10 === 0) console.log(`[pilot-run] ${index + 1}/${organizations.length}`);
    return runOrganization(org);
  });
  const endedAt = new Date().toISOString();
  const publicRows = results.map((item) => item.public);
  const privateRows = results.map((item) => item.private);
  const report = summarizePilotRun(publicRows, startedAt, endedAt);

  await mkdir(path.dirname(PRIVATE_CONTACTS_FILE), { recursive: true });
  await mkdir(path.dirname(PRIVATE_DECISIONS_FILE), { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });

  const contacts = privateRows.flatMap((row) => (row.candidates || []).map((candidate) => ({ organizationId: row.organizationId, ...candidate })));
  await writeFile(PRIVATE_CONTACTS_FILE, JSON.stringify({ generatedAt: endedAt, runnerVersion: PILOT_RUNNER_VERSION, contacts }, null, 2));
  await writeFile(PRIVATE_DECISIONS_FILE, JSON.stringify({ generatedAt: endedAt, runnerVersion: PILOT_RUNNER_VERSION, organizations: privateRows }, null, 2));
  await writeFile(path.join(REPORT_DIR, 'organizations.json'), JSON.stringify({ generatedAt: endedAt, runnerVersion: PILOT_RUNNER_VERSION, organizations: publicRows }, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.md'), reportMarkdown(report));

  console.log(`[pilot-run] known=${report.knownWebsite}; pending=${report.discoveryPending}; reachable=${report.reachable}; auto=${report.contactOutcomes.auto_direct || 0}; review=${report.contactOutcomes.review || 0}; upgrades=${report.directUpgrades}; runtime=${Math.round(report.runtimeMs / 1000)}s`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
