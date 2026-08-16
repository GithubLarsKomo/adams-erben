import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const privateDir = path.join(root, 'build-private');
const previewMode = process.env.PREVIEW_MODE === '1';

await rm(dist, { recursive: true, force: true });
await rm(privateDir, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await mkdir(privateDir, { recursive: true });
await cp(src, dist, { recursive: true });

const indexPath = path.join(dist, 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');
const appJs = await readFile(path.join(src, 'assets', 'app.js'), 'utf8');
const rowingExplainerPath = path.join(src, 'partials', 'rowing-explainer.html');
const rowingExplainerHtml = await readFile(rowingExplainerPath, 'utf8');
const academyPath = path.join(src, 'partials', 'ruderakademie.html');
const academyHtml = await readFile(academyPath, 'utf8');
const regattaPath = path.join(src, 'partials', 'ratzeburg-regatta.html');
const regattaHtml = await readFile(regattaPath, 'utf8');
const previewStyles = previewMode ? '  <link rel="stylesheet" href="/assets/preview.css">\n' : '';
const previewRobots = previewMode ? '  <meta name="robots" content="noindex,nofollow">\n' : '';
const rowingStyles = '  <link rel="stylesheet" href="/assets/rowing-explainer.css">\n  <link rel="stylesheet" href="/assets/storyboard-overrides.css">\n';
const academyStyles = '  <link rel="stylesheet" href="/assets/ruderakademie.css">\n';
const regattaStyles = '  <link rel="stylesheet" href="/assets/regatta.css">\n';
const canonicalUrl = previewMode ? 'https://preview.adams-erben.de/' : 'https://adams-erben.de/';
const legalFooterLink = '<a href="/datenschutz.php">Datenschutz</a><a href="/rechtliche-hinweise.php">Rechtliche Hinweise</a>';
const voicesAnchor = '    <section class="voices" id="stimmen" aria-labelledby="voices-title">';
const historyAnchor = '    <section class="history" id="geschichte" aria-labelledby="history-title">';
const laborAnchor = '    <section class="labor" id="labor" aria-labelledby="labor-title">';
const academyCityParagraph = '<p>Die rund zweistündige Themenführung folgt den Spuren Karl Adams und der Ratzeburger Rudergeschichte: vom Karl-Adam-Gedenkstein beim RRC über die frühere Gelehrtenschule und das historische Bootshaus bis zur Ruderakademie.</p>';
const academyCityLink = '<a class="text-link city-academy-link" href="#ruderakademie">Mehr zur Ruderakademie und ihrer Verbindung zu Karl Adam ↓</a>';
const measuredTrainingImage = '<figure class="lab-image-frame lab-image-frame-measured-training"><img src="/assets/images/measured-training.webp" alt="Grafische Darstellung der systematischen Trainingssteuerung mit Belastungs- und Erholungsphasen"></figure>';
const trainingImage = '<figure class="lab-image-frame lab-image-frame-training"><img src="/assets/images/tafelbild.webp" alt="Tafelbild zum Winter- und Krafttraining im Rudern"></figure>';
const oarImage = '          <figure class="lab-image-frame lab-image-frame-oars"><img src="/assets/images/oars-over-time.png" alt="Entwicklung und Veränderung von Riemen und Ruderblättern im Zeitverlauf"></figure>';
const altitudeImage = '<figure class="lab-image-frame lab-image-frame-altitude"><img src="/assets/images/hoehe-mexiko.webp" alt="Grafische Darstellung der Höhenvorbereitung auf die Olympischen Spiele 1968 in Mexiko-Stadt"></figure>';
const redundantOutroLink = '    <a class="text-link" href="#stimmen">Weiter zu Adams Erben heute ↓</a>\n';
const editorialLaborNote = '      <p class="source-note">Die Darstellung trennt bewusst zwischen belegten historischen Praktiken und heutiger Einordnung. Detailformulierungen werden vor Veröffentlichung zusätzlich gegen Karl-Adams Primärtexte sowie die Biografie von Dirk Andresen und Timo Reinke geprüft.</p>\n';
const editorialHistoryNote = '          <p class="source-note">Ein weiterer kontroverser Presse-/Rudersport-Beitrag wird erst nach eindeutiger Quellenprüfung ergänzt.</p>\n';

const brandAssets = {
  worldRowing: {
    local: '/assets/images/world-rowing.png',
    fallback: 'https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2020/12/04182712/WR-Logo-Dark.png'
  },
  drv: {
    local: '/assets/images/drv.png',
    fallback: 'https://www.rudern.de/sites/default/files/styles/content_full_desktop_1x/public/images/drv-logo.webp?itok=8KBhu-lW'
  },
  schubschlag: {
    local: '/assets/images/schubschlag.webp',
    fallback: 'https://cdn.podcastcms.de/images/podcasts/315/2776815/schubschlag.png'
  }
};

function brandImage({ local, fallback }, alt) {
  return `<img src="${local}" alt="${alt}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${fallback}'">`;
}

for (const obsoleteHelper of ['ensureNearbyControls', 'applyDirectContactCopy', 'ensureImageSlotStyles', 'hydrateImageSlots', 'data-nearby-styles']) {
  if (appJs.includes(obsoleteHelper)) {
    throw new Error(`[build] obsolete runtime page scaffolding found in app.js: ${obsoleteHelper}`);
  }
}

function replaceLaborVisuals(html) {
  return html
    .replace(/<div class="interval-diagram"[^>]*>[\s\S]*?<\/div>/, measuredTrainingImage)
    .replace(/<div class="training-note"[^>]*>[\s\S]*?<\/div>/, trainingImage)
    .replace(/\s*<div class="oar-diagram"[^>]*>[\s\S]*?<\/div>/, `\n${oarImage}`)
    .replace(/<div class="altitude-mark"[^>]*>[\s\S]*?<\/div>/, altitudeImage);
}

function renderPage(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const main = $('main');
  const header = $('.site-header');
  const nav = header.find('nav[aria-label="Hauptnavigation"]');
  const heroArt = $('.hero-art').first();

  if (!main.length) throw new Error('[build] main element not found');
  if (!header.length || !nav.length) throw new Error('[build] site header/navigation not found');
  if (!heroArt.length) throw new Error('[build] hero art not found');

  heroArt.replaceWith(`
      <figure class="hero-art hero-art-photo" aria-hidden="true">
        <img class="boat hero-skiff" src="/assets/images/hero-skiff.webp" alt="" width="1200" height="675" decoding="async" fetchpriority="high">
      </figure>`);

  nav.attr('id', 'primary-navigation').html(`
      <a href="#ratzeburg">Ratzeburg</a>
      <a href="#labor">Adams Labor</a>
      <a href="#geschichte">Einordnung</a>
      <a href="#ruderakademie">Ruderakademie</a>
      <a href="#rudern-verstehen">Rudern verstehen</a>
      <a href="#stimmen">Stimmen</a>
      <a class="nav-cta" href="#vereine">Verein finden</a>
  `);

  if (!header.find('.header-actions').length) {
    nav.before(`
    <div class="header-actions">
      <a class="header-find-club" href="#vereine">Verein finden</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Menü öffnen">
        <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
      </button>
    </div>`);
  }

  const desiredOrder = [
    '.hero',
    '#film',
    '#ratzeburg',
    '.city-story',
    '#regatta',
    '#labor',
    '#geschichte',
    '#ruderakademie',
    '#rudern-verstehen',
    '#stimmen',
    '#foerderung',
    '.about.journey',
    '#vereine',
    '#ueber'
  ];

  const orderedSections = [];
  for (const selector of desiredOrder) {
    const section = main.children(selector).first();
    if (!section.length) throw new Error(`[build] expected section missing: ${selector}`);
    orderedSections.push(section.remove());
  }

  const leftovers = main.children('section').remove();
  for (const section of orderedSections) main.append(section);
  if (leftovers.length) $('#ueber').before(leftovers);

  $('#film').addClass('story-film-bridge');

  const rowingOutro = $('#rudern-verstehen .rowing-outro');
  if (rowingOutro.length && !rowingOutro.find('.external-resource-world-rowing').length) {
    rowingOutro.append(`
    <aside class="source-link-card source-link-card-world external-resource external-resource-world-rowing" aria-label="Rudern international weiterentdecken">
      <div class="source-link-card-logo">${brandImage(brandAssets.worldRowing, 'World Rowing')}</div>
      <div class="source-link-card-copy">
        <p class="source-link-card-kicker">International · Sport und Technik</p>
        <h4>World Rowing</h4>
        <p>Bootsklassen, Rennformate, Regeln und Rudern weltweit: der internationale Blick auf den Sport.</p>
      </div>
      <a class="button button-secondary" href="https://worldrowing.com/" target="_blank" rel="noopener noreferrer">Zu World Rowing ↗</a>
    </aside>`);
  }

  const officialSearchNote = $('#vereine .official-search-note').first();
  if (officialSearchNote.length && !$('#vereine .source-link-card-drv').length) {
    officialSearchNote.replaceWith(`
    <aside class="source-link-card source-link-card-drv" aria-label="Offizielle Vereinssuche des Deutschen Ruderverbands">
      <div class="source-link-card-logo">${brandImage(brandAssets.drv, 'Deutscher Ruderverband')}</div>
      <div class="source-link-card-copy">
        <p class="source-link-card-kicker">Offiziell · Deutschland</p>
        <h4>Deutscher Ruderverband</h4>
        <p>Adams Erben bietet einen vereinsnahen Einstieg. Ergänzend führt die offizielle DRV-Vereinssuche direkt zum Verbandsangebot.</p>
      </div>
      <a class="button button-secondary" href="https://www.rudern.de/service/vereinssuche" target="_blank" rel="noopener noreferrer">DRV-Vereinssuche ↗</a>
    </aside>`);
  }

  const voiceGrid = $('#stimmen .voice-grid');
  if (voiceGrid.length && !$('#stimmen .podcast-feature').length) {
    voiceGrid.after(`
    <article class="source-link-card source-link-card-podcast podcast-feature">
      <div class="source-link-card-logo">${brandImage(brandAssets.schubschlag, 'Schubschlag Podcast')}</div>
      <div class="source-link-card-copy">
        <p class="source-link-card-kicker">Weiterhören · Menschen und Geschichten</p>
        <h3>Schubschlag</h3>
        <p>Carsten Brzeski und Matthias Zander erzählen Rudern über Leidenschaft, Freundschaft, Lebensphilosophie und die Menschen des Sports – klein und groß, Ost und West.</p>
      </div>
      <a class="button button-secondary" href="https://www.podcast.de/podcast/2776815/schubschlag" target="_blank" rel="noopener noreferrer">Schubschlag hören ↗</a>
    </article>`);
  }

  const trainingCard = $('#labor .lab-card-training').first();
  if (trainingCard.length && !trainingCard.find('.listening-tip-training').length) {
    trainingCard.append(`
    <p class="listening-tip listening-tip-training"><strong>Hörtipp · Schubschlag:</strong> <a href="https://www.podcast.de/episode/624998733/folge-26-wissen-macht-schnell" target="_blank" rel="noopener noreferrer">Folge 26 „Wissen macht schnell“ ↗</a></p>`);
  }

  const materialCard = $('#labor .lab-card-boat').first();
  if (materialCard.length && !materialCard.find('.listening-tip-material').length) {
    materialCard.append(`
    <p class="listening-tip listening-tip-material"><strong>Hörtipp · Schubschlag:</strong> Folge 148 „The Normal One“ – Bootsbauer, Bootsmeister und Ruderliebhaber Klaus Altena · <a href="https://www.podcast.de/podcast/2776815/schubschlag" target="_blank" rel="noopener noreferrer">zum Podcast ↗</a></p>`);
  }

  const eightCopy = $('#rudern-verstehen .eight-explainer .eight-copy');
  if (eightCopy.length && !eightCopy.find('.listening-tip-eight').length) {
    eightCopy.append(`
    <p class="listening-tip listening-tip-eight"><strong>Hörtipp · Schubschlag:</strong> <a href="https://www.podcast.de/episode/624998413/folge-58-mythos-deutschland-achter" target="_blank" rel="noopener noreferrer">Folge 58 „Mythos Deutschland-Achter“ ↗</a></p>`);
  }

  const ageCopy = $('#rudern-verstehen .age-band .age-copy');
  if (ageCopy.length && !ageCopy.find('.listening-tip-masters').length) {
    ageCopy.append(`
    <p class="listening-tip listening-tip-masters"><strong>Hörtipp · Schubschlag:</strong> <a href="https://www.podcast.de/episode/626692170/folge-85-je-oller-je-doller" target="_blank" rel="noopener noreferrer">Folge 85 „Je oller, je doller“ – Mastersrudern als Sport fürs ganze Leben ↗</a></p>`);
  }

  const touringCards = $('#rudern-verstehen .touring-cards');
  if (touringCards.length && !$('#rudern-verstehen .listening-tip-touring').length) {
    touringCards.after(`
    <p class="listening-tip listening-tip-light listening-tip-touring"><strong>Hörtipp · Schubschlag:</strong> Folge 152 „Auf in's Abenteuerland“ – ein Jahr durch Südamerika, von Ruderclub zu Ruderclub · <a href="https://www.podcast.de/podcast/2776815/schubschlag" target="_blank" rel="noopener noreferrer">zum Podcast ↗</a></p>`);
  }

  const distanceMark = $('#rudern-verstehen .distance-mark');
  if (distanceMark.length && !distanceMark.find('.listening-tip-distance').length) {
    distanceMark.append(`
    <p class="listening-tip listening-tip-center listening-tip-distance"><strong>Hörtipp · Schubschlag:</strong> Folge 149 „Die beste Regatta Europas“ über den Fari Cup · <a href="https://www.podcast.de/podcast/2776815/schubschlag" target="_blank" rel="noopener noreferrer">zum Podcast ↗</a></p>`);
  }

  const fundingOptions = $('#foerderung .funding-options').first();
  if (fundingOptions.length && !fundingOptions.find('.listening-tip-volunteering').length) {
    fundingOptions.append(`
    <p class="listening-tip listening-tip-light listening-tip-volunteering"><strong>Hörtipp · Schubschlag:</strong> Folge 157 „Leistungssport, Ehrenamt und ein Bundesverdienstkreuz“ – Wolfgang Fritsch über Rudern, Training und jahrzehntelanges Engagement · <a href="https://www.podcast.de/podcast/2776815/schubschlag" target="_blank" rel="noopener noreferrer">zum Podcast ↗</a></p>`);
  }
  if (fundingOptions.length && !fundingOptions.find('.regatta-volunteering-link').length) {
    fundingOptions.append(`
    <p class="regatta-volunteering-link"><strong>Mitmachen in groß:</strong> Wie viel ehrenamtliche Arbeit möglich macht, zeigt seit Jahrzehnten die <a href="#regatta">Internationale Ratzeburger Ruderregatta</a> – vom Auf- und Abbau bis zum Rennbetrieb.</p>`);
  }

  if (!$('link[href="/assets/mobile-fixes.css"]').length) $('head').append('<link rel="stylesheet" href="/assets/mobile-fixes.css">');
  if (!$('link[href="/assets/story-flow.css"]').length) $('head').append('<link rel="stylesheet" href="/assets/story-flow.css">');
  if (!$('link[href="/assets/source-links.css"]').length) $('head').append('<link rel="stylesheet" href="/assets/source-links.css">');
  if (!$('script[src="/assets/story-nav.js"]').length) $('body').append('<script src="/assets/story-nav.js" defer></script>');

  validatePage($, desiredOrder);
  return $.html();
}

function validatePage($, desiredOrder) {
  const actualOrder = $('main > section').map((_, element) => {
    const node = $(element);
    if (node.hasClass('hero')) return '.hero';
    if (node.hasClass('city-story')) return '.city-story';
    if (node.hasClass('about') && node.hasClass('journey')) return '.about.journey';
    return node.attr('id') ? `#${node.attr('id')}` : null;
  }).get().filter(Boolean);

  const expectedKnownOrder = desiredOrder.filter((selector) => actualOrder.includes(selector));
  const actualKnownOrder = actualOrder.filter((selector) => desiredOrder.includes(selector));
  if (actualKnownOrder.join('|') !== expectedKnownOrder.join('|')) {
    throw new Error(`[build] unexpected story order: ${actualKnownOrder.join(' -> ')}`);
  }

  const required = [
    ['#primary-navigation', 'primary navigation'],
    ['.header-actions .menu-toggle', 'mobile menu toggle'],
    ['.hero-skiff[src="/assets/images/hero-skiff.webp"]', 'hero image'],
    ['#regatta', 'regatta section'],
    ['#regatta img[src="/assets/images/ratzeburg-regatta.webp"]', 'regatta source image'],
    ['#ruderakademie', 'Ruderakademie section'],
    ['#rudern-verstehen', 'rowing explainer'],
    ['#find-nearby', 'static nearby search button'],
    ['#radius-filter', 'static nearby radius selector'],
    ['link[href="/assets/image-slots.css"]', 'static image styles'],
    ['link[href="/assets/source-links.css"]', 'source-link styles'],
    ['link[href="/assets/regatta.css"]', 'regatta styles'],
    ['.rrc-visual .asset-media-photo img[src="/assets/images/rrc-heute.webp"]', 'static RRC image'],
    ['.source-link-card-world img[src="/assets/images/world-rowing.png"]', 'World Rowing logo slot'],
    ['.source-link-card-drv img[src="/assets/images/drv.png"]', 'DRV logo slot'],
    ['.source-link-card-podcast img[src="/assets/images/schubschlag.webp"]', 'Schubschlag logo slot'],
    ['a[href="https://worldrowing.com/"]', 'World Rowing link'],
    ['a[href="https://www.rudern.de/service/vereinssuche"]', 'DRV club search link'],
    ['a[href="https://www.podcast.de/podcast/2776815/schubschlag"]', 'Schubschlag link'],
    ['.listening-tip-material', 'material podcast tip'],
    ['.listening-tip-masters', 'Masters podcast tip'],
    ['.listening-tip-touring', 'touring podcast tip'],
    ['.listening-tip-volunteering', 'volunteering podcast tip']
  ];
  for (const [selector, label] of required) {
    if (!$(selector).length) throw new Error(`[build] required ${label} missing`);
  }

  const navHrefs = $('#primary-navigation a').map((_, element) => $(element).attr('href')).get();
  const expectedNav = ['#ratzeburg', '#labor', '#geschichte', '#ruderakademie', '#rudern-verstehen', '#stimmen', '#vereine'];
  if (navHrefs.join('|') !== expectedNav.join('|')) {
    throw new Error(`[build] unexpected primary navigation: ${navHrefs.join(', ')}`);
  }

  const outputText = $.text();
  if (outputText.includes('zuständigen Landesruderverband und erst danach an den DRV geroutet')) {
    throw new Error('[build] obsolete association fallback copy survived rendering');
  }
  if (!outputText.includes('Direkter Kontakt – kein Verbands-Fallback')) {
    throw new Error('[build] direct-only contact explanation missing');
  }
  if (!outputText.includes('ausschließlich an die ausgewählte Organisation übermittelt werden')) {
    throw new Error('[build] direct-only consent copy missing');
  }
}

const preparedIndexHtml = replaceLaborVisuals(indexHtml)
  .replaceAll('__APP_MODE__', previewMode ? 'preview' : 'production')
  .replaceAll('https://adams-erben.de/', canonicalUrl)
  .replace('<script src="/assets/app.js" defer></script>', '<script type="module" src="/assets/app.js"></script>')
  .replace(editorialLaborNote, '')
  .replace(editorialHistoryNote, '')
  .replace(academyCityParagraph, `${academyCityParagraph}\n          ${academyCityLink}`)
  .replace(laborAnchor, `${regattaHtml}\n\n${laborAnchor}`)
  .replace(voicesAnchor, `${rowingExplainerHtml.replace(redundantOutroLink, '')}\n\n${voicesAnchor}`)
  .replace(historyAnchor, `${academyHtml}\n\n${historyAnchor}`)
  .replace('<a href="/datenschutz.php">Datenschutz</a>', legalFooterLink)
  .replace('</head>', `${rowingStyles}${academyStyles}${regattaStyles}${previewStyles}${previewRobots}</head>`);

await writeFile(indexPath, renderPage(preparedIndexHtml));

const seedPath = path.join(dist, 'data', 'clubs.seed.json');
const snapshotPath = path.join(dist, 'data', 'clubs.snapshot.json');
const publicPath = path.join(dist, 'data', 'clubs.json');
const postalSeedPath = path.join(dist, 'data', 'postal-locations.seed.json');
const postalPublicPath = path.join(dist, 'data', 'postal-locations.json');

function runNodeScript(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: root,
      env: process.env,
      stdio: 'inherit'
    });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${script} exited with ${code}`)));
    child.on('error', reject);
  });
}

async function runSync() {
  await runNodeScript('scripts/sync-drv.mjs');
  await runNodeScript('scripts/validate-drv-output.mjs');
}

try {
  if (process.env.SKIP_DRV_SYNC === '1') throw new Error('DRV sync explicitly skipped');
  await runSync();
} catch (error) {
  if (process.env.REQUIRE_DRV_SYNC === '1') throw error;
  console.warn(`[build] ${error.message}; using checked-in seed data.`);
  let clubDataPath = seedPath;
  let clubDataLabel = 'checked-in demo seed';
  if (process.env.USE_CLUB_SNAPSHOT === '1') {
    try {
      await readFile(snapshotPath, 'utf8');
      clubDataPath = snapshotPath;
      clubDataLabel = 'checked-in full club snapshot';
    } catch (snapshotError) {
      if (snapshotError?.code !== 'ENOENT') throw snapshotError;
      console.warn('[build] full club snapshot missing; falling back to demo seed.');
    }
  }
  const clubData = await readFile(clubDataPath, 'utf8');
  const postalSeed = await readFile(postalSeedPath, 'utf8');
  await writeFile(publicPath, clubData);
  await writeFile(postalPublicPath, postalSeed);
  console.warn(`[build] using ${clubDataLabel}.`);
  const fallbackReason = process.env.SKIP_DRV_SYNC === '1'
    ? 'DRV sync explicitly skipped'
    : error.message;
  await writeFile(
    path.join(privateDir, 'recipients.json'),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      source: previewMode ? 'preview-seed-fallback' : 'seed-fallback',
      preview: previewMode,
      routingMode: 'direct-only',
      fallbackReason,
      recipientCount: 0,
      warning: 'No recipient routes are present in this fallback file. Run the real DRV sync to generate verified direct organization routes.',
      recipients: {}
    }, null, 2)
  );
  console.warn('[build] recipients.json contains no fallback recipients; full direct routing requires a successful real DRV sync.');
}

await rm(seedPath, { force: true });
await rm(snapshotPath, { force: true });
await rm(postalSeedPath, { force: true });
console.log(`[build] dist ready (${previewMode ? 'preview' : 'production'} mode)`);
