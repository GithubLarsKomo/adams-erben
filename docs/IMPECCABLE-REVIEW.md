# Impeccable Frontend Review

Status: first authoritative review on `feat/impeccable`
Date: 2026-08-20

## Scope

This review evaluates the build path inherited from `feat/vom-vorbild-zum-rivalen` against the confirmed `PRODUCT.md` and `DESIGN.md`.

The public preview is protected by the project's access layer, so this review uses repository and build evidence. Findings are therefore limited to behaviors that can be demonstrated from source/build logic. Visual fine-tuning that depends on exact rendered crop, viewport or browser behavior must be verified against the authenticated preview before implementation is closed.

## Executive assessment

The project does **not** need a wholesale redesign. Its core identity is already compatible with the confirmed direction: warm light reading surfaces, navy as structural brand color, red accent, editorial serif + functional sans, persistent access to the club finder, and authentic rowing imagery in the built hero.

The strongest opportunity is consolidation. The page has accumulated multiple visual dialects and container patterns as the content expanded. The next design pass should reduce the number of competing component treatments, make the editorial layers feel less like collections of cards, and make the club-finder conversion more verbally and visually consistent.

No current finding justifies replacing the existing identity.

## Findings

### FDR-01 · HIGH · Editorial content is still too container-heavy

**Evidence**

`karl-adam.css` groups `story-card`, `book-card`, `context-card`, funding containers and several other narrative units behind the same bordered, rounded, shadowed card treatment. `Adams Labor` then introduces another family of large rounded dark cards. The entry page adds a three-card depth teaser.

**Authority**

`DESIGN.md` requires open editorial compositions for historical/narrative passages and says cards should be used only for semantically self-contained objects, tools, results, quotes, organizations or actions.

**Impact**

The repeated card language fragments the story into visually equivalent units. It reduces editorial hierarchy and makes historically important passages compete with supporting material.

**Smallest useful change**

Do not remove all cards. Classify current containers into:

1. semantic cards that remain cards,
2. narrative sections that become open editorial compositions,
3. strong framed moments that may retain a large-radius background.

Recommended first targets: `city-story`, history/context blocks and selected `Adams Labor` cards. The club finder, voice quotations, source/organization links and actionable result cards remain valid card-like objects.

**Verification**

A rendered page should visibly distinguish narrative flow from actionable/self-contained objects without losing section hierarchy.

**Classification**: `surface-only` within current DESIGN authority.

---

### FDR-02 · HIGH · Pills, badges and accent treatments have proliferated

**Evidence**

Current CSS uses pill treatment for global buttons, badges, city contact links, voice metadata, lab numbers/themes, nav CTA and several other small labels. Red also appears systematically in eyebrows/kickers and decorative micro-elements.

**Authority**

`DESIGN.md` explicitly rejects arbitrary badge/pill proliferation and reserves red primarily for high-value actions, selected emphasis and meaningful states/editorial accents.

**Impact**

The same visual emphasis is used for too many unrelated roles. This weakens the hierarchy of the actual primary action and contributes to an assembled-component feel.

**Smallest useful change**

Create a role-based rule:

- primary CTA: red filled control,
- metadata/kickers: typographic treatment without pill by default,
- state/badge: pill only where the content is genuinely categorical/status-like,
- contact utility links: compact text/icon controls, not necessarily pills,
- numbered experimental sequence: number treatment may remain, but not every adjacent label needs a capsule.

**Verification**

The red primary CTA should be one of the first actionable elements perceived; removing decorative pills must not reduce comprehension.

**Classification**: `surface-only` within current DESIGN authority.

---

### FDR-03 · HIGH · Reduced-motion support is incomplete

**Evidence**

`styles.css` sets `html { scroll-behavior: smooth; }` and buttons use transform/background/color transitions. `site-shell.css` disables only menu-toggle transitions for `prefers-reduced-motion`; `audience-pages.css` disables only depth-teaser-card transitions.

**Authority**

`PRODUCT.md` and `DESIGN.md` require reduced or purely functional motion and explicit respect for `prefers-reduced-motion`. Accessibility outranks visual preference.

**Impact**

Users who request reduced motion can still receive smooth anchor scrolling and other transitions.

**Smallest useful change**

Add one global reduced-motion guardrail loaded after the component CSS. At minimum set `html { scroll-behavior: auto; }` under reduced motion and disable non-essential transform/transition behavior while preserving state changes.

**Verification**

With OS/browser reduced-motion enabled, in-page navigation jumps without smooth animation and no purely decorative motion remains.

**Classification**: `surface-only`, accessibility priority.

---

### FDR-04 · MEDIUM-HIGH · Design tokens are being bypassed by local one-off values

**Evidence**

The base token system in `styles.css` defines the principal palette, radius and shadow, but later styles introduce additional hard-coded dark blues, pale blues, muted text colors, warm backgrounds, radii and shadows (`#102c40`, `#92d6ea`, `#607783`, `#55707d`, multiple 8/10/12/16/17/18/28/30px radii and one-off shadow recipes).

**Authority**

`DESIGN.md` says the existing root variables are the starting token set and that new colors, radii and shadows should be consolidated rather than multiplied by section.

**Impact**

Visual consistency becomes difficult to reason about and future polishing tends to add another exception instead of strengthening the system.

**Smallest useful change**

Create only the missing semantic tokens actually needed by the existing design, e.g. `--accent-on-dark`, `--surface-dark-2`, `--text-on-dark-muted`, a small radius scale and a small elevation scale. Replace repeated literals incrementally; do not perform a cosmetic token rewrite that changes appearance unintentionally.

**Verification**

The main storytelling CSS should rely predominantly on the shared token vocabulary, with documented exceptions for image-specific treatments.

**Classification**: `surface-only`; no DESIGN re-grilling required because this implements existing system boundaries.

---

### FDR-05 · MEDIUM-HIGH · Primary conversion language is not fully consistent

**Evidence**

`PRODUCT.md` defines `Verein finden` as the strongest action throughout the journey. The landing shell and hero currently lead with `Rudern ausprobieren`; the quick finder then resolves that action as `Verein in der Nähe finden`. On narrow screens the persistent header switches to the compact label `Verein finden`.

**Authority**

The product goal is not merely engagement with rowing content; it is fast progression to a real club for a novice visitor.

**Impact**

`Rudern ausprobieren` is emotionally inviting but can describe a broader action than the actual next step. Mixed labels may make the conversion path feel like several different actions rather than one journey.

**Smallest useful change**

Keep `Rudern ausprobieren` as motivational language/headline where useful, but normalize the primary actionable label toward `Ruderverein finden` or `Verein finden` across hero, persistent CTA and quick-finder submission. Secondary explanatory copy can state that finding a club is the practical way to try rowing.

**Verification**

A novice should be able to answer immediately: “What happens when I press the red button?” The answer should be consistently “I find a rowing club near me.”

**Classification**: `surface-only`, but copy should be confirmed in the feature brief before implementation.

---

### FDR-06 · MEDIUM · Placeholder voices undermine the authenticity principle if exposed beyond preview

**Evidence**

The landing composition deliberately retains all six voices. The source still labels every person as `Platzhalter` and explicitly says the answers are placeholder formulations.

**Authority**

`PRODUCT.md` prioritizes authenticity, real people and credibility. `DESIGN.md` prefers authentic photography/content over invented documentary impression.

**Impact**

This is acceptable in a clearly protected prototype, but it would directly undermine trust on a public launch because invented quotations visually resemble testimonials.

**Smallest useful change**

Keep the section in preview only if its placeholder status remains unmistakable. Before production either replace the six voices with approved real contributions or remove/replace the testimonial presentation rather than anonymizing invented quotes as if real.

**Verification**

No production build may present placeholder quotations as real statements.

**Classification**: `requires-content-resolution`; launch blocker, not a reason to change DESIGN.md.

---

### FDR-07 · MEDIUM · Image-rights provenance is incomplete for the broader image library

**Evidence**

The image README documents explicit handling/release expectations for Ratzeburg and the memorial, and `NOTICE.md` documents third-party data and film restrictions. The build uses `hero-skiff.webp` as the high-priority hero image, but the reviewed image documentation does not provide a general provenance ledger for every editorial image.

**Authority**

`PRODUCT.md` requires visible independence and authentic real imagery; `BRAND-GUIDELINES.md` prohibits unlicensed film/press assets. `DESIGN.md` gives priority to project-owned or permission-cleared photography.

**Impact**

The visual direction can become dependent on assets whose publication status is not evident from the repository documentation.

**Smallest useful change**

Introduce a compact image provenance manifest or extend the image README with source/creator, rights state, permitted use, credit and production/preview status for every editorial image used by the build.

**Verification**

Every non-trivial editorial image referenced in the built HTML can be traced to a documented rights state.

**Classification**: `surface-supporting governance`; no DESIGN re-grilling required.

## Positive findings

### P-01 · Built hero already follows the new photographic direction

Although `src/index.html` still contains the old abstract SVG, `scripts/build.mjs` replaces `.hero-art` with `hero-skiff.webp` before audience composition. Therefore the built page already complies with the newly confirmed hero direction in principle. The source placeholder can be cleaned later, but it is not a current visual defect.

### P-02 · Audience split supports the product hierarchy

The build creates a novice-focused landing page and a separate historical/fachliche depth page. The landing page removes the deep historical sections, introduces an immediate quick finder and retains a route to the second level. This aligns well with the confirmed primary persona and avoids forcing new visitors through the full historical narrative before conversion.

### P-03 · Persistent club access is structurally strong

The shared site shell keeps the club-finder path in navigation and exposes a compact persistent CTA on mobile. This directly supports `PRODUCT.md`.

### P-04 · Base palette and type pairing should be preserved

The existing navy/red/warm-paper palette and Georgia + system-sans pairing are consistent with the confirmed DESIGN direction. The task is to discipline and consolidate their use, not replace them.

## Recommended implementation order

1. **Accessibility first:** global reduced-motion correction.
2. **Conversion copy:** normalize the primary CTA vocabulary.
3. **System cleanup:** semantic accent/pill rules plus minimal token consolidation.
4. **Editorial pass:** convert selected narrative cards into open editorial sections, beginning with one representative section rather than rewriting the entire site at once.
5. **Authenticity/readiness:** resolve voice placeholders and establish image provenance before public launch.

## Proposed first feature brief

The first implementation slice should be intentionally narrow:

> **Landing-page hierarchy and design-system consolidation** — preserve content and current identity, normalize the club-finder CTA, implement reduced-motion globally, reduce decorative red/pills, and convert one representative narrative/card area into the confirmed open editorial style. Use the result as the reference pattern before applying the same treatment to the historical depth page.

This avoids a big-bang redesign and gives the project a tested reference pattern for subsequent Impeccable passes.