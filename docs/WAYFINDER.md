# Wayfinder – Adams Erben

Stand: 2026-08-09

## Fixierter Ausgangspunkt

Repository: `GithubLarsKomo/adams-erben`

Immutable Ausgangs-SHA: `9ce485cdb5a9cef1bae60184589012c4c613ca9a`

Arbeitsbranch: `feat/mvp-wayfinder`

## Bestätigte Fakten

- Der DRV stellt eine öffentliche Vereinssuche mit dem deutschen Organisationsbestand bereit.
- DRV-Profile enthalten zuverlässig Namen/Profil-URLs und je nach Eintrag DRV-ID, Anschrift, Website, E-Mail, Telefon und Ansprechpartner.
- Direkte DRV-Rückmeldung vom 09.08.2026: Ein vollständiger strukturierter Export mit Website, Ansprechpartner und E-Mail kann nicht geliefert werden; diese Angaben sind beim DRV nur teilweise vorhanden.
- Damit ist der DRV **Registry-/Seed-Quelle**, nicht vollständige Kontaktquelle.
- Fehlende Website-/Kontaktdaten werden auf den offiziellen Vereinswebseiten angereichert.
- Nutzungsrechte sind nach aktueller Projekteinschätzung kein technischer Blocker; verbleibende Punkte werden formal parallel geklärt und dokumentiert.
- Öffentliche E-Mail-Adressen werden nicht als aggregierter Browserdatensatz veröffentlicht.
- Routingziel bleibt: Verein -> LRV -> DRV.
- Der Ratzeburger Ruderclub wird als zentraler Ort des Filmbezugs hervorgehoben.
- Filmassets werden ohne Freigabe nicht übernommen; die Website bleibt als unabhängige Initiative gekennzeichnet.
- Preview und Produktion sind getrennt: `preview.adams-erben.de` arbeitet mit Seed-Daten und ohne echten Mailversand.

## Architekturentscheidung – getrennte Pipelines

### A. Acquisition Pipeline

```text
DRV Registry
  -> Website Resolution
  -> Vereinswebsite-Crawl
  -> Kontaktklassifikation
  -> Review / Quality Gate
  -> freigegebener Snapshot
```

### B. Web Deployment Pipeline

```text
freigegebener Snapshot
  -> public clubs.json
  -> private recipients.json
  -> Build
  -> Coolify
```

**Wichtig:** Ein Website-Deployment crawlt niemals live DRV- oder Vereinsseiten. Datenakquise und Veröffentlichung sind zeitlich und technisch getrennt.

## Datenlayer

### Layer 1 – DRV Registry

Mindestens:

- stabile Organisations-ID / DRV-ID
- Name
- Typ
- PLZ, Ort, Bundesland
- DRV-Profil
- vorhandene Website
- vorhandene öffentliche E-Mail nur für private Pipeline
- Feld-Provenienz + Fetch-/Parser-Version

Fehlende Werte erzeugen einen Status, keinen Importfehler.

### Layer 2 – Website Resolution

1. DRV-Website-URL validieren.
2. Redirects verfolgen.
3. Domainidentität mit Name + Ort/PLZ + Impressum/Adresse prüfen.
4. Fehlt die URL: gezielte Suchprovider-Abfrage.
5. Unsichere/mehrdeutige Kandidaten -> Review Queue.

### Layer 3 – Website Enrichment

- nur bestätigte offizielle Domain;
- Startseite + wenige kontaktnahe Seiten;
- `robots.txt` beachten;
- niedrige Parallelität und hostbasiertes Rate-Limit;
- kein Login/Captcha-/Cloudflare-Bypass;
- keine automatische Nutzung externer Kontaktformulare;
- E-Mail + Kontext + Quelle + Rolle extrahieren.

### Layer 4 – Kontaktklassifikation

- `functional`: bevorzugtes Routingziel (`info@`, `kontakt@`, `buero@`, `vorstand@` usw.)
- `personal`: gesonderte Datenklasse mit Governance/Review
- `none`: Fallback LRV -> DRV

## Laufende Untersuchungen

### INV-1 – DRV Registry / Seed

**Frage:** Wie stabil und vollständig können wir Organisationsbestand und Basisdaten reproduzierbar importieren?

**Stop-Bedingung:** stabile ID-Strategie, >=95 % technisch parsebare DRV-Profile, Feld-Provenienz und deterministische Enrichment-Queue.

**Ausgabe:** Registry-Schema + Parservertrag.

### INV-2 – Film-/Brand-Safe Copy

**Frage:** Welche filmbezogenen Bezeichnungen und Links verwenden wir ohne falsche Affiliation oder ungeklärte Asset-Nutzung?

**Stop-Bedingung:** Copy-/Asset-Regeln dokumentiert.

**Ausgabe:** `docs/BRAND-GUIDELINES.md`.

### INV-3 – Kontakt-Routing / Datenschutz / Anti-Abuse

**Frage:** Wie wird genau ein whitelisted Empfänger missbrauchsarm erreicht?

**Stop-Bedingung:** Testversand, feste Empfängerauflösung, Rate Limit, Datenschutztext.

### INV-4 – Hetzner/Coolify + Domains

**Frage:** Wie werden Preview und Produktion reproduzierbar deployed?

**Stop-Bedingung:** HTTPS, Healthcheck und Testmail für Produktion.

### INV-5 – Vereinswebsite-Enrichment

**Frage:** Wie zuverlässig finden wir auf einer bestätigten Vereinswebsite eine für die Vermittlung geeignete Kontaktmöglichkeit?

**Aktueller PoC A:**

- 25 Vereine;
- mindestens fünf Bundesländer;
- maximal fünf je Bundesland;
- Ratzeburger Ruderclub bevorzugt;
- zunächst nur Vereine mit DRV-Weblink, um Crawl-/Extraktionsqualität isoliert zu messen;
- maximal fünf relevante Seiten je Domain;
- Klassifikation `functional | personal | none`;
- adressfreier Coverage-Report;
- tatsächliche Kontakte nur unter `build-private/`.

Implementierung: `scripts/enrichment-poc.mjs`.

**Stop-Bedingung PoC A:** Coverage-/Fehlermuster dokumentiert und Crawl-Budget bewertet.

**Danach PoC B:** 25 Fälle ohne belastbaren DRV-Weblink zur Messung der Website-Discovery.

### INV-6 – Governance angereicherter Kontakte

**Frage:** Wie behandeln wir Funktionskontakte versus personalisierte Ansprechpartner?

**Stop-Bedingung:** Allow-/Deny-Regeln, Transparenz/Korrektur/Opt-out und technische Filter dokumentiert.

## Formale Nutzungs-/Rechteklärung

Kein Engineering-Blocker mehr. Parallel zu dokumentieren:

- DRV-Kommunikation / Freigabeumfang;
- gewünschte Quellenangabe;
- ggf. technische Abrufparameter;
- Korrektur-/Opt-out-Kanal.

Die formalen Punkte werden vor Produktion geschlossen, aber die PoC-/Pipeline-Entwicklung läuft weiter.

## PoC A – Messgrößen

Der Test misst:

- erreichbare Website;
- automatischen Identitätsscore;
- gefundene Funktionsadresse;
- ausschließlich personenbezogene Kontakte;
- keine Mail gefunden;
- robots-/HTTP-/TLS-/Redirect-Probleme;
- Seitenzahl;
- Laufzeit;
- Übereinstimmung einer DRV-Mail mit der Vereinswebsite intern, ohne E-Mail im Report zu veröffentlichen.

Öffentlicher Report:

- `artifacts/enrichment-poc/report.json`
- `artifacts/enrichment-poc/report.md`

Private Treffer:

- `build-private/enrichment-poc-contacts.json`

## Vollständiger Rollout – vorgesehene Stufen

1. **PoC A / 25 bekannte Websites** – Extraktion messen.
2. **PoC B / 25 fehlende Websites** – Website-Discovery messen.
3. **Pilot / 100 Vereine** – stratifiziert über Regionen, Website-Typen und Kontaktmuster.
4. **Vollbestand** – erst nach Precision-/Review-Gates.
5. **Approved Snapshot** – keine Live-Crawls im Deployment.
6. **Betrieb** – Registry monatlich, Kontakt-Enrichment etwa alle 90 Tage, Fehler priorisiert.

Vollständige Planung: `docs/DATA-ACQUISITION-PLAN.md`.

## Quality Gates vor Vollbestand

- Registry >=95 % technisch parsebar;
- 100 % stabile ID + Routing-Fallback;
- Domain-Fehlzuordnung nach Pilot <1 %;
- jeder direkte Empfänger besitzt Provenienz + `verifiedAt`;
- keine E-Mail im öffentlichen Datensatz;
- personalisierte Kontakte nur nach finaler Governance-Regel;
- unklare Datensätze landen in Review und werden nicht automatisch direkt geroutet.

## Risiken

- HTML-Struktur ändert sich -> Fixtures + Parser-Version.
- falsche Domain -> Multi-Signal-Scoring + Review.
- fremde Website blockiert Crawler -> kein Bypass, stattdessen Review/Fallback.
- ausschließlich JavaScript-gerenderte Kontakte -> zweite Ausbaustufe/Review statt aggressiver Umgehung.
- personenbezogene Mail -> eigene Datenklasse.
- öffentliche E-Mail-Aggregation -> ausschließlich private Routingartefakte.
- Spam-Relay -> whitelisted Empfänger, Rate Limit, Honeypot, Origin-Check.

## Nächste ausführbare Aktion

**PoC A ausführen und Coverage-Report auswerten.** Danach werden konkrete Thresholds für Crawl-Seitenzahl, Funktionsadress-Abdeckung und die Notwendigkeit eines zweiten Passes festgelegt; erst dann folgt PoC B für fehlende Vereinswebsites.
