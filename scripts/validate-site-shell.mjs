import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { pages, retiredDetailPages } from './seo-pages.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const failures = [];
const previewMode = process.env.PREVIEW_MODE === '1';
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

  if (page.shellVariant === 'landing') {
    expect($('#rudern-verstehen').length === 1, `${label}: Rudern-verstehen block must live on landing page`);

    if (previewMode) {
      expect($('#stimmen').length === 1, `${label}: preview must retain voices block`);
      expect($('#stimmen .voice-grid > *').length === 6, `${label}: preview must retain all six voices`);
      expect($('#schubschlag').length === 1, `${label}: preview Schubschlag partial missing`);
    } else {
      expect($('#stimmen').length === 0, `${label}: production must remove placeholder voices block`);
      expect($('#schubschlag').length === 0, `${label}: production must remove Schubschlag nested in placeholder voices`);
    }

    expect($('#labor, #geschichte, #ruderakademie, #regatta, #vorbild-rivale').length === 0, `${label}: historical/depth sections leaked onto landing page`);
    expect($('script[src="/assets/landing-page.js"]').length === 1, `${label}: external landing interactions missing`);
  }

  if (page.shellVariant === 'rowing') {
    expect($('#vorbild-rivale').length === 1, `${label}: east-west story #vorbild-rivale missing after complete build`);
    expect($('#primary-navigation a[href="#vorbild-rivale"]').length === 1, `${label}: Ost & West navigation link missing after complete build`);
    expect($('link[href="/assets/vom-vorbild-zum-rivalen.css"]').length === 1, `${label}: east-west stylesheet missing after complete build`);
    expect($('link[href="/assets/east-west-map.css"]').length === 1, `${label}: canonical east-west map stylesheet missing`);
    expect($('#rudern-verstehen, #stimmen, #schubschlag').length === 0, `${label}: entry-level Rudern-verstehen/voices content leaked onto historical page`);
    expect($('#labor').length === 1 && $('#geschichte').length === 1 && $('#ruderakademie').length === 1 && $('#regatta').length === 1, `${label}: historical depth composition incomplete`);
    expect($('#primary-navigation a[href="/#rudern-verstehen"]').length === 1, `${label}: link back to Rudern verstehen missing`);
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
  console.log(`[site-shell] validated ${pages.length} product pages, audience composition, in-page targets and CSS ownership (${previewMode ? 'preview' : 'production'})`);
}
