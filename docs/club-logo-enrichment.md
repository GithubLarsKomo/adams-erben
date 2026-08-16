# Vereins- und Verbandslogos – Node.js-Enrichment

## Ziel

Die aus der DRV-Vereinssuche extrahierten Organisationen werden um lokale Logo-Assets angereichert, sofern eine offizielle Website des Vereins oder Verbands bekannt ist.

Die Website von Adams Erben darf zur Laufzeit **keine Logos von fremden Domains nachladen**. Logo-Erkennung und Download erfolgen ausschließlich build-time bzw. als expliziter Wartungslauf. Das Ergebnis wird lokal unter `src/assets/images/clubs/` gespeichert und über ein versioniertes Manifest mit den Organisationsdaten verknüpft.

## Architektur

### 1. Bestehende Website-Quelle

Die Logo-Suche startet nur für Organisationen mit bereits verifizierter `website`-URL aus der vorhandenen DRV-/Discovery-Pipeline.

Standardmäßig werden die Typen `club`, `lrv` und `drv` verarbeitet. Andere Mitglieder wie Schulen oder Stützpunkte werden nicht automatisch einbezogen.

### 2. Logo-Kandidaten finden

`scripts/lib/logo-discovery.mjs` analysiert die Startseite mit Cheerio und sammelt Kandidaten aus:

- JSON-LD von `Organization`, `SportsOrganization` oder `LocalBusiness` mit `logo`
- `meta[itemprop="logo"]`, `meta[property="og:logo"]`, `meta[name="logo"]`
- `<img>`-Elementen, insbesondere in `header`, `nav` oder Branding-Kontexten
- optional Favicons/Apple-Touch-Icons (`LOGO_SYNC_INCLUDE_ICONS=1`), standardmäßig deaktiviert

Die Kandidaten werden bewertet. Positive Signale sind insbesondere:

- Klassen/IDs wie `logo`, `brand`, `wappen`, `signet`, `custom-logo`
- Dateinamen mit `logo`, `wappen`, `brand`, `signet`
- Header-/Navigationskontext
- Übereinstimmung aussagekräftiger Bestandteile des Organisationsnamens
- brauchbare angegebene Abmessungen
- JSON-LD/Logo-Metadaten

Stark abgewertet werden u. a. Sponsor-, Partner-, Banner-, Social- und Footer-Grafiken.

### 3. Sicherheitsgrenzen

Der Logo-Sync ist ein Web-Crawler und behandelt fremde URLs deshalb defensiv:

- nur HTTP/HTTPS
- keine URLs mit Credentials
- `localhost`, `.local`, private/loopback/link-local IPs werden abgelehnt
- DNS-Ziele werden vor dem Fetch auf private Adressen geprüft
- Logo-Assets müssen auf derselben Site bzw. einer Subdomain der finalen Vereinsseite liegen
- Redirects auf fremde Logo-CDNs werden standardmäßig abgelehnt
- maximale Asset-Größe standardmäßig 2 MiB
- nur PNG, JPEG, WebP, GIF, AVIF und SVG
- SVG wird vor Speicherung bereinigt: keine Scripts, `foreignObject`, Event-Handler oder externen URL-Referenzen

Diese Grenzen sind absichtlich konservativ. Ein nicht gefundenes Logo ist besser als ein falsches oder technisch riskantes Asset.

### 4. Lokale Speicherung und Provenienz

Gefundene Dateien liegen unter:

`src/assets/images/clubs/<organisations-slug>.<ext>`

Das Manifest liegt unter:

`src/data/club-logos.json`

Beispiel:

```json
{
  "version": 1,
  "generatedAt": "2026-08-16T10:00:00.000Z",
  "organizations": {
    "12420": {
      "status": "present",
      "organizationId": "12420",
      "id": "ratzeburger-ruderclub-ev",
      "name": "Ratzeburger Ruderclub e.V.",
      "type": "club",
      "website": "https://www.rrc-online.de/",
      "asset": "/assets/images/clubs/ratzeburger-ruderclub-ev.svg",
      "sourcePage": "https://www.rrc-online.de/",
      "sourceUrl": "https://www.rrc-online.de/.../logo.svg",
      "contentType": "image/svg+xml",
      "score": 180,
      "candidateKind": "img",
      "attemptedAt": "2026-08-16T10:00:00.000Z",
      "discoveredAt": "2026-08-16T10:00:00.000Z"
    }
  }
}
```

`sourcePage` und `sourceUrl` bleiben als Herkunftsnachweis erhalten. Das ist auch für eine spätere Rechteprüfung sinnvoll.

### 5. Merge in `clubs.json`

`scripts/apply-club-logo-manifest.mjs` ergänzt jede Organisation in `dist/data/clubs.json` um:

```json
{
  "logo": "/assets/images/clubs/ratzeburger-ruderclub-ev.svg",
  "logoStatus": "present",
  "logoSourceUrl": "https://.../logo.svg",
  "logoSourcePage": "https://www.rrc-online.de/"
}
```

Ohne freigegebenes/gefundendes Asset werden gesetzt:

```json
{
  "logo": "",
  "logoStatus": "missing"
}
```

Der Merge läuft sowohl nach echtem DRV-Sync als auch beim lokalen Seed-Build. Damit enthält die erzeugte Website keine Remote-Logo-URLs als Bildquellen.

## Kommandos

### Unit-Tests

```bash
npm run test:logos
```

### Kleiner Pilotlauf

Empfohlen vor dem ersten Gesamtlauf:

```bash
LOGO_SYNC_LIMIT=20 npm run logos:sync
```

PowerShell:

```powershell
$env:LOGO_SYNC_LIMIT='20'; npm run logos:sync; Remove-Item Env:LOGO_SYNC_LIMIT
```

### Gesamtlauf

```bash
npm run logos:sync
```

### Manifest erzwingen / neu aufbauen

```bash
LOGO_SYNC_FORCE=1 npm run logos:sync
```

PowerShell:

```powershell
$env:LOGO_SYNC_FORCE='1'; npm run logos:sync; Remove-Item Env:LOGO_SYNC_FORCE
```

### Manifest nur erneut auf vorhandene Build-Daten anwenden

```bash
npm run logos:apply
```

## Konfiguration

| Variable | Default | Bedeutung |
|---|---:|---|
| `LOGO_SYNC_CONCURRENCY` | `3` | parallele Websites, max. 6 |
| `LOGO_SYNC_DELAY_MS` | `300` | Pause je Worker |
| `LOGO_SYNC_LIMIT` | `0` | 0 = alle geeigneten Organisationen |
| `LOGO_SYNC_FORCE` | `0` | vorhandene Cache-Einträge neu prüfen |
| `LOGO_SYNC_RETRY_DAYS` | `30` | negative Ergebnisse erst danach erneut prüfen |
| `LOGO_SYNC_MIN_SCORE` | `70` | Mindestscore für einen Logo-Kandidaten |
| `LOGO_SYNC_MAX_CANDIDATES` | `8` | höchstens geprüfte Kandidaten je Website |
| `LOGO_SYNC_MAX_BYTES` | `2097152` | maximale Logo-Dateigröße |
| `LOGO_SYNC_INCLUDE_ICONS` | `0` | Favicons als schwachen Fallback zulassen |
| `LOGO_SYNC_TYPES` | `club,lrv,drv` | zu verarbeitende Organisationstypen |

## Empfohlener Rollout

1. `npm run test:logos`
2. Pilot über 20–50 Organisationen
3. `artifacts/logo-sync/report.json` manuell prüfen
4. Schwellenwert/Heuristiken anhand False Positives nachschärfen
5. Gesamtlauf
6. Stichprobe der gefundenen Logos und Rechte-/Kennzeichenprüfung
7. erst danach Logo-Darstellung in den Vereinskarten implementieren

## Rechtliche Trennung

Die automatische technische Erkennung eines Logos bedeutet nicht automatisch, dass dessen öffentliche Wiedergabe zulässig ist. Deshalb integriert dieser Branch die Logos zunächst nur in Daten-/Asset-Pipeline und Provenienz; eine UI-Veröffentlichung sollte separat nach Festlegung der rechtlichen Nutzungsgrundlage erfolgen.
