import assert from 'node:assert/strict';
import {
  classifyLogoCandidate,
  extensionForContentType,
  extractLogoCandidates,
  extractPageIdentity,
  isSameSite,
  isTrustedReferencedAsset,
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

const identity = extractPageIdentity(html);
assert.match(identity.text, /Ratzeburger Ruderclub/);
const candidates = extractLogoCandidates(html, pageUrl, organization);
assert.ok(candidates.length >= 4);
const structured = candidates.find((item) => item.kind === 'jsonld');
const clubLogo = candidates.find((item) => item.url.endsWith('/assets/logo-main.png'));
const hero = candidates.find((item) => item.url.endsWith('/media/theme_image_31.jpg'));
const sponsorLogo = candidates.find((item) => item.url.endsWith('/sponsors/acme-logo.png'));
assert.ok(structured && clubLogo && hero && sponsorLogo);
assert.ok(clubLogo.score > hero.score);
assert.ok(clubLogo.score > sponsorLogo.score);
assert.ok(hero.score < 70);
assert.equal(classifyLogoCandidate(structured, organization, identity).disposition, 'accept');
assert.notEqual(classifyLogoCandidate(sponsorLogo, organization, identity).disposition, 'accept');
assert.ok(scoreEntityConfidence(clubLogo, organization, identity) >= 0.55);

assert.equal(isSameSite('https://static.rrc-online.de/logo.svg', pageUrl), true);
assert.equal(isSameSite('https://cdn.example.net/logo.svg', pageUrl), false);
assert.equal(isTrustedReferencedAsset({ url: 'https://image.jimcdn.com/app/cms/logo.png', directlyReferenced: true }, pageUrl), true);
assert.equal(isTrustedReferencedAsset({ url: 'https://image.jimcdn.com/app/cms/logo.png', directlyReferenced: false }, pageUrl), false);
assert.equal(isTrustedReferencedAsset({ url: 'https://evil.example/logo.png', directlyReferenced: true }, pageUrl), false);

const mismatchOrg = { name: 'Alte Herren RR Heidelberg', city: 'Heidelberg' };
const mismatchIdentity = { text: 'Heidelberg College | Schule in Heidelberg' };
const genericLogo = {
  url: 'https://heidelberg-college.de/assets/logo.png', kind: 'img', score: 155,
  label: 'Heidelberg College', context: 'header site-logo', directlyReferenced: true
};
assert.ok(scoreEntityConfidence(genericLogo, mismatchOrg, mismatchIdentity) < 0.55);
assert.notEqual(classifyLogoCandidate(genericLogo, mismatchOrg, mismatchIdentity).disposition, 'accept');

assert.ok(scoreLogoCandidate({
  url: 'https://example.de/wp-content/logo.svg', kind: 'img', context: 'header custom-logo',
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

console.log('logo-discovery v2 tests passed');
