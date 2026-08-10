import assert from 'node:assert/strict';
import { buildPilotSample, PILOT_SAMPLER_VERSION } from './prepare-pilot-100.mjs';

const states = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen',
  'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz',
  'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
];

const registry = [];
const publicOrganizations = [];
let index = 0;
for (const state of states) {
  for (let i = 0; i < 10; i += 1) {
    index += 1;
    const organizationId = String(10000 + index);
    const stateValue = index <= 3 ? '' : state;
    const missing = index <= 20;
    const https = index > 20 && index <= 40;
    const website = missing ? '' : `${https ? 'https' : 'http'}://club-${organizationId}.example/`;
    const routeLevel = index <= 12 ? 'drv' : (index % 2 === 0 ? 'club' : 'lrv');
    registry.push({
      organizationId,
      drvId: organizationId,
      id: `club-${organizationId}`,
      name: `Ruderverein ${organizationId} e.V.`,
      type: 'club',
      postalCode: String(10000 + index),
      city: `Ort ${index}`,
      citySource: 'test',
      state: stateValue,
      states: stateValue ? [stateValue] : [],
      drvProfileUrl: `https://www.rudern.de/service/vereine/club-${organizationId}`,
      sourceUrl: `https://www.rudern.de/service/vereine/club-${organizationId}`,
      websiteFromDrv: website,
      websiteStatus: missing ? 'missing' : 'present',
      emailFromDrv: `private-${organizationId}@example.org`,
      parserVersion: 'test-parser',
      fetchedAt: '2026-08-10T00:00:00.000Z'
    });
    publicOrganizations.push({
      organizationId,
      id: `club-${organizationId}`,
      name: `Ruderverein ${organizationId} e.V.`,
      type: 'club',
      postalCode: String(10000 + index),
      city: `Ort ${index}`,
      state: stateValue,
      website,
      websiteStatus: missing ? 'missing' : 'present',
      profileUrl: `https://www.rudern.de/service/vereine/club-${organizationId}`,
      contactRouteLevel: routeLevel
    });
  }
}

const args = { registry, publicOrganizations, target: 100, seed: 'fixture-seed', stateFloor: 3, routeFloor: 30 };
const first = buildPilotSample(args);
const second = buildPilotSample(args);

assert.equal(PILOT_SAMPLER_VERSION, 'pilot-100/1.0.0');
assert.equal(first.report.selectionMode, 'dynamic-stratified');
assert.equal(first.sample.length, 100);
assert.equal(new Set(first.sample.map((row) => row.organizationId)).size, 100);
assert.deepEqual(first.sample.map((row) => row.organizationId), second.sample.map((row) => row.organizationId));
assert.equal(first.report.sampleHash, second.report.sampleHash);

const missingIds = new Set(registry.filter((row) => row.websiteStatus === 'missing').map((row) => row.organizationId));
const drvIds = new Set(publicOrganizations.filter((row) => row.contactRouteLevel === 'drv').map((row) => row.organizationId));
const noStateIds = new Set(registry.filter((row) => !row.state).map((row) => row.organizationId));
const httpsIds = new Set(registry.filter((row) => row.websiteFromDrv.startsWith('https://')).map((row) => row.organizationId));
const selectedIds = new Set(first.sample.map((row) => row.organizationId));
for (const id of [...missingIds, ...drvIds, ...noStateIds, ...httpsIds]) assert.ok(selectedIds.has(id), `mandatory pilot case missing: ${id}`);

const populationStateCounts = new Map();
for (const row of registry) if (row.state) populationStateCounts.set(row.state, (populationStateCounts.get(row.state) || 0) + 1);
const sampleStateCounts = new Map();
for (const row of first.sample) if (row.state) sampleStateCounts.set(row.state, (sampleStateCounts.get(row.state) || 0) + 1);
for (const [state, population] of populationStateCounts) {
  assert.ok((sampleStateCounts.get(state) || 0) >= Math.min(3, population), `state floor not met: ${state}`);
}

assert.ok((first.report.routeCounts.club || 0) >= 30);
assert.ok((first.report.routeCounts.lrv || 0) >= 30);
assert.equal(first.report.mandatoryIncluded.websiteMissing, first.report.mandatoryPopulation.websiteMissing);
assert.equal(first.report.mandatoryIncluded.drvFallback, first.report.mandatoryPopulation.drvFallback);
assert.equal(first.report.mandatoryIncluded.stateMissing, first.report.mandatoryPopulation.stateMissing);
assert.equal(first.report.mandatoryIncluded.https, first.report.mandatoryPopulation.https);

const frozenIds = registry.slice(0, 100).map((row) => row.organizationId).reverse();
const frozen = buildPilotSample({ ...args, frozenIds });
assert.equal(frozen.report.selectionMode, 'frozen-ids');
assert.deepEqual(frozen.sample.map((row) => row.organizationId), frozenIds);
assert.ok(frozen.sample.every((row) => row.inclusionReasons.includes('frozen-cohort:v1')));

const refreshedOrganizations = publicOrganizations.map((row) => ({ ...row }));
const refreshedId = frozenIds[0];
const refreshedSnapshot = refreshedOrganizations.find((row) => row.organizationId === refreshedId);
refreshedSnapshot.contactRouteLevel = 'drv';
refreshedSnapshot.website = 'https://fresh-metadata.example/';
const refreshedFrozen = buildPilotSample({ ...args, publicOrganizations: refreshedOrganizations, frozenIds });
assert.equal(refreshedFrozen.report.sampleHash, frozen.report.sampleHash);
assert.deepEqual(refreshedFrozen.sample.map((row) => row.organizationId), frozenIds);
assert.equal(refreshedFrozen.sample.find((row) => row.organizationId === refreshedId).routeLevel, 'drv');
assert.equal(refreshedFrozen.sample.find((row) => row.organizationId === refreshedId).website, 'https://fresh-metadata.example/');

assert.throws(
  () => buildPilotSample({ ...args, frozenIds: [...frozenIds.slice(0, 99), frozenIds[0]] }),
  /duplicate organization IDs/
);
assert.throws(
  () => buildPilotSample({ ...args, frozenIds: [...frozenIds.slice(0, 99), '99999'] }),
  /missing from current registry/
);

const publicJson = JSON.stringify({ sample: first.sample, report: first.report, frozen: frozen.sample, frozenReport: frozen.report });
assert.equal(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(publicJson), false);
assert.equal(publicJson.includes('emailFromDrv'), false);
assert.equal(publicJson.includes('private-'), false);

console.log('100-club pilot sampler tests passed');
