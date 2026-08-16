import assert from 'node:assert/strict';
import {
  extensionForContentType,
  extractLogoCandidates,
  isSameSite,
  sanitizeSvg,
  scoreLogoCandidate
} from './logo-discovery.mjs';

const pageUrl = 'https://www.rrc-online.de/';
const html = `<!doctype html>
<html>
<head>
  <script type="application/ld+json">{"@type":"SportsOrganization","name":"Ratzeburger Ruderclub e.V.","logo":"/media/rrc-logo.svg"}</script>
</head>
<body>
  <header><a class="site-brand" href="/"><img class="custom-logo" src="/assets/logo-main.png" alt="Ratzeburger Ruderclub Logo" width="240" height="120"></a></header>
  <main><img class="sponsor-logo" src="/sponsors/acme-logo.png" alt="Sponsor ACME"></main>
</body>
</html>`;

const candidates = extractLogoCandidates(html, pageUrl, 'Ratzeburger Ruderclub e.V.');
assert.ok(candidates.length >= 3);
assert.equal(candidates[0].url.startsWith('https://www.rrc-online.de/'), true);
assert.ok(candidates[0].score >= 100);

const clubLogo = candidates.find((item) => item.url.endsWith('/assets/logo-main.png'));
const sponsorLogo = candidates.find((item) => item.url.endsWith('/sponsors/acme-logo.png'));
assert.ok(clubLogo);
assert.ok(sponsorLogo);
assert.ok(clubLogo.score > sponsorLogo.score);
assert.ok(sponsorLogo.score < 70);

assert.equal(isSameSite('https://static.rrc-online.de/logo.svg', pageUrl), true);
assert.equal(isSameSite('https://rrc-online.de/logo.svg', pageUrl), true);
assert.equal(isSameSite('https://cdn.example.net/logo.svg', pageUrl), false);

assert.ok(scoreLogoCandidate({
  url: 'https://example.de/wp-content/logo.svg',
  kind: 'img',
  context: 'header custom-logo',
  label: 'Ruderverein Beispiel Logo',
  inHeader: true,
  width: 200,
  height: 100
}, 'Ruderverein Beispiel e.V.') >= 100);

const unsafeSvg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><image href="https://tracker.example/pixel.png"/><rect style="fill:url(https://tracker.example/x)"/></svg>';
const safeSvg = sanitizeSvg(unsafeSvg);
assert.doesNotMatch(safeSvg, /<script/i);
assert.doesNotMatch(safeSvg, /onload=/i);
assert.doesNotMatch(safeSvg, /tracker\.example/i);

assert.equal(extensionForContentType('image/svg+xml; charset=utf-8'), '.svg');
assert.equal(extensionForContentType('image/png'), '.png');
assert.equal(extensionForContentType('text/html'), '');

console.log('logo-discovery tests passed');
