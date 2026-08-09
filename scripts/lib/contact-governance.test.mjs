import assert from 'node:assert/strict';
import {
  CONTACT_POLICY_VERSION,
  classifyContactCandidate,
  evaluateContactLifecycle,
  evaluateSnapshotEligibility,
  suppressionIdentifier
} from './contact-governance.mjs';

const clubSite = 'https://www.beispiel-ruderverein.de/';
const now = new Date('2026-08-10T00:00:00.000Z');

const sameDomainInfo = classifyContactCandidate({
  email: 'INFO@beispiel-ruderverein.de',
  kind: 'functional',
  context: 'Kontakt Geschäftsstelle'
}, clubSite);
assert.equal(sameDomainInfo.email, 'info@beispiel-ruderverein.de');
assert.equal(sameDomainInfo.contactKind, 'functional');
assert.equal(sameDomainInfo.governanceState, 'auto-approved-functional');
assert.equal(sameDomainInfo.autoApproved, true);
assert.equal(sameDomainInfo.policyVersion, CONTACT_POLICY_VERSION);

const externalRole = classifyContactCandidate({
  email: 'vorsitzender@web.de',
  context: '1. Vorsitzender'
}, clubSite);
assert.equal(externalRole.contactKind, 'role-functional');
assert.equal(externalRole.governanceState, 'auto-approved-functional');

const externalGeneric = classifyContactCandidate({
  email: 'info@fremde-domain.de',
  kind: 'functional',
  context: 'Allgemeiner Kontakt'
}, clubSite);
assert.equal(externalGeneric.governanceState, 'review-functional');
assert.equal(externalGeneric.autoApproved, false);

const incorrectlyTaggedPersonal = classifyContactCandidate({
  email: 'max.mustermann@beispiel-ruderverein.de',
  kind: 'functional',
  context: 'Ruderwart Max Mustermann',
  role: 'Ruderwart'
}, clubSite);
assert.equal(incorrectlyTaggedPersonal.contactKind, 'personal');
assert.equal(incorrectlyTaggedPersonal.governanceState, 'review-personal');
assert.equal(incorrectlyTaggedPersonal.autoApproved, false);

const personalProvider = classifyContactCandidate({
  email: 'max.mustermann@t-online.de',
  context: 'Ruderwart Max Mustermann',
  role: 'Ruderwart'
}, clubSite);
assert.equal(personalProvider.governanceState, 'review-personal');
assert.equal(personalProvider.autoApproved, false);

const thirdParty = classifyContactCandidate({
  email: 'info@catering-muster.de',
  context: 'Gastronomie und Catering im Bootshaus'
}, clubSite);
assert.equal(thirdParty.contactKind, 'third-party');
assert.equal(thirdParty.governanceState, 'excluded-third-party');

const invalid = classifyContactCandidate({ email: 'not-an-email' }, clubSite);
assert.equal(invalid.governanceState, 'excluded-invalid');

assert.deepEqual(evaluateContactLifecycle({
  verifiedAt: '2026-07-10T00:00:00.000Z',
  now
}), { lifecycleState: 'fresh', ageDays: 31, directEligible: true });

assert.deepEqual(evaluateContactLifecycle({
  verifiedAt: '2026-01-01T00:00:00.000Z',
  now
}), { lifecycleState: 'stale', ageDays: 221, directEligible: true });

assert.deepEqual(evaluateContactLifecycle({
  verifiedAt: '2025-10-01T00:00:00.000Z',
  now
}), { lifecycleState: 'expired', ageDays: 313, directEligible: false });

assert.equal(evaluateContactLifecycle({ suppressed: true, now }).lifecycleState, 'suppressed');
assert.equal(evaluateContactLifecycle({ now }).lifecycleState, 'unverified');

const eligible = evaluateSnapshotEligibility({
  email: 'info@beispiel-ruderverein.de',
  sourceUrl: 'https://www.beispiel-ruderverein.de/kontakt',
  verifiedAt: '2026-07-10T00:00:00.000Z'
}, clubSite, { now });
assert.equal(eligible.snapshotEligible, true);
assert.equal(eligible.governanceState, 'auto-approved-functional');

const noProvenance = evaluateSnapshotEligibility({
  email: 'info@beispiel-ruderverein.de'
}, clubSite, { now });
assert.equal(noProvenance.snapshotEligible, false);
assert.equal(noProvenance.governanceState, 'review-functional');
assert.equal(noProvenance.reason, 'missing_provenance_or_verification');

const suppressed = evaluateSnapshotEligibility({
  email: 'info@beispiel-ruderverein.de',
  sourceUrl: 'https://www.beispiel-ruderverein.de/kontakt',
  verifiedAt: '2026-07-10T00:00:00.000Z'
}, clubSite, { now, suppressed: true });
assert.equal(suppressed.snapshotEligible, false);
assert.equal(suppressed.governanceState, 'suppressed');

const personal = evaluateSnapshotEligibility({
  email: 'max.mustermann@beispiel-ruderverein.de',
  sourceUrl: 'https://www.beispiel-ruderverein.de/vorstand',
  verifiedAt: '2026-07-10T00:00:00.000Z',
  role: 'Ruderwart'
}, clubSite, { now });
assert.equal(personal.snapshotEligible, false);
assert.equal(personal.governanceState, 'review-personal');

const hash1 = suppressionIdentifier(' Info@Example.org ', 'test-secret');
const hash2 = suppressionIdentifier('info@example.org', 'test-secret');
assert.equal(hash1, hash2);
assert.match(hash1, /^[a-f0-9]{64}$/);
assert.throws(() => suppressionIdentifier('info@example.org', ''), /CONTACT_SUPPRESSION_KEY/);

console.log('contact governance tests passed');
