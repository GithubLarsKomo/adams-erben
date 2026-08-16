import assert from 'node:assert/strict';
import { evaluateV5Precision, safeAliasMatch } from './logo-v5-precision.mjs';

function reject(name, organization, candidate, selectedUrl = candidate.url) {
  const decision = evaluateV5Precision(candidate, organization, { selectedUrl });
  assert.notEqual(decision.allow, true, `${name} must not pass V5 precision gate`);
  return decision;
}

assert.equal(
  safeAliasMatch({ name: 'Ruder-Verein Nienburg e.V.', city: 'Nienburg' }, 'drv logo'),
  false,
  'RV must not match inside DRV'
);

// 1. Bayer corporate footer logo on the RTHC rowing-department page.
const rthcDecision = reject(
  'RTHC Bayer footer',
  { name: 'RTHC Ruder-Tennis-Hockey-Club Bayer Leverkusen Ruder-Abteilung', city: 'Leverkusen' },
  {
    url: 'https://www.rthc.de/assets/images/g/logo-bayer-footer-rn129kt1xtqm7s5.png',
    kind: 'img', score: 95, entityConfidence: 0.58, disposition: 'accept', label: '',
    context: 'content-image ivp', directContext: 'content-image ivp'
  }
);
assert.equal(rthcDecision.reason, 'v5_weak_footer_affiliation');

// 2. DRV logo on Ruder-Verein Nienburg: short RV alias must not match the DRV token.
const nienburgDecision = reject(
  'Nienburg DRV logo',
  { name: 'Ruder-Verein Nienburg e.V.', city: 'Nienburg' },
  {
    url: 'https://www.rv-nienburg.de/.cm4all/uproc.php/0/.drv_logo.png/picture-1200?_=16846cd05a0',
    kind: 'img', score: 85, entityConfidence: 0.75, disposition: 'accept', label: '',
    context: 'uroPhotoOuterALFAHO_cm4all_com_widgets_UroPhoto_1443019', directContext: 'uroPhotoOuterALFAHO_cm4all_com_widgets_UroPhoto_1443019'
  },
  'https://www.rv-nienburg.de/.cm4all/mediadb/drv_logo.png'
);
assert.ok(['v5_alias_boundary_conflict', 'v5_foreign_organization_identity'].includes(nienburgDecision.reason));

// 3. Explicit Deutscher Ruderverband identity on the Birkenwerder page.
const birkenwerderDecision = reject(
  'Birkenwerder DRV logo',
  { name: 'Ruderverein Birkenwerder e.V.', city: 'Birkenwerder' },
  {
    url: 'https://rudern.me/wp-content/uploads/2025/02/Deutscher_Ruderverband_Logo_2007.svg_.png',
    kind: 'img', score: 100, entityConfidence: 0.75, disposition: 'accept', label: 'Deutscher Ruderverband',
    context: 'wp-image-2329 style-730-image Deutscher Ruderverband image-link', directContext: 'wp-image-2329 Deutscher Ruderverband'
  }
);
assert.equal(birkenwerderDecision.reason, 'v5_foreign_organization_identity');

// 4. Erlangen crew photo is labelled brand-logo by the site but is a JPEG photograph.
const erlangenDecision = reject(
  'Erlangen crew photo',
  { name: 'Ruderverein Erlangen e.V. 1911', city: 'Erlangen' },
  {
    url: 'http://ruderverein-erlangen.de/images/erlanger8er.jpg',
    kind: 'img', score: 175, entityConfidence: 0.55, disposition: 'accept', label: 'Ruderverein Erlangen e.V.',
    context: 'Ruderverein Erlangen e.V. brand-logo navbar-brand grid-child',
    directContext: 'Ruderverein Erlangen e.V. brand-logo'
  }
);
assert.equal(erlangenDecision.disposition, 'review');
assert.equal(erlangenDecision.reason, 'v5_raster_branding_requires_review');

// 5. "für" overlap alone must not turn Fonds für Digitales into the RGF club logo.
const rgfDecision = reject(
  'RGF Fonds für Digitales',
  { name: 'Ruderverein für das Große Freie e.V. Lehrte/Sehnde', city: 'Lehrte' },
  {
    url: 'https://rudern-rgf.de/wp-content/uploads/2021/01/Logo-Fonds-fur-Digitales-white-e1611419526624.png',
    kind: 'img', score: 170, entityConfidence: 0.863, disposition: 'accept', label: 'Logo Fonds für Digitales',
    context: 'Logo Fonds für Digitales fonds textwidget custom-html-widget', directContext: 'Logo Fonds für Digitales'
  }
);
assert.equal(rgfDecision.reason, 'v5_function_word_only_identity');

// 6. Teamshop is a merchandising sub-brand, not the LRV Brandenburg identity.
const lrvDecision = reject(
  'LRV Brandenburg Teamshop',
  { name: 'Landesruderverband Brandenburg e.V.', city: 'Potsdam' },
  {
    url: 'https://www.lrvbrandenburg.de/wp-content/uploads/2025/06/Logo_Teamshop.png',
    kind: 'img', score: 205, entityConfidence: 1, disposition: 'accept', label: 'LRV Brandenburg Teamshop',
    context: 'LRV Brandenburg Teamshop lrv-teamshop-logo lrv-teamshop-card lrv-teamshop-section',
    directContext: 'LRV Brandenburg Teamshop lrv-teamshop-logo'
  }
);
assert.equal(lrvDecision.reason, 'v5_commerce_or_teamshop');

// 7. DRV membership logo must lose against the target NWRV identity even though the path contains NWRV.
const nwrvDecision = reject(
  'NWRV DRV membership logo',
  { name: 'Nordrhein-Westfälischer Ruderverband', city: '' },
  {
    url: 'https://www.rudern.nrw/cms/files/NWRV/images/Deutscher_Ruderverband_Logo_2007_black.svg',
    kind: 'img', score: 200, entityConfidence: 0.55, disposition: 'accept', label: 'logo DRV',
    context: 'logo DRV d-flex memberships', directContext: 'logo DRV'
  }
);
assert.equal(nwrvDecision.reason, 'v5_foreign_organization_identity');

// Positive sanity checks: canonical target assets must continue to pass.
assert.equal(evaluateV5Precision({
  url: 'https://www.rudern.nrw/cms/files/NWRV/images/Logo_NWRV_greenframe_240809.svg',
  kind: 'img', disposition: 'accept', label: 'NWRV-Logo', context: 'NWRV-Logo pageLogo pageHomeLink', directContext: 'NWRV-Logo'
}, { name: 'Nordrhein-Westfälischer Ruderverband' }).allow, true);

assert.equal(evaluateV5Precision({
  url: 'https://example.de/assets/club-logo.jpg', kind: 'img', disposition: 'accept', label: 'Vereinslogo',
  context: 'custom-logo site-logo', directContext: 'custom-logo Vereinslogo'
}, { name: 'Ruderverein Beispiel e.V.' }).allow, true, 'explicit logo semantics keep JPEG logo assets eligible');

console.log('logo v5 precision regressions passed');
