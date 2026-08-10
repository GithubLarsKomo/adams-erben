import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GERMAN_STATES = new Set([
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen'
]);

const DEFAULT_REQUIRED_STATE_COVERAGE = 0.98;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROUTE_LEVELS = new Set(['club', 'lrv', 'drv']);

function normalizedStates(org) {
  const states = Array.isArray(org?.states) ? org.states.filter(Boolean) : [];
  if (states.length) return states;
  return org?.state ? [org.state] : [];
}

function idFor(org) {
  return org?.id || org?.organizationId || org?.drvId || org?.name || '<unknown>';
}

export function validateDrvOutput(publicData, privateData, options = {}) {
  const requiredStateCoverage = Number.isFinite(options.requiredStateCoverage)
    ? options.requiredStateCoverage
    : DEFAULT_REQUIRED_STATE_COVERAGE;

  const organizations = Array.isArray(publicData?.organizations) ? publicData.organizations : [];
  const recipients = privateData?.recipients && typeof privateData.recipients === 'object'
    ? privateData.recipients
    : {};

  const errors = [];
  const warnings = [];

  if (!organizations.length) errors.push('public organizations list is empty');
  if (Number.isFinite(publicData?.count) && publicData.count !== organizations.length) {
    errors.push(`public count mismatch: count=${publicData.count}, organizations=${organizations.length}`);
  }

  const clubs = organizations.filter((org) => org?.type === 'club');
  const clubsWithValidState = clubs.filter((org) => {
    const states = normalizedStates(org);
    return states.length > 0 && states.every((state) => GERMAN_STATES.has(state));
  });
  const stateCoverage = clubs.length ? clubsWithValidState.length / clubs.length : 0;
  const missingStateIds = clubs
    .filter((org) => {
      const states = normalizedStates(org);
      return !states.length || states.some((state) => !GERMAN_STATES.has(state));
    })
    .map(idFor);

  if (!clubs.length) {
    errors.push('no clubs found in DRV output');
  } else if (stateCoverage < requiredStateCoverage) {
    errors.push(
      `club state coverage ${(stateCoverage * 100).toFixed(1)}% is below required ${(requiredStateCoverage * 100).toFixed(1)}%`
    );
  }
  if (missingStateIds.length) {
    warnings.push(`clubs with missing/invalid state (${missingStateIds.length}): ${missingStateIds.slice(0, 20).join(', ')}${missingStateIds.length > 20 ? ', …' : ''}`);
  }

  const publicIds = organizations.map((org) => org?.id).filter(Boolean);
  const duplicateIds = publicIds.filter((id, index) => publicIds.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`duplicate public organization ids: ${[...new Set(duplicateIds)].join(', ')}`);

  const missingRecipients = [];
  const invalidRecipients = [];
  for (const id of publicIds) {
    const recipient = recipients[id];
    if (!recipient) {
      missingRecipients.push(id);
      continue;
    }
    if (!ROUTE_LEVELS.has(recipient.routeLevel) || !EMAIL_RE.test(String(recipient.email || ''))) {
      invalidRecipients.push(id);
    }
  }

  if (missingRecipients.length) {
    errors.push(`missing routing recipients for ${missingRecipients.length} public organizations: ${missingRecipients.slice(0, 20).join(', ')}${missingRecipients.length > 20 ? ', …' : ''}`);
  }
  if (invalidRecipients.length) {
    errors.push(`invalid route/email for ${invalidRecipients.length} recipients: ${invalidRecipients.slice(0, 20).join(', ')}${invalidRecipients.length > 20 ? ', …' : ''}`);
  }

  const orphanRecipients = Object.keys(recipients).filter((id) => !publicIds.includes(id));
  if (orphanRecipients.length) {
    warnings.push(`orphan private recipient entries (${orphanRecipients.length}): ${orphanRecipients.slice(0, 20).join(', ')}${orphanRecipients.length > 20 ? ', …' : ''}`);
  }

  const routeCounts = { club: 0, lrv: 0, drv: 0 };
  for (const id of publicIds) {
    const level = recipients[id]?.routeLevel;
    if (level in routeCounts) routeCounts[level] += 1;
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics: {
      organizations: organizations.length,
      clubs: clubs.length,
      clubsWithValidState: clubsWithValidState.length,
      stateCoverage,
      recipients: Object.keys(recipients).length,
      routeCounts
    }
  };
}

async function main() {
  const root = process.cwd();
  const publicPath = process.env.DRV_PUBLIC_FILE || path.join(root, 'dist', 'data', 'clubs.json');
  const privatePath = process.env.DRV_RECIPIENTS_FILE || path.join(root, 'build-private', 'recipients.json');
  const requiredStateCoverage = Math.max(
    0,
    Math.min(1, Number(process.env.DRV_SYNC_REQUIRED_STATE_COVERAGE || DEFAULT_REQUIRED_STATE_COVERAGE))
  );

  const [publicRaw, privateRaw] = await Promise.all([
    readFile(publicPath, 'utf8'),
    readFile(privatePath, 'utf8')
  ]);
  const result = validateDrvOutput(JSON.parse(publicRaw), JSON.parse(privateRaw), { requiredStateCoverage });

  for (const warning of result.warnings) console.warn(`[drv-validate] WARN: ${warning}`);
  console.log(
    `[drv-validate] organizations=${result.metrics.organizations}, clubs=${result.metrics.clubs}, ` +
    `stateCoverage=${(result.metrics.stateCoverage * 100).toFixed(1)}%, recipients=${result.metrics.recipients}, ` +
    `routes=club:${result.metrics.routeCounts.club}/lrv:${result.metrics.routeCounts.lrv}/drv:${result.metrics.routeCounts.drv}`
  );

  if (!result.ok) {
    for (const error of result.errors) console.error(`[drv-validate] ERROR: ${error}`);
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) await main();
