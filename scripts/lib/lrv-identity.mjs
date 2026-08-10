export const LRV_IDENTITY_HINTS = new Map([
  ['30010', {
    website: 'https://www.lrvbw.de/',
    contactDomains: ['rudern-bw.de'],
    functionalLocalParts: [],
    verificationSource: 'official-lrv-imprint'
  }],
  ['30011', {
    website: 'https://www.ruderverband.de/',
    contactDomains: ['ruderverband.de'],
    functionalLocalParts: ['brv-geschaeftsstelle'],
    verificationSource: 'official-lrv-imprint'
  }],
  ['30018', {
    website: 'https://www.lrvn.de/',
    contactDomains: ['lrvn.de'],
    functionalLocalParts: [],
    verificationSource: 'official-lrv-imprint'
  }],
  ['30019', {
    website: 'https://www.rudern.nrw/',
    contactDomains: ['nwrv.org'],
    functionalLocalParts: [],
    verificationSource: 'official-lrv-imprint'
  }]
]);

export function lrvIdentityHints(record = {}) {
  const drvId = String(record.drvId || record.organizationId || '').trim();
  return LRV_IDENTITY_HINTS.get(drvId) || {
    website: '',
    contactDomains: [],
    functionalLocalParts: [],
    verificationSource: ''
  };
}
