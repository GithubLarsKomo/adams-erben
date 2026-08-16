# Bilddateien für den Karl-Adam-/Ratzeburg-Bereich

Die Website erkennt die folgenden Dateien automatisch. Fehlt eine Datei, bleibt der bisherige Platzhalter sichtbar.

## Feste Dateinamen

- `rrc-vintage-logo.png` – Clubfahne oder Vintage-Logo des Ratzeburger Ruderclubs; wird mit `object-fit: contain` dargestellt.
- `rrc-heute.jpg` – aktuelles Foto des Ratzeburger Ruderclubs; wird als großflächiges Foto dargestellt.
- `ratzeburg-historisch.jpg` – historisches Motiv für den Vergleich „damals“.
- `ratzeburg-heute.jpg` – aktuelles Motiv für den Vergleich „heute“.
- `karl-adam-gedenkstein-preview.webp` – **nur Preview**: Karl-Adam-Gedenkstein nahe dem Ratzeburger Ruderclub auf einer Wiese der Stadt Ratzeburg. Das Referenzbild ist nicht für den Produktionsbetrieb freigegeben und muss vor Launch ersetzt werden.
- `karl-adam-gedenkstein-ratzeburg.webp` – vorgesehener Produktions-Dateiname für ein eigenes, freigegebenes Foto des Gedenksteins.

## Fotoauftrag: Karl-Adam-Gedenkstein

Für das endgültige Bild möglichst zwei Aufnahmen erstellen:

1. **Kontextaufnahme im Querformat** (bevorzugt 16:9 oder 3:2): kompletter Gedenkstein mit etwas Wiese und Umgebung, damit der Ort als Station der Ruderführung erkennbar bleibt.
2. **Engere Aufnahme**: Stein und Gedenktafel groß genug, dass Relief und Beschriftung gut erkennbar sind.

Aufnahmehinweise:

- möglichst frontal oder nur leicht seitlich fotografieren; Kamera ungefähr auf Höhe der Gedenktafel;
- gleichmäßiges Licht bevorzugen (bedeckter Himmel oder weiches Morgen-/Abendlicht); harte Spiegelungen auf der Metalltafel vermeiden;
- keine störenden Personen, Fahrzeuge oder erkennbaren Kennzeichen im Bild;
- ausreichend Rand um den Stein lassen, damit Desktop- und Mobile-Zuschnitte möglich sind;
- Originaldatei in voller Auflösung sichern, idealerweise mindestens ca. 3000 px Breite; JPEG/HEIC und optional RAW;
- das Original nicht vorab über Messenger komprimieren.

Zu dokumentieren:

- Fotograf/in;
- Aufnahmedatum;
- Rechteinhaber/in und Freigabe zur Veröffentlichung auf `adams-erben.de`;
- gewünschter Bildcredit, falls einer genannt werden soll;
- Motivbeschreibung: „Karl-Adam-Gedenkstein nahe dem Ratzeburger Ruderclub, Ratzeburg“.

## Verhalten

- Sind beide `ratzeburg-*.jpg` vorhanden, erscheinen sie nebeneinander als Damals-/Heute-Vergleich.
- Ist nur eines der beiden Bilder vorhanden, wird nur dieses Bild angezeigt.
- Sind keine Dateien vorhanden, bleiben die bestehenden Platzhalter unverändert sichtbar.
- Die Dateien werden beim normalen Build automatisch von `src/assets/images/` nach `dist/assets/images/` kopiert.
- Das Gedenkstein-Referenzbild ist ausschließlich für Preview/Entwicklung vorgesehen. Vor Produktion ist es durch `karl-adam-gedenkstein-ratzeburg.webp` zu ersetzen und die Preview-Kennzeichnung zu entfernen.

## Rechte

Nur Bilder einchecken, für die die Nutzung auf `adams-erben.de` geklärt ist. Bei historischen Aufnahmen sollten Quelle, Rechteinhaber und ggf. gewünschte Bildunterschrift zusätzlich dokumentiert werden.
