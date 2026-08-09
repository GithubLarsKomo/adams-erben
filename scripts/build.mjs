import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const privateDir = path.join(root, 'build-private');

await rm(dist, { recursive: true, force: true });
await rm(privateDir, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await mkdir(privateDir, { recursive: true });
await cp(src, dist, { recursive: true });

const seedPath = path.join(dist, 'data', 'clubs.seed.json');
const publicPath = path.join(dist, 'data', 'clubs.json');

function runSync() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/sync-drv.mjs'], {
      cwd: root,
      env: process.env,
      stdio: 'inherit'
    });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`DRV sync exited with ${code}`)));
    child.on('error', reject);
  });
}

try {
  if (process.env.SKIP_DRV_SYNC === '1') throw new Error('DRV sync explicitly skipped');
  await runSync();
} catch (error) {
  if (process.env.REQUIRE_DRV_SYNC === '1') throw error;
  console.warn(`[build] ${error.message}; using checked-in seed data.`);
  const seed = await readFile(seedPath, 'utf8');
  await writeFile(publicPath, seed);
  await writeFile(
    path.join(privateDir, 'recipients.json'),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      source: 'seed-fallback',
      recipients: {},
      drv: {
        name: 'Deutscher Ruderverband e.V.',
        email: process.env.DRV_FALLBACK_EMAIL || 'info@rudern.de'
      }
    }, null, 2)
  );
}

await rm(seedPath, { force: true });
console.log('[build] dist ready');
