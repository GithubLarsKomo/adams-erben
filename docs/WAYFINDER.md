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
- Öffentliche Browser- und Quality-Artefakte enthalten keine E-Mail-Adressen.
- Preview und Produktion sind getrennt; ein Deployment crawlt niemals live DRV- oder Vereinsseiten.
- Der Ratzeburger Ruderclub bleibt hervorgehoben; Filmassets werden ohne Freigabe nicht übernommen.

## Architekturentscheidung – getrennte Pipelines

### Acquisition

```text
DRV Registry
→ Website Discovery
→ Vereins-/LRV-Enrichment
→ Contact Candidate History
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
- unter Contact Governance 1.1.0 **240 Vereine** bereits über einen DRV-Kandidaten Direct-fähig.

### Enrichment PoC A – abgeschlossen

25 bekannte Vereinswebsites / 12 Bundesländer:

- Website erreichbar: **23/25**;
- Funktionskontakt: **18/25**;
- ursprünglicher PoC Auto-Direct: **18/25**;
- Review: **1/25**;
- Fallback: **6/25**.

Ein zusätzlicher Diagnosepass über 64 Pfade / 38 erfolgreiche HTML-Seiten fand **0 zusätzliche E-Mail-Signale**.

Entscheidung: maximal fünf erfolgreich geladene kontaktnahe Seiten; anschließend Fallback statt breitem Path-Probing.

### Contact Governance – technisch abgeschlossen, Policy 1.1.0

`scripts/lib/contact-governance.mjs`:

- personalisierte Adressen nie Auto-Direct;
- Funktions-/Rollenadresse nur mit sicherem Organisationskontext;
- Rollenalias auf fremder, nicht verifizierter Domain bleibt Review;
- Drittanbieter ausgeschlossen;
- Provenienz + `verifiedAt` Pflicht;
- stale ab 180 Tagen, Auto-Direct aus ab 270 Tagen;
- HMAC-Suppression;
- Korrektur/Opt-out vor Crawl-Ergebnis.

Verifizierte Organisationsidentität darf zusätzliche Website-/Kontakt-Domains oder einen eng begrenzten Funktionsalias belegen, **ohne Empfängeradressen zu hardcoden**.

Policy 1.1.0 reduziert die Registry-Auto-Direct-Abdeckung bei Vereinen bewusst von 250 auf **240**. Der adressfreie Diagnosereport weist dafür exakt **10 Vereinsfälle** mit `role_alias_external_unverified_domain` aus.

### Adressfreie Governance-Diagnostik – abgeschlossen

`scripts/report-contact-governance-reasons.mjs` projiziert private Snapshot-Entscheidungen auf sichere Quality-Daten:

- DRV-ID / Organisationsname / Typ / Route;
- `reason`, `governanceState`, `lifecycleState`, `contactKind`;
- keine E-Mail-Adresse;
- keine E-Mail-Domain;
- expliziter Leak-Test.

Aktueller Vollbestand:

- 503 Entscheidungen;
- 460 Organisationen mit Kontaktkandidaten;
- 200 Organisationen ohne Direct-Freigabe trotz Kandidat;
- 36 Organisationen mit externer unverifizierter Funktions-/Rollendomäne;
- davon erklären **10 Vereine mit Rollenalias** exakt den Policy-1.1-Rückgang 250 → 240.

### Approved Snapshot – abgeschlossen als Pipeline-Stufe

`scripts/build-snapshot.mjs` entscheidet Routing erst nach Registry/Enrichment unter der zentralen Governance. `snapshot:build` erzeugt zusätzlich automatisch die adressfreie Governance-Diagnostik.

Erzeugt werden:

- public `clubs.json` ohne E-Mail-Adressen;
- private `recipients.json`;
- private Snapshot-Entscheidungen;
- adressfreier Quality-/Reason-Report;
- Verein → LRV → DRV Fallback;
- Suppression-/Lifecycle-Gate.

## LRV-Fallback – abgeschlossen

Lösung ohne Aufweichung der Governance:

- `scripts/lib/lrv-identity.mjs` enthält ausschließlich verifizierte Organisationsidentität, keine Empfängeradressen;
- Website-Enrichment respektiert `robots.txt` vollständig;
- offizielle DRV-Länderrat-Seite dient als zweite DRV-Quelle;
- Zuordnung im Länderrat primär über eindeutigen DOM-Kontext;
- Domain-Fallback nur bei eindeutiger, vorher verifizierter Verbandsidentität;
- persönliche Länderrat-Adressen bleiben Review.

Zusätzlich verifiziert: Bremen nutzt unterschiedliche offizielle Website-/Kontakt-Domains; dies ist als Organisationsidentität, nicht als Empfänger-Sonderfall, modelliert.

Aktueller Referenzlauf unter Policy 1.1.0:

- **14/15 LRV** besitzen eine sichere Direct Route;
- Clubrouting vor Vereinswebsite-Voll-Enrichment: **240 Direct / 180 LRV / 14 DRV**.

Die 14 DRV-Fallbacks liegen vollständig im Südwest-Bereich:

- Rheinland-Pfalz: **13**;
- Saarland: **1**.

Der zusätzliche Fall gegenüber Policy 1.0 ist DRV 12038 Wormser Ruderclub. Ursache ist ein Canonical-/Domainwechsel zwischen im DRV gespeicherter Website und aktueller Vereins-/Kontakt-Domain; hierfür wird **kein club-spezifischer Hardcode** eingeführt. Das gehört in den generischen Website-/Redirect-Enrichment-Pfad.

## Website Discovery PoC B – vorbereitet, Providerlauf offen

Aktuelle vollständige `website_missing`-Queue: **23 Vereine**.

Eingefrorener Vertrag:

- 23/23 manuell klassifiziert;
- **18 `official` / 5 `none` / 0 `ambiguous`**;
- Query: Vereinsname + PLZ + Ort/Ortsteil + Rudern;
- mehrere legitime Hosts möglich;
- `none` + Auto-Accept zählt als False Positive;
- Ziel: **0 falsche Auto-Accepts**.

Der echte Brave-Lauf bleibt offen und läuft erst, wenn `BRAVE_SEARCH_API_KEY` als Repository-Secret vorhanden ist. Die providerunabhängigen Tests sind grün.

Vier der sechs im 100er-Vergleich verlorenen finalen Direct-Routen sind `website_missing`, aber bereits in der Ground Truth als offizielle Website belegt:

- 11005 Ruderverein Esslingen;
- 11201 Akademischer Ruder Club zu Berlin;
- 11946 Kölner Rudergesellschaft 1891;
- 12413 Lübecker Frauen-Ruder-Gesellschaft.

Diese vier sind Discovery-Fälle, keine Begründung zur Lockerung der Contact Governance.

## Bounded 100 Club Pilot – abgeschlossen

Die ursprüngliche 100er-Kohorte ist als reine DRV-ID-Liste eingefroren:

- `scripts/pilot-100-ids.v1.json`;
- Sample-Hash `e593b08abd7dd063e6e1e76f80700d8884ae53523c9d93d8eca3c9ac82965a18`;
- nur IDs sind fix; Website-, State- und Routingmetadaten werden bei jedem Lauf frisch aus Registry/Snapshot aufgebaut.

Runde 3 unter Contact Governance 1.1.0:

- 100/434 Vereine;
- 16/16 Bundesländer;
- 77 bekannte Websites / 23 Discovery pending;
- 65 Websites erreichbar;
- 59 verarbeitet;
- 6 Identity Reviews;
- 5 `robots_blocked`;
- 5 `robots_unavailable`;
- 2 Netzwerk-/HTTP-Fehler;
- Seitenlimit eingehalten: max. 5 erfolgreiche Seiten / 8 Versuche je Verein;
- Routing vorher: **39 Direct / 48 LRV / 13 DRV**;
- Website-Enrichment erzeugt **14 neue Direct-Upgrades**;
- Routing nach Pilot: **53 Direct / 38 LRV / 9 DRV**;
- Saarbrücken 12103 bleibt durch explizites Identity-Gate korrekt Review/DRV und wird nicht mehr über `ruderbund.de` fehlzugeordnet.

### Vergleich Runde 2 → Runde 3

Finale Direct-Routen sinken von 59 auf 53. Die sechs Fälle sind vollständig klassifiziert:

1. **11005** – Registry-Direct → LRV; Website fehlt im DRV, Discovery-Ground-Truth `official`.
2. **11201** – Registry-Direct → LRV; Website fehlt im DRV, Discovery-Ground-Truth `official`.
3. **11946** – Registry-Direct → LRV; Website fehlt im DRV, Discovery-Ground-Truth `official`.
4. **12413** – Registry-Direct → LRV; Website fehlt im DRV, Discovery-Ground-Truth `official`.
5. **11612** – Website-Kontakte bleiben unter Policy 1.1 Review, weil die Kontakt-Domain nicht als Organisationsdomain verifiziert ist.
6. **12417** – vorheriger Website-Direct ging in Runde 3 ausschließlich durch `robots_unavailable` verloren.

Zusatz: **11037** wurde durch Policy 1.1 im Registry-Schritt ebenfalls Direct → LRV zurückgestuft, aber der reale Website-Lauf stellte die Direct-Route korrekt wieder her. Das bestätigt, dass der Enrichment-Pfad die Governance-Verschärfung kompensieren kann, ohne sie zurückzunehmen.

## Last-known-good / Contact Candidate History – Library umgesetzt, Integration offen

`scripts/lib/contact-candidate-history.mjs` definiert den Carry-forward-Vertrag:

- nur technische Zustände wie `robots_unavailable`, `robots_blocked`, Netzwerk-/HTTP-/Redirect-Fehler dürfen einen vorher verifizierten Kandidaten weitertragen;
- `verifiedAt` wird beim Carry-forward **nicht** erneuert;
- der normale 180/270-Tage-Lifecycle bleibt deshalb wirksam;
- frische Kandidaten ersetzen alte Kandidaten;
- `processed` ohne Kandidat löscht den alten Kandidaten aus dem aktuellen Set;
- `identity_review` und `discovery_pending_provider` dürfen keine alte Direct-Route resurrecten;
- Suppression/Korrektur bleibt nachgelagert autoritativ.

Die Regeln sind als schnelle CI-Tests abgedeckt. Die Library ist noch nicht in den produktiven Enrichment→Snapshot-Datenfluss integriert.

## Workflow-Betrieb – gehärtet

Netzwerkintensive Workflows werden nicht mehr über jeden `pull_request`-Synchronisierungslauf gestartet. Sie sind getrennt über `workflow_dispatch` und gezielte Push-Pfade auf `feat/mvp-wayfinder` steuerbar:

- DRV Registry Quality;
- Enrichment PoC;
- Website Discovery PoC;
- Bounded 100 Club Pilot.

Dadurch erzeugen Doku-/Hilfstestcommits keine unnötigen 503-Profil-, Vereinswebsite- oder Search-Provider-Läufe.

## Noch offene Engineering-Stufen

1. Last-known-good Candidate History in den privaten Enrichment→Snapshot-Datenfluss integrieren und Lauf-zu-Lauf-Stabilität beweisen.
2. Verifizierbare Contact-Domain-Evidence für Fälle wie 11612 als generische, konservative Regel untersuchen; keine club-spezifischen Empfängerhardcodes.
3. echten 23er-Discovery-Providerlauf ausführen, sobald ein Search-Provider-Secret vorhanden ist.
4. Voll-Enrichment modularisieren und Produktionssnapshot erzeugen.
5. Review-Quote, technische Fehlerquote, Carry-forward-Quote und False Positives über Vollbestand messen.

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
- externe Rollen-/Funktionsdomain ohne Organisationsbeleg nicht Auto-Direct — **Policy 1.1.0 / CI-erzwungen**;
- LRV-Fallback — **14/15 sicher**;
- Website-Identity-False-Positive 12103 — **Regression-Gate vorhanden**;
- reproduzierbare 100er-Kohorte — **erfüllt, Frozen-ID-Hash-Gate**;
- Lauf-zu-Lauf-Stabilität bei technischen Crawlfehlern — **Library vorhanden, Integration offen**;
- Discovery-Präzision — realer Search-Provider-PoC noch offen.

## Genau eine nächste ausführbare Aktion

**`contact-candidate-history` in einen privaten, reproduzierbaren Enrichment→Snapshot-Integrationspfad einbauen und mit einem technischen Fehler-Replay beweisen, dass ein Last-known-good-Direct bis zum Lifecycle-Ablauf erhalten bleibt, ohne `verifiedAt` zu erneuern.**

Stop-Bedingungen dieser Aktion:

- frischer Crawl ersetzt den alten Kandidaten deterministisch;
- technischer Fehler trägt nur einen zuvor verifizierten Kandidaten weiter;
- `processed` ohne Kontakt, `identity_review`, Suppression oder explizite Korrektur können Carry-forward verhindern;
- öffentliche Reports zeigen nur Carry-forward-Status/Counts, niemals Adressen oder Domains;
- ein Replay des 12417-Fehlertyps demonstriert stabile Route ohne erneuten Live-Crawl.

Erst danach folgt Contact-Domain-Evidence und anschließend der Voll-Enrichment-Track.
