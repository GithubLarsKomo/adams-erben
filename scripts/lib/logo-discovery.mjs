import * as cheerio from 'cheerio';

const POSITIVE = /(?:^|[\s_\-])(logo|brand|branding|wappen|signet|vereinslogo|clublogo|site-logo|custom-logo)(?:$|[\s_\-])/i;
const NEGATIVE = /(sponsor|partner|advert|cookie|social|facebook|instagram|youtube|payment|badge|seal|footer-logo)/i;
const PHOTO_NEGATIVE = /(hero|slider|slide|banner|header[-_ ]?(?:image|photo|bild)|titelbild|theme[-_ ]?image|gallery|galerie|background|bg[-_])/i;
const CMS_ASSET_HOST = /(^|\.)(?:image\.jimcdn\.com|static\.wixstatic\.com|images\.squarespace-cdn\.com|files\.wordpress\.com)$/i;
const GENERIC_NAME_TOKENS = new Set([
  'e', 'v', 'ev', 'der', 'die', 'das', 'und', 'von', 'zu', 'am', 'an', 'im', 'in',
  'ruderclub', 'ruderverein', 'rudergesellschaft', 'ruderriege', 'ruder', 'club', 'verein', 'gesellschaft',
  'landesruderverband', 'ruderverband', 'verband', 'akademische', 'akademischer'
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

function meaningfulTokens(value = '') {
  return normalizeToken(value).split(' ').filter((token) => token.length >= 3 && !GENERIC_NAME_TOKENS.has(token));
}

function organizationTokens(organization) {
  const name = typeof organization === 'string' ? organization : organization?.name || '';
  const cityTokens = new Set(meaningfulTokens(typeof organization === 'string' ? '' : organization?.city || ''));
  return meaningfulTokens(name).filter((token) => !cityTokens.has(token));
}

export function organizationAcronym(name = '') {
  const tokens = normalizeToken(name).split(' ').filter((token) => token.length >= 2 && !/^(?:ev|e|v)$/.test(token));
  const initials = tokens.map((token) => token[0]).join('');
  return initials.length >= 2 && initials.length <= 8 ? initials : '';
}

function tokenCoverage(tokens, text) {
  if (!tokens.length) return 0;
  const normalized = normalizeToken(text);
  const matches = tokens.filter((token) => normalized.includes(token)).length;
  return matches / tokens.length;
}

function acronymMatch(name, text) {
  const acronym = organizationAcronym(name);
  if (!acronym) return false;
  const normalized = normalizeToken(text).replace(/\s+/g, '');
  return normalized.includes(acronym);
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

function elementContext($, element) {
  const parts = [];
  let current = $(element);
  for (let depth = 0; depth < 4 && current.length; depth += 1) {
    const attrs = [current.attr('id'), current.attr('class'), current.attr('alt'), current.attr('title'), current.attr('aria-label')].filter(Boolean);
    parts.push(...attrs);
    current = current.parent();
  }
  return clean(parts.join(' '));
}

export function scoreLogoCandidate(candidate, organization = '') {
  const name = typeof organization === 'string' ? organization : organization?.name || '';
  const urlText = normalizeToken(candidate.url || '');
  const label = clean([candidate.label, candidate.context].filter(Boolean).join(' '));
  const labelNorm = normalizeToken(label);
  let score = Number(candidate.baseScore || 0);

  if (POSITIVE.test(` ${labelNorm.replace(/ /g, '-')} `)) score += 70;
  if (/(logo|wappen|signet|brand)/i.test(urlText)) score += 50;
  if (/(logo|wappen|signet|brand)/i.test(labelNorm)) score += 35;
  if (candidate.inHeader) score += 20;
  if (candidate.kind === 'jsonld') score += 40;
  if (candidate.kind === 'meta') score += 30;
  if (candidate.kind === 'icon') score -= 45;
  if (/\.svg(?:$|\?)/i.test(candidate.url || '')) score += 10;

  const tokens = organizationTokens(organization);
  const matches = tokens.filter((token) => labelNorm.includes(token) || urlText.includes(token)).length;
  score += Math.min(45, matches * 15);
  if (acronymMatch(name, `${labelNorm} ${urlText}`)) score += 25;

  const width = parseDimension(candidate.width);
  const height = parseDimension(candidate.height);
  const largest = Math.max(width, height);
  const smallest = Math.min(width || largest, height || largest);
  if (largest >= 128) score += 15;
  else if (largest > 0 && largest < 40) score -= 40;
  if (largest >= 600 && smallest > 0 && largest / smallest >= 4) score -= 45;

  if (PHOTO_NEGATIVE.test(`${labelNorm} ${urlText}`)) score -= 80;
  if (NEGATIVE.test(`${labelNorm} ${urlText}`)) score -= 100;
  return score;
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
    } catch { /* ignore invalid JSON-LD */ }
  });
  return { names, text: names.join(' | ') };
}

export function scoreEntityConfidence(candidate, organization, pageIdentity) {
  const name = organization?.name || String(organization || '');
  const tokens = organizationTokens(organization);
  const candidateText = `${candidate?.label || ''} ${candidate?.context || ''} ${candidate?.url || ''}`;
  const pageText = pageIdentity?.text || '';
  const pageCoverage = tokenCoverage(tokens, pageText);
  const assetCoverage = tokenCoverage(tokens, candidateText);
  const pageAcronym = acronymMatch(name, pageText);
  const assetAcronym = acronymMatch(name, candidateText);

  let confidence = Math.min(1, pageCoverage * 0.65 + assetCoverage * 0.35);
  if (pageAcronym) confidence += 0.15;
  if (assetAcronym) confidence += 0.2;
  if ((candidate?.kind === 'jsonld' || candidate?.kind === 'meta') && pageCoverage >= 0.5) confidence += 0.15;
  return Math.min(1, Number(confidence.toFixed(3)));
}

export function classifyLogoCandidate(candidate, organization, pageIdentity, { minScore = 70, minEntity = 0.55 } = {}) {
  const entityConfidence = scoreEntityConfidence(candidate, organization, pageIdentity);
  const score = Number(candidate?.score || 0);
  const candidateText = `${candidate?.label || ''} ${candidate?.context || ''} ${candidate?.url || ''}`;
  const tokens = organizationTokens(organization);
  const assetIdentityEvidence = tokenCoverage(tokens, candidateText) > 0 || acronymMatch(organization?.name || String(organization || ''), candidateText);

  if (NEGATIVE.test(normalizeToken(candidateText))) return { disposition: 'reject', reason: 'negative_logo_context', score, entityConfidence };
  if (PHOTO_NEGATIVE.test(normalizeToken(candidateText))) return { disposition: 'reject', reason: 'photo_or_banner_context', score, entityConfidence };
  if (score < minScore) return { disposition: 'reject', reason: 'below_logo_score', score, entityConfidence };
  if (candidate?.kind === 'img' && !assetIdentityEvidence) {
    return { disposition: entityConfidence >= 0.25 ? 'review' : 'reject', reason: 'asset_identity_missing', score, entityConfidence };
  }
  if (entityConfidence >= minEntity) return { disposition: 'accept', reason: 'logo_and_entity_match', score, entityConfidence };
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
  target.push(candidate);
}

function jsonLdObjects(value) {
  if (Array.isArray(value)) return value.flatMap(jsonLdObjects);
  if (!value || typeof value !== 'object') return [];
  const nested = Array.isArray(value['@graph']) ? value['@graph'].flatMap(jsonLdObjects) : [];
  return [value, ...nested];
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
        pushCandidate(candidates, logo, { kind: 'jsonld', baseScore: 90, label: clean(`${item.name || ''} organization logo`) }, pageUrl, baseHref, organization);
      }
    } catch { /* ignore invalid JSON-LD */ }
  });

  $('meta[itemprop="logo"], meta[property="og:logo"], meta[name="logo"]').each((_, element) => {
    pushCandidate(candidates, $(element).attr('content'), {
      kind: 'meta', baseScore: 80,
      label: $(element).attr('property') || $(element).attr('itemprop') || $(element).attr('name') || 'logo'
    }, pageUrl, baseHref, organization);
  });

  $('img').each((_, element) => {
    const current = $(element);
    const raw = current.attr('src') || current.attr('data-src') || current.attr('data-lazy-src') || srcsetUrl(current.attr('srcset'));
    if (!raw) return;
    pushCandidate(candidates, raw, {
      kind: 'img', baseScore: 0,
      label: clean([current.attr('alt'), current.attr('title'), current.attr('aria-label')].filter(Boolean).join(' ')),
      context: elementContext($, element),
      inHeader: current.closest('header, nav, [role="banner"]').length > 0,
      width: current.attr('width'), height: current.attr('height')
    }, pageUrl, baseHref, organization);
  });

  if (includeIcons) {
    $('link[rel~="apple-touch-icon"], link[rel~="icon"]').each((_, element) => {
      pushCandidate(candidates, $(element).attr('href'), { kind: 'icon', baseScore: 15, label: $(element).attr('rel') || 'icon' }, pageUrl, baseHref, organization);
    });
  }

  const deduped = new Map();
  for (const candidate of candidates) {
    const previous = deduped.get(candidate.url);
    if (!previous || candidate.score > previous.score) deduped.set(candidate.url, candidate);
  }
  return [...deduped.values()].sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
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
  $('style').each((_, element) => { if (/url\(\s*["']?(?:https?:)?\/\//i.test($(element).text())) $(element).remove(); });
  return $.xml();
}

export function extensionForContentType(contentType = '') {
  const type = String(contentType).split(';')[0].trim().toLowerCase();
  return { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/avif': '.avif' }[type] || '';
}
