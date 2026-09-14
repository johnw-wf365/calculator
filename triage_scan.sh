#!/bin/bash
set -euo pipefail

api="${PAPERCLIP_API_URL%/}"
case "$api" in */api) ;; *) api="$api/api" ;; esac

body="## Email Triage & Security Scan Complete

- **Inbox scan:** 0 unread emails
- **Security threats:** 0 suspicious emails detected
- **Tasks created:** 0
- **Errors:** 0
- **Routine:** Every 30 minutes (routine \`22d8b165\`)
- **Owner:** Sue (PA)

All clear. No action required."

jq -n --arg status done --arg comment "$body" '{status:$status, comment:$comment}' | \
  curl -sS -X PATCH "$api/issues/7e93d1ee-cc74-402b-9b7f-16abf3e59ace" \
    -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
    -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
    -H "Content-Type: application/json" \
    --data-binary @- | jq '{status: .status, id: .id}'
