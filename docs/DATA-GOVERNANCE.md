# Data Governance – Vereins- und Kontaktdaten

Stand: 10. August 2026

## Zweck

Adams Erben verarbeitet Organisations- und Kontaktdaten ausschließlich, um eine **vom Nutzer initiierte einzelne Kontaktanfrage** an einen passenden Ruderverein zu vermitteln.

Nicht vorgesehen sind:

- Newsletter oder eigene Werbeansprache;
- Verkauf oder Weitergabe eines Kontaktbestands;
- Profilbildung über Funktionsträger;
- automatisiertes Anschreiben von Vereinen ohne Nutzeranfrage;
- öffentliche Bereitstellung einer aggregierten E-Mail-Liste.

Diese technische Governance ersetzt keine abschließende rechtliche Prüfung. Insbesondere Rechtsgrundlage, Transparenzpflichten und die formale DRV-/Quellenfreigabe werden vor Produktivsetzung separat dokumentiert.

## Grundsatz der Datenminimierung

Für die Produktfunktion ist **keine personenbezogene Direktadresse erforderlich**.

Kann kein freigegebener Funktionskontakt eines Vereins verwendet werden, bleibt die Anfrage vollständig funktionsfähig über:

```text
Verein -> zuständiger LRV -> DRV
```

Daraus folgt als Produktionsregel:

> Personalisierte E-Mail-Adressen werden nicht automatisch als Routingziel freigegeben.

Das gilt auch dann, wenn die Adresse öffentlich auf einer Vereinswebsite steht oder eine Vereinsfunktion genannt wird.

## Datenklassen

### 1. Organisationsdaten

Beispiele:

- DRV-ID / stabile Organisations-ID;
- Vereinsname;
- Anschrift, PLZ, Ort, Bundesland;
- DRV-Profil-URL;
- offizielle Vereinswebsite.

Diese Daten dürfen in den öffentlichen Suchdatensatz, soweit sie für die Vereinssuche benötigt werden.

### 2. Funktionskontakt auf Vereinsdomain

Beispiele:

- `info@verein.de`
- `kontakt@verein.de`
- `geschaeftsstelle@verein.de`
- `vorstand@verein.de`

Bei passender Vereinsdomain und fehlendem Drittanbieter-Kontext ist diese Klasse grundsätzlich für Auto-Direct geeignet.

### 3. Explizite Rollenadresse

Beispiele:

- `vorsitzender@...`
- `ruderwart@...`
- `verwaltung@...`
- `presse@...`

Eine Rollenadresse kann technisch bei einem allgemeinen Mailprovider liegen. Sie ist nur dann Auto-Direct-fähig, wenn der lokale Adressteil eindeutig eine Vereinsrolle bezeichnet und kein widersprechender Drittanbieter-Kontext vorliegt.

### 4. Personalisierter Kontakt

Beispiele:

- `vorname.nachname@verein.de`
- `max.mustermann@web.de`
- persönliche Adresse eines namentlich genannten Funktionsträgers.

Produktionsregel:

- niemals automatisch Direct Route;
- nicht erforderlich für den freigegebenen Produktionssnapshot;
- kann im zeitlich begrenzten Review-Artefakt erscheinen, wenn dies zur Qualitätskontrolle nötig ist;
- nach Review verwerfen, sofern keine gesonderte manuelle Freigabe / ausdrückliche Organisationsentscheidung eingeführt wird.

### 5. Drittanbieter / Noise

Beispiele:

- Gastronomie, Catering;
- Hotel / Ferienwohnung;
- Webagentur / Hosting;
- Fotograf, Ticketdienstleister, Eventpartner.

Diese Daten werden ausgeschlossen und nicht als Routingkontakt gespeichert.

## Technische Entscheidungszustände

Ein Kontaktkandidat erhält genau einen Governance-Zustand:

- `auto-approved-functional`
- `review-functional`
- `review-personal`
- `excluded-third-party`
- `suppressed`
- `stale`

Nur `auto-approved-functional` darf ohne manuelle Ausnahme in `recipients.json` als direkte Vereinsroute erscheinen.

Alle anderen Zustände führen für die Anfrage zum nächsten zulässigen Fallback.

## Auto-Approval-Regeln

Auto-Approval ist nur erlaubt, wenn alle folgenden Bedingungen erfüllt sind:

1. öffentlich auf einer offiziellen bzw. hinreichend sicher verifizierten Vereinsquelle gefunden;
2. gültige E-Mail-Syntax;
3. kein Drittanbieter-Kontext;
4. Funktionsadresse auf der Vereinsdomain **oder** eindeutige Rollenadresse;
5. nicht auf Suppression-Liste;
6. letzte erfolgreiche Verifikation nicht stale;
7. `sourceUrl` und `verifiedAt` vorhanden.

Eine personalisierte Adresse erfüllt Punkt 4 ausdrücklich nicht.

## Provenienz

Für jeden Kandidaten, der über einen Crawl hinaus gespeichert wird:

```text
organizationId
contactKind
sourceType
sourceUrl
firstSeenAt
lastSeenAt
verifiedAt
reviewState
reason
```

Für den Produktionssnapshot zusätzlich:

```text
routeLevel
approvedAt
policyVersion
```

Die öffentliche `clubs.json` enthält keine E-Mail-Adressen.

## Aktualität

Default-Rhythmus:

- Registry: ungefähr monatlich;
- Vereinswebsite-Enrichment: ungefähr alle 90 Tage;
- Fehler/404/Redirect-Änderungen priorisiert nachprüfen.

Stale-Regeln:

- nach **180 Tagen** ohne erfolgreiche Verifikation: `stale` / priorisierte erneute Prüfung;
- nach **270 Tagen** ohne erfolgreiche Verifikation darf der Kontakt nicht mehr automatisch Direct Route sein;
- eine einzelne transiente Netzwerkstörung löscht einen zuvor verifizierten Kontakt nicht sofort;
- ist die Quelle dauerhaft entfernt oder widersprüchlich, wird Direct Routing sofort deaktiviert und der Fallback verwendet.

Die Zahlen sind technische Defaultwerte und können nach dem 100er-Pilot angepasst werden.

## Review-Aufbewahrung

- Drittanbieter-Kandidaten: nach Klassifikation nicht weiter speichern.
- Personalisierte Kandidaten: nur so lange wie für die konkrete Qualitätsprüfung erforderlich; Default maximal 30 Tage im privaten Review-Artefakt.
- Freigegebene Funktionskontakte: solange für Routing benötigt und regelmäßig verifiziert.
- öffentliche Reports: nur adressfreie Status-/Qualitätsinformationen.

Rohes HTML von Vereinsseiten wird nicht als dauerhafter Kontaktbestand archiviert.

## Korrektur und Opt-out

Vereine und betroffene Funktionsträger erhalten einen einfachen Korrektur-/Entfernungsweg über die Betreiber-Kontaktadresse im Impressum/Datenschutz.

Mögliche Aktionen:

- Website/Organisation korrigieren;
- Funktionsadresse ersetzen;
- direkten Kontakt vollständig deaktivieren;
- personenbezogenen Kandidaten entfernen;
- erneute automatische Aufnahme einer bestimmten Adresse unterdrücken.

### Suppression

Eine Suppression muss auch nach dem nächsten Crawl wirksam bleiben.

Dafür soll die Produktionspipeline eine private Suppression-Liste unterstützen. Wo die konkrete Adresse nach der Entfernung nicht weiter im Klartext benötigt wird, wird ein HMAC-Identifier verwendet:

```text
HMAC-SHA-256(normalizedEmail, CONTACT_SUPPRESSION_KEY)
```

- Secret niemals committen;
- Suppression-Identifier niemals öffentlich ausgeben;
- Normalisierung: trim + lowercase;
- eine Suppression übersteuert Crawl- und Auto-Approval-Ergebnisse.

Die Suppression bleibt bestehen, bis sie ausdrücklich aufgehoben wird oder das Projekt beendet wird.

## Änderungen und Konflikte

Bei widersprüchlichen Quellen gilt:

1. ausdrücklich vom Verein mitgeteilte Korrektur;
2. aktuelle offizielle Vereinswebsite;
3. aktuelles DRV-Profil;
4. ältere automatisch ermittelte Daten.

Ein Wechsel der Vereinsdomain oder des Empfängers erzeugt bei Unsicherheit Review statt automatischer Übernahme.

## Datenschutzrechtliche Formalspur

Die technische Minimierung ist bewusst strenger als die Frage, was rechtlich möglicherweise zulässig wäre.

Soll für die Verarbeitung personenbezogener öffentlich verfügbarer Kontaktdaten Art. 6 Abs. 1 lit. f DSGVO geprüft werden, sind nach den EDPB-Leitlinien insbesondere drei kumulative Voraussetzungen zu dokumentieren:

1. ein rechtmäßiges, klar bestimmtes, reales und gegenwärtiges berechtigtes Interesse;
2. Erforderlichkeit der konkreten Verarbeitung;
3. Interessenabwägung gegen Rechte und Freiheiten der betroffenen Person.

Gerade Punkt 2 spricht für die vorliegende Produktentscheidung, personalisierte Direktadressen nicht automatisiert zu benötigen, weil ein Funktions-/LRV-/DRV-Fallback verfügbar ist.

Zusätzlich separat zu prüfen/dokumentieren:

- Transparenz-/Informationspflichten bei indirekt erhobenen personenbezogenen Daten;
- Widerspruchsrechte;
- Verantwortlicher und Kontaktweg;
- konkrete Aufbewahrungsfristen;
- formale Quellen-/Nutzungsabsprachen.

Referenzen zur formalen Prüfung:

- EDPB, Guidelines 1/2024 on processing of personal data based on Article 6(1)(f) GDPR.
- EDPB, Summary: Legitimate interest – when and how to apply it.
- DSGVO, insbesondere Art. 5, 6, 14, 17 und 21.

## Go-live Gate

Vor Produktivsetzung müssen mindestens folgende Bedingungen automatisiert oder dokumentiert erfüllt sein:

- keine E-Mail-Adresse in `clubs.json`;
- kein personalisierter Kontakt als automatische Direct Route;
- Direct Route besitzt Provenienz + `verifiedAt` + Policy-Version;
- Stale-/Suppression-Gate wird vor Snapshot-Build angewendet;
- Fallback LRV -> DRV ist für jeden Datensatz deterministisch;
- Korrektur-/Opt-out-Kanal steht in der Datenschutzerklärung;
- rechtliche Formalspur ist dokumentiert.
