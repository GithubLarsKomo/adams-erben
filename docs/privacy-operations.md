# Privacy Operations — Adams Erben

Stand: 2026-08-14  
Branch: `risk-protection`

## Zweck

Dieses Dokument verbindet die Datenschutzerklärung mit dem tatsächlichen Betrieb. Es enthält keine erfundenen Standardfristen: produktive Speicherfristen müssen aus der realen Hosting-, Proxy- und SMTP-Konfiguration übernommen werden.

## Verbindliche Grundsätze

1. Keine Analytics-, Werbe- oder Marketingtracker.
2. Keine externen Fonts, Karten, Videoplayer oder Runtime-Medienassets.
3. Kein Hotlinking und keine Runtime-Fallbacks auf Drittserver.
4. Externe Angebote werden nur über normale Links nach bewusster Nutzeraktion geöffnet.
5. Browser-Datensatz der Vereinssuche enthält keine E-Mail-Adressen.
6. Persönliche E-Mail-Adressen werden niemals automatisch als Routingempfänger freigegeben.
7. Rate-Limit-IP-Daten werden nur als gesalzener Hash gespeichert und spätestens nach 24 Stunden entfernt.
8. Kontaktanfragen werden nicht in einer eigenen Adams-Erben-Nachrichtendatenbank gespeichert.
9. Browserseitige Netzwerkzugriffe der Anwendung sind auf die eigene Origin beschränkt; externe Ziele dürfen nur als normale Navigationslinks vorkommen.
10. Die Anwendung verwendet derzeit kein Local Storage, Session Storage, IndexedDB, Cookie-Tracking, Cache Storage oder Service-Worker-Tracking.
11. Die optionale Standortfunktion nutzt die Browser-Geolocation nur nach Nutzeraktion; die Permissions Policy erlaubt Geolocation ausschließlich für die eigene Origin.
12. `recipients.json` bleibt außerhalb des öffentlichen Webroots und darf niemals unter `dist/` ausgeliefert werden.

## DRV-Betriebsmodus

Der automatisierte DRV-Abruf besitzt einen expliziten Betriebsmodus:

- `DRV_SYNC_MODE=disabled`: sicherer Standard; `SKIP_DRV_SYNC=1` muss gesetzt bleiben und es findet kein automatisierter Abruf statt.
- `DRV_SYNC_MODE=approved`: darf nur nach dokumentierter Daten-Nutzungsfreigabe verwendet werden und erfordert zusätzlich `DRV_DATA_USAGE_APPROVED=1`.

Ein unbekannter Betriebsmodus blockiert den Build. Ein automatisierter Abruf bei `DRV_SYNC_MODE=disabled` blockiert ebenfalls den Build.

## Produktionswerte, die vor Release ermittelt werden müssen

Die folgenden Werte sind Pflichtkonfiguration. Der Containerstart ist blockiert, solange die Werte leer sind:

- `HOSTING_LOG_RETENTION`
  - tatsächliche Frist für Hosting-/Reverse-Proxy-/Webserver-/Containerzugriffslogs;
  - Quelle der Angabe dokumentieren, z. B. Coolify/Traefik/Docker/Hetzner-Konfiguration.
- `SMTP_LOG_RETENTION`
  - tatsächliche Frist des eingesetzten SMTP-Dienstes für Zustellungs-/Techniklogs;
  - Quelle der Angabe dokumentieren.
- `SMTP_PROVIDER_NAME`
- `SMTP_PROVIDER_ADDRESS`

Zusätzlich organisatorisch dokumentieren:

- `SMTP_DPA_STATUS`: Status eines ggf. erforderlichen Auftragsverarbeitungsvertrags;
- `SMTP_TRANSFER_NOTE`: Drittlandtransfer/Transfermechanismus oder „kein Drittlandtransfer“, soweit tatsächlich zutreffend.

## Security Header

Der Apache-Origin setzt mindestens:

- `Content-Security-Policy` mit `default-src 'self'` und `connect-src 'self'`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Permissions-Policy` ohne Kamera/Mikrofon/Payment und mit Geolocation nur für `self`;
- `Cross-Origin-Opener-Policy: same-origin`.

HSTS wird erst aktiviert, wenn die produktive HTTPS-Kette einschließlich Reverse Proxy und Domain dauerhaft verifiziert ist. Es wird nicht allein aufgrund einer Annahme im Repository eingeschaltet.

## Release-Prüfung

Vor jedem Production-Release:

- [ ] `PREVIEW_MODE` ist nicht `1`.
- [ ] Betreiberangaben sind vollständig.
- [ ] `DRV_SYNC_MODE` entspricht dem beabsichtigten Betriebszustand.
- [ ] `DRV_DATA_USAGE_APPROVED=1` ist nur gesetzt, wenn die dokumentierte Freigabe tatsächlich vorliegt.
- [ ] `HOSTING_LOG_RETENTION` entspricht der realen Infrastruktur.
- [ ] `SMTP_LOG_RETENTION` entspricht dem realen SMTP-Anbieter.
- [ ] Alle auf der Seite gerenderten Fotos/Medien haben im Rechtekataster keinen Status `review-required`.
- [ ] Alle gerenderten Fremdlogos sind in `legal/asset-rights.json` als `approved` dokumentiert.
- [ ] `npm run test:risk-contact` ist erfolgreich.
- [ ] `npm run test:privacy-static` ist erfolgreich.
- [ ] `npm run build` ist erfolgreich.
- [ ] Der erzeugte Build enthält keine externen Runtime-Assets und keine `onerror`-Handler.
- [ ] `dist/` enthält keine `recipients.json`.
- [ ] GeoNames / CC BY 4.0 ist sichtbar vorhanden.
- [ ] Die Seite `Datenquellen und Lizenzen` ist aus dem Footer erreichbar.
- [ ] Rechtstexte entsprechen den gesetzten Produktionswerten.
- [ ] Im Browser-Netzwerk-Tab entstehen beim initialen Seitenaufruf keine Drittanbieterrequests.
- [ ] Browser Storage/Cookies bleiben leer, soweit keine ausdrücklich dokumentierte notwendige Funktion dies ändert.

## Laufender Betrieb

Bei jeder Änderung an Hosting, SMTP, Reverse Proxy, Kontaktformular, externen Medien, Logos oder Datenquellen müssen Datenschutztext und diese Betriebsdokumentation gemeinsam geprüft werden.

Berichtigungs- oder Suppressionswünsche zu Vereinskontakten haben Vorrang vor automatisierter Wiederaufnahme. Suppressionskennungen werden ausschließlich als HMAC-SHA-256-Identifier geführt; Klartextadressen gehören nicht in Suppressionslisten oder öffentliche Reports.
