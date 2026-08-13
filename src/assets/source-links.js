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

  const worldRowing = moveAfter('.external-resource-world-rowing', '#regatta .regatta-layout');
  if (worldRowing) {
    worldRowing.setAttribute('aria-label', 'World Rowing als heutiger internationaler Bezug');
    const kicker = worldRowing.querySelector('.source-link-card-kicker');
    const copy = worldRowing.querySelector('.source-link-card-copy > p:last-child');
    if (kicker) kicker.textContent = 'Heute · Internationaler Rudersport';
    if (copy) copy.textContent = 'Was zu Adams Zeit auf internationalen Regatten weiterentwickelt wurde, wird heute unter dem Dach von World Rowing weltweit organisiert und fortgeführt.';
  }

  const sportEurope = document.querySelector('#regatta .regatta-source');
  if (sportEurope) {
    sportEurope.className = 'regatta-source regatta-stream';
    sportEurope.innerHTML = '<a class="regatta-stream-link" href="https://sporteurope.tv/deutscherruderverband/67-internationale-ratzebuger-ruderregatta-sonntag" target="_blank" rel="noopener noreferrer"><span class="regatta-stream-logo"><img src="/assets/images/sportdeutschland-tv.png" alt="Sporteurope.TV" loading="lazy" decoding="async"></span><span class="regatta-stream-copy"><span class="regatta-stream-kicker">67. Internationale Ratzeburger Ruderregatta</span><strong>Regatta-Sonntag im Re-Live auf Sporteurope.TV ↗</strong></span></a>';
  }

  const drv = moveBefore('#vereine .source-link-card-drv', '#ruderakademie .academy-network');
  if (drv) {
    drv.setAttribute('aria-label', 'Deutscher Ruderverband als heutiger institutioneller Bezug');
    const kicker = drv.querySelector('.source-link-card-kicker');
    const copy = drv.querySelector('.source-link-card-copy > p:last-child');
    const link = drv.querySelector('.button');
    if (kicker) kicker.textContent = 'Heute · Deutscher Rudersport';
    if (copy) copy.textContent = 'Adams Trainingsideen wirkten weit über Ratzeburg hinaus. Der Deutsche Ruderverband verbindet den Standort heute mit dem organisierten Leistungs- und Vereinssport in Deutschland.';
    if (link) {
      link.href = 'https://www.rudern.de/';
      link.textContent = 'Zum Deutschen Ruderverband ↗';
    }
  }

  const podcast = moveBefore('#stimmen .podcast-feature', '#foerderung .section-heading');
  if (podcast) {
    podcast.setAttribute('aria-label', 'Schubschlag – vom Wasser aus erzählt');
    const logo = podcast.querySelector('.source-link-card-logo img');
    const kicker = podcast.querySelector('.source-link-card-kicker');
    const title = podcast.querySelector('h3');
    const copy = podcast.querySelector('.source-link-card-copy > p:last-child');
    if (logo) {
      logo.src = '/assets/images/schubschlag-mark.png';
      logo.alt = 'Schubschlag';
      logo.removeAttribute('onerror');
    }
    if (kicker) kicker.textContent = 'Die Geschichten gehen weiter';
    if (title) title.textContent = 'Schubschlag – vom Wasser aus erzählt';
    if (copy) copy.textContent = 'Rudern besteht nicht nur aus Zeiten, Technik und Medaillen. Der Podcast erzählt von Menschen, Freundschaften und Erinnerungen über Generationen hinweg – bevor vielleicht die eigene Geschichte auf dem Wasser beginnt.';
  }
});
