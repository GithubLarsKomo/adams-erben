import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const roots = ['src', 'scripts', 'legal'];
// Scan executable/renderable source. JSON under src/data is provenance/content metadata and may
// legitimately record third-party source URLs; generated HTML is checked separately after build.
const textExtensions = new Set(['.css', '.html', '.js', '.mjs', '.php', '.svg', '.xml']);
const forbiddenHosts = [
  'd2cx26qpfwuhvu' + '.cloudfront.net',
  'cdn' + '.podcastcms.de',
  'rudern.de/sites/default/' + 'files'
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function lineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

const failures = [];
for (const relativeRoot of roots) {
  for (const file of await walk(path.join(root, relativeRoot))) {
    const source = await readFile(file, 'utf8');
    const relative = path.relative(root, file).replaceAll('\\', '/');
    const handler = /onerror\s*=/i.exec(source);
    if (handler) failures.push({ file: relative, line: lineNumber(source, handler.index), reason: 'runtime onerror handler' });
    const lower = source.toLowerCase();
    for (const host of forbiddenHosts) {
      const index = lower.indexOf(host.toLowerCase());
      if (index >= 0) failures.push({ file: relative, line: lineNumber(source, index), reason: `known third-party runtime asset host: ${host}` });
    }
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`::error file=${failure.file},line=${failure.line}::Forbidden runtime fallback source: ${failure.reason}`);
  }
  throw new Error(`[privacy-source] ${failures.length} forbidden runtime fallback source occurrence(s) found`);
}

console.log('[privacy-source] no remote runtime fallbacks found');
