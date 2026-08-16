# Shared Adams-Erben Site Shell

## Ziel

Header, Branding, Navigation, Mobile-Menü, persistenter Vereins-CTA und Footer werden aus genau einer Build-Komponente erzeugt. Inhaltsseiten dürfen diese Elemente nicht mehr eigenständig implementieren oder im Nachgang verändern.

## Scope dieser ersten Refactoring-Etappe

Diese Etappe gilt zunächst für die beiden bereits erzeugten Audience-Seiten:

- `/`
- `/rudern/`

Die SEO-Detailseiten werden in einer Folgeetappe portiert. Bis dahin wird deren Inhalt nicht in diesen Branch übernommen.

## Architektur

### Kanonische Quellen

- `src/partials/site-header.html` – struktureller Header
- `src/partials/site-footer.html` – struktureller Footer
- `src/assets/site-shell.css` – ausschließlich Shell-/Header-/Footer-Layout
- `src/assets/site-shell.js` – ausschließlich Hamburger-/ARIA-Verhalten
- `scripts/lib/site-shell.mjs` – Shell-Konfiguration und Rendering
- `scripts/apply-site-shell.mjs` – letzter Layout-Schritt für die erzeugten Audience-Seiten
- `scripts/validate-site-shell.mjs` – strukturelle Regressionen

### Zuständigkeiten

Die Site-Shell besitzt:

- Adams-Erben-Logo und Mobile-Marke
- Header und primäre Navigation
- mobilen persistenten CTA
- Hamburger-Menü
- Skip-Link-Ziel
- Footer

Die jeweilige Seite besitzt:

- `<main>` und dessen Inhalte
- Hero, Sektionen, Bilder, Tabellen und sonstige Inhaltskomponenten
- audience-spezifische Texte und interne Anker

`app.js` bleibt für Vereinssuche und Kontaktlogik zuständig und enthält keine Shell-Navigation.

## Build-Reihenfolge Phase 1

1. `scripts/build.mjs`
2. `scripts/apply-club-logo-manifest.mjs`
3. `scripts/split-audiences.mjs`
4. `scripts/apply-site-shell.mjs`
5. `scripts/validate-site-shell.mjs`

Die Shell wird nach dem Audience-Split angewendet, damit `/` und `/rudern/` dieselbe Struktur nutzen, aber unterschiedliche Navigationsziele und CTA-Texte erhalten können.

## Varianten

### landing

Navigation:

- Adams Acht
- Ratzeburg
- Stimmen
- Mehr entdecken
- Desktop-CTA: Rudern ausprobieren

Mobiler persistenter CTA: `Rudern ausprobieren`, kompakt `Verein finden`.

### rowing

Navigation:

- Für Einsteiger
- Adams Labor
- Einordnung
- Ruderakademie
- Rudern verstehen
- Stimmen
- Desktop-CTA: Verein finden

Mobiler persistenter CTA: `Verein finden`.

## Invarianten

Für jede von der Shell verwaltete Seite gilt nach dem Build:

- genau ein `.site-header`
- genau ein `#primary-navigation`
- genau eine `.menu-toggle`
- genau eine `.header-find-club`
- genau ein `.site-footer`
- `/assets/site-shell.css` ist geladen
- `/assets/site-shell.js` ist geladen
- `/assets/story-nav.js` ist nicht mehr geladen
- das Branding enthält keinen alten `AE`-Textknoten
- Logo und Mobile-Marke stammen aus `/assets/images/adams-erben-logo.png` und `/assets/images/adams-erben-mark.png`

## Nicht-Ziele dieser Etappe

Noch nicht Bestandteil:

- Portierung der SEO-Detailseiten
- vollständige Entfernung aller historischen Header-Regeln aus `styles.css`, `story-flow.css` und `mobile-fixes.css`
- Entfernung der noch im Basis-HTML vorhandenen Zwischen-Header-Erzeugung in `build.mjs`

Diese Altregeln werden in einer Folgeetappe entfernt. `site-shell.css` wird bis dahin bewusst zuletzt geladen und definiert die endgültige Shell im Build-Output.

## Definition of Done Phase 1/2

- `/` und `/rudern/` werden nach dem Split durch dieselbe Header-/Footer-Partial finalisiert.
- Auf <= 920 px ist die Navigation nicht horizontal scrollbar, sondern als Hamburger-Menü verfügbar.
- Logo, Außenbreite und Header-Verhalten sind auf beiden Audience-Seiten identisch.
- Der jeweils passende CTA bleibt mobil sichtbar.
- `npm run build` und `npm run build:local` führen die Shell-Anwendung und -Validierung aus.
- Die bestehende Vereinssuche bleibt funktional unverändert.
