import * as cheerio from 'cheerio';

const POSITIVE = /(?:^|[\s_\-])(logo|brand|branding|wappen|flagge|signet|vereinslogo|clublogo|site-logo|custom-logo)(?:$|[\s_\-])/i;
const NEGATIVE = /(sponsor|partner|advert|cookie|social|facebook|instagram|youtube|payment|badge|seal|footer-logo)/i;
const EVENT_NEGATIVE = /(regatta|achterregatta|ruderregatta|cup|pokal|meisterschaft|championship|event|veranstaltung|ausschreibung|meldeergebnis|rennergebnis|race|rennen|sprint)/i;
const PHOTO_NEGATIVE = /(hero|slider|slide|banner|header[-_ ]?(?:image|photo|bild)|titelbild|theme[-_ ]?image|gallery|galerie|background|hintergrund|bg[-_])/i;
const PHOTO_HARD_NEGATIVE = /(hero|slider|slide|banner|header[-_ ]?(?:image|photo|bild)|titelbild|theme[-_ ]?image|gallery|galerie|bg[-_])/i;
const COSMETIC_BACKGROUND = /(background|hintergrund)/i;
const IDENTITY_POSITIVE = /(vereinslogo|clublogo|site[-_ ]?logo|custom[-_ ]?logo|wappen|flagge|signet|brand(?:ing)?)/i;
const DIRECT_LOGO_POSITIVE = /\b(?:logo|vereinslogo|clublogo|site logo|custom logo|wappen|flagge|signet|brand|branding)\b/i;
const STRONG_SITE_IDENTITY = /\b(?:custom logo|site logo|header logo(?: img)?|brand logo|navbar brand|logo image|logo link|seitenlogo|mk desktop logo|mk responsive logo|mk resposnive logo)\b/i;
const CMS_ASSET_HOST = /(^|\.)(?:image\.jimcdn\.com|static\.wixstatic\.com|images\.squarespace-cdn\.com|files\.wordpress\.com)$/i;
const GENERIC_NAME_TOKENS = new Set([
  'e', 'v', 'ev', 'der', 'die', 'das', 'und', 'von', 'zu', 'am', 'an', 'im', 'in',
  'ruderclub', 'ruderverein', 'rudergesellschaft', 'rudergemeinschaft', 'ruderriege', 'ruderklub',
  'ruder', 'rudern', 'club', 'verein', 'gesellschaft', 'landesruderverband', 'ruderverband', 'verband',
  'akademische', 'akademischer', 'akademischen', 'akademisches', 'abt', 'abteilung'
]);

function clean(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

export function normalizeToken(value = '') {
  return clean(value)
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isYearToken(token) {
  return /^(?:18|19|20)\d{2}$/.test(token);
}

function meaningfulTokens(value = '') {
  return normalizeToken(value).split(' ')
    .filter((token) => token.length >= 3 && !GENERIC_NAME_TOKENS.has(token));
}

function organizationTokens(organization) {
  const name = typeof organization === 'string' ? organization : organization?.name || '';
  const cityTokens = new Set(meaningfulTokens(typeof organization === 'string' ? '' : organization?.city || ''));
  return meaningfulTokens(name).filter((token) => !cityTokens.has(token));
}

function canonicalNameWords(name = '') {
  return normalizeToken(name)
    .replace(/\bruder\s+club\b/g, 'ruderclub')
    .replace(/\bruder\s+verein\b/g, 'ruderverein')
    .replace(/\bruder\s+gesellschaft\b/g, 'rudergesellschaft')
    .replace(/\bruder\s+gemeinschaft\b/g, 'rudergemeinschaft')
    .replace(/\bruder\s+riege\b/g, 'ruderriege')
    .split(' ')
    .filter((word) => word && !isYearToken(word));
}

function abbreviationForWord(word) {
  const map = {
    akademische: 'a', akademischer: 'a', akademischen: 'a', akademisches: 'a',
    ruderclub: 'rc', ruderverein: 'rv', rudergesellschaft: 'rg', rudergemeinschaft: 'rg',
    ruderriege: 'rr', ruderklub: 'rk', ruderverbindung: 'rv', turnverbindung: 'tv',
    landesruderverband: 'lrv', ruderverband: 'rv', eisenbahnsportverein: 'esv',
    sportverein: 'sv', turnverein: 'tv', wassersportverein: 'wsv'
  };
  if (map[word]) return map[word];
  if (/^(?:e|v|ev|der|die|das|und|von|zu|am|an|im|in|abt|abteilung|rudern)$/.test(word)) return '';
  return word[0] || '';
}

export function organizationAliases(organization) {
  const name = typeof organization === 'string' ? organization : organization?.name || '';
  const city = typeof organization === 'string' ? '' : organization?.city || '';
  const words = canonicalNameWords(name);
  const cityWords = new Set(canonicalNameWords(city));
  const withoutCity = words.filter((word) => !cityWords.has(word));
  const build = (items) => items.map(abbreviationForWord).join('');
  const aliases = new Set([build(withoutCity), build(words)]);
  if (words.includes('eisenbahnsportverein')) aliases.add('esv');
  const normalizedName = normalizeToken(name).replace(/\b(?:e v|ev)\b/g, '').replace(/\s+/g, ' ').trim();
  if (normalizedName) aliases.add(normalizedName.replace(/\s+/g, ''));
  return [...aliases].filter((value) => value.length >= 2 && value.length <= 80);
}

export function organizationAcronym(name = '') {
  return organizationAliases(name).find((value) => value.length <= 8) || '';
}

function tokenCoverage(tokens, text) {
  if (!tokens.length) return 0;
  const normalized = normalizeToken(text);
  const matches = tokens.filter((token) => normalized.includes(token)).length;
  return matches / tokens.length;
}

function aliasMatch(organization, text) {
  const normalized = normalizeToken(text).replace(/\s+/g, '');
  return organizationAliases(organization).some((alias) => normalized.includes(alias));
}

function exactNameMatch(organization, text) {
  const name = typeof organization === 'string' ? organization : organization?.name || '';
  const core = normalizeToken(name).replace(/\b(?:e v|ev)\b/g, '').replace(/\s+/g, ' ').trim();
  return core.length >= 5 && normalizeToken(text).includes(core);
}

function parseDimension(value) {
  const match = String(value || '').match(/^\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function srcsetUrl(value = '') {
  const candidates = String(value).split(',').map((item) => item.trim()).filter(Boolean)
    .map((item) => item.split(/\s+/)[0]).filter(Boolean);
  return candidates.at(-1) || '';
}

function firstUsableSource(...values) {
  for (const value of values) {
    const candidate = clean(value);
    if (candidate && !/^(?:data|blob|javascript):/i.test(candidate)) return candidate;
  }
  return '';
}

export function resolveCandidateUrl(raw, pageUrl, baseHref = '') {
  const value = clean(raw);
  if (!value || /^(?:data|blob|javascript):/i.test(value)) return '';
  try {
    const base = baseHref ? new URL(baseHref, pageUrl).toString() : pageUrl;
    const url = new URL(value, base);
    if (!/^https?:$/.test(url.protocol)) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

export function isSameSite(candidateUrl, pageUrl) {
  try {
    const candidate = new URL(candidateUrl);
    const page = new URL(pageUrl);
    const a = candidate.hostname.toLowerCase().replace(/^www\./, '');
    const b = page.hostname.toLowerCase().replace(/^www\./, '');
    return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
  } catch {
    return false;
  }
}

export function isTrustedReferencedAsset(candidate, pageUrl) {
  if (isSameSite(candidate?.url, pageUrl)) return true;
  if (!candidate?.directlyReferenced) return false;
  try {
    return CMS_ASSET_HOST.test(new URL(candidate.url).hostname);
  } catch {
    return false;
  }
}

function ownElementContext($, element) {
  const current = $(element);
  return clean([
    current.attr('id'), current.attr('class'), current.attr('alt'), current.attr('title'), current.attr('aria-label')
  ].filter(Boolean).join(' '));
}

function elementContext($, element) {
  const parts = [];
  let current = $(element);
  for (let depth = 0; depth < 4 && current.length; depth += 1) {
    parts.push(...[
      current.attr('id'), current.attr('class'), current.attr('alt'), current.attr('title'), current.attr('aria-label')
    ].filter(Boolean));
    current = current.parent();
  }
  return clean(parts.join(' '));
}

function assetPathText(rawUrl = '') {
  try {
    const url = new URL(rawUrl);
    return clean(`${decodeURIComponent(url.pathname)} ${decodeURIComponent(url.search)}`);
  } catch {
    return clean(rawUrl);
  }
}

function candidateDirectText(candidate) {
  return clean(`${candidate?.label || ''} ${candidate?.directContext || ''} ${assetPathText(candidate?.url || '')}`);
}

function candidateFullText(candidate) {
  return clean(`${candidate?.label || ''} ${candidate?.context || ''} ${candidate?.url || ''}`);
}

function hasStrongSiteIdentity(candidate) {
  return STRONG_SITE_IDENTITY.test(normalizeToken(candidateFullText(candidate)));
}

function hasQualifiedAliasEvidence(candidate, organization) {
  const text = candidateDirectText(candidate);
  if (!aliasMatch(organization, text)) return false;
  const direct = normalizeToken(text);
  return candidate?.kind === 'jsonld' || candidate?.kind === 'meta'
    || DIRECT_LOGO_POSITIVE.test(direct) || hasStrongSiteIdentity(candidate);
}

function hasDirectOrganizationEvidence(candidate, organization) {
  const text = candidateDirectText(candidate);
  const tokens = organizationTokens(organization);
  return tokenCoverage(tokens, text) > 0 || hasQualifiedAliasEvidence(candidate, organization) || exactNameMatch(organization, text);
}

function pageHasOrganizationEvidence(organization, pageIdentity) {
  const pageText = pageIdentity?.text || '';
  const tokens = organizationTokens(organization);
  return tokenCoverage(tokens, pageText) >= 0.5 || aliasMatch(organization, pageText) || exactNameMatch(organization, pageText);
}

function hasDisqualifyingPhotoContext(candidate) {
  const fullRaw = candidateFullText(candidate);
  if (!PHOTO_NEGATIVE.test(fullRaw)) return false;
  if (PHOTO_HARD_NEGATIVE.test(fullRaw)) return true;
  if (COSMETIC_BACKGROUND.test(fullRaw)) {
    const direct = normalizeToken(candidateDirectText(candidate));
    return !DIRECT_LOGO_POSITIVE.test(direct);
  }
  return true;
}

export function candidatePreferenceScore(candidate, organization = '') {
  const direct = normalizeToken(candidateDirectText(candidate));
  const full = normalizeToken(candidateFullText(candidate));
  let priority = 0;
  if (candidate.kind === 'jsonld') priority += 140;
  else if (candidate.kind === 'meta') priority += 120;
  if (IDENTITY_POSITIVE.test(direct)) priority += 90;
  if (hasStrongSiteIdentity(candidate)) priority += 70;
  if (hasDirectOrganizationEvidence(candidate, organization)) priority += 80;
  if (candidate.inHeader) priority += 20;
  if (EVENT_NEGATIVE.test(full)) priority -= 180;
  if (NEGATIVE.test(full)) priority -= 160;
  if (hasDisqualifyingPhotoContext(candidate)) priority -= 140;
  const width = parseDimension(candidate.width);
  const height = parseDimension(candidate.height);
  const largest = Math.max(width, height);
  const smallest = Math.min(width || largest, height || largest);
  if (largest >= 600 && smallest > 0 && largest / smallest >= 4) priority -= 70;
  if (/\bcropped\b/.test(normalizeToken(candidate.url || '')) && !IDENTITY_POSITIVE.test(direct)) priority -= 35;
  return priority;
}

export function scoreLogoCandidate(candidate, organization = '') {
  const urlText = normalizeToken(candidate.url || '');
  const labelNorm = normalizeToken(clean([candidate.label, candidate.context].filter(Boolean).join(' ')));
  let score = Number(candidate.baseScore || 0);

  if (POSITIVE.test(` ${labelNorm.replace(/ /g, '-')} `)) score += 70;
  if (/(logo|wappen|flagge|signet|brand)/i.test(urlText)) score += 50;
  if (/(logo|wappen|flagge|signet|brand)/i.test(labelNorm)) score += 35;
  if (candidate.inHeader) score += 20;
  if (candidate.kind === 'jsonld') score += 40;
  if (candidate.kind === 'meta') score += 30;
  if (candidate.kind === 'icon') score -= 45;
  if (/\.svg(?:$|\?)/i.test(candidate.url || '')) score += 10;

  const tokens = organizationTokens(organization);
  const matches = tokens.filter((token) => labelNorm.includes(token) || urlText.includes(token)).length;
  score += Math.min(45, matches * 15);
  if (hasQualifiedAliasEvidence(candidate, organization)) score += 35;
  if (exactNameMatch(organization, `${labelNorm} ${urlText}`)) score += 30;

  const width = parseDimension(candidate.width);
  const height = parseDimension(candidate.height);
  const largest = Math.max(width, height);
  const smallest = Math.min(width || largest, height || largest);
  if (largest >= 128) score += 15;
  else if (largest > 0 && largest < 40) score -= 40;
  if (largest >= 600 && smallest > 0 && largest / smallest >= 4) score -= 45;

  if (EVENT_NEGATIVE.test(`${labelNorm} ${urlText}`)) score -= 140;
  if (hasDisqualifyingPhotoContext(candidate)) score -= 100;
  if (NEGATIVE.test(`${labelNorm} ${urlText}`)) score -= 120;
  return score;
}

function jsonLdObjects(value) {
  if (Array.isArray(value)) return value.flatMap(jsonLdObjects);
  if (!value || typeof value !== 'object') return [];
  const nested = Array.isArray(value['@graph']) ? value['@graph'].flatMap(jsonLdObjects) : [];
  return [value, ...nested];
}

export function extractPageIdentity(html) {
  const $ = cheerio.load(html);
  const names = [];
  const add = (value) => { const v = clean(value); if (v && !names.includes(v)) names.push(v); };
  add($('title').first().text());
  add($('h1').first().text());
  add($('meta[property="og:site_name"]').attr('content'));
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const parsed = JSON.parse($(element).text());
      for (const item of jsonLdObjects(parsed)) {
        const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
        if (types.some((type) => /Organization|SportsOrganization|LocalBusiness/i.test(String(type || '')))) add(item.name);
      }
    } catch { /* invalid JSON-LD is non-fatal */ }
  });
  return { names, text: names.join(' | ') };
}

export function scoreEntityConfidence(candidate, organization, pageIdentity) {
  const tokens = organizationTokens(organization);
  const candidateText = candidateFullText(candidate);
  const directText = candidateDirectText(candidate);
  const pageText = pageIdentity?.text || '';
  const pageCoverage = tokenCoverage(tokens, pageText);
  const assetCoverage = tokenCoverage(tokens, candidateText);
  const directCoverage = tokenCoverage(tokens, directText);
  const pageAlias = aliasMatch(organization, pageText);
  const assetAlias = aliasMatch(organization, candidateText);
  const directAlias = hasQualifiedAliasEvidence(candidate, organization);
  const pageExact = exactNameMatch(organization, pageText);
  const assetExact = exactNameMatch(organization, candidateText);
  const directExact = exactNameMatch(organization, directText);

  if (directExact || ((candidate?.kind === 'jsonld' || candidate?.kind === 'meta') && pageExact)) return 1;
  let confidence = Math.min(1, pageCoverage * 0.45 + assetCoverage * 0.2 + directCoverage * 0.25);
  if (pageAlias) confidence += 0.1;
  if (assetAlias) confidence += 0.15;
  if (directAlias) confidence += 0.3;
  if (pageExact) confidence += 0.2;
  if (assetExact) confidence += 0.15;
  if ((candidate?.kind === 'jsonld' || candidate?.kind === 'meta') && pageCoverage >= 0.5) confidence += 0.15;
  return Math.min(1, Number(confidence.toFixed(3)));
}

export function classifyLogoCandidate(candidate, organization, pageIdentity, { minScore = 70, minEntity = 0.55 } = {}) {
  const entityConfidence = scoreEntityConfidence(candidate, organization, pageIdentity);
  const score = Number(candidate?.score || 0);
  const fullText = normalizeToken(candidateFullText(candidate));
  const directIdentityEvidence = hasDirectOrganizationEvidence(candidate, organization);
  const strictSiteIdentity = candidate?.kind === 'img' && hasStrongSiteIdentity(candidate)
    && pageHasOrganizationEvidence(organization, pageIdentity) && entityConfidence >= 0.25;

  if (EVENT_NEGATIVE.test(fullText)) return { disposition: 'reject', reason: 'event_or_regatta_context', score, entityConfidence };
  if (NEGATIVE.test(fullText)) return { disposition: 'reject', reason: 'negative_logo_context', score, entityConfidence };
  if (hasDisqualifyingPhotoContext(candidate)) return { disposition: 'reject', reason: 'photo_or_banner_context', score, entityConfidence };
  if (score < minScore) {
    if (score >= 40 && entityConfidence >= 0.8) return { disposition: 'review', reason: 'high_entity_low_logo_score', score, entityConfidence };
    return { disposition: 'reject', reason: 'below_logo_score', score, entityConfidence };
  }
  if (candidate?.kind === 'img' && !directIdentityEvidence) {
    if (strictSiteIdentity) return { disposition: 'accept', reason: 'strict_site_identity', score, entityConfidence };
    return { disposition: entityConfidence >= 0.25 ? 'review' : 'reject', reason: 'direct_asset_identity_missing', score, entityConfidence };
  }
  if (entityConfidence >= minEntity) return { disposition: 'accept', reason: 'logo_and_entity_match', score, entityConfidence };
  if (strictSiteIdentity) return { disposition: 'accept', reason: 'strict_site_identity', score, entityConfidence };
  if (entityConfidence >= 0.25 || candidate?.kind === 'jsonld' || candidate?.kind === 'meta') {
    return { disposition: 'review', reason: 'entity_match_uncertain', score, entityConfidence };
  }
  return { disposition: 'reject', reason: 'entity_mismatch', score, entityConfidence };
}

function pushCandidate(target, raw, details, pageUrl, baseHref, organization) {
  const url = resolveCandidateUrl(raw, pageUrl, baseHref);
  if (!url) return;
  const candidate = { directlyReferenced: true, ...details, url };
  candidate.score = scoreLogoCandidate(candidate, organization);
  candidate.preference = candidatePreferenceScore(candidate, organization);
  target.push(candidate);
}

export function extractLogoCandidates(html, pageUrl, organization = '', { includeIcons = false } = {}) {
  const $ = cheerio.load(html);
  const candidates = [];
  const baseHref = $('base[href]').first().attr('href') || '';

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text();
    if (!raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      for (const item of jsonLdObjects(parsed)) {
        const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
        if (!types.some((type) => /Organization|SportsOrganization|LocalBusiness/i.test(String(type || '')))) continue;
        const logo = typeof item.logo === 'string' ? item.logo : item.logo?.url || item.logo?.contentUrl;
        pushCandidate(candidates, logo, {
          kind: 'jsonld', baseScore: 90,
          label: clean(`${item.name || ''} organization logo`), directContext: clean(item.name || '')
        }, pageUrl, baseHref, organization);
      }
    } catch { /* invalid JSON-LD is non-fatal */ }
  });

  $('meta[itemprop="logo"], meta[property="og:logo"], meta[name="logo"]').each((_, element) => {
    const label = $(element).attr('property') || $(element).attr('itemprop') || $(element).attr('name') || 'logo';
    pushCandidate(candidates, $(element).attr('content'), {
      kind: 'meta', baseScore: 80, label, directContext: label
    }, pageUrl, baseHref, organization);
  });

  $('img').each((_, element) => {
    const current = $(element);
    const raw = firstUsableSource(
      current.attr('src'), current.attr('data-src'), current.attr('data-lazy-src'), srcsetUrl(current.attr('srcset'))
    );
    if (!raw) return;
    pushCandidate(candidates, raw, {
      kind: 'img', baseScore: 0,
      label: clean([current.attr('alt'), current.attr('title'), current.attr('aria-label')].filter(Boolean).join(' ')),
      directContext: ownElementContext($, element),
      context: elementContext($, element),
      inHeader: current.closest('header, nav, [role="banner"]').length > 0,
      width: current.attr('width'), height: current.attr('height')
    }, pageUrl, baseHref, organization);
  });

  if (includeIcons) {
    $('link[rel~="apple-touch-icon"], link[rel~="icon"]').each((_, element) => {
      const label = $(element).attr('rel') || 'icon';
      pushCandidate(candidates, $(element).attr('href'), {
        kind: 'icon', baseScore: 15, label, directContext: label
      }, pageUrl, baseHref, organization);
    });
  }

  const deduped = new Map();
  for (const candidate of candidates) {
    const previous = deduped.get(candidate.url);
    if (!previous || candidate.score > previous.score || (candidate.score === previous.score && candidate.preference > previous.preference)) {
      deduped.set(candidate.url, candidate);
    }
  }
  return [...deduped.values()].sort((a, b) =>
    b.score - a.score || b.preference - a.preference || a.url.localeCompare(b.url)
  );
}

export function sanitizeSvg(svgText) {
  const $ = cheerio.load(svgText, { xmlMode: true });
  $('script, foreignObject, iframe, object, embed, audio, video').remove();
  $('*').each((_, element) => {
    const attrs = { ...(element.attribs || {}) };
    for (const [name, value] of Object.entries(attrs)) {
      if (/^on/i.test(name)) { $(element).removeAttr(name); continue; }
      if (/^(?:href|xlink:href)$/i.test(name) && /^(?:https?:)?\/\//i.test(String(value || '').trim())) { $(element).removeAttr(name); continue; }
      if (/^style$/i.test(name) && /url\(\s*["']?(?:https?:)?\/\//i.test(String(value || ''))) $(element).removeAttr(name);
    }
  });
  $('style').each((_, element) => {
    if (/url\(\s*["']?(?:https?:)?\/\//i.test($(element).text())) $(element).remove();
  });
  return $.xml();
}

export function extensionForContentType(contentType = '') {
  const type = String(contentType).split(';')[0].trim().toLowerCase();
  return {
    'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif',
    'image/svg+xml': '.svg', 'image/avif': '.avif'
  }[type] || '';
}
