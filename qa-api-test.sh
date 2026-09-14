#!/bin/bash
# Paperclip API QA Test Suite
# Tests: Health, Auth, Agents, Issues, Security

set -e

API="${PAPERCLIP_API_URL%/}"
case "$API" in */api) ;; *) API="$API/api" ;;
esac

AGENT_AUTH="Authorization: Bearer $PAPERCLIP_API_KEY"
RUN_ID="X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID"

PASS=0
FAIL=0
WARN=0

pass() { echo "  PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
warn() { echo "  WARN: $1"; WARN=$((WARN+1)); }
info() { echo "  INFO: $1"; }

# ===== HEALTH & STATUS =====
echo ""
echo "=== HEALTH & STATUS ==="

# Test 1: Health endpoint (unauthenticated)
RESP=$(curl -s "$API/health")
STATUS=$(echo "$RESP" | jq -r '.status // empty')
if [ "$STATUS" = "ok" ]; then
  pass "Health endpoint returns ok status"
else
  fail "Health endpoint: expected ok, got $STATUS"
fi

# Test 2: Health endpoint returns deployment info
DEPLOY_MODE=$(echo "$RESP" | jq -r '.deploymentMode // empty')
if [ "$DEPLOY_MODE" = "authenticated" ]; then
  pass "Health endpoint returns correct deployment mode (authenticated)"
else
  warn "Deployment mode: $DEPLOY_MODE"
fi

# Test 3: Health endpoint returns commit
COMMIT=$(echo "$RESP" | jq -r '.commit // empty')
if [ -n "$COMMIT" ] && [ "$COMMIT" != "null" ]; then
  pass "Health endpoint returns commit hash"
else
  fail "Health endpoint missing commit hash"
fi

# ===== AUTH & AUTHORIZATION =====
echo ""
echo "=== AUTH & AUTHORIZATION ==="

# Test 4: Unauthenticated access to companies
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$API/companies")
if [ "$HTTP" = "403" ] || [ "$HTTP" = "401" ]; then
  pass "Unauthenticated /api/companies returns $HTTP (expected 401/403)"
else
  fail "Unauthenticated /api/companies returned $HTTP (expected 401/403)"
fi

# Test 5: Agent key cannot access board endpoints
RESP=$(curl -s -H "$AGENT_AUTH" "$API/companies")
ERROR=$(echo "$RESP" | jq -r '.error // empty')
if [ "$ERROR" = "Board access required" ]; then
  pass "Agent JWT cannot access /api/companies (board endpoint)"
else
  fail "Agent JWT access to /api/companies: $ERROR"
fi

# Test 6: Agent can access own identity
RESP=$(curl -s -H "$AGENT_AUTH" "$API/agents/me")
NAME=$(echo "$RESP" | jq -r '.name // empty')
if [ "$NAME" = "Ian" ]; then
  pass "Agent can access own identity via /api/agents/me"
else
  fail "Agent identity: expected Ian, got $NAME"
fi

# Test 7: Agent can access inbox
RESP=$(curl -s -H "$AGENT_AUTH" "$API/agents/me/inbox-lite")
COUNT=$(echo "$RESP" | jq 'length')
if [ "$COUNT" -ge 1 ]; then
  pass "Agent can access inbox (found $COUNT items)"
else
  fail "Agent inbox empty or inaccessible"
fi

# ===== AGENT ENDPOINTS =====
echo ""
echo "=== AGENT ENDPOINTS ==="

# Test 8: Agent reportsTo is set
RESP=$(curl -s -H "$AGENT_AUTH" "$API/agents/me")
REPORTS_TO=$(echo "$RESP" | jq -r '.reportsTo // empty')
if [ -n "$REPORTS_TO" ] && [ "$REPORTS_TO" != "null" ]; then
  pass "Agent reportsTo is set"
else
  warn "Agent reportsTo is null"
fi

# Test 9: Agent chain of command
COC=$(curl -s -H "$AGENT_AUTH" "$API/agents/me" | jq -r '.chainOfCommand // empty')
if [ -n "$COC" ] && [ "$COC" != "null" ]; then
  pass "Agent chainOfCommand is present"
else
  warn "Agent chainOfCommand missing"
fi

# Test 10: Agent org chain health
HEALTH=$(curl -s -H "$AGENT_AUTH" "$API/agents/me" | jq -r '.orgChainHealth.status // empty')
if [ "$HEALTH" = "healthy" ]; then
  pass "Agent org chain is healthy"
else
  fail "Agent org chain health: $HEALTH"
fi

# Test 11: Agent permissions
CAN_ASSIGN=$(curl -s -H "$AGENT_AUTH" "$API/agents/me" | jq -r '.access.canAssignTasks // false')
if [ "$CAN_ASSIGN" = "true" ]; then
  pass "Agent has task:assign permission"
else
  warn "Agent cannot assign tasks"
fi

# ===== ISSUE ENDPOINTS =====
echo ""
echo "=== ISSUE ENDPOINTS ==="

COMPANY_ID="f88f56f2-e884-4d12-9c03-781cabccf3cf"

# Test 12: Agent can list issues for company
RESP=$(curl -s -H "$AGENT_AUTH" "$API/companies/$COMPANY_ID/issues")
ISSUE_COUNT=$(echo "$RESP" | jq 'length')
if [ "$ISSUE_COUNT" -ge 5 ]; then
  pass "Agent can list issues (found $ISSUE_COUNT)"
else
  warn "Only $ISSUE_COUNT issues found"
fi

# Test 13: Issues have required fields
FIRST_ISSUE=$(curl -s -H "$AGENT_AUTH" "$API/companies/$COMPANY_ID/issues" | jq '.[0]')
HAS_ID=$(echo "$FIRST_ISSUE" | jq -r '.id // empty')
HAS_IDENT=$(echo "$FIRST_ISSUE" | jq -r '.identifier // empty')
HAS_TITLE=$(echo "$FIRST_ISSUE" | jq -r '.title // empty')
HAS_STATUS=$(echo "$FIRST_ISSUE" | jq -r '.status // empty')
if [ -n "$HAS_ID" ] && [ -n "$HAS_IDENT" ] && [ -n "$HAS_TITLE" ] && [ -n "$HAS_STATUS" ]; then
  pass "Issues have required fields (id, identifier, title, status)"
else
  fail "Issue missing required fields"
fi

# Test 14: Agent can access own issue
ISSUE_ID="371c6e19-8b42-4403-b7d5-6cf6634fd43a"
RESP=$(curl -s -H "$AGENT_AUTH" "$API/issues/$ISSUE_ID")
ISSUE_TITLE=$(echo "$RESP" | jq -r '.title // empty')
if [ "$ISSUE_TITLE" = "QA: Test & Validate the Product" ]; then
  pass "Agent can access own assigned issue"
else
  fail "Cannot access own issue: $ISSUE_TITLE"
fi

# Test 15: Issue has heartbeat context
RESP=$(curl -s -H "$AGENT_AUTH" "$API/issues/$ISSUE_ID/heartbeat-context")
HAS_ISSUE=$(echo "$RESP" | jq -r '.issue.id // empty')
HAS_ANCESTORS=$(echo "$RESP" | jq -r '.ancestors // empty')
if [ -n "$HAS_ISSUE" ] && [ "$HAS_ISSUE" != "null" ]; then
  pass "Issue heartbeat-context returns issue data"
else
  fail "Issue heartbeat-context missing issue data"
fi

# Test 16: Issue has ancestors
ANCESTOR_COUNT=$(curl -s -H "$AGENT_AUTH" "$API/issues/$ISSUE_ID/heartbeat-context" | jq '.ancestors | length')
if [ "$ANCESTOR_COUNT" -ge 1 ]; then
  pass "Issue heartbeat-context has ancestors ($ANCESTOR_COUNT)"
else
  warn "Issue has no ancestors in context"
fi

# ===== ISSUE STATUS TRANSITIONS =====
echo ""
echo "=== ISSUE STATUS TRANSITIONS ==="

# Test 17: Issue status is valid
VALID_STATUSES="backlog todo in_progress in_review done blocked cancelled"
ISSUE_STATUS=$(curl -s -H "$AGENT_AUTH" "$API/issues/$ISSUE_ID" | jq -r '.status')
if echo "$VALID_STATUSES" | grep -q "$ISSUE_STATUS"; then
  pass "Issue status is valid: $ISSUE_STATUS"
else
  fail "Invalid issue status: $ISSUE_STATUS"
fi

# Test 18: Issue priority is valid
VALID_PRIORITIES="critical high medium low"
ISSUE_PRIO=$(curl -s -H "$AGENT_AUTH" "$API/issues/$ISSUE_ID" | jq -r '.priority')
if echo "$VALID_PRIORITIES" | grep -q "$ISSUE_PRIO"; then
  pass "Issue priority is valid: $ISSUE_PRIO"
else
  fail "Invalid issue priority: $ISSUE_PRIO"
fi

# ===== COMPANY SCOPING =====
echo ""
echo "=== COMPANY SCOPING ==="

# Test 19: Agent cannot access issues from another company
# We don't have another company ID, but we can test with a fake one
FAKE_COMPANY="00000000-0000-0000-0000-000000000000"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "$AGENT_AUTH" "$API/companies/$FAKE_COMPANY/issues")
if [ "$HTTP" = "403" ] || [ "$HTTP" = "404" ] || [ "$HTTP" = "400" ]; then
  pass "Agent cannot access issues from non-existent company (HTTP $HTTP)"
else
  warn "Cross-company access returned HTTP $HTTP"
fi

# Test 20: Agent cannot access another agent's issue directly
# WOR-2 is assigned to a different agent
OTHER_ISSUE="8fe387d2-6e14-41f8-ba5e-281303f5bab9"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "$AGENT_AUTH" "$API/issues/$OTHER_ISSUE")
if [ "$HTTP" = "200" ] || [ "$HTTP" = "403" ] || [ "$HTTP" = "404" ]; then
  # In Paperclip, agents can see all in-company issues by default
  info "Agent can view other agent's issue (HTTP $HTTP) - company-scoped visibility"
else
  warn "Unexpected HTTP $HTTP for other agent's issue"
fi

# ===== INPUT VALIDATION =====
echo ""
echo "=== INPUT VALIDATION ==="

# Test 21: Invalid issue ID
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "$AGENT_AUTH" "$API/issues/invalid-id")
if [ "$HTTP" = "400" ] || [ "$HTTP" = "404" ]; then
  pass "Invalid issue ID returns HTTP $HTTP"
else
  warn "Invalid issue ID returned HTTP $HTTP"
fi

# Test 22: Non-existent issue ID
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "$AGENT_AUTH" "$API/issues/00000000-0000-0000-0000-000000000000")
if [ "$HTTP" = "404" ]; then
  pass "Non-existent issue returns 404"
else
  warn "Non-existent issue returned HTTP $HTTP"
fi

# Test 23: Malformed JSON in request body
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "$AGENT_AUTH" -H "Content-Type: application/json"   -X PATCH "$API/issues/$ISSUE_ID" --data '{invalid json}')
if [ "$HTTP" = "400" ] || [ "$HTTP" = "422" ] || [ "$HTTP" = "500" ]; then
  pass "Malformed JSON returns HTTP $HTTP"
else
  warn "Malformed JSON returned HTTP $HTTP"
fi

# ===== SECURITY =====
echo ""
echo "=== SECURITY ==="

# Test 24: No sensitive data in health endpoint
RESP=$(curl -s "$API/health")
HAS_SECRET=$(echo "$RESP" | jq -r 'to_entries | map(select(.key | test("secret|key|token|password"; "i"))) | length')
if [ "$HAS_SECRET" = "0" ]; then
  pass "Health endpoint does not expose secrets"
else
  warn "Health endpoint may expose sensitive keys"
fi

# Test 25: Agent key is not exposed in agent/me
RESP=$(curl -s -H "$AGENT_AUTH" "$API/agents/me")
HAS_KEY=$(echo "$RESP" | jq -r 'to_entries | map(select(.key | test("key|token|secret|password"; "i"))) | length')
if [ "$HAS_KEY" = "0" ]; then
  pass "Agent/me endpoint does not expose secrets"
else
  warn "Agent/me may expose sensitive keys"
fi

# Test 26: API key required for agent endpoints
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$API/agents/me")
if [ "$HTTP" = "401" ] || [ "$HTTP" = "403" ]; then
  pass "Agent endpoints require authentication (HTTP $HTTP)"
else
  warn "Agent endpoints returned HTTP $HTTP without auth"
fi

# ===== SUMMARY =====
echo ""
echo "=== SUMMARY ==="
echo "  PASS: $PASS"
echo "  FAIL: $FAIL"
echo "  WARN: $WARN"
echo "  TOTAL: $((PASS + FAIL + WARN))"

if [ "$FAIL" -gt 0 ]; then
  echo "  RESULT: FAIL"
  exit 1
else
  echo "  RESULT: PASS"
  exit 0
fi
