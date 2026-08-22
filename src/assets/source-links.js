document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img[src="/assets/images/schubschlag.png"]').forEach((image) => {
    image.src = '/assets/images/schubschlag.png';
  });

  if (!document.querySelector('#world-best-time-styles')) {
    const style = document.createElement('style');
    style.id = 'world-best-time-styles';
    style.textContent = `
      .race-strip-with-record{overflow:hidden}
      .race-record{margin-top:clamp(1.8rem,3.5vw,2.6rem);padding-top:clamp(1.5rem,3vw,2.1rem);border-top:1px solid rgba(255,255,255,.18)}
      .race-record-question{margin:0 0 .55rem;color:#9bdced;font-size:.72rem;font-weight:900;letter-spacing:.11em;text-transform:uppercase}
      .race-record-heading{display:flex;align-items:baseline;gap:.85rem;flex-wrap:wrap;margin-bottom:.9rem}
      .race-record-time{font-family:Georgia,"Times New Roman",serif;font-size:clamp(2.6rem,6vw,5.2rem);line-height:.92;letter-spacing:-.055em;color:var(--white)}
      .race-record-place{color:#f9ad66;font-size:.76rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
      .race-record-copy{max-width:860px;margin:0;color:#d7e7ed!important;font-size:clamp(.95rem,1.35vw,1.05rem);line-height:1.65}
      .race-record-copy strong{color:var(--white)}
      .race-record-source{display:flex;align-items:center;justify-content:space-between;gap:1.25rem;width:100%;margin-top:1.25rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.12);color:#dcebf0;text-decoration:none;font-size:.82rem;font-weight:800;transition:color .15s ease,border-color .15s ease}
      .race-record-source:hover{color:var(--white);border-top-color:rgba(155,220,237,.45)}
      .race-record-source:focus-visible{outline:3px solid rgba(155,220,237,.38);outline-offset:5px}
      .race-record-source img{display:block;width:auto;max-width:118px;max-height:36px;object-fit:contain;filter:brightness(0) invert(1)}
      .race-record-source span{margin-left:auto;text-align:right}
      @media(max-width:640px){.race-record-heading{display:block}.race-record-place{display:block;margin-top:.45rem}.race-record-source{align-items:flex-start}.race-record-source img{max-width:96px}.race-record-source span{max-width:55%}}
    `;
    document.head.append(style);
  }

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
    if (copyText) copyText.textContent = 'Karl Adams Erfolge gehören zur Geschichte des internationalen Rudersports. Wie sich dieser Sport heute weltweit präsentiert, zeigt World Rowing als internationaler Ruderverband.';
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
      <a class="deutschlandachter-link" href="https://deutschlandachter.de/" target="_blank" rel="noopener noreferrer" aria-label="Zu den heutigen Erben des Deutschland-Achters" style="margin-top:1rem;display:inline-flex;align-items:center;gap:.85rem;max-width:100%;padding:.65rem .85rem;border:1px solid rgba(11,35,54,.12);border-radius:14px;background:var(--foam);color:var(--navy);text-decoration:none">
        <span class="deutschlandachter-logo" style="display:flex;align-items:center;justify-content:center;flex:0 0 96px;width:96px;height:48px;overflow:hidden;background:#fff;border-radius:8px"><img src="/assets/images/deutschlandachter.webp" alt="Deutschland-Achter" loading="lazy" decoding="async" style="display:block;width:auto!important;height:auto!important;max-width:88px!important;max-height:42px!important;object-fit:contain!important"></span>
        <span class="deutschlandachter-copy" style="display:grid;gap:.1rem;min-width:0"><small style="color:var(--muted);font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase">Der Deutschland-Achter heute</small><strong style="font-size:.9rem;line-height:1.25">Zu den heutigen Erben des Deutschland-Achters ↗</strong></span>
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
