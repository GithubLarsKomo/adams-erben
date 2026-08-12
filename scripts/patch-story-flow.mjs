import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const indexPath = path.join(root, 'dist', 'index.html');
const html = await readFile(indexPath, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

const main = $('main');
if (!main.length) throw new Error('[patch-story-flow] main element not found');

// Keep the navigation aligned with the actual narrative order.
const header = $('.site-header');
const nav = header.find('nav[aria-label="Hauptnavigation"]');
if (!header.length || !nav.length) throw new Error('[patch-story-flow] site header/navigation not found');

nav.attr('id', 'primary-navigation').html(`
  <a href="#ratzeburg">Ratzeburg</a>
  <a href="#labor">Adams Labor</a>
  <a href="#geschichte">Einordnung</a>
  <a href="#ruderakademie">Ruderakademie</a>
  <a href="#rudern-verstehen">Rudern verstehen</a>
  <a href="#stimmen">Stimmen</a>
  <a class="nav-cta" href="#vereine">Verein finden</a>
`);

if (!header.find('.header-actions').length) {
  nav.before(`
    <div class="header-actions">
      <a class="header-find-club" href="#vereine">Verein finden</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Menü öffnen">
        <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
      </button>
    </div>
  `);
}

// Rebuild the top-level scroll story without touching any content/data logic inside the sections.
const desiredOrder = [
  '.hero',
  '#film',
  '#ratzeburg',
  '.city-story',
  '#labor',
  '#geschichte',
  '#ruderakademie',
  '#rudern-verstehen',
  '#stimmen',
  '#foerderung',
  '.about.journey',
  '#vereine',
  '#ueber'
];

const orderedSections = [];
for (const selector of desiredOrder) {
  const section = main.children(selector).first();
  if (!section.length) throw new Error(`[patch-story-flow] expected section missing: ${selector}`);
  orderedSections.push(section.detach());
}

const leftovers = main.children('section').detach();
for (const section of orderedSections) main.append(section);
// Preserve any future sections added outside the known storyboard instead of deleting them.
if (leftovers.length) $('#ueber').before(leftovers);

$('#film').addClass('story-film-bridge');

// World Rowing: international continuation of the explanatory rowing chapter.
const rowingOutro = $('#rudern-verstehen .rowing-outro');
if (rowingOutro.length && !rowingOutro.find('.external-resource-world-rowing').length) {
  rowingOutro.append(`
    <aside class="external-resource external-resource-world-rowing" aria-label="Rudern international weiterentdecken">
      <div>
        <p class="card-kicker">International weiterentdecken</p>
        <h4>Rudern weltweit</h4>
        <p>Wer nach Bootsklassen, Rennformaten und Rudern in Deutschland weiter hinausblicken möchte, findet beim Weltverband World Rowing den internationalen Sport.</p>
      </div>
      <a class="button button-secondary" href="https://worldrowing.com/" target="_blank" rel="noopener noreferrer">Zu World Rowing ↗</a>
    </aside>
  `);
}

// DRV: transparent official alternative next to the independent club finder.
const searchPanel = $('#vereine .search-panel');
if (searchPanel.length && !$('#vereine .official-search-note').length) {
  searchPanel.after(`
    <p class="official-search-note">Adams Erben bietet einen eigenen, vereinsnahen Einstieg. Alternativ kannst du direkt die <a href="https://www.rudern.de/service/vereinssuche" target="_blank" rel="noopener noreferrer">offizielle Vereinssuche des Deutschen Ruderverbands ↗</a> nutzen.</p>
  `);
}

// Schubschlag: one editorial feature after the human voices, plus contextual listening tips.
const voiceGrid = $('#stimmen .voice-grid');
if (voiceGrid.length && !$('#stimmen .podcast-feature').length) {
  voiceGrid.after(`
    <article class="podcast-feature">
      <div>
        <p class="card-kicker">Noch mehr Stimmen aus dem Rudersport</p>
        <h3>Schubschlag</h3>
        <p>Carsten Brzeski und Matthias Zander sprechen mit Menschen aus dem Rudersport über Erfahrungen, Entwicklungen und Geschichten aus vielen Jahrzehnten.</p>
      </div>
      <a class="button button-secondary" href="https://www.podcast.de/podcast/2776815/schubschlag" target="_blank" rel="noopener noreferrer">Schubschlag hören ↗</a>
    </article>
  `);
}

const trainingCard = $('#labor .lab-card-training').first();
if (trainingCard.length && !trainingCard.find('.listening-tip').length) {
  trainingCard.append(`
    <p class="listening-tip"><strong>Hörtipp · Schubschlag:</strong> <a href="https://www.podcast.de/episode/624998733/folge-26-wissen-macht-schnell" target="_blank" rel="noopener noreferrer">Folge 26 „Wissen macht schnell“ ↗</a></p>
  `);
}

const eightCopy = $('#rudern-verstehen .eight-explainer .eight-copy');
if (eightCopy.length && !eightCopy.find('.listening-tip').length) {
  eightCopy.append(`
    <p class="listening-tip"><strong>Hörtipp · Schubschlag:</strong> <a href="https://www.podcast.de/episode/624998413/folge-58-mythos-deutschland-achter" target="_blank" rel="noopener noreferrer">Folge 58 „Mythos Deutschland-Achter“ ↗</a></p>
  `);
}

const distanceMark = $('#rudern-verstehen .distance-mark');
if (distanceMark.length && !distanceMark.find('.listening-tip').length) {
  distanceMark.append(`
    <p class="listening-tip listening-tip-center"><strong>Hörtipp · Schubschlag:</strong> Folge 149 „Die beste Regatta Europas“ über den Fari Cup · <a href="https://www.podcast.de/podcast/2776815/schubschlag" target="_blank" rel="noopener noreferrer">zum Podcast ↗</a></p>
  `);
}

const storyCss = '<link rel="stylesheet" href="/assets/story-flow.css">';
if (!$('link[href="/assets/story-flow.css"]').length) $('head').append(storyCss);
const storyJs = '<script src="/assets/story-nav.js" defer></script>';
if (!$('script[src="/assets/story-nav.js"]').length) $('body').append(storyJs);

await writeFile(indexPath, $.html());
console.log('[patch-story-flow] sticky navigation, narrative order and editorial resources applied');
