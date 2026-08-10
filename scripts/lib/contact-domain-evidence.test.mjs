import assert from 'node:assert/strict';
import { inferTrustedContactDomains, publicContactDomainEvidenceSummary } from './contact-domain-evidence.mjs';

const website = 'https://www.nassovia-hoechst.de/';
const verified = inferTrustedContactDomains({
  website,
  identityStrong: true,
  contacts: [
    {
      email: 'vorstand@rcnh.de',
      sourceUrl: 'https://www.nassovia-hoechst.de/datenschutz',
      context: 'Verantwortlicher Vorstand'
    },
    {
      email: 'sportwart@rcnh.de',
      sourceUrl: 'https://www.nassovia-hoechst.de/vorstand',
      context: 'Sportwart Rudern'
    },
    {
      email: 'kontakt@rcnh.de',
      sourceUrl: 'https://www.nassovia-hoechst.de/kontakt',
      context: 'Allgemeiner Kontakt'
    }
  ]
});
assert.deepEqual(verified.trustedDomains, ['rcnh.de']);
assert.equal(verified.trustedDomainCount, 1);
assert.equal(verified.evidence[0].distinctAddresses, 3);
assert.equal(verified.evidence[0].distinctPages, 3);
assert.ok(verified.evidence[0].strongPages >= 1);
assert.equal(verified.evidence[0].reason, 'multi_page_multi_mailbox_organization_evidence');

// A single foreign role address remains review even on an official contact page.
const single = inferTrustedContactDomains({
  website,
  identityStrong: true,
  contacts: [{
    email: 'vorstand@external-club-mail.de',
    sourceUrl: 'https://www.nassovia-hoechst.de/kontakt',
    context: 'Vorstand'
  }]
});
assert.deepEqual(single.trustedDomains, []);
assert.equal(single.evidence[0].reason, 'insufficient_organization_domain_evidence');

// Two mailboxes repeated on only one page are not enough independent evidence.
const onePage = inferTrustedContactDomains({
  website,
  identityStrong: true,
  contacts: [
    { email: 'vorstand@external-club-mail.de', sourceUrl: 'https://www.nassovia-hoechst.de/vorstand', context: 'Vorstand' },
    { email: 'sportwart@external-club-mail.de', sourceUrl: 'https://www.nassovia-hoechst.de/vorstand', context: 'Sportwart' }
  ]
});
assert.deepEqual(onePage.trustedDomains, []);
assert.equal(onePage.evidence[0].distinctAddresses, 2);
assert.equal(onePage.evidence[0].distinctPages, 1);

// Freemail domains cannot become organization domains through page repetition.
const freeMail = inferTrustedContactDomains({
  website,
  identityStrong: true,
  contacts: [
    { email: 'vorstand@web.de', sourceUrl: 'https://www.nassovia-hoechst.de/vorstand', context: 'Vorstand' },
    { email: 'sportwart@web.de', sourceUrl: 'https://www.nassovia-hoechst.de/kontakt', context: 'Sportwart' }
  ]
});
assert.deepEqual(freeMail.trustedDomains, []);
assert.equal(freeMail.candidateDomainCount, 0);

// Third-party/injected content must not establish trust, even with several pages.
const injected = inferTrustedContactDomains({
  website: 'https://www.krc-rhenania.de/',
  identityStrong: true,
  contacts: [
    { email: 'info@casino-spam.example', sourceUrl: 'https://www.krc-rhenania.de/kontakt', context: 'Catering Casino Reservierung' },
    { email: 'service@casino-spam.example', sourceUrl: 'https://www.krc-rhenania.de/impressum', context: 'Webagentur und Ticket Service' }
  ]
});
assert.deepEqual(injected.trustedDomains, []);
assert.equal(injected.candidateDomainCount, 0);

// Contacts from an unrelated page host are excluded from evidence aggregation.
const foreignSource = inferTrustedContactDomains({
  website,
  identityStrong: true,
  contacts: [
    { email: 'vorstand@rcnh.de', sourceUrl: 'https://directory.example/vorstand', context: 'Vorstand' },
    { email: 'sportwart@rcnh.de', sourceUrl: 'https://directory.example/kontakt', context: 'Sportwart' }
  ]
});
assert.deepEqual(foreignSource.trustedDomains, []);
assert.equal(foreignSource.candidateDomainCount, 0);

// Strong contact signals cannot compensate for a weak/ambiguous website identity.
const weakIdentity = inferTrustedContactDomains({
  website,
  identityStrong: false,
  contacts: verified.evidence.length ? [
    { email: 'vorstand@rcnh.de', sourceUrl: 'https://www.nassovia-hoechst.de/datenschutz', context: 'Vorstand' },
    { email: 'sportwart@rcnh.de', sourceUrl: 'https://www.nassovia-hoechst.de/vorstand', context: 'Sportwart' }
  ] : []
});
assert.deepEqual(weakIdentity.trustedDomains, []);
assert.equal(weakIdentity.candidateDomainCount, 0);

// Same-domain addresses already have first-class organization context and do not
// need to be reclassified as external-domain evidence.
const sameDomain = inferTrustedContactDomains({
  website,
  identityStrong: true,
  contacts: [
    { email: 'vorstand@nassovia-hoechst.de', sourceUrl: 'https://www.nassovia-hoechst.de/vorstand', context: 'Vorstand' },
    { email: 'kontakt@nassovia-hoechst.de', sourceUrl: 'https://www.nassovia-hoechst.de/kontakt', context: 'Kontakt' }
  ]
});
assert.deepEqual(sameDomain.trustedDomains, []);
assert.equal(sameDomain.candidateDomainCount, 0);

const publicSummary = publicContactDomainEvidenceSummary(verified);
assert.deepEqual(publicSummary, {
  evidenceVersion: '1.0.0',
  candidateDomainCount: 1,
  trustedDomainCount: 1,
  trustedEvidenceCount: 1,
  reviewEvidenceCount: 0
});
const publicRaw = JSON.stringify(publicSummary);
assert.equal(publicRaw.includes('rcnh.de'), false);
assert.equal(/@[a-z0-9.-]+/i.test(publicRaw), false);

console.log('contact domain evidence tests passed');
