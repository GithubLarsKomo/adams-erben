# Club logo pilot — V4 500-limit regression

Date: 2026-08-16

Branch: `feat/club-logo-enrichment`

Workflow run: `31945639144`

Artifact: `club-logo-pilot-500-v4`

## Scope

The V4 classifier itself was not changed for this run. Only the pilot harness changed from `LOGO_SYNC_LIMIT=100` to `LOGO_SYNC_LIMIT=500`; score/entity thresholds and concurrency stayed unchanged:

- minimum logo score: **70**
- minimum entity confidence: **0.55**
- concurrency: **3**
- force refresh: **1**

The live DRV dataset contained only **425 website-eligible organizations**, therefore the requested 500-limit run scheduled and processed **425**, not 500. This is the full eligible population produced by that sync for this pipeline.

## Status distribution

| Status | final V4 100 | V4 500-limit / 425 eligible | Rate in 425 | New organizations 101–425 |
|---|---:|---:|---:|---:|
| `present` | 59 | **227** | **53.4%** | 168 / 325 (51.7%) |
| `review` | 9 | **51** | **12.0%** | 43 / 325 (13.2%) |
| `missing` | 29 | **124** | **29.2%** | 96 / 325 (29.5%) |
| `blocked` | 1 | **9** | **2.1%** | 8 / 325 (2.5%) |
| `error` | 2 | **14** | **3.3%** | 10 / 325 (3.1%) |
| **Total** | **100** | **425** | **100%** | **325** |

For the same first 100 organizations inside the 425 run, `present` remained exactly **59** and the accepted source set was unchanged. Two non-present statuses changed due to live-site/network variability: Domschulruderclub Schleswig `review → error` and ESV Lok Zernsdorf `missing → error`.

## Manual precision review

All **227** automatically accepted assets were visually inspected. The original first-100 accepted set remains **59/59 correct**. Among the **168 newly exposed accepted assets** (organizations outside the prior 100), seven clear false positives were found.

### New clear false positives

1. **RTHC Ruder-Tennis-Hockey-Club Bayer Leverkusen Ruder-Abteilung** — selected `logo-bayer-footer-…png`, the Bayer corporate/footer logo. The actual RTHC logo was present as a candidate but stayed in review at entity confidence 0.54.
2. **Ruder-Verein Nienburg e.V.** — selected `drv_logo.png`, visually the Deutscher Ruderverband logo.
3. **Ruderverein Birkenwerder e.V.** — selected `Deutscher_Ruderverband_Logo_2007…png`, visually the DRV logo.
4. **Ruderverein Erlangen e.V. 1911** — selected `erlanger8er.jpg`, a rowing crew photograph. The HTML labels it with the club name and `brand-logo`, but the bitmap is not a logo.
5. **Ruderverein für das Große Freie e.V. Lehrte/Sehnde** — selected `Logo-Fonds-fur-Digitales…png`, the unrelated “Fonds für Digitales” mark.
6. **Landesruderverband Brandenburg e.V.** — selected `Logo_Teamshop.png`, visually “89 TEAMSHOP SANSSOUCI”, not the association logo.
7. **Nordrhein-Westfälischer Ruderverband** — selected `Deutscher_Ruderverband_Logo_2007_black.svg`, the DRV logo rather than the NWRV logo.

Using the same identity/logo correctness criterion as the 100-run audit:

- correct `present`: **220**
- false positives: **7**
- observed overall precision: **220 / 227 = 96.9%**
- prior-100 precision inside the run: **59 / 59 = 100%**
- new accepted population only: **161 / 168 = 95.8%**

The drop versus the final 100 regression sample is therefore **3.1 percentage points overall**, while the genuinely new sample is about **4.2 percentage points below 100%**.

## Root causes of the seven false positives

### Foreign/umbrella rowing-association logos

Nienburg, Birkenwerder and NWRV show that V4 still lacks a sufficiently strong candidate-specific distinction between the target club/association and another rowing association logo on the same page. Short alias matching is especially risky when abbreviations can occur inside another acronym (`RV` inside `DRV`).

### Unrelated logo with weak token overlap

The “Fonds für Digitales” case demonstrates that a weak normalized token such as German `für`/`fur` can currently count as direct organization evidence. Such grammatical stop words must not establish asset identity.

### Site/section metadata can lie about image semantics

The Erlangen crew photo is marked by the site as `brand-logo` and carries the club name as label. V4 trusts this structural signal, but the raster is a photographic header/crew image. DOM semantics alone are therefore insufficient for photo-like raster assets.

### Merchandising / corporate affiliation

The Bayer footer logo and the LRV Brandenburg teamshop mark show two missing negative-context classes: corporate/footer affiliation and shop/teamshop/merchandising sub-brands can contain strong target-page identity while still not being the organization's logo.

## Grenzfälle (not counted as hard false positives)

These assets identify the organization or a closely related umbrella/sub-brand, but are not ideal canonical rowing-club logos. They should remain visible in quality/review analysis when the pipeline is hardened further.

### Sub-brand / temporal variant

- **Ruder-Club Aken e.V.** — `kirchboot_logo_start.jpg`; a “Kirchboot Aken” sub-brand rather than a clean canonical club mark.
- **Ruderclub Meschede e.V.** — `RCM_Logo_60.jpg`; genuine club identity but a **60-year anniversary** variant.

### Parent / umbrella organization branding for a rowing department

- **Ruder-Riege der Turngemeinde in Berlin 1848 e.V.** — TiB 1848 parent-club logo.
- **Ruderabteilung Schloss Gaienhofen** — Schloss Gaienhofen school/institution logo, not rowing-specific.
- **Post und Telekom Sportgemeinschaft Lübbecke e.V.** — PTSG umbrella-sports logo.
- **Pro Sport Berlin 24 e.V.** — umbrella-sports organization logo.
- **Sportgemeinschaft DEMAG e.V. Wetter** — multisport organization logo (tennis/rowing/sailing).
- **Sportverein Energie Berlin e.V. Abt. Rudern** — parent-sports-club branding rather than a separately isolated rowing-section mark.
- **Sportvereinigung Scharnebeck e.V. Ruderabteilung** — parent-club branding.
- **TSV Herrsching - Abt. Wassersport** — watersport/parent-club icon rather than an isolated rowing mark.

These are not counted as identity false positives because the displayed organization is the legal/umbrella organization represented by the DRV entry, but they are less specific than a rowing-section logo.

### Header/branding composites

- **Oldenburger Ruderverein e.V.** — `cropped-Header-neu_1_k_383.jpg`; genuine ORVO branding embedded in a wide photographic/header strip.
- **Würzburger Ruderverein Bayern von 1875/1905 e.V.** — `cropped-cropped-wrvb_header_03.jpg`; genuine club-branded header/photo composite rather than an isolated logo.

These mirror the existing quality-only treatment of other genuine header-branding assets; they are not counted as false identities.

### White / low-contrast variants

The following are genuine marks but render nearly invisible on a white background and therefore need a presentation-quality rule or dark backing rather than identity rejection:

- Mühlheimer Ruderverein 1911 e.V. — `dark-logo@100.png` (white transparent variant despite filename)
- Preetzer Ruderclub e.V. — `preetzer-ruderclub-signet.svg`
- Ruderverein Treviris 1921 e.V. — `treviris_100_gold_trans_white.png`
- Saarbrücker Rudergesellschaft Undine e.V. — `logo_sw_gross.png`
- Schleissheimer Ruderclub e.V. — `src-logo.png`
- Siegburger Ruderverein 1910 e.V. — `SRV_Logo_rund_mit_Ruderer_white.png`
- Wolfsburger Ruder-Club e.V. — `kreuz.png`

## Comparison with the final 100-run

The first 100 were heavily hardened through V2→V4 regressions and retained **100% observed precision** in this larger live run. The expansion to 325 additional eligible organizations reveals that the 100-case result did not generalize at the same level: new-only observed precision is **95.8%**, and full-population precision is **96.9%**.

Coverage also falls modestly from **59% `present` in the regression 100** to **53.4% in all 425 eligible organizations**. Review rises from **9% to 12.0%**, while missing stays almost unchanged proportionally (29.0% → 29.2%). Blocked/error rates are higher in the larger and more heterogeneous population.

## Recommended next hardening step

Do not lower thresholds. A V5 precision pass should add narrow regression rules for the seven hard false positives:

1. token-boundary-aware acronym matching so `RV` cannot match inside `DRV` and foreign association acronyms cannot satisfy target identity;
2. German grammatical stopwords such as `für/fur` excluded from organization identity evidence;
3. explicit negative vocabulary for `teamshop`, `shop`, merchandise and affiliation/footer partner assets;
4. candidate identity conflict: visible/labelled `Deutscher Ruderverband` must reject when the target is not DRV, and analogous full-name conflicts should outweigh page identity;
5. photo-likeness/raster protection for `.jpg/.jpeg` brand/header assets when the selected bitmap is a photograph rather than a mark, even if DOM classes say `brand-logo`;
6. keep parent/sub-brand/header/white variants as quality or specificity reviews, not as hard false identities unless policy explicitly requires rowing-section-specific marks.

The seven false positives should become negative regression fixtures before the next population run.