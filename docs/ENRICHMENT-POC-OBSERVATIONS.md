# Enrichment PoC – Beobachtungen

Stand: 2026-08-10

## Status

Der reproduzierbare 25er-PoC ist in `scripts/enrichment-poc.mjs` implementiert und real über GitHub Actions ausgeführt. PoC A verwendet ausschließlich DRV-Einträge mit vorhandener Vereinswebsite, damit Crawl-/Extraktionsqualität unabhängig von der Search-Discovery gemessen wird.

## Wichtige Regression aus dem ersten Lauf

Der erste automatische Lauf war nicht auswertbar: Die damalige DRV-Linkauswahl nahm den ersten externen Link auf einer Profilseite und interpretierte dadurch einen globalen Navigationslink (`ruder-bundesliga.de`) als Vereinswebsite.

Konsequenz:

- DRV-Website-Erkennung ist seit Parser 1.0.1 feld-/kontextbezogen;
- der globale Bundesliga-Link ist Regressionstest;
- `sync:drv` und PoC A verwenden denselben Registry-Parser.

## Korrigierter 25er-Real-Lauf

Stichprobe:

- 25 Vereine;
- 12 Bundesländer;
- 33 DRV-Profile mussten für die stratifizierte Stichprobe geprüft werden.

Ergebnisse:

- Vereinswebsite erreichbar: **24/25 (96 %)**;
- Funktionskontakt gefunden: **17/25 (68 %)**;
- ausschließlich personenbezogener Kontakt: **1/25 (4 %)**;
- kein geeigneter Kontakt / technischer Fallback: **7/25 (28 %)**;
- `robots.txt` blockiert: **1/25**;
- Homepage-Fetchfehler: **0**;
- durchschnittlich **3,58** erfolgreich geladene Seiten je erreichbarer Vereinswebsite.

Conservative Review:

- **17/25 (68 %) Auto-Direct**;
- **1/25 (4 %) Review**;
- **7/25 (28 %) Fallback LRV/DRV**;
- bei zwei Vereinen wurden verdächtige Drittanbieter-Kandidaten erkannt und nicht automatisch als Vereinskontakt verwendet.

Damit ist bereits mit einem sehr begrenzten Crawl eine direkte, konservativ freigabefähige Vereinsroute für rund zwei Drittel der Stichprobe erreichbar. Die restlichen Fälle bleiben vollständig routbar über LRV/DRV.

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

Ungewöhnlichere Anti-Spam-Schreibweisen können vorkommen. Häufig existiert auf einer anderen Kontakt-/Vorstandsseite derselben Domain zusätzlich eine klarere Darstellung.

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

Einige Vereine bieten primär ein Formular oder laden dieses erst nach Consent/JavaScript. Der PoC soll solche Formulare nicht automatisiert benutzen.

Konsequenz: Gibt es keine extrahierbare geeignete Mail, bleibt der LRV-/DRV-Fallback erhalten. Optional kann die öffentliche Vereins-Kontaktseite zusätzlich als Link angezeigt werden.

## Offene Frage aus PoC A: reichen fünf Seiten?

Sechs erreichbare Vereinswebsites endeten mit `no_email_found`. Mehrere davon hatten nur 1–3 erfolgreich geladene Seiten. Aus der bloßen Zahl kann noch nicht abgeleitet werden, ob die Website tatsächlich keine Mail veröffentlicht oder die kontaktnahe Linkauswahl zu eng ist.

Deshalb wird die Crawl-Tiefe **nicht pauschal erhöht**.

Neu: `scripts/diagnose-enrichment-fallbacks.mjs`.

Der adressfreie Diagnosepass protokolliert für die erreichbaren `no_email_found`-Fälle:

- kontaktnahe Links auf der Homepage;
- zusätzliche Standardpfade;
- HTTP-/Fetch-Ergebnisse;
- Redirect-/Same-Site-Status;
- robots-Entscheidung;
- nur `E-Mail-Signal ja/nein`, niemals die konkrete Adresse.

Erst nach dieser Diagnose wird entschieden:

1. fünf Seiten bleiben Standard und Fallback ist fachlich korrekt; oder
2. ein gezielter zweiter Pass für bestimmte Pfadmuster bringt messbaren Zusatznutzen.

## Änderungen vor dem 100er-Pilot

Bereits umgesetzt:

- Rollenalias-Liste erweitert;
- Domain-/Kontext-Ranking;
- Drittanbieter-Kontext im Conservative Review;
- unbekannte externe Maildomains nur mit klarer Vereinsrolle;
- Begründung pro Review-Entscheidung;
- DRV-Profil-E-Mail ist Kandidat, nicht automatisch Direct Route.

Noch zu entscheiden:

- Ergebnis des Fallback-Diagnosepasses;
- Identitätsscore: derzeit nur Diagnosemetrik bei DRV-bekannten Domains; für Search-Discovery wird ein eigenes, strengeres Domain-Precision-Gate verwendet;
- Umfang eines eventuellen zweiten Crawl-Passes.

## Nächster Wayfinder-Schritt

1. Fallback-Diagnostik des korrigierten PoC-Laufs auswerten.
2. PoC A danach abschließen oder gezielt einen zweiten Pass ergänzen.
3. Parallel Registry-Voll-/repräsentativen Lauf mit >=95 % Parser-Coverage bestätigen.
4. Danach PoC B mit 25 `website_missing`-Fällen und manueller Ground Truth ausführen.
