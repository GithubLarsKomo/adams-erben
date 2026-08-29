import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const dist = path.join(root, 'dist');
const indexPath = path.join(dist, 'index.html');
const rowingDir = path.join(dist, 'rudern');
const sitemapPath = path.join(dist, 'sitemap.xml');

const html = await readFile(indexPath, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

// Temporary publication profile: keep the complete landing page, but do not
// expose or advertise the unfinished historical/factual depth page.
$('#mehr-entdecken').remove();

$('a[href]').each((_, element) => {
  const link = $(element);
  const href = link.attr('href') || '';
  if (/^\/rudern(?:\/|#|$)/.test(href)) link.remove();
});

const remainingDepthLinks = $('a[href]').filter((_, element) => {
  const href = $(element).attr('href') || '';
  return /^\/rudern(?:\/|#|$)/.test(href);
});

if ($('#mehr-entdecken').length) {
  throw new Error('[simple] depth teaser survived publication reduction');
}
if (remainingDepthLinks.length) {
  throw new Error(`[simple] ${remainingDepthLinks.length} depth link(s) survived publication reduction`);
}
if (!$('main').length || !$('#quick-finder').length || !$('#rudern-verstehen').length || !$('#vereine').length) {
  throw new Error('[simple] landing-page core sections are missing after publication reduction');
}

await writeFile(indexPath, $.html());
await rm(rowingDir, { recursive: true, force: true });
await writeFile(
  sitemapPath,
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://adams-erben.de/</loc>\n  </url>\n</urlset>\n'
);

console.log('[simple] publication build reduced to landing page; /rudern/ and all depth links removed');
