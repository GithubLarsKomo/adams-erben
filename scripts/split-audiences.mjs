import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const dist = path.join(root, 'dist');
const sourcePath = path.join(dist, 'index.html');
const rowingDir = path.join(dist, 'rudern');
const rowingPath = path.join(rowingDir, 'index.html');
const sourceHtml = await readFile(sourcePath, 'utf8');

function ensureAudienceStyles($) {
  if (!$('link[href="/assets/audience-pages.css"]').length) {
    $('head').append('<link rel="stylesheet" href="/assets/audience-pages.css">');
  }
}

function setCanonical($, url) {
  $('meta[property="og:url"]').attr('content', url);
  const canonical = $('link[rel="canonical"]');
  if (canonical.length) canonical.attr('href', url);
  else $('head').append(`<link rel="canonical" href="${url}">`);
}

function siteBase($) {
  const current = $('meta[property="og:url"]').attr('content') || 'https://adams-erben.de/';
  return current.includes('preview.adams-erben.de')
    ? 'https://preview.adams-erben.de'
    : 'https://adams-erben.de';
}

function renderRowingPage(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const base = siteBase($);
  $('body').addClass('audience-page audience-page-rowing');
  ensureAudienceStyles($);

  $('title').text('Rudern verstehen – Karl Adams Erbe im Sport von heute | Adams Erben');
  $('meta[name="description"]').attr('content', 'Training, Technik, Ratzeburg, Deutschlandachter und Ruderkultur: die vertiefende Seite zu Karl Adams Erbe und zum Rudern von heute.');
  $('meta[property="og:title"]').attr('content', 'Rudern verstehen – Adams Erbe im Sport von heute');
  $('meta[property="og:description"]').attr('content', 'Die redaktionelle Vertiefung zu Karl Adam, Ratzeburg, Training, Technik und Ruderkultur.');
  setCanonical($, `${base}/rudern/`);

  $('#film').remove();

  const hero = $('.hero').first();
  hero.find('.eyebrow').first().text('Rudern & Adams Erbe · Vertiefung');
  hero.find('h1').first().html('Rudern verstehen.<br>Adams Erbe weiterdenken.');
  hero.find('.lead').first().text('Training, Technik, Mannschaft, Ratzeburg und Ruderkultur: Diese Seite vertieft, was Karl Adam im Rudern verändert hat, wie seine Ideen weiterwirken und wo historische Einordnung notwendig bleibt.');
  hero.find('.hero-actions').html(`
    <a class="button button-primary" href="#labor">Adams Labor entdecken</a>
    <a class="button button-secondary" href="/">Rudern selbst ausprobieren</a>
  `);
  hero.find('.independence-note').text('Die vertiefende Redaktion von Adams Erben. Unabhängig von Film, Verbänden und den genannten Institutionen.');

  const nav = $('#primary-navigation');
  nav.html(`
    <a href="/">Für Einsteiger</a>
    <a href="#labor">Adams Labor</a>
    <a href="#geschichte">Einordnung</a>
    <a href="#ruderakademie">Ruderakademie</a>
    <a href="#rudern-verstehen">Rudern verstehen</a>
    <a href="#stimmen">Stimmen</a>
    <a class="nav-cta" href="#vereine">Verein finden</a>
  `);

  $('.header-find-club').attr('href', '#vereine').text('Verein finden');
  $('.skip-link').attr('href', '#labor').text('Zum Adams Labor springen');

  const intro = `
    <section class="audience-intro audience-intro-rowing" aria-labelledby="rowing-intro-title">
      <div>
        <p class="eyebrow">Die zweite Ebene</p>
        <h2 id="rowing-intro-title">Für alle, die nach dem ersten Eindruck tiefer einsteigen wollen.</h2>
        <p>Hier darf es fachlicher, historischer und ausführlicher werden. Wer zunächst nur einen Verein finden oder Rudern ausprobieren möchte, gelangt jederzeit zurück zur kurzen Einstiegsseite.</p>
      </div>
      <a class="button button-secondary" href="/">Zur Einstiegsseite</a>
    </section>`;
  hero.after(intro);

  return $.html();
}

function renderLandingPage(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const base = siteBase($);
  $('body').addClass('audience-page audience-page-landing');
  ensureAudienceStyles($);

  $('title').text('Adams Erben – Vom Kinosaal ins Boot');
  $('meta[name="description"]').attr('content', '„Adams Acht“ gesehen? Entdecke, wie Karl Adams Erbe heute weiterlebt, und finde einen Ruderverein in deiner Nähe, um Rudern selbst auszuprobieren.');
  $('meta[property="og:title"]').attr('content', 'Adams Erben – Vom Kinosaal ins Boot');
  $('meta[property="og:description"]').attr('content', 'Der Film macht neugierig. Adams Erben zeigt den Weg ins echte Ruderboot und zum Verein in deiner Nähe.');
  setCanonical($, `${base}/`);

  const removeSelectors = [
    '.city-story',
    '#regatta',
    '#labor',
    '#geschichte',
    '#ruderakademie',
    '#rudern-verstehen',
    '#foerderung'
  ];
  for (const selector of removeSelectors) $(selector).remove();

  const hero = $('.hero').first();
  hero.find('.hero-actions').html(`
    <a class="button button-primary" href="#quick-finder">Rudern ausprobieren</a>
    <a class="button button-secondary" href="#ratzeburg">Ratzeburg entdecken</a>
  `);

  const nav = $('#primary-navigation');
  nav.html(`
    <a href="#film">Adams Acht</a>
    <a href="#ratzeburg">Ratzeburg</a>
    <a href="#stimmen">Stimmen</a>
    <a href="/rudern/">Mehr entdecken</a>
    <a class="nav-cta" href="#quick-finder">Rudern ausprobieren</a>
  `);
  $('.header-find-club').attr('href', '#quick-finder').text('Rudern ausprobieren');
  $('.skip-link').attr('href', '#quick-finder').text('Direkt Rudern ausprobieren');

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
          <button class="button button-primary" type="submit">Verein in der Nähe finden</button>
        </div>
        <div class="quick-finder-secondary">
          <button class="button button-ghost button-small" id="quick-use-location" type="button">Standort verwenden</button>
          <span>Keine Verbandskenntnisse nötig · deutschlandweit</span>
        </div>
      </form>
    </section>`;
  $('#film').after(quickFinder);

  const depthTeaser = `
    <section class="depth-teaser" id="mehr-entdecken" aria-labelledby="depth-title">
      <div class="section-heading">
        <p class="eyebrow">Mehr als eine Filmgeschichte</p>
        <h2 id="depth-title">Warum Karl Adams Ideen bis heute im Rudern sichtbar sind.</h2>
        <p>Auf der vertiefenden Seite geht es ausführlich um Training, Technik, Mannschaft, Ratzeburg und die historische Einordnung.</p>
      </div>
      <div class="depth-teaser-grid">
        <a class="depth-teaser-card" href="/rudern/#labor"><strong>Training wird messbar</strong><span>Wie Adam Trainingsmethoden systematischer machte.</span></a>
        <a class="depth-teaser-card" href="/rudern/#rudern-verstehen"><strong>Ein Boot wird zum System</strong><span>Rhythmus, Technik und das Zusammenspiel im Achter.</span></a>
        <a class="depth-teaser-card" href="/rudern/#geschichte"><strong>Geschichte braucht Einordnung</strong><span>Sporthistorische Leistung und NS-Vergangenheit gemeinsam betrachten.</span></a>
      </div>
      <a class="button button-secondary depth-teaser-cta" href="/rudern/">Rudern & Adams Erbe vertiefen</a>
    </section>`;
  $('#ratzeburg').after(depthTeaser);

  const voices = $('#stimmen');
  voices.find('.voice-grid > *').slice(3).remove();
  voices.find('#voices-title').text('Drei Perspektiven auf das, was Rudern ausmacht.');
  voices.find('.section-heading > p').last().text('Menschen aus unterschiedlichen Generationen sollen hier zeigen, dass Rudern weit mehr ist als olympischer Leistungssport. Die derzeitigen Texte bleiben bis zu den echten Interviews klar als Platzhalter gekennzeichnet.');
  voices.find('.podcast-feature').remove();
  voices.append('<p class="landing-more-link"><a class="button button-secondary" href="/rudern/#stimmen">Mehr Stimmen und Ruderkultur entdecken</a></p>');

  const journey = $('.about.journey');
  journey.find('#steps-title').text('Drei Schritte vom Kinosaal ins Ruderboot.');
  const steps = journey.find('.principles article');
  steps.eq(0).find('h3').text('1. Ort eingeben');
  steps.eq(0).find('p').text('Ein Ort oder eine Postleitzahl reicht, um passende Rudervereine in der Nähe zu finden.');
  steps.eq(1).find('h3').text('2. Verein kennenlernen');
  steps.eq(1).find('p').text('Öffne die Vereinswebsite oder frage direkt an, wenn der Verein einen freigegebenen Kontakt bereitstellt.');
  steps.eq(2).find('h3').text('3. Rudern ausprobieren');

  const directoryHeading = $('#directory-title');
  directoryHeading.text('Alle Rudervereine durchsuchen');
  directoryHeading.next('p').text('Wenn du genauer suchen möchtest, stehen hier zusätzlich Filter, Umkreis und die vollständige Vereinsübersicht bereit.');

  const about = $('#ueber');
  about.before(`
    <section class="professional-link" aria-labelledby="professional-link-title">
      <div>
        <p class="eyebrow">Du ruderst schon – oder willst mehr wissen?</p>
        <h2 id="professional-link-title">Die ausführliche Seite beginnt dort, wo diese Landingpage bewusst kurz bleibt.</h2>
        <p>Adams Labor, Deutschlandachter, Ruderakademie, Regatta, Rudertechnik, Wanderrudern, Schubschlag, Quellen und historische Einordnung findest du gesammelt auf der Vertiefungsseite.</p>
      </div>
      <a class="button button-primary" href="/rudern/">Rudern & Adams Erbe entdecken</a>
    </section>`);

  $('body').append(`
    <script>
      (() => {
        const form = document.getElementById('quick-find-form');
        const quickInput = document.getElementById('quick-location');
        const fullInput = document.getElementById('search');
        const nearbyButton = document.getElementById('find-nearby');
        const radius = document.getElementById('radius-filter');
        const useLocation = document.getElementById('use-location');
        const directory = document.getElementById('vereine');

        form?.addEventListener('submit', (event) => {
          event.preventDefault();
          const value = quickInput?.value.trim() || '';
          if (!value) {
            quickInput?.focus();
            return;
          }
          if (fullInput) {
            fullInput.value = value;
            fullInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
          if (radius) radius.value = '50';
          directory?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.setTimeout(() => nearbyButton?.click(), 250);
        });

        document.getElementById('quick-use-location')?.addEventListener('click', () => {
          directory?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.setTimeout(() => useLocation?.click(), 250);
        });
      })();
    </script>`);

  return $.html();
}

function validateLanding(html) {
  const $ = cheerio.load(html);
  const required = ['#quick-finder', '#film', '#ratzeburg', '#stimmen', '#vereine', 'a[href="/rudern/"]'];
  for (const selector of required) {
    if (!$(selector).length) throw new Error(`[split-audiences] landing page missing ${selector}`);
  }
  const forbidden = ['#labor', '#geschichte', '#ruderakademie', '#rudern-verstehen', '#foerderung'];
  for (const selector of forbidden) {
    if ($(selector).length) throw new Error(`[split-audiences] landing page unexpectedly contains ${selector}`);
  }
}

function validateRowing(html) {
  const $ = cheerio.load(html);
  const required = ['#labor', '#geschichte', '#ruderakademie', '#rudern-verstehen', '#regatta', '#vereine', 'a[href="/"]'];
  for (const selector of required) {
    if (!$(selector).length) throw new Error(`[split-audiences] rowing page missing ${selector}`);
  }
  if ($('#film').length) throw new Error('[split-audiences] rowing page still contains film-first section');
}

const rowingHtml = renderRowingPage(sourceHtml);
const landingHtml = renderLandingPage(sourceHtml);
validateRowing(rowingHtml);
validateLanding(landingHtml);

await mkdir(rowingDir, { recursive: true });
await writeFile(rowingPath, rowingHtml);
await writeFile(sourcePath, landingHtml);

console.log('[split-audiences] generated / and /rudern/ audience pages');
