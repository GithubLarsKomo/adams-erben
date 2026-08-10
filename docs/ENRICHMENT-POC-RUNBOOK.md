# Enrichment PoC – Runbook

## Zweck

Reproduzierbarer 25er-Test der Vereinswebsite-Anreicherung.

## Lokal

```bash
npm install
npm run poc:enrich
```

Optionale Parameter:

```bash
ENRICH_TARGET=25 \
ENRICH_MIN_STATES=5 \
ENRICH_MAX_PER_STATE=5 \
ENRICH_MAX_PROFILE_SCANS=160 \
ENRICH_SITE_CONCURRENCY=2 \
ENRICH_SITE_DELAY_MS=900 \
ENRICH_MAX_SITE_PAGES=5 \
npm run poc:enrich
```

## Ausgabe

Öffentlich/adressfrei:

- `artifacts/enrichment-poc/report.json`
- `artifacts/enrichment-poc/report.md`

Privat, niemals veröffentlichen:

- `build-private/enrichment-poc-contacts.json`

## GitHub Actions

Workflow: `Enrichment PoC`.

Der Workflow kann manuell gestartet werden, sobald die Workflow-Datei auf dem für Actions sichtbaren Branch verfügbar ist. Zusätzlich ist im aktuellen Feature-Branch temporär ein PoC-Job in der normalen CI definiert.

## Abnahmekriterien

- mindestens 25 Vereine;
- mindestens fünf Bundesländer;
- keine E-Mail-Adresse im öffentlichen Report;
- private Kontaktdatei bleibt außerhalb des Artifacts;
- jeder Verein besitzt einen eindeutigen Status;
- Netzwerkfehler einzelner Seiten brechen die Gesamtmessung nicht ab.

## Nach der Ausführung

1. Coverage-Kennzahlen in `docs/ENRICHMENT-POC-OBSERVATIONS.md` ergänzen.
2. Extractor-Regeln anhand der False Positives/Negatives nachschärfen.
3. Entscheiden, ob 5 Seiten je Domain genügen.
4. PoC B für fehlende Website-URLs starten.
