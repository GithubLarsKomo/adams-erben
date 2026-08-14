import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const dist = path.join(root, 'dist');
const previewMode = process.env.PREVIEW_MODE === '1';
const productionOrigin = 'https://adams-erben.de';
const previewOrigin = 'https://preview.adams-erben.de';
const origin = previewMode ? previewOrigin : productionOrigin;

const pages = [
  {
    path: '/',
    file: 'index.html',
    title: 'Karl Adam, Deutschlandachter & Rudern heute | Adams Erben',
    description: 'Karl Adam prägte von Ratzeburg aus den Rudersport. Entdecke den Deutschlandachter, seine Trainingsideen und finde einen Ruderverein in deiner Nähe.',
    ogTitle: 'Karl Adam, Deutschlandachter & Rudern heute | Adams Erben',
    ogDescription: 'Karl Adams Ideen, Ratzeburgs Rudergeschichte, der Deutschlandachter und der direkte Weg zum Rudern heute.',
    ogImage: '/assets/images/hero-skiff.webp',
    index: true
  },
  {
    path: '/karl-adam/',
    file: 'karl-adam/index.html',
    title: 'Karl Adam: Rudertrainer, Deutschlandachter & Ideen | Adams Erben',
    description: 'Wer war Karl Adam? Seine Rolle in Ratzeburg, beim Deutschlandachter, seine Trainingsideen, Wirkung und die historische Einordnung seiner NS-Biografie.',
    ogTitle: 'Karl Adam: Rudertrainer, Deutschlandachter & Ideen',
    ogDescription: 'Karl Adam, Ratzeburg, der Deutschlandachter und die Ideen, die das Rudern veränderten – mit kritischer historischer Einordnung.',
    ogImage: '/assets/images/hero-skiff.webp',
    index: true
  },
  {
    path: '/adams-acht/',
    file: 'adams-acht/index.html',
    title: 'Adams Acht: Historischer Hintergrund & Karl Adam | Adams Erben',
    description: 'Historischer Hintergrund zu Adams Acht: Karl Adam, Ratzeburg, Deutschlandachter 1960 und die belegten Ereignisse hinter dem Kinofilm – unabhängig eingeordnet.',
    ogTitle: 'Adams Acht: Historischer Hintergrund zu Karl Adam und dem Deutschlandachter',
    ogDescription: 'Was hinter dem Kinofilm historisch belegt ist – und wo Spielfilm und Geschichte auseinandergehalten werden müssen.',
    ogImage: '/assets/images/hero-skiff.webp',
    index: true
  },
  {
    path: '/deutschlandachter-1960/',
    file: 'deutschlandachter-1960/index.html',
    title: 'Deutschlandachter 1960: Olympiasieg in Rom | Adams Erben',
    description: 'Der Deutschlandachter 1960: Mannschaft, Karl Adams Rolle, Vorbereitung, Olympiasieg in Rom und die Bedeutung für die deutsche Achtertradition.',
    ogTitle: 'Deutschlandachter 1960: Olympiasieg in Rom',
    ogDescription: 'Mannschaft, Trainer, Finale und die Entstehung einer deutschen Achtertradition.',
    ogImage: '/assets/images/deutschlandachter.webp',
    index: true
  },
  {
    path: '/ratzeburg/',
    file: 'ratzeburg/index.html',
    title: 'Ratzeburg: Ruderstadt, Karl Adam & Ruderakademie | Adams Erben',
    description: 'Warum Ratzeburg eine besondere Ruderstadt ist: Karl Adam, Ratzeburger Ruderclub, Küchensee, Ruderakademie und Internationale Ruderregatta im Überblick.',
    ogTitle: 'Ratzeburg: Ruderstadt, Karl Adam & Ruderakademie',
    ogDescription: 'Karl Adam, RRC, Küchensee, Ruderakademie und Regatta: Warum Ratzeburg bis heute ein besonderer Ort des Ruderns ist.',
    ogImage: '/assets/images/ratzeburg-regatta.webp',
    index: true
  },
  {
    path: '/karl-adam-trainingsmethoden/',
    file: 'karl-adam-trainingsmethoden/index.html',
    title: 'Karl Adams Trainingsmethoden: Intervall, Kraft & Technik | Adams Erben',
    description: 'Karl Adams Trainingsmethoden erklärt: Intervalltraining, Kraft, Schlagzahl, Material, mündige Athleten und Höhenvorbereitung – historisch sauber eingeordnet.',
    ogTitle: 'Karl Adams Trainingsmethoden: Intervall, Kraft & Technik',
    ogDescription: 'Was Karl Adam im Rudern tatsächlich veränderte – und was er nicht erfand. Training, Technik, Material und Athletenführung quellenbasiert erklärt.',
    ogImage: '/assets/images/measured-training.webp',
    index: true
  }
];

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

function addHomepageLinks($) {
  const heroActions = $('.hero .hero-actions').first();
  if (heroActions.length && !heroActions.find('a[href="/karl-adam/"]').length) {
    heroActions.append('<a class="button button-secondary" href="/karl-adam/">Karl Adam entdecken</a>');
  }

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
  if (ratzeburgActions.length && !ratzeburgActions.find('a[href="/ratzeburg/"]').length) {
    ratzeburgActions.append('<a class="button button-secondary" href="/ratzeburg/">Ratzeburg als Ruderstadt</a>');
  }

  const laborHeading = $('#labor .lab-heading').first();
  if (laborHeading.length && !$('#labor .seo-training-detail-links').length) {
    laborHeading.append(`
      <div class="film-links seo-training-detail-links">
        <a class="button button-secondary" href="/karl-adam-trainingsmethoden/">Karl Adams Trainingsmethoden vertiefen</a>
      </div>`);
  }
}

function addDetailCrossLinks($, currentPath) {
  const nav = $('.site-header nav[aria-label="Hauptnavigation"]').first();
  const coreLinks = [
    ['/karl-adam/', 'Karl Adam'],
    ['/adams-acht/', 'Adams Acht'],
    ['/deutschlandachter-1960/', 'Achter 1960'],
    ['/ratzeburg/', 'Ratzeburg'],
    ['/karl-adam-trainingsmethoden/', 'Trainingsmethoden']
  ];

  for (const [href, label] of coreLinks) {
    if (!nav.find(`a[href="${href}"]`).length) {
      const clubLink = nav.find('a[href="/#vereine"], a[href="#vereine"]').first();
      const link = `<a href="${href}"${href === currentPath ? ' aria-current="page"' : ''}>${label}</a>`;
      if (clubLink.length) clubLink.before(link);
      else nav.append(link);
    }
  }

  if (currentPath === '/karl-adam/') {
    const nextLinks = $('.next-card .next-links').first();
    if (nextLinks.length) {
      const additions = [
        ['/deutschlandachter-1960/', 'Deutschlandachter 1960', 'button button-primary'],
        ['/adams-acht/', 'Adams Acht', 'button button-secondary'],
        ['/ratzeburg/', 'Ratzeburg', 'button button-secondary'],
        ['/karl-adam-trainingsmethoden/', 'Trainingsmethoden', 'button button-secondary']
      ];
      for (const [href, label, className] of additions.reverse()) {
        if (!nextLinks.find(`a[href="${href}"]`).length) {
          nextLinks.prepend(`<a class="${className}" href="${href}">${label}</a>`);
        }
      }
    }
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
  $('title').text(page.title);
  setMeta($, 'meta[name="description"]', { name: 'description', content: page.description });
  setCanonical($, absoluteUrl(page.path));
  setMeta($, 'meta[property="og:site_name"]', { property: 'og:site_name', content: 'Adams Erben' });
  setMeta($, 'meta[property="og:locale"]', { property: 'og:locale', content: 'de_DE' });
  setMeta($, 'meta[property="og:title"]', { property: 'og:title', content: page.ogTitle });
  setMeta($, 'meta[property="og:description"]', { property: 'og:description', content: page.ogDescription });
  setMeta($, 'meta[property="og:url"]', { property: 'og:url', content: absoluteUrl(page.path) });
  setMeta($, 'meta[property="og:image"]', { property: 'og:image', content: `${origin}${page.ogImage}` });
  setMeta($, 'meta[property="og:image:alt"]', { property: 'og:image:alt', content: 'Adams Erben – Rudern zwischen Geschichte und Gegenwart' });
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
    addDetailCrossLinks($, page.path);
  }

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
