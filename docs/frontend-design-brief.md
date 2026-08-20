# Frontend Design Brief — Slice 1

## Status

Confirmed implementation brief derived from the authoritative `PRODUCT.md` and `DESIGN.md` on `feat/impeccable`.

## Objective

Improve the landing-page hierarchy without redesigning the established Adams-Erben identity. The first slice establishes a reusable editorial pattern that can later be propagated through the deeper `/rudern/` experience.

The product goal remains primary: a cinema visitor with no rowing background should quickly develop the thought **“Rudern könnte etwas für mich sein”** and always have a clear route toward trying rowing at a real club.

## Authority

Implementation decisions follow this order:

1. `PRODUCT.md`
2. `DESIGN.md`
3. this confirmed feature brief
4. repository evidence and existing implementation constraints
5. personal frontend-design defaults
6. general Impeccable heuristics

Accessibility and technical correctness are hard constraints.

## Scope

### 1. Preserve the existing hero identity

Do not redesign the hero from scratch.

The build already replaces the source SVG artwork with `/assets/images/hero-skiff.webp`. Preserve the dark navy hero framing and the real rowing photograph.

Review only spacing, hierarchy, crop behavior and CTA emphasis where necessary to make the hero conform to `DESIGN.md`.

### 2. Establish one open editorial section pattern

Use the landing-page Ratzeburg/city-story area as the first representative conversion from card-heavy presentation to the new editorial language.

Target structure:

- section heading remains editorial and clearly separated from body content;
- the Stadtführung content becomes an open text-led editorial column rather than a floating generic card;
- the “Ratzeburg damals und heute” visual becomes a strong image/visual counterpart rather than another equivalent card;
- preserve the two-column relationship on suitable desktop widths;
- collapse naturally to one column on mobile;
- retain semantic grouping and accessible reading order;
- do not remove content or working links;
- do not invent final historical imagery where assets are not yet available.

This section becomes the reference pattern for later editorial consolidation elsewhere.

### 3. Reduce container and radius inflation

Within Slice 1, remove card styling where a container has no semantic need for a card boundary.

Principles:

- use whitespace, grid, typography and alignment before borders/backgrounds;
- retain cards where items are genuinely discrete, comparable or interactive;
- reduce oversized corner radii on editorial containers;
- avoid nested rounded containers;
- do not flatten functional controls or the Quick Finder merely for stylistic consistency.

Do not attempt a site-wide card rewrite in this slice.

### 4. Restore accent-color hierarchy

Red is the Adams-Erben brand accent and primary conversion color, not a general decoration color.

For the affected landing-page surface:

- reserve strong red primarily for the principal action and genuinely important accents;
- remove unnecessary red pills/badges where typography or neutral treatment is sufficient;
- do not introduce additional accent colors;
- retain existing navy, warm off-white and established supporting colors;
- preserve sufficient contrast on every background.

### 5. Normalize conversion language

The persistent conversion concept is **finding a real rowing opportunity / club**.

Use these rules:

- persistent navigation CTA: `Verein finden`;
- compact/mobile persistent CTA: `Verein finden`;
- contextual introductory CTA may use `Rudern ausprobieren` when it describes the visitor benefit and still leads into the finder flow;
- avoid introducing additional synonyms for the same action;
- existing working anchors/routes must remain intact.

Do not rewrite unrelated editorial copy in this slice.

### 6. Complete reduced-motion behavior

`prefers-reduced-motion: reduce` must disable non-essential smooth scrolling and non-essential transitions/animations across the landing-page experience.

Required behavior:

- disable global smooth scrolling for reduced-motion users;
- suppress decorative transitions/animations;
- functional state changes must remain understandable without animation;
- no new scroll-reveal, parallax or entrance animations are permitted.

### 7. Begin token consolidation without a full CSS refactor

Where Slice 1 touches colors, radii, shadows or spacing:

- prefer existing root/design tokens;
- add a small semantic token only where repeated meaning warrants it;
- avoid adding new arbitrary literal colors/radii/shadows;
- remove local literals only when doing so is safe within the touched surface;
- do not turn this slice into a repository-wide CSS migration.

## Explicit non-goals

This slice does **not**:

- redesign the complete `/rudern/` page;
- replace all cards site-wide;
- rewrite the Karl-Adam historical narrative;
- replace the six placeholder voices with invented testimonials;
- source or fabricate missing historical photographs;
- change the DRV data model or finder routing;
- redesign the site header architecture;
- add decorative animation;
- introduce a new font family or new brand palette.

## Likely implementation surfaces

Inspect and change only as required, primarily:

- `src/assets/styles.css`
- `src/assets/site-shell.css`
- `src/assets/mobile-fixes.css`
- `src/assets/storyboard-overrides.css` where existing overrides intersect the touched surface
- `src/index.html` only when semantic markup/classes need adjustment
- relevant build scripts only if generated landing-page markup requires the change there rather than in source HTML

Because the build mutates source markup, verify the generated output rather than judging only `src/index.html`.

## Acceptance criteria

### Product hierarchy

- `Verein finden` remains continuously available through the persistent navigation/header behavior.
- Landing-page CTA wording follows the normalized vocabulary above.
- No change weakens the beginner-first journey defined in `PRODUCT.md`.

### Visual hierarchy

- Hero retains the dark navy framing and real `hero-skiff.webp` imagery.
- The selected Ratzeburg/city-story surface visibly reads as editorial composition rather than two generic cards.
- The text and visual columns remain balanced on desktop and readable in correct order on mobile.
- Red has visibly higher signal value because decorative red usage in the touched surface is reduced.
- No new generic SaaS-style card grid, gradient-text treatment, glassmorphism or decorative pill system is introduced.

### Accessibility

- Existing heading hierarchy and landmarks remain valid.
- Interactive elements retain visible focus states.
- Color contrast is not degraded.
- `prefers-reduced-motion: reduce` disables smooth scrolling and non-essential motion.
- Mobile reading order remains logical.

### Technical

- Existing finder anchors and external links continue to work.
- Build completes successfully.
- Generated landing output contains the intended structure/styles.
- No horizontal overflow is introduced at current responsive breakpoints.
- No unrelated sections are materially restyled.

## Verification plan

1. Run the normal local/preview build used by the repository.
2. Inspect generated landing-page markup to confirm build-time mutations do not undo the changes.
3. Check desktop widths around 1440 px and 1024 px.
4. Check mobile widths around 390 px and 320 px.
5. Verify the persistent `Verein finden` CTA and finder target.
6. Test keyboard navigation through the changed area.
7. Test `prefers-reduced-motion: reduce` and confirm smooth scrolling/non-essential transitions are disabled.
8. Compare the Ratzeburg/city-story section before/after for reduced card/container dependence while preserving all content.
9. Run repository tests/build checks before committing implementation completion.

## Follow-on slices

Only after Slice 1 is visually and technically validated:

1. propagate the open editorial pattern to appropriate story/history surfaces;
2. consolidate repeated card, radius, shadow and accent treatments;
3. review `/rudern/` using the established Slice-1 pattern rather than inventing a second design language;
4. separately resolve launch blockers such as placeholder voices and outstanding image-rights/provenance evidence.
