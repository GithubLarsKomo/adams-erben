# Design System

## Authority

This document is the authoritative visual and interaction context for `adams-erben.de` on the `feat/impeccable` design track. It is based on the confirmed DESIGN grilling and the existing implementation on `feat/vom-vorbild-zum-rivalen`.

If a later feature requires a local exception, that exception must be documented in a confirmed feature brief. Durable changes to this document require a focused DESIGN re-grilling.

## Theme and Scene

`Adams Erben` is a bright, editorial landing-page experience with a strong but restrained historical character. The site should feel contemporary rather than museum-like, serious rather than playful, and emotionally inviting without becoming sentimental or cinematic-pastiche.

The landing page remains primarily light. Dark navy may be used for strong framing moments such as the hero, navigation contrast, footer, or selected feature sections, but must not dominate the entire page.

## Color System

Retain the established palette as the project basis:

- Navy / deep blue for primary brand framing, structural contrast and selected dark surfaces.
- Warm off-white / paper tones for the main reading environment.
- Muted cool neutrals for secondary text, lines and supporting structure.
- Red as the principal accent and CTA color.

Red must be used more sparingly than in the current implementation. It is primarily reserved for high-value actions, selected emphasis and meaningful state or editorial accents. Do not repeat red decoratively merely to create visual variety.

### Contrast rule for dark surfaces

Dark red must **not** be used as small text, metadata, kicker or decorative accent directly on dark navy / deep-blue surfaces. The current dark-red-on-navy combination does not provide sufficient perceptual contrast for these roles and becomes especially weak at small sizes.

On dark surfaces:

- use light blue, warm off-white or another already established high-contrast light token for kickers, metadata, rules and instructional accents;
- reserve red for a CTA only when the complete foreground/background combination is explicitly contrast-checked and the action hierarchy requires it;
- do not rely on red to distinguish information inside a dark technical/editorial chapter;
- prefer luminance contrast first; hue contrast alone is not sufficient.

On light/off-white surfaces, red remains the principal accent and may be used for high-value actions and selected meaningful emphasis where contrast is sufficient.

Existing token values are evidence and should be retained where they already satisfy contrast and hierarchy. Token changes should consolidate the system rather than create parallel shades.

## Typography

Use the existing editorial serif + functional sans pairing.

- Serif, currently Georgia / Times fallback, is reserved primarily for major story, history and editorial headings.
- Sans-serif is the default for navigation, controls, search, cards, metadata, labels, body copy where clarity benefits, and all functional UI.
- Do not introduce another font family without a focused DESIGN re-grilling.
- Avoid decorative typography, gradient text, excessive all-caps and headline styling that imitates the film branding.

Headings should communicate hierarchy through scale, spacing and weight rather than through multiple ornamental treatments.

## Density, Spacing and Layout

The site is an editorial landing page, not a dense application. Use generous but purposeful spacing and clear reading rhythm.

Move the design away from pervasive card containers. Use cards only when content is semantically a self-contained object, tool, result, quote, organization or actionable unit.

Historical and narrative passages should often use open editorial compositions, image/text pairings, strong sectional rhythm, rules, typographic hierarchy and controlled background changes rather than nested rounded boxes.

Retain compactness where function requires it, especially the club finder and result lists. The functional search experience may be denser than the surrounding storytelling.

## Components and Interaction

Buttons and controls should remain simple, legible and strongly differentiated by hierarchy.

- The primary action throughout the site is `Verein finden` / the path into club discovery.
- Primary CTA styling uses the red accent selectively and consistently.
- Secondary actions should be visually quieter and must not compete with the club-finder path.
- Avoid button proliferation inside editorial sections.
- Avoid modal-first interaction unless the modal is functionally justified. Existing contact-dialog behavior is acceptable because it serves a concrete task.
- Reuse component patterns instead of adding new one-off cards, badges, pills or ornamental containers.

## Hero

Retain the established dark navy hero as an important brand anchor, but replace the abstract rowing SVG as the dominant visual expression with authentic rowing photography.

The hero should preserve:

- the current core message and immediate route to `Ruderverein finden`,
- the independence/legal note,
- strong contrast and clear headline hierarchy,
- a visual relationship between Karl Adam's legacy and present-day rowing.

The hero must not imitate the film's official key art or imply official partnership. Photography should feel documentary and real rather than generic stock imagery.

## Imagery

Prefer authentic photography wherever a real place, person, boat, club, training situation or historical object can be shown credibly.

Priority order:

1. authentic project-owned or permission-cleared photography,
2. high-quality illustration when photography cannot communicate the concept well,
3. generated imagery only when necessary and clearly suitable for the editorial context.

Use existing real assets such as rowing, Ratzeburg, memorial and historical/training imagery where they genuinely support the narrative. Do not use images as filler.

Avoid generic stock-photo aesthetics, fake documentary scenes, decorative 3D/CGI and image treatments that suggest film stills without rights clearance.

## Motion

Motion is minimal and functional.

Allowed:

- subtle hover, focus and pressed-state transitions,
- short expand/collapse or dialog transitions when they aid orientation,
- loading/state feedback,
- motion that respects `prefers-reduced-motion`.

Not part of the default design:

- scroll-reveal sequences,
- parallax,
- decorative background animation,
- animated gradients,
- cinematic transition effects.

## Responsive Behavior

The design must preserve hierarchy, comprehension and club-finder access on small screens.

- `Verein finden` remains easy to reach from the persistent navigation.
- Editorial layouts may collapse to a single reading column without turning every section into a stacked card.
- Images should crop intentionally and keep their narrative subject legible.
- Functional controls need touch-friendly targets and must not depend on hover.
- Dense search/result areas may simplify layout while retaining all essential controls and states.

## Tokens and System Boundaries

The current root variables in `src/assets/styles.css` are the starting token set. Consolidate around them instead of adding new colors, radii and shadows per section.

The current large-radius aesthetic should be reduced. Large rounded containers remain appropriate for a few strong framed moments; ordinary editorial content should rely less on radius as a default visual device.

Shadows should be subtle and reserved for functional elevation or selected focal elements, not every content block.

## Accessibility

Accessibility and technical correctness outrank visual preference.

- Maintain or improve contrast.
- Preserve visible keyboard focus.
- Keep skip navigation and semantic heading structure.
- Do not encode meaning by color alone.
- Respect reduced-motion preferences.
- Ensure image alternatives communicate content rather than appearance where images are informative.
- Functional forms, dialogs and finder controls must remain fully keyboard-operable.

## Anti-Slop Rules

Hard anti-defaults for this project:

- no generic repeated card-grid solution for unrelated editorial content,
- no glassmorphism,
- no gradient text,
- no neon/decorative gradients,
- no arbitrary badge/pill proliferation,
- no generic hero + metrics + cards SaaS composition,
- no interchangeable stock illustration,
- no decorative motion added merely for polish,
- no redesign that erases the existing identity solely to look novel.

The preferred direction is evolutionary consolidation: preserve the recognizable Adams-Erben identity while making the site more editorial, authentic, coherent and less container-heavy.

## Confirmed DESIGN Grilling

Confirmed on 2026-08-20:

- Hero: keep dark navy framing, replace abstract SVG with authentic photography (`1B`).
- Content surfaces: move toward more editorial/open compositions (`2A`).
- Typography: serif focused on story/history, sans stronger in functional UI (`3B`).
- Color: retain palette, use red more sparingly and functionally (`4B`).
- Cards/radii: use cards only for semantic containers; reduce radius dependence (`5B`).
- Motion: retain only minimal functional transitions (`6A`).

Confirmed refinement on 2026-08-21:

- Dark red is not an acceptable small-text/meta accent directly on dark navy surfaces; use established high-contrast light accents there and reserve red for contrast-checked high-value actions.

## Provenance

Strategic authority: `PRODUCT.md`.

Repository evidence considered: existing `src/index.html`, `src/assets/styles.css`, additional section CSS, image assets and `docs/BRAND-GUIDELINES.md` inherited from `feat/vom-vorbild-zum-rivalen`.

Design-method inspiration: the repository's `frontend-design-director` / Impeccable-adapted workflow. Project decisions in this document outrank personal defaults and generic Impeccable heuristics.