import * as cheerio from 'cheerio';

export const DRV_REGISTRY_PARSER_VERSION = '1.1.4';
export const DRV_ORIGIN = 'https://www.rudern.de';

export const LRV_PROFILES = [
  { drvId: '30010', states: ['Baden-Württemberg'], path: '/service/vereine/landesruderverband-baden-wuerttemberg-ev' },
  { drvId: '30011', states: ['Bayern'], path: '/service/vereine/bayerischer-ruderverband-ev' },
  { drvId: '30012', states: ['Berlin'], path: '/service/vereine/landesruderverband-berlin-ev' },
  { drvId: '30013', states: ['Brandenburg'], path: '/service/vereine/landesruderverband-brandenburg-ev' },
  { drvId: '30014', states: ['Bremen'], path: '/service/vereine/landesruderverband-bremen' },
  { drvId: '30015', states: ['Hamburg'], path: '/service/vereine/allgemeiner-alster-club-norddeutscher-ruderer-bund' },
  { drvId: '30016', states: ['Hessen'], path: '/service/vereine/hessischer-ruderverband-ev' },
  { drvId: '30017', states: ['Mecklenburg-Vorpommern'], path: '/service/vereine/landesruderverband-mecklenburg-vorpommern-ev' },
  { drvId: '30018', states: ['Niedersachsen'], path: '/service/vereine/landesruderverband-niedersachsen' },
  { drvId: '30019', states: ['Nordrhein-Westfalen'], path: '/service/vereine/nordrhein-westfaelischer-ruderverband' },
  { drvId: '30020', states: ['Rheinland-Pfalz', 'Saarland'], path: '/service/vereine/ruderverband-suedwest-ev' },
  { drvId: '30022', states: ['Sachsen'], path: '/service/vereine/landesruderverband-sachsen' },
  { drvId: '30023', states: ['Sachsen-Anhalt'], path: '/service/vereine/ruderverband-sachsen-anhalt' },
  { drvId: '30024', states: ['Schleswig-Holstein'], path: '/service/vereine/ruderverband-schleswig-holstein' },
  { drvId: '30025', states: ['Thüringen'], path: '/service/vereine/thueringer-ruderverband' }
].map((item) => ({ ...item, url: new URL(item.path, DRV_ORIGIN).toString() }));

export const LRV_BY_DRV_ID = new Map(LRV_PROFILES.map((item) => [item.drvId, item]));

const OTHER_MEMBER_PATTERN = /(Bundesstützpunkt|Olympiastützpunkt|Gymnasium|Schule|Schülerruder|Hochschule|Universität|Institut|Regattaverband|Ruderjugend|Adolfinum)/i;
const NON_OFFICIAL_SITE_HOST = /(google\.|openstreetmap|maps\.|facebook\.|instagram\.|youtube\.|youtu\.be|linkedin\.|x\.com$|twitter\.|ruder-bundesliga\.de$|rudersport-magazin\.de$)/i;
const ROLE_LOCAL_PART = /^(?:1\.?|2\.?)?(?:vorsitz\w*|vorstand|ruderwart\w*|sportwart\w*|jugendwart\w*|schriftwart\w*|kassier\w*|kasse|geschaeftsfuehr\w*|geschäftsführ\w*|geschaeftsstelle|geschäftsstelle|verwaltung|sekretariat|presse|trainer\w*)$/i;
const GENERIC_FUNCTIONAL_LOCAL_PART = /^(?:info|kontakt|contact|office|buero|büro|mail|post|anfrage|service|verein|webmaster)(?:[._-].*)?$/i;
const NOISY_CITY_PATTERN = /\b(?:bootshaus|anschrift|ruder\w*|verein\w*|club|gesellschaft|abteilung|abt\.?|e\.?\s*v\.?|straße|str\.?|weg|allee|ufer|promenade|hafen|seeweg|fähre)\b/i;

export const clean = (value = '') => String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

function normalizeHost(value = '') {
  return String(value).trim().toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
}

function normalizePlace(value = '') {
  return clean(value)
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function plausibleCityCandidate(value = '') {
  const candidate = clean(value);
  if (!candidate || candidate.length > 70) return false;
  if (NOISY_CITY_PATTERN.test(candidate)) return false;
  if (/^(?:v\.?|ev\.?|e\.\s*v\.?)\s+/i.test(candidate)) return false;
  const tokens = candidate.split(/\s+/).filter(Boolean);
  return tokens.length >= 1 && tokens.length <= 6;
}

function domainsRelated(a, b) {
  const left = normalizeHost(a);
  const right = normalizeHost(b);
  if (!left || !right) return false;
  return left === right || left.endsWith(`.${right}`) || right.endsWith(`.${left}`);
}

function normalizedExternalUrl(rawHref) {
  if (!rawHref) return '';
  let candidate = clean(rawHref);
  if (/^\/\//.test(candidate)) candidate = `https:${candidate}`;
  else if (/^www\./i.test(candidate)) candidate = `https://${candidate}`;
  else if (!/^https?:\/\//i.test(candidate) && /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/.*)?$/i.test(candidate)) candidate = `https://${candidate}`;
  if (!/^https?:\/\//i.test(candidate)) return '';
  try {
    const url = new URL(candidate);
    if (url.hostname.endsWith('rudern.de')) return '';
    if (NON_OFFICIAL_SITE_HOST.test(url.hostname)) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

function labeledWebsiteCandidate($) {
  let selected = '';
  $('*').each((_, element) => {
    if (selected) return;
    const label = clean($(element).clone().children().remove().end().text());
    if (!/^(website|homepage)$/i.test(label)) return;
    const scopes = [$(element).parent(), $(element).next(), $(element).parent().next(), $(element).closest('[class*="field"], dl, tr, section')];
    for (const scope of scopes) {
      if (!scope?.length) continue;
      for (const anchor of scope.find('a[href]').toArray()) {
        const candidate = normalizedExternalUrl($(anchor).attr('href'));
        if (candidate) {
          selected = candidate;
          return;
        }
      }
    }
  });
  return selected;
}

function websiteContext($, element) {
  const chunks = [clean($(element).text()), clean($(element).prev().text()), clean($(element).parent().prev().text())];
  let parent = $(element).parent();
  for (let depth = 0; depth < 4 && parent.length; depth += 1) {
    const text = clean(parent.text());
    if (text && text.length <= 700) chunks.push(text);
    parent = parent.parent();
  }
  return chunks.join(' | ');
}

export function extractProfileLinks(html) {
  const $ = cheerio.load(html);
  const urls = new Set();
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    try {
      const url = new URL(href, DRV_ORIGIN);
      if (url.origin === DRV_ORIGIN && /^\/service\/vereine\/[a-z0-9-]+\/?$/i.test(url.pathname)) urls.add(url.toString().replace(/\/$/, ''));
    } catch { /* ignore malformed URL */ }
  });
  return [...urls];
}

function cityPostalFromTextNode(value = '') {
  const text = clean(value);
  const match = text.match(/(.+?)\s+(\d{5})(?:\s|$)/u);
  if (!match) return null;
  const parsedCity = clean(match[1].replace(/^[,|·•\-–—\s]+/, ''));
  if (!parsedCity) return null;
  return { postalCode: match[2], parsedCity };
}

function collectTextNodePostalCandidates(node, out) {
  if (!node) return;
  if (node.type === 'text') {
    const candidate = cityPostalFromTextNode(node.data || '');
    if (candidate) out.push(candidate);
    return;
  }
  for (const child of node.children || []) collectTextNodePostalCandidates(child, out);
}

export function extractPostalSectionFromDom($) {
  const headings = $('h1,h2,h3,h4,h5,h6').toArray();
  for (const marker of ['Bootshäuser', 'Bootshaus', 'Anschriften', 'Anschrift']) {
    const heading = headings.find((element) => clean($(element).text()).toLocaleLowerCase('de-DE') === marker.toLocaleLowerCase('de-DE'));
    if (!heading) continue;
    const candidates = [];
    let current = $(heading).next();
    while (current.length && !/^h[1-6]$/i.test(current[0]?.tagName || '')) {
      collectTextNodePostalCandidates(current[0], candidates);
      current = current.next();
    }
    if (candidates.length) return candidates[0];
  }
  return null;
}

export function extractPostalSection(text) {
  for (const marker of ['Bootshäuser', 'Bootshaus', 'Anschriften', 'Anschrift']) {
    const index = text.indexOf(marker);
    if (index < 0) continue;
    const section = text.slice(index, index + 700);
    const zipMatch = section.match(/\b(\d{5})\b/);
    if (!zipMatch) continue;
    const postalCode = zipMatch[1];
    const before = section.slice(0, zipMatch.index).replace(/Route planen.*$/i, '').trim();
    const cityMatch = before.match(/([A-ZÄÖÜ][\p{L}ÄÖÜäöüß.'’()\/-]*(?:\s+[\p{L}ÄÖÜäöüß.'’()\/-]+){0,6})\s*$/u);
    return { postalCode, parsedCity: clean(cityMatch?.[1] || '') };
  }
  return { postalCode: '', parsedCity: '' };
}

export function resolvePostalCity(parsedCity, postalInfo) {
  const candidate = clean(parsedCity);
  const places = [...new Set((postalInfo?.places || []).map(clean).filter(Boolean))];
  if (!places.length) return { city: candidate, citySource: candidate ? 'drv-text-unverified' : 'missing' };
  const candidateNorm = normalizePlace(candidate);
  if (candidateNorm) {
    const match = [...places].sort((a, b) => normalizePlace(b).length - normalizePlace(a).length).find((place) => {
      const placeNorm = normalizePlace(place);
      return candidateNorm === placeNorm || candidateNorm.endsWith(` ${placeNorm}`);
    });
    if (match) return { city: match, citySource: 'drv-text+geonames-postcode' };
  }
  if (plausibleCityCandidate(candidate)) return { city: candidate, citySource: 'drv-text' };
  return { city: places[0], citySource: 'geonames-postcode' };
}

export function firstPublicEmail($) {
  const body = $('body');
  const text = clean(body.text());
  const emailLabelIndex = text.search(/\bE-Mail\b/i);
  const candidates = [];
  for (const element of body.find('a[href^="mailto:"]').toArray()) {
    const href = $(element).attr('href') || '';
    const raw = href.slice('mailto:'.length).split('?')[0];
    let email = raw;
    try { email = decodeURIComponent(raw); } catch { /* keep raw */ }
    email = clean(email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    const context = websiteContext($, element);
    let score = /\bE-Mail\b/i.test(context) ? 100 : 0;
    if (emailLabelIndex >= 0) score += 5;
    candidates.push({ email, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  if (candidates[0]?.score >= 100) return candidates[0].email;
  const fieldMatch = text.match(/\bE-Mail\b\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  return fieldMatch ? fieldMatch[1].toLowerCase() : '';
}

export function firstExternalWebsite($) {
  const labeled = labeledWebsiteCandidate($);
  if (labeled) return labeled;

  const candidates = [];
  for (const element of $('a[href]').toArray()) {
    const url = normalizedExternalUrl($(element).attr('href'));
    if (!url) continue;
    const context = websiteContext($, element);
    let score = 0;
    if (/\bwebsite\b/i.test(context)) score += 100;
    if (/\bhomepage\b/i.test(context)) score += 90;
    const host = normalizeHost(new URL(url).hostname);
    const anchorText = clean($(element).text()).toLowerCase();
    if (host && anchorText.includes(host)) score += 25;
    candidates.push({ url, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  if (candidates[0]?.score >= 80) return candidates[0].url;

  const bodyText = clean($('body').text());
  const fieldMatch = bodyText.match(/\b(?:Website|Homepage)\b\s*((?:(?:https?:)?\/\/|www\.)?[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[^\s]*)?)/i);
  return fieldMatch ? normalizedExternalUrl(fieldMatch[1]) : '';
}

export function parseDrvRegistryProfile(url, html, postalStates = new Map(), fetchedAt = new Date().toISOString()) {
  const $ = cheerio.load(html);
  const name = clean($('h1').first().text());
  const text = clean($('body').text());
  const drvId = text.match(/DRV-ID\s+(\d{4,6})/i)?.[1] || '';
  const lrvProfile = LRV_BY_DRV_ID.get(drvId);
  const { postalCode, parsedCity } = extractPostalSectionFromDom($) || extractPostalSection(text);
  const postalInfo = postalStates.get(postalCode);
  const { city, citySource } = resolvePostalCity(parsedCity, postalInfo);
  const states = lrvProfile?.states || (postalInfo?.state ? [postalInfo.state] : []);
  const state = lrvProfile ? lrvProfile.states.join(' / ') : (postalInfo?.state || '');
  const emailFromDrv = firstPublicEmail($);
  const websiteFromDrv = firstExternalWebsite($);
  const slug = new URL(url).pathname.split('/').filter(Boolean).pop();
  const organizationId = drvId || slug;
  const featured = slug === 'ratzeburger-ruderclub-ev' || drvId === '12420';
  const type = lrvProfile ? 'lrv' : (OTHER_MEMBER_PATTERN.test(name) ? 'member' : 'club');
  return { organizationId, id: slug, drvId, name, type, city, citySource, postalCode, state, states, drvProfileUrl: url, websiteFromDrv, websiteStatus: websiteFromDrv ? 'present' : 'missing', emailFromDrv, featured, fetchedAt, sourceType: lrvProfile ? 'drv-lrv-profile' : 'drv-profile', sourceUrl: url, parserVersion: DRV_REGISTRY_PARSER_VERSION };
}

export function isApprovedRegistryDirectContact(record) {
  const email = clean(record.emailFromDrv).toLowerCase();
  if (!email || !email.includes('@')) return false;
  const [local, emailDomain = ''] = email.split('@');
  if (ROLE_LOCAL_PART.test(local)) return true;
  if (!GENERIC_FUNCTIONAL_LOCAL_PART.test(local) || !record.websiteFromDrv) return false;
  try { return domainsRelated(emailDomain, new URL(record.websiteFromDrv).hostname); } catch { return false; }
}

export function publicOrganizationFromRegistry(record, contactRouteLevel = 'drv', hasDirectContact = Boolean(record.emailFromDrv)) {
  return { id: record.id, organizationId: record.organizationId, name: record.name, drvId: record.drvId, type: record.type, city: record.city, postalCode: record.postalCode, state: record.state, states: record.states, website: record.websiteFromDrv, profileUrl: record.drvProfileUrl, websiteStatus: record.websiteStatus, hasDirectContact, contactRouteLevel, featured: record.featured };
}

export function discoveryRecordFromRegistry(record) {
  return { organizationId: record.organizationId, drvId: record.drvId, name: record.name, type: record.type, postalCode: record.postalCode, city: record.city, citySource: record.citySource, state: record.state, states: record.states, drvProfileUrl: record.drvProfileUrl, websiteFromDrv: record.websiteFromDrv, websiteStatus: record.websiteStatus, fetchedAt: record.fetchedAt, parserVersion: record.parserVersion };
}