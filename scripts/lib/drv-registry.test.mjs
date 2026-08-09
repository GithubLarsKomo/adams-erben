import assert from 'node:assert/strict';
import {
  LRV_PROFILES,
  discoveryRecordFromRegistry,
  isApprovedRegistryDirectContact,
  parseDrvRegistryProfile,
  publicOrganizationFromRegistry,
  resolvePostalCity
} from './drv-registry.mjs';

assert.equal(LRV_PROFILES.length, 15);
assert.deepEqual(
  LRV_PROFILES.find((item) => item.drvId === '30020')?.states,
  ['Rheinland-Pfalz', 'Saarland']
);
assert.equal(LRV_PROFILES.some((item) => item.drvId === '30021'), false);

assert.deepEqual(
  resolvePostalCity('Erlanger Wanderrudergesellschaft Franken e.V. Erlangen', { places: ['Erlangen', 'Frauenaurach'] }),
  { city: 'Erlangen', citySource: 'drv-text+geonames-postcode' }
);
assert.deepEqual(
  resolvePostalCity('Bootshaus Seeweg-Süd Dießen am Ammersee', { places: ['Dießen', 'Dießen am Ammersee'] }),
  { city: 'Dießen am Ammersee', citySource: 'drv-text+geonames-postcode' }
);
assert.deepEqual(
  resolvePostalCity('B.R.C. Hevella e.V. Berlin', { places: ['Berlin'] }),
  { city: 'Berlin', citySource: 'drv-text+geonames-postcode' }
);
assert.deepEqual(
  resolvePostalCity('Bootshaus Bäkepromenade Stahnsdorf', { places: ['Kleinmachnow', 'Stahnsdorf'] }),
  { city: 'Stahnsdorf', citySource: 'drv-text+geonames-postcode' }
);
assert.deepEqual(
  resolvePostalCity('Abt. Rudern Leipzig', { places: ['Leipzig'] }),
  { city: 'Leipzig', citySource: 'drv-text+geonames-postcode' }
);
assert.deepEqual(
  resolvePostalCity('Enderndorf', { places: ['Spalt'] }),
  { city: 'Enderndorf', citySource: 'drv-text' }
);
assert.deepEqual(
  resolvePostalCity('Bootshaus Uferweg Köln', { places: ['Köln'] }),
  { city: 'Köln', citySource: 'drv-text+geonames-postcode' }
);
assert.deepEqual(
  resolvePostalCity('Bootshaus Uferweg Musterort', { places: ['Köln'] }),
  { city: 'Köln', citySource: 'geonames-postcode' }
);

const postalStates = new Map([
  ['23909', { state: 'Schleswig-Holstein', places: ['Ratzeburg'] }],
  ['30169', { state: 'Niedersachsen', places: ['Hannover'] }],
  ['55130', { state: 'Rheinland-Pfalz', places: ['Mainz'] }],
  ['91174', { state: 'Bayern', places: ['Spalt'] }],
  ['04178', { state: 'Sachsen', places: ['Burghausen'] }]
]);

const clubHtml = `
<html><body>
<nav><a href="https://www.ruder-bundesliga.de/">STÜBBE Ruder-Bundesliga</a></nav>
<h1>Ratzeburger Ruderclub e.V.</h1>
<div>DRV-ID 12420</div>
<section>Anschrift Dr.-Alfred-Block-Allee 5 Ratzeburg 23909</section>
<div class="field field--website"><span>Website</span><a href="http://www.rrc-online.de">http://www.rrc-online.de</a></div>
<div class="field field--email"><span>E-Mail</span><a href="mailto:info@rrc-online.de">info@rrc-online.de</a></div>
<footer><a href="https://www.rudersport-magazin.de/">Rudersport Magazin</a></footer>
</body></html>`;

const club = parseDrvRegistryProfile(
  'https://www.rudern.de/service/vereine/ratzeburger-ruderclub-ev',
  clubHtml,
  postalStates,
  '2026-08-10T00:00:00.000Z'
);

assert.equal(club.organizationId, '12420');
assert.equal(club.id, 'ratzeburger-ruderclub-ev');
assert.equal(club.type, 'club');
assert.equal(club.city, 'Ratzeburg');
assert.equal(club.citySource, 'drv-text+geonames-postcode');
assert.equal(club.state, 'Schleswig-Holstein');
assert.deepEqual(club.states, ['Schleswig-Holstein']);
assert.equal(club.websiteFromDrv, 'http://www.rrc-online.de/');
assert.equal(club.websiteStatus, 'present');
assert.equal(club.emailFromDrv, 'info@rrc-online.de');
assert.equal(club.featured, true);
assert.equal(club.sourceType, 'drv-profile');
assert.equal(club.sourceUrl, 'https://www.rudern.de/service/vereine/ratzeburger-ruderclub-ev');
assert.match(club.parserVersion, /^\d+\.\d+\.\d+$/);
assert.equal(isApprovedRegistryDirectContact(club), true);

const publicClub = publicOrganizationFromRegistry(club, 'club', true);
assert.equal(publicClub.id, 'ratzeburger-ruderclub-ev');
assert.equal(publicClub.organizationId, '12420');
assert.equal(publicClub.hasDirectContact, true);
assert.equal(publicClub.contactRouteLevel, 'club');
assert.equal('emailFromDrv' in publicClub, false);

const discoveryClub = discoveryRecordFromRegistry(club);
assert.equal(discoveryClub.organizationId, '12420');
assert.equal(discoveryClub.type, 'club');
assert.equal(discoveryClub.citySource, 'drv-text+geonames-postcode');
assert.equal('emailFromDrv' in discoveryClub, false);

const missingHtml = `
<html><body>
<nav><a href="https://www.ruder-bundesliga.de/">Ruder-Bundesliga</a></nav>
<h1>Beispiel Ruderverein e.V.</h1>
<div>DRV-ID 19999</div>
<section>Anschrift Uferweg 1 Musterstadt 30169</section>
<a href="https://www.instagram.com/beispiel">Instagram</a>
</body></html>`;
const missing = parseDrvRegistryProfile(
  'https://www.rudern.de/service/vereine/beispiel-ruderverein-ev',
  missingHtml,
  postalStates,
  '2026-08-10T00:00:00.000Z'
);
assert.equal(missing.websiteFromDrv, '');
assert.equal(missing.websiteStatus, 'missing');
assert.equal(missing.organizationId, '19999');
assert.equal(missing.city, 'Hannover');
assert.equal(missing.citySource, 'geonames-postcode');
assert.equal(isApprovedRegistryDirectContact(missing), false);

// Real DRV pages render address lines as separate nodes. Preserve a locality even
// if GeoNames only exposes the municipality for that postcode.
const enderndorfHtml = `
<html><body>
<h1>Ruderverein Brombachsee e.V.</h1><div>DRV-ID 11150</div>
<h2>Bootshaus</h2><div><div>Am Segelhafen 1</div><div>Enderndorf 91174</div></div>
<h2>Vereine in der Umgebung</h2>
</body></html>`;
const enderndorf = parseDrvRegistryProfile(
  'https://www.rudern.de/service/vereine/ruderverein-brombachsee-ev',
  enderndorfHtml,
  postalStates,
  '2026-08-10T00:00:00.000Z'
);
assert.equal(enderndorf.city, 'Enderndorf');
assert.equal(enderndorf.citySource, 'drv-text');
assert.equal(enderndorf.postalCode, '91174');

const leipzigHtml = `
<html><body>
<h1>SC DHfK Leipzig e.V., Abteilung Rudern</h1><div>DRV-ID 12211</div>
<h2>Anschrift</h2><div><div>Am Elsterwehr 1</div><div>SC DHfK Leipzig, Abt. Rudern</div><div>Leipzig 04178</div></div>
<h2>Vereine in der Umgebung</h2>
</body></html>`;
const leipzig = parseDrvRegistryProfile(
  'https://www.rudern.de/service/vereine/sc-dhfk-leipzig-ev-abteilung-rudern',
  leipzigHtml,
  postalStates,
  '2026-08-10T00:00:00.000Z'
);
assert.equal(leipzig.city, 'Leipzig');
assert.equal(leipzig.citySource, 'drv-text');
assert.equal(leipzig.postalCode, '04178');

const lrvHtml = `
<html><body>
<nav><a href="https://www.ruder-bundesliga.de/">Ruder-Bundesliga</a></nav>
<h1>Landesruderverband Niedersachsen</h1>
<div>DRV-ID 30018</div>
<section>Anschrift Rakampshöhe 6 b Deutsch Evern 21407</section>
<div class="field field--email"><span>E-Mail</span><a href="mailto:info@lrvn.de">info@lrvn.de</a></div>
</body></html>`;
const lrv = parseDrvRegistryProfile(
  'https://www.rudern.de/service/vereine/landesruderverband-niedersachsen',
  lrvHtml,
  postalStates,
  '2026-08-10T00:00:00.000Z'
);
assert.equal(lrv.type, 'lrv');
assert.equal(lrv.state, 'Niedersachsen');
assert.deepEqual(lrv.states, ['Niedersachsen']);
assert.equal(lrv.sourceType, 'drv-lrv-profile');

const suedwestHtml = `
<html><body>
<h1>Ruderverband Südwest e.V.</h1>
<div>DRV-ID 30020</div>
<section>Anschrift Am Edelmann 25 Mainz 55130</section>
<div class="field field--website"><span>Website</span><a href="https://www.ruderverband-suedwest.de/">Website</a></div>
<div class="field field--email"><span>E-Mail</span><a href="mailto:geschaeftsstelle@ruderverband-suedwest.de">E-Mail</a></div>
</body></html>`;
const suedwest = parseDrvRegistryProfile(
  'https://www.rudern.de/service/vereine/ruderverband-suedwest-ev',
  suedwestHtml,
  postalStates,
  '2026-08-10T00:00:00.000Z'
);
assert.equal(suedwest.type, 'lrv');
assert.equal(suedwest.state, 'Rheinland-Pfalz / Saarland');
assert.deepEqual(suedwest.states, ['Rheinland-Pfalz', 'Saarland']);
assert.equal(suedwest.city, 'Mainz');
assert.equal(isApprovedRegistryDirectContact(suedwest), true);

assert.equal(isApprovedRegistryDirectContact({
  emailFromDrv: 'info@gmail.com',
  websiteFromDrv: 'https://www.beispiel-ruderverein.de/'
}), false);

assert.equal(isApprovedRegistryDirectContact({
  emailFromDrv: 'vorsitzender@t-online.de',
  websiteFromDrv: 'https://www.beispiel-ruderverein.de/'
}), true);

assert.equal(isApprovedRegistryDirectContact({
  emailFromDrv: 'max.mustermann@beispiel-ruderverein.de',
  websiteFromDrv: 'https://www.beispiel-ruderverein.de/'
}), false);

console.log('DRV registry parser tests passed');
