import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const FULL_ENRICHMENT_PREP_VERSION = 'full-enrichment-prep/1.0.0';
const REGISTRY_FILE = process.env.FULL_ENRICHMENT_REGISTRY_FILE || 'build-private/drv-registry-websites.json';
const OUTPUT_DIR = process.env.FULL_ENRICHMENT_OUTPUT_DIR || 'build-private/full-enrichment';
const REPORT_DIR = process.env.FULL_ENRICHMENT_REPORT_DIR || 'artifacts/full-enrichment-prep';
const BATCH_COUNT = Math.max(1, Math.min(20, Number(process.env.FULL_ENRICHMENT_BATCH_COUNT || 5)));

function stableRank(organizationId) {
  return createHash('sha256').update(`${FULL_ENRICHMENT_PREP_VERSION}|${organizationId}`).digest('hex');
}

function publicBatchSummary(batch, index) {
  return {
    batch: index + 1,
    count: batch.length,
    organizationIdHash: createHash('sha256').update(batch.map((row) => row.organizationId).join('\n')).digest('hex')
  };
}

export function buildFullEnrichmentBatches(registry, batchCount = 5) {
  const clubs = (registry || []).filter((row) => row.type === 'club');
  const known = clubs
    .filter((row) => row.websiteStatus === 'present' && row.websiteFromDrv)
    .sort((a, b) => stableRank(a.organizationId).localeCompare(stableRank(b.organizationId)));
  const missing = clubs.filter((row) => row.websiteStatus !== 'present' || !row.websiteFromDrv);

  const ids = known.map((row) => row.organizationId);
  if (new Set(ids).size !== ids.length) throw new Error('full enrichment contains duplicate organization IDs');

  const batches = Array.from({ length: batchCount }, () => []);
  known.forEach((row, index) => batches[index % batchCount].push(row));
  const sizes = batches.map((batch) => batch.length);
  if (Math.max(...sizes) - Math.min(...sizes) > 1) throw new Error('full enrichment batches are unbalanced');

  const report = {
    version: FULL_ENRICHMENT_PREP_VERSION,
    clubs: clubs.length,
    knownWebsite: known.length,
    missingWebsite: missing.length,
    batchCount,
    batchSizes: sizes,
    coverageHash: createHash('sha256').update(ids.join('\n')).digest('hex'),
    batches: batches.map(publicBatchSummary)
  };

  return { known, missing, batches, report };
}

async function main() {
  const raw = JSON.parse(await readFile(REGISTRY_FILE, 'utf8'));
  const registry = raw.organizations || raw;
  const { known, missing, batches, report } = buildFullEnrichmentBatches(registry, BATCH_COUNT);

  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });

  for (let index = 0; index < batches.length; index += 1) {
    await writeFile(path.join(OUTPUT_DIR, `batch-${index + 1}.json`), JSON.stringify({
      generatedAt: new Date().toISOString(),
      version: FULL_ENRICHMENT_PREP_VERSION,
      batch: index + 1,
      batchCount: batches.length,
      count: batches[index].length,
      organizations: batches[index]
    }, null, 2));
  }

  await writeFile(path.join(OUTPUT_DIR, 'missing.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    version: FULL_ENRICHMENT_PREP_VERSION,
    count: missing.length,
    organizations: missing
  }, null, 2));

  await writeFile(path.join(REPORT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.md'), `# Voll-Enrichment – Batch-Vorbereitung\n\n- Version: **${report.version}**\n- Vereine: **${report.clubs}**\n- bekannte/verifizierte Websites: **${report.knownWebsite}**\n- bewusst ohne Website: **${report.missingWebsite}**\n- Batches: **${report.batchCount}**\n- Größen: **${report.batchSizes.join(', ')}**\n- Coverage-Hash: \`${report.coverageHash}\`\n\nÖffentliche Reports enthalten nur Counts und Hashes; private Batchdateien bleiben unter \`build-private/\`.\n`);

  console.log(`[full-enrichment-prep] clubs=${report.clubs}; known=${report.knownWebsite}; missing=${report.missingWebsite}; batches=${report.batchSizes.join('/')}; hash=${report.coverageHash.slice(0, 12)}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
