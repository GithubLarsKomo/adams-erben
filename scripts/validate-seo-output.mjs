import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { pages, productionOrigin, previewOrigin } from './seo-pages.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const previewMode = process.env.PREVIEW_MODE === '1';
const expectedOrigin = previewMode ? previewOrigin : productionOrigin;
const expectedAppMode = previewMode ? 'preview' : 'production';
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

function normalizeParagraph(value) {
  return value.replace(/\s+/g, ' ').trim();
}

const titles = new Map();
const descriptions = new Map();
const longParagraphs = new Map();
const expectedPaths = new Set(pages.map((page) => page.path));
const knownInternalPaths = new Set([...expectedPaths, '/rudern/']);

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
  const ogImageAlt = text($, 'meta[property="og:image:alt"]');
  const twitterCard = text($, 'meta[name="twitter:card"]');
  const robotsMeta = text($, 'meta[name="robots"]');
  const expectedCanonical = `${expectedOrigin}${page.path}`;

  if ($('html').attr('lang') !== 'de') fail(page.path, 'html lang must be de');
  if ($('h1').length !== 1) fail(page.path, `expected exactly one h1, found ${$('h1').length}`);
  if (!$('main').length) fail(page.path, 'missing main element');
  if (!title) fail(page.path, 'missing title');
  if (title !== page.title) fail(page.path, 'title differs from central page configuration');
  if (title.length < 35 || title.length > 70) fail(page.path, `title length ${title.length} is outside 35-70 characters`);
  if (!description) fail(page.path, 'missing meta description');
  if (description !== page.description) fail(page.path, 'description differs from central page configuration');
  if (description.length < 120 || description.length > 160) fail(page.path, `description length ${description.length} is outside 120-160 characters`);
  if (canonicalUrl !== expectedCanonical) fail(page.path, `canonical must be ${expectedCanonical}`);
  if (ogTitle !== page.ogTitle) fail(page.path, 'og:title differs from central page configuration');
  if (ogDescription !== page.ogDescription) fail(page.path, 'og:description differs from central page configuration');
  if (ogUrl !== expectedCanonical) fail(page.path, `og:url must be ${expectedCanonical}`);
  if (!ogImage.startsWith(`${expectedOrigin}/assets/images/`)) fail(page.path, `og:image must use a local image on ${expectedOrigin}`);
  if (ogImageAlt !== page.ogImageAlt) fail(page.path, 'og:image:alt differs from central page configuration');
  if (!ogImageAlt) fail(page.path, 'missing og:image:alt');
  if (twitterCard !== 'summary_large_image') fail(page.path, 'twitter:card must be summary_large_image');

  if (previewMode) {
    if (robotsMeta !== 'noindex,nofollow') fail(page.path, 'preview output must contain robots noindex,nofollow');
  } else if (robotsMeta) {
    fail(page.path, 'production output must not contain robots noindex metadata');
  }

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
    if (!$('[aria-current="page"]').length) fail(page.path, 'detail page should expose aria-current="page"');
  }

  const skipLink = $('.skip-link[href^="#"]').first();
  if (!skipLink.length) {
    fail(page.path, 'missing in-page skip link');
  } else {
    const targetId = skipLink.attr('href').slice(1);
    if (!targetId || !$(`#${targetId}`).length) fail(page.path, `skip link target #${targetId} does not exist`);
  }

  const appScripts = $('script[src="/assets/app.js"]');
  appScripts.each((_, element) => {
    if ($(element).attr('type') !== 'module') fail(page.path, '/assets/app.js must be loaded as type="module"');
  });
  if (appScripts.length) {
    const appMode = $('meta[name="adams-erben-mode"]').attr('content')?.trim() || '';
    if (appMode !== expectedAppMode) fail(page.path, `adams-erben-mode must be ${expectedAppMode}, found ${appMode || '(missing)'}`);
  }

  $('img').each((_, element) => {
    if ($(element).attr('alt') === undefined) fail(page.path, `image ${$(element).attr('src') || '(unknown src)'} is missing alt attribute`);
    if ($(element).attr('onerror')) fail(page.path, `image ${$(element).attr('src') || '(unknown src)'} contains a runtime fallback`);
  });

  const remoteResourceSelectors = [
    'img[src^="http://"], img[src^="https://"]',
    'script[src^="http://"], script[src^="https://"]',
    'link[rel="stylesheet"][href^="http://"], link[rel="stylesheet"][href^="https://"]',
    'source[src^="http://"], source[src^="https://"]',
    'iframe[src^="http://"], iframe[src^="https://"]'
  ];
  for (const selector of remoteResourceSelectors) {
    $(selector).each((_, element) => {
      const url = $(element).attr('src') || $(element).attr('href') || '(unknown resource)';
      fail(page.path, `third-party runtime resource is not allowed: ${url}`);
    });
  }

  $('a[target="_blank"]').each((_, element) => {
    const relTokens = new Set(($(element).attr('rel') || '').split(/\s+/).filter(Boolean));
    if (!relTokens.has('noopener') || !relTokens.has('noreferrer')) {
      fail(page.path, `external target=_blank link lacks noopener noreferrer: ${$(element).attr('href') || '(unknown href)'}`);
    }
  });

  const linkedCorePaths = new Set();
  $('a[href^="/"]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href || href.startsWith('/#') || href.endsWith('.php')) return;
    const normalized = href.split('#')[0].split('?')[0];
    if (normalized.endsWith('/') && !knownInternalPaths.has(normalized)) {
      fail(page.path, `internal core-style link points to unregistered path ${normalized}`);
    }
    if (expectedPaths.has(normalized) && normalized !== page.path) linkedCorePaths.add(normalized);
  });

  if (page.path === '/') {
    for (const expectedPath of expectedPaths) {
      if (expectedPath !== '/' && !linkedCorePaths.has(expectedPath)) fail(page.path, `homepage does not link to core page ${expectedPath}`);
    }
  } else if (linkedCorePaths.size < 2) {
    fail(page.path, `detail page links to only ${linkedCorePaths.size} other core page(s); expected at least 2`);
  }

  if (!previewMode) {
    const bodyClone = $('body').clone();
    bodyClone.find('script, style').remove();
    const visibleText = normalizeParagraph(bodyClone.text());
    const forbiddenPatterns = [
      /Platzhalter/i,
      /Storyboard-Grafik/i,
      /Später:/i,
      /nach Abstimmung/i,
      /vor Veröffentlichung/i,
      /Geplanter Datenbestand/i,
      /Vorschau enthält ausschließlich/i,
      /Zitatplatzhalter/i
    ];
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(visibleText)) fail(page.path, `production output contains editorial placeholder text matching ${pattern}`);
    }
  }

  $('p').each((_, element) => {
    const paragraph = normalizeParagraph($(element).text());
    if (paragraph.length < 180) return;
    const previous = longParagraphs.get(paragraph);
    if (previous && previous !== page.path) {
      fail(page.path, `long paragraph is duplicated verbatim from ${previous}`);
    } else {
      longParagraphs.set(paragraph, page.path);
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

if (robots) {
  if (previewMode) {
    if (!robots.includes('Disallow: /')) failures.push('robots.txt: preview must disallow crawling');
  } else if (!robots.includes(`Sitemap: ${productionOrigin}/sitemap.xml`)) {
    failures.push('robots.txt: missing production sitemap declaration');
  }
}

if (pages.length !== 10) failures.push(`central SEO configuration: expected 10 core pages, found ${pages.length}`);

if (failures.length) {
  console.error(`[seo-validate] failed (${previewMode ? 'preview' : 'production'})`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(`[seo-validate] ${pages.length} core pages validated (${previewMode ? 'preview' : 'production'})`);
