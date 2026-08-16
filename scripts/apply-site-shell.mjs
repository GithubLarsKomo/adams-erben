import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { applySiteShell } from './lib/site-shell.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const partials = path.join(root, 'src', 'partials');

const headerTemplate = await readFile(path.join(partials, 'site-header.html'), 'utf8');
const footerTemplate = await readFile(path.join(partials, 'site-footer.html'), 'utf8');

const targets = [
  { file: 'index.html', variant: 'landing' },
  { file: path.join('rudern', 'index.html'), variant: 'rowing' }
];

for (const target of targets) {
  const filePath = path.join(dist, target.file);
  const html = await readFile(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  applySiteShell($, {
    variant: target.variant,
    headerTemplate,
    footerTemplate
  });
  await writeFile(filePath, $.html());
}

console.log(`[site-shell] applied shared shell to ${targets.length} audience pages`);
