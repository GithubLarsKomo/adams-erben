# Shared Adams-Erben Site Shell

## Ziel

Adams Erben hat zwei klar getrennte, nutzerorientierte Inhaltsoberflächen: die kurze Einstiegsseite `/` und die vertiefende Ruderseite `/rudern/`. Header, Branding, Navigation, Mobile-Menü, persistenter Vereins-CTA und Footer werden für beide aus genau einer Build-Komponente erzeugt.

SEO unterstützt diese beiden Produktseiten technisch. Es erzeugt keine zusätzlichen, inhaltlich redundanten Landing- oder Detailseiten.

## Öffentlicher Scope

Die gemeinsame Shell und die zentrale SEO-Konfiguration gelten für genau:

- `/` – Einstieg für Kinobesucher und Interessierte
- `/rudern/` – redaktionelle und fachliche Vertiefung

Die zuvor aus `feat/seo-discoverability` übernommenen neun SEO-Detailseiten wurden aus Produktgründen wieder entfernt:

- `/karl-adam/`
- `/adams-acht/`
- `/deutschlandachter-1960/`
- `/ratzeburg/`
- `/karl-adam-trainingsmethoden/`
- `/rudern-verstehen/`
- `/rudern-lernen/`
- `/ruderverein-finden/`
- `/ueber-adams-erben/`

Diese Routen dürfen weder als Source-Dateien noch im Build-Output, in der Sitemap oder als interne Links wieder auftauchen, solange keine neue Produktentscheidung ihre Wiedereinführung vorsieht.

## Architektur

### Kanonische Shell-Quellen

- `src/partials/site-header.html` – struktureller Header
- `src/partials/site-footer.html` – struktureller Footer
- `src/assets/site-shell.css` – alleinige CSS-Zuständigkeit für Header, Brand, Navigation, Hamburger, persistenten CTA und Footer
- `src/assets/site-shell.js` – ausschließlich Hamburger-/ARIA-Verhalten
- `scripts/lib/site-shell.mjs` – Shell-Varianten und Rendering
- `scripts/apply-site-shell.mjs` – finaler Layout-Schritt für beide Produktseiten
- `scripts/validate-site-shell.mjs` – strukturelle, Navigations- und CSS-Ownership-Regressionen

### Zuständigkeiten

Die Site-Shell besitzt Logo, Header, primäre Navigation, mobilen persistenten CTA, Hamburger-Menü, Skip-Link, Footer und responsive Header-Geometrie.

Die Produktseiten besitzen `<main>`, Hero, Sektionen, Bilder, redaktionelle Inhalte, Vereinssuche und interne Anker.

SEO besitzt ausschließlich technische Auffindbarkeit: Title/Description, Canonical URL, Open Graph/Twitter, JSON-LD, Sitemap, robots.txt und technische Linkvalidierung. SEO besitzt keine eigenständigen Inhaltsseiten und verändert keine Header-/Footer-Navigation.

`app.js` bleibt für Vereinssuche und Kontaktlogik zuständig und enthält keine Shell-Navigation.

## Build-Reihenfolge

1. `scripts/build.mjs`
2. `scripts/apply-club-logo-manifest.mjs`
3. `scripts/split-audiences.mjs`
4. `scripts/postbuild-seo.mjs`
5. `scripts/apply-site-shell.mjs`
6. `scripts/validate-site-shell.mjs`
7. `scripts/validate-seo-output.mjs`

Der Audience-Split erzeugt aus dem redaktionellen Quellbestand die beiden Produktseiten. SEO finalisiert anschließend ausschließlich Metadaten und Crawling-Artefakte. Die Shell wird danach als letzter struktureller Schritt angewendet.

## Shell-Varianten

### landing

Für `/`.

Navigation:

- Adams Acht
- Ratzeburg
- Stimmen, sofern die Sektion im jeweiligen Build vorhanden ist
- Mehr entdecken → `/rudern/`
- Rudern ausprobieren

Skip-Link und CTA zielen auf `#quick-finder`.

### rowing

Für `/rudern/`.

Navigation:

- Für Einsteiger → `/`
- Adams Labor
- Einordnung
- Ruderakademie
- Rudern verstehen
- Stimmen, sofern vorhanden
- Verein finden

Skip-Link: `#labor`. Persistenter CTA: `#vereine`.

Eine `content`-Shell für SEO-Detailseiten existiert nicht mehr.

## SEO-Prinzip

`scripts/seo-pages.mjs` enthält nur die zwei echten Produktseiten. Beide dürfen indexiert und in `sitemap.xml` geführt werden.

`scripts/postbuild-seo.mjs` darf keine zusätzlichen Gateway-Links oder SEO-Content-Blöcke in die Seiten injizieren. Die vorherigen künstlichen Verweise auf Detailrouten sind entfernt.

Die neun zurückgezogenen Detailrouten stehen zentral in `retiredDetailPages`. `scripts/validate-seo-output.mjs` blockiert einen Build, wenn eine davon wieder als Source, Output, Sitemap-Eintrag oder interner Link erscheint.

## CSS-Ownership

Folgende Dateien dürfen keine Shell-Selektoren besitzen:

- `src/assets/styles.css`
- `src/assets/mobile-fixes.css`
- `src/assets/story-flow.css`
- `src/assets/audience-pages.css`

Header, Brand, Navigation, Hamburger, persistenter CTA und Footer liegen ausschließlich in `src/assets/site-shell.css`.

Das frühere `src/assets/detail-page.css` ist zusammen mit den Detailseiten entfernt.

## Invarianten

Für `/` und `/rudern/` gilt nach jedem Build:

- genau ein `.site-header`
- genau ein `#primary-navigation`
- genau eine `.menu-toggle`
- genau eine `.header-find-club`
- genau ein `.site-footer`
- `/assets/site-shell.css` genau einmal
- `/assets/site-shell.js` genau einmal
- kein `/assets/story-nav.js`
- kein alter textueller `AE`-Brand
- Desktop-Logo und Mobile-Marke aus den freigegebenen lokalen Assets
- keine toten In-Page-Links
- keine Links zu zurückgezogenen SEO-Routen
- passende Skip-Link- und CTA-Ziele je Audience

Für die zurückgezogenen SEO-Seiten gilt:

- keine entsprechende `src/<route>/index.html`
- keine entsprechende `dist/<route>/index.html`
- kein Eintrag in `sitemap.xml`
- kein interner Link von `/` oder `/rudern/`
- kein `detail-page.css`

## CI-Gates

CI prüft weiterhin Production- und Preview-Build, Shell-Struktur, SEO-Metadaten, Sitemap/robots.txt, Audience-Split, Logo-/DRV-/Snapshot-/Nearest-Regressionen, Datenschutz der Browserdaten und PHP-Syntax.

Zusätzlich ist die Entfernung der neun Detailrouten jetzt eine explizite Negativregression.

## Definition of Done

- `/` und `/rudern/` sind die einzigen redaktionellen HTML-Produktseiten.
- Beide verwenden dieselbe kanonische Site-Shell.
- Die neun redundanten SEO-Detailquellen sind physisch gelöscht.
- Die Detailseiten werden nicht mehr gebaut oder indexiert.
- Die Sitemap enthält genau `/` und `/rudern/`.
- Es existieren keine künstlich injizierten SEO-Gateway-Links zu den zurückgezogenen Routen.
- Die `content`-Shell und `detail-page.css` sind entfernt.
- `npm run build` und `npm run build:local` validieren die Zwei-Seiten-Architektur und die Negativregression.
- Die bestehende Vereinssuche und der Audience-Split bleiben funktional erhalten.
