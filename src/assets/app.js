import { buildPostalIndex, nearestClubs, resolveLocalLocation } from './nearest.js';

const PAGE_SIZE = 60;
const NEAREST_LIMIT = 5;
const APP_MODE = document.querySelector('meta[name="adams-erben-mode"]')?.content || 'production';
const PREVIEW_MODE = APP_MODE === 'preview';

const searchInput = document.querySelector('#search');
const typeFilter = document.querySelector('#type-filter');
const stateFilter = document.querySelector('#state-filter');
const radiusFilter = document.querySelector('#radius-filter');
const findNearbyButton = document.querySelector('#find-nearby');
const useLocationButton = document.querySelector('#use-location');
const nearbyStatus = document.querySelector('#nearby-status');
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
let postalIndex = buildPostalIndex([]);
let visibleCount = PAGE_SIZE;
let nearbyOrigin = null;

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

function hasDirectContact(org) {
  return org?.hasDirectContact === true && ['club', 'lrv', 'drv'].includes(org?.contactRouteLevel);
}

function addressText(org) {
  const locality = [org.postalCode, org.city].filter(Boolean).join(' ');
  return [org.streetAddress, locality].filter(Boolean).join(', ');
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
    const haystack = normalize([org.name, org.city, org.postalCode, org.streetAddress, ...organizationStates(org), org.drvId].filter(Boolean).join(' '));
    return tokens.every((token) => haystack.includes(token));
  });
}

function clubCard(org) {
  const location = [org.postalCode, org.city].filter(Boolean).join(' ');
  const meta = [location, org.state].filter(Boolean).join(' · ');
  const websiteUrl = safeExternalUrl(org.website);
  const profileUrl = safeExternalUrl(org.profileUrl);
  const direct = hasDirectContact(org);
  const websiteLink = websiteUrl ? `<a href="${escaped(websiteUrl)}" target="_blank" rel="noopener noreferrer">Website</a>` : '';
  const profileLink = profileUrl ? `<a href="${escaped(profileUrl)}" target="_blank" rel="noopener noreferrer">DRV-Profil</a>` : '';
  const badge = org.featured ? '<span class="badge badge-small">Ratzeburg</span>' : (org.demo ? '<span class="badge badge-small">Demo</span>' : '');
  const distance = Number.isFinite(org.distanceKm) ? `<span class="club-distance">ca. ${escaped(org.distanceKm.toLocaleString('de-DE', { maximumFractionDigits: org.distanceKm < 10 ? 1 : 0 }))} km Luftlinie</span>` : '';
  const address = addressText(org);

  let contactHint = '';
  let actions = '';
  if (direct) {
    const contactLabel = PREVIEW_MODE ? 'Kontakt (Demo)' : 'Verein kontaktieren';
    contactHint = '<p class="club-route">Direkter Kontakt zum ausgewählten Verein bzw. zur ausgewählten Organisation</p>';
    const links = [websiteLink, profileLink].filter(Boolean).join('<span aria-hidden="true"> · </span>');
    actions = `<button class="button button-primary button-small" type="button" data-contact="${escaped(org.id)}">${contactLabel}</button>${links ? `<span class="text-links">${links}</span>` : ''}`;
  } else if (websiteUrl) {
    contactHint = '<p class="club-route club-route-neutral">Keine öffentliche Vereins-E-Mail hinterlegt – bitte nutze die Vereinswebsite.</p>';
    actions = `<a class="button button-secondary button-small" href="${escaped(websiteUrl)}" target="_blank" rel="noopener noreferrer">Zur Vereinswebsite</a>${profileLink ? `<span class="text-links">${profileLink}</span>` : ''}`;
  } else if (address) {
    contactHint = '<p class="club-route club-route-neutral">Keine öffentliche Vereins-E-Mail oder Vereinswebsite hinterlegt.</p>';
    actions = `<span class="club-address-fallback"><strong>${org.streetAddress ? 'Anschrift' : 'Standort'}:</strong> ${escaped(address)}</span>`;
  } else {
    contactHint = '<p class="club-route club-route-neutral">Für diesen Eintrag liegen derzeit keine direkten Kontaktdaten vor.</p>';
  }

  return `
    <article class="club-card ${org.featured ? 'club-card-featured' : ''}">
      <div class="club-card-topline"><span class="club-type">${escaped(labelForType(org.type))}</span>${badge}</div>
      <h3>${escaped(org.name)}</h3>
      <p class="club-location">${escaped(meta || 'Standort nicht hinterlegt')}</p>
      ${distance}
      ${contactHint}
      <div class="club-card-actions">${actions}</div>
    </article>`;
}

function radiusKm() {
  const value = radiusFilter?.value || '50';
  return value === 'all' ? Infinity : Number(value);
}

function nearbyResults() {
  if (!nearbyOrigin) return null;
  const radius = radiusKm();
  const inRadius = nearestClubs(organizations, nearbyOrigin, postalIndex, { radiusKm: radius, limit: NEAREST_LIMIT });
  if (inRadius.length) return { clubs: inRadius, fallback: false, radius };
  return {
    clubs: nearestClubs(organizations, nearbyOrigin, postalIndex, { radiusKm: Infinity, limit: 3 }),
    fallback: true,
    radius
  };
}

function render() {
  const nearby = nearbyResults();
  if (nearby) {
    grid.innerHTML = nearby.clubs.map(clubCard).join('');
    loadMore.hidden = true;
    const radiusLabel = Number.isFinite(nearby.radius) ? `${nearby.radius} km` : 'beliebiger Entfernung';
    resultSummary.textContent = nearby.fallback
      ? `Im Umkreis von ${radiusLabel} wurde kein Ruderverein gefunden. Gezeigt werden die ${nearby.clubs.length} nächstgelegenen Vereine zu ${nearbyOrigin.label || 'deinem Standort'}.`
      : `${nearby.clubs.length} nächstgelegene Rudervereine zu ${nearbyOrigin.label || 'deinem Standort'}${Number.isFinite(nearby.radius) ? ` im Umkreis von ${radiusLabel}` : ''}.`;
    return;
  }

  const results = filteredOrganizations();
  const shown = results.slice(0, visibleCount);
  grid.innerHTML = shown.map(clubCard).join('');
  resultSummary.textContent = `${results.length.toLocaleString('de-DE')} Einträge gefunden${shown.length < results.length ? ` · ${shown.length.toLocaleString('de-DE')} angezeigt` : ''}.`;
  loadMore.hidden = shown.length >= results.length;
}

function clearNearbyMode() {
  nearbyOrigin = null;
  if (nearbyStatus) nearbyStatus.textContent = '';
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

function findNearbyFromSearch() {
  const origin = resolveLocalLocation(searchInput?.value || '', postalIndex);
  if (!origin) {
    nearbyOrigin = null;
    if (nearbyStatus) nearbyStatus.textContent = 'Ort oder PLZ nicht eindeutig im lokalen Ortsverzeichnis gefunden. Bitte eine fünfstellige PLZ oder einen vollständigen Ortsnamen eingeben.';
    render();
    return;
  }
  nearbyOrigin = origin;
  if (typeFilter) typeFilter.value = 'club';
  if (stateFilter) stateFilter.value = 'all';
  if (nearbyStatus) nearbyStatus.textContent = `Nähe-Suche ab ${origin.label}. Die Berechnung erfolgt vollständig im Browser.`;
  render();
}

function useBrowserLocation() {
  if (!navigator.geolocation) {
    if (nearbyStatus) nearbyStatus.textContent = 'Dein Browser unterstützt keine Standortfreigabe. Nutze stattdessen Ort oder PLZ.';
    return;
  }
  if (nearbyStatus) nearbyStatus.textContent = 'Standortfreigabe wird angefragt …';
  navigator.geolocation.getCurrentPosition(
    (position) => {
      nearbyOrigin = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        label: 'deinem aktuellen Standort'
      };
      if (typeFilter) typeFilter.value = 'club';
      if (stateFilter) stateFilter.value = 'all';
      if (nearbyStatus) nearbyStatus.textContent = 'Standort übernommen. Die Koordinaten werden nur lokal im Browser für die Entfernungsberechnung verwendet.';
      render();
    },
    () => {
      if (nearbyStatus) nearbyStatus.textContent = 'Standort konnte nicht verwendet werden. Nutze stattdessen Ort oder PLZ.';
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
  );
}

function openContact(id) {
  const org = organizations.find((item) => item.id === id);
  if (!org || !contactDialog || !hasDirectContact(org)) return;
  contactTarget.textContent = org.name;
  contactForm.reset();
  contactOrganization.value = org.id;
  contactStartedAt.value = String(Date.now());
  contactStatus.textContent = PREVIEW_MODE
    ? 'Demo: Die Nachricht würde ausschließlich direkt an die ausgewählte Organisation gehen. Es werden keine Daten übertragen.'
    : 'Deine Nachricht wird ausschließlich direkt an die ausgewählte Organisation gesendet.';

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
    contactStatus.textContent = 'Demo erfolgreich: Es würde ausschließlich der direkte Kontakt der ausgewählten Organisation verwendet. Es wurden keine Daten an den Server übertragen.';
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

function ensureImageSlotStyles() {
  if (document.querySelector('link[data-image-slot-styles]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/assets/image-slots.css';
  link.dataset.imageSlotStyles = 'true';
  document.head.append(link);
}

function imageExists(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

function singleImageFigure({ src, alt, caption, variant = 'photo' }) {
  const figure = document.createElement('figure');
  figure.className = `asset-media asset-media-${variant}`;
  const image = document.createElement('img');
  image.src = src;
  image.alt = alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  figure.append(image);
  if (caption) {
    const figcaption = document.createElement('figcaption');
    figcaption.textContent = caption;
    figure.append(figcaption);
  }
  return figure;
}

async function replaceSinglePlaceholder(selector, config) {
  const placeholder = document.querySelector(selector);
  if (!placeholder || !(await imageExists(config.src))) return;
  placeholder.replaceWith(singleImageFigure(config));
}

async function replaceThenNowPlaceholder() {
  const placeholder = document.querySelector('.asset-placeholder-wide');
  if (!placeholder) return;
  const items = [
    { src: '/assets/images/ratzeburg-historisch.jpg', alt: 'Historisches Motiv der Ratzeburger Rudergeschichte', caption: 'Damals · historisches Motiv' },
    { src: '/assets/images/ratzeburg-heute.jpg', alt: 'Ratzeburg und der Rudersport heute', caption: 'Heute · aktuelles Motiv' }
  ];
  const availability = await Promise.all(items.map((item) => imageExists(item.src)));
  const available = items.filter((_, index) => availability[index]);
  if (!available.length) return;
  if (available.length === 1) {
    placeholder.replaceWith(singleImageFigure({ ...available[0], variant: 'photo' }));
    return;
  }
  const container = document.createElement('div');
  container.className = 'then-now-media';
  for (const item of available) container.append(singleImageFigure({ ...item, variant: 'photo' }));
  placeholder.replaceWith(container);
}

async function hydrateImageSlots() {
  ensureImageSlotStyles();
  await Promise.all([
    replaceSinglePlaceholder('.asset-placeholder-logo', { src: '/assets/images/rrc-vintage-logo.png', alt: 'Logo des Ratzeburger Ruderclubs', caption: '', variant: 'logo' }),
    replaceSinglePlaceholder('.asset-placeholder-photo', { src: '/assets/images/rrc-heute.jpg', alt: 'Ratzeburger Ruderclub heute', caption: 'Ratzeburger Ruderclub heute', variant: 'photo' }),
    replaceThenNowPlaceholder()
  ]);
}

async function loadPostalIndex() {
  try {
    const response = await fetch('/data/postal-locations.json', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    postalIndex = buildPostalIndex(Array.isArray(data.locations) ? data.locations : []);
  } catch (error) {
    console.warn('Lokaler Ortsindex konnte nicht geladen werden:', error);
    postalIndex = buildPostalIndex([]);
  }
}

async function init() {
  try {
    const [response] = await Promise.all([
      fetch('/data/clubs.json', { headers: { Accept: 'application/json' } }),
      loadPostalIndex()
    ]);
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

searchInput?.addEventListener('input', () => { clearNearbyMode(); visibleCount = PAGE_SIZE; render(); });
for (const control of [typeFilter, stateFilter]) {
  control?.addEventListener('change', () => { clearNearbyMode(); visibleCount = PAGE_SIZE; render(); });
}
radiusFilter?.addEventListener('change', () => { if (nearbyOrigin) render(); });
findNearbyButton?.addEventListener('click', findNearbyFromSearch);
useLocationButton?.addEventListener('click', useBrowserLocation);
loadMore?.addEventListener('click', () => { visibleCount += PAGE_SIZE; render(); });
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-contact]');
  if (button) openContact(button.dataset.contact);
});
contactForm?.addEventListener('submit', submitContact);
contactDialog?.addEventListener('click', (event) => { if (event.target === contactDialog) contactDialog.close(); });
hydrateImageSlots();
init();
