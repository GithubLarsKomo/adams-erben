# Adams Erben image prompt system

This directory contains the versioned prompt system used to create consistent imagery for the Adams Erben website.

## Structure

- `master-visual-prompt.md` defines the shared photographic visual language, historical constraints, rowing-authenticity rules and anti-AI constraints.
- `hero-skiff.md` contains the scene-specific prompt for the current photographic hero image.
- `rowing-boat-schemata.md` defines the separate editorial diagram system and matched production prompts for the `Einer · 1x` and `Achter · 8+` comparison-card schemata.

## Reproducible usage

### Photographic imagery

For photographic generated imagery, combine the **complete** master prompt with exactly one photographic scene prompt.

Recommended order:

1. Paste the full contents of `master-visual-prompt.md`.
2. Append the selected photographic scene prompt.
3. Keep the master prompt unchanged unless the photographic visual language for the whole site is intentionally revised.
4. Version every material prompt change in Git.
5. When a generated image is accepted, keep the scene prompt that produced it next to the corresponding asset history.

The shorthand photographic visual DNA is:

> observational · tactile · northern European · technically authentic · restrained · imperfect · 35mm

### Diagram / schema imagery

For schematic rowing illustrations, **do not prepend the photographic master prompt**. Use the shared diagram style lock and the appropriate boat-class prompt from `rowing-boat-schemata.md`.

The `1x` and `8+` assets must always be reviewed as a pair so that camera angle, line weight, shading, materials and visual density remain consistent. Technical rowing correctness remains a hard acceptance criterion.

## Asset relation

The prompts in this directory are intended for imagery stored under `src/assets/images/`.

- `hero-skiff.md` corresponds to the `hero-skiff` website asset family.
- `rowing-boat-schemata.md` proposes `rowing-schema-1x` and `rowing-schema-8plus` as the asset families that will replace the current `single-scull-diagram` and `eight-mini-diagram` decorative structures in `src/partials/rowing-explainer.html` after visual approval.

## Guiding principle

If cinematic beauty conflicts with historical, geographic or rowing credibility, choose credibility.

If diagram elegance conflicts with correct boat, crew, rigger or oar geometry, choose technical correctness.
