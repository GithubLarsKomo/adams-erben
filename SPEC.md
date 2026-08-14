# SPEC — Risk Protection

Status: Umsetzungsspezifikation  
Branch: `risk-protection`  
Basis: `feat/karl-adam-local-cooperation`  
Stand: 2026-08-14

## 1. Ziel

Dieser Branch reduziert die rechtlichen und datenschutzbezogenen Risiken von `adams-erben.de` vor einer öffentlichen Produktivsetzung.

Die Maßnahmen betreffen insbesondere:

- Anbieterkennzeichnung nach DDG und journalistisch-redaktionelle Verantwortlichkeit nach MStV;
- Datenschutz nach DSGVO und Endgerätezugriffe nach TDDDG;
- automatisierte Nutzung von Vereins- und Verbandsdaten;
- Urheber-, Datenbank-, Marken- und Kennzeichenrechte;
- Nutzung externer Logos, Bilder und Medien;
- GeoNames-Lizenzierung;
- Kontaktformular, SMTP-Versand und Missbrauchsschutz;
- technische Verifikation, dass Rechtstexte und reales Laufzeitverhalten übereinstimmen.

Leitprinzip:

> **Keine rechtliche Aussage auf der Website darf weiter gehen als das technisch und organisatorisch tatsächlich umgesetzte Verhalten.**

## 2. Nicht-Ziele

- keine umfassende anwaltliche Rechtsberatung ersetzen;
- keine Einführung von Tracking, Analytics oder Marketing-Cookies;
- keine Einbettung externer Video-, Karten- oder Social-Media-Widgets;
- keine Erweiterung der Vereinsdaten über den für die Vereinssuche erforderlichen Umfang hinaus;
- keine Veröffentlichung ungeklärter Fotos, Logos oder historischer Medien;
- keine Änderung des Grundsatzes „direkter Kontakt zur ausgewählten Organisation, kein Verbands-Fallback“;
- keine unnötige Verschlechterung der UX durch Consent-Banner, solange technisch keine einwilligungspflichtigen Endgerätezugriffe stattfinden.

---

## 3. Priorisierung

### P0 — vor jeder Produktivsetzung zwingend

1. Remote-Fallbacks für Logos vollständig entfernen.
2. Impressum in Production nur bei vollständiger Betreiberkonfiguration auslieferbar machen.
3. Widerspruch zum Kontakt-Routing in `rechtliche-hinweise.php` beseitigen.
4. Datenschutzerklärung an tatsächliche Rate-Limit-, Hosting-, SMTP- und Empfänger-Verarbeitung anpassen.
5. Nutzung fremder Logos nur bei dokumentierter Rechtebasis erlauben; sonst Textdarstellung.
6. DRV-Datensynchronisation rechtlich absichern oder bis zur Klärung technisch begrenzen.
7. Rechtstexte und Produktions-Build automatisiert auf Widersprüche prüfen.

### P1 — vor öffentlicher Bewerbung

1. GeoNames-Attribution sichtbar auf der Website ergänzen.
2. Asset-Rechtekataster für Fotos, Logos und Medien einführen.
3. personenbezogene Vereinskontakte auf Organisations-/Funktionsadressen beschränken bzw. manuell freigeben.
4. konkrete Speicherfristen für Server-/Proxy-/SMTP-Logs dokumentieren.
5. Datenschutzrechte und Einwilligungswiderruf präzisieren.
6. technische Datenschutzprüfung des Production-Builds durchführen.

### P2 — Governance / laufender Betrieb

1. regelmäßige Rechte- und Datenschutzprüfung bei neuen Assets oder Diensten;
2. dokumentierter Prozess für Berichtigung, Entfernung und Suppression von Vereinskontaktdaten;
3. regelmäßige Überprüfung von externen Links und Quellen;
4. jährliche oder anlassbezogene Aktualisierung der Rechtstexte.

---

## 4. Anbieterkennzeichnung / Impressum

### 4.1 Anforderungen

`legal/impressum.php` MUSS in Production mindestens folgende Angaben vollständig enthalten:

- Name/Firma des Betreibers;
- ladungsfähige Anschrift;
- E-Mail-Adresse;
- bei juristischer Person: Rechtsform und vertretungsberechtigte Person;
- soweit einschlägig: Register und Registernummer;
- soweit einschlägig: Umsatzsteuer-ID/Wirtschafts-ID;
- Verantwortlicher für journalistisch-redaktionelle Inhalte nach § 18 Abs. 2 MStV mit Name und Anschrift.

Die Überschrift soll lauten:

`Angaben gemäß § 5 DDG`

Für redaktionelle Inhalte:

`Verantwortlich für journalistisch-redaktionelle Inhalte gemäß § 18 Abs. 2 MStV`

### 4.2 Deployment-Gate

In Production DARF der Build bzw. Containerstart nicht erfolgreich sein, wenn mindestens eine dieser Variablen fehlt:

- `SITE_OPERATOR_NAME`
- `SITE_OPERATOR_ADDRESS`
- `SITE_OPERATOR_EMAIL`
- `SITE_RESPONSIBLE_NAME`

Ein bloßer Warnhinweis in der ausgelieferten Seite reicht nicht aus.

Preview darf weiterhin Platzhalter verwenden, MUSS aber `noindex,nofollow` setzen.

### 4.3 Unabhängigkeitshinweis

Der vorhandene Hinweis auf die Unabhängigkeit von Film, Produktion, Verleih, DRV, World Rowing, Vereinen und sonstigen Organisationen soll erhalten und sprachlich konsistent verwendet werden.

Er darf keine behauptete Partnerschaft, Empfehlung oder Freigabe suggerieren.

---

## 5. Datenschutz / TDDDG

### 5.1 Grundsatz

Die Website soll weiterhin ohne nicht notwendige Cookies, Analytics, Werbetracker, externe Fonts, externe Karten oder eingebettete Videoplayer funktionieren.

Solange keine Informationen auf dem Endgerät gespeichert oder ausgelesen werden, die eine Einwilligung nach § 25 TDDDG erfordern, soll kein Consent-Banner eingeführt werden.

### 5.2 Technische Wahrheitspflicht

Die Datenschutzerklärung MUSS dem realen Verhalten des Production-Builds entsprechen.

Insbesondere darf die Aussage „externe Anbieter werden erst nach Anklicken eines Links aufgerufen“ nur bestehen bleiben, wenn beim normalen Seitenabruf kein Browserrequest an Drittanbieter ausgelöst wird.

### 5.3 Remote-Assets

Alle Laufzeit-Fallbacks auf Drittserver sind zu entfernen.

Insbesondere unzulässig im Production-Build:

- World-Rowing-Logo von CloudFront nachladen;
- DRV-Logo von `rudern.de` nachladen;
- Schubschlag-Logo von PodcastCMS nachladen;
- beliebige andere `onerror`-, CSS-, JS- oder HTML-Fallbacks auf externe Asset-Hosts.

Regel:

- lokales freigegebenes Asset vorhanden → anzeigen;
- Asset fehlt → neutrale Textdarstellung/Placeholder;
- niemals automatisches Hotlinking.

### 5.4 Externe Medien

YouTube, Sportdeutschland.tv, World Rowing, Podcastseiten und andere Medienplattformen sollen ausschließlich als normale externe Links geöffnet werden.

Kein eingebetteter Player ohne separate erneute Datenschutzprüfung.

---

## 6. Hosting und Serverprotokolle

Die Datenschutzerklärung MUSS nennen:

- Hostinganbieter;
- verarbeitete technische Daten (insbesondere IP-Adresse, Zeitpunkt, Ressource, Browser-/Geräteinformationen, Statuscode);
- Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO;
- Zweck: sicherer und zuverlässiger Betrieb;
- tatsächliche Speicherfrist bzw. nachvollziehbare Kriterien für die Speicherfrist.

Vor Release MUSS die reale Aufbewahrungszeit von mindestens folgenden Komponenten geprüft und dokumentiert werden:

- Reverse Proxy;
- Webserver;
- Container-/Plattformlogs;
- Hostingprovider;
- ggf. SMTP-Logs.

Keine erfundene Standardfrist verwenden.

---

## 7. Kontaktformular

### 7.1 Routing

Grundsatz bleibt unverändert:

> Eine Anfrage wird ausschließlich an den direkten, freigegebenen Kontakt der vom Nutzer ausdrücklich ausgewählten Organisation übermittelt.

Es gibt KEIN automatisches Fallback an Landesruderverband oder DRV.

Wenn kein freigegebener direkter Kontakt vorhanden ist:

- kein Kontaktformular anbieten;
- stattdessen Vereinswebsite bzw. verfügbare Orts-/Adressinformation anzeigen.

### 7.2 Einwilligung

Die Datenschutzerklärung MUSS ergänzen:

- Rechtsgrundlage Art. 6 Abs. 1 lit. a DSGVO;
- Hinweis auf jederzeitigen Widerruf mit Wirkung für die Zukunft;
- Rechtmäßigkeit der bisherigen Verarbeitung bleibt vom Widerruf unberührt;
- nach Übermittlung verarbeitet die ausgewählte Organisation die Nachricht grundsätzlich in eigener Verantwortung.

### 7.3 SMTP

Die Datenschutzerklärung MUSS den eingesetzten SMTP-Dienstleister und dessen Rolle benennen.

Dokumentiert werden müssen:

- Anbieter;
- Sitz/Adresse;
- ggf. Auftragsverarbeitungsvertrag;
- ggf. Drittlandtransfer und Transfermechanismus;
- für die Zustellung verarbeitete Daten;
- Speicher-/Logfristen soweit relevant.

### 7.4 Rate Limiting / Missbrauchsschutz

Der bestehende IP-basierte Schutz ist datenschutzrechtlich transparent zu beschreiben.

Die Datenschutzerklärung soll sinngemäß erklären:

- IP-Adresse wird nicht im Klartext in der Rate-Limit-Datei gespeichert;
- es wird unter Verwendung eines serverseitigen Geheimnisses ein Hashwert gebildet;
- gespeichert werden Hashwert und Zeitpunkte vorheriger Anfragen;
- Zweck: Schutz vor Spam und Missbrauch;
- Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO;
- Speicherdauer derzeit maximal 24 Stunden, sofern Code und Betrieb dies tatsächlich so umsetzen.

### 7.5 Eigene Nachrichtenspeicherung

Wenn die Anwendung keine eigene Nachrichten-Datenbank führt, darf dies weiterhin genannt werden.

Es MUSS aber klargestellt werden, dass:

- SMTP-Systeme technische Zustellungsdaten speichern können;
- der empfangende Verein/Verband die Nachricht nach Erhalt eigenständig weiterverarbeiten und speichern kann.

---

## 8. Vereins- und Verbandsdaten

### 8.1 Organisationsdaten

Öffentliche Tatsachenangaben wie Name, Ort, PLZ, Website, DRV-Profil und Verbandszuordnung sollen auf das für die Vereinssuche erforderliche Maß beschränkt bleiben.

### 8.2 DRV-Datenbestand / Datenbankrecht

Die dauerhafte automatisierte Synchronisation eines wesentlichen Teils des DRV-Vereinsverzeichnisses soll vor öffentlicher Produktivnutzung bevorzugt durch eine dokumentierte Vereinbarung abgesichert werden.

Zielreihenfolge:

1. offizieller Export / API;
2. ausdrücklich abgestimmter automatisierter Abruf;
3. nur wenn 1/2 nicht erreichbar: rechtlich geprüfter, begrenzter Abruf mit dokumentierter Begründung.

Die Abstimmung soll mindestens klären:

- zulässige Datenfelder;
- Aktualisierungsfrequenz;
- Quellenkennzeichnung;
- Nutzung von Funktions-E-Mail-Adressen;
- Logo-/Kennzeichennutzung;
- technische Abrufmodalitäten.

`robots.txt` ist als technische Zugriffsvorgabe zu respektieren, ersetzt aber keine Nutzungs-/Rechteklärung.

### 8.3 Release-Gate für DRV-Sync

Bis eine belastbare Freigabe oder rechtliche Bewertung dokumentiert ist, darf Production nicht stillschweigend davon ausgehen, dass vollständiges Crawling freigegeben ist.

Es soll einen expliziten Betriebsmodus geben, z. B.:

- `DRV_SYNC_MODE=approved`
- `DRV_SYNC_MODE=limited`
- `DRV_SYNC_MODE=disabled`

`approved` darf nur bewusst gesetzt werden.

### 8.4 Quellenhinweis

Auf der Website muss deutlich bleiben:

- Adams Erben ist kein offizielles Angebot des DRV;
- offizielle Angaben bleiben die Angaben des jeweiligen Vereins/Verbands bzw. der offiziellen DRV-Quelle.

---

## 9. Personenbezogene Vereinskontakte

### 9.1 Datenminimierung

Automatisch freigegeben werden sollen bevorzugt reine Organisations-/Funktionsadressen, z. B.:

- `info@...`
- `kontakt@...`
- `geschaeftsstelle@...`
- `rudern@...`

Rollenadressen wie `vorstand@...` oder `trainer@...` benötigen erhöhte Prüfung.

Personalisierte Adressen wie `vorname.nachname@...` dürfen nicht allein aufgrund ihrer öffentlichen Sichtbarkeit automatisch als Routingempfänger freigegeben werden.

### 9.2 Art.-14-Governance

Falls personenbezogene Kontaktdaten aus öffentlichen Quellen verarbeitet werden, MUSS dokumentiert werden:

- Quelle;
- Zeitpunkt der Erhebung/Verifikation;
- Zweck;
- Rechtsgrundlage;
- Speicherdauer;
- Empfängerkategorien;
- Umgang mit Informationspflichten nach Art. 14 DSGVO;
- Berichtigungs-/Lösch-/Widerspruchs-/Suppression-Prozess.

### 9.3 Suppression

Wenn eine Organisation oder betroffene Person die Entfernung bzw. Nichtwiederaufnahme verlangt, soll ein lokaler Suppression-Datensatz diesen Wunsch gegenüber späteren Crawling-Ergebnissen priorisieren.

---

## 10. Logos, Marken und Kennzeichen

### 10.1 Grundsatz

Fremde Logos dürfen nur als lokale Assets verwendet werden, wenn eine belastbare Rechtebasis dokumentiert ist.

Betroffen sind insbesondere:

- Deutscher Ruderverband;
- World Rowing;
- Schubschlag;
- Ratzeburger Ruderclub;
- sonstige Vereine, Verbände, Medien, Stiftungen und Partner.

### 10.2 Fehlende Freigabe

Wenn keine dokumentierte Freigabe vorliegt:

- Logo nicht anzeigen;
- Organisation ausschließlich typografisch nennen;
- Link auf offizielles Angebot zulässig, sofern inhaltlich korrekt und keine besondere Rechtsverletzung erkennbar ist.

### 10.3 Keine Partnerschaft suggerieren

Logo-Kacheln und Texte dürfen nicht den Eindruck erwecken, die betreffende Organisation unterstütze, sponsere oder autorisiere Adams Erben, sofern dies nicht tatsächlich vereinbart ist.

### 10.4 Rechtliche Hinweise anpassen

Die Aussage, fremde Logos würden „ohne gesonderte Freigabe nicht als eigene Gestaltungselemente verwendet“, darf nur bestehen bleiben, wenn der Build diese Regel technisch erzwingt.

---

## 11. Bilder, Fotos und historische Medien

### 11.1 Asset-Rechtekataster

Für jedes nicht rein intern erzeugte Asset soll ein dokumentierter Datensatz vorhanden sein mit mindestens:

- Dateiname;
- Titel/Motiv;
- Urheber/Fotograf;
- Rechteinhaber;
- Quelle;
- Nutzungsgrundlage;
- erlaubte Nutzungsarten;
- Bearbeitung erlaubt ja/nein;
- Namensnennung erforderlich ja/nein;
- erkennbar abgebildete Personen ja/nein;
- Freigabe-/Lizenzbeleg;
- Datum der Prüfung.

Empfohlener Ablageort:

`docs/legal/assets-rights.csv` oder `docs/legal/assets-rights.md`

### 11.2 Build-Gate

Für als „rights-required“ markierte Assets soll der Production-Build nur freigegebene Dateien akzeptieren.

Optionales Metadatenmodell:

- `approved`
- `pending`
- `own-work`
- `licensed`
- `public-domain`
- `remove`

### 11.3 Personenabbildungen

Bei erkennbaren Personen müssen Persönlichkeits-/Bildrechte vor Veröffentlichung geprüft und dokumentiert werden.

Keine Annahme, dass eine öffentlich auffindbare Aufnahme automatisch erneut veröffentlicht werden darf.

### 11.4 Filmassets

Ohne ausdrückliche Freigabe keine:

- Filmstills;
- Filmplakate;
- Trailerdateien;
- Produktionslogos;
- Screenshots aus dem Film.

Der Filmtitel darf weiterhin sachlich beschreibend referenziert werden.

---

## 12. GeoNames

GeoNames-Daten werden unter CC BY 4.0 verwendet.

Die Website soll eine sichtbare Attribution enthalten, z. B. im Bereich `Datenquellen und Lizenzen`:

> Postleitzahl-, Orts- und Geokoordinatendaten: GeoNames, CC BY 4.0. Für Adams Erben wurden ausschließlich die für Ortssuche und Entfernungsberechnung erforderlichen Felder übernommen und technisch aufbereitet.

Zusätzlich:

- Link auf GeoNames;
- Link bzw. Hinweis auf CC BY 4.0;
- Hinweis auf vorgenommene technische Aufbereitung/Änderungen.

Die Attribution darf nicht nur im Repository stehen.

---

## 13. Rechtliche Hinweise

`legal/rechtliche-hinweise.php` ist so anzupassen, dass keine Widersprüche zur Anwendung verbleiben.

### 13.1 Kontaktvermittlung

Die derzeit veraltete Aussage über ein Fallback an LRV/DRV ist zu ersetzen durch:

> Das Kontaktformular wird ausschließlich angeboten, wenn für die vom Nutzer ausgewählte Organisation selbst ein freigegebener direkter Kontakt vorhanden ist. Besteht kein solcher Kontakt, erfolgt keine Weiterleitung an einen Landesruderverband oder den Deutschen Ruderverband. Stattdessen wird – soweit vorhanden – auf die Website der ausgewählten Organisation verwiesen.

### 13.2 Fremdrechte

Die Hinweise sollen unterscheiden zwischen:

- eigenen Inhalten;
- lizenzierten/freigegebenen Fremdinhalten;
- bloßer Namens-/Kennzeichenreferenz;
- extern verlinkten Inhalten.

Keine pauschale Behauptung, die technisch oder redaktionell nicht eingehalten wird.

---

## 14. Datenschutzerklärung

`legal/datenschutz.php` ist mindestens um folgende Punkte zu ergänzen bzw. zu präzisieren:

1. tatsächliche Server-/Proxy-Logfristen;
2. Rate-Limit-Verarbeitung einschließlich 24-h-Frist;
3. Widerruf einer Einwilligung;
4. Rolle des SMTP-Dienstleisters;
5. ggf. Auftragsverarbeitung/Drittlandtransfer;
6. eigenständige Weiterverarbeitung durch den ausgewählten Empfänger nach Zustellung;
7. Umgang mit personenbezogenen Vereinskontakten aus öffentlichen Quellen;
8. sichtbare Abgrenzung zwischen reinen Organisationsdaten und personenbezogenen Kontaktdaten;
9. externe Links nur als Links, solange technisch zutreffend;
10. Stand-Datum aktualisieren.

---

## 15. Datenquellen- und Lizenzseite

Zusätzlich zu Impressum, Datenschutz und Rechtlichen Hinweisen soll eine kompakte Seite oder ein klarer Abschnitt `Datenquellen und Lizenzen` eingeführt werden.

Mindestens aufführen:

- DRV als Quelle von Vereins-/Verbandsinformationen;
- Hinweis auf Unabhängigkeit vom DRV;
- GeoNames + CC BY 4.0;
- ggf. Bild-/Fotocredits;
- ggf. weitere offene Daten/Lizenzen.

Diese Seite ersetzt nicht die Datenschutz- oder Rechteklärung, erhöht aber Transparenz und Lizenzkonformität.

---

## 16. Technische Privacy- und Rights-Gates

Der Build soll automatisierte Prüfungen enthalten.

### 16.1 Externe Requests

Production-Build statisch prüfen auf unerwünschte externe Ressourcen in:

- `<script src>`;
- `<link href>`;
- `<img src>`;
- `srcset`;
- CSS `url(...)`;
- Inline-JavaScript-Fallbacks;
- `fetch()`/XHR-Aufrufe.

Erlaubte externe URLs sollen standardmäßig nur Navigationslinks (`<a href>`) sein.

### 16.2 Rechtstext-Konsistenz

Build- oder Test-Assertions mindestens für:

- kein Verbands-Fallback im Anwendungstext;
- kein Remote-Logo-Fallback;
- vollständige Betreiberangaben in Production;
- Datenschutzerklärung enthält Rate-Limit-Hinweis;
- Datenschutzerklärung enthält Widerrufshinweis;
- GeoNames-Attribution vorhanden;
- Rechtliche Hinweise verweisen nicht auf technisch nicht vorhandene Abläufe.

### 16.3 Cookies / Storage

Production-Test muss bestätigen:

- keine nicht notwendigen Cookies;
- kein unerwartetes `localStorage`;
- kein unerwartetes `sessionStorage`;
- kein IndexedDB-/Service-Worker-Tracking;
- keine Drittanbieterrequests beim initialen Seitenaufruf.

Wenn sich dies ändert, MUSS vor Merge die TDDDG-/Consent-Bewertung erneut erfolgen.

---

## 17. Security-Hardening mit Datenschutzbezug

Zu prüfen bzw. einzuführen:

- Content-Security-Policy bevorzugt `default-src 'self'` und engere Direktiven;
- `Referrer-Policy` datensparsam konfigurieren;
- `X-Content-Type-Options: nosniff`;
- `Permissions-Policy`, insbesondere Geolocation nur im notwendigen Umfang;
- HSTS bei stabiler HTTPS-Produktivumgebung;
- keine sensitiven ENV-Werte in Client/Build-Artefakten;
- `recipients.json` niemals öffentlich ausliefern;
- keine E-Mail-Adressen in clientseitigen Vereinsdaten.

Standortfunktion soll weiterhin browserseitig arbeiten und Koordinaten nicht an externe Geodienste übertragen.

---

## 18. Akzeptanzkriterien

Der Branch ist fachlich abnahmebereit, wenn alle folgenden Bedingungen erfüllt sind:

- [ ] Production-Build scheitert bei unvollständigem Impressum.
- [ ] `impressum.php` enthält DDG-/MStV-konforme Struktur.
- [ ] Keine Remote-Logo-/Bild-Fallbacks existieren.
- [ ] Kein Drittanbieter-Request wird beim normalen Initialaufruf ausgelöst.
- [ ] YouTube und andere Medien bleiben reine Links.
- [ ] `rechtliche-hinweise.php` enthält kein LRV-/DRV-Fallback mehr.
- [ ] `datenschutz.php` beschreibt Rate Limiting und tatsächliche Speicherfrist.
- [ ] `datenschutz.php` enthält Widerrufshinweis zur Einwilligung.
- [ ] SMTP-Anbieter und tatsächliche Datenverarbeitung sind beschrieben.
- [ ] GeoNames-Attribution ist öffentlich sichtbar.
- [ ] DRV-Sync besitzt einen expliziten rechtlichen/Betriebsmodus und läuft nicht stillschweigend „approved“.
- [ ] personenbezogene E-Mail-Adressen werden nicht automatisch freigegeben.
- [ ] Rechtebasis für jedes angezeigte Fremdlogo ist dokumentiert oder das Logo entfernt.
- [ ] Asset-Rechtekataster ist vorhanden.
- [ ] `recipients.json` bleibt serverseitig und nicht öffentlich.
- [ ] Browser-Test bestätigt keine unerwarteten Cookies/Storage-Einträge.
- [ ] Rechtstexte entsprechen dem tatsächlichen Production-Verhalten.

---

## 19. Empfohlene Umsetzungsreihenfolge

1. Build: externe Asset-Fallbacks entfernen.
2. Rechtliche Hinweise: Routing-Widerspruch korrigieren.
3. Impressum: Production-Gate und Struktur härten.
4. Datenschutz: Rate Limit, Widerruf, SMTP, Empfängerrolle, Speicherfristen.
5. DRV-Sync: Betriebsmodus und Rechte-Gate einführen.
6. Logo-/Asset-Rechteinventar erstellen und nicht freigegebene Assets deaktivieren.
7. GeoNames-Attribution auf Website ergänzen.
8. Privacy-/Rights-Tests in Build/CI aufnehmen.
9. Security Header/CSP prüfen und härten.
10. finalen Production-Build gegen Browser-Netzwerkverkehr und Rechtstexte testen.
11. vor öffentlicher Bewerbung gezielte anwaltliche Prüfung der verbleibenden Punkte, insbesondere DRV-Datenbank und Fremdlogos.

---

## 20. Definition of Done

`risk-protection` gilt als abgeschlossen, wenn:

1. alle P0-Punkte umgesetzt sind;
2. alle Akzeptanzkriterien erfüllt oder ausdrücklich dokumentiert ausgenommen sind;
3. keine ungeklärten Drittanbieterrequests mehr bestehen;
4. keine offensichtlichen Widersprüche zwischen Code, UX und Rechtstexten vorhanden sind;
5. verbleibende externe Rechte-/Freigabefragen in einer nachvollziehbaren Liste dokumentiert sind;
6. der Branch einen reproduzierbaren Production-Build erzeugt, der die Datenschutz- und Rechte-Gates besteht.
