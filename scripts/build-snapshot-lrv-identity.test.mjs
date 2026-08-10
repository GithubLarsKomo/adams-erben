import assert from 'node:assert/strict';
import { buildSnapshot } from './build-snapshot.mjs';

const now = new Date('2026-08-10T00:00:00.000Z');

function record({ drvId, id, name, type = 'club', state = '', states = [], websiteFromDrv = '', emailFromDrv = '' }) {
  return {
    organizationId: drvId,
    id,
    drvId,
    name,
    type,
    city: 'Musterstadt',
    citySource: 'test',
    postalCode: '12345',
    state,
    states,
    drvProfileUrl: `https://www.rudern.de/service/vereine/${id}`,
    websiteFromDrv,
    websiteStatus: websiteFromDrv ? 'present' : 'missing',
    emailFromDrv,
    featured: false,
    fetchedAt: '2026-08-01T00:00:00.000Z',
    sourceType: type === 'lrv' ? 'drv-lrv-profile' : 'drv-profile',
    sourceUrl: `https://www.rudern.de/service/vereine/${id}`,
    parserVersion: 'test'
  };
}

const registry = [
  record({
    drvId: '30010', id: 'lrv-bw', name: 'Landesruderverband Baden-Württemberg e.V.', type: 'lrv',
    state: 'Baden-Württemberg', states: ['Baden-Württemberg'], emailFromDrv: 'info@rudern-bw.de'
  }),
  record({
    drvId: '30011', id: 'lrv-bayern', name: 'Bayerischer Ruderverband e.V.', type: 'lrv',
    state: 'Bayern', states: ['Bayern'], websiteFromDrv: 'https://www.ruderverband.de/',
    emailFromDrv: 'brv-geschaeftsstelle@ruderverband.de'
  }),
  record({
    drvId: '30018', id: 'lrv-niedersachsen', name: 'Landesruderverband Niedersachsen', type: 'lrv',
    state: 'Niedersachsen', states: ['Niedersachsen'], emailFromDrv: 'info@lrvn.de'
  }),
  record({
    drvId: '30019', id: 'lrv-nrw', name: 'Nordrhein-Westfälischer Ruderverband', type: 'lrv',
    state: 'Nordrhein-Westfalen', states: ['Nordrhein-Westfalen'], websiteFromDrv: 'https://www.rudern.nrw/',
    emailFromDrv: 'mail@nwrv.org'
  }),
  record({ drvId: '10010', id: 'club-bw', name: 'Club BW', state: 'Baden-Württemberg', states: ['Baden-Württemberg'] }),
  record({ drvId: '10011', id: 'club-bayern', name: 'Club Bayern', state: 'Bayern', states: ['Bayern'] }),
  record({ drvId: '10018', id: 'club-ni', name: 'Club Niedersachsen', state: 'Niedersachsen', states: ['Niedersachsen'] }),
  record({ drvId: '10019', id: 'club-nrw', name: 'Club NRW', state: 'Nordrhein-Westfalen', states: ['Nordrhein-Westfalen'] })
];

const result = buildSnapshot({ registry, now });

for (const id of ['lrv-bw', 'lrv-bayern', 'lrv-niedersachsen', 'lrv-nrw']) {
  assert.equal(result.recipients[id].routeLevel, 'lrv', `${id} should be a direct LRV route`);
}
for (const id of ['club-bw', 'club-bayern', 'club-ni', 'club-nrw']) {
  assert.equal(result.recipients[id].routeLevel, 'lrv', `${id} should fall back to its LRV`);
}

assert.equal(result.report.lrvIdentityHintsApplied, 4);
assert.equal(result.report.directApproved, 4);
assert.equal(result.report.routeCounts.lrv, 8);
assert.equal(result.report.routeCounts.drv, 0);

const bwPublic = result.organizations.find((item) => item.organizationId === '30010');
const niPublic = result.organizations.find((item) => item.organizationId === '30018');
assert.equal(bwPublic.website, 'https://www.lrvbw.de/');
assert.equal(niPublic.website, 'https://www.lrvn.de/');

const publicJson = JSON.stringify(result.organizations);
assert.equal(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(publicJson), false);

console.log('LRV identity snapshot tests passed');
