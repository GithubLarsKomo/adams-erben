import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { pages, productionOrigin, previewOrigin } from './seo-pages.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const previewMode = process.env.PREVIEW_MODE === '1';
const origin = previewMode ? previewOrigin : productionOrigin;

function absoluteUrl(pagePath) {
  return `${origin}${pagePath}`;
}

function setMeta($, selector, attrs) {
  let node = $(selector).first();
  if (!node.length) {
    node = $('<meta>');
    $('head').append(node);
  }
  for (const [name, value] of Object.entries(attrs)) node.attr(name, value);
}

function setCanonical($, href) {
  let node = $('link[rel="canonical"]').first();
  if (!node.length) {
    node = $('<link rel="canonical">');
    $('head').append(node);
  }
  node.attr('href', href);
}

function addHomepageStructuredData($) {
  if ($('#seo-website-jsonld').length) return;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${productionOrigin}/#website`,
        url: `${productionOrigin}/`,
        name: 'Adams Erben',
        inLanguage: 'de'
      },
      {
        '@type': 'Organization',
        '@id': `${productionOrigin}/#organization`,
        name: 'Adams Erben',
        url: `${productionOrigin}/`,
        description: 'Unabhängige, nicht-kommerzielle Initiative über Karl Adam, Rudergeschichte und den Weg zum Rudern heute.'
      }
    ]
  };
  $('head').append(`<script id="seo-website-jsonld" type="application/ld+json">${JSON.stringify(data)}</script>`);
}

function appendLinkOnce(container, href, label, className = 'button button-secondary') {
  if (!container?.length || container.find(`a[href="${href}"]`).length) return;
  container.append(`<a class="${className}" href="${href}">${label}</a>`);
}

function removeEditorialPlaceholdersFromProduction($) {
  if (previewMode) return;

  $('.preview-banner, .preview-contact-note').remove();
  $('#stimmen').remove();
  $('.site-header nav a[href="#stimmen"], .site-header nav a[href="/#stimmen"]').remove();

  $('[class*="placeholder"]').each((_, element) => {
    const node = $(element);
    const container = node.closest('figure, article, blockquote').first();
    if (container.length) container.remove();
    else node.remove();
  });

  $('.foundation-quote').filter((_, element) => /Zitatplatzhalter|vor Veröffentlichung/i.test($(element).text())).remove();
  $('.partner-strip').filter((_, element) => /nach Abstimmung|im Aufbau/i.test($(element).text())).remove();

  $('.source-note, .diagram-caption').each((_, element) => {
    const node = $(element);
    if (/Storyboard|Platzhalter|vor Veröffentlichung|wird erst|zusätzlich.+geprüft/i.test(node.text())) node.remove();
  });

  $('#data-origin-heading').text('Öffentliche Vereinsdaten');
  $('#data-origin-copy').text('Die Suchdaten stammen aus der freigegebenen Datenquelle des Deutschen Ruderverbands. E-Mail-Adressen werden nicht als offene Sammelliste an den Browser ausgeliefert.');

  $('#ueber .principles article').each((_, element) => {
    const article = $(element);
    if (/Rechte vor Reichweite/i.test(article.find('h3').text())) {
      article.find('p').text('Historische Fotos, Clublogos, Filmstills und Partnerassets erscheinen nur nach geklärter Nutzungsgrundlage. Nicht freigegebene Medien werden nicht veröffentlicht.');
    }
  });
}

function enforceLocalRuntimeAssets($) {
  $('img[onerror]').removeAttr('onerror');
  const appMode = $('meta[name="adams-erben-mode"]');
  if (appMode.length) appMode.attr('content', previewMode ? 'preview' : 'production');

  $('a[target="_blank"]').each((_, element) => {
    const node = $(element);
    const relTokens = new Set((node.attr('rel') || '').split(/\s+/).filter(Boolean));
    relTokens.add('noopener');
    relTokens.add('noreferrer');
    node.attr('rel', [...relTokens].join(' '));
  });
}

function addHomepageLinks($) {
  appendLinkOnce($('.hero .hero-actions').first(), '/karl-adam/', 'Karl Adam entdecken');

  const filmSection = $('#film').first();
  if (filmSection.length && !filmSection.find('.seo-film-detail-links').length) {
    const links = `
      <div class="film-links seo-film-detail-links">
        <a class="button button-secondary" href="/adams-acht/">Historischer Hintergrund zu Adams Acht</a>
        <a class="button button-secondary" href="/deutschlandachter-1960/">Deutschlandachter 1960</a>
      </div>`;
    const existingLinks = filmSection.find('.film-links').last();
    if (existingLinks.length) existingLinks.after(links);
    else filmSection.append(links);
  }

  const ratzeburgActions = $('#ratzeburg .featured-actions').first();
  appendLinkOnce(ratzeburgActions, '/ratzeburg/', 'Ratzeburg als Ruderstadt');

  const laborHeading = $('#labor .lab-heading').first();
  if (laborHeading.length && !$('#labor .seo-training-detail-links').length) {
    laborHeading.append(`
      <div class="film-links seo-training-detail-links">
        <a class="button button-secondary" href="/karl-adam-trainingsmethoden/">Karl Adams Trainingsmethoden vertiefen</a>
      </div>`);
  }

  const rowingSection = $('#rudern-verstehen').first();
  if (rowingSection.length && !rowingSection.find('.seo-rowing-funnel-links').length) {
    const target = rowingSection.find('.rowing-outro').first().length
      ? rowingSection.find('.rowing-outro').first()
      : rowingSection.find('.section-heading').first();
    target.append(`
      <div class="film-links seo-rowing-funnel-links">
        <a class="button button-secondary" href="/rudern-verstehen/">Rudern verstehen</a>
        <a class="button button-secondary" href="/rudern-lernen/">Rudern lernen</a>
        <a class="button button-primary" href="/ruderverein-finden/">Ruderverein finden</a>
      </div>`);
  }

  const aboutSection = $('#ueber').first();
  if (aboutSection.length && !aboutSection.find('a[href="/ueber-adams-erben/"]').length) {
    const target = aboutSection.find('.section-heading').first();
    target.append('<p><a class="button button-secondary" href="/ueber-adams-erben/">Über Adams Erben: Quellen & Redaktion</a></p>');
  }
}

const historicDetailPaths = new Set([
  '/karl-adam/',
  '/adams-acht/',
  '/deutschlandachter-1960/',
  '/ratzeburg/',
  '/karl-adam-trainingsmethoden/'
]);

function addHistoricCrossLinks($, currentPath) {
  if (!historicDetailPaths.has(currentPath)) return;

  const nav = $('.site-header nav[aria-label="Hauptnavigation"]').first();
  const links = [
    ['/karl-adam/', 'Karl Adam'],
    ['/adams-acht/', 'Adams Acht'],
    ['/deutschlandachter-1960/', 'Achter 1960'],
    ['/ratzeburg/', 'Ratzeburg'],
    ['/karl-adam-trainingsmethoden/', 'Trainingsmethoden']
  ];

  for (const [href, label] of links) {
    if (nav.find(`a[href="${href}"]`).length) continue;
    const clubLink = nav.find('a[href="/ruderverein-finden/"], a[href="/#vereine"], a[href="#vereine"]').first();
    const link = `<a href="${href}"${href === currentPath ? ' aria-current="page"' : ''}>${label}</a>`;
    if (clubLink.length) clubLink.before(link);
    else nav.append(link);
  }

  if (currentPath === '/karl-adam/') {
    const nextLinks = $('.next-card .next-links').first();
    const additions = [
      ['/deutschlandachter-1960/', 'Deutschlandachter 1960', 'button button-primary'],
      ['/adams-acht/', 'Adams Acht', 'button button-secondary'],
      ['/ratzeburg/', 'Ratzeburg', 'button button-secondary'],
      ['/karl-adam-trainingsmethoden/', 'Trainingsmethoden', 'button button-secondary']
    ];
    for (const [href, label, className] of additions) {
      appendLinkOnce(nextLinks, href, label, className);
    }
  }
}

function addSharedTrustLink($) {
  const footerNav = $('.detail-footer nav, .site-footer nav').last();
  if (footerNav.length && !footerNav.find('a[href="/ueber-adams-erben/"]').length) {
    footerNav.append('<a href="/ueber-adams-erben/">Über Adams Erben</a>');
  }
}

for (const page of pages) {
  const filePath = path.join(dist, page.file);
  let html;
  try {
    html = await readFile(filePath, 'utf8');
  } catch {
    throw new Error(`[seo] configured page missing after build: ${page.file}`);
  }

  const $ = cheerio.load(html, { decodeEntities: false });
  removeEditorialPlaceholdersFromProduction($);
  enforceLocalRuntimeAssets($);

  $('title').text(page.title);
  setMeta($, 'meta[name="description"]', { name: 'description', content: page.description });
  setCanonical($, absoluteUrl(page.path));
  setMeta($, 'meta[property="og:site_name"]', { property: 'og:site_name', content: 'Adams Erben' });
  setMeta($, 'meta[property="og:locale"]', { property: 'og:locale', content: 'de_DE' });
  setMeta($, 'meta[property="og:title"]', { property: 'og:title', content: page.ogTitle });
  setMeta($, 'meta[property="og:description"]', { property: 'og:description', content: page.ogDescription });
  setMeta($, 'meta[property="og:url"]', { property: 'og:url', content: absoluteUrl(page.path) });
  setMeta($, 'meta[property="og:image"]', { property: 'og:image', content: `${origin}${page.ogImage}` });
  setMeta($, 'meta[property="og:image:alt"]', { property: 'og:image:alt', content: page.ogImageAlt });
  setMeta($, 'meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });

  if (previewMode) {
    setMeta($, 'meta[name="robots"]', { name: 'robots', content: 'noindex,nofollow' });
  } else {
    $('meta[name="robots"]').remove();
  }

  const h1Count = $('h1').length;
  if (h1Count !== 1) throw new Error(`[seo] ${page.path} must have exactly one h1, found ${h1Count}`);
  if (!$('html').attr('lang')) throw new Error(`[seo] ${page.path} is missing html[lang]`);

  if (page.path === '/') {
    addHomepageStructuredData($);
    addHomepageLinks($);
  } else {
    addHistoricCrossLinks($, page.path);
  }
  addSharedTrustLink($);

  await writeFile(filePath, $.html());
}

const sitemapEntries = pages
  .filter((page) => page.index)
  .map((page) => `  <url>\n    <loc>${productionOrigin}${page.path}</loc>\n  </url>`)
  .join('\n');

await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`
);

await writeFile(
  path.join(dist, 'robots.txt'),
  previewMode
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${productionOrigin}/sitemap.xml\n`
);

console.log(`[seo] finalized ${pages.length} pages (${previewMode ? 'preview' : 'production'})`);
