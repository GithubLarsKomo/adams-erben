# Adams Erben

Unabhängige, nicht-kommerzielle Orientierungshilfe zum Kinostart von **„Adams Acht“**: Besucherinnen und Besucher sollen schnell einen Ruderverein in ihrer Nähe finden und sicher Kontakt aufnehmen können.

> **Hinweis:** Dieses Projekt ist keine offizielle Website des Films, der Filmproduktion, des Filmverleihs oder des Deutschen Ruderverbands. Filmname und externe Links dienen ausschließlich der sachlichen Einordnung. Filmplakate, Filmstills, Logos und sonstige geschützte Assets werden ohne ausdrückliche Lizenz nicht verwendet.

## Zielbild

- statische, schnelle und barrierearme Suche über deutsche Rudervereine, weitere DRV-Mitglieder, Landesruderverbände und den DRV
- hervorgehobener Ratzeburger Ruderclub als zentraler Ort der erzählten Geschichte
- Kontaktformular mit festem Routing: Verein → Landesruderverband → DRV
- keine Veröffentlichung der Kontakt-E-Mail-Adressen im Client-Datensatz
- datensparsamer Betrieb ohne Analytics, Werbetracker, externe Fonts oder eingebetteten YouTube-Player
- Impressum und Datenschutzerklärung als Produktions-Gate
- Deployment auf Hetzner/Coolify unter `adams-erben.de`

## Architektur

Die eigentliche Vereinssuche ist statisch. Beim Build erzeugt `scripts/sync-drv.mjs` aus der öffentlichen DRV-Vereinssuche zwei getrennte Artefakte:

- `dist/data/clubs.json`: öffentliche Suchdaten **ohne E-Mail-Adressen**
- `build-private/recipients.json`: serverseitige Routingdaten mit dem jeweils aufgelösten Empfänger

Der kleine PHP-Endpunkt `/api/contact.php` akzeptiert keine frei wählbare Zieladresse. Er löst den Empfänger ausschließlich aus der serverprivaten Routingdatei auf und versendet über authentifiziertes SMTP. Fehlt eine Vereinsadresse, wird an den zuständigen Landesruderverband und danach an den DRV geroutet.

## Lokale Vorschau

```bash
npm install
SKIP_DRV_SYNC=1 npm run build
php -S 127.0.0.1:8080 -t dist
```

Damit lässt sich die statische Suche mit dem kleinen Seed-Datensatz prüfen. Das Kontaktformular benötigt den Container bzw. die PHP-/SMTP-Konfiguration und ist in dieser einfachen Vorschau nicht aktiv.

## Vollständiger Daten-Build

```bash
npm install
REQUIRE_DRV_SYNC=1 npm run build
```

Der Build bricht bei unzureichender Sync-Abdeckung ab. Öffentliche E-Mail-Adressen werden dabei ausschließlich in `build-private/recipients.json` geschrieben und nicht an den Browser ausgeliefert.

## Container

```bash
docker build -t adams-erben .
```

Für den produktiven Betrieb werden die Variablen aus `.env.example` als Runtime-Secrets gesetzt. `/api/health.php` liefert bewusst HTTP 503, solange Betreiberangaben, SMTP-Konfiguration oder Empfänger-Routing unvollständig sind.

## Projektunterlagen

- `docs/WAYFINDER.md` – Fakten, Unsicherheiten, Untersuchungen und Reihenfolge
- `docs/BRAND-GUIDELINES.md` – konservative Film-/Marken-Leitplanken
- `docs/DEPLOYMENT.md` – Hetzner/Coolify-, DNS-, SMTP- und Go-live-Runbook
- `NOTICE.md` – Datenquellen und Attribution

## Offene Produktions-Gates

1. bevorzugten DRV-Datenbezug bzw. regelmäßige Synchronisation abstimmen
2. Betreiberangaben für Impressum festlegen
3. SMTP-Anbieter, Absenderdomain, SPF/DKIM/DMARC konfigurieren
4. Film-/Asset-Nutzung nur bei weitergehender Verwendung schriftlich klären
5. Coolify-App und DNS für `adams-erben.de` konfigurieren

Siehe Issues #1–#4 für die Wayfinder-Untersuchungen.

<!-- coolify-auto-deploy-check: 2026-08-10 -->
<!-- coolify-auto-deploy-check-2: 2026-08-10 -->
