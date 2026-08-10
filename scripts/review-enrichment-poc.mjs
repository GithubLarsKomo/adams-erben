import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { classifyContactCandidate, CONTACT_POLICY_VERSION } from './lib/contact-governance.mjs';

function legacyDisposition(classification) {
  switch (classification.governanceState) {
    case 'auto-approved-functional':
      return 'direct-functional';
    case 'review-functional':
      return 'review-external-functional';
    case 'review-personal':
      return classification.role ? 'review-personal-role' : 'review-personal';
    case 'excluded-third-party':
      return 'review-third-party';
    case 'excluded-invalid':
      return 'review-invalid';
    default:
      return 'review-personal';
  }
}

// Compatibility wrapper for the existing PoC report. The underlying decision is
// now owned by scripts/lib/contact-governance.mjs.
export function classifyContact(contact, website) {
  const classification = classifyContactCandidate(contact, website);
  return {
    ...classification,
    disposition: legacyDisposition(classification)
  };
}

function publicDecision(item) {
  return {
    organizationId: item.organizationId,
    name: item.name,
    website: item.website,
    status: item.status,
    disposition: item.disposition,
    reason: item.reason,
    policyVersion: CONTACT_POLICY_VERSION,
    candidateCount: item.candidateCount,
    directCandidateCount: item.directCandidateCount,
    reviewCandidateCount: item.reviewCandidateCount,
    thirdPartyCandidateCount: item.thirdPartyCandidateCount
  };
}

export function reviewOrganization(item) {
  const reviewed = (item.contacts || [])
    .map((contact) => classifyContact(contact, item.website))
    .sort((a, b) => b.rank - a.rank || String(a.email).localeCompare(String(b.email)));

  const direct = reviewed.filter((contact) => contact.disposition === 'direct-functional');
  const review = reviewed.filter((contact) => contact.disposition.startsWith('review-'));
  const thirdParty = reviewed.filter((contact) => contact.disposition === 'review-third-party');
  const preferred = direct[0] || null;

  let disposition = 'fallback';
  let reason = 'no_approved_direct_contact';
  if (preferred) {
    disposition = 'direct-functional';
    reason = preferred.reason;
  } else if (review.length) {
    disposition = 'review';
    reason = review[0].reason;
  }

  return {
    ...item,
    policyVersion: CONTACT_POLICY_VERSION,
    disposition,
    reason,
    candidateCount: reviewed.length,
    directCandidateCount: direct.length,
    reviewCandidateCount: review.length,
    thirdPartyCandidateCount: thirdParty.length,
    preferredContact: preferred,
    contacts: reviewed
  };
}

function buildSummary(reviewed) {
  const direct = reviewed.filter((item) => item.disposition === 'direct-functional');
  const review = reviewed.filter((item) => item.disposition === 'review');
  const fallback = reviewed.filter((item) => item.disposition === 'fallback');
  const thirdPartyOrgs = reviewed.filter((item) => item.thirdPartyCandidateCount > 0);
  const total = reviewed.length || 1;
  const pct = (n) => Number((n / total * 100).toFixed(1));
  return {
    generatedAt: new Date().toISOString(),
    policyVersion: CONTACT_POLICY_VERSION,
    organizations: reviewed.length,
    autoDirectFunctional: direct.length,
    autoDirectFunctionalPct: pct(direct.length),
    reviewRequired: review.length,
    reviewRequiredPct: pct(review.length),
    fallbackRequired: fallback.length,
    fallbackRequiredPct: pct(fallback.length),
    organizationsWithThirdPartyCandidates: thirdPartyOrgs.length
  };
}

function markdown(summary, decisions) {
  const rows = decisions.map((item) => `| ${item.name.replace(/\|/g, '\\|')} | ${item.disposition} | ${item.reason} | ${item.candidateCount} | ${item.directCandidateCount} | ${item.reviewCandidateCount} | ${item.thirdPartyCandidateCount} |`).join('\n');
  return `# Enrichment PoC – Conservative Review\n\nStand: ${summary.generatedAt}\n\n- Governance-Policy: **${summary.policyVersion}**\n- Auto-Direct Funktionskontakt: **${summary.autoDirectFunctional}/${summary.organizations} (${summary.autoDirectFunctionalPct} %)**\n- Manuelle Review nötig: **${summary.reviewRequired}/${summary.organizations} (${summary.reviewRequiredPct} %)**\n- Fallback LRV/DRV nötig: **${summary.fallbackRequired}/${summary.organizations} (${summary.fallbackRequiredPct} %)**\n- Organisationen mit verdächtigen Drittanbieter-Kandidaten: **${summary.organizationsWithThirdPartyCandidates}**\n\n## Entscheidungen\n\n| Verein | Disposition | Grund | Kandidaten | Direct | Review | Drittanbieter |\n| --- | --- | --- | ---: | ---: | ---: | ---: |\n${rows}\n\nDer öffentliche Report enthält bewusst keine E-Mail-Adressen. Direkte Empfänger bleiben ausschließlich im privaten Build-Artefakt. Personalisierte Adressen werden von der gemeinsamen Governance-Policy niemals automatisch freigegeben.\n`;
}

async function main() {
  const root = process.cwd();
  const privatePath = path.join(root, 'build-private', 'enrichment-poc-contacts.json');
  const reportDir = path.join(root, 'artifacts', 'enrichment-poc');
  const input = JSON.parse(await readFile(privatePath, 'utf8'));
  const reviewed = (input.contacts || []).map(reviewOrganization);
  const summary = buildSummary(reviewed);
  const publicDecisions = reviewed.map(publicDecision);

  await mkdir(reportDir, { recursive: true });
  await writeFile(path.join(reportDir, 'review.json'), JSON.stringify({ summary, decisions: publicDecisions }, null, 2));
  await writeFile(path.join(reportDir, 'review.md'), markdown(summary, publicDecisions));
  await writeFile(path.join(root, 'build-private', 'enrichment-poc-reviewed.json'), JSON.stringify({ generatedAt: summary.generatedAt, policyVersion: CONTACT_POLICY_VERSION, decisions: reviewed }, null, 2));

  console.log(`[review] policy=${CONTACT_POLICY_VERSION}, direct=${summary.autoDirectFunctional}, review=${summary.reviewRequired}, fallback=${summary.fallbackRequired}, thirdPartyOrgs=${summary.organizationsWithThirdPartyCandidates}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
