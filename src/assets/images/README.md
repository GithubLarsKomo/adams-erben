# Bilddateien für den Karl-Adam-/Ratzeburg-Bereich

Die Website erkennt die folgenden Dateien automatisch. Fehlt eine Datei, bleibt der bisherige Platzhalter sichtbar.

## Feste Dateinamen

- `rrc-vintage-logo.png` – Clubfahne oder Vintage-Logo des Ratzeburger Ruderclubs; wird mit `object-fit: contain` dargestellt.
- `rrc-heute.jpg` – aktuelles Foto des Ratzeburger Ruderclubs; wird als großflächiges Foto dargestellt.
- `ratzeburg-historisch.jpg` – historisches Motiv für den Vergleich „damals“.
- `ratzeburg-heute.jpg` – aktuelles Motiv für den Vergleich „heute“.

## Verhalten

- Sind beide `ratzeburg-*.jpg` vorhanden, erscheinen sie nebeneinander als Damals-/Heute-Vergleich.
- Ist nur eines der beiden Bilder vorhanden, wird nur dieses Bild angezeigt.
- Sind keine Dateien vorhanden, bleiben die bestehenden Platzhalter unverändert sichtbar.
- Die Dateien werden beim normalen Build automatisch von `src/assets/images/` nach `dist/assets/images/` kopiert.

## Rechte

Nur Bilder einchecken, für die die Nutzung auf `adams-erben.de` geklärt ist. Bei historischen Aufnahmen sollten Quelle, Rechteinhaber und ggf. gewünschte Bildunterschrift zusätzlich dokumentiert werden.
