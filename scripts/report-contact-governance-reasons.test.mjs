import assert from 'node:assert/strict';
import { buildGovernanceReasonReport } from './report-contact-governance-reasons.mjs';

const raw = {
  generatedAt: '2026-08-10T00:00:00.000Z',
  policyVersion: '1.1.0',
  decisions: [
    {
      organizationId: '10001',
      name: 'Sicherer Ruderverein e.V.',
      type: 'club',
      routeLevel: 'club',
      decisionReason: 'functional_on_club_domain',
      directCandidateApproved: true,
      reviewedCandidateCount: 1,
      candidates: [{
        email: 'info@sicherer-rv.de',
        website: 'https://sicherer-rv.de/',
        sourceUrl: 'https://sicherer-rv.de/kontakt',
        reason: 'functional_on_club_domain',
        governanceState: 'auto-approved-functional',
        lifecycleState: 'fresh',
        contactKind: 'functional'
      }]
    },
    {
      organizationId: '10002',
      name: 'Alias Ruderverein e.V.',
      type: 'club',
      routeLevel: 'lrv',
      decisionReason: 'club_candidate_not_eligible_lrv_fallback',
      directCandidateApproved: false,
      reviewedCandidateCount: 1,
      candidates: [{
        email: 'vorstand@external-provider.example',
        website: 'https://alias-rv.example/',
        sourceUrl: 'https://alias-rv.example/vorstand',
        reason: 'role_alias_external_unverified_domain',
        governanceState: 'review-functional',
        lifecycleState: 'fresh',
        contactKind: 'role-functional'
      }]
    },
    {
      organizationId: '10003',
      name: 'Persönlicher Ruderverein e.V.',
      type: 'club',
      routeLevel: 'lrv',
      decisionReason: 'club_candidate_not_eligible_lrv_fallback',
      directCandidateApproved: false,
      reviewedCandidateCount: 1,
      candidates: [{
        email: 'max.mustermann@personal-rv.de',
        website: 'https://personal-rv.de/',
        sourceUrl: 'https://personal-rv.de/vorstand',
        reason: 'personal_on_club_domain',
        governanceState: 'review-personal',
        lifecycleState: 'fresh',
        contactKind: 'personal'
      }]
    }
  ]
};

const report = buildGovernanceReasonReport(raw);
assert.equal(report.policyVersion, '1.1.0');
assert.equal(report.totalDecisions, 3);
assert.equal(report.decisionsWithCandidates, 3);
assert.equal(report.decisionsRequiringReview, 2);
assert.equal(report.policyReviewOrganizations, 1);
assert.deepEqual(report.policyReviewOrganizationIds, ['10002']);
assert.equal(report.reasonCounts.role_alias_external_unverified_domain, 1);
assert.equal(report.reasonCounts.personal_on_club_domain, 1);
assert.equal(report.governanceStateCounts['review-functional'], 1);
assert.equal(report.governanceStateCounts['review-personal'], 1);

const alias = report.organizations.find((row) => row.organizationId === '10002');
assert.deepEqual(alias.candidateReasons, ['role_alias_external_unverified_domain']);
assert.deepEqual(alias.governanceStates, ['review-functional']);
assert.deepEqual(alias.contactKinds, ['role-functional']);

const serialized = JSON.stringify(report);
assert.equal(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(serialized), false);
assert.equal(serialized.includes('external-provider.example'), false);
assert.equal(serialized.includes('sicherer-rv.de'), false);
assert.equal(serialized.includes('max.mustermann'), false);

assert.throws(() => buildGovernanceReasonReport({
  decisions: [{
    organizationId: 'evil',
    name: 'Leak info@example.org',
    directCandidateApproved: false,
    reviewedCandidateCount: 1,
    candidates: []
  }]
}), /must not expose email addresses/);

console.log('governance reason report tests passed');
