# Wayfinder – Adams Erben

Stand: 2026-08-09

## Fixierter Ausgangspunkt

Repository: `GithubLarsKomo/adams-erben`

Immutable Ausgangs-SHA: `9ce485cdb5a9cef1bae60184589012c4c613ca9a`

## Bestätigte Fakten

- Der Deutsche Ruderverband (DRV) beschreibt sich mit über 83.000 Mitgliedern in rund 600 Mitgliedsvereinen und stellt eine öffentliche Vereinssuche bereit.
- Die DRV-Vereinssuche liefert Namen und Anschriften der Mitgliedsorganisationen; Detailseiten enthalten je nach Eintrag Website, öffentliche E-Mail-Adresse, Telefon, DRV-ID und Sportangebote.
- Der Ratzeburger Ruderclub e.V. besitzt eine öffentliche DRV-Profilseite und wird als hervorgehobener Eintrag benötigt.
- „Adams Acht“ startet laut offizieller Filmseite/filmportal.de am 17.09.2026 in Deutschland.
- Für die Filmkommunikation wird kein Filmplakat, Filmstill, Film-Logo oder anderes geschütztes Asset ohne ausdrückliche Lizenz verwendet.
- Gewünscht ist eine statische, clientseitig durchsuchbare Website; nur der Mailversand benötigt einen kleinen serverseitigen Endpunkt.
- Kontakt-Routing: öffentliche Vereinsadresse → zuständiger Landesruderverband → DRV.
- Produktionsziel: Hetzner/Coolify und `adams-erben.de`.

## Annahmen

- Die sachliche Nennung des Filmtitels und Links zur offiziellen Filmseite bzw. zum offiziellen Trailer werden nominativ genutzt; eine offizielle Kooperation wird ausdrücklich nicht behauptet.
- Vereinsadressen und Organisationsdaten können für eine nicht-kommerzielle Orientierungshilfe aus öffentlich zugänglichen Quellen synchronisiert werden. Vor automatisierter, regelmäßiger Vollsynchronisation ist die Nutzungs-/Crawling-Frage dennoch zu klären.
- Öffentliche E-Mail-Adressen werden nicht in den clientseitigen JSON-Datensatz übernommen, um keine aggregierte Spam-Liste zu erzeugen.

## Kritische Unbekannte / Blocker

1. **Datenfreigabe:** Darf/soll die vollständige DRV-Vereinssuche regelmäßig automatisiert synchronisiert werden, oder erhalten wir besser einen offiziellen Export/API-Zugang?
2. **Film-/Markenfreigabe:** Gibt es seitens Produktion/Verleih Vorgaben für die nominative Verwendung von „Adams Acht“ und die Formulierung des Filmbezugs?
3. **Betreiberangaben:** Name/ladungsfähige Anschrift/E-Mail für Impressum und Verantwortlichkeit fehlen noch.
4. **Mail-Infrastruktur:** SMTP-Provider und Absenderdomain/-adresse sind noch nicht festgelegt.
5. **Deployment-Zugang:** Coolify-Projekt/Server und DNS-Ziel für `adams-erben.de` müssen für die Produktivsetzung verfügbar sein.

## Untersuchungen

### INV-1 – DRV-Datenquelle

**Frage:** Wie erhalten wir vollständig, reproduzierbar und schonend die deutschen Rudervereine/Landesverbände samt stabilen IDs und öffentlichen Kontakthinweisen?

**Evidenz:** DRV-Vereinssuche, Detailseiten, ggf. offizieller Export/API, Robots-/Nutzungsregeln, Rückmeldung DRV.

**Stop-Bedingung:** Ein belastbarer Datenpfad mit Aktualisierungsrhythmus und stabiler ID ist festgelegt.

**Nicht-Ziele:** Keine massenhafte Veröffentlichung von E-Mail-Adressen; keine Mitglieder-/Personendaten.

**Ausgabe:** Datenvertrag + Synchronisationsskript.

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

## Abhängigkeiten

- INV-1 informiert finalen Datenimport und Kontakt-Routing.
- INV-2 blockiert nicht das neutrale UI, aber filmbezogene Assets/Marketingcopy.
- INV-3 benötigt Betreiber-/Datenschutzangaben und SMTP-Secrets vor Produktion.
- INV-4 benötigt fertigen Container und Secrets; DNS/TLS sind letzter Schritt.

## Sichere Reihenfolge

1. Neutrales statisches MVP + Datenvertrag + RRC-Hervorhebung bauen.
2. DRV-Synchronisation implementieren, aber E-Mails aus Clientdaten ausschließen.
3. Kontakt-Endpunkt mit serverseitigem Recipient-Routing und Anti-Abuse implementieren.
4. Brand-/Legal-Texte finalisieren; Betreiberangaben einsetzen.
5. Container bauen/testen.
6. Coolify deployen, DNS `adams-erben.de` setzen, TLS und Mail testen.

## Risiken

- Datenquelle ändert HTML-Struktur oder untersagt automatisierte Nutzung.
- Öffentliche Kontaktadressen werden durch Aggregation missbrauchbarer – deshalb keine clientseitige E-Mail-Liste.
- Kontaktformular kann als Spam-Relay missbraucht werden – deshalb feste Empfängerauflösung, Limits, Honeypot, Origin-Prüfung und Längenlimits.
- Filmbezug kann als offizieller Auftritt missverstanden werden – deshalb eigene Marke „Adams Erben“, prominenter Unabhängigkeits-Hinweis und keine Filmassets ohne Lizenz.
- Unvollständiges Impressum/Datenschutz darf nicht produktiv veröffentlicht werden.

## Nächste ausführbare Aktion

MVP im Branch `feat/mvp-wayfinder` implementieren: frameworkfreie statische Suche, RRC-Hero, Daten-Sync-Skript, serverseitiges Kontakt-Routing, Legal-/Brand-Templates und Docker/Coolify-Runbook – ohne Produktivdeployment oder geschützte Filmassets.
