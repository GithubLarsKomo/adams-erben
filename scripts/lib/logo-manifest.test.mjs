import assert from 'node:assert/strict';
import { applyLogoManifest, logoEntryForOrganization } from './logo-manifest.mjs';

const organizations = [
  { id: 'ratzeburger-ruderclub-ev', organizationId: '12420', drvId: '12420', name: 'Ratzeburger Ruderclub e.V.', website: 'https://www.rrc-online.de/' },
  { id: 'ohne-logo', organizationId: '99999', drvId: '99999', name: 'Ruderverein Ohne Logo', website: 'https://example.org/' }
];
const manifest = {
  organizations: {
    '12420': {
      status: 'present',
      asset: '/assets/images/clubs/ratzeburger-ruderclub-ev.svg',
      sourceUrl: 'https://www.rrc-online.de/media/logo.svg',
      sourcePage: 'https://www.rrc-online.de/'
    }
  }
};

assert.equal(logoEntryForOrganization(organizations[0], manifest)?.asset, '/assets/images/clubs/ratzeburger-ruderclub-ev.svg');
assert.equal(logoEntryForOrganization(organizations[1], manifest), null);

const enriched = applyLogoManifest(organizations, manifest);
assert.equal(enriched[0].logoStatus, 'present');
assert.equal(enriched[0].logo, '/assets/images/clubs/ratzeburger-ruderclub-ev.svg');
assert.equal(enriched[0].logoSourceUrl, 'https://www.rrc-online.de/media/logo.svg');
assert.equal(enriched[1].logoStatus, 'missing');
assert.equal(enriched[1].logo, '');

console.log('logo-manifest tests passed');
