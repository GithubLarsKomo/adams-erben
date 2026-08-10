# Wayfinder – Adams Erben

Stand: 2026-08-10

## Fixierter Ausgangspunkt

Repository: `GithubLarsKomo/adams-erben`

Immutable Ausgangs-SHA: `9ce485cdb5a9cef1bae60184589012c4c613ca9a`

Arbeitsbranch: `feat/mvp-wayfinder`

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

## Bestätigte Referenzwerte

- Registry Parser 1.1.5: **503/503 Profile = 100 %**.
- 434 Vereine, 15 LRV, 54 sonstige Mitglieder.
- DRV-seitig 411 Vereinswebsites vorhanden, 23 fehlend.
- Contact Governance 1.1.0: personalisierte oder unzureichend belegte externe Kontakte werden nicht Auto-Direct.
- 14/15 LRV besitzen eine sichere Direct-Route; Südwest bleibt bewusst DRV-Fallback.
- Registry/Snapshot vor Vereinswebsite-Voll-Enrichment: **240 Direct / 180 LRV / 14 DRV**.

## Candidate History – abgeschlossen

Last-known-good ist bis in den Snapshot replay-verifiziert:

- Carry-forward nur bei technischen Fehlern;
- `verifiedAt` wird nicht erneuert;
- 180/270-Tage-Lifecycle bleibt wirksam;
- Suppression/Korrektur bleiben autoritativ;
- `processed` ohne Kontakt, `identity_review` und Discovery-pending resurrecten nichts.

## Bounded 100 Club Pilot

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

- Saarbrücken 12103 bleibt korrekt Identity Review / DRV; die alte `ruderbund.de`-Fehlzuordnung ist weiterhin geschlossen.
- 12417 ist wieder erreichbar und wird wieder korrekt Direct; der frühere Verlust war damit tatsächlich ein technischer Laufzeiteffekt.
- Contact Domain Evidence erzeugte zwei Trusted-Domain-Fälle, beide waren bereits Direct und verursachten keinen riskanten neuen Upgrade.
- 11612 bleibt **Review**: 3 externe funktionale Domain-Kandidaten, aber keine Domain erreicht die Mehrsignal-Evidence. Die Regel wird deshalb nicht gelockert.

Aktuelle Schlussfolgerung: Domain Evidence 1.0 ist konservativ und sicher, aber für 11612 nicht ausreichend. Kein Anlass zur Lockerung der Governance.

## Verified Website Resolution – neuer produktionsnaher Pfad

Die 23 Missing-Website-Fälle sind bereits manuell Ground-Truth-verifiziert:

- **18 `official`** mit verifizierter offizieller Domain;
- **5 `none`** ohne eigenständige Website;
- 0 ambiguous.

Neu umgesetzt:

- `scripts/apply-verified-discovery.mjs`;
- Quelle `manual-verified-discovery/1.0.0`;
- nur fehlende Vereinswebsites dürfen ergänzt werden;
- bestehende DRV-Websites werden nie überschrieben;
- `none` bleibt bewusst missing;
- Website-Resolution ist **nur Acquisition-Input** und genehmigt keine Kontaktadresse und keine Route;
- Verifikationsdatum/Provenienz werden mitgeführt;
- Unit-Test und MVP-CI sind grün.

Damit ist `BRAVE_SEARCH_API_KEY` **kein Produktionsblocker mehr**. Der echte Search-Provider-PoC bleibt sinnvoll, um die spätere automatische Discovery-Präzision zu validieren, ist aber nicht mehr erforderlich, um die 18 bereits manuell verifizierten Websites zu nutzen.

## Runde 5 – gestartet

Der `Bounded 100 Club Pilot` ist auf denselben 100 IDs erweitert:

- Registry/Snapshot-Routing bleibt unverändert;
- ausschließlich der Acquisition-Registry werden die 18 manuell verifizierten Websites zugespielt;
- erwartete bekannte Websites: **95**;
- erwartete echte Discovery-pending-Fälle: **5**;
- Seiten-/Robots-/Identity-/Privacy-Gates bleiben unverändert;
- keine manuelle Website darf allein eine Direct-Route erzeugen; erst der normale Website-Crawler + Governance kann upgraden.

## Genau eine nächste ausführbare Aktion

**Runde 5 auswerten, sobald der neue `Bounded 100 Club Pilot` beendet ist.**

Stop-Gates:

- Frozen-ID-Hash unverändert;
- exakt 18 manuell verifizierte Websites übernommen und 5 `none` belassen;
- 95 bekannte Websites / 5 pending;
- keine neue Identity-Fehlzuordnung;
- keine E-Mail in öffentlichen Artefakten;
- Direct-Upgrades der 18 neu erschlossenen Websites einzeln auf Plausibilität prüfen;
- technische Fehlerquote und Review-Quote gegen Runde 4 vergleichen.

Erst danach wird dieselbe Pipeline auf den Vollbestand modularisiert.
