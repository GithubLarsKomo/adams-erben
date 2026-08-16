# Risk Protection — Release-Status

Stand: 2026-08-14  
Branch: `risk-protection`

## Technisch umgesetzt

- Production-Start blockiert bei unvollständigen Betreiber-, Hosting- oder SMTP-Pflichtangaben.
- Keine automatischen externen Logo-/Medien-Fallbacks.
- Keine Third-Party-Runtime-Assets im generierten HTML erlaubt.
- CSP beschränkt Ressourcen und Browser-Verbindungen auf die eigene Origin.
- Geolocation ist ausschließlich für die eigene Origin erlaubt und wird nur nach Nutzeraktion verwendet.
- Statischer Test blockiert Local Storage, Session Storage, IndexedDB, Cookie-Zugriff, Cache-/Service-Worker-Storage und literal externe Browser-Netzwerkaufrufe.
- `recipients.json` liegt außerhalb des öffentlichen Webroots; CI und Build-Gate blockieren eine Veröffentlichung unter `dist/`.
- Keine E-Mail-Adressen in öffentlichen Vereinsdaten.
- Direkte Kontaktvermittlung ohne automatisches LRV-/DRV-Fallback.
- Persönliche Kontaktdaten werden nicht automatisch freigegeben.
- Rate Limiting speichert keine Klartext-IP und begrenzt die lokale Rate-Limit-Aufbewahrung auf maximal 24 Stunden.
- GeoNames / CC BY 4.0 ist sichtbar attribuiert.
- Öffentliche Seite `Datenquellen und Lizenzen` vorhanden und im generierten Footer verlinkt.
- Fremdlogo-Rechte werden über `legal/asset-rights.json` geprüft.
- Sonstige Medienrechte werden über `legal/media-rights-register.json` geprüft; `review-required` blockiert Production bei tatsächlicher Darstellung.
- DRV-Abruf besitzt einen expliziten Betriebsmodus `disabled` oder `approved`; sicherer Standard ist `disabled`.
- Kontakt-, Privacy- und Rechte-Governance sind in `docs/` dokumentiert.

## Extern/operativ noch zu klären

Diese Punkte können nicht belastbar aus dem Repository erfunden werden und bleiben bis zur realen Klärung Release-Blocker oder dokumentierte Betriebsaufgabe:

1. **Drei Medienfreigaben ausstehend**
   - `deutschlandachter.webp`
   - `faricup.png`
   - `moselpokal.webp`
   - Status bleibt `review-required`, bis eine ausdrückliche Freigabe dokumentiert ist.

2. **DRV-Datennutzungsgrundlage**
   - `DRV_DATA_USAGE_APPROVED=1` und `DRV_SYNC_MODE=approved` dürfen erst nach dokumentierter Freigabe/tragfähiger Nutzungsgrundlage gesetzt werden.

3. **Hosting-/Proxy-/Container-Logfristen**
   - tatsächlichen Wert für `HOSTING_LOG_RETENTION` aus der produktiven Infrastruktur ermitteln und belegen.

4. **SMTP-Betrieb**
   - realen Anbieter, Adresse und `SMTP_LOG_RETENTION` dokumentieren;
   - ggf. AV-Vertrag und Drittlandtransfer in `SMTP_DPA_STATUS` / `SMTP_TRANSFER_NOTE` dokumentieren.

5. **Betreiberangaben**
   - produktive Werte für Impressum/Verantwortlichkeit setzen.

6. **Finaler Laufzeittest**
   - nach Deployment im Browser-Netzwerk-Tab verifizieren: keine Drittanbieterrequests beim Initialaufruf;
   - Cookies/Storage prüfen;
   - Security Header am tatsächlich ausgelieferten HTTPS-Endpunkt prüfen.

7. **HSTS**
   - erst nach stabiler und vollständig verifizierter HTTPS-/Reverse-Proxy-Konfiguration aktivieren.

## Freigaberegel

Ein Production-Release darf nicht dadurch ermöglicht werden, dass ausstehende Rechte-, Provider- oder Speicherfristangaben durch angenommene Standardwerte ersetzt werden. Offene Punkte werden entweder real geklärt oder bleiben als technischer/operativer Blocker bestehen.
