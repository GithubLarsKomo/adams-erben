#!/bin/sh
set -eu

if [ "${PREVIEW_MODE:-0}" != "1" ]; then
  required_vars="SITE_OPERATOR_NAME SITE_OPERATOR_ADDRESS SITE_OPERATOR_EMAIL SITE_RESPONSIBLE_NAME HOSTING_PROVIDER_NAME HOSTING_PROVIDER_ADDRESS HOSTING_LOG_RETENTION SMTP_PROVIDER_NAME SMTP_PROVIDER_ADDRESS SMTP_LOG_RETENTION"
  missing=""
  for key in $required_vars; do
    eval "value=\${$key:-}"
    if [ -z "$value" ]; then
      missing="$missing $key"
    fi
  done

  if [ -n "$missing" ]; then
    echo "[risk-protection] Production startup blocked. Missing required legal/privacy configuration:$missing" >&2
    exit 78
  fi
fi

exec apache2-foreground
