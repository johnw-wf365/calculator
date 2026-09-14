#!/bin/bash
set -euo pipefail

api="${PAPERCLIP_API_URL%/}"
case "$api" in */api) ;; *) api="$api/api" ;; esac

json_payload=$(jq -n '{
  status: "done",
  comment: "✅ Email Triage & Security Scan Complete\n\n- Inbox scan: 0 unread emails\n- Security threats: 0 suspicious emails detected\n- Tasks created: 0\n- Errors: 0\n- Routine: Every 30 minutes (routine `22d8b165`)\n- Owner: Sue (PA)\n\nAll clear. No action required."
}')

curl -sS -X PATCH "$api/issues/50b92e70-1ae4-4175-a5b1-1af209645649" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  -H "Content-Type: application/json" \
  --data-binary "$json_payload"
