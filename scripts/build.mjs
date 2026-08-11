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
const previewStyles = previewMode ? '  <link rel="stylesheet" href="/assets/preview.css">\n' : '';
const previewRobots = previewMode ? '  <meta name="robots" content="noindex,nofollow">\n' : '';
const canonicalUrl = previewMode ? 'https://preview.adams-erben.de/' : 'https://adams-erben.de/';
const legalFooterLink = '<a href="/datenschutz.php">Datenschutz</a><a href="/rechtliche-hinweise.php">Rechtliche Hinweise</a>';
const builtIndexHtml = indexHtml
  .replaceAll('__APP_MODE__', previewMode ? 'preview' : 'production')
  .replaceAll('https://adams-erben.de/', canonicalUrl)
  .replace('<script src="/assets/app.js" defer></script>', '<script type="module" src="/assets/app.js"></script>')
  .replace(
    'Adams Erben bringt deine Anfrage zum passenden Verein oder – falls nötig – zur zuständigen Verbandsstelle.',
    'Wenn der Verein eine öffentliche E-Mail-Adresse bereitstellt, kannst du direkt anfragen. Andernfalls führt Adams Erben zur Vereinswebsite oder zeigt den verfügbaren Standort.'
  )
  .replace(
    '<h3>Sicheres Kontakt-Routing</h3><p>Eine Anfrage geht zuerst an den gewählten Verein. Fehlt dort eine öffentliche Kontaktadresse, wird sie an den zuständigen Landesruderverband und erst danach an den DRV geroutet.</p>',
    '<h3>Direkter Kontakt – kein Verbands-Fallback</h3><p>Eine Anfrage wird nur angeboten, wenn für die ausgewählte Organisation selbst eine freigegebene öffentliche E-Mail-Adresse vorliegt. Fehlt sie, wird nicht an Landesruderverband oder DRV umgeleitet.</p>'
  )
  .replace(
    'Die Empfängeradresse wird ausschließlich serverseitig aus dem gewählten Verein bestimmt und kann nicht frei eingegeben werden.',
    'Die Empfängeradresse wird ausschließlich serverseitig aus dem direkten, freigegebenen Kontakt der ausgewählten Organisation bestimmt. Es gibt kein Fallback an einen Verband.'
  )
  .replace(
    'Ich stimme zu, dass meine Angaben zum Zweck der Kontaktaufnahme an den angezeigten Verein bzw. den zuständigen Verband übermittelt werden.',
    'Ich stimme zu, dass meine Angaben zum Zweck der Kontaktaufnahme ausschließlich an die ausgewählte Organisation übermittelt werden.'
  )
  .replace('<a href="/datenschutz.php">Datenschutz</a>', legalFooterLink)
  .replace('</head>', `${previewStyles}${previewRobots}</head>`);
await writeFile(indexPath, builtIndexHtml);

const seedPath = path.join(dist, 'data', 'clubs.seed.json');
const publicPath = path.join(dist, 'data', 'clubs.json');
const postalSeedPath = path.join(dist, 'data', 'postal-locations.seed.json');
const postalPublicPath = path.join(dist, 'data', 'postal-locations.json');

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
  const postalSeed = await readFile(postalSeedPath, 'utf8');
  await writeFile(publicPath, seed);
  await writeFile(postalPublicPath, postalSeed);
  const fallbackReason = process.env.SKIP_DRV_SYNC === '1'
    ? 'DRV sync explicitly skipped'
    : error.message;
  await writeFile(
    path.join(privateDir, 'recipients.json'),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      source: previewMode ? 'preview-seed-fallback' : 'seed-fallback',
      preview: previewMode,
      routingMode: 'direct-only',
      fallbackReason,
      recipientCount: 0,
      warning: 'No recipient routes are present in this fallback file. Run the real DRV sync to generate verified direct organization routes.',
      recipients: {}
    }, null, 2)
  );
  console.warn('[build] recipients.json contains no fallback recipients; full direct routing requires a successful real DRV sync.');
}

await rm(seedPath, { force: true });
await rm(postalSeedPath, { force: true });
console.log(`[build] dist ready (${previewMode ? 'preview' : 'production'} mode)`);
