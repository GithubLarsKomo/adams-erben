# Adams Erben image prompt system

This directory contains the versioned prompt system used to create consistent imagery for the Adams Erben website.

## Structure

- `master-visual-prompt.md` defines the shared visual language, historical constraints, rowing-authenticity rules and anti-AI constraints.
- `hero-skiff.md` contains the scene-specific prompt for the current hero image.

## Reproducible usage

For every generated image, combine the **complete** master prompt with exactly one scene prompt.

Recommended order:

1. Paste the full contents of `master-visual-prompt.md`.
2. Append the selected scene prompt.
3. Keep the master prompt unchanged unless the visual language for the whole site is intentionally revised.
4. Version every material prompt change in Git.
5. When a generated image is accepted, keep the scene prompt that produced it next to the corresponding asset history.

The shorthand visual DNA is:

> observational · tactile · northern European · technically authentic · restrained · imperfect · 35mm

## Asset relation

The prompts in this directory are intended for imagery stored under `src/assets/images/`. The `hero-skiff.md` scene prompt corresponds to the `hero-skiff` website asset family.

## Guiding principle

If cinematic beauty conflicts with historical, geographic or rowing credibility, choose credibility.
