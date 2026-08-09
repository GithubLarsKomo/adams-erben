<?php
declare(strict_types=1);

function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function cfg(string $key): string { return trim((string) getenv($key)); }

$name = cfg('SITE_OPERATOR_NAME');
$address = cfg('SITE_OPERATOR_ADDRESS');
$email = cfg('SITE_OPERATOR_EMAIL');
$phone = cfg('SITE_OPERATOR_PHONE');
$responsible = cfg('SITE_RESPONSIBLE_NAME');
$complete = $name !== '' && $address !== '' && $email !== '' && $responsible !== '';
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Impressum – Adams Erben</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">AE</span><span><strong>Adams Erben</strong><small>Rudern beginnt vor deiner Haustür.</small></span></a>
  </header>
  <main class="legal-page">
    <p class="eyebrow">Rechtliches</p>
    <h1>Impressum</h1>

    <?php if (!$complete): ?>
      <p class="missing-config"><strong>Nicht produktionsbereit:</strong> Die Betreiberangaben sind noch nicht vollständig konfiguriert. Der Healthcheck liefert deshalb HTTP 503.</p>
    <?php endif; ?>

    <h2>Angaben gemäß § 5 DDG</h2>
    <p>
      <?= h($name ?: '[SITE_OPERATOR_NAME]') ?><br>
      <?= nl2br(h($address ?: '[SITE_OPERATOR_ADDRESS]')) ?>
    </p>

    <h2>Kontakt</h2>
    <p>
      E-Mail: <a href="mailto:<?= h($email ?: 'bitte-konfigurieren@example.invalid') ?>"><?= h($email ?: '[SITE_OPERATOR_EMAIL]') ?></a>
      <?php if ($phone !== ''): ?><br>Telefon: <?= h($phone) ?><?php endif; ?>
    </p>

    <h2>Verantwortlich für redaktionelle Inhalte</h2>
    <p>
      <?= h($responsible ?: '[SITE_RESPONSIBLE_NAME]') ?><br>
      <?= nl2br(h($address ?: '[SITE_OPERATOR_ADDRESS]')) ?>
    </p>

    <h2>Hinweis zum Filmbezug</h2>
    <p>„Adams Erben“ ist eine unabhängige Orientierungshilfe zum Rudersport. Die Website ist kein offizielles Angebot des Kinofilms „Adams Acht“, seiner Produktion, des Filmverleihs, des Ratzeburger Ruderclubs oder des Deutschen Ruderverbands. Die Nennung des Filmtitels dient der sachlichen Einordnung des Projekts.</p>

    <h2>Externe Links</h2>
    <p>Diese Website verlinkt unter anderem auf Angebote des Deutschen Ruderverbands, von Rudervereinen, der offiziellen Filmseite und YouTube. Für die Inhalte externer Seiten sind deren jeweilige Betreiber verantwortlich.</p>

    <p><a href="/">Zurück zur Startseite</a></p>
  </main>
</body>
</html>
