import assert from 'node:assert/strict';
import { classifyContactCandidate, evaluateSnapshotEligibility } from './lib/contact-governance.mjs';

const cases = [
  { email: 'max.mustermann@ruderverein.de', website: 'https://ruderverein.de/' },
  { email: 'anna.schmidt@gmail.com', website: 'https://ruderverein.de/' },
  { email: 'vorname.nachname@club.example', website: 'https://club.example/' }
];

for (const testCase of cases) {
  const classification = classifyContactCandidate({ email: testCase.email }, testCase.website);
  assert.equal(classification.autoApproved, false, `${testCase.email} must not be auto-approved`);
  assert.equal(classification.contactKind, 'personal', `${testCase.email} must remain personal`);

  const evaluated = evaluateSnapshotEligibility({
    email: testCase.email,
    sourceUrl: testCase.website,
    verifiedAt: new Date().toISOString()
  }, testCase.website, { verifiedAt: new Date().toISOString() });
  assert.equal(evaluated.snapshotEligible, false, `${testCase.email} must not be snapshot eligible`);
}

const allowed = classifyContactCandidate({ email: 'info@ruderverein.de' }, 'https://ruderverein.de/');
assert.equal(allowed.autoApproved, true, 'generic functional address on organization domain should remain auto-approvable');

console.log('[contact-personal-safety] personal contacts are never auto-approved');
