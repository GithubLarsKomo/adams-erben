# Adams Erben — Gemeinsame SVG-Komponenten-Spezifikation für 1x und 8+

Stand: 2026-08-16  
Branch: `image-production`

## Ziel

Diese Spezifikation ersetzt die rein generative Erzeugung der Schemata `Einer · 1x` und `Achter · 8+` durch ein deterministisches SVG-System. Beide Boote werden aus denselben Komponenten, Tokens, Schattenparametern, Rumpfregeln und mechanischen Verbindungspunkten aufgebaut.

Das Ziel ist nicht maximale technische Detailtiefe, sondern eine fachlich korrekte, reduzierte redaktionelle Darstellung, die auf Kartenbreite lesbar bleibt und unmittelbar als zusammengehöriges Paar erkennbar ist.

Technische Richtigkeit hat Vorrang vor dekorativer Wirkung.

---

# 1. Koordinatensystem und gemeinsame Orientierung

## 1.1 Globale Orientierung

Für beide SVGs gilt unveränderlich:

- direkte Draufsicht;
- Boot horizontal;
- Bug links;
- Heck rechts;
- Bootsmittellinie ist die globale X-Achse;
- Backbord ist im SVG oberhalb der Mittellinie (`y < centerY`);
- Steuerbord ist unterhalb der Mittellinie (`y > centerY`);
- keine perspektivische Verkürzung;
- keine Rotation des gesamten Bootes;
- keine optische Schrägstellung zur Dynamisierung.

Damit sind Seitenlogik und Sitzfolge programmatisch eindeutig prüfbar.

## 1.2 Master-ViewBox

Beide Assets verwenden dieselbe Höhe und denselben Maßstab für technische Komponenten.

Empfohlene Produktions-ViewBoxes:

```text
1x:  viewBox="0 0 1600 560"
8+:  viewBox="0 0 2400 560"
```

Gemeinsame Mittellinie:

```text
centerY = 280
```

Die unterschiedliche Breite dient ausschließlich der unterschiedlichen Bootslänge. Dolle, Blatt, Rigger-Rohr, Sitz, Kopf und Körper dürfen zwischen beiden SVGs nicht separat skaliert werden.

## 1.3 Skalierungsregel

Alle gemeinsamen Komponenten werden in einer neutralen Basiseinheit definiert und ausschließlich per Translation, Spiegelung oder Rotation platziert.

Nicht zulässig:

- unterschiedliche `scale()`-Faktoren für Dollen in 1x und 8+;
- unterschiedlich dicke Schäfte;
- unterschiedlich große Blätter derselben Familie;
- unterschiedlich starke Schatten;
- unterschiedlich große abstrahierte Personen bei gleicher grafischer Rolle.

---

# 2. Gemeinsame Design-Tokens

Die SVGs verwenden dieselben Projektfarben wie `docs/COLORS.md`.

```css
--ae-navy: #0B2336;
--ae-navy-2: #123A57;
--ae-light-blue: #92D6EA;
--ae-light-blue-2: #A9DCEB;
--ae-red: #A6342B;
--ae-foam: #F7F5EF;
--ae-white: #FFFFFF;
--ae-ink: #10202B;
```

Zusätzliche neutrale technische Tokens dürfen nur aus diesen Farben mit Alpha aufgebaut werden.

Beispiel:

```css
--ae-tech-line: rgba(11,35,54,.58);
--ae-shadow: rgba(11,35,54,.18);
--ae-highlight: rgba(255,255,255,.28);
```

Keine freien Grau-, Chrom- oder Carbonfarben einführen, wenn sie nicht zwingend für die Lesbarkeit erforderlich sind.

---

# 3. Komponentenbibliothek

Alle wiederverwendbaren Bauteile werden in `<defs>` definiert und über `<use>` instanziiert.

Empfohlene IDs:

```text
#ae-hull-section
#ae-seat
#ae-foot-stretcher
#ae-rigger-scull-port
#ae-rigger-scull-starboard
#ae-rigger-sweep-port
#ae-rigger-sweep-starboard
#ae-oarlock
#ae-scull
#ae-sweep-oar
#ae-blade
#ae-rower-scull
#ae-rower-sweep-port
#ae-rower-sweep-starboard
#ae-cox
#ae-shadow-filter
```

Die IDs müssen in beiden SVGs gleich heißen, sofern dieselbe Komponente gemeint ist.

---

# 4. Rumpfsystem

## 4.1 Gemeinsame Rumpfsprache

`1x` und `8+` verwenden dieselbe grafische Rumpfbehandlung:

- matte Hauptfläche;
- eine einzige sehr zurückhaltende innere Highlight-Zone;
- keine harten Glanzkanten;
- keine fotorealistischen Reflexe;
- identische Außenkontur-Stärke;
- identischer Schatten unter dem Rumpf.

## 4.2 Rumpfquerschnitt / Breitenprofil

Der Rumpf wird nicht als simples langes Oval gezeichnet, sondern aus einem normalisierten Breitenprofil abgeleitet.

Normalisierte Stationsfunktion entlang der Bootslänge `u = 0..1`:

```text
width(u) = maxWidth * sin(pi * u)^0.72
```

Zusätzlich werden Bug und Heck leicht zugespitzt:

```text
bow zone:   u = 0.00..0.16
stern zone: u = 0.84..1.00
```

Die beiden Bootsklassen unterscheiden sich durch Länge und maximale Breite, nicht durch die Formensprache.

Empfohlene Werte:

```text
1x:
  hullLength = 1160
  maxWidth = 72

8+:
  hullLength = 1980
  maxWidth = 88
```

Das Verhältnis darf vor Implementierung feinjustiert werden, aber beide Rümpfe müssen aus derselben Profilfunktion erzeugt werden.

## 4.3 Cockpit-/Innenbereich

Der Innenbereich wird als reduzierte dunklere bzw. hellere Einlage auf dem Rumpf dargestellt. Keine offenen 3D-Cockpits rendern.

Ein Sitzplatz benötigt nur:

- Sitz;
- Stemmbrett;
- kurze Schienen-Andeutung;
- Rigger-Anschluss.

Feindetails, die bei 500 px Kartenbreite verschwinden, werden weggelassen.

---

# 5. Dollen-System

## 5.1 Eine gemeinsame Dolle

Es gibt genau eine grafische Dollen-Komponente `#ae-oarlock` für beide Bootsklassen.

Sie besteht aus:

- kleinem Sockel;
- U-förmig abstrahierter Aufnahme;
- klar markiertem Schaftdurchgangspunkt;
- optionalem kleinen Akzentpunkt als Verriegelung.

Die Dolle darf nicht wie ein separates Schmuckelement wirken.

## 5.2 Mechanischer Anchor Point

Jede Dolle besitzt einen expliziten lokalen Anker:

```text
oarlockPivot = (0, 0)
```

Der Riemen-/Skullschaft verläuft exakt durch diesen Punkt.

Damit gilt programmatisch:

```text
handle -> shaft -> oarlockPivot -> outboard shaft -> blade
```

Es darf keinen sichtbaren Knick am Schaft geben.

---

# 6. Ausleger-System

## 6.1 Konstruktionsprinzip

Rigger werden nicht frei gezeichnet. Jeder Rigger wird aus wenigen geraden Rohren aufgebaut, die vom Rumpfanschluss zur Dolle führen.

Gemeinsame Eigenschaften:

```text
stroke-width: 5
stroke-linecap: round
stroke-linejoin: round
fill: none
```

## 6.2 Sculling-Rigger

Für den `1x` wird ein symmetrisches Rigger-Paar verwendet:

```text
#ae-rigger-scull-port
#ae-rigger-scull-starboard
```

Beide sind geometrische Spiegelungen derselben Basiskomponente.

## 6.3 Sweep-Rigger

Für den `8+` gibt es je Sitz genau einen Ausleger auf der geruderten Seite:

```text
#ae-rigger-sweep-port
#ae-rigger-sweep-starboard
```

Der nicht geruderten Seite darf kein zweiter funktionsfähiger Rigger hinzugefügt werden.

Das ist ein hartes Qualitätskriterium, um eine versehentliche Skullboot-Darstellung zu verhindern.

---

# 7. Riemen-/Skull-System

## 7.1 Grundregel: durchgehender gerader Schaft

Ein Skull oder Riemen ist geometrisch immer eine einzige Gerade vom Griff bis zum Blattanschluss.

Nicht zulässig:

- Knicke;
- segmentierte Winkel;
- frei schwebende Griffstücke;
- getrennte Innen-/Außenschäfte mit abweichender Richtung.

## 7.2 Gemeinsames Blatt

`#ae-blade` ist die gemeinsame Blattform-Familie.

Empfohlene abstrakte Big-Blade-Geometrie:

- asymmetrisch leicht verbreitert;
- klare Blattwurzel;
- flache Endkante;
- keine Paddel-Tropfenform.

1x und 8+ verwenden dieselbe Blattform. Unterschiede zwischen Skull und Riemen entstehen primär durch Schaftlänge und Hebelverhältnis, nicht durch eine völlig andere grafische Sprache.

## 7.3 Skull-Komponente

`#ae-scull` besteht aus:

```text
handle segment
continuous shaft
blade
```

Empfohlene relative Längen:

```text
inboard:  120
outboard: 360
```

## 7.4 Sweep-Komponente

`#ae-sweep-oar`:

```text
inboard:  150
outboard: 470
```

Die exakten Werte dürfen visuell justiert werden, aber das Sweep-Ruder muss deutlich länger als der Skull wirken.

## 7.5 Griffpunkt

Jede Oar-Komponente besitzt einen expliziten Griff-Anker:

```text
handleAnchor
```

Die Hände werden auf diesen Anchor gesetzt; nicht umgekehrt.

---

# 8. Personen-System

## 8.1 Abstraktionsgrad

Die Rudernden werden bewusst schematisch gezeichnet. Ziel ist eine eindeutig lesbare biomechanische Verbindung, keine anatomisch detaillierte Person.

Komponenten:

- Kopf als Kreis/Ellipse;
- Oberkörper als reduzierte Form;
- Oberarme;
- Unterarme;
- Hände als kleine Endpunkte;
- Beine nur soweit erforderlich, um Rollsitz und Stemmbrett verständlich zu machen.

## 8.2 Hände sind technische Verbindungspunkte

Die wichtigste Regel lautet:

```text
hand center == handleAnchor
```

Jede Hand, die einen Griff hält, muss geometrisch auf dem Griffpunkt liegen.

### 1x

- zwei Hände;
- zwei Griffpunkte;
- linke/rechte Hand jeweils eindeutig einem Skull zugeordnet;
- keine zusammengelegten Hände auf einem gemeinsamen Griff.

### 8+

- beide Hände eines Ruderers greifen denselben Riemengriff;
- beide Hände liegen eng benachbart am selben Inboard-Ende;
- kein zweiter Riemen pro Person.

---

# 9. Schatten-System

Beide Assets verwenden exakt denselben Filter.

Empfohlene Definition:

```svg
<filter id="ae-shadow-filter" x="-20%" y="-30%" width="140%" height="160%">
  <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0B2336" flood-opacity="0.16"/>
</filter>
```

Regeln:

- Schatten nur für Rumpf + Person/Rigger-Gesamtgruppe, nicht für jedes Kleinteil separat;
- keine mehrfachen Schattenebenen;
- keine weichen Glow-Ränder;
- identische Werte in 1x und 8+;
- Schatten darf die SVG-Kontur nicht optisch verbreitern.

---

# 10. Explizite Sitz- und Seitenlogik

## 10.1 Definition der Seiten

```text
PORT      = Backbord  = oberhalb der Mittellinie
STARBOARD = Steuerbord = unterhalb der Mittellinie
```

Diese Definition gilt für die SVG-Geometrie unabhängig davon, wie der Betrachter sprachlich denkt.

---

# 11. 1x-Konfiguration

## 11.1 Sitzlogik

Der Einer besitzt genau einen Sitz:

```json
{
  "seat": 1,
  "x": 810,
  "y": 280,
  "mode": "scull",
  "oars": ["PORT", "STARBOARD"]
}
```

## 11.2 Komponentenbaum

```text
svg
└─ boat-1x
   ├─ hull
   ├─ cockpit
   ├─ seat-1
   ├─ foot-stretcher-1
   ├─ rigger-port-1
   ├─ rigger-starboard-1
   ├─ scull-port-1
   ├─ scull-starboard-1
   └─ rower-1
```

## 11.3 Harte Regeln

- genau 1 Person;
- genau 1 Sitz;
- genau 2 Dollen;
- genau 2 Skulls;
- genau 2 Blätter;
- genau 1 Skull je Seite;
- beide Schäfte gerade;
- jede Hand sitzt auf genau einem Griffpunkt;
- beide Schäfte passieren ihre jeweilige Dolle.

---

# 12. 8+-Konfiguration

## 12.1 Sitzfolge

Die Sitznummerierung läuft von links nach rechts:

```text
BUG -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> COX -> HECK
```

## 12.2 Verbindliche Seitenfolge

Für die erste Produktionsversion wird die Seitenlogik explizit eingefroren:

```text
Seat 1: PORT
Seat 2: STARBOARD
Seat 3: PORT
Seat 4: STARBOARD
Seat 5: PORT
Seat 6: STARBOARD
Seat 7: PORT
Seat 8: STARBOARD
```

Damit ergeben sich exakt:

```text
PORT:      1, 3, 5, 7
STARBOARD: 2, 4, 6, 8
```

Falls später aus inhaltlichen Gründen die gegenüberliegende Startseite gewünscht wird, darf ausschließlich die gesamte Folge gespiegelt werden. Einzelne Sitze dürfen nie ad hoc geändert werden.

## 12.3 Datendefinition

Empfohlene deklarative Struktur:

```json
[
  { "seat": 1, "side": "PORT",      "x": 520 },
  { "seat": 2, "side": "STARBOARD", "x": 700 },
  { "seat": 3, "side": "PORT",      "x": 880 },
  { "seat": 4, "side": "STARBOARD", "x": 1060 },
  { "seat": 5, "side": "PORT",      "x": 1240 },
  { "seat": 6, "side": "STARBOARD", "x": 1420 },
  { "seat": 7, "side": "PORT",      "x": 1600 },
  { "seat": 8, "side": "STARBOARD", "x": 1780 }
]
```

Cox:

```json
{
  "role": "cox",
  "x": 1960,
  "y": 280,
  "oar": null
}
```

Die Werte sind Layout-Startwerte und dürfen proportional feinjustiert werden. Reihenfolge und Seitenlogik sind dagegen unveränderliche Semantik.

## 12.4 Komponentenbaum pro Sitz

Jeder Sitz erzeugt exakt:

```text
seat-N
foot-stretcher-N
rower-N
rigger-N-[port|starboard]
oarlock-N-[port|starboard]
sweep-oar-N-[port|starboard]
```

Nicht erzeugt werden darf die gegenüberliegende funktionale Rigger-/Riemen-Kette.

## 12.5 Harte Regeln

- exakt 8 Rudernde;
- exakt 1 Steuerperson;
- exakt 9 Personen;
- exakt 8 Sitze;
- exakt 8 Dollen;
- exakt 8 Riemen;
- exakt 8 Blätter;
- exakt 4 PORT;
- exakt 4 STARBOARD;
- Sitzseiten alternieren streng;
- jede Person hält genau einen Riemen;
- beide Hände eines Ruderers greifen denselben Griff;
- Cox hat weder Riemen noch Dolle;
- keine zweite funktionale Auslegerseite pro Sitz.

---

# 13. Mechanische Verbindungskette als Prüfmodell

Für jedes Ruderobjekt muss die folgende Kette geometrisch nachvollziehbar sein:

```text
rower
  -> handLeft / handRight
  -> handleAnchor
  -> continuous shaft
  -> oarlockPivot
  -> continuous shaft
  -> bladeRoot
  -> blade
```

Automatisch oder manuell zu prüfen:

1. `handleAnchor` liegt auf der Schaftachse;
2. `oarlockPivot` liegt auf derselben Schaftachse;
3. `bladeRoot` liegt auf derselben Schaftachse;
4. zwischen diesen Punkten gibt es keine Richtungsänderung;
5. Hände liegen auf dem Griffbereich;
6. Schaft kreuzt weder Rumpf noch Körper außerhalb des vorgesehenen Inboard-Bereichs.

---

# 14. Layer-Reihenfolge

Die Z-Reihenfolge ist in beiden SVGs identisch:

```text
1. shadow
2. hull
3. cockpit / rails / foot stretchers
4. riggers
5. oars / sculls
6. seats
7. rowers
8. oarlock detail accents
```

Ausnahme: Wenn eine Hand den Griff sichtbar überlagern muss, darf die Handgruppe lokal über dem Schaft liegen. Die mechanische Achse bleibt unverändert.

---

# 15. Stilparameter

Gemeinsam und unveränderlich:

```text
outer hull stroke: 2.5 px
technical line:    4–5 px
shaft width:       6 px
rounded caps:      yes
hard black outline: no
shadow blur:       5 px
shadow dy:         4 px
shadow opacity:    0.16
```

Die Werte beziehen sich auf die Produktions-ViewBox und dürfen später nur gemeinsam für beide Assets geändert werden.

---

# 16. Kontrastvarianten ohne Stilbruch

Die Formensprache bleibt identisch. Nur die Farbzuweisung wird an die Kartenfläche angepasst.

## 16.1 1x auf heller Karte

```text
hull:        #0B2336
inner hull:  #123A57
riggers:     #0B2336
shafts:      #92D6EA
blades:      #A6342B
rower:       #0B2336 / #F7F5EF
```

## 16.2 8+ auf dunkler Karte

```text
hull:        #92D6EA
inner hull:  #A9DCEB
riggers:     #F7F5EF or #92D6EA
shafts:      #F7F5EF / #A9DCEB
blades:      #92D6EA with optional restrained #A6342B accent
rowers:      #F7F5EF / #92D6EA / #0B2336
```

Keine Änderungen an Konturstärke, Schattierung oder Geometrie zwischen den Varianten.

---

# 17. Accessibility und Beschriftung

Die SVGs selbst enthalten keine generierten Sitznummern oder Fließtexte.

Empfehlung für Website-Integration:

```html
<img
  src="/assets/images/rowing-schema-8plus.svg"
  alt="Schematische Draufsicht eines gesteuerten Achters mit acht alternierend auf Backbord und Steuerbord rudernden Personen und Steuerperson im Heck"
>
```

Sitznummern `1–8`, `BUG`, `HECK`, `Steuer` bleiben bei Bedarf HTML/CSS-Overlays.

Falls die SVGs inline eingebettet werden, sollten technische Gruppen `aria-hidden="true"` bleiben und die Gesamtgrafik genau einen sprechenden zugänglichen Namen erhalten.

---

# 18. QA-Gate 1x

Vor Freigabe zwingend prüfen:

1. Rumpf horizontal, Bug links, Heck rechts;
2. genau ein Sitz;
3. genau eine Person;
4. genau zwei Dollen;
5. genau zwei Skulls;
6. genau zwei Blätter;
7. kein Schaftknick;
8. Hand 1 liegt auf Griff 1;
9. Hand 2 liegt auf Griff 2;
10. beide Schäfte passieren exakt ihre Dollen;
11. identische Dollen-/Rigger-/Schattenparameter wie beim Achter;
12. keine unnötigen Kleindetails unterhalb der Karten-Lesbarkeit.

---

# 19. QA-Gate 8+

Vor Freigabe zwingend prüfen:

1. Rumpf horizontal, Bug links, Heck rechts;
2. genau acht Sitze;
3. genau acht Rudernde;
4. genau eine Steuerperson;
5. genau acht Dollen;
6. genau acht Riemen;
7. genau acht Blätter;
8. Sitze 1/3/5/7 PORT;
9. Sitze 2/4/6/8 STARBOARD;
10. keine zwei benachbarten Sitze auf derselben Seite;
11. jeder Sitz hat nur einen funktionalen Rigger;
12. jeder Ruderer hält nur einen Riemen;
13. beide Hände desselben Ruderers liegen am selben Griff;
14. Cox besitzt keinen Riemen;
15. kein Schaft besitzt einen Knick;
16. jede Dolle liegt auf der Achse ihres Riemens;
17. keine überzähligen Blätter, Schäfte, Dollen oder Rigger;
18. identische Stilparameter wie beim Einer.

---

# 20. Pair Consistency Gate

Einer und Achter werden immer nebeneinander geprüft.

Die Paarfreigabe scheitert, wenn sich sichtbar unterscheiden:

- Perspektive;
- Rumpf-Materialbehandlung;
- Außenkontur;
- Dollenform;
- Rigger-Rohrstil;
- Schaftbreite;
- Blattform;
- Schattenstärke;
- Person-Abstraktionsgrad;
- Kantenschärfe;
- Detaildichte;
- Verhältnis von technischem Detail zu freier Fläche.

Die beiden Darstellungen müssen wie zwei Instanzen derselben SVG-Komponentenbibliothek wirken — nicht wie zwei separat gezeichnete Illustrationen.

---

# 21. Empfohlene Implementierungsstrategie

Die Spezifikation lässt sich entweder als statische SVGs oder über einen kleinen Generator umsetzen.

Bevorzugt wird ein deterministischer Generator, z. B.:

```text
scripts/generate-rowing-schemata.mjs
```

mit einer gemeinsamen Konfiguration:

```js
const seats8plus = [
  { seat: 1, side: 'PORT' },
  { seat: 2, side: 'STARBOARD' },
  { seat: 3, side: 'PORT' },
  { seat: 4, side: 'STARBOARD' },
  { seat: 5, side: 'PORT' },
  { seat: 6, side: 'STARBOARD' },
  { seat: 7, side: 'PORT' },
  { seat: 8, side: 'STARBOARD' },
];
```

Zielassets:

```text
src/assets/images/rowing-schema-1x.svg
src/assets/images/rowing-schema-8plus.svg
```

Der Generator sollte anschließend durch Tests mindestens Crew-, Sitz-, Seiten-, Riemen- und Komponentenanzahl prüfen.

---

# 22. Abgrenzung zur bisherigen generativen Prompt-Lösung

`rowing-boat-schemata.md` bleibt als Dokumentation der verworfenen bzw. nur explorativen generativen Richtung erhalten.

Für die Produktionsassets gilt ab dieser Spezifikation:

> Geometrie wird deterministisch konstruiert. Generative Bildmodelle dürfen nicht mehr die mechanische Boot-, Rigger-, Griff- oder Riemengeometrie bestimmen.

Damit werden genau die zuvor beobachteten Fehlerklassen ausgeschlossen: geknickte Schäfte, falsche Handpositionen, Skull-Geometrie im Achter, zusätzliche Rigger und inkonsistente Komponenten.