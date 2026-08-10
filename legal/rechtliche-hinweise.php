<?php
declare(strict_types=1);

function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function cfg(string $key, string $fallback = ''): string {
    $value = trim((string) getenv($key));
    return $value !== '' ? $value : $fallback;
}

$preview = cfg('PREVIEW_MODE') === '1';
$operator = cfg('SITE_OPERATOR_NAME', '[SITE_OPERATOR_NAME]');
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
    <p>Adams Erben ist eine unabhängige Initiative. Die Website ist keine offizielle Website des Films „Adams Acht“, der Filmproduktion, des Verleihs, des Deutschen Ruderverbands e.V. (DRV), eines Landesruderverbands oder eines einzelnen Rudervereins.</p>
    <p>Namen wie „Adams Acht“, Vereins- und Verbandsnamen sowie sonstige Kennzeichen werden ausschließlich beschreibend verwendet, um auf den Film, den Rudersport und die jeweils bezeichneten Organisationen hinzuweisen. Aus ihrer Nennung folgt keine wirtschaftliche, organisatorische oder redaktionelle Verbindung und keine Empfehlung oder Freigabe durch die jeweiligen Rechteinhaber.</p>

    <h2>2. Urheberrecht und Kennzeichen</h2>
    <p>Die von Adams Erben selbst erstellten Texte, Gestaltungselemente, Grafiken und Softwarebestandteile sind nach Maßgabe der gesetzlichen Vorschriften geschützt. Eine Vervielfältigung, Bearbeitung oder Weiterverwendung außerhalb der gesetzlichen Schranken bedarf der vorherigen Zustimmung des jeweiligen Rechteinhabers.</p>
    <p>Rechte an Namen, Marken, Logos, Filmtiteln, Filmplakaten, Filmstills, Vereins- oder Verbandskennzeichen verbleiben bei den jeweiligen Rechteinhabern. Adams Erben verwendet ohne gesonderte Freigabe keine fremden Filmplakate, Filmstills oder Logos als eigene Gestaltungselemente.</p>
    <p>Reine Tatsachenangaben zu Vereinen und Verbänden – etwa Name, Ort, Postleitzahl, Website oder Verbandszuordnung – werden als Organisationsinformationen verarbeitet. Damit wird kein Anspruch auf ausschließliche Rechte an diesen Tatsachenangaben erhoben.</p>

    <h2>3. Quellen und Vereinsdaten</h2>
    <p>Die Vereinssuche verwendet öffentlich zugängliche Organisationsinformationen. Ausgangspunkt sind insbesondere öffentlich zugängliche Angaben des Deutschen Ruderverbands; fehlende oder zu überprüfende Angaben können anhand der offiziellen Websites der jeweiligen Vereine und Verbände ergänzt oder verifiziert werden.</p>
    <p>Adams Erben führt zu automatisiert verwendeten Kontaktdaten Herkunft und Zeitpunkt der letzten Verifikation. Öffentliche E-Mail-Adressen werden nicht als frei abrufbare Gesamtliste bereitgestellt. Für das Kontakt-Routing gelten zusätzliche technische Prüfungen zur Organisationszuordnung, Aktualität und Missbrauchsvermeidung.</p>
    <p>Maßgeblich für die offiziellen Angaben eines Vereins oder Verbands bleibt dessen eigene Veröffentlichung bzw. die jeweils zuständige offizielle Verbandsquelle.</p>

    <h2>4. Richtigkeit und Aktualität</h2>
    <p>Die Inhalte werden mit angemessener Sorgfalt zusammengestellt. Vereinsanschriften, Websites, Funktionszuständigkeiten und andere Organisationsdaten können sich jedoch kurzfristig ändern. Eine Gewähr für Vollständigkeit, jederzeitige Aktualität oder Fehlerfreiheit wird im gesetzlich zulässigen Umfang nicht übernommen.</p>
    <p>Adams Erben ist eine Orientierungshilfe zur Kontaktaufnahme und ersetzt keine verbindliche Auskunft des jeweiligen Vereins, Verbands oder einer anderen zuständigen Stelle.</p>

    <h2>5. Externe Links</h2>
    <p>Diese Website enthält Links zu externen Angeboten, insbesondere zu Vereins- und Verbandsseiten, zur offiziellen Filmseite und zu Medienplattformen. Für die Inhalte und den Betrieb externer Websites sind deren jeweilige Anbieter verantwortlich. Adams Erben macht sich fremde Inhalte nicht allein durch das Setzen eines Links zu eigen.</p>
    <p>Bei Bekanntwerden konkreter Rechtsverletzungen oder offensichtlich ungeeigneter Ziele werden entsprechende Links nach Prüfung entfernt oder korrigiert.</p>

    <h2>6. Kontaktvermittlung</h2>
    <p>Das Kontaktformular dient ausschließlich der Vermittlung einer vom Nutzer gewünschten Anfrage an einen Ruderverein oder – falls dort kein geeigneter freigegebener Kontakt verfügbar ist – an den zuständigen Landesruderverband bzw. den DRV.</p>
    <p>Adams Erben schuldet weder eine Antwort des Empfängers noch die Annahme eines Probetrainings, einer Mitgliedschaft oder sonstigen Leistung durch einen Verein oder Verband. Inhalt und weitere Bearbeitung der Anfrage liegen nach der Übermittlung beim jeweiligen Empfänger.</p>

    <h2>7. Hinweise zu automatisierter Datenpflege</h2>
    <p>Zur Aktualisierung der Vereinssuche können öffentlich zugängliche offizielle Webseiten in begrenzten Abständen automatisiert abgerufen werden. Die technische Datenpflege ist auf Organisations- und Kontaktinformationen beschränkt, verwendet begrenzte Abrufraten und berücksichtigt technische Zugriffsbeschränkungen. Uneindeutige oder nicht sicher einer Organisation zuordenbare Kontakte werden nicht automatisch als direkter Routingempfänger freigegeben.</p>

    <h2>8. Berichtigung, Entfernung und Hinweise</h2>
    <?php if ($email !== '[SITE_OPERATOR_EMAIL]'): ?>
      <p>Hinweise auf fehlerhafte, veraltete oder unerwünschte Vereins- und Kontaktdaten sowie sonstige rechtliche Hinweise können an <a href="mailto:<?= h($email) ?>"><?= h($email) ?></a> gesendet werden. Berechtigte Korrektur- oder Unterdrückungswünsche werden bei der weiteren Datenpflege berücksichtigt.</p>
    <?php else: ?>
      <p>Vor der Produktivsetzung wird an dieser Stelle die Kontaktadresse des Betreibers für Hinweise auf fehlerhafte, veraltete oder unerwünschte Vereins- und Kontaktdaten ergänzt.</p>
    <?php endif; ?>

    <h2>9. Haftung</h2>
    <p>Es gelten die gesetzlichen Haftungsregelungen. Soweit gesetzlich zulässig, wird keine Haftung für Nachteile übernommen, die allein daraus entstehen, dass öffentlich zugängliche Organisationsinformationen zwischenzeitlich veraltet sind, ein externer Link nicht mehr erreichbar ist oder ein Verein bzw. Verband auf eine vermittelte Anfrage nicht reagiert.</p>
    <p>Unberührt bleiben insbesondere zwingende gesetzliche Haftungstatbestände sowie die Haftung für Vorsatz, grobe Fahrlässigkeit und für Schäden aus der Verletzung von Leben, Körper oder Gesundheit nach Maßgabe des anwendbaren Rechts.</p>

    <h2>10. Stand</h2>
    <p>Stand: 10. August 2026.</p>
    <p><a href="/">Zurück zur Startseite</a></p>
  </main>
</body>
</html>
