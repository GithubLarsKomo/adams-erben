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

await import('./risk-preflight.mjs');
await import('./build.mjs');

// The normal build remains production-safe and does not depend on the local snapshot.
// For local review, replace the demo seed with the checked-in sanitized full club snapshot.
await copyFile(snapshotPath, publicClubsPath);
await rm(snapshotPath, { force: true });

await import('./apply-club-logo-manifest.mjs');
await import('./split-audiences.mjs');
await import('./postbuild-seo.mjs');
await import('./postbuild-legal-links.mjs');
await import('./validate-seo-output.mjs');
await import('./risk-protection.mjs');
