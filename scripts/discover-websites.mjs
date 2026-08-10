import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SEARCH_PROVIDER = process.env.SEARCH_PROVIDER || 'brave';
const BRAVE_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';
const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY || '';
const INPUT = process.env.DISCOVERY_INPUT || 'build-private/website-discovery-input.json';
const GROUND_TRUTH = process.env.DISCOVERY_GROUND_TRUTH || 'build-private/website-discovery-ground-truth.json';
const OUTPUT_DIR = process.env.DISCOVERY_OUTPUT_DIR || 'artifacts/website-discovery-poc';
const PRIVATE_OUTPUT = process.env.DISCOVERY_PRIVATE_OUTPUT || 'build-private/website-discovery-private.json';
const COUNT = Math.max(1, Math.min(10, Number(process.env.DISCOVERY_RESULT_COUNT || 8)));
const TIMEOUT_MS = Math.max(5_000, Number(process.env.DISCOVERY_TIMEOUT_MS || 15_000));
const AUTO_ACCEPT_THRESHOLD = Number(process.env.DISCOVERY_AUTO_ACCEPT_THRESHOLD || 0.78);
const REVIEW_THRESHOLD = Number(process.env.DISCOVERY_REVIEW_THRESHOLD || 0.48);

const BLOCKED_HOST_PATTERNS = [
  /(^|\.)facebook\.com$/i, /(^|\.)instagram\.com$/i, /(^|\.)youtube\.com$/i,
  /(^|\.)wikipedia\.org$/i, /(^|\.)rudern\.de$/i, /(^|\.)google\./i,
  /(^|\.)bing\.com$/i, /(^|\.)linkedin\.com$/i, /(^|\.)x\.com$/i,
  /(^|\.)tripadvisor\./i, /(^|\.)yelp\./i
];

const DIRECTORY_HINT = /(vereinsverzeichnis|branchenbuch|stadtportal|sportvereine|vereinswiki|facebook|instagram|wikipedia|youtube)/i;
const ROWING_HINT = /(rudern|ruder|rowing)/i;

const clean = (value = '') => String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const normalize = (value = '') => clean(value).toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');

function tokenizeName(name) {
  const stop = new Set(['ruder', 'rudern', 'ruderclub', 'ruderverein', 'rudergesellschaft', 'ruderklub', 'club', 'verein', 'klub', 'ev', 'e', 'v', 'der', 'die', 'das', 'von', 'zu', 'zur', 'am', 'an', 'im', 'in', 'und']);
  return normalize(name).replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter((token) => token.length >= 3 && !stop.has(token));
}

export function normalizeHost(value = '') {
  try {
    const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(String(value)) ? String(value) : `https://${String(value)}`;
    return new URL(candidate).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function canonicalUrl(value = '') {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return '';
    url.hash = '';
    url.search = '';
    return url.toString();
  } catch { return ''; }
}

function blockedHost(host) {
  return BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(host));
}

export function buildQuery(org) {
  const location = [clean(org.postalCode || ''), clean(org.city || '')].filter(Boolean).join(' ');
  return [`\"${clean(org.name)}\"`, location, 'Rudern'].filter(Boolean).join(' ');
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function braveSearch(query) {
  if (!BRAVE_API_KEY) throw new Error('BRAVE_SEARCH_API_KEY is required for SEARCH_PROVIDER=brave');
  const url = new URL(BRAVE_ENDPOINT);
  url.searchParams.set('q', query);
  url.searchParams.set('count', String(COUNT));
  url.searchParams.set('country', 'DE');
  url.searchParams.set('search_lang', 'de');
  url.searchParams.set('ui_lang', 'de-DE');
  const data = await fetchJson(url, {
    headers: {
      Accept: 'application/json',
      'X-Subscription-Token': BRAVE_API_KEY
    }
  });
  return (data.web?.results || []).map((item, index) => ({
    rank: index + 1,
    url: canonicalUrl(item.url || ''),
    title: clean(item.title || ''),
    description: clean(item.description || '')
  })).filter((item) => item.url);
}

async function fixtureSearch(query, org) {
  const file = process.env.DISCOVERY_FIXTURE_RESULTS;
  if (!file) throw new Error('DISCOVERY_FIXTURE_RESULTS is required for SEARCH_PROVIDER=fixture');
  const data = JSON.parse(await readFile(file, 'utf8'));
  const key = org.organizationId || org.drvId || org.id || org.name;
  return (data[key] || data[query] || []).map((item, index) => ({
    rank: item.rank || index + 1,
    url: canonicalUrl(item.url || ''),
    title: clean(item.title || ''),
    description: clean(item.description || '')
  })).filter((item) => item.url);
}

async function search(query, org) {
  if (SEARCH_PROVIDER === 'brave') return braveSearch(query);
  if (SEARCH_PROVIDER === 'fixture') return fixtureSearch(query, org);
  throw new Error(`Unsupported SEARCH_PROVIDER=${SEARCH_PROVIDER}`);
}

export function scoreCandidate(org, candidate) {
  const url = canonicalUrl(candidate.url);
  const host = normalizeHost(url);
  if (!url || !host || blockedHost(host)) {
    return { ...candidate, url, host, score: 0, disposition: 'reject', reasons: ['blocked_or_invalid_host'] };
  }

  const haystack = normalize(`${candidate.title} ${candidate.description} ${host}`);
  const nameTokens = tokenizeName(org.name);
  const nameHits = nameTokens.filter((token) => haystack.includes(token)).length;
  const nameCoverage = nameTokens.length ? nameHits / nameTokens.length : 0;
  let score = Math.min(0.38, nameCoverage * 0.38);
  const reasons = [];
  if (nameHits) reasons.push(`name:${nameHits}/${nameTokens.length}`);

  const city = normalize(org.city || '');
  const postal = clean(org.postalCode || '');
  if (city && haystack.includes(city)) { score += 0.2; reasons.push('city'); }
  if (postal && haystack.includes(postal)) { score += 0.18; reasons.push('postal'); }
  if (ROWING_HINT.test(haystack)) { score += 0.1; reasons.push('rowing'); }

  const drvHost = normalizeHost(org.websiteFromDrv || org.website || '');
  if (drvHost && host === drvHost) { score += 0.22; reasons.push('matches_drv_host'); }

  if (DIRECTORY_HINT.test(haystack)) { score -= 0.28; reasons.push('directory_penalty'); }
  if (/wordpress\.com$|wixsite\.com$|jimdosite\.com$/i.test(host)) { score -= 0.08; reasons.push('hosted_site_penalty'); }
  if (candidate.rank === 1) { score += 0.04; reasons.push('rank1'); }
  else if (candidate.rank <= 3) { score += 0.02; reasons.push('top3'); }

  score = Math.max(0, Math.min(1, score));
  const disposition = score >= AUTO_ACCEPT_THRESHOLD ? 'auto-accept' : score >= REVIEW_THRESHOLD ? 'review' : 'reject';
  return { ...candidate, url, host, score: Number(score.toFixed(3)), disposition, reasons };
}

export function chooseCandidate(org, candidates) {
  const scored = candidates.map((candidate) => scoreCandidate(org, candidate)).sort((a, b) => b.score - a.score || a.rank - b.rank);
  const best = scored[0] || null;
  const second = scored[1] || null;
  let disposition = best?.disposition || 'none';
  let reason = best ? 'threshold' : 'no_candidates';

  if (best && second && best.disposition === 'auto-accept' && best.score - second.score < 0.12) {
    disposition = 'review';
    reason = 'ambiguous_top_candidates';
  }

  return { organizationId: org.organizationId || org.drvId || org.id || org.name, name: org.name, query: buildQuery(org), disposition, reason, best, candidates: scored };
}

export function normalizeGroundTruthEntry(raw) {
  if (raw == null || raw === '') return { status: 'unknown', acceptedHosts: [] };
  if (typeof raw === 'string') {
    const host = normalizeHost(raw);
    return host ? { status: 'official', acceptedHosts: [host] } : { status: 'unknown', acceptedHosts: [] };
  }
  if (Array.isArray(raw)) {
    const acceptedHosts = [...new Set(raw.map(normalizeHost).filter(Boolean))];
    return { status: acceptedHosts.length ? 'official' : 'unknown', acceptedHosts };
  }
  if (typeof raw !== 'object') return { status: 'unknown', acceptedHosts: [] };

  const status = ['official', 'none', 'ambiguous'].includes(raw.status) ? raw.status : 'official';
  const values = raw.acceptedHosts || raw.domains || raw.urls || raw.url || [];
  const array = Array.isArray(values) ? values : [values];
  const acceptedHosts = [...new Set(array.map(normalizeHost).filter(Boolean))];
  return { status, acceptedHosts, note: clean(raw.note || '') };
}

export function evaluateGroundTruth(decisions, truth) {
  let known = 0;
  let official = 0;
  let noSite = 0;
  let ambiguous = 0;
  let correctAuto = 0;
  let wrongAuto = 0;
  let review = 0;
  let none = 0;
  const rows = [];

  for (const decision of decisions) {
    const expected = normalizeGroundTruthEntry(truth[decision.organizationId]);
    const chosenHost = normalizeHost(decision.best?.url || '');
    const truthKnown = expected.status !== 'unknown';
    if (truthKnown) known += 1;
    if (expected.status === 'official') official += 1;
    else if (expected.status === 'none') noSite += 1;
    else if (expected.status === 'ambiguous') ambiguous += 1;

    let correct = null;
    if (decision.disposition === 'auto-accept') {
      correct = expected.status === 'official' && expected.acceptedHosts.includes(chosenHost);
      if (correct) correctAuto += 1;
      else wrongAuto += 1;
    } else if (decision.disposition === 'review') {
      review += 1;
    } else {
      none += 1;
    }

    rows.push({
      organizationId: decision.organizationId,
      name: decision.name,
      disposition: decision.disposition,
      score: decision.best?.score || 0,
      truthStatus: expected.status,
      expectedKnown: truthKnown,
      correct
    });
  }

  const autoTotal = correctAuto + wrongAuto;
  return {
    summary: {
      organizations: decisions.length,
      groundTruthKnown: known,
      groundTruthOfficial: official,
      groundTruthNone: noSite,
      groundTruthAmbiguous: ambiguous,
      autoAccepted: autoTotal,
      autoAcceptedCorrect: correctAuto,
      autoAcceptedWrong: wrongAuto,
      autoAcceptPrecisionPct: autoTotal ? Number((correctAuto / autoTotal * 100).toFixed(1)) : null,
      reviewRequired: review,
      noAutomaticCandidate: none
    },
    rows
  };
}

function publicDecision(decision) {
  return {
    organizationId: decision.organizationId,
    name: decision.name,
    disposition: decision.disposition,
    reason: decision.reason,
    topScore: decision.best?.score || 0,
    topHost: decision.best?.host || '',
    candidateCount: decision.candidates.length
  };
}

function markdown(summary, rows) {
  const lines = rows.map((row) => `| ${String(row.name).replace(/\|/g, '\\|')} | ${row.disposition} | ${row.topScore.toFixed(3)} | ${row.topHost || '–'} | ${row.candidateCount} |`).join('\n');
  return `# Website Discovery PoC B\n\n- Organisationen: **${summary.organizations}**\n- Ground Truth vorhanden: **${summary.groundTruthKnown}**\n- davon offizielle Website: **${summary.groundTruthOfficial}**\n- ohne eigenständige Website: **${summary.groundTruthNone}**\n- mehrdeutig/geteilt: **${summary.groundTruthAmbiguous}**\n- Auto-Accept: **${summary.autoAccepted}**\n- davon korrekt: **${summary.autoAcceptedCorrect}**\n- davon falsch/zu aggressiv: **${summary.autoAcceptedWrong}**\n- Precision Auto-Accept: **${summary.autoAcceptPrecisionPct ?? '–'} %**\n- Review nötig: **${summary.reviewRequired}**\n- kein automatischer Kandidat: **${summary.noAutomaticCandidate}**\n\n| Verein | Entscheidung | Score | Top-Domain | Kandidaten |\n| --- | --- | ---: | --- | ---: |\n${lines}\n`;
}

async function main() {
  const input = JSON.parse(await readFile(INPUT, 'utf8'));
  let truth = {};
  try { truth = JSON.parse(await readFile(GROUND_TRUTH, 'utf8')); } catch { /* optional */ }
  const organizations = Array.isArray(input) ? input : input.organizations || [];
  const decisions = [];

  for (const org of organizations) {
    const query = buildQuery(org);
    const candidates = await search(query, org);
    decisions.push(chooseCandidate(org, candidates));
  }

  const evaluation = evaluateGroundTruth(decisions, truth);
  const publicRows = decisions.map(publicDecision);
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(path.dirname(PRIVATE_OUTPUT), { recursive: true });
  await writeFile(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify({ summary: evaluation.summary, results: publicRows, evaluation: evaluation.rows }, null, 2));
  await writeFile(path.join(OUTPUT_DIR, 'report.md'), markdown(evaluation.summary, publicRows));
  await writeFile(PRIVATE_OUTPUT, JSON.stringify({ provider: SEARCH_PROVIDER, generatedAt: new Date().toISOString(), decisions }, null, 2));
  console.log(`[discovery] auto=${evaluation.summary.autoAccepted}, wrong=${evaluation.summary.autoAcceptedWrong}, review=${evaluation.summary.reviewRequired}, none=${evaluation.summary.noAutomaticCandidate}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
