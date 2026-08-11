# Wayfinder – Adams Erben

Stand: 2026-08-11

## Aktuelle Architekturentscheidung – 2026-08-11

Die frühere Eskalationskette `Verein → LRV → DRV` ist als Produktlogik aufgehoben.

Neue verbindliche Kontaktregel:

```text
Verein mit freigegebener direkter E-Mail
→ Kontaktformular direkt an den Verein

Verein ohne freigegebene direkte E-Mail
→ keine Contact-Route
→ Vereinswebsite, falls vorhanden
→ andernfalls verfügbare Orts-/Adressinformation
```

Landesruderverbände und der DRV bleiben eigenständige Verzeichniseinträge und dürfen nur dann kontaktiert werden, wenn der Nutzer genau diese Organisation auswählt und für sie selbst ein direkter Kontakt freigegeben ist. Sie sind kein Fallback für Vereine.

Technische Invarianten:

- ein Verein ohne Direct-Freigabe hat keinen Eintrag in `build-private/recipients.json`;
- `contactRouteLevel` ist in diesem Fall `none`;
- die Contact-API akzeptiert nur direkte Routen mit `organizationId === routeOrganizationId`;
- der Output-Validator schlägt bei indirektem bzw. Fallback-Routing fehl;
- öffentliche Artefakte enthalten weiterhin keine E-Mail-Adressen.

### Nearest-Neighbour-Suche

Die Vereinssuche nach Nähe ist bewusst klein und providerfrei zur Laufzeit:

```text
lokaler PLZ-/Ortsindex
→ Suchort im Browser auflösen
→ Haversine-Distanz zu Rudervereinen
→ sortieren
→ Radius 25 / 50 / 100 km oder alle
→ bis zu 5 nächste Vereine
```

- Der Produktions-Build nutzt die bereits vorhandene GeoNames-DE-Postleitzahlquelle, um einen lokalen Snapshot mit Ortsnamen und Koordinaten zu erzeugen.
- Im Browser wird kein Google-, Karten- oder Geocoding-Dienst aufgerufen.
- Optional kann `navigator.geolocation` verwendet werden; Adams Erben nutzt die gelieferten Koordinaten nur lokal zur Distanzberechnung.
- Die angezeigte Entfernung ist ausdrücklich Luftlinie, keine Straßen- oder Fahrstrecke.
- Fehlt im gewählten Radius ein Verein, werden stattdessen die drei geografisch nächsten Vereine angezeigt.

**Alle Routingzahlen weiter unten sind historische Diagnosewerte der früheren Fallback-Architektur und kein aktuelles Sollverhalten mehr.**

## Fixierter Ausgangspunkt

Repository: `GithubLarsKomo/adams-erben`

Immutable Ausgangs-SHA: `9ce485cdb5a9cef1bae60184589012c4c613ca9a`

Ursprünglicher Arbeitsbranch: `feat/mvp-wayfinder`

Aktueller Änderungsbranch: `feat/direct-club-contact-nearest`

## Architektur

```text
DRV Registry
→ Website Discovery / Verified Website Resolution
→ Vereins-/LRV-Enrichment
→ Contact Domain Evidence
→ Contact Candidate History
→ Contact Governance
→ Approved Snapshot
→ Deployment
```

Acquisition und Deployment bleiben getrennt; öffentliche Artefakte enthalten keine Kontaktadressen.

## Bestätigte Referenzwerte – historischer Stand vor Direct-only

- Registry Parser 1.1.5: **503/503 Profile = 100 %**.
- 434 Vereine, 15 LRV, 54 sonstige Mitglieder.
- DRV-seitig 411 Vereinswebsites vorhanden, 23 fehlend.
- Contact Governance 1.1.0: personalisierte oder unzureichend belegte externe Kontakte werden nicht Auto-Direct.
- 14/15 LRV besaßen eine sichere Direct-Route; Südwest blieb im früheren Modell DRV-Fallback.
- Registry/Snapshot vor Vereinswebsite-Voll-Enrichment: **240 Direct / 180 LRV / 14 DRV** im früheren Fallback-Modell.

## Candidate History – abgeschlossen

Last-known-good ist bis in den Snapshot replay-verifiziert:

- Carry-forward nur bei technischen Fehlern;
- `verifiedAt` wird nicht erneuert;
- 180/270-Tage-Lifecycle bleibt wirksam;
- Suppression/Korrektur bleiben autoritativ;
- `processed` ohne Kontakt, `identity_review` und Discovery-pending resurrecten nichts;
- endet die Direct-Freigabe, entsteht im aktuellen Modell keine Ersatzroute zu LRV/DRV.

## Bounded 100 Club Pilot – historische Fallback-Auswertung

Frozen-ID-Kohorte:

`e593b08abd7dd063e6e1e76f80700d8884ae53523c9d93d8eca3c9ac82965a18`

### Runde 3 – Policy 1.1.0

- 77 bekannte Websites / 23 Discovery pending;
- 65 erreichbar, 59 verarbeitet;
- 6 Identity Reviews;
- Routing vorher: **39 Direct / 48 LRV / 13 DRV**;
- 14 neue Direct-Upgrades;
- Routing danach: **53 Direct / 38 LRV / 9 DRV**.

### Runde 4 – Runner 1.2.0 / Contact Domain Evidence 1.0

Actions Run: `31357463794`, Artifact `9051253749`.

Gemessen:

- 100 Vereine;
- 77 bekannte Websites / 23 Discovery pending;
- **66 erreichbar**, **60 verarbeitet**;
- 6 Identity Reviews;
- 5 robots-blocked, 4 robots-unavailable, 2 HTTP-Fehler;
- 284 erfolgreiche Seiten / 362 Versuche;
- Domain-Evidence-Kandidaten bei **16 Organisationen**;
- trusted Contact Domain bei **2 Organisationen**;
- 43 Auto-Direct-Kontaktergebnisse, 12 Review, 22 Fallback;
- Routing vorher: **39 Direct / 48 LRV / 13 DRV**;
- **16 neue Direct-Upgrades**;
- Routing danach: **55 Direct / 36 LRV / 9 DRV**.

Sicherheitsbefunde:

- Saarbrücken 12103 blieb korrekt Identity Review / DRV im damaligen Fallback-Modell; die alte `ruderbund.de`-Fehlzuordnung war geschlossen.
- 12417 war wieder erreichbar und wurde wieder korrekt Direct; der frühere Verlust war damit tatsächlich ein technischer Laufzeiteffekt.
- Contact Domain Evidence erzeugte zwei Trusted-Domain-Fälle, beide waren bereits Direct und verursachten keinen riskanten neuen Upgrade.
- 11612 blieb **Review**: 3 externe funktionale Domain-Kandidaten, aber keine Domain erreichte die Mehrsignal-Evidence. Die Regel wurde deshalb nicht gelockert.

Die Contact-Governance bleibt konservativ. Neu ist lediglich die Konsequenz eines nicht freigegebenen Kontakts: `none` statt Verbands-Fallback.

## Verified Website Resolution – produktionsnaher Pfad

Die 23 Missing-Website-Fälle sind bereits manuell Ground-Truth-verifiziert:

- **18 `official`** mit verifizierter offizieller Domain;
- **5 `none`** ohne eigenständige Website;
- 0 ambiguous.

Umgesetzt:

- `scripts/apply-verified-discovery.mjs`;
- Quelle `manual-verified-discovery/1.0.0`;
- nur fehlende Vereinswebsites dürfen ergänzt werden;
- bestehende DRV-Websites werden nie überschrieben;
- `none` bleibt bewusst missing;
- Website-Resolution ist **nur Acquisition-Input** und genehmigt keine Kontaktadresse und keine Route;
- Verifikationsdatum/Provenienz werden mitgeführt;
- Unit-Test und MVP-CI prüfen diesen Pfad.

Damit ist `BRAVE_SEARCH_API_KEY` **kein Produktionsblocker**. Der echte Search-Provider-PoC bleibt sinnvoll, um die spätere automatische Discovery-Präzision zu validieren, ist aber nicht erforderlich, um die 18 bereits manuell verifizierten Websites zu nutzen.

## Runde 5 – Einordnung unter Direct-only

Der `Bounded 100 Club Pilot` wurde auf denselben 100 IDs erweitert:

- ausschließlich der Acquisition-Registry werden die 18 manuell verifizierten Websites zugespielt;
- erwartete bekannte Websites: **95**;
- erwartete echte Discovery-pending-Fälle: **5**;
- Seiten-/Robots-/Identity-/Privacy-Gates bleiben unverändert;
- keine manuelle Website darf allein eine Direct-Route erzeugen; erst der normale Website-Crawler + Governance kann einen eigenen Vereinskontakt freigeben.

Die alte Auswertung `Direct/LRV/DRV` ist für neue Produktentscheidungen nicht mehr maßgeblich. Relevant sind künftig insbesondere:

- `Direct`: Verein besitzt einen freigegebenen eigenen Kontakt;
- `none + website`: kein Formular, Website als CTA;
- `none + no website`: kein Formular, nur Standort/Adresse;
- Review-/Suppression-/Stale-Gründe für nicht freigegebene Direct-Kandidaten.

## Genau eine nächste ausführbare Aktion

**Nach grünem PR #15 einen vollständigen produktionsnahen DRV-Snapshot mit der Direct-only-Policy erzeugen und die Verteilung `Direct / none+website / none+address` auswerten.**

Stop-Gates:

- keine Vereinsroute zeigt auf eine andere `routeOrganizationId`;
- kein Verein ohne `hasDirectContact` besitzt einen privaten Recipient;
- keine E-Mail in öffentlichen Artefakten;
- lokale PLZ-/Ortsdatei wird erzeugt und enthält nutzbare Koordinaten;
- Ratzeburg/23909 liefert den RRC plausibel als nächsten Verein;
- Suppression, Stale und Identity Review erzeugen `none`, keinen Verbands-Fallback;
- Website-Fallbacks bleiben auf verifizierte Vereinswebsites beschränkt.