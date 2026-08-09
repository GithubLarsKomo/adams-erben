import assert from 'node:assert/strict';
import { chooseMissingWebsiteSample } from './prepare-discovery-poc.mjs';

const states = ['Bayern', 'Berlin', 'Hamburg', 'Hessen', 'Niedersachsen', 'Schleswig-Holstein'];
const items = [];
for (const [stateIndex, state] of states.entries()) {
  for (let i = 0; i < 6; i += 1) {
    items.push({
      organizationId: `${stateIndex + 1}${String(i).padStart(2, '0')}`,
      drvId: `${stateIndex + 1}${String(i).padStart(2, '0')}`,
      name: `Testverein ${state} ${i}`,
      type: 'club',
      postalCode: '12345',
      city: `Ort ${state}`,
      state,
      drvProfileUrl: `https://www.rudern.de/service/vereine/test-${stateIndex}-${i}`,
      websiteFromDrv: '',
      websiteStatus: 'missing'
    });
  }
}

items.push({
  organizationId: 'with-site',
  name: 'Verein mit Website',
  type: 'club',
  state: 'Bayern',
  websiteFromDrv: 'https://example.org/',
  websiteStatus: 'present'
});
items.push({
  organizationId: 'lrv',
  name: 'Landesverband',
  type: 'lrv',
  state: 'Bayern',
  websiteFromDrv: '',
  websiteStatus: 'missing'
});

const selected = chooseMissingWebsiteSample(items, { target: 25, minStates: 5, maxPerState: 5 });
assert.equal(selected.length, 25);
assert.ok(new Set(selected.map((item) => item.state)).size >= 5);
for (const state of states) {
  assert.ok(selected.filter((item) => item.state === state).length <= 5);
}
assert.ok(selected.every((item) => item.type === 'club'));
assert.ok(selected.every((item) => !item.websiteFromDrv));
assert.ok(!selected.some((item) => item.organizationId === 'with-site'));
assert.ok(!selected.some((item) => item.organizationId === 'lrv'));

assert.throws(
  () => chooseMissingWebsiteSample(items.slice(0, 4), { target: 5, minStates: 5, maxPerState: 5 }),
  /Could only select/
);

console.log('Discovery sample stratification tests passed');
