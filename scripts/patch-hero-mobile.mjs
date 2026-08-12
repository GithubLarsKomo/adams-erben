import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const indexPath = path.join(root, 'dist', 'index.html');

let html = await readFile(indexPath, 'utf8');

const heroPattern = /<div class="hero-art" aria-hidden="true">\s*<svg[\s\S]*?<\/svg>\s*<\/div>/;
const heroReplacement = `      <figure class="hero-art hero-art-photo" aria-hidden="true">
        <img class="boat hero-skiff" src="/assets/images/hero-skiff.png" alt="" width="1200" height="675" decoding="async" fetchpriority="high">
      </figure>`;

if (!heroPattern.test(html)) {
  throw new Error('[patch-hero-mobile] hero-art SVG block not found; refusing to build an unpatched hero.');
}

html = html.replace(heroPattern, heroReplacement);

const mobileFixLink = '  <link rel="stylesheet" href="/assets/mobile-fixes.css">';
if (!html.includes(mobileFixLink)) {
  html = html.replace('</head>', `${mobileFixLink}\n</head>`);
}

await writeFile(indexPath, html);
console.log('[patch-hero-mobile] hero image and mobile layout fixes applied');
