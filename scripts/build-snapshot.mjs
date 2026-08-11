import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  CONTACT_POLICY_VERSION,
  evaluateSnapshotEligibility,
  suppressionIdentifier
} from './lib/contact-governance.mjs';
import { publicOrganizationFromRegistry } from './lib/drv-registry.mjs';
import { lrvIdentityHints } from './lib/lrv-identity.mjs';

const REGISTRY_FILE = process.env.SNAPSHOT_REGISTRY_FILE || 'build-private/drv-registry.json';
const CANDIDATES_FILE = process.env.SNAPSHOT_CONTACT_CANDIDATES_FILE || 'build-private/contact-candidates.json';
const SUPPRESSION_FILE = process.env.CONTACT_SUPPRESSION_FILE || '';
const PUBLIC_FILE = process.env.SNAPSHOT_PUBLIC_FILE || 'dist/data/clubs.json';
const RECIPIENTS_FILE = process.env.SNAPSHOT_RECIPIENTS_FILE || 'build-private/recipients.json';
const DECISIONS_FILE = process.env.SNAPSHOT_DECISIONS_FILE || 'build-private/snapshot-decisions.json';
const REPORT_DIR = process.env.SNAPSHOT_REPORT_DIR || 'artifacts/snapshot';

const DRV_DIRECTORY_CONTACT = {
  id: 'deutscher-ruderverband',
  organizationId: 'drv',
  name: 'Deutscher Ruderverband e.V.',
  email: process.env.DRV_FALLBACK_EMAIL || 'info@rudern.de',
  sourceUrl: 'https://www.rudern.de/verband/geschaeftsstelle',
  website: 'https://www.rudern.de/'
};

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

async function readOptionalJson(file, fallback) {
  if (!file) return fallback;
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

function normalizedSuppressionHashes(raw) {
  const values = Array.isArray(raw) ? raw : (raw?.suppressed || raw?.hashes || []);
  const result = new Set();
  for (const value of values) {
    const hash = String(value || '').trim().toLowerCase();
    if (!hash) continue;
    if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error('suppression file may contain only SHA-256 HMAC identifiers');
    result.add(hash);
  }
  return result;
}

function groupExternalCandidates(raw) {
  const rows = Array.isArray(raw) ? raw : (raw?.contacts || []);
  const byOrganization = new Map();
  for (const row of rows) {
    const organizationId = String(row?.organizationId || '').trim();
    if (!organizationId || !row?.email) continue;
    const list = byOrganization.get(organizationId) || [];
    list.push({ ...row, sourceType: row.sourceType || 'club-website' });
    byOrganization.set(organizationId, list);
  }
  return byOrganization;
}

function sourcePriority(candidate) {
  switch (candidate.sourceType) {
    case 'club-website': return 30;
    case 'manual-correction': return 40;
    case 'drv-profile': return 20;
    default: return 10;
  }
}

function verifiedTimestamp(value) {
  const stamp = new Date(value || '').getTime();
  return Number.isFinite(stamp) ? stamp : 0;
}

function sortEvaluated(a, b) {
  if (a.snapshotEligible !== b.snapshotEligible) return a.snapshotEligible ? -1 : 1;
  if (a.rank !== b.rank) return b.rank - a.rank;
  const sourceDiff = sourcePriority(b) - sourcePriority(a);
  if (sourceDiff) return sourceDiff;
  return verifiedTimestamp(b.verifiedAt) - verifiedTimestamp(a.verifiedAt);
}

function suppressionState(email, suppressionHashes, suppressionSecret) {
  if (!suppressionHashes.size) return false;
  if (!suppressionSecret) throw new Error('CONTACT_SUPPRESSION_KEY is required when CONTACT_SUPPRESSION_FILE contains entries');
  return suppressionHashes.has(suppressionIdentifier(email, suppressionSecret));
}

function identityHints(record) {
  return record.type === 'lrv' ? lrvIdentityHints(record) : {
    website: '',
    contactDomains: [],
    functionalLocalParts: [],
    verificationSource: ''
  };
}

function registryCandidate(record, identity) {
  if (!record.emailFromDrv) return null;
  return {
    organizationId: record.organizationId,
    email: record.emailFromDrv,
    website: record.websiteFromDrv || identity.website || '',
    sourceType: 'drv-profile',
    sourceUrl: record.sourceUrl,
    verifiedAt: record.fetchedAt,
    context: 'Öffentliche E-Mail-Angabe im DRV-Profil'
  };
}

function evaluateCandidates(record, external, suppressionHashes, suppressionSecret, now) {
  const candidates = [];
  const identity = identityHints(record);
  const drv = registryCandidate(record, identity);
  if (drv) candidates.push(drv);
  for (const candidate of external || []) candidates.push(candidate);

  return candidates.map((candidate) => {
    const website = candidate.website || record.websiteFromDrv || identity.website || '';
    const suppressed = suppressionState(candidate.email, suppressionHashes, suppressionSecret);
    return {
      ...evaluateSnapshotEligibility(candidate, website, {
        verifiedAt: candidate.verifiedAt,
        suppressed,
        now,
        trustedDomains: identity.contactDomains,
        trustedFunctionalLocalParts: identity.functionalLocalParts
      }),
      organizationId: record.organizationId,
      website,
      sourceType: candidate.sourceType || 'unknown',
      sourceUrl: candidate.sourceUrl || '',
      verifiedAt: candidate.verifiedAt || '',
      identityVerificationSource: identity.verificationSource || ''
    };
  }).sort(sortEvaluated);
}

function publicDecision(decision) {
  return {
    id: decision.id,
    organizationId: decision.organizationId,
    type: decision.type,
    routeLevel: decision.routeLevel,
    routeOrganizationId: decision.routeOrganizationId,
    decisionReason: decision.decisionReason,
    directCandidateApproved: decision.directCandidateApproved,
    reviewedCandidateCount: decision.reviewedCandidateCount,
    suppressedCandidateCount: decision.suppressedCandidateCount,
    staleCandidateCount: decision.staleCandidateCount
  };
}

export function buildSnapshot({
  registry,
  externalCandidates = [],
  suppressionHashes = new Set(),
  suppressionSecret = '',
  now = new Date(),
  drvContact = DRV_DIRECTORY_CONTACT
}) {
  const records = normalizeArray(registry);
  const externalByOrganization = externalCandidates instanceof Map ? externalCandidates : groupExternalCandidates(externalCandidates);
  const evaluatedByOrganization = new Map();

  for (const record of records) {
    evaluatedByOrganization.set(
      record.organizationId,
      evaluateCandidates(record, externalByOrganization.get(record.organizationId) || [], suppressionHashes, suppressionSecret, now)
    );
  }

  const recipients = {};
  const organizations = [];
  const decisions = [];

  for (const record of records) {
    const evaluated = evaluatedByOrganization.get(record.organizationId) || [];
    const direct = evaluated.find((candidate) => candidate.snapshotEligible) || null;
    const suppressedCount = evaluated.filter((candidate) => candidate.governanceState === 'suppressed').length;
    const staleCount = evaluated.filter((candidate) => ['stale', 'expired'].includes(candidate.lifecycleState) || candidate.governanceState === 'stale').length;
    const routeLevel = direct ? (record.type === 'lrv' ? 'lrv' : 'club') : 'none';
    const routeOrganizationId = direct ? record.organizationId : '';
    const routeOrganizationName = direct ? record.name : '';
    const decisionReason = direct ? direct.reason : (evaluated.length ? 'no_eligible_direct_contact' : 'no_direct_contact_candidate');

    if (direct) {
      recipients[record.id] = {
        organizationName: record.name,
        organizationId: record.organizationId,
        state: record.state,
        states: record.states,
        routeLevel,
        email: direct.email,
        routeOrganizationId: record.organizationId,
        routeOrganizationName: record.name,
        sourceUrl: direct.sourceUrl,
        verifiedAt: direct.verifiedAt,
        policyVersion: CONTACT_POLICY_VERSION,
        decisionReason
      };
    }

    const identity = identityHints(record);
    const publicRecord = record.type === 'lrv' && !record.websiteFromDrv && identity.website
      ? { ...record, websiteFromDrv: identity.website, websiteStatus: 'present' }
      : record;
    organizations.push({
      ...publicOrganizationFromRegistry(publicRecord, routeLevel, Boolean(direct)),
      latitude: Number.isFinite(Number(record.latitude)) ? Number(record.latitude) : null,
      longitude: Number.isFinite(Number(record.longitude)) ? Number(record.longitude) : null
    });
    decisions.push({
      id: record.id,
      organizationId: record.organizationId,
      name: record.name,
      type: record.type,
      routeLevel,
      routeOrganizationId,
      routeOrganizationName,
      decisionReason,
      directCandidateApproved: Boolean(direct),
      reviewedCandidateCount: evaluated.length,
      suppressedCandidateCount: suppressedCount,
      staleCandidateCount: staleCount,
      candidates: evaluated
    });
  }

  organizations.push({
    id: drvContact.id,
    organizationId: drvContact.organizationId,
    name: drvContact.name,
    drvId: '',
    type: 'drv',
    city: 'Hannover',
    postalCode: '30169',
    state: 'Niedersachsen',
    states: ['Niedersachsen'],
    website: drvContact.website,
    profileUrl: drvContact.sourceUrl,
    websiteStatus: 'present',
    hasDirectContact: true,
    contactRouteLevel: 'drv',
    featured: false
  });
  recipients[drvContact.id] = {
    organizationName: drvContact.name,
    organizationId: drvContact.organizationId,
    state: 'Niedersachsen',
    states: ['Niedersachsen'],
    routeLevel: 'drv',
    email: drvContact.email,
    routeOrganizationId: drvContact.organizationId,
    routeOrganizationName: drvContact.name,
    sourceUrl: drvContact.sourceUrl,
    verifiedAt: now.toISOString(),
    policyVersion: CONTACT_POLICY_VERSION,
    decisionReason: 'system_direct_drv_contact'
  };

  organizations.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const rank = { club: 0, member: 1, lrv: 2, drv: 3 };
    if (rank[a.type] !== rank[b.type]) return rank[a.type] - rank[b.type];
    return a.name.localeCompare(b.name, 'de');
  });

  const routeCounts = {
    club: decisions.filter((item) => item.routeLevel === 'club').length,
    lrv: decisions.filter((item) => item.routeLevel === 'lrv').length,
    drv: decisions.filter((item) => item.routeLevel === 'drv').length,
    none: decisions.filter((item) => item.routeLevel === 'none').length
  };
  const report = {
    generatedAt: now.toISOString(),
    policyVersion: CONTACT_POLICY_VERSION,
    registryOrganizations: records.length,
    publicOrganizations: organizations.length,
    directApproved: decisions.filter((item) => item.directCandidateApproved).length,
    lrvIdentityHintsApplied: records.filter((record) => record.type === 'lrv' && Boolean(lrvIdentityHints(record).verificationSource)).length,
    routeCounts,
    organizationsWithSuppressedCandidates: decisions.filter((item) => item.suppressedCandidateCount > 0).length,
    organizationsWithStaleCandidates: decisions.filter((item) => item.staleCandidateCount > 0).length,
    organizationsWithReviewedCandidates: decisions.filter((item) => item.reviewedCandidateCount > 0).length,
    decisions: decisions.map(publicDecision)
  };

  return { organizations, recipients, decisions, report };
}

function reportMarkdown(report) {
  return `# Approved Snapshot – Quality Report\n\nStand: ${report.generatedAt}\n\n- Contact-Governance-Policy: **${report.policyVersion}**\n- Registry-Organisationen: **${report.registryOrganizations}**\n- öffentliche Organisationen inkl. DRV: **${report.publicOrganizations}**\n- direkt freigegebene Organisationskontakte: **${report.directApproved}**\n- verifizierte LRV-Identitätshinweise angewendet: **${report.lrvIdentityHintsApplied || 0}**\n- direkte Kontakte Verein/Organisation: **${report.routeCounts.club}**\n- direkte Kontakte LRV: **${report.routeCounts.lrv}**\n- direkte Kontakte DRV aus Registry: **${report.routeCounts.drv}**\n- ohne direkten Kontakt: **${report.routeCounts.none}**\n- Organisationen mit unterdrückten Kandidaten: **${report.organizationsWithSuppressedCandidates}**\n- Organisationen mit stale Kandidaten: **${report.organizationsWithStaleCandidates}**\n\nDer öffentliche Snapshot und dieser Report enthalten keine E-Mail-Adressen. E-Mail-Empfänger verbleiben ausschließlich in \`build-private/recipients.json\`. Es gibt kein Fallback-Routing von Vereinen an Landesruderverbände oder den DRV.\n`;
}

async function main() {
  const registryRaw = JSON.parse(await readFile(REGISTRY_FILE, 'utf8'));
  const candidatesRaw = await readOptionalJson(CANDIDATES_FILE, { contacts: [] });
  const suppressionsRaw = await readOptionalJson(SUPPRESSION_FILE, { suppressed: [] });
  const suppressionHashes = normalizedSuppressionHashes(suppressionsRaw);
  const suppressionSecret = process.env.CONTACT_SUPPRESSION_KEY || '';
  const now = process.env.SNAPSHOT_NOW ? new Date(process.env.SNAPSHOT_NOW) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error('SNAPSHOT_NOW is invalid');

  const result = buildSnapshot({
    registry: registryRaw.organizations || registryRaw,
    externalCandidates: groupExternalCandidates(candidatesRaw),
    suppressionHashes,
    suppressionSecret,
    now
  });

  await mkdir(path.dirname(PUBLIC_FILE), { recursive: true });
  await mkdir(path.dirname(RECIPIENTS_FILE), { recursive: true });
  await mkdir(path.dirname(DECISIONS_FILE), { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });

  await writeFile(PUBLIC_FILE, JSON.stringify({
    generatedAt: now.toISOString(),
    source: REGISTRY_FILE,
    sourceLabel: 'Approved Adams Erben snapshot',
    policyVersion: CONTACT_POLICY_VERSION,
    count: result.organizations.length,
    organizations: result.organizations
  }, null, 2));
  await writeFile(RECIPIENTS_FILE, JSON.stringify({
    generatedAt: now.toISOString(),
    policyVersion: CONTACT_POLICY_VERSION,
    routingMode: 'direct-only',
    recipients: result.recipients,
    drv: DRV_DIRECTORY_CONTACT
  }, null, 2));
  await writeFile(DECISIONS_FILE, JSON.stringify({
    generatedAt: now.toISOString(),
    policyVersion: CONTACT_POLICY_VERSION,
    decisions: result.decisions
  }, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.json'), JSON.stringify(result.report, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.md'), reportMarkdown(result.report));

  console.log(`[snapshot] policy=${CONTACT_POLICY_VERSION}; direct=${result.report.directApproved}; club=${result.report.routeCounts.club}; lrv=${result.report.routeCounts.lrv}; none=${result.report.routeCounts.none}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
