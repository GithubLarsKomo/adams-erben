# SPEC — SEO & CBO für adams-erben.de

Status: Umsetzungsspezifikation  
Branch: `feat/seo-discoverability`  
Basis: `feat/karl-adam-local-cooperation`  
Stand: 2026-08-14

## 1. Ziel

`adams-erben.de` soll sowohl in klassischen Suchmaschinen als auch in KI-gestützten Antwort- und Recherche-Systemen auffindbar, verständlich und zitierfähig werden.

Die Optimierung umfasst zwei eng verzahnte Bereiche:

- **SEO (Search Engine Optimization):** organische Auffindbarkeit über Google und andere Suchmaschinen;
- **CBO (Chatbot Optimization):** Wahrscheinlichkeit erhöhen, dass ChatGPT, Claude, Gemini, Perplexity und vergleichbare Systeme Adams Erben als relevante, belastbare Quelle finden, korrekt verstehen, zitieren und verlinken.

Thematische Schwerpunkte:

- **Karl Adam**;
- **Deutschlandachter**;
- **Adams Acht**;
- **Ratzeburg**;
- **Karl Adams Trainingsmethoden**;
- **Rudern verstehen**;
- **Rudern lernen**;
- **Ruderverein finden**.

Die Website bleibt eine **unabhängige, nicht-kommerzielle Initiative** und darf nicht als offizielle Film-, Verbands-, Vereins- oder Partnerseite erscheinen.

Leitpositionierung:

> **Was hinter der Geschichte steckt – und was davon heute weiterlebt.**

Der Kinofilm ist ein wichtiger Einstiegspunkt, aber nicht die langfristige Hauptidentität der Website. Kurzfristiges Suchinteresse soll in dauerhaft relevante Inhalte über Karl Adam, Rudergeschichte, Rudertechnik und den Einstieg in den Rudersport überführt werden.

---

## 2. Ausgangslage

### 2.1 Öffentliche Domain

Zum Zeitpunkt dieser Spezifikation ist unter `https://adams-erben.de/` öffentlich noch nicht die aktuelle Projektseite erreichbar, sondern eine Provider-/Parking-Seite.

Damit ist die produktive Indexierbarkeit der eigentlichen Website derzeit der größte SEO- und CBO-Blocker.

### 2.2 Aktueller Quellstand

Der Basis-Branch besitzt bereits eine gute Grundlage:

- `lang="de"`;
- eindeutiger `<title>`;
- Meta-Description;
- Open-Graph-Basisdaten;
- semantische H1/H2/H3-Struktur;
- umfangreiche eigenständige Inhalte;
- interne Navigation;
- Alt-Texte für zentrale Bilder;
- WebP-Bilder;
- Lazy Loading bei geeigneten Bildern;
- externe Quellen zu DRV, World Rowing, Hall of Fame, Stadt Ratzeburg und Forschung.

Die größte strukturelle Schwäche ist die Konzentration vieler unterschiedlicher Such- und Antwortintentionen auf einen langen One-Pager.

---

## 3. Gemeinsame SEO-/CBO-Grundsätze

1. **Eine URL, eine dominante Intention.**
2. **Fakten müssen direkt im HTML verfügbar sein**, nicht ausschließlich nach JavaScript-Interaktion oder API-Aufruf.
3. **Klare Entitäten statt Keyword-Stuffing.** Personen, Orte, Institutionen, Ereignisse und Begriffe werden eindeutig benannt.
4. **Quellen sichtbar und nah an der Aussage.**
5. **Fakten und Einordnung trennen.** Historische Tatsachen dürfen nicht mit Interpretation vermischt werden.
6. **Kurze zitierfähige Antworten plus vertiefender Kontext.**
7. **Keine erfundenen Experten, Zitate oder Partnerbeziehungen.**
8. **Aktualität transparent machen.** Veröffentlichungs- und Aktualisierungsdaten nur verwenden, wenn sie tatsächlich gepflegt werden.
9. **Historische Verantwortung bleibt vollständig erhalten.** SEO- oder CBO-Kürzungen dürfen problematische Aspekte nicht ausblenden.
10. **Menschen zuerst.** Inhalte werden nicht als maschinenoptimierte Textwände geschrieben.

---

## 4. Priorisierung

### P0 — vor bzw. unmittelbar mit Veröffentlichung

- echte Website unter der Hauptdomain ausliefern;
- kanonische Domain festlegen;
- Redirects für alternative Host-/Protokollvarianten;
- neue Informationsarchitektur vorbereiten;
- zentrale Seiten `Karl Adam`, `Adams Acht`, `Deutschlandachter 1960` anlegen;
- Startseiten-Title und Description optimieren;
- `canonical` ergänzen;
- `robots.txt` anlegen;
- `sitemap.xml` generieren;
- Open-Graph-Bild ergänzen;
- JSON-LD-Basis implementieren;
- Search-Console-Verifikation ermöglichen;
- interne Verlinkung ergänzen;
- AI-/Search-Crawler dürfen die öffentlichen redaktionellen Seiten technisch erreichen;
- zentrale Entitäten auf den wichtigsten Seiten explizit und konsistent beschreiben;
- Quellen- und Faktenblöcke für zentrale Themen vorbereiten.

### P1 — hohe Wirkung

- `/ratzeburg/`;
- `/karl-adam-trainingsmethoden/`;
- `/rudern-verstehen/`;
- `/rudern-lernen/`;
- `/ruderverein-finden/`;
- `/ueber-adams-erben/`;
- Breadcrumbs;
- erweiterte strukturierte Daten;
- E-E-A-T / Redaktion / Quellenprinzipien;
- CBO-Frage-Antwort-Strukturen;
- eindeutige Entity-Verknüpfungen;
- externe autoritative Referenzen und Erwähnungen;
- regelmäßige CBO-Benchmark-Abfragen.

### P2 — Wachstum

- Evergreen-Beiträge;
- Ausbau anhand Search-Console-Daten und realer Nutzerfragen;
- Link-Earning / externe Erwähnungen;
- historische und technische Long-Tail-Themen;
- ggf. Bild-Sitemap;
- optional `llms.txt` als ergänzender Orientierungshinweis, jedoch **nicht** als Ersatz für HTML, Sitemap oder robots.txt und nicht als angenommener Standard.

---

## 5. Kanonische Domain und Redirects

Primäre URL:

`https://adams-erben.de/`

Folgende Varianten müssen dauerhaft auf die kanonische Domain umleiten:

- `http://adams-erben.de/*`
- `http://www.adams-erben.de/*`
- `https://www.adams-erben.de/*`

Anforderungen:

- HTTP 301 oder 308;
- Pfad und Query-Parameter beibehalten;
- keine Redirect-Ketten;
- kein Mischbetrieb von `www` und non-`www`.

### Abnahmekriterium

Jede alternative Domainvariante erreicht die kanonische URL mit maximal einem Redirect.

---

## 6. Informationsarchitektur

Empfohlene Zielstruktur:

- `/` — Adams Erben / Einstieg
- `/karl-adam/` — zentrale Pillar-Page
- `/adams-acht/` — Filmkontext und historische Einordnung
- `/deutschlandachter-1960/` — Rom 1960 / Goldachter
- `/ratzeburg/` — Ruderstadt, RRC, Ruderakademie, Regatta
- `/karl-adam-trainingsmethoden/` — Training, Material, Physiologie, Führung
- `/rudern-verstehen/` — Grundlagen und Technik
- `/rudern-lernen/` — Einstieg in den Rudersport
- `/ruderverein-finden/` — Vereinssuche / Conversion
- `/ueber-adams-erben/` — Initiative, Redaktion, Quellenprinzipien

Eine neue URL wird nur angelegt, wenn sie:

- einen eigenständigen Nutzerbedarf beantwortet;
- genügend eigene Substanz besitzt;
- intern sinnvoll verlinkt werden kann;
- langfristig gepflegt werden kann.

---

## 7. Homepage

### Aufgabe

Marken- und Story-Einstieg sowie semantischer Wegweiser zu Karl Adam, Deutschlandachter, Ratzeburg und Rudern heute.

### Title

Zielrichtung:

`Karl Adam, Deutschlandachter & Rudern heute | Adams Erben`

### Meta-Description

Zielrichtung:

`Karl Adam revolutionierte von Ratzeburg aus den Rudersport. Entdecke den Deutschlandachter, seine Trainingsideen und finde einen Ruderverein in deiner Nähe.`

### Hero

Der bestehende Claim bleibt sichtbar:

> **Der Film endet im Kino. Adams Erbe lebt im Bootshaus weiter.**

### Interne Links

Prominent zu:

- Karl Adam;
- Adams Acht;
- Deutschlandachter 1960;
- Ratzeburg;
- Rudern verstehen;
- Ruderverein finden.

---

## 8. Pillar-Page `/karl-adam/`

### Ziel

Zentrale Wissensseite zu Karl Adam und semantischer Mittelpunkt der Website.

### Such- und Antwortintentionen

- Wer war Karl Adam?
- Warum war Karl Adam für den Rudersport wichtig?
- Was hat Karl Adam im Training verändert?
- Welche Rolle spielte Karl Adam beim Deutschlandachter?
- Was verbindet Karl Adam mit Ratzeburg?
- Wie ist seine NS-Vergangenheit einzuordnen?

### Inhalt

1. Kurzbiografie;
2. Ratzeburg und RRC;
3. Deutschlandachter;
4. Trainings- und Technikansatz;
5. Athletenführung;
6. internationale Wirkung;
7. historische Verantwortung / NS-Kontext;
8. heutige Wirkung;
9. weiterführende Quellen.

### CBO-Anforderung

Die Seite erhält nahe am Anfang einen kompakten, sachlichen Überblick von etwa 100–180 Wörtern, der zentrale Fakten eindeutig benennt und ohne Marketingformulierungen verständlich ist.

Wichtige Aussagen sollen anschließend in thematisch geschlossenen Abschnitten mit sichtbaren Quellen vertieft werden.

---

## 9. Landingpage `/adams-acht/`

### Rolle

Nicht die offizielle Filmseite ersetzen, sondern Anschlussfragen beantworten.

### Leitfragen

- Wer war Karl Adam wirklich?
- Auf welcher wahren Geschichte basiert der Film?
- Wer gehörte zum Deutschlandachter?
- Welche historischen Orte in Ratzeburg spielen eine Rolle?
- Welche Trainingsideen Adams sind bis heute relevant?
- Wie kann ich selbst Rudern ausprobieren?

### Abgrenzung

Sichtbarer Hinweis, dass `adams-erben.de` keine offizielle Website des Films, der Produktion oder des Verleihs ist.

Keine unlizenzierte Nutzung von Filmstills, Trailern, Key Art oder offiziellen Filmassets.

---

## 10. Landingpage `/deutschlandachter-1960/`

### Ziel

Eigenständige sporthistorische Seite zu Olympia Rom 1960.

### Inhalte

- historischer Kontext;
- Mannschaft;
- Karl Adams Rolle;
- Vorbereitung;
- Rennen / olympische Bedeutung;
- Nachwirkung für den Deutschlandachter;
- Verbindungen zu Ratzeburg und Kiel;
- Quellen und weiterführende Medien.

### CBO-Anforderung

Mannschaft, Datum, Ort, Ergebnis und Karl Adams Rolle müssen als eindeutig extrahierbare Fakten dargestellt werden, vorzugsweise zusätzlich in einer semantisch sauberen Liste oder Tabelle.

---

## 11. Landingpage `/ratzeburg/`

Ratzeburg als eigenständige semantische Entität der Karl-Adam- und Rudergeschichte aufbauen.

Inhalte:

- Ratzeburger Ruderclub;
- Küchensee / Ruderrevier;
- Karl Adam;
- Ruderakademie;
- Internationale Ratzeburger Ruderregatta;
- Stadtführung / historische Orte;
- heutiges Rudern;
- lokale Quellen.

---

## 12. Landingpage `/karl-adam-trainingsmethoden/`

Die bestehenden Inhalte aus `Adams Labor` werden zu einer eigenständigen, quellenbasierten Seite ausgebaut.

Themen:

- Intervalltraining / Belastungssteuerung;
- Krafttraining;
- Blattgeometrie, Hebel und Rigging;
- Rhythmus, Schlagzahl und Messbarkeit;
- Höhentraining / Mexiko 1968;
- Athletenführung / mündiger Athlet;
- Vergleich `damals → Adam → heute`.

Redaktionelle Regel:

Keine unbelegte Formulierung `Karl Adam erfand X`.

Sauber unterscheiden zwischen:

- Einführung;
- Übertragung aus anderen Sportarten;
- systematischer Nutzung;
- Weiterentwicklung;
- Popularisierung.

---

## 13. Content-Cluster `/rudern-verstehen/`

Startthemen:

- Wie funktioniert Rudern?
- Unterschied Skull und Riemen
- Was ist ein Achter?
- Was macht ein Steuermann?
- Was bedeutet Schlagzahl?
- Wie funktioniert der Ruderschlag?
- Wie lang ist ein Ruderboot?
- Was ist Rigging?
- Was ist ein Big Blade?
- Welche Bootsklassen gibt es?

Zu Beginn darf `/rudern-verstehen/` eine starke Übersichtsseite sein. Unterseiten erst bei ausreichend eigenständiger Substanz.

Jeder Abschnitt sollte die jeweilige Frage zunächst in zwei bis vier Sätzen direkt beantworten und danach vertiefen.

---

## 14. Landingpage `/rudern-lernen/`

Nutzerfunnel:

`Interesse → Unsicherheit abbauen → Einstieg erklären → Verein finden`

Leitfragen:

- Kann jeder Rudern lernen?
- Bin ich zu alt für Rudern?
- Muss ich besonders fit sein?
- Muss ich schwimmen können?
- Was kostet Rudern im Verein?
- Welche Kleidung brauche ich?
- Wie läuft ein Schnuppertraining ab?
- Wie lange dauert es, Rudern zu lernen?
- Rudert man allein oder im Team?

Primärer CTA:

`Ruderverein finden`

---

## 15. Landingpage `/ruderverein-finden/`

Die bestehende Vereinssuche bleibt vollständig erhalten und erhält eine eigene indexierbare Zielseite.

Hilfreicher Begleittext:

- Ablauf eines Probetrainings;
- direkte Kontaktaufnahme zum Verein;
- benötigte Suchdaten;
- Datenschutz / Standortverarbeitung;
- Alternativen, wenn kein Verein direkt in der Nähe gefunden wird.

Keine automatisch generierten Stadtseiten ohne eigenständigen lokalen Inhalt.

---

## 16. Meta-Daten

Jede indexierbare Seite erhält:

- einzigartigen `<title>`;
- einzigartige `<meta name="description">`;
- `<link rel="canonical">`;
- `og:type`;
- `og:locale="de_DE"`;
- `og:site_name="Adams Erben"`;
- `og:title`;
- `og:description`;
- `og:url`;
- `og:image`;
- `og:image:alt`;
- Twitter/X Card Metadaten.

Empfohlen:

`<meta name="twitter:card" content="summary_large_image">`

Mindestens ein neutrales Adams-Erben-Social-Preview ca. 1200 × 630 px.

---

## 17. Canonical

Jede indexierbare HTML-Seite erhält eine selbstreferenzierende kanonische URL.

Query-Parameter der Vereinssuche dürfen nicht eigenständig indexiert werden, sofern sie keinen dauerhaften eigenständigen Inhalt darstellen.

---

## 18. robots.txt und Crawler-Strategie

Unter `/robots.txt` bereitstellen.

Basis:

```txt
User-agent: *
Allow: /

Sitemap: https://adams-erben.de/sitemap.xml
```

### CBO-Anforderung

Öffentliche redaktionelle Inhalte sollen von Such- und Antwortsystemen erreichbar sein, sofern dies der gewählten Datenschutz-/Content-Policy entspricht.

Vor Produktionsfreigabe ist explizit zu prüfen, ob folgende Crawler durch `robots.txt`, CDN, WAF oder Bot-Schutz unbeabsichtigt blockiert werden:

- OpenAI Search-Crawler, insbesondere `OAI-SearchBot`;
- Anthropic-Crawler, insbesondere `ClaudeBot`;
- Google-Crawler sowie die gewählte Policy für `Google-Extended`;
- `PerplexityBot`.

Wichtig:

- Search-/Antwort-Crawling und Modelltraining sind nicht gleichzusetzen;
- die Freigabe einzelner Bots ist eine bewusste Policy-Entscheidung;
- CBO darf nicht dazu führen, dass sensible oder nicht veröffentlichte Pfade freigegeben werden;
- `robots.txt` ist kein Sicherheitsmechanismus.

---

## 19. XML-Sitemap

Unter `/sitemap.xml` bereitstellen.

Nur:

- kanonische URLs;
- freigegebene indexierbare Seiten;
- keine Redirects;
- keine 404-Seiten;
- keine `noindex`-Seiten;
- keine Query-Parameter-Varianten.

`lastmod` nur verwenden, wenn technisch zuverlässig gepflegt.

---

## 20. Strukturierte Daten

JSON-LD bevorzugen.

### Homepage

- `WebSite`;
- passende `Organization`- oder Projektbeschreibung ohne suggerierte offizielle Partnerschaften.

### Karl Adam

- `Person`;
- nur belegbare Attribute;
- `sameAs` nur für eindeutig passende, belastbare externe Identitätsquellen.

### Redaktionelle Detailseiten

- `Article` oder `WebPage`;
- `datePublished` nur wenn real vorhanden;
- `dateModified` nur wenn gepflegt;
- `author` / `publisher` transparent.

### Filmseite

`Movie` nur bei korrekter und belastbarer Pflege. Adams Erben darf nicht als Produzent oder Rechteinhaber erscheinen.

### Navigation

- `BreadcrumbList`.

### CBO-Regel

Strukturierte Daten dienen der eindeutigen maschinellen Interpretation, ersetzen aber keinen sichtbaren Inhalt. Wichtige Fakten müssen auch im HTML stehen.

---

## 21. Semantisches HTML

Pro Seite:

- genau eine primäre `<h1>`;
- hierarchische H2/H3-Struktur;
- `<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`, `<section>` sinnvoll nutzen;
- echte `<a href>`-Links für Navigation;
- Tabellen nur für echte tabellarische Daten;
- Definitionen möglichst mit eindeutigem Begriff und Erklärung;
- wichtige Inhalte nicht ausschließlich in Canvas, SVG, Bildtext oder JavaScript verstecken.

---

## 22. Interne Verlinkung

Primäre Hubs:

- `Karl Adam` — historischer Hub;
- `Rudern verstehen` — technischer Hub;
- `Rudern lernen` — Einsteiger-Hub;
- `Ruderverein finden` — Conversion-Hub.

Beispiel:

`Adams Acht → Karl Adam → Deutschlandachter 1960 → Trainingsmethoden → Rudern verstehen → Rudern lernen → Ruderverein finden`

Keine überoptimierten Keyword-Linktexte.

---

## 23. E-E-A-T / Vertrauenssignale

`/ueber-adams-erben/` enthält mindestens:

- Zweck der Initiative;
- Verantwortliche / Redaktion, soweit veröffentlichbar;
- Abgrenzung zu Film, Verband und Partnern;
- Quellenprinzipien;
- Umgang mit historischen Kontroversen;
- Korrekturhinweise / Kontaktmöglichkeit;
- Medien-/Bildnachweise;
- Aktualisierungsprinzip.

Historische Aussagen sollen möglichst auf Primärquellen oder hochwertige Sekundärquellen gestützt werden.

---

## 24. CBO — Definition und Zielbild

CBO bedeutet für dieses Projekt nicht, Texte speziell für ein einzelnes Sprachmodell zu manipulieren.

Ziel ist, dass webfähige KI-Systeme die Website als **klar strukturierte, faktenreiche, nachvollziehbare und zitierfähige Quelle** erkennen können.

Erwünschtes Ergebnis bei Fragen wie:

- „Wer war Karl Adam?“
- „Was hat Karl Adam im Rudern verändert?“
- „Wer gewann 1960 den olympischen Achter?“
- „Welche Verbindung hat Ratzeburg zum Deutschlandachter?“
- „Welche Trainingsmethoden führte Karl Adam ein?“
- „Was ist an Adams Acht historisch belegt?“

soll `adams-erben.de` bei geeigneten Systemen als Quelle oder weiterführender Link auftauchen.

---

## 25. CBO — Zitierfähige Content-Struktur

Zentrale Seiten sollen nach Möglichkeit folgendes Muster verwenden:

1. **präzise H1**;
2. **kurze direkte Zusammenfassung**;
3. **Faktenblock / Kernaussagen**;
4. **vertiefende Abschnitte mit klaren H2-Fragen oder Themen**;
5. **sichtbare Quellen direkt beim relevanten Abschnitt**;
6. **weiterführende Primär- oder Referenzquellen**;
7. **Datum der letzten fachlichen Prüfung**, wenn gepflegt.

### Faktenblöcke

Für geeignete Themen können kompakte Blöcke eingesetzt werden, z. B.:

**Karl Adam in Kürze**

- vollständiger Name;
- Lebensdaten;
- Funktion;
- Wirkungsort;
- zentrale sporthistorische Bedeutung;
- wichtige Erfolge;
- Einordnung / Quellen.

Keine isolierten „SEO-Faktenboxen“ ohne redaktionellen Kontext.

---

## 26. CBO — Fragen und direkte Antworten

Auf informationsorientierten Seiten sollen reale Nutzerfragen als H2/H3 genutzt werden, wenn sie redaktionell passen.

Beispiel:

`## Was veränderte Karl Adam im Rudertraining?`

Darunter zuerst eine direkte, sachliche Antwort in etwa 40–100 Wörtern, danach Details und Quellen.

Das verbessert gleichzeitig:

- Lesbarkeit;
- Featured-Snippet-Eignung;
- semantische Klarheit;
- Extrahierbarkeit für Antwortsysteme.

Keine künstliche FAQ-Masse und keine Wiederholung derselben Keywords.

---

## 27. CBO — Entity-Konsistenz

Folgende Entitäten müssen über die Website konsistent bezeichnet und verknüpft werden:

- Karl Adam;
- Deutschlandachter;
- Ratzeburger Ruderclub e.V.;
- Ratzeburg;
- Ruderakademie Ratzeburg;
- Deutscher Ruderverband;
- World Rowing;
- Olympische Spiele Rom 1960;
- Olympische Spiele Mexiko-Stadt 1968;
- Film `Adams Acht`.

Regeln:

- Namen beim ersten Auftreten vollständig schreiben;
- Abkürzungen anschließend erklären;
- keine wechselnden Bezeichnungen, die unterschiedliche Entitäten suggerieren;
- externe Identitätslinks nur setzen, wenn eindeutig;
- Organisationen und Projekte nicht miteinander vermischen.

---

## 28. CBO — Quellenarchitektur

Jede zentrale historische Seite soll eine nachvollziehbare Quellenhierarchie besitzen.

Priorität:

1. Primärquellen / Archive / offizielle Dokumente;
2. zuständige Institutionen und Verbände;
3. wissenschaftliche bzw. fachhistorische Publikationen;
4. hochwertige journalistische Sekundärquellen;
5. sonstige Sekundärquellen nur ergänzend.

Quellen nicht nur gesammelt im Footer nennen, sondern relevanten Aussagen zuordnen.

Bei strittigen Sachverhalten:

- Unsicherheit kenntlich machen;
- unterschiedliche belastbare Positionen nennen;
- keine übertriebene Sicherheit formulieren.

---

## 29. CBO — Eigenständiger Informationswert

Die Website darf nicht nur andere Quellen zusammenfassen.

Sie soll eigene, zitierfähige Informationswerte schaffen, z. B.:

- redaktionell geprüfte Chronologie;
- strukturierte Mannschaftsübersicht 1960;
- Gegenüberstellung `damals → Adam → heute`;
- verständliche Erklärung von Rudertechnik und Materialentwicklung;
- Karte / Übersicht historischer Orte in Ratzeburg;
- Verbindung der historischen Entwicklung mit dem heutigen Vereinsrudern;
- sauber kuratierte Quellenketten.

Diese Assets erhöhen zugleich Backlink- und CBO-Potenzial.

---

## 30. CBO — Externe Erwähnungen und Autorität

CBO hängt nicht nur von der eigenen Website ab. Relevante externe Erwähnungen erhöhen die Wahrscheinlichkeit, dass Systeme die Entität `Adams Erben` und ihre Inhalte zuverlässig einordnen.

Bevorzugt werden natürliche redaktionelle Erwähnungen bzw. Links aus:

- Rudervereinen;
- Stadt / Tourismus Ratzeburg;
- sporthistorischen Einrichtungen;
- Verbands- und Ruderfachmedien;
- Veranstaltungen / Ausstellungen;
- Podcasts;
- regionaler und überregionaler Presse.

Kein gekaufter Linkaufbau und keine künstlichen Erwähnungsnetzwerke.

---

## 31. CBO — `llms.txt`

`llms.txt` kann als optionales Experiment vorgesehen werden, sobald die zentrale Seitenstruktur stabil ist.

Regeln:

- nicht als verbindlichen Webstandard behandeln;
- keine Abhängigkeit der CBO-Strategie davon;
- nur öffentliche, kanonische Inhalte referenzieren;
- keine Inhalte dort verstecken, die nicht ebenfalls im Web sichtbar sind;
- Sitemap, semantisches HTML, interne Links und robots.txt bleiben maßgeblich.

Ein möglicher späterer Inhalt kann kompakt auf zentrale Themen- und Quellen-Seiten verweisen.

---

## 32. Bilder und Image SEO/CBO

Neue Assets nach Möglichkeit mit sprechenden Dateinamen:

- `karl-adam-ratzeburg.webp`
- `deutschlandachter-1960.webp`
- `ratzeburger-ruderregatta.webp`

Inhaltliche Bilder erhalten:

- sinnvollen `alt`-Text;
- `width` und `height`;
- möglichst `srcset` / `sizes`;
- Lazy Loading unterhalb des sichtbaren Bereichs;
- sichtbare Bildunterschrift, wenn historischer Kontext relevant ist;
- Rechte-/Quellenangabe, sofern erforderlich.

Wichtige Fakten dürfen nicht nur in Grafiken eingebettet sein; sie müssen zusätzlich als HTML-Text vorliegen.

---

## 33. Performance / Core Web Vitals

Anforderungen:

- keine großen unkomprimierten Bilder;
- Hero-/LCP-Asset gezielt priorisieren;
- kein unnötiges Third-Party-JavaScript;
- CSS/JS-Bundles klein halten;
- Layout Shifts vermeiden;
- Fonts effizient laden;
- keine schweren Tracking-Skripte ohne klaren Bedarf und Datenschutzprüfung.

Zielwerte:

- LCP <= 2,5 s;
- CLS <= 0,1;
- INP <= 200 ms.

Messung primär mobil.

---

## 34. Search Console und klassische SEO-Messung

Nach Produktionsfreigabe:

1. Domain Property für `adams-erben.de` verifizieren;
2. Sitemap einreichen;
3. Indexierung zentraler Seiten prüfen;
4. Coverage-/Indexierungsfehler beheben;
5. Suchanfragen und Impressions für P2-Content nutzen.

Besonders beobachten:

- `/`;
- `/karl-adam/`;
- `/adams-acht/`;
- `/deutschlandachter-1960/`;
- `/ratzeburg/`.

---

## 35. CBO-Messung

CBO lässt sich nicht mit einer einzelnen Rankingposition messen. Deshalb wird ein reproduzierbares Benchmark-Set definiert.

### Benchmark-Fragen

Mindestens 15–25 wiederkehrende Fragen aus folgenden Clustern:

- Karl Adam Biografie;
- Trainingsmethoden;
- Deutschlandachter 1960;
- Ratzeburg;
- Adams Acht;
- Rudertechnik;
- Rudern lernen.

### Zielsysteme

Soweit mit Websuche verfügbar und praktisch testbar:

- ChatGPT;
- Claude;
- Gemini;
- Perplexity.

### Pro Test erfassen

- wird `adams-erben.de` genannt?
- wird eine konkrete Adams-Erben-URL verlinkt oder zitiert?
- ist die zitierte Aussage korrekt?
- wird die passende Seite statt nur der Homepage gefunden?
- werden zentrale Entitäten korrekt zugeordnet?
- werden problematische historische Aspekte korrekt eingeordnet?

### Bewertung

Monatlich bzw. nach größeren Content-Releases ein Stichprobentest. Keine tägliche Ranking-Beobachtung.

---

## 36. Content-Strategie nach Kinostart

Keine Content-Masse produzieren.

Priorität haben wenige hochwertige Evergreen-Inhalte, z. B.:

- Warum Karl Adam den Rudersport veränderte
- Der Deutschlandachter 1960: Wer saß im Boot?
- Was ist an Adams Acht historisch belegt?
- Vom Macon-Blatt zum Big Blade
- Warum Ratzeburg zur Ruderstadt wurde
- Was bedeutet Rhythmus im Achter?
- Welche Ideen Karl Adams leben im modernen Training weiter?

Neue Themen werden anhand realer Nutzerfragen, Search-Console-Daten und CBO-Benchmark-Lücken priorisiert.

---

## 37. Nicht-Ziele

- kein Keyword-Stuffing;
- kein „LLM-Stuffing“;
- keine automatisch erzeugten dünnen Stadt-/Vereinsseiten;
- kein Kopieren fremder Texte;
- keine Doorway Pages;
- keine versteckten SEO-/CBO-Texte;
- keine Fake-Reviews;
- keine erfundenen Autoren oder Expertenprofile;
- keine erfundenen Zitate;
- keine künstliche Vervielfachung gleicher Inhalte;
- keine Filmasset-Nutzung ohne geklärte Rechte;
- keine Heroisierung oder Ausblendung historisch problematischer Aspekte;
- keine bezahlten Backlinks oder Linktausch-Netzwerke;
- keine automatisierten Masseninhalte nur für Chatbots;
- kein Cloaking speziell für AI-Crawler;
- keine Annahme, dass Schema.org oder `llms.txt` allein zu KI-Zitaten führen.

---

## 38. Technische Umsetzung

Die bestehende statische Architektur soll soweit sinnvoll erhalten bleiben.

Der Build muss unterstützen:

- mehrere statische HTML-Ausgabeseiten oder äquivalente crawlbare URLs;
- gemeinsame Partials / Komponenten;
- zentrale Meta-Konfiguration pro Seite;
- automatische Canonical-Erzeugung;
- automatische Sitemap-Erzeugung;
- konsistente Open-Graph-Daten;
- wiederverwendbares JSON-LD;
- zentrale Navigation;
- Build-Validierung für fehlende SEO-/CBO-Pflichtfelder.

Beispielhafte Seiten-Metadaten:

```js
{
  path: '/karl-adam/',
  title: 'Karl Adam: Rudertrainer, Deutschlandachter & Ideen | Adams Erben',
  description: '...',
  canonical: 'https://adams-erben.de/karl-adam/',
  ogImage: '/assets/images/og-karl-adam.webp',
  index: true,
  entity: 'Karl Adam',
  reviewedAt: '2026-08-14'
}
```

`reviewedAt` nur verwenden, wenn tatsächlich fachlich gepflegt.

---

## 39. Build-Validierung

Wenn mit vertretbarem Aufwand möglich, soll ein Build-Check erkennen:

- fehlender `<title>`;
- doppelte Titles;
- fehlende Meta-Description;
- fehlender Canonical;
- fehlende oder mehrere H1;
- fehlendes `lang`;
- fehlendes `og:title` / `og:description` / `og:image`;
- indexierbare Seite fehlt in Sitemap;
- Sitemap enthält nicht indexierbare Seite;
- zentrale Entitätsseite ohne JSON-LD, soweit vorgesehen;
- Quellenlink mit leerem oder ungültigem `href`;
- wichtige CBO-Seite ohne sichtbaren Kurzüberblick bzw. Kernaussagenblock.

---

## 40. Rollout-Reihenfolge

### Phase A — technische Basis

1. Domain-/Redirect-Konzept;
2. `canonical`;
3. `robots.txt`;
4. `sitemap.xml`;
5. OG-/Twitter-Metadaten;
6. JSON-LD-Basis;
7. Search-Console-Verifikation;
8. AI-/Search-Crawler-Erreichbarkeit testen.

### Phase B — Kernseiten

1. `/karl-adam/`;
2. `/adams-acht/`;
3. `/deutschlandachter-1960/`;
4. `/ratzeburg/`;
5. `/karl-adam-trainingsmethoden/`;
6. `/rudern-verstehen/`;
7. `/rudern-lernen/`;
8. `/ruderverein-finden/`;
9. `/ueber-adams-erben/`.

### Phase C — SEO/CBO-Qualität

- Navigation;
- Breadcrumbs;
- interne Links;
- Faktenblöcke;
- direkte Frage-Antwort-Abschnitte;
- sichtbare Quellen;
- Entity-Konsistenz;
- Bildoptimierung;
- strukturierte Daten;
- E-E-A-T;
- Performance.

### Phase D — Veröffentlichung und Messung

- Produktion ausliefern;
- Search Console;
- Sitemap einreichen;
- Indexierung kontrollieren;
- Core Web Vitals prüfen;
- CBO-Benchmark ausführen;
- P2-Prioritäten anhand realer Daten setzen.

---

## 41. Definition of Done

Der Branch gilt als technisch fertig, wenn:

- [ ] die Website mehrere sinnvolle, crawlbare Zielseiten besitzt;
- [ ] jede Zielseite individuellen Title und Description besitzt;
- [ ] jede Zielseite eine selbstreferenzierende Canonical-URL besitzt;
- [ ] eine gültige `robots.txt` vorliegt;
- [ ] eine gültige `sitemap.xml` vorliegt;
- [ ] die Sitemap nur kanonische indexierbare HTTP-200-Seiten enthält;
- [ ] Open-Graph-Bilder und `summary_large_image` unterstützt werden;
- [ ] strukturierte Daten für zentrale Seitentypen implementiert sind;
- [ ] genau eine H1 pro Zielseite vorhanden ist;
- [ ] zentrale Seiten kontextuell verlinkt sind;
- [ ] die Vereinssuche vollständig funktioniert;
- [ ] keine neuen Third-Party-Tracker ohne Freigabe hinzugekommen sind;
- [ ] Bildrechte-/Quellenhinweise eingehalten werden;
- [ ] historische Verantwortung nicht durch SEO/CBO-Kürzungen verloren geht;
- [ ] mobile Darstellung geprüft ist;
- [ ] Lighthouse SEO >= 95 erreicht oder Abweichungen dokumentiert sind;
- [ ] Produktions-Deployment nicht mehr die Provider-/Parking-Seite ausliefert;
- [ ] Search Console verifiziert und Sitemap eingereicht werden kann;
- [ ] öffentliche Kernseiten für die bewusst freigegebenen Search-/AI-Crawler erreichbar sind;
- [ ] `/karl-adam/`, `/adams-acht/` und `/deutschlandachter-1960/` jeweils einen klaren, zitierfähigen Kurzüberblick besitzen;
- [ ] zentrale historische Aussagen sichtbare Quellen besitzen;
- [ ] zentrale Entitäten konsistent benannt und strukturiert ausgezeichnet sind;
- [ ] ein dokumentiertes CBO-Benchmark-Set mit mindestens 15 Fragen definiert ist;
- [ ] keine CBO-Maßnahme auf Cloaking, versteckten Text oder unbelegte Fakten setzt.

---

## 42. Erfolgskriterien

### SEO

Nach einigen Wochen bzw. Monaten sollen Search-Console-Daten Impressionen für mehrere Themenfelder zeigen:

- Karl Adam;
- Deutschlandachter;
- Adams Acht;
- Ratzeburg + Rudern;
- Karl Adam + Training;
- Rudern verstehen;
- Rudern lernen;
- Ruderverein finden.

### CBO

Bei wiederholbaren Benchmark-Fragen sollen webfähige KI-Systeme zunehmend:

- `adams-erben.de` als relevante Quelle erkennen;
- die passende Detailseite statt nur die Homepage finden;
- Fakten von Adams Erben korrekt wiedergeben;
- die Website bei geeigneten Fragen zitieren oder verlinken;
- Karl Adam, Deutschlandachter, Ratzeburg und Adams Acht korrekt miteinander in Beziehung setzen.

Langfristig soll die Auffindbarkeit weder ausschließlich vom Kinostart noch ausschließlich vom Markennamen `Adams Erben` abhängen.

---

## 43. Keyword-/Question-/Entity-Matrix

Diese Matrix ist die verbindliche redaktionelle Arbeitsgrundlage für die Kernseiten. Sie verhindert Keyword-Kannibalisierung, trennt Suchintentionen sauber und definiert zugleich, welche Fragen ein KI-Antwortsystem auf Basis der jeweiligen URL möglichst eindeutig beantworten können soll.

### 43.1 `/` — Homepage

**Primäre SEO-Keywords**

- Karl Adam
- Deutschlandachter
- Rudern heute
- Adams Erben

**Sekundäre / Long-Tail-Keywords**

- Karl Adam Ratzeburg
- Deutschlandachter Geschichte
- Rudern lernen Deutschland
- Ruderverein finden
- Adams Acht Hintergrund

**Typische CBO-Fragen**

- Was ist Adams Erben?
- Worum geht es auf adams-erben.de?
- Wie hängen Karl Adam, Ratzeburg und der Deutschlandachter zusammen?
- Wo kann ich nach dem Film Adams Acht mehr über Karl Adam erfahren?
- Wie finde ich einen Ruderverein in meiner Nähe?

**Zitierfähige Kernfakten / Aussagen**

- Adams Erben ist eine unabhängige, nicht-kommerzielle Initiative.
- Die Website verbindet Karl Adams Rudergeschichte mit dem heutigen Rudersport.
- Ratzeburg ist ein zentraler Wirkungsort Karl Adams und des Deutschlandachters.
- Die Website führt von historischen Inhalten zu Informationen über das heutige Rudern und zur Vereinssuche.

**Relevante Entitäten**

- Adams Erben
- Karl Adam
- Deutschlandachter
- Ratzeburg
- Ratzeburger Ruderclub e.V.
- Film `Adams Acht`

**Bevorzugte Quellen**

- eigene redaktionelle Grundsätze auf `/ueber-adams-erben/`
- DRV
- Hall of Fame des deutschen Sports
- Stadt Ratzeburg
- World Rowing

**Interne Linkziele**

- `/karl-adam/`
- `/adams-acht/`
- `/deutschlandachter-1960/`
- `/ratzeburg/`
- `/rudern-verstehen/`
- `/ruderverein-finden/`

**Conversion / Next Step**

`Ruderverein finden` oder thematisch passende Vertiefungsseite öffnen.

---

### 43.2 `/karl-adam/`

**Primäre SEO-Keywords**

- Karl Adam
- Karl Adam Rudertrainer
- Ruderprofessor Karl Adam

**Sekundäre / Long-Tail-Keywords**

- Karl Adam Ratzeburg
- Karl Adam Deutschlandachter
- Karl Adam Trainingsmethoden
- Karl Adam Biografie
- Karl Adam NS Vergangenheit
- Karl Adam Rudern

**Typische CBO-Fragen**

- Wer war Karl Adam?
- Warum gilt Karl Adam als bedeutender Rudertrainer?
- Welche Rolle spielte Karl Adam beim Deutschlandachter?
- Was veränderte Karl Adam im Training?
- Was verbindet Karl Adam mit Ratzeburg?
- Wie ist Karl Adams NS-Vergangenheit historisch einzuordnen?
- Welche Ideen Karl Adams wirken im modernen Rudern weiter?

**Zitierfähige Kernfakten**

- Karl Adam war ein deutscher Rudertrainer und prägte den Leistungssport in Ratzeburg.
- Seine Arbeit verband Training, Technik, Material, Physiologie und Athletenführung systematisch.
- Der von ihm geprägte Ratzeburger Achter wurde zu einem zentralen Ausgangspunkt der deutschen Achtertradition.
- Seine sporthistorische Bedeutung ist zusammen mit seiner NS-Biografie einzuordnen.

Lebensdaten, konkrete Mitgliedschaften, Funktionen, Erfolge und Jahreszahlen dürfen erst als feste Faktenblöcke veröffentlicht werden, wenn sie gegen belastbare Referenzquellen verifiziert wurden.

**Relevante Entitäten**

- Karl Adam
- Ratzeburger Ruderclub e.V.
- Ratzeburg
- Deutschlandachter
- Deutscher Ruderverband
- Olympische Spiele Rom 1960
- Olympische Spiele Mexiko-Stadt 1968

**Bevorzugte Quellen**

- Primärtexte Karl Adams, soweit rechtlich nutzbar
- Stadtarchiv Ratzeburg
- Hall of Fame des deutschen Sports
- Deutscher Ruderverband
- Biografie von Dirk Andresen und Timo Reinke
- belastbare sporthistorische Forschung

**Interne Linkziele**

- `/deutschlandachter-1960/`
- `/karl-adam-trainingsmethoden/`
- `/ratzeburg/`
- `/adams-acht/`
- `/rudern-verstehen/`

**Conversion / Next Step**

Vertiefung zu Trainingsmethoden, Deutschlandachter oder Ratzeburg.

---

### 43.3 `/adams-acht/`

**Primäre SEO-Keywords**

- Adams Acht
- Adams Acht Film
- Adams Acht wahre Geschichte

**Sekundäre / Long-Tail-Keywords**

- Adams Acht Karl Adam
- Adams Acht Deutschlandachter
- Adams Acht Ratzeburg
- Adams Acht historischer Hintergrund
- Adams Acht Fakten

**Typische CBO-Fragen**

- Worum geht es im Film Adams Acht?
- Basiert Adams Acht auf einer wahren Geschichte?
- Wer war Karl Adam hinter der Filmgeschichte?
- Welche historischen Ereignisse stehen hinter Adams Acht?
- Was ist im Film historisch belegt und was ist filmische Darstellung?
- Wo kann ich nach dem Film mehr über den Deutschlandachter erfahren?

**Zitierfähige Kernfakten**

- `Adams Erben` ist keine offizielle Website des Films.
- Der Film greift die Geschichte Karl Adams und des deutschen Rudersports auf.
- Die Seite ordnet historische Hintergründe ein und verweist für Filminformationen auf offizielle Quellen.
- Aussagen über Inhalt, Besetzung, Veröffentlichung oder Produktion werden nur aus offiziellen Film-/Verleihquellen übernommen.

**Relevante Entitäten**

- Film `Adams Acht`
- Karl Adam
- Deutschlandachter
- Ratzeburg
- offizielle Filmproduktion / Verleih

**Bevorzugte Quellen**

- offizielle Filmwebsite
- offizieller Verleih / Produktionsinformationen
- DRV-Berichterstattung
- historische Referenzquellen für die zugrunde liegenden Ereignisse

**Interne Linkziele**

- `/karl-adam/`
- `/deutschlandachter-1960/`
- `/ratzeburg/`
- `/karl-adam-trainingsmethoden/`
- `/ruderverein-finden/`

**Conversion / Next Step**

Vom Filmkontext in die historische Vertiefung oder direkt zum heutigen Rudern wechseln.

---

### 43.4 `/deutschlandachter-1960/`

**Primäre SEO-Keywords**

- Deutschlandachter 1960
- Olympia Achter 1960
- Goldachter Rom 1960

**Sekundäre / Long-Tail-Keywords**

- Deutschlandachter Rom 1960 Mannschaft
- Karl Adam Deutschlandachter 1960
- olympischer Achter 1960 Deutschland
- Ratzeburger Achter 1960
- Deutschlandachter Olympiasieger 1960

**Typische CBO-Fragen**

- Wer gewann 1960 den olympischen Achter?
- Wer saß im deutschen Achter von Rom 1960?
- Welche Rolle spielte Karl Adam beim Olympiasieg 1960?
- Wie wurde der Deutschlandachter 1960 vorbereitet?
- Warum war der Sieg in Rom sporthistorisch bedeutend?
- Welche Vereine stellten die Mannschaft?

**Zitierfähige Kernfakten**

Die Seite muss nach Quellenprüfung eindeutig ausweisen:

- Wettbewerb;
- Datum;
- Austragungsort;
- Ergebnis / Medaille;
- Mannschaft einschließlich Steuermann;
- Trainer-/Betreuerrolle;
- beteiligte Vereine;
- sporthistorische Einordnung.

Diese Daten sollen zusätzlich in einer maschinenlesbaren HTML-Tabelle oder Liste erscheinen.

**Relevante Entitäten**

- Deutschlandachter
- Karl Adam
- Olympische Spiele Rom 1960
- Ratzeburger Ruderclub e.V.
- beteiligte Rudervereine
- World Rowing / olympische Ergebnisarchive

**Bevorzugte Quellen**

- olympische Ergebnisarchive
- World Rowing
- Deutscher Ruderverband
- zeitgenössische Primärquellen / Archive
- sporthistorische Fachliteratur

**Interne Linkziele**

- `/karl-adam/`
- `/ratzeburg/`
- `/karl-adam-trainingsmethoden/`
- `/rudern-verstehen/`

**Conversion / Next Step**

Karl Adams Trainingsansatz verstehen oder die Entwicklung des modernen Achters nachvollziehen.

---

### 43.5 `/ratzeburg/`

**Primäre SEO-Keywords**

- Ratzeburg Rudern
- Karl Adam Ratzeburg
- Ratzeburger Ruderclub

**Sekundäre / Long-Tail-Keywords**

- Ruderakademie Ratzeburg
- Ratzeburger Ruderregatta
- Deutschlandachter Ratzeburg
- Ruderstadt Ratzeburg
- Karl Adam Gedenkstein Ratzeburg
- Rudern Küchensee

**Typische CBO-Fragen**

- Warum ist Ratzeburg für den deutschen Rudersport wichtig?
- Welche Verbindung hat Karl Adam zu Ratzeburg?
- Was ist die Ruderakademie Ratzeburg?
- Was ist die Internationale Ratzeburger Ruderregatta?
- Welche historischen Ruderorte kann man in Ratzeburg besuchen?
- Kann man in Ratzeburg heute Rudern lernen?

**Zitierfähige Kernfakten**

- Ratzeburg ist ein zentraler Ort der Karl-Adam- und Deutschlandachter-Geschichte.
- Der Ratzeburger Ruderclub gehört zu den historischen Kernorten dieser Entwicklung.
- Ruderakademie, Regatta und heutiger Vereinssport verbinden die historische Tradition mit dem aktuellen Rudersport.

Konkrete Gründungsdaten, Regatta-Nummern, Adressen und Institutionsangaben nur aus offiziellen lokalen Quellen übernehmen.

**Relevante Entitäten**

- Ratzeburg
- Ratzeburger Ruderclub e.V.
- Ruderakademie Ratzeburg
- Karl Adam
- Internationale Ratzeburger Ruderregatta
- Stadt Ratzeburg
- Küchensee

**Bevorzugte Quellen**

- Stadt Ratzeburg / Stadtarchiv
- Ratzeburger Ruderclub
- Ruderakademie
- Deutscher Ruderverband
- lokale historische Dokumentation

**Interne Linkziele**

- `/karl-adam/`
- `/deutschlandachter-1960/`
- `/rudern-lernen/`
- `/ruderverein-finden/`

**Conversion / Next Step**

Ratzeburg vor Ort entdecken oder einen Verein zum Rudern finden.

---

### 43.6 `/karl-adam-trainingsmethoden/`

**Primäre SEO-Keywords**

- Karl Adam Trainingsmethoden
- Karl Adam Rudertraining
- Karl Adam Intervalltraining

**Sekundäre / Long-Tail-Keywords**

- Karl Adam Krafttraining Rudern
- Karl Adam Höhentraining
- Karl Adam Rudertechnik
- Karl Adam Big Blade Vorläufer
- Karl Adam Trainingslehre
- Karl Adam mündiger Athlet

**Typische CBO-Fragen**

- Welche Trainingsmethoden setzte Karl Adam ein?
- Hat Karl Adam das Intervalltraining erfunden?
- Welche Rolle spielte Krafttraining bei Karl Adam?
- Wie experimentierte Karl Adam mit Riemen und Hebeln?
- Wie bereitete Karl Adam Athleten auf Mexiko 1968 vor?
- Was bedeutete der mündige Athlet in Adams Trainingsphilosophie?
- Welche Methoden Adams werden heute noch genutzt?

**Zitierfähige Kernfakten**

- Adam übernahm, kombinierte und systematisierte Methoden aus mehreren Bereichen.
- Die Seite trennt konsequent zwischen Erfindung, Übertragung, Weiterentwicklung und Popularisierung.
- Training, Material, Physiologie und Athletenführung werden als zusammenhängendes System dargestellt.
- Moderne Praxis wird als heutige Einordnung gekennzeichnet und nicht rückwirkend Adam zugeschrieben.

**Relevante Entitäten**

- Karl Adam
- Intervalltraining
- Krafttraining
- Höhentraining
- Rigging
- Ruderriemen / Blattform
- Ratzeburg
- Olympische Spiele Mexiko-Stadt 1968

**Bevorzugte Quellen**

- Primärtexte Karl Adams
- sportwissenschaftliche Fachliteratur
- Hall of Fame
- DRV
- World Rowing
- peer-reviewte moderne Forschung für heutige Einordnung

**Interne Linkziele**

- `/karl-adam/`
- `/rudern-verstehen/`
- `/deutschlandachter-1960/`
- `/ratzeburg/`

**Conversion / Next Step**

Von der historischen Trainingslehre zu verständlichen Erklärungen des modernen Ruderns wechseln.

---

### 43.7 `/rudern-verstehen/`

**Primäre SEO-Keywords**

- Rudern erklärt
- Rudern verstehen
- wie funktioniert Rudern

**Sekundäre / Long-Tail-Keywords**

- Unterschied Skull Riemen
- was ist ein Achter Rudern
- Steuermann Rudern Aufgabe
- Ruderschlag erklärt
- Schlagzahl Rudern
- Rigging Rudern
- Big Blade Rudern
- Bootsklassen Rudern

**Typische CBO-Fragen**

- Wie funktioniert Rudern?
- Was ist der Unterschied zwischen Skull und Riemen?
- Was ist ein Achter?
- Was macht ein Steuermann?
- Was bedeutet Schlagzahl beim Rudern?
- Wie funktioniert der Ruderschlag?
- Was ist Rigging?
- Was ist ein Big Blade?
- Welche Bootsklassen gibt es?

**Zitierfähige Kernfakten**

Jeder Begriff erhält:

- eine kurze Definition in ein bis zwei Sätzen;
- eine verständliche technische Erklärung;
- bei Zahlen oder Normangaben eine belastbare Quelle;
- Abgrenzung zu verwandten Begriffen.

**Relevante Entitäten / Begriffe**

- Skull
- Riemen
- Achter / 8+
- Steuermann / Steuerfrau
- Schlagzahl
- Ruderschlag
- Dolle
- Ausleger
- Rigging
- Big Blade

**Bevorzugte Quellen**

- Deutscher Ruderverband
- World Rowing
- offizielle Regelwerke / technische Dokumente
- seriöse ruderwissenschaftliche Literatur

**Interne Linkziele**

- `/rudern-lernen/`
- `/ruderverein-finden/`
- `/karl-adam-trainingsmethoden/`

**Conversion / Next Step**

Aus Verständnis konkrete Einstiegsmotivation machen: `Rudern lernen`.

---

### 43.8 `/rudern-lernen/`

**Primäre SEO-Keywords**

- Rudern lernen
- Rudern anfangen
- Rudern für Anfänger

**Sekundäre / Long-Tail-Keywords**

- Rudern lernen Erwachsene
- Rudern Anfänger Verein
- Probetraining Rudern
- Rudern Alter Anfänger
- was kostet Rudern Verein
- Rudern lernen Voraussetzungen

**Typische CBO-Fragen**

- Kann jeder Rudern lernen?
- Bin ich zu alt, um mit Rudern anzufangen?
- Muss ich schwimmen können?
- Wie fit muss ich sein?
- Wie läuft ein Probetraining ab?
- Was kostet Rudern im Verein?
- Welche Kleidung brauche ich?
- Wie lange dauert es, Rudern zu lernen?

**Zitierfähige Kernfakten**

- Der typische Einstieg erfolgt über einen Ruderverein oder Kursanbieter.
- Anforderungen und Abläufe unterscheiden sich je Verein; lokale Angaben dürfen nicht pauschalisiert werden.
- Sicherheitsanforderungen wie Schwimmfähigkeit müssen auf Verband-/Vereinsregeln abgestützt werden.
- Kosten werden nicht als bundesweit einheitlicher Betrag dargestellt.

**Relevante Entitäten**

- Ruderverein
- Deutscher Ruderverband
- Anfängertraining
- Schnupperrudern / Probetraining
- Vereinsrudern

**Bevorzugte Quellen**

- Deutscher Ruderverband
- konkrete Vereinsinformationen für lokale Abläufe
- Sicherheits-/Ausbildungsrichtlinien

**Interne Linkziele**

- `/rudern-verstehen/`
- `/ruderverein-finden/`

**Conversion / Next Step**

Primärer CTA: `Ruderverein finden`.

---

### 43.9 `/ruderverein-finden/`

**Primäre SEO-Keywords**

- Ruderverein finden
- Ruderverein in der Nähe
- Rudern Verein

**Sekundäre / Long-Tail-Keywords**

- Ruderclub finden
- Rudern Probetraining Verein
- Rudern lernen Verein
- Ruderverein Deutschland
- Rudern in meiner Nähe

**Typische CBO-Fragen**

- Wie finde ich einen Ruderverein in meiner Nähe?
- Wo kann ich Rudern ausprobieren?
- Gibt es einen Ruderclub in meiner Stadt?
- Wie kontaktiere ich einen Ruderverein für ein Probetraining?
- Was mache ich, wenn kein Verein direkt in meiner Nähe liegt?

**Zitierfähige Kernfakten**

- Die Seite dient der Suche und Weiterleitung zu realen Rudervereinen.
- Vereinsdaten werden nicht als eigene redaktionelle Fakten erfunden, sondern aus der vorgesehenen Datenbasis übernommen.
- Fehlt eine verlässliche Kontakt-E-Mail, soll kein künstlicher E-Mail-Kontakt erzeugt werden; Website oder Adresse sind vorzuziehen.
- Standort-/Suchdaten werden datenschutzkonform verarbeitet und nicht für künstliche Stadtseiten verwendet.

**Relevante Entitäten**

- Rudervereine
- Deutscher Ruderverband
- lokale Vereine / Clubs
- Adams Erben Vereinssuche

**Bevorzugte Quellen**

- bestehende Vereinsdatenbasis
- offizielle Vereinswebsites
- DRV-Vereinsprofile

**Interne Linkziele**

- `/rudern-lernen/`
- `/rudern-verstehen/`
- `/ueber-adams-erben/` für Datenschutz-/Projektkontext

**Conversion / Next Step**

Verein auswählen und über dessen offiziellen Kontaktweg den nächsten Schritt zum Probetraining machen.

---

### 43.10 `/ueber-adams-erben/`

**Primäre SEO-Keywords**

- Adams Erben
- Adams Erben Initiative
- adams-erben.de

**Sekundäre / Long-Tail-Keywords**

- Wer steckt hinter Adams Erben
- Adams Erben unabhängig
- Adams Erben Quellen
- Adams Erben Kontakt

**Typische CBO-Fragen**

- Was ist Adams Erben?
- Ist Adams Erben die offizielle Website von Adams Acht?
- Wer verantwortet die Inhalte von adams-erben.de?
- Wie prüft Adams Erben historische Aussagen?
- Welche Quellen verwendet Adams Erben?
- Wie kann man Fehler oder Korrekturen melden?

**Zitierfähige Kernfakten**

- Adams Erben ist eine unabhängige Initiative.
- Bestehende Partnerschaften oder Kooperationen werden nur genannt, wenn sie tatsächlich vereinbart und veröffentlichbar sind.
- Redaktionelle Inhalte folgen dokumentierten Quellen- und Korrekturprinzipien.
- Historisch kontroverse Themen werden nicht ausgeblendet.
- Bild-, Medien- und Quellenrechte werden dokumentiert.

**Relevante Entitäten**

- Adams Erben
- verantwortliche Redaktion / Betreiber, soweit veröffentlichbar
- Karl Adam
- Film `Adams Acht`
- Deutscher Ruderverband
- Ratzeburger Ruderclub e.V.

**Bevorzugte Quellen**

- eigene Impressums-/Datenschutz-/Redaktionsangaben
- dokumentierte Kooperations- und Rechtefreigaben

**Interne Linkziele**

- `/`
- `/karl-adam/`
- `/ruderverein-finden/`

**Conversion / Next Step**

Vertrauen schaffen, Quellen nachvollziehen oder Kontakt/Korrekturhinweis senden.

---

## 44. Matrix-Regeln für die Umsetzung

1. **Keine Seite optimiert auf alle Begriffe gleichzeitig.** Das primäre Keyword-Set definiert die dominante Suchintention.
2. **CBO-Fragen sind redaktionelle Prüfsteine, keine Pflicht-FAQ.** Eine Frage wird nur als sichtbare Überschrift verwendet, wenn sie in den Lesefluss passt.
3. **Kernfakten sind keine Freigabe ungeprüfter Tatsachen.** Konkrete Namen, Daten, Mannschaftslisten, Mitgliedschaften, Zitate und Zahlen müssen vor Veröffentlichung gegen die vorgesehene Quellenklasse geprüft werden.
4. **Jede Kernseite benötigt mindestens einen eigenständigen Informationswert**, der über eine bloße Zusammenfassung externer Quellen hinausgeht.
5. **Interne Links folgen Nutzerlogik**, nicht einem starren Keyword-Schema.
6. **Conversion ist thematisch passend.** Historische Seiten sollen nicht aggressiv in die Vereinssuche springen, sondern über sinnvolle Anschlussinhalte führen.
7. **Keine Keyword-Kannibalisierung:** Falls zwei Seiten für dieselbe Suchanfrage Impressionen erhalten, wird anhand Search Console geprüft, ob Inhalte geschärft, zusammengeführt oder intern anders verlinkt werden müssen.
8. **CBO-Benchmark-Fragen werden aus der Matrix abgeleitet.** Mindestens zwei Fragen pro P0-Kernseite und mindestens eine Frage pro P1-Seite werden in das regelmäßige Benchmark-Set übernommen.
9. **Quellen bleiben sichtbar.** Eine maschinenlesbare Faktenbox ohne sichtbare Quellenangabe erfüllt die CBO-Anforderung nicht.
10. **Matrixpflege ist Teil der Contentpflege.** Neue Search-Console-Queries, reale Nutzerfragen und wiederkehrende CBO-Fehlantworten können die Matrix erweitern, aber nur nach redaktioneller Prüfung.

### Zusätzliche Definition of Done für die Matrix

- [ ] jede der zehn Kern-URLs besitzt ein dokumentiertes primäres Keyword-Set;
- [ ] jede Kern-URL besitzt mindestens drei dokumentierte CBO-Fragen;
- [ ] jede historische Kernseite besitzt definierte Quellenklassen;
- [ ] jede Kern-URL besitzt definierte interne Linkziele;
- [ ] jede Kern-URL besitzt ein klares Next-Step-/Conversion-Ziel;
- [ ] keine zwei Kernseiten haben dasselbe primäre Keyword-Set;
- [ ] die P0-Seiten `/`, `/karl-adam/`, `/adams-acht/` und `/deutschlandachter-1960/` sind vor Veröffentlichung anhand dieser Matrix redaktionell abgenommen.

---

## 45. P0-Content- und Implementierungs-Backlog

Dieser Abschnitt übersetzt die Strategie und Matrix in unmittelbar umsetzbare Arbeitspakete. P0 umfasst die technische Grundlage sowie die drei priorisierten redaktionellen Detailseiten `/karl-adam/`, `/adams-acht/` und `/deutschlandachter-1960/` plus die notwendige Anpassung der Homepage.

### 45.1 P0-A — Gemeinsame technische Seitenbasis

**Ziel**

Eine wiederverwendbare Seitenarchitektur schaffen, mit der alle P0- und späteren P1-Seiten als statisch crawlbare HTML-Seiten gebaut werden können.

**Arbeitspakete**

- [ ] zentrale Seitenkonfiguration für `path`, `title`, `description`, `canonical`, `ogImage`, `index`, `entity`, optional `reviewedAt`;
- [ ] gemeinsames HTML-Grundlayout mit Header, Navigation, Breadcrumb-Bereich, `<main>`, Quellenbereich und Footer;
- [ ] pro Seite genau eine H1;
- [ ] server-/buildseitig erzeugter sichtbarer Content ohne Abhängigkeit von Client-JavaScript;
- [ ] selbstreferenzierende Canonical-URL;
- [ ] Open-Graph- und Twitter/X-Metadaten;
- [ ] `BreadcrumbList` für Detailseiten;
- [ ] `WebPage` oder `Article` JSON-LD als wiederverwendbare Basis;
- [ ] optionale Entity-spezifische JSON-LD-Erweiterung, z. B. `Person` für Karl Adam;
- [ ] automatische Aufnahme indexierbarer Seiten in `sitemap.xml`;
- [ ] `robots.txt` bereitstellen;
- [ ] Navigation und Footer um echte HTML-Links zu Kernseiten erweitern;
- [ ] Build-Check für SEO-/CBO-Pflichtfelder ergänzen.

**Abnahmekriterien**

- jede P0-Seite wird ohne JavaScript mit vollständigem Hauptinhalt ausgeliefert;
- alle P0-Seiten antworten mit HTTP 200;
- jede Seite hat individuellen Title, Description und Canonical;
- jede Seite enthält genau eine H1;
- Sitemap enthält alle P0-Seiten und keine nicht indexierbaren Varianten;
- Lighthouse SEO Zielwert >= 95 auf Homepage und mindestens einer Detailseite.

---

### 45.2 P0-B — Homepage neu als SEO-/CBO-Hub ausrichten

**URL**

`/`

**Ziel**

Die bestehende Story-Homepage bleibt visuell und emotional erhalten, wird aber zu einem klaren semantischen Hub für Karl Adam, Deutschlandachter, Adams Acht und heutiges Rudern.

**Meta-Daten**

- **Title:** `Karl Adam, Deutschlandachter & Rudern heute | Adams Erben`
- **Description:** `Karl Adam prägte von Ratzeburg aus den Rudersport. Entdecke den Deutschlandachter, seine Trainingsideen und finde einen Ruderverein in deiner Nähe.`
- **Canonical:** `https://adams-erben.de/`
- **OG Type:** `website`
- **Twitter Card:** `summary_large_image`

**Content-Anpassungen**

- [ ] Hero-Claim beibehalten: `Der Film endet im Kino. Adams Erbe lebt im Bootshaus weiter.`;
- [ ] im ersten sichtbaren Textabschnitt die Begriffe `Karl Adam`, `Deutschlandachter`, `Ratzeburg` und `Rudern` natürlich einordnen;
- [ ] einen kurzen Abschnitt `Adams Erben in Kürze` oder gleichwertig integrieren, der Zweck und Unabhängigkeit erklärt;
- [ ] sichtbare interne Links auf die drei P0-Detailseiten integrieren;
- [ ] bestehende lange Detailinhalte, die künftig eigene Seiten erhalten, auf der Homepage kürzen und mit `Mehr erfahren` verlinken, statt sie vollständig zu duplizieren;
- [ ] `Verein finden` weiterhin als primären Conversion-Pfad sichtbar halten.

**JSON-LD**

- `WebSite`;
- passende Projekt-/`Organization`-Beschreibung ohne offizielle Partnerschaften zu behaupten.

**Abnahmekriterien**

- Homepage konkurriert nicht mit `/karl-adam/` um die vollständige Karl-Adam-Biografie;
- alle drei P0-Seiten sind aus dem sichtbaren Homepage-Content erreichbar;
- keine bisherige zentrale Conversion-Funktion geht verloren.

---

### 45.3 P0-C — `/karl-adam/` bauen

**Priorität**

P0.1 — höchste redaktionelle Priorität.

**Zielintention**

`Wer war Karl Adam und warum ist er für den Rudersport wichtig?`

**H1**

`Karl Adam: Rudertrainer, Deutschlandachter und seine Ideen`

**Meta-Daten**

- **Title:** `Karl Adam: Rudertrainer, Deutschlandachter & Ideen | Adams Erben`
- **Description:** `Wer war Karl Adam? Seine Rolle in Ratzeburg, beim Deutschlandachter, seine Trainingsideen, Wirkung und die historische Einordnung seiner NS-Biografie.`
- **Canonical:** `https://adams-erben.de/karl-adam/`
- **OG Image:** eigenes Adams-Erben-Motiv, keine ungeklärten historischen Fotos.

**Seitenstruktur**

1. H1 + kurze sachliche Einleitung;
2. Faktenblock `Karl Adam in Kürze`;
3. H2 `Wer war Karl Adam?`;
4. H2 `Warum wurde Ratzeburg zu seinem Wirkungsort?`;
5. H2 `Welche Rolle spielte Karl Adam beim Deutschlandachter?`;
6. H2 `Was veränderte Karl Adam im Training und an der Technik?`;
7. H2 `Was bedeutete der mündige Athlet?`;
8. H2 `Wie wirkte Karl Adams Ansatz international weiter?`;
9. H2 `Wie ist Karl Adams NS-Vergangenheit einzuordnen?`;
10. H2 `Was lebt von seinen Ideen heute weiter?`;
11. H2 `Quellen und weiterführende Vertiefung`.

**CBO-Kurzüberblick**

Direkt nach der H1 ein 100–180 Wörter langer sachlicher Überblick, der mindestens folgende Entitäten eindeutig verbindet:

- Karl Adam;
- Ratzeburg;
- Ratzeburger Ruderclub e.V.;
- Deutschlandachter;
- Training / Technik;
- historische Verantwortung.

**Faktenblock — Pflichtfelder nach Verifikation**

- vollständiger Name;
- Geburts- und Sterbedaten;
- Beruf / fachlicher Hintergrund;
- zentrale Funktion im Rudersport;
- zentraler Wirkungsort;
- wesentliche sporthistorische Erfolge;
- zentrale historische Einordnung.

**Quellen-Gates**

Vor Veröffentlichung müssen mindestens folgende Faktenklassen verifiziert sein:

- Lebensdaten;
- berufliche Funktionen;
- Vereins-/Verbandsrollen;
- olympische Erfolge und Jahre;
- konkrete Trainingszuschreibungen;
- NSDAP-/SA-/Institutionenangaben;
- DRV-Entscheidungen zur historischen Einordnung.

Bevorzugte Quellen: Stadtarchiv Ratzeburg, Hall of Fame des deutschen Sports, DRV, Primärtexte Karl Adams, belastbare sporthistorische Forschung, Andresen/Reinke.

**Interne Links**

Pflichtlinks zu:

- `/deutschlandachter-1960/`;
- `/adams-acht/`;
- später `/karl-adam-trainingsmethoden/`;
- später `/ratzeburg/`;
- Homepage.

**JSON-LD**

- `WebPage` oder `Article`;
- `Person` für Karl Adam mit ausschließlich verifizierten Attributen;
- `sameAs` nur auf eindeutig passende Identitätsquellen.

**Abnahmekriterien**

- mindestens fünf Matrix-CBO-Fragen werden im Inhalt klar beantwortet;
- NS-Kontext ist nicht in Fußnote oder Randbereich versteckt;
- zentrale Aussagen besitzen sichtbare Quellen;
- Seite enthält keine unbelegte `Adam erfand X`-Formulierung;
- Seite ist eigenständig verständlich, ohne Homepage lesen zu müssen.

---

### 45.4 P0-D — `/adams-acht/` bauen

**Priorität**

P0.2 — zeitkritisch wegen des Filmstarts.

**Zielintention**

`Was ist der historische Hintergrund des Films Adams Acht?`

**H1**

`Adams Acht: Die wahre Geschichte hinter dem Film`

Falls die Formulierung `wahre Geschichte` redaktionell zu stark erscheint, alternativ:

`Adams Acht: Historischer Hintergrund zu Karl Adam und dem Deutschlandachter`

**Meta-Daten**

- **Title:** `Adams Acht: Wahre Geschichte, Karl Adam & Deutschlandachter | Adams Erben`
- **Description:** `Historischer Hintergrund zu Adams Acht: Karl Adam, Ratzeburg, Deutschlandachter und die belegten Ereignisse hinter dem Kinofilm – unabhängig eingeordnet.`
- **Canonical:** `https://adams-erben.de/adams-acht/`

**Seitenstruktur**

1. H1 + Unabhängigkeitshinweis;
2. Kurzüberblick `Worum geht es bei Adams Acht?`;
3. H2 `Auf welcher historischen Geschichte basiert Adams Acht?`;
4. H2 `Wer war Karl Adam?` mit Kurzfassung und Link zur Pillar-Page;
5. H2 `Was war der Deutschlandachter von 1960?` mit Kurzfassung und Link;
6. H2 `Welche Rolle spielt Ratzeburg?`;
7. H2 `Was ist historisch belegt – und wo beginnt filmische Verdichtung?`;
8. H2 `Welche Ideen Karl Adams wirken bis heute weiter?`;
9. H2 `Nach dem Film: selbst ins Boot steigen`;
10. H2 `Offizielle Film- und Hintergrundquellen`.

**Pflicht-Hinweis**

Im oberen sichtbaren Seitenbereich klar formulieren:

`Adams Erben ist eine unabhängige Initiative und keine offizielle Website des Films, der Produktion oder des Verleihs.`

**Quellen-Gates**

- Filminhalt, Starttermin, Besetzung, Regie, Produktion und Verleih ausschließlich aus offiziellen Film-/Verleihquellen;
- historische Aussagen unabhängig davon gegen historische Referenzquellen prüfen;
- filmische Interpretation nicht als historische Tatsache formulieren;
- keine Filmstills, Key Art, Trailer-Thumbnails oder Logos ohne dokumentierte Nutzungsfreigabe.

**Interne Links**

Pflichtlinks zu:

- `/karl-adam/`;
- `/deutschlandachter-1960/`;
- später `/ratzeburg/`;
- später `/karl-adam-trainingsmethoden/`;
- `/ruderverein-finden/` bzw. bestehender Vereinssuche.

**JSON-LD**

- primär `WebPage` oder `Article`;
- `Movie` nur ergänzend und nur bei vollständig korrekten, offiziell belegten Daten;
- Adams Erben niemals als Produzent, Verleih oder Rechteinhaber auszeichnen.

**Abnahmekriterien**

- Unabhängigkeit ist vor dem ersten langen Inhaltsabschnitt sichtbar;
- Seite beantwortet mindestens `Worum geht es?`, `Was ist historisch?`, `Wer war Karl Adam?`, `Welche Rolle spielte Ratzeburg?`;
- keine Filmasset-Nutzung ohne Rechte;
- Nutzer gelangt mit maximal einem Klick zu Karl Adam und Deutschlandachter 1960.

---

### 45.5 P0-E — `/deutschlandachter-1960/` bauen

**Priorität**

P0.3.

**Zielintention**

`Wer war der Deutschlandachter von 1960 und warum war der Olympiasieg in Rom bedeutsam?`

**H1**

`Der Deutschlandachter 1960: Olympiasieg in Rom`

**Meta-Daten**

- **Title:** `Deutschlandachter 1960: Olympiasieger von Rom | Adams Erben`
- **Description:** `Der Deutschlandachter 1960: Mannschaft, Karl Adams Rolle, Vorbereitung, Olympiasieg in Rom und die Bedeutung für die deutsche Achtertradition.`
- **Canonical:** `https://adams-erben.de/deutschlandachter-1960/`

**Seitenstruktur**

1. H1 + 80–140 Wörter Kurzüberblick;
2. Faktenblock `Der Achter von Rom in Kürze`;
3. H2 `Wer saß im Deutschlandachter 1960?`;
4. H2 `Welche Vereine bildeten die Mannschaft?`;
5. H2 `Welche Rolle spielte Karl Adam?`;
6. H2 `Wie wurde der Achter auf Rom vorbereitet?`;
7. H2 `Wie verlief das olympische Rennen?`;
8. H2 `Warum war der Sieg sporthistorisch bedeutend?`;
9. H2 `Wie entstand daraus die deutsche Achtertradition?`;
10. H2 `Quellen und historische Medien`.

**Faktenblock / HTML-Tabelle**

Nach Quellenprüfung maschinenlesbar ausweisen:

- Wettbewerb;
- Datum des Finals;
- Austragungsort;
- Medaille / Platzierung;
- offizielle Ergebniszeit, sofern eindeutig belegt;
- acht Ruderer;
- Steuermann;
- beteiligte Vereine;
- Trainer-/Betreuerrolle Karl Adams.

Die Mannschaftsliste darf nicht aus Erinnerung oder Sekundärzusammenfassungen ungeprüft übernommen werden.

**Quellen-Gates**

Mindestens zwei unabhängige belastbare Quellen für Mannschaft und Ergebnisdaten, davon möglichst eine Primär-/offizielle Ergebnisquelle.

Bevorzugte Reihenfolge:

1. olympische / World-Rowing-Ergebnisarchive;
2. DRV;
3. zeitgenössische Archive;
4. sporthistorische Fachliteratur.

**Interne Links**

Pflichtlinks zu:

- `/karl-adam/`;
- `/adams-acht/`;
- später `/karl-adam-trainingsmethoden/`;
- später `/ratzeburg/`;
- `/rudern-verstehen/` sobald vorhanden.

**JSON-LD**

- `Article` oder `WebPage`;
- keine künstliche `SportsEvent`-Auszeichnung, wenn die notwendigen Eventdaten nicht vollständig und korrekt gepflegt werden können.

**Abnahmekriterien**

- Mannschaft und Ergebnis sind eindeutig als HTML-Text oder Tabelle vorhanden;
- mindestens vier Matrix-CBO-Fragen werden direkt beantwortet;
- Karl Adams Rolle wird präzise beschrieben, ohne ihn unzutreffend als alleinigen Urheber des Erfolgs darzustellen;
- sporthistorische Bedeutung ist vom reinen Rennergebnis getrennt eingeordnet.

---

### 45.6 P0-F — Quellen- und Faktenprüfung vor Content-Freigabe

Für jede der drei Detailseiten wird vor Merge ein kleiner redaktioneller Quellencheck durchgeführt.

**Prüfliste pro Fakt**

- [ ] konkrete Behauptung identifiziert;
- [ ] Quelle mit URL / bibliografischer Angabe dokumentiert;
- [ ] Quelle entspricht der in der Matrix vorgesehenen Qualitätsklasse;
- [ ] Primärquelle bevorzugt, sofern verfügbar;
- [ ] strittige Aussage als strittig gekennzeichnet;
- [ ] direkte Zitate nur mit Rechte-/Zitatrecht-Prüfung und sparsam;
- [ ] keine Aussage wird allein aus generativen Systemen übernommen;
- [ ] bei historischen Kontroversen wird die Gegenposition bzw. Unsicherheit geprüft.

**Empfohlene technische Ablage**

Quellen können zunächst in einer strukturierten Content-/Daten-Datei oder in den Seiten-Metadaten referenziert werden. Die sichtbare Seite muss jedoch selbst die für Leser relevanten Quellen ausgeben.

---

### 45.7 P0-G — Interne Linkarchitektur

Nach Fertigstellung der drei Seiten muss folgender Mindestgraph bestehen:

- `/` → `/karl-adam/`
- `/` → `/adams-acht/`
- `/` → `/deutschlandachter-1960/`
- `/karl-adam/` ↔ `/deutschlandachter-1960/`
- `/adams-acht/` → `/karl-adam/`
- `/adams-acht/` → `/deutschlandachter-1960/`
- `/deutschlandachter-1960/` → `/karl-adam/`
- jede Detailseite → `/`

Linktexte beschreibend formulieren, z. B. `Karl Adam und seine Trainingsideen`, nicht generisch `hier klicken`.

---

### 45.8 P0-H — CBO-Benchmark für den ersten Release

Vor Produktionsfreigabe mindestens folgende Fragen gegen die veröffentlichte oder lokal crawlbare Version testen:

**Karl Adam**

1. Wer war Karl Adam?
2. Was veränderte Karl Adam im Rudertraining?
3. Welche Rolle spielte Karl Adam beim Deutschlandachter?
4. Wie ist Karl Adams NS-Vergangenheit einzuordnen?

**Adams Acht**

5. Basiert Adams Acht auf einer wahren Geschichte?
6. Was ist der historische Hintergrund des Films Adams Acht?
7. Welche Verbindung hat Adams Acht zu Ratzeburg?

**Deutschlandachter 1960**

8. Wer gewann 1960 den olympischen Achter?
9. Wer saß im deutschen Achter von Rom 1960?
10. Welche Rolle spielte Karl Adam beim Olympiasieg 1960?

**Bewertung**

Pro Frage dokumentieren:

- passende Ziel-URL auffindbar: ja/nein;
- direkte Antwort auf Seite vorhanden: ja/nein;
- zentrale Entitäten korrekt benannt: ja/nein;
- Quellen sichtbar: ja/nein;
- Fehlinterpretationsrisiko: niedrig/mittel/hoch.

---

### 45.9 P0-I — Merge-/Release-Gate

P0 darf erst als vollständig umgesetzt gelten, wenn:

- [ ] gemeinsame technische Seitenbasis vorhanden ist;
- [ ] Homepage-Metadaten angepasst sind;
- [ ] `/karl-adam/` veröffentlichtungsfähig ist;
- [ ] `/adams-acht/` veröffentlichtungsfähig ist;
- [ ] `/deutschlandachter-1960/` veröffentlichtungsfähig ist;
- [ ] alle drei Seiten in Sitemap enthalten sind;
- [ ] alle drei Seiten individuelle Canonicals besitzen;
- [ ] Quellen-Gates erfüllt sind;
- [ ] interne Linkarchitektur vollständig ist;
- [ ] mindestens zehn P0-CBO-Fragen lokal gegen die Seitenstruktur geprüft wurden;
- [ ] keine ungeklärten Film-/Bildrechte durch die neuen Seiten entstehen;
- [ ] historische Einordnung von Karl Adam einschließlich NS-Kontext redaktionell erhalten bleibt;
- [ ] Vereinssuche und bestehende Kernfunktionen durch die neue Seitenarchitektur nicht regressieren.

### 45.10 Empfohlene Umsetzungsreihenfolge

1. gemeinsame Multi-Page-/Meta-Basis;
2. Homepage als Hub anpassen;
3. `/karl-adam/` inklusive Quellenprüfung;
4. `/deutschlandachter-1960/` inklusive Mannschafts-/Ergebnisprüfung;
5. `/adams-acht/` mit Links auf die nun vorhandenen historischen Seiten;
6. Sitemap / robots / JSON-LD finalisieren;
7. interne Linkprüfung;
8. Lighthouse / mobile / Build-Checks;
9. P0-CBO-Benchmark;
10. redaktionelles Release-Gate.