<?php
declare(strict_types=1);

function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function cfg(string $key, string $fallback = ''): string {
    $value = trim((string) getenv($key));
    return $value !== '' ? $value : $fallback;
}

$preview = cfg('PREVIEW_MODE') === '1';
$email = cfg('SITE_OPERATOR_EMAIL', '[SITE_OPERATOR_EMAIL]');
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php if ($preview): ?><meta name="robots" content="noindex,nofollow"><?php endif; ?>
  <title>Rechtliche Hinweise – Adams Erben</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header class="site-header"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">AE</span><span><strong>Adams Erben</strong><small>Rudern beginnt vor deiner Haustür.</small></span></a></header>
  <main class="legal-page">
    <p class="eyebrow">Rechtliches</p>
    <h1>Rechtliche Hinweise</h1>
    <p>Diese Hinweise ergänzen das <a href="/impressum.php">Impressum</a> und die <a href="/datenschutz.php">Datenschutzerklärung</a> von Adams Erben.</p>

    <h2>1. Unabhängiges Projekt</h2>
    <p>Adams Erben ist eine unabhängige Initiative. Die Website ist keine offizielle Website des Films „Adams Acht“, der Filmproduktion, des Verleihs, des Deutschen Ruderverbands e.V. (DRV), von World Rowing, eines Landesruderverbands, eines einzelnen Rudervereins oder anderer verlinkter Medienangebote.</p>
    <p>Namen, Titel, Vereins- und Verbandsnamen sowie sonstige Kennzeichen werden beschreibend verwendet, um auf den Film, den Rudersport und die jeweils bezeichneten Organisationen oder Angebote hinzuweisen. Aus ihrer Nennung folgt keine wirtschaftliche, organisatorische oder redaktionelle Verbindung und keine Empfehlung oder Freigabe durch die jeweiligen Rechteinhaber.</p>

    <h2>2. Urheberrecht, Marken und Logos</h2>
    <p>Die von Adams Erben selbst erstellten Texte, Gestaltungselemente, Grafiken und Softwarebestandteile sind nach Maßgabe der gesetzlichen Vorschriften geschützt. Eine Vervielfältigung, Bearbeitung oder Weiterverwendung außerhalb der gesetzlichen Schranken bedarf der vorherigen Zustimmung des jeweiligen Rechteinhabers.</p>
    <p>Rechte an Namen, Marken, Logos, Filmtiteln, Filmplakaten, Filmstills, Vereins- oder Verbandskennzeichen verbleiben bei den jeweiligen Rechteinhabern. Die auf Adams Erben verwendeten Logos von World Rowing, dem Deutschen Ruderverband und Schubschlag werden auf Grundlage dokumentierter Nutzungsrechte eingesetzt und ausschließlich lokal von adams-erben.de ausgeliefert.</p>
    <p>Es gibt für Logos und andere Medienassets <strong>keine externen Runtime-Fallbacks, kein Hotlinking und kein automatisches Nachladen von Drittservern</strong>. Fehlt ein lokales Asset, darf die Seite nicht ersatzweise eine externe Datei abrufen.</p>
    <p>Filmplakate, Filmstills und sonstige geschützte Medien werden ohne geklärte Nutzungsrechte nicht als eigene Gestaltungselemente veröffentlicht.</p>

    <h2>3. Quellen und Vereinsdaten</h2>
    <p>Die Vereinssuche ist auf Organisationsinformationen beschränkt, die für die Suche und Kontaktorientierung erforderlich sind. Eine produktive automatisierte Nutzung des DRV-Vereinsverzeichnisses wird technisch nur freigegeben, wenn hierfür eine dokumentierte Nutzungs- bzw. Rechtebasis vorliegt.</p>
    <p>Öffentliche E-Mail-Adressen werden nicht als frei abrufbare Gesamtliste bereitgestellt. Für das Kontakt-Routing gelten zusätzliche technische Prüfungen zur Organisationszuordnung, Aktualität und Missbrauchsvermeidung. Personalisierte Kontakte werden niemals automatisch freigegeben; automatisches Routing ist ausschließlich für hinreichend verifizierte Organisations-, Funktions- oder Rollenadressen vorgesehen.</p>
    <p>Maßgeblich für offizielle Angaben eines Vereins oder Verbands bleibt dessen eigene Veröffentlichung beziehungsweise die jeweils zuständige offizielle Verbandsquelle.</p>

    <h2>4. GeoNames-Daten</h2>
    <p>Für die lokale Zuordnung von Postleitzahlen, Ortsnamen und geografischen Näherungskoordinaten verwendet Adams Erben Daten von <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer">GeoNames</a> unter der Lizenz <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution 4.0 (CC BY 4.0)</a>.</p>
    <p>Gegenüber der Quelle werden nur die für Vereinssuche und lokale Entfernungsberechnung benötigten Felder übernommen und für den lokalen Einsatz technisch aufbereitet. Die Berechnung erfolgt im Browser; die Eingabe des Nutzers wird dafür nicht an GeoNames übertragen.</p>

    <h2>5. Richtigkeit und Aktualität</h2>
    <p>Die Inhalte werden mit angemessener Sorgfalt zusammengestellt. Vereinsanschriften, Websites, Funktionszuständigkeiten und andere Organisationsdaten können sich jedoch ändern. Eine Gewähr für Vollständigkeit, jederzeitige Aktualität oder Fehlerfreiheit wird im gesetzlich zulässigen Umfang nicht übernommen.</p>
    <p>Adams Erben ist eine Orientierungshilfe zur Kontaktaufnahme und ersetzt keine verbindliche Auskunft des jeweiligen Vereins, Verbands oder einer anderen zuständigen Stelle.</p>

    <h2>6. Externe Links</h2>
    <p>Diese Website enthält normale Links zu externen Angeboten, insbesondere zu Vereins- und Verbandsseiten, zur offiziellen Filmseite und zu Medienplattformen. Für die Inhalte und den Betrieb externer Websites sind deren jeweilige Anbieter verantwortlich. Adams Erben macht sich fremde Inhalte nicht allein durch das Setzen eines Links zu eigen.</p>
    <p>Externe Ziele werden erst durch eine bewusste Nutzeraktion aufgerufen; die Website bindet sie nicht als automatische Runtime-Ressourcen ein.</p>
    <p>Bei Bekanntwerden konkreter Rechtsverletzungen oder offensichtlich ungeeigneter Ziele werden entsprechende Links nach Prüfung entfernt oder korrigiert.</p>

    <h2>7. Kontaktvermittlung</h2>
    <p>Das Kontaktformular dient ausschließlich der Vermittlung einer vom Nutzer gewünschten Anfrage an die von ihm ausdrücklich ausgewählte Organisation. Das Formular wird nur angeboten, wenn für genau diese Organisation selbst ein freigegebener direkter Kontakt vorhanden ist.</p>
    <p>Besteht für die ausgewählte Organisation kein solcher direkter Kontakt, erfolgt <strong>kein automatisches Fallback</strong> an einen Landesruderverband oder den Deutschen Ruderverband. Stattdessen wird – soweit vorhanden – auf die Website der Organisation verwiesen oder es werden die verfügbaren Orts- beziehungsweise Adressinformationen angezeigt.</p>
    <p>Adams Erben schuldet weder eine Antwort des Empfängers noch die Annahme eines Probetrainings, einer Mitgliedschaft oder sonstigen Leistung. Inhalt und weitere Bearbeitung der Anfrage liegen nach der Übermittlung beim jeweiligen Empfänger.</p>

    <h2>8. Automatisierte Datenpflege</h2>
    <p>Automatisierte Aktualisierungen öffentlicher Organisationsdaten dürfen im Produktivbetrieb nur innerhalb der dokumentierten rechtlichen und technischen Freigabe erfolgen. Technische Zugriffsbeschränkungen einschließlich robots.txt werden respektiert; sie ersetzen keine erforderliche Nutzungs- oder Rechteklärung.</p>

    <h2>9. Berichtigung, Entfernung und Hinweise</h2>
    <?php if ($email !== '[SITE_OPERATOR_EMAIL]'): ?>
      <p>Hinweise auf fehlerhafte, veraltete oder unerwünschte Vereins- und Kontaktdaten sowie sonstige rechtliche Hinweise können an <a href="mailto:<?= h($email) ?>"><?= h($email) ?></a> gesendet werden. Berechtigte Korrektur- oder Unterdrückungswünsche werden bei der weiteren Datenpflege berücksichtigt.</p>
    <?php else: ?>
      <p>In der Preview ist die Betreiberadresse noch nicht konfiguriert.</p>
    <?php endif; ?>

    <h2>10. Haftung</h2>
    <p>Es gelten die gesetzlichen Haftungsregelungen. Soweit gesetzlich zulässig, wird keine Haftung für Nachteile übernommen, die allein daraus entstehen, dass öffentlich zugängliche Organisationsinformationen zwischenzeitlich veraltet sind, ein externer Link nicht mehr erreichbar ist oder eine Organisation auf eine vermittelte Anfrage nicht reagiert.</p>
    <p>Unberührt bleiben insbesondere zwingende gesetzliche Haftungstatbestände sowie die Haftung für Vorsatz, grobe Fahrlässigkeit und für Schäden aus der Verletzung von Leben, Körper oder Gesundheit nach Maßgabe des anwendbaren Rechts.</p>

    <h2>11. Stand</h2>
    <p>Stand: 14. August 2026.</p>
    <p><a href="/">Zurück zur Startseite</a></p>
  </main>
</body>
</html>
