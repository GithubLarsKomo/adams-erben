import assert from 'node:assert/strict';
import { classifyContact, reviewOrganization } from './review-enrichment-poc.mjs';

const clubSite = 'https://www.beispiel-ruderverein.de/';

const sameDomainInfo = classifyContact({
  email: 'info@beispiel-ruderverein.de',
  kind: 'functional',
  context: 'Kontakt Geschäftsstelle'
}, clubSite);
assert.equal(sameDomainInfo.disposition, 'direct-functional');
assert.equal(sameDomainInfo.governanceState, 'auto-approved-functional');

const externalRoleAlias = classifyContact({
  email: 'vorsitzender@web.de',
  kind: 'personal',
  context: '1. Vorsitzender'
}, clubSite);
assert.equal(externalRoleAlias.disposition, 'direct-functional');
assert.equal(externalRoleAlias.contactKind, 'role-functional');

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
assert.equal(catering.governanceState, 'excluded-third-party');

const personalRole = classifyContact({
  email: 'max.mustermann@t-online.de',
  kind: 'personal',
  context: 'Ruderwart Max Mustermann',
  role: 'Ruderwart'
}, clubSite);
assert.equal(personalRole.disposition, 'review-personal-role');
assert.equal(personalRole.governanceState, 'review-personal');

const incorrectlyTaggedPersonal = classifyContact({
  email: 'max.mustermann@beispiel-ruderverein.de',
  kind: 'functional',
  context: 'Ruderwart Max Mustermann',
  role: 'Ruderwart'
}, clubSite);
assert.equal(incorrectlyTaggedPersonal.disposition, 'review-personal-role');
assert.equal(incorrectlyTaggedPersonal.governanceState, 'review-personal');
assert.equal(incorrectlyTaggedPersonal.autoApproved, false);

const org = reviewOrganization({
  organizationId: 'testverein',
  name: 'Test Ruderverein e.V.',
  website: clubSite,
  contacts: [
    { email: 'info@catering-muster.de', kind: 'functional', context: 'Catering und Gastronomie' },
    { email: 'max.mustermann@beispiel-ruderverein.de', kind: 'functional', context: 'Ruderwart Max Mustermann', role: 'Ruderwart' },
    { email: 'info@beispiel-ruderverein.de', kind: 'functional', context: 'Geschäftsstelle' }
  ]
});
assert.equal(org.disposition, 'direct-functional');
assert.equal(org.preferredContact.email, 'info@beispiel-ruderverein.de');
assert.equal(org.thirdPartyCandidateCount, 1);
assert.equal(org.policyVersion, '1.0.0');
assert.equal(org.contacts.find((item) => item.email === 'max.mustermann@beispiel-ruderverein.de').autoApproved, false);

console.log('review-enrichment-poc tests passed');
