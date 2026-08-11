import assert from 'node:assert/strict';
import { buildPostalIndex, haversineKm, nearestClubs, resolveLocalLocation } from '../src/assets/nearest.js';

const entries = [
  { postalCode: '23909', places: ['Ratzeburg'], latitude: 53.699, longitude: 10.772 },
  { postalCode: '23552', places: ['Luebeck'], latitude: 53.869, longitude: 10.687 },
  { postalCode: '20095', places: ['Hamburg'], latitude: 53.550, longitude: 10.001 }
];
const index = buildPostalIndex(entries);
assert.equal(index.byPostalCode.size, 3);
assert.equal(resolveLocalLocation('23909', index)?.label, '23909 Ratzeburg');
assert.ok(resolveLocalLocation('Ratzeburg', index));
assert.ok(haversineKm(53.699, 10.772, 53.869, 10.687) > 15);

const clubs = [
  { id: 'rrc', name: 'RRC', type: 'club', postalCode: '23909' },
  { id: 'luebeck', name: 'Luebeck', type: 'club', postalCode: '23552' },
  { id: 'hamburg', name: 'Hamburg', type: 'club', postalCode: '20095' },
  { id: 'verband', name: 'Verband', type: 'lrv', postalCode: '23909' }
];
const origin = resolveLocalLocation('23909', index);
assert.deepEqual(nearestClubs(clubs, origin, index, { radiusKm: 100, limit: 5 }).map((club) => club.id), ['rrc', 'luebeck', 'hamburg']);
assert.deepEqual(nearestClubs(clubs, origin, index, { radiusKm: 10, limit: 5 }).map((club) => club.id), ['rrc']);
console.log('nearest-club tests passed');
