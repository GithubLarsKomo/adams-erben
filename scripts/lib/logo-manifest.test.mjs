import assert from 'node:assert/strict';
import { applyLogoManifest, logoEntryForOrganization } from './logo-manifest.mjs';

const organizations = [
  { id: 'ratzeburger-ruderclub-ev', organizationId: '12420', drvId: '12420', name: 'Ratzeburger Ruderclub e.V.', website: 'https://www.rrc-online.de/' },
  { id: 'review-logo', organizationId: '88888', drvId: '88888', name: 'Ruderverein Review', website: 'https://review.example/' },
  { id: 'ohne-logo', organizationId: '99999', drvId: '99999', name: 'Ruderverein Ohne Logo', website: 'https://example.org/' }
];
const manifest = {
  version: 2,
  organizations: {
    '12420': {
      status: 'present', asset: '/assets/images/clubs/ratzeburger-ruderclub-ev.svg',
      sourceUrl: 'https://www.rrc-online.de/media/logo.svg', sourcePage: 'https://www.rrc-online.de/'
    },
    '88888': { status: 'review', sourceUrl: 'https://review.example/logo.png', entityConfidence: 0.4 }
  }
};

assert.equal(logoEntryForOrganization(organizations[0], manifest)?.asset, '/assets/images/clubs/ratzeburger-ruderclub-ev.svg');
assert.equal(logoEntryForOrganization(organizations[1], manifest)?.status, 'review');
assert.equal(logoEntryForOrganization(organizations[2], manifest), null);

const enriched = applyLogoManifest(organizations, manifest);
assert.equal(enriched[0].logoStatus, 'present');
assert.equal(enriched[0].logo, '/assets/images/clubs/ratzeburger-ruderclub-ev.svg');
assert.equal('logoSourceUrl' in enriched[0], false, 'browser data must not expose logo source URL metadata');
assert.equal('logoSourcePage' in enriched[0], false, 'browser data must not expose logo source page metadata');
assert.equal(enriched[1].logoStatus, 'review');
assert.equal(enriched[1].logo, '');
assert.equal(enriched[2].logoStatus, 'missing');
assert.equal(enriched[2].logo, '');

console.log('logo-manifest v2 tests passed');
