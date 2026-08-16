# Vereins- und Verbandslogos – Node.js-Enrichment V2

## Ziel

Die aus der DRV-Vereinssuche extrahierten Organisationen werden um lokale Logo-Assets angereichert, sofern eine offizielle Website des Vereins oder Verbands bekannt ist.

Die Website von Adams Erben darf zur Laufzeit **keine Logos von fremden Domains nachladen**. Logo-Erkennung und Download erfolgen ausschließlich build-time bzw. als expliziter Wartungslauf. Das Ergebnis wird lokal unter `src/assets/images/clubs/` gespeichert und über ein versioniertes Manifest mit den Organisationsdaten verknüpft.

V2 priorisiert **Precision vor Recall**: Ein Bild wird nur als `present` freigegeben, wenn sowohl der Logo-Charakter als auch die Identität der Organisation ausreichend belegt sind. Unsichere Kandidaten werden als `review` markiert und nicht automatisch in der Website als Logo veröffentlicht.

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

Der **Logo-Score** berücksichtigt insbesondere:

- Klassen/IDs wie `logo`, `brand`, `wappen`, `signet`, `custom-logo`
- Dateinamen mit `logo`, `wappen`, `brand`, `signet`
- Header-/Navigationskontext
- Übereinstimmung mit Organisationsname oder organisationsspezifischen Kürzeln
- brauchbare angegebene Abmessungen
- JSON-LD/Logo-Metadaten

Stark abgewertet oder hart verworfen werden Sponsor-, Partner-, Social-, Hero-, Slider-, Banner-, Galerie- und typische Header-Fotografien.

### 3. Entity-Confidence

V2 bewertet zusätzlich, ob der Kandidat tatsächlich zur gesuchten Organisation gehört. Dafür werden kombiniert:

- `<title>` und erstes `<h1>` der offiziellen Website
- `og:site_name`
- Organisationsnamen aus JSON-LD
- `alt`, `title`, Klassen/IDs und Dateiname des Bildkandidaten
- exakte Namensübereinstimmung
- aussagekräftige Namensbestandteile
- rudersportspezifische Organisationskürzel

Für Kürzel werden u. a. folgende Bausteine berücksichtigt:

- `Ruderclub` → `RC`
- `Ruderverein` → `RV`
- `Rudergesellschaft` → `RG`
- `Rudergemeinschaft` → `RG`
- `Ruderriege` → `RR`
- `Akademischer/Akademische` → `A`

Dadurch werden z. B. `RRC`, `ARC`, `ARCW` oder `ARV` als starke Identitätssignale erkannt, ohne einen generischen Dateinamen `logo.png` allein genügen zu lassen.

Ein normales `<img>` ohne Asset-spezifische Identität wird nicht automatisch akzeptiert, selbst wenn die Website selbst eindeutig zur Organisation gehört. Strukturierte JSON-LD-/Meta-Logos können über die exakte Organisationsidentität der strukturierten Daten stärker belegt werden.

### 4. Entscheidungsstatus

Das Manifest unterscheidet fünf Zustände:

- `present`: Logo und Organisationsidentität ausreichend sicher; lokales Asset vorhanden
- `review`: plausibler Kandidat, aber keine ausreichende Sicherheit für automatische Veröffentlichung
- `missing`: kein Kandidat erfüllt die Anforderungen
- `blocked`: die Vereinswebsite verweigert automatisierten Zugriff, insbesondere HTTP 401/403
- `error`: technischer Fehler, der nicht als Zugriffssperre klassifiziert werden kann

Nur `present` erzeugt eine öffentliche `logo`-URL in `clubs.json`. `review`, `missing`, `blocked` und `error` bleiben ohne Logo-Asset in der Browserdarstellung.

### 5. CMS-CDNs und Sicherheitsgrenzen

Der Logo-Sync ist ein Web-Crawler und behandelt fremde URLs defensiv:

- nur HTTP/HTTPS
- keine URLs mit Credentials
- `localhost`, `.local`, private/loopback/link-local IPs werden abgelehnt
- DNS-Ziele werden vor dem Fetch auf private Adressen geprüft
- same-site Assets bleiben erlaubt
- ausgewählte CMS-CDNs sind nur erlaubt, wenn die **offizielle Vereinsseite das konkrete Asset direkt im HTML referenziert**
- aktuell berücksichtigt: Jimdo, Wix, Squarespace und WordPress.com Asset-Hosts
- beliebige externe Logo-CDNs oder nachträglich konstruierte Fallback-URLs bleiben verboten
- Redirect-Ziele werden erneut validiert
- maximale Asset-Größe standardmäßig 2 MiB
- nur PNG, JPEG, WebP, GIF, AVIF und SVG
- SVG wird vor Speicherung bereinigt: keine Scripts, `foreignObject`, Event-Handler oder externen URL-Referenzen

Damit kann z. B. ein von einer offiziellen Jimdo-Seite direkt eingebundenes Vereinslogo lokalisiert werden, ohne zur Laufzeit einen Remote-Request zu erzeugen oder einen beliebigen externen Logo-Dienst zuzulassen.

### 6. Rejection-Reporting und Provenienz

Für jede geprüfte Organisation schreibt `artifacts/logo-sync/report.json` nicht nur das Endergebnis, sondern auch die betrachteten Kandidaten mit:

- URL
- Kandidatentyp
- Logo-Score
- Entity-Confidence
- `accept`, `review` oder `reject`
- Ablehnungs-/Review-Grund
- Bewertung des Asset-Ursprungs
- Label/Kontext

Typische Gründe sind:

- `below_logo_score`
- `entity_mismatch`
- `entity_match_uncertain`
- `asset_identity_missing`
- `photo_or_banner_context`
- `negative_logo_context`
- `untrusted_asset_origin`
- `high_entity_low_logo_score`

Das macht False-Positive- und False-Negative-Analysen reproduzierbar.

Gefundene Dateien liegen unter:

`src/assets/images/clubs/<organisations-slug>.<ext>`

Das Manifest liegt unter:

`src/data/club-logos.json`

Beispiel V2:

```json
{
  "version": 2,
  "organizations": {
    "12420": {
      "status": "present",
      "organizationId": "12420",
      "name": "Ratzeburger Ruderclub e.V.",
      "website": "https://www.rrc-online.de/",
      "asset": "/assets/images/clubs/ratzeburger-ruderclub-ev.png",
      "sourcePage": "https://www.rrc-online.de/",
      "sourceUrl": "https://www.rrc-online.de/.../logo.png",
      "score": 210,
      "entityConfidence": 0.8,
      "candidateKind": "img",
      "candidates": []
    }
  }
}
```

`sourcePage` und `sourceUrl` bleiben als Herkunftsnachweis erhalten. Das ist auch für eine spätere Rechteprüfung sinnvoll.

### 7. Merge in `clubs.json`

`scripts/apply-club-logo-manifest.mjs` ergänzt jede Organisation um `logo` und `logoStatus`.

Bei `present`:

```json
{
  "logo": "/assets/images/clubs/beispiel.png",
  "logoStatus": "present",
  "logoSourceUrl": "https://.../logo.png",
  "logoSourcePage": "https://verein.example/"
}
```

Bei nicht automatisch freigegebenen Ergebnissen, z. B. `review`:

```json
{
  "logo": "",
  "logoStatus": "review"
}
```

Der Merge läuft sowohl nach echtem DRV-Sync als auch beim lokalen Seed-Build. Damit enthält die erzeugte Website keine Remote-Logo-URLs als Bildquellen.

## Kommandos

### Unit-Tests

```bash
npm run test:logos
```

### Pilotlauf

```bash
LOGO_SYNC_LIMIT=20 LOGO_SYNC_FORCE=1 npm run logos:sync
```

PowerShell:

```powershell
$env:LOGO_SYNC_LIMIT='20'
$env:LOGO_SYNC_FORCE='1'
npm run logos:sync
Remove-Item Env:LOGO_SYNC_LIMIT
Remove-Item Env:LOGO_SYNC_FORCE
```

### Gesamtlauf

```bash
npm run logos:sync
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
| `LOGO_SYNC_RETRY_DAYS` | `30` | nicht-positive Ergebnisse erst danach erneut prüfen |
| `LOGO_SYNC_MIN_SCORE` | `70` | Mindestscore für automatisches Logo-Assessment |
| `LOGO_SYNC_MIN_ENTITY` | `0.55` | Mindest-Entity-Confidence für Auto-Accept |
| `LOGO_SYNC_MAX_CANDIDATES` | `8` | höchstens geprüfte Kandidaten je Website |
| `LOGO_SYNC_MAX_BYTES` | `2097152` | maximale Logo-Dateigröße |
| `LOGO_SYNC_INCLUDE_ICONS` | `0` | Favicons als schwachen Kandidaten zulassen |
| `LOGO_SYNC_TYPES` | `club,lrv,drv` | zu verarbeitende Organisationstypen |

## Regression-Pilot 2026-08-16

Der alias-aware V2-Pilot wurde gegen die ersten 20 Organisationen mit Website aus einem frischen Live-DRV-Sync ausgeführt.

Ergebnis:

- 20 eligible
- 10 `present`
- 4 `review`
- 4 `missing`
- 2 `blocked`
- 0 `error`

Die 10 automatisch akzeptierten Assets wurden visuell stichprobenartig vollständig geprüft und waren Vereinslogos/-marken. Die bekannten V1-Fehlgriffe wurden nicht mehr automatisch akzeptiert:

- ATV Hannover: Riemen-/Headerfoto wird als `photo_or_banner_context` verworfen
- Heidelberg-College-Logo: kein Auto-Accept für die gesuchte Ruderriege

Verbesserter Recall gegenüber der ersten konservativen V2-Fassung:

- Anklamer Ruderklub über direkt referenziertes Jimdo-CDN gefunden
- Berliner Ruder-Club über direkt referenziertes Squarespace-CDN gefunden
- ARC Münster, ARV Kiel, ARV Leipzig und Alt Ruppin wieder sicher erkannt

Bewusst manuell zu prüfen bleiben u. a. schwächere bzw. semantisch nicht vollständig belegte Kandidaten. `review` wird nicht veröffentlicht.

## Empfohlener Rollout

1. `npm run test:logos`
2. Pilot/Regression prüfen
3. Gesamtlauf über alle Organisationen
4. `present` automatisiert übernehmen
5. `review` separat sichten
6. Stichprobe der gefundenen Logos und Rechte-/Kennzeichenprüfung
7. erst danach Logo-Darstellung in den Vereinskarten implementieren

## Rechtliche Trennung

Die automatische technische Erkennung eines Logos bedeutet nicht automatisch, dass dessen öffentliche Wiedergabe zulässig ist. Deshalb integriert dieser Branch die Logos zunächst nur in Daten-/Asset-Pipeline und Provenienz; eine UI-Veröffentlichung sollte separat nach Festlegung der rechtlichen Nutzungsgrundlage erfolgen.
