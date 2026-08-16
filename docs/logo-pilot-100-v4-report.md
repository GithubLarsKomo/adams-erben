# Club logo pilot — V4 100-club regression

Date: 2026-08-16

Branch: `feat/club-logo-enrichment`

Final workflow run: `31944631577`

Artifact: `club-logo-pilot-100-v4-final`

## Objective

V4 is a high-precision recall extension of V3. The global thresholds are unchanged:

- minimum logo score: **70**
- minimum entity confidence: **0.55**
- sample: the same first **100** website-eligible organizations from the live DRV sync

The goal was to promote ten visually verified V3 review cases without reopening the V2/V3 false-positive classes for event/regatta logos, sponsor logos and header/photo assets.

## V4 rules

### 1. Strict site-identity rule

A normal `<img>` may compensate for missing organization tokens in its filename only when it is in a narrowly defined site-identity role such as `custom-logo`, `site-logo`, `header-logo`, `brand-logo`, `navbar-brand`, `logo-image`, `logo-link`, `Seitenlogo` or equivalent theme-specific logo classes. The page must independently identify the organization and all negative/event/photo gates still apply.

This is intentionally narrower than accepting arbitrary images merely because they are in a header or navigation container.

### 2. Cosmetic background override

An explicit direct `logo`, `wappen`, `flagge`, `signet` or equivalent identity signal may neutralize a cosmetic filename/context term such as `mit-hintergrund` / `background`. Hard photo contexts such as `hero`, `slider`, `banner`, `header-image`, `header-photo`, gallery etc. remain rejecting conditions.

This addresses genuine files such as `drv1880-logo-hell-mit-hintergrund.svg` without weakening the photo/header protection.

### 3. Organization abbreviation vocabulary

Acronym construction now understands compound organization terms such as:

- `Eisenbahnsportverein` → `ESV`
- `Sportverein` → `SV`
- `Turnverein` → `TV`
- `Wassersportverein` → `WSV`

Founding years are ignored when constructing acronyms, so examples such as `FRGO` and `GTRV` are generated instead of year-contaminated variants.

After the first live V4 run, acronym evidence was further hardened: a bare acronym in an ordinary image filename is **not** sufficient direct identity evidence. For `<img>` candidates it must be accompanied by explicit logo/wappen/flagge/signet semantics or a strict site-identity role. Years continue to participate in general entity matching; they are ignored only for acronym construction.

## Regression tests

### Ten positive V3 → V4 promotions

All ten requested positive regression cases pass and all ten are `present` in the final live run:

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

### Requested negative counterexamples

All remain outside automatic acceptance:

- **Berliner-Ruder-Club Ägir e.V.** — event/regatta logo stays rejected; final organization status is `missing`.
- **Bessel-Ruder-Club e.V.** — Volksbank/Melitta/Follmann sponsor assets do not qualify as club identity; final status remains `review`.
- **Frauen-Ruderverein "Freiweg" Frankfurt e.V. 1927** — `Logo_Jugend.jpg` is not promoted as the primary club logo; final status remains `review`.

### Additional live negative regressions

The first V4 live run exposed two previously unseen false-positive paths. Both were fixed and added to CI:

- **Alster-Ruderverein Hanseat** — an article/sustainability infographic mentioning the organization was temporarily accepted. It now lacks qualified direct asset identity and the organization returns to `review`.
- **Cochemer Rudergesellschaft** — a portrait photo whose filename contained only the acronym `CRG` was temporarily accepted. Bare acronym evidence in ordinary images no longer qualifies; the organization is `missing` in the final run.

The extra regression file is `scripts/lib/logo-discovery-v4-live-regression.test.mjs` and is part of `npm run test:logos`.

## Final status distribution

| Status | V3 final | V4 final | Delta |
|---|---:|---:|---:|
| `present` | 53 | **59** | **+6** |
| `review` | 20 | **9** | **-11** |
| `missing` | 23 | **29** | **+6** |
| `blocked` | 1 | **1** | 0 |
| `error` | 3 | **2** | -1 |
| **Total** | **100** | **100** | |

The final V4 run reported `eligible=100`, `scheduled=100`, `cached=0`, `present=59`, `review=9`, `missing=29`, `blocked=1`, `error=2`.

## Precision

All **59** final `present` assets were visually inspected.

- correct organization/club identity: **59**
- false positives: **0**
- observed precision: **59 / 59 = 100%**

This is an observed precision for this 100-organization regression sample, not a statistical guarantee for the complete DRV population.

For transparency, the **first un-hardened V4 live run** had 64 `present`, of which two were false positives (Alster infographic and Cochem portrait), i.e. 62/64 = 96.875% observed precision. Those two failure modes were converted into regression tests before the final run. The final hardened run restored observed precision to 100%.

## V3 → final V4 status changes

There are 19 status changes in the live sample:

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

### Present → review/missing: 5 conservative regressions

- Anklamer Ruderklub e.V.: `present → review`
- Bernkasteler Ruderverein 1874 e.V.: `present → review`
- Celler Ruderverein e.V.: `present → missing`
- Hammerdeicher Ruder-Verein von 1893 e.V.: `present → missing`
- no false-positive asset is introduced by these changes; they reduce recall only.

### Review → missing: 4 stricter/no-qualified-candidate outcomes

- Bacharacher Ruder-Verein 1884 e.V.
- Berliner-Ruder-Club Ägir e.V.
- Cochemer Rudergesellschaft 1905 e.V.
- Eschweger Ruderverein e.V.

### Error → review: 1 live-fetch improvement

- Domschulruderclub Schleswig e.V.: `error → review`

The total counts also reflect live-site/network variability between runs. In particular, status changes caused by availability or changed page markup should not be interpreted as pure classifier performance changes.

## Same-status source change

One organization remained `present` but selected a different local club asset:

- Hannoverscher Ruder-Club von 1880 e.V.: V3 `kopf_hrc_streifen.png` → V4 `kopf_hrc_flagge.gif`; both are genuine HRC branding.

## Remaining reviews

The final nine `review` cases are:

1. Akademische Rudergesellschaft zu Berlin e.V.
2. Alster-Ruderverein Hanseat von 1925 e.V.
3. Anklamer Ruderklub e.V.
4. Bernkasteler Ruderverein 1874 e.V.
5. Bessel-Ruder-Club e.V.
6. Bootsclub Nordhorn e.V.
7. Creuznacher Ruderverein 1876 e.V.
8. Domschulruderclub Schleswig e.V.
9. Frauen-Ruderverein "Freiweg" Frankfurt e.V. 1927

The precision-first policy should keep these in review until their asset-specific evidence can be strengthened without widening the global acceptance surface.

## Conclusion

V4 achieves the intended result on the regression sample:

- all ten explicitly targeted genuine logos moved from `review` to `present`;
- the requested Ägir/Bessel/Freiweg safeguards remain intact;
- two additional false-positive patterns discovered in the first live V4 pass are now permanently regression-tested;
- final observed automatic-accept precision is **100% (59/59)**;
- automatic coverage improves from **53% to 59%** of the 100-organization sample while retaining the high-precision boundary.
