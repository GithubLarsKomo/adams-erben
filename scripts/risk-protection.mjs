import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const previewMode = process.env.PREVIEW_MODE === '1';
const distIndex = path.join(root, 'dist', 'index.html');
const rightsPath = path.join(root, 'legal', 'asset-rights.json');
const legalFiles = [
  path.join(root, 'legal', 'impressum.php'),
  path.join(root, 'legal', 'datenschutz.php'),
  path.join(root, 'legal', 'rechtliche-hinweise.php')
];

function fail(message) {
  throw new Error(`[risk-protection] ${message}`);
}

function isApprovedRight(entry) {
  return Boolean(entry && entry.status === 'approved' && String(entry.evidence || '').trim() && String(entry.basis || '').trim());
}

if (!previewMode && process.env.DRV_DATA_USAGE_APPROVED !== '1') {
  fail('Production build blocked: DRV_DATA_USAGE_APPROVED=1 is required after documented rights/data-use clearance.');
}

const rights = JSON.parse(await readFile(rightsPath, 'utf8'));
const html = await readFile(distIndex, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

// No runtime hotlink fallbacks: remove every inline error fallback and reject external runtime assets.
$('[onerror]').removeAttr('onerror');

const externalRuntimeAssets = [];
for (const attr of ['src', 'srcset']) {
  $(`[${attr}]`).each((_, element) => {
    const value = String($(element).attr(attr) || '').trim();
    if (/^https?:\/\//i.test(value)) externalRuntimeAssets.push(`${element.tagName}[${attr}=${value}]`);
  });
}
$('link[rel="stylesheet"][href],script[src]').each((_, element) => {
  const attr = element.tagName === 'link' ? 'href' : 'src';
  const value = String($(element).attr(attr) || '').trim();
  if (/^https?:\/\//i.test(value)) externalRuntimeAssets.push(`${element.tagName}[${attr}=${value}]`);
});
if (externalRuntimeAssets.length) {
  fail(`External runtime assets are forbidden: ${externalRuntimeAssets.join(', ')}`);
}

// Third-party logos are shown only with documented approval. Pending assets become neutral text marks.
const textLabels = {
  'world-rowing': 'World Rowing',
  drv: 'Deutscher Ruderverband',
  schubschlag: 'Schubschlag'
};
for (const [key, entry] of Object.entries(rights.assets || {})) {
  if (!entry?.path) continue;
  const images = $(`img[src="${entry.path}"]`);
  if (!images.length) continue;
  if (isApprovedRight(entry)) continue;

  images.each((_, image) => {
    const $image = $(image);
    const label = textLabels[key] || $image.attr('alt') || entry.owner || 'Externe Quelle';
    $image.replaceWith(`<strong class="brand-textmark" data-rights-status="pending">${label}</strong>`);
  });
}

const output = $.html();
if (/onerror\s*=/i.test(output)) fail('Generated HTML still contains onerror handlers.');
if (/https?:\/\/(?:d2cx26qpfwuhvu\.cloudfront\.net|www\.rudern\.de\/sites\/default\/files|cdn\.podcastcms\.de)\//i.test(output)) {
  fail('Generated HTML still contains a forbidden third-party logo fallback URL.');
}
await writeFile(distIndex, output);

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

console.log(`[risk-protection] checks passed (${previewMode ? 'preview' : 'production'} mode)`);
