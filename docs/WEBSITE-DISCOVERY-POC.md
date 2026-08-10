# Website Discovery – PoC B

Stand: 2026-08-10

## Ziel

Für **alle aktuell 23 DRV-Vereine ohne belastbaren Website-Link** soll die offizielle Vereinsdomain über einen austauschbaren Search Provider gefunden und gegen manuell verifizierte Ground Truth bewertet werden.

PoC B bewertet nur die Domain-Discovery. Kontakt-Crawl und E-Mail-Routing sind nachgelagerte Schritte.

## Referenz-Registry

Parser: **1.1.5**.

Realer Voll-Lauf:

- 503/503 Registry-Profile technisch geparst = **100 %**;
- 434 Vereine;
- 15/15 LRV;
- 54 sonstige Mitglieder;
- 411 Vereine mit DRV-Weblink;
- **23 Vereine ohne DRV-Weblink**;
- 403 Vereine mit DRV-E-Mailkandidat;
- 250 DRV-Kandidaten erfüllen bereits die zentrale Contact-Governance.

Da weniger als 25 reale Missing-Website-Fälle existieren, verwendet PoC B alle **23**. Der Zielwert 25 ist kein Grund, echte Daten künstlich zu verwerfen oder bereits bekannte Websites erneut zu discovern.

## Provider

Default: Brave Search API.

```text
SEARCH_PROVIDER=brave
BRAVE_SEARCH_API_KEY=<secret>
```

Der API-Key wird ausschließlich als Secret/Environment Variable verwendet und nie committed.

Für deterministische Tests steht `SEARCH_PROVIDER=fixture` zur Verfügung.

## Eingefrorener Testvertrag

```text
scripts/discovery-input.poc.json
scripts/discovery-ground-truth.poc.json
```

Die Dateien müssen exakt dieselben 23 `organizationId` enthalten. `scripts/discover-websites.test.mjs` erzwingt diesen Vertrag.

Input-Basis:

- Parser 1.1.5;
- `availableMissingWebsiteClubs = 23`;
- PLZ + bereinigter Ort/Ortsteil;
- keine E-Mail-Adressen.

## Ground Truth

Aktuelle Verteilung:

- **18 `official`**;
- **5 `none`**;
- **0 `ambiguous`**.

### `official`

Mindestens eine offizielle Domain ist manuell verifiziert. Mehrere gültige Hosts sind zulässig, z. B. Hauptvereinsseite plus offizielle Abteilungswebsite.

```json
{
  "12211": {
    "status": "official",
    "acceptedHosts": ["scdhfk.de", "scdhfk-rudern.de"]
  }
}
```

### `none`

Zum Ground-Truth-Zeitpunkt konnte keine eigenständige offizielle Website verifiziert werden.

```json
{
  "11964": {
    "status": "none",
    "acceptedHosts": []
  }
}
```

Jedes Auto-Accept bei `none` ist ein False Positive. Das ist besonders wichtig für Ruderclub Mülheim 1977: `muelheimer-rg.de` gehört zu einer anderen Mülheimer Ruderorganisation und darf nicht wegen Ort + Ruderbezug übernommen werden.

### `ambiguous`

Das Schema unterstützt weiterhin geteilte/mehrdeutige Webauftritte. Im aktuellen 23er-Satz gibt es keinen solchen Fall. Bei `ambiguous` wäre `review` die gewünschte Entscheidung und Auto-Accept zu aggressiv.

## Suche

Standardquery:

```text
"<Vereinsname>" <PLZ> <Ort/Ortsteil> Rudern
```

PLZ und Ort werden gemeinsam verwendet. Das bleibt auch dann stabil, wenn eine PLZ einen Ortsteil statt des übergeordneten Stadtnamens liefert.

Es werden maximal acht Suchtreffer bewertet.

## Scoring

Positive Signale:

- charakteristische Namenstoken;
- Ort/Ortsteil;
- PLZ;
- Ruderbezug;
- Suchrang als schwaches Signal.

Negative/ausgeschlossene Signale:

- Social Media;
- Wikipedia;
- DRV-Seite selbst;
- Suchmaschinen;
- offensichtliche Vereins-/Branchenverzeichnisse;
- Baukastendomains nur mit leichtem Malus, nicht pauschal ausgeschlossen.

Default Thresholds:

```text
Auto-Accept >= 0.78
Review     >= 0.48
Reject      < 0.48
```

Wenn Top-1 und Top-2 bei einem eigentlich akzeptablen Treffer weniger als 0,12 auseinanderliegen, wird auf `review` zurückgestuft.

## Ground-Truth-Auswertung

`evaluateGroundTruth()` bewertet Auto-Accept konservativ:

- `official`: korrekt nur, wenn der gewählte Host in `acceptedHosts` liegt;
- `none`: jedes Auto-Accept falsch;
- `ambiguous`: jedes Auto-Accept zu aggressiv.

Damit misst die Precision die tatsächlich beabsichtigte automatische Entscheidung, nicht nur Domain-Ähnlichkeit.

## Workflow

`.github/workflows/discovery-poc.yml` führt immer die providerunabhängigen Scoring-/Contract-Tests aus.

Der reale Providerlauf startet nur, wenn das GitHub Actions Repository-Secret `BRAVE_SEARCH_API_KEY` vorhanden ist.

Aktueller Zustand:

- statische/Fixture-Tests: grün;
- Ground-Truth-Vertrag: grün;
- realer Brave-Lauf: **noch nicht ausgeführt, weil das Secret nicht konfiguriert ist**.

## Precision Gate

Für den 23er-PoC gilt:

- Ground Truth bekannt: 23/23;
- erwartete Verteilung: 18 official / 5 none / 0 ambiguous;
- **Auto-Accept-Wrong muss 0 sein**.

Erst danach werden Thresholds für den 100er-Pilot eingefroren.

## Ausgabe

Public/adressfrei:

- `artifacts/website-discovery-poc/report.json`
- `artifacts/website-discovery-poc/report.md`

Private Providerdetails:

- `build-private/website-discovery-private.json`

Der öffentliche Report enthält Domains, Scores und Entscheidungen, aber keine E-Mail-Adressen oder Search-API-Secrets.

## Nächste Aktion

`BRAVE_SEARCH_API_KEY` als GitHub Actions Repository-Secret konfigurieren und `Website Discovery PoC` erneut ausführen.
