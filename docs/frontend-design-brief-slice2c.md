# Frontend Design Brief — Slice 2C

## Status

Confirmed shaping brief for `#rudern-verstehen` on the beginner landing page.

This document classifies the explainer component by component before implementation. No CSS or markup changes are included here.

## Authority

1. `PRODUCT.md`
2. `DESIGN.md`
3. accepted Slice-1/2A/2B landing patterns
4. this Slice-2C brief
5. existing repository implementation constraints

Accessibility and technical correctness remain hard constraints.

## Product job of `#rudern-verstehen`

`#rudern-verstehen` serves the primary beginner persona. It must make rowing legible without prior rowing knowledge and support the first product outcome:

> “Rudern könnte etwas für mich sein.”

It is therefore allowed to be more diagrammatic and instructional than the surrounding editorial story sections. Visual boundaries are useful when they clarify comparison, sequence or a self-contained learning object. They are not useful when they merely wrap narrative copy in another rounded box.

## Slice-2C design rule

**Narrative → open. Comparison → keep bounded. Diagram/learning object → keep the object, open the unnecessary outer shell. Transition → open.**

Do not flatten the explainer into one long article. Do not preserve every current rounded container merely because it already exists.

---

# Component classification

## A. Section heading `.rowing-explainer-heading` — KEEP OPEN

### Current role
Introduces the beginner explainer and explains why rowing contains more structure than is obvious at first glance.

### Decision
**KEEP OPEN.**

No card/container treatment is needed. Retain the existing editorial section heading and body copy.

### Implementation note
Only rhythm/spacing may be aligned with the accepted landing editorial system.

---

## B. Racing chapter wrapper `.rowing-chapter-racing` — KEEP AS STRONG FRAME, REDUCE NESTING

### Current role
Creates a dark navy chapter for race rowing and holds most of the technical explainer material.

### Decision
**KEEP the dark chapter frame.**

The dark chapter is one of the few justified strong framing moments under `DESIGN.md`. It gives the beginner a clear change of mode and visually connects to the sport/technical side of rowing.

### Problem
Inside that frame, too many subcomponents are independently rounded and filled, creating repeated “panel inside panel inside panel” structure.

### Target
Preserve one dark chapter background, but reduce the number of independently floating child cards.

---

## C. Skull vs Riemen `.boat-compare` / `.boat-compare-card` — KEEP

### Current role
Directly compares two genuinely different rowing systems.

### Decision
**KEEP as two bounded comparison units.**

This is exactly where cards are semantically justified: two comparable concepts with their own mini-diagram, label, heading and explanatory copy.

### Refinement
- make the two units feel like one comparison system rather than two unrelated marketing cards;
- reduce ornamental radius if necessary;
- preserve strong visual distinction between `1x` and `8+`;
- no additional badges/pills.

---

## D. Achter seating `.eight-explainer` — OPEN SHELL, KEEP DIAGRAM

### Current role
Explains seat numbering, stroke seat, bow/stern and cox position.

### Decision
**OPEN the outer card shell; KEEP the diagram as a discrete learning object.**

### Why
The text and diagram form one instructional figure. They do not need another rounded translucent card inside an already dark chapter.

### Target
Use copy + horizontal diagram with a rule or spacing boundary instead of a floating rounded panel. The scrollable diagram remains keyboard-focusable and horizontally scrollable where required.

### Preserve
- `aria-label` and `tabindex=0` behavior;
- seat numbering;
- bow/stern/cox labels;
- explanatory note;
- placeholder/diagram caption until the final illustration exists.

---

## E. Training week + season `.rowing-rhythm-grid` — MERGE

### Current role
Two separate panels explain weekly load distribution and annual season structure.

### Decision
**MERGE into one coherent “Rhythmus des Trainings” learning section.**

### Why
The two subjects answer the same beginner question at two time scales: what happens across a week and what happens across a year. Presenting them as two independent rounded cards exaggerates their separation.

### Target
One open sub-section with two clearly labelled views:

- **Woche** — seven-day pattern;
- **Jahr** — seasonal progression.

The seven-day cells and seasonal timeline may remain internally structured because they encode sequence/data.

### Remove
The red numbered circles `02` / `03` as ornamental panel markers. Chapter-level sequencing already exists and the red accent is better reserved for actions/meaningful emphasis.

---

## F. Race course + world-best record `.race-strip` — OPEN / MERGE

### Current role
Explains a typical 2,000 m race and then adds the 2017 Deutschlandachter world-best-time story.

### Decision
**OPEN the outer race card and MERGE race course + record into one editorial/diagrammatic sequence.**

### Why
A second dark rounded surface inside the already dark racing chapter is redundant. The race-course line is itself the visual structure.

### Target
1. race heading/copy;
2. 0–2,000 m course visualization;
3. record as a clear factual/emotional endpoint below the course;
4. World Rowing source remains visible but secondary.

The record may use scale/typography for emphasis, not another nested container.

---

## G. Age spectrum `.age-band` — OPEN SHELL, KEEP SCALE

### Current role
Shows rowing from children through Masters.

### Decision
**OPEN the enclosing rounded band; KEEP the age categories as a comparative scale.**

### Why
The information is useful to the beginner because it broadens the perceived audience for rowing. The five categories are semantically discrete, but the entire block does not need another filled rounded card.

### Target
Editorial heading/copy followed by a horizontal age progression. Individual age categories may retain subtle boundaries or top rules rather than five mini-cards.

### Important
Do not overstate regulatory precision; retain the existing “vereinfacht” framing.

---

## H. Racing → touring transition `.rowing-transition` — KEEP

### Current role
“**Aber nicht jede Ausfahrt hat eine Ziellinie.**” changes the emotional register from competition to recreational/touring rowing.

### Decision
**KEEP.**

This is a successful open editorial transition and already matches the emerging design language.

### Refinement
Only spacing/rule styling if needed. No container.

---

## I. Touring chapter wrapper `.rowing-chapter-touring` — OPEN

### Current role
Creates a large pale rounded container around all touring content.

### Decision
**OPEN the chapter wrapper.**

### Why
Unlike the dark racing chapter, the touring chapter does not need another giant rounded frame. The whole landing page is already light/editorial; the pale container reads as a second mega-card.

### Target
Use an open light section with strong heading rhythm and selective diagram surfaces. Background change may be subtle/full-width only if existing layout allows without introducing another floating rounded panel.

---

## J. Gigboat `.gig-explainer` — OPEN SHELL, KEEP DIAGRAM + FACTS

### Current role
Introduces the Gigboot with a schematic boat and four factual definitions.

### Decision
**OPEN the outer white card shell.**

Keep the boat diagram as its own visual surface and keep the four facts because they are genuinely discrete terms.

### Target
Asymmetric visual/text composition similar in principle to the accepted RRC/City Story pattern, but instructional rather than photographic:

- diagram side;
- text + facts side;
- no surrounding generic card;
- facts may use subtle rules/background differentiation rather than four mini-cards if readability permits.

---

## K. Touring examples `.touring-cards` — OPEN / KEEP COMPARISON

### Current role
Three examples — Schaalsee, Rhein, Bodensee — demonstrate increasing touring context and environmental demands.

### Decision
**OPEN the individual card shells, KEEP the three-way comparison.**

### Why
The destinations are genuinely distinct examples, so the three-column comparison is useful. The current implementation, however, looks like another generic three-card grid and adds decorative route graphics inside each card.

### Target
A three-part editorial route spectrum using columns/rules and concise visual cues. Retain the destination examples and their different meanings.

### Keep
- Schaalsee as local/accessible example;
- Rhein as multi-day/navigation example;
- Bodensee as large-water/weather example.

### Reduce
- large rounded white cards;
- decorative card framing;
- red circular numbering.

---

## L. Long-distance bridge `.distance-callout` — OPEN

### Current role
Reconnects touring/endurance rowing with competitive long-distance formats and links to Moselpokal/Fari Cup.

### Decision
**OPEN.**

This is conceptually a transition/bridge, not a card. Use heading/copy + the two real event/resource links in an editorial two-column or stacked composition.

### Preserve
- both event links/logos;
- the conceptual bridge between touring, endurance and competition;
- any existing Schubschlag listening tip injected into this area, but treat it as a quiet resource link rather than another card.

---

## M. Outro `.rowing-outro` — KEEP OPEN

### Current role
Returns from technical explanation to the broad promise that rowing can be competition, training, travel or community.

### Decision
**KEEP OPEN.**

This is a strong editorial conclusion and should remain visually quiet.

### Product role
It should hand the reader back toward the page's conversion path rather than start another topic.

---

## N. Injected Schubschlag listening tips — KEEP QUIET

### Current role
Build-time additions connect selected explainer topics to real podcast episodes.

### Decision
**KEEP as secondary editorial resources.**

Do not style them as equal CTA cards. They should read like source/listening annotations below the relevant learning object.

---

# Summary matrix

| Component | Decision | Reason |
| --- | --- | --- |
| Explainer heading | KEEP OPEN | editorial intro |
| Racing chapter wrapper | KEEP FRAME | justified strong chapter contrast |
| Skull vs Riemen | KEEP | genuine comparison |
| Achter seating | OPEN shell / KEEP diagram | learning figure, avoid nested card |
| Training week + season | MERGE | same concept at two time scales |
| 2,000 m race + record | OPEN / MERGE | race line supplies structure |
| Age spectrum | OPEN shell / KEEP scale | useful comparison without band-card |
| Racing→touring transition | KEEP | successful editorial transition |
| Touring chapter wrapper | OPEN | pale mega-card unnecessary |
| Gigboat | OPEN shell / KEEP diagram+facts | instructional image/text composition |
| Touring examples | OPEN / KEEP comparison | real comparison, avoid 3-card pattern |
| Long-distance bridge | OPEN | conceptual transition/resource block |
| Outro | KEEP OPEN | editorial conclusion |
| Listening tips | KEEP QUIET | secondary resource evidence |

# Implementation strategy

Do **not** implement all changes as one CSS sweep. Use three bounded implementation slices.

## Slice 2C-1 — Racing chapter de-nesting

Implement first:

1. open `.eight-explainer` shell while retaining the diagram;
2. merge Training Week + Season visually into one rhythm section;
3. open `.race-strip` and integrate the record into the race sequence;
4. open `.age-band` while preserving the age scale;
5. retain `.boat-compare-card` as the canonical bounded comparison pattern.

### Acceptance criteria

- one dark racing chapter remains;
- no unnecessary rounded sub-card wraps the Achter, race or age sequence;
- Skull/Riemen remains visibly comparable;
- weekly and seasonal rhythm read as one learning concept;
- diagram semantics, horizontal scrolling and keyboard access remain intact;
- no information is removed.

## Slice 2C-2 — Touring chapter opening

Then:

1. open `.rowing-chapter-touring` mega-container;
2. open `.gig-explainer` outer shell while preserving diagram/facts;
3. convert touring examples from floating cards to an editorial three-part comparison;
4. open `.distance-callout` while preserving both event/resource links.

### Acceptance criteria

- touring section feels lighter and more editorial than racing;
- the Gigboot remains easy for a novice to understand;
- Schaalsee/Rhein/Bodensee remain clearly distinguishable;
- no generic three-card presentation survives for the touring examples;
- event logos/links remain legible and keyboard accessible.

## Slice 2C-3 — Explainer polish and conversion handoff

Finally:

1. normalize labels/rules/spacing across the explainer;
2. make injected listening tips visually quiet and consistent;
3. ensure outro hands back naturally to the next landing-page action/story section;
4. remove only redundant local radii/colors/shadows touched by 2C.

# Non-goals

- no rewriting of rowing facts unless a factual error is discovered;
- no new final Achter/Gigboot illustration in this slice;
- no removal of diagrams merely to make the page more minimal;
- no change to club finder logic;
- no redesign of `/rudern/`;
- no global token migration;
- no new animation;
- no new font or color palette.

# Verification plan

For every 2C implementation sub-slice:

1. run preview/local build;
2. inspect generated `/` after audience composition/build-time insertions;
3. check ~1440, 1024, 390 and 320 px;
4. verify the Achter diagram remains keyboard-focusable and horizontally usable;
5. verify information and source/listening links remain present;
6. verify reduced-motion behavior remains intact;
7. compare against `PRODUCT.md`: a novice must understand the material without rowing vocabulary being assumed;
8. compare against `DESIGN.md`: keep semantic learning surfaces, open narrative/container-only surfaces.
