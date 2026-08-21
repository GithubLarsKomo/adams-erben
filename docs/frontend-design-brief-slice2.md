# Frontend Design Brief — Slice 2

## Status

Confirmed shaping brief for the complete `/` landing page after acceptance of the Slice-1 Ratzeburg editorial reference.

No implementation is included in this document. It classifies existing landing-page surfaces before further CSS/markup changes.

## Authority

1. `PRODUCT.md`
2. `DESIGN.md`
3. accepted Slice-1 reference: `.city-story.impeccable-editorial-reference`
4. this brief
5. repository evidence and implementation constraints

Accessibility and technical correctness remain hard constraints.

## Goal

Reduce visual fragmentation and generic card/container repetition while preserving the beginner-first conversion path from cinema visitor to real rowing opportunity.

The landing page should feel like one editorial journey with a small number of clearly functional interaction surfaces, not a sequence of unrelated cards.

## Classification vocabulary

- **KEEP** — the container/card treatment has a functional or semantic reason and should remain recognisable as a discrete surface.
- **OPEN** — retain the content and section, but remove unnecessary card framing and use typography, whitespace, grid and imagery for hierarchy.
- **MERGE** — two or more surfaces currently repeat the same job and should become one coherent section or transition.
- **REMOVE** — the surface adds duplication or distracts from the beginner journey and should not remain on `/`.

## Landing-page map

### 1. Hero — KEEP

**Current job:** establish the film-to-rowing bridge and offer the first conversion action.

**Decision:** KEEP the dark navy hero as a deliberate framing surface.

**Why:** this is brand framing, not a generic card. The real `hero-skiff.webp` image and primary CTA already support the product hierarchy.

**Later polish only:** spacing/crop/CTA emphasis. Do not redesign.

---

### 2. Film bridge `#film` — OPEN / MERGE WITH HERO TRANSITION

**Current job:** explains that `Adams Acht` is the starting point and links to trailer/official film page.

**Problem:** immediately after the hero it repeats the same conceptual statement (“Vom Kinosaal ins Boot”) before the user reaches the actionable finder.

**Decision:** retain the factual film context and external links, but OPEN the presentation and treat it as a compact editorial bridge rather than a self-contained promotional panel. It should visually hand off from hero to Quick Finder.

**Do not:** create another dark/card surface or compete with the finder CTA.

---

### 3. Quick Finder `#quick-finder` — KEEP

**Current job:** primary conversion tool.

**Decision:** KEEP as a strong discrete functional surface.

**Why:** input, action and supporting controls benefit from containment. This is one of the few places where a card/panel is semantically justified.

**Refinement direction:** preserve navy differentiation; reduce nested-card feeling inside `.quick-finder-form` if possible without weakening form grouping. The primary `Verein finden` action remains visually dominant.

---

### 4. Full directory `#vereine.landing-directory` — KEEP, PROGRESSIVELY DISCLOSED

**Current job:** advanced search/filter experience.

**Decision:** KEEP as a functional application-like surface, hidden until requested.

**Why:** high information density and controls justify panels/cards here. Do not apply the open editorial language mechanically to this area.

---

### 5. Ratzeburg / RRC `#ratzeburg` — OPEN

**Current job:** establish Ratzeburg as the real place behind the story and present the Ratzeburger Ruderclub.

**Problem:** `.featured-card.rrc-card` packages image, badge, copy and three actions as another large rounded card even though the section is primarily editorial/place-based.

**Decision:** OPEN the RRC presentation into an image + copy editorial composition. The RRC remains a distinct subject, but does not need a floating generic card shell.

**Keep:** real club image, club identity, explanatory copy, direct contact and authoritative external links.

**Change later:** remove decorative badge/pill treatment unless the label provides essential meaning; reduce three equal-looking actions into one primary action plus quieter text/secondary links.

---

### 6. City Story `.city-story` — KEEP AS REFERENCE OPEN PATTERN

**Decision:** KEEP the accepted Slice-1/1b implementation as the reference pattern.

**Role:** establishes the visual grammar for open editorial sections: section rule, asymmetric text/visual columns, restrained framing, one red primary CTA, quieter supporting links.

**Do not:** copy its exact dimensions to every section.

---

### 7. `#rudern-verstehen` — OPEN SELECTIVELY

**Current job:** explain rowing to a naive visitor.

**Decision:** KEEP the section and its explanatory sequence, but OPEN editorial/storytelling parts that are currently boxed only for decoration.

**Keep card-like:** genuinely comparable concepts, boat classes or discrete explanatory objects where boundaries help comprehension.

**Open:** narrative introductions, transitions, image/text explanations and conclusions that do not need a card boundary.

**Rule:** comprehension outranks visual consistency. Do not flatten useful diagrams or comparison units.

---

### 8. Voices `#stimmen` — KEEP STRUCTURE FOR PREVIEW, LAUNCH-GATED

**Current job:** humanise rowing through six perspectives and lead into Schubschlag.

**Decision:** KEEP the multi-voice structure in preview because individual quotations are semantically discrete and benefit from separation.

**Do not propagate:** the voice-bubble visual treatment is specific to quotations and is not a general card pattern.

**Launch rule:** placeholder voices must not appear as authentic testimonials in production. Existing production stripping remains authoritative until real voices are supplied.

---

### 9. Schubschlag partial — KEEP AS DISTINCT RESOURCE, REDUCE CARDNESS IF NEEDED

**Current job:** credible external continuation into rowing stories.

**Decision:** KEEP because it provides a real next step and external voice. It may retain moderate containment as a resource callout, but should not look equivalent to the primary conversion surface.

**Hierarchy:** Quick Finder > RRC/contact > Schubschlag/resource.

---

### 10. Historical depth teaser `#mehr-entdecken` — OPEN + SIMPLIFY

**Current job:** route interested visitors to `/rudern/` through three historical topic cards plus another CTA.

**Problem:** this is the clearest remaining generic three-card grid on the landing page. The three cards all lead into the same deeper product and reproduce the AI/SaaS-like “three cards + CTA” pattern explicitly rejected by `DESIGN.md`.

**Decision:** OPEN and simplify into one editorial depth transition.

**Target:** one strong heading/copy block, three compact text links or chapter cues, and one clear secondary route to `/rudern/`. No three floating white cards.

---

### 11. Journey `.about.journey` — MERGE WITH FINAL CONVERSION

**Current job:** explain three steps from location entry to trying rowing, then repeat `Jetzt Verein finden`.

**Problem:** the Quick Finder has already made the process concrete. A later three-card/principles presentation risks explaining the interface twice.

**Decision:** retain the useful three-step reassurance but MERGE it into the final conversion area as a lightweight numbered editorial sequence, not three cards.

**Target:** concise `1 · Ort`, `2 · Verein`, `3 · ins Boot` progression immediately supporting the final CTA.

---

### 12. `.professional-link` — MERGE WITH DEPTH TEASER

**Current job:** another invitation to `/rudern/` near the end of the page.

**Problem:** duplicates `#mehr-entdecken` almost exactly and adds another large dark contained surface.

**Decision:** MERGE its strongest copy/CTA into `#mehr-entdecken`; REMOVE the separate `.professional-link` section from `/` after the merged depth transition is implemented.

**Result:** one historical-depth invitation, not two.

---

### 13. `#ueber` — OPEN / DE-EMPHASISE

**Current job:** explain independence, data handling and rights policy.

**Decision:** retain because trust matters, but OPEN the three principles into a quieter footer-adjacent trust section rather than another equal-weight three-card grid.

**Hierarchy:** supporting institutional information, not a major narrative chapter.

---

## Summary matrix

| Surface | Decision | Priority |
| --- | --- | --- |
| Hero | KEEP | preserve |
| Film bridge | OPEN / MERGE transition | medium |
| Quick Finder | KEEP | preserve / refine |
| Full directory | KEEP | preserve |
| RRC / Ratzeburg | OPEN | high |
| City Story | KEEP reference | complete |
| Rudern verstehen | OPEN selectively | medium-high |
| Voices | KEEP semantic units | launch gate |
| Schubschlag | KEEP resource callout | low-medium |
| Historical depth teaser | OPEN + SIMPLIFY | high |
| Three-step journey | MERGE with final conversion | high |
| Professional link | MERGE / REMOVE duplicate surface | high |
| Über Adams Erben | OPEN / de-emphasise | medium |

## Recommended implementation order

### Slice 2A — Remove the strongest landing-page repetition

1. Merge `.professional-link` into `#mehr-entdecken`.
2. Replace `.depth-teaser-grid` floating cards with an open chapter-link treatment.
3. Convert `.about.journey .principles` from three cards into a lightweight numbered sequence tied to the final `Verein finden` CTA.

**Why first:** this removes two obvious generic three-card patterns and one duplicate depth CTA without touching complex explanatory content.

### Slice 2B — RRC as editorial place story

Open `.featured-card.rrc-card` using the accepted City Story principles: image + copy, restrained label, one primary contact action, quieter external links.

### Slice 2C — Beginner explainer consolidation

Review `#rudern-verstehen` component-by-component. Open narrative containers but retain boundaries for comparisons, diagrams and genuinely discrete learning objects.

### Slice 2D — Trust/footer polish

Open/de-emphasise `#ueber`; review Schubschlag/resource callout; consolidate remaining decorative pills and local tokens touched by these surfaces.

## Slice 2A acceptance criteria

- `/` contains only one invitation block to the historical `/rudern/` depth experience.
- The three historical depth topics remain discoverable but are no longer three floating white cards.
- The three-step beginner journey remains understandable but no longer presents as three generic cards.
- The final `Verein finden` CTA remains obvious.
- Quick Finder and full directory retain their functional containment.
- No historical/depth content is moved back from `/rudern/` onto `/`.
- No new animation, gradients, glassmorphism, decorative pill system or new palette is introduced.
- Existing anchors/routes continue to work.
- Mobile reading order remains: context → action → reassurance/next step.

## Non-goals for Slice 2A

- no RRC redesign yet;
- no `#rudern-verstehen` internal restructuring yet;
- no replacement of placeholder voices;
- no new imagery;
- no site-wide token migration;
- no changes to finder data/routing;
- no `/rudern/` redesign.

## Verification

After implementation of each sub-slice:

1. run preview/local build;
2. inspect generated `/` because `compose-audiences.mjs` creates landing-specific markup;
3. verify at ~1440, 1024, 390 and 320 px;
4. verify keyboard focus and reduced-motion behavior;
5. confirm `#quick-finder`, `#vereine`, `#stimmen` and `/rudern/` routes remain intact;
6. compare against the accepted City Story reference for principles, not pixel matching.
