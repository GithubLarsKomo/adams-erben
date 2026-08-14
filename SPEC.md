# SPEC — Bildproduktion für adams-erben.de

Status: Produktionsplanung  
Branch: `image-production`  
Basis: `feat/karl-adam-local-cooperation`  
Stand: 2026-08-14

## 1. Ziel

Diese Branch-Spezifikation bündelt alle noch zu produzierenden bzw. gezielt zu beschaffenden Bildmotive für `adams-erben.de`.

Ziel ist eine konsistente visuelle Sprache aus drei klar unterscheidbaren Bildwelten:

1. **Historische Originalfotografie** — authentisch, quellen- und rechteklar, ohne künstliche Historisierung.
2. **Heutige dokumentarische Fotografie** — glaubwürdig, ruhig, hochwertig, menschlich und eng mit Ratzeburg/Rudersport verbunden.
3. **Technisch präzise Illustrationen** — für Rudertechnik und Bootstypen, fachlich korrekt und visuell konsistent.

Bereits vorhandene und funktionierende Assets sollen nicht ohne konkreten Qualitätsgrund neu produziert werden. Die Priorität liegt auf echten Platzhaltern und visuellen Lücken.

---

## 2. Produktionsprioritäten

### Priorität A — vor Veröffentlichung fertigstellen

#### A1 — Ratzeburg damals

**Zweck**  
Historischer Gegenpol für die Damals-/Heute-Gegenüberstellung im Ratzeburg-Abschnitt.

**Inhalt**
- historisches Foto des Ratzeburger Ruderclubs, Bootshauses oder unmittelbaren Küchensee-Umfelds;
- idealerweise aus dem Zeitraum ca. 1955–1970;
- Perspektive so wählen, dass sich eine heutige Vergleichsaufnahme möglichst ähnlich reproduzieren lässt;
- Personen und Boote dürfen sichtbar sein, wenn sie historisch authentisch sind.

**Größe / Format**
- Minimum: `1800 × 1200 px`;
- bevorzugt: `2400 × 1600 px` oder größer;
- Seitenverhältnis: `3:2` oder `4:3`;
- Web-Ausgabe zusätzlich als optimiertes WebP.

**Aussehen**
- Original Schwarzweiß oder Originalfarbigkeit beibehalten;
- keine künstliche Sepia-Tönung;
- keine generativ ergänzten historischen Bildelemente;
- nur behutsame Restaurierung von Kontrast, Staub und kleinen Schäden.

**Rechte**
- Fotograf/Urheber, Quelle, Jahr und Nutzungsfreigabe dokumentieren;
- Credit-Zeile vor Integration festlegen.

---

#### A2 — Ratzeburg heute — Vergleichsansicht

**Zweck**  
Direkter visueller Vergleich mit A1.

**Inhalt**
- heutiger RRC/Bootshaus-/Küchensee-Blick aus möglichst identischer Position;
- Blickrichtung, Brennweitenwirkung und Horizont an A1 angleichen;
- dezentes heutiges Clubleben erlaubt: Boot tragen, Ablegen, Personen am Steg;
- keine inszenierte Event- oder Werbefotografie.

**Größe / Format**
- bevorzugt: `2400 × 1600 px` oder größer;
- identisches Seitenverhältnis wie A1;
- zusätzlicher Crop für Mobile möglich.

**Aussehen**
- natürliches Tageslicht;
- dokumentarisch-cinematisch;
- realistische Farben;
- leichte analoge Anmutung / sehr dezentes Filmkorn möglich;
- nicht übermäßig HDR- oder Werbe-lookartig.

---

#### A3 — Ruderakademie Ratzeburg mit Dom

**Zweck**  
Ersetzt den expliziten Bildplatzhalter im Abschnitt zur Ruderakademie.

**Inhalt**
- Ruderakademie klar im Vorder- oder Mittelgrund;
- Ratzeburger Dom eindeutig erkennbar im Hintergrund;
- räumlicher Zusammenhang zwischen Rudersport und Stadt sichtbar;
- optional dezentes sportliches Leben, jedoch ohne Menschenmenge.

**Größe / Format**
- bevorzugt: `2400 × 1600 px`;
- alternativ mindestens `2000 × 1333 px`;
- Master: `3:2`;
- Mobile-Crop: `4:3` berücksichtigen.

**Aussehen**
- hochwertige dokumentarische Architektur-/Reportagefotografie;
- natürliches Licht;
- keine extreme Weitwinkelverzerrung;
- kein touristischer Postkartenlook;
- ruhig und glaubwürdig.

---

#### A4 — Der Achter — technisch korrekte Hauptillustration

**Zweck**  
Ersetzt die aktuelle Storyboard-/CSS-Platzhaltergrafik im Abschnitt „Rudern verstehen“.

**Inhalt — zwingend**
- komplette Darstellung eines klassischen gesteuerten Rennachters `8+`;
- genau 8 Ruderer;
- genau 1 Steuermann;
- Bug links, Heck rechts;
- Platz 1 am Bug;
- Plätze 2–7 in korrekter Reihenfolge;
- Platz 8 / Schlagmann unmittelbar vor dem Heck;
- Steuermann am äußersten Heck hinter Platz 8;
- genau 8 Riemen;
- jeder Ruderer hält genau einen Riemen;
- exakt 4 Backbord- und 4 Steuerbordriemen;
- Riemenseiten wechseln strikt von Sitz zu Sitz;
- alle Ausleger, Dollen, Sitze und Riemen geometrisch plausibel;
- zurückhaltende, einheitliche Ruderlage aller Athleten.

**Größe / Format**
- bevorzugt als `SVG`-Master;
- zusätzlich PNG/WebP-Fallback;
- Raster-Fallback mindestens `2000 × 550 px`;
- Ziel-Seitenverhältnis ca. `3.5:1` bis `4:1`.

**Aussehen**
- technisch realistisch, nicht schematisch verspielt;
- nahezu orthografische Draufsicht;
- keine starke Perspektive oder Verkürzung;
- keine Blueprint-Anmutung;
- Materialität von Boot, Riemen und Auslegern darf sichtbar sein;
- Farbwelt: Marineblau, Weiß, Wasserblau; warme Akzente nur sparsam.

**Qualitätsgate**
- Anzahl Personen, Sitze und Riemen vor Freigabe manuell prüfen;
- Alternation der Riemenseiten manuell Sitz für Sitz prüfen;
- Steuermannposition und Blickrichtung prüfen.

---

#### A5 — Gigboot — technisch korrekte Illustration

**Zweck**  
Ersetzt die aktuelle Storyboard-Grafik des Gigboots.

**Inhalt**
- klar erkennbares gesteuertes Wander-/Gigboot;
- breiterer, robusterer Rumpf als beim Rennboot;
- Rollsitz, Stemmbrett, Ausleger und Dollen fachlich korrekt;
- Steuerposition plausibel;
- optional Gepäck oder typische Wanderruder-Ausrüstung dezent sichtbar;
- keine Verwechslung mit Freizeit-, Fischer- oder Motorboot.

**Größe / Format**
- bevorzugt als `SVG`-Master;
- Raster-Fallback mindestens `1800 × 1100 px`;
- Seitenverhältnis etwa `16:10` oder `3:2`.

**Aussehen**
- leicht orthografische Drauf-/Schrägansicht;
- technisch präzise, aber weniger diagrammatisch als A4;
- heller, ruhiger Hintergrund;
- stilistisch mit A4 konsistent.

---

#### A6 — Skull und Riemen — Vergleichsillustration

**Zweck**  
Erklärt den fundamentalen Unterschied zwischen Skullen und Riemen unmittelbar visuell.

**Inhalt**
- links oder oben: Einer `1x` mit zwei Skulls;
- rechts oder unten: Achter `8+` mit je einem Riemen pro Ruderer;
- Hände, Dollen und Blatt-/Schaftlogik klar erkennbar;
- beide Darstellungen in identischer grafischer Sprache.

**Größe / Format**
- bevorzugt zwei eigenständige SVGs;
- alternativ kombinierte Illustration `2400 × 1000 px`;
- Einzelmotive mindestens `1400 × 800 px`.

**Aussehen**
- gleiche Perspektive, Linienstärke, Materialität und Farbwelt wie A4/A5;
- beschriftungsfreundlich;
- keine unnötigen dekorativen Elemente.

---

### Priorität B — stark empfohlen

#### B1 — Wanderrudern am Schaalsee

**Inhalt**
- authentisches Gig-/Wanderruderboot;
- etwa 3–5 Personen;
- ruhiges Wasser;
- norddeutsche Uferlandschaft;
- Boot eindeutig als Ruderboot erkennbar.

**Größe / Format**
- `1800 × 1350 px` oder größer;
- Seitenverhältnis `4:3`.

**Aussehen**
- ruhig, dokumentarisch, glaubwürdig;
- bevorzugt Morgen- oder spätes Nachmittagslicht;
- keine touristische Stockfoto-Ästhetik.

---

#### B2 — Wanderrudern auf dem Rhein

**Inhalt**
- Gig-/Wanderruderboot auf breitem Fluss;
- Strömung und Größe des Rheins sollen lesbar sein;
- kommerzielle Schifffahrt darf als Kontext vorkommen, aber nicht dominieren;
- Sicherheitsabstände und realistische Rudersituation beachten.

**Größe / Format**
- `1800 × 1350 px` oder größer;
- Seitenverhältnis `4:3`.

**Aussehen**
- dynamischer als B1;
- dokumentarisch statt spektakulär;
- natürliche Licht- und Wasserwirkung.

---

#### B3 — Wanderrudern auf dem Bodensee

**Inhalt**
- Ruderboot auf offenem Wasser;
- weiter Horizont;
- Alpen oder charakteristische Uferkulisse optional;
- Boot bleibt klar erkennbares Hauptmotiv.

**Größe / Format**
- Master mindestens `1800 × 1350 px`;
- zusätzlicher breiter Crop etwa `2000 × 1000 px`.

**Aussehen**
- weit, ruhig, atmosphärisch;
- keine übertriebene Landschaftsdramatisierung;
- glaubwürdige Rudersituation.

---

#### B4 — Karl Adam — historisches Schlüsselbild

**Zweck**  
Gibt der stark über Karl Adam erzählten Seite einen menschlichen visuellen Anker.

**Inhalt**
- authentische historische Aufnahme von Karl Adam;
- bevorzugt in Trainings-/Coach-Situation am Wasser;
- ideal: Stoppuhr, Fernglas, Boot oder Ruderer im Kontext;
- reine Studio-/Porträtaufnahme nur zweite Wahl.

**Größe / Format**
- bestmöglicher verfügbarer Originalscan;
- Ziel mindestens `1600 px` an der langen Kante.

**Aussehen**
- Original Schwarzweiß beibehalten;
- keine KI-Kolorierung;
- keine künstliche Patina;
- nur leichte Restaurierung.

**Rechte**
- nur mit geklärtem Nutzungsrecht;
- Quelle und Fotograf sauber dokumentieren.

---

#### B5 — „Adams Erben heute“ — sechs Portraits

**Zweck**  
Ersetzt die rein textlichen Platzhalter der Stimmen durch eine kohärente menschliche Ebene.

**Inhalt**
Eine zusammengehörige Portraitserie mit sechs realen Personen aus unterschiedlichen Generationen und Perspektiven, z. B.:
- Jugendrudern;
- Leistungsrudern;
- Hochschul-/Vereinsrudern;
- Trainer-/Breitensportperspektive;
- Masters;
- sehr langjährige ältere Rudererfahrung.

**Größe / Format**
- Minimum: `1200 × 1500 px` je Portrait;
- bevorzugt: `1600 × 2000 px`;
- Master-Seitenverhältnis `4:5`;
- quadratischer Crop muss möglich bleiben.

**Aussehen**
- alle sechs Bilder mit konsistentem Licht- und Farbkonzept;
- echte Ruderorte: Bootshaus, Steg, Wasser, Bootshalle;
- natürliches Licht;
- ruhig, persönlich, glaubwürdig;
- keine klassische Corporate-Headshot- oder Stockfoto-Anmutung.

**Rechte / Datenschutz**
- Einwilligung zur Veröffentlichung dokumentieren;
- Namensnennung, Verein/Rolle und Bildnutzung separat freigeben.

---

### Priorität C — Qualitäts-Upgrade

#### C1 — Hero final

**Status**  
Ein Hero-Asset ist bereits vorhanden; Neuproduktion nur, wenn eine stärkere lokale Ratzeburg-Verankerung gewünscht ist.

**Inhalt**
- starkes heutiges Rudermotiv in Ratzeburg;
- Mensch, Boot und Ort in glaubwürdigem Zusammenhang;
- ausreichend ruhige Bereiche für Hero-Text und responsive Crops.

**Größe / Format**
- bevorzugt `3200 × 1800 px`;
- mindestens `2400 × 1350 px`;
- `16:9` Master;
- sichere `4:3`-Crop-Zone vorsehen.

**Aussehen**
- documentary-cinematic;
- natürliche Morgen-/Abendstimmung;
- subtile analoge Charakteristik möglich;
- keine dramatische Werbekampagnen-Ästhetik;
- ausschließlich korrekte Ruderboote.

---

#### C2 — Biografie-Cover

**Status**  
Optional und nur bei geklärten Nutzungsrechten.

**Inhalt**
- echtes Cover bzw. reale Buchdarstellung von „Karl Adam – Der Vater des Deutschland-Achters“;
- alternativ sauber freigestelltes Originalcover.

**Größe / Format**
- mindestens `1400 px` Höhe;
- PNG oder WebP mit transparentem Hintergrund, sofern sinnvoll.

**Aussehen**
- keine generische 3D-Buch-Mockup-Inszenierung;
- Originalgestaltung respektieren.

---

## 3. Bereits vorhandene Assets — kein Produktionsschwerpunkt

Folgende Bildbereiche verfügen bereits über verwendbare Assets und werden im Rahmen dieses Branches nur bei konkretem Qualitätsproblem ersetzt:

- Regatta-Bild;
- Adams-Labor: gemessenes Training;
- Adams-Labor: Kraft-/Wintertraining;
- Adams-Labor: Ruderblätter über die Zeit;
- Adams-Labor: Höhentraining Mexiko;
- World-Rowing-Logo;
- DRV-Logo;
- Schubschlag-Assets;
- Sportdeutschland.tv-Asset;
- vorhandenes RRC-heute-Bild;
- vorhandenes Hero-Skiff-Asset.

Das vorhandene RRC-heute-Bild kann unabhängig davon durch A2 ersetzt werden, wenn für den Damals-/Heute-Vergleich eine gezielt reproduzierte Perspektive nötig ist.

---

## 4. Einheitliche Produktionsregeln

### 4.1 Fotografie

- Masterdateien in sRGB;
- lange Kante möglichst mindestens `2400 px`;
- Originale zusätzlich unverändert archivieren;
- Website-Ausgabe bevorzugt als WebP;
- JPEG/TIFF als Archiv-/Bearbeitungsquelle zulässig;
- keine eingebrannten Texte, Logos oder Captions;
- zentrale 60–70 % des Motivs als responsive Safe-Zone behandeln;
- natürliche Haut-, Wasser- und Himmelsfarben;
- keine aggressive HDR-Bearbeitung.

### 4.2 Illustrationen

- `SVG` als Master bevorzugen;
- saubere skalierbare Geometrie;
- zusätzlich PNG/WebP-Fallbacks;
- einheitliche Perspektive, Materialdarstellung und Linienstärke;
- Grundfarben: Marineblau, Wasserblau, Weiß;
- warme Akzentfarbe nur sparsam;
- technische Richtigkeit hat Vorrang vor grafischer Eleganz;
- keine erfundenen Bootsdetails, Sitze, Ausleger oder Riemenkonfigurationen.

### 4.3 Historisches Material

- Originalästhetik bewahren;
- keine künstliche Alterung;
- keine generative Rekonstruktion fehlender Bildbereiche ohne explizite Kennzeichnung;
- keine Kolorierung ohne redaktionelle Kennzeichnung als Rekonstruktion;
- Originalscan und bearbeitete Webfassung getrennt archivieren.

### 4.4 Rechte- und Quellenmetadaten

Für jedes fremde Bild sind mindestens zu dokumentieren:

```text
title:
filename:
photographer_or_creator:
source:
year:
rights_holder:
permission_or_license:
credit_line:
restrictions:
alt_text:
```

Ohne ausreichende Rechteklärung keine Veröffentlichung.

---

## 5. Dateibenennung

Neue Produktionsassets sollen sprechend und stabil benannt werden.

Empfohlenes Schema:

```text
ratzeburg-damals.webp
ratzeburg-heute-vergleich.webp
ruderakademie-dom.webp
achter-8plus.svg
achter-8plus.webp
gigboot.svg
gigboot.webp
skull-vs-riemen.svg
wanderrudern-schaalsee.webp
wanderrudern-rhein.webp
wanderrudern-bodensee.webp
karl-adam-historisch.webp
voice-01.webp
voice-02.webp
voice-03.webp
voice-04.webp
voice-05.webp
voice-06.webp
hero-ratzeburg.webp
```

Produktionsdateien gehören nach Freigabe in:

```text
src/assets/images/
```

Quell-/Masterdateien, die nicht ausgeliefert werden sollen, gehören nicht unkomprimiert in den öffentlichen Build-Pfad.

---

## 6. Empfohlene Produktionsreihenfolge

1. **A1 Ratzeburg damals** — zuerst beschaffen, weil A2 davon perspektivisch abhängt.
2. **A2 Ratzeburg heute — Vergleichsansicht**.
3. **A3 Ruderakademie Ratzeburg mit Dom**.
4. **A4 technisch korrekter Achter**.
5. **A5 Gigboot**.
6. **B4 Karl Adam — historisches Schlüsselbild**.
7. **B5 sechs Portraits „Adams Erben heute“**.
8. **A6 Skull und Riemen**.
9. **B1–B3 Wanderrudern Schaalsee / Rhein / Bodensee**.
10. **C1 Hero final** nur bei Bedarf.
11. **C2 Biografie-Cover** nur bei Rechtefreigabe.

---

## 7. Acceptance Criteria

Der Branch ist bildseitig abnahmefähig, wenn:

- [ ] A1 und A2 bilden ein erkennbares, perspektivisch sinnvolles Damals-/Heute-Paar;
- [ ] A3 ersetzt den Ruderakademie-Bildplatzhalter und zeigt Akademie + Dom klar erkennbar;
- [ ] A4 zeigt exakt 8 Ruderer, 1 Steuermann und 8 korrekt alternierende Riemen;
- [ ] A5 ist eindeutig als Gig-/Wanderruderboot erkennbar und technisch plausibel;
- [ ] A6 erklärt Skull vs. Riemen ohne fachliche Mehrdeutigkeit;
- [ ] historische Bilder besitzen dokumentierte Quelle und Nutzungsfreigabe;
- [ ] alle neuen Fotos besitzen geeignete Desktop- und Mobile-Crops;
- [ ] alle neuen Illustrationen besitzen ein SVG-Master oder dokumentierten Grund, warum nicht;
- [ ] keine KI-generierten historischen Motive werden als dokumentarische Originale ausgegeben;
- [ ] alle Assets haben Alt-Texte und Rechte-/Credit-Metadaten;
- [ ] Dateigrößen der Website-Fassungen sind für Webnutzung optimiert;
- [ ] vorhandene gute Assets wurden nicht ohne nachvollziehbaren Grund ersetzt.

---

## 8. Produktionsstatus

| ID | Motiv | Priorität | Status |
|---|---|---:|---|
| A1 | Ratzeburg damals | A | offen |
| A2 | Ratzeburg heute — Vergleichsansicht | A | offen |
| A3 | Ruderakademie Ratzeburg mit Dom | A | offen |
| A4 | Achter 8+ | A | offen |
| A5 | Gigboot | A | offen |
| A6 | Skull vs. Riemen | A | offen |
| B1 | Wanderrudern Schaalsee | B | offen |
| B2 | Wanderrudern Rhein | B | offen |
| B3 | Wanderrudern Bodensee | B | offen |
| B4 | Karl Adam — historisches Schlüsselbild | B | offen |
| B5 | Sechs Portraits „Adams Erben heute“ | B | offen |
| C1 | Hero final | C | optional |
| C2 | Biografie-Cover | C | optional / Rechtegate |

Statuswerte: `offen` · `in Recherche` · `in Produktion` · `zur Freigabe` · `freigegeben` · `integriert` · `verworfen`.
