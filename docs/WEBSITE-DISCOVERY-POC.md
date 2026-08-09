# Website Discovery – PoC B

Stand: 2026-08-09

## Ziel

Für 25 DRV-Organisationen ohne belastbaren Website-Link soll die offizielle Vereinswebsite über einen austauschbaren Search Provider gefunden und gegen manuell gepflegte Ground Truth bewertet werden.

PoC B bewertet **nur die Domain-Discovery**. Kontakt-Crawl und E-Mail-Routing bleiben nachgelagerte Schritte.

## Provider

Default: Brave Search API.

Konfiguration:

```text
SEARCH_PROVIDER=brave
BRAVE_SEARCH_API_KEY=<secret>
```

Der API-Key wird ausschließlich als Secret/Environment Variable verwendet und nicht committed.

Für deterministische Tests steht `SEARCH_PROVIDER=fixture` zur Verfügung.

## Stichprobe erzeugen

Die 25 Fälle werden automatisch aus DRV-Profilen ohne vorhandenen externen Website-Link erzeugt:

```text
npm run poc:discover:prepare
```

Default:

- 25 Vereine;
- mindestens fünf Bundesländer;
- höchstens fünf Vereine je Bundesland;
- nur `club`, keine LRV/Schulen/Hochschulen/etc.;
- Output ausschließlich unter `build-private/website-discovery-input.json`.

Die Stichprobe enthält keine E-Mail-Adressen.

## Input

Private Datei: `build-private/website-discovery-input.json`

```json
{
  "organizations": [
    {
      "organizationId": "12345",
      "drvId": "12345",
      "name": "Beispiel Ruderverein e.V.",
      "postalCode": "12345",
      "city": "Beispielstadt",
      "state": "Beispielland",
      "drvProfileUrl": "https://www.rudern.de/service/vereine/beispiel-ruderverein"
    }
  ]
}
```

## Ground Truth

Private Datei: `build-private/website-discovery-ground-truth.json`

```json
{
  "12345": "https://www.beispiel-ruderverein.de/"
}
```

Ground Truth wird manuell verifiziert. Wenn keine offizielle Website existiert oder sicher feststellbar ist, bleibt der Wert leer.

## Suche

Standardquery:

```text
"<Vereinsname>" <Ort oder PLZ> Rudern
```

Es werden maximal acht Suchtreffer bewertet.

## Scoring

Positive Signale:

- charakteristische Namenstoken;
- Ort;
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

## Ausgabe

Public:

- `artifacts/website-discovery-poc/report.json`
- `artifacts/website-discovery-poc/report.md`

Private:

- `build-private/website-discovery-private.json`

Der öffentliche Report enthält nur Domains/Scores/Entscheidungen, keine E-Mail-Adressen oder Search-API-Secrets.

## Zielmetriken

- `autoAccepted`
- `autoAcceptedCorrect`
- `autoAcceptedWrong`
- Auto-Accept Precision
- `reviewRequired`
- `noAutomaticCandidate`

Das wichtigste Gate ist Precision. Vor dem Vollrollout soll die bekannte Fehlzuordnungsrate der automatisch akzeptierten Domains unter 1 % liegen.

## Ablauf

1. `npm run poc:discover:prepare` erzeugt 25 `website_missing`-Organisationen.
2. Ground Truth manuell erfassen.
3. `BRAVE_SEARCH_API_KEY` lokal oder als CI-Secret setzen.
4. `npm run poc:discover` ausführen.
5. False Positives und Review-Fälle analysieren.
6. Thresholds/Scoring nur anhand der Ground Truth schärfen.
7. Danach mit dem 100er-Pilot kombinieren.
