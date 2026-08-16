import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const indexPath = path.join(process.cwd(), 'dist', 'index.html');
const html = await readFile(indexPath, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });
const legalNav = $('footer.site-footer nav[aria-label="Rechtliches"]').first();

if (!legalNav.length) {
  throw new Error('[postbuild-legal-links] legal footer navigation not found');
}

if (!legalNav.find('a[href="/datenquellen.php"]').length) {
  const externalDrvLink = legalNav.find('a[href^="https://www.rudern.de/"]').first();
  const link = '<a href="/datenquellen.php">Datenquellen &amp; Lizenzen</a>';
  if (externalDrvLink.length) externalDrvLink.before(link);
  else legalNav.append(link);
}

await writeFile(indexPath, $.html());
console.log('[postbuild-legal-links] data sources link present');
