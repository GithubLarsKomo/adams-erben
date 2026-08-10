import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const BATCH_COUNT = Number(process.env.FULL_MERGE_BATCH_COUNT || 5);
const EXPECTED_ORGANIZATIONS = Number(process.env.FULL_MERGE_EXPECTED_ORGANIZATIONS || 429);
const BASELINE_CONTACTS_FILE = process.env.FULL_MERGE_BASELINE_CONTACTS_FILE || 'build-private/contact-candidates.json';
const RESULTS_DIR = process.env.FULL_MERGE_RESULTS_DIR || 'build-private/full-enrichment-results';
const CURRENT_CONTACTS_FILE = process.env.FULL_MERGE_CURRENT_CONTACTS_FILE || 'build-private/contact-candidates.current.json';
const ACQUISITION_FILE = process.env.FULL_MERGE_ACQUISITION_FILE || 'build-private/contact-acquisition-results.json';
const REPORT_DIR = process.env.FULL_MERGE_REPORT_DIR || 'artifacts/full-enrichment-merge';
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function contactsOf(value) {
  return Array.isArray(value) ? value : (Array.isArray(value?.contacts) ? value.contacts : []);
}

function organizationsOf(value) {
  return Array.isArray(value) ? value : (Array.isArray(value?.organizations) ? value.organizations : []);
}

function contactKey(row = {}) {
  return `${String(row.organizationId || '').trim()}|${String(row.email || '').trim().toLowerCase()}`;
}

function dedupeContacts(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = contactKey(row);
    if (!key || key.startsWith('|')) continue;
    const previous = map.get(key);
    if (!previous || String(row.verifiedAt || '') > String(previous.verifiedAt || '')) map.set(key, row);
  }
  return [...map.values()].sort((a, b) => contactKey(a).localeCompare(contactKey(b), 'en'));
}

export function mergeFullEnrichmentPayloads({ baselineContacts = [], batches = [], expectedOrganizations = EXPECTED_ORGANIZATIONS } = {}) {
  const baseline = contactsOf(baselineContacts);
  const freshContacts = [];
  const acquisitionResults = [];
  const batchSummaries = [];

  for (const batch of batches) {
    const contacts = contactsOf(batch.contacts);
    const organizations = organizationsOf(batch.decisions);
    freshContacts.push(...contacts);
    acquisitionResults.push(...organizations);
    batchSummaries.push({ batch: batch.batch, organizations: organizations.length, contacts: contacts.length });
  }

  const organizationIds = acquisitionResults.map((row) => String(row?.organizationId || '').trim()).filter(Boolean);
  const uniqueOrganizationIds = new Set(organizationIds);
  if (organizationIds.length !== expectedOrganizations) throw new Error(`expected ${expectedOrganizations} acquisition rows, got ${organizationIds.length}`);
  if (uniqueOrganizationIds.size !== expectedOrganizations) throw new Error(`expected ${expectedOrganizations} unique acquisition organizations, got ${uniqueOrganizationIds.size}`);

  const currentContacts = dedupeContacts([...baseline, ...freshContacts]);
  const statusCounts = {};
  for (const row of acquisitionResults) {
    const status = String(row?.status || row?.decision || 'unknown').trim() || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  const report = {
    version: 'full-enrichment-merge/1.0.0',
    batchCount: batches.length,
    acquisitionOrganizations: organizationIds.length,
    uniqueAcquisitionOrganizations: uniqueOrganizationIds.size,
    baselineContacts: baseline.length,
    freshBatchContacts: freshContacts.length,
    currentContacts: currentContacts.length,
    statusCounts,
    batches: batchSummaries
  };
  if (EMAIL_PATTERN.test(JSON.stringify(report))) throw new Error('public merge report must not expose email addresses');

  return {
    currentPayload: { contacts: currentContacts },
    acquisitionPayload: { organizations: acquisitionResults },
    report
  };
}

function reportMarkdown(report) {
  const batches = report.batches.map((row) => `| ${row.batch} | ${row.organizations} | ${row.contacts} |`).join('\n');
  const statuses = Object.entries(report.statusCounts).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([status, count]) => `| ${status} | ${count} |`).join('\n');
  return `# Full Enrichment Merge – Quality Report\n\n- Batches: **${report.batchCount}**\n- Acquisition-Organisationen: **${report.acquisitionOrganizations}**\n- eindeutige Acquisition-Organisationen: **${report.uniqueAcquisitionOrganizations}**\n- Baseline-Kandidaten: **${report.baselineContacts}**\n- frische Batch-Kandidaten: **${report.freshBatchContacts}**\n- aktuelle deduplizierte Kandidaten: **${report.currentContacts}**\n\n## Batches\n\n| Batch | Organisationen | Kandidaten |\n| ---: | ---: | ---: |\n${batches}\n\n## Acquisition-Status\n\n| Status | Anzahl |\n| --- | ---: |\n${statuses}\n\nDer öffentliche Report enthält weder E-Mail-Adressen noch E-Mail-Domains. Die privaten Kandidaten verbleiben ausschließlich im Acquisition-Runner.\n`;
}

async function main() {
  if (!Number.isInteger(BATCH_COUNT) || BATCH_COUNT < 1) throw new Error('FULL_MERGE_BATCH_COUNT must be a positive integer');
  const baseline = await readJson(BASELINE_CONTACTS_FILE);
  const batches = [];
  for (let batch = 1; batch <= BATCH_COUNT; batch += 1) {
    batches.push({
      batch,
      contacts: await readJson(path.join(RESULTS_DIR, `batch-${batch}-contacts.json`)),
      decisions: await readJson(path.join(RESULTS_DIR, `batch-${batch}-decisions.json`))
    });
  }
  const merged = mergeFullEnrichmentPayloads({ baselineContacts: baseline, batches, expectedOrganizations: EXPECTED_ORGANIZATIONS });
  await mkdir(path.dirname(CURRENT_CONTACTS_FILE), { recursive: true });
  await mkdir(path.dirname(ACQUISITION_FILE), { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(CURRENT_CONTACTS_FILE, JSON.stringify(merged.currentPayload, null, 2));
  await writeFile(ACQUISITION_FILE, JSON.stringify(merged.acquisitionPayload, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.json'), JSON.stringify(merged.report, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.md'), reportMarkdown(merged.report));
  console.log(`[full-enrichment-merge] organizations=${merged.report.uniqueAcquisitionOrganizations}; baseline=${merged.report.baselineContacts}; fresh=${merged.report.freshBatchContacts}; current=${merged.report.currentContacts}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
