# SPEC — Adams Erben: Kinobesucher-Landingpage + Rudern-Vertiefungsseite

Status: Umsetzungsgrundlage  
Branch: `feat/landingpage-kinobesucher`  
Basis: `feat/karl-adam-local-cooperation` @ `dd8318e87f9f4cd677653456af9cca99af77b3a7`  
Stand: 2026-08-14  
Zieltermin: vor dem Kinostart von **„Adams Acht“ am 17. September 2026**

---

## 1. Architekturentscheidung

Der aktuelle Stand von `adams-erben.de` enthält zwei sehr unterschiedliche Produkte in einer einzigen langen Seite:

1. eine emotionale Landingpage für Menschen, die über den Film **„Adams Acht“** zum ersten Mal mit Karl Adam oder Rudern in Berührung kommen;
2. eine redaktionell tiefe Fach-/Magazinseite zu Karl Adam, Ratzeburg, Trainingsinnovation, Ruderkultur, Ruderakademie, Regatta, Rudertechnik, World Rowing, DRV, Schubschlag, Wanderrudern, Förderung und historischer Einordnung.

Diese beiden Produkte werden getrennt.

### Verbindliche Zielarchitektur

- `/` = **primäre Kinobesucher- und Einsteiger-Landingpage**
- `/rudern/` = **redaktionelle Vertiefungsseite für Ruderer und stärker Interessierte**

Die Startseite `/` wird standardmäßig ausgeliefert und ist der wichtigste Einstieg aus Film, Presse, Social Media, QR-Codes und Suchmaschinen.

Die Vertiefungsseite `/rudern/` ist bewusst kein versteckter Bereich, sondern die zweite Informationsebene. Sie wird von der Startseite mehrfach natürlich verlinkt.

### Leitprinzip

> **Die Startseite beantwortet: „Der Film hat mich neugierig gemacht — wie komme ich ins Boot?“**  
> **Die Vertiefungsseite beantwortet: „Ich möchte verstehen, was Karl Adam verändert hat und wie Rudern heute funktioniert.“**

---

## 2. Markenversprechen

Die zentrale Leitidee bleibt unverändert:

> **Der Film endet im Kino. Adams Erbe lebt im Bootshaus weiter.**

Die Marke `Adams Erben` verbindet drei Ebenen:

1. Karl Adams Geschichte;
2. das lebendige Rudern von heute;
3. den persönlichen Einstieg in einen Verein.

`adams-erben.de` ist:

- eine unabhängige Initiative zum Kinostart von „Adams Acht“;
- keine offizielle Filmseite;
- keine offizielle Website des DRV, RRC, World Rowing oder anderer genannter Organisationen;
- keine vollständige Karl-Adam-Biografie;
- eine redaktionelle Brücke von Geschichte zu Gegenwart;
- ein niedrigschwelliger Weg, Rudern selbst auszuprobieren.

---

## 3. Zielgruppen

### 3.1 Primäre Zielgruppe von `/`: Kinobesucher und Ruder-Neulinge

Typischer Zustand:

- hat „Adams Acht“ gesehen, einen Trailer gesehen oder davon gelesen;
- kennt Karl Adam nur teilweise oder gar nicht;
- kennt Rudersport, Bootsklassen und Verbandsstruktur kaum;
- ist emotional neugierig;
- fragt eher „Kann ich das auch?“ als „Welcher Verein ist zuständig?“;
- nutzt sehr wahrscheinlich ein Smartphone;
- benötigt schnell eine verständliche Handlungsmöglichkeit.

Kernbedürfnisse:

- Orientierung in wenigen Sekunden;
- emotionaler Anschluss an den Film;
- Abbau von Einstiegshürden;
- echte Menschen statt abstrakter Sportwerbung;
- schneller lokaler Verein;
- einfache Kontaktaufnahme.

### 3.2 Primäre Zielgruppe von `/rudern/`: Ruderer und vertieft Interessierte

Typischer Zustand:

- kennt Rudersport zumindest teilweise;
- interessiert sich für Karl Adams Wirkung und Ratzeburg;
- möchte mehr über Training, Technik, Institutionen, Regatta und Ruderkultur erfahren;
- erwartet fachliche Genauigkeit und belastbare Quellen;
- akzeptiert längere Inhalte, wenn sie Substanz haben.

Kernbedürfnisse:

- historische und technische Tiefe;
- fachlich korrekte Darstellungen;
- nachvollziehbare Quellen;
- Verbindung von Adams Zeit mit modernem Rudern;
- differenzierte historische Einordnung;
- relevante externe Vertiefungen.

### 3.3 Weitere Zielgruppen

- Trainerinnen und Trainer;
- Vereinsverantwortliche;
- Rudereltern und Familien;
- sporthistorisch Interessierte;
- Menschen aus Ratzeburg und Umgebung;
- Medien und Multiplikatoren;
- potenzielle Förderer und Ehrenamtliche.

---

## 4. Erfolgskriterien

### 4.1 Erfolg der Startseite `/`

Eine Person ohne Ruderwissen soll innerhalb von etwa 60 Sekunden verstehen:

1. „Adams Erben knüpft an den Film an, ist aber unabhängig.“
2. „Karl Adams Ideen wirken im heutigen Rudern weiter.“
3. „Rudern ist nicht nur olympischer Hochleistungssport.“
4. „Ich kann Rudern selbst ausprobieren.“
5. „Ich kann hier einen Verein in meiner Nähe finden.“

### 4.2 Primäre Conversion

**Start einer Vereinssuche mit Ort oder Postleitzahl.**

### 4.3 Sekundäre Conversion

**Kontaktaufnahme bzw. Klick zur Vereinswebsite mit dem Ziel, Rudern auszuprobieren.**

### 4.4 Erfolg der Vertiefungsseite `/rudern/`

Ein interessierter Besucher soll:

- mindestens einen fachlichen Vertiefungsbereich leicht finden;
- Karl Adams Wirkung differenziert verstehen;
- historische und heutige Inhalte klar unterscheiden können;
- jederzeit zurück zur Vereinssuche gelangen;
- externe Quellen als Vertiefung, nicht als zufällige Linkliste erleben.

---

# TEIL A — STARTSEITE `/`

## 5. Aufgabe der Startseite

Die Startseite ist keine gekürzte Kopie des bisherigen Long-Pagers, sondern eine eigenständige Landingpage.

Sie soll in etwa 5 Minuten vollständig erfassbar sein.

### Zielgefühl

- neugierig;
- menschlich;
- glaubwürdig;
- hochwertig;
- nicht museal;
- nicht technisch;
- nicht verbandsbürokratisch;
- nicht wie klassische Sportwerbung.

### Zentrale Nutzerfrage

> **„Der Film hat mich neugierig gemacht. Kann ich Rudern selbst ausprobieren?“**

Die Seite beantwortet diese Frage möglichst früh mit **Ja** und bietet sofort einen lokalen Einstieg.

---

## 6. Verbindliche Reihenfolge auf `/`

1. **Hero**
2. **Film-Brücke „Adams Acht“**
3. **Quick Finder „Rudern ausprobieren“**
4. **Ratzeburg als realer Ort der Geschichte**
5. **Adams Erbe heute — 3–5 verdichtete Prinzipien**
6. **Echte Stimmen aus dem Rudern**
7. **„Rudern ist mehr als Rennen“ — kurzer Breiten-/Lebenssport-Teaser**
8. **zweiter Conversion-CTA / Quick Finder oder kurze Vereinssuche**
9. **Vertiefungs-Teaser zu `/rudern/`**
10. **Unabhängigkeit / Rechtliches / Footer**

Die vollständige lange Fachseite darf nicht mehr vollständig innerhalb `/` eingebettet werden.

---

## 7. Hero auf `/`

### Headline

Beibehalten:

**Der Film endet im Kino.  
Adams Erbe lebt im Bootshaus weiter.**

### Lead

Maximal 2–3 kurze Sätze.

Der Lead muss:

- Filmbezug herstellen;
- Karl Adam in die Gegenwart verlängern;
- persönliche Teilnahme ermöglichen.

Keine Fachbegriffe im ersten Absatz.

### Primärer CTA

**Rudern ausprobieren**

Ziel: Quick Finder.

### Sekundärer CTA

**Ratzeburg entdecken**

oder, wenn dramaturgisch besser:

**Mehr über Adams Erbe**

### Unabhängigkeit

Der bestehende Hinweis auf die Unabhängigkeit bleibt sichtbar, aber visuell sekundär.

---

## 8. Film-Brücke auf `/`

Direkt nach dem Hero.

### Aufgabe

- bestätigen, warum der Besucher hier ist;
- „Adams Acht“ als Ausgangspunkt nennen;
- offiziellen Trailer und Filmseite verlinken;
- unmittelbar vom Zuschauen zum Mitmachen überleiten.

### Muss enthalten

- Filmstart: **17. September 2026**;
- Trailer-Link;
- offizielle Filmseite;
- keine Filmstills/Poster ohne Rechtefreigabe;
- keine Formulierung, die eine offizielle Partnerschaft suggeriert.

### Übergang

Sinngemäß:

> **Der Film erzählt die Geschichte. Den nächsten Schlag kannst du selbst machen.**

Finaler Wortlaut redaktionell abstimmen.

---

## 9. Quick Finder auf `/` — Kernfunktion

Der Quick Finder ist die wichtigste neue Komponente.

### Position

Direkt nach der Film-Brücke.

### Ziel

Ein Nutzer kann mit **einer einzigen Eingabe** starten.

### UI

```text
Rudern ausprobieren

Ort oder Postleitzahl
[________________________]  [Verein in der Nähe finden]

Keine Erfahrung nötig · Rudern für viele Altersgruppen · deutschlandweit
```

### Nicht anzeigen

Im Quick Finder nicht primär anzeigen:

- Organisationstyp;
- Landesruderverband;
- DRV;
- Bundesland;
- Radius als Pflichtentscheidung;
- administrative Datenfilter.

### Technisches Verhalten

- bestehende lokale PLZ-/Ortssuche wiederverwenden;
- keine externe Maps-/Geocoding-API;
- Standardradius 50 km;
- vorzugsweise 3 nächste Rudervereine anzeigen;
- falls kein Verein im Radius: nächstgelegene Vereine als Fallback;
- „Standort verwenden“ optional sekundär;
- Geolocation nur lokal für Distanzberechnung.

### Ergebnisdarstellung

Pro Verein primär:

- Vereinsname;
- Ort;
- Entfernung;
- CTA **„Rudern ausprobieren“** oder **„Probetraining anfragen“** bei direktem Kontakt;
- andernfalls **„Vereinswebsite öffnen“**.

Technische Hinweise zu Routing, Datenquelle oder Organisationstypen werden sekundär dargestellt.

### Übergang zur Vollsuche

Link:

**Alle Vereine und Suchfilter anzeigen**

Dieser kann entweder einen erweiterten Bereich auf `/` öffnen oder auf einen dedizierten Suchbereich führen. Die bestehende Vollsuche darf funktional nicht verloren gehen.

---

## 10. Ratzeburg auf `/`

Ratzeburg ist der emotionale und reale Beweis dafür, dass Adams Geschichte bis heute an einem konkreten Ort weiterlebt.

### Auf `/` bleiben

- Ratzeburg als „besonderer Ort“;
- RRC als zentraler historischer und heutiger Verein;
- heutiges RRC-Bild;
- sehr kurze Einordnung;
- RRC-Website;
- direkter Kontakt, sofern erlaubt;
- Link zur Vertiefung auf `/rudern/`.

### Auf `/rudern/` verschieben

- ausführliche Stadtführung;
- detaillierte Regatta-Historie;
- Ruderakademie-Timeline;
- Bundesstützpunkt-Netzwerk;
- lange institutionelle Einordnung.

### Teaser auf `/`

Ein kurzer Satz darf auf Regatta und Ruderakademie verweisen, z. B.:

> In Ratzeburg ist Adams Erbe bis heute sichtbar — im Ruderclub, in der internationalen Regatta und in der Ruderakademie.

CTA:

**Ratzeburg und Adams Erbe vertiefen → `/rudern/#ratzeburg`**

---

## 11. „Adams Erbe heute“ auf `/`

Die ausführlichen fünf Labor-Karten werden nicht vollständig auf der Startseite gezeigt.

Stattdessen eine verdichtete, schnell erfassbare Darstellung mit 3–5 Prinzipien.

Empfohlen:

1. **Training wird messbar**
2. **Kraft wird systematisch**
3. **Material wird zur Stellschraube**
4. **Athleten sollen verstehen**
5. **Das Boot wird als Einheit gedacht**

Jeder Punkt:

- kurze Headline;
- maximal 1–2 Sätze;
- visuelles Motiv;
- optionaler Link zur Vertiefung.

CTA:

**Wie Karl Adam das Rudern verändert hat → `/rudern/#labor`**

Keine Detaildiskussion zu Höhentraining, Rigging oder Trainingsperiodisierung auf `/`.

---

## 12. Stimmen auf `/`

Die Stimmen werden auf der Startseite deutlich wichtiger als im aktuellen Long-Pager.

### Ziel

Nicht Fachwissen vermitteln, sondern soziale Eintrittsbarrieren senken.

### Bevorzugte Perspektiven

- Jugendliche/r;
- später Einsteiger / Breitensport;
- Leistungssport;
- Trainer/in;
- Masters;
- sehr langjährig aktive Person.

### Besonders relevante Fragen

- „Was hat dich überrascht, als du das erste Mal in einem Ruderboot saßt?“
- „Was würdest du jemandem sagen, der nach ‚Adams Acht‘ überlegt, Rudern auszuprobieren?“
- „Was bleibt vom Rudern außerhalb des Bootes?“

### Launch-Gate

Keine sichtbaren Zitat-Platzhalter im Produktionsstand.

Wenn echte Aussagen noch fehlen, Sektion reduzieren oder temporär weglassen.

Keine künstlichen Zitate realer Personen.

---

## 13. „Rudern ist mehr als Rennen“ auf `/`

Kinobesucher dürfen nicht den Eindruck bekommen, Rudern sei nur olympischer Hochleistungssport.

Kurzer Teaser mit maximal drei Perspektiven:

- Rennrudern;
- gemeinsames Vereinsrudern;
- Wanderrudern / Rudern als lebenslanger Sport.

Keine ausführlichen Bootsklassen oder Trainingswochen.

CTA:

**Rudern verstehen → `/rudern/#rudern-verstehen`**

---

## 14. Zweite Conversion auf `/`

Nach den Stimmen bzw. dem Breitenrudern-Teaser folgt erneut eine einfache Einladung.

Bevorzugte Headline:

> **Vielleicht beginnt Adams Erbe für dich mit dem ersten Schlag.**

CTA:

**Ruderverein in meiner Nähe finden**

Der Nutzer darf nicht bis zum Seitenende scrollen müssen, um erneut zum Einstieg zu gelangen.

---

## 15. Vertiefungs-Teaser auf `/`

Die Startseite verlinkt die zweite Seite als freiwillige Vertiefung.

### Bezeichnung

Nicht „Professional“ im sichtbaren UI.

Bevorzugt:

- **Mehr entdecken**
- **Rudern & Adams Erbe**
- **Rudern verstehen**
- **Geschichte und Ruderkultur vertiefen**

Empfohlene Seitentitel-Formulierung:

**Rudern & Adams Erbe**

### Teaser-Kacheln

Maximal 3–4:

1. **Warum Karl Adam das Training veränderte**
2. **Was im Achter wirklich passiert**
3. **Ratzeburg, Regatta und Ruderakademie**
4. **Geschichte, Verantwortung und Quellen**

Alle führen gezielt zu Ankern auf `/rudern/`.

---

# TEIL B — VERTIEFUNGSSEITE `/rudern/`

## 16. Aufgabe von `/rudern/`

`/rudern/` übernimmt den redaktionellen Tiefgang des heutigen Long-Pagers.

Die Seite darf lang sein.

Sie soll sich wie ein hochwertiges digitales Magazin bzw. eine interaktive Einführung in Adams Erbe und Rudern anfühlen.

### Zielgefühl

- substanziell;
- fachlich glaubwürdig;
- editorisch;
- technisch präzise;
- historisch differenziert;
- nicht wie eine lose Sammlung von Artikeln oder Links.

---

## 17. Verbindliche Reihenfolge auf `/rudern/`

Empfohlen:

1. **Intro „Rudern & Adams Erbe“**
2. **Adams Labor**
3. **Internationale Ratzeburger Ruderregatta**
4. **Ruderakademie Ratzeburg**
5. **Rudern verstehen**
6. **Deutschlandachter / Weltbestzeit 2017** innerhalb von „Rudern verstehen“
7. **Rennrudern und Wanderrudern**
8. **Stimmen / Schubschlag / Ruderkultur**
9. **Historische Verantwortung / NS-Einordnung**
10. **Biografie / Ausstellung / karladam.de**
11. **Ratzeburger Stadtführung**
12. **Förderung / Karl-Adam-Stiftung / Ehrenamt**
13. **CTA zurück zur Vereinssuche / Startseite**

Die Reihenfolge darf bei Umsetzung leicht optimiert werden, solange die thematische Logik erhalten bleibt.

---

## 18. Intro auf `/rudern/`

Keine Wiederholung des vollständigen Startseiten-Heros.

### Aufgabe

- erklären, dass dies die Vertiefungsebene ist;
- schnell Orientierung geben;
- die großen Themenfelder sichtbar machen.

Empfohlene Headline:

> **Rudern verstehen. Adams Erbe einordnen.**

Subline sinngemäß:

> Training, Technik, Team, Ratzeburg und die Geschichte dahinter — für alle, die nach Film oder erstem Eindruck tiefer einsteigen möchten.

### Persistenter Rückweg

Im Header oder direkt im Intro:

**Rudern ausprobieren / Verein finden → `/` bzw. Suchanker**

---

## 19. Adams Labor auf `/rudern/`

Die bestehenden Inhalte bleiben grundsätzlich erhalten:

- Training;
- Kraft;
- Material;
- Führung;
- Physiologie / Mexiko 1968.

### Leitplanken

- historische Praxis, Adams Beitrag und heutige Einordnung klar trennen;
- keine unbelegten „Adam erfand X“-Aussagen;
- Quellen sichtbar oder leicht erreichbar;
- fachliche Bilder korrekt;
- lange Inhalte dürfen hier vollständig gezeigt werden.

### Zusätzliche UX

Ein kurzer Inhaltsnavigator am Beginn des Abschnitts ist zulässig.

---

## 20. Internationale Ratzeburger Ruderregatta auf `/rudern/`

Die vollständige bestehende Regatta-Story gehört auf die Vertiefungsseite.

Beibehalten:

- 1957;
- 1965;
- 1967;
- 2026 / 67. Regatta;
- Bild;
- Sportdeutschland-/SportEurope-Re-Live;
- historische Links.

Kernbotschaft:

> **Adams Erbe ist kein Museum.**

Die Regatta verbindet Geschichte, internationale Gegenwart und Ehrenamt.

---

## 21. Ruderakademie auf `/rudern/`

Die vollständige institutionelle Einordnung wird hier gezeigt.

Beibehalten:

- Entstehungsidee Anfang der 1960er;
- Eröffnung 1968;
- heutige modernisierte Nutzung;
- Rolle als Trainings-/Bildungszentrum;
- Einordnung in Bundesstützpunkt-/Leistungssystem;
- keine Überbehauptung, dass alle heutigen Zentren aus Ratzeburg hervorgegangen seien.

### Launch-Gate

Der aktuelle sichtbare Bildplatzhalter muss ersetzt oder entfernt werden.

---

## 22. Rudern verstehen auf `/rudern/`

Die aktuelle ausführliche Einführung gehört vollständig auf `/rudern/`.

Beibehalten bzw. weiterentwickeln:

- Skull vs. Riemen;
- Einer und Achter;
- Plätze 1–8;
- Steuerperson;
- Trainingswoche;
- Saison;
- 2.000-m-Rennen;
- Weltbestzeit Deutschlandachter 2017;
- Altersklassen;
- Masters;
- Gigboot;
- Wanderrudern;
- Langstreckenrennen.

### Fachliche Launch-Gates

- keine als „Storyboard-Grafik“ gekennzeichneten Platzhalter im Produktionsstand;
- fachlich saubere Achterdarstellung;
- korrekte Oar-/Rigger-/Crew-Geometrie;
- korrekte Bootsdarstellungen im Wanderrudern.

---

## 23. World Rowing, DRV und Schubschlag auf `/rudern/`

Diese Quellen und Vertiefungen bleiben wichtig, werden aber auf `/rudern/` gebündelt.

### World Rowing

- internationaler Blick;
- Regeln, Bootsklassen, Wettkampfformate;
- Weltbestzeit-Link.

### DRV

- offizielle Vereinssuche;
- Ruderakademie;
- historische Aufarbeitung;
- Bundesstützpunkte;
- weitere Primärquellen.

### Schubschlag

- Hauptkachel bei „Stimmen / Ruderkultur“;
- kontextuelle Hörtipps bleiben möglich;
- nicht in jeder Sektion so dominant, dass die Seite zur Podcast-Linkliste wird.

---

## 24. Historische Verantwortung auf `/rudern/`

Die NS-Vergangenheit und spätere Aufarbeitung bleiben zwingender Bestandteil.

### Ziel

Keine Heldenverehrung ohne Kontext.

### Darstellungsprinzip

Trennen zwischen:

1. nachweisbaren biografischen Fakten;
2. Adams eigener späterer Darstellung;
3. Nachkriegsrezeption;
4. heutiger Bewertung;
5. offenen Forschungsfragen.

### Quellenbasis

- DRV-Aufarbeitung;
- Entscheidung zum Karl-Adam-Preis;
- weitere belastbare sporthistorische Quellen;
- journalistische Einordnung klar als solche kennzeichnen.

Dieser Bereich darf nicht auf der Startseite zum Hauptthema werden, aber `/` muss durch seine Verlinkung zur Vertiefung transparent machen, dass die historische Ambivalenz nicht ausgeblendet wird.

---

## 25. Biografie, Ausstellung und karladam.de auf `/rudern/`

### Prinzip

Adams Erben ersetzt keine vollständige Biografie.

Beibehalten:

- Biografie von Dirk Andresen und Timo Reinke;
- Hinweis: keine bezahlte Werbung / keine Provision;
- Ausstellung;
- `karladam.de` sobald öffentlich belastbar;
- klare externe Verlinkung.

---

## 26. Ratzeburger Stadtführung auf `/rudern/`

Die ausführliche Stadtführungsinformation wird aus `/` herausgenommen und auf `/rudern/` integriert.

Beibehalten:

- offizielle Themenführung;
- Karl-Adam-Gedenkstein;
- Gelehrtenschule;
- historisches Bootshaus;
- Ruderakademie;
- offizielle Stadt-/Tourismuslinks;
- dynamische Termine/Preise nicht hart codieren.

---

## 27. Förderung und Ehrenamt auf `/rudern/`

Der ausführliche Abschnitt „Rudern braucht Rückenwind“ gehört auf `/rudern/`.

Beibehalten:

- Karl-Adam-Stiftung;
- Vereinsarbeit;
- Ehrenamt;
- Fördermöglichkeiten;
- Schubschlag-Hörtipp zum Ehrenamt, sofern weiterhin redaktionell passend.

Auf `/` höchstens ein kurzer Satz, dass Vereine von Engagement leben.

---

# TEIL C — GEMEINSAME FUNKTIONEN UND TECHNIK

## 28. Gemeinsame Komponenten

Die Zwei-Seiten-Architektur darf nicht zu doppelter Pflege führen.

Gemeinsam nutzen:

- Header-Komponente;
- Footer;
- Logo/Branding;
- Button-System;
- Rechtliches;
- Kontakt-Dialog;
- Vereinssuche;
- Nearest-/PLZ-Logik;
- Club-Daten;
- Routing;
- Consent;
- Quellen-/Logo-Komponenten soweit sinnvoll;
- responsive Grundsysteme.

Keine Copy/Paste-Duplikate derselben Logik in zwei HTML-Dateien, wenn eine Partial-/Build-Komponente möglich ist.

---

## 29. Routing und URLs

### Primär

- `https://adams-erben.de/`
- `https://adams-erben.de/rudern/`

### Ankerbeispiele auf `/rudern/`

- `/rudern/#labor`
- `/rudern/#regatta`
- `/rudern/#ruderakademie`
- `/rudern/#rudern-verstehen`
- `/rudern/#geschichte`
- `/rudern/#foerderung`

### Rücklinks

Jeder größere Vertiefungsbereich soll einen natürlichen Rückweg zur Handlung bieten:

**Rudern selbst ausprobieren → Verein finden**

Nicht in jeder Karte, aber mindestens nach größeren Kapiteln bzw. am Seitenende.

---

## 30. Navigation

### Navigation auf `/`

Empfohlen:

- Adams Acht
- Ratzeburg
- Rudern ausprobieren
- Verein finden
- Mehr entdecken

`Mehr entdecken` führt zu `/rudern/`.

Der persistente CTA bleibt:

**Rudern ausprobieren**

Auf sehr kleinen Displays zulässig:

**Verein finden**

### Navigation auf `/rudern/`

Empfohlen:

- Adams Labor
- Regatta
- Ruderakademie
- Rudern verstehen
- Einordnung
- Mehr / Förderung
- **Rudern ausprobieren** als CTA

Mobile weiterhin Hamburger + persistenter CTA.

### Keine doppelte Navigation

Die Startseite soll nicht alle Fachanker aus `/rudern/` im Hauptmenü tragen.

---

## 31. Vereinssuche und Kontaktlogik

Die bestehende sichere Funktionalität ist ein nicht verhandelbares Regression-Gate.

### Muss erhalten bleiben

- Suche nach Vereinsname, Ort, PLZ und Bundesland;
- lokale Nearest-Berechnung;
- keine externe Geocoding-/Maps-Abhängigkeit;
- optional lokale Geolocation;
- direkter Kontakt nur für die ausgewählte Organisation;
- kein LRV-/DRV-Fallback für Vereinskontakte;
- keine Empfänger-E-Mail im öffentlichen Datensatz;
- serverseitige Ermittlung der Empfängeradresse;
- Consent-/Datenschutzlogik;
- Preview-/Production-Modus;
- DRV als offizielle ergänzende Vereinssuche.

### Sprachliche Änderung

Technische Funktion:

**Verein finden**

Nutzerorientierter Einstieg:

**Rudern ausprobieren** / **Probetraining anfragen**

---

## 32. Build-Struktur

Der Build muss zwei eigenständige Seiten erzeugen.

Mögliche Struktur:

```text
src/
  index.html                  # Landingpage-Basis
  rudern/
    index.html                # Vertiefungsseite-Basis
  partials/
    shared-header.html
    shared-footer.html
    quick-finder.html
    club-search.html
    contact-dialog.html
    adams-lab.html
    ratzeburg-regatta.html
    ruderakademie.html
    rowing-explainer.html
```

Alternativ kann `build.mjs` zwei Seitengerüste programmatisch rendern.

### Wichtig

- keine Framework-Migration nur für diese Änderung;
- bestehende Cheerio-/Build-Architektur kann weiterverwendet werden;
- gemeinsame Assets bleiben geteilt;
- seitenbezogene CSS-Bundles dürfen getrennt sein, um Startseite schlank zu halten.

---

## 33. Performance

Die Aufteilung soll die Startseite technisch leichter machen.

### `/` soll nicht laden

- alle Detail-CSS-Regeln von „Rudern verstehen“, wenn nicht benötigt;
- schwere Diagramm-/Detailbilder der Vertiefungsseite;
- alle redaktionellen JS-Komponenten der Fachseite;
- unnötige Podcast-/Quellenassets.

### `/rudern/`

Darf mehr Inhalte laden, aber weiterhin:

- Bilder lazy laden außer Hero/above-the-fold;
- korrekte Größenangaben;
- WebP/AVIF soweit sinnvoll;
- kein unnötiges Layout Shifting.

---

## 34. Mobile First

Primäres Abnahmeszenario für `/`:

**iPhone / Safari**

### Testfall

1. Nutzer hat gerade den Film gesehen oder Scan/Link geöffnet.
2. Seite lädt.
3. Innerhalb von 10 Sekunden versteht er Thema und Nutzen.
4. Innerhalb von 30–60 Sekunden kann er Ort/PLZ eingeben.
5. Er sieht passende Vereine.
6. Er kann Kontakt aufnehmen oder die Vereinswebsite öffnen.

### Muss erhalten bleiben

- fixed Header;
- kein horizontaler Root-Scroll;
- sichtbarer CTA;
- Hamburger-Menü;
- ausreichende Touch-Ziele;
- Fokuszustände;
- `prefers-reduced-motion`;
- lokaler horizontaler Scroll nur dort, wo bewusst notwendig.

---

# TEIL D — SEO, SHARING UND ANALYTIK

## 35. SEO-Trennung

Die Zwei-Seiten-Struktur soll unterschiedliche Suchintentionen bedienen.

### `/` — Suchintention

Primär:

- Adams Acht;
- Karl Adam Film;
- Rudern ausprobieren;
- Ruderverein finden;
- Rudern lernen;
- Karl Adam Rudern.

Empfohlener Title:

**Adams Erben – Vom Kinosaal ins Boot | Rudern ausprobieren**

Description sinngemäß:

**„Adams Acht“ gesehen? Entdecke, wie Karl Adams Erbe im Rudern weiterlebt, und finde einen Ruderverein in deiner Nähe.**

### `/rudern/` — Suchintention

Primär:

- Karl Adam Training;
- Deutschlandachter;
- Ruderakademie Ratzeburg;
- Ratzeburger Ruderregatta;
- Rudern verstehen;
- Achter Rudern;
- Rudertechnik;
- Wanderrudern;
- Karl Adam Geschichte.

Empfohlener Title:

**Rudern & Adams Erbe – Training, Achter, Ratzeburg und Geschichte**

Beide Seiten erhalten eigene Canonicals.

---

## 36. Social Sharing

Beide Seiten benötigen:

- `og:title`;
- `og:description`;
- `og:url`;
- `og:image`;
- `twitter:card=summary_large_image`.

### Unterschiedliche Bilder

`/`:

- emotionales starkes Boot-/Ratzeburg-Motiv;
- Film-zu-Bootshaus-Charakter.

`/rudern/`:

- eher redaktionelles Rudersport-/Karl-Adam-Motiv.

Keine Filmstills ohne Rechtefreigabe.

---

## 37. Structured Data

Mindestens prüfen/implementieren:

### `/`

- `WebSite`;
- ggf. `Organization` bzw. Initiative nur mit sachlich korrekten Angaben;
- `SearchAction` nur wenn semantisch und technisch passend.

### `/rudern/`

- `WebPage`;
- ggf. `Article`/`CollectionPage` für klar redaktionelle Struktur;
- `Person` für Karl Adam nur mit sauberer externer Referenzierung und ohne Überbehauptung.

Keine künstlich aufgeblähten Schema-Daten.

---

## 38. Messkonzept

Falls datenschutzkonforme Analytics eingesetzt werden, mindestens unterscheiden:

### `/`

- Quick-Finder gestartet;
- Vereinsergebnis angezeigt;
- Kontakt-CTA geklickt;
- Vereinswebsite geöffnet;
- `/rudern/` aufgerufen.

### `/rudern/`

- Einstieg aus `/`;
- Kapitelanker;
- Rückkehr zur Vereinssuche;
- externe Quellenklicks.

Keine unnötige personenbezogene Tracking-Logik.

---

# TEIL E — CONTENT- UND LAUNCH-GATES

## 39. Platzhalter

Vor Production müssen sichtbare Entwicklungsplatzhalter verschwinden oder bewusst entfernt werden.

Aktuell besonders relevant:

- Ratzeburg damals/heute;
- Stimmen;
- Ruderakademie-Bild;
- Stiftung-Zitat;
- Storyboard-Grafiken im Rudern-Verstehen-Bereich.

### Regel

**Ein fehlendes reales Asset ist besser als ein sichtbarer Entwicklungsplatzhalter im Launch-Stand.**

---

## 40. Bild- und Rechte-Gates

Keine Auslieferung ohne geklärte Rechte bei:

- historischen Bildern;
- Logos;
- Filmstills;
- Buchcovern;
- Portraits;
- Partnerassets.

Für Bilder soweit sinnvoll dokumentieren:

- Quelle;
- Rechteinhaber;
- Freigabe;
- Credit;
- Alt-Text;
- Datum/Stand.

---

## 41. Fachliche Qualität

Vor Launch prüfen:

- Achtergeometrie;
- Crew-/Cox-Anordnung;
- Riemen/Skull-Terminologie;
- Trainingsaussagen;
- historische Prioritätsaussagen;
- Höhentraining;
- Ruderakademie-Daten;
- Regatta-Daten;
- Weltbestzeit;
- Altersklassen / Masters;
- historische Einordnung.

---

## 42. Externe Links

### Auf `/`

Sparsam einsetzen.

Vor erster Conversion nur:

- Trailer;
- offizielle Filmseite;
- falls notwendig RRC-Link.

Keine Linkdichte, die Besucher früh aus dem Funnel zieht.

### Auf `/rudern/`

World Rowing, DRV, Schubschlag, Biografie, Ausstellung, Stadtführung und weitere Quellen können ausführlich eingebunden werden.

---

# TEIL F — IMPLEMENTIERUNG

## 43. Phase A — Zwei-Seiten-Grundstruktur

1. `/rudern/` als zweite Seite erzeugen.
2. bestehende Langinhalte aus der Startseite technisch dorthin verschieben.
3. gemeinsame Header-/Footer-/Kontakt-/Suchkomponenten herauslösen bzw. wiederverwenden.
4. Navigation je Seite anpassen.
5. interne Links und Anker definieren.
6. Build-Validierung auf beide Seiten erweitern.

### Ergebnis Phase A

- beide URLs bauen erfolgreich;
- keine Inhalte verloren;
- Startseite deutlich kürzer;
- Vertiefungsseite enthält den bisherigen fachlichen Kern.

---

## 44. Phase B — Landingpage-Funnel

1. Hero sprachlich auf Einsteiger ausrichten.
2. Film-Brücke kompakt halten.
3. Quick Finder implementieren.
4. bestehende Nearest-Logik wiederverwenden.
5. Ratzeburg auf kurze Landingpage-Version reduzieren.
6. Adams Labor auf 3–5 Prinzipien verdichten.
7. Stimmen nach vorn holen.
8. Breiten-/Lebenssport-Teaser ergänzen.
9. zweiten CTA einbauen.
10. Vertiefungs-Teaser zu `/rudern/` integrieren.

---

## 45. Phase C — Vertiefungsseite redaktionell ordnen

1. Intro für `/rudern/` erstellen.
2. Adams Labor sauber strukturieren.
3. Regatta integrieren.
4. Ruderakademie integrieren.
5. Rudern verstehen integrieren.
6. World Rowing/DRV/Schubschlag ordnen.
7. historische Einordnung platzieren.
8. Biografie/Ausstellung/Stadtführung/Förderung platzieren.
9. Rückwege zur Vereinssuche ergänzen.

---

## 46. Phase D — Launch-Reife

1. sichtbare Platzhalter entfernen/ersetzen;
2. echte Stimmen integrieren;
3. Bildrechte prüfen;
4. fachliche Prüfung;
5. iPhone-/Safari-Test;
6. Desktop-/Tablet-Test;
7. Accessibility-Audit;
8. Performance-Audit;
9. SEO-Metadaten pro Seite;
10. Social Images;
11. Structured Data;
12. Routing-/Kontakt-Smoke-Test;
13. Linkcheck;
14. Production-Build prüfen.

---

# TEIL G — ACCEPTANCE CRITERIA

## 47. Startseite `/`

- [ ] `/` ist klar als Kinobesucher-/Einsteiger-Landingpage erkennbar.
- [ ] Hero enthält das Leitmotiv.
- [ ] Film-Brücke folgt direkt nach Hero.
- [ ] Quick Finder erscheint vor langen historischen/fachlichen Inhalten.
- [ ] Quick Finder benötigt primär nur Ort oder PLZ.
- [ ] Standardradius wird intern gesetzt und nicht als Pflichtentscheidung gezeigt.
- [ ] Ergebnis priorisiert Rudervereine statt Verbandsstrukturen.
- [ ] CTA-Sprache nutzt „Rudern ausprobieren“ / „Probetraining anfragen“.
- [ ] Ratzeburg ist kompakt präsent.
- [ ] Adams Ideen werden auf 3–5 schnell erfassbare Prinzipien verdichtet.
- [ ] echte Stimmen sind vorhanden oder die Sektion ist nicht als Platzhalter sichtbar.
- [ ] Rudern als Breiten-/Lebenssport wird sichtbar.
- [ ] zweiter Conversion-CTA ist vorhanden.
- [ ] `/rudern/` wird sichtbar und verständlich als Vertiefung angeboten.
- [ ] externe Linkdichte vor erster Conversion ist gering.
- [ ] Startseite lädt keine unnötigen schweren Detailassets der Fachseite.

## 48. Vertiefungsseite `/rudern/`

- [ ] `/rudern/` wird erfolgreich gebaut und direkt aufrufbar ausgeliefert.
- [ ] Adams Labor ist vollständig vorhanden.
- [ ] Regatta ist vollständig vorhanden.
- [ ] Ruderakademie ist vollständig vorhanden.
- [ ] Rudern verstehen ist vollständig vorhanden.
- [ ] Deutschlandachter/Weltbestzeit ist enthalten.
- [ ] Rennrudern und Wanderrudern sind enthalten.
- [ ] World Rowing ist sinnvoll integriert.
- [ ] DRV ist sinnvoll integriert.
- [ ] Schubschlag ist redaktionell integriert.
- [ ] historische Verantwortung ist enthalten.
- [ ] Biografie/Ausstellung/karladam.de sind als Vertiefung vorgesehen bzw. integriert.
- [ ] Stadtführung ist enthalten.
- [ ] Förderung/Ehrenamt ist enthalten.
- [ ] Rückweg zu „Rudern ausprobieren“ ist klar sichtbar.

## 49. Gemeinsame Technik

- [ ] Header/Footer werden nicht unnötig doppelt gepflegt.
- [ ] Kontakt-Dialog funktioniert auf allen vorgesehenen Einstiegen.
- [ ] Direct-only-Routing bleibt unverändert sicher.
- [ ] keine Empfänger-E-Mail erscheint öffentlich.
- [ ] Nearest-Suche verwendet keine externe Geocoding-API.
- [ ] Mobile Header bleibt fixed.
- [ ] Hamburger funktioniert.
- [ ] „Rudern ausprobieren“ bleibt mobil erreichbar.
- [ ] kein horizontaler Root-Scroll.
- [ ] Tastaturbedienung funktioniert.
- [ ] Fokuszustände bleiben sichtbar.
- [ ] `prefers-reduced-motion` wird respektiert.

## 50. SEO / Launch

- [ ] `/` und `/rudern/` haben unterschiedliche Titles.
- [ ] beide Seiten haben eigene Descriptions.
- [ ] beide Seiten haben eigene Canonicals.
- [ ] `og:image` vorhanden.
- [ ] `twitter:card=summary_large_image` vorhanden.
- [ ] passende Structured Data geprüft/implementiert.
- [ ] keine sichtbaren Produktionsplatzhalter.
- [ ] keine ungeklärten geschützten Assets.
- [ ] externe Links geprüft.
- [ ] Filmstart ist korrekt mit 17. September 2026 angegeben.

---

## 51. Nicht-Ziele

Diese Änderung soll ausdrücklich nicht:

- die sichere Vereinssuche neu erfinden;
- einen kompletten Technologie-/Framework-Wechsel auslösen;
- die Fachinhalte löschen;
- eine neue dritte Content-Plattform aufbauen;
- eine offizielle Filmseite imitieren;
- eine offizielle DRV-Seite imitieren;
- `karladam.de` oder die Biografie ersetzen;
- historische Kontroversen aus Marketinggründen ausblenden;
- die Seite mit Tracking überfrachten.

---

## 52. Leitplanke für zukünftige Inhalte

Neue Inhalte müssen vor Einbau einer von zwei Seiten zugeordnet werden.

### Gehört auf `/`, wenn …

- es einem Ruder-Neuling hilft;
- es die Brücke Film → Rudern stärkt;
- es eine Einstiegshürde abbaut;
- es zur Vereinssuche führt;
- es in wenigen Sekunden verständlich ist.

### Gehört auf `/rudern/`, wenn …

- es Fachwissen voraussetzt oder vertieft;
- es historische Details behandelt;
- es Quellen-/Kontextarbeit braucht;
- es Institutionen, Training, Technik oder Ruderkultur ausführlich erklärt;
- es primär für bereits Interessierte Mehrwert bringt.

### Faustregel

> **Wenn ein Inhalt den Weg zum ersten Probetraining verlängert, gehört er wahrscheinlich nicht auf die Startseite.**

---

## 53. Endzustand

### `/` — 5-Minuten-Erlebnis

Film → Karl Adam → Ratzeburg → Rudern heute → echte Menschen → Verein finden → Rudern ausprobieren.

### `/rudern/` — 30–45-Minuten-Erlebnis

Training → Technik → Achter → Regatta → Ruderakademie → Wanderrudern → Menschen → Geschichte → Quellen → Förderung → zurück ins Bootshaus.

### Gesamterfolg

`Adams Erben` soll gleichzeitig zwei Dinge hervorragend leisten:

1. **Menschen nach dem Film tatsächlich ins Rudern bringen.**
2. **Karl Adams Erbe und den Rudersport mit ungewöhnlicher redaktioneller Tiefe erklären.**

Die Zwei-Seiten-Architektur ist die verbindliche Grundlage, um beide Ziele zu erreichen, ohne dass eines das andere verwässert.
