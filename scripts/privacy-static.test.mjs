import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function collectJs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collectJs(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
  }
  return files;
}

function fail(message) {
  throw new Error(`[privacy-static] ${message}`);
}

const clientFiles = await collectJs(path.join(root, 'src', 'assets'));
const forbiddenStoragePatterns = [
  [/\blocalStorage\b/, 'localStorage'],
  [/\bsessionStorage\b/, 'sessionStorage'],
  [/\bindexedDB\b/, 'IndexedDB'],
  [/document\.cookie\b/, 'document.cookie'],
  [/navigator\.serviceWorker\b/, 'Service Worker'],
  [/\bCacheStorage\b|\bcaches\.(?:open|match|keys|delete)\b/, 'Cache Storage']
];
const forbiddenNetworkPatterns = [
  [/fetch\s*\(\s*['"`]https?:\/\//i, 'external fetch'],
  [/\.open\s*\(\s*['"`](?:GET|POST|PUT|PATCH|DELETE|HEAD)['"`]\s*,\s*['"`]https?:\/\//i, 'external XMLHttpRequest'],
  [/new\s+WebSocket\s*\(\s*['"`]wss?:\/\//i, 'external WebSocket'],
  [/new\s+EventSource\s*\(\s*['"`]https?:\/\//i, 'external EventSource'],
  [/sendBeacon\s*\(\s*['"`]https?:\/\//i, 'external sendBeacon']
];

for (const file of clientFiles) {
  const source = await readFile(file, 'utf8');
  for (const [pattern, label] of forbiddenStoragePatterns) {
    if (pattern.test(source)) fail(`${label} found in browser code: ${path.relative(root, file)}`);
  }
  for (const [pattern, label] of forbiddenNetworkPatterns) {
    if (pattern.test(source)) fail(`${label} found in browser code: ${path.relative(root, file)}`);
  }
}

const appSource = await readFile(path.join(root, 'src', 'assets', 'app.js'), 'utf8');
const literalFetches = [...appSource.matchAll(/fetch\s*\(\s*(['"`])([^'"`]+)\1/g)].map((match) => match[2]);
for (const url of literalFetches) {
  if (!url.startsWith('/')) fail(`literal browser fetch is not root-relative: ${url}`);
}

const apache = await readFile(path.join(root, 'docker', 'apache-security.conf'), 'utf8');
if (!/Content-Security-Policy[^\n]*connect-src 'self'/.test(apache)) {
  fail("CSP must restrict connect-src to 'self'.");
}
if (!/Permissions-Policy[^\n]*geolocation=\(self\)/.test(apache)) {
  fail('Permissions-Policy must allow geolocation only for the first-party origin.');
}
if (!/Referrer-Policy "strict-origin-when-cross-origin"/.test(apache)) {
  fail('Expected privacy-preserving Referrer-Policy is missing.');
}

console.log(`[privacy-static] passed (${clientFiles.length} browser JavaScript files checked)`);
