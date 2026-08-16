# Club logo pilot — V4 100-club regression

Date: 2026-08-16  
Branch: `feat/club-logo-enrichment`  
Final workflow run: `31944631577`  
Artifact: `club-logo-pilot-100-v4-final`

## Objective

V4 is a high-precision recall extension of V3. Global thresholds remain unchanged: minimum logo score **70**, minimum entity confidence **0.55**, same first **100** website-eligible organizations from the live DRV sync.

## V4 rules

### 1. Strict site identity

A normal `<img>` may compensate for missing organization tokens only in narrowly defined identity roles such as `custom-logo`, `site-logo`, `header-logo`, `brand-logo`, `navbar-brand`, `logo-image`, `logo-link`, `Seitenlogo` or equivalent theme-specific logo classes. The page must independently identify the organization and all negative/event/photo gates remain active.

### 2. Cosmetic background override

An explicit direct `logo`, `wappen`, `flagge`, `signet` or equivalent identity signal may neutralize only a cosmetic `mit-hintergrund` / `background` term. Hard photo contexts such as `hero`, `slider`, `banner`, `header-image`, `header-photo` and galleries remain rejecting conditions.

### 3. Organization abbreviation vocabulary

Acronym construction now understands compound organization terms such as `Eisenbahnsportverein → ESV`, `Sportverein → SV`, `Turnverein → TV`, and `Wassersportverein → WSV`. Founding years are ignored only when constructing acronyms, enabling forms such as `FRGO` and `GTRV`.

After the first live V4 run the rule was hardened: a bare acronym in an ordinary image filename is not sufficient direct identity evidence. For `<img>` candidates it must be accompanied by explicit logo/wappen/flagge/signet semantics or strict site identity. Years continue to participate in general entity matching.

## Regression tests

All ten requested positive V3 → V4 promotions pass and are `present` in the final live run:

| Organization | V3 | V4 final | Final source |
|---|---|---|---|
| Akademischer Ruder-Club zu Münster e.V. | review | **present** | `image-455x181.png` |
| Binger Rudergesellschaft 1911 e.V. | review | **present** | `logo_ww.png` |
| Bonner Ruder-Verein 1882 e.V. | review | **present** | `Logo-ohne-Schriftzug-gerade.png` |
| Club für Wassersport Porz e.V. 1926 | review | **present** | `CfWP_Logo.png` |
| Deutscher Ruder-Club von 1884 e.V. | review | **present** | `Logo_randlos_klein.png` |
| Frankfurter Ruder-Gesellschaft Oberrad 1879 e.V. | review | **present** | `cropped-100px_wappen.png` |
| Gymnasial-Turn-Ruder-Verein Neuwied 1882 e.V. | review | **present** | `logo_2020_600.png` |
| Hersfelder Ruderverein 1977 e.V. | review | **present** | `neu_logo.png` |
| Düsseldorfer Ruderverein 1880 e.V. | review | **present** | `drv1880-logo-hell-mit-hintergrund.svg` |
| Eisenbahnsportverein Schmöckwitz e.V. Abt. Rudern | review | **present** | `cropped-ESV_Flagge_staab_250x250.png` |

Requested negative counterexamples remain outside automatic acceptance:

- **Berliner-Ruder-Club Ägir e.V.** — event/regatta assets rejected; final status `missing`.
- **Bessel-Ruder-Club e.V.** — sponsor assets do not qualify; final status `review`.
- **Frauen-Ruderverein "Freiweg" Frankfurt e.V. 1927** — `Logo_Jugend.jpg` is not promoted; final status `review`.

The first un-hardened V4 live run exposed two additional false-positive paths, now permanent CI regressions in `scripts/lib/logo-discovery-v4-live-regression.test.mjs` and included in `npm run test:logos`:

- **Alster-Ruderverein Hanseat** — sustainability/article infographic mentioning the club; now `review`.
- **Cochemer Rudergesellschaft** — portrait photo with bare `CRG` acronym in filename; now `missing`.

## Final status distribution

| Status | V3 final | V4 final | Delta |
|---|---:|---:|---:|
| `present` | 53 | **59** | **+6** |
| `review` | 20 | **9** | **-11** |
| `missing` | 23 | **29** | **+6** |
| `blocked` | 1 | **1** | 0 |
| `error` | 3 | **2** | -1 |
| **Total** | **100** | **100** | |

Final V4 run: `eligible=100`, `scheduled=100`, `cached=0`, `present=59`, `review=9`, `missing=29`, `blocked=1`, `error=2`.

## Precision

All **59** final `present` assets were visually inspected:

- correct organization/club identity: **59**
- false positives: **0**
- observed precision: **59/59 = 100%**

This is observed precision for this 100-organization regression sample, not a statistical guarantee for the complete DRV population.

For transparency, the first un-hardened V4 live run had 64 `present` with two false positives (Alster infographic, Cochem portrait), i.e. **62/64 = 96.875%**. Both failure modes were converted into regression tests before the final run. The hardened final run restored observed precision to 100%.

## V3 → final V4 status changes

There are **19** status changes:

### Review → present: 10 intended promotions

1. Akademischer Ruder-Club zu Münster e.V.
2. Binger Rudergesellschaft 1911 e.V.
3. Bonner Ruder-Verein 1882 e.V.
4. Club für Wassersport Porz e.V. 1926
5. Deutscher Ruder-Club von 1884 e.V.
6. Düsseldorfer Ruderverein 1880 e.V.
7. Eisenbahnsportverein Schmöckwitz e.V. Abt. Rudern
8. Frankfurter Ruder-Gesellschaft Oberrad 1879 e.V.
9. Gymnasial-Turn-Ruder-Verein Neuwied 1882 e.V.
10. Hersfelder Ruderverein 1977 e.V.

### Present → review/missing: 4 conservative recall losses

- Anklamer Ruderklub e.V.: `present → review`
- Bernkasteler Ruderverein 1874 e.V.: `present → review`
- Celler Ruderverein e.V.: `present → missing`
- Hammerdeicher Ruder-Verein von 1893 e.V.: `present → missing`

### Review → missing: 4 stricter/no-qualified-candidate outcomes

- Bacharacher Ruder-Verein 1884 e.V.
- Berliner-Ruder-Club Ägir e.V.
- Cochemer Rudergesellschaft 1905 e.V.
- Eschweger Ruderverein e.V.

### Error → review: 1 live-fetch improvement

- Domschulruderclub Schleswig e.V.: `error → review`

These totals also reflect live-site/network variability between runs; availability and markup changes are not pure classifier effects.

One organization remained `present` but selected another genuine asset: Hannoverscher Ruder-Club von 1880 e.V. changed from `kopf_hrc_streifen.png` to `kopf_hrc_flagge.gif`.

## Remaining reviews

1. Akademische Rudergesellschaft zu Berlin e.V.
2. Alster-Ruderverein Hanseat von 1925 e.V.
3. Anklamer Ruderklub e.V.
4. Bernkasteler Ruderverein 1874 e.V.
5. Bessel-Ruder-Club e.V.
6. Bootsclub Nordhorn e.V.
7. Creuznacher Ruderverein 1876 e.V.
8. Domschulruderclub Schleswig e.V.
9. Frauen-Ruderverein "Freiweg" Frankfurt e.V. 1927

## Conclusion

V4 achieves the intended precision-first recall improvement on the regression sample: all ten targeted genuine logos move to `present`; Ägir/Bessel/Freiweg remain protected; two additional live false-positive modes are now regression-tested; observed final automatic-accept precision is **100% (59/59)**; automatic coverage improves from **53% to 59%** without lowering the global thresholds.
