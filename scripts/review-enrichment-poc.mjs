import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const THIRD_PARTY_CONTEXT = /(gastronom|restaurant|catering|gaststätte|gaststaette|bewirtung|hotel|ferienwohnung|webdesign|webagentur|hosting|agentur|dienstleister|fotograf|ticket|reservierung)/i;
const ROLE_LOCAL_PART = /^(?:1\.?|2\.?)?(?:vorsitz|vorsitzende?r?|ruderwart\w*|sportwart\w*|jugendwart\w*|schriftwart\w*|kassier\w*|kasse|geschaeftsfuehr\w*|geschäftsführ\w*|geschaeftsstelle|geschäftsstelle|verwaltung|sekretariat|presse|trainer\w*)$/i;
const GENERIC_FUNCTIONAL_LOCAL_PART = /^(?:info|kontakt|contact|office|buero|büro|mail|post|anfrage|service|verein|vorstand|webmaster)(?:[._-].*)?$/i;
const PERSONAL_PROVIDER_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'gmx.de', 'gmx.net', 'web.de', 't-online.de',
  'outlook.com', 'hotmail.com', 'live.de', 'live.com', 'icloud.com', 'yahoo.com', 'yahoo.de'
]);

function normalizeHost(value = '') {
  return String(value).trim().toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
}

function emailParts(email = '') {
  const [local = '', domain = ''] = String(email).toLowerCase().split('@');
  return { local, domain: normalizeHost(domain) };
}

function siteHost(website = '') {
  try { return normalizeHost(new URL(website).hostname); } catch { return ''; }
}

function domainsRelated(emailDomain, websiteHost) {
  if (!emailDomain || !websiteHost) return false;
  return emailDomain === websiteHost
    || websiteHost.endsWith(`.${emailDomain}`)
    || emailDomain.endsWith(`.${websiteHost}`);
}

export function classifyContact(contact, website) {
  const { local, domain } = emailParts(contact.email);
  const host = siteHost(website);
  const sameDomain = domainsRelated(domain, host);
  const context = String(contact.context || '');
  const thirdPartyContext = THIRD_PARTY_CONTEXT.test(context);
  const roleAlias = ROLE_LOCAL_PART.test(local);
  const genericFunctional = GENERIC_FUNCTIONAL_LOCAL_PART.test(local) || contact.kind === 'functional';
  const personalProvider = PERSONAL_PROVIDER_DOMAINS.has(domain);

  let disposition = 'review-personal';
  let reason = 'personal_contact';
  let rank = 20;

  if (thirdPartyContext && !roleAlias) {
    disposition = 'review-third-party';
    reason = 'third_party_context';
    rank = 0;
  } else if (sameDomain && genericFunctional) {
    disposition = 'direct-functional';
    reason = 'functional_on_club_domain';
    rank = 100;
  } else if (roleAlias) {
    disposition = 'direct-functional';
    reason = sameDomain ? 'role_alias_on_club_domain' : 'explicit_role_alias_external_domain';
    rank = sameDomain ? 95 : 85;
  } else if (genericFunctional) {
    disposition = 'review-external-functional';
    reason = 'generic_functional_external_domain';
    rank = 55;
  } else if (sameDomain) {
    disposition = 'review-personal';
    reason = 'personal_on_club_domain';
    rank = 50;
  } else if (contact.role) {
    disposition = 'review-personal-role';
    reason = 'personal_contact_with_club_role';
    rank = 45;
  } else if (personalProvider) {
    disposition = 'review-personal';
    reason = 'personal_provider_without_role';
    rank = 15;
  }

  return {
    ...contact,
    sameDomain,
    roleAlias,
    genericFunctional,
    personalProvider,
    thirdPartyContext,
    disposition,
    reason,
    rank
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
  return `# Enrichment PoC – Conservative Review\n\nStand: ${summary.generatedAt}\n\n- Auto-Direct Funktionskontakt: **${summary.autoDirectFunctional}/${summary.organizations} (${summary.autoDirectFunctionalPct} %)**\n- Manuelle Review nötig: **${summary.reviewRequired}/${summary.organizations} (${summary.reviewRequiredPct} %)**\n- Fallback LRV/DRV nötig: **${summary.fallbackRequired}/${summary.organizations} (${summary.fallbackRequiredPct} %)**\n- Organisationen mit verdächtigen Drittanbieter-Kandidaten: **${summary.organizationsWithThirdPartyCandidates}**\n\n## Entscheidungen\n\n| Verein | Disposition | Grund | Kandidaten | Direct | Review | Drittanbieter |\n| --- | --- | --- | ---: | ---: | ---: | ---: |\n${rows}\n\nDer öffentliche Report enthält bewusst keine E-Mail-Adressen. Direkte Empfänger bleiben ausschließlich im privaten Build-Artefakt.\n`;
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
  await writeFile(path.join(root, 'build-private', 'enrichment-poc-reviewed.json'), JSON.stringify({ generatedAt: summary.generatedAt, decisions: reviewed }, null, 2));

  console.log(`[review] direct=${summary.autoDirectFunctional}, review=${summary.reviewRequired}, fallback=${summary.fallbackRequired}, thirdPartyOrgs=${summary.organizationsWithThirdPartyCandidates}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
