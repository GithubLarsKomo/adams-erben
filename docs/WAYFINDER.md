# Wayfinder – Adams Erben

Stand: 2026-08-10

## Fixierter Ausgangspunkt

Repository: `GithubLarsKomo/adams-erben`

Immutable Ausgangs-SHA: `9ce485cdb5a9cef1bae60184589012c4c613ca9a`

Arbeitsbranch: `feat/mvp-wayfinder`

## Bestätigte Fakten

- Die öffentliche DRV-Vereinssuche ist **Registry/Seed**, nicht alleinige Kontaktquelle.
- Registry Parser **1.1.5** verarbeitet real **503/503 Profile = 100 %**.
- Bestand: **434 Vereine**, **15/15 LRV**, **54 sonstige Mitglieder**.
- **411/434 Vereine** besitzen einen DRV-Weblink; **23/434** gehen an Website Discovery.
- Routingziel bleibt Verein → LRV → DRV.
- Öffentliche Browser- und Quality-Artefakte enthalten keine E-Mail-Adressen.
- Preview/Produktion und Acquisition sind getrennt; Deployments crawlen niemals live.

## Architektur

```text
DRV Registry
→ Website Discovery
→ Vereins-/LRV-Enrichment
→ Contact Domain Evidence
→ Contact Candidate History
→ zentrale Contact Governance
→ Approved Snapshot
```

Deployment:

```text
Approved Snapshot
→ public clubs.json
→ private recipients.json
→ Build
→ Coolify
```

## Registry / Seed – abgeschlossen

Realer Voll-Lauf:

- 503/503 Profile;
- 434 Vereine;
- 15 LRV;
- 54 sonstige Mitglieder;
- 411 Vereine mit DRV-Weblink;
- 23 Vereine ohne DRV-Weblink;
- unter Contact Governance 1.1.0 **240 Vereine** bereits über DRV-Kandidaten Direct-fähig.

## Contact Governance 1.1.0 – abgeschlossen

`scripts/lib/contact-governance.mjs`:

- personalisierte Adressen nie Auto-Direct;
- Funktions-/Rollenadresse nur mit sicherem Organisationskontext;
- externe Rollen-/Funktionsdomain ohne Organisationsbeleg bleibt Review;
- Drittanbieter ausgeschlossen;
- Provenienz + `verifiedAt` Pflicht;
- stale ab 180 Tagen, Auto-Direct aus ab 270 Tagen;
- HMAC-Suppression sowie Korrektur/Opt-out bleiben autoritativ.

Policy 1.1.0 reduziert Registry-Auto-Direct bei Vereinen bewusst **250 → 240**. Der adressfreie Governance-Reason-Report weist dafür exakt **10 Vereinsfälle** mit `role_alias_external_unverified_domain` aus.

## Adressfreie Governance-Diagnostik – abgeschlossen

`scripts/report-contact-governance-reasons.mjs` projiziert private Entscheidungen auf:

- DRV-ID / Organisation / Typ / Route;
- `reason`, `governanceState`, `lifecycleState`, `contactKind`;
- keine E-Mail-Adresse;
- keine E-Mail-Domain.

Vollbestand:

- 503 Entscheidungen;
- 460 Organisationen mit Kandidaten;
- 200 ohne Direct-Freigabe trotz Kandidat;
- 36 Organisationen mit externer unverifizierter Funktions-/Rollendomäne;
- 10 Vereins-Rollenaliasfälle erklären den Policy-Rückgang vollständig.

## LRV-Fallback – abgeschlossen

Verifizierte LRV-Organisationsidentität, Website-Enrichment und DRV-Länderrat ergeben:

- **14/15 LRV** mit sicherer Direct-Route;
- Clubrouting vor Vereinswebsite-Voll-Enrichment: **240 Direct / 180 LRV / 14 DRV**.

Bremen ist als Website-/Kontakt-Domain-Alias auf Organisationsidentitätsebene modelliert, nicht als Empfänger-Sonderfall.

Die 14 DRV-Fallbacks liegen im Südwest-Bereich. DRV 12038 Wormser Ruderclub ist ein Canonical-/Domainwechsel-Fall und wird nicht hardcodiert.

## Website Discovery PoC B – vorbereitet, Providerlauf offen

Aktuelle `website_missing`-Queue: **23 Vereine**.

Ground Truth:

- **18 `official` / 5 `none` / 0 `ambiguous`**;
- Ziel: **0 falsche Auto-Accepts**;
- echter Brave-Lauf erst mit `BRAVE_SEARCH_API_KEY`.

Vier im Pilot verlorene Direct-Routen sind bereits als `official` klassifiziert:

- 11005 Ruderverein Esslingen;
- 11201 Akademischer Ruder Club zu Berlin;
- 11946 Kölner Rudergesellschaft 1891;
- 12413 Lübecker Frauen-Ruder-Gesellschaft.

## Bounded 100 Club Pilot – Runde 3 abgeschlossen

Frozen-ID-Kohorte:

- `scripts/pilot-100-ids.v1.json`;
- Hash `e593b08abd7dd063e6e1e76f80700d8884ae53523c9d93d8eca3c9ac82965a18`;
- nur IDs fix, aktuelle Website-/State-/Routingdaten werden neu aufgebaut.

Runde 3 unter Policy 1.1.0:

- 100/434 Vereine;
- 16/16 Bundesländer;
- 77 bekannte Websites / 23 Discovery pending;
- 65 erreichbar;
- 59 verarbeitet;
- 6 Identity Reviews;
- 5 `robots_blocked`;
- 5 `robots_unavailable`;
- 2 Netzwerk-/HTTP-Fehler;
- max. 5 erfolgreiche Seiten / 8 Versuche je Verein;
- Routing vorher: **39 Direct / 48 LRV / 13 DRV**;
- **14 neue Direct-Upgrades**;
- Routing danach: **53 Direct / 38 LRV / 9 DRV**.

Saarbrücken 12103 bleibt durch das Website-Identity-Gate korrekt Review/DRV.

### Runde 2 → Runde 3

Sechs finale Directs gingen verloren:

1. 11005 – Discovery-Fall (`official`).
2. 11201 – Discovery-Fall (`official`).
3. 11946 – Discovery-Fall (`official`).
4. 12413 – Discovery-Fall (`official`).
5. 11612 – externe Contact-Domain ohne ausreichenden Organisationsbeleg.
6. 12417 – ausschließlich technischer `robots_unavailable`-Ausfall.

11037 wurde im Registry-Schritt zurückgestuft, aber durch Website-Enrichment wieder korrekt Direct.

## Last-known-good / Contact Candidate History – abgeschlossen

Implementiert:

- `scripts/lib/contact-candidate-history.mjs`;
- `scripts/merge-contact-candidate-history.mjs` als explizite private Pipeline-Stufe;
- `scripts/contact-history-snapshot.integration.test.mjs` als Replay bis in den unveränderten Snapshot.

Vertrag:

- Carry-forward nur bei technischen Fehlerzuständen;
- `verifiedAt` wird **nicht** erneuert;
- frische Kandidaten ersetzen alte;
- `processed` ohne Kontakt entfernt alte Kandidaten;
- `identity_review` und `discovery_pending_provider` resurrecten nichts;
- Suppression/Korrektur bleiben autoritativ;
- Lifecycle 180/270 Tage bleibt wirksam.

Replay des 12417-Fehlertyps ist grün:

- technischer Ausfall hält Last-known-good Direct;
- nach 270 Tagen fällt der Club zurück;
- Suppression verhindert Carry-forward-Routing;
- frischer Kandidat ersetzt deterministisch den alten;
- öffentlicher History-Report enthält keine Adresse/Domain.

## Contact Domain Evidence 1.0 – statisch abgeschlossen, realer Pilot offen

Neu:

- `scripts/lib/contact-domain-evidence.mjs`;
- `scripts/lib/contact-domain-evidence.test.mjs`;
- Integration in `scripts/run-pilot-100.mjs` Runner **1.2.0**.

Konservative Trust-Regel für eine externe Maildomain:

- Website-Identität muss bereits stark sein;
- keine Freemail-/Personal-Provider-Domain;
- keine Drittanbieter-/Injection-Kontexte;
- Quellen müssen zur bestätigten Vereinswebsite gehören;
- mindestens **2 verschiedene Rollen-/Funktionspostfächer** derselben Domain;
- auf mindestens **2 verschiedenen offiziellen Seiten**;
- mindestens eine Kontakt-/Vorstand-/Impressum-/Datenschutz-Seite.

Erst dann wird die Domain ausschließlich für den aktuellen Organisationskontext als `trustedDomain` an die zentrale Contact Governance übergeben. Die zentrale Governance entscheidet weiterhin über den einzelnen Kandidaten.

Negativtests sind grün: Einzelsignal, nur eine Seite, Freemail, fremder Quellhost, schwache Website-Identität und Drittanbieter-/Injection-Kontext erzeugen keine Trusted Domain.

Öffentliche Pilot-Artefakte enthalten nur Evidence-Zähler, niemals die erkannte Maildomain. Die vollständige Evidence bleibt privat.

Runner 1.2.0 + Evidence-Tests sind in `CI`/`MVP CI` grün. Der gezielte Frozen-100-Push-Workflow ist wieder aktiviert. **Die reale Runner-1.2-Runde wird erst als gemessen gewertet, sobald ihre Actions-Run-ID/Artifacts eindeutig gelesen werden können; es wird kein zweiter Crawl nur zur Verifikation gestartet.**

## Workflow-Betrieb – gehärtet

Netzwerkintensive Workflows laufen über `workflow_dispatch` und gezielte Push-Pfade, nicht mehr bei jedem PR-Synchronize:

- DRV Registry Quality;
- Enrichment PoC;
- Website Discovery PoC;
- Bounded 100 Club Pilot.

Dadurch erzeugen Doku-/Hilfstestcommits keine unnötigen Registry-/Website-/Search-Läufe.

## Formale Go-live-Spur

Vor Produktion weiterhin abzuschließen:

- DRV-Kommunikation / Freigabeumfang / Quellenangabe;
- Datenschutz-/Informationspflichten;
- Betreiberangaben;
- SMTP;
- Coolify/DNS/HTTPS/Healthcheck/Testmail.

## Quality Gates vor Vollbestand

- Registry >=95 % — **erfüllt: 100 %**;
- stabile ID + Routing-Fallback — **erfüllt**;
- keine E-Mail im öffentlichen Datensatz — **CI-erzwungen**;
- personalisierte Kontakte nicht Auto-Direct — **CI-erzwungen**;
- Provenienz + `verifiedAt` — **CI-erzwungen**;
- externe Rollen-/Funktionsdomain ohne Organisationsbeleg nicht Auto-Direct — **Policy 1.1.0**;
- LRV-Fallback — **14/15 sicher**;
- Website-Identity-False-Positive 12103 — **Regression-Gate vorhanden**;
- reproduzierbare 100er-Kohorte — **Frozen-ID-Hash-Gate**;
- Lauf-zu-Lauf-Stabilität bei technischen Fehlern — **History-Replay erfüllt**;
- Contact-Domain-Evidence — **statisch erfüllt, realer Frozen-100-Lauf noch zu verifizieren**;
- Discovery-Präzision — realer Search-Provider-PoC offen.

## Genau eine nächste ausführbare Aktion

**Den bereits ausgelösten Frozen-100-Lauf mit Runner 1.2.0 eindeutig über seine GitHub-Actions-Run-ID/Artifacts verifizieren und gegen Runde 3 auswerten – ohne einen zweiten Crawl zu starten.**

Stop-Bedingungen:

- gleicher Frozen-ID-Hash;
- Saarbrücken 12103 bleibt `identity_review`/DRV;
- Public Artifacts enthalten keine E-Mail-Adressen oder Maildomains;
- Evidence-Zähler werden adressfrei ausgewiesen;
- jede Organisation mit `trustedContactDomainCount > 0` wird einzeln auf False-Positive-Risiko geprüft;
- 11612 wird nur dann als Erfolg gewertet, wenn die Mehrsignal-Evidence real erreicht wird;
- Seiten-/Versuchslimits bleiben unverändert;
- bei nicht eindeutig lesbarer Run-ID wird **nicht** durch einen weiteren Netzlauf kompensiert.

Erst danach wird entschieden, ob Contact-Domain-Evidence in den Voll-Enrichment-Track übernommen wird.
