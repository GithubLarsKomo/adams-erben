<?php
declare(strict_types=1);

function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function cfg(string $key, string $fallback = ''): string {
    $value = trim((string) getenv($key));
    return $value !== '' ? $value : $fallback;
}

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
  <title>Datenschutz – Adams Erben</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">AE</span><span><strong>Adams Erben</strong><small>Rudern beginnt vor deiner Haustür.</small></span></a>
  </header>
  <main class="legal-page">
    <p class="eyebrow">Rechtliches</p>
    <h1>Datenschutzerklärung</h1>

    <h2>1. Verantwortlicher</h2>
    <p><?= h($operator) ?><br><?= nl2br(h($address)) ?><br>E-Mail: <a href="mailto:<?= h($email) ?>"><?= h($email) ?></a></p>

    <h2>2. Grundsatz der Datenminimierung</h2>
    <p>Adams Erben setzt für die Vereinssuche keine Analyse- oder Werbetracker ein, bindet keine externen Schriftarten ein und verwendet keine Marketing-Cookies. Film- und Vereinsseiten sowie der YouTube-Trailer werden nur als externe Links geöffnet; auf dieser Website wird kein YouTube-Player eingebettet.</p>

    <h2>3. Hosting</h2>
    <p>Die Website wird bei <?= h($hosting) ?>, <?= h($hostingAddress) ?>, betrieben. Beim Abruf einer Website müssen technisch insbesondere IP-Adresse, Zeitpunkt, angeforderte Ressource, Browser-/Geräteinformationen und Übertragungsstatus verarbeitet werden. Die Anwendung selbst führt kein dauerhaftes Zugriffsprotokoll mit diesen Daten. Eine Verarbeitung auf Infrastruktur- und Sicherheitsebene des Hostinganbieters kann dennoch stattfinden.</p>
    <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt im sicheren und zuverlässigen Betrieb der Website.</p>

    <h2>4. Vereinssuche</h2>
    <p>Für die clientseitige Suche werden Organisationsdaten aus der öffentlichen Vereinssuche des Deutschen Ruderverbands bereitgestellt, insbesondere Vereins-/Verbandsname, Ort, Postleitzahl, Bundesland, DRV-ID, Website und Link zum DRV-Profil. Öffentliche E-Mail-Adressen werden bewusst nicht als aggregierte Liste an den Browser ausgeliefert.</p>

    <h2>5. Kontaktformular</h2>
    <p>Wenn du das Kontaktformular verwendest, verarbeiten wir deinen Namen, deine E-Mail-Adresse, optional deine Postleitzahl, den ausgewählten Verein bzw. Verband und den Nachrichtentext. Diese Daten werden ausschließlich verwendet, um die von dir gewünschte Anfrage zu versenden.</p>
    <p>Die Empfängeradresse ist nicht frei wählbar. Das System verwendet eine beim Website-Build erzeugte, serverseitige Routingliste. Soweit eine öffentliche Kontaktadresse des gewählten Vereins vorliegt, geht die Nachricht dorthin. Anderenfalls erfolgt die Weiterleitung an den zuständigen Landesruderverband und, wenn auch dort keine Adresse verfügbar ist, an den Deutschen Ruderverband.</p>
    <p>Rechtsgrundlage für den Versand ist deine Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Die Einwilligung wird unmittelbar vor dem Versand über die Checkbox im Formular erteilt. Nach erfolgtem Versand befindet sich die Nachricht beim jeweiligen Empfänger; dieser verarbeitet die Anfrage in eigener datenschutzrechtlicher Verantwortung.</p>

    <h2>6. E-Mail-Versand</h2>
    <p>Für den technischen Versand wird ein SMTP-Dienst eingesetzt. Konfigurierter Anbieter: <?= h($smtpProvider) ?>, <?= h($smtpAddress) ?>. Dabei werden die für die E-Mail-Zustellung erforderlichen Daten an diesen Dienst übermittelt. Vor Produktivsetzung müssen Anbieter, Vertrags-/AVV-Situation und etwaige Drittlandtransfers geprüft und diese Angaben vervollständigt werden.</p>

    <h2>7. Missbrauchsschutz</h2>
    <p>Zum Schutz der Vereine vor automatisiertem Spam verwendet das Formular einen unsichtbaren Honeypot, Zeitplausibilitätsprüfungen und ein serverseitiges Rate Limit. Hierfür wird die anfragende IP-Adresse zusammen mit einem geheimen Serverwert gehasht; gespeichert wird nur dieser Hash mit Zeitstempeln. Diese Einträge werden spätestens nach 24 Stunden verworfen. Nachrichtentext, Name und E-Mail-Adresse werden für das Rate Limit nicht gespeichert.</p>
    <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse besteht im Schutz des Dienstes und der angeschlossenen Vereine vor Missbrauch.</p>

    <h2>8. Speicherdauer</h2>
    <p>Die Anwendung speichert abgesendete Kontaktanfragen nicht in einer Datenbank. Sie werden unmittelbar über den konfigurierten SMTP-Dienst an den ermittelten Empfänger übertragen. Für die weitere Speicherung in den E-Mail-Systemen des Absenders, SMTP-Dienstes und Empfängers gelten deren jeweilige Aufbewahrungsregeln. Rate-Limit-Daten werden spätestens nach 24 Stunden entfernt.</p>

    <h2>9. Deine Rechte</h2>
    <p>Du hast nach Maßgabe der gesetzlichen Voraussetzungen insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Eine erteilte Einwilligung kannst du mit Wirkung für die Zukunft widerrufen. Außerdem besteht das Recht auf Beschwerde bei einer zuständigen Datenschutzaufsichtsbehörde.</p>

    <h2>10. Externe Links</h2>
    <p>Beim Anklicken externer Links – etwa zu rudern.de, Vereinswebsites, der offiziellen Filmseite oder YouTube – verlässt du Adams Erben. Ab diesem Zeitpunkt gelten die Datenschutzbestimmungen des jeweiligen externen Anbieters.</p>

    <h2>11. Stand</h2>
    <p>Stand: 9. August 2026. Die Datenschutzerklärung wird vor dem öffentlichen Start nochmals gegen die tatsächlich konfigurierte Hosting- und SMTP-Infrastruktur geprüft.</p>

    <p><a href="/">Zurück zur Startseite</a></p>
  </main>
</body>
</html>
