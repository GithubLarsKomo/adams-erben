import {
  GENERIC_FUNCTIONAL_LOCAL_PART,
  PERSONAL_PROVIDER_DOMAINS,
  ROLE_LOCAL_PART,
  THIRD_PARTY_CONTEXT,
  contactDomainsRelated,
  normalizeContactHost
} from './contact-governance.mjs';

export const CONTACT_DOMAIN_EVIDENCE_VERSION = '1.0.0';
const STRONG_PAGE_CONTEXT = /(kontakt|contact|impressum|imprint|datenschutz|privacy|legal|vorstand|ansprech|team|geschäft|geschaeft|office|büro|buero)/i;

function emailParts(email = '') {
  const normalized = String(email || '').trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at <= 0 || at === normalized.length - 1) return { local: '', domain: '' };
  return {
    local: normalized.slice(0, at),
    domain: normalizeContactHost(normalized.slice(at + 1))
  };
}

function siteHost(website = '') {
  try { return normalizeContactHost(new URL(website).hostname); } catch { return ''; }
}

function pageKey(sourceUrl = '') {
  try {
    const url = new URL(sourceUrl);
    return `${normalizeContactHost(url.hostname)}${url.pathname.replace(/\/+$/, '') || '/'}`;
  } catch {
    return '';
  }
}

function pageBelongsToSite(sourceUrl, website) {
  try {
    const sourceHost = normalizeContactHost(new URL(sourceUrl).hostname);
    return contactDomainsRelated(sourceHost, siteHost(website));
  } catch {
    return false;
  }
}

function strongPageSignal(contact = {}) {
  let path = '';
  try { path = new URL(contact.sourceUrl || '').pathname; } catch { /* ignore */ }
  return STRONG_PAGE_CONTEXT.test(`${path} ${contact.context || ''}`);
}

export function inferTrustedContactDomains({ website = '', contacts = [], identityStrong = false } = {}) {
  const host = siteHost(website);
  const byDomain = new Map();
  if (!identityStrong || !host) {
    return {
      evidenceVersion: CONTACT_DOMAIN_EVIDENCE_VERSION,
      trustedDomains: [],
      candidateDomainCount: 0,
      trustedDomainCount: 0,
      evidence: []
    };
  }

  for (const contact of Array.isArray(contacts) ? contacts : []) {
    const { local, domain } = emailParts(contact.email);
    if (!local || !domain) continue;
    if (contactDomainsRelated(domain, host)) continue;
    if (PERSONAL_PROVIDER_DOMAINS.has(domain)) continue;
    if (!pageBelongsToSite(contact.sourceUrl, website)) continue;
    if (THIRD_PARTY_CONTEXT.test(String(contact.context || ''))) continue;
    const roleAlias = ROLE_LOCAL_PART.test(local);
    const genericFunctional = GENERIC_FUNCTIONAL_LOCAL_PART.test(local);
    if (!roleAlias && !genericFunctional) continue;

    const entry = byDomain.get(domain) || {
      domain,
      addresses: new Set(),
      localParts: new Set(),
      pages: new Set(),
      strongPages: new Set(),
      roleAddresses: new Set(),
      genericAddresses: new Set()
    };
    const email = String(contact.email || '').trim().toLowerCase();
    const page = pageKey(contact.sourceUrl);
    entry.addresses.add(email);
    entry.localParts.add(local);
    if (page) entry.pages.add(page);
    if (page && strongPageSignal(contact)) entry.strongPages.add(page);
    if (roleAlias) entry.roleAddresses.add(email);
    if (genericFunctional) entry.genericAddresses.add(email);
    byDomain.set(domain, entry);
  }

  const evidence = [...byDomain.values()].map((entry) => {
    const distinctAddresses = entry.addresses.size;
    const distinctPages = entry.pages.size;
    const strongPages = entry.strongPages.size;
    const trusted = distinctAddresses >= 2 && distinctPages >= 2 && strongPages >= 1;
    return {
      domain: entry.domain,
      trusted,
      distinctAddresses,
      distinctLocalParts: entry.localParts.size,
      distinctPages,
      strongPages,
      roleAddresses: entry.roleAddresses.size,
      genericAddresses: entry.genericAddresses.size,
      reason: trusted ? 'multi_page_multi_mailbox_organization_evidence' : 'insufficient_organization_domain_evidence'
    };
  }).sort((a, b) => a.domain.localeCompare(b.domain, 'en'));

  const trustedDomains = evidence.filter((row) => row.trusted).map((row) => row.domain);
  return {
    evidenceVersion: CONTACT_DOMAIN_EVIDENCE_VERSION,
    trustedDomains,
    candidateDomainCount: evidence.length,
    trustedDomainCount: trustedDomains.length,
    evidence
  };
}

export function publicContactDomainEvidenceSummary(result = {}) {
  const evidence = Array.isArray(result.evidence) ? result.evidence : [];
  return {
    evidenceVersion: result.evidenceVersion || CONTACT_DOMAIN_EVIDENCE_VERSION,
    candidateDomainCount: Number(result.candidateDomainCount || evidence.length || 0),
    trustedDomainCount: Number(result.trustedDomainCount || evidence.filter((row) => row.trusted).length || 0),
    trustedEvidenceCount: evidence.filter((row) => row.trusted).length,
    reviewEvidenceCount: evidence.filter((row) => !row.trusted).length
  };
}
