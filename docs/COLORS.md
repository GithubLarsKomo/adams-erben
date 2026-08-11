# Adams Erben – Farbpalette und Kontrastregeln

Diese Datei dokumentiert die aktuell verwendeten Farben für Website, Illustrationen und Bildbearbeitung. Die Werte entsprechen den CSS-Tokens im Projekt und den zusätzlichen Storyboard-Kontrastregeln.

## Kernpalette

| Verwendung | CSS-Token / Rolle | Hex | RGB |
|---|---|---:|---:|
| Haupt-Navy | `--navy` | `#0B2336` | `rgb(11, 35, 54)` |
| Zweites Navy | `--navy-2` | `#123A57` | `rgb(18, 58, 87)` |
| Dunkles Panelblau | z. B. Rennen | `#102C40` | `rgb(16, 44, 64)` |
| Dunkles Kartenblau | z. B. dunkle Vergleichskarte | `#143349` | `rgb(20, 51, 73)` |
| Hellblau auf dunklem Grund | Story-Akzent | `#92D6EA` | `rgb(146, 214, 234)` |
| Weiteres Hellblau | Sekundärakzent | `#A9DCEB` | `rgb(169, 220, 235)` |
| Water-Hintergrund | `--water` | `#DCEBF0` | `rgb(220, 235, 240)` |
| Hauptrot | `--accent` | `#A6342B` | `rgb(166, 52, 43)` |
| Dunkles Rot | `--accent-dark` | `#7F261F` | `rgb(127, 38, 31)` |
| Foam / Creme | `--foam` | `#F7F5EF` | `rgb(247, 245, 239)` |
| Paper | `--paper` | `#FFFDF8` | `rgb(255, 253, 248)` |
| Weiß | `--white` | `#FFFFFF` | `rgb(255, 255, 255)` |
| Primärtext | `--ink` | `#10202B` | `rgb(16, 32, 43)` |
| Sekundärtext | `--muted` | `#5D6A73` | `rgb(93, 106, 115)` |
| Linien / neutrale Rahmen | `--line` | `#D9DEE1` | `rgb(217, 222, 225)` |

## Kontrastprinzip für Überschriften und Akzente

Die Akzentfarbe richtet sich nach dem Hintergrund. Dadurch bleibt die vorhandene Gestaltung erhalten, ohne schwache Farbkombinationen wie Rot auf Navy oder Hellblau auf Hellblau zu verwenden.

- **Heller neutraler Hintergrund** (Weiß, Paper, Foam): Hauptrot `#A6342B` / `rgb(166, 52, 43)`.
- **Dunkler Navy-Hintergrund**: Hellblau `#92D6EA` / `rgb(146, 214, 234)`.
- **Hellblauer Hintergrund**: Haupt-Navy `#0B2336` / `rgb(11, 35, 54)`.
- **Rote Fläche**: Weiß oder Creme verwenden.

Für den Storyboard-Bereich sind dafür folgende semantische Variablen vorgesehen:

```css
--story-accent-on-light: var(--accent);
--story-accent-on-dark: #92d6ea;
--story-accent-on-blue: var(--navy);
```

## Empfehlung für GIMP / Photoshop

Für neu erzeugte oder nachbearbeitete Grafiken möglichst diese vier Leitfarben verwenden:

```text
Navy:      RGB(11, 35, 54)   / #0B2336
Hellblau:  RGB(146, 214, 234) / #92D6EA
Rot:       RGB(166, 52, 43)   / #A6342B
Creme:     RGB(247, 245, 239) / #F7F5EF
```

Bei dunklen Bildhintergründen sollte `#0B2336` die Referenz für die Websitefläche sein. Beschriftungen darauf vorzugsweise in `#92D6EA` oder Weiß. Das Rot `#A6342B` primär auf hellen bzw. neutralen Flächen einsetzen.

## Relevante CSS-Dateien

- `src/assets/styles.css` – zentrale Farbvariablen der Website.
- `src/assets/storyboard-overrides.css` – kontextabhängige Kontrastregeln für den Storyboard-/Ruder-Erklärbereich.

Bei einer späteren Änderung der Kernpalette sollte diese Datei gemeinsam mit den CSS-Tokens aktualisiert werden.
