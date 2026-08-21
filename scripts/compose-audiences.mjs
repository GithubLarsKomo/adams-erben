import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const dist = path.join(root, 'dist');
const sourcePath = path.join(dist, 'index.html');
const rowingDir = path.join(dist, 'rudern');
const rowingPath = path.join(rowingDir, 'index.html');
const schubschlagPath = path.join(root, 'src', 'partials', 'schubschlag.html');
const [sourceHtml, schubschlagHtml] = await Promise.all([
  readFile(sourcePath, 'utf8'),
  readFile(schubschlagPath, 'utf8')
]);

function ensureAudienceStyles($) {
  if (!$('link[href="/assets/audience-pages.css"]').length) {
    $('head').append('<link rel="stylesheet" href="/assets/audience-pages.css">');
  }
  if (!$('link[href="/assets/impeccable-slice1.css"]').length) {
    $('head').append('<link rel="stylesheet" href="/assets/impeccable-slice1.css">');
  }
}

function setCanonical($, url) {
  $('meta[property="og:url"]').attr('content', url);
  const canonical = $('link[rel="canonical"]');
  if (canonical.length) canonical.attr('href', url);
  else $('head').append(`<link rel="canonical" href="${url}">`);
}

function setSocialPreview($, base) {
  const imageUrl = `${base}/assets/images/hero-skiff.webp`;
  $('meta[name="twitter:card"]').attr('content', 'summary_large_image');
  const ogImage = $('meta[property="og:image"]');
  if (ogImage.length) ogImage.attr('content', imageUrl);
  else $('head').append(`<meta property="og:image" content="${imageUrl}">`);
  const twitterImage = $('meta[name="twitter:image"]');
  if (twitterImage.length) twitterImage.attr('content', imageUrl);
  else $('head').append(`<meta name="twitter:image" content="${imageUrl}">`);
}

function siteBase($) {
  const current = $('meta[property="og:url"]').attr('content') || 'https://adams-erben.de/';
  return current.includes('preview.adams-erben.de')
    ? 'https://preview.adams-erben.de'
    : 'https://adams-erben.de';
}

function applySharedPartials($) {
  const voices = $('#stimmen');
  if (!voices.length) throw new Error('[audiences] #stimmen missing before composition');
  voices.find('.podcast-feature').remove();
  const voiceGrid = voices.find('.voice-grid').first();
  if (!voiceGrid.length) throw new Error('[audiences] .voice-grid missing before Schubschlag insertion');
  voiceGrid.after(schubschlagHtml);
}

function renderRowingPage(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const base = siteBase($);
  applySharedPartials($);
  $('body').addClass('audience-page audience-page-rowing').attr('data-shell-variant', 'rowing');
  ensureAudienceStyles($);

  $('title').text('Karl Adam, Ratzeburg und deutsche Rudergeschichte | Adams Erben');
  $('meta[name="description"]').attr('content', 'Historische und fachliche Vertiefung zu Karl Adam: Trainingssystem, Ratzeburg, Ost und West, Ruderakademie, Regatta und zeitgeschichtliche Einordnung.');
  $('meta[property="og:title"]').attr('content', 'Karl Adam und Ratzeburger Rudergeschichte | Adams Erben');
  $('meta[property="og:description"]').attr('content', 'Die historische und fachliche Vertiefung zu Karl Adam, Ratzeburg, Ost und West sowie der Entwicklung des Rudersports.');
  setCanonical($, `${base}/rudern/`);
  setSocialPreview($, base);

  $('#film, #rudern-verstehen, #stimmen').remove();

  const hero = $('.hero').first();
  hero.find('.eyebrow').first().text('Rudern & Adams Erbe · Vertiefung');
  hero.find('h1').first().html('Karl Adam verstehen.<br>Rudergeschichte einordnen.');
  hero.find('.lead').first().text('Adams Trainingssystem, Ratzeburg als Leistungszentrum, Ost und West, Ruderakademie und Zeitgeschichte: Diese Seite ist die zweite Ebene für alle, die nach dem Einstieg historisch und fachlich tiefer gehen wollen.');
  hero.find('.hero-actions').html(`
    <a class="button button-primary" href="#labor">Adams Labor entdecken</a>
  `);
  hero.find('.independence-note').text('Die historische und fachliche Vertiefung von Adams Erben. Unabhängig von Film, Verbänden und den genannten Institutionen.');

  hero.after(`
    <section class="audience-intro audience-intro-rowing" aria-labelledby="rowing-intro-title">
      <div>
        <p class="eyebrow">Die zweite Ebene</p>
        <h2 id="rowing-intro-title">Für alle, die Karl Adams Wirkung und ihre Zeit genauer verstehen wollen.</h2>
        <p>Wie Rudern funktioniert, welche Bootsklassen es gibt und warum der Sport ein Leben lang begleiten kann, erklärt die Einstiegsseite. Hier stehen Adams Methoden, Ratzeburg, die deutsch-deutsche Konkurrenz und historische Einordnung im Mittelpunkt.</p>
      </div>
      <a class="button button-secondary" href="/#rudern-verstehen">Zum Rudern-Grundkurs</a>
    </section>`);

  return $.html();
}

function renderLandingPage(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const base = siteBase($);
  applySharedPartials($);
  $('body').addClass('audience-page audience-page-landing').attr('data-shell-variant', 'landing');
  ensureAudienceStyles($);

  $('title').text('Adams Erben – Vom Kinosaal ins Boot');
  $('meta[name="description"]').attr('content', '„Adams Acht“ gesehen? Verstehe Rudern vom Grund her, entdecke die Menschen und Geschichten des Sports und finde einen Ruderverein in deiner Nähe.');
  $('meta[property="og:title"]').attr('content', 'Adams Erben – Vom Kinosaal ins Boot');
  $('meta[property="og:description"]').attr('content', 'Der Film macht neugierig. Adams Erben erklärt Rudern, erzählt seine Geschichten und zeigt den Weg ins echte Ruderboot.');
  setCanonical($, `${base}/`);
  setSocialPreview($, base);

  for (const selector of ['#regatta', '#labor', '#geschichte', '#ruderakademie', '#foerderung']) {
    $(selector).remove();
  }

  $('.city-story').first().addClass('impeccable-editorial-reference');

  const hero = $('.hero').first();
  hero.find('.hero-actions').html(`
    <a class="button button-primary" href="#quick-finder">Rudern ausprobieren</a>
    <a class="button button-secondary" href="#rudern-verstehen">Rudern verstehen</a>
  `);

  const quickFinder = `
    <section class="quick-finder" id="quick-finder" aria-labelledby="quick-finder-title">
      <div class="quick-finder-copy">
        <p class="eyebrow">Vom Zuschauen zum Einsteigen</p>
        <h2 id="quick-finder-title">Rudern ausprobieren.</h2>
        <p>Gib einfach deinen Ort oder deine Postleitzahl ein. Adams Erben nutzt die vorhandene Vereinssuche und berechnet Entfernungen lokal – ohne Karten- oder Geocoding-Dienst.</p>
      </div>
      <form class="quick-finder-form" id="quick-find-form">
        <label for="quick-location">Ort oder Postleitzahl</label>
        <div class="quick-finder-row">
          <input id="quick-location" type="search" autocomplete="postal-code" placeholder="z. B. Lübeck oder 23909">
          <button class="button button-primary" type="submit">Verein finden</button>
        </div>
        <div class="quick-finder-secondary">
          <button class="button button-ghost button-small" id="quick-use-location" type="button">Standort verwenden</button>
          <button class="button button-ghost button-small" id="open-full-directory" type="button">Alle Vereine &amp; Filter</button>
          <span>Keine Verbandskenntnisse nötig · deutschlandweit</span>
        </div>
      </form>
    </section>`;
  $('#film').after(quickFinder);

  const directory = $('#vereine');
  directory.addClass('landing-directory').attr('hidden', '');
  directory.find('#directory-title').text('Alle Rudervereine durchsuchen');
  directory.find('#directory-title').next('p').text('Wenn du genauer suchen möchtest, stehen hier zusätzlich Filter, Umkreis und die vollständige Vereinsübersicht bereit.');
  $('#quick-finder').after(directory);

  const depthTeaser = `
    <section class="depth-teaser" id="mehr-entdecken" aria-labelledby="depth-title">
      <div class="section-heading">
        <p class="eyebrow">Historisch tiefer einsteigen</p>
        <h2 id="depth-title">Wer Karl Adams Wirkung genauer verstehen will, findet eine zweite Ebene.</h2>
        <p>Adams Labor, Ratzeburg als Leistungszentrum, Ost und West, die Ruderakademie und historische Einordnung sind bewusst auf der Vertiefungsseite gebündelt.</p>
      </div>
      <div class="depth-teaser-grid">
        <a class="depth-teaser-card" href="/rudern/#labor"><strong>Adams Labor</strong><span>Training, Material, Physiologie und Führung als zusammenhängendes System.</span></a>
        <a class="depth-teaser-card" href="/rudern/#vorbild-rivale"><strong>Vom Vorbild zum Rivalen</strong><span>Wie sich west- und ostdeutsches Rudern beobachteten, lernten und bekämpften.</span></a>
        <a class="depth-teaser-card" href="/rudern/#geschichte"><strong>Geschichte braucht Einordnung</strong><span>Sporthistorische Leistung und Zeitgeschichte gemeinsam betrachten.</span></a>
      </div>
      <a class="button button-secondary depth-teaser-cta" href="/rudern/">Rudern & Adams Erbe vertiefen</a>
    </section>`;
  $('#stimmen').after(depthTeaser);

  const journey = $('.about.journey');
  journey.find('#steps-title').text('Drei Schritte vom Kinosaal ins Ruderboot.');
  const steps = journey.find('.principles article');
  steps.eq(0).find('h3').text('1. Ort eingeben');
  steps.eq(0).find('p').text('Ein Ort oder eine Postleitzahl reicht, um passende Rudervereine in der Nähe zu finden.');
  steps.eq(1).find('h3').text('2. Verein kennenlernen');
  steps.eq(1).find('p').text('Öffne die Vereinswebsite oder frage direkt an, wenn der Verein einen freigegebenen Kontakt bereitstellt.');
  steps.eq(2).find('h3').text('3. Rudern ausprobieren');
  journey.append('<p class="landing-final-cta"><a class="button button-primary" href="#quick-finder">Jetzt Verein finden</a></p>');

  $('#ueber').before(`
    <section class="professional-link" aria-labelledby="professional-link-title">
      <div>
        <p class="eyebrow">Mehr Geschichte und Kontext</p>
        <h2 id="professional-link-title">Die Vertiefung beginnt dort, wo aus Rudern Zeitgeschichte wird.</h2>
        <p>Adams Labor, deutsch-deutsche Konkurrenz, Ruderakademie, Regatta, Quellen und historische Einordnung findest du gesammelt auf der Vertiefungsseite.</p>
      </div>
      <a class="button button-primary" href="/rudern/">Karl Adam & Rudergeschichte vertiefen</a>
    </section>`);

  $('script[src="/assets/landing-page.js"]').remove();
  $('body').append('<script src="/assets/landing-page.js" defer></script>');

  return $.html();
}

function validateLanding(html) {
  const $ = cheerio.load(html);
  const required = ['#quick-finder', '#open-full-directory', '#film', '#ratzeburg', '.city-story.impeccable-editorial-reference', '#rudern-verstehen', '#stimmen', '#schubschlag', '#vereine', 'a[href="/rudern/"]', 'script[src="/assets/landing-page.js"]', 'link[href="/assets/impeccable-slice1.css"]'];
  for (const selector of required) {
    if (!$(selector).length) throw new Error(`[audiences] landing page missing ${selector}`);
  }
  if ($('#stimmen .voice-grid > *').length !== 6) throw new Error('[audiences] landing page must retain all six voices');
  if (!$('#vereine').is('[hidden]')) throw new Error('[audiences] landing directory must be progressively disclosed');
  for (const selector of ['#labor', '#geschichte', '#ruderakademie', '#regatta', '#foerderung', '#vorbild-rivale']) {
    if ($(selector).length) throw new Error(`[audiences] landing page unexpectedly contains historical/depth section ${selector}`);
  }
  if ($('body').attr('data-shell-variant') !== 'landing') throw new Error('[audiences] landing shell variant missing');
}

function validateRowing(html) {
  const $ = cheerio.load(html);
  for (const selector of ['#labor', '#geschichte', '#ruderakademie', '#regatta', '#vereine', 'a[href="/#rudern-verstehen"]']) {
    if (!$(selector).length) throw new Error(`[audiences] rowing page missing ${selector}`);
  }
  for (const selector of ['#film', '#rudern-verstehen', '#stimmen', '#schubschlag']) {
    if ($(selector).length) throw new Error(`[audiences] rowing page unexpectedly contains entry-level section ${selector}`);
  }
  if ($('body').attr('data-shell-variant') !== 'rowing') throw new Error('[audiences] rowing shell variant missing');
}

const rowingHtml = renderRowingPage(sourceHtml);
const landingHtml = renderLandingPage(sourceHtml);
validateRowing(rowingHtml);
validateLanding(landingHtml);

await mkdir(rowingDir, { recursive: true });
await writeFile(rowingPath, rowingHtml);
await writeFile(sourcePath, landingHtml);

console.log('[audiences] composed / as rowing entry page and /rudern/ as historical depth page');
