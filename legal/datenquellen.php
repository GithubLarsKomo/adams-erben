<?php
declare(strict_types=1);

function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function cfg(string $key, string $fallback = ''): string {
    $value = trim((string) getenv($key));
    return $value !== '' ? $value : $fallback;
}

$preview = cfg('PREVIEW_MODE') === '1';
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php if ($preview): ?><meta name="robots" content="noindex,nofollow"><?php endif; ?>
  <title>Datenquellen und Lizenzen – Adams Erben</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header class="site-header"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">AE</span><span><strong>Adams Erben</strong><small>Rudern beginnt vor deiner Haustür.</small></span></a></header>
  <main class="legal-page">
    <p class="eyebrow">Transparenz</p>
    <h1>Datenquellen und Lizenzen</h1>
    <p>Diese Seite dokumentiert wesentliche externe Datenquellen und die Herkunft ausgewählter Inhalte. Sie ergänzt Impressum, Datenschutzerklärung und rechtliche Hinweise.</p>

    <h2>1. Vereins- und Verbandsinformationen</h2>
    <p>Für die Vereinssuche können öffentlich zugängliche Organisationsinformationen des Deutschen Ruderverbands (DRV) und der jeweiligen Vereine bzw. Verbände technisch aufbereitet werden. Dazu zählen insbesondere Name, Ort, Postleitzahl, Bundesland, Website, Verbandszuordnung und Link zum offiziellen Profil.</p>
    <p>Adams Erben ist kein offizielles Angebot des Deutschen Ruderverbands. Maßgeblich für aktuelle und verbindliche Angaben bleiben die Veröffentlichungen des jeweiligen Vereins oder Verbands und die offiziellen DRV-Angebote.</p>
    <p>Eine produktive automatisierte Nutzung von DRV-Verzeichnisdaten ist technisch an einen ausdrücklich freigegebenen Betriebsmodus und eine dokumentierte Daten-Nutzungsgrundlage gebunden.</p>

    <h2>2. GeoNames</h2>
    <p>Postleitzahl-, Orts- und Geokoordinatendaten für die lokale Ortssuche und Entfernungsberechnung beruhen teilweise auf Daten von <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer">GeoNames</a> unter <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution 4.0 (CC BY 4.0)</a>.</p>
    <p>Für Adams Erben werden ausschließlich die für Ortssuche und Entfernungsberechnung erforderlichen Felder ausgewählt, normalisiert, zusammengeführt und technisch aufbereitet. Diese Aufbereitung verändert nicht die Rechte am ursprünglichen GeoNames-Datenbestand.</p>

    <h2>3. Bilder und Fotografien</h2>
    <p>Eigene Fotografien und projektintern erstellte Illustrationen werden als solche im internen Rechtekataster geführt. Fremde Fotografien werden nur verwendet, wenn eine dokumentierte Freigabe oder Lizenz für die konkrete Nutzung vorliegt.</p>
    <p>Das aktuelle Foto des Ratzeburger Ruderclubs wird mit Freigabe des Ratzeburger Ruderclubs verwendet. Das auf der Seite eingesetzte Foto der Ratzeburger Regatta ist eine eigene Aufnahme des Seitenbetreibers.</p>

    <h2>4. Logos und Kennzeichen</h2>
    <p>Fremde Logos werden nur bei dokumentierter Freigabe lokal auf dem Server von Adams Erben bereitgestellt. Es gibt kein automatisches Nachladen von Logo-Dateien von Servern der Rechteinhaber.</p>
    <p>Die Verwendung eines Logos oder die Verlinkung eines Angebots bedeutet nicht, dass die jeweilige Organisation Adams Erben unterstützt, sponsert oder autorisiert, sofern dies nicht ausdrücklich anders angegeben ist.</p>

    <h2>5. Externe Medien und Quellen</h2>
    <p>World Rowing, Deutscher Ruderverband, Schubschlag, YouTube, Sportdeutschland.tv und weitere externe Angebote werden ausschließlich über normale Links geöffnet. Inhalte dieser Anbieter werden nicht automatisch in die Website eingebettet oder von deren Servern als Laufzeit-Assets nachgeladen.</p>

    <h2>6. Korrekturen und Rechtehinweise</h2>
    <p>Hinweise zu fehlerhaften Quellenangaben, erforderlichen Korrekturen oder Rechten an verwendeten Inhalten können an die im <a href="/impressum.php">Impressum</a> genannte Kontaktadresse gerichtet werden.</p>

    <h2>7. Stand</h2>
    <p>Stand: 14. August 2026.</p>
    <p><a href="/">Zurück zur Startseite</a></p>
  </main>
</body>
</html>
