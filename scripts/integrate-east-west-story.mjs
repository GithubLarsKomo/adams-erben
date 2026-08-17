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

const mapPlaceholder = $('.border-map-placeholder').first();
if (!mapPlaceholder.length) throw new Error('[east-west] historical map placeholder missing before map integration');
mapPlaceholder.replaceWith(`
  <figure class="border-map-figure" aria-labelledby="border-map-title" aria-describedby="border-map-description">
    <div class="border-map-heading">
      <h3 id="border-map-title">Ein Ruderrevier an der Grenze</h3>
      <p id="border-map-description">Adams Ratzeburger Ruderraum reichte vom frühen Schulrudern am Großen Ratzeburger See bis zum späteren Hochleistungszentrum am Küchensee. Die Karte trennt belegte Geografie, zwei schematische Fahrräume am West- und Ostufer und den politischen Grenzraum bewusst voneinander.</p>
    </div>
    <div class="border-map-frame">
      <img src="/assets/images/ratzeburg-border-rowing-history.svg" alt="Schematische historische Karte von Ratzeburg mit Großem Ratzeburger See, Küchensee, historischem LG-Schulbootshaus am heutigen Karl-Adam-Weg, RRC, Rothenhusen, Wakenitz, Fahrräumen an West- und Ostufer sowie innerdeutschem Grenzraum nördlich des Bereichs Kalkhütte." loading="lazy" decoding="async">
    </div>
    <figcaption class="border-map-caption">Die gestrichelten Linien zeigen nur schematische Fahrräume entlang beider Ufer, keine rekonstruierten GPS-Routen. Ein konkreter DDR-Beobachtungspunkt wird nicht kartiert, weil er nicht belegt ist.</figcaption>
    <div class="border-map-insights" aria-label="Einordnung der Karte">
      <article>
        <h4>Das Revier</h4>
        <p>Karl Adams Ruderwelt begann am Großen Ratzeburger See. Die Ruderriege der Lauenburgischen Gelehrtenschule nutzte ihn für Fahrten Richtung Rothenhusen; ab 1955 verlagerte sich der Schwerpunkt des Renn- und Hochleistungstrainings an den Küchensee.</p>
      </article>
      <article>
        <h4>Die Grenze</h4>
        <p>Der politisch markierte Grenzraum setzt am Ostufer erst nördlich des Bereichs Kalkhütte ein; Buchholz dient gegenüber als Orientierung. Der historische Verlauf wird nur so präzise gezeigt, wie es die Quellenlage trägt.</p>
      </article>
      <article>
        <h4>Warum das wichtig ist</h4>
        <p>Ratzeburg war kein fernes westdeutsches Leistungszentrum. Ein Teil des realen Ruderreviers lag unmittelbar an der Systemgrenze. Diese räumliche Nähe macht die später dokumentierten Beobachtungsfahrten verständlich – ohne einen Beobachtungsort zu erfinden.</p>
      </article>
    </div>
    <p class="border-map-sources"><strong>Quellen zur Karte:</strong> <a href="https://www.grenzhus.de/publikationen/" target="_blank" rel="noopener noreferrer">Grenzhus Schlagsdorf · Grenzgeschichte Ratzeburger See ↗</a><span aria-hidden="true">·</span><a href="https://www.rrc-online.de/2018/geschichte-und-erfolge/laudatio-zum-85-geburtstag-von-dr-alfred-block/" target="_blank" rel="noopener noreferrer">RRC · frühes Ruderrevier und Schulbootshaus ↗</a></p>
    <p class="border-map-transition"><strong>Die Grenze trennte zwei Sportsysteme.</strong> Ratzeburgs Erfolge machten den Ort jedoch zum Referenzpunkt auf beiden Seiten. Anfang der 1960er Jahre stellte sich im DDR-Rudern deshalb eine sehr konkrete Frage: <em>Wie macht Adam das?</em></p>
  </figure>`);

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
  ['.border-map-figure', 'historical map figure'],
  ['.border-map-frame img[src="/assets/images/ratzeburg-border-rowing-history.svg"]', 'historical map SVG'],
  ['.border-map-insights > article', 'historical map insight cards'],
  ['.border-map-sources', 'historical map sources'],
  ['.border-map-transition', 'historical map story transition'],
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
if ($('.border-map-placeholder').length) throw new Error('[east-west] historical map placeholder survived integration');
if ($('.border-map-insights > article').length !== 3) throw new Error('[east-west] historical map must contain exactly three insight cards');

const text = $.text();
const requiredText = [
  'oft nach Ratzeburg zur Beobachtung',
  'BStU, MfS, ZAIG 1081, Bl. 8–16',
  'Peter Kremtz wird mit Roland Göhler Weltmeister im Zweier ohne',
  'DDR-Achter: Rang 7',
  'Die DDR hat die Bundesrepublik um Längen geschlagen',
  'West- und Ostufer',
  'nördlich des Bereichs Kalkhütte',
  'Wie macht Adam das?'
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
console.log('[east-west] integrated #vorbild-rivale with historical border map into /rudern/ only');
