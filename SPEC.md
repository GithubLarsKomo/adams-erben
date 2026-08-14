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