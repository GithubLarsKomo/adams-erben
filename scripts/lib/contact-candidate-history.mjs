export const TECHNICAL_CARRY_FORWARD_STATUSES = new Set([
  'robots_blocked',
  'robots_unavailable',
  'network_error',
  'http_error',
  'unsupported_content',
  'redirect_limit',
  'redirect_without_location',
  'unsupported_redirect',
  'unexpected_error'
]);

function normalizeContacts(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.contacts)) return value.contacts;
  return [];
}

function normalizeResults(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.organizations)) return value.organizations;
  return [];
}

function contactKey(contact = {}) {
  return `${String(contact.organizationId || '').trim()}|${String(contact.email || '').trim().toLowerCase()}`;
}

function byOrganization(rows) {
  const result = new Map();
  for (const row of rows) {
    const organizationId = String(row?.organizationId || '').trim();
    if (!organizationId) continue;
    const list = result.get(organizationId) || [];
    list.push(row);
    result.set(organizationId, list);
  }
  return result;
}

function dedupe(rows) {
  const result = new Map();
  for (const row of rows) {
    const key = contactKey(row);
    if (!key || key.startsWith('|')) continue;
    const existing = result.get(key);
    if (!existing || String(row.verifiedAt || '') > String(existing.verifiedAt || '')) result.set(key, row);
  }
  return [...result.values()];
}

export function mergeContactCandidateHistory({ previousContacts = [], currentContacts = [], acquisitionResults = [], attemptedAt = '' } = {}) {
  const previous = normalizeContacts(previousContacts);
  const current = normalizeContacts(currentContacts);
  const results = normalizeResults(acquisitionResults);
  const previousByOrg = byOrganization(previous);
  const currentByOrg = byOrganization(current);
  const resultByOrg = new Map(results.map((row) => [String(row.organizationId || '').trim(), row]));
  const organizationIds = new Set([...previousByOrg.keys(), ...currentByOrg.keys(), ...resultByOrg.keys()]);
  const merged = [];
  const carryForwardOrganizations = [];

  for (const organizationId of organizationIds) {
    const fresh = currentByOrg.get(organizationId) || [];
    const prior = previousByOrg.get(organizationId) || [];
    const acquisition = resultByOrg.get(organizationId) || null;

    if (fresh.length) {
      merged.push(...fresh.map((contact) => ({ ...contact, carryForward: false })));
      continue;
    }

    const status = String(acquisition?.status || acquisition?.decision || '').trim();
    if (!prior.length || !TECHNICAL_CARRY_FORWARD_STATUSES.has(status)) continue;

    carryForwardOrganizations.push(organizationId);
    merged.push(...prior.map((contact) => ({
      ...contact,
      carryForward: true,
      carryForwardReason: status,
      lastAttemptAt: attemptedAt || acquisition?.attemptedAt || '',
      lastAttemptStatus: status
    })));
  }

  return {
    contacts: dedupe(merged).sort((a, b) => contactKey(a).localeCompare(contactKey(b), 'en')),
    carryForwardOrganizations: [...new Set(carryForwardOrganizations)].sort((a, b) => a.localeCompare(b, 'en')),
    summary: {
      previousContacts: previous.length,
      currentContacts: current.length,
      outputContacts: dedupe(merged).length,
      carryForwardOrganizations: new Set(carryForwardOrganizations).size,
      carryForwardContacts: merged.filter((contact) => contact.carryForward).length
    }
  };
}
