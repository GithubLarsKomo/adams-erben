import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { pages, productionOrigin } from './seo-pages.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const failures = [];

function fail(pagePath, message) {
  failures.push(`${pagePath}: ${message}`);
}

function text($, selector) {
  return $(selector).first().attr('content')?.trim() || '';
}

function canonical($) {
  return $('link[rel="canonical"]').first().attr('href')?.trim() || '';
}

function jsonLdTypes($, pagePath) {
  const types = new Set();
  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text().trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [parsed];
      for (const node of nodes) {
        const type = node?.['@type'];
        if (Array.isArray(type)) type.forEach((value) => types.add(value));
        else if (type) types.add(type);
      }
    } catch (error) {
      fail(pagePath, `invalid JSON-LD (${error.message})`);
    }
  });
  return types;
}

const titles = new Map();
const descriptions = new Map();
const expectedPaths = new Set(pages.map((page) => page.path));

for (const page of pages) {
  const filePath = path.join(dist, page.file);
  let html;
  try {
    html = await readFile(filePath, 'utf8');
  } catch {
    fail(page.path, `missing output file ${page.file}`);
    continue;
  }

  const $ = cheerio.load(html, { decodeEntities: false });
  const title = $('title').first().text().trim();
  const description = text($, 'meta[name="description"]');
  const canonicalUrl = canonical($);
  const ogTitle = text($, 'meta[property="og:title"]');
  const ogDescription = text($, 'meta[property="og:description"]');
  const ogUrl = text($, 'meta[property="og:url"]');
  const ogImage = text($, 'meta[property="og:image"]');
  const twitterCard = text($, 'meta[name="twitter:card"]');
  const expectedCanonical = `${productionOrigin}${page.path}`;

  if ($('html').attr('lang') !== 'de') fail(page.path, 'html lang must be de');
  if ($('h1').length !== 1) fail(page.path, `expected exactly one h1, found ${$('h1').length}`);
  if (!$('main').length) fail(page.path, 'missing main element');
  if (!title) fail(page.path, 'missing title');
  if (title !== page.title) fail(page.path, 'title differs from central page configuration');
  if (!description) fail(page.path, 'missing meta description');
  if (description !== page.description) fail(page.path, 'description differs from central page configuration');
  if (canonicalUrl !== expectedCanonical) fail(page.path, `canonical must be ${expectedCanonical}`);
  if (ogTitle !== page.ogTitle) fail(page.path, 'og:title differs from central page configuration');
  if (ogDescription !== page.ogDescription) fail(page.path, 'og:description differs from central page configuration');
  if (ogUrl !== expectedCanonical) fail(page.path, `og:url must be ${expectedCanonical}`);
  if (!ogImage.startsWith(`${productionOrigin}/assets/images/`)) fail(page.path, 'og:image must use a local Adams Erben image on the production origin');
  if (twitterCard !== 'summary_large_image') fail(page.path, 'twitter:card must be summary_large_image');
  if ($('meta[name="robots"]').length) fail(page.path, 'production output must not contain robots noindex metadata');

  if (titles.has(title)) fail(page.path, `duplicate title also used by ${titles.get(title)}`);
  else titles.set(title, page.path);
  if (descriptions.has(description)) fail(page.path, `duplicate description also used by ${descriptions.get(description)}`);
  else descriptions.set(description, page.path);

  const types = jsonLdTypes($, page.path);
  if (page.path === '/') {
    if (!types.has('WebSite')) fail(page.path, 'homepage JSON-LD must contain WebSite');
  } else {
    if (!types.has('BreadcrumbList')) fail(page.path, 'detail page JSON-LD must contain BreadcrumbList');
    if (!types.has('WebPage') && !types.has('AboutPage')) fail(page.path, 'detail page JSON-LD must contain WebPage or AboutPage');
  }

  $('a[href^="/"]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href || href.startsWith('/#') || href.endsWith('.php')) return;
    const normalized = href.split('#')[0].split('?')[0];
    if (normalized.endsWith('/') && !expectedPaths.has(normalized)) {
      fail(page.path, `internal core-style link points to unregistered path ${normalized}`);
    }
  });
}

let sitemap;
try {
  sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
} catch {
  failures.push('sitemap.xml: missing');
}

if (sitemap) {
  for (const page of pages.filter((item) => item.index)) {
    const loc = `<loc>${productionOrigin}${page.path}</loc>`;
    if (!sitemap.includes(loc)) failures.push(`sitemap.xml: missing ${page.path}`);
  }
  const locCount = (sitemap.match(/<loc>/g) || []).length;
  const indexedCount = pages.filter((page) => page.index).length;
  if (locCount !== indexedCount) failures.push(`sitemap.xml: expected ${indexedCount} URLs, found ${locCount}`);
}

let robots;
try {
  robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
} catch {
  failures.push('robots.txt: missing');
}
if (robots && !robots.includes(`Sitemap: ${productionOrigin}/sitemap.xml`)) {
  failures.push('robots.txt: missing production sitemap declaration');
}

if (pages.length !== 10) failures.push(`central SEO configuration: expected 10 core pages, found ${pages.length}`);

if (failures.length) {
  console.error('[seo-validate] failed');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(`[seo-validate] ${pages.length} core pages, metadata, JSON-LD, links, sitemap and robots validated`);
