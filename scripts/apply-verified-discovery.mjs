import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const VERIFIED_DISCOVERY_VERSION = 'manual-verified-discovery/1.0.0';
const REGISTRY_FILE = process.env.VERIFIED_DISCOVERY_REGISTRY_FILE || 'build-private/drv-registry.json';
const GROUND_TRUTH_FILE = process.env.VERIFIED_DISCOVERY_GROUND_TRUTH_FILE || 'scripts/discovery-ground-truth.poc.json';
const OUTPUT_FILE = process.env.VERIFIED_DISCOVERY_OUTPUT_FILE || 'build-private/drv-registry-websites.json';
const REPORT_DIR = process.env.VERIFIED_DISCOVERY_REPORT_DIR || 'artifacts/verified-discovery';
const VERIFIED_AT = process.env.VERIFIED_DISCOVERY_VERIFIED_AT || '2026-08-10T00:00:00.000Z';

function normalizeHost(value = '') {
  return String(value).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

function websiteFromHost(host = '') {
  const normalized = normalizeHost(host);
  return normalized ? `https://${normalized}/` : '';
}

export function applyVerifiedDiscovery({ registry = [], groundTruth = {}, verifiedAt = VERIFIED_AT } = {}) {
  const rows = Array.isArray(registry) ? registry : (registry.organizations || []);
  let applied = 0;
  let retainedMissing = 0;
  let skippedExisting = 0;
  let invalidGroundTruth = 0;

  const organizations = rows.map((record) => {
    if (record.type !== 'club') return record;
    if (record.websiteFromDrv) {
      skippedExisting += 1;
      return record;
    }
    const truth = groundTruth[String(record.organizationId || record.drvId || '')];
    if (!truth) return record;
    if (truth.status === 'none') {
      retainedMissing += 1;
      return {
        ...record,
        websiteStatus: 'missing',
        websiteResolution: {
          sourceType: VERIFIED_DISCOVERY_VERSION,
          status: 'none',
          verifiedAt
        }
      };
    }
    if (truth.status !== 'official' || !Array.isArray(truth.acceptedHosts) || !truth.acceptedHosts.length) {
      invalidGroundTruth += 1;
      return record;
    }
    const host = normalizeHost(truth.acceptedHosts[0]);
    if (!host || host.includes('@') || /\s/.test(host)) {
      invalidGroundTruth += 1;
      return record;
    }
    applied += 1;
    return {
      ...record,
      websiteFromDrv: websiteFromHost(host),
      websiteStatus: 'present',
      websiteResolution: {
        sourceType: VERIFIED_DISCOVERY_VERSION,
        status: 'official',
        acceptedHosts: truth.acceptedHosts.map(normalizeHost).filter(Boolean),
        verifiedAt
      }
    };
  });

  const clubs = organizations.filter((row) => row.type === 'club');
  const report = {
    version: VERIFIED_DISCOVERY_VERSION,
    verifiedAt,
    organizations: organizations.length,
    clubs: clubs.length,
    appliedOfficialWebsites: applied,
    retainedMissing,
    skippedExisting,
    invalidGroundTruth,
    websitesPresentAfterResolution: clubs.filter((row) => row.websiteFromDrv).length,
    websitesMissingAfterResolution: clubs.filter((row) => !row.websiteFromDrv).length
  };
  return { organizations, report };
}

async function main() {
  const registryRaw = JSON.parse(await readFile(REGISTRY_FILE, 'utf8'));
  const groundTruth = JSON.parse(await readFile(GROUND_TRUTH_FILE, 'utf8'));
  const { organizations, report } = applyVerifiedDiscovery({ registry: registryRaw, groundTruth });
  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    version: VERIFIED_DISCOVERY_VERSION,
    organizations
  }, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.md'), `# Verified Website Resolution\n\n- Version: **${report.version}**\n- Vereine: **${report.clubs}**\n- manuell verifizierte Websites übernommen: **${report.appliedOfficialWebsites}**\n- bewusst ohne Website: **${report.retainedMissing}**\n- Websites nach Resolution vorhanden: **${report.websitesPresentAfterResolution}**\n- weiterhin fehlend: **${report.websitesMissingAfterResolution}**\n- ungültige Ground-Truth-Einträge: **${report.invalidGroundTruth}**\n\nDiese Stufe ergänzt ausschließlich Website-Identität für die Acquisition. Sie genehmigt keine Kontaktadresse und verändert keine Routingentscheidung.\n`);
  console.log(`[verified-discovery] applied=${report.appliedOfficialWebsites}; missing=${report.websitesMissingAfterResolution}; invalid=${report.invalidGroundTruth}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
