import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/adams-acht/index.html',
  'src/deutschlandachter-1960/index.html',
  'src/karl-adam-trainingsmethoden/index.html',
  'src/karl-adam/index.html',
  'src/ratzeburg/index.html',
  'src/rudern-lernen/index.html',
  'src/rudern-verstehen/index.html',
  'src/ruderverein-finden/index.html',
  'src/ueber-adams-erben/index.html'
];

const legacyPatterns = [
  /\n?\s*<a\s+class="skip-link"[^>]*>[\s\S]*?<\/a>\s*/i,
  /\n?\s*<header\s+class="site-header"[^>]*>[\s\S]*?<\/header>\s*/i,
  /\n?\s*<footer\s+class="(?:site-footer|detail-footer)"[^>]*>[\s\S]*?<\/footer>\s*/i
];

let changed = 0;

for (const relativePath of files) {
  const filePath = path.join(root, relativePath);
  const original = await readFile(filePath, 'utf8');
  let cleaned = original;

  for (const pattern of legacyPatterns) cleaned = cleaned.replace(pattern, '\n');
  cleaned = cleaned.replace(/<body>\s*\n+/i, '<body>\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  if (/class="site-header"|class="(?:site-footer|detail-footer)"|class="skip-link"/i.test(cleaned)) {
    throw new Error(`[source-shell-cleanup] legacy shell fragment survived in ${relativePath}`);
  }

  if (cleaned !== original) {
    await writeFile(filePath, cleaned);
    changed += 1;
    console.log(`[source-shell-cleanup] cleaned ${relativePath}`);
  } else {
    console.log(`[source-shell-cleanup] already clean ${relativePath}`);
  }
}

if (changed !== files.length) {
  console.log(`[source-shell-cleanup] changed ${changed}/${files.length} files`);
} else {
  console.log(`[source-shell-cleanup] removed legacy shell fragments from all ${files.length} SEO sources`);
}
