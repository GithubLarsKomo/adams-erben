# Deployment – Hetzner/Coolify + adams-erben.de

## Architektur

- Browser: ausschließlich statisches HTML/CSS/JavaScript und `data/clubs.json`.
- Server: zwei kleine PHP-Endpunkte (`/api/contact.php`, `/api/health.php`) sowie Impressum/Datenschutz, damit rechtliche Betreiberangaben und SMTP-Secrets nicht in den Build müssen.
- Versand: ausschließlich über authentifizierten SMTP-Relay. Kein direkter Mailversand von der Hetzner-IP.
- Empfänger: beim Docker-Build serverseitig aus öffentlichen DRV-Profilen erzeugt und außerhalb des Webroots gespeichert.

## 1. DNS

Für `adams-erben.de` beim DNS-Provider:

- `A @` → öffentliche IPv4 des Hetzner/Coolify-Servers
- optional `AAAA @` → öffentliche IPv6, falls der Server/Proxy IPv6 sauber bedient
- `CNAME www` → `adams-erben.de` oder entsprechende A/AAAA-Einträge

Nach DNS-Propagation vor dem Go-live mit `dig`/`nslookup` prüfen.

## 2. Coolify Resource

1. Neue Application aus `GithubLarsKomo/adams-erben` anlegen.
2. Build Pack: **Dockerfile**.
3. Container Port: `80`.
4. Healthcheck: `/api/health.php`.
5. Domain: `https://adams-erben.de`.
6. Optional `www.adams-erben.de` hinzufügen und auf die kanonische Domain umleiten.
7. TLS/Let's Encrypt durch Coolify aktivieren.

Der Docker-Build führt standardmäßig den vollständigen DRV-Sync aus (`REQUIRE_DRV_SYNC=1`). Wenn weniger als 90 % der entdeckten Profile gelesen werden können, schlägt ein Produktionsbuild absichtlich fehl statt eine deutlich unvollständige Liste auszuliefern.

## 3. Runtime-Secrets / Environment

Aus `.env.example` übernehmen und in Coolify als Runtime-Environment konfigurieren. Insbesondere:

- `PUBLIC_ORIGIN=https://adams-erben.de`
- `SITE_OPERATOR_NAME`
- `SITE_OPERATOR_ADDRESS`
- `SITE_OPERATOR_EMAIL`
- `SITE_RESPONSIBLE_NAME`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- `SMTP_FROM`, idealerweise `no-reply@adams-erben.de`
- `SMTP_PROVIDER_NAME`, `SMTP_PROVIDER_ADDRESS`
- `RATE_LIMIT_SALT` mit mindestens 32 zufälligen Bytes

`SMTP_PASSWORD` und `RATE_LIMIT_SALT` niemals in Git committen.

## 4. Mail-Domain

Für zuverlässige Zustellung an Vereine sollte `adams-erben.de` einen authentifizierten SMTP-Anbieter verwenden und dessen Vorgaben für SPF und DKIM erfüllen. Zusätzlich DMARC mindestens zunächst mit `p=none` zur Beobachtung konfigurieren; nach erfolgreichem Betrieb kann die Policy verschärft werden.

Die E-Mail verwendet:

- `From`: feste Projektadresse aus `SMTP_FROM`
- `Reply-To`: E-Mail-Adresse der anfragenden Person
- fester Betreff-Präfix `[adams-erben.de]`
- sichtbarer Herkunftshinweis im Nachrichtentext
- technische Header `X-Adams-Erben-Origin: contact-form` und `X-Adams-Erben-Route`

Damit wird kein beliebiger Absender gefälscht und der Verein erkennt die Quelle.

## 5. Produktions-Gate

`GET /api/health.php` muss HTTP 200 liefern. HTTP 503 bedeutet bewusst: mindestens eine notwendige Legal-/SMTP-Konfiguration fehlt oder die serverprivate Empfängerliste konnte nicht erzeugt werden.

Vor öffentlicher Freigabe prüfen:

- Suche liefert Größenordnung ~600 DRV-Mitgliedsorganisationen.
- Ratzeburger Ruderclub wird hervorgehoben.
- Suche nach Ort/PLZ/Verein/Bundesland funktioniert mobil und desktop.
- Testanfrage an einen Verein mit eigener Mailadresse kommt an.
- Test eines Eintrags ohne eigene Mailadresse zeigt/funktioniert mit LRV-Fallback.
- DRV-Fallback ist technisch möglich.
- Reply-To antwortet an die anfragende Person.
- Rate Limit blockiert wiederholte Testanfragen.
- Impressum enthält reale Betreiberangaben.
- Datenschutz nennt den tatsächlich verwendeten SMTP-Anbieter.
- Filmplakat/-stills/-logos sind nicht vorhanden, solange keine Rechtefreigabe dokumentiert ist.
- TLS-Zertifikat ist gültig; HTTP wird auf HTTPS umgeleitet.

## 6. Datenaktualisierung

Die Vereinsdaten werden beim Image-Build aus der öffentlichen DRV-Vereinssuche synchronisiert. Für den Launch reicht daher ein frischer Build kurz vor Veröffentlichung. Für den späteren Betrieb empfiehlt sich ein kontrollierter Rebuild etwa monatlich oder nach Rückmeldung des DRV – nicht ein permanenter Crawler.

Vor einer regelmäßigen Vollsynchronisation sollte Issue #1 (Datenquelle/Nutzungsfreigabe) abgeschlossen werden. Ein offizieller Export oder eine Schnittstelle des DRV wäre dem HTML-Scraping vorzuziehen.
