# Governance für Vereins- und Kontaktdaten

Stand: 2026-08-14  
Branch: `risk-protection`

## Zweck

Dieses Dokument beschreibt den operativen Umgang mit Organisations- und Kontaktdaten für die Vereinssuche und die direkte Kontaktvermittlung. Es ergänzt die technische Contact-Governance im Repository und die Datenschutzerklärung.

## 1. Datenklassen

### Reine Organisationsdaten

Beispiele:

- Vereins-/Verbandsname;
- Anschrift, Ort, Postleitzahl, Bundesland;
- Website;
- offizielles DRV-Profil;
- Verbandszuordnung;
- für die Entfernungssuche erforderliche Koordinaten.

Diese Daten dürfen im Browser-Datensatz nur im für Vereinssuche und Orientierung erforderlichen Umfang enthalten sein.

### Kontakt-/Routingdaten

E-Mail-Adressen werden ausschließlich serverseitig verarbeitet. Sie gehören nicht in `dist/data` oder andere öffentlich abrufbare Sammeldaten.

Bevorzugt werden Funktionsadressen auf der Organisationsdomain, insbesondere `info@`, `kontakt@`, `geschaeftsstelle@` oder vergleichbare neutrale Postfächer.

Personalisierte Adressen sowie nicht hinreichend belegte Rollenadressen werden nicht automatisch freigegeben.

## 2. Erhebung und Nachweis

Für einen Routingkontakt müssen mindestens nachvollziehbar sein:

- Organisation;
- Quelle/URL;
- Zeitpunkt der Erhebung oder letzten Verifikation;
- Kontaktadresse;
- Einordnung als Funktions-, Rollen- oder persönliche Adresse;
- Domainbezug zur Organisation;
- Governance-Entscheidung;
- Lebenszyklus-/Aktualitätsstatus.

Automatisch ermittelte Daten ohne ausreichenden Nachweis bleiben von der produktiven Kontaktvermittlung ausgeschlossen.

## 3. Zweck und Nutzung

Routingkontakte werden ausschließlich verwendet, um eine vom Nutzer ausdrücklich ausgewählte Organisation direkt zu kontaktieren.

Es gibt keinen automatischen Ersatzempfänger auf Ebene eines Landesruderverbandes oder des DRV, wenn die ausgewählte Organisation keinen freigegebenen direkten Kontakt besitzt.

## 4. Persönliche und rollenbezogene Adressen

Personalisierte Adressen wie `vorname.nachname@...` werden nicht automatisch freigegeben.

Rollenadressen mit möglichem Personenbezug, etwa `vorstand@...` oder `trainer@...`, benötigen eine erhöhte Prüfung. Entscheidend sind Organisationsbezug, Zweckbindung und nachvollziehbare Veröffentlichung als Kontakt für die betreffende Funktion.

Die technische Governance muss den Zustand `auto-approved-functional` als Voraussetzung für eine vollautomatische Aufnahme beibehalten. Abweichungen benötigen eine dokumentierte manuelle Entscheidung.

## 5. Aktualität

Kontakte werden nach der im Code definierten Lebenszykluslogik regelmäßig als aktuell, prüfbedürftig oder nicht mehr produktiv verwendbar eingestuft.

Eine neue automatische Erhebung darf einen bereits dokumentierten Suppressionswunsch nicht überschreiben.

## 6. Berichtigung, Löschung und Suppression

Anfragen von Organisationen oder betroffenen Personen werden nach folgendem Ablauf bearbeitet:

1. Eingang und betroffene Organisation/Adresse identifizieren.
2. Gewünschte Maßnahme dokumentieren: Berichtigung, Entfernung oder dauerhafte Nichtwiederaufnahme.
3. Öffentliche Organisationsdaten bei nachgewiesener Unrichtigkeit korrigieren.
4. Routingkontakt unverzüglich deaktivieren, wenn seine Verwendung beanstandet wird und keine gegenteilige belastbare Entscheidung vorliegt.
5. Bei gewünschter Nichtwiederaufnahme einen Suppressions-Identifier erzeugen.
6. Suppression hat Vorrang vor späteren Crawling-/Discovery-Ergebnissen.
7. Abschluss und Datum der Maßnahme dokumentieren.

Suppressionskennungen werden als HMAC-SHA-256-Identifier mit einem ausschließlich serverseitigen Schlüssel geführt. Klartext-E-Mail-Adressen gehören nicht in öffentliche Reports oder Suppressionsdateien.

## 7. Informationspflichten / Art.-14-Prüfung

Soweit eine Kontaktadresse einer natürlichen Person zugeordnet werden kann, wird im Rahmen der Freigabeentscheidung geprüft und dokumentiert:

- konkrete öffentliche Quelle;
- Verarbeitungszweck;
- vorgesehene Empfängerkategorien;
- Speicherdauer bzw. Aktualitätslogik;
- Möglichkeit von Berichtigung, Löschung, Widerspruch und Suppression;
- ob und in welcher Form eine Information der betroffenen Person erforderlich ist bzw. welche dokumentierte Ausnahmebegründung angewendet wird.

Eine bloße öffentliche Auffindbarkeit der Adresse ersetzt diese Prüfung nicht.

## 8. Release- und Änderungsprüfung

Bei Änderungen an Contact-Discovery, Klassifikation oder Snapshot-Build müssen mindestens ausgeführt werden:

- `npm run test:risk-contact`
- `npm run test:snapshot`
- die CI-Prüfung auf E-Mail-Adressen in `dist/data`
- die Prüfung, dass `recipients.json` ausschließlich außerhalb des öffentlichen Webroots liegt.

Änderungen, die persönliche Kontakte automatisch freigeben würden, sind nicht zulässig.
