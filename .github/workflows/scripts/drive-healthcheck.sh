#!/usr/bin/env bash
set -euo pipefail

if [ -z "${HEALTHCHECK_URL:-}" ]; then
  echo "Missing DRIVE_HEALTHCHECK_URL secret" >&2
  echo "status=0" >> "$GITHUB_OUTPUT"
  exit 1
fi

url="$HEALTHCHECK_URL"
if [ -n "${HEALTHCHECK_SECRET:-}" ]; then
  if [[ "$url" == *\?* ]]; then
    url="$url&token=$HEALTHCHECK_SECRET"
  else
    url="$url?token=$HEALTHCHECK_SECRET"
  fi
fi

status=$(curl -sS -o response.json -w "%{http_code}" "$url" || echo "000")
echo "status=$status" >> "$GITHUB_OUTPUT"
echo "Drive healthcheck status: $status"
cat response.json || true

if [ -z "${DISCORD_WEBHOOK_URL:-}" ]; then
  echo "No DRIVE_DISCORD_WEBHOOK_URL configured; skipping notify." >&2
  exit 0
fi

body=$(cat response.json 2>/dev/null || echo '{}')
state="FAILED"
if [ "$status" = "200" ]; then
  state="OK"
fi

payload=$(BODY="$body" STATE="$state" HEALTHCHECK_STATUS="$status" python - <<'PY'
import json, os
body = os.environ.get("BODY", "{}")
status = os.environ.get("HEALTHCHECK_STATUS", "000")
state = os.environ.get("STATE", "FAILED")
color = 0x22c55e if status == "200" else 0xef4444
summary = body
if len(summary) > 800:
    summary = summary[:800] + "…"
payload = {
    "embeds": [
        {
            "title": "Drive Healthcheck",
            "description": state,
            "color": color,
            "fields": [
                {"name": "Status", "value": status, "inline": True},
                {"name": "Response", "value": f"```{summary}```", "inline": False},
            ],
        }
    ]
}
print(json.dumps(payload))
PY
)

curl -sS -X POST -H "Content-Type: application/json" -d "$payload" "$DISCORD_WEBHOOK_URL" >/dev/null

if [ "$status" != "200" ]; then
  exit 1
fi
