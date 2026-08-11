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
$smtpProvider = cfg('SMTP_PROVIDER_NAME', '[SMTP_PROVIDER_NAME]');
$smtpAddress = cfg('SMTP_PROVIDER_ADDRESS', '[SMTP_PROVIDER_ADDRESS]');
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
      <p class="missing-config"><strong>Hinweis zur Vorschau:</strong> Diese öffentliche Prototypversion enthält nur Demo-Daten. Das Kontaktformular wird vollständig lokal im Browser demonstriert. Beim Betätigen von „Demo-Anfrage absenden“ werden keine Formularinhalte an den Server übertragen und keine E-Mail versendet.</p>
    <?php endif; ?>

    <h2>1. Verantwortlicher</h2>
    <?php if ($operator !== '[SITE_OPERATOR_NAME]' && $address !== '[SITE_OPERATOR_ADDRESS]' && $email !== '[SITE_OPERATOR_EMAIL]'): ?>
      <p><?= h($operator) ?><br><?= nl2br(h($address)) ?><br>E-Mail: <a href="mailto:<?= h($email) ?>"><?= h($email) ?></a></p>
    <?php else: ?>
      <p>Die vollständigen Betreiberangaben sind in dieser Preview-Instanz noch nicht konfiguriert und müssen vor öffentlicher Bewerbung bzw. Produktivsetzung ergänzt werden.</p>
    <?php endif; ?>

    <h2>2. Grundsatz der Datenminimierung</h2>
    <p>Adams Erben setzt für die Vereinssuche keine Analyse- oder Werbetracker ein, bindet keine externen Schriftarten ein und verwendet keine Marketing-Cookies. Film- und Vereinsseiten sowie der YouTube-Trailer werden nur als externe Links geöffnet; auf dieser Website wird kein YouTube-Player eingebettet.</p>

    <h2>3. Cookies und lokale Speicherung</h2>
    <p>Adams Erben verwendet derzeit keine Cookies und speichert keine Informationen mittels Local Storage, Session Storage oder vergleichbarer clientseitiger Speichertechniken auf deinem Endgerät. Es werden keine Analyse-, Werbe- oder Trackingdienste eingesetzt. Daher ist derzeit kein Cookie- oder Consent-Banner erforderlich.</p>
    <p>Sollte sich die technische Ausstattung der Website künftig ändern, wird diese Datenschutzerklärung entsprechend aktualisiert und – soweit rechtlich erforderlich – vor dem Speichern oder Auslesen von Informationen auf dem Endgerät eine Einwilligung eingeholt.</p>

    <h2>4. Hosting und Serverprotokolle</h2>
    <p>Die Website wird bei <?= h($hosting) ?>, <?= h($hostingAddress) ?>, betrieben. Beim Abruf der Website werden technisch insbesondere IP-Adresse, Zeitpunkt, angeforderte Ressource, Browser-/Geräteinformationen und Übertragungsstatus verarbeitet. Webserver, Container-Plattform und Hostinganbieter können diese Angaben in technischen Zugriffs- und Sicherheitsprotokollen verarbeiten.</p>
    <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt im sicheren und zuverlässigen Betrieb der Website.</p>

    <h2>5. Vereinssuche und Vereinskontaktdaten</h2>
    <?php if ($preview): ?>
      <p>Die Vorschau verwendet einen kleinen, klar als Demo gekennzeichneten Datensatz. Neben wenigen realen Referenzeinträgen enthält er fiktive Demo-Rudervereine, damit Suche, Filter und die unterschiedlichen Kontaktzustände gezeigt werden können. Er ist ausdrücklich kein vollständiger DRV-Datenbestand. Im Preview-Modus werden keine angereicherten Vereins-E-Mail-Adressen für einen Versand verwendet.</p>
    <?php else: ?>
      <p>Für die Vereinssuche werden öffentlich zugängliche Organisationsdaten aus dem Vereinsverzeichnis des Deutschen Ruderverbands und – soweit dort Angaben fehlen oder überprüft werden müssen – aus den öffentlich zugänglichen offiziellen Webseiten der jeweiligen Vereine und Verbände zusammengeführt. Dazu gehören insbesondere Vereins-/Verbandsname, Ort, Postleitzahl, Bundesland, DRV-ID, Website und Link zum DRV-Profil.</p>
      <p>Öffentlich vorgesehene Funktions- und Rollenadressen können serverseitig als direkter Kontakt der jeweiligen Organisation verarbeitet werden. E-Mail-Adressen werden nicht als aggregierte Liste an den Browser ausgeliefert. Personalisierte oder nicht ausreichend belegte Adressen werden nach der technischen Governance nicht automatisch als Empfänger freigegeben.</p>
      <p>Liegt für einen Verein keine freigegebene direkte E-Mail-Adresse vor, erzeugt Adams Erben für diesen Verein keine Kontakt-Route. Insbesondere erfolgt keine automatische Weiterleitung an einen Landesruderverband oder den Deutschen Ruderverband. Soweit vorhanden, wird stattdessen auf die Website des Vereins verwiesen; andernfalls werden nur die verfügbaren Orts- oder Adressinformationen angezeigt.</p>
      <p>Für jeden automatischen Direktkontakt werden Quelle und Zeitpunkt der letzten Verifikation geführt. Veraltete, widersprüchliche, unterdrückte oder nicht eindeutig dem Verein zuzuordnende Kontakte werden nicht automatisch verwendet.</p>
    <?php endif; ?>
    <p>Vereine und betroffene Funktionsträger können über die oben genannte E-Mail-Adresse des Verantwortlichen die Berichtigung oder Entfernung von Vereins- und Routingdaten sowie die Unterdrückung einer erneuten automatischen Aufnahme verlangen. Eine solche Korrektur hat Vorrang vor späteren automatischen Crawling-Ergebnissen.</p>

    <h2>6. Suche nach Vereinen in der Nähe</h2>
    <p>Für die Umkreissuche wird ein zum Zeitpunkt des Website-Builds erzeugtes lokales Verzeichnis deutscher Postleitzahlen, Ortsnamen und zugehöriger geografischer Näherungskoordinaten zusammen mit der Website ausgeliefert. Nach dem Laden der Seite werden Ort oder Postleitzahl im Browser gegen dieses lokale Verzeichnis aufgelöst und die Luftlinienentfernung zu den Vereinen direkt im Browser berechnet. Dabei wird kein externer Karten-, Geocoding- oder Suchdienst aufgerufen.</p>
    <p>Optional kann die Browserfunktion „Standort verwenden“ genutzt werden. Die dadurch vom Browser bereitgestellten Koordinaten werden von Adams Erben nur im laufenden Browserkontext für die Entfernungsberechnung verwendet und von der Anwendung nicht an einen Karten- oder Geocoding-Dienst übertragen. Die Standortfreigabe kann im Browser abgelehnt werden; die Vereinssuche funktioniert weiterhin über Ort oder Postleitzahl.</p>

    <h2>7. Kontaktformular</h2>
    <?php if ($preview): ?>
      <p>Im Preview-Modus findet kein Kontaktversand statt. Die Eingaben verbleiben im Browser und werden beim Demo-Absenden nicht per HTTP an den Server übertragen. Die serverseitige Kontakt-API blockiert den Versand zusätzlich im Preview-Modus.</p>
    <?php else: ?>
      <p>Wenn du das Kontaktformular verwendest, verarbeiten wir deinen Namen, deine E-Mail-Adresse, optional deine Postleitzahl, die ausgewählte Organisation und den Nachrichtentext. Diese Daten werden ausschließlich verwendet, um die von dir gewünschte Anfrage zu versenden.</p>
      <p>Das Kontaktformular wird nur angeboten, wenn für die ausgewählte Organisation selbst ein freigegebener direkter Empfänger vorhanden ist. Die Empfängeradresse ist nicht frei wählbar und wird serverseitig aus einer beim Website-Build erzeugten Routingliste bestimmt. Die technische Prüfung stellt zusätzlich sicher, dass Empfängerorganisation und ausgewählte Organisation identisch sind. Es gibt kein Fallback-Routing an einen Landesruderverband oder den Deutschen Ruderverband.</p>
      <p>Landesruderverbände und der Deutsche Ruderverband können als eigene Verzeichniseinträge direkt kontaktiert werden, sofern für den jeweils ausdrücklich ausgewählten Eintrag selbst ein freigegebener direkter Kontakt vorliegt.</p>
      <p>Rechtsgrundlage für den Versand deiner Formularinhalte ist deine Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.</p>
    <?php endif; ?>

    <?php if (!$preview): ?>
      <h2>8. E-Mail-Versand</h2>
      <p>Für den technischen Versand wird ein SMTP-Dienst eingesetzt. Konfigurierter Anbieter: <?= h($smtpProvider) ?>, <?= h($smtpAddress) ?>. Dabei werden die für die E-Mail-Zustellung erforderlichen Daten an diesen Dienst übermittelt.</p>

      <h2>9. Missbrauchsschutz</h2>
      <p>Zum Schutz der Vereine und Verbände vor automatisiertem Spam verwendet das Formular einen unsichtbaren Honeypot, Zeitplausibilitätsprüfungen, eine Herkunftsprüfung und ein serverseitiges Rate Limit.</p>

      <h2>10. Speicherdauer</h2>
      <p>Die Anwendung speichert abgesendete Kontaktanfragen nicht in einer eigenen Nachrichten-Datenbank. Sie werden unmittelbar über den konfigurierten SMTP-Dienst an den direkten Empfänger der ausgewählten Organisation übertragen.</p>
    <?php endif; ?>

    <h2><?= $preview ? '8' : '11' ?>. Deine Rechte</h2>
    <p>Du hast nach Maßgabe der gesetzlichen Voraussetzungen insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Außerdem besteht das Recht auf Beschwerde bei einer zuständigen Datenschutzaufsichtsbehörde.</p>

    <h2><?= $preview ? '9' : '12' ?>. Externe Links</h2>
    <p>Beim Anklicken externer Links – etwa zu rudern.de, Vereinswebsites, der offiziellen Filmseite oder YouTube – verlässt du Adams Erben. Ab diesem Zeitpunkt gelten die Datenschutzbestimmungen des jeweiligen externen Anbieters.</p>

    <h2><?= $preview ? '10' : '13' ?>. Stand</h2>
    <p>Stand: 11. August 2026.</p>
    <p><a href="/">Zurück zur Startseite</a></p>
  </main>
</body>
</html>