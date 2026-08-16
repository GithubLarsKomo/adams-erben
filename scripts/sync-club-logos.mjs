import { lookup } from 'node:dns/promises';
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { isIP } from 'node:net';
import path from 'node:path';
import {
  classifyLogoCandidate,
  extensionForContentType,
  extractLogoCandidates,
  extractPageIdentity,
  isTrustedReferencedAsset,
  sanitizeSvg
} from './lib/logo-discovery.mjs';
import { loadLogoManifest } from './lib/logo-manifest.mjs';

const root = process.cwd();
const manifestPath = path.join(root, 'src', 'data', 'club-logos.json');
const assetDir = path.join(root, 'src', 'assets', 'images', 'clubs');
const reportDir = path.join(root, 'artifacts', 'logo-sync');
const inputCandidates = [path.join(root, 'dist', 'data', 'clubs.json'), path.join(root, 'src', 'data', 'clubs.seed.json')];

const USER_AGENT = process.env.LOGO_SYNC_USER_AGENT || 'adams-erben/0.1 (+https://adams-erben.de; club logo build-time enrichment)';
const CONCURRENCY = Math.max(1, Math.min(6, Number(process.env.LOGO_SYNC_CONCURRENCY || 3)));
const DELAY_MS = Math.max(100, Number(process.env.LOGO_SYNC_DELAY_MS || 300));
const LIMIT = Math.max(0, Number(process.env.LOGO_SYNC_LIMIT || 0));
const FORCE = process.env.LOGO_SYNC_FORCE === '1';
const INCLUDE_ICONS = process.env.LOGO_SYNC_INCLUDE_ICONS === '1';
const MIN_SCORE = Number(process.env.LOGO_SYNC_MIN_SCORE || 70);
const MIN_ENTITY = Number(process.env.LOGO_SYNC_MIN_ENTITY || 0.55);
const MAX_BYTES = Math.max(64 * 1024, Number(process.env.LOGO_SYNC_MAX_BYTES || 2 * 1024 * 1024));
const MAX_CANDIDATES = Math.max(1, Math.min(20, Number(process.env.LOGO_SYNC_MAX_CANDIDATES || 8)));
const RETRY_DAYS = Math.max(0, Number(process.env.LOGO_SYNC_RETRY_DAYS || 30));
const TYPES = new Set(String(process.env.LOGO_SYNC_TYPES || 'club,lrv,drv').split(',').map((value) => value.trim()).filter(Boolean));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isPrivateIp(address) {
  if (!address) return true;
  if (address === '::1' || address === '0:0:0:0:0:0:0:1') return true;
  if (/^(?:fc|fd)[0-9a-f]{2}:/i.test(address) || /^fe[89ab][0-9a-f]:/i.test(address)) return true;
  if (/^::ffff:/i.test(address)) return isPrivateIp(address.replace(/^::ffff:/i, ''));
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(address)) return false;
  const [a, b] = address.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

async function assertPublicUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!/^https?:$/.test(url.protocol)) throw new Error('unsupported URL protocol');
  if (url.username || url.password) throw new Error('credentialed URL rejected');
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) throw new Error('local hostname rejected');
  if (isIP(host) && isPrivateIp(host)) throw new Error('private IP rejected');
  const addresses = await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((item) => isPrivateIp(item.address))) throw new Error('private or unresolved destination rejected');
  return url;
}

async function fetchPublic(url, { accept, timeoutMs = 15_000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await assertPublicUrl(url);
      const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': USER_AGENT, Accept: accept || '*/*' } });
      clearTimeout(timeout);
      if (!response.ok) {
        const error = new Error(`${response.status} ${response.statusText}`);
        error.status = response.status;
        throw error;
      }
      await assertPublicUrl(response.url);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < 2 && ![401, 403, 404].includes(Number(error?.status))) await sleep(350 * attempt);
      else if ([401, 403, 404].includes(Number(error?.status))) break;
    }
  }
  throw lastError || new Error('fetch failed');
}

async function readLimited(response, maxBytes) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > maxBytes) throw new Error(`asset exceeds ${maxBytes} bytes`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > maxBytes) throw new Error(`asset exceeds ${maxBytes} bytes`);
  return buffer;
}

async function loadOrganizations() {
  for (const filePath of inputCandidates) {
    try {
      const parsed = JSON.parse(await readFile(filePath, 'utf8'));
      if (Array.isArray(parsed.organizations)) return { filePath, organizations: parsed.organizations };
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  throw new Error('No clubs.json or clubs.seed.json input found. Run npm run sync:drv or use the checked-in seed.');
}

function safeFileStem(organization) {
  return String(organization.id || organization.organizationId || organization.drvId || organization.name || 'organization')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'organization';
}

function manifestKey(organization) { return String(organization.organizationId || organization.drvId || organization.id); }
function assetFsPath(publicAsset) { return path.join(root, 'src', String(publicAsset || '').replace(/^\/+/, '')); }

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

function retryDue(entry, now = Date.now()) {
  if (!entry || FORCE) return true;
  if (entry.status === 'present') return false;
  const attemptedAt = Date.parse(entry.attemptedAt || entry.discoveredAt || '');
  if (!Number.isFinite(attemptedAt)) return true;
  return now - attemptedAt >= RETRY_DAYS * 24 * 60 * 60 * 1000;
}

async function shouldProcess(organization, entry) {
  if (!entry || FORCE || entry.website !== organization.website) return true;
  if (entry.status === 'present') return !(entry.asset && await exists(assetFsPath(entry.asset)));
  return retryDue(entry);
}

async function downloadCandidate(candidate, pageUrl) {
  if (!isTrustedReferencedAsset(candidate, pageUrl)) throw new Error('untrusted logo asset origin');
  const response = await fetchPublic(candidate.url, { accept: 'image/avif,image/webp,image/svg+xml,image/png,image/jpeg,image/gif,image/*;q=0.8,*/*;q=0.1' });
  const redirected = { ...candidate, url: response.url };
  if (!isTrustedReferencedAsset(redirected, pageUrl)) throw new Error('untrusted logo asset redirect');
  const contentType = String(response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const extension = extensionForContentType(contentType);
  if (!extension) throw new Error(`unsupported logo content type: ${contentType || 'missing'}`);
  let buffer = await readLimited(response, MAX_BYTES);
  if (contentType === 'image/svg+xml') buffer = Buffer.from(sanitizeSvg(buffer.toString('utf8')), 'utf8');
  return { buffer, contentType, extension, finalUrl: response.url };
}

function compactEvaluation(candidate, decision, trusted) {
  return {
    url: candidate.url,
    kind: candidate.kind,
    score: candidate.score,
    entityConfidence: decision.entityConfidence,
    disposition: decision.disposition,
    reason: trusted ? decision.reason : 'untrusted_asset_origin',
    trustedOrigin: trusted,
    label: candidate.label || '',
    context: candidate.context || ''
  };
}

async function discoverForOrganization(organization) {
  const pageResponse = await fetchPublic(organization.website, { accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.3' });
  const contentType = String(pageResponse.headers.get('content-type') || '').toLowerCase();
  if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
    throw new Error(`website returned non-HTML content: ${contentType}`);
  }
  const htmlBuffer = await readLimited(pageResponse, 2 * 1024 * 1024);
  const html = htmlBuffer.toString('utf8');
  const sourcePage = pageResponse.url;
  const pageIdentity = extractPageIdentity(html);
  const candidates = extractLogoCandidates(html, sourcePage, organization, { includeIcons: INCLUDE_ICONS }).slice(0, MAX_CANDIDATES);
  const evaluated = candidates.map((candidate) => {
    const decision = classifyLogoCandidate(candidate, organization, pageIdentity, { minScore: MIN_SCORE, minEntity: MIN_ENTITY });
    const trusted = isTrustedReferencedAsset(candidate, sourcePage);
    if (!trusted && decision.disposition === 'accept') decision.disposition = 'reject';
    return { candidate, decision, trusted };
  });
  const audit = evaluated.map(({ candidate, decision, trusted }) => compactEvaluation(candidate, decision, trusted));
  const accepted = evaluated.filter((item) => item.decision.disposition === 'accept' && item.trusted);
  const review = evaluated.filter((item) => item.decision.disposition === 'review' && item.trusted);

  const errors = [];
  for (const item of accepted) {
    try {
      const downloaded = await downloadCandidate(item.candidate, sourcePage);
      return {
        status: 'present', sourcePage, sourceUrl: downloaded.finalUrl, contentType: downloaded.contentType,
        extension: downloaded.extension, score: item.candidate.score, entityConfidence: item.decision.entityConfidence,
        candidateKind: item.candidate.kind, buffer: downloaded.buffer, candidates: audit
      };
    } catch (error) {
      errors.push(`${item.candidate.url}: ${error.message}`);
    }
  }

  if (review.length) {
    const best = review[0];
    return {
      status: 'review', sourcePage, sourceUrl: best.candidate.url, score: best.candidate.score,
      entityConfidence: best.decision.entityConfidence, candidateKind: best.candidate.kind,
      reason: accepted.length ? 'accepted_candidates_failed_download' : 'entity_match_uncertain', candidates: audit, errors: errors.slice(0, 5)
    };
  }
  return {
    status: 'missing', sourcePage,
    reason: candidates.length ? (accepted.length ? 'accepted_candidates_failed_download' : 'no_candidate_passed_v2') : 'no_logo_candidates',
    candidates: audit, errors: errors.slice(0, 5)
  };
}

async function mapWithConcurrency(items, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      try { results[index] = await worker(items[index], index); }
      catch (error) { results[index] = { error }; }
      await sleep(DELAY_MS);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, run));
  return results;
}

const { filePath: inputPath, organizations: allOrganizations } = await loadOrganizations();
const manifest = await loadLogoManifest(manifestPath);
manifest.version = 2;
manifest.organizations ||= {};
let organizations = allOrganizations.filter((organization) => TYPES.has(organization.type) && organization.website);
if (LIMIT > 0) organizations = organizations.slice(0, LIMIT);

await mkdir(assetDir, { recursive: true });
await mkdir(path.dirname(manifestPath), { recursive: true });
await mkdir(reportDir, { recursive: true });

const scheduled = [];
let cached = 0;
for (const organization of organizations) {
  const key = manifestKey(organization);
  if (await shouldProcess(organization, manifest.organizations[key])) scheduled.push(organization); else cached += 1;
}
console.log(`[logos:v2] input=${path.relative(root, inputPath)} eligible=${organizations.length} scheduled=${scheduled.length} cached=${cached} concurrency=${CONCURRENCY}`);

let completed = 0;
const results = await mapWithConcurrency(scheduled, async (organization) => {
  const key = manifestKey(organization);
  const attemptedAt = new Date().toISOString();
  try {
    const discovery = await discoverForOrganization(organization);
    const common = {
      status: discovery.status, organizationId: organization.organizationId || '', id: organization.id || '', drvId: organization.drvId || '',
      name: organization.name, type: organization.type, website: organization.website, sourcePage: discovery.sourcePage || organization.website,
      sourceUrl: discovery.sourceUrl || '', score: discovery.score || null, entityConfidence: discovery.entityConfidence ?? null,
      candidateKind: discovery.candidateKind || '', reason: discovery.reason || '', candidates: discovery.candidates || [], attemptedAt
    };
    if (discovery.status !== 'present') {
      manifest.organizations[key] = common;
      return { organization, ...common };
    }

    const stem = safeFileStem(organization);
    const fileName = `${stem}${discovery.extension}`;
    const publicAsset = `/assets/images/clubs/${fileName}`;
    const outputPath = path.join(assetDir, fileName);
    const previous = manifest.organizations[key];
    if (previous?.asset && previous.asset !== publicAsset) await rm(assetFsPath(previous.asset), { force: true });
    await writeFile(outputPath, discovery.buffer);
    manifest.organizations[key] = { ...common, asset: publicAsset, contentType: discovery.contentType, discoveredAt: attemptedAt };
    return { organization, ...common, asset: publicAsset };
  } catch (error) {
    const status = [401, 403].includes(Number(error?.status)) || /^(?:401|403)\b/.test(error?.message || '') ? 'blocked' : 'error';
    const entry = {
      status, organizationId: organization.organizationId || '', id: organization.id || '', drvId: organization.drvId || '', name: organization.name,
      type: organization.type, website: organization.website, reason: error.message, attemptedAt
    };
    manifest.organizations[key] = entry;
    return { organization, ...entry };
  } finally {
    completed += 1;
    if (completed % 25 === 0 || completed === scheduled.length) console.log(`[logos:v2] ${completed}/${scheduled.length}`);
  }
});

manifest.generatedAt = new Date().toISOString();
manifest.organizations = Object.fromEntries(Object.entries(manifest.organizations).sort(([a], [b]) => a.localeCompare(b, 'de')));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const count = (status) => results.filter((item) => item?.status === status).length;
const report = {
  version: 2, generatedAt: manifest.generatedAt, input: path.relative(root, inputPath).replace(/\\/g, '/'), eligible: organizations.length,
  scheduled: scheduled.length, cached, found: count('present'), review: count('review'), missing: count('missing'), blocked: count('blocked'), errors: count('error'),
  minScore: MIN_SCORE, minEntity: MIN_ENTITY, includeIcons: INCLUDE_ICONS, retryDays: RETRY_DAYS,
  results: results.map((item) => ({
    organizationId: item?.organization?.organizationId || '', id: item?.organization?.id || '', name: item?.organization?.name || '',
    status: item?.status || 'error', asset: item?.asset || '', score: item?.score || null, entityConfidence: item?.entityConfidence ?? null,
    sourceUrl: item?.sourceUrl || '', reason: item?.reason || '', candidates: item?.candidates || []
  }))
};
await writeFile(path.join(reportDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`[logos:v2] found=${report.found} review=${report.review} missing=${report.missing} blocked=${report.blocked} errors=${report.errors}; manifest=src/data/club-logos.json`);
