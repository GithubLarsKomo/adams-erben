import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const dist = path.join(root, 'dist');

const targets = [
  { file: 'index.html', variant: 'landing' },
  { file: path.join('rudern', 'index.html'), variant: 'rowing' }
];

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

for (const target of targets) {
  const label = `/${target.file === 'index.html' ? '' : 'rudern/'}`;
  const html = await readFile(path.join(dist, target.file), 'utf8');
  const $ = cheerio.load(html);

  expect($('.site-header').length === 1, `${label}: expected exactly one .site-header`);
  expect($('.site-header[data-site-shell="header"]').length === 1, `${label}: shared header marker missing`);
  expect($('#primary-navigation').length === 1, `${label}: expected exactly one #primary-navigation`);
  expect($('.menu-toggle').length === 1, `${label}: expected exactly one .menu-toggle`);
  expect($('.header-find-club').length === 1, `${label}: expected exactly one .header-find-club`);
  expect($('.site-footer').length === 1, `${label}: expected exactly one .site-footer`);
  expect($('.site-footer[data-site-shell="footer"]').length === 1, `${label}: shared footer marker missing`);
  expect($('link[href="/assets/site-shell.css"]').length === 1, `${label}: site-shell.css missing or duplicated`);
  expect($('script[src="/assets/site-shell.js"]').length === 1, `${label}: site-shell.js missing or duplicated`);
  expect($('script[src="/assets/story-nav.js"]').length === 0, `${label}: legacy story-nav.js must not survive shell application`);
  expect($('body').attr('data-shell-variant') === target.variant, `${label}: wrong data-shell-variant`);
  expect($('.brand .brand-lockup[src="/assets/images/adams-erben-logo.png"]').length === 1, `${label}: desktop logo missing`);
  expect($('.brand .brand-mark[src="/assets/images/adams-erben-mark.png"]').length === 1, `${label}: mobile mark missing`);
  expect($('.brand').text().trim() === '', `${label}: old textual AE brand content survived`);
}

if (failures.length) {
  console.error('[site-shell] validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`[site-shell] validated ${targets.length} audience pages`);
}
