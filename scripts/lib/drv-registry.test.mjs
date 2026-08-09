import assert from 'node:assert/strict';
import {
  discoveryRecordFromRegistry,
  isApprovedRegistryDirectContact,
  parseDrvRegistryProfile,
  publicOrganizationFromRegistry
} from './drv-registry.mjs';

const postalStates = new Map([
  ['23909', { state: 'Schleswig-Holstein', places: ['Ratzeburg'] }],
  ['30169', { state: 'Niedersachsen', places: ['Hannover'] }]
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
assert.equal(club.state, 'Schleswig-Holstein');
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
assert.equal(isApprovedRegistryDirectContact(missing), false);

const lrvHtml = `
<html><body>
<nav><a href="https://www.ruder-bundesliga.de/">Ruder-Bundesliga</a></nav>
<h1>Landesruderverband Niedersachsen e.V.</h1>
<div>DRV-ID 30018</div>
<section>Anschrift Maschstraße 20 Hannover 30169</section>
<div class="field field--website"><span>Website</span><a href="https://www.lrvn.de/">https://www.lrvn.de/</a></div>
<div class="field field--email"><span>E-Mail</span><a href="mailto:geschaeftsstelle@lrvn.de">geschaeftsstelle@lrvn.de</a></div>
</body></html>`;
const lrv = parseDrvRegistryProfile(
  'https://www.rudern.de/service/vereine/landesruderverband-niedersachsen',
  lrvHtml,
  postalStates,
  '2026-08-10T00:00:00.000Z'
);
assert.equal(lrv.type, 'lrv');
assert.equal(lrv.state, 'Niedersachsen');
assert.equal(lrv.websiteFromDrv, 'https://www.lrvn.de/');
assert.equal(isApprovedRegistryDirectContact(lrv), true);

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
