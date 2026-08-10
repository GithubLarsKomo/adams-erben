import assert from 'node:assert/strict';
import { parseDrvRegistryProfile } from './drv-registry.mjs';

const postalStates = new Map([
  ['31675', { state: 'Niedersachsen', places: ['Bückeburg'] }]
]);

const schoolHtml = `
<html><body>
<h1>Ruderriege "Schaumburgia" am Adolfinum Bückeburg</h1>
<div>DRV-ID 15818</div>
<h2>Anschrift</h2><div><div>Ulmenallee 1</div><div>Bückeburg 31675</div></div>
</body></html>`;

const school = parseDrvRegistryProfile(
  'https://www.rudern.de/service/vereine/ruderriege-schaumburgia-am-adolfinum-bueckeburg',
  schoolHtml,
  postalStates,
  '2026-08-10T00:00:00.000Z'
);
assert.equal(school.drvId, '15818');
assert.equal(school.type, 'member');
assert.equal(school.city, 'Bückeburg');

const clubHtml = `
<html><body>
<h1>Ruderriege Schaumburgia Bückeburg e.V.</h1>
<div>DRV-ID 11862</div>
<h2>Anschrift</h2><div><div>Am Bootshaus 1</div><div>Bückeburg 31675</div></div>
</body></html>`;

const club = parseDrvRegistryProfile(
  'https://www.rudern.de/service/vereine/ruderriege-schaumburgia-bueckeburg-ev',
  clubHtml,
  postalStates,
  '2026-08-10T00:00:00.000Z'
);
assert.equal(club.drvId, '11862');
assert.equal(club.type, 'club');

console.log('DRV school-rowing classification tests passed');
