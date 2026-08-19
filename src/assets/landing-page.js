(() => {
  const form = document.getElementById('quick-find-form');
  const quickInput = document.getElementById('quick-location');
  const fullInput = document.getElementById('search');
  const nearbyButton = document.getElementById('find-nearby');
  const radius = document.getElementById('radius-filter');
  const useLocation = document.getElementById('use-location');
  const directory = document.getElementById('vereine');
  const openDirectory = document.getElementById('open-full-directory');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  const revealDirectory = () => {
    if (directory) directory.hidden = false;
  };

  const showDirectory = () => {
    revealDirectory();
    directory?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = quickInput?.value.trim() || '';
    if (!value) {
      quickInput?.focus();
      return;
    }
    revealDirectory();
    if (fullInput) {
      fullInput.value = value;
      fullInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (radius) radius.value = '50';
    nearbyButton?.click();
    directory?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  });

  document.getElementById('quick-use-location')?.addEventListener('click', () => {
    revealDirectory();
    useLocation?.click();
    directory?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  });

  openDirectory?.addEventListener('click', () => {
    showDirectory();
    window.setTimeout(() => fullInput?.focus({ preventScroll: true }), reduceMotion ? 0 : 250);
  });

  if (window.location.hash === '#vereine') revealDirectory();
})();
