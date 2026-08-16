(() => {
  const header = document.querySelector('.site-header[data-site-shell="header"]');
  const toggle = header?.querySelector('.menu-toggle');
  const nav = header?.querySelector('#primary-navigation');
  if (!header || !toggle || !nav) return;

  const closeMenu = () => {
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menü öffnen');
  };

  const openMenu = () => {
    header.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Menü schließen');
  };

  toggle.addEventListener('click', () => {
    if (header.classList.contains('nav-open')) closeMenu();
    else openMenu();
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!header.classList.contains('nav-open')) return;
    if (!header.contains(event.target)) closeMenu();
  });

  const desktopQuery = window.matchMedia('(min-width: 921px)');
  const syncViewport = () => {
    if (desktopQuery.matches) closeMenu();
  };

  if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', syncViewport);
  else desktopQuery.addListener(syncViewport);
})();
