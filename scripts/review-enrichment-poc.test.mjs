import assert from 'node:assert/strict';
import { classifyContact, reviewOrganization } from './review-enrichment-poc.mjs';

const clubSite = 'https://www.beispiel-ruderverein.de/';

const sameDomainInfo = classifyContact({
  email: 'info@beispiel-ruderverein.de',
  kind: 'functional',
  context: 'Kontakt Geschäftsstelle'
}, clubSite);
assert.equal(sameDomainInfo.disposition, 'direct-functional');

const externalRoleAlias = classifyContact({
  email: 'vorsitzender@web.de',
  kind: 'personal',
  context: '1. Vorsitzender'
}, clubSite);
assert.equal(externalRoleAlias.disposition, 'direct-functional');

const externalGeneric = classifyContact({
  email: 'info@fremde-domain.de',
  kind: 'functional',
  context: 'Allgemeiner Kontakt'
}, clubSite);
assert.equal(externalGeneric.disposition, 'review-external-functional');

const catering = classifyContact({
  email: 'info@catering-muster.de',
  kind: 'functional',
  context: 'Gastronomie und Catering im Bootshaus'
}, clubSite);
assert.equal(catering.disposition, 'review-third-party');

const personalRole = classifyContact({
  email: 'max.mustermann@t-online.de',
  kind: 'personal',
  context: 'Ruderwart Max Mustermann',
  role: 'Ruderwart'
}, clubSite);
assert.equal(personalRole.disposition, 'review-personal-role');

const org = reviewOrganization({
  organizationId: 'testverein',
  name: 'Test Ruderverein e.V.',
  website: clubSite,
  contacts: [
    { email: 'info@catering-muster.de', kind: 'functional', context: 'Catering und Gastronomie' },
    { email: 'info@beispiel-ruderverein.de', kind: 'functional', context: 'Geschäftsstelle' }
  ]
});
assert.equal(org.disposition, 'direct-functional');
assert.equal(org.preferredContact.email, 'info@beispiel-ruderverein.de');
assert.equal(org.thirdPartyCandidateCount, 1);

console.log('review-enrichment-poc tests passed');
