import assert from 'node:assert/strict';
import { extractLaenderratCandidates, LAENDERRAT_URL } from './enrich-lrv-laenderrat.mjs';

const lrvs = [
  {
    organizationId: '30023', drvId: '30023', id: 'ruderverband-sachsen-anhalt',
    name: 'Ruderverband Sachsen-Anhalt', type: 'lrv', state: 'Sachsen-Anhalt', states: ['Sachsen-Anhalt'],
    websiteFromDrv: 'https://www.rusa.de/'
  },
  {
    organizationId: '30019', drvId: '30019', id: 'nordrhein-westfaelischer-ruderverband',
    name: 'Nordrhein-Westfälischer Ruderverband', type: 'lrv', state: 'Nordrhein-Westfalen', states: ['Nordrhein-Westfalen'],
    websiteFromDrv: 'https://www.rudern.nrw/'
  },
  {
    organizationId: '30011', drvId: '30011', id: 'bayerischer-ruderverband',
    name: 'Bayerischer Ruderverband e.V.', type: 'lrv', state: 'Bayern', states: ['Bayern'],
    websiteFromDrv: 'https://www.ruderverband.de/'
  }
];

const html = `
<html><body>
  <main>
    <!-- Deliberately ambiguous DOM container: the role address must resolve by the
         unique verified rusa.de organization domain, not by guessing nearby text. -->
    <section class="shared-layout">
      <p>Ruderverband Sachsen-Anhalt</p>
      <p>Landesruderverband Nordrhein-Westfalen</p>
      <div class="mail-only"><a href="mailto:praesident@rusa.de">Kontakt</a></div>
    </section>
    <section class="person-card">
      <h3>Wilhelm Hummels</h3>
      <p>Landesruderverband Nordrhein-Westfalen</p>
      <a href="mailto:wilhelm.hummels@nwrv.org">Kontakt</a>
    </section>
    <section class="person-card">
      <h3>Gerd Bock</h3>
      <p>Landesruderverband Bayern</p>
      <a href="mailto:brv-praesident@ruderverband.de">Kontakt</a>
    </section>
    <section class="ambiguous-card">
      <p>Landesruderverband Bayern und Landesruderverband Nordrhein-Westfalen</p>
      <a href="mailto:info@example.invalid">nicht eindeutig</a>
    </section>
  </main>
</body></html>`;

const candidates = extractLaenderratCandidates(html, lrvs, '2026-08-10T00:00:00.000Z');
assert.equal(candidates.length, 3);

const rusa = candidates.find((item) => item.organizationId === '30023');
assert.ok(rusa);
assert.equal(rusa.sourceUrl, LAENDERRAT_URL);
assert.equal(rusa.sourceType, 'drv-laenderrat');
assert.equal(rusa.resolutionMethod, 'verified-domain');
assert.equal(rusa.contactKind, 'role-functional');
assert.equal(rusa.autoApproved, true);
assert.equal(rusa.reason, 'role_alias_on_club_domain');

const nrw = candidates.find((item) => item.organizationId === '30019');
assert.ok(nrw);
assert.equal(nrw.resolutionMethod, 'dom-context');
assert.equal(nrw.contactKind, 'personal');
assert.equal(nrw.autoApproved, false);
assert.equal(nrw.governanceState, 'review-personal');

const bayern = candidates.find((item) => item.organizationId === '30011');
assert.ok(bayern);
// A prefixed role mailbox is not globally broadened; Bayern is already handled
// by its separately verified identity hint for the registry functional address.
assert.equal(bayern.autoApproved, false);

assert.equal(candidates.some((item) => item.email === 'info@example.invalid'), false);
console.log('DRV Länderrat LRV enrichment tests passed');
