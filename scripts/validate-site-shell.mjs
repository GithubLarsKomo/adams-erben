import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { pages } from './seo-pages.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');

const targets = [
  ...pages.map((page) => ({
    file: page.file,
    path: page.path,
    variant: page.path === '/' ? 'landing' : 'content'
  })),
  { file: path.join('rudern', 'index.html'), path: '/rudern/', variant: 'rowing' }
];

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

for (const target of targets) {
  const html = await readFile(path.join(dist, target.file), 'utf8');
  const $ = cheerio.load(html);
  const label = target.path;

  expect($('.site-header').length === 1, `${label}: expected exactly one .site-header`);
  expect($('.site-header[data-site-shell="header"]').length === 1, `${label}: shared header marker missing`);
  expect($('#primary-navigation').length === 1, `${label}: expected exactly one #primary-navigation`);
  expect($('.menu-toggle').length === 1, `${label}: expected exactly one .menu-toggle`);
  expect($('.header-find-club').length === 1, `${label}: expected exactly one .header-find-club`);
  expect($('.site-footer').length === 1, `${label}: expected exactly one .site-footer`);
  expect($('.detail-footer').length === 0, `${label}: legacy .detail-footer survived shell application`);
  expect($('.site-footer[data-site-shell="footer"]').length === 1, `${label}: shared footer marker missing`);
  expect($('link[href="/assets/site-shell.css"]').length === 1, `${label}: site-shell.css missing or duplicated`);
  expect($('script[src="/assets/site-shell.js"]').length === 1, `${label}: site-shell.js missing or duplicated`);
  expect($('script[src="/assets/story-nav.js"]').length === 0, `${label}: legacy story-nav.js must not survive shell application`);
  expect($('body').attr('data-shell-variant') === target.variant, `${label}: wrong data-shell-variant`);
  expect($('body').attr('data-shell-path') === target.path, `${label}: wrong data-shell-path`);
  expect($('.brand .brand-lockup[src="/assets/images/adams-erben-logo.png"]').length === 1, `${label}: desktop logo missing`);
  expect($('.brand .brand-mark[src="/assets/images/adams-erben-mark.png"]').length === 1, `${label}: mobile mark missing`);
  expect($('.brand').text().trim() === '', `${label}: old textual AE brand content survived`);

  if (target.variant === 'content') {
    expect($('.skip-link').attr('href') === '#inhalt', `${label}: content skip link must target #inhalt`);
    expect($('#inhalt').length === 1, `${label}: content page missing #inhalt target`);
    expect($('.header-find-club').attr('href') === '/ruderverein-finden/', `${label}: content CTA must use standalone club finder`);
  }
}

const cssOwnership = [
  ['src/assets/detail-page.css', ['.site-header', '.brand', '.menu-toggle', '.site-footer', '.detail-footer']],
  ['src/assets/story-flow.css', ['.site-header', '.brand', '.menu-toggle', '.header-actions', '.header-find-club']],
  ['src/assets/mobile-fixes.css', ['.site-header', '.brand']],
  ['src/assets/styles.css', ['.site-header', '.brand', '.brand-mark', '.site-footer']]
];

for (const [file, forbiddenSelectors] of cssOwnership) {
  const css = await readFile(path.join(root, file), 'utf8');
  for (const selector of forbiddenSelectors) {
    const selectorPattern = new RegExp(`(^|[\\s,{])${selector.replace('.', '\\.')}(?=[\\s:{,.>#\\[])`, 'm');
    expect(!selectorPattern.test(css), `${file}: shell selector ${selector} must be owned by site-shell.css only`);
  }
}

if (failures.length) {
  console.error('[site-shell] validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`[site-shell] validated ${targets.length} pages and CSS ownership`);
}
