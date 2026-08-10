import assert from 'node:assert/strict';
import { buildFullEnrichmentBatches, FULL_ENRICHMENT_PREP_VERSION } from './prepare-full-enrichment.mjs';

assert.equal(FULL_ENRICHMENT_PREP_VERSION, 'full-enrichment-prep/1.1.0');

const registry = [];
const snapshot = [];
for (let i = 1; i <= 17; i += 1) {
  registry.push({
    organizationId: String(10000 + i),
    drvId: String(10000 + i),
    name: `Club ${i}`,
    type: 'club',
    city: 'Teststadt',
    postalCode: '12345',
    state: 'Testland',
    websiteStatus: i <= 14 ? 'present' : 'missing',
    websiteFromDrv: i <= 14 ? `https://club-${i}.example/` : ''
  });
  snapshot.push({
    organizationId: String(10000 + i),
    type: 'club',
    website: i <= 14 ? `https://club-${i}.example/` : '',
    contactRouteLevel: i <= 5 ? 'club' : i <= 12 ? 'lrv' : 'drv'
  });
}
registry.push({ organizationId: '30010', type: 'lrv', websiteStatus: 'present', websiteFromDrv: 'https://lrv.example/' });
snapshot.push({ organizationId: '30010', type: 'lrv', contactRouteLevel: 'lrv' });

const first = buildFullEnrichmentBatches(registry, snapshot, 5);
const second = buildFullEnrichmentBatches([...registry].reverse(), [...snapshot].reverse(), 5);

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
assert.equal(new Set(first.missing.map((row) => row.organizationId)).size, 3);
assert.equal(first.batches.flat().some((row) => row.type !== 'club'), false);
assert.equal(first.batches.flat().every((row) => row.website === row.websiteFromDrv), true);
assert.deepEqual(first.report.routeCounts, { club: 5, lrv: 7, drv: 2 });
assert.equal(first.batches.flat().find((row) => row.organizationId === '10001').routeLevel, 'club');
assert.equal(first.batches.flat().find((row) => row.organizationId === '10006').routeLevel, 'lrv');
assert.equal(first.batches.flat().find((row) => row.organizationId === '10013').routeLevel, 'drv');

assert.throws(
  () => buildFullEnrichmentBatches(registry, snapshot.filter((row) => row.organizationId !== '10017'), 5),
  /missing from snapshot: 10017/
);

console.log('full enrichment batch preparation tests passed');
