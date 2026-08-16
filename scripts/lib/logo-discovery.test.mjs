import assert from 'node:assert/strict';
import {
  candidatePreferenceScore,
  classifyLogoCandidate,
  extensionForContentType,
  extractLogoCandidates,
  extractPageIdentity,
  isSameSite,
  isTrustedReferencedAsset,
  organizationAliases,
  sanitizeSvg,
  scoreEntityConfidence,
  scoreLogoCandidate
} from './logo-discovery.mjs';

const organization = { name: 'Ratzeburger Ruderclub e.V.', city: 'Ratzeburg' };
const pageUrl = 'https://www.rrc-online.de/';
const html = `<!doctype html>
<html>
<head>
  <title>Ratzeburger Ruderclub e.V.</title>
  <script type="application/ld+json">{"@type":"SportsOrganization","name":"Ratzeburger Ruderclub e.V.","logo":"/media/rrc-logo.svg"}</script>
</head>
<body>
  <header><a class="site-brand" href="/"><img class="custom-logo" src="/assets/logo-main.png" alt="Ratzeburger Ruderclub Logo" width="240" height="120"></a></header>
  <main>
    <img class="hero-image" src="/media/theme_image_31.jpg" alt="Rudern auf dem Küchensee" width="1600" height="400">
    <img class="sponsor-logo" src="/sponsors/acme-logo.png" alt="Sponsor ACME">
  </main>
</body>
</html>`;

assert.ok(organizationAliases(organization).includes('rrc'));
assert.ok(organizationAliases({ name: 'Akademischer Ruderclub Würzburg e.V.', city: 'Würzburg' }).includes('arc'));
assert.ok(organizationAliases({ name: 'Akademischer Ruderclub Würzburg e.V.', city: 'Würzburg' }).includes('arcw'));
assert.ok(organizationAliases({ name: 'Akademischer Ruderverein e.V. Kiel', city: 'Kiel' }).includes('arv'));
assert.ok(organizationAliases({ name: 'Frankfurter Ruder-Gesellschaft Oberrad 1879 e.V.', city: 'Frankfurt am Main' }).includes('frgo'));
assert.ok(organizationAliases({ name: 'Gymnasial-Turn-Ruder-Verein Neuwied 1882 e.V.', city: 'Neuwied' }).includes('gtrv'));
assert.ok(organizationAliases({ name: 'Eisenbahnsportverein Schmöckwitz e.V. Abt. Rudern', city: 'Berlin' }).includes('esv'));

const identity = extractPageIdentity(html);
const candidates = extractLogoCandidates(html, pageUrl, organization);
const structured = candidates.find((item) => item.kind === 'jsonld');
const clubLogo = candidates.find((item) => item.url.endsWith('/assets/logo-main.png'));
const hero = candidates.find((item) => item.url.endsWith('/media/theme_image_31.jpg'));
const sponsorLogo = candidates.find((item) => item.url.endsWith('/sponsors/acme-logo.png'));
assert.ok(structured && clubLogo && hero && sponsorLogo);
assert.equal(classifyLogoCandidate(structured, organization, identity).disposition, 'accept');
assert.notEqual(classifyLogoCandidate(hero, organization, identity).disposition, 'accept');
assert.notEqual(classifyLogoCandidate(sponsorLogo, organization, identity).disposition, 'accept');
assert.ok(scoreEntityConfidence(clubLogo, organization, identity) >= 0.55);

const rrcShortLogo = {
  url: 'https://www.rrc-online.de/wp-content/uploads/cropped-rrc-logo.png', kind: 'img', score: 180,
  label: 'RRC-Online.de', directContext: 'custom-logo RRC-Online.de', context: 'header logo', directlyReferenced: true
};
assert.equal(classifyLogoCandidate(rrcShortLogo, organization, identity).disposition, 'accept');

const arcw = { name: 'Akademischer Ruderclub Würzburg e.V.', city: 'Würzburg' };
const arcwIdentity = { text: 'Akademischer Ruderclub Würzburg e.V.' };
const arcwLogo = {
  url: 'https://arcw.de/cropped-ARCW_Logo.png', kind: 'img', score: 175,
  label: 'arcw.de', directContext: 'custom-logo arcw', context: 'header', directlyReferenced: true
};
assert.equal(classifyLogoCandidate(arcwLogo, arcw, arcwIdentity).disposition, 'accept');

// V3/V4 negative regression 1: club-owned event/regatta logos must never auto-accept.
const aegir = { name: 'Berliner-Ruder-Club Ägir e.V.', city: 'Berlin' };
const aegirIdentity = { text: 'Berliner-Ruder-Club Ägir e.V.' };
const regattaLogo = {
  url: 'https://brc-aegir.de/wp-content/uploads/LOGO_ACHTER_REGATTA_24-560x370.jpg',
  kind: 'img', score: 180, label: 'Müggelsee Achterregatta', directContext: 'logo achterregatta',
  context: 'content logo', width: '560', height: '370', directlyReferenced: true
};
const regattaDecision = classifyLogoCandidate(regattaLogo, aegir, aegirIdentity);
assert.equal(regattaDecision.disposition, 'reject');
assert.equal(regattaDecision.reason, 'event_or_regatta_context');

// V3/V4 negative regression 2: same-site sponsor assets must not inherit club identity from the hostname.
const bessel = { name: 'Bessel-Ruder-Club e.V.', city: 'Minden' };
const besselIdentity = { text: 'Bessel-Ruder-Club e.V. | BRC Minden' };
const bankLogo = {
  url: 'https://www.besselrc.de/wp-content/uploads/2023/01/Logo_VVB_Minden_blau.svg', kind: 'img', score: 75,
  label: '', directContext: 'attachment-full widget_sp_image-image-link',
  context: 'attachment-full widget_sp_image-image-link widget_sp_image-3 widget clearfix widget_sp_image flex_column',
  directlyReferenced: true
};
const bankDecision = classifyLogoCandidate(bankLogo, bessel, besselIdentity);
assert.notEqual(bankDecision.disposition, 'accept');
assert.equal(bankDecision.reason, 'direct_asset_identity_missing');

// V3 regression 3: explicit flag/logo identity beats a cropped background/header photo at equal score.
const crefeld = { name: 'Crefelder Ruder-Club 1883 e.V.', city: 'Krefeld' };
const background = {
  url: 'https://crefelder-rc.de/wp-content/uploads/cropped-Hintergrund2.jpg', kind: 'img', score: 190,
  label: 'Crefelder Ruder-Club', directContext: 'header-image Crefelder Ruder-Club', context: 'header background',
  width: '1920', height: '220', inHeader: true
};
const flag = {
  url: 'https://crefelder-rc.de/wp-content/uploads/Flagge-Name.png', kind: 'img', score: 190,
  label: 'Crefelder Ruder-Club Flagge', directContext: 'site-logo Crefelder Ruder-Club Flagge', context: 'header branding',
  width: '500', height: '200', inHeader: true
};
assert.equal(classifyLogoCandidate(background, crefeld, { text: crefeld.name }).disposition, 'reject');
assert.equal(classifyLogoCandidate(flag, crefeld, { text: crefeld.name }).disposition, 'accept');
assert.ok(candidatePreferenceScore(flag, crefeld) > candidatePreferenceScore(background, crefeld));

// V4 positive promotions: strict site identity may compensate for missing asset-name identity,
// but only on a page that independently identifies as the organization.
const v4SiteIdentityCases = [
  {
    organization: { name: 'Akademischer Ruder-Club zu Münster e.V.', city: 'Münster' },
    pageIdentity: { text: 'Akademischer Ruder-Club zu Münster e. V.' },
    candidate: {
      url: 'https://www.arc-ms.de/wp-content/uploads/go-x/u/884919cd/image-455x181.png', kind: 'img', score: 160,
      label: '', directContext: '', context: 'logo-image logo-link Seitenlogo logo-image-container'
    }
  },
  {
    organization: { name: 'Binger Rudergesellschaft 1911 e.V.', city: 'Bingen' },
    pageIdentity: { text: 'Binger Rudergesellschaft 1911 e.V.' },
    candidate: {
      url: 'https://brg1911.de/wp-content/uploads/2019/06/logo_ww.png', kind: 'img', score: 270,
      label: '', directContext: '', context: 'header-logo-img Binger Rudergesellschaft 1911 e.V.'
    }
  },
  {
    organization: { name: 'Bonner Ruder-Verein 1882 e.V.', city: 'Bonn' },
    pageIdentity: { text: 'Bonner Ruder-Verein 1882 e.V.' },
    candidate: {
      url: 'https://www.bonnerruderverein.de/wp-content/uploads/2022/04/Logo-ohne-Schriftzug-gerade.png', kind: 'img', score: 170,
      label: 'Logo', directContext: 'Logo logo', context: 'Logo logo header_logo main-header left'
    }
  },
  {
    organization: { name: 'Club für Wassersport Porz e.V. 1926', city: 'Köln' },
    pageIdentity: { text: 'Club für Wassersport Porz e.V.' },
    candidate: {
      url: 'https://www.cfwp.de/wp-content/uploads/2016/03/CfWP_Logo.png', kind: 'img', score: 220,
      label: 'Rudern, Segeln und Motorboot fahren', directContext: 'mk-desktop-logo dark-logo',
      context: 'mk-desktop-logo dark-logo Club für Wassersport Porz header-logo fit-logo-img'
    }
  },
  {
    organization: { name: 'Deutscher Ruder-Club von 1884 e.V.', city: 'Hannover' },
    pageIdentity: { text: 'Deutscher Ruder-Club von 1884 e.V.' },
    candidate: {
      url: 'https://www.drc1884.de/wp-content/uploads/2016/02/Logo_randlos_klein.png', kind: 'img', score: 225,
      label: 'DRC Hannover', directContext: 'custom-logo DRC Hannover', context: 'custom-logo DRC Hannover custom-logo-link site-logo'
    }
  },
  {
    organization: { name: 'Frankfurter Ruder-Gesellschaft Oberrad 1879 e.V.', city: 'Frankfurt am Main' },
    pageIdentity: { text: 'Frankfurter Ruder-Gesellschaft Oberrad 1879 e.V.' },
    candidate: {
      url: 'https://www.frgo.de/wp-content/uploads/2024/03/cropped-100px_wappen.png', kind: 'img', score: 175,
      label: 'FRGO', directContext: 'custom-logo FRGO', context: 'custom-logo FRGO custom-logo-link site-logo-div'
    }
  },
  {
    organization: { name: 'Gymnasial-Turn-Ruder-Verein Neuwied 1882 e.V.', city: 'Neuwied' },
    pageIdentity: { text: 'Gymnasial-Turn-Ruder-Verein Neuwied 1882 e.V. | GTRV Neuwied' },
    candidate: {
      url: 'https://gtrvn.de/wp-content/uploads/2020/10/logo_2020_600.png', kind: 'img', score: 155,
      label: 'Logo', directContext: 'Logo logo', context: 'Logo logo header_logo main-header left'
    }
  },
  {
    organization: { name: 'Hersfelder Ruderverein 1977 e.V.', city: 'Bad Hersfeld' },
    pageIdentity: { text: 'Hersfelder Ruderverein' },
    candidate: {
      url: 'http://www.hersfelder-ruderverein.de/images/logos/neu_logo.png', kind: 'img', score: 205,
      label: 'Hersfelder-Ruderverein', directContext: 'Hersfelder-Ruderverein brand-logo', context: 'Hersfelder-Ruderverein brand-logo navbar-brand grid-child'
    }
  }
];

for (const testCase of v4SiteIdentityCases) {
  const decision = classifyLogoCandidate(testCase.candidate, testCase.organization, testCase.pageIdentity);
  assert.equal(decision.disposition, 'accept', `${testCase.organization.name} should promote to present`);
}

// V4 positive promotion 9: an explicit logo filename may contain a cosmetic background descriptor.
const duesseldorf = { name: 'Düsseldorfer Ruderverein 1880 e.V.', city: 'Düsseldorf' };
const duesseldorfLogo = {
  url: 'https://drv1880.de/wp-content/uploads/2024/03/drv1880-logo-hell-mit-hintergrund.svg', kind: 'img', score: 150,
  label: 'drv1880-logo-hell-mit-hintergrund', directContext: 'wp-image-105850 drv1880-logo-hell-mit-hintergrund',
  context: 'wp-image-105850 drv1880-logo-hell-mit-hintergrund et_pb_image_wrap et_pb_image_0_tb_header'
};
assert.equal(classifyLogoCandidate(duesseldorfLogo, duesseldorf, { text: duesseldorf.name }).disposition, 'accept');

// V4 positive promotion 10: compound organization abbreviations such as Eisenbahnsportverein -> ESV.
const schmoeckwitz = { name: 'Eisenbahnsportverein Schmöckwitz e.V. Abt. Rudern', city: 'Berlin' };
const schmoeckwitzLogo = {
  url: 'https://www.rudern-schmoeckwitz.de/wp-content/uploads/2017/11/cropped-ESV_Flagge_staab_250x250.png',
  kind: 'jsonld', score: 315, label: 'ESV Schmöckwitz e.V. organization logo', directContext: 'ESV Schmöckwitz e.V.'
};
assert.equal(classifyLogoCandidate(schmoeckwitzLogo, schmoeckwitz, { text: 'ESV Schmöckwitz e.V.' }).disposition, 'accept');

// V4 negative regression 3: a youth/sub-brand logo is not the main club identity merely because the page is correct.
const freiweg = { name: 'Frauen-Ruderverein "Freiweg" Frankfurt e.V. 1927', city: 'Frankfurt am Main' };
const youthLogo = {
  url: 'https://www.freiweg-frankfurt.de/wp-content/uploads/2016/03/Logo_Jugend.jpg', kind: 'img', score: 80,
  label: '', directContext: 'wp-image-123', context: 'wp-image-123 content'
};
assert.notEqual(classifyLogoCandidate(youthLogo, freiweg, { text: freiweg.name }).disposition, 'accept');

assert.equal(isSameSite('https://static.rrc-online.de/logo.svg', pageUrl), true);
assert.equal(isSameSite('https://cdn.example.net/logo.svg', pageUrl), false);
assert.equal(isTrustedReferencedAsset({ url: 'https://image.jimcdn.com/app/cms/logo.png', directlyReferenced: true }, pageUrl), true);
assert.equal(isTrustedReferencedAsset({ url: 'https://image.jimcdn.com/app/cms/logo.png', directlyReferenced: false }, pageUrl), false);
assert.equal(isTrustedReferencedAsset({ url: 'https://evil.example/logo.png', directlyReferenced: true }, pageUrl), false);

const mismatchOrg = { name: 'Alte Herren RR Heidelberg', city: 'Heidelberg' };
const mismatchIdentity = { text: 'Heidelberg College | Schule in Heidelberg' };
const genericLogo = {
  url: 'https://heidelberg-college.de/assets/logo.png', kind: 'img', score: 155,
  label: 'Heidelberg College', directContext: 'site-logo Heidelberg College', context: 'header site-logo', directlyReferenced: true
};
assert.ok(scoreEntityConfidence(genericLogo, mismatchOrg, mismatchIdentity) < 0.55);
assert.notEqual(classifyLogoCandidate(genericLogo, mismatchOrg, mismatchIdentity).disposition, 'accept');

assert.ok(scoreLogoCandidate({
  url: 'https://example.de/wp-content/logo.svg', kind: 'img', context: 'header custom-logo', directContext: 'custom-logo Ruderverein Beispiel',
  label: 'Ruderverein Beispiel Logo', inHeader: true, width: 200, height: 100
}, { name: 'Ruderverein Beispiel e.V.', city: 'Beispielstadt' }) >= 100);

const unsafeSvg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><image href="https://tracker.example/pixel.png"/><rect style="fill:url(https://tracker.example/x)"/></svg>';
const safeSvg = sanitizeSvg(unsafeSvg);
assert.doesNotMatch(safeSvg, /<script/i);
assert.doesNotMatch(safeSvg, /onload=/i);
assert.doesNotMatch(safeSvg, /tracker\.example/i);
assert.equal(extensionForContentType('image/svg+xml; charset=utf-8'), '.svg');
assert.equal(extensionForContentType('image/png'), '.png');
assert.equal(extensionForContentType('text/html'), '');

console.log('logo-discovery v4 tests passed');
