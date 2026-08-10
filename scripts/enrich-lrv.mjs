import * as cheerio from 'cheerio';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { classifyContactCandidate } from './lib/contact-governance.mjs';

const REGISTRY_FILE = process.env.LRV_REGISTRY_FILE || 'build-private/drv-registry.json';
const OUTPUT_FILE = process.env.LRV_CONTACT_CANDIDATES_FILE || 'build-private/contact-candidates.json';
const REPORT_DIR = process.env.LRV_REPORT_DIR || 'artifacts/lrv-enrichment';
const USER_AGENT = process.env.LRV_ENRICH_USER_AGENT || 'adams-erben-lrv-enrichment/0.1 (+https://adams-erben.de)';
const TIMEOUT_MS = Math.max(5_000, Number(process.env.LRV_ENRICH_TIMEOUT_MS || 15_000));
const DELAY_MS = Math.max(300, Number(process.env.LRV_ENRICH_DELAY_MS || 700));
const MAX_PAGES = Math.max(1, Math.min(8, Number(process.env.LRV_ENRICH_MAX_PAGES || 5)));

const LRV_WEBSITE_OVERRIDES = new Map([
  ['30010', 'https://www.lrvbw.de/'],
  ['30018', 'https://www.lrvn.de/']
]);

const CONTACT_LINK_PATTERN = /(kontakt|contact|impressum|imprint|geschäft|geschaeft|geschäftsstelle|geschaeftsstelle|vorstand|präsidium|praesidium|ansprech|verband|über-uns|ueber-uns|office)/i;
const STANDARD_PATHS = ['/kontakt', '/kontakt/', '/impressum', '/impressum/', '/geschaeftsstelle', '/geschäftsstelle', '/verband/kontakt'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (value = '') => String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const normalizeHost = (value = '') => String(value).toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
const sameSiteHost = (a, b) => {
  const left = normalizeHost(a);
  const right = normalizeHost(b);
  return left === right || left.endsWith(`.${right}`) || right.endsWith(`.${left}`);
};

async function fetchResponse(url) {
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

function parseRobots(text, token = 'adams-erben-lrv-enrichment') {
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
  return groups.filter((group) => group.agents.some((agent) => agent === '*' || ua.includes(agent))).flatMap((group) => group.rules);
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
    const response = await fetchResponse(new URL('/robots.txt', origin).toString());
    if (response.status === 404) return { status: 'missing', rules: [] };
    if (!response.ok) return { status: `http_${response.status}`, rules: [] };
    return { status: 'loaded', rules: parseRobots(await response.text()) };
  } catch (error) {
    return { status: 'unavailable', rules: [], error: error.message };
  }
}

function decodeObfuscated(text) {
  return String(text)
    .replace(/\s*(?:\[at\]|\(at\)|\sat\s)\s*/gi, '@')
    .replace(/\s*(?:\[dot\]|\(dot\)|\sdot\s)\s*/gi, '.');
}

function extractEmails(html, sourceUrl) {
  const $ = cheerio.load(html);
  const candidates = new Map();
  const add = (email, context, sourceKind) => {
    const normalized = clean(email).toLowerCase().replace(/^mailto:/, '').split('?')[0];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return;
    if (!candidates.has(normalized)) candidates.set(normalized, {
      email: normalized,
      context: clean(context).slice(0, 500),
      sourceKind,
      sourceUrl
    });
  };

  $('a[href^="mailto:"]').each((_, element) => {
    const href = $(element).attr('href') || '';
    let raw = href.slice('mailto:'.length).split('?')[0];
    try { raw = decodeURIComponent(raw); } catch { /* keep raw */ }
    const context = clean($(element).closest('p,li,div,section,tr,dl').text() || $(element).parent().text());
    add(raw, context, 'mailto');
  });

  const bodyText = clean($('body').text());
  for (const match of bodyText.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
    const start = Math.max(0, match.index - 160);
    const end = Math.min(bodyText.length, match.index + match[0].length + 160);
    add(match[0], bodyText.slice(start, end), 'text');
  }

  const decoded = decodeObfuscated(bodyText);
  if (decoded !== bodyText) {
    for (const match of decoded.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
      const start = Math.max(0, match.index - 160);
      const end = Math.min(decoded.length, match.index + match[0].length + 160);
      add(match[0], decoded.slice(start, end), 'obfuscated');
    }
  }

  return [...candidates.values()];
}

function contactLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const links = new Map();
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    try {
      const url = new URL(href, base);
      if (!/^https?:$/.test(url.protocol) || !sameSiteHost(url.hostname, base.hostname)) return;
      const label = `${url.pathname} ${$(element).text()}`;
      if (!CONTACT_LINK_PATTERN.test(label)) return;
      url.hash = '';
      links.set(url.toString(), url.toString());
    } catch { /* ignore malformed URL */ }
  });
  return [...links.values()];
}

function pageQueue(homeHtml, homeUrl) {
  const queue = [homeUrl];
  for (const url of contactLinks(homeHtml, homeUrl)) {
    if (!queue.includes(url)) queue.push(url);
  }
  const origin = new URL(homeUrl).origin;
  for (const pathname of STANDARD_PATHS) {
    const url = new URL(pathname, origin).toString();
    if (!queue.includes(url)) queue.push(url);
  }
  return queue;
}

async function enrichLrv(record) {
  const website = record.websiteFromDrv || LRV_WEBSITE_OVERRIDES.get(record.drvId) || '';
  const publicResult = {
    organizationId: record.organizationId,
    drvId: record.drvId,
    name: record.name,
    website,
    websiteSource: record.websiteFromDrv ? 'drv' : (website ? 'verified-override' : 'missing'),
    robotsStatus: '',
    pagesFetched: 0,
    candidateCount: 0,
    autoApprovedCount: 0,
    reviewCount: 0,
    status: 'no_website'
  };
  if (!website) return { publicResult, candidates: [] };

  let homeResponse;
  let homeHtml;
  try {
    const initialOrigin = new URL(website).origin;
    const initialRobots = await loadRobots(initialOrigin);
    publicResult.robotsStatus = initialRobots.status;
    if (!robotsAllows(initialRobots.rules, new URL(website).pathname || '/')) {
      publicResult.status = 'robots_blocked';
      return { publicResult, candidates: [] };
    }
    homeResponse = await fetchResponse(website);
    if (!homeResponse.ok) {
      publicResult.status = `home_http_${homeResponse.status}`;
      return { publicResult, candidates: [] };
    }
    const contentType = homeResponse.headers.get('content-type') || '';
    if (!/text|html/i.test(contentType)) {
      publicResult.status = 'home_non_html';
      return { publicResult, candidates: [] };
    }
    homeHtml = await homeResponse.text();
  } catch (error) {
    publicResult.status = 'home_fetch_error';
    publicResult.error = error.name === 'AbortError' ? 'timeout' : error.message;
    return { publicResult, candidates: [] };
  }

  const finalHome = homeResponse.url;
  publicResult.website = finalHome;
  const robots = await loadRobots(new URL(finalHome).origin);
  publicResult.robotsStatus = robots.status;
  const pages = pageQueue(homeHtml, finalHome);
  const rawCandidates = [];
  let successful = 0;

  for (const url of pages) {
    if (successful >= MAX_PAGES) break;
    const parsed = new URL(url);
    if (!robotsAllows(robots.rules, parsed.pathname || '/')) continue;
    try {
      if (url !== finalHome) await sleep(DELAY_MS);
      const response = url === finalHome ? homeResponse : await fetchResponse(url);
      if (!response.ok || !sameSiteHost(new URL(response.url).hostname, new URL(finalHome).hostname)) continue;
      const contentType = response.headers.get('content-type') || '';
      if (!/text|html/i.test(contentType)) continue;
      const html = url === finalHome ? homeHtml : await response.text();
      successful += 1;
      rawCandidates.push(...extractEmails(html, response.url));
    } catch { /* page-level failure stays non-fatal */ }
  }

  const unique = new Map();
  for (const candidate of rawCandidates) {
    const existing = unique.get(candidate.email);
    if (!existing || candidate.context.length > existing.context.length) unique.set(candidate.email, candidate);
  }
  const verifiedAt = new Date().toISOString();
  const candidates = [...unique.values()].map((candidate) => {
    const classification = classifyContactCandidate(candidate, finalHome);
    return {
      organizationId: record.organizationId,
      email: candidate.email,
      website: finalHome,
      sourceType: 'club-website',
      sourceUrl: candidate.sourceUrl,
      verifiedAt,
      context: candidate.context,
      contactKind: classification.contactKind,
      governanceState: classification.governanceState,
      reason: classification.reason,
      policyVersion: classification.policyVersion,
      autoApproved: classification.autoApproved
    };
  });

  publicResult.pagesFetched = successful;
  publicResult.candidateCount = candidates.length;
  publicResult.autoApprovedCount = candidates.filter((item) => item.autoApproved).length;
  publicResult.reviewCount = candidates.filter((item) => !item.autoApproved && !item.governanceState.startsWith('excluded-')).length;
  publicResult.status = candidates.some((item) => item.autoApproved) ? 'approved_candidate_found' : (candidates.length ? 'review_or_excluded_only' : 'no_email_found');
  return { publicResult, candidates };
}

function markdown(summary, results) {
  const rows = results.map((item) => `| ${item.name.replace(/\|/g, '\\|')} | ${item.websiteSource} | ${item.status} | ${item.pagesFetched} | ${item.candidateCount} | ${item.autoApprovedCount} | ${item.reviewCount} |`).join('\n');
  return `# LRV Enrichment – Quality Report\n\nStand: ${summary.generatedAt}\n\n- Ziel-LRV: **${summary.targets}**\n- LRV mit freigegebenem Website-Kandidaten: **${summary.withApprovedCandidate}**\n- nur Review/Excluded: **${summary.reviewOnly}**\n- ohne E-Mail-Fund: **${summary.noEmail}**\n- technisch blockiert/fehlerhaft: **${summary.technicalFailures}**\n\n| LRV | Website-Quelle | Status | Seiten | Kandidaten | Approved | Review |\n| --- | --- | --- | ---: | ---: | ---: | ---: |\n${rows}\n\nDer öffentliche Report enthält keine E-Mail-Adressen. Kandidaten werden ausschließlich privat in \`build-private/contact-candidates.json\` gespeichert.\n`;
}

async function main() {
  const registryRaw = JSON.parse(await readFile(REGISTRY_FILE, 'utf8'));
  const lrvs = (registryRaw.organizations || registryRaw).filter((record) => record.type === 'lrv');
  const targets = lrvs.filter((record) => !classifyContactCandidate({ email: record.emailFromDrv }, record.websiteFromDrv).autoApproved);
  const results = [];
  const contacts = [];

  for (const record of targets) {
    const enriched = await enrichLrv(record);
    results.push(enriched.publicResult);
    contacts.push(...enriched.candidates);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    targets: targets.length,
    withApprovedCandidate: results.filter((item) => item.status === 'approved_candidate_found').length,
    reviewOnly: results.filter((item) => item.status === 'review_or_excluded_only').length,
    noEmail: results.filter((item) => item.status === 'no_email_found').length,
    technicalFailures: results.filter((item) => /blocked|error|http|non_html/.test(item.status)).length
  };

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify({ generatedAt: summary.generatedAt, scope: 'lrv-enrichment', contacts }, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.json'), JSON.stringify({ summary, results }, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.md'), markdown(summary, results));
  console.log(`[lrv-enrichment] targets=${summary.targets}; approved=${summary.withApprovedCandidate}; review=${summary.reviewOnly}; noEmail=${summary.noEmail}; technical=${summary.technicalFailures}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
