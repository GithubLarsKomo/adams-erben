import * as cheerio from 'cheerio';

export const DRV_REGISTRY_PARSER_VERSION = '1.0.0';
export const DRV_ORIGIN = 'https://www.rudern.de';

export const LRV_BY_DRV_ID = new Map([
  ['30010', 'Baden-Württemberg'],
  ['30011', 'Bayern'],
  ['30012', 'Berlin'],
  ['30013', 'Brandenburg'],
  ['30014', 'Bremen'],
  ['30015', 'Hamburg'],
  ['30016', 'Hessen'],
  ['30017', 'Mecklenburg-Vorpommern'],
  ['30018', 'Niedersachsen'],
  ['30019', 'Nordrhein-Westfalen'],
  ['30020', 'Rheinland-Pfalz'],
  ['30021', 'Saarland'],
  ['30022', 'Sachsen'],
  ['30023', 'Sachsen-Anhalt'],
  ['30024', 'Schleswig-Holstein'],
  ['30025', 'Thüringen']
]);

const OTHER_MEMBER_PATTERN = /(Bundesstützpunkt|Olympiastützpunkt|Gymnasium|Schule|Schülerruder|Hochschule|Universität|Institut|Regattaverband|Ruderjugend)/i;
const NON_OFFICIAL_SITE_HOST = /(google\.|openstreetmap|maps\.|facebook\.|instagram\.|youtube\.|youtu\.be|linkedin\.|x\.com$|twitter\.)/i;

export const clean = (value = '') => String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

export function extractProfileLinks(html) {
  const $ = cheerio.load(html);
  const urls = new Set();
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    try {
      const url = new URL(href, DRV_ORIGIN);
      if (url.origin === DRV_ORIGIN && /^\/service\/vereine\/[a-z0-9-]+\/?$/i.test(url.pathname)) {
        urls.add(url.toString().replace(/\/$/, ''));
      }
    } catch { /* ignore malformed URL */ }
  });
  return [...urls];
}

export function extractPostalSection(text) {
  for (const marker of ['Bootshaus', 'Anschriften', 'Anschrift']) {
    const index = text.indexOf(marker);
    if (index < 0) continue;
    const section = text.slice(index, index + 600);
    const zipMatch = section.match(/\b(\d{5})\b/);
    if (!zipMatch) continue;
    const postalCode = zipMatch[1];
    const before = section.slice(0, zipMatch.index).replace(/Route planen.*$/i, '').trim();
    const cityMatch = before.match(/([A-ZÄÖÜ][\p{L}ÄÖÜäöüß.'’()\/-]*(?:\s+[\p{L}ÄÖÜäöüß.'’()\/-]+){0,4})\s*$/u);
    return { postalCode, parsedCity: clean(cityMatch?.[1] || '') };
  }
  return { postalCode: '', parsedCity: '' };
}

export function firstPublicEmail($) {
  for (const element of $('a[href^="mailto:"]').toArray()) {
    const href = $(element).attr('href') || '';
    const raw = href.slice('mailto:'.length).split('?')[0];
    let email = raw;
    try { email = decodeURIComponent(raw); } catch { /* keep raw */ }
    email = clean(email).toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return email;
  }
  return '';
}

export function firstExternalWebsite($) {
  for (const element of $('a[href]').toArray()) {
    const href = $(element).attr('href');
    if (!href) continue;
    let candidate = href;
    if (/^www\./i.test(candidate)) candidate = `https://${candidate}`;
    if (!/^https?:/i.test(candidate)) continue;
    try {
      const url = new URL(candidate);
      if (url.hostname.endsWith('rudern.de')) continue;
      if (NON_OFFICIAL_SITE_HOST.test(url.hostname)) continue;
      url.hash = '';
      return url.toString();
    } catch { /* ignore malformed URL */ }
  }
  return '';
}

export function parseDrvRegistryProfile(url, html, postalStates = new Map(), fetchedAt = new Date().toISOString()) {
  const $ = cheerio.load(html);
  const name = clean($('h1').first().text());
  const text = clean($('body').text());
  const drvId = text.match(/DRV-ID\s+(\d{4,6})/i)?.[1] || '';
  const { postalCode, parsedCity } = extractPostalSection(text);
  const postalInfo = postalStates.get(postalCode);
  const state = LRV_BY_DRV_ID.get(drvId) || postalInfo?.state || '';
  const city = parsedCity || postalInfo?.places?.[0] || '';
  const emailFromDrv = firstPublicEmail($);
  const websiteFromDrv = firstExternalWebsite($);
  const slug = new URL(url).pathname.split('/').filter(Boolean).pop();
  const organizationId = drvId || slug;
  const featured = slug === 'ratzeburger-ruderclub-ev' || drvId === '12420';
  const type = LRV_BY_DRV_ID.has(drvId) ? 'lrv' : (OTHER_MEMBER_PATTERN.test(name) ? 'member' : 'club');

  return {
    organizationId,
    id: slug,
    drvId,
    name,
    type,
    city,
    postalCode,
    state,
    drvProfileUrl: url,
    websiteFromDrv,
    websiteStatus: websiteFromDrv ? 'present' : 'missing',
    emailFromDrv,
    featured,
    fetchedAt,
    sourceType: 'drv-profile',
    sourceUrl: url,
    parserVersion: DRV_REGISTRY_PARSER_VERSION
  };
}

export function publicOrganizationFromRegistry(record, contactRouteLevel = 'drv') {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    drvId: record.drvId,
    type: record.type,
    city: record.city,
    postalCode: record.postalCode,
    state: record.state,
    website: record.websiteFromDrv,
    profileUrl: record.drvProfileUrl,
    websiteStatus: record.websiteStatus,
    hasDirectContact: Boolean(record.emailFromDrv),
    contactRouteLevel,
    featured: record.featured
  };
}

export function discoveryRecordFromRegistry(record) {
  return {
    organizationId: record.organizationId,
    drvId: record.drvId,
    name: record.name,
    postalCode: record.postalCode,
    city: record.city,
    state: record.state,
    drvProfileUrl: record.drvProfileUrl,
    websiteFromDrv: record.websiteFromDrv,
    websiteStatus: record.websiteStatus,
    fetchedAt: record.fetchedAt,
    parserVersion: record.parserVersion
  };
}
