import { copyFile, rm } from 'node:fs/promises';
import path from 'node:path';

// Container/deployment-safe build path:
// - never performs a live DRV sync during image creation
// - publishes the checked-in sanitized club snapshot
// - keeps publication approval and preview/production mode as external gates
process.env.SKIP_DRV_SYNC = '1';
process.env.DRV_SYNC_MODE = 'disabled';
process.env.REQUIRE_DRV_SYNC = '0';

const root = process.cwd();
const snapshotPath = path.join(root, 'dist', 'data', 'clubs.snapshot.json');
const publicClubsPath = path.join(root, 'dist', 'data', 'clubs.json');

async function stage(name, action) {
  console.log(`[build-deployment] ${name}`);
  try {
    await action();
  } catch (error) {
    console.error(`[build-deployment] failed during ${name}`);
    throw error;
  }
}

await stage('risk preflight', () => import('./risk-preflight.mjs'));
await stage('core build', () => import('./build.mjs'));
await stage('promote sanitized club snapshot', async () => {
  await copyFile(snapshotPath, publicClubsPath);
  await rm(snapshotPath, { force: true });
});
await stage('apply club logo manifest', () => import('./apply-club-logo-manifest.mjs'));
await stage('split audience pages', () => import('./split-audiences.mjs'));
await stage('apply SEO postbuild', () => import('./postbuild-seo.mjs'));
await stage('apply legal footer links', () => import('./postbuild-legal-links.mjs'));
await stage('validate SEO output', () => import('./validate-seo-output.mjs'));
await stage('validate risk-protected output', () => import('./risk-protection.mjs'));

console.log(`[build-deployment] complete (${process.env.PREVIEW_MODE === '1' ? 'preview' : 'production'} mode; live DRV sync disabled)`);
