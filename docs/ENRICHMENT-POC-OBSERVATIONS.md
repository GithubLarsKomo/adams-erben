# Enrichment PoC – Beobachtungen

Stand: 2026-08-09

## Status

Der reproduzierbare 25er-PoC ist in `scripts/enrichment-poc.mjs` implementiert. Zusätzlich wurde vor der automatisierten Gesamtauswertung eine manuelle Gegenprobe an realen Vereinswebseiten durchgeführt, um typische Extraktionsmuster und False-Positive-Risiken früh zu erkennen.

Diese Beobachtungen sind **keine Ersatzmetrik** für den maschinell erzeugten 25er-Coverage-Report, sondern dienen der Schärfung der Extraktionsregeln.

## Bestätigte Muster

### 1. Generische Funktionsadressen sind häufig

Beispiele aus realen Seiten zeigen `info@`, `kontakt@`, `buero@`, `verwaltung@`, `presse@`, `ruderwart@`, `jugend@` und ähnliche rollenbasierte Postfächer.

Konsequenz: Die Klassifikation darf nicht nur `info@`/`kontakt@` kennen, sondern muss eine erweiterbare Rollen-/Aliasliste besitzen.

### 2. Rollenadresse kann trotz genanntem Namen funktional sein

Ein Kontaktblock kann einen konkreten Vorsitzenden nennen, die E-Mail lautet aber `vorsitzender@verein.de`. Für das Routing ist dies eine Funktionsadresse, nicht die private Adresse der genannten Person.

Konsequenz: Primär die Struktur der E-Mail und ihre Rolle bewerten, nicht allein die Anwesenheit eines Personennamens.

### 3. Einfache E-Mail-Obfuskation kommt real vor

Beispiele: `buero[at]verein.de`, `vorsitzender[at]verein.de` oder ähnliche Schreibweisen.

Konsequenz: `[at]`, `(at)`, `[dot]`, `(dot)` und eng verwandte einfache Varianten normalisieren. Aggressive freie Textrekonstruktion vermeiden.

### 4. Spezielle Anti-Spam-Schreibweisen existieren

Beispielmuster wie `adresse@dont-want-spam domain.de` können vorkommen. Häufig existiert auf einer anderen Kontakt-/Vorstandsseite derselben Domain zusätzlich eine klarere Darstellung.

Konsequenz: Standardpass nicht überkomplizieren. Zuerst mehrere priorisierte Kontaktseiten prüfen; ungewöhnliche Obfuskation nur in einem zweiten Extractor-Pass oder Review behandeln.

### 5. Personalisierte Provider-Adressen kommen vor

Ein Verein kann Kontaktpersonen über `web.de`, `t-online.de`, `freenet.de` usw. veröffentlichen.

Konsequenz: Fremde Maildomain ist nicht automatisch falsch. Solche Treffer sind zunächst `personal`, sofern Kontext/Rolle den Vereinsbezug bestätigt.

### 6. Fremde Dienstleister-Adressen sind ein relevantes False-Positive-Risiko

Vereinsseiten können Gastronomie, Catering, Vermietung, Veranstaltungspartner oder andere Dienstleister samt E-Mail nennen.

Konsequenz: Ein `info@...` ist **nicht automatisch** ein guter Vereinskontakt. Bevorzugungslogik:

1. Funktionsadresse auf Vereinsdomain;
2. rollenbezogene Funktionsadresse mit eindeutigem Vereinskontext, auch auf externer Maildomain;
3. personalisierte Adresse auf Vereinsdomain mit Vereinsrolle;
4. personalisierte externe Adresse mit eindeutigem Vereinsrollen-Kontext;
5. Gastronomie-/Catering-/Event-/sonstige Dienstleisteradresse ausschließen.

### 7. Unterseiten können teilweise gesperrt sein

Eine einzelne Impressums-/Vorstandsseite kann technisch oder inhaltlich eingeschränkt sein, während Footer, Kontaktseite oder Startseite trotzdem einen brauchbaren Vereinskontakt enthalten.

Konsequenz: Seitenfehler sind pro Seite zu behandeln; nicht die ganze Domain als Fehler verwerfen.

### 8. Kontaktformulare sind kein Ersatz für die eigene Routing-Mail

Einige Vereine bieten primär ein externes Formular oder laden dieses erst nach Consent/JavaScript. Der PoC soll solche Formulare nicht automatisiert benutzen.

Konsequenz: Gibt es keine extrahierbare geeignete Mail, bleibt der LRV-/DRV-Fallback erhalten. Optional kann die öffentliche Vereins-Kontaktseite zusätzlich als Link angezeigt werden.

## Änderungen für die nächste Extractor-Version

Vor PoC B bzw. spätestens vor dem 100er-Pilot:

- Rollenalias-Liste erweitern (`vorsitz*`, `vorstand`, `wart`, `verwaltung`, `leitung`, `trainer`, `presse`, `jugend`, `mitglieder`, `aufnahme` ...);
- E-Mail-Auswahl um Domain-/Kontext-Ranking ergänzen;
- Drittanbieter-Kontext (`gastronomie`, `catering`, `restaurant`, `event`, `vermietung`, `partyservice`) als Ausschluss-/Malusregel aufnehmen;
- unbekannte externe Maildomains nur bei klarer Vereinsrolle akzeptieren;
- pro Treffer Begründung/Score speichern (`sameDomain`, `roleSignal`, `negativeContext`, `sourcePage`);
- Review Queue für widersprüchliche Top-Kandidaten.

## Erwartete Entscheidung nach automatisiertem PoC A

Der maschinelle 25er-Report entscheidet quantitativ:

- ob maximal fünf Seiten je Domain ausreichend sind;
- wie hoch die direkte Funktionskontakt-Abdeckung ist;
- wie oft ausschließlich Personenkontakte vorkommen;
- wie oft technische Probleme auftreten;
- wie groß der zweite Extractor-Pass sein muss.

Danach folgt PoC B mit gezielter Website-Discovery für 25 DRV-Einträge ohne belastbaren Weblink.
