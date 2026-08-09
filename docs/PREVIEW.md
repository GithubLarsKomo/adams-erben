# Preview-Deployment – preview.adams-erben.de

Die öffentliche Vorschau ist bewusst von der späteren Produktion getrennt.

## Zweck

`preview.adams-erben.de` dient ausschließlich zur Demonstration von Gestaltung, Suche, Ratzeburg-Hervorhebung und geplantem Kontakt-Routing.

Der Preview-Modus garantiert:

- nur eingecheckte Seed-/Testdaten
- kein automatischer DRV-Vollabruf, selbst wenn Sync-Variablen versehentlich anders gesetzt werden
- sichtbarer Prototyp-Hinweis auf jeder Seite
- Kontaktformular nur als UI-Demo
- serverseitiger `/api/contact.php` blockiert im Preview-Modus jeden Versand mit HTTP 409
- Healthcheck benötigt keine Produktiv-SMTP- oder Impressums-Secrets
- keine öffentlichen E-Mail-Adressen im Browser-Datensatz

## Coolify

Eine zweite Application aus demselben Repository anlegen.

- Repository: `GithubLarsKomo/adams-erben`
- Branch: `feat/mvp-wayfinder` bis zum Merge, danach `main`
- Build Pack: Dockerfile
- Container Port: `80`
- Domain: `https://preview.adams-erben.de`
- Healthcheck: `/api/health.php`

### Build Arguments

```text
PREVIEW_MODE=1
SKIP_DRV_SYNC=1
REQUIRE_DRV_SYNC=0
```

`PREVIEW_MODE=1` erzwingt im Build unabhängig von den anderen beiden Variablen den Seed-Datensatz.

Es werden für die Preview keine SMTP-Zugangsdaten benötigt. Produktive SMTP-Secrets sollten dort ausdrücklich nicht hinterlegt werden.

## DNS

Beim DNS-Provider:

```text
A preview -> <IPv4 des vorhandenen Hetzner/Coolify-Servers>
```

Optional zusätzlich `AAAA preview`, wenn der Server über funktionsfähiges IPv6 veröffentlicht wird.

Coolify übernimmt anschließend TLS/Let's Encrypt für `preview.adams-erben.de`.

## Abnahmetest

Nach Deployment müssen folgende Punkte gelten:

1. `https://preview.adams-erben.de/` liefert HTTP 200.
2. Oberhalb der Seite erscheint deutlich `Prototyp` sowie der Hinweis auf Testdaten und deaktivierten Kontaktversand.
3. Der Ratzeburger Ruderclub ist hervorgehoben.
4. Suche und Filter funktionieren.
5. Kontakt öffnet den Dialog mit dem geplanten Routing, der Senden-Button ist deaktiviert.
6. Ein direkter POST auf `/api/contact.php` liefert HTTP 409 und versendet nichts.
7. `/api/health.php` liefert HTTP 200 mit `mode: preview` und `contactEnabled: false`.
8. Der öffentliche JSON-Datensatz enthält keine E-Mail-Adressen.

## Übergang zur Produktion

`adams-erben.de` bleibt eine getrennte Coolify-Application bzw. ein getrennt konfigurierter Deployment-Modus. Dort wird `PREVIEW_MODE=0` verwendet. Die Produktions-Gates für DRV-Datenfreigabe, Betreiberangaben, SMTP, Datenschutz und Kontakt-Routing bleiben unverändert bestehen.
