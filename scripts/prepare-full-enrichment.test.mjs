import assert from 'node:assert/strict';
import { buildFullEnrichmentBatches, FULL_ENRICHMENT_PREP_VERSION } from './prepare-full-enrichment.mjs';

assert.equal(FULL_ENRICHMENT_PREP_VERSION, 'full-enrichment-prep/1.0.0');

const registry = [];
for (let i = 1; i <= 17; i += 1) {
  registry.push({
    organizationId: String(10000 + i),
    type: 'club',
    websiteStatus: i <= 14 ? 'present' : 'missing',
    websiteFromDrv: i <= 14 ? `https://club-${i}.example/` : ''
  });
}
registry.push({ organizationId: '30010', type: 'lrv', websiteStatus: 'present', websiteFromDrv: 'https://lrv.example/' });

const first = buildFullEnrichmentBatches(registry, 5);
const second = buildFullEnrichmentBatches([...registry].reverse(), 5);

assert.equal(first.report.clubs, 17);
assert.equal(first.report.knownWebsite, 14);
assert.equal(first.report.missingWebsite, 3);
assert.deepEqual(first.report.batchSizes, [3, 3, 3, 3, 2]);
assert.equal(Math.max(...first.report.batchSizes) - Math.min(...first.report.batchSizes), 1);
assert.equal(first.report.coverageHash, second.report.coverageHash);
assert.deepEqual(
  first.batches.flat().map((row) => row.organizationId),
  second.batches.flat().map((row) => row.organizationId)
);
assert.equal(new Set(first.batches.flat().map((row) => row.organizationId)).size, 14);
assert.deepEqual(new Set(first.missing.map((row) => row.organizationId)).size, 3);
assert.equal(first.batches.flat().some((row) => row.type !== 'club'), false);

console.log('full enrichment batch preparation tests passed');
