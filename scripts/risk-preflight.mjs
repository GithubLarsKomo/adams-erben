const previewMode = process.env.PREVIEW_MODE === '1';
const drvApproved = process.env.DRV_DATA_USAGE_APPROVED === '1';
const syncSkipped = process.env.SKIP_DRV_SYNC === '1';
const syncMode = String(process.env.DRV_SYNC_MODE || 'disabled').trim().toLowerCase();

function fail(message) {
  throw new Error(`[risk-preflight] ${message}`);
}

if (!['disabled', 'approved'].includes(syncMode)) {
  fail(`Invalid DRV_SYNC_MODE=${syncMode || '(empty)'}. Supported modes are disabled and approved.`);
}

// A production build may publish DRV-derived directory data only after a documented approval.
if (!previewMode && !drvApproved) {
  fail('Production build blocked: set DRV_DATA_USAGE_APPROVED=1 only after the data-use basis has been documented.');
}

// The sync mode is an explicit operational gate independent of the publication/data-use approval.
if (syncMode === 'disabled' && !syncSkipped) {
  fail('DRV sync is disabled. Set SKIP_DRV_SYNC=1, or set DRV_SYNC_MODE=approved only after documented clearance.');
}
if (syncMode === 'approved' && !drvApproved) {
  fail('DRV_SYNC_MODE=approved requires DRV_DATA_USAGE_APPROVED=1.');
}

// No automated DRV crawl may start without explicit approval, even in a preview build.
if (!syncSkipped && !drvApproved) {
  fail('DRV sync blocked: automated retrieval requires DRV_DATA_USAGE_APPROVED=1. Use DRV_SYNC_MODE=disabled and SKIP_DRV_SYNC=1 until clearance is documented.');
}
if (!syncSkipped && syncMode !== 'approved') {
  fail('Automated DRV retrieval requires DRV_SYNC_MODE=approved.');
}

console.log(`[risk-preflight] passed (${previewMode ? 'preview' : 'production'}; DRV mode ${syncMode}; sync ${syncSkipped ? 'skipped' : 'enabled'})`);
