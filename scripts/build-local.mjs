import { copyFile, rm } from 'node:fs/promises';
import path from 'node:path';

// Cross-platform local preview build: no live DRV sync, checked-in sanitized club snapshot only.
process.env.PREVIEW_MODE = '1';
process.env.SKIP_DRV_SYNC = '1';
process.env.DRV_SYNC_MODE = 'disabled';
process.env.DRV_DATA_USAGE_APPROVED = '0';

const root = process.cwd();
const snapshotPath = path.join(root, 'dist', 'data', 'clubs.snapshot.json');
const publicClubsPath = path.join(root, 'dist', 'data', 'clubs.json');

async function stage(name, action) {
  console.log(`[build:local] ${name}`);
  try {
    await action();
  } catch (error) {
    const message = String(error?.message || error).replace(/[\r\n]+/g, ' ');
    console.error(`::error title=Local build stage failed::${name}: ${message}`);
    throw error;
  }
}

await stage('risk preflight', () => import('./risk-preflight.mjs'));
await stage('core page build', () => import('./build.mjs'));

// The normal build remains production-safe and does not depend on the local snapshot.
// For local review, replace the demo seed with the checked-in sanitized full club snapshot.
await stage('sanitized club snapshot', async () => {
  await copyFile(snapshotPath, publicClubsPath);
  await rm(snapshotPath, { force: true });
});

await stage('club logo manifest', () => import('./apply-club-logo-manifest.mjs'));
await stage('audience split', () => import('./split-audiences.mjs'));
await stage('SEO postbuild', () => import('./postbuild-seo.mjs'));
await stage('legal footer links', () => import('./postbuild-legal-links.mjs'));
await stage('SEO validation', () => import('./validate-seo-output.mjs'));
await stage('risk protection', () => import('./risk-protection.mjs'));
