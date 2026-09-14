#!/bin/bash
set -e
api="${PAPERCLIP_API_URL%/}"
case "$api" in */api) ;; *) api="$api/api" ;; esac
url="${api}/issues/235d8a53-8b98-44c8-a9e3-72b1a479e4e1"
curl -sS "$url" -H "Authorization: Bearer $PAPERCLIP_API_KEY" | jq '.id, .title, .status, .description'
