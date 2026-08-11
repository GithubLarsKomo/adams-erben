import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const privateDir = path.join(root, 'build-private');
const previewMode = process.env.PREVIEW_MODE === '1';

await rm(dist, { recursive: true, force: true });
await rm(privateDir, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await mkdir(privateDir, { recursive: true });
await cp(src, dist, { recursive: true });

const indexPath = path.join(dist, 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');
const rowingExplainerPath = path.join(src, 'partials', 'rowing-explainer.html');
const rowingExplainerHtml = await readFile(rowingExplainerPath, 'utf8');
const previewStyles = previewMode ? '  <link rel="stylesheet" href="/assets/preview.css">\n' : '';
const previewRobots = previewMode ? '  <meta name="robots" content="noindex,nofollow">\n' : '';
const rowingStyles = '  <link rel="stylesheet" href="/assets/rowing-explainer.css">\n  <link rel="stylesheet" href="/assets/storyboard-overrides.css">\n';
const canonicalUrl = previewMode ? 'https://preview.adams-erben.de/' : 'https://adams-erben.de/';
const legalFooterLink = '<a href="/datenschutz.php">Datenschutz</a><a href="/rechtliche-hinweise.php">Rechtliche Hinweise</a>';
const voicesAnchor = '    <section class="voices" id="stimmen" aria-labelledby="voices-title">';
const trainingNote = '<div class="training-note" aria-label="Historische Trainingsnotiz als gestalterische Illustration"><strong>7:00 Uhr · Turnhalle</strong><span>Scheibenhantel</span><span>Medizinball</span><span>Beinstreckkraft</span></div>';
const trainingImage = '<figure class="lab-image-frame lab-image-frame-training"><img src="/assets/images/tafelbild.png" alt="Tafelbild zum Winter- und Krafttraining im Rudern"></figure>';
const oarDiagram = `          <div class="oar-diagram" aria-label="Schematische Darstellung von Innenhebel, Dolle und Außenhebel eines Riemens">
            <span class="oar-handle">Griff</span><span class="oar-line oar-line-in"></span><span class="oar-gate">Dolle</span><span class="oar-line oar-line-out"></span><span class="oar-blade">Blatt</span>
            <small class="oar-label oar-label-in">Innenhebel</small><small class="oar-label oar-label-out">Außenhebel</small>
          </div>`;
const oarImage = '          <figure class="lab-image-frame lab-image-frame-oars"><img src="/assets/images/oars-over-time.png" alt="Entwicklung und Veränderung von Riemen und Ruderblättern im Zeitverlauf"></figure>';
const redundantOutroLink = '    <a class="text-link" href="#stimmen">Weiter zu Adams Erben heute ↓</a>\n';
const builtIndexHtml = indexHtml
  .replaceAll('__APP_MODE__', previewMode ? 'preview' : 'production')
  .replaceAll('https://adams-erben.de/', canonicalUrl)
  .replace('<a href="#stimmen">Stimmen</a>', '<a href="#rudern-verstehen">Rudern verstehen</a><a href="#stimmen">Stimmen</a>')
  .replace(voicesAnchor, `${rowingExplainerHtml.replace(redundantOutroLink, '')}\n\n${voicesAnchor}`)
  .replace(trainingNote, trainingImage)
  .replace(oarDiagram, oarImage)
  .replace('<a href="/datenschutz.php">Datenschutz</a>', legalFooterLink)
  .replace('</head>', `${rowingStyles}${previewStyles}${previewRobots}</head>`);
await writeFile(indexPath, builtIndexHtml);

const seedPath = path.join(dist, 'data', 'clubs.seed.json');
const publicPath = path.join(dist, 'data', 'clubs.json');

function runNodeScript(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: root,
      env: process.env,
      stdio: 'inherit'
    });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${script} exited with ${code}`)));
    child.on('error', reject);
  });
}

async function runSync() {
  await runNodeScript('scripts/sync-drv.mjs');
  await runNodeScript('scripts/validate-drv-output.mjs');
}

try {
  if (process.env.SKIP_DRV_SYNC === '1') throw new Error('DRV sync explicitly skipped');
  await runSync();
} catch (error) {
  if (process.env.REQUIRE_DRV_SYNC === '1') throw error;
  console.warn(`[build] ${error.message}; using checked-in seed data.`);
  const seed = await readFile(seedPath, 'utf8');
  await writeFile(publicPath, seed);
  const fallbackReason = process.env.SKIP_DRV_SYNC === '1'
    ? 'DRV sync explicitly skipped'
    : error.message;
  await writeFile(
    path.join(privateDir, 'recipients.json'),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      source: previewMode ? 'preview-seed-fallback' : 'seed-fallback',
      preview: previewMode,
      routingMode: 'drv-only-fallback',
      fallbackReason,
      recipientCount: 0,
      warning: 'No club/LRV recipient routes are present in this fallback file. Run the real DRV sync to generate full server-side routing.',
      recipients: {},
      drv: {
        name: 'Deutscher Ruderverband e.V.',
        email: process.env.DRV_FALLBACK_EMAIL || 'info@rudern.de'
      }
    }, null, 2)
  );
  console.warn('[build] recipients.json is DRV-only fallback; full club/LRV routing requires a successful real DRV sync.');
}

await rm(seedPath, { force: true });
console.log(`[build] dist ready (${previewMode ? 'preview' : 'production'} mode)`);