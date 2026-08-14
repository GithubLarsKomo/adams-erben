// Cross-platform local build: skip the live DRV sync and use checked-in seed data.
process.env.SKIP_DRV_SYNC = '1';

await import('./build.mjs');
await import('./split-audiences.mjs');
