# Wayfinder – Adams Erben

Stand: 2026-08-10

## Fixierter Ausgangspunkt

Repository: `GithubLarsKomo/adams-erben`

Immutable Ausgangs-SHA: `9ce485cdb5a9cef1bae60184589012c4c613ca9a`

Arbeitsbranch: `feat/mvp-wayfinder`

## Bestätigte Fakten

- Der DRV kann die gewünschte vollständige Kombination aus Vereinswebsite, Ansprechpartner und E-Mail nicht als kompletten strukturierten Export bereitstellen; diese Angaben sind beim DRV nur teilweise vorhanden.
- Die öffentliche DRV-Vereinssuche ist deshalb **Registry/Seed**, nicht alleinige Kontaktquelle.
- Registry Parser **1.1.5** verarbeitet im realen Voll-Lauf **503/503 Profile = 100 %**.
- Aktuell klassifiziert: **434 Vereine**, **15/15 LRV**, **54 sonstige Mitglieder**.
- **411/434 Vereine** besitzen einen DRV-Weblink; **23/434** gehen an Website Discovery.
- Routingziel bleibt Verein → LRV → DRV.
- Öffentliche Browserdaten enthalten keine E-Mail-Adressen.
- Preview und Produktion sind getrennt; ein Deployment crawlt niemals live DRV- oder Vereinsseiten.
- Der Ratzeburger Ruderclub bleibt hervorgehoben; Filmassets werden ohne Freigabe nicht übernommen.

## Architekturentscheidung – getrennte Pipelines

### Acquisition

```text
DRV Registry
→ Website Discovery
→ Vereins-/LRV-Enrichment
→ zentrale Contact Governance
→ Approved Snapshot
```

### Deployment

```text
Approved Snapshot
→ public clubs.json
→ private recipients.json
→ Build
→ Coolify
```

## Abgeschlossene Untersuchungen

### Registry / Seed – abgeschlossen

- stabile DRV-ID / Slug-Fallback;
- Provenienz + Parser-Version;
- 15/15 LRV explizit abgesichert;
- Website-/City-/Mitgliedstyp-Regressionen getestet;
- öffentliche/private Artefakte getrennt;
- Coverage-Gate >=95 %, real **100 %**.

Aktueller Voll-Lauf:

- 503/503 Profile;
- 434 Vereine;
- 15 LRV;
- 54 sonstige Mitglieder;
- 411 Vereine mit DRV-Weblink;
- 23 Vereine ohne DRV-Weblink;
- 250 Vereine bereits über einen DRV-Kandidaten Direct-fähig.

### Enrichment PoC A – abgeschlossen

25 bekannte Vereinswebsites / 12 Bundesländer:

- Website erreichbar: **23/25**;
- Funktionskontakt: **18/25**;
- Auto-Direct: **18/25**;
- Review: **1/25**;
- Fallback: **6/25**.

Ein zusätzlicher Diagnosepass über 64 Pfade / 38 erfolgreiche HTML-Seiten fand **0 zusätzliche E-Mail-Signale**.

Entscheidung: maximal fünf erfolgreich geladene kontaktnahe Seiten; anschließend Fallback statt breitem Path-Probing.

### Contact Governance – technisch abgeschlossen

`scripts/lib/contact-governance.mjs`:

- personalisierte Adressen nie Auto-Direct;
- Funktions-/Rollenadresse nur mit sicherem Organisationskontext;
- Drittanbieter ausgeschlossen;
- Provenienz + `verifiedAt` Pflicht;
- stale ab 180 Tagen, Auto-Direct aus ab 270 Tagen;
- HMAC-Suppression;
- Korrektur/Opt-out vor Crawl-Ergebnis.

Verifizierte Organisationsidentität darf zusätzliche Website-/Kontakt-Domains oder einen eng begrenzten Funktionsalias belegen, **ohne Empfängeradressen zu hardcoden**.

### Approved Snapshot – abgeschlossen als Pipeline-Stufe

`scripts/build-snapshot.mjs` entscheidet Routing erst nach Registry/Enrichment unter der zentralen Governance.

Erzeugt werden:

- public `clubs.json` ohne E-Mail-Adressen;
- private `recipients.json`;
- adressfreier Quality Report;
- Verein → LRV → DRV Fallback;
- Suppression-/Lifecycle-Gate.

## LRV-Fallback – abgeschlossen

Ausgangslage:

- **7/15 LRV** Direct-fähig;
- Clubrouting: **250 Direct / 64 LRV / 120 DRV**.

Die Untersuchung zeigte mehrere Ursachen:

1. offizielle Website- und Kontakt-Domain unterscheiden sich bei einzelnen LRV;
2. zusammengesetzte Funktionsaliase werden nicht durch eine pauschale Regex abgedeckt;
3. einige LRV-Seiten blockieren automatisierte Abrufe via `robots.txt`;
4. einzelne Verbände veröffentlichen ausschließlich personenbezogene Kontakte.

Lösung ohne Aufweichung der Governance:

- `scripts/lib/lrv-identity.mjs` enthält ausschließlich verifizierte Organisationsidentität, keine Empfängeradressen;
- Website-Enrichment respektiert `robots.txt` vollständig;
- offizielle DRV-Länderrat-Seite dient als zweite DRV-Quelle;
- Zuordnung im Länderrat primär über eindeutigen DOM-Kontext;
- falls der DOM-Kontext nicht eindeutig ist: Fallback nur, wenn die E-Mail-Domain über DRV-Profil bzw. verifizierte Identität **genau einem LRV** zugeordnet werden kann;
- Rollenaliase Präsident/Vizepräsident sind als Funktionsrollen erfasst;
- persönliche Länderrat-Adressen bleiben Review.

Realer Referenzlauf nach dem Domain-Fallback:

- Länderrat: 15 Kandidaten für 14 eindeutig zugeordnete LRV;
- 4 Kandidaten erfüllen das technische Auto-Approval-Gate, 11 bleiben Review;
- 2 Kandidaten mussten über eindeutige verifizierte Domain statt DOM-Kontext aufgelöst werden;
- **14/15 LRV** besitzen im finalen Snapshot eine sichere Direct Route;
- Clubrouting: **250 Direct / 171 LRV / 13 DRV**.

Die verbleibenden 13 DRV-Fallbacks sind ausschließlich:

- Rheinland-Pfalz: **12**;
- Saarland: **1**.

Damit gehören alle zum Ruderverband Südwest. Dieser bleibt absichtlich DRV-Fallback: die aktuell geprüften Quellen liefern nur personenbezogene Kontakte. Die Governance wird für Coverage nicht gelockert.

## Website Discovery PoC B – vorbereitet

Aktuelle vollständige `website_missing`-Queue: **23 Vereine**.

Eingefrorener Vertrag:

- 23/23 manuell klassifiziert;
- **18 `official` / 5 `none` / 0 `ambiguous`**;
- Query: Vereinsname + PLZ + Ort/Ortsteil + Rudern;
- mehrere legitime Hosts möglich;
- `none` + Auto-Accept zählt als False Positive;
- Ziel: **0 falsche Auto-Accepts**.

Der echte Brave-Lauf bleibt als einziger PoC-B-Schritt offen und läuft erst, wenn `BRAVE_SEARCH_API_KEY` als Repository-Secret vorhanden ist. Die providerunabhängigen Tests sind grün.

## Noch offene Engineering-Stufen

1. **100er-Pilot** – stratifizierte Stichprobe und reproduzierbarer Lauf über Registry/Discovery/Enrichment/Snapshot.
2. Voll-Enrichment modularisieren und Produktionssnapshot erzeugen.
3. Lauf-zu-Lauf-Stabilität, Review-Quote und False Positives messen.

## Formale Go-live-Spur

Vor Produktion weiterhin dokumentiert abzuschließen:

- DRV-Kommunikation / Freigabeumfang und Quellenangabe;
- Datenschutz-/Informationspflichten;
- Betreiberangaben;
- SMTP;
- Coolify/DNS/HTTPS/Healthcheck/Testmail.

## Quality Gates vor Vollbestand

- Registry >=95 % technisch parsebar — **erfüllt: 100 %**;
- stabile ID + Routing-Fallback — **erfüllt**;
- keine E-Mail im öffentlichen Datensatz — **CI-erzwungen**;
- personalisierte Kontakte nicht Auto-Direct — **CI-erzwungen**;
- direkte Empfänger mit Provenienz + `verifiedAt` — **CI-erzwungen**;
- LRV-Fallback — **14/15 sicher, Südwest bewusst DRV-Fallback**;
- Domain-Fehlzuordnung <1 % — realer Search-Provider-PoC noch offen.

## Genau eine nächste ausführbare Aktion

**100er-Pilot vorbereiten und eine stratifizierte, adressfreie Eingabestichprobe erzeugen.**

Die Stichprobe soll:

- alle LRV/Regionen abdecken;
- bekannte DRV-Websites und `website_missing` getrennt markieren;
- verschiedene Website-/Fehlerklassen enthalten;
- Registry-, Website- und Routing-Provenienz mitführen;
- noch keinen Vollcrawl starten.

Danach wird der Pilot über dieselbe Governance- und Snapshot-Stufe ausgeführt. Der echte 23er-Brave-PoC bleibt parallel automatisch ausführbar, sobald das Repository-Secret vorhanden ist.
