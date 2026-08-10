export const LRV_IDENTITY_HINTS = new Map([
  ['30010', {
    website: 'https://www.lrvbw.de/',
    contactDomains: ['rudern-bw.de'],
    verificationSource: 'official-lrv-imprint'
  }],
  ['30018', {
    website: 'https://www.lrvn.de/',
    contactDomains: ['lrvn.de'],
    verificationSource: 'official-lrv-imprint'
  }],
  ['30019', {
    website: 'https://www.rudern.nrw/',
    contactDomains: ['nwrv.org'],
    verificationSource: 'official-lrv-imprint'
  }]
]);

export function lrvIdentityHints(record = {}) {
  const drvId = String(record.drvId || record.organizationId || '').trim();
  return LRV_IDENTITY_HINTS.get(drvId) || { website: '', contactDomains: [], verificationSource: '' };
}
