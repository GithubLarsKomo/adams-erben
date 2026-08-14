const previewMode = process.env.PREVIEW_MODE === '1';
const drvApproved = process.env.DRV_DATA_USAGE_APPROVED === '1';
const syncSkipped = process.env.SKIP_DRV_SYNC === '1';

function fail(message) {
  throw new Error(`[risk-preflight] ${message}`);
}

// A production build may publish DRV-derived directory data only after a documented approval.
if (!previewMode && !drvApproved) {
  fail('Production build blocked: set DRV_DATA_USAGE_APPROVED=1 only after the data-use basis has been documented.');
}

// No automated DRV crawl may start without explicit approval, even in a preview build.
if (!syncSkipped && !drvApproved) {
  fail('DRV sync blocked: automated retrieval requires DRV_DATA_USAGE_APPROVED=1. Use SKIP_DRV_SYNC=1 until clearance is documented.');
}

console.log(`[risk-preflight] passed (${previewMode ? 'preview' : 'production'}; DRV sync ${syncSkipped ? 'skipped' : 'approved'})`);
