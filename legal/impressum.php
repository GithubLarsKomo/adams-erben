<?php
declare(strict_types=1);

function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function cfg(string $key): string { return trim((string) getenv($key)); }

$preview = cfg('PREVIEW_MODE') === '1';
$name = cfg('SITE_OPERATOR_NAME');
$address = cfg('SITE_OPERATOR_ADDRESS');
$email = cfg('SITE_OPERATOR_EMAIL');
$phone = cfg('SITE_OPERATOR_PHONE');
$responsible = cfg('SITE_RESPONSIBLE_NAME');
$legalForm = cfg('SITE_OPERATOR_LEGAL_FORM');
$representative = cfg('SITE_OPERATOR_REPRESENTATIVE');
$register = cfg('SITE_OPERATOR_REGISTER');
$registerNumber = cfg('SITE_OPERATOR_REGISTER_NUMBER');
$vatId = cfg('SITE_OPERATOR_VAT_ID');
$businessId = cfg('SITE_OPERATOR_BUSINESS_ID');
$complete = $name !== '' && $address !== '' && $email !== '' && $responsible !== '';
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php if ($preview): ?><meta name="robots" content="noindex,nofollow"><?php endif; ?>
  <title>Impressum – Adams Erben</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header class="site-header"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">AE</span><span><strong>Adams Erben</strong><small>Rudern beginnt vor deiner Haustür.</small></span></a></header>
  <main class="legal-page">
    <p class="eyebrow">Rechtliches</p>
    <h1>Impressum</h1>

    <?php if (!$complete): ?>
      <p class="missing-config"><strong><?= $preview ? 'Prototyp:' : 'Nicht produktionsbereit:' ?></strong> Die Betreiberangaben sind in dieser Instanz noch nicht vollständig konfiguriert. Der Production-Container ist so ausgelegt, dass er mit fehlenden Pflichtangaben nicht startet.</p>
    <?php endif; ?>

    <?php if ($complete): ?>
      <h2>Angaben gemäß § 5 DDG</h2>
      <p><?= h($name) ?><?php if ($legalForm !== ''): ?><br><?= h($legalForm) ?><?php endif; ?><br><?= nl2br(h($address)) ?></p>

      <?php if ($representative !== ''): ?>
        <h2>Vertretungsberechtigte Person</h2>
        <p><?= h($representative) ?></p>
      <?php endif; ?>

      <?php if ($register !== '' || $registerNumber !== ''): ?>
        <h2>Registereintrag</h2>
        <p><?php if ($register !== ''): ?>Register: <?= h($register) ?><?php endif; ?><?php if ($registerNumber !== ''): ?><br>Registernummer: <?= h($registerNumber) ?><?php endif; ?></p>
      <?php endif; ?>

      <?php if ($vatId !== '' || $businessId !== ''): ?>
        <h2>Steuerliche Kennzeichnungen</h2>
        <p><?php if ($vatId !== ''): ?>Umsatzsteuer-Identifikationsnummer: <?= h($vatId) ?><?php endif; ?><?php if ($businessId !== ''): ?><br>Wirtschafts-Identifikationsnummer: <?= h($businessId) ?><?php endif; ?></p>
      <?php endif; ?>

      <h2>Kontakt</h2>
      <p>E-Mail: <a href="mailto:<?= h($email) ?>"><?= h($email) ?></a><?php if ($phone !== ''): ?><br>Telefon: <?= h($phone) ?><?php endif; ?></p>

      <h2>Verantwortlich für journalistisch-redaktionelle Inhalte gemäß § 18 Abs. 2 MStV</h2>
      <p><?= h($responsible) ?><br><?= nl2br(h($address)) ?></p>
    <?php endif; ?>

    <h2>Unabhängigkeit des Angebots</h2>
    <p>„Adams Erben“ ist eine unabhängige Orientierungshilfe zum Rudersport. Die Website ist kein offizielles Angebot des Kinofilms „Adams Acht“, seiner Produktion oder seines Verleihs und kein offizielles Angebot des Deutschen Ruderverbands, von World Rowing, des Ratzeburger Ruderclubs, des Podcasts „Schubschlag“ oder sonstiger auf dieser Website genannter Organisationen. Die Nennung von Namen und Angeboten dient der sachlichen Einordnung und Verlinkung.</p>

    <h2>Externe Links</h2>
    <p>Diese Website verlinkt unter anderem auf Angebote von Verbänden, Vereinen, Medienplattformen und weiteren externen Quellen. Für die Inhalte externer Seiten sind deren jeweilige Betreiber verantwortlich.</p>
    <p><a href="/">Zurück zur Startseite</a></p>
  </main>
</body>
</html>
