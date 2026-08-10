import assert from 'node:assert/strict';
import { buildSnapshot } from './build-snapshot.mjs';
import { suppressionIdentifier } from './lib/contact-governance.mjs';

const now = new Date('2026-08-10T00:00:00.000Z');
const suppressionSecret = 'snapshot-test-secret';
const suppressedEmail = 'info@suppressed-rv.de';
const suppressionHashes = new Set([suppressionIdentifier(suppressedEmail, suppressionSecret)]);

function record(overrides) {
  const state = overrides.state ?? 'Bayern';
  return {
    organizationId: overrides.drvId || overrides.organizationId,
    id: overrides.id,
    drvId: overrides.drvId || overrides.organizationId,
    name: overrides.name,
    type: overrides.type || 'club',
    city: overrides.city ?? 'Musterstadt',
    citySource: 'test',
    postalCode: overrides.postalCode ?? '12345',
    state,
    states: overrides.states ?? (state ? [state] : []),
    drvProfileUrl: `https://www.rudern.de/service/vereine/${overrides.id}`,
    websiteFromDrv: overrides.websiteFromDrv || '',
    websiteStatus: overrides.websiteFromDrv ? 'present' : 'missing',
    emailFromDrv: overrides.emailFromDrv || '',
    featured: false,
    fetchedAt: overrides.fetchedAt || '2026-08-01T00:00:00.000Z',
    sourceType: 'drv-profile',
    sourceUrl: `https://www.rudern.de/service/vereine/${overrides.id}`,
    parserVersion: 'test'
  };
}

const registry = [
  record({
    id: 'lrv-bayern', drvId: '30011', name: 'Bayerischer Ruderverband e.V.', type: 'lrv',
    state: 'Bayern', states: ['Bayern'], websiteFromDrv: 'https://www.ruderverband-bayern.de/',
    emailFromDrv: 'geschaeftsstelle@ruderverband-bayern.de'
  }),
  record({
    id: 'direct-rv', drvId: '10001', name: 'Direkter Ruderverein e.V.',
    websiteFromDrv: 'https://direct-rv.de/', emailFromDrv: 'info@direct-rv.de'
  }),
  record({
    id: 'personal-rv', drvId: '10002', name: 'Persönlicher Ruderverein e.V.',
    websiteFromDrv: 'https://personal-rv.de/', emailFromDrv: 'max.mustermann@personal-rv.de'
  }),
  record({
    id: 'suppressed-rv', drvId: '10003', name: 'Unterdrückter Ruderverein e.V.',
    websiteFromDrv: 'https://suppressed-rv.de/', emailFromDrv: suppressedEmail
  }),
  record({
    id: 'no-state-rv', drvId: '10004', name: 'Ruderverein ohne LRV e.V.', state: '', states: [],
    websiteFromDrv: 'https://nostate-rv.de/', emailFromDrv: 'max.mustermann@nostate-rv.de'
  }),
  record({
    id: 'web-enriched-rv', drvId: '10005', name: 'Web Enriched Ruderverein e.V.',
    websiteFromDrv: 'https://web-enriched-rv.de/', emailFromDrv: ''
  }),
  record({
    id: 'expired-rv', drvId: '10006', name: 'Alter Ruderverein e.V.',
    websiteFromDrv: 'https://expired-rv.de/', emailFromDrv: 'info@expired-rv.de',
    fetchedAt: '2025-10-01T00:00:00.000Z'
  })
];

const externalCandidates = [
  {
    organizationId: '10005',
    email: 'kontakt@web-enriched-rv.de',
    website: 'https://web-enriched-rv.de/',
    sourceType: 'club-website',
    sourceUrl: 'https://web-enriched-rv.de/kontakt',
    verifiedAt: '2026-08-05T00:00:00.000Z',
    context: 'Kontakt Geschäftsstelle'
  },
  {
    organizationId: '10002',
    email: 'vorsitzender@web.de',
    website: 'https://personal-rv.de/',
    sourceType: 'club-website',
    sourceUrl: 'https://personal-rv.de/vorstand',
    verifiedAt: '2026-08-05T00:00:00.000Z',
    context: '1. Vorsitzender'
  }
];

const result = buildSnapshot({ registry, externalCandidates, suppressionHashes, suppressionSecret, now });

assert.equal(result.recipients['direct-rv'].routeLevel, 'club');
assert.equal(result.recipients['direct-rv'].email, 'info@direct-rv.de');
assert.equal(result.recipients['direct-rv'].policyVersion, '1.0.0');

// A personalized DRV address does not auto-route, but a separately verified
// role alias from the official club site may do so.
assert.equal(result.recipients['personal-rv'].routeLevel, 'club');
assert.equal(result.recipients['personal-rv'].email, 'vorsitzender@web.de');

// Suppression overrides an otherwise valid direct address and falls back to LRV.
assert.equal(result.recipients['suppressed-rv'].routeLevel, 'lrv');
assert.equal(result.recipients['suppressed-rv'].routeOrganizationId, '30011');
assert.equal(result.decisions.find((item) => item.id === 'suppressed-rv').suppressedCandidateCount, 1);

// Personal contact with no usable state cannot bypass governance and reaches DRV.
assert.equal(result.recipients['no-state-rv'].routeLevel, 'drv');
assert.equal(result.recipients['no-state-rv'].routeOrganizationId, 'drv');

// Website enrichment can add a safe direct route even when DRV has no email.
assert.equal(result.recipients['web-enriched-rv'].routeLevel, 'club');
assert.equal(result.recipients['web-enriched-rv'].email, 'kontakt@web-enriched-rv.de');

// Expired candidate is no longer direct and falls back to LRV.
assert.equal(result.recipients['expired-rv'].routeLevel, 'lrv');
assert.equal(result.decisions.find((item) => item.id === 'expired-rv').staleCandidateCount, 1);

assert.equal(result.report.registryOrganizations, 7);
assert.equal(result.report.publicOrganizations, 8);
assert.equal(result.report.routeCounts.club, 3);
assert.equal(result.report.routeCounts.lrv, 3); // LRV itself + two club fallbacks
assert.equal(result.report.routeCounts.drv, 1);
assert.equal(result.report.organizationsWithSuppressedCandidates, 1);
assert.equal(result.report.organizationsWithStaleCandidates, 1);

const publicJson = JSON.stringify({ organizations: result.organizations, report: result.report });
assert.equal(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(publicJson), false);
assert.equal(publicJson.includes('max.mustermann'), false);

console.log('approved snapshot tests passed');
