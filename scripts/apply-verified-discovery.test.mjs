import assert from 'node:assert/strict';
import { applyVerifiedDiscovery, VERIFIED_DISCOVERY_VERSION } from './apply-verified-discovery.mjs';

const registry = [
  { organizationId: '11005', drvId: '11005', type: 'club', name: 'Ruderverein Esslingen e.V.', websiteFromDrv: '', websiteStatus: 'missing' },
  { organizationId: '11964', drvId: '11964', type: 'club', name: 'Ruderclub Mülheim 1977', websiteFromDrv: '', websiteStatus: 'missing' },
  { organizationId: '12001', drvId: '12001', type: 'club', name: 'Existing Club', websiteFromDrv: 'https://existing.example/', websiteStatus: 'present' },
  { organizationId: '30010', drvId: '30010', type: 'lrv', name: 'LRV', websiteFromDrv: '', websiteStatus: 'missing' }
];
const groundTruth = {
  '11005': { status: 'official', acceptedHosts: ['rudervereinesslingen.de'] },
  '11964': { status: 'none', acceptedHosts: [] },
  '12001': { status: 'official', acceptedHosts: ['must-not-overwrite.example'] }
};
const { organizations, report } = applyVerifiedDiscovery({
  registry,
  groundTruth,
  verifiedAt: '2026-08-10T00:00:00.000Z'
});
const esslingen = organizations.find((row) => row.organizationId === '11005');
assert.equal(esslingen.websiteFromDrv, 'https://rudervereinesslingen.de/');
assert.equal(esslingen.websiteStatus, 'present');
assert.equal(esslingen.websiteResolution.sourceType, VERIFIED_DISCOVERY_VERSION);
assert.equal(esslingen.websiteResolution.verifiedAt, '2026-08-10T00:00:00.000Z');
assert.deepEqual(esslingen.websiteResolution.acceptedHosts, ['rudervereinesslingen.de']);

const muelheim = organizations.find((row) => row.organizationId === '11964');
assert.equal(muelheim.websiteFromDrv, '');
assert.equal(muelheim.websiteStatus, 'missing');
assert.equal(muelheim.websiteResolution.status, 'none');

const existing = organizations.find((row) => row.organizationId === '12001');
assert.equal(existing.websiteFromDrv, 'https://existing.example/');
assert.equal(existing.websiteResolution, undefined);

const lrv = organizations.find((row) => row.organizationId === '30010');
assert.equal(lrv.websiteFromDrv, '');
assert.equal(lrv.websiteResolution, undefined);

assert.equal(report.appliedOfficialWebsites, 1);
assert.equal(report.retainedMissing, 1);
assert.equal(report.invalidGroundTruth, 0);
assert.equal(report.websitesPresentAfterResolution, 2);
assert.equal(report.websitesMissingAfterResolution, 1);

const publicRaw = JSON.stringify(report);
assert.equal(/@[a-z0-9.-]+/i.test(publicRaw), false);
console.log('verified discovery resolution tests passed');
