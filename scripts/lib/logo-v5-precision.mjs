import { normalizeToken, organizationAliases } from './logo-discovery.mjs';

const FUNCTION_WORDS = new Set([
  'fur', 'des', 'dem', 'den', 'zur', 'zum', 'bei', 'aus', 'auf', 'mit', 'ohne', 'gegen', 'uber', 'unter'
]);

const GENERIC_ORG_WORDS = new Set([
  'e', 'v', 'ev', 'der', 'die', 'das', 'und', 'von', 'zu', 'am', 'an', 'im', 'in',
  'ruder', 'rudern', 'ruderclub', 'ruderverein', 'rudergesellschaft', 'rudergemeinschaft',
  'ruderriege', 'ruderklub', 'club', 'verein', 'gesellschaft', 'verband', 'ruderverband',
  'landesruderverband', 'abt', 'abteilung', 'sport', 'sportverein'
]);

const COMMERCE = /\b(?:teamshop|webshop|fanshop|fan shop|merchandise|merch|shop)\b/i;
const MARK_SEMANTICS = /\b(?:logo|wappen|flagge|signet|vereinslogo|clublogo)\b/i;
const SITE_IDENTITY = /\b(?:brand logo|custom logo|site logo|header logo|navbar brand|logo image|logo link|seitenlogo)\b/i;

const FOREIGN_IDENTITIES = [
  { key: 'drv', pattern: /\b(?:deutscher ruderverband|drv)\b/i, target: /\bdeutscher ruderverband\b/i },
  { key: 'lsb', pattern: /\b(?:landessportbund|lsb)\b/i, target: /\blandessportbund\b/i },
  { key: 'ksb', pattern: /\b(?:kreissportbund|ksb)\b/i, target: /\bkreissportbund\b/i }
];

function nameOf(organization) {
  return typeof organization === 'string' ? organization : organization?.name || '';
}

function cityOf(organization) {
  return typeof organization === 'string' ? '' : organization?.city || '';
}

function words(value = '') {
  return normalizeToken(value).split(' ').filter(Boolean);
}

function pathText(rawUrl = '') {
  try {
    const url = new URL(rawUrl);
    return normalizeToken(`${decodeURIComponent(url.pathname)} ${decodeURIComponent(url.search)}`);
  } catch {
    return normalizeToken(rawUrl);
  }
}

function sourceText(candidate, selectedUrl = '') {
  return normalizeToken(`${candidate?.label || ''} ${pathText(selectedUrl || candidate?.url || '')}`);
}

function fullText(candidate, selectedUrl = '') {
  return normalizeToken(`${candidate?.label || ''} ${candidate?.context || ''} ${candidate?.directContext || ''} ${pathText(selectedUrl || candidate?.url || '')}`);
}

function meaningfulTargetTokens(organization) {
  const city = new Set(words(cityOf(organization)));
  return words(nameOf(organization)).filter((token) =>
    token.length >= 3
    && !/^(?:18|19|20)\d{2}$/.test(token)
    && !FUNCTION_WORDS.has(token)
    && !GENERIC_ORG_WORDS.has(token)
    && !city.has(token)
  );
}

function compact(value = '') {
  return normalizeToken(value).replace(/\s+/g, '');
}

export function safeAliasMatch(organization, text = '') {
  const normalized = normalizeToken(text);
  const tokenSet = new Set(normalized.split(' ').filter(Boolean));
  const compactText = normalized.replace(/\s+/g, '');
  return organizationAliases(organization).some((alias) => {
    if (/^[a-z0-9]+$/.test(alias) && alias.length <= 8) return tokenSet.has(alias);
    return alias.length > 8 && compactText.includes(alias);
  });
}

function targetCoverage(organization, text = '') {
  const target = meaningfulTargetTokens(organization);
  if (!target.length) return 0;
  const source = new Set(words(text));
  return target.filter((token) => source.has(token)).length / target.length;
}

function exactTargetName(organization, text = '') {
  const target = compact(nameOf(organization).replace(/\be\.?\s*v\.?\b/gi, ''));
  return target.length >= 5 && compact(text).includes(target);
}

function embeddedShortAlias(organization, text = '') {
  const tokens = words(text);
  const aliases = organizationAliases(organization).filter((alias) => /^[a-z0-9]+$/.test(alias) && alias.length >= 2 && alias.length <= 4);
  if (aliases.some((alias) => tokens.includes(alias))) return false;
  return aliases.some((alias) => tokens.some((token) => token.length > alias.length && token.length <= 6 && token.includes(alias)));
}

function hasForeignIdentity(candidate, organization, selectedUrl = '') {
  const text = sourceText(candidate, selectedUrl);
  const target = normalizeToken(nameOf(organization));
  return FOREIGN_IDENTITIES.some(({ pattern, target: targetPattern }) => pattern.test(text) && !targetPattern.test(target));
}

function weakFunctionWordIdentity(candidate, organization, selectedUrl = '') {
  const orgWords = words(nameOf(organization));
  const relevantFunctionWords = orgWords.filter((token) => FUNCTION_WORDS.has(token));
  if (!relevantFunctionWords.length) return false;
  const source = sourceText(candidate, selectedUrl);
  const sourceWords = new Set(words(source));
  if (!relevantFunctionWords.some((token) => sourceWords.has(token))) return false;
  return targetCoverage(organization, source) === 0
    && !safeAliasMatch(organization, source)
    && !exactTargetName(organization, source);
}

function weakAffiliationFooter(candidate, organization, selectedUrl = '') {
  const text = fullText(candidate, selectedUrl);
  if (!/\bfooter\b/.test(text)) return false;
  const source = sourceText(candidate, selectedUrl);
  return targetCoverage(organization, source) < 0.5
    && !safeAliasMatch(organization, source)
    && !exactTargetName(organization, source);
}

function rasterBrandingNeedsReview(candidate, selectedUrl = '') {
  if (candidate?.kind !== 'img') return false;
  const pathname = pathText(selectedUrl || candidate?.url || '');
  if (!/\b(?:jpg|jpeg)\b/.test(pathname)) return false;
  const full = fullText(candidate, selectedUrl);
  if (!SITE_IDENTITY.test(full)) return false;
  const labelAndPath = normalizeToken(`${candidate?.label || ''} ${pathname}`);
  return !MARK_SEMANTICS.test(labelAndPath);
}

export function evaluateV5Precision(candidate, organization, { selectedUrl = '' } = {}) {
  const source = sourceText(candidate, selectedUrl);
  const full = fullText(candidate, selectedUrl);

  // V5.1: short aliases must match token boundaries; e.g. RV must not match inside DRV.
  if (embeddedShortAlias(organization, source)
      && targetCoverage(organization, source) === 0
      && !exactTargetName(organization, source)) {
    return { allow: false, disposition: 'reject', reason: 'v5_alias_boundary_conflict', rule: 'alias-boundary' };
  }

  // V5.2: grammatical words such as "für" cannot establish candidate identity on their own.
  if (weakFunctionWordIdentity(candidate, organization, selectedUrl)) {
    return { allow: false, disposition: 'reject', reason: 'v5_function_word_only_identity', rule: 'function-word-evidence' };
  }

  // V5.3: merchandising/sub-brand assets and weak footer affiliations are not canonical organization logos.
  if (COMMERCE.test(full)) {
    return { allow: false, disposition: 'reject', reason: 'v5_commerce_or_teamshop', rule: 'commerce-subbrand' };
  }
  if (weakAffiliationFooter(candidate, organization, selectedUrl)) {
    return { allow: false, disposition: 'reject', reason: 'v5_weak_footer_affiliation', rule: 'commerce-subbrand' };
  }

  // V5.4: an explicit foreign umbrella identity outweighs same-page/path identity.
  if (hasForeignIdentity(candidate, organization, selectedUrl)) {
    return { allow: false, disposition: 'reject', reason: 'v5_foreign_organization_identity', rule: 'identity-conflict' };
  }

  // V5.5: JPEG/JPEG site-brand assets without logo semantics remain review-only because DOM classes can label photos as brand logos.
  if (rasterBrandingNeedsReview(candidate, selectedUrl)) {
    return { allow: false, disposition: 'review', reason: 'v5_raster_branding_requires_review', rule: 'raster-photo-protection' };
  }

  return { allow: true, disposition: candidate?.disposition || 'accept', reason: '', rule: '' };
}
