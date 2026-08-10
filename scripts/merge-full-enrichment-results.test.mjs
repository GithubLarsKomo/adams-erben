import assert from 'node:assert/strict';
import { mergeFullEnrichmentPayloads } from './merge-full-enrichment-results.mjs';

const baseline = { contacts: [
  { organizationId: 'lrv-1', email: 'kontakt@verband.test', verifiedAt: '2026-08-10T00:00:00Z' },
  { organizationId: '10001', email: 'alt@club.test', verifiedAt: '2026-08-09T00:00:00Z' }
] };

const batches = [
  {
    batch: 1,
    contacts: { contacts: [
      { organizationId: '10001', email: 'neu@club.test', verifiedAt: '2026-08-10T01:00:00Z' },
      { organizationId: '10001', email: 'alt@club.test', verifiedAt: '2026-08-10T02:00:00Z' }
    ] },
    decisions: { organizations: [
      { organizationId: '10001', status: 'processed' },
      { organizationId: '10002', status: 'robots_blocked' }
    ] }
  },
  {
    batch: 2,
    contacts: { contacts: [{ organizationId: '10003', email: 'info@club3.test', verifiedAt: '2026-08-10T03:00:00Z' }] },
    decisions: { organizations: [{ organizationId: '10003', status: 'identity_review' }] }
  }
];

const merged = mergeFullEnrichmentPayloads({ baselineContacts: baseline, batches, expectedOrganizations: 3 });
assert.equal(merged.report.batchCount, 2);
assert.equal(merged.report.acquisitionOrganizations, 3);
assert.equal(merged.report.uniqueAcquisitionOrganizations, 3);
assert.equal(merged.report.statusCounts.processed, 1);
assert.equal(merged.report.statusCounts.robots_blocked, 1);
assert.equal(merged.report.statusCounts.identity_review, 1);
assert.equal(merged.currentPayload.contacts.filter((row) => row.organizationId === '10001' && row.email === 'alt@club.test').length, 1);
assert.equal(merged.currentPayload.contacts.find((row) => row.organizationId === '10001' && row.email === 'alt@club.test').verifiedAt, '2026-08-10T02:00:00Z');
assert.equal(JSON.stringify(merged.report).includes('@'), false);

assert.throws(() => mergeFullEnrichmentPayloads({ baselineContacts: baseline, batches, expectedOrganizations: 4 }), /expected 4 acquisition rows/);

const duplicate = [
  { batch: 1, contacts: { contacts: [] }, decisions: { organizations: [{ organizationId: '10001', status: 'processed' }] } },
  { batch: 2, contacts: { contacts: [] }, decisions: { organizations: [{ organizationId: '10001', status: 'processed' }] } }
];
assert.throws(() => mergeFullEnrichmentPayloads({ baselineContacts: { contacts: [] }, batches: duplicate, expectedOrganizations: 2 }), /unique acquisition organizations/);

console.log('full enrichment merge tests passed');
