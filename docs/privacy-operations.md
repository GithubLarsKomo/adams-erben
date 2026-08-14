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

## Release-Prüfung

Vor jedem Production-Release:

- [ ] `PREVIEW_MODE` ist nicht `1`.
- [ ] Betreiberangaben sind vollständig.
- [ ] `DRV_DATA_USAGE_APPROVED=1` ist nur gesetzt, wenn die dokumentierte Freigabe tatsächlich vorliegt.
- [ ] `HOSTING_LOG_RETENTION` entspricht der realen Infrastruktur.
- [ ] `SMTP_LOG_RETENTION` entspricht dem realen SMTP-Anbieter.
- [ ] Alle auf der Seite gerenderten Fotos/Medien haben im Rechtekataster keinen Status `review-required`.
- [ ] Alle gerenderten Fremdlogos sind in `legal/asset-rights.json` als `approved` dokumentiert.
- [ ] `npm run test:risk-contact` ist erfolgreich.
- [ ] `npm run build` ist erfolgreich.
- [ ] Der erzeugte Build enthält keine externen Runtime-Assets und keine `onerror`-Handler.
- [ ] GeoNames / CC BY 4.0 ist sichtbar im Footer vorhanden.
- [ ] Rechtstexte entsprechen den gesetzten Produktionswerten.

## Laufender Betrieb

Bei jeder Änderung an Hosting, SMTP, Reverse Proxy, Kontaktformular, externen Medien, Logos oder Datenquellen müssen Datenschutztext und diese Betriebsdokumentation gemeinsam geprüft werden.

Berichtigungs- oder Suppressionswünsche zu Vereinskontakten haben Vorrang vor automatisierter Wiederaufnahme. Suppressionskennungen werden ausschließlich als HMAC-SHA-256-Identifier geführt; Klartextadressen gehören nicht in Suppressionslisten oder öffentliche Reports.
