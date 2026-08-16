# Club logo pilot — final V5 full-population regression

Date: 2026-08-16

Branch: `feat/club-logo-enrichment`

Workflow run: `31947537015`

Artifact: `club-logo-pilot-500-v5-final`

Artifact id: `9263800122`

Artifact digest: `sha256:20a9dd89e81861cddc2145b60fca3cea25fc254b8ea881c6e54d5016344c6249`

## Scope

The live DRV sync again yielded **425 website-eligible organizations**. The run used the unchanged V4 discovery/scoring pipeline (`minScore=70`, `minEntity=0.55`, concurrency 3, force refresh) followed by the V5 precision gate.

All **217 final `present` assets were visually inspected** on checkerboard-backed contact sheets, including SVG/transparent variants.

## Final V5 status distribution vs V4

| Status | V4 full 425 | V4 rate | V5 final 425 | V5 rate | Delta |
|---|---:|---:|---:|---:|---:|
| `present` | 227 | 53.4% | **217** | **51.1%** | **-10** |
| `review` | 51 | 12.0% | **58** | **13.6%** | **+7** |
| `missing` | 124 | 29.2% | **128** | **30.1%** | **+4** |
| `blocked` | 9 | 2.1% | **7** | **1.6%** | **-2** |
| `error` | 14 | 3.3% | **15** | **3.5%** | **+1** |
| **Total** | **425** | **100%** | **425** | **100%** | |

The raw status delta includes both V5 precision decisions and live-site/network variability between the two full runs.

## Precision

V4 full-population visual audit:

- `present`: 227
- correct: 220
- false positives: 7
- observed precision: **220 / 227 = 96.9%**

Final V5 visual audit:

- `present`: **217**
- correct: **217**
- false positives: **0**
- observed precision: **217 / 217 = 100.0%**

Precision therefore improves by **+3.1 percentage points**, while final `present` coverage decreases by **2.3 percentage points** (53.4% -> 51.1%).

## Seven V4 false positives — final V5 outcome

All seven are removed from `present`:

1. **RTHC Ruder-Tennis-Hockey-Club Bayer Leverkusen Ruder-Abteilung** — Bayer footer logo: `present -> review`, `v5_weak_footer_affiliation`.
2. **Ruder-Verein Nienburg e.V.** — DRV logo: `present -> missing`, `v5_foreign_organization_identity`.
3. **Ruderverein Birkenwerder e.V.** — DRV logo: `present -> missing`, `v5_foreign_organization_identity`.
4. **Ruderverein Erlangen e.V. 1911** — rowing crew photograph in `brand-logo`: `present -> review`, `v5_raster_branding_requires_review`.
5. **Ruderverein für das Große Freie e.V. Lehrte/Sehnde** — “Fonds für Digitales”: `present -> missing`, `v5_function_word_only_identity`.
6. **Landesruderverband Brandenburg e.V.** — Teamshop sub-brand: `present -> review`, `v5_commerce_or_teamshop`.
7. **Nordrhein-Westfälischer Ruderverband** — DRV logo: `present -> review`, `v5_foreign_organization_identity`.

## Additional V5 precision-gate changes

The V5 gate changed ten V4-accepted assets in the final run. Besides the seven known false positives, three genuine V4 assets were conservatively moved to review by the JPEG raster-branding rule:

- **Ruderverein Bodenwerder von 1922 e.V.** — `ruder-scaled.jpg`; visually a genuine RV Bodenwerder wordmark/logo.
- **Oldenburger Ruderverein e.V.** — `cropped-Header-neu_1_k_383.jpg`; genuine ORVO-branded header composite, already treated as a quality boundary case in V4.
- **Rudergesellschaft Germania Kiel von 1882** — `Website-Icon.jpg`; visually the genuine RGK 1882 flag/logo.

These are deliberate false-negative/recall costs of the current photo-protection rule. They do not reduce V5 precision, but they identify the main opportunity for a later precision-preserving recall pass.

## Live-site/network variability unrelated to V5 rules

Six additional V4/V5 differences came from the fresh live run rather than the V5 precision gate:

- **Ruderclub Neptun Neckarelz**: `blocked -> present`; genuine club logo now fetched successfully.
- **Ruder-Club Karlstadt 1928**: `blocked -> present`; genuine club logo now fetched successfully.
- **ESV Lok Zernsdorf**: `error -> missing`.
- **Essen-Werdener Ruder-Club**: `present -> error`; asset exceeded the 2 MiB limit in this run.
- **Steeler Ruder-Verein**: `present -> error`; HTTP 429 in this run.
- **Treptower Rudergemeinschaft** remained `review`, but the selected review source changed.

Therefore the net loss of ten `present` entries is not identical to ten V5 rejections: V5 itself demoted ten accepted assets, while two formerly blocked organizations became valid `present` and two formerly valid `present` entries became transient live errors.

## Interpretation

V5 meets the precision objective on the full eligible population: **0 observed false positives across 217 accepted assets**. This restores the observed 100% precision seen in the final 100-club regression sample and demonstrates that the five targeted precision rules address all seven new V4 error classes exposed by the larger population.

The cost is modest but measurable recall loss. Relative to V4, accepted coverage falls from 53.4% to 51.1%. Of the V5-rule-induced demotions, three are confirmed genuine branding assets and could potentially be recovered with a narrow V6 exception for raster assets that have strong visual/logo semantics without reopening the Erlangen crew-photo path.

The parent-/umbrella-club, anniversary, header-composite and low-contrast white-logo cases remain quality/governance boundary cases rather than identity false positives and were not counted against precision.