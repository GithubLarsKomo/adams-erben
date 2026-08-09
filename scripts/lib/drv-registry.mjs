import * as cheerio from 'cheerio';

export const DRV_REGISTRY_PARSER_VERSION = '1.0.1';
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
const NON_OFFICIAL_SITE_HOST = /(google\.|openstreetmap|maps\.|facebook\.|instagram\.|youtube\.|youtu\.be|linkedin\.|x\.com$|twitter\.|ruder-bundesliga\.de$|rudersport-magazin\.de$)/i;
const ROLE_LOCAL_PART = /^(?:1\.?|2\.?)?(?:vorsitz\w*|vorstand|ruderwart\w*|sportwart\w*|jugendwart\w*|schriftwart\w*|kassier\w*|kasse|geschaeftsfuehr\w*|geschäftsführ\w*|geschaeftsstelle|geschäftsstelle|verwaltung|sekretariat|presse|trainer\w*)$/i;
const GENERIC_FUNCTIONAL_LOCAL_PART = /^(?:info|kontakt|contact|office|buero|büro|mail|post|anfrage|service|verein|webmaster)(?:[._-].*)?$/i;

export const clean = (value = '') => String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

function normalizeHost(value = '') {
  return String(value).trim().toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
}

function domainsRelated(a, b) {
  const left = normalizeHost(a);
  const right = normalizeHost(b);
  if (!left || !right) return false;
  return left === right || left.endsWith(`.${right}`) || right.endsWith(`.${left}`);
}

function normalizedExternalUrl(rawHref) {
  if (!rawHref) return '';
  let candidate = rawHref;
  if (/^www\./i.test(candidate)) candidate = `https://${candidate}`;
  if (!/^https?:/i.test(candidate)) return '';
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

    const scopes = [
      $(element).parent(),
      $(element).next(),
      $(element).parent().next(),
      $(element).closest('[class*="field"], dl, tr, section')
    ];
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
  if (fieldMatch) return fieldMatch[1].toLowerCase();
  return '';
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
  return candidates[0]?.score >= 80 ? candidates[0].url : '';
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

export function isApprovedRegistryDirectContact(record) {
  const email = clean(record.emailFromDrv).toLowerCase();
  if (!email || !email.includes('@')) return false;
  const [local, emailDomain = ''] = email.split('@');
  if (ROLE_LOCAL_PART.test(local)) return true;
  if (!GENERIC_FUNCTIONAL_LOCAL_PART.test(local) || !record.websiteFromDrv) return false;
  try {
    return domainsRelated(emailDomain, new URL(record.websiteFromDrv).hostname);
  } catch {
    return false;
  }
}

export function publicOrganizationFromRegistry(record, contactRouteLevel = 'drv', hasDirectContact = Boolean(record.emailFromDrv)) {
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
    hasDirectContact,
    contactRouteLevel,
    featured: record.featured
  };
}

export function discoveryRecordFromRegistry(record) {
  return {
    organizationId: record.organizationId,
    drvId: record.drvId,
    name: record.name,
    type: record.type,
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
