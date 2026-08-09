const PAGE_SIZE = 60;

const searchInput = document.querySelector('#search');
const typeFilter = document.querySelector('#type-filter');
const stateFilter = document.querySelector('#state-filter');
const grid = document.querySelector('#club-grid');
const resultSummary = document.querySelector('#result-summary');
const loadMore = document.querySelector('#load-more');
const dataStatus = document.querySelector('#data-status');
const contactDialog = document.querySelector('#contact-dialog');
const contactForm = document.querySelector('#contact-form');
const contactTarget = document.querySelector('#contact-target');
const contactOrganization = document.querySelector('#contact-organization');
const contactStartedAt = document.querySelector('#contact-started-at');
const contactStatus = document.querySelector('#contact-status');

let organizations = [];
let visibleCount = PAGE_SIZE;

function normalize(value = '') {
  return value
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function labelForType(type) {
  return {
    club: 'Ruderverein',
    member: 'DRV-Mitglied',
    lrv: 'Landesruderverband',
    drv: 'Deutscher Ruderverband'
  }[type] || 'Ruderorganisation';
}

function routeText(level) {
  return {
    club: 'direkt an den Verein',
    lrv: 'über den Landesruderverband',
    drv: 'über den Deutschen Ruderverband'
  }[level] || 'über die passende Verbandsstelle';
}

function escaped(value = '') {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

function filteredOrganizations() {
  const q = normalize(searchInput.value);
  const type = typeFilter.value;
  const state = stateFilter.value;
  const tokens = q ? q.split(/\s+/) : [];

  return organizations.filter((org) => {
    if (type !== 'all' && org.type !== type) return false;
    if (state !== 'all' && org.state !== state) return false;
    if (!tokens.length) return true;
    const haystack = normalize([
      org.name,
      org.city,
      org.postalCode,
      org.state,
      org.drvId
    ].filter(Boolean).join(' '));
    return tokens.every((token) => haystack.includes(token));
  });
}

function clubCard(org) {
  const location = [org.postalCode, org.city].filter(Boolean).join(' ');
  const meta = [location, org.state].filter(Boolean).join(' · ');
  const website = org.website
    ? `<a href="${escaped(org.website)}" target="_blank" rel="noopener noreferrer">Website</a>`
    : '';
  const profile = org.profileUrl
    ? `<a href="${escaped(org.profileUrl)}" target="_blank" rel="noopener noreferrer">DRV-Profil</a>`
    : '';
  const links = [website, profile].filter(Boolean).join('<span aria-hidden="true"> · </span>');

  return `
    <article class="club-card ${org.featured ? 'club-card-featured' : ''}">
      <div class="club-card-topline">
        <span class="club-type">${escaped(labelForType(org.type))}</span>
        ${org.featured ? '<span class="badge badge-small">Ratzeburg</span>' : ''}
      </div>
      <h3>${escaped(org.name)}</h3>
      <p class="club-location">${escaped(meta || 'Standort siehe DRV-Profil')}</p>
      <p class="club-route">Kontakt ${escaped(routeText(org.contactRouteLevel))}</p>
      <div class="club-card-actions">
        <button class="button button-primary button-small" type="button" data-contact="${escaped(org.id)}">Kontakt</button>
        ${links ? `<span class="text-links">${links}</span>` : ''}
      </div>
    </article>`;
}

function render() {
  const results = filteredOrganizations();
  const shown = results.slice(0, visibleCount);
  grid.innerHTML = shown.map(clubCard).join('');
  resultSummary.textContent = `${results.length.toLocaleString('de-DE')} Einträge gefunden${shown.length < results.length ? ` · ${shown.length.toLocaleString('de-DE')} angezeigt` : ''}.`;
  loadMore.hidden = shown.length >= results.length;
}

function populateStates() {
  const states = [...new Set(organizations.map((org) => org.state).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'de'));
  for (const state of states) {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateFilter.append(option);
  }
}

function openContact(id) {
  const org = organizations.find((item) => item.id === id);
  if (!org || !contactDialog) return;
  contactTarget.textContent = org.name;
  contactOrganization.value = org.id;
  contactStartedAt.value = String(Date.now());
  contactStatus.textContent = `Deine Nachricht wird ${routeText(org.contactRouteLevel)} weitergeleitet.`;
  contactForm.reset();
  contactOrganization.value = org.id;
  contactStartedAt.value = String(Date.now());
  contactDialog.showModal();
  contactForm.querySelector('[name="name"]').focus();
}

async function submitContact(event) {
  event.preventDefault();
  const button = contactForm.querySelector('button[type="submit"]');
  button.disabled = true;
  contactStatus.textContent = 'Anfrage wird gesendet …';

  const payload = Object.fromEntries(new FormData(contactForm).entries());
  payload.consent = contactForm.elements.consent.checked ? '1' : '0';

  try {
    const response = await fetch('/api/contact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Die Anfrage konnte nicht gesendet werden.');
    contactStatus.textContent = 'Danke. Deine Anfrage wurde versendet.';
    contactForm.reset();
  } catch (error) {
    contactStatus.textContent = error.message || 'Die Anfrage konnte nicht gesendet werden.';
  } finally {
    button.disabled = false;
  }
}

async function init() {
  try {
    const response = await fetch('/data/clubs.json', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    organizations = Array.isArray(data.organizations) ? data.organizations : [];
    populateStates();
    render();
    const sourceDate = data.generatedAt ? new Date(data.generatedAt) : null;
    const dateText = sourceDate && !Number.isNaN(sourceDate.valueOf())
      ? sourceDate.toLocaleDateString('de-DE')
      : 'unbekannt';
    dataStatus.textContent = `${organizations.length.toLocaleString('de-DE')} Einträge · Stand ${dateText}`;
  } catch (error) {
    dataStatus.textContent = 'Vereinsdaten konnten nicht geladen werden.';
    resultSummary.textContent = 'Bitte nutze vorübergehend die Vereinssuche auf rudern.de.';
    console.error(error);
  }
}

for (const control of [searchInput, typeFilter, stateFilter]) {
  control?.addEventListener(control === searchInput ? 'input' : 'change', () => {
    visibleCount = PAGE_SIZE;
    render();
  });
}

loadMore?.addEventListener('click', () => {
  visibleCount += PAGE_SIZE;
  render();
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-contact]');
  if (button) openContact(button.dataset.contact);
});

contactForm?.addEventListener('submit', submitContact);

contactDialog?.addEventListener('click', (event) => {
  if (event.target === contactDialog) contactDialog.close();
});

init();
