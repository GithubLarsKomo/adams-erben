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

Implementiert als PoC B in `scripts/discover-websites.mjs` und Issue #9.

Nur wenn der DRV keine belastbare URL liefert:

- Stichprobe mit `npm run poc:discover:prepare` aus 25 `website_missing`-Fällen erzeugen;
- Suchanfrage: `"<Vereinsname>" <Ort> Rudern`;
- Search Provider hinter Adapter-Schnittstelle;
- aktuell Brave Search API, Key ausschließlich über `BRAVE_SEARCH_API_KEY`;
- Fixture-Modus für deterministische Tests;
- Kandidaten aus Social Media, DRV selbst und offensichtlichen Verzeichnissen nicht automatisch übernehmen;
- offizielle Domain nur bei ausreichender Identitätskonfidenz akzeptieren.

### Scoring PoC B

Aktuelle Defaultwerte:

- Auto-Accept >= 0,78
- Review >= 0,48
- Reject < 0,48
- Differenz zwischen zwei grundsätzlich akzeptablen Top-Kandidaten < 0,12 → Review

Signale:

- Vereinsname / charakteristische Namenstoken;
- Ort;
- PLZ;
- DRV-/Ruderbezug;
- Suchrang als schwaches Signal;
- bekannte DRV-Domain, falls vorhanden;
- Verzeichnis-/Fremdseiten als Malus bzw. Ausschluss.

Die Thresholds werden nach realem 25er-PoC gegen manuell verifizierte Ground Truth geschärft, nicht anhand einzelner Anekdoten.

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

### Rohklassifikation

`functional | personal | none`

### Conservative Review Gate

Ein Roh-Treffer wird nicht automatisch Direct Route.

Auto-Direct zunächst nur für:

- funktionale Adresse auf Vereinsdomain;
- eindeutig rollenbezogene Funktionsadresse wie `vorsitzender@`, `ruderwart@`, `verwaltung@`.

Review für:

- generische Funktionsadresse auf fremder Domain;
- personalisierte Adresse;
- personalisierte Rollenadresse;
- Drittanbieter-Kontext wie Gastronomie/Catering/Hotel/Dienstleister.

Umgesetzt in `scripts/review-enrichment-poc.mjs` mit synthetischen Tests.

### `none`

Keine geeignete Mail gefunden. Routing bleibt deterministisch:

```text
Verein ohne geeignete Adresse
        -> Landesruderverband
        -> DRV
```

## Phase 5 – PoC und Eskalationsstufen

### PoC A – 25 Vereine

Implementiert in `scripts/enrichment-poc.mjs` plus konservativem Review-Pass.

Auswahl:

- 25 Vereine;
- mindestens fünf Bundesländer;
- maximal fünf Vereine je Bundesland;
- Ratzeburger Ruderclub bevorzugt enthalten;
- zunächst Vereine mit im DRV vorhandener Website.

Gemessen werden getrennt:

1. rohe Kontakt-Coverage;
2. Auto-Direct-Anteil nach konservativem Review.

Echter 25er-Lauf steht noch aus.

### PoC B – 25 Vereine ohne belastbaren DRV-Weblink

Implementiert als Discovery-Pipeline:

- `scripts/prepare-discovery-poc.mjs` erzeugt die Stichprobe;
- `scripts/discover-websites.mjs` führt Search + Scoring aus;
- `scripts/discover-websites.test.mjs` testet Kernregeln;
- `docs/WEBSITE-DISCOVERY-POC.md` dokumentiert Input/Ground Truth/Thresholds;
- `scripts/discovery-fixtures.example.json` erlaubt reproduzierbare Provider-Fixtures.

Noch auszuführen:

- 25 reale `website_missing`-Fälle erzeugen;
- manuelle Ground Truth erfassen;
- Search Provider mit Secret aktivieren;
- Precision, Review-Quote und No-Candidate-Quote messen.

Ziel: bekannte Fehlzuordnungsrate der automatisch akzeptierten Domains <1 % vor Vollrollout.

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

Für ca. 600 Organisationen ist eine JSON-/CSV-basierte Review Queue zunächst ausreichend.

## Phase 7 – Snapshot und Veröffentlichungsprozess

Die Acquisition-Pipeline erzeugt drei Artefakte:

### 1. Public Snapshot

`clubs.json` ohne Mailadressen.

### 2. Private Routing Snapshot

`recipients.json` mit freigegebenen Empfängern, Fallbacks, Provenienz und letzter Verifikation.

### 3. Quality Report

Nur aggregierte Werte und adressfreie Einzelergebnisse.

## Phase 8 – Aktualisierung im Betrieb

Empfohlener Rhythmus:

- DRV Registry: monatlich;
- Website-Erreichbarkeit und Redirects: monatlich;
- Kontakt-Enrichment: alle 90 Tage;
- Fehler/404: beim nächsten Lauf priorisiert;
- manueller Hinweis eines Vereins: sofortige Korrektur + bevorzugte Quelle;
- kompletter Re-Crawl nicht bei jedem Deployment.

Stale-Regel: Routingkontakte nach 180 Tagen ohne erfolgreiche Verifikation priorisiert erneut prüfen.

## Phase 9 – technische Modularisierung

Nach den PoCs soll der Prototyp in gemeinsam getestete Module zerlegt werden:

```text
scripts/lib/http.mjs
scripts/lib/robots.mjs
scripts/lib/drv-registry.mjs
scripts/lib/website-identity.mjs
scripts/lib/contact-extractor.mjs
scripts/lib/contact-classifier.mjs
scripts/lib/provenance.mjs
scripts/discover-websites.mjs
scripts/enrich-clubs.mjs
scripts/build-snapshot.mjs
```

## Phase 10 – Teststrategie

### Unit Tests

HTML-/Search-Fixtures für DRV-Profil, E-Mail-Muster, Rollen, falsche Domains, Drittanbieter-Kontext, Ambiguitäten und robots-Regeln.

### Regression Fixtures

Repräsentative anonymisierte/gekürzte Strukturen realer Vereinssites.

### Live Smoke Test

Kleine konstante Menge von 5–10 Websites, nicht der Vollbestand.

## Go-live Quality Gates

1. 100 % der Organisationen haben stabile ID und Routing-Fallback.
2. Keine E-Mail-Adresse steht im öffentlichen `clubs.json`.
3. Automatisch zugeordnete Vereinsdomain: bekannte Fehlzuordnungsrate <1 %.
4. Alle direkten Empfänger haben Provenienz und `verifiedAt`.
5. Direct Route erfüllt Conservative Review Gate.
6. Personenkontakte folgen finalen Governance-Regeln.
7. Review Queue enthält keine ungeprüften Fälle, die trotzdem direkt geroutet werden.
8. Snapshot-Build ist reproduzierbar und unabhängig vom Live-Crawl.

## Nächste ausführbare Aktionen

1. PoC A real mit 25 Vereinen ausführen und beide Kennzahlen auswerten.
2. Parallel PoC-B-Stichprobe mit `npm run poc:discover:prepare` erzeugen.
3. Für diese 25 Fälle manuelle Ground Truth erfassen.
4. PoC B mit Brave Search ausführen und Precision messen.
