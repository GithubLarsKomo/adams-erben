import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { evaluateV5Precision } from './lib/logo-v5-precision.mjs';

const root = process.cwd();
const manifestPath = path.join(root, 'src', 'data', 'club-logos.json');
const reportPath = path.join(root, 'artifacts', 'logo-sync', 'report.json');

function basenameFromUrl(raw = '') {
  try {
    const pathname = decodeURIComponent(new URL(raw).pathname).toLowerCase();
    return pathname.split('/').filter(Boolean).at(-1)?.replace(/^\./, '') || '';
  } catch {
    return '';
  }
}

function candidateForSelectedSource(entry) {
  const candidates = Array.isArray(entry?.candidates) ? entry.candidates : [];
  const sourceUrl = entry?.sourceUrl || '';
  const exact = candidates.find((candidate) => candidate.url === sourceUrl);
  if (exact) return exact;
  const sourceBase = basenameFromUrl(sourceUrl);
  if (sourceBase) {
    const byBase = candidates.find((candidate) => {
      try {
        return decodeURIComponent(new URL(candidate.url).pathname).toLowerCase().includes(sourceBase);
      } catch {
        return false;
      }
    });
    if (byBase) return byBase;
  }
  return candidates.find((candidate) => candidate.disposition === 'accept') || null;
}

function evaluateCandidate(candidate, entry, selectedUrl = '') {
  return evaluateV5Precision(candidate, { name: entry.name || '', city: entry.city || '' }, { selectedUrl });
}

function rewriteCandidates(entry) {
  return (entry.candidates || []).map((candidate) => {
    if (!['accept', 'review'].includes(candidate.disposition)) return candidate;
    const decision = evaluateCandidate(candidate, entry, candidate.url);
    if (decision.allow) return candidate;
    return {
      ...candidate,
      disposition: decision.disposition,
      reason: decision.reason,
      v5Rule: decision.rule
    };
  });
}

function downgradedStatus(candidates, selectedDecision) {
  if (selectedDecision.disposition === 'review') return 'review';
  return candidates.some((candidate) => candidate.disposition === 'accept' || candidate.disposition === 'review')
    ? 'review'
    : 'missing';
}

async function removeLocalAsset(asset = '') {
  if (!asset.startsWith('/assets/images/clubs/')) return;
  const filePath = path.join(root, 'src', asset.replace(/^\//, ''));
  await rm(filePath, { force: true });
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
let report = null;
try {
  report = JSON.parse(await readFile(reportPath, 'utf8'));
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const changes = [];
for (const [key, original] of Object.entries(manifest.organizations || {})) {
  if (original.status !== 'present') continue;
  const selected = candidateForSelectedSource(original);
  if (!selected) continue;
  const selectedDecision = evaluateCandidate(selected, original, original.sourceUrl || selected.url);
  const candidates = rewriteCandidates(original);
  if (selectedDecision.allow) {
    original.candidates = candidates;
    continue;
  }

  const previousAsset = original.asset || '';
  const status = downgradedStatus(candidates, selectedDecision);
  manifest.organizations[key] = {
    ...original,
    status,
    asset: '',
    sourceUrl: '',
    score: null,
    entityConfidence: null,
    candidateKind: '',
    reason: selectedDecision.reason,
    candidates,
    v5PrecisionRule: selectedDecision.rule
  };
  await removeLocalAsset(previousAsset);
  changes.push({
    organizationId: original.organizationId || key,
    name: original.name,
    from: 'present',
    to: status,
    sourceUrl: original.sourceUrl,
    reason: selectedDecision.reason,
    rule: selectedDecision.rule
  });
}

const generatedAt = new Date().toISOString();
manifest.generatedAt = generatedAt;
manifest.v5Precision = {
  appliedAt: generatedAt,
  changed: changes.length,
  rules: ['alias-boundary', 'function-word-evidence', 'commerce-subbrand', 'identity-conflict', 'raster-photo-protection']
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

if (report) {
  const byId = new Map(Object.values(manifest.organizations || {}).map((entry) => [String(entry.organizationId || entry.drvId || entry.id), entry]));
  report.results = (report.results || []).map((result) => {
    const entry = byId.get(String(result.organizationId || result.drvId || result.id));
    if (!entry) return result;
    return {
      ...result,
      status: entry.status,
      asset: entry.asset || '',
      sourceUrl: entry.sourceUrl || '',
      score: entry.score ?? null,
      entityConfidence: entry.entityConfidence ?? null,
      reason: entry.reason || '',
      candidates: entry.candidates || result.candidates || [],
      ...(entry.v5PrecisionRule ? { v5PrecisionRule: entry.v5PrecisionRule } : {})
    };
  });
  const counts = { present: 0, review: 0, missing: 0, blocked: 0, error: 0 };
  for (const result of report.results) {
    if (result.status in counts) counts[result.status] += 1;
  }
  report.found = counts.present;
  report.review = counts.review;
  report.missing = counts.missing;
  report.blocked = counts.blocked;
  report.errors = counts.error;
  report.v5Precision = {
    appliedAt: generatedAt,
    changed: changes.length,
    changes,
    rules: manifest.v5Precision.rules
  };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

console.log(`[logo-v5] changed=${changes.length}`);
for (const change of changes) {
  console.log(`[logo-v5] ${change.name}: ${change.from} -> ${change.to}; ${change.reason}; ${change.sourceUrl}`);
}
