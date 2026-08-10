<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$preview = getenv('PREVIEW_MODE') === '1';
$required = [
    'PUBLIC_ORIGIN',
    'SITE_OPERATOR_NAME',
    'SITE_OPERATOR_ADDRESS',
    'SITE_OPERATOR_EMAIL',
    'SITE_RESPONSIBLE_NAME',
    'SMTP_HOST',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
    'SMTP_FROM',
    'RATE_LIMIT_SALT'
];

$missing = array_values(array_filter($required, fn(string $key): bool => trim((string) getenv($key)) === ''));
$recipientFile = '/opt/adams-erben/recipients.json';
$recipientOk = is_readable($recipientFile) && filesize($recipientFile) > 50;
$healthy = $preview ? $recipientOk : (!$missing && $recipientOk);

http_response_code($healthy ? 200 : 503);
echo json_encode([
    'ok' => $healthy,
    'service' => 'adams-erben',
    'mode' => $preview ? 'preview' : 'production',
    'legalConfigured' => !array_intersect($missing, ['SITE_OPERATOR_NAME', 'SITE_OPERATOR_ADDRESS', 'SITE_OPERATOR_EMAIL', 'SITE_RESPONSIBLE_NAME']),
    'mailConfigured' => !array_intersect($missing, ['SMTP_HOST', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_FROM']),
    'recipientRouting' => $recipientOk,
    'contactEnabled' => !$preview,
    'missingConfiguration' => $preview ? [] : $missing
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
