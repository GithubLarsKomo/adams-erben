import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const rowingPath = path.join(root, 'dist', 'rudern', 'index.html');
const html = await readFile(rowingPath, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

const mapFrame = $('.border-map-frame').first();
if (!mapFrame.length) throw new Error('[east-west-map] .border-map-frame missing');

const fallbackMap = mapFrame.find('img[src="/assets/images/ratzeburg-border-rowing-history.svg"]').first();
if (!fallbackMap.length) throw new Error('[east-west-map] fallback historical map missing');

mapFrame.attr('data-rowing-map-host', '');
fallbackMap.addClass('border-map-fallback');

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

if (!$('[data-rowing-map-host]').length) throw new Error('[east-west-map] map host missing after integration');
if (!$(`link[href="${cssHref}"]`).length) throw new Error('[east-west-map] interaction stylesheet missing');
if (!$(`script[src="${scriptSrc}"]`).length) throw new Error('[east-west-map] interaction script missing');

await writeFile(rowingPath, $.html());
console.log('[east-west-map] wired semantic map states and interactive map runtime');
