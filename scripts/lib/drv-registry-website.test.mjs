import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
import { firstExternalWebsite } from './drv-registry.mjs';

// Regression: hrv-rudern.de is a club domain and must not be mistaken for
// rudern.de merely because its hostname ends with the same character sequence.
const protocolRelative = cheerio.load(`
<html><body>
<nav><a href="https://www.ruder-bundesliga.de/">Ruder-Bundesliga</a></nav>
<div class="profile-field"><span><strong>Website</strong></span><a href="//www.hrv-rudern.de">www.hrv-rudern.de</a></div>
</body></html>`);
assert.equal(firstExternalWebsite(protocolRelative), 'https://www.hrv-rudern.de/');

// Text-only fallback: preserve an explicit text boundary between label/value.
const textOnly = cheerio.load(`
<html><body>
<div><span>Website</span> <span>www.beispiel-ruderverein.de</span></div>
<div><span>E-Mail</span> <span>info@beispiel-ruderverein.de</span></div>
</body></html>`);
assert.equal(firstExternalWebsite(textOnly), 'https://www.beispiel-ruderverein.de/');

const bareDomain = cheerio.load(`
<html><body>
<div>Homepage beispiel-ruderclub.de</div>
</body></html>`);
assert.equal(firstExternalWebsite(bareDomain), 'https://beispiel-ruderclub.de/');

const emptyWebsite = cheerio.load(`
<html><body>
<div>Website</div>
<div>E-Mail info@nur-mail.de</div>
</body></html>`);
assert.equal(firstExternalWebsite(emptyWebsite), '');

console.log('DRV website field variant tests passed');
