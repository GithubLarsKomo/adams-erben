# Website Discovery – PoC B

Stand: 2026-08-10

## Ziel

Für 25 DRV-Vereine ohne belastbaren Website-Link soll die offizielle Vereinsdomain über einen austauschbaren Search Provider gefunden und gegen manuell verifizierte Ground Truth bewertet werden.

PoC B bewertet **nur die Domain-Discovery**. Kontakt-Crawl und E-Mail-Routing bleiben nachgelagerte Schritte.

## Provider

Default: Brave Search API.

```text
SEARCH_PROVIDER=brave
BRAVE_SEARCH_API_KEY=<secret>
```

Der API-Key wird ausschließlich als Secret/Environment Variable verwendet und nie committed.

Für deterministische Tests steht `SEARCH_PROVIDER=fixture` zur Verfügung.

## Reale Stichprobe

Der Voll-Lauf des DRV-Registry-Parsers 1.1.1 liefert:

- 503/503 technisch geparste DRV-Registry-Profile;
- 435 als Vereine klassifizierte Organisationen;
- 407 Vereine mit DRV-Weblink;
- 28 Vereine ohne DRV-Weblink.

`npm run poc:discover:prepare` zieht daraus deterministisch 25 Vereine aus mindestens fünf Bundesländern nach `build-private/website-discovery-input.json`.

Die Stichprobe enthält keine E-Mail-Adressen.

## Input

```json
{
  "organizations": [
    {
      "organizationId": "12345",
      "drvId": "12345",
      "name": "Beispiel Ruderverein e.V.",
      "postalCode": "12345",
      "city": "Beispielstadt",
      "citySource": "drv-text+geonames-postcode",
      "state": "Beispielland",
      "drvProfileUrl": "https://www.rudern.de/service/vereine/beispiel-ruderverein"
    }
  ]
}
```

`city` wird seit Registry-Parser 1.1.1 gegen GeoNames-Orte derselben PLZ validiert. Da eine PLZ in Großstädten auch einen Ortsteil liefern kann, wird die PLZ in der Discovery-Suche immer zusätzlich mitgeführt.

## Ground Truth

Für den 25er-PoC liegt die adressfreie, reproduzierbare Ground Truth in:

```text
scripts/discovery-ground-truth.poc.json
```

Das Format kennt drei fachliche Zustände.

### Offizielle Website

```json
{
  "12345": {
    "status": "official",
    "acceptedHosts": ["beispiel-ruderverein.de"]
  }
}
```

Mehrere legitime Domains sind möglich, z. B. Hauptvereinsseite plus offizielle Abteilungswebsite:

```json
{
  "12211": {
    "status": "official",
    "acceptedHosts": ["scdhfk.de", "scdhfk-rudern.de"]
  }
}
```

### Keine eigenständige offizielle Website verifiziert

```json
{
  "12345": {
    "status": "none",
    "acceptedHosts": [],
    "note": "Keine eigenständige offizielle Website verifiziert; zeitpunktbezogene Ground Truth."
  }
}
```

`none` bedeutet ausdrücklich nicht, dass dauerhaft keine Website existieren kann. Es bedeutet: Zum Ground-Truth-Zeitpunkt konnte keine eigenständige offizielle Website verifiziert werden. **Jedes Auto-Accept ist in diesem Fall ein False Positive.**

### Mehrdeutig/geteilt

```json
{
  "12345": {
    "status": "ambiguous",
    "acceptedHosts": ["gemeinsamer-webauftritt.de"]
  }
}
```

Bei `ambiguous` ist eine Domain plausibel bzw. geteilt, aber die Automatik soll nicht eigenständig übernehmen. Ein Auto-Accept zählt deshalb als zu aggressiv; `review` ist die gewünschte Entscheidung.

Legacy-Formate mit einer URL oder einer URL-Liste werden weiterhin als `official` interpretiert.

## Reale Ground-Truth-Verteilung

Aktueller 25er-Satz:

- **19 `official`**;
- **5 `none`**;
- **1 `ambiguous`**.

Ein wichtiger False-Positive-Fall ist der Ruderclub Mülheim a. d. Ruhr von 1977: Das DRV-Profil besitzt keinen Weblink; eine andere Mülheimer Ruderorganisation besitzt `muelheimer-rg.de`. Diese Domain darf nicht allein wegen Ort und Ruderbezug übernommen werden.

## Suche

Standardquery:

```text
"<Vereinsname>" <PLZ> <Ort/Ortsteil> Rudern
```

PLZ und Ort werden beide verwendet, sofern vorhanden. Dadurch bleibt die Query auch bei GeoNames-Ortsteilen robust.

Es werden maximal acht Suchtreffer bewertet.

## Scoring

Positive Signale:

- charakteristische Namenstoken;
- Ort/Ortsteil;
- PLZ;
- Rudern-/Ruderbezug;
- Treffer auf bereits bekannte DRV-Domain, falls vorhanden;
- hohe Suchposition als schwaches Signal.

Negative/ausgeschlossene Signale:

- Social Media;
- Wikipedia;
- DRV-Seite selbst;
- Suchmaschinen;
- offensichtliche Vereins-/Branchenverzeichnisse;
- gehostete Baukasten-Domain als leichter Malus, aber kein harter Ausschluss.

Default Thresholds:

```text
Auto-Accept >= 0.78
Review     >= 0.48
Reject      < 0.48
```

Wenn die beiden besten Auto-Accept-Kandidaten weniger als 0,12 auseinanderliegen, wird der Fall unabhängig vom absoluten Score auf `review` gesetzt.

## Ground-Truth-Auswertung

`evaluateGroundTruth()` bewertet Auto-Accept konservativ:

- `official`: korrekt nur, wenn der gewählte Host in `acceptedHosts` liegt;
- `none`: jedes Auto-Accept ist falsch;
- `ambiguous`: jedes Auto-Accept ist zu aggressiv und damit falsch für das Automationsziel;
- `review` ist für `ambiguous` die gewünschte sichere Entscheidung.

Damit misst die Precision nicht nur Domain-Ähnlichkeit, sondern die tatsächlich beabsichtigte automatische Entscheidung.

## Ausgabe

Public/adressfrei:

- `artifacts/website-discovery-poc/report.json`
- `artifacts/website-discovery-poc/report.md`

Private Providerdetails:

- `build-private/website-discovery-private.json`

Der öffentliche Report enthält Domains, Scores und Entscheidungen, aber keine E-Mail-Adressen oder Search-API-Secrets.

## Zielmetriken

- `groundTruthOfficial`
- `groundTruthNone`
- `groundTruthAmbiguous`
- `autoAccepted`
- `autoAcceptedCorrect`
- `autoAcceptedWrong`
- Auto-Accept Precision
- `reviewRequired`
- `noAutomaticCandidate`

Das zentrale Gate ist Precision. Vor dem Vollrollout soll die bekannte Fehlzuordnungsrate der automatisch akzeptierten Domains unter 1 % liegen. Bei 25 Fällen bedeutet das praktisch: **kein einziger falscher Auto-Accept im PoC**.

## Ablauf

1. Vollständigen Registry-Lauf ausführen.
2. `npm run poc:discover:prepare` erzeugt die 25er-Stichprobe.
3. Ground Truth manuell erfassen/prüfen.
4. `BRAVE_SEARCH_API_KEY` lokal oder als CI-Secret setzen.
5. PoC ausführen:

```text
DISCOVERY_GROUND_TRUTH=scripts/discovery-ground-truth.poc.json npm run poc:discover
```

6. False Positives und Review-Fälle analysieren.
7. Thresholds/Scoring nur anhand der Ground Truth schärfen.
8. Erst anschließend die Regeln für den 100er-Pilot einfrieren.
