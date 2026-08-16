// Cross-platform local build: skip the live DRV sync and use checked-in seed data.
process.env.SKIP_DRV_SYNC = '1';
process.env.USE_CLUB_SNAPSHOT = '1';

await import('./build.mjs');
await import('./apply-club-logo-manifest.mjs');
await import('./split-audiences.mjs');
