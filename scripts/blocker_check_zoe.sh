#!/bin/bash
set -e
api="${PAPERCLIP_API_URL%/}"
case "$api" in */api) ;; *) api="$api/api" ;; esac
comment=$(cat /opt/paperclip/app/blocker_check_zoe.md)
jq -n --arg status done --arg comment "$comment" '{status:$status, comment:$comment}' | \
  curl -sS -X PATCH "$api/issues/4701097d-17bf-43a7-9ae7-531791c45029" \
    -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
    -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
    -H "Content-Type: application/json" \
    --data-binary @- | jq '{id, status}'
