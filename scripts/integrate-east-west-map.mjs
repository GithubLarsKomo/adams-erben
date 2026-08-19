import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const rowingPath = path.join(root, 'dist', 'rudern', 'index.html');
const mapCandidates = [
  path.join(root, 'src', 'assets', 'images', 'ratzeburger-see.svg'),
  path.join(root, 'src', 'assets', 'images', 'ratzeburger-see.web.semantic-final.svg')
];

async function firstExisting(paths) {
  for (const candidate of paths) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next candidate
    }
  }
  return null;
}

const mapPath = await firstExisting(mapCandidates);
if (!mapPath) {
  throw new Error('[east-west-map] semantic map asset missing; expected src/assets/images/ratzeburger-see.svg');
}

const [html, rawSvg] = await Promise.all([
  readFile(rowingPath, 'utf8'),
  readFile(mapPath, 'utf8')
]);

const $ = cheerio.load(html, { decodeEntities: false });
const mapFrame = $('.border-map-frame').first();
if (!mapFrame.length) throw new Error('[east-west-map] .border-map-frame missing');

const svgStart = rawSvg.indexOf('<svg');
if (svgStart < 0) throw new Error('[east-west-map] semantic map asset does not contain <svg>');
const svgMarkup = rawSvg.slice(svgStart);

const requiredSvgIds = [
  'lake',
  'border-zone',
  'routes',
  'route-west',
  'route-east',
  'marker-lg-bootshaus',
  'marker-rar',
  'marker-rrc'
];
for (const id of requiredSvgIds) {
  if (!svgMarkup.includes(`id="${id}"`)) {
    throw new Error(`[east-west-map] semantic map asset missing #${id}`);
  }
}

mapFrame.attr('data-rowing-map-host', '');
mapFrame.html(`<div class="border-map-inline" data-rowing-map data-active-state="west">${svgMarkup}</div>`);

const inlineSvg = mapFrame.find('svg').first();
inlineSvg.addClass('border-map-svg');
inlineSvg.attr('role', 'img');
inlineSvg.attr('aria-labelledby', 'rowing-map-title rowing-map-desc');
inlineSvg.attr('preserveAspectRatio', inlineSvg.attr('preserveAspectRatio') || 'xMidYMid meet');
inlineSvg.prepend('<desc id="rowing-map-desc">Karte des Ratzeburger Sees mit Trainingsrouten am West- und Ostufer, historischem DDR-Grenzraum sowie wichtigen Orten des Ratzeburger Rudersports.</desc>');
inlineSvg.prepend('<title id="rowing-map-title">Trainingsrevier Ratzeburger See</title>');

const stateAssignments = [
  ['.east-west-prologue .east-west-copy > p:nth-of-type(1)', 'lg'],
  ['.east-west-prologue .east-west-copy > p:nth-of-type(2)', 'rrc'],
  ['.east-west-reference', 'west'],
  ['.east-west-observation', 'border'],
  ['.east-west-koerner', 'east'],
  ['.east-west-memory-story', 'east'],
  ['.east-west-bled', 'east'],
  ['.east-west-schubschlag', 'east'],
  ['.east-west-mexico', 'east'],
  ['.east-west-epilogue', 'east'],
  ['#ruderakademie', 'rar']
];

for (const [selector, state] of stateAssignments) {
  const element = $(selector).first();
  if (!element.length) throw new Error(`[east-west-map] story target missing for ${state}: ${selector}`);
  element.attr('data-map-state', state);
}

const cssHref = '/assets/east-west-map-interactions.css';
if (!$(`link[href="${cssHref}"]`).length) {
  $('head').append(`<link rel="stylesheet" href="${cssHref}">`);
}

const scriptSrc = '/assets/east-west-map.js';
if (!$(`script[src="${scriptSrc}"]`).length) {
  $('body').append(`<script src="${scriptSrc}" defer></script>`);
}

const expectedStates = ['west', 'border', 'east', 'lg', 'rar', 'rrc'];
for (const state of expectedStates) {
  if (!$(`[data-map-state="${state}"]`).length) {
    throw new Error(`[east-west-map] state ${state} not assigned`);
  }
}

if (!$('[data-rowing-map-host] .border-map-inline svg').length) throw new Error('[east-west-map] inline semantic map missing after integration');

await writeFile(rowingPath, $.html());
console.log(`[east-west-map] inlined semantic map from ${path.basename(mapPath)} and wired story states`);
