import { createHmac } from 'node:crypto';

export const CONTACT_POLICY_VERSION = '1.0.0';
export const CONTACT_STALE_DAYS = 180;
export const CONTACT_DISABLE_DAYS = 270;

export const THIRD_PARTY_CONTEXT = /(gastronom|restaurant|catering|gaststätte|gaststaette|bewirtung|hotel|ferienwohnung|webdesign|webagentur|hosting|agentur|dienstleister|fotograf|ticket|reservierung)/i;
export const ROLE_LOCAL_PART = /^(?:1\.?|2\.?)?(?:vorsitz\w*|vorstand|praesident\w*|präsident\w*|vizepraesident\w*|vizepräsident\w*|ruderwart\w*|sportwart\w*|jugendwart\w*|schriftwart\w*|kassier\w*|kasse|geschaeftsfuehr\w*|geschäftsführ\w*|geschaeftsstelle|geschäftsstelle|verwaltung|sekretariat|presse|trainer\w*|jugend|sport)$/i;
export const GENERIC_FUNCTIONAL_LOCAL_PART = /^(?:info|kontakt|contact|office|buero|büro|mail|post|anfrage|service|verein|webmaster)(?:[._-].*)?$/i;
export const PERSONAL_PROVIDER_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'gmx.de', 'gmx.net', 'web.de', 't-online.de',
  'outlook.com', 'hotmail.com', 'live.de', 'live.com', 'icloud.com', 'yahoo.com', 'yahoo.de'
]);

const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeContactEmail(value = '') {
  return String(value).trim().toLowerCase();
}

export function normalizeContactHost(value = '') {
  return String(value).trim().toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
}

function emailParts(email = '') {
  const normalized = normalizeContactEmail(email);
  const at = normalized.lastIndexOf('@');
  if (at <= 0 || at === normalized.length - 1) return { local: '', domain: '' };
  return { local: normalized.slice(0, at), domain: normalizeContactHost(normalized.slice(at + 1)) };
}

function siteHost(website = '') {
  try { return normalizeContactHost(new URL(website).hostname); } catch { return ''; }
}

function normalizedTrustedSet(values = []) {
  return new Set((Array.isArray(values) ? values : []).map((value) => String(value || '').trim().toLowerCase()).filter(Boolean));
}

export function contactDomainsRelated(emailDomain, websiteHost) {
  const left = normalizeContactHost(emailDomain);
  const right = normalizeContactHost(websiteHost);
  if (!left || !right) return false;
  return left === right || right.endsWith(`.${left}`) || left.endsWith(`.${right}`);
}

export function classifyContactCandidate(contact = {}, website = '', { trustedDomains = [], trustedFunctionalLocalParts = [] } = {}) {
  const email = normalizeContactEmail(contact.email);
  const { local, domain } = emailParts(email);
  const host = siteHost(website);
  const sameDomain = contactDomainsRelated(domain, host);
  const trustedDomainSet = normalizedTrustedSet(trustedDomains);
  const trustedFunctionalSet = normalizedTrustedSet(trustedFunctionalLocalParts);
  const trustedDomain = trustedDomainSet.has(domain);
  const organizationDomain = sameDomain || trustedDomain;
  const context = String(contact.context || '');
  const thirdPartyContext = THIRD_PARTY_CONTEXT.test(context);
  const roleAlias = ROLE_LOCAL_PART.test(local);
  const genericFunctional = GENERIC_FUNCTIONAL_LOCAL_PART.test(local);
  const trustedFunctionalAlias = trustedFunctionalSet.has(local) && organizationDomain;
  const personalProvider = PERSONAL_PROVIDER_DOMAINS.has(domain);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  let contactKind = 'personal';
  let governanceState = 'review-personal';
  let reason = 'personal_contact';
  let rank = 20;

  if (!validEmail) {
    contactKind = 'invalid';
    governanceState = 'excluded-invalid';
    reason = 'invalid_email';
    rank = -10;
  } else if (thirdPartyContext && !roleAlias && !trustedFunctionalAlias) {
    contactKind = 'third-party';
    governanceState = 'excluded-third-party';
    reason = 'third_party_context';
    rank = 0;
  } else if (trustedFunctionalAlias) {
    contactKind = 'role-functional';
    governanceState = 'auto-approved-functional';
    reason = 'verified_functional_alias';
    rank = 105;
  } else if (roleAlias) {
    contactKind = 'role-functional';
    governanceState = 'auto-approved-functional';
    reason = sameDomain ? 'role_alias_on_club_domain' : 'explicit_role_alias_external_domain';
    rank = sameDomain ? 100 : 90;
  } else if (organizationDomain && genericFunctional) {
    contactKind = 'functional';
    governanceState = 'auto-approved-functional';
    reason = sameDomain ? 'functional_on_club_domain' : 'functional_on_verified_organization_domain';
    rank = sameDomain ? 95 : 92;
  } else if (genericFunctional) {
    contactKind = 'functional';
    governanceState = 'review-functional';
    reason = 'generic_functional_external_domain';
    rank = 55;
  } else if (sameDomain) {
    contactKind = 'personal';
    governanceState = 'review-personal';
    reason = 'personal_on_club_domain';
    rank = 45;
  } else if (contact.role) {
    contactKind = 'personal';
    governanceState = 'review-personal';
    reason = 'personal_contact_with_club_role';
    rank = 40;
  } else if (personalProvider) {
    contactKind = 'personal';
    governanceState = 'review-personal';
    reason = 'personal_provider_without_role';
    rank = 15;
  }

  return {
    ...contact,
    email,
    contactKind,
    governanceState,
    policyVersion: CONTACT_POLICY_VERSION,
    reason,
    rank,
    validEmail,
    sameDomain,
    trustedDomain,
    organizationDomain,
    roleAlias,
    genericFunctional,
    trustedFunctionalAlias,
    personalProvider,
    thirdPartyContext,
    autoApproved: governanceState === 'auto-approved-functional'
  };
}

export function contactAgeDays(verifiedAt, now = new Date()) {
  if (!verifiedAt) return null;
  const verified = new Date(verifiedAt);
  const current = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(verified.getTime()) || Number.isNaN(current.getTime())) return null;
  return Math.max(0, Math.floor((current.getTime() - verified.getTime()) / DAY_MS));
}

export function evaluateContactLifecycle({ verifiedAt, suppressed = false, now = new Date(), staleDays = CONTACT_STALE_DAYS, disableDays = CONTACT_DISABLE_DAYS } = {}) {
  if (suppressed) return { lifecycleState: 'suppressed', ageDays: contactAgeDays(verifiedAt, now), directEligible: false };
  const ageDays = contactAgeDays(verifiedAt, now);
  if (ageDays == null) return { lifecycleState: 'unverified', ageDays: null, directEligible: false };
  if (ageDays >= disableDays) return { lifecycleState: 'expired', ageDays, directEligible: false };
  if (ageDays >= staleDays) return { lifecycleState: 'stale', ageDays, directEligible: true };
  return { lifecycleState: 'fresh', ageDays, directEligible: true };
}

export function evaluateSnapshotEligibility(contact, website, {
  verifiedAt = contact?.verifiedAt,
  suppressed = false,
  now = new Date(),
  trustedDomains = [],
  trustedFunctionalLocalParts = []
} = {}) {
  const classification = classifyContactCandidate(contact, website, { trustedDomains, trustedFunctionalLocalParts });
  const lifecycle = evaluateContactLifecycle({ verifiedAt, suppressed, now });
  const hasProvenance = Boolean(contact?.sourceUrl && verifiedAt);
  const eligible = classification.autoApproved && lifecycle.directEligible && hasProvenance && !suppressed;

  let state = classification.governanceState;
  let reason = classification.reason;
  if (suppressed) {
    state = 'suppressed';
    reason = 'suppression_list';
  } else if (classification.autoApproved && !hasProvenance) {
    state = 'review-functional';
    reason = 'missing_provenance_or_verification';
  } else if (classification.autoApproved && lifecycle.lifecycleState === 'expired') {
    state = 'stale';
    reason = 'verification_expired';
  } else if (classification.autoApproved && lifecycle.lifecycleState === 'unverified') {
    state = 'review-functional';
    reason = 'unverified_contact';
  }

  return {
    ...classification,
    ...lifecycle,
    governanceState: state,
    reason,
    snapshotEligible: eligible,
    hasProvenance
  };
}

export function suppressionIdentifier(email, secret) {
  if (!secret) throw new Error('CONTACT_SUPPRESSION_KEY is required');
  const normalized = normalizeContactEmail(email);
  if (!normalized) throw new Error('email is required');
  return createHmac('sha256', secret).update(normalized).digest('hex');
}
