import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { pages, retiredDetailPages } from './seo-pages.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const failures = [];
const retiredPaths = new Set(retiredDetailPages.map((page) => page.path));
const variantExpectations = {
  landing: { skip: '#quick-finder', cta: '#quick-finder' },
  rowing: { skip: '#labor', cta: '#vereine' }
};

function expect(condition, message) {
  if (!condition) failures.push(message);
}

for (const page of pages) {
  const html = await readFile(path.join(dist, page.file), 'utf8');
  const $ = cheerio.load(html);
  const label = page.path;
  const expected = variantExpectations[page.shellVariant];

  expect(Boolean(expected), `${label}: unknown shell variant ${page.shellVariant}`);
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
  expect($('body').attr('data-shell-variant') === page.shellVariant, `${label}: wrong data-shell-variant`);
  expect($('body').attr('data-shell-path') === page.path, `${label}: wrong data-shell-path`);
  expect($('.brand .brand-lockup[src="/assets/images/adams-erben-logo.png"]').length === 1, `${label}: desktop logo missing`);
  expect($('.brand .brand-mark[src="/assets/images/adams-erben-mark.png"]').length === 1, `${label}: mobile mark missing`);
  expect($('.brand').text().trim() === '', `${label}: old textual AE brand content survived`);

  if (expected) {
    expect($('.skip-link').attr('href') === expected.skip, `${label}: skip link must target ${expected.skip}`);
    expect($(expected.skip).length === 1, `${label}: skip target ${expected.skip} missing`);
    expect($('.header-find-club').attr('href') === expected.cta, `${label}: persistent CTA must target ${expected.cta}`);
  }

  $('.site-header .primary-navigation a[href^="#"]').each((_, element) => {
    const href = $(element).attr('href');
    expect(Boolean(href && href !== '#' && $(href).length), `${label}: shell navigation contains dead in-page target ${href || '(missing)'}`);
  });

  $('a[href^="/"]').each((_, element) => {
    const href = $(element).attr('href') || '';
    const normalized = href.split('#')[0].split('?')[0];
    expect(!retiredPaths.has(normalized), `${label}: retired SEO route is still linked: ${normalized}`);
  });
}

const cssOwnership = [
  ['src/assets/story-flow.css', ['.site-header', '.brand', '.menu-toggle', '.header-actions', '.header-find-club']],
  ['src/assets/mobile-fixes.css', ['.site-header', '.brand', '.site-footer']],
  ['src/assets/audience-pages.css', ['.site-header', '.brand', '.menu-toggle', '.header-actions', '.header-find-club', '.site-footer']],
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
  console.log(`[site-shell] validated ${pages.length} product pages, in-page targets, retired-route isolation and CSS ownership`);
}
