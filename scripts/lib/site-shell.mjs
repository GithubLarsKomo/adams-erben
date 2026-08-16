import * as cheerio from 'cheerio';

const variants = {
  landing: {
    skipHref: '#quick-finder',
    skipLabel: 'Direkt Rudern ausprobieren',
    nav: [
      ['#film', 'Adams Acht'],
      ['#ratzeburg', 'Ratzeburg'],
      ['#stimmen', 'Stimmen'],
      ['/rudern/', 'Mehr entdecken'],
      ['#quick-finder', 'Rudern ausprobieren', 'nav-cta']
    ],
    ctaHref: '#quick-finder',
    ctaLabel: 'Rudern ausprobieren',
    compactLabel: 'Verein finden'
  },
  rowing: {
    skipHref: '#labor',
    skipLabel: 'Zum Adams Labor springen',
    nav: [
      ['/', 'Für Einsteiger'],
      ['#labor', 'Adams Labor'],
      ['#geschichte', 'Einordnung'],
      ['#ruderakademie', 'Ruderakademie'],
      ['#rudern-verstehen', 'Rudern verstehen'],
      ['#stimmen', 'Stimmen'],
      ['#vereine', 'Verein finden', 'nav-cta']
    ],
    ctaHref: '#vereine',
    ctaLabel: 'Verein finden'
  }
};

function renderFragment(html) {
  return cheerio.load(html, { decodeEntities: false }, false);
}

function renderHeader(template, config) {
  const $ = renderFragment(template);
  const nav = $('[data-shell-slot="navigation"]');
  nav.empty();

  for (const [href, label, className] of config.nav) {
    const link = $('<a></a>').attr('href', href).text(label);
    if (className) link.addClass(className);
    nav.append(link);
  }

  const cta = $('[data-shell-slot="cta"]');
  cta.attr('href', config.ctaHref).text(config.ctaLabel);
  if (config.compactLabel) cta.attr('data-compact-label', config.compactLabel);
  else cta.removeAttr('data-compact-label');

  return $.html();
}

export function applySiteShell($, { variant, headerTemplate, footerTemplate }) {
  const config = variants[variant];
  if (!config) throw new Error(`[site-shell] unknown variant: ${variant}`);

  $('body').attr('data-shell-variant', variant);

  let skipLink = $('.skip-link').first();
  if (!skipLink.length) {
    skipLink = $('<a class="skip-link"></a>');
    $('body').prepend(skipLink);
  }
  skipLink.attr('href', config.skipHref).text(config.skipLabel);

  $('.site-header').remove();
  const headerHtml = renderHeader(headerTemplate, config);
  const previewBanner = $('#preview-banner').first();
  if (previewBanner.length) previewBanner.after(headerHtml);
  else skipLink.after(headerHtml);

  $('.site-footer').remove();
  $('body').append(footerTemplate);

  $('link[href="/assets/site-shell.css"]').remove();
  $('head').append('<link rel="stylesheet" href="/assets/site-shell.css">');

  $('script[src="/assets/story-nav.js"], script[src="/assets/site-shell.js"]').remove();
  $('body').append('<script src="/assets/site-shell.js" defer></script>');

  return $;
}

export function shellVariantNames() {
  return Object.keys(variants);
}
