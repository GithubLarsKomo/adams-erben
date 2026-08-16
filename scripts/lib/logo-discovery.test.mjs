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

// V3 regression 1: club-owned event/regatta logos must never auto-accept.
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

// V3 regression 2: sponsor logo on the correct club page needs direct club identity evidence.
const bessel = { name: 'Bessel-Ruder-Club e.V.', city: 'Minden' };
const besselIdentity = { text: 'Bessel-Ruder-Club e.V. | BRC Minden' };
const bankLogo = {
  url: 'https://bessel-ruder-club.de/media/Logo_VVB_Minden_blau.svg', kind: 'img', score: 125,
  label: 'Volksbank Minden', directContext: 'logo bank', context: 'content partner-row', directlyReferenced: true
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

console.log('logo-discovery v3 tests passed');
