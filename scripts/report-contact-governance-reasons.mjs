import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const INPUT_FILE = process.env.GOVERNANCE_REASON_INPUT || 'build-private/snapshot-decisions.json';
const REPORT_DIR = process.env.GOVERNANCE_REASON_REPORT_DIR || 'artifacts/snapshot';
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function counter(values) {
  const counts = Object.create(null);
  for (const value of values) {
    const key = String(value || '').trim() || '<missing>';
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, 'en')));
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en'));
}

function publicDecision(decision = {}) {
  const candidates = Array.isArray(decision.candidates) ? decision.candidates : [];
  const reasons = unique(candidates.map((candidate) => candidate.reason));
  const governanceStates = unique(candidates.map((candidate) => candidate.governanceState));
  const lifecycleStates = unique(candidates.map((candidate) => candidate.lifecycleState));
  const contactKinds = unique(candidates.map((candidate) => candidate.contactKind));
  return {
    organizationId: String(decision.organizationId || ''),
    name: String(decision.name || ''),
    type: String(decision.type || ''),
    routeLevel: String(decision.routeLevel || ''),
    decisionReason: String(decision.decisionReason || ''),
    directCandidateApproved: Boolean(decision.directCandidateApproved),
    reviewedCandidateCount: Number(decision.reviewedCandidateCount || candidates.length || 0),
    candidateReasons: reasons,
    governanceStates,
    lifecycleStates,
    contactKinds
  };
}

export function buildGovernanceReasonReport(raw = {}) {
  const decisions = Array.isArray(raw) ? raw : (Array.isArray(raw.decisions) ? raw.decisions : []);
  const publicRows = decisions.map(publicDecision);
  const reviewRows = publicRows
    .filter((row) => !row.directCandidateApproved && row.reviewedCandidateCount > 0)
    .sort((a, b) => a.organizationId.localeCompare(b.organizationId, 'en'));
  const policyReviewRows = reviewRows.filter((row) => row.candidateReasons.some((reason) => [
    'role_alias_external_unverified_domain',
    'generic_functional_external_domain'
  ].includes(reason)));

  const allCandidates = decisions.flatMap((decision) => Array.isArray(decision.candidates) ? decision.candidates : []);
  const report = {
    generatedAt: raw.generatedAt || '',
    policyVersion: raw.policyVersion || '',
    totalDecisions: decisions.length,
    decisionsWithCandidates: publicRows.filter((row) => row.reviewedCandidateCount > 0).length,
    decisionsRequiringReview: reviewRows.length,
    policyReviewOrganizations: policyReviewRows.length,
    reasonCounts: counter(allCandidates.map((candidate) => candidate.reason)),
    governanceStateCounts: counter(allCandidates.map((candidate) => candidate.governanceState)),
    lifecycleStateCounts: counter(allCandidates.map((candidate) => candidate.lifecycleState)),
    contactKindCounts: counter(allCandidates.map((candidate) => candidate.contactKind)),
    organizations: reviewRows,
    policyReviewOrganizationIds: policyReviewRows.map((row) => row.organizationId)
  };

  const serialized = JSON.stringify(report);
  if (EMAIL_PATTERN.test(serialized)) throw new Error('governance reason report must not expose email addresses');
  return report;
}

function markdown(report) {
  const reasons = Object.entries(report.reasonCounts).map(([key, value]) => `- ${key}: **${value}**`).join('\n') || '- keine';
  const states = Object.entries(report.governanceStateCounts).map(([key, value]) => `- ${key}: **${value}**`).join('\n') || '- keine';
  const policyRows = report.organizations
    .filter((row) => report.policyReviewOrganizationIds.includes(row.organizationId))
    .map((row) => `| ${row.organizationId} | ${row.name.replace(/\|/g, '\\|')} | ${row.routeLevel} | ${row.candidateReasons.join(', ')} |`)
    .join('\n') || '| – | – | – | – |';
  return `# Contact Governance – adressfreie Diagnostik\n\n- Policy: **${report.policyVersion || 'unbekannt'}**\n- Entscheidungen: **${report.totalDecisions}**\n- Entscheidungen mit Kandidaten: **${report.decisionsWithCandidates}**\n- Entscheidungen ohne Direct-Freigabe trotz Kandidat: **${report.decisionsRequiringReview}**\n- davon externe unverifizierte Funktions-/Rollendomäne: **${report.policyReviewOrganizations}**\n\n## Kandidaten-Gründe\n\n${reasons}\n\n## Governance-States\n\n${states}\n\n## Policy-1.1-relevante Organisationen\n\n| DRV-ID | Organisation | Route | Gründe |\n| --- | --- | --- | --- |\n${policyRows}\n\nDer Report enthält bewusst weder E-Mail-Adressen noch E-Mail-Domains. Empfängerdaten verbleiben ausschließlich in privaten Build-Artefakten.\n`;
}

async function main() {
  const raw = JSON.parse(await readFile(INPUT_FILE, 'utf8'));
  const report = buildGovernanceReasonReport(raw);
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(path.join(REPORT_DIR, 'contact-governance-reasons.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(REPORT_DIR, 'contact-governance-reasons.md'), markdown(report));
  console.log(`[governance-reasons] review=${report.decisionsRequiringReview}; policy-review=${report.policyReviewOrganizations}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
