# SPEC — Karl-Adam-/Ratzeburg-Kooperationsbranch

Status: Konzept / lokal zu bewerten  
Branch: `feat/karl-adam-local-cooperation`  
Basis: `feat/mvp-wayfinder`  
Stand: 2026-08-10

## 1. Ziel

`adams-erben.de` bleibt primär eine unabhängige, nicht-kommerzielle Kontaktbrücke vom Kinofilm **„Adams Acht“** in den realen Rudersport. Der lokale Ratzeburg-/Karl-Adam-Kontext soll die Seite inhaltlich vertiefen, ohne daraus eine zweite Karl-Adam-Biografie oder Konkurrenz zu `karladam.de` zu machen.

Leitidee:

> **Der Film endet im Kino. Adams Erbe lebt im Bootshaus weiter.**

Die historische Vertiefung verweist gezielt auf `karladam.de`, die Karl-Adam-Biografie, Ausstellung, DRV-Quellen und weitere belastbare Quellen. `adams-erben.de` beantwortet vor allem die Anschlussfrage: **Was lebt davon heute weiter — und wie komme ich selbst ins Boot?**

## 2. Nicht-Ziele

- keine vollständige Karl-Adam-Biografie duplizieren;
- keine Konkurrenzseite zu `karladam.de` oder `dergoldachter.de`;
- keine unlizenzierte Übernahme historischer Fotos, Filmstills, Logos oder Buchinhalte;
- keine Verharmlosung oder Heroisierung der NS-Vergangenheit;
- keine Monetarisierung über Buch-/Partnerlinks;
- keine Verschlechterung der bestehenden Vereinssuche oder des Kontakt-Routings;
- kein Deploy dieses Branches in Preview/Production vor lokaler Freigabe.

## 3. Informationsarchitektur

Empfohlene Reihenfolge auf der Startseite:

1. Hero / Leitmotiv
2. Ratzeburger Ruderclub als besonderer Ort
3. Kern-CTA: deutschlandweit Verein finden
4. Stimmen: „Adams Erben heute“
5. Adams Labor: prä-Adam → Adam → heute
6. Ratzeburg erleben: Ruderführung
7. Karl Adam vertiefen: Biografie, Ausstellung, `karladam.de`, kritische historische Einordnung
8. Rudersport ermöglichen: Karl-Adam-Stiftung + weitere Förderwege
9. Vereinssuche / Kontaktvermittlung erneut als Abschluss-CTA
10. Unabhängigkeit / Datenschutz / Quellen

Die Suche muss sowohl früh auf der Seite als auch nach den redaktionellen Inhalten erreichbar bleiben.

---

## 4. Hero

### 4.1 Headline

**Der Film endet im Kino.  
Adams Erbe lebt im Bootshaus weiter.**

### 4.2 Lead

Kurzer Übergang von Film und Geschichte zum lebendigen Rudersport. Keine Aussage, die eine offizielle Partnerschaft mit Film, DRV, RRC, Stadt, Karl-Adam-Stiftung oder `karladam.de` suggeriert, solange diese nicht ausdrücklich vereinbart ist.

### 4.3 Primärer CTA

`Ruderverein finden`

Sekundäre Links können zum Film und zur historischen Vertiefung führen.

---

## 5. Ratzeburger Ruderclub e.V.

Der RRC bleibt visuell hervorgehobener Verein und lokaler Ankerpunkt der Geschichte.

### 5.1 Inhalte

- Name: **Ratzeburger Ruderclub e.V.**
- kurze Einordnung als zentraler historischer Ort des Karl-Adam-/Deutschlandachter-Kontexts;
- heutiges Foto des RRC/Bootshauses;
- optional historisches Foto aus der Karl-Adam-Zeit, vorzugsweise von/über Dirk Andresen bereitgestellt;
- Clublogo: vorzugsweise Clubfahne oder Vintage-Logo mit Stadtwappen;
- Bild-/Logo-Credits sichtbar oder im Mediennachweis;
- Alt-Texte für alle inhaltlichen Bilder.

### 5.2 Aktionen

Drei gleichwertig verständliche Aktionen:

1. `Kontakt aufnehmen` — bestehender Adams-Erben-Kontaktweg;
2. `RRC-Website` — `https://www.rrc-online.de/`;
3. `DRV-Profil` — offizielles DRV-Profil.

### 5.3 Rechte-Gate

Historische Fotos und Logo erst nach dokumentierter Nutzungsfreigabe integrieren. Bis dahin neutrale Platzhalter/ungebrandete Darstellung.

---

## 6. Stimmen — „Adams Erben heute“

Ziel: Karl Adams Wirkung nicht abstrakt erklären, sondern durch sechs Menschen verschiedener Generationen in die Gegenwart übersetzen. Die Personen sollen idealerweise ca. 16 bis 84 Jahre abdecken und unterschiedliche Perspektiven auf Leistungs-, Breiten-, Jugend- und Mastersrudern zeigen.

### 6.1 Darstellungsform

- sechs Portrait-/Zitatkarten oder Sprechblasen;
- jeweils Name, Alter, optional Verein/Rolle nach Zustimmung;
- ein starkes Originalzitat pro Person;
- auf Mobilgeräten gut lesbar, kein Auto-Karussell;
- bis echte Zitate vorliegen: klar als **Platzhalter** gekennzeichnete Dummy-Texte, niemals fingierte Aussagen realer Personen.

### 6.2 Sechs geschärfte Interviewfragen

Die Fragen sollen kurze, persönliche und zitierfähige Antworten provozieren und nicht wie ein Fragebogen über Trainingslehre wirken.

1. **Welche Idee von Karl Adam ist für dich heute noch überraschend modern — und warum?**
2. **Acht Menschen, ein Boot: Was muss passieren, damit aus starken Einzelnen wirklich eine Mannschaft wird?**
3. **Was würdest du jemandem sagen, der nach „Adams Acht“ zum ersten Mal überlegt, Rudern auszuprobieren?**
4. **Was hat dich das Rudern über Vertrauen, Verantwortung oder Zusammenarbeit außerhalb des Bootes gelehrt?**
5. **Was bringt dich an einem Tag aufs Wasser, an dem Motivation allein nicht reicht?**
6. **Wenn du eine Sache aus dem Rudern an die nächste Generation weitergeben könntest: Welche wäre es?**

Redaktionell gilt: Nicht jede Person muss dieselbe Frage beantworten. Die sechs veröffentlichten Zitate sollen zusammen ein Mosaik ergeben, keine sechs Varianten derselben Aussage.

### 6.3 Platzhalterstruktur

Bis Interviews vorliegen:

- `Stimme 1 — 16 Jahre — Jugendrudern — Platzhalter`
- `Stimme 2 — ca. 20–30 Jahre — Leistungs-/Hochschulrudern — Platzhalter`
- `Stimme 3 — ca. 30–45 Jahre — Vereins-/Mannschaftsperspektive — Platzhalter`
- `Stimme 4 — ca. 45–60 Jahre — Trainer-/Breitensportperspektive — Platzhalter`
- `Stimme 5 — ca. 60–75 Jahre — langjährige Vereinserfahrung — Platzhalter`
- `Stimme 6 — ca. 84 Jahre — Zeit-/Generationenperspektive — Platzhalter`

---

## 7. Adams Labor — Innovation sichtbar machen

### 7.1 Ziel

Keine bloße Liste von „Erfindungen“, sondern eine visuelle Entwicklung:

**Vor Adam → Adams Intervention → Heute**

Jede Station muss unterscheiden zwischen:

- historisch belegtem Zustand vor/zu Adams Zeit;
- Adams eigenem Beitrag bzw. seiner Rolle bei Verbreitung/Weiterentwicklung;
- heutiger Trainings-/Technikpraxis.

Keine pauschalen „Adam erfand X“-Aussagen ohne belastbaren Beleg.

### 7.2 Kandidaten für Module

1. **Trainingssteuerung / Intervallprinzipien**  
   Vor Adam: stärker erfahrungs-/dauerorientierte Trainingspraxis.  
   Adam: systematische Belastungs-/Erholungssteuerung, quantitative Betrachtung.  
   Heute: periodisierte Trainingsplanung, Leistungsdiagnostik, individuelle Belastungssteuerung.

2. **Krafttraining**  
   Vor Adam: im Rudern keineswegs selbstverständlich bzw. teils skeptisch gesehen.  
   Adam: gezieltere Einbindung von Kraftarbeit.  
   Heute: strukturierter Bestandteil von Leistungs- und Präventionstraining.

3. **Riemen, Blattform und Hebel**  
   Vor Adam: konventionelle Blatt-/Hebelkonzepte.  
   Adam: experimenteller Umgang mit Geometrie, Hebeln und „Schaufel“-Blättern.  
   Heute: moderne Big-Blade-/Materialkonzepte und biomechanische Optimierung.

4. **Rhythmus, Schlagzahl und Messbarkeit**  
   Vor Adam: stärker trainer-/erfahrungsbasierte Beurteilung.  
   Adam: Mathematik/Physik, Stoppuhr, systematische Analyse.  
   Heute: Telemetrie, Ergometerdaten, GPS, Sensorik, Video- und Datenanalyse.

5. **Der mündige Athlet / Team als System**  
   Adam: Athleten sollten verstehen, diskutieren und Verantwortung übernehmen.  
   Heute: Athletenzentrierung, Feedback, gemeinsame Renn-/Trainingsmodelle.

### 7.3 UX

Desktop: drei Spalten oder horizontale Timeline.  
Mobile: vertikale Sequenz je Innovation.  
Jedes Modul erhält `Quelle(n)`/`Mehr erfahren` statt langer Fußnoten im Fließtext.

---

## 8. Ratzeburg erleben — „Ratzeburg, die Ruderstadt“

Ein eigener Abschnitt verlinkt die bereits bestehende offizielle Themenführung der Stadt statt eine konkurrierende Führung nachzubauen.

### 8.1 Inhalt

- Titel: **Auf Adams Spuren durch Ratzeburg**
- Beschreibung der rund zweistündigen Themenführung;
- Stationen beispielhaft: Karl-Adam-Gedenkstein/RRC, ehemalige Lauenburgische Gelehrtenschule, frühere Turnhalle, historisches Bootshaus, Ruderakademie;
- Link zur offiziellen Stadt-/Tourismus-Seite;
- Kontakt der Tourist-Information;
- nach Rücksprache: **Guido Klossek** als Stadtführer/Ansprechpartner nennen und ggf. Portrait/Zitat integrieren.

### 8.2 Verifizierte Basisquelle

Stadt Ratzeburg, „Ratzeburg, die Ruderstadt“:  
`https://www.ratzeburg.de/index.php?FID=2559.13514.1&ModID=7&object=tx%2C2559.534`

Aktuell veröffentlichter Kontakt der Tourist-Information:  
`tourist-info@ratzeburg.de`, Tel. `04541 80 00 886`.

Dynamische Termine/Preise nicht hart codieren, wenn nicht regelmäßig gepflegt. Besser: „Aktuelle Termine und Preise bei der Stadt Ratzeburg“.

---

## 9. Karl Adam vertiefen — Buch, Ausstellung, karladam.de

### 9.1 Prinzip

`adams-erben.de` liefert einen kompakten Kontext und leitet für die vertiefte Biografie bewusst weiter.

### 9.2 Biografie

Direkter Link auf die Karl-Adam-Biografie von Dirk Andresen/Timo Reinke an einer inhaltlich passenden Stelle, vorzugsweise nach „Adams Labor“ oder der historischen Einordnung.

Hinweis unmittelbar am Link:

> **Hinweis: Dies ist keine bezahlte Werbung. Adams Erben erhält für den Link oder einen Buchkauf keine Vergütung.**

Linkziel:  
`https://www.dergoldachter.de/buecher/karl-adam`

### 9.3 Ausstellung

Link auf die Karl-Adam-Ausstellung / Veranstaltungsseite von Der Goldachter. Später ggf. dauerhafter Archiv-/Ausstellungslink, falls vorhanden.

### 9.4 karladam.de

Sobald `karladam.de` öffentlich und inhaltlich belastbar ist:

- Linklabel z. B. `Karl Adam — Leben, Buch und Filme`;
- keine Spiegelung der dortigen Inhalte;
- optional Gegenseitigkeitslink von `karladam.de` bei „Hier lernen Sie rudern“ zu `adams-erben.de`.

---

## 10. Historische Verantwortung / NS-Vergangenheit

### 10.1 Ziel

Karl Adams sporthistorische Bedeutung und seine NS-Biografie gehören gemeinsam zur Darstellung. Der Abschnitt darf weder als Anklagekasten noch als Fußnote erscheinen, sondern als Einladung zu einer quellenbasierten Auseinandersetzung mit deutscher Nachkriegs- und Sportgeschichte.

Redaktionelle Leitfrage:

> **Wie ging eine erfolgreiche Nachkriegsgeneration mit eigener Verstrickung in die NS-Zeit um — und was können wir aus der späteren Aufarbeitung lernen?**

### 10.2 Gesicherter Mindestkontext

Karl Adam war Mitglied von NSDAP und SA und lehrte an einer Nationalpolitischen Erziehungsanstalt. Der DRV hat seine eigene Verbandsvergangenheit aufgearbeitet, weist aber selbst darauf hin, dass die bisherige Wedemeyer-Studie primär Funktionäre der Jahre 1933–1945 untersucht und Personen, die wie Adam erst nach 1945 Verbandsbedeutung erlangten, nicht systematisch erfasste.

### 10.3 Primär-/Referenzlinks

- DRV 2025: **„Karl-Adam-Preis wird nicht mehr vergeben“**  
  `https://www.rudern.de/news/karl-adam-preis-wird-nicht-mehr-vergeben`
- DRV 2025: **„Karl Adam bleibt Ehrenpreisträger des DRV“**  
  `https://www.rudern.de/news/karl-adam-bleibt-ehrenpreistraeger-des-drv`
- DRV / sporthistorische Publikation (Hutmacher):  
  `https://www.rudern.de/sites/default/files/downloads/news/Veroeffentlichung_Dissertation_Hutmacher.pdf`
- ergänzende kontroverse journalistische Einordnung: Zeit-Artikel zur NS-Vergangenheit von Sportlern / Karl Adam; zusätzlich Rudersport-Berichterstattung zur Einstellung des Karl-Adam-Preises.

### 10.4 Redaktionsregel

Der Abschnitt soll unterschiedliche Ebenen sauber trennen:

1. nachweisbare biografische Fakten;
2. Adams eigene spätere Darstellung bzw. Umgang damit;
3. Rezeption durch Zeitzeugen und Nachkriegssport;
4. heutige Bewertung/DRV-Entscheidungen;
5. offene Forschungsfragen.

Keine psychologischen Motive als Tatsachen darstellen. Für Formulierungen wie „repräsentativ für seine Generation“ nur belastbare historische Literatur oder bewusst als Fragestellung formulieren.

---

## 11. Rudersport ermöglichen — Karl-Adam-Stiftung und weitere Förderung

### 11.1 Kernbotschaft

Rudern lebt nicht nur von großen Namen, sondern von Booten, Stegen, Trainern, Jugendarbeit, Ehrenamt und Menschen, die dies finanzieren. Der Abschnitt soll deshalb von der Karl-Adam-Stiftung in die breitere Förderlandschaft überleiten.

### 11.2 Karl-Adam-Stiftung

Darstellung:

- gemeinnützige Stiftung zur Förderung des Rudersports in Ratzeburg, insbesondere des RRC;
- konkrete historische Förderbeispiele dürfen nur mit Quelle genannt werden;
- möglicher CTA: `Karl-Adam-Stiftung kennenlernen / unterstützen`.

Quellenbasis:

- RRC: `https://www.rrc-online.de/2004/allgemein/karl-adam-stiftung/`
- Beispiel gemeinsame Finanzierung Trainerboot „ROM 60“ durch Karl-Adam-Stiftung, Landesportverband und Spenden:  
  `https://www.rudern.de/news/2016/neues-trainerboot-karl-adam-in-ratzeburg`

### 11.3 Vorsitz / Zitat — VERIFIKATIONS-GATE

Der Nutzer nennt **Prof. em. Dr. Frank T. König** als aktuellen Vorsitzenden und wünscht ein Zitat von ihm. Öffentlich auffindbare ältere Quellen nennen dagegen Holger Knaack als Vorsitzenden und Frank T. König als Vorstandsmitglied. Deshalb vor Veröffentlichung zwingend aktuell verifizieren.

Bis zur Bestätigung:

- kein Amtstitel bei Frank König publizieren;
- Zitatplatzhalter: `[Zitat Stiftung — nach persönlicher Freigabe]`;
- idealerweise schriftliche Freigabe von Wortlaut, Funktion und Namensnennung dokumentieren.

Geeignete Frage für das gewünschte Zitat:

> **Was ermöglicht Förderung im Rudersport, das Mitgliedsbeiträge und Ehrenamt allein nicht leisten können — und warum lohnt es sich gerade heute, darin zu investieren?**

Alternative kürzer:

> **Was kann eine Stiftung bewirken, damit aus Interesse am Rudern echte Teilhabe wird?**

### 11.4 Weitere Förderwege

Nicht als vollständige Förderdatenbank starten. Stattdessen kompakte Orientierung mit externen Links und Hinweis, dass Programme/Voraussetzungen sich ändern.

Kategorien:

- Landessportverbände;
- Kreissportverbände;
- Landes-/kommunale Sportförderung;
- Sportstiftungen;
- Vereins-/Projektförderung;
- lokale Bürger-/Regionalstiftungen;
- Spenden und zweckgebundene Förderpartnerschaften.

Beispiel Schleswig-Holstein:

- LSV SH — Förderung & Zuschüsse: `https://www.lsv-sh.de/foerderung-zuschuesse/`
- Stiftung zur Förderung des Sports in Schleswig-Holstein: `https://www.lsv-sh.de/foerderung-zuschuesse/stiftung`
- Projektmittelförderung Land SH: `https://www.lsv-sh.de/foerderung-zuschuesse/projektmittelfoerderung/projektmittelfoerderung-land-sh`

UX-Titel beispielsweise: **„Rudern braucht Rückenwind“**.

---

## 12. Kontaktvermittlung bleibt Kernfunktion

Alle redaktionellen Erweiterungen sind dem funktionalen Kern nachgeordnet.

### 12.1 Muss unverändert funktionieren

- statische Suche über Vereine, weitere DRV-Mitglieder, LRV und DRV;
- Suche nach Name, Ort, PLZ, Bundesland;
- Kontakt-Dialog aus RRC-Karte und allen geeigneten Vereinseinträgen;
- serverseitig bestimmte Zieladresse;
- Routing: Verein → LRV → DRV;
- keine Empfänger-E-Mail im öffentlichen Datensatz;
- Consent-/Datenschutzlogik;
- Preview-/Production-Modus sauber getrennt;
- Health-/Produktions-Gates bleiben bestehen.

### 12.2 Branch-spezifische Anforderung

Dieser Branch soll **lokal mit voll funktionsfähigem Kontaktformular** testbar sein. Dafür wird neben dem bestehenden rein statischen `php -S`-Pfad ein dokumentierter lokaler Full-Stack-Testpfad benötigt, der die PHP-/SMTP-/Routing-Komponenten verwendet.

Mindestens:

- lokale Container-Ausführung oder äquivalente PHP-Runtime;
- Test-/Sink-SMTP statt realer Zustellung, sofern möglich;
- `build-private/recipients.json` vorhanden;
- RRC-CTA nutzt denselben produktionsnahen Routingpfad wie normale Vereinskontakte;
- E2E-/Smoke-Test prüft Suche → RRC/Club → Dialog → valide Übermittlung → erwartetes serverseitiges Routing;
- keine echten Mails an Vereine während lokaler Entwicklung.

---

## 13. Content-/Datenmodell

Redaktionelle Inhalte nicht unstrukturiert über `index.html` verteilen. Ziel ist ein einfach wartbares statisches Datenmodell, z. B.:

```text
src/content/
  local-ratzeburg.json
  voices.json
  adams-lab.json
  history-links.json
  funding.json
```

oder äquivalente kleine JS-/JSON-Struktur ohne neues Framework.

Jeder externe Inhaltseintrag sollte soweit sinnvoll enthalten:

```json
{
  "title": "...",
  "url": "...",
  "source": "...",
  "checkedAt": "YYYY-MM-DD",
  "kind": "primary|secondary|partner",
  "note": "..."
}
```

Bilder zusätzlich mit `credit`, `license/permission`, `alt` und optional `date`.

---

## 14. Designprinzipien

- bestehende ruhige, marine/helle Gestaltung fortführen;
- Ratzeburg-Inhalte hochwertiger/editorialer, aber nicht museal gestalten;
- historische Fotos und heutige Fotos bewusst gegenüberstellen;
- „Adams Labor“ darf technisch/diagrammatisch wirken;
- Stimmen menschlich und warm, ohne Social-Media-Look;
- keine künstlichen Zitate oder KI-generierten historischen Bilder als dokumentarisches Material;
- Fokusindikatoren, Tastaturbedienung, semantische Überschriften und ausreichende Kontraste erhalten;
- `prefers-reduced-motion` beachten, falls Übergänge ergänzt werden.

---

## 15. Kooperation / Attribution

Solange keine formale Partnerschaft vereinbart ist, neutrale Formulierungen wie:

- „Weiterführend bei Der Goldachter …“
- „Mit freundlicher Genehmigung …“ nur bei tatsächlicher Genehmigung;
- „In Zusammenarbeit mit …“ nur nach expliziter Zustimmung.

Für `karladam.de` ist eine wechselseitige funktionale Verlinkung besonders sinnvoll:

`karladam.de → Hier lernen Sie rudern → adams-erben.de`

`adams-erben.de → Karl Adam vertiefen → karladam.de`

---

## 16. Implementierungsreihenfolge

### Phase A — lokal, ohne Rechteabhängigkeiten

1. Hero-Motto ändern.
2. RRC-Karte um Website-Link und Bild-/Logo-Slots erweitern.
3. Stimmen-Komponente mit sechs klar markierten Platzhaltern.
4. Adams-Labor-Komponente mit sachlich vorsichtigen Draft-Texten.
5. Ruderführungs-Abschnitt mit offiziellem Stadtlink/Kontakt.
6. Vertiefungs-/Historienabschnitt mit Buch-, DRV- und `karladam.de`-Slot.
7. Förderungsabschnitt mit Stiftung und Förderkategorien.
8. Vereinssuche/Kontaktfunktion vollständig erhalten.
9. lokalen Full-Stack-Kontakttest dokumentieren und smoke-testen.

### Phase B — nach Partner-/Rechtefreigaben

1. RRC-Logo auswählen und integrieren.
2. heutiges RRC-Foto integrieren.
3. historisches Dirk-Andresen-Foto integrieren.
4. echte sechs Ruderer interviewen und Platzhalter ersetzen.
5. Guido Klossek nach Rücksprache namentlich/mit Zitat integrieren.
6. Stiftungsvorsitz/Funktion verifizieren und autorisiertes Zitat einbauen.
7. `karladam.de`-Ziel verifizieren und Gegenseitigkeitslink abstimmen.
8. Ausstellung aktualisieren.

### Phase C — redaktionelle Qualität

1. historische Aussagen einzeln belegen;
2. NS-Abschnitt gegen Primär-/Fachquellen prüfen;
3. „Adams Labor“ auf Erfindungs-/Prioritätsbehauptungen prüfen;
4. Bildrechte-/Credits-Audit;
5. Accessibility-/Mobile-/Performance-Audit;
6. finaler Kontakt-Routing-Smoke-Test.

---

## 17. Acceptance Criteria

Der Branch ist lokal abnahmefähig, wenn:

- [ ] Hero verwendet exakt das neue Leitmotiv.
- [ ] RRC hat drei Aktionen: Kontakt, RRC-Website, DRV-Profil.
- [ ] RRC besitzt Slots für heutiges Bild, historisches Bild und Logo mit Rechte-Metadaten.
- [ ] sechs generationenübergreifende Stimmen-Platzhalter sind sichtbar und eindeutig als Platzhalter gekennzeichnet.
- [ ] die sechs Interviewfragen sind redaktionell hinterlegt.
- [ ] „Adams Labor“ zeigt mindestens vier belastbare Vorher→Adam→Heute-Ketten.
- [ ] Ratzeburger Ruderführung ist mit offizieller Quelle und Kontakt eingebaut.
- [ ] Biografie ist direkt verlinkt und als unbezahlter Hinweis gekennzeichnet.
- [ ] Ausstellung und zukünftiges `karladam.de` sind als Vertiefungsziele vorgesehen.
- [ ] ein eigenständiger, ausgewogener Abschnitt zur NS-Vergangenheit/Aufarbeitung ist vorhanden.
- [ ] DRV-Quellen und ergänzende journalistische Kontroverse sind sauber getrennt.
- [ ] Karl-Adam-Stiftung und weitere Förderwege werden dargestellt.
- [ ] Funktion/Vorsitz Frank König bleibt bis Verifikation unveröffentlicht bzw. als TODO markiert.
- [ ] Kontaktvermittlung arbeitet lokal full-stack und nutzt das bestehende sichere serverseitige Routing.
- [ ] keine Empfänger-E-Mail gelangt in öffentliche Artefakte.
- [ ] keine realen Vereinsmails werden durch lokale Tests versandt.
- [ ] keine neuen geschützten Assets werden ohne Freigabe ausgeliefert.
- [ ] kein Preview-/Production-Deploy erfolgt ohne explizite Freigabe.

---

## 18. Offene Entscheidungen / Partner-Inputs

1. Welches RRC-Logo: Clubfahne oder Vintage-Logo mit Stadtwappen?
2. Welches heutige RRC-Foto?
3. Welches historische Foto kann Dirk Andresen freigeben?
4. Welche sechs Personen decken 16–84 Jahre sinnvoll ab?
5. Darf Guido Klossek als Ansprechpartner/Zitatgeber erscheinen?
6. Wer ist aktuell formal Vorsitzender der Karl-Adam-Stiftung und wie lautet die gewünschte Funktionsbezeichnung?
7. Welches autorisierte Stiftungszitat wird verwendet?
8. Welche endgültige URL/Struktur erhält `karladam.de`?
9. Welche Ausstellungseite soll dauerhaft verlinkt werden?
10. Soll die kritische historische Vertiefung nur verlinken oder eine kurze eigene redaktionelle Zusammenfassung enthalten?

## 19. Leitplanke für die Umsetzung

Die redaktionellen Module dürfen die Hauptaufgabe nie verdrängen. Auf jeder längeren inhaltlichen Strecke soll ein natürlicher Weg zurück zur Vereinsfindung bestehen.

**Erfolgskriterium des gesamten Konzepts:** Ein Besucher kommt wegen des Films oder Karl Adam auf die Seite, versteht mehr über Ort, Innovation, Menschen und Ambivalenzen — und kann anschließend tatsächlich einen Ruderverein finden und sicher kontaktieren.
