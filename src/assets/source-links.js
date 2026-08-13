document.addEventListener('DOMContentLoaded', () => {
  const moveAfter = (cardSelector, targetSelector) => {
    const card = document.querySelector(cardSelector);
    const target = document.querySelector(targetSelector);
    if (!card || !target) return null;
    target.insertAdjacentElement('afterend', card);
    return card;
  };

  const moveBefore = (cardSelector, targetSelector) => {
    const card = document.querySelector(cardSelector);
    const target = document.querySelector(targetSelector);
    if (!card || !target || !target.parentElement) return null;
    target.parentElement.insertBefore(card, target);
    return card;
  };

  const regatta = document.querySelector('#regatta');
  const layout = regatta?.querySelector('.regatta-layout');
  const copy = layout?.querySelector('.regatta-copy');
  const media = layout?.querySelector('.regatta-media');

  if (regatta && layout && copy && media && !regatta.querySelector('.regatta-heading')) {
    const eyebrow = copy.querySelector('.eyebrow');
    const title = copy.querySelector('h2');
    const lead = copy.querySelector('.regatta-lead');
    const timeline = copy.querySelector('.regatta-timeline');
    const actions = copy.querySelector('.regatta-actions');
    const stream = copy.querySelector('.regatta-source');
    const note = copy.querySelector('.regatta-note');

    const heading = document.createElement('div');
    heading.className = 'section-heading regatta-heading';
    if (eyebrow) heading.append(eyebrow);
    if (title) heading.append(title);
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Aus einer Ratzeburger Regatta wurde eine internationale Tradition – und der Küchensee blieb bis heute ein Ort, an dem sich Vereinsleben und internationaler Rudersport begegnen.';
    heading.append(subtitle);
    regatta.insertBefore(heading, layout);

    const kicker = document.createElement('p');
    kicker.className = 'card-kicker';
    kicker.textContent = 'Internationale Ratzeburger Ruderregatta';
    const cardTitle = document.createElement('h3');
    cardTitle.textContent = 'Vom Küchensee in die Ruderwelt.';
    copy.insertBefore(cardTitle, lead || copy.firstChild);
    copy.insertBefore(kicker, cardTitle);

    layout.className = 'regatta-card';
    const intro = document.createElement('div');
    intro.className = 'regatta-card-intro';
    intro.append(copy, media);
    layout.append(intro);

    if (timeline) layout.append(timeline);
    const footer = document.createElement('div');
    footer.className = 'regatta-footer-grid';
    const footerMain = document.createElement('div');
    footerMain.className = 'regatta-footer-main';
    if (actions) footerMain.append(actions);
    if (stream) footerMain.append(stream);
    footer.append(footerMain);
    if (note) footer.append(note);
    layout.append(footer);
  }

  const worldRowing = moveAfter('.external-resource-world-rowing', '#regatta .regatta-card');
  if (worldRowing) {
    worldRowing.setAttribute('aria-label', 'World Rowing als heutiger internationaler Bezug');
    const kicker = worldRowing.querySelector('.source-link-card-kicker');
    const copyText = worldRowing.querySelector('.source-link-card-copy > p:last-child');
    if (kicker) kicker.textContent = 'Heute · Internationaler Rudersport';
    if (copyText) copyText.textContent = 'Was zu Adams Zeit auf internationalen Regatten weiterentwickelt wurde, wird heute unter dem Dach von World Rowing weltweit organisiert und fortgeführt.';
  }

  const drv = moveBefore('#vereine .source-link-card-drv', '#ruderakademie .academy-network');
  if (drv) {
    drv.setAttribute('aria-label', 'Deutscher Ruderverband als heutiger institutioneller Bezug');
    const kicker = drv.querySelector('.source-link-card-kicker');
    const copyText = drv.querySelector('.source-link-card-copy > p:last-child');
    const link = drv.querySelector('.button');
    if (kicker) kicker.textContent = 'Heute · Deutscher Rudersport';
    if (copyText) copyText.textContent = 'Adams Trainingsideen wirkten weit über Ratzeburg hinaus. Der Deutsche Ruderverband verbindet den Standort heute mit dem organisierten Leistungs- und Vereinssport in Deutschland.';
    if (link) {
      link.href = 'https://www.rudern.de/';
      link.textContent = 'Zum Deutschen Ruderverband ↗';
    }
  }

  const biographyActions = document.querySelector('#geschichte .book-card > .inline-actions');
  if (biographyActions && !document.querySelector('#geschichte .deutschlandachter-link')) {
    biographyActions.insertAdjacentHTML('afterend', `
      <a class="deutschlandachter-link" href="https://deutschlandachter.de/" target="_blank" rel="noopener noreferrer" aria-label="Zu den heutigen Erben des Deutschland-Achters">
        <span class="deutschlandachter-logo"><img src="/assets/images/deutschlandachter.png" alt="Deutschland-Achter" loading="lazy" decoding="async"></span>
        <span class="deutschlandachter-copy"><small>Der Deutschland-Achter heute</small><strong>Zu den heutigen Erben des Deutschland-Achters ↗</strong></span>
      </a>`);
  }

  const podcast = moveBefore('#stimmen .podcast-feature', '#foerderung .section-heading');
  if (podcast) {
    podcast.setAttribute('aria-label', 'Schubschlag – vom Wasser aus erzählt');
    podcast.style.marginBottom = 'clamp(3.5rem, 6vw, 5.5rem)';
    const logo = podcast.querySelector('.source-link-card-logo img');
    const kicker = podcast.querySelector('.source-link-card-kicker');
    const title = podcast.querySelector('h3');
    const copyText = podcast.querySelector('.source-link-card-copy > p:last-child');
    if (logo) {
      logo.src = '/assets/images/schubschlag.png';
      logo.alt = 'Schubschlag';
      logo.removeAttribute('onerror');
      logo.style.maxWidth = '150px';
    }
    if (kicker) kicker.textContent = 'Die Geschichten gehen weiter';
    if (title) title.textContent = 'Schubschlag – vom Wasser aus erzählt';
    if (copyText) copyText.textContent = 'Rudern besteht nicht nur aus Zeiten, Technik und Medaillen. Der Podcast erzählt von Menschen, Freundschaften und Erinnerungen über Generationen hinweg – bevor vielleicht die eigene Geschichte auf dem Wasser beginnt.';
  }
});
