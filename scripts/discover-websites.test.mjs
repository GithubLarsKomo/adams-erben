import assert from 'node:assert/strict';
import { buildQuery, scoreCandidate, chooseCandidate } from './discover-websites.mjs';

const org = {
  organizationId: 'test-1',
  name: 'Ratzeburger Ruderclub e.V.',
  city: 'Ratzeburg',
  postalCode: '23909'
};

assert.match(buildQuery(org), /Ratzeburger Ruderclub/);

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

console.log('discover-websites tests passed');
