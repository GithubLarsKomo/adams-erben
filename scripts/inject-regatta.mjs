import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const distIndexPath = path.join(root, 'dist', 'index.html');
const regattaPartialPath = path.join(root, 'src', 'partials', 'ratzeburg-regatta.html');

const [indexHtml, regattaHtml] = await Promise.all([
  readFile(distIndexPath, 'utf8'),
  readFile(regattaPartialPath, 'utf8')
]);

const $ = cheerio.load(indexHtml, { decodeEntities: false });
const cityStory = $('main > .city-story').first();

if (!cityStory.length) {
  throw new Error('[regatta] city-story anchor not found');
}

if (!$('#regatta').length) {
  cityStory.after(regattaHtml);
}

if (!$('link[href="/assets/regatta.css"]').length) {
  $('head').append('<link rel="stylesheet" href="/assets/regatta.css">');
}

const fundingOptions = $('#foerderung .funding-options').first();
if (fundingOptions.length && !fundingOptions.find('.regatta-volunteering-link').length) {
  fundingOptions.append(`
    <p class="regatta-volunteering-link"><strong>Mitmachen in groß:</strong> Wie viel ehrenamtliche Arbeit möglich macht, zeigt seit Jahrzehnten die <a href="#regatta">Internationale Ratzeburger Ruderregatta</a> – vom Auf- und Abbau bis zum Rennbetrieb.</p>`);
}

const regatta = $('main > #regatta');
if (!regatta.length) {
  throw new Error('[regatta] regatta section was not inserted');
}

if (!regatta.prev().hasClass('city-story')) {
  throw new Error('[regatta] regatta section is not directly after city-story');
}

if (!regatta.find('.regatta-media--3x1').length) {
  throw new Error('[regatta] expected 3:1 image slot missing');
}

if (!regatta.find('a[href="https://www.rrc-online.de/regatta/"]').length) {
  throw new Error('[regatta] current RRC regatta link missing');
}

await writeFile(distIndexPath, $.html());
console.log('[regatta] Ratzeburg regatta story injected');
