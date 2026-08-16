import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const previewMode = process.env.PREVIEW_MODE === '1';
const distIndex = path.join(root, 'dist', 'index.html');
const rightsPath = path.join(root, 'legal', 'asset-rights.json');
const mediaRightsPath = path.join(root, 'legal', 'media-rights-register.json');
const dataSourcesPath = path.join(root, 'legal', 'datenquellen.php');
const buildSourcePath = path.join(root, 'scripts', 'build.mjs');
const contactGovernancePath = path.join(root, 'scripts', 'lib', 'contact-governance.mjs');
const publicRecipientsPath = path.join(root, 'dist', 'data', 'recipients.json');
const legalFiles = [
  path.join(root, 'legal', 'impressum.php'),
  path.join(root, 'legal', 'datenschutz.php'),
  path.join(root, 'legal', 'rechtliche-hinweise.php'),
  dataSourcesPath
];

function fail(message) {
  console.error(`::error file=scripts/risk-protection.mjs::${message}`);
  throw new Error(`[risk-protection] ${message}`);
}

function isApprovedRight(entry) {
  return Boolean(entry && entry.status === 'approved' && String(entry.evidence || '').trim() && String(entry.basis || '').trim());
}

if (!previewMode && process.env.DRV_DATA_USAGE_APPROVED !== '1') {
  fail('Production build blocked: DRV_DATA_USAGE_APPROVED=1 is required after documented rights/data-use clearance.');
}

const rights = JSON.parse(await readFile(rightsPath, 'utf8'));
const mediaRights = JSON.parse(await readFile(mediaRightsPath, 'utf8'));
const buildSource = await readFile(buildSourcePath, 'utf8');
const contactGovernanceSource = await readFile(contactGovernancePath, 'utf8');
const html = await readFile(distIndex, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

// Privacy invariant: there must be no remote fallback mechanism in source or output.
if (/onerror\s*=/i.test(buildSource) || /\bfallback\s*:\s*['"]https?:\/\//i.test(buildSource)) {
  fail('Build source contains a remote runtime fallback mechanism.');
}
if (/onerror\s*=/i.test(html)) {
  fail('Generated HTML contains an onerror handler; runtime fallbacks are forbidden.');
}

const externalRuntimeAssets = [];
const runtimeAttributes = ['src', 'srcset', 'poster', 'data'];
for (const attr of runtimeAttributes) {
  $(`[${attr}]`).each((_, element) => {
    const value = String($(element).attr(attr) || '').trim();
    if (/^https?:\/\//i.test(value)) externalRuntimeAssets.push(`${element.tagName}[${attr}=${value}]`);
  });
}

// Only link relations that cause the browser to fetch a resource are runtime assets.
// Canonical/alternate metadata may and should use absolute public URLs without creating a request.
$('link[rel="stylesheet"][href],link[rel="preload"][href],link[rel="modulepreload"][href],link[rel="icon"][href],link[rel="apple-touch-icon"][href],script[src],source[src],track[src]').each((_, element) => {
  const attr = element.tagName === 'link' ? 'href' : 'src';
  const value = String($(element).attr(attr) || '').trim();
  if (/^https?:\/\//i.test(value)) externalRuntimeAssets.push(`${element.tagName}[${attr}=${value}]`);
});
$('style').each((_, element) => {
  const css = String($(element).html() || '');
  if (/url\(\s*['"]?https?:\/\//i.test(css)) externalRuntimeAssets.push('style[url(http...)]');
});
if (externalRuntimeAssets.length) {
  fail(`External runtime assets are forbidden: ${externalRuntimeAssets.join(', ')}`);
}

// Approved third-party logos must exist locally and have documented rights.
for (const [key, entry] of Object.entries(rights.assets || {})) {
  if (!entry?.path) continue;
  const images = $(`img[src="${entry.path}"]`);
  if (!images.length) continue;
  if (!isApprovedRight(entry)) {
    fail(`Third-party asset ${key} is rendered without documented approval.`);
  }
}

// Other visual media: production must not render assets still marked review-required.
if (!previewMode) {
  for (const [assetPath, entry] of Object.entries(mediaRights.assets || {})) {
    const rendered = $(`img[src="${assetPath}"]`).length > 0 || $(`[poster="${assetPath}"]`).length > 0;
    if (rendered && entry?.status === 'review-required') {
      fail(`Production blocked: rendered media asset still requires rights review: ${assetPath}`);
    }
  }
}

if (/https?:\/\/(?:d2cx26qpfwuhvu\.cloudfront\.net|www\.rudern\.de\/sites\/default\/files|cdn\.podcastcms\.de)\//i.test(html)) {
  fail('Generated HTML contains a forbidden third-party logo host.');
}

// Personal contacts must never become automatically eligible.
if (!contactGovernanceSource.includes("governanceState === 'auto-approved-functional'")) {
  fail('Contact governance no longer limits automatic approval to functional contacts.');
}
if (/autoApproved\s*:\s*true[\s\S]{0,180}personal/i.test(contactGovernanceSource)) {
  fail('Contact governance appears to auto-approve a personal contact path.');
}

// Private routing data must never be copied into the browser-visible data tree.
try {
  await access(publicRecipientsPath);
  fail('Private recipients.json is present below dist/data and would be publicly accessible.');
} catch (error) {
  if (error?.message?.startsWith('[risk-protection]')) throw error;
}

const legalText = (await Promise.all(legalFiles.map((file) => readFile(file, 'utf8')))).join('\n');
const requiredPrivacyPhrases = [
  'Art. 6 Abs. 1 lit. f DSGVO',
  '24 Stunden',
  'Hashwert',
  'Widerruf',
  'eigener datenschutzrechtlicher Verantwortung',
  'SMTP'
];
for (const phrase of requiredPrivacyPhrases) {
  if (!legalText.includes(phrase)) fail(`Legal texts missing required disclosure phrase: ${phrase}`);
}

const forbiddenRoutingPhrases = [
  'falls dort kein geeigneter freigegebener Kontakt verfügbar ist',
  'an den zuständigen Landesruderverband bzw. den DRV',
  'Fallback-Routing an einen Landesruderverband oder den Deutschen Ruderverband'
];
const legalNotice = await readFile(path.join(root, 'legal', 'rechtliche-hinweise.php'), 'utf8');
for (const phrase of forbiddenRoutingPhrases) {
  if (legalNotice.includes(phrase)) fail(`Contradictory contact-routing text remains: ${phrase}`);
}
if (!legalNotice.includes('kein automatisches Fallback')) {
  fail('Legal notice must explicitly state that there is no automatic association fallback.');
}

const outputText = $.text();
if (!outputText.includes('GeoNames') || !outputText.includes('CC BY 4.0')) {
  fail('Visible GeoNames / CC BY 4.0 attribution is missing from generated page.');
}
if (!$('footer.site-footer a[href="/datenquellen.php"]').length) {
  fail('Generated footer must link to the public data sources and licenses page.');
}

const dataSources = await readFile(dataSourcesPath, 'utf8');
for (const phrase of ['Datenquellen und Lizenzen', 'GeoNames', 'CC BY 4.0', 'kein offizielles Angebot des Deutschen Ruderverbands']) {
  if (!dataSources.includes(phrase)) fail(`Data sources page missing required transparency phrase: ${phrase}`);
}

console.log(`[risk-protection] checks passed (${previewMode ? 'preview' : 'production'} mode)`);
