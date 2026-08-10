import * as cheerio from 'cheerio';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const INPUT = process.env.ENRICH_DIAGNOSTICS_INPUT || 'artifacts/enrichment-poc/report.json';
const OUTPUT_DIR = process.env.ENRICH_DIAGNOSTICS_OUTPUT || 'artifacts/enrichment-poc';
const USER_AGENT = process.env.ENRICH_USER_AGENT || 'adams-erben-enrichment-diagnostics/0.1 (+https://github.com/GithubLarsKomo/adams-erben)';
const TIMEOUT_MS = Math.max(5_000, Number(process.env.ENRICH_DIAGNOSTICS_TIMEOUT_MS || 15_000));
const DELAY_MS = Math.max(250, Number(process.env.ENRICH_DIAGNOSTICS_DELAY_MS || 600));
const MAX_ATTEMPTS = Math.max(5, Math.min(24, Number(process.env.ENRICH_DIAGNOSTICS_MAX_ATTEMPTS || 16)));

const CONTACT_PATTERN = /(kontakt|contact|impressum|imprint|vorstand|ansprech|team|geschäft|geschaeft|büro|buero|verein|über-uns|ueber-uns|about|rudern|ruderabteilung|abteilung)/i;
const STANDARD_PATHS = [
  '/kontakt', '/kontakt/', '/kontakt.html', '/contact', '/contact/',
  '/impressum', '/impressum/', '/impressum.html', '/imprint',
  '/vorstand', '/vorstand/', '/ansprechpartner', '/ansprechpartner/',
  '/verein', '/verein/', '/verein/kontakt', '/verein/ansprechpartner',
  '/ueber-uns', '/wir-ueber-uns', '/abteilung/rudern', '/rudern/kontakt'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeHost = (value = '') => String(value).toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
const sameSiteHost = (a, b) => {
  const left = normalizeHost(a);
  const right = normalizeHost(b);
  return left === right || left.endsWith(`.${right}`) || right.endsWith(`.${left}`);
};

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
      signal: controller.signal,
      redirect: 'follow'
    });
  } finally {
    clearTimeout(timeout);
  }
}

function parseRobots(text, token = 'adams-erben-enrichment-diagnostics') {
  const groups = [];
  let current = null;
  for (const raw of String(text || '').split(/\r?\n/)) {
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
  const ua = token.toLowerCase();
  return groups
    .filter((group) => group.agents.some((agent) => agent === '*' || ua.includes(agent)))
    .flatMap((group) => group.rules);
}

function robotsAllows(rules, pathname) {
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

async function loadRobots(origin) {
  try {
    const response = await fetchWithTimeout(new URL('/robots.txt', origin).toString());
    if (response.status === 404) return { status: 'missing', rules: [] };
    if (!response.ok) return { status: `http_${response.status}`, rules: [] };
    return { status: 'loaded', rules: parseRobots(await response.text()) };
  } catch (error) {
    return { status: 'unavailable', rules: [], error: error.message };
  }
}

function emailSignals(html) {
  const text = cheerio.load(html)('body').text();
  return {
    mailto: (html.match(/mailto:/gi) || []).length,
    literal: (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).length,
    obfuscated: /(?:\[at\]|\(at\)|\sat\s|\[dot\]|\(dot\)|\sdot\s)/i.test(text)
  };
}

function discoveredLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const links = new Map();
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    try {
      const url = new URL(href, base);
      if (!/^https?:$/.test(url.protocol) || !sameSiteHost(url.hostname, base.hostname)) return;
      const label = `${url.pathname} ${url.search} ${$(element).text()}`;
      if (!CONTACT_PATTERN.test(label)) return;
      url.hash = '';
      links.set(url.toString(), { url: url.toString(), source: 'homepage-link' });
    } catch { /* ignore malformed link */ }
  });
  return [...links.values()];
}

function buildCandidates(homeHtml, homeUrl) {
  const base = new URL(homeUrl);
  const map = new Map();
  for (const item of discoveredLinks(homeHtml, homeUrl)) map.set(item.url, item);
  for (const pathname of STANDARD_PATHS) {
    const url = new URL(pathname, base.origin).toString();
    if (!map.has(url)) map.set(url, { url, source: 'standard-path' });
  }
  return [...map.values()].slice(0, MAX_ATTEMPTS);
}

async function diagnoseOrganization(item) {
  const initialUrl = item.finalWebsite || item.website || item.websiteFromDrv;
  const result = {
    organizationId: item.organizationId,
    name: item.name,
    website: initialUrl,
    priorStatus: item.status,
    priorPagesFetched: item.pagesFetched || 0,
    robotsStatus: '',
    homepageContactLinks: 0,
    attempts: [],
    successfulHtmlPages: 0,
    emailSignalPages: 0
  };
  if (!initialUrl) return result;

  let homeResponse;
  let homeHtml = '';
  try {
    const origin = new URL(initialUrl).origin;
    const robots = await loadRobots(origin);
    result.robotsStatus = robots.status;
    const initial = new URL(initialUrl);
    if (!robotsAllows(robots.rules, initial.pathname || '/')) {
      result.homepageBlockedByRobots = true;
      return result;
    }
    homeResponse = await fetchWithTimeout(initialUrl);
    if (!homeResponse.ok) {
      result.homepageStatus = homeResponse.status;
      return result;
    }
    homeHtml = await homeResponse.text();
    result.homepageStatus = homeResponse.status;
    result.homepageFinalPath = new URL(homeResponse.url).pathname;
  } catch (error) {
    result.homepageError = error.message;
    return result;
  }

  const finalHome = homeResponse.url;
  const finalOrigin = new URL(finalHome).origin;
  const robots = await loadRobots(finalOrigin);
  const candidates = buildCandidates(homeHtml, finalHome);
  result.homepageContactLinks = candidates.filter((item) => item.source === 'homepage-link').length;

  for (const candidate of candidates) {
    const url = new URL(candidate.url);
    const attempt = {
      source: candidate.source,
      path: `${url.pathname}${url.search}`,
      robotsAllowed: robotsAllows(robots.rules, url.pathname || '/')
    };
    if (!attempt.robotsAllowed) {
      attempt.outcome = 'robots_blocked';
      result.attempts.push(attempt);
      continue;
    }
    try {
      await sleep(DELAY_MS);
      const response = await fetchWithTimeout(candidate.url);
      attempt.status = response.status;
      attempt.finalPath = new URL(response.url).pathname;
      attempt.sameSite = sameSiteHost(new URL(response.url).hostname, new URL(finalHome).hostname);
      attempt.contentType = (response.headers.get('content-type') || '').split(';')[0];
      if (response.ok && attempt.sameSite && /text|html|xml/i.test(attempt.contentType)) {
        const html = await response.text();
        const signals = emailSignals(html);
        attempt.outcome = 'html';
        attempt.emailSignal = signals.mailto > 0 || signals.literal > 0 || signals.obfuscated;
        attempt.mailtoCount = signals.mailto;
        attempt.literalEmailCount = signals.literal;
        attempt.obfuscatedSignal = signals.obfuscated;
        result.successfulHtmlPages += 1;
        if (attempt.emailSignal) result.emailSignalPages += 1;
      } else {
        attempt.outcome = response.ok ? 'non_html_or_cross_site' : `http_${response.status}`;
      }
    } catch (error) {
      attempt.outcome = 'fetch_error';
      attempt.error = error.name === 'AbortError' ? 'timeout' : error.message;
    }
    result.attempts.push(attempt);
  }
  return result;
}

function markdown(results) {
  const lines = [
    '# Enrichment PoC – Fallback-Diagnostik',
    '',
    `Stand: ${new Date().toISOString()}`,
    '',
    'Nur Vereine mit erreichbarer Website und vorherigem `no_email_found` werden erneut diagnostiziert. Der Report enthält keine E-Mail-Adressen.',
    '',
    '| Verein | vorher Seiten | Home-Links | erfolgreiche Diagnose-Seiten | Seiten mit E-Mail-Signal | HTTP/Fetch-Probleme |',
    '| --- | ---: | ---: | ---: | ---: | ---: |'
  ];
  for (const item of results) {
    const problems = item.attempts.filter((attempt) => attempt.outcome !== 'html').length;
    lines.push(`| ${String(item.name).replace(/\|/g, '\\|')} | ${item.priorPagesFetched} | ${item.homepageContactLinks} | ${item.successfulHtmlPages} | ${item.emailSignalPages} | ${problems} |`);
  }
  lines.push('', '## Details');
  for (const item of results) {
    lines.push('', `### ${item.name}`, '', `- Website: ${item.website}`, `- robots.txt: ${item.robotsStatus || '–'}`, `- kontaktnahe Links auf Homepage: ${item.homepageContactLinks}`, `- Seiten mit E-Mail-Signal: ${item.emailSignalPages}`, '', '| Quelle | Pfad | Ergebnis | E-Mail-Signal |', '| --- | --- | --- | --- |');
    for (const attempt of item.attempts) {
      const result = attempt.outcome === 'html' ? `HTTP ${attempt.status}` : attempt.outcome;
      lines.push(`| ${attempt.source} | \`${attempt.path.replace(/\|/g, '%7C')}\` | ${result} | ${attempt.emailSignal ? 'ja' : 'nein'} |`);
    }
  }
  return `${lines.join('\n')}\n`;
}

async function main() {
  const report = JSON.parse(await readFile(INPUT, 'utf8'));
  const candidates = (report.results || []).filter((item) => item.status === 'no_email_found' && item.websiteReachable);
  const results = [];
  for (const item of candidates) results.push(await diagnoseOrganization(item));

  const summary = {
    generatedAt: new Date().toISOString(),
    organizations: results.length,
    withHomepageContactLinks: results.filter((item) => item.homepageContactLinks > 0).length,
    withSuccessfulDiagnosticPages: results.filter((item) => item.successfulHtmlPages > 0).length,
    withEmailSignalPages: results.filter((item) => item.emailSignalPages > 0).length,
    attemptedPages: results.reduce((sum, item) => sum + item.attempts.length, 0),
    successfulHtmlPages: results.reduce((sum, item) => sum + item.successfulHtmlPages, 0),
    emailSignalPages: results.reduce((sum, item) => sum + item.emailSignalPages, 0)
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(path.join(OUTPUT_DIR, 'fallback-diagnostics.json'), JSON.stringify({ summary, results }, null, 2));
  await writeFile(path.join(OUTPUT_DIR, 'fallback-diagnostics.md'), markdown(results));
  console.log('[fallback-diagnostics]', summary);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
