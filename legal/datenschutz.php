<?php
declare(strict_types=1);

function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function cfg(string $key, string $fallback = ''): string {
    $value = trim((string) getenv($key));
    return $value !== '' ? $value : $fallback;
}

$preview = cfg('PREVIEW_MODE') === '1';
$operator = cfg('SITE_OPERATOR_NAME', '[SITE_OPERATOR_NAME]');
$address = cfg('SITE_OPERATOR_ADDRESS', '[SITE_OPERATOR_ADDRESS]');
$email = cfg('SITE_OPERATOR_EMAIL', '[SITE_OPERATOR_EMAIL]');
$hosting = cfg('HOSTING_PROVIDER_NAME', 'Hetzner Online GmbH');
$hostingAddress = cfg('HOSTING_PROVIDER_ADDRESS', 'Industriestr. 25, 91710 Gunzenhausen, Deutschland');
$hostingRetention = cfg('HOSTING_LOG_RETENTION', '[HOSTING_LOG_RETENTION]');
$smtpProvider = cfg('SMTP_PROVIDER_NAME', '[SMTP_PROVIDER_NAME]');
$smtpAddress = cfg('SMTP_PROVIDER_ADDRESS', '[SMTP_PROVIDER_ADDRESS]');
$smtpRetention = cfg('SMTP_LOG_RETENTION', '[SMTP_LOG_RETENTION]');
$smtpDpa = cfg('SMTP_DPA_STATUS');
$smtpTransfer = cfg('SMTP_TRANSFER_NOTE');
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php if ($preview): ?><meta name="robots" content="noindex,nofollow"><?php endif; ?>
  <title>Datenschutz – Adams Erben</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header class="site-header"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">AE</span><span><strong>Adams Erben</strong><small>Rudern beginnt vor deiner Haustür.</small></span></a></header>
  <main class="legal-page">
    <p class="eyebrow">Rechtliches</p>
    <h1>Datenschutzerklärung</h1>

    <?php if ($preview): ?>
      <p class="missing-config"><strong>Hinweis zur Vorschau:</strong> Diese Vorschau enthält Demo-Daten. Das Kontaktformular wird lokal demonstriert; beim Demo-Absenden werden keine Formularinhalte an den Server übertragen und keine E-Mail versendet.</p>
    <?php endif; ?>

    <h2>1. Verantwortlicher</h2>
    <?php if ($operator !== '[SITE_OPERATOR_NAME]' && $address !== '[SITE_OPERATOR_ADDRESS]' && $email !== '[SITE_OPERATOR_EMAIL]'): ?>
      <p><?= h($operator) ?><br><?= nl2br(h($address)) ?><br>E-Mail: <a href="mailto:<?= h($email) ?>"><?= h($email) ?></a></p>
    <?php else: ?>
      <p>Die vollständigen Betreiberangaben sind in dieser Preview-Instanz noch nicht konfiguriert.</p>
    <?php endif; ?>

    <h2>2. Datenminimierung und externe Inhalte</h2>
    <p>Adams Erben setzt keine Analyse- oder Werbetracker ein, bindet keine externen Schriftarten ein und verwendet keine Marketing-Cookies. Externe Medienangebote wie YouTube, World Rowing, Sportdeutschland.tv oder Podcastseiten werden ausschließlich über normale Links geöffnet. Beim normalen Seitenabruf werden keine Logo- oder Medienassets automatisiert von diesen Drittanbietern nachgeladen.</p>

    <h2>3. Cookies und lokale Speicherung</h2>
    <p>Adams Erben verwendet derzeit keine Cookies und speichert keine Informationen mittels Local Storage, Session Storage oder vergleichbarer clientseitiger Speichertechniken auf deinem Endgerät. Daher ist derzeit kein Cookie- oder Consent-Banner erforderlich.</p>
    <p>Sollte sich die technische Ausstattung künftig ändern, wird diese Datenschutzerklärung aktualisiert und – soweit erforderlich – vor dem Speichern oder Auslesen von Informationen auf dem Endgerät eine Einwilligung eingeholt.</p>

    <h2>4. Hosting und Serverprotokolle</h2>
    <p>Die Website wird bei <?= h($hosting) ?>, <?= h($hostingAddress) ?>, betrieben. Beim Abruf der Website werden technisch insbesondere IP-Adresse, Zeitpunkt, angeforderte Ressource, Browser-/Geräteinformationen und Übertragungsstatus verarbeitet. Webserver, Reverse Proxy, Container-Plattform und Hostinganbieter können diese Angaben in technischen Zugriffs- und Sicherheitsprotokollen verarbeiten.</p>
    <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt im sicheren und zuverlässigen Betrieb der Website.</p>
    <p>Die für den Produktivbetrieb dokumentierte Aufbewahrungsregel für technische Hosting-/Serverprotokolle lautet: <strong><?= h($hostingRetention) ?></strong>.</p>

    <h2>5. Vereinssuche und Vereinskontaktdaten</h2>
    <?php if ($preview): ?>
      <p>Die Vorschau verwendet einen kleinen Demo-Datensatz. Es erfolgt keine produktive Weiterleitung von Kontaktanfragen.</p>
    <?php else: ?>
      <p>Für die Vereinssuche werden ausschließlich die für die Orientierung erforderlichen Organisationsdaten verarbeitet. Die produktive Nutzung automatisiert bezogener DRV-Daten ist technisch an eine ausdrücklich dokumentierte Freigabe gebunden. Dazu gehören insbesondere Vereins-/Verbandsname, Ort, Postleitzahl, Bundesland, Website und Link zum offiziellen Profil.</p>
      <p>Öffentlich vorgesehene Funktions- und Rollenadressen können serverseitig als direkter Kontakt der jeweiligen Organisation verarbeitet werden. E-Mail-Adressen werden nicht als aggregierte Liste an den Browser ausgeliefert. Personalisierte oder nicht ausreichend belegte Adressen werden nicht automatisch als Empfänger freigegeben.</p>
      <p>Liegt für eine Organisation keine freigegebene direkte E-Mail-Adresse vor, wird kein Kontaktformular angeboten. Es erfolgt kein automatisches Fallback an einen Landesruderverband oder den Deutschen Ruderverband.</p>
    <?php endif; ?>
    <p>Vereine und betroffene Funktionsträger können über die oben genannte E-Mail-Adresse Berichtigung, Entfernung oder Unterdrückung von Vereins- und Routingdaten verlangen.</p>

    <h2>6. Suche nach Vereinen in der Nähe</h2>
    <p>Ort oder Postleitzahl werden im Browser gegen ein lokal ausgeliefertes Verzeichnis aufgelöst. Die Entfernungsberechnung erfolgt lokal; dabei wird kein externer Karten-, Geocoding- oder Suchdienst aufgerufen.</p>
    <p>Optional kann die Browserfunktion „Standort verwenden“ genutzt werden. Die bereitgestellten Koordinaten werden nur im laufenden Browserkontext für die Entfernungsberechnung verwendet und von Adams Erben nicht an einen Karten- oder Geocoding-Dienst übertragen.</p>

    <h2>7. Kontaktformular</h2>
    <?php if ($preview): ?>
      <p>Im Preview-Modus findet kein Kontaktversand statt.</p>
    <?php else: ?>
      <p>Wenn du das Kontaktformular verwendest, verarbeiten wir deinen Namen, deine E-Mail-Adresse, optional deine Postleitzahl, die ausgewählte Organisation und den Nachrichtentext ausschließlich zur Übermittlung deiner Anfrage an die ausdrücklich ausgewählte Organisation.</p>
      <p>Rechtsgrundlage ist deine Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Du kannst eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.</p>
      <p>Nach erfolgreicher Übermittlung verarbeitet die ausgewählte Organisation die empfangene Nachricht grundsätzlich in eigener datenschutzrechtlicher Verantwortung. Adams Erben kann deren anschließende interne Speicher- und Bearbeitungsdauer nicht bestimmen.</p>
    <?php endif; ?>

    <?php if (!$preview): ?>
      <h2>8. E-Mail-Versand / SMTP</h2>
      <p>Für den technischen Versand wird <?= h($smtpProvider) ?>, <?= h($smtpAddress) ?>, eingesetzt. Übermittelt werden die für die Zustellung erforderlichen Daten, insbesondere Absendername, Antwortadresse, ausgewählte Organisation, Nachrichtentext und technische Zustellungsdaten.</p>
      <p>Die für den Produktivbetrieb dokumentierte Aufbewahrungsregel für SMTP-/Zustellungsprotokolle lautet: <strong><?= h($smtpRetention) ?></strong>.</p>
      <?php if ($smtpDpa !== ''): ?><p>Auftragsverarbeitung: <?= h($smtpDpa) ?></p><?php endif; ?>
      <?php if ($smtpTransfer !== ''): ?><p>Hinweis zu Drittlandübermittlungen/Transfermechanismen: <?= h($smtpTransfer) ?></p><?php endif; ?>

      <h2>9. Missbrauchsschutz und Rate Limiting</h2>
      <p>Zum Schutz des Kontaktformulars vor Spam und automatisiertem Missbrauch wird die IP-Adresse für das Rate Limiting nicht im Klartext gespeichert. Stattdessen wird unter Verwendung eines serverseitigen Geheimnisses ein Hashwert gebildet. Gespeichert werden dieser Hashwert sowie Zeitpunkte vorheriger Anfragen.</p>
      <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt im Schutz der Website und der angeschlossenen Organisationen vor Spam und Missbrauch. Die Rate-Limit-Daten werden nach dem aktuellen technischen Stand spätestens nach <strong>24 Stunden</strong> entfernt.</p>

      <h2>10. Eigene Nachrichtenspeicherung</h2>
      <p>Die Anwendung führt keine eigene Nachrichten-Datenbank. Formularinhalte werden unmittelbar über den konfigurierten SMTP-Dienst an die ausgewählte Organisation übertragen. SMTP-Systeme können technische Zustellungsdaten im oben beschriebenen Umfang speichern; die empfangende Organisation kann die Nachricht anschließend eigenständig weiterverarbeiten und speichern.</p>
    <?php endif; ?>

    <h2><?= $preview ? '8' : '11' ?>. Deine Rechte</h2>
    <p>Du hast nach Maßgabe der gesetzlichen Voraussetzungen insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Außerdem besteht das Recht auf Beschwerde bei einer zuständigen Datenschutzaufsichtsbehörde.</p>

    <h2><?= $preview ? '9' : '12' ?>. Externe Links</h2>
    <p>Beim Anklicken externer Links verlässt du Adams Erben. Erst dann gelten die Datenschutzbestimmungen des jeweiligen externen Anbieters.</p>

    <h2><?= $preview ? '10' : '13' ?>. Stand</h2>
    <p>Stand: 14. August 2026.</p>
    <p><a href="/">Zurück zur Startseite</a></p>
  </main>
</body>
</html>
