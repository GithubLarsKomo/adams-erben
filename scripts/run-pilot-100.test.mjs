import assert from 'node:assert/strict';
import {
  PILOT_RUNNER_VERSION,
  extractContactsFromHtml,
  parseRobots,
  relatedHost,
  robotsAllowsPath,
  scoreWebsiteIdentity,
  summarizePilotRun
} from './run-pilot-100.mjs';
import { evaluateSnapshotEligibility } from './lib/contact-governance.mjs';

assert.equal(PILOT_RUNNER_VERSION, 'pilot-100-run/1.0.0');
assert.equal(relatedHost('www.rrc-online.de', 'rrc-online.de'), true);
assert.equal(relatedHost('club.example', 'other.example'), false);

const rules = parseRobots(`
User-agent: *
Disallow: /intern
Disallow: /private
Allow: /private/kontakt
`);
assert.equal(robotsAllowsPath(rules, '/'), true);
assert.equal(robotsAllowsPath(rules, '/intern'), false);
assert.equal(robotsAllowsPath(rules, '/private/foo'), false);
assert.equal(robotsAllowsPath(rules, '/private/kontakt'), true);

const org = {
  name: 'Ratzeburger Ruderclub e.V.',
  city: 'Ratzeburg',
  postalCode: '23909'
};
const identityHtml = `<html><body><h1>Ratzeburger Ruderclub</h1><p>Dr.-Alfred-Block-Allee, 23909 Ratzeburg</p></body></html>`;
assert.ok(scoreWebsiteIdentity(org, identityHtml, 'https://www.rrc-online.de/') >= 0.45);

const verifiedAt = '2026-08-10T00:00:00.000Z';
const contacts = extractContactsFromHtml(`
<html><body>
  <p>Geschäftsstelle: <a href="mailto:info@club.example">E-Mail</a></p>
  <p>Ruderwart Max Mustermann: max.mustermann@club.example</p>
  <p>Alternative: kontakt [at] club.example</p>
</body></html>`, 'https://club.example/kontakt', verifiedAt);
assert.equal(contacts.length, 3);

const evaluated = contacts.map((contact) => evaluateSnapshotEligibility(contact, 'https://club.example/', {
  verifiedAt,
  now: new Date('2026-08-10T01:00:00.000Z')
}));
assert.ok(evaluated.some((item) => item.email === 'info@club.example' && item.snapshotEligible));
assert.ok(evaluated.some((item) => item.email === 'kontakt@club.example' && item.snapshotEligible));
assert.ok(evaluated.some((item) => item.email === 'max.mustermann@club.example' && !item.snapshotEligible));

const rows = [
  {
    websiteStatus: 'present', status: 'processed', websiteReachable: true, contactOutcome: 'auto_direct',
    baseRouteLevel: 'lrv', proposedRouteLevel: 'club', pagesFetched: 4, pagesAttempted: 5, errorCode: ''
  },
  {
    websiteStatus: 'present', status: 'robots_blocked', websiteReachable: false, contactOutcome: 'fallback',
    baseRouteLevel: 'club', proposedRouteLevel: 'club', pagesFetched: 0, pagesAttempted: 0, errorCode: 'robots_blocked'
  },
  {
    websiteStatus: 'missing', status: 'discovery_pending_provider', websiteReachable: false, contactOutcome: 'discovery_pending_provider',
    baseRouteLevel: 'drv', proposedRouteLevel: 'drv', pagesFetched: 0, pagesAttempted: 0, errorCode: ''
  }
];
const report = summarizePilotRun(rows, '2026-08-10T00:00:00.000Z', '2026-08-10T00:00:10.000Z');
assert.equal(report.total, 3);
assert.equal(report.knownWebsite, 2);
assert.equal(report.discoveryPending, 1);
assert.equal(report.directUpgrades, 1);
assert.equal(report.maxPagesFetched, 4);
assert.equal(report.maxPagesAttempted, 5);
assert.equal(report.routeBefore.lrv, 1);
assert.equal(report.routeAfter.club, 2);

const publicJson = JSON.stringify(report);
assert.equal(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(publicJson), false);

console.log('bounded 100-club pilot runner tests passed');
