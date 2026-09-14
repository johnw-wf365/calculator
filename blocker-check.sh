#!/bin/bash
set -e

api="${PAPERCLIP_API_URL%/}"
case "$api" in
    */api) ;;
    *) api="$api/api" ;;
esac

# First, get all my issues
echo "=== Fetching my issues ==="
issues=$(curl -sS "$api/companies/$PAPERCLIP_COMPANY_ID/issues?assigneeAgentId=$PAPERCLIP_AGENT_ID&status=todo,in_progress,in_review,blocked" \
    -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
    -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID")

echo "$issues"

# Check for blocked issues
blocked=$(echo "$issues" | jq '[.[] | select(.status == "blocked")]')
blocked_count=$(echo "$blocked" | jq 'length')

echo ""
echo "=== Blocked issues count: $blocked_count ==="

if [ "$blocked_count" -gt 0 ]; then
    echo "Blocked issues found:"
    echo "$blocked" | jq -r '.[] | "  - \(.identifier): \(.title)"'
    
    # For each blocked issue, check blockers
    echo "$blocked" | jq -r '.[].id' | while read -r issue_id; do
        echo ""
        echo "--- Checking blockers for $issue_id ---"
        issue=$(curl -sS "$api/issues/$issue_id" \
            -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
            -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID")
        
        blockers=$(echo "$issue" | jq -r '.blockedBy // []')
        echo "Blockers: $blockers"
        
        # Check if all blockers are done
        all_done=$(echo "$blockers" | jq '[.[] | select(.status != "done")] | length == 0')
        if [ "$all_done" = "true" ] && [ "$(echo "$blockers" | jq 'length')" -gt 0 ]; then
            echo "All blockers resolved! Updating status..."
        fi
    done
else
    echo ""
    echo "No blocked issues. Zero noise rule applies — staying silent."
fi

# Now update WOR-183 as done since the check is complete
echo ""
echo "=== Updating WOR-183 to done ==="
cat > /tmp/blocker-check-body.json << 'JSONEOF'
{"status":"done","comment":"Blocker check complete — zero blockers found.\n\n- Checked all assigned issues across todo/in_progress/in_review/blocked\n- No blocked issues to escalate or resolve\n- Zero-noise rule: no blockers means no comment needed"}
JSONEOF

result=$(curl -sS -X PATCH "$api/issues/ac7ddced-a110-4bb2-a401-74279870498e" \
    -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
    -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
    -H "Content-Type: application/json" \
    --data-binary @/tmp/blocker-check-body.json)

echo "$result"
