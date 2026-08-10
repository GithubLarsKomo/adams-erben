import * as cheerio from 'cheerio';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { classifyContactCandidate, contactDomainsRelated, normalizeContactHost } from './lib/contact-governance.mjs';
import { lrvIdentityHints } from './lib/lrv-identity.mjs';

export const LAENDERRAT_URL = 'https://www.rudern.de/verband/gremien/laenderrat';
const REGISTRY_FILE = process.env.LRV_LAENDERRAT_REGISTRY_FILE || 'build-private/drv-registry.json';
const CONTACT_CANDIDATES_FILE = process.env.LRV_LAENDERRAT_CONTACT_CANDIDATES_FILE || 'build-private/contact-candidates.json';
const REPORT_DIR = process.env.LRV_LAENDERRAT_REPORT_DIR || 'artifacts/lrv-laenderrat';
const USER_AGENT = process.env.LRV_LAENDERRAT_USER_AGENT || 'adams-erben-lrv-laenderrat/0.1 (+https://adams-erben.de)';
const TIMEOUT_MS = Math.max(5_000, Number(process.env.LRV_LAENDERRAT_TIMEOUT_MS || 15_000));

const clean = (value = '') => String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const normalize = (value = '') => clean(value)
  .toLocaleLowerCase('de-DE')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

function identityTerms(record) {
  const terms = new Set();
  const name = normalize(record.name)
    .replace(/\b(?:e v|ev)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (name.length >= 8) terms.add(name);
  for (const state of record.states || (record.state ? [record.state] : [])) {
    const term = normalize(state);
    if (term.length >= 5) terms.add(term);
  }
  const drvId = String(record.drvId || record.organizationId || '');
  const aliases = {
    '30015': ['aac nrb landesruderverband hh'],
    '30020': ['landesruderverband sudwest', 'ruderverband sudwest'],
    '30023': ['ruderverband sachsen anhalt']
  }[drvId] || [];
  for (const alias of aliases) terms.add(normalize(alias));
  return [...terms].filter(Boolean);
}

function matchingRecords(text, lrvs) {
  const haystack = normalize(text);
  if (!haystack) return [];
  return lrvs.filter((record) => identityTerms(record).some((term) => haystack.includes(term)));
}

function nearestUniqueLrvContext($, element, lrvs) {
  let current = $(element).parent();
  for (let depth = 0; depth < 7 && current.length; depth += 1) {
    const text = clean(current.text());
    if (text && text.length <= 2000) {
      const matches = matchingRecords(text, lrvs);
      if (matches.length === 1) return { record: matches[0], context: text, resolutionMethod: 'dom-context' };
    }
    current = current.parent();
  }
  return null;
}

function websiteHost(value = '') {
  try { return normalizeContactHost(new URL(value).hostname); } catch { return ''; }
}

function knownContactHosts(record) {
  const identity = lrvIdentityHints(record);
  const hosts = new Set(identity.contactDomains || []);
  for (const website of [record.websiteFromDrv, identity.website]) {
    const host = websiteHost(website);
    if (host) hosts.add(host);
  }
  return [...hosts].map(normalizeContactHost).filter(Boolean);
}

function emailDomain(email = '') {
  const at = email.lastIndexOf('@');
  return at >= 0 ? normalizeContactHost(email.slice(at + 1)) : '';
}

function uniqueLrvByVerifiedDomain(email, lrvs) {
  const domain = emailDomain(email);
  if (!domain) return null;
  const matches = lrvs.filter((record) => knownContactHosts(record).some((known) => contactDomainsRelated(domain, known)));
  return matches.length === 1 ? matches[0] : null;
}

function mailtoEmail(href = '') {
  if (!/^mailto:/i.test(href)) return '';
  let raw = href.slice(href.indexOf(':') + 1).split('?')[0];
  try { raw = decodeURIComponent(raw); } catch { /* keep raw */ }
  const email = clean(raw).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function compactAnchorContext($, element) {
  let current = $(element).parent();
  for (let depth = 0; depth < 4 && current.length; depth += 1) {
    const text = clean(current.text());
    if (text && text.length <= 700) return text;
    current = current.parent();
  }
  return 'Öffentlicher Kontakt im DRV-Länderrat';
}

export function extractLaenderratCandidates(html, lrvs, verifiedAt = new Date().toISOString()) {
  const $ = cheerio.load(html);
  const results = [];
  for (const element of $('a[href^="mailto:"]').toArray()) {
    const email = mailtoEmail($(element).attr('href') || '');
    if (!email) continue;
    let resolved = nearestUniqueLrvContext($, element, lrvs);
    if (!resolved) {
      const record = uniqueLrvByVerifiedDomain(email, lrvs);
      if (record) resolved = { record, context: compactAnchorContext($, element), resolutionMethod: 'verified-domain' };
    }
    if (!resolved) continue;
    const identity = lrvIdentityHints(resolved.record);
    const website = resolved.record.websiteFromDrv || identity.website || '';
    const classification = classifyContactCandidate({ email, context: resolved.context }, website, {
      trustedDomains: identity.contactDomains,
      trustedFunctionalLocalParts: identity.functionalLocalParts
    });
    results.push({
      organizationId: resolved.record.organizationId,
      email,
      website,
      sourceType: 'drv-laenderrat',
      sourceUrl: LAENDERRAT_URL,
      verifiedAt,
      context: resolved.context.slice(0, 700),
      resolutionMethod: resolved.resolutionMethod,
      contactKind: classification.contactKind,
      governanceState: classification.governanceState,
      reason: classification.reason,
      policyVersion: classification.policyVersion,
      autoApproved: classification.autoApproved
    });
  }
  const unique = new Map();
  for (const candidate of results) {
    const key = `${candidate.organizationId}|${candidate.email}`;
    if (!unique.has(key)) unique.set(key, candidate);
  }
  return [...unique.values()];
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
      redirect: 'follow',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function mergeContacts(existingRaw, additions) {
  const existing = Array.isArray(existingRaw) ? existingRaw : (existingRaw?.contacts || []);
  const map = new Map();
  for (const item of [...existing, ...additions]) {
    if (!item?.organizationId || !item?.email) continue;
    const key = `${item.organizationId}|${String(item.email).toLowerCase()}|${item.sourceType || ''}`;
    map.set(key, item);
  }
  return [...map.values()];
}

function publicReport(candidates, lrvCount, generatedAt) {
  const byOrganization = new Map();
  for (const candidate of candidates) {
    const row = byOrganization.get(candidate.organizationId) || { candidates: 0, autoApproved: 0, review: 0, domResolved: 0, domainResolved: 0 };
    row.candidates += 1;
    if (candidate.autoApproved) row.autoApproved += 1;
    else row.review += 1;
    if (candidate.resolutionMethod === 'verified-domain') row.domainResolved += 1;
    else row.domResolved += 1;
    byOrganization.set(candidate.organizationId, row);
  }
  return {
    generatedAt,
    sourceUrl: LAENDERRAT_URL,
    lrvRegistryCount: lrvCount,
    matchedOrganizations: byOrganization.size,
    candidateCount: candidates.length,
    autoApprovedCandidateCount: candidates.filter((item) => item.autoApproved).length,
    reviewCandidateCount: candidates.filter((item) => !item.autoApproved).length,
    domainResolvedCandidateCount: candidates.filter((item) => item.resolutionMethod === 'verified-domain').length,
    organizations: [...byOrganization.entries()].map(([organizationId, counts]) => ({ organizationId, ...counts }))
  };
}

function markdown(report) {
  const rows = report.organizations.map((item) => `| ${item.organizationId} | ${item.candidates} | ${item.autoApproved} | ${item.review} | ${item.domResolved} | ${item.domainResolved} |`).join('\n');
  return `# DRV-Länderrat – LRV Contact Enrichment\n\nStand: ${report.generatedAt}\n\n- Registry-LRV: **${report.lrvRegistryCount}**\n- eindeutig zugeordnete LRV: **${report.matchedOrganizations}**\n- Kontaktkandidaten: **${report.candidateCount}**\n- davon Policy-Auto-Approved: **${report.autoApprovedCandidateCount}**\n- Review: **${report.reviewCandidateCount}**\n- über eindeutige verifizierte Domain aufgelöst: **${report.domainResolvedCandidateCount}**\n\n| DRV-ID | Kandidaten | Auto-Approved | Review | DOM | Domain-Fallback |\n| --- | ---: | ---: | ---: | ---: | ---: |\n${rows}\n\nDer öffentliche Report enthält keine E-Mail-Adressen. Der Länderrat wird nur als offizielle DRV-Zweitquelle genutzt; persönliche Adressen bleiben Review. Ein Domain-Fallback ist nur erlaubt, wenn die Absenderdomain durch DRV-Profil oder verifizierte LRV-Identität genau einem LRV zugeordnet ist.\n`;
}

async function main() {
  const registryRaw = JSON.parse(await readFile(REGISTRY_FILE, 'utf8'));
  const lrvs = (registryRaw.organizations || registryRaw).filter((record) => record.type === 'lrv');
  const existingRaw = await readFile(CONTACT_CANDIDATES_FILE, 'utf8').then(JSON.parse).catch((error) => {
    if (error?.code === 'ENOENT') return { contacts: [] };
    throw error;
  });
  const generatedAt = new Date().toISOString();
  const html = await fetchText(LAENDERRAT_URL);
  const candidates = extractLaenderratCandidates(html, lrvs, generatedAt);
  const merged = mergeContacts(existingRaw, candidates);
  const report = publicReport(candidates, lrvs.length, generatedAt);

  await mkdir(path.dirname(CONTACT_CANDIDATES_FILE), { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(CONTACT_CANDIDATES_FILE, JSON.stringify({ generatedAt, scope: 'lrv-enrichment+drv-laenderrat', contacts: merged }, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.md'), markdown(report));
  console.log(`[lrv-laenderrat] matched=${report.matchedOrganizations}; candidates=${report.candidateCount}; approved=${report.autoApprovedCandidateCount}; review=${report.reviewCandidateCount}; domainFallback=${report.domainResolvedCandidateCount}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
