// Cross-platform local build: skip the live DRV sync and use checked-in seed data.
process.env.SKIP_DRV_SYNC = '1';

await import('./build.mjs');
await import('./apply-club-logo-manifest.mjs');
await import('./compose-audiences.mjs');
await import('./postbuild-seo.mjs');
await import('./apply-site-shell.mjs');
await import('./integrate-east-west.mjs');
await import('./validate-site-shell.mjs');
await import('./validate-seo-output.mjs');
