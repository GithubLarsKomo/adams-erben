# Preview Responsive QA — 2026-08-16

## Scope

Target: `https://preview.adams-erben.de`

Requested branch under test: `refactor/shared-site-shell`

Routes:

- `/`
- `/rudern/`
- `/deutschlandachter-1960/`

Viewports:

- 390 × 1000
- 430 × 1000
- 768 × 1000
- 1024 × 1000

Browser: Playwright Chromium 140, headless, device scale factor 1.

Workflow run: `31972765696`, job `95227651445`.
Evidence artifact: `preview-responsive-qa`, artifact ID `9270270310` (12 viewport screenshots plus `results.json`; root mobile screenshots are failure-state captures after the menu interaction).

## Acceptance status

**BLOCKED / NOT ACCEPTED AS `refactor/shared-site-shell`.**

All 12 route/viewport combinations returned HTTP 200 and `noindex,nofollow`, but none exposed the shared-shell build markers produced by `scripts/lib/site-shell.mjs`:

- `body[data-shell-path]` missing on 12/12
- `body[data-shell-variant]` missing on 12/12

The deployed `/deutschlandachter-1960/` additionally uses the old textual `AE`/`Adams Erben` header rather than the shared site shell. Its live header geometry and behavior differ from `/` and `/rudern/`.

Conclusion: the public preview domain is not currently serving the generated output of the requested refactoring branch. The exact Coolify branch/SHA cannot be established from GitHub alone, but the deployed HTML is observably not the current shared-shell output.

## Results by requirement

### Sticky/fixed header

Pass on 12/12 for the limited requirement that the header remains pinned while scrolling.

- `/`, `/rudern/` at 390/430/768: `position: fixed`, approximately 69 px high, top remains 0 after scroll.
- `/`, `/rudern/` at 1024: `position: fixed`, approximately 95.8 px high, top remains 0.
- `/deutschlandachter-1960/` at 390/430/768: old `position: sticky` header, approximately 115.9 px high.
- `/deutschlandachter-1960/` at 1024: old `position: sticky` header, approximately 92 px high.

The detail-page difference is further evidence that the common shell has not been deployed there.

### Hamburger

`/` and `/rudern/`:

- 390, 430, 768: hamburger visible; navigation initially closed; click changes `aria-expanded` from `false` to `true` and displays navigation.
- 1024: hamburger hidden and desktop navigation visible.

`/deutschlandachter-1960/`:

- 390, 430, 768: hamburger missing/hidden — FAIL.
- 1024: hamburger hidden as expected for desktop, but the primary navigation is also not presented as the new shared-shell desktop navigation — FAIL for the intended shell.

### CTA

`/`:

- PASS 390/430/768/1024: visible, `href="#quick-finder"`.

`/rudern/`:

- PASS 390/430/768/1024: visible, `href="#vereine"`.

`/deutschlandachter-1960/`:

- FAIL 390/430/768/1024: shared-shell CTA missing; expected `/ruderverein-finden/`.

### H1 wrapping

No document-level horizontal overflow was observed in any of the 12 cases (`scrollWidth == innerWidth`).

`/` and `/rudern/`: PASS at all four widths.

`/deutschlandachter-1960/`:

- 390: **FAIL** — H1 element `scrollWidth=298`, `clientWidth=294`, computed `overflow-wrap: normal`. This reproduces a small internal overflow/clipping risk for the long word `Deutschlandachter`.
- 430: PASS (`334/334`).
- 768: PASS (`644/644`).
- 1024: PASS (`857/857`).

The live title is `Der Deutschlandachter 1960: Olympiasieg in Rom` at all widths.

### In-page navigation

All generated in-page target IDs present on `/` and `/rudern/`:

- `/`: `#film`, `#ratzeburg`, `#stimmen`, `#quick-finder`
- `/rudern/`: `#labor`, `#geschichte`, `#ruderakademie`, `#rudern-verstehen`, `#stimmen`, `#vereine`

`/rudern/`: click navigation PASS at 390/430/768/1024. Example: `#labor` lands below the fixed header.

`/`: desktop 1024 click PASS. At 390/430/768 the opened menu link is visually present but Playwright cannot click it because `#preview-banner` intercepts pointer events. This is a real interaction conflict in the currently deployed preview UI: the preview banner overlays the open mobile menu.

`/deutschlandachter-1960/`: the `#inhalt` skip/in-page navigation changes the hash but places the target at approximately viewport top 0 while the sticky header extends to about 116 px (92 px at 1024). The target is therefore obscured by the header — FAIL at all four widths.

### Preview-specific checks

- HTTP 200: PASS 12/12.
- `robots=noindex,nofollow`: PASS 12/12.
- Preview banner:
  - `/`: PASS all widths.
  - `/rudern/`: PASS all widths.
  - `/deutschlandachter-1960/`: missing — FAIL all widths.

## Visual observations from screenshots

At 390 px `/deutschlandachter-1960/` visibly renders the old circular `AE` mark plus textual `Adams Erben` and a clipped horizontal legacy navigation (`Start`, `Karl Adam`, `Adams Acht`, `Achter 19…`). There is no hamburger or persistent shared-shell CTA.

At 1024 px the same detail route visibly uses the old textual brand and legacy navigation, while the refactored shared-shell source expects the Adams-Erben image lockup and unified navigation.

At 390 px `/` the open mobile navigation is partly covered by the yellow preview banner, matching the browser-level pointer interception reported during the click test.

## Required next action before final acceptance

1. Change the Coolify preview application to deploy `refactor/shared-site-shell` (current branch head at the time of this QA was `8bd756295aac61c6f1f7c811ad16752890c0a406`; later QA-documentation commits do not alter runtime shell behavior).
2. Keep preview build arguments `PREVIEW_MODE=1`, `SKIP_DRV_SYNC=1`, `REQUIRE_DRV_SYNC=0`.
3. Redeploy the preview application.
4. Re-run `.github/workflows/preview-responsive-qa.yml` via `workflow_dispatch`.
5. Accept only when the shared-shell markers pass 12/12 and the detail route passes hamburger, CTA, H1 wrapping and in-page offset checks.
