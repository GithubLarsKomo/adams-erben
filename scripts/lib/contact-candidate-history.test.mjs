import assert from 'node:assert/strict';
import { mergeContactCandidateHistory, TECHNICAL_CARRY_FORWARD_STATUSES } from './contact-candidate-history.mjs';

const previous = [
  {
    organizationId: '12417',
    email: 'kontakt@moellner-rc.example',
    website: 'https://moellner-rc.example/',
    sourceType: 'club-website',
    sourceUrl: 'https://moellner-rc.example/kontakt',
    verifiedAt: '2026-08-05T12:00:00.000Z',
    context: 'Kontakt'
  },
  {
    organizationId: '11612',
    email: 'vorstand@rcnh.example',
    website: 'https://nassovia.example/',
    sourceType: 'club-website',
    sourceUrl: 'https://nassovia.example/kontakt',
    verifiedAt: '2026-08-05T12:00:00.000Z',
    context: 'Vorstand'
  },
  {
    organizationId: '10003',
    email: 'info@removed.example',
    website: 'https://removed.example/',
    sourceType: 'club-website',
    sourceUrl: 'https://removed.example/kontakt',
    verifiedAt: '2026-08-05T12:00:00.000Z',
    context: 'Kontakt'
  }
];

const current = [{
  organizationId: '11612',
  email: 'kontakt@fresh.example',
  website: 'https://nassovia.example/',
  sourceType: 'club-website',
  sourceUrl: 'https://nassovia.example/kontakt',
  verifiedAt: '2026-08-10T05:00:00.000Z',
  context: 'Kontakt'
}];

const merged = mergeContactCandidateHistory({
  previousContacts: previous,
  currentContacts: current,
  acquisitionResults: [
    { organizationId: '12417', status: 'robots_unavailable' },
    { organizationId: '11612', status: 'processed' },
    { organizationId: '10003', status: 'processed' }
  ],
  attemptedAt: '2026-08-10T05:05:00.000Z'
});

assert.ok(TECHNICAL_CARRY_FORWARD_STATUSES.has('robots_unavailable'));
assert.equal(merged.summary.previousContacts, 3);
assert.equal(merged.summary.currentContacts, 1);
assert.equal(merged.summary.outputContacts, 2);
assert.equal(merged.summary.carryForwardOrganizations, 1);
assert.equal(merged.summary.carryForwardContacts, 1);
assert.deepEqual(merged.carryForwardOrganizations, ['12417']);

const carried = merged.contacts.find((row) => row.organizationId === '12417');
assert.equal(carried.carryForward, true);
assert.equal(carried.carryForwardReason, 'robots_unavailable');
assert.equal(carried.verifiedAt, '2026-08-05T12:00:00.000Z');
assert.equal(carried.lastAttemptAt, '2026-08-10T05:05:00.000Z');

const fresh = merged.contacts.find((row) => row.organizationId === '11612');
assert.equal(fresh.email, 'kontakt@fresh.example');
assert.equal(fresh.carryForward, false);
assert.equal(merged.contacts.some((row) => row.organizationId === '11612' && row.email === 'vorstand@rcnh.example'), false);

// A successful bounded crawl with no current contact is an explicit current
// observation, so old candidates are not silently resurrected.
assert.equal(merged.contacts.some((row) => row.organizationId === '10003'), false);

for (const status of ['identity_review', 'discovery_pending_provider']) {
  const result = mergeContactCandidateHistory({
    previousContacts: [previous[0]],
    currentContacts: [],
    acquisitionResults: [{ organizationId: '12417', status }]
  });
  assert.equal(result.contacts.length, 0, `${status} must not carry old candidates forward`);
}

for (const status of ['robots_blocked', 'network_error', 'http_error', 'redirect_limit', 'unexpected_error']) {
  const result = mergeContactCandidateHistory({
    previousContacts: [previous[0]],
    currentContacts: [],
    acquisitionResults: [{ organizationId: '12417', status }]
  });
  assert.equal(result.contacts.length, 1, `${status} should preserve last-known-good contact`);
  assert.equal(result.contacts[0].verifiedAt, previous[0].verifiedAt, `${status} must not refresh verifiedAt`);
}

console.log('contact candidate history tests passed');
