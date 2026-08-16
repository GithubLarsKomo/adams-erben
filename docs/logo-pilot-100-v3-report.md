# Club logo enrichment – 100-organization V3 regression

Generated from GitHub Actions run `31942915944` on 2026-08-16 after the targeted V3 hardening pass.

## V3 rules under test

V3 keeps the V2 global thresholds unchanged and targets the three false-positive classes found in the previous 100-organization pilot:

1. **Event/regatta logos** – event vocabulary such as `regatta`, `pokal`, `meisterschaft`, `event`, `race` is a hard negative for automatic acceptance.
2. **Sponsor logos** – normal `<img>` candidates require organization evidence on the asset itself. Page identity and the website hostname alone are insufficient. Direct evidence uses `alt`/`title`/`id`/`class` plus the URL path/file name, not the host name.
3. **Header/photo tie-breaks** – explicit `logo`, `flagge`, `wappen`, `signet` and site-identity signals outrank background/header/photo assets; event, background, photo and extreme-wide-header signals receive negative preference.

## Final status distribution

| Status | V2 | V3 final | Delta |
|---|---:|---:|---:|
| `present` | 58 | **53** | -5 |
| `review` | 14 | **20** | +6 |
| `missing` | 24 | **23** | -1 |
| `blocked` | 1 | **1** | 0 |
| `error` | 3 | **3** | 0 |
| **Total** | **100** | **100** | 0 |

V3 used the unchanged thresholds `LOGO_SYNC_MIN_SCORE=70` and entity threshold `0.55`.

## Manual review of every automatically accepted asset

All **53 `present` assets were visually reviewed** after the final V3 run.

- Automatically accepted: **53**
- Correct organization/club branding: **53/53**
- Observed false positives: **0/53**
- Observed precision in this 100-organization regression sample: **100%**

This is an observed result for this sample, not a statistical guarantee for the complete DRV population.

Known quality/presentation caveats remain separate from identity correctness, for example the white ARV Kiel logo on transparent background, low-resolution logo variants such as Donau-Ruder-Club Ingolstadt and Frankfurter RC Griesheim, and header-style branding for Erster Kieler RC and Hannoverscher RC. These are not false positives.

## Regression of the three V2 false positives

| Organization | V2 | V3 final | Result |
|---|---|---|---|
| Berliner-Ruder-Club Ägir e.V. | `present` with regatta/event logo | `review` | **fixed** – event/regatta assets are not auto-accepted |
| Bessel-Ruder-Club e.V. | `present` with Volksbank Minden sponsor logo | `review` | **fixed** – same-site hostname no longer supplies direct organization evidence |
| Crefelder Ruder-Club 1883 e.V. | `present` with header/background photo | `present` with `Flagge-Name.png` | **fixed** – explicit club identity asset wins selection |

For Bessel, the sponsor candidates (Volksbank, Melitta, Follmann) may still appear in the audit trail as `review`, but they are no longer eligible for automatic publication because they lack direct organization evidence.

## Non-present technical outcomes

- `blocked`: Akademische Ruderverbindung Alania zu Hamburg – `403 Forbidden`
- `error`: Domschulruderclub Schleswig – `500 Internal Server Error`
- `error`: Heidelberger Ruderklub 1872 – `404 Not Found`
- `error`: Hermann Billung Celle – fetch failure

## Assessment

V3 reaches the precision target in the reviewed 100-organization regression set: no false positive was observed among the 53 automatically accepted assets. The trade-off is increased conservatism: `review` rises from 14 to 20 while `present` falls from 58 to 53.

The next optimization should therefore focus on **recovering true logos from `review` without weakening the V3 acceptance boundary**. The `review` queue should be treated as a recall-improvement dataset, while `present` remains the high-precision publication tier.
