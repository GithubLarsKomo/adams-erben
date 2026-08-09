import assert from 'node:assert/strict';
import {
  buildQuery,
  chooseCandidate,
  evaluateGroundTruth,
  normalizeGroundTruthEntry,
  scoreCandidate
} from './discover-websites.mjs';

const org = {
  organizationId: 'test-1',
  name: 'Ratzeburger Ruderclub e.V.',
  city: 'Ratzeburg',
  postalCode: '23909'
};

const query = buildQuery(org);
assert.match(query, /Ratzeburger Ruderclub/);
assert.match(query, /23909/);
assert.match(query, /Ratzeburg/);

const official = scoreCandidate(org, {
  rank: 1,
  url: 'https://www.rrc-online.de/',
  title: 'Ratzeburger Ruderclub e.V.',
  description: 'Rudern in Ratzeburg, 23909'
});
assert.equal(official.disposition, 'auto-accept');
assert.ok(official.score >= 0.78);

const social = scoreCandidate(org, {
  rank: 1,
  url: 'https://www.facebook.com/ratzeburgerruderclub',
  title: 'Ratzeburger Ruderclub',
  description: 'Facebook'
});
assert.equal(social.disposition, 'reject');

const directory = scoreCandidate(org, {
  rank: 1,
  url: 'https://example.org/vereinsverzeichnis/ratzeburger-ruderclub',
  title: 'Vereinsverzeichnis Ratzeburger Ruderclub',
  description: 'Sportvereine in Ratzeburg'
});
assert.notEqual(directory.disposition, 'auto-accept');

const ambiguous = chooseCandidate(org, [
  {
    rank: 1,
    url: 'https://ratzeburger-ruderclub.example/',
    title: 'Ratzeburger Ruderclub',
    description: 'Rudern in Ratzeburg 23909'
  },
  {
    rank: 2,
    url: 'https://rrc-ratzeburg.example/',
    title: 'Ratzeburger Ruderclub',
    description: 'Rudern in Ratzeburg 23909'
  }
]);
assert.equal(ambiguous.disposition, 'review');
assert.equal(ambiguous.reason, 'ambiguous_top_candidates');

assert.deepEqual(normalizeGroundTruthEntry('https://www.rrc-online.de/'), {
  status: 'official',
  acceptedHosts: ['rrc-online.de']
});
assert.deepEqual(normalizeGroundTruthEntry(['https://scdhfk.de/', 'https://scdhfk-rudern.de/']), {
  status: 'official',
  acceptedHosts: ['scdhfk.de', 'scdhfk-rudern.de']
});
assert.deepEqual(normalizeGroundTruthEntry({ status: 'none' }), {
  status: 'none',
  acceptedHosts: [],
  note: ''
});

const officialDecision = {
  organizationId: 'official',
  name: 'SC DHfK Leipzig e.V., Abteilung Rudern',
  disposition: 'auto-accept',
  best: { url: 'https://scdhfk-rudern.de/', score: 0.9 }
};
const noneDecision = {
  organizationId: 'none',
  name: 'Ruderclub Mülheim 1977',
  disposition: 'auto-accept',
  best: { url: 'https://muelheimer-rg.de/', score: 0.91 }
};
const ambiguousDecision = {
  organizationId: 'ambiguous',
  name: 'Ruderriege Schaumburgia',
  disposition: 'review',
  best: { url: 'https://www.rrschaumburgia.de/', score: 0.76 }
};

const evaluation = evaluateGroundTruth(
  [officialDecision, noneDecision, ambiguousDecision],
  {
    official: { status: 'official', acceptedHosts: ['scdhfk.de', 'scdhfk-rudern.de'] },
    none: { status: 'none', note: 'keine eigenständige offizielle Website verifiziert' },
    ambiguous: { status: 'ambiguous', acceptedHosts: ['rrschaumburgia.de'] }
  }
);
assert.equal(evaluation.summary.groundTruthKnown, 3);
assert.equal(evaluation.summary.groundTruthOfficial, 1);
assert.equal(evaluation.summary.groundTruthNone, 1);
assert.equal(evaluation.summary.groundTruthAmbiguous, 1);
assert.equal(evaluation.summary.autoAccepted, 2);
assert.equal(evaluation.summary.autoAcceptedCorrect, 1);
assert.equal(evaluation.summary.autoAcceptedWrong, 1);
assert.equal(evaluation.summary.autoAcceptPrecisionPct, 50);
assert.equal(evaluation.summary.reviewRequired, 1);

console.log('discover-websites tests passed');
