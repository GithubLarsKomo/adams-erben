import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { mergeContactCandidateHistory } from './lib/contact-candidate-history.mjs';

const PREVIOUS_FILE = process.env.CONTACT_HISTORY_PREVIOUS_FILE || '';
const CURRENT_FILE = process.env.CONTACT_HISTORY_CURRENT_FILE || 'build-private/contact-candidates.current.json';
const ACQUISITION_FILE = process.env.CONTACT_HISTORY_ACQUISITION_FILE || 'build-private/contact-acquisition-results.json';
const OUTPUT_FILE = process.env.CONTACT_HISTORY_OUTPUT_FILE || 'build-private/contact-candidates.merged.json';
const REPORT_DIR = process.env.CONTACT_HISTORY_REPORT_DIR || 'artifacts/contact-history';
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

async function readOptionalJson(file, fallback) {
  if (!file) return fallback;
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

function normalizeContacts(value) {
  return Array.isArray(value) ? value : (Array.isArray(value?.contacts) ? value.contacts : []);
}

function normalizeResults(value) {
  return Array.isArray(value) ? value : (Array.isArray(value?.organizations) ? value.organizations : []);
}

function statusFor(row = {}) {
  return String(row.status || row.decision || '').trim();
}

function publicReport({ attemptedAt, previousContacts, currentContacts, acquisitionResults, merged }) {
  const statusByOrganization = new Map(
    acquisitionResults
      .map((row) => [String(row?.organizationId || '').trim(), statusFor(row)])
      .filter(([organizationId]) => organizationId)
  );
  const carriedCountByOrganization = new Map();
  for (const contact of merged.contacts.filter((row) => row.carryForward)) {
    const organizationId = String(contact.organizationId || '').trim();
    carriedCountByOrganization.set(organizationId, (carriedCountByOrganization.get(organizationId) || 0) + 1);
  }
  const organizations = merged.carryForwardOrganizations.map((organizationId) => ({
    organizationId,
    acquisitionStatus: statusByOrganization.get(organizationId) || '',
    carriedContactCount: carriedCountByOrganization.get(organizationId) || 0
  }));
  const report = {
    generatedAt: attemptedAt,
    previousContacts: previousContacts.length,
    currentContacts: currentContacts.length,
    acquisitionOrganizations: new Set(acquisitionResults.map((row) => String(row?.organizationId || '').trim()).filter(Boolean)).size,
    outputContacts: merged.summary.outputContacts,
    carryForwardOrganizations: merged.summary.carryForwardOrganizations,
    carryForwardContacts: merged.summary.carryForwardContacts,
    organizations
  };
  if (EMAIL_PATTERN.test(JSON.stringify(report))) throw new Error('contact history report must not expose email addresses');
  return report;
}

export function buildContactHistoryArtifacts({ previousContacts = [], currentContacts = [], acquisitionResults = [], attemptedAt = new Date().toISOString() } = {}) {
  const previous = normalizeContacts(previousContacts);
  const current = normalizeContacts(currentContacts);
  const acquisition = normalizeResults(acquisitionResults);
  const merged = mergeContactCandidateHistory({
    previousContacts: previous,
    currentContacts: current,
    acquisitionResults: acquisition,
    attemptedAt
  });
  const report = publicReport({ attemptedAt, previousContacts: previous, currentContacts: current, acquisitionResults: acquisition, merged });
  return {
    privatePayload: {
      generatedAt: attemptedAt,
      contacts: merged.contacts
    },
    report
  };
}

function reportMarkdown(report) {
  const rows = report.organizations.length
    ? report.organizations.map((row) => `| ${row.organizationId} | ${row.acquisitionStatus || '–'} | ${row.carriedContactCount} |`).join('\n')
    : '| – | – | 0 |';
  return `# Contact Candidate History – Quality Report\n\n- vorherige private Kandidaten: **${report.previousContacts}**\n- aktuelle private Kandidaten: **${report.currentContacts}**\n- Acquisition-Organisationen: **${report.acquisitionOrganizations}**\n- zusammengeführte private Kandidaten: **${report.outputContacts}**\n- Carry-forward-Organisationen: **${report.carryForwardOrganizations}**\n- Carry-forward-Kandidaten: **${report.carryForwardContacts}**\n\n## Technischer Carry-forward\n\n| DRV-ID | Acquisition-Status | Kandidaten |\n| --- | --- | ---: |\n${rows}\n\nDer öffentliche Report enthält weder E-Mail-Adressen noch E-Mail-Domains. Carry-forward erneuert \`verifiedAt\` nicht; Lifecycle, Suppression und Korrekturen werden weiterhin im Snapshot ausgewertet.\n`;
}

async function main() {
  const attemptedAt = process.env.CONTACT_HISTORY_ATTEMPTED_AT || new Date().toISOString();
  const previous = await readOptionalJson(PREVIOUS_FILE, { contacts: [] });
  const current = await readOptionalJson(CURRENT_FILE, { contacts: [] });
  const acquisition = await readOptionalJson(ACQUISITION_FILE, { organizations: [] });
  const { privatePayload, report } = buildContactHistoryArtifacts({
    previousContacts: previous,
    currentContacts: current,
    acquisitionResults: acquisition,
    attemptedAt
  });

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(privatePayload, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.md'), reportMarkdown(report));
  console.log(`[contact-history] previous=${report.previousContacts}; current=${report.currentContacts}; output=${report.outputContacts}; carry=${report.carryForwardOrganizations}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
