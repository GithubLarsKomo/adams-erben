import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { pages } from './seo-pages.mjs';
import { applySiteShell } from './lib/site-shell.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const partials = path.join(root, 'src', 'partials');

const headerTemplate = await readFile(path.join(partials, 'site-header.html'), 'utf8');
const footerTemplate = await readFile(path.join(partials, 'site-footer.html'), 'utf8');

for (const page of pages) {
  const filePath = path.join(dist, page.file);
  const html = await readFile(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  applySiteShell($, {
    variant: page.shellVariant,
    currentPath: page.path,
    headerTemplate,
    footerTemplate
  });
  await writeFile(filePath, $.html());
}

console.log(`[site-shell] applied shared shell to ${pages.length} product pages`);
