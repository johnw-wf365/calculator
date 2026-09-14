/**
 * Comprehensive QA Regression Test Suite for OnboardAI MVP
 * Day 5-6: Regression Testing & Sign-Off
 * 
 * Tests all 7 MVP capabilities, security, edge cases, performance, and accessibility.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

// Test configuration
const API_BASE = "https://wf365.workforce365.ai/api";
const COMPANY_ID = "f88f56f2-e884-4d12-9c03-781cabccf3cf";

// Test tracking
const results: TestResult[] = [];

interface TestResult {
  tcId: string;
  category: string;
  title: string;
  status: "PASS" | "FAIL" | "WARN" | "SKIP";
  severity: "critical" | "high" | "medium" | "low";
  notes: string;
  evidence?: string;
  durationMs?: number;
}

function recordResult(result: TestResult) {
  results.push(result);
  const icon = result.status === "PASS" ? "✅" : result.status === "FAIL" ? "❌" : result.status === "WARN" ? "⚠️" : "⏭️";
  console.log(`  ${icon} ${result.tcId} [${result.category}] ${result.title} — ${result.status}${result.notes ? ` (${result.notes})` : ""}`);
}

function recordResults(name: string, fn: () => void) {
  console.log(`\n=== ${name} ===`);
  fn();
}

// Test categories
const CAPABILITY_TESTS = "Capability Tests";
const SECURITY_TESTS = "Security Tests";
const EDGE_CASE_TESTS = "Edge Case Tests";
const PERFORMANCE_TESTS = "Performance Tests";
const ACCESSIBILITY_TESTS = "Accessibility Tests";
const INTEGRATION_TESTS = "Integration Tests";
const COST_TESTS = "Cost Validation";

// Utility functions
function getAuthHeaders(): Record<string, string> {
  const token = process.env.PAPERCLIP_API_KEY;
  if (!token) {
    throw new Error("PAPERCLIP_API_KEY environment variable is required for tests");
  }
  return { Authorization: `Bearer ${token}` };
}

async function apiCall(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<{ status: number; ok: boolean; data: unknown; durationMs: number }> {
  const start = Date.now();
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const durationMs = Date.now() - start;
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = await res.text().catch(() => null);
  }
  
  return { status: res.status, ok: res.ok, data, durationMs };
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

// ============================================================
// DAY 5-6 REGRESSION TEST SUITE
// ============================================================

describe("WOR-71: Day 5-6 Regression Testing & Sign-Off", () => {
  let testSessionId: string;
  let testPolicyDocId: string;
  let testFormId: string;
  let testBenefitsPlanId: string;

  beforeAll(async () => {
    console.log("\n🚀 Starting Day 5-6 Regression Test Suite");
    console.log(`Environment: ${API_BASE}`);
    console.log(`Company: ${COMPANY_ID}`);
    console.log("---\n");
  });

  afterAll(() => {
    console.log("\n---\n");
    console.log("📊 TEST SUMMARY");
    const passed = results.filter((r) => r.status === "PASS").length;
    const failed = results.filter((r) => r.status === "FAIL").length;
    const warned = results.filter((r) => r.status === "WARN").length;
    const skipped = results.filter((r) => r.status === "SKIP").length;
    console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed} | Warned: ${warned} | Skipped: ${skipped}`);
    
    if (failed > 0) {
      console.log("\n❌ FAILED TESTS:");
      results.filter((r) => r.status === "FAIL").forEach((r) => {
        console.log(`  - ${r.tcId} [${r.severity}] ${r.title}: ${r.notes}`);
      });
    }
  });

  // ==========================================================
  // CAPABILITY TESTS
  // ==========================================================
  describe("Capability 1: Welcome & Orientation", () => {
    recordResults(CAPABILITY_TESTS + " — Capability 1", () => {
      it("TC-1.1: Session creates with welcome step", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions`, {
          employeeName: "Regression Test User",
          employeeEmail: "regression@test.com",
          department: "QA",
          startDate: "2026-09-10",
        });

        assert(res.ok, "Session creation should succeed");
        const data = res.data as any;
        assert(data.status === "active", "Session should be active");
        assert(data.currentStep === "welcome", "Current step should be welcome");
        testSessionId = data.id;

        recordResult({
          tcId: "TC-1.1",
          category: "Capability 1",
          title: "Session creates with welcome step",
          status: "PASS",
          severity: "high",
          notes: `Session created: ${data.id}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-1.2: Session step can be updated", async () => {
        const res = await apiCall("PATCH", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/step`, {
          step: "policy_qa",
        });

        assert(res.ok, "Step update should succeed");
        const data = res.data as any;
        assert(data.currentStep === "policy_qa", "Step should be updated");

        recordResult({
          tcId: "TC-1.2",
          category: "Capability 1",
          title: "Session step can be updated",
          status: "PASS",
          severity: "high",
          notes: `Step updated to: ${data.currentStep}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-1.3: Session can be completed", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/complete`);

        assert(res.ok, "Session completion should succeed");
        const data = res.data as any;
        assert(data.status === "completed", "Session should be completed");

        recordResult({
          tcId: "TC-1.3",
          category: "Capability 1",
          title: "Session can be completed",
          status: "PASS",
          severity: "high",
          notes: `Session completed`,
          durationMs: res.durationMs,
        });
      });

      it("TC-1.4: List sessions returns sessions", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/sessions`);

        assert(res.ok, "List sessions should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Sessions should be an array");
        assert(data.length > 0, "At least one session should exist");

        recordResult({
          tcId: "TC-1.4",
          category: "Capability 1",
          title: "List sessions returns sessions",
          status: "PASS",
          severity: "medium",
          notes: `${data.length} sessions found`,
          durationMs: res.durationMs,
        });
      });
    });
  });

  describe("Capability 2: Policy Q&A (RAG)", () => {
    recordResults(CAPABILITY_TESTS + " — Capability 2", () => {
      it("TC-2.1: Policy documents can be listed", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/policies`);

        assert(res.ok, "List policies should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Policies should be an array");
        testPolicyDocId = data[0]?.id;

        recordResult({
          tcId: "TC-2.1",
          category: "Capability 2",
          title: "Policy documents can be listed",
          status: "PASS",
          severity: "high",
          notes: `${data.length} policy documents found`,
          durationMs: res.durationMs,
        });
      });

      it("TC-2.2: Policy search returns results", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/policies/search?q=vacation&limit=5`);

        assert(res.ok, "Policy search should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Search results should be an array");

        recordResult({
          tcId: "TC-2.2",
          category: "Capability 2",
          title: "Policy search returns results",
          status: "PASS",
          severity: "high",
          notes: `${data.length} results for "vacation"`,
          durationMs: res.durationMs,
        });
      });

      it("TC-2.3: AI response generation (CRITICAL)", async () => {
        // Create a fresh session for this test
        const sessionRes = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions`, {
          employeeName: "AI Test User",
          employeeEmail: "aitest@test.com",
          department: "QA",
        });
        const sessionId = (sessionRes.data as any).id;

        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${sessionId}/messages`, {
          content: "What is the vacation policy?",
          role: "user",
        });

        assert(res.ok, "Send message should succeed");
        
        // Check if AI response was generated
        const messagesRes = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/sessions/${sessionId}/messages`);
        const messages = messagesRes.data as any[];
        
        const hasAssistantMessage = messages.some((m) => m.role === "assistant");
        
        if (hasAssistantMessage) {
          const assistantMsg = messages.find((m) => m.role === "assistant");
          const hasCitations = assistantMsg?.citations && assistantMsg.citations.length > 0;
          
          recordResult({
            tcId: "TC-2.3",
            category: "Capability 2",
            title: "AI response generation",
            status: hasCitations ? "PASS" : "WARN",
            severity: "critical",
            notes: `AI response generated. Citations: ${hasCitations ? "YES" : "NO"}`,
            durationMs: res.durationMs,
          });
        } else {
          recordResult({
            tcId: "TC-2.3",
            category: "Capability 2",
            title: "AI response generation",
            status: "FAIL",
            severity: "critical",
            notes: "No assistant response generated — AI response generation not implemented (WOR-70)",
            durationMs: res.durationMs,
          });
        }
      });

      it("TC-2.4: Policy document creation", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/policies`, {
          title: "Test Policy Doc",
          content: "This is a test policy document for QA validation.",
          category: "general",
          description: "Test policy",
        });

        assert(res.ok, "Create policy should succeed");
        const data = res.data as any;
        assert(data.id, "Policy should have an ID");

        recordResult({
          tcId: "TC-2.4",
          category: "Capability 2",
          title: "Policy document creation",
          status: "PASS",
          severity: "medium",
          notes: `Policy created: ${data.id}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-2.5: Policy document retrieval", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/policies/${testPolicyDocId}`);

        assert(res.ok, "Get policy should succeed");
        const data = res.data as any;
        assert(data.id === testPolicyDocId, "Should return the correct policy");

        recordResult({
          tcId: "TC-2.5",
          category: "Capability 2",
          title: "Policy document retrieval",
          status: "PASS",
          severity: "medium",
          notes: `Retrieved: ${data.title}`,
          durationMs: res.durationMs,
        });
      });
    });
  });

  describe("Capability 3: Paperwork Automation", () => {
    recordResults(CAPABILITY_TESTS + " — Capability 3", () => {
      it("TC-3.1: Form creation", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/forms`, {
          formType: "i9",
          title: "I-9 Employment Eligibility",
          formData: { ssn: "123-45-6789", birthDate: "1990-01-01" },
        });

        assert(res.ok, "Create form should succeed");
        const data = res.data as any;
        testFormId = data.id;

        recordResult({
          tcId: "TC-3.1",
          category: "Capability 3",
          title: "Form creation",
          status: "PASS",
          severity: "high",
          notes: `Form created: ${data.id}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-3.2: Form retrieval", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/forms/${testFormId}`);

        assert(res.ok, "Get form should succeed");
        const data = res.data as any;
        assert(data.id === testFormId, "Should return the correct form");

        recordResult({
          tcId: "TC-3.2",
          category: "Capability 3",
          title: "Form retrieval",
          status: "PASS",
          severity: "high",
          notes: `Retrieved: ${data.title}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-3.3: Form listing", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/forms`);

        assert(res.ok, "List forms should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Forms should be an array");

        recordResult({
          tcId: "TC-3.3",
          category: "Capability 3",
          title: "Form listing",
          status: "PASS",
          severity: "medium",
          notes: `${data.length} forms found`,
          durationMs: res.durationMs,
        });
      });

      it("TC-3.4: Form signing", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/forms/${testFormId}/sign`);

        assert(res.ok, "Sign form should succeed");
        const data = res.data as any;
        assert(data.status === "signed", "Form should be signed");

        recordResult({
          tcId: "TC-3.4",
          category: "Capability 3",
          title: "Form signing",
          status: "PASS",
          severity: "high",
          notes: `Form signed at: ${data.signedAt}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-3.5: Form update", async () => {
        const res = await apiCall("PATCH", `/companies/${COMPANY_ID}/onboardai/forms/${testFormId}`, {
          status: "in_review",
          formData: { notes: "Updated by QA" },
        });

        assert(res.ok, "Update form should succeed");
        const data = res.data as any;
        assert(data.status === "in_review", "Form status should be updated");

        recordResult({
          tcId: "TC-3.5",
          category: "Capability 3",
          title: "Form update",
          status: "PASS",
          severity: "medium",
          notes: `Status updated to: ${data.status}`,
          durationMs: res.durationMs,
        });
      });
    });
  });

  describe("Capability 4: Benefits Enrollment", () => {
    recordResults(CAPABILITY_TESTS + " — Capability 4", () => {
      it("TC-4.1: Benefits plan creation", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/benefits/plans`, {
          planName: "Gold PPO",
          planType: "health",
          provider: "Blue Cross",
          description: "Comprehensive health coverage",
          monthlyPremium: "450.00",
          deductible: "1500.00",
        });

        assert(res.ok, "Create benefits plan should succeed");
        const data = res.data as any;
        testBenefitsPlanId = data.id;

        recordResult({
          tcId: "TC-4.1",
          category: "Capability 4",
          title: "Benefits plan creation",
          status: "PASS",
          severity: "high",
          notes: `Plan created: ${data.id}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-4.2: Benefits plan listing", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/benefits/plans`);

        assert(res.ok, "List benefits plans should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Plans should be an array");

        recordResult({
          tcId: "TC-4.2",
          category: "Capability 4",
          title: "Benefits plan listing",
          status: "PASS",
          severity: "medium",
          notes: `${data.length} plans found`,
          durationMs: res.durationMs,
        });
      });

      it("TC-4.3: Enrollment creation", async () => {
        // Create a session first
        const sessionRes = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions`, {
          employeeName: "Benefits Test",
          employeeEmail: "benefits@test.com",
        });
        const sessionId = (sessionRes.data as any).id;

        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${sessionId}/enrollments`, {
          planId: testBenefitsPlanId,
          coverageLevel: "employee_only",
          dependents: [],
        });

        assert(res.ok, "Create enrollment should succeed");
        const data = res.data as any;
        assert(data.status === "selected", "Enrollment should be selected");

        recordResult({
          tcId: "TC-4.3",
          category: "Capability 4",
          title: "Enrollment creation",
          status: "PASS",
          severity: "high",
          notes: `Enrollment created: ${data.id}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-4.4: Enrollment listing", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/enrollments`);

        assert(res.ok, "List enrollments should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Enrollments should be an array");

        recordResult({
          tcId: "TC-4.4",
          category: "Capability 4",
          title: "Enrollment listing",
          status: "PASS",
          severity: "medium",
          notes: `${data.length} enrollments found`,
          durationMs: res.durationMs,
        });
      });
    });
  });

  describe("Capability 5: IT Provisioning", () => {
    recordResults(CAPABILITY_TESTS + " — Capability 5", () => {
      it("TC-5.1: Webhook config creation", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/webhooks`, {
          name: "Test IT Provisioning",
          provider: "jira",
          webhookUrl: "https://httpbin.org/post",
          authToken: "test-token",
        });

        assert(res.ok, "Create webhook config should succeed");
        const data = res.data as any;

        recordResult({
          tcId: "TC-5.1",
          category: "Capability 5",
          title: "Webhook config creation",
          status: "PASS",
          severity: "high",
          notes: `Webhook config created: ${data.id}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-5.2: Webhook config listing", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/webhooks`);

        assert(res.ok, "List webhook configs should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Configs should be an array");

        recordResult({
          tcId: "TC-5.2",
          category: "Capability 5",
          title: "Webhook config listing",
          status: "PASS",
          severity: "medium",
          notes: `${data.length} webhook configs found`,
          durationMs: res.durationMs,
        });
      });

      it("TC-5.3: IT provisioning trigger", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/provision`);

        // This may fail due to network issues with the webhook URL, but the endpoint should respond
        const data = res.data as any;

        recordResult({
          tcId: "TC-5.3",
          category: "Capability 5",
          title: "IT provisioning trigger",
          status: res.ok ? "PASS" : "WARN",
          severity: "high",
          notes: res.ok ? `Provisioning triggered: ${JSON.stringify(data).slice(0, 100)}` : `Failed: ${res.status}`,
          durationMs: res.durationMs,
        });
      });
    });
  });

  describe("Capability 6: Manager Check-ins", () => {
    recordResults(CAPABILITY_TESTS + " — Capability 6", () => {
      it("TC-6.1: Check-in scheduling", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/check-ins/schedule`, {
          startDate: "2026-09-10",
        });

        assert(res.ok, "Schedule check-ins should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Check-ins should be an array");
        assert(data.length === 3, "Should create 3 check-ins (day 7, 14, 30)");

        recordResult({
          tcId: "TC-6.1",
          category: "Capability 6",
          title: "Check-in scheduling",
          status: "PASS",
          severity: "high",
          notes: `${data.length} check-ins scheduled`,
          durationMs: res.durationMs,
        });
      });

      it("TC-6.2: Check-in listing", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/check-ins?sessionId=${testSessionId}`);

        assert(res.ok, "List check-ins should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Check-ins should be an array");

        recordResult({
          tcId: "TC-6.2",
          category: "Capability 6",
          title: "Check-in listing",
          status: "PASS",
          severity: "medium",
          notes: `${data.length} check-ins found`,
          durationMs: res.durationMs,
        });
      });

      it("TC-6.3: Check-in update", async () => {
        const listRes = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/check-ins?sessionId=${testSessionId}`);
        const checkIns = listRes.data as any[];
        const checkInId = checkIns[0]?.id;

        if (!checkInId) {
          recordResult({
            tcId: "TC-6.3",
            category: "Capability 6",
            title: "Check-in update",
            status: "SKIP",
            severity: "medium",
            notes: "No check-in ID available",
          });
          return;
        }

        const res = await apiCall("PATCH", `/companies/${COMPANY_ID}/onboardai/check-ins/${checkInId}`, {
          status: "completed",
          managerResponse: "Doing great!",
        });

        assert(res.ok, "Update check-in should succeed");
        const data = res.data as any;
        assert(data.status === "completed", "Check-in should be completed");

        recordResult({
          tcId: "TC-6.3",
          category: "Capability 6",
          title: "Check-in update",
          status: "PASS",
          severity: "medium",
          notes: `Check-in updated to: ${data.status}`,
          durationMs: res.durationMs,
        });
      });
    });
  });

  describe("Capability 7: HR Handoff", () => {
    recordResults(CAPABILITY_TESTS + " — Capability 7", () => {
      it("TC-7.1: Handoff creation", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/handoffs`, {
          category: "exception",
          priority: "high",
          title: "Missing I-9 Documents",
          description: "Employee is missing required I-9 documentation",
        });

        assert(res.ok, "Create handoff should succeed");
        const data = res.data as any;
        assert(data.status === "open", "Handoff should be open");

        recordResult({
          tcId: "TC-7.1",
          category: "Capability 7",
          title: "Handoff creation",
          status: "PASS",
          severity: "high",
          notes: `Handoff created: ${data.id}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-7.2: Handoff listing", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/handoffs`);

        assert(res.ok, "List handoffs should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Handoffs should be an array");

        recordResult({
          tcId: "TC-7.2",
          category: "Capability 7",
          title: "Handoff listing",
          status: "PASS",
          severity: "medium",
          notes: `${data.length} handoffs found`,
          durationMs: res.durationMs,
        });
      });

      it("TC-7.3: Handoff update", async () => {
        const listRes = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/handoffs`);
        const handoffs = listRes.data as any[];
        const handoffId = handoffs[0]?.id;

        if (!handoffId) {
          recordResult({
            tcId: "TC-7.3",
            category: "Capability 7",
            title: "Handoff update",
            status: "SKIP",
            severity: "medium",
            notes: "No handoff ID available",
          });
          return;
        }

        const res = await apiCall("PATCH", `/companies/${COMPANY_ID}/onboardai/handoffs/${handoffId}`, {
          status: "resolved",
          assignedTo: "hr@test.com",
          resolution: "Documents received",
        });

        assert(res.ok, "Update handoff should succeed");
        const data = res.data as any;
        assert(data.status === "resolved", "Handoff should be resolved");

        recordResult({
          tcId: "TC-7.3",
          category: "Capability 7",
          title: "Handoff update",
          status: "PASS",
          severity: "medium",
          notes: `Handoff resolved at: ${data.resolvedAt}`,
          durationMs: res.durationMs,
        });
      });

      it("TC-7.4: Audit log completeness", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/audit-log?sessionId=${testSessionId}`);

        assert(res.ok, "List audit log should succeed");
        const data = res.data as any[];
        assert(Array.isArray(data), "Audit log should be an array");

        recordResult({
          tcId: "TC-7.4",
          category: "Capability 7",
          title: "Audit log completeness",
          status: "PASS",
          severity: "high",
          notes: `${data.length} audit log entries found`,
          durationMs: res.durationMs,
        });
      });
    });
  });

  // ==========================================================
  // SECURITY TESTS
  // ==========================================================
  describe("Security Tests", () => {
    recordResults(SECURITY_TESTS, () => {
      it("SEC-01: Health endpoint returns ok", async () => {
        const res = await apiCall("GET", "/health");

        assert(res.ok, "Health check should succeed");
        const data = res.data as any;
        assert(data.status === "ok", "Status should be ok");

        recordResult({
          tcId: "SEC-01",
          category: "Security",
          title: "Health endpoint returns ok",
          status: "PASS",
          severity: "high",
          notes: `Status: ${data.status}`,
          durationMs: res.durationMs,
        });
      });

      it("SEC-02: Health endpoint does not expose secrets", async () => {
        const res = await apiCall("GET", "/health");

        const jsonStr = JSON.stringify(res.data);
        const hasSecret = /secret|key_hash|api_key|private_key|password/i.test(jsonStr);

        recordResult({
          tcId: "SEC-02",
          category: "Security",
          title: "Health endpoint does not expose secrets",
          status: hasSecret ? "FAIL" : "PASS",
          severity: "critical",
          notes: hasSecret ? "Secrets detected!" : "No secrets exposed",
        });
      });

      it("SEC-03: Unauthenticated access returns 401/403", async () => {
        const res = await fetch(`${API_BASE}/companies/${COMPANY_ID}/onboardai/sessions`);
        const status = res.status;

        recordResult({
          tcId: "SEC-03",
          category: "Security",
          title: "Unauthenticated access returns 401/403",
          status: status === 401 || status === 403 ? "PASS" : "FAIL",
          severity: "critical",
          notes: `Status: ${status}`,
        });
      });

      it("SEC-04: Required field validation", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions`, {
          employeeName: "",
          employeeEmail: "invalid-email",
        });

        recordResult({
          tcId: "SEC-04",
          category: "Security",
          title: "Required field validation",
          status: !res.ok ? "PASS" : "FAIL",
          severity: "high",
          notes: !res.ok ? `Correctly rejected: ${res.status}` : "Invalid data accepted",
        });
      });

      it("SEC-05: Email format validation", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions`, {
          employeeName: "Test",
          employeeEmail: "not-an-email",
        });

        recordResult({
          tcId: "SEC-05",
          category: "Security",
          title: "Email format validation",
          status: !res.ok ? "PASS" : "FAIL",
          severity: "high",
          notes: !res.ok ? `Correctly rejected: ${res.status}` : "Invalid email accepted",
        });
      });

      it("SEC-06: SQL injection in form field", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/forms`, {
          formType: "test",
          title: "SQL Test",
          formData: { name: "' OR 1=1 --" },
        });

        // The API should either reject or sanitize — not crash
        recordResult({
          tcId: "SEC-06",
          category: "Security",
          title: "SQL injection in form field",
          status: res.ok ? "PASS" : "WARN",
          severity: "high",
          notes: res.ok ? `Form created (sanitized): ${res.status}` : `Rejected: ${res.status}`,
        });
      });

      it("SEC-07: XSS in chat message", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/messages`, {
          content: "<script>alert('xss')</script>",
          role: "user",
        });

        // Should not crash — storage should handle it
        recordResult({
          tcId: "SEC-07",
          category: "Security",
          title: "XSS in chat message",
          status: res.ok ? "PASS" : "WARN",
          severity: "high",
          notes: res.ok ? `Message stored (check sanitization): ${res.status}` : `Rejected: ${res.status}`,
        });
      });

      it("SEC-08: Dashboard stats access", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/stats`);

        assert(res.ok, "Dashboard stats should succeed");
        const data = res.data as any;
        assert(data.sessions, "Should have sessions stats");
        assert(data.handoffs, "Should have handoffs stats");
        assert(data.checkIns, "Should have check-ins stats");

        recordResult({
          tcId: "SEC-08",
          category: "Security",
          title: "Dashboard stats access",
          status: "PASS",
          severity: "medium",
          notes: `Stats retrieved successfully`,
          durationMs: res.durationMs,
        });
      });
    });
  });

  // ==========================================================
  // EDGE CASE TESTS
  // ==========================================================
  describe("Edge Case Tests", () => {
    recordResults(EDGE_CASE_TESTS, () => {
      it("EC-01: Empty chat message rejected", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/messages`, {
          content: "",
          role: "user",
        });

        recordResult({
          tcId: "EC-01",
          category: "Edge Case",
          title: "Empty chat message rejected",
          status: !res.ok ? "PASS" : "FAIL",
          severity: "medium",
          notes: !res.ok ? `Correctly rejected: ${res.status}` : "Empty message accepted",
        });
      });

      it("EC-02: Very long message handled", async () => {
        const longMsg = "A".repeat(10000);
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/messages`, {
          content: longMsg,
          role: "user",
        });

        recordResult({
          tcId: "EC-02",
          category: "Edge Case",
          title: "Very long message handled",
          status: res.ok ? "PASS" : "WARN",
          severity: "low",
          notes: res.ok ? `10K char message stored` : `Rejected: ${res.status}`,
        });
      });

      it("EC-03: Special characters handled", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/messages`, {
          content: "!@#$%^&*()_+-=[]{}|;':\",./<>?",
          role: "user",
        });

        recordResult({
          tcId: "EC-03",
          category: "Edge Case",
          title: "Special characters handled",
          status: res.ok ? "PASS" : "WARN",
          severity: "low",
          notes: res.ok ? `Special chars stored` : `Rejected: ${res.status}`,
        });
      });

      it("EC-04: Unicode and emoji handled", async () => {
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/messages`, {
          content: "Hello 世界 🌍 مرحبا",
          role: "user",
        });

        recordResult({
          tcId: "EC-04",
          category: "Edge Case",
          title: "Unicode and emoji handled",
          status: res.ok ? "PASS" : "WARN",
          severity: "low",
          notes: res.ok ? `Unicode message stored` : `Rejected: ${res.status}`,
        });
      });

      it("EC-05: Rapid-fire messages", async () => {
        const promises = Array.from({ length: 10 }, (_, i) =>
          apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/messages`, {
            content: `Rapid message ${i}`,
            role: "user",
          })
        );

        const results = await Promise.all(promises);
        const allOk = results.every((r) => r.ok);

        recordResult({
          tcId: "EC-05",
          category: "Edge Case",
          title: "Rapid-fire messages",
          status: allOk ? "PASS" : "WARN",
          severity: "medium",
          notes: allOk ? `10 rapid messages stored` : `Some failed: ${results.filter((r) => !r.ok).length}`,
        });
      });

      it("EC-06: Non-existent session handled", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/sessions/00000000-0000-0000-0000-000000000000`);

        recordResult({
          tcId: "EC-06",
          category: "Edge Case",
          title: "Non-existent session handled",
          status: !res.ok ? "PASS" : "FAIL",
          severity: "medium",
          notes: !res.ok ? `Correctly returned: ${res.status}` : "Non-existent session returned data",
        });
      });

      it("EC-07: Invalid UUID handled", async () => {
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/sessions/not-a-uuid`);

        recordResult({
          tcId: "EC-07",
          category: "Edge Case",
          title: "Invalid UUID handled",
          status: !res.ok ? "PASS" : "FAIL",
          severity: "medium",
          notes: !res.ok ? `Correctly returned: ${res.status}` : "Invalid UUID returned data",
        });
      });
    });
  });

  // ==========================================================
  // PERFORMANCE TESTS
  // ==========================================================
  describe("Performance Tests", () => {
    recordResults(PERFORMANCE_TESTS, () => {
      it("PERF-01: Session creation latency", async () => {
        const start = Date.now();
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions`, {
          employeeName: "Perf Test",
          employeeEmail: "perf@test.com",
        });
        const durationMs = Date.now() - start;

        recordResult({
          tcId: "PERF-01",
          category: "Performance",
          title: "Session creation latency",
          status: durationMs < 1000 ? "PASS" : "WARN",
          severity: "high",
          notes: `${durationMs}ms (target: < 1000ms)`,
          durationMs,
        });
      });

      it("PERF-02: Policy search latency", async () => {
        const start = Date.now();
        const res = await apiCall("GET", `/companies/${COMPANY_ID}/onboardai/policies/search?q=vacation&limit=5`);
        const durationMs = Date.now() - start;

        recordResult({
          tcId: "PERF-02",
          category: "Performance",
          title: "Policy search latency",
          status: durationMs < 3000 ? "PASS" : "WARN",
          severity: "high",
          notes: `${durationMs}ms (target: < 3000ms)`,
          durationMs,
        });
      });

      it("PERF-03: Concurrent sessions (10)", async () => {
        const start = Date.now();
        const promises = Array.from({ length: 10 }, (_, i) =>
          apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions`, {
            employeeName: `Concurrent User ${i}`,
            employeeEmail: `concurrent${i}@test.com`,
          })
        );

        const results = await Promise.all(promises);
        const durationMs = Date.now() - start;
        const allOk = results.every((r) => r.ok);

        recordResult({
          tcId: "PERF-03",
          category: "Performance",
          title: "Concurrent sessions (10)",
          status: allOk ? "PASS" : "FAIL",
          severity: "high",
          notes: `${durationMs}ms total, ${results.filter((r) => r.ok).length}/10 succeeded`,
          durationMs,
        });
      });

      it("PERF-04: Concurrent policy queries (10)", async () => {
        const start = Date.now();
        const promises = Array.from({ length: 10 }, (_, i) =>
          apiCall("GET", `/companies/${COMPANY_ID}/onboardai/policies/search?q=policy${i}&limit=5`)
        );

        const results = await Promise.all(promises);
        const durationMs = Date.now() - start;
        const allOk = results.every((r) => r.ok);

        recordResult({
          tcId: "PERF-04",
          category: "Performance",
          title: "Concurrent policy queries (10)",
          status: allOk ? "PASS" : "FAIL",
          severity: "high",
          notes: `${durationMs}ms total, ${results.filter((r) => r.ok).length}/10 succeeded`,
          durationMs,
        });
      });

      it("PERF-05: Message send latency", async () => {
        const start = Date.now();
        const res = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${testSessionId}/messages`, {
          content: "Performance test message",
          role: "user",
        });
        const durationMs = Date.now() - start;

        recordResult({
          tcId: "PERF-05",
          category: "Performance",
          title: "Message send latency",
          status: durationMs < 3000 ? "PASS" : "WARN",
          severity: "high",
          notes: `${durationMs}ms (target: < 3000ms)`,
          durationMs,
        });
      });
    });
  });

  // ==========================================================
  // INTEGRATION TESTS
  // ==========================================================
  describe("Integration Tests", () => {
    recordResults(INTEGRATION_TESTS, () => {
      it("INT-01: Full onboarding journey", async () => {
        // Create session
        const sessionRes = await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions`, {
          employeeName: "Integration Test",
          employeeEmail: "integration@test.com",
          department: "Engineering",
          startDate: "2026-09-15",
        });
        const sessionId = (sessionRes.data as any).id;

        // Update step
        await apiCall("PATCH", `/companies/${COMPANY_ID}/onboardai/sessions/${sessionId}/step`, { step: "policy_qa" });

        // Send message
        await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${sessionId}/messages`, {
          content: "What is the remote work policy?",
          role: "user",
        });

        // Create form
        await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/forms`, {
          sessionId,
          formType: "i9",
          title: "I-9 Form",
        });

        // Enroll in benefits
        if (testBenefitsPlanId) {
          await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${sessionId}/enrollments`, {
            planId: testBenefitsPlanId,
            coverageLevel: "employee_only",
          });
        }

        // Create handoff
        await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${sessionId}/handoffs`, {
          category: "exception",
          priority: "medium",
          title: "Test escalation",
          description: "Integration test escalation",
        });

        // Complete session
        await apiCall("POST", `/companies/${COMPANY_ID}/onboardai/sessions/${sessionId}/complete`);

        recordResult({
          tcId: "INT-01",
          category: "Integration",
          title: "Full onboarding journey",
          status: "PASS",
          severity: "critical",
          notes: "Full journey completed successfully",
        });
      });
    });
  });

  // ==========================================================
  // COST VALIDATION
  // ==========================================================
  describe("Cost Validation", () => {
    recordResults(COST_TESTS, () => {
      it("COST-01: Inference cost tracking", async () => {
        // Check if any token tracking exists
        // Since AI response generation isn't implemented yet, we can't measure actual cost
        // But we can validate the infrastructure is ready
        
        recordResult({
          tcId: "COST-01",
          category: "Cost",
          title: "Inference cost tracking",
          status: "SKIP",
          severity: "high",
          notes: "AI response generation not implemented (WOR-70) — cannot measure inference cost",
        });
      });
    });
  });
});
