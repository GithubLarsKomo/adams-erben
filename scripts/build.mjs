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
const rowingExplainerPath = path.join(src, 'partials', 'rowing-explainer.html');
const rowingExplainerHtml = await readFile(rowingExplainerPath, 'utf8');
const academyPath = path.join(src, 'partials', 'ruderakademie.html');
const academyHtml = await readFile(academyPath, 'utf8');
const previewStyles = previewMode ? '  <link rel="stylesheet" href="/assets/preview.css">\n' : '';
const previewRobots = previewMode ? '  <meta name="robots" content="noindex,nofollow">\n' : '';
const rowingStyles = '  <link rel="stylesheet" href="/assets/rowing-explainer.css">\n  <link rel="stylesheet" href="/assets/storyboard-overrides.css">\n';
const academyStyles = '  <link rel="stylesheet" href="/assets/ruderakademie.css">\n';
const canonicalUrl = previewMode ? 'https://preview.adams-erben.de/' : 'https://adams-erben.de/';
const legalFooterLink = '<a href="/datenschutz.php">Datenschutz</a><a href="/rechtliche-hinweise.php">Rechtliche Hinweise</a>';
const voicesAnchor = '    <section class="voices" id="stimmen" aria-labelledby="voices-title">';
const historyAnchor = '    <section class="history" id="geschichte" aria-labelledby="history-title">';
const academyCityParagraph = '<p>Die rund zweistündige Themenführung folgt den Spuren Karl Adams und der Ratzeburger Rudergeschichte: vom Karl-Adam-Gedenkstein beim RRC über die frühere Gelehrtenschule und das historische Bootshaus bis zur Ruderakademie.</p>';
const academyCityLink = '<a class="text-link city-academy-link" href="#ruderakademie">Mehr zur Ruderakademie und ihrer Verbindung zu Karl Adam ↓</a>';
const measuredTrainingImage = '<figure class="lab-image-frame lab-image-frame-measured-training"><img src="/assets/images/measured-training.png" alt="Grafische Darstellung der systematischen Trainingssteuerung mit Belastungs- und Erholungsphasen"></figure>';
const trainingImage = '<figure class="lab-image-frame lab-image-frame-training"><img src="/assets/images/tafelbild.png" alt="Tafelbild zum Winter- und Krafttraining im Rudern"></figure>';
const oarImage = '          <figure class="lab-image-frame lab-image-frame-oars"><img src="/assets/images/oars-over-time.png" alt="Entwicklung und Veränderung von Riemen und Ruderblättern im Zeitverlauf"></figure>';
const altitudeImage = '<figure class="lab-image-frame lab-image-frame-altitude"><img src="/assets/images/hoehe-mexiko.png" alt="Grafische Darstellung der Höhenvorbereitung auf die Olympischen Spiele 1968 in Mexiko-Stadt"></figure>';
const redundantOutroLink = '    <a class="text-link" href="#stimmen">Weiter zu Adams Erben heute ↓</a>\n';
const editorialLaborNote = '      <p class="source-note">Die Darstellung trennt bewusst zwischen belegten historischen Praktiken und heutiger Einordnung. Detailformulierungen werden vor Veröffentlichung zusätzlich gegen Karl-Adams Primärtexte sowie die Biografie von Dirk Andresen und Timo Reinke geprüft.</p>\n';
const editorialHistoryNote = '          <p class="source-note">Ein weiterer kontroverser Presse-/Rudersport-Beitrag wird erst nach eindeutiger Quellenprüfung ergänzt.</p>\n';

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
        <img class="boat hero-skiff" src="/assets/images/hero-skiff.png" alt="" width="1200" height="675" decoding="async" fetchpriority="high">
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
    orderedSections.push(section.detach());
  }

  const leftovers = main.children('section').detach();
  for (const section of orderedSections) main.append(section);
  if (leftovers.length) $('#ueber').before(leftovers);

  $('#film').addClass('story-film-bridge');

  const rowingOutro = $('#rudern-verstehen .rowing-outro');
  if (rowingOutro.length && !rowingOutro.find('.external-resource-world-rowing').length) {
    rowingOutro.append(`
    <aside class="external-resource external-resource-world-rowing" aria-label="Rudern international weiterentdecken">
      <div>
        <p class="card-kicker">International weiterentdecken</p>
        <h4>Rudern weltweit</h4>
        <p>Wer nach Bootsklassen, Rennformaten und Rudern in Deutschland weiter hinausblicken möchte, findet beim Weltverband World Rowing den internationalen Sport.</p>
      </div>
      <a class="button button-secondary" href="https://worldrowing.com/" target="_blank" rel="noopener noreferrer">Zu World Rowing ↗</a>
    </aside>`);
  }

  const searchPanel = $('#vereine .search-panel');
  if (searchPanel.length && !$('#vereine .official-search-note').length) {
    searchPanel.after(`
    <p class="official-search-note">Adams Erben bietet einen eigenen, vereinsnahen Einstieg. Alternativ kannst du direkt die <a href="https://www.rudern.de/service/vereinssuche" target="_blank" rel="noopener noreferrer">offizielle Vereinssuche des Deutschen Ruderverbands ↗</a> nutzen.</p>`);
  }

  const voiceGrid = $('#stimmen .voice-grid');
  if (voiceGrid.length && !$('#stimmen .podcast-feature').length) {
    voiceGrid.after(`
    <article class="podcast-feature">
      <div>
        <p class="card-kicker">Noch mehr Stimmen aus dem Rudersport</p>
        <h3>Schubschlag</h3>
        <p>Carsten Brzeski und Matthias Zander sprechen mit Menschen aus dem Rudersport über Erfahrungen, Entwicklungen und Geschichten aus vielen Jahrzehnten.</p>
      </div>
      <a class="button button-secondary" href="https://www.podcast.de/podcast/2776815/schubschlag" target="_blank" rel="noopener noreferrer">Schubschlag hören ↗</a>
    </article>`);
  }

  const trainingCard = $('#labor .lab-card-training').first();
  if (trainingCard.length && !trainingCard.find('.listening-tip').length) {
    trainingCard.append(`
    <p class="listening-tip"><strong>Hörtipp · Schubschlag:</strong> <a href="https://www.podcast.de/episode/624998733/folge-26-wissen-macht-schnell" target="_blank" rel="noopener noreferrer">Folge 26 „Wissen macht schnell“ ↗</a></p>`);
  }

  const eightCopy = $('#rudern-verstehen .eight-explainer .eight-copy');
  if (eightCopy.length && !eightCopy.find('.listening-tip').length) {
    eightCopy.append(`
    <p class="listening-tip"><strong>Hörtipp · Schubschlag:</strong> <a href="https://www.podcast.de/episode/624998413/folge-58-mythos-deutschland-achter" target="_blank" rel="noopener noreferrer">Folge 58 „Mythos Deutschland-Achter“ ↗</a></p>`);
  }

  const distanceMark = $('#rudern-verstehen .distance-mark');
  if (distanceMark.length && !distanceMark.find('.listening-tip').length) {
    distanceMark.append(`
    <p class="listening-tip listening-tip-center"><strong>Hörtipp · Schubschlag:</strong> Folge 149 „Die beste Regatta Europas“ über den Fari Cup · <a href="https://www.podcast.de/podcast/2776815/schubschlag" target="_blank" rel="noopener noreferrer">zum Podcast ↗</a></p>`);
  }

  if (!$('link[href="/assets/mobile-fixes.css"]').length) $('head').append('<link rel="stylesheet" href="/assets/mobile-fixes.css">');
  if (!$('link[href="/assets/story-flow.css"]').length) $('head').append('<link rel="stylesheet" href="/assets/story-flow.css">');
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
    ['.hero-skiff[src="/assets/images/hero-skiff.png"]', 'hero image'],
    ['#ruderakademie', 'Ruderakademie section'],
    ['#rudern-verstehen', 'rowing explainer'],
    ['a[href="https://worldrowing.com/"]', 'World Rowing link'],
    ['a[href="https://www.rudern.de/service/vereinssuche"]', 'DRV club search link'],
    ['a[href="https://www.podcast.de/podcast/2776815/schubschlag"]', 'Schubschlag link']
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
}

const preparedIndexHtml = replaceLaborVisuals(indexHtml)
  .replaceAll('__APP_MODE__', previewMode ? 'preview' : 'production')
  .replaceAll('https://adams-erben.de/', canonicalUrl)
  .replace('<script src="/assets/app.js" defer></script>', '<script type="module" src="/assets/app.js"></script>')
  .replace(
    'Adams Erben bringt deine Anfrage zum passenden Verein oder – falls nötig – zur zuständigen Verbandsstelle.',
    'Wenn der Verein eine öffentliche E-Mail-Adresse bereitstellt, kannst du direkt anfragen. Andernfalls führt Adams Erben zur Vereinswebsite oder zeigt den verfügbaren Standort.'
  )
  .replace(
    '<h3>Sicheres Kontakt-Routing</h3><p>Eine Anfrage geht zuerst an den gewählten Verein. Fehlt dort eine öffentliche Kontaktadresse, wird sie an den zuständigen Landesruderverband und erst danach an den DRV geroutet.</p>',
    '<h3>Direkter Kontakt – kein Verbands-Fallback</h3><p>Eine Anfrage wird nur angeboten, wenn für die ausgewählte Organisation selbst eine freigegebene öffentliche E-Mail-Adresse vorliegt. Fehlt sie, wird nicht an Landesruderverband oder DRV umgeleitet.</p>'
  )
  .replace(
    'Die Empfängeradresse wird ausschließlich serverseitig aus dem gewählten Verein bestimmt und kann nicht frei eingegeben werden.',
    'Die Empfängeradresse wird ausschließlich serverseitig aus dem direkten, freigegebenen Kontakt der ausgewählten Organisation bestimmt. Es gibt kein Fallback an einen Verband.'
  )
  .replace(
    'Ich stimme zu, dass meine Angaben zum Zweck der Kontaktaufnahme an den angezeigten Verein bzw. den zuständigen Verband übermittelt werden.',
    'Ich stimme zu, dass meine Angaben zum Zweck der Kontaktaufnahme ausschließlich an die ausgewählte Organisation übermittelt werden.'
  )
  .replace(editorialLaborNote, '')
  .replace(editorialHistoryNote, '')
  .replace(academyCityParagraph, `${academyCityParagraph}\n          ${academyCityLink}`)
  .replace(voicesAnchor, `${rowingExplainerHtml.replace(redundantOutroLink, '')}\n\n${voicesAnchor}`)
  .replace(historyAnchor, `${academyHtml}\n\n${historyAnchor}`)
  .replace('<a href="/datenschutz.php">Datenschutz</a>', legalFooterLink)
  .replace('</head>', `${rowingStyles}${academyStyles}${previewStyles}${previewRobots}</head>`);

await writeFile(indexPath, renderPage(preparedIndexHtml));

const seedPath = path.join(dist, 'data', 'clubs.seed.json');
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
  const seed = await readFile(seedPath, 'utf8');
  const postalSeed = await readFile(postalSeedPath, 'utf8');
  await writeFile(publicPath, seed);
  await writeFile(postalPublicPath, postalSeed);
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
await rm(postalSeedPath, { force: true });
console.log(`[build] dist ready (${previewMode ? 'preview' : 'production'} mode)`);
