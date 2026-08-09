# Wayfinder – Adams Erben

Stand: 2026-08-09

## Fixierter Ausgangspunkt

Repository: `GithubLarsKomo/adams-erben`

Immutable Ausgangs-SHA: `9ce485cdb5a9cef1bae60184589012c4c613ca9a`

## Bestätigte Fakten

- Der Deutsche Ruderverband (DRV) beschreibt sich mit über 83.000 Mitgliedern in rund 600 Mitgliedsvereinen und stellt eine öffentliche Vereinssuche bereit.
- Die DRV-Vereinssuche liefert Organisationsnamen, Anschriften und stabile DRV-Profile; Detailseiten enthalten je nach Eintrag Website, öffentliche E-Mail-Adresse, Telefon, DRV-ID und Sportangebote.
- Direkte Rückmeldung des DRV vom 09.08.2026: Der DRV kann die benötigten Daten nicht vollständig in gewünschter Form liefern. Insbesondere sind URLs der Vereinswebseiten sowie Ansprechpartner bzw. deren E-Mail-Adressen dort nur teilweise bekannt.
- Damit ist ein vollständiger offizieller CSV/JSON/API-Export mit Website- und Kontaktabdeckung kein realistischer Primärpfad.
- Die öffentliche DRV-Vereinssuche bleibt dennoch die beste Seed-/Verzeichnisquelle für den Organisationsbestand und die jeweils vorhandenen Basisdaten.
- Fehlende Website- und Kontaktinformationen müssen in einem separaten Enrichment-Schritt auf den offiziellen Vereinswebseiten ermittelt werden.
- Der Ratzeburger Ruderclub e.V. besitzt eine öffentliche DRV-Profilseite und wird als hervorgehobener Eintrag benötigt.
- „Adams Acht“ startet laut offizieller Filmseite/filmportal.de am 17.09.2026 in Deutschland.
- Für die Filmkommunikation wird kein Filmplakat, Filmstill, Film-Logo oder anderes geschütztes Asset ohne ausdrückliche Lizenz verwendet.
- Gewünscht ist eine statische, clientseitig durchsuchbare Website; nur der Mailversand benötigt einen kleinen serverseitigen Endpunkt.
- Kontakt-Routing bleibt: öffentliche Vereinsadresse → zuständiger Landesruderverband → DRV.
- Produktionsziel: Hetzner/Coolify und `adams-erben.de`; `preview.adams-erben.de` dient als getrennte Vorschau mit Seed-Daten.

## Architekturentscheidung – zweistufige Datengewinnung

### Layer A – DRV Seed / Registry

Der DRV liefert den Ausgangsbestand der Organisationen:

- DRV-ID bzw. stabile Profilkennung
- Vereins-/Organisationsname
- Anschrift, PLZ, Ort
- Landes-/Verbandszuordnung soweit ermittelbar
- DRV-Profil-URL
- vorhandene externe Vereinswebsite
- vorhandene öffentliche Kontaktangaben

Ein fehlender Website- oder E-Mail-Wert ist **kein Importfehler**, sondern ein Enrichment-Status.

### Layer B – Vereinswebsite-Enrichment

Für Einträge mit fehlenden oder unvollständigen Kontakten:

1. vorhandene DRV-Website-URL validieren;
2. falls keine belastbare URL vorhanden ist: gezielte Websuche mit Vereinsname + Ort/PLZ;
3. Kandidatendomain gegen Vereinsname, Ort, Impressum/Anschrift und weitere Identitätsmerkmale plausibilisieren;
4. nur die bestätigte offizielle Vereinsdomain untersuchen;
5. Startseite und wenige kontaktnahe Seiten prüfen (`Kontakt`, `Impressum`, `Vorstand`, `Ansprechpartner`, funktional äquivalente Seiten);
6. Funktionsadressen bevorzugen;
7. personenbezogene Ansprechpartner/E-Mails gesondert klassifizieren und erst nach INV-6 produktiv als Routingziel zulassen;
8. fehlt weiterhin eine öffentliche Mail-Adresse: LRV → DRV.

## Annahmen

- Die sachliche Nennung des Filmtitels und Links zur offiziellen Filmseite bzw. zum offiziellen Trailer werden nominativ genutzt; eine offizielle Kooperation wird ausdrücklich nicht behauptet.
- Die Kommunikation mit dem DRV dokumentiert, dass der Versuch eines offiziellen Datenwegs erfolgt ist. Ob und in welchem Umfang die Rückmeldung zugleich eine Zustimmung zur Weiterverwendung der öffentlich sichtbaren DRV-Daten darstellt, muss aus der konkreten Kommunikation dokumentiert werden; sie wird nicht automatisch unterstellt.
- Organisationsdaten und Funktionsadressen werden datenschutzrechtlich anders bewertet als personenbezogene Ansprechpartner bzw. personalisierte E-Mail-Adressen.
- Öffentliche E-Mail-Adressen werden nicht in den clientseitigen JSON-Datensatz übernommen, um keine aggregierte Spam-Liste zu erzeugen.
- Das Website-Enrichment erfolgt domain-schonend, mit niedriger Parallelität, Host-basiertem Rate-Limit und ohne Umgehung technischer Schutzmaßnahmen.

## Kritische Unbekannte / Blocker

1. **DRV-Nutzungsbasis:** Die DRV-Nutzungsbedingungen verlangen vor Weiterverwendung eine Rücksprache. Die konkrete DRV-Antwort muss als Projektnachweis abgelegt und hinsichtlich der erlaubten Nutzung des öffentlichen Verzeichnisses eingeordnet werden.
2. **Website-Discovery-Qualität:** Wie zuverlässig lässt sich bei fehlendem DRV-Link die offizielle Vereinsdomain automatisiert identifizieren?
3. **Kontakt-Extraktion:** Welche Abdeckung erreichen wir für Funktionsadressen, ohne aggressive oder flächige Crawls?
4. **Personenbezogene Kontakte:** Welche öffentlich publizierten Ansprechpartner/personalisierten E-Mails dürfen für die nutzerinitiierte Kontaktvermittlung verarbeitet werden und welche Transparenz-/Opt-out-Regeln brauchen wir?
5. **Film-/Markenfreigabe:** Gibt es seitens Produktion/Verleih Vorgaben für die nominative Verwendung von „Adams Acht“ und die Formulierung des Filmbezugs?
6. **Betreiberangaben:** Name/ladungsfähige Anschrift/E-Mail für Impressum und Verantwortlichkeit fehlen noch.
7. **Mail-Infrastruktur:** SMTP-Provider und Absenderdomain/-adresse sind noch nicht festgelegt.
8. **Deployment-Zugang:** Coolify-Projekt/Server und DNS-Ziel für `adams-erben.de` müssen für die Produktivsetzung verfügbar sein.

## Untersuchungen

### INV-1 – DRV als Seed-Verzeichnis

**Frage:** Wie erhalten wir reproduzierbar den vollständigen Organisationsbestand samt stabilen IDs und übergeben unvollständige Website-/Kontaktdaten sauber an das Enrichment?

**Evidenz:** DRV-Vereinssuche, Detailseiten, Rückmeldung DRV, DRV-Nutzungsbedingungen, Parser-/Coverage-Messung.

**Stop-Bedingung:** Ein reproduzierbarer Seed-Import mit stabiler ID-Strategie, Feld-Provenienz und deterministischer Übergabe unvollständiger Einträge an INV-5 ist an einer repräsentativen Stichprobe validiert.

**Nicht-Ziele:** DRV als vollständige Kontaktquelle behandeln; keine massenhafte Veröffentlichung von E-Mail-Adressen; keine Mitglieder-/Personendaten aus nichtöffentlichen Quellen.

**Ausgabe:** DRV-Seed-Schema + Synchronisations-/Parservertrag + Übergabeschema an Website-Enrichment.

### INV-2 – Film-/Brand-Safe Copy

**Frage:** Welche filmbezogenen Bezeichnungen und Verlinkungen können wir verwenden, ohne eine offizielle Partnerschaft zu suggerieren oder geschützte Assets zu übernehmen?

**Evidenz:** offizielle Filmseite, Filmverleih/Produktion, ggf. Rechtefreigabe.

**Stop-Bedingung:** Copy-/Asset-Regeln sind dokumentiert.

**Nicht-Ziele:** Keine Rechtsberatung ersetzen; keine Nutzung von Postern/Stills/Logos ohne Freigabe.

**Ausgabe:** `docs/BRAND-GUIDELINES.md`.

### INV-3 – Kontakt-Routing, Datenschutz, Anti-Abuse

**Frage:** Wie kann das Formular zuverlässig und missbrauchsarm an genau einen whitelisted Empfänger routen?

**Evidenz:** SMTP-Konfiguration, serverseitige Empfängerauflösung, Rate Limits, keine Speicherung, Datenschutzhinweise.

**Stop-Bedingung:** Versand funktioniert gegen Testempfänger, kein frei wählbarer Empfänger möglich, Rate Limit greift.

**Nicht-Ziele:** Kein Newsletter, kein CRM, keine Kontakt-Datenbank.

**Ausgabe:** minimaler `/api/contact`-Endpunkt + Datenschutztext.

### INV-4 – Hetzner/Coolify + Domain

**Frage:** Welcher minimale Deploymentpfad bringt statische Assets + Kontakt-Endpunkt reproduzierbar unter `adams-erben.de` online?

**Evidenz:** Docker-Build, Healthcheck, Coolify-Konfiguration, DNS A/AAAA, TLS, Secrets.

**Stop-Bedingung:** HTTPS-Produktions-URL liefert Healthcheck und Website; Testmail erfolgreich.

**Nicht-Ziele:** Keine neue Plattform, solange vorhandenes Hetzner/Coolify ausreichend ist.

**Ausgabe:** Dockerfile, Deployment-Runbook, Produktionscheckliste.

### INV-5 – Vereinswebseiten finden und Kontakte anreichern

**Frage:** Wie finden wir die offizielle Website eines DRV-Eintrags und extrahieren möglichst schonend eine öffentlich vorgesehene Kontaktadresse?

**Evidenz:** DRV-Website-Link, gezielte Suchergebnisse, Vereins-Impressum/Kontaktseiten, robots.txt, erkennbare Nutzungsbedingungen, Stichproben gegen manuelle Prüfung.

**Crawl-Leitplanken:**

- nur bestätigte Vereinsdomains;
- `robots.txt` und erkennbare Nutzungsbedingungen respektieren;
- niedrige Parallelität und Host-basiertes Rate-Limit;
- nur wenige kontaktnahe Seiten pro Domain;
- kein Login, kein Captcha-/Cloudflare-Bypass, keine technischen Umgehungsversuche;
- keine automatisierte Benutzung fremder Kontaktformulare;
- JavaScript-only/gesperrte/mehrdeutige Fälle → Review-Queue.

**Stop-Bedingung:** Website-Discovery und Kontakt-Extraktion funktionieren an einer repräsentativen Stichprobe mit dokumentierter Coverage/Fehlerquote; unsichere Fälle landen deterministisch in einer Review-Queue.

**Nicht-Ziele:** Kein webweites Crawling, kein Social-Media-Profiling, keine öffentliche E-Mail-Aggregation.

**Ausgabe:** Website-Discovery-Modul + Kontakt-Crawler + Provenienz-/Review-Schema + Coverage-Report.

### INV-6 – Datenschutz/Nutzungsregeln für angereicherte Kontakte

**Frage:** Welche öffentlich publizierten Kontaktinformationen dürfen wir für die nutzerinitiierte Vereinsvermittlung verarbeiten und wie trennen wir Funktionsadressen von personenbezogenen Kontakten?

**Datenklassen:**

- Organisationsdaten
- Funktionsadressen (`info@`, `kontakt@`, `geschaeftsstelle@`, `vorstand@` etc.)
- personenbezogene Ansprechpartner/personalisierte E-Mails

**Evidenz:** öffentliche Vereinsseiten, Datenschutzrecht, Website-Nutzungsbedingungen, Opt-out-/Korrekturfälle.

**Stop-Bedingung:** Dokumentierte Allow-/Deny-Regeln pro Datenklasse, Transparenz-/Opt-out-Prozess und technische Filter sind festgelegt.

**Nicht-Ziele:** Keine Sammlung privater Kontaktdaten, kein Marketingprofiling, keine Weitergabe des Kontaktbestands.

**Ausgabe:** `docs/DATA-GOVERNANCE.md` + technische Filter-/Löschregeln.

## Datenmodell / Provenienz

Jeder angereicherte Datensatz soll mindestens tragen:

- `organizationId` / DRV-ID
- `name`
- `postalCode`, `city`, `state`
- `drvProfileUrl`
- `officialWebsite`
- `contactEmail`
- `contactKind`: `functional | personal | none`
- optional `contactName`, `contactRole`
- `sourceUrl`
- `sourceType`: `drv | club-site | search | manual`
- `discoveryMethod`
- `fetchedAt` / `verifiedAt`
- `confidence`
- `httpStatus`
- Parser-/Extractor-Version
- Reviewstatus / Fehlercode

Damit können wir Felder unabhängig aktualisieren, korrigieren und bei Beschwerden nachvollziehen, woher ein Wert stammt.

## Abhängigkeiten

- INV-1 liefert den Organisationsbestand und die Queue für INV-5.
- INV-5 liefert Website-/Kontaktkandidaten an INV-6 und danach an das Routing aus INV-3.
- INV-6 entscheidet, welche Kontaktklassen produktiv als Routingziel zugelassen werden.
- INV-2 blockiert nicht das neutrale UI, aber filmbezogene Assets/Marketingcopy.
- INV-3 benötigt Betreiber-/Datenschutzangaben und SMTP-Secrets vor Produktion.
- INV-4 benötigt fertigen Container und Secrets; DNS/TLS sind letzter Schritt.

## Sichere Reihenfolge

1. DRV als Seed-/Registry-Layer stabilisieren und Feld-Provenienz ergänzen.
2. Website-Discovery + Kontakt-Enrichment zunächst nur als begrenzten Stichproben-PoC entwickeln.
3. Coverage, Fehlklassifikationen und Review-Quote messen; Discovery-Regeln daraus schärfen.
4. Datenschutz-/Nutzungsregeln für Funktions- versus Personenkontakte festlegen.
5. Erst danach Enrichment auf den Gesamtbestand ausrollen und Routingdaten erzeugen.
6. Kontakt-Endpunkt mit freigegebenen Empfängerklassen testen.
7. Brand-/Legal-Texte finalisieren; Betreiberangaben einsetzen.
8. Container/Coolify/DNS für Produktion freigeben.

## Risiken

- DRV-HTML oder Vereinswebseiten ändern Struktur; deshalb Feld-Provenienz, Parser-Version und Review-Queue.
- Falsche Domainzuordnung führt zu falschem Empfänger; deshalb Multi-Signal-Verifikation und keine automatische Annahme bei Mehrdeutigkeit.
- Personalisierte Vereins-E-Mails können personenbezogene Daten sein; deshalb getrennte Datenklasse und Produktions-Gate über INV-6.
- Öffentliche Kontaktadressen werden durch Aggregation missbrauchbarer; deshalb keine clientseitige E-Mail-Liste und keine Weitergabe des Kontaktbestands.
- Website-Crawling kann Nutzungsbedingungen oder technische Vorgaben verletzen; deshalb robots-/terms-aware, host-schonend und ohne Umgehung von Sperren.
- Kontaktformular kann als Spam-Relay missbraucht werden; deshalb feste Empfängerauflösung, Limits, Honeypot, Origin-Prüfung und Längenlimits.
- Filmbezug kann als offizieller Auftritt missverstanden werden; deshalb eigene Marke „Adams Erben“, prominenter Unabhängigkeits-Hinweis und keine Filmassets ohne Lizenz.
- Unvollständiges Impressum/Datenschutz darf nicht produktiv veröffentlicht werden.

## Nächste ausführbare Aktion

Einen **begrenzten Enrichment-PoC für 25 DRV-Einträge aus mindestens fünf Bundesländern** implementieren: DRV-Seed → Website-Discovery → robots-/terms-aware Kontaktseiten-Crawl → Klassifikation `functional | personal | none` → Provenienz- und Coverage-Report. Keine personenbezogenen Kontakte produktiv routen und noch keinen Vollcrawl starten.