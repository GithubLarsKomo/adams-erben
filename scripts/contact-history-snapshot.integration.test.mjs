import assert from 'node:assert/strict';
import { buildContactHistoryArtifacts } from './merge-contact-candidate-history.mjs';
import { buildSnapshot } from './build-snapshot.mjs';
import { suppressionIdentifier } from './lib/contact-governance.mjs';

const previousVerifiedAt = '2026-08-05T12:00:00.000Z';
const clubEmail = 'kontakt@moellner-rc.example';
const clubWebsite = 'https://moellner-rc.example/';

const registry = [
  {
    organizationId: '30022',
    id: 'lrv-sh',
    drvId: '30022',
    name: 'Ruderverband Schleswig-Holstein e.V.',
    type: 'lrv',
    city: 'Ratzeburg',
    citySource: 'test',
    postalCode: '23909',
    state: 'Schleswig-Holstein',
    states: ['Schleswig-Holstein'],
    drvProfileUrl: 'https://www.rudern.de/service/vereine/lrv-sh',
    websiteFromDrv: 'https://rudern-sh.de/',
    websiteStatus: 'present',
    emailFromDrv: 'info@rudern-sh.de',
    featured: false,
    fetchedAt: '2026-08-10T00:00:00.000Z',
    sourceType: 'drv-lrv-profile',
    sourceUrl: 'https://www.rudern.de/service/vereine/lrv-sh',
    parserVersion: 'test'
  },
  {
    organizationId: '12417',
    id: 'moellner-ruder-club-ev',
    drvId: '12417',
    name: 'Möllner Ruder-Club e.V.',
    type: 'club',
    city: 'Mölln',
    citySource: 'test',
    postalCode: '23879',
    state: 'Schleswig-Holstein',
    states: ['Schleswig-Holstein'],
    drvProfileUrl: 'https://www.rudern.de/service/vereine/moellner-ruder-club-ev',
    websiteFromDrv: clubWebsite,
    websiteStatus: 'present',
    emailFromDrv: '',
    featured: false,
    fetchedAt: '2026-08-10T00:00:00.000Z',
    sourceType: 'drv-profile',
    sourceUrl: 'https://www.rudern.de/service/vereine/moellner-ruder-club-ev',
    parserVersion: 'test'
  }
];

const previousContacts = [{
  organizationId: '12417',
  email: clubEmail,
  website: clubWebsite,
  sourceType: 'club-website',
  sourceUrl: `${clubWebsite}kontakt`,
  verifiedAt: previousVerifiedAt,
  context: 'Kontakt Geschäftsstelle'
}];

const replay = buildContactHistoryArtifacts({
  previousContacts,
  currentContacts: [],
  acquisitionResults: [{ organizationId: '12417', status: 'robots_unavailable' }],
  attemptedAt: '2026-08-10T05:00:00.000Z'
});

assert.equal(replay.report.carryForwardOrganizations, 1);
assert.equal(replay.report.carryForwardContacts, 1);
assert.deepEqual(replay.report.organizations, [{
  organizationId: '12417',
  acquisitionStatus: 'robots_unavailable',
  carriedContactCount: 1
}]);
assert.equal(replay.privatePayload.contacts[0].verifiedAt, previousVerifiedAt);
assert.equal(replay.privatePayload.contacts[0].carryForward, true);

const freshSnapshot = buildSnapshot({
  registry,
  externalCandidates: replay.privatePayload.contacts,
  now: new Date('2026-08-10T06:00:00.000Z')
});
assert.equal(freshSnapshot.recipients['moellner-ruder-club-ev'].routeLevel, 'club');
assert.equal(freshSnapshot.recipients['moellner-ruder-club-ev'].verifiedAt, previousVerifiedAt);
assert.equal(freshSnapshot.recipients['moellner-ruder-club-ev'].email, clubEmail);

// Carry-forward does not reset the lifecycle clock. Once the original club
// verification is >=270 days old, it must stop routing Direct. The LRV remains
// independently contactable, but must never become a fallback for this club.
const expiryRegistry = registry.map((row) => row.type === 'lrv'
  ? { ...row, fetchedAt: '2027-05-10T00:00:00.000Z' }
  : row);
const expiredSnapshot = buildSnapshot({
  registry: expiryRegistry,
  externalCandidates: replay.privatePayload.contacts,
  now: new Date('2027-05-10T12:00:00.000Z')
});
assert.equal(expiredSnapshot.recipients['moellner-ruder-club-ev'], undefined);
assert.equal(expiredSnapshot.decisions.find((row) => row.organizationId === '12417').routeLevel, 'none');
assert.equal(expiredSnapshot.decisions.find((row) => row.organizationId === '12417').staleCandidateCount, 1);

// Suppression remains authoritative even when a technical error would otherwise
// preserve a Last-known-good candidate. It removes the route instead of falling
// back to the LRV.
const suppressionSecret = 'history-replay-secret';
const suppressedSnapshot = buildSnapshot({
  registry,
  externalCandidates: replay.privatePayload.contacts,
  suppressionHashes: new Set([suppressionIdentifier(clubEmail, suppressionSecret)]),
  suppressionSecret,
  now: new Date('2026-08-10T06:00:00.000Z')
});
assert.equal(suppressedSnapshot.recipients['moellner-ruder-club-ev'], undefined);
assert.equal(suppressedSnapshot.decisions.find((row) => row.organizationId === '12417').routeLevel, 'none');
assert.equal(suppressedSnapshot.decisions.find((row) => row.organizationId === '12417').suppressedCandidateCount, 1);

// A successful crawl with no contact is a new observation and must remove the
// previous candidate from the current candidate set. No replacement recipient
// is generated.
const noContact = buildContactHistoryArtifacts({
  previousContacts,
  currentContacts: [],
  acquisitionResults: [{ organizationId: '12417', status: 'processed' }],
  attemptedAt: '2026-08-10T05:00:00.000Z'
});
assert.equal(noContact.privatePayload.contacts.length, 0);
const noContactSnapshot = buildSnapshot({ registry, externalCandidates: noContact.privatePayload.contacts, now: new Date('2026-08-10T06:00:00.000Z') });
assert.equal(noContactSnapshot.recipients['moellner-ruder-club-ev'], undefined);
assert.equal(noContactSnapshot.decisions.find((row) => row.organizationId === '12417').routeLevel, 'none');

// Identity review is a semantic safety signal, not a technical outage.
const identityReview = buildContactHistoryArtifacts({
  previousContacts,
  currentContacts: [],
  acquisitionResults: [{ organizationId: '12417', status: 'identity_review' }],
  attemptedAt: '2026-08-10T05:00:00.000Z'
});
assert.equal(identityReview.privatePayload.contacts.length, 0);

// A fresh candidate deterministically replaces the old one and gets its own
// current verification timestamp.
const replacementEmail = 'info@moellner-rc.example';
const freshCandidate = {
  organizationId: '12417',
  email: replacementEmail,
  website: clubWebsite,
  sourceType: 'club-website',
  sourceUrl: `${clubWebsite}kontakt-neu`,
  verifiedAt: '2026-08-10T05:00:00.000Z',
  context: 'Kontakt'
};
const replacement = buildContactHistoryArtifacts({
  previousContacts,
  currentContacts: [freshCandidate],
  acquisitionResults: [{ organizationId: '12417', status: 'processed' }],
  attemptedAt: '2026-08-10T05:01:00.000Z'
});
assert.equal(replacement.privatePayload.contacts.length, 1);
assert.equal(replacement.privatePayload.contacts[0].email, replacementEmail);
assert.equal(replacement.privatePayload.contacts[0].verifiedAt, freshCandidate.verifiedAt);
assert.equal(replacement.privatePayload.contacts[0].carryForward, false);

const publicRaw = JSON.stringify(replay.report);
assert.equal(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(publicRaw), false);
assert.equal(publicRaw.includes('moellner-rc.example'), false);

console.log('contact history -> snapshot replay integration tests passed');