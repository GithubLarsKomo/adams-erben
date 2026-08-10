import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const PILOT_SAMPLER_VERSION = 'pilot-100/1.0.0';
const DEFAULT_SEED = 'adams-erben-pilot-100-v1';
const REGISTRY_FILE = process.env.PILOT_REGISTRY_FILE || 'build-private/drv-registry.json';
const SNAPSHOT_FILE = process.env.PILOT_SNAPSHOT_FILE || 'dist/data/clubs.json';
const PRIVATE_OUTPUT = process.env.PILOT_PRIVATE_OUTPUT || 'build-private/pilot-100-input.json';
const REPORT_DIR = process.env.PILOT_REPORT_DIR || 'artifacts/pilot-100';

function stableRank(seed, organizationId) {
  return createHash('sha256')
    .update(`${PILOT_SAMPLER_VERSION}|${seed}|${organizationId}`)
    .digest('hex');
}

function websiteScheme(website = '') {
  if (!website) return 'missing';
  try {
    const protocol = new URL(website).protocol.replace(':', '').toLowerCase();
    return ['http', 'https'].includes(protocol) ? protocol : 'other';
  } catch {
    return 'invalid';
  }
}

function websiteHostClass(website = '') {
  if (!website) return 'missing';
  try {
    const host = new URL(website).hostname.toLowerCase().replace(/^www\./, '');
    const hosted = ['jimdofree.com', 'jimdo.com', 'wixsite.com', 'weebly.com', 'wordpress.com', 'clubdesk.com'];
    return hosted.some((suffix) => host === suffix || host.endsWith(`.${suffix}`)) ? 'hosted-builder' : 'custom-domain';
  } catch {
    return 'invalid';
  }
}

function counter(rows, keyFn) {
  const result = {};
  for (const row of rows) {
    const key = String(keyFn(row) ?? '') || '<missing>';
    result[key] = (result[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b, 'de')));
}

function publicRecord(registry, snapshot) {
  const website = snapshot.website || registry.websiteFromDrv || '';
  return {
    organizationId: registry.organizationId,
    drvId: registry.drvId || '',
    name: registry.name,
    postalCode: registry.postalCode || '',
    city: registry.city || '',
    citySource: registry.citySource || '',
    state: registry.state || '',
    drvProfileUrl: registry.drvProfileUrl || registry.sourceUrl || snapshot.profileUrl || '',
    website,
    websiteStatus: website ? 'present' : 'missing',
    routeLevel: snapshot.contactRouteLevel || 'drv',
    schemeClass: websiteScheme(website),
    hostClass: websiteHostClass(website),
    registryParserVersion: registry.parserVersion || '',
    registryFetchedAt: registry.fetchedAt || '',
    samplerVersion: PILOT_SAMPLER_VERSION
  };
}

function sortedCandidates(rows, seed) {
  return [...rows].sort((a, b) => stableRank(seed, a.organizationId).localeCompare(stableRank(seed, b.organizationId)));
}

function addRows(selected, rows, reason, target) {
  for (const row of rows) {
    if (!selected.has(row.organizationId)) {
      if (selected.size >= target) throw new Error(`pilot mandatory/stratification rules exceed target ${target}`);
      selected.set(row.organizationId, { row, stageReasons: new Set([reason]) });
    } else {
      selected.get(row.organizationId).stageReasons.add(reason);
    }
  }
}

function ensureGroupFloor(selected, rows, groupKey, floor, seed, target, reasonPrefix) {
  const groups = new Map();
  for (const row of rows) {
    const key = groupKey(row);
    if (!key) continue;
    const list = groups.get(key) || [];
    list.push(row);
    groups.set(key, list);
  }
  for (const key of [...groups.keys()].sort((a, b) => String(a).localeCompare(String(b), 'de'))) {
    const population = groups.get(key);
    const required = Math.min(floor, population.length);
    let current = population.filter((row) => selected.has(row.organizationId)).length;
    for (const row of sortedCandidates(population.filter((item) => !selected.has(item.organizationId)), `${seed}|${key}`)) {
      if (current >= required) break;
      addRows(selected, [row], `${reasonPrefix}:${key}`, target);
      current += 1;
    }
  }
}

function ensureRouteFloor(selected, rows, routeLevel, floor, seed, target) {
  const population = rows.filter((row) => row.routeLevel === routeLevel);
  const required = Math.min(floor, population.length);
  let current = population.filter((row) => selected.has(row.organizationId)).length;
  for (const row of sortedCandidates(population.filter((item) => !selected.has(item.organizationId)), `${seed}|route:${routeLevel}`)) {
    if (current >= required) break;
    addRows(selected, [row], `route-floor:${routeLevel}`, target);
    current += 1;
  }
}

function finalReasons(entry) {
  const { row, stageReasons } = entry;
  const reasons = new Set(stageReasons);
  if (row.websiteStatus === 'missing') reasons.add('mandatory:website-missing');
  if (row.routeLevel === 'drv') reasons.add('mandatory:drv-fallback');
  if (!row.state) reasons.add('mandatory:state-missing');
  if (row.schemeClass === 'https') reasons.add('mandatory:https');
  return [...reasons].sort();
}

export function buildPilotSample({ registry, publicOrganizations, target = 100, seed = DEFAULT_SEED, stateFloor = 3, routeFloor = 30 } = {}) {
  const snapshotByOrg = new Map((publicOrganizations || []).filter((row) => row.type === 'club').map((row) => [row.organizationId, row]));
  const clubs = (registry || [])
    .filter((row) => row.type === 'club' && snapshotByOrg.has(row.organizationId))
    .map((row) => publicRecord(row, snapshotByOrg.get(row.organizationId)));

  if (clubs.length < target) throw new Error(`pilot population too small: ${clubs.length} < ${target}`);

  const selected = new Map();
  const mandatorySets = [
    ['mandatory:website-missing', clubs.filter((row) => row.websiteStatus === 'missing')],
    ['mandatory:drv-fallback', clubs.filter((row) => row.routeLevel === 'drv')],
    ['mandatory:state-missing', clubs.filter((row) => !row.state)],
    ['mandatory:https', clubs.filter((row) => row.schemeClass === 'https')]
  ];

  const mandatoryUnion = new Set(mandatorySets.flatMap(([, rows]) => rows.map((row) => row.organizationId)));
  if (mandatoryUnion.size > target) throw new Error(`mandatory pilot strata exceed target: ${mandatoryUnion.size} > ${target}`);

  for (const [reason, rows] of mandatorySets) addRows(selected, sortedCandidates(rows, `${seed}|${reason}`), reason, target);

  ensureGroupFloor(selected, clubs, (row) => row.state, stateFloor, seed, target, 'state-floor');
  ensureRouteFloor(selected, clubs, 'club', routeFloor, seed, target);
  ensureRouteFloor(selected, clubs, 'lrv', routeFloor, seed, target);

  for (const row of sortedCandidates(clubs.filter((item) => !selected.has(item.organizationId)), `${seed}|fill`)) {
    if (selected.size >= target) break;
    addRows(selected, [row], 'deterministic-fill', target);
  }

  if (selected.size !== target) throw new Error(`pilot sample incomplete: ${selected.size}/${target}`);

  const sample = [...selected.values()]
    .map((entry) => ({ ...entry.row, inclusionReasons: finalReasons(entry) }))
    .sort((a, b) => stableRank(seed, a.organizationId).localeCompare(stableRank(seed, b.organizationId)));

  const ids = sample.map((row) => row.organizationId);
  const sampleHash = createHash('sha256').update(ids.join('\n')).digest('hex');
  const populationStates = [...new Set(clubs.map((row) => row.state).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'));

  const report = {
    samplerVersion: PILOT_SAMPLER_VERSION,
    seed,
    target,
    population: clubs.length,
    sample: sample.length,
    sampleHash,
    populationStates,
    sampleStates: [...new Set(sample.map((row) => row.state).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de')),
    stateCounts: counter(sample, (row) => row.state),
    routeCounts: counter(sample, (row) => row.routeLevel),
    websiteStatusCounts: counter(sample, (row) => row.websiteStatus),
    schemeCounts: counter(sample, (row) => row.schemeClass),
    hostClassCounts: counter(sample, (row) => row.hostClass),
    mandatoryPopulation: {
      websiteMissing: clubs.filter((row) => row.websiteStatus === 'missing').length,
      drvFallback: clubs.filter((row) => row.routeLevel === 'drv').length,
      stateMissing: clubs.filter((row) => !row.state).length,
      https: clubs.filter((row) => row.schemeClass === 'https').length
    },
    mandatoryIncluded: {
      websiteMissing: sample.filter((row) => row.websiteStatus === 'missing').length,
      drvFallback: sample.filter((row) => row.routeLevel === 'drv').length,
      stateMissing: sample.filter((row) => !row.state).length,
      https: sample.filter((row) => row.schemeClass === 'https').length
    }
  };

  return { sample, report };
}

function reportMarkdown(report) {
  const stateRows = Object.entries(report.stateCounts).map(([state, count]) => `| ${state} | ${count} |`).join('\n');
  return `# 100er-Pilot – Stichprobenreport\n\n- Sampler: **${report.samplerVersion}**\n- Seed: \`${report.seed}\`\n- Population: **${report.population}**\n- Stichprobe: **${report.sample}**\n- Sample-Hash: \`${report.sampleHash}\`\n- Bundesländer: **${report.sampleStates.length}/${report.populationStates.length}**\n- Website missing: **${report.mandatoryIncluded.websiteMissing}/${report.mandatoryPopulation.websiteMissing}**\n- DRV-Fallback: **${report.mandatoryIncluded.drvFallback}/${report.mandatoryPopulation.drvFallback}**\n- State missing: **${report.mandatoryIncluded.stateMissing}/${report.mandatoryPopulation.stateMissing}**\n- HTTPS: **${report.mandatoryIncluded.https}/${report.mandatoryPopulation.https}**\n\n## Route-Level\n\n${Object.entries(report.routeCounts).map(([key, value]) => `- ${key}: **${value}**`).join('\n')}\n\n## Website-Schema\n\n${Object.entries(report.schemeCounts).map(([key, value]) => `- ${key}: **${value}**`).join('\n')}\n\n## Bundesländer\n\n| Bundesland | Vereine |\n| --- | ---: |\n${stateRows}\n\nDer Report und die Stichprobe sind adressfrei; Kontaktadressen bleiben außerhalb öffentlicher Artefakte.\n`;
}

async function main() {
  const registryRaw = JSON.parse(await readFile(REGISTRY_FILE, 'utf8'));
  const snapshotRaw = JSON.parse(await readFile(SNAPSHOT_FILE, 'utf8'));
  const target = Number(process.env.PILOT_SAMPLE_TARGET || 100);
  const seed = process.env.PILOT_SAMPLE_SEED || DEFAULT_SEED;
  const stateFloor = Number(process.env.PILOT_STATE_FLOOR || 3);
  const routeFloor = Number(process.env.PILOT_ROUTE_FLOOR || 30);
  const { sample, report } = buildPilotSample({
    registry: registryRaw.organizations || registryRaw,
    publicOrganizations: snapshotRaw.organizations || snapshotRaw,
    target,
    seed,
    stateFloor,
    routeFloor
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    samplerVersion: PILOT_SAMPLER_VERSION,
    seed,
    sampleHash: report.sampleHash,
    count: sample.length,
    organizations: sample
  };

  await mkdir(path.dirname(PRIVATE_OUTPUT), { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(PRIVATE_OUTPUT, JSON.stringify(payload, null, 2));
  await writeFile(path.join(REPORT_DIR, 'sample.json'), JSON.stringify(payload, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(REPORT_DIR, 'report.md'), reportMarkdown(report));
  console.log(`[pilot-100] sample=${report.sample}/${report.population}; states=${report.sampleStates.length}/${report.populationStates.length}; missing=${report.mandatoryIncluded.websiteMissing}; drv=${report.mandatoryIncluded.drvFallback}; hash=${report.sampleHash.slice(0, 12)}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
