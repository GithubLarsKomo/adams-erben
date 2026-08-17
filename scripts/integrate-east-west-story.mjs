import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const rowingPath = path.join(root, 'dist', 'rudern', 'index.html');
const partialPath = path.join(root, 'src', 'partials', 'vom-vorbild-zum-rivalen.html');

const [rowingHtml, partialHtml] = await Promise.all([
  readFile(rowingPath, 'utf8'),
  readFile(partialPath, 'utf8')
]);

const $ = cheerio.load(rowingHtml, { decodeEntities: false });

if (!$('#geschichte').length) throw new Error('[east-west] #geschichte anchor missing on /rudern/');
if (!$('#labor').length) throw new Error('[east-west] #labor anchor missing on /rudern/');
if ($('#vorbild-rivale').length) throw new Error('[east-west] story already present before integration');

$('#geschichte').before(partialHtml);

if (!$('link[href="/assets/vom-vorbild-zum-rivalen.css"]').length) {
  $('head').append('<link rel="stylesheet" href="/assets/vom-vorbild-zum-rivalen.css">');
}

const nav = $('#primary-navigation');
if (!nav.length) throw new Error('[east-west] primary navigation missing on /rudern/');
if (!nav.find('a[href="#vorbild-rivale"]').length) {
  const laborLink = nav.find('a[href="#labor"]').first();
  if (!laborLink.length) throw new Error('[east-west] #labor navigation link missing');
  laborLink.after('<a href="#vorbild-rivale">Ost &amp; West</a>');
}

const sections = $('main > section').map((_, element) => $(element).attr('id') || '').get();
const laborIndex = sections.indexOf('labor');
const rivalryIndex = sections.indexOf('vorbild-rivale');
const historyIndex = sections.indexOf('geschichte');
if (!(laborIndex >= 0 && rivalryIndex === laborIndex + 1 && historyIndex === rivalryIndex + 1)) {
  throw new Error(`[east-west] unexpected section order: labor=${laborIndex}, rivalry=${rivalryIndex}, history=${historyIndex}`);
}

const required = [
  ['#vorbild-rivale', 'story section'],
  ['.evidence-documented', 'documented evidence badge'],
  ['.evidence-context', 'historical context badge'],
  ['.evidence-memory', 'later-memory badge'],
  ['.border-map-placeholder', 'historical map placeholder'],
  ['.archive-fact', '1965 archive reference'],
  ['.evidence-check', 'Schilf evidence check'],
  ['.kremtz-turn', 'Kremtz 1965 to 1966 turning point'],
  ['.east-west-bled', 'Bled turning-point card'],
  ['.east-west-mexico', 'Mexico dual-success card'],
  ['.east-west-podcast img[src="/assets/images/schubschlag.webp"]', 'local Schubschlag asset'],
  ['a[href="https://www.podcast.de/podcast/2776815/schubschlag"]', 'Schubschlag link'],
  ['link[href="/assets/vom-vorbild-zum-rivalen.css"]', 'feature stylesheet'],
  ['#primary-navigation a[href="#vorbild-rivale"]', 'Ost & West navigation']
];
for (const [selector, label] of required) {
  if (!$(selector).length) throw new Error(`[east-west] required ${label} missing`);
}

const text = $.text();
const requiredText = [
  'oft nach Ratzeburg zur Beobachtung',
  'BStU, MfS, ZAIG 1081, Bl. 8–16',
  'Peter Kremtz wird mit Roland Göhler Weltmeister im Zweier ohne',
  'DDR-Achter: Rang 7',
  'Die DDR hat die Bundesrepublik um Längen geschlagen'
];
for (const claim of requiredText) {
  if (!text.includes(claim)) throw new Error(`[east-west] required sourced claim missing: ${claim}`);
}

const forbidden = [
  'Stasi beobachtete',
  'Doping erklärt die frühen Erfolge',
  'Beobachtungsfahrten des DDR-Trainers Peter Kremtz',
  'Peter Kremtz nach Ratzeburg',
  'Theo Körner war einer der Beobachter'
];
for (const overclaim of forbidden) {
  if (text.includes(overclaim)) throw new Error(`[east-west] forbidden historical overclaim found: ${overclaim}`);
}

await writeFile(rowingPath, $.html());
console.log('[east-west] integrated #vorbild-rivale into /rudern/ only');
