import * as cheerio from 'cheerio';

const POSITIVE = /(?:^|[\s_\-])(logo|brand|branding|wappen|signet|vereinslogo|clublogo|site-logo|custom-logo)(?:$|[\s_\-])/i;
const NEGATIVE = /(sponsor|partner|advert|banner|cookie|social|facebook|instagram|youtube|payment|badge|seal|footer-logo)/i;
const GENERIC_NAME_TOKENS = new Set([
  'e', 'v', 'ev', 'e.v', 'der', 'die', 'das', 'und', 'von', 'zu', 'am', 'an',
  'ruderclub', 'ruderverein', 'rudergesellschaft', 'ruder', 'club', 'verein', 'gesellschaft',
  'landesruderverband', 'ruderverband', 'verband'
]);

function clean(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function normalizeToken(value = '') {
  return clean(value)
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function organizationTokens(name = '') {
  return normalizeToken(name)
    .split(' ')
    .filter((token) => token.length >= 3 && !GENERIC_NAME_TOKENS.has(token));
}

function parseDimension(value) {
  const match = String(value || '').match(/^\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function srcsetUrl(value = '') {
  const candidates = String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.split(/\s+/)[0])
    .filter(Boolean);
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

function elementContext($, element) {
  const parts = [];
  let current = $(element);
  for (let depth = 0; depth < 4 && current.length; depth += 1) {
    const attrs = [
      current.attr('id'),
      current.attr('class'),
      current.attr('alt'),
      current.attr('title'),
      current.attr('aria-label')
    ].filter(Boolean);
    parts.push(...attrs);
    current = current.parent();
  }
  return clean(parts.join(' '));
}

export function scoreLogoCandidate(candidate, organizationName = '') {
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

  const tokens = organizationTokens(organizationName);
  const matches = tokens.filter((token) => labelNorm.includes(token) || urlText.includes(token)).length;
  score += Math.min(45, matches * 15);

  const width = parseDimension(candidate.width);
  const height = parseDimension(candidate.height);
  const largest = Math.max(width, height);
  if (largest >= 128) score += 15;
  else if (largest > 0 && largest < 40) score -= 40;

  if (NEGATIVE.test(`${labelNorm} ${urlText}`)) score -= 100;
  return score;
}

function pushCandidate(target, raw, details, pageUrl, baseHref, organizationName) {
  const url = resolveCandidateUrl(raw, pageUrl, baseHref);
  if (!url) return;
  const candidate = { ...details, url };
  candidate.score = scoreLogoCandidate(candidate, organizationName);
  target.push(candidate);
}

function jsonLdObjects(value) {
  if (Array.isArray(value)) return value.flatMap(jsonLdObjects);
  if (!value || typeof value !== 'object') return [];
  const nested = Array.isArray(value['@graph']) ? value['@graph'].flatMap(jsonLdObjects) : [];
  return [value, ...nested];
}

export function extractLogoCandidates(html, pageUrl, organizationName = '', { includeIcons = false } = {}) {
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
        pushCandidate(candidates, logo, { kind: 'jsonld', baseScore: 90, label: 'organization logo' }, pageUrl, baseHref, organizationName);
      }
    } catch {
      // Invalid JSON-LD must not abort discovery.
    }
  });

  $('meta[itemprop="logo"], meta[property="og:logo"], meta[name="logo"]').each((_, element) => {
    pushCandidate(candidates, $(element).attr('content'), {
      kind: 'meta',
      baseScore: 80,
      label: $(element).attr('property') || $(element).attr('itemprop') || $(element).attr('name') || 'logo'
    }, pageUrl, baseHref, organizationName);
  });

  $('img').each((_, element) => {
    const current = $(element);
    const raw = current.attr('src') || current.attr('data-src') || current.attr('data-lazy-src') || srcsetUrl(current.attr('srcset'));
    if (!raw) return;
    const context = elementContext($, element);
    const inHeader = current.closest('header, nav, [role="banner"]').length > 0;
    pushCandidate(candidates, raw, {
      kind: 'img',
      baseScore: 0,
      label: clean([current.attr('alt'), current.attr('title'), current.attr('aria-label')].filter(Boolean).join(' ')),
      context,
      inHeader,
      width: current.attr('width'),
      height: current.attr('height')
    }, pageUrl, baseHref, organizationName);
  });

  if (includeIcons) {
    $('link[rel~="apple-touch-icon"], link[rel~="icon"]').each((_, element) => {
      pushCandidate(candidates, $(element).attr('href'), {
        kind: 'icon',
        baseScore: 15,
        label: $(element).attr('rel') || 'icon'
      }, pageUrl, baseHref, organizationName);
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
      if (/^on/i.test(name)) {
        $(element).removeAttr(name);
        continue;
      }
      if (/^(?:href|xlink:href)$/i.test(name) && /^(?:https?:)?\/\//i.test(String(value || '').trim())) {
        $(element).removeAttr(name);
        continue;
      }
      if (/^style$/i.test(name) && /url\(\s*["']?(?:https?:)?\/\//i.test(String(value || ''))) {
        $(element).removeAttr(name);
      }
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
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/avif': '.avif'
  }[type] || '';
}
