# Shared Adams-Erben Site Shell

## Ziel

Header, Branding, Navigation, Mobile-Menü, persistenter Vereins-CTA und Footer werden aus genau einer Build-Komponente erzeugt. Der finale Build-Output darf diese Elemente nicht mehr seitenweise implementieren oder durch SEO-/Audience-Postprocessing verändern.

## Aktueller Scope

Die gemeinsame Shell gilt für alle aktuell erzeugten öffentlichen HTML-Seiten:

- `/`
- `/rudern/`
- `/karl-adam/`
- `/adams-acht/`
- `/deutschlandachter-1960/`
- `/ratzeburg/`
- `/karl-adam-trainingsmethoden/`
- `/rudern-verstehen/`
- `/rudern-lernen/`
- `/ruderverein-finden/`
- `/ueber-adams-erben/`

Die neun SEO-Detailseiten wurden selektiv aus `feat/seo-discoverability` übernommen. Es erfolgte ausdrücklich kein pauschaler Merge des divergierten SEO-Branches.

## Architektur

### Kanonische Shell-Quellen

- `src/partials/site-header.html` – struktureller Header
- `src/partials/site-footer.html` – struktureller Footer
- `src/assets/site-shell.css` – alleinige CSS-Zuständigkeit für Header, Brand, Navigation, Hamburger, persistenten CTA und Footer
- `src/assets/site-shell.js` – ausschließlich Hamburger-/ARIA-Verhalten
- `scripts/lib/site-shell.mjs` – Shell-Varianten und Rendering
- `scripts/apply-site-shell.mjs` – finaler Layout-Schritt für alle erzeugten Seiten
- `scripts/validate-site-shell.mjs` – strukturelle, Source-Hygiene-, Navigations- und CSS-Ownership-Regressionen

### Zuständigkeiten

Die Site-Shell besitzt:

- Adams-Erben-Logo und Mobile-Marke
- Header und primäre Navigation
- mobilen persistenten CTA
- Hamburger-Menü
- Skip-Link-Ziel
- Footer
- responsive Header-Höhe und Sticky-/Fixed-Verhalten

Die jeweilige Seite besitzt:

- `<main>` und dessen Inhalte
- Hero, Sektionen, Bilder, Tabellen und sonstige Inhaltskomponenten
- audience-spezifische Texte und interne Anker
- Breadcrumbs und Detailkarten

SEO besitzt:

- `<title>` und Description
- Canonical URL
- Open Graph / Twitter-Metadaten
- JSON-LD
- Sitemap und robots.txt
- inhaltliche Crosslinks

SEO besitzt ausdrücklich **nicht** Header, Navigation, Skip-Link oder Footer.

`app.js` bleibt für Vereinssuche und Kontaktlogik zuständig und enthält keine Shell-Navigation.

## Build-Reihenfolge

1. `scripts/build.mjs`
2. `scripts/apply-club-logo-manifest.mjs`
3. `scripts/split-audiences.mjs`
4. `scripts/postbuild-seo.mjs`
5. `scripts/apply-site-shell.mjs`
6. `scripts/validate-site-shell.mjs`
7. `scripts/validate-seo-output.mjs`

Die Shell wird bewusst **nach** Audience-Split und SEO-Postprocessing angewendet. Danach darf kein Build-Schritt Header oder Footer verändern.

## Shell-Varianten

### landing

Für `/`.

Navigation:

- Adams Acht
- Ratzeburg
- Stimmen, sofern die Sektion im jeweiligen Build vorhanden ist
- Mehr entdecken
- Desktop-CTA: Rudern ausprobieren

Mobiler persistenter CTA: `Rudern ausprobieren`, kompakt `Verein finden`.

### rowing

Für `/rudern/`.

Navigation:

- Für Einsteiger
- Adams Labor
- Einordnung
- Ruderakademie
- Rudern verstehen
- Stimmen, sofern die Sektion im jeweiligen Build vorhanden ist
- Desktop-CTA: Verein finden

Mobiler persistenter CTA: `Verein finden`.

### content

Für alle SEO-Detailseiten.

Navigation:

- Adams Acht
- Karl Adam
- Ratzeburg
- Rudern
- Über
- Verein finden

Skip-Link: `#inhalt`.
Persistenter CTA: `/ruderverein-finden/`.

Der aktuelle Pfad wird bei exakter Übereinstimmung mit `aria-current="page"` markiert.

## SEO-Integration

`scripts/postbuild-seo.mjs` ist shell-neutral. Es setzt ausschließlich SEO-, Produktions-/Preview- und inhaltliche Crosslink-Aspekte. Die dort verbliebene Entfernung eventueller Legacy-Shell-Fragmente ist nur noch eine defensive Sicherung; die neun SEO-Quelldokumente selbst enthalten keine eigene Shell mehr.

Die zentrale SEO-Konfiguration umfasst zehn Kernseiten. `/rudern/` ist zusätzlich eine bekannte Audience-Seite und wird bei der internen Linkvalidierung als gültiger interner Pfad akzeptiert, ohne die SEO-Kernseitenzahl zu verändern.

## Source-Hygiene der SEO-Seiten

Die neun statischen SEO-Quelldokumente enthalten ausschließlich ihren Seiteninhalt und keine Shell-eigenen Fragmente mehr. In `src/.../index.html` sind für diese Seiten verboten:

- `.site-header`
- `.site-footer`
- `.detail-footer`
- `.skip-link`

Erhalten bleiben müssen genau ein `main#inhalt` sowie der inhaltliche `.detail-hero`. `scripts/validate-site-shell.mjs` prüft diese Regeln direkt gegen die Quelldateien, bevor ein erfolgreicher Build akzeptiert wird.

## CSS-Ownership

Folgende Dateien dürfen keine Shell-Selektoren mehr besitzen:

- `src/assets/styles.css`
- `src/assets/mobile-fixes.css`
- `src/assets/story-flow.css`
- `src/assets/audience-pages.css`
- `src/assets/detail-page.css`

Header, Brand, Navigation, Hamburger, persistenter CTA und Footer liegen ausschließlich in `src/assets/site-shell.css`.

`detail-page.css` enthält nur Detailseitenkomponenten. Für lange deutsche Überschriften wie „Deutschlandachter“ gelten explizite `hyphens`-/`overflow-wrap`-Regeln und ein mobiler H1-Scale.

## Invarianten

Für jede von der Shell verwaltete Seite gilt nach dem Build:

- genau ein `.site-header`
- genau ein `#primary-navigation`
- genau eine `.menu-toggle`
- genau eine `.header-find-club`
- genau ein `.site-footer`
- keine `.detail-footer`
- `/assets/site-shell.css` ist genau einmal geladen
- `/assets/site-shell.js` ist genau einmal geladen
- `/assets/story-nav.js` ist nicht mehr geladen
- das Branding enthält keinen alten `AE`-Textknoten
- Logo und Mobile-Marke stammen aus `/assets/images/adams-erben-logo.png` und `/assets/images/adams-erben-mark.png`
- In-Page-Links der Shell zeigen nur auf tatsächlich vorhandene Ziele
- Content-Seiten besitzen `#inhalt` und der Skip-Link zeigt darauf
- Content-Seiten verlinken den persistenten Vereins-CTA auf `/ruderverein-finden/`

Für die neun SEO-Quellen gilt zusätzlich vor dem Build:

- kein eigener Header oder Footer
- kein eigener Shell-Skip-Link
- genau ein `main#inhalt`
- genau ein `.detail-hero`

## CI-Gates

CI prüft:

- JavaScript-Syntax der Build-, Shell- und SEO-Skripte
- bestehende Logo-, DRV-, Snapshot- und Nearest-Regressionen
- lokalen Production-Build mit Seed-Daten
- Shell-Struktur aller 11 Seiten
- Shell-Freiheit der neun SEO-Quelldateien
- CSS-Ownership
- tote In-Page-Shell-Links
- SEO-Ausgabe aller zehn Kernseiten
- Audience-Split
- E-Mail-Freiheit der öffentlichen Browserdaten
- Routing-Metadaten
- separaten Preview-Build mit `PREVIEW_MODE=1`, einschließlich Shell- und SEO-Validierung
- PHP-Syntax

## Definition of Done Etappen 1–6

- `/` und `/rudern/` verwenden dieselbe kanonische Header-/Footer-Quelle.
- Die neun SEO-Detailseiten sind in den Integrationsbranch portiert und erhalten im Build ausschließlich die gemeinsame `content`-Shell.
- Die neun SEO-Quelldateien enthalten physisch keine historischen Header-, Footer- oder Skip-Link-Fragmente mehr.
- SEO-Postprocessing verändert keine Header-/Footer-Navigation.
- Legacy-Shell-CSS wurde aus Base-, Story-, Mobile-, Audience- und Detail-CSS entfernt.
- Auf <= 920 px ist die Navigation nicht horizontal scrollbar, sondern als Hamburger-Menü verfügbar.
- Logo, Außenbreite und Header-Verhalten sind über alle Seiten konsistent.
- Der passende CTA bleibt mobil sichtbar.
- `npm run build` und `npm run build:local` führen Shell- und SEO-Gates aus.
- Production und Preview werden in CI separat gebaut und validiert.
- Die bestehende Vereinssuche bleibt funktional unverändert.
