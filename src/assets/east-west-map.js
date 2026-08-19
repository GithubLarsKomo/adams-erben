(() => {
  const map = document.querySelector('[data-rowing-map]');
  if (!map) return;

  const stateTargets = Array.from(document.querySelectorAll('[data-map-state]'));
  const interactive = {
    west: map.querySelector('#route-west'),
    east: map.querySelector('#route-east'),
    border: map.querySelector('#border-zone'),
    lg: map.querySelector('#marker-lg-bootshaus'),
    rar: map.querySelector('#marker-rar'),
    rrc: map.querySelector('#marker-rrc')
  };

  const activate = (state) => {
    if (!state) return;
    map.dataset.activeState = state;
  };

  const labels = {
    west: 'Trainingsroute Westufer',
    east: 'Trainingsroute Ostufer',
    border: 'Historischer DDR-Grenzraum',
    lg: 'Historisches LG-Bootshaus',
    rar: 'Ruderakademie Ratzeburg',
    rrc: 'Ratzeburger Ruderclub'
  };

  Object.entries(interactive).forEach(([state, element]) => {
    if (!element) return;
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', labels[state]);
    element.addEventListener('mouseenter', () => activate(state));
    element.addEventListener('focus', () => activate(state));
    element.addEventListener('click', () => activate(state));
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(state);
      }
    });
  });

  if ('IntersectionObserver' in window && stateTargets.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
      const target = visible[0]?.target;
      if (target?.dataset.mapState) activate(target.dataset.mapState);
    }, {
      rootMargin: '-32% 0px -52% 0px',
      threshold: 0
    });

    stateTargets.forEach((target) => observer.observe(target));
  }
})();
