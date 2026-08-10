const PAGE_SIZE = 60;
const APP_MODE = document.querySelector('meta[name="adams-erben-mode"]')?.content || 'production';
const PREVIEW_MODE = APP_MODE === 'preview';

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
const previewBanner = document.querySelector('#preview-banner');
const previewContactNote = document.querySelector('#preview-contact-note');
const dataOriginHeading = document.querySelector('#data-origin-heading');
const dataOriginCopy = document.querySelector('#data-origin-copy');

let organizations = [];
let visibleCount = PAGE_SIZE;

if (PREVIEW_MODE) {
  previewBanner.hidden = false;
  previewContactNote.hidden = false;
  document.body.classList.add('is-preview');
} else {
  if (dataOriginHeading) dataOriginHeading.textContent = 'Öffentliche Vereinsdaten';
  if (dataOriginCopy) dataOriginCopy.textContent = 'Die Suchdaten stammen aus der freigegebenen Datenquelle des Deutschen Ruderverbands. E-Mail-Adressen werden nicht als offene Sammelliste an den Browser ausgeliefert.';
}

function normalize(value = '') {
  return value.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, ' ').trim();
}

function labelForType(type) {
  return { club: 'Ruderverein', member: 'DRV-Mitglied', lrv: 'Landesruderverband', drv: 'Deutscher Ruderverband' }[type] || 'Ruderorganisation';
}

function routeText(level) {
  return { club: 'direkt an den Verein', lrv: 'über den Landesruderverband', drv: 'über den Deutschen Ruderverband' }[level] || 'über die passende Verbandsstelle';
}

function escaped(value = '') {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

function safeExternalUrl(value = '') {
  if (!value) return '';
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function organizationStates(org) {
  const values = Array.isArray(org.states) && org.states.length ? org.states : [org.state];
  return [...new Set(values.filter(Boolean))];
}

function filteredOrganizations() {
  const q = normalize(searchInput.value);
  const type = typeFilter.value;
  const state = stateFilter.value;
  const tokens = q ? q.split(/\s+/) : [];
  return organizations.filter((org) => {
    if (type !== 'all' && org.type !== type) return false;
    if (state !== 'all' && !organizationStates(org).includes(state)) return false;
    if (!tokens.length) return true;
    const haystack = normalize([org.name, org.city, org.postalCode, ...organizationStates(org), org.drvId].filter(Boolean).join(' '));
    return tokens.every((token) => haystack.includes(token));
  });
}

function clubCard(org) {
  const location = [org.postalCode, org.city].filter(Boolean).join(' ');
  const meta = [location, org.state].filter(Boolean).join(' · ');
  const websiteUrl = safeExternalUrl(org.website);
  const profileUrl = safeExternalUrl(org.profileUrl);
  const website = websiteUrl ? `<a href="${escaped(websiteUrl)}" target="_blank" rel="noopener noreferrer">Website</a>` : '';
  const profile = profileUrl ? `<a href="${escaped(profileUrl)}" target="_blank" rel="noopener noreferrer">DRV-Profil</a>` : '';
  const links = [website, profile].filter(Boolean).join('<span aria-hidden="true"> · </span>');
  const contactLabel = PREVIEW_MODE ? 'Kontakt (Demo)' : 'Kontakt';
  const badge = org.featured ? '<span class="badge badge-small">Ratzeburg</span>' : (org.demo ? '<span class="badge badge-small">Demo</span>' : '');

  return `
    <article class="club-card ${org.featured ? 'club-card-featured' : ''}">
      <div class="club-card-topline"><span class="club-type">${escaped(labelForType(org.type))}</span>${badge}</div>
      <h3>${escaped(org.name)}</h3>
      <p class="club-location">${escaped(meta || 'Standort siehe DRV-Profil')}</p>
      <p class="club-route">Kontakt ${escaped(routeText(org.contactRouteLevel))}</p>
      <div class="club-card-actions">
        <button class="button button-primary button-small" type="button" data-contact="${escaped(org.id)}">${contactLabel}</button>
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
  const states = [...new Set(organizations.flatMap(organizationStates))].sort((a, b) => a.localeCompare(b, 'de'));
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
  contactForm.reset();
  contactOrganization.value = org.id;
  contactStartedAt.value = String(Date.now());
  contactStatus.textContent = PREVIEW_MODE
    ? `Demo: Die Nachricht würde ${routeText(org.contactRouteLevel)} weitergeleitet. Es werden keine Daten übertragen.`
    : `Deine Nachricht wird ${routeText(org.contactRouteLevel)} weitergeleitet.`;

  const submitButton = contactForm.querySelector('button[type="submit"]');
  submitButton.disabled = false;
  submitButton.textContent = PREVIEW_MODE ? 'Demo-Anfrage absenden' : 'Anfrage senden';
  contactDialog.showModal();
  contactForm.querySelector('[name="name"]').focus();
}

async function submitContact(event) {
  event.preventDefault();
  const button = contactForm.querySelector('button[type="submit"]');

  if (PREVIEW_MODE) {
    const org = organizations.find((item) => item.id === contactOrganization.value);
    const route = routeText(org?.contactRouteLevel);
    contactStatus.textContent = `Demo erfolgreich: Diese Anfrage würde ${route} weitergeleitet. Es wurden keine Daten an den Server übertragen.`;
    button.textContent = 'Demo angezeigt';
    return;
  }

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
    const dateText = sourceDate && !Number.isNaN(sourceDate.valueOf()) ? sourceDate.toLocaleDateString('de-DE') : 'unbekannt';
    dataStatus.textContent = PREVIEW_MODE
      ? `${organizations.length.toLocaleString('de-DE')} Demo-Einträge · keine vollständigen DRV-Daten`
      : `${organizations.length.toLocaleString('de-DE')} Einträge · Stand ${dateText}`;
  } catch (error) {
    dataStatus.textContent = 'Vereinsdaten konnten nicht geladen werden.';
    resultSummary.textContent = 'Bitte nutze vorübergehend die Vereinssuche auf rudern.de.';
    console.error(error);
  }
}

for (const control of [searchInput, typeFilter, stateFilter]) {
  control?.addEventListener(control === searchInput ? 'input' : 'change', () => { visibleCount = PAGE_SIZE; render(); });
}
loadMore?.addEventListener('click', () => { visibleCount += PAGE_SIZE; render(); });
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-contact]');
  if (button) openContact(button.dataset.contact);
});
contactForm?.addEventListener('submit', submitContact);
contactDialog?.addEventListener('click', (event) => { if (event.target === contactDialog) contactDialog.close(); });
init();
