# Datenakquise – vollständiges Vorgehen

Stand: 2026-08-09

## Ziel

Für `adams-erben.de` soll ein belastbarer, nachvollziehbarer Datenbestand aller relevanten deutschen Ruderorganisationen entstehen. Der öffentliche Browser-Datensatz enthält Such-/Organisationsdaten, aber keine aggregierte E-Mail-Liste. Kontaktadressen bleiben serverprivat und dienen ausschließlich dem nutzerinitiierten Routing.

Die Datenakquise läuft **getrennt vom Website-Deployment**. Ein Coolify-Build crawlt niemals live DRV- oder Vereinsseiten, sondern baut aus einem vorher erzeugten, geprüften Snapshot.

## Erkenntnis aus der DRV-Rückmeldung

Der DRV kann keinen vollständigen strukturierten Export mit Vereinswebsite, Ansprechpartner und E-Mail für alle Vereine bereitstellen. Daher wird der DRV als Registry-/Seed-Quelle genutzt und durch einen zweiten Enrichment-Layer ergänzt.

Die noch erforderlichen Nutzungs-/Freigabeformalitäten laufen parallel und sind kein technischer Architekturblocker.

## Zielarchitektur

```text
DRV Vereinssuche
      |
      v
[1] Registry Import
      |
      +--> organisations.json (Basisdaten + Provenienz)
      |
      v
[2] Website Resolution
      |
      +--> bekannte DRV-URL validieren
      +--> fehlende URL gezielt suchen
      +--> unklare Treffer -> Review Queue
      |
      v
[3] Domain-schonendes Enrichment
      |
      +--> Startseite
      +--> Kontakt / Impressum / Vorstand / Ansprechpartner
      +--> Mail-/Rollenextraktion
      |
      v
[4] Klassifikation + Quality Gates
      |
      +--> functional
      +--> personal -> gesonderte Governance
      +--> none -> Fallback LRV -> DRV
      |
      v
[5] Approved Snapshot
      |                  \
      v                   v
public clubs.json     private recipients.json
      |                   |
      +------> Webapp <----+
```

## Phase 0 – formale Klärungen parallel abschließen

Diese Punkte werden dokumentiert, blockieren aber nicht den PoC:

- DRV-Kommunikation und Nutzungsfreigabe ablegen;
- gewünschte Quellenangabe festhalten;
- Ansprechpartner für Korrekturen/Opt-out definieren;
- Regeln für personenbezogene Ansprechpartner finalisieren.

## Phase 1 – DRV Registry stabilisieren

### Aufgabe

`scripts/sync-drv.mjs` wird vom bisherigen Build-Helfer zum versionierten Registry-Importer weiterentwickelt.

### Soll-Felder

- `organizationId` – primär DRV-ID, Fallback stabiler DRV-Slug
- `drvId`
- `name`
- `type`
- `postalCode`
- `city`
- `state`
- `drvProfileUrl`
- `websiteFromDrv`
- `emailFromDrv` – ausschließlich private Pipeline
- `fetchedAt`
- `sourceVersion`
- Parser-Version

### Qualitätsgates

- mindestens 95 % der DRV-Profile technisch parsebar;
- jeder Datensatz besitzt stabile ID + Name;
- fehlende Website/Mail ist gültiger Zustand, kein Parserfehler;
- Parseränderungen werden über Fixtures getestet.

## Phase 2 – Website Resolution

### Stufe A: DRV-Link

Ist eine Website im DRV-Profil vorhanden:

1. URL normalisieren;
2. Redirect verfolgen;
3. Erreichbarkeit prüfen;
4. Domainidentität anhand Name, Ort/PLZ, Seitentitel und ggf. Impressumsanschrift bewerten.

### Stufe B: fehlende Website suchen

Nur wenn der DRV keine belastbare URL liefert:

- Suchanfrage: `"<Vereinsname>" <Ort> Rudern`;
- Search Provider hinter einer kleinen Adapter-Schnittstelle, damit der Anbieter austauschbar bleibt;
- Kandidaten aus Verzeichnissen, Social Media, Branchenbüchern und offensichtlichen Fremdseiten nicht automatisch als Vereinsdomain übernehmen;
- offizielle Domain nur bei ausreichender Identitätskonfidenz akzeptieren.

### Scoring-Vorschlag

- Vereinsname / charakteristische Namenstoken: +0,35
- Ort: +0,20
- PLZ / Anschrift: +0,20
- DRV-/Ruderbezug: +0,10
- Impressum nennt passende Organisation: +0,25
- widersprechende Anschrift/Organisation: harter Malus

Automatische Übernahme erst ab hoher Konfidenz; Mehrdeutigkeiten kommen in die Review-Queue.

## Phase 3 – Website Enrichment

### Crawl-Budget pro Domain

Default:

- 1 Request gleichzeitig je Host;
- mindestens ca. 1 Sekunde Abstand zwischen Requests desselben Hosts;
- maximal 5 Seiten im Standarddurchlauf;
- maximal 8 Seiten nur in einem zweiten gezielten Durchlauf;
- keine Bilder, Medienarchive oder Downloads;
- `robots.txt` berücksichtigen;
- kein Login, Captcha-/Cloudflare-Bypass oder sonstige Umgehung;
- externe Kontaktformulare werden nicht automatisch abgeschickt.

### Seitenpriorität

1. Startseite
2. Kontakt
3. Impressum
4. Vorstand / Ansprechpartner / Team
5. Geschäftsstelle / Verein / Über uns

### Extraktion

Erfasst werden:

- E-Mail-Adressen aus `mailto:`;
- klar lesbare E-Mail-Adressen im Text;
- einfache übliche Obfuskation wie `[at]` / `(at)`;
- Kontext rund um den Treffer;
- erkennbare Rolle wie Vorsitz, Vorstand, Geschäftsstelle, Ruderwart, Presse;
- Quelle und Prüfzeitpunkt.

## Phase 4 – Kontaktklassifikation

### `functional`

Beispiele:

- `info@...`
- `kontakt@...`
- `buero@...`
- `geschaeftsstelle@...`
- `verwaltung@...`
- `vorstand@...`
- `rudern@...`

Diese Klasse ist bevorzugtes Routingziel.

### `personal`

Personalisierte Adresse bzw. öffentlich genannter Funktionsträger. Sie wird mit eigener Provenienz geführt und nicht automatisch genauso behandelt wie eine Funktionsadresse. Die endgültige Produktionsregel folgt aus DATA-GOVERNANCE/INV-6.

### `none`

Keine geeignete Mail gefunden. Routing bleibt deterministisch:

```text
Verein ohne geeignete Adresse
        -> Landesruderverband
        -> DRV
```

Damit bleibt die Kontaktfunktion auch bei unvollständiger Direktabdeckung zu 100 % routbar.

## Phase 5 – PoC und Eskalationsstufen

### PoC A – 25 Vereine

Bereits implementiert in `scripts/enrichment-poc.mjs`.

Auswahl:

- 25 Vereine;
- mindestens fünf Bundesländer;
- maximal fünf Vereine je Bundesland;
- Ratzeburger Ruderclub bevorzugt enthalten;
- zunächst Vereine mit im DRV vorhandener Website, damit Website-Crawl und Mailklassifikation unabhängig von Search-Discovery gemessen werden.

Gemessen werden:

- Website-Erreichbarkeit;
- Identitätsscore;
- Funktionsadress-Abdeckung;
- nur personenbezogene Kontakte;
- keine Mail gefunden;
- robots-/Fetch-Probleme;
- Seitenzahl und Laufzeit.

Öffentliche Reports enthalten keine E-Mail-Adressen.

### PoC B – 25 Vereine ohne belastbaren DRV-Weblink

Nach Auswertung von PoC A:

- 25 weitere Fälle aus der `website_missing`-Queue;
- Search-Provider aktivieren;
- automatische Domainzuordnung gegen manuell verifizierte Wahrheit messen.

Zielmetriken:

- Precision der automatischen Domainzuordnung;
- Anteil Auto-Accept / Manual Review / No Website;
- Fehlzuordnungen müssen deutlich unter 1 % liegen, bevor die Automatik auf den Gesamtbestand losgelassen wird.

### Pilot – 100 Vereine

Stratifiziert über:

- alle Bundesländer;
- große/kleine Vereine;
- DRV-Weblink vorhanden/fehlend;
- moderne/statische/JavaScript-lastige Websites;
- verschiedene Kontaktmuster.

Der Pilot bestimmt die finalen Thresholds für Vollbetrieb.

### Vollbestand

Erst nach Pilot-Freigabe:

- gesamter DRV-Bestand;
- domainübergreifende Parallelisierung, aber weiterhin per-host gedrosselt;
- automatische Fälle + Review Queue;
- freigegebener Snapshot erst nach Quality Gate.

## Phase 6 – Review Queue

Ein Datensatz wird manuell geprüft bei:

- mehreren plausiblen Domains;
- niedriger Identitätskonfidenz;
- Redirect auf fremde Plattform;
- JavaScript-only-Seite ohne statisch sichtbaren Kontakt;
- ausschließlich personalisierten E-Mails, solange Governance offen ist;
- ungewöhnlicher E-Mail-Domain;
- widersprüchlichen Adressen;
- technischem Block/Timeout;
- Änderung eines zuvor freigegebenen Empfängers.

Für ca. 600 Organisationen ist eine JSON-/CSV-basierte Review Queue zunächst ausreichend; eine Admin-Weboberfläche ist erst sinnvoll, wenn die manuelle Quote dies rechtfertigt.

## Phase 7 – Snapshot und Veröffentlichungsprozess

Die Acquisition-Pipeline erzeugt drei Artefakte:

### 1. Public Snapshot

`clubs.json`

Enthält keine Mailadressen, sondern nur:

- Organisationsdaten;
- Website;
- Kontaktstatus/Route-Level;
- Quellen-/Aktualitätsmetadaten, soweit öffentlich sinnvoll.

### 2. Private Routing Snapshot

`recipients.json`

Enthält:

- freigegebene direkte Empfänger;
- LRV-Fallback;
- DRV-Fallback;
- Provenienz;
- letzte Verifikation.

Nie in Webroot, GitHub-Artifact oder öffentliche Logs aufnehmen.

### 3. Quality Report

Enthält nur aggregierte Werte und adressfreie Einzelergebnisse.

## Phase 8 – Aktualisierung im Betrieb

Empfohlener Rhythmus:

- DRV Registry: monatlich;
- Website-Erreichbarkeit und Redirects: monatlich;
- Kontakt-Enrichment: alle 90 Tage;
- Fehler/404: beim nächsten Lauf priorisiert;
- manueller Hinweis eines Vereins: sofortige Korrektur + bevorzugte Quelle;
- kompletter Re-Crawl nicht bei jedem Deployment.

Stale-Regel für Routingkontakte: nach 180 Tagen ohne erfolgreiche Verifikation erneute Prüfung priorisieren.

## Phase 9 – technische Modularisierung

Nach dem PoC soll der derzeitige Prototyp in folgende Module zerlegt werden:

```text
scripts/lib/http.mjs
scripts/lib/robots.mjs
scripts/lib/drv-registry.mjs
scripts/lib/website-identity.mjs
scripts/lib/contact-extractor.mjs
scripts/lib/contact-classifier.mjs
scripts/lib/provenance.mjs
scripts/sync-drv.mjs
scripts/discover-websites.mjs
scripts/enrich-clubs.mjs
scripts/build-snapshot.mjs
```

Damit können Registry, Discovery, Crawl und Website-Build unabhängig getestet und ausgeführt werden.

## Phase 10 – Teststrategie

### Unit Tests

HTML-Fixtures für:

- DRV-Profil;
- `mailto:`;
- Klartext-E-Mail;
- `[at]`-Obfuskation;
- mehrere Funktionsadressen;
- ausschließlich persönliche Kontakte;
- Redirects;
- falsche Domain;
- robots-Regeln.

### Regression Fixtures

Repräsentative anonymisierte/gekürzte HTML-Strukturen aus realen Vereinssites, damit Parseränderungen keine bekannte Kontaktklasse zerstören.

### Live Smoke Test

Kleine konstante Menge von 5–10 Websites, nicht der Vollbestand, um Netzwerk-/Parserprobleme früh zu erkennen.

## Go-live Quality Gates

Vor dem produktiven Routing:

1. 100 % der Organisationen haben stabile ID und Routing-Fallback.
2. Keine E-Mail-Adresse steht im öffentlichen `clubs.json`.
3. Automatisch zugeordnete Vereinsdomain hat hohe Precision; bekannte Fehlzuordnungsrate <1 %.
4. Alle direkten Empfänger haben Provenienz und `verifiedAt`.
5. Personenkontakte folgen den finalen Governance-Regeln.
6. Review Queue enthält keine ungeprüften Fälle, die trotzdem direkt geroutet werden.
7. Snapshot-Build ist reproduzierbar und unabhängig vom Live-Crawl.

## Entscheidung nach PoC A

Der 25er-Test beantwortet primär zwei Fragen:

1. Wie hoch ist die direkte Kontaktabdeckung auf bereits bekannten offiziellen Vereinswebsites?
2. Welche technischen Sonderfälle treten bei fünf gezielten Seiten pro Domain auf?

Danach wird entschieden, ob für den Vollbetrieb fünf Seiten pro Domain ausreichen oder ein zweiter Crawl-Pass nötig ist. Erst anschließend wird PoC B für die eigentliche Website-Discovery implementiert.
