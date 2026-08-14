# SPEC — SEO & Auffindbarkeit für adams-erben.de

Status: Umsetzungsspezifikation  
Branch: `feat/seo-discoverability`  
Basis: `feat/karl-adam-local-cooperation`  
Stand: 2026-08-14

## 1. Ziel

`adams-erben.de` soll organisch für relevante Suchanfragen rund um **Karl Adam**, **Deutschlandachter**, **Adams Acht**, **Ratzeburg**, **Rudern verstehen**, **Rudern lernen** und **Ruderverein finden** auffindbar werden.

Die Website bleibt dabei eine **unabhängige, nicht-kommerzielle Initiative** und wird nicht als offizielle Film-, Verbands-, Vereins- oder Partnerseite dargestellt.

Die SEO-Strategie folgt der Positionierung:

> **Was hinter der Geschichte steckt – und was davon heute weiterlebt.**

Der Kinofilm ist ein wichtiger Einstiegspunkt, aber nicht die langfristige Hauptidentität der Website. Ziel ist, kurzfristiges Suchinteresse rund um den Film in dauerhaft relevante Inhalte über Karl Adam, Rudergeschichte, Rudertechnik und den Einstieg in den Rudersport zu überführen.

---

## 2. Ausgangslage

### 2.1 Öffentliche Domain

Zum Zeitpunkt der Spezifikation ist unter `https://adams-erben.de/` öffentlich nicht die aktuelle Projektseite erreichbar, sondern eine Parking-/Provider-Seite.

Damit ist die produktive Indexierbarkeit der eigentlichen Website derzeit der größte SEO-Blocker.

### 2.2 Aktueller Quellstand

Der Basis-Branch besitzt bereits eine gute Onpage-Grundlage:

- `lang="de"`;
- eindeutiger `<title>`;
- Meta-Description;
- Open-Graph-Basisdaten;
- semantische H1/H2/H3-Struktur;
- umfangreiche eigenständige Inhalte;
- interne Sprungnavigation;
- Alt-Texte für zentrale Bilder;
- WebP-Bilder;
- `loading="lazy"` / `decoding="async"` bei geeigneten Bildern;
- externe Quellen zu DRV, World Rowing, Hall of Fame, Stadt Ratzeburg und Forschung.

Die größte strukturelle Schwäche ist die Konzentration vieler unterschiedlicher Suchintentionen auf einen langen One-Pager.

---

## 3. SEO-Ziele

### 3.1 Primäre Ziele

1. Google und andere Suchmaschinen müssen die echte Website zuverlässig crawlen und indexieren können.
2. Jede wichtige Suchintention erhält eine eigene kanonische URL.
3. `Karl Adam` wird als zentrale thematische Entität der Website etabliert.
4. Der Film `Adams Acht` dient als Einstieg in weiterführende, eigenständige Inhalte.
5. Die Website soll langfristig auch unabhängig vom Film über Rudern, Ratzeburg und Vereinssuche gefunden werden.
6. Nutzer sollen aus Informationsseiten logisch zur Vereinssuche geführt werden.
7. Inhalte müssen fachlich nachvollziehbar, quellenbasiert und historisch verantwortungsvoll bleiben.

### 3.2 Messbare Zielgrößen

Nach Veröffentlichung und Indexierung sollen mindestens folgende technische Ziele erfüllt sein:

- alle freigegebenen Inhaltsseiten mit HTTP 200 erreichbar;
- nur eine kanonische Host-Variante;
- keine indexierbaren Duplicate-URLs;
- gültige `robots.txt`;
- gültige XML-Sitemap;
- jede indexierbare Seite mit einzigartigem `<title>`;
- jede indexierbare Seite mit eigener Meta-Description;
- jede indexierbare Seite mit `rel="canonical"`;
- genau eine primäre H1 pro Seite;
- keine kritischen Fehler in strukturierten Daten;
- keine absichtlich indexierbare Seite durch `noindex` oder `robots.txt` blockiert;
- Google Search Console eingerichtet und Sitemap eingereicht;
- Lighthouse SEO Zielwert >= 95 auf den zentralen Seitentypen;
- Core Web Vitals dürfen durch SEO-Erweiterungen nicht erkennbar verschlechtert werden.

---

## 4. Priorisierung

### P0 — vor bzw. unmittelbar mit Veröffentlichung

- echte Website unter der Hauptdomain ausliefern;
- kanonische Domain festlegen;
- Redirects für alternative Host-/Protokollvarianten;
- neue SEO-Informationsarchitektur vorbereiten;
- zentrale Seiten `Karl Adam`, `Adams Acht`, `Deutschlandachter 1960` anlegen;
- Title/Description der Startseite optimieren;
- `canonical` ergänzen;
- `robots.txt` anlegen;
- `sitemap.xml` generieren;
- Open-Graph-Bild ergänzen;
- Basis für strukturierte Daten implementieren;
- Search-Console-Verifikation ermöglichen;
- interne Links zwischen den neuen Seiten ergänzen.

### P1 — hohe Wirkung nach technischer Basis

- `Ratzeburg` als eigene Landingpage;
- `Karl Adams Trainingsmethoden` als eigene Landingpage;
- `Rudern verstehen` als dauerhaftes Content-Cluster;
- `Rudern lernen` / Einsteiger-Funnel;
- `Ruderverein finden` als indexierbare Conversion-Landingpage;
- E-E-A-T / Redaktion / Quellenprinzipien;
- optimierte Bild-Metadaten und responsive Images;
- Breadcrumbs und erweiterte strukturierte Daten;
- gezielte interne Verlinkung.

### P2 — Wachstum

- redaktionelle Evergreen-Beiträge;
- Ausbau anhand realer Search-Console-Suchanfragen;
- Link-Earning / Backlinks aus Ruder-, Regional- und Sportgeschichts-Kontext;
- weitere historische und technische Long-Tail-Themen;
- ggf. Bild-Sitemap und erweiterte Medien-SEO.

---

## 5. Kanonische Domain und Redirects

Als primäre URL wird festgelegt:

`https://adams-erben.de/`

Folgende Varianten müssen dauerhaft auf die kanonische Domain umleiten:

- `http://adams-erben.de/*`
- `http://www.adams-erben.de/*`
- `https://www.adams-erben.de/*`

Redirect-Anforderung:

- HTTP 301 oder 308;
- Pfad und Query-Parameter beibehalten;
- keine Redirect-Ketten;
- kein Mischbetrieb von `www` und non-`www`.

### Abnahmekriterium

Jede alternative Domainvariante erreicht die kanonische URL mit maximal einem Redirect.

---

## 6. Informationsarchitektur

### 6.1 Zielstruktur

Die Homepage bleibt emotionaler Einstieg und Wegweiser. Tiefere Suchintentionen erhalten eigene URLs.

Empfohlene erste Struktur:

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

### 6.2 Grundregel

Eine URL soll möglichst **eine dominante Suchintention** bedienen.

Keine künstliche Aufspaltung in dünne Seiten. Eine neue URL wird nur angelegt, wenn sie:

- einen eigenständigen Nutzerbedarf beantwortet;
- genügend eigene Substanz besitzt;
- intern sinnvoll verlinkt werden kann;
- langfristig gepflegt werden kann.

---

## 7. Homepage

### 7.1 Aufgabe

Die Startseite bleibt Marken- und Story-Einstieg. Sie muss gleichzeitig Suchmaschinen klar vermitteln, dass die Website Karl Adam, den Deutschlandachter und heutigen Rudersport verbindet.

### 7.2 Title

Zielrichtung:

`Karl Adam, Deutschlandachter & Rudern heute | Adams Erben`

Der exakte Title darf während der Umsetzung leicht angepasst werden, soll aber:

- `Karl Adam` enthalten;
- `Deutschlandachter` oder einen gleichwertigen Kernbegriff enthalten;
- die Marke `Adams Erben` enthalten;
- möglichst kompakt bleiben.

### 7.3 Meta-Description

Zielrichtung:

`Karl Adam revolutionierte von Ratzeburg aus den Rudersport. Entdecke den Deutschlandachter, seine Trainingsideen und finde einen Ruderverein in deiner Nähe.`

### 7.4 Hero

Der bestehende Claim bleibt sichtbar:

> **Der Film endet im Kino. Adams Erbe lebt im Bootshaus weiter.**

SEO-Title und sichtbare Hero-Headline müssen nicht identisch sein.

### 7.5 Interne Links

Die Homepage muss prominent verlinken auf:

- Karl Adam;
- Adams Acht;
- Deutschlandachter 1960;
- Ratzeburg;
- Rudern verstehen;
- Ruderverein finden.

---

## 8. Pillar-Page `/karl-adam/`

### 8.1 Ziel

Zentrale Wissensseite zu Karl Adam und semantischer Mittelpunkt der Website.

### 8.2 Suchintentionen

- Karl Adam
- Karl Adam Rudertrainer
- Karl Adam Ratzeburg
- Karl Adam Deutschlandachter
- Karl Adam Trainingsmethoden
- Ruderprofessor Karl Adam

### 8.3 Inhalt

Mindestens:

1. Kurzbiografie;
2. Ratzeburg und der RRC;
3. Deutschlandachter;
4. Trainings- und Technikansatz;
5. Athletenführung;
6. internationale Wirkung;
7. historische Verantwortung / NS-Kontext;
8. heutige Wirkung;
9. weiterführende Quellen.

### 8.4 Abgrenzung

Keine vollständige Konkurrenzbiografie zu spezialisierten Seiten oder Büchern. Die Seite soll Orientierung geben und gezielt in Detailseiten weiterführen.

### 8.5 Interne Links

Mindestens zu:

- `/deutschlandachter-1960/`
- `/karl-adam-trainingsmethoden/`
- `/ratzeburg/`
- `/adams-acht/`
- `/rudern-verstehen/`

---

## 9. Landingpage `/adams-acht/`

### 9.1 Rolle

Nicht die offizielle Filmseite ersetzen, sondern die Anschlussfragen beantworten, die nach Trailer, Pressebericht oder Kinobesuch entstehen.

### 9.2 Leitfragen

- Wer war Karl Adam wirklich?
- Auf welcher wahren Geschichte basiert der Film?
- Wer gehörte zum Deutschlandachter?
- Welche historischen Orte in Ratzeburg spielen eine Rolle?
- Welche Trainingsideen Adams sind bis heute relevant?
- Wie kann ich selbst Rudern ausprobieren?

### 9.3 Rechtliche / redaktionelle Abgrenzung

Sichtbarer Hinweis, dass `adams-erben.de` keine offizielle Website des Films, der Produktion oder des Verleihs ist.

Keine unlizenzierte Nutzung von Filmstills, Trailern, Key Art oder offiziellen Filmassets.

---

## 10. Landingpage `/deutschlandachter-1960/`

### 10.1 Ziel

Eigenständige Seite zur sporthistorischen Suchintention Deutschlandachter / Olympia Rom 1960.

### 10.2 Inhalte

- historischer Kontext;
- Mannschaft;
- Karl Adams Rolle;
- Vorbereitung;
- Rennen / olympische Bedeutung;
- Nachwirkung für den Deutschlandachter;
- Verbindungen zu Ratzeburg und Kiel;
- Quellen und weiterführende Medien.

### 10.3 Ausbauoptionen

Später möglich:

- Zeitleiste;
- Mannschaftsübersicht;
- historische Rennanalyse;
- Entwicklung der Achtertradition bis zur Weltbestzeit 2017.

---

## 11. Landingpage `/ratzeburg/`

### 11.1 Ziel

Ratzeburg als eigenständigen semantischen Ort der Karl-Adam- und Rudergeschichte aufbauen.

### 11.2 Inhalte

- Ratzeburger Ruderclub;
- Küchensee / Ruderrevier;
- Karl Adam;
- Ruderakademie;
- Internationale Ratzeburger Ruderregatta;
- Stadtführung / historische Orte;
- heutiges Rudern in Ratzeburg;
- lokale Quellen.

### 11.3 Suchintentionen

- Ratzeburg Rudern
- Ratzeburg Deutschlandachter
- Karl Adam Ratzeburg
- Ratzeburger Ruderclub
- Ruderakademie Ratzeburg
- Ratzeburger Ruderregatta

---

## 12. Landingpage `/karl-adam-trainingsmethoden/`

Die bestehenden Inhalte aus `Adams Labor` werden zu einer eigenständigen, quellenbasierten Seite ausgebaut.

### Themen

- Intervalltraining / Belastungssteuerung;
- Krafttraining;
- Blattgeometrie, Hebel und Rigging;
- Rhythmus, Schlagzahl und Messbarkeit;
- Höhentraining / Mexiko 1968;
- Athletenführung / mündiger Athlet;
- Vergleich `damals → Adam → heute`.

### Redaktionelle Regel

Keine unbelegte Formulierung `Karl Adam erfand X`.

Stattdessen sauber unterscheiden zwischen:

- Einführung;
- Übertragung aus anderen Sportarten;
- systematischer Nutzung;
- Weiterentwicklung;
- Popularisierung.

---

## 13. Content-Cluster `/rudern-verstehen/`

### 13.1 Ziel

Dauerhafter organischer Traffic unabhängig von Film und historischer Aktualität.

### 13.2 Startthemen

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

### 13.3 Struktur

Zu Beginn darf `/rudern-verstehen/` eine starke Übersichtsseite sein. Einzelne Unterseiten erst anlegen, sobald genug eigener Inhalt vorhanden ist.

Alle Einsteigerinhalte sollen sinnvoll auf `/rudern-lernen/` und `/ruderverein-finden/` verweisen.

---

## 14. Landingpage `/rudern-lernen/`

### 14.1 Nutzerfunnel

`Interesse → Unsicherheit abbauen → Einstieg erklären → Verein finden`

### 14.2 Leitfragen

- Kann jeder Rudern lernen?
- Bin ich zu alt für Rudern?
- Muss ich besonders fit sein?
- Muss ich schwimmen können?
- Was kostet Rudern im Verein?
- Welche Kleidung brauche ich?
- Wie läuft ein Schnuppertraining ab?
- Wie lange dauert es, Rudern zu lernen?
- Rudert man allein oder im Team?

### 14.3 Conversion

Primärer CTA:

`Ruderverein finden`

---

## 15. Landingpage `/ruderverein-finden/`

Die bestehende Vereinssuche bleibt funktional erhalten, erhält aber eine eigene indexierbare Zielseite.

### SEO-Text

Kurze, hilfreiche Erklärung vor oder nach dem Suchmodul:

- wie ein Probetraining typischerweise abläuft;
- warum direkte Vereinsaufnahme sinnvoll ist;
- welche Daten die Suche benötigt;
- Datenschutz / Standortverarbeitung;
- Alternativen, wenn kein Verein direkt in der Nähe gefunden wird.

Keine künstlichen automatisch generierten Stadtseiten ohne eigenständigen lokalen Inhalt.

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

### Social Image

Mindestens ein neutrales Adams-Erben-Social-Preview im Format ca. 1200 × 630 px.

Kein fremdes Film-Key-Art ohne Nutzungsrecht.

---

## 17. Canonical

Jede indexierbare HTML-Seite erhält eine selbstreferenzierende kanonische URL, z. B.:

`<link rel="canonical" href="https://adams-erben.de/karl-adam/">`

Query-Parameter der Vereinssuche dürfen nicht eigenständig indexiert werden, sofern sie keinen dauerhaften eigenständigen Inhalt darstellen.

---

## 18. robots.txt

Unter `/robots.txt` bereitstellen.

Minimalanforderung:

```txt
User-agent: *
Allow: /

Sitemap: https://adams-erben.de/sitemap.xml
```

Sensible technische/API-Pfade können bei Bedarf separat ausgeschlossen werden. `robots.txt` ist kein Sicherheitsmechanismus.

---

## 19. XML-Sitemap

Unter `/sitemap.xml` bereitstellen.

Enthält ausschließlich:

- kanonische URLs;
- freigegebene indexierbare Seiten;
- keine Redirects;
- keine 404-Seiten;
- keine `noindex`-Seiten;
- keine Query-Parameter-Varianten.

`lastmod` nur verwenden, wenn das Datum technisch zuverlässig gepflegt werden kann.

Die Sitemap soll im Build automatisch aus einer definierten Liste der öffentlichen Seiten erzeugt oder validiert werden.

---

## 20. Strukturierte Daten

JSON-LD bevorzugen.

### 20.1 Homepage

- `WebSite`
- passende `Organization`- oder Projektbeschreibung, ohne offizielle Partnerschaften zu suggerieren.

### 20.2 Karl Adam

- `Person`

Nur belegbare Attribute verwenden.

### 20.3 Redaktionelle Detailseiten

- `Article` oder `WebPage`
- `datePublished` nur wenn real vorhanden;
- `dateModified` nur wenn gepflegt;
- `author` / `publisher` korrekt und transparent.

### 20.4 Filmseite

`Movie` nur dann verwenden, wenn die erforderlichen Angaben korrekt und belastbar gepflegt werden können. Adams Erben darf dabei nicht als Produzent oder Rechteinhaber erscheinen.

### 20.5 Navigation

Bei mehreren eigenständigen Seiten:

- `BreadcrumbList`.

---

## 21. Überschriften und semantisches HTML

Pro Seite:

- genau eine primäre `<h1>`;
- hierarchische H2/H3-Struktur;
- keine Überschrift nur aus optischen Gründen;
- `<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`, `<section>` sinnvoll nutzen;
- Links müssen als echte `<a href>`-Links im HTML vorliegen, sofern sie Navigation darstellen.

Wichtige SEO-Inhalte dürfen nicht ausschließlich nach Nutzerinteraktion oder erst nach Client-seitigem API-Aufruf erscheinen.

---

## 22. Interne Verlinkung

### 22.1 Prinzip

Jede zentrale Seite soll mindestens zwei sinnvolle kontextuelle interne Links erhalten.

### 22.2 Hub-Modell

`Karl Adam` ist primärer historischer Hub.

`Rudern verstehen` ist primärer technischer Hub.

`Rudern lernen` ist primärer Einsteiger-Hub.

`Ruderverein finden` ist primärer Conversion-Hub.

### 22.3 Beispiel

`Adams Acht → Karl Adam → Deutschlandachter 1960 → Trainingsmethoden → Rudern verstehen → Rudern lernen → Ruderverein finden`

Keine überoptimierten Keyword-Linktexte. Linktexte sollen natürlich und beschreibend sein.

---

## 23. E-E-A-T / Vertrauenssignale

Eine Seite `/ueber-adams-erben/` wird angelegt oder vorbereitet.

Mindestens:

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

## 24. Bilder und Image SEO

### 24.1 Dateinamen

Sprechende Dateinamen bevorzugen:

- `karl-adam-ratzeburg.webp`
- `deutschlandachter-1960.webp`
- `ratzeburger-ruderregatta.webp`

Keine erzwungene Umbenennung bestehender Assets, wenn dadurch unnötige Risiken entstehen; neue Assets nach diesem Muster benennen.

### 24.2 HTML

Inhaltliche Bilder erhalten:

- sinnvollen `alt`-Text;
- `width` und `height` zur Layout-Stabilität;
- nach Möglichkeit `srcset` / `sizes`;
- `loading="lazy"` für unterhalb des sichtbaren Bereichs liegende Bilder;
- Hero/LCP-Bilder nicht pauschal lazy laden.

### 24.3 Kontext

Alt-Texte beschreiben das Bild, nicht eine Keyword-Liste.

Bildunterschriften und angrenzender Text sollen historischen Kontext liefern, wo dies fachlich sinnvoll ist.

---

## 25. Performance / Core Web Vitals

SEO-Änderungen dürfen die Performance nicht unnötig verschlechtern.

### Anforderungen

- keine großen unkomprimierten Bilder;
- Hero-/LCP-Asset gezielt priorisieren;
- kein unnötiges Third-Party-JavaScript;
- CSS/JS-Bundles klein halten;
- Layout Shifts durch definierte Medienabmessungen vermeiden;
- Fonts effizient laden;
- keine schweren Tracking-Skripte ohne klaren Bedarf und Datenschutzprüfung.

Zielwerte nach Möglichkeit:

- LCP <= 2,5 s;
- CLS <= 0,1;
- INP <= 200 ms.

Messung primär mobil.

---

## 26. Google Search Console

Nach Produktionsfreigabe:

1. Domain Property für `adams-erben.de` verifizieren;
2. Sitemap einreichen;
3. Indexierung zentraler Seiten prüfen;
4. zunächst besonders beobachten:
   - `/`
   - `/karl-adam/`
   - `/adams-acht/`
   - `/deutschlandachter-1960/`
   - `/ratzeburg/`
5. Coverage-/Indexierungsfehler beheben;
6. Suchanfragen und Impressions als Grundlage für P2-Content nutzen.

Ein Verifikationsmechanismus soll technisch möglich sein, ohne die Templates dauerhaft mit provider-spezifischen Resten zu verschmutzen.

---

## 27. Content-Strategie nach Kinostart

Keine Content-Masse produzieren.

Priorität haben wenige hochwertige Evergreen-Inhalte, z. B.:

- Warum Karl Adam den Rudersport veränderte
- Der Deutschlandachter 1960: Wer saß im Boot?
- Was ist an Adams Acht historisch belegt?
- Vom Macon-Blatt zum Big Blade
- Warum Ratzeburg zur Ruderstadt wurde
- Was bedeutet Rhythmus im Achter?
- Welche Ideen Karl Adams leben im modernen Training weiter?

Neue Themen werden anhand echter Nutzerfragen und Search-Console-Daten priorisiert.

---

## 28. Backlinks / externe Autorität

Kein automatisierter oder gekaufter Linkaufbau.

Bevorzugt werden natürliche redaktionelle Links aus:

- Rudervereinen;
- regionalen Institutionen;
- Stadt-/Tourismus-Kontext;
- Sportgeschichte;
- Verbands-/Ruderfachmedien;
- Ausstellungen / Veranstaltungen;
- fachlich passenden Podcasts und Medien.

Linkwürdige Assets können sein:

- Karl-Adam-Zeitleiste;
- interaktive oder statische Karte historischer Orte;
- Mannschaftsübersicht Deutschlandachter 1960;
- verständliche Grafiken zu Trainings- und Rudertechnik;
- quellenbasierte Gegenüberstellung `damals → Adam → heute`.

---

## 29. Nicht-Ziele

- kein Keyword-Stuffing;
- keine automatisch erzeugten dünnen Stadt-/Vereinsseiten;
- kein Kopieren von Wikipedia-, Film-, DRV- oder Partnertexten;
- keine Doorway Pages;
- keine versteckten SEO-Texte;
- keine Fake-Reviews oder erfundenen Testimonials;
- keine erfundenen Autoren oder Expertenprofile;
- keine künstliche Vervielfachung gleicher Inhalte auf mehreren URLs;
- keine Filmasset-Nutzung ohne geklärte Rechte;
- keine Heroisierung oder Ausblendung historisch problematischer Aspekte;
- keine bezahlten Backlinks oder Linktausch-Netzwerke.

---

## 30. Technische Umsetzung

Die bestehende statische Architektur soll soweit sinnvoll erhalten bleiben.

Bevor eine neue Framework-Abhängigkeit eingeführt wird, prüfen, ob die Anforderungen über den bestehenden Build erfüllt werden können.

### Build muss unterstützen

- mehrere statische HTML-Ausgabeseiten oder äquivalente crawlbare URLs;
- gemeinsame Partials / Komponenten;
- zentrale Meta-Konfiguration pro Seite;
- automatische Canonical-Erzeugung;
- automatische Sitemap-Erzeugung;
- konsistente Open-Graph-Daten;
- wiederverwendbares JSON-LD;
- zentrale Navigation;
- Build-Validierung für fehlende SEO-Pflichtfelder.

### Empfohlene Seiten-Metadatenstruktur

Beispielhaft:

```js
{
  path: '/karl-adam/',
  title: 'Karl Adam: Rudertrainer, Deutschlandachter & Ideen | Adams Erben',
  description: '...',
  canonical: 'https://adams-erben.de/karl-adam/',
  ogImage: '/assets/images/og-karl-adam.webp',
  index: true
}
```

Die konkrete Implementierung kann an den bestehenden Build angepasst werden.

---

## 31. SEO-Validierung im Build

Wenn mit vertretbarem Aufwand möglich, soll ein Build-Check folgende Fehler erkennen:

- fehlender `<title>`;
- doppelter Title innerhalb der bekannten Seiten;
- fehlende Meta-Description;
- fehlender Canonical;
- fehlende H1;
- mehr als eine H1;
- fehlendes `lang`;
- fehlendes `og:title` / `og:description` / `og:image`;
- indexierbare Seite fehlt in Sitemap;
- Sitemap enthält nicht indexierbare Seite.

Fehler sollen den Produktionsbuild nach Möglichkeit fehlschlagen lassen; Warnungen reichen für weiche Qualitätsmerkmale.

---

## 32. Rollout-Reihenfolge

### Phase A — technische SEO-Basis

1. Domain-/Redirect-Konzept prüfen;
2. `canonical`;
3. `robots.txt`;
4. `sitemap.xml`;
5. OG-/Twitter-Metadaten;
6. JSON-LD-Basis;
7. Search-Console-Verifikation vorbereiten.

### Phase B — Seitenarchitektur

1. `/karl-adam/`;
2. `/adams-acht/`;
3. `/deutschlandachter-1960/`;
4. `/ratzeburg/`;
5. `/karl-adam-trainingsmethoden/`;
6. `/rudern-verstehen/`;
7. `/rudern-lernen/`;
8. `/ruderverein-finden/`;
9. `/ueber-adams-erben/`.

### Phase C — interne Optimierung

- Navigation;
- Breadcrumbs;
- interne Links;
- Bildoptimierung;
- strukturierte Daten erweitern;
- E-E-A-T;
- Performance prüfen.

### Phase D — Veröffentlichung und Messung

- Produktion ausliefern;
- Search Console;
- Sitemap einreichen;
- Indexierung kontrollieren;
- Core Web Vitals prüfen;
- Suchanfragen beobachten;
- P2-Prioritäten anhand echter Daten setzen.

---

## 33. Definition of Done

Der SEO-Branch gilt als technisch fertig, wenn:

- [ ] die Website in mehrere sinnvolle, crawlbare Zielseiten strukturiert ist;
- [ ] Homepage und jede Zielseite einen individuellen SEO-Title besitzen;
- [ ] jede Zielseite eine individuelle Description besitzt;
- [ ] jede Zielseite eine selbstreferenzierende Canonical-URL besitzt;
- [ ] eine gültige `robots.txt` vorliegt;
- [ ] eine gültige `sitemap.xml` vorliegt;
- [ ] Sitemap nur kanonische indexierbare HTTP-200-Seiten enthält;
- [ ] Open-Graph-Bilder und `summary_large_image` unterstützt werden;
- [ ] strukturierte Daten für die zentralen Seitentypen implementiert sind;
- [ ] genau eine H1 pro Zielseite vorhanden ist;
- [ ] die zentralen Seiten untereinander kontextuell verlinkt sind;
- [ ] die Vereinssuche weiterhin vollständig funktioniert;
- [ ] keine neuen Third-Party-Tracker ohne Freigabe hinzugekommen sind;
- [ ] Bildrechte-/Quellenhinweise weiterhin eingehalten werden;
- [ ] historische Verantwortung nicht durch SEO-Kürzungen verloren geht;
- [ ] mobile Darstellung geprüft ist;
- [ ] Lighthouse SEO auf zentralen Seitentypen >= 95 erreicht oder begründete Restabweichungen dokumentiert sind;
- [ ] Produktions-Deployment nicht mehr die Provider-/Parking-Seite ausliefert;
- [ ] Search Console nach Deployment verifiziert und Sitemap eingereicht werden kann.

---

## 34. Erfolgskriterium

Der Erfolg wird nicht an einer einzelnen Rankingposition gemessen.

Nach einigen Wochen bzw. Monaten sollen Search-Console-Daten zeigen, dass `adams-erben.de` Impressionen für mehrere der folgenden Themenfelder erhält:

- Karl Adam;
- Deutschlandachter;
- Adams Acht;
- Ratzeburg + Rudern;
- Karl Adam + Training;
- Rudern verstehen;
- Rudern lernen;
- Ruderverein finden.

Langfristig soll der organische Traffic nicht ausschließlich vom Kinostart oder vom Markennamen `Adams Erben` abhängen.
