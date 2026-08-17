# Implementierungsplan – Vom Vorbild zum Rivalen

**Projekt:** Adams Erben  
**Branch:** `feat/vom-vorbild-zum-rivalen`  
**Basis:** `SPEC.md` V2  
**Stand:** 2026-08-17  
**Status:** Umsetzungsplan, noch keine Website-Implementierung

---

## 1. Ergebnis der Bestandsanalyse

Die Vertiefungsseite `/rudern/` existiert **nicht als eigene Quelldatei**. Die gemeinsame Quelle ist `src/index.html`. Der Build erzeugt zunächst `dist/index.html`; anschließend leitet `scripts/split-audiences.mjs` daraus zwei Zielseiten ab:

- `/` = Kinobesucher-/Einsteiger-Landingpage
- `/rudern/` = redaktionelle Vertiefungsseite

Das neue Modul darf deshalb nicht als isolierte `src/rudern/index.html` implementiert werden. Es muss in die gemeinsame Build-Pipeline eingebunden und beim Audience-Split ausdrücklich nur auf `/rudern/` erhalten werden.

### Relevante bestehende Architektur

- `src/index.html` – gemeinsame redaktionelle Basis
- `scripts/build.mjs` – injiziert Partials, ordnet Story-Sektionen, ergänzt Assets und validiert die gemeinsame Build-Ausgabe
- `scripts/split-audiences.mjs` – erzeugt Landingpage und `/rudern/`
- `src/partials/rowing-explainer.html` – Muster für umfangreiches redaktionelles Partial
- `src/partials/ruderakademie.html` – Muster für lokales historisches Modul
- `src/partials/ratzeburg-regatta.html` – Muster für zeitlich/historisch fokussiertes Modul
- `src/assets/story-flow.css` – bestehende Story-Flow- und responsive Regeln
- `src/assets/source-links.css` – bestehende externe Quellen-/Podcast-Karten
- `src/assets/story-nav.js` – bestehende Navigation/Story-Unterstützung
- `src/assets/mobile-fixes.css` – mobile Korrekturen

---

# 2. Architekturentscheidung für das Feature

## 2.1 Neues eigenes Partial

Neu anlegen:

`src/partials/vom-vorbild-zum-rivalen.html`

Das Partial enthält ausschließlich die semantische Struktur und redaktionellen Inhalte der neuen Sektion.

### Root-Element

```html
<section class="rivalry-story" id="vorbild-rivale" aria-labelledby="rivalry-title">
  ...
</section>
```

Der eindeutige Anchor lautet verbindlich:

`#vorbild-rivale`

## 2.2 Eigenes Feature-Stylesheet

Neu anlegen:

`src/assets/vom-vorbild-zum-rivalen.css`

Begründung:

- die Sektion ist groß genug für eine eigene visuelle Sprache;
- bestehende globale Styles sollen nicht mit Spezialregeln überladen werden;
- Quellenbadges, Timeline, Kartenrahmen und Ergebnisfelder gehören fachlich zusammen;
- bestehende Design-Tokens und Komponenten werden trotzdem wiederverwendet.

## 2.3 JavaScript nur bei echtem Mehrwert

Initial **kein neues JavaScript**.

Die Story soll vollständig ohne Interaktion verständlich und bedienbar sein. Karte, Timeline, Quellenstatus und Ergebnisfelder werden mit semantischem HTML/CSS umgesetzt.

Nur falls später ein echter Mehrwert entsteht, kann ergänzt werden:

`src/assets/vom-vorbild-zum-rivalen.js`

Zulässige spätere Funktionen wären z. B. fokussierbare Kartenannotation oder progressive Detailansicht. Animation allein ist kein Grund für JavaScript.

---

# 3. Einfügeposition im bestehenden Story-Flow

## Verbindliche Position auf `/rudern/`

Das Modul wird **nach `#labor` und vor `#geschichte`** eingebaut.

Damit ergibt sich im relevanten Bereich:

```text
#labor
  Karl Adams Innovationsprinzipien
      ↓
#vorbild-rivale
  Wirkung auf DDR-Rudersport, Körner, deutsch-deutsche Rivalität
      ↓
#geschichte
  historische Verantwortung / NS-Einordnung
      ↓
#ruderakademie
```

### Redaktionelle Begründung

`#labor` erklärt, **was Adam anders machte**.  
`#vorbild-rivale` zeigt anschließend, **welche Wirkung diese Innovation auf die Konkurrenz hatte und wie daraus ein eigenes System entstand**.  
`#geschichte` wechselt danach bewusst von sportlicher Wirkung zur historischen Verantwortung.

Das neue Modul gehört deshalb nicht an das Seitenende und nicht lediglich in die Ratzeburg-Sektion.

---

# 4. Änderungen in `scripts/build.mjs`

## 4.1 Partial laden

Analog zu den bestehenden Partials:

```js
const rivalryPath = path.join(src, 'partials', 'vom-vorbild-zum-rivalen.html');
const rivalryHtml = await readFile(rivalryPath, 'utf8');
```

## 4.2 Stylesheet laden

Ergänzen:

```html
<link rel="stylesheet" href="/assets/vom-vorbild-zum-rivalen.css">
```

Das Stylesheet soll wie die bestehenden redaktionellen Feature-Styles über `build.mjs` eingebunden werden.

## 4.3 Robuste Injektion

Die vorhandene Pipeline nutzt String-Anker, insbesondere `historyAnchor` und `laborAnchor`. Da bereits die Ruderakademie über `historyAnchor` injiziert wird, soll keine zweite unabhängige, fragile `.replace(historyAnchor, ...)`-Kette entstehen.

### Bevorzugte Variante

Im Build die beiden einzufügenden Partials gemeinsam und bewusst vor `#geschichte` injizieren:

```js
.replace(historyAnchor, `${rivalryHtml}\n\n${academyHtml}\n\n${historyAnchor}`)
```

und die bisher separate Academy-Injektion entfernen.

Die endgültige Reihenfolge wird danach ohnehin von `desiredOrder` bestimmt.

### Alternative

Ein expliziter Build-Platzhalter in `src/index.html`, z. B.:

```html
<!-- FEATURE:VOM-VORBILD-ZUM-RIVALEN -->
```

ist ebenfalls zulässig und langfristig sogar robuster. Falls dieser Weg gewählt wird, muss der Build bei fehlendem Platzhalter hart fehlschlagen.

## 4.4 `desiredOrder` erweitern

Aktuell folgt auf `#labor` unmittelbar `#geschichte`.

Neu:

```js
'#labor',
'#vorbild-rivale',
'#geschichte',
```

Dies ist zwingend. Ohne diese Änderung würde die neue Sektion als unbekannter Restbereich vor `#ueber` landen.

## 4.5 Build-Validierung erweitern

In `validatePage()` mindestens prüfen:

- `#vorbild-rivale`
- `link[href="/assets/vom-vorbild-zum-rivalen.css"]`
- `.rivalry-map`
- mindestens ein `.source-status--documented`
- mindestens ein `.source-status--context`
- mindestens ein `.source-status--oral`
- 1963-Quellenblock
- 1965-Quellenblock
- Bled-1966-Ergebnisblock
- Mexiko-1968-Ergebnisblock
- Schubschlag-CTA
- Adam-1970-Schlussblock

Die Prüfung soll Strukturregressionen verhindern, nicht historische Inhalte durch fragile Volltextvergleiche testen.

---

# 5. Änderungen in `scripts/split-audiences.mjs`

## 5.1 Landingpage

`#vorbild-rivale` wird bewusst **nicht** auf `/` ausgeliefert.

In `removeSelectors` ergänzen:

```js
'#vorbild-rivale'
```

In der Landingpage-Validierung ebenfalls als verboten ergänzen:

```js
'#vorbild-rivale'
```

Damit bleibt das Feature Teil der redaktionellen Vertiefung.

## 5.2 `/rudern/`

`validateRowing()` um `#vorbild-rivale` erweitern.

## 5.3 Navigation

Die gemeinsame Navigation in `build.mjs` soll **nicht blind** um einen Link auf `#vorbild-rivale` erweitert werden, weil die Landingpage die Sektion anschließend entfernt und sonst einen toten Anchor erhalten würde.

### Empfohlene Lösung

Erst in `renderRowingPage()` einen vertiefungsspezifischen Navigationslink ergänzen.

Bevorzugtes Label:

**Ost & West**

Ziel:

`#vorbild-rivale`

Position:

nach **Adams Labor**, vor **Einordnung**.

Die Rowing-Page-Validierung soll den Link verlangen. Die Landingpage behält ihre bestehende kompaktere Navigation.

---

# 6. Story-Flow im Partial

Die Sektion wird als vertikale dokumentarische Erzählung aufgebaut. Keine horizontale Timeline, weil diese auf Mobilgeräten unnötig bricht.

## 6.1 Intro

### Eyebrow

`Geteiltes Deutschland · gemeinsames Ruderrevier`

### H2

**Vom Vorbild zum Rivalen**

### Lead

Die Kernaussage muss sofort verständlich machen:

- Ratzeburg setzte zunächst den Maßstab;
- DDR-Ruderer und Funktionäre beobachteten und analysierten;
- Theo Körner entwickelte daraus kein Abziehbild, sondern eine eigene Schule;
- der Wissenstransfer drehte sich später um.

Schluss des Leads bzw. hervorgehobene Leitzeile:

> **Erst schaute der Osten nach Ratzeburg. Dann entwickelte er eine eigene Ruderschule. Schließlich schaute der Westen zurück.**

---

## 6.2 Prolog 1948–1955 – „Ein Ruderrevier entsteht“

### Inhalt

- 1948: Adam übernimmt die Ruderriege der Lauenburgischen Gelehrtenschule.
- historisches Schulbootshaus am Großen Ratzeburger See als Ausgangsort;
- 1952: Fahrten mit „Mohammed“ Richtung Rothenhusen, teilweise weiter nach Lübeck;
- 1953: RRC-Gründung, zunächst Nutzung von Schulbootshaus und Schulbooten;
- 1955: eigenes RRC-Bootshaus am Küchensee, Schwerpunktverlagerung des Renn-/Hochleistungstrainings.

### Visuell

Zweispaltig auf Desktop:

- links: Foto altes LG-Bootshaus;
- rechts: kompakte 1948/1952/1953/1955-Abfolge.

Mobil untereinander.

### Guardrail

Nicht behaupten, der Küchensee sei das einzige Adam-Trainingsrevier gewesen.

---

## 6.3 Karte – „Ein Ruderrevier an der Grenze“

Großes eigenes `<figure>` direkt nach dem Prolog.

Die Karte trägt die Klasse:

`.rivalry-map`

Sie zeigt:

- Inselstadt Ratzeburg;
- ehemalige LG / heutiges Rathaus;
- historisches Schulbootshaus;
- Großen Ratzeburger See;
- Küchensee;
- RRC;
- Rothenhusen;
- Wakenitz;
- BRD;
- DDR;
- historischen Grenzverlauf;
- schematische frühe Trainingsrichtung Schulbootshaus → Rothenhusen.

### Nicht zeigen

- keinen Punkt „DDR-Späher“;
- keinen behaupteten exakten Beobachtungsort;
- keinen frei erfundenen Grenzverlauf;
- keine Stasi-/MfS-Agentensymbole.

Die Grenzlinie ist historischer Kontext, keine Agentenillustration.

---

## 6.4 1962 – „Der Maßstab“

Kurzer Übergangsblock.

Funktion:

- westdeutsche Dominanz als Ausgangslage;
- Ratzeburg/Adam als besonders sichtbarer methodischer Referenzpunkt;
- Übergangsfrage: **„Wie macht Adam das?“**

Keine überladene Medaillentabelle erforderlich.

---

## 6.5 1963 – „Wie macht Adam das?“

Erster großer Quellenblock.

### Komponenten

- Jahreszahl `1963`
- Headline
- gekürztes Primärquellenzitat
- Badge `DOKUMENTIERT`
- erläuternder Text zur Kritik an schematischem DDR-Training
- Betonung von Individualisierung, Belastungssteuerung und wissenschaftlicher/medizinischer Begleitung
- direkte Quellenverlinkung

### Quellenstatus

`source-status source-status--documented`

### Redaktioneller Fokus

Nicht auf „Intervallgeheimnis“ reduzieren. Adam wird als Referenz für eine experimentell-wissenschaftliche Trainingskultur sichtbar.

---

## 6.6 1963/64 – „Körner geht einen eigenen Weg“

### Komponenten

- Hans-Eckstein-Zitat zur Umstellung 1963/64;
- Badge `SPÄTERE ERINNERUNG` bzw. klar als späteres Zeitzeugeninterview;
- Gegenüberstellung der Schwerpunkte ohne falschen binären Gegensatz.

### Vergleichslogik

**Adam**

- Experiment
- Intervallsteuerung
- Technik
- Belastungsbeobachtung

**Körner / DDR-System**

- höherer Umfang
- Ausdauerorientierung
- Schubschlag
- institutionalisierte Sportwissenschaft
- Talentidentifikation

Die Darstellung darf nicht suggerieren, Adam habe keine Ausdauer trainiert oder Körner kein Intervalltraining genutzt.

---

## 6.7 1965 – „Oft nach Ratzeburg zur Beobachtung“

Zweiter großer Primärquellenblock.

### Inhalt

Peter Kremtz wird mit dem dokumentierten Kern zitiert bzw. paraphrasiert:

> DDR-Rudersportfunktionäre würden „oft nach Ratzeburg zur Beobachtung fahren“.

### Quellenstatus

`DOKUMENTIERT`

### Kartenbezug

Die Karte muss nicht interaktiv erneut geladen werden. Stattdessen kann ein kleiner visueller Rückverweis/Thumbnail oder eine Textmarke den geografischen Zusammenhang wieder aufnehmen.

---

## 6.8 Oral History – „Die Männer im Schilf“

Direkt auf den dokumentierten 1965er Block folgend.

### Visuelle Abgrenzung

Eigene, weichere Callout-Karte mit Badge:

`SPÄTERE ERINNERUNG`

### Inhalt

Wilfried Hofmanns spätere Erinnerung:

- Beobachter im Schilf am Ostufer;
- beobachtete Intervallserie;
- zugespitzte Aussage, man habe Adam zunächst kopiert.

### Zwingender Transparenzsatz

Sinngemäß:

> Dokumentiert ist, dass DDR-Rudersportfunktionäre wiederholt zur Beobachtung nach Ratzeburg kamen. Ob sie tatsächlich im Schilf lagen und genau diese Trainingsserie stoppten, lässt sich bislang nicht unabhängig belegen.

Dieser Satz darf nicht in einem Tooltip oder Accordion versteckt sein.

---

## 6.9 1966 – Bled: „Vom Vorbild zum Rivalen“

Erster Ergebnis-Höhepunkt.

### Darstellung

Keine fremden Wettkampffotos erforderlich. Stattdessen HTML/CSS-Ergebnisfeld.

**DDR**

- 3 × Gold
- 2 × Bronze
- erfolgreichste Nation

**Karl Adams Achter / Westdeutschland**

- Weltmeister

### Redaktionszeile

> **1966 gewinnt die DDR den Systemvergleich. Adam gewinnt noch einmal den Achter.**

Als redaktionelle Zusammenfassung kennzeichnen, nicht als historisches Zitat.

---

## 6.10 Schubschlag – Traditionsbrücke

Direkt nach Körners System bzw. spätestens zwischen Bled 1966 und Mexiko 1968.

### Inhalt

- technische Erklärung des historischen Begriffs;
- bestätigte Verbindung zur Namensgebung des heutigen Podcasts;
- keine vorsichtige „Namensgleichheit“-Formulierung mehr erforderlich.

### Wiederverwendung

Bestehende Komponente:

`.source-link-card.source-link-card-podcast`

Bestehendes Asset:

`/assets/images/schubschlag.webp`

Bestehender CTA:

`https://www.podcast.de/podcast/2776815/schubschlag`

### Copy-Idee

**Schubschlag – damals Technik, heute Rudergeschichten**

Der CTA soll den Podcast als bewusste Traditionsbrücke einordnen, nicht wie Werbung oder Sponsoring wirken.

---

## 6.11 1968 – Mexiko: „Zwei Wege zur Weltspitze“

Zweiter Ergebnis-Höhepunkt.

HTML/CSS-Ergebnisband statt zusätzlichem Rechte-Asset.

### Karl Adam / Bundesrepublik

- Gold Achter

### DDR

- Gold Zweier ohne
- Gold Vierer ohne
- Silber Vierer mit
- DDR-Achter Rang 7 als kleine Zusatzinformation

### Kernaussage

> **1968 waren beide Systeme gleichzeitig Weltspitze – aber nicht in denselben Bootsklassen.**

Das vorhandene Asset `hoehe-mexiko.webp` darf nur als ergänzender Trainings-/Höhenkontext eingesetzt werden. Es darf nicht als Bildbeleg des olympischen Rennresultats erscheinen.

---

## 6.12 1970 – „Die Blickrichtung kehrt sich um“

Schlusspunkt der Hauptgeschichte.

### Inhalt

Karl Adams eigener ZEIT-Beitrag mit Untertitel:

> **„Die DDR hat die Bundesrepublik um Längen geschlagen“**

### Quellenstatus

`DOKUMENTIERT`

### Dramaturgie

Der Block soll sichtbar auf 1963 zurückverweisen:

**1963:** DDR-Ruderer fragen, wie Adam es macht.  
**1970:** Adam selbst beschreibt die DDR als neuen Maßstab.

### Schlusszeile

> **Erst schaute der Osten nach Ratzeburg. Dann schaute Ratzeburg zurück.**

---

## 6.13 Optionaler Epilog 1972

Nur als kurze Schlussvignette.

Hofmanns spätere Erinnerung an westdeutsche Beobachtung von DDR-Training erhält erneut `SPÄTERE ERINNERUNG`.

Kein gleichwertiges Hauptkapitel, solange keine stärkere zeitgenössische Quelle vorliegt.

---

# 7. Quellenlogik in der UI

## 7.1 Drei sichtbare Statusklassen

### DOKUMENTIERT

Klasse:

`source-status--documented`

Für zeitgenössische Primär-/Originalquellen oder direkt überprüfbare Wettkampfdaten.

Beispiele:

- DDR-Bericht 1963
- Kremtz 1965
- Bled 1966
- Mexiko 1968
- Karl Adam / DIE ZEIT 1970

### HISTORISCHER KONTEXT

Klasse:

`source-status--context`

Für institutionelle, archivgestützte oder sporthistorische Einordnung.

Beispiele:

- RRC-Chronik
- Grenzhus
- World Rowing
- DRV

### SPÄTERE ERINNERUNG

Klasse:

`source-status--oral`

Für spätere Zeitzeugeninterviews / Oral History.

Beispiele:

- Hans Eckstein 2005
- Wilfried Hofmann 2024

## 7.2 Zitierregeln

- Badge immer beim zugehörigen Claim, nicht nur in einer Endnotenliste.
- Direkte Zitate nur in der belegten Länge und wortgetreu.
- Quelle unmittelbar verlinken.
- Bei Oral History muss die zeitliche Distanz sichtbar bleiben.
- Sekundärquelle nicht wie Primärquelle formulieren.
- Keine Quelle darf als Beleg für mehr dienen, als sie tatsächlich aussagt.
- MfS-Überlieferung ist eine Quelle über festgehaltene Aussagen; daraus folgt **nicht**, dass beobachtende Ruderfunktionäre MfS-Mitarbeiter waren.

---

# 8. Kartenanforderungen

## 8.1 Neues Asset

Bevorzugter Pfad:

`src/assets/images/ratzeburg-border-rowing-history.svg`

## 8.2 Darstellungsziel

Dokumentarische Übersicht, kein modernes Navigationskarten-Design.

### Enthalten

- Ratzeburger Insel
- ehemalige LG / Rathaus
- altes Bootshaus
- Großer Ratzeburger See
- Küchensee
- RRC
- Rothenhusen
- Wakenitz
- BRD / DDR
- belastbarer historischer Grenzverlauf
- schematische Trainingsrichtung

### Stil

- ruhige Flächen
- Wasser visuell führend
- Grenze erkennbar, nicht dominant
- keine Alarmrot-/Stacheldrahtästhetik
- typografisch konsistent mit Adams Erben
- auf 360 px Breite noch verständlich

## 8.3 Quellenhinweis an der Karte

Die Bildunterschrift nennt die verwendete historische Kartengrundlage bzw. den Grenzquellenbeleg.

## 8.4 Barrierefreiheit

Wenn das SVG als `<img>` eingebunden wird:

- verständliches `alt`;
- ausführlichere Erklärung im sichtbaren `<figcaption>`.

Wenn inline eingebunden:

- `<title>` und `<desc>`;
- alle essenziellen Aussagen zusätzlich im Fließtext.

---

# 9. Wiederverwendbare Komponenten

## Direkt wiederverwenden

### `.section-heading`

für Intro und Unterkapitel.

### `.eyebrow`

für Kapitelkontext / Zeitbezug.

### `.source-link-card`

für Quellen-/Vertiefungskarten, wo passend.

### `.source-link-card-podcast`

für den Schubschlag-CTA.

### `.button`, `.button-secondary`, `.button-ghost`

für externe Quellen.

### Design-Tokens

bestehende Farben, Typografie, Radius, Abstände aus `styles.css`/Feature-CSS.

## Nicht zweckentfremden

Die bestehenden Podcast-/Source-Cards ersetzen **nicht** die neuen Quellenstatus-Badges. Die Belegstärke muss direkt am Claim erkennbar sein.

---

# 10. Neue CSS-Komponenten

Mindestens vorsehen:

- `.rivalry-story`
- `.rivalry-intro`
- `.rivalry-prolog`
- `.rivalry-timeline`
- `.rivalry-step`
- `.rivalry-year`
- `.rivalry-map`
- `.rivalry-quote`
- `.rivalry-oral-history`
- `.rivalry-methods`
- `.rivalry-methods-adam`
- `.rivalry-methods-koerner`
- `.rivalry-results`
- `.rivalry-result-column`
- `.rivalry-closing`
- `.source-status`
- `.source-status--documented`
- `.source-status--context`
- `.source-status--oral`

### Breakpoints

An bestehende Logik anlehnen:

- bis ca. 920 px: Zweispaltenbereiche stapeln;
- bis ca. 640 px: Ergebnisfelder, Quellenkarten und Kartenlegende auf volle Breite.

### Reduced Motion

Kein Inhalt darf Animation benötigen. Falls dezente Übergänge ergänzt werden, `prefers-reduced-motion` respektieren.

---

# 11. Asset-Matrix

| Asset | Status | Einsatz | Blocker? |
|---|---|---|---|
| `schubschlag.webp` | vorhanden | Podcast-Brücke | nein |
| `hoehe-mexiko.webp` | vorhanden | optionaler Höhen-/1968-Kontext | nein |
| `rrc-heute.webp` | vorhanden | optionaler Ratzeburg-Kontext, nicht zwingend im Modul | nein |
| `deutschlandachter.webp` | vorhanden | ggf. bestehende Deutschlandachter-Verlinkung, Rechtekontext beachten | nein |
| `ratzeburg-border-rowing-history.svg` | neu erforderlich | historische Karte | **ja für finalen Launch** |
| `lg-bootshaus-heute.webp` | neue eigene Aufnahme vorgesehen | Prolog / materieller Adam-Ort | **ja für finalen Launch**, nicht für HTML-Prototyp |
| Theo-Körner-Porträt | optional | Personalisierung Körner | nein |
| Bled-Foto | nicht erforderlich | Ergebnis wird HTML/CSS | nein |
| Mexiko-Rennfoto | nicht erforderlich | Ergebnis wird HTML/CSS | nein |

### Kein Bild-Fallback

Für neue historische Bilder gilt weiterhin die projektweite Datenschutz-/Rechteentscheidung: keine extern geladenen Bild-Fallbacks. Fehlt ein finales Bild, bleibt die vorgesehene Bildposition im Entwicklungsstand klar als noch nicht freigegeben gekennzeichnet oder wird bis zur Bereitstellung weggelassen.

---

# 12. UX-Anforderungen

## Desktop

- vertikaler Story-Flow;
- einzelne Zweispaltenmomente für Prolog, Methodenvergleich und Ergebnisse;
- Karte groß und ruhig;
- keine kleinteilige 10-Spalten-Timeline.

## Mobile

- eine klare Spalte;
- Jahreszahlen bleiben Orientierungspunkte;
- Quellenbadges stehen oberhalb oder unmittelbar neben der zugehörigen Aussage;
- Karte erhält volle Breite;
- keine horizontal scrollende Timeline;
- Ergebnisfelder untereinander.

## Navigation

`/rudern/` erhält den Anchor-Link **Ost & West** → `#vorbild-rivale`.

## Quellen

Quellen sind Teil des Leseerlebnisses, nicht versteckte Fußnoten.

## Externe Links

- `target="_blank"`
- `rel="noopener noreferrer"`
- klare Linktexte statt bloßer Domainnamen, sofern Platz vorhanden.

---

# 13. Redaktionelle Guardrails für die Implementierung

Nicht schreiben oder visuell suggerieren:

- „Stasi-Agenten spionierten Adam aus.“
- „DDR-Spione lagen im Schilf.“
- „Das MfS stahl Adams Trainingsgeheimnisse.“
- „Die DDR kopierte einfach Adam und wurde besser.“
- „Der DDR-Erfolg von 1966 war Folge des späteren staatlichen Dopingprogramms.“
- „Adam trainierte nur auf dem Küchensee.“
- „Das Schilf lag nachweislich an Punkt X.“

Stattdessen klar unterscheiden:

1. dokumentierte Beobachtungsfahrten;
2. spätere Schilf-Erinnerung;
3. Körners eigenständige Systementwicklung;
4. späteren Wissenstransfer in Gegenrichtung.

---

# 14. Tests und Validierung

## 14.1 Schnelltest während Entwicklung

```bash
npm run build:local
```

Ziel:

- lokaler Build ohne externen DRV-Sync;
- neue Sektion vorhanden auf `dist/rudern/index.html`;
- neue Sektion nicht vorhanden auf `dist/index.html`.

## 14.2 Voller Build

```bash
npm run build
```

Ziel:

- komplette Build-Kette;
- Audience Split;
- SEO-Nachbearbeitung;
- Shared-Shell-Validierung;
- SEO-Validierung.

## 14.3 Verbindliche manuelle QA

### `/rudern/`

- `#vorbild-rivale` erreichbar;
- Reihenfolge `#labor → #vorbild-rivale → #geschichte` korrekt;
- Navigation `Ost & West` funktioniert;
- Quellenbadges eindeutig;
- Karte 360 / 768 / 1280 px lesbar;
- Bled- und Mexiko-Resultate korrekt;
- Schubschlag-CTA funktioniert;
- keine horizontalen Overflows.

### `/`

- Feature-Sektion vollständig entfernt;
- kein toter `#vorbild-rivale`-Nav-Link;
- bestehende Landingpage unverändert funktionsfähig.

### Accessibility

- semantische Heading-Hierarchie;
- sichtbare Focus-Zustände;
- Karte mit Alt/Caption bzw. SVG title/desc;
- Status nicht ausschließlich über Farbe vermittelt;
- Zitate korrekt als Blockquote markiert;
- Ergebnisinformationen auch als Text verfügbar.

---

# 15. Empfohlene Implementierungsreihenfolge

## Schritt 1 – strukturelles Gerüst

Anlegen:

- `src/partials/vom-vorbild-zum-rivalen.html`
- `src/assets/vom-vorbild-zum-rivalen.css`

Zunächst mit vollständigen Texten, Quellenlinks, HTML/CSS-Ergebnisfeldern und einem klar gekennzeichneten lokalen Kartenplatzhalter.

## Schritt 2 – Build-Pipeline

- Partial in `build.mjs` laden;
- Stylesheet einbinden;
- `desiredOrder` ändern;
- `validatePage()` erweitern.

## Schritt 3 – Audience Split

- Landing-Removal ergänzen;
- Landing-Forbidden-Validation ergänzen;
- Rowing-Validation ergänzen;
- Rowing-only Navigation `Ost & West` ergänzen.

## Schritt 4 – vorhandene Assets integrieren

- Schubschlag-Logo;
- optional Höhen-Mexiko-Grafik nur als Trainingskontext.

## Schritt 5 – historische Karte

Finales SVG nach verifizierter Grenz-/Ortsgrundlage erstellen und Platzhalter ersetzen.

## Schritt 6 – Bootshaus-Foto

Eigene Aufnahme einbinden und Rechte-/Quellenangabe dokumentieren.

## Schritt 7 – QA

- `npm run build:local`
- `npm run build`
- responsive Sichtprüfung
- Quellen-/Zitatprüfung gegen SPEC

---

# 16. Was sofort umgesetzt werden kann

Ohne weitere externe Assets können bereits vollständig umgesetzt werden:

- gesamter Story-Flow;
- 1963- und 1965-Quellenblöcke;
- Körner/Eckstein-Block;
- Quellenstatus-System;
- Schilf-Oral-History-Callout;
- Bled-1966-Ergebnisfeld;
- bestätigte Schubschlag-Podcast-Brücke;
- Mexiko-1968-Ergebnisfeld;
- Adam-1970-Schluss;
- responsive UX;
- Audience-Split;
- Build-Validierungen.

Für den **finalen visuellen Launch** fehlen nur zwei wesentliche neue Assets:

1. historisch belastbare Karte;
2. eigene Aufnahme des alten LG-Bootshauses.

Theo-Körner-Porträt und historische Wettkampffotos sind ausdrücklich **keine Blocker**.

---

# 17. Definition of Done – Implementierungsplan

Die Umsetzung auf diesem Branch ist fertig, wenn:

- [ ] `src/partials/vom-vorbild-zum-rivalen.html` existiert;
- [ ] `src/assets/vom-vorbild-zum-rivalen.css` existiert;
- [ ] das Feature in `build.mjs` eingebunden ist;
- [ ] die Story-Reihenfolge `#labor → #vorbild-rivale → #geschichte` validiert wird;
- [ ] `/rudern/` die Sektion enthält;
- [ ] `/` die Sektion nicht enthält;
- [ ] `/` keinen toten Feature-Navigationslink enthält;
- [ ] `/rudern/` einen funktionierenden Link `Ost & West` besitzt;
- [ ] Prolog 1948–1955 Großem Ratzeburger See, Schulbootshaus, Rothenhusen und Küchensee korrekt einordnet;
- [ ] historische Karte alle geforderten Orte und einen belastbaren Grenzverlauf enthält;
- [ ] kein exakter Beobachter-/Schilfpunkt erfunden wird;
- [ ] 1963 mit `DOKUMENTIERT` gekennzeichnet ist;
- [ ] Hans Eckstein 2005 als spätere Erinnerung erkennbar ist;
- [ ] Kremtz 1965 mit `DOKUMENTIERT` gekennzeichnet ist;
- [ ] Schilf-Anekdote sichtbar als `SPÄTERE ERINNERUNG` gekennzeichnet ist;
- [ ] keine Stasi-/MfS-Zuordnung der Beobachter behauptet wird;
- [ ] Körners eigenständige Systementwicklung verständlich dargestellt ist;
- [ ] die bestätigte historische Herkunft des Podcastnamens `Schubschlag` korrekt integriert ist;
- [ ] Bled 1966 DDR-Gesamterfolg und Adams Achtersieg parallel darstellt;
- [ ] Mexiko 1968 Adams Achtergold sowie DDR-Gold im Zweier ohne und Vierer ohne und Silber im Vierer mit korrekt darstellt;
- [ ] DDR-Achter 1968 als Rang 7 korrekt eingeordnet ist;
- [ ] Adam 1970 als Originalstimme den Hauptbogen abschließt;
- [ ] Quellenstatus nicht nur farblich, sondern textlich erkennbar ist;
- [ ] alle externen Links korrekt und sicher geöffnet werden;
- [ ] keine externen Bild-Fallbacks neu eingeführt werden;
- [ ] `npm run build:local` erfolgreich ist;
- [ ] `npm run build` erfolgreich ist;
- [ ] responsive QA auf mindestens 360, 768 und 1280 px ohne horizontalen Overflow bestanden ist;
- [ ] finale Karte und Bootshaus-Aufnahme vor Veröffentlichung eingebunden und quellen-/rechtegeprüft sind.

---

# 18. Empfohlener nächster Commit nach diesem Plan

Der nächste Implementierungscommit sollte ausschließlich das **strukturelle Feature-Gerüst** enthalten:

- Partial;
- Feature-CSS;
- Build-/Audience-Integration;
- Quellenstatus;
- HTML/CSS-Ergebnisfelder;
- vorhandene Schubschlag-Assets;
- Karten-/Bootshaus-Slots ohne externen Fallback.

Danach zuerst `npm run build:local` und die Trennung `/` vs. `/rudern/` validieren, bevor die finale Karte und das Bootshausfoto ergänzt werden.
