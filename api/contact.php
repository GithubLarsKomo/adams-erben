<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

require '/var/www/vendor/autoload.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (getenv('PREVIEW_MODE') === '1') {
    respond(409, ['error' => 'Der Kontaktversand ist in der öffentlichen Vorschau deaktiviert.']);
}

function envRequired(string $key): string {
    $value = trim((string) getenv($key));
    if ($value === '') {
        throw new RuntimeException("Missing required configuration: {$key}");
    }
    return $value;
}

function cleanText(mixed $value, int $max): string {
    $value = trim((string) $value);
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    if (mb_strlen($value) > $max) {
        $value = mb_substr($value, 0, $max);
    }
    return $value;
}

function assertOrigin(): void {
    $allowedOrigin = rtrim((string) getenv('PUBLIC_ORIGIN'), '/');
    $origin = rtrim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
    if ($allowedOrigin === '') {
        throw new RuntimeException('PUBLIC_ORIGIN is not configured');
    }
    if ($origin === '' && getenv('ALLOW_NO_ORIGIN') === '1') {
        return;
    }
    if (!hash_equals($allowedOrigin, $origin)) {
        respond(403, ['error' => 'Ungültige Herkunft der Anfrage.']);
    }
}

function enforceRateLimit(string $recipientKey): void {
    $salt = envRequired('RATE_LIMIT_SALT');
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $ipKey = hash('sha256', $salt . '|' . $ip);
    $recipientKey = hash('sha256', $salt . '|recipient|' . $recipientKey);
    $file = sys_get_temp_dir() . '/adams-erben-contact-rate.json';
    $now = time();
    $window = 3600;
    $retention = 86400;

    $handle = fopen($file, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Rate-limit storage unavailable');
    }
    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('Rate-limit lock unavailable');
        }
        $raw = stream_get_contents($handle);
        $data = $raw ? json_decode($raw, true) : [];
        if (!is_array($data)) $data = [];
        $data['ip'] ??= [];
        $data['recipient'] ??= [];

        foreach (['ip', 'recipient'] as $bucket) {
            foreach ($data[$bucket] as $key => $timestamps) {
                $timestamps = array_values(array_filter((array) $timestamps, fn($ts) => is_int($ts) && $ts >= $now - $retention));
                if ($timestamps) $data[$bucket][$key] = $timestamps;
                else unset($data[$bucket][$key]);
            }
        }

        $recentIp = array_values(array_filter((array) ($data['ip'][$ipKey] ?? []), fn($ts) => $ts >= $now - $window));
        $recentRecipient = array_values(array_filter((array) ($data['recipient'][$recipientKey] ?? []), fn($ts) => $ts >= $now - $window));

        if (count($recentIp) >= 4 || count($recentRecipient) >= 12) {
            respond(429, ['error' => 'Zu viele Anfragen in kurzer Zeit. Bitte versuche es später erneut.']);
        }

        $data['ip'][$ipKey] = [...$recentIp, $now];
        $data['recipient'][$recipientKey] = [...$recentRecipient, $now];
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($data));
        fflush($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Nur POST ist erlaubt.']);
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 12288) {
    respond(413, ['error' => 'Anfrage ist zu groß.']);
}

try {
    assertOrigin();
    $payload = json_decode((string) file_get_contents('php://input'), true, 32, JSON_THROW_ON_ERROR);
    if (!is_array($payload)) respond(400, ['error' => 'Ungültige Anfrage.']);

    if (cleanText($payload['website'] ?? '', 200) !== '') {
        respond(202, ['ok' => true]);
    }

    $startedAt = (int) ($payload['startedAt'] ?? 0);
    $ageMs = (int) floor(microtime(true) * 1000) - $startedAt;
    if ($startedAt <= 0 || $ageMs < 3000 || $ageMs > 7_200_000) {
        respond(400, ['error' => 'Bitte öffne das Kontaktformular erneut und versuche es noch einmal.']);
    }

    $organizationId = cleanText($payload['organization'] ?? '', 160);
    $name = cleanText($payload['name'] ?? '', 100);
    $email = cleanText($payload['email'] ?? '', 254);
    $postalCode = cleanText($payload['postalCode'] ?? '', 10);
    $message = cleanText($payload['message'] ?? '', 2000);
    $consent = (string) ($payload['consent'] ?? '0') === '1';

    if (!preg_match('/^[a-z0-9-]+$/', $organizationId)) respond(422, ['error' => 'Ungültiger Verein.']);
    if ($name === '' || mb_strlen($name) < 2) respond(422, ['error' => 'Bitte gib deinen Namen an.']);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(422, ['error' => 'Bitte gib eine gültige E-Mail-Adresse an.']);
    if (mb_strlen($message) < 10) respond(422, ['error' => 'Bitte schreibe eine etwas ausführlichere Nachricht.']);
    if (!$consent) respond(422, ['error' => 'Bitte bestätige die Datenübermittlung.']);

    $recipientFile = '/opt/adams-erben/recipients.json';
    $recipientData = json_decode((string) file_get_contents($recipientFile), true, 64, JSON_THROW_ON_ERROR);
    $route = $recipientData['recipients'][$organizationId] ?? null;
    if (!is_array($route)) respond(422, ['error' => 'Für diesen Eintrag ist aktuell kein Kontakt-Routing verfügbar.']);

    $recipient = cleanText($route['email'] ?? '', 254);
    $organizationName = cleanText($route['organizationName'] ?? $organizationId, 180);
    $state = cleanText($route['state'] ?? '', 80);
    $routeLevel = in_array($route['routeLevel'] ?? '', ['club', 'lrv', 'drv'], true) ? $route['routeLevel'] : 'drv';
    if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('Resolved recipient is invalid');
    }

    enforceRateLimit($recipient);

    $routeTarget = match ($routeLevel) {
        'club' => $organizationName,
        'lrv' => $state !== '' ? "zuständiger Landesruderverband ({$state})" : 'zuständiger Landesruderverband',
        default => 'Deutscher Ruderverband e.V.'
    };

    $intro = "Diese Nachricht wurde über adams-erben.de versendet.\n"
        . "Adams Erben ist eine unabhängige Orientierungshilfe zum Rudersport und keine offizielle Website des Films „Adams Acht“, der Filmproduktion, des Filmverleihs oder des Deutschen Ruderverbands.\n"
        . "Die anfragende Person hat auf der Website „{$organizationName}“ ausgewählt. Das automatische Routing führt diese Nachricht an: {$routeTarget}.\n";

    $body = $intro
        . "\n--- Anfrage ---\n"
        . "Name: {$name}\n"
        . "E-Mail: {$email}\n"
        . ($postalCode !== '' ? "PLZ: {$postalCode}\n" : '')
        . "\n{$message}\n"
        . "\n--- Ende der Anfrage ---\n"
        . "Bitte antworte direkt an die im Reply-To hinterlegte E-Mail-Adresse der anfragenden Person.\n";

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = envRequired('SMTP_HOST');
    $mail->Port = (int) (getenv('SMTP_PORT') ?: 587);
    $mail->SMTPAuth = true;
    $mail->Username = envRequired('SMTP_USERNAME');
    $mail->Password = envRequired('SMTP_PASSWORD');
    $encryption = strtolower((string) (getenv('SMTP_ENCRYPTION') ?: 'tls'));
    if ($encryption === 'ssl' || $encryption === 'smtps') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($encryption === 'tls' || $encryption === 'starttls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPSecure = '';
        $mail->SMTPAutoTLS = false;
    }

    $mail->CharSet = 'UTF-8';
    $mail->setFrom(envRequired('SMTP_FROM'), getenv('SMTP_FROM_NAME') ?: 'Adams Erben');
    $mail->addAddress($recipient);
    $mail->addReplyTo($email, $name);
    $mail->Subject = '[adams-erben.de] Anfrage zum Rudern – ' . str_replace(["\r", "\n"], '', $organizationName);
    $mail->Body = $body;
    $mail->isHTML(false);
    $mail->addCustomHeader('X-Adams-Erben-Origin', 'contact-form');
    $mail->addCustomHeader('X-Adams-Erben-Route', $routeLevel);
    $mail->send();

    respond(200, ['ok' => true, 'routeLevel' => $routeLevel]);
} catch (JsonException) {
    respond(400, ['error' => 'Ungültige JSON-Anfrage.']);
} catch (MailException $error) {
    error_log('adams-erben contact: SMTP delivery failed');
    respond(502, ['error' => 'Die Nachricht konnte gerade nicht zugestellt werden. Bitte versuche es später erneut.']);
} catch (Throwable $error) {
    error_log('adams-erben contact: internal failure: ' . $error::class);
    respond(500, ['error' => 'Der Kontaktservice ist momentan nicht verfügbar.']);
}
