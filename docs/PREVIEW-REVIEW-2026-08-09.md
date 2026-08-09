# Preview-Review – 2026-08-09

Umgesetzt nach UX-/Legal-/Preview-Review:

- Preview-Kontaktfluss ist lokal im Browser demonstrierbar; kein HTTP-/SMTP-Versand.
- Seed auf 15 Einträge erweitert; zusätzliche Vereine sind ausdrücklich als fiktive Demo-Einträge markiert.
- LRV Schleswig-Holstein routet im Demo-Datensatz auf `lrv` statt irreführend auf `drv`.
- Preview-Banner und Datenstatus benennen Demo-Daten ausdrücklich.
- Preview-Datenschutz erklärt, dass Formulareingaben den Browser beim Demo-Submit nicht verlassen.
- Impressum zeigt keine `.invalid`-Platzhalter mehr; fehlende Betreiberangaben bleiben als Go-live-Gate sichtbar.
- Abschnitt „So kommst du ins Boot“ ergänzt.
- Suchfeld-Autocomplete korrigiert und Dialog mit `aria-labelledby` verbunden.
- Externe Links werden clientseitig auf HTTP/HTTPS-Schemata begrenzt.
- Open-Graph-Basismetadaten und `noindex,nofollow` für Preview ergänzt.
- CI-Invarianten für Demo-Datensatz, Routing und lokalen Demo-Submit ergänzt.

## Vor Weitergabe an externe Stakeholder

Die Preview ist funktional als Prototyp geeignet. Vor einer aktiven externen Bewerbung müssen die Betreiberangaben (`SITE_OPERATOR_*`) in Coolify vollständig gesetzt werden.
