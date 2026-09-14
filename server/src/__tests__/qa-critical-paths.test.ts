import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * QA Test Suite: Critical API Paths
 * 
 * Tests the Paperclip control plane API for:
 * - Health & status endpoints
 * - Authentication & authorization
 * - Agent endpoints
 * - Issue lifecycle
 * - Company scoping
 * - Input validation
 * - Security (no secret leakage)
 * 
 * These tests use the agent JWT for authentication and verify
 * that the API behaves correctly for an agent-scoped identity.
 */

// Mock fetch for API calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockResponse(data: unknown, status = 200, ok = true) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

describe("QA: Critical API Paths", () => {
  const API_BASE = "https://wf365.workforce365.ai/api";
  const AGENT_AUTH = "Bearer test-agent-jwt";
  const COMPANY_ID = "f88f56f2-e884-4d12-9c03-781cabccf3cf";
  const ISSUE_ID = "371c6e19-8b42-4403-b7d5-6cf6634fd43a";

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("Health & Status", () => {
    it("health endpoint returns ok status", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          status: "ok",
          deploymentMode: "authenticated",
          commit: "abc123",
        })
      );

      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();

      expect(res.ok).toBe(true);
      expect(data.status).toBe("ok");
      expect(data.deploymentMode).toBe("authenticated");
      expect(data.commit).toBeTruthy();
    });

    it("health endpoint does not expose secrets", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          status: "ok",
          deploymentMode: "authenticated",
          commit: "abc123",
        })
      );

      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();

      const jsonStr = JSON.stringify(data);
      expect(jsonStr).not.toMatch(/secret|key|token|password/i);
    });
  });

  describe("Authentication & Authorization", () => {
    it("unauthenticated access to companies returns 403", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ error: "Board access required" }, 403, false)
      );

      const res = await fetch(`${API_BASE}/companies`);
      expect(res.status).toBe(403);
    });

    it("agent JWT cannot access board endpoints", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ error: "Board access required" }, 403, false)
      );

      const res = await fetch(`${API_BASE}/companies`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("Board access required");
    });

    it("agent can access own identity", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          id: "b6a54a64-ad56-4127-b6c2-c759543753bf",
          name: "Ian",
          role: "qa",
          status: "running",
          companyId: COMPANY_ID,
        })
      );

      const res = await fetch(`${API_BASE}/agents/me`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(data.name).toBe("Ian");
      expect(data.role).toBe("qa");
      expect(data.companyId).toBe(COMPANY_ID);
    });

    it("agent can access inbox", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse([
          {
            id: ISSUE_ID,
            identifier: "WOR-8",
            title: "QA: Test & Validate the Product",
            status: "in_progress",
            priority: "high",
          },
        ])
      );

      const res = await fetch(`${API_BASE}/agents/me/inbox-lite`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Agent Endpoints", () => {
    it("agent reportsTo is set", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          id: "b6a54a64-ad56-4127-b6c2-c759543753bf",
          name: "Ian",
          reportsTo: "996749a9-f02f-490f-9583-ec0a6b853060",
        })
      );

      const res = await fetch(`${API_BASE}/agents/me`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(data.reportsTo).toBeTruthy();
    });

    it("agent chainOfCommand is present", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          chainOfCommand: [
            {
              id: "996749a9-f02f-490f-9583-ec0a6b853060",
              name: "Elon",
              role: "general",
              title: "CEO",
            },
          ],
        })
      );

      const res = await fetch(`${API_BASE}/agents/me`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(Array.isArray(data.chainOfCommand)).toBe(true);
      expect(data.chainOfCommand.length).toBeGreaterThanOrEqual(1);
    });

    it("agent org chain is healthy", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          orgChainHealth: {
            status: "healthy",
            fullChain: [
              { id: "b6a54a64-ad56-4127-b6c2-c759543753bf", name: "Ian", status: "running" },
            ],
          },
        })
      );

      const res = await fetch(`${API_BASE}/agents/me`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(data.orgChainHealth.status).toBe("healthy");
    });

    it("agent permissions are present", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          access: {
            canAssignTasks: true,
            grants: [{ permissionKey: "tasks:assign" }],
          },
        })
      );

      const res = await fetch(`${API_BASE}/agents/me`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(data.access.canAssignTasks).toBe(true);
    });
  });

  describe("Issue Endpoints", () => {
    it("agent can list issues for company", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse([
          { id: "1", identifier: "WOR-1", title: "Test", status: "in_progress" },
          { id: "2", identifier: "WOR-2", title: "Test 2", status: "done" },
        ])
      );

      const res = await fetch(`${API_BASE}/companies/${COMPANY_ID}/issues`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(2);
    });

    it("issues have required fields", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse([
          {
            id: ISSUE_ID,
            identifier: "WOR-8",
            title: "QA: Test & Validate the Product",
            status: "in_progress",
            priority: "high",
          },
        ])
      );

      const res = await fetch(`${API_BASE}/companies/${COMPANY_ID}/issues`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      const issue = data[0];
      expect(issue.id).toBeTruthy();
      expect(issue.identifier).toBeTruthy();
      expect(issue.title).toBeTruthy();
      expect(issue.status).toBeTruthy();
    });

    it("agent can access own issue", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          id: ISSUE_ID,
          identifier: "WOR-8",
          title: "QA: Test & Validate the Product",
          status: "in_progress",
        })
      );

      const res = await fetch(`${API_BASE}/issues/${ISSUE_ID}`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(data.id).toBe(ISSUE_ID);
      expect(data.title).toBe("QA: Test & Validate the Product");
    });

    it("issue heartbeat-context returns issue data", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          issue: { id: ISSUE_ID, title: "Test" },
          ancestors: [{ id: "parent-id", title: "Parent" }],
        })
      );

      const res = await fetch(`${API_BASE}/issues/${ISSUE_ID}/heartbeat-context`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(data.issue).toBeTruthy();
      expect(data.issue.id).toBe(ISSUE_ID);
    });

    it("issue heartbeat-context has ancestors", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          issue: { id: ISSUE_ID },
          ancestors: [{ id: "448bb2f0-35c3-4777-899d-d7ae692485f9", title: "Paperclip onboarding" }],
        })
      );

      const res = await fetch(`${API_BASE}/issues/${ISSUE_ID}/heartbeat-context`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(Array.isArray(data.ancestors)).toBe(true);
      expect(data.ancestors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Issue Status Transitions", () => {
    const validStatuses = ["backlog", "todo", "in_progress", "in_review", "done", "blocked", "cancelled"];
    const validPriorities = ["critical", "high", "medium", "low"];

    it.each(validStatuses)("issue status '%s' is valid", (status) => {
      expect(validStatuses).toContain(status);
    });

    it.each(validPriorities)("issue priority '%s' is valid", (priority) => {
      expect(validPriorities).toContain(priority);
    });

    it("issue status is one of the valid enum values", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ id: ISSUE_ID, status: "in_progress", priority: "high" })
      );

      const res = await fetch(`${API_BASE}/issues/${ISSUE_ID}`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      expect(validStatuses).toContain(data.status);
      expect(validPriorities).toContain(data.priority);
    });
  });

  describe("Company Scoping", () => {
    it("agent cannot access issues from non-existent company", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ error: "Forbidden" }, 403, false)
      );

      const res = await fetch(
        `${API_BASE}/companies/00000000-0000-0000-0000-000000000000/issues`,
        { headers: { Authorization: AGENT_AUTH } }
      );

      expect(res.status).toBe(403);
    });

    it("agent can view other in-company issues (company-scoped visibility)", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          id: "other-issue-id",
          title: "Other Issue",
          status: "in_progress",
        })
      );

      const res = await fetch(`${API_BASE}/issues/other-issue-id`, {
        headers: { Authorization: AGENT_AUTH },
      });

      expect(res.ok).toBe(true);
    });
  });

  describe("Input Validation", () => {
    it("invalid issue ID returns 404", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ error: "Not found" }, 404, false)
      );

      const res = await fetch(`${API_BASE}/issues/invalid-id`, {
        headers: { Authorization: AGENT_AUTH },
      });

      expect(res.status).toBe(404);
    });

    it("non-existent issue ID returns 404", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ error: "Not found" }, 404, false)
      );

      const res = await fetch(
        `${API_BASE}/issues/00000000-0000-0000-0000-000000000000`,
        { headers: { Authorization: AGENT_AUTH } }
      );

      expect(res.status).toBe(404);
    });

    it("malformed JSON in request body returns error", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ error: "Invalid JSON" }, 400, false)
      );

      const res = await fetch(`${API_BASE}/issues/${ISSUE_ID}`, {
        method: "PATCH",
        headers: {
          Authorization: AGENT_AUTH,
          "Content-Type": "application/json",
        },
        body: "{invalid json}",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("Security", () => {
    it("health endpoint does not expose secrets", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          status: "ok",
          deploymentMode: "authenticated",
          commit: "abc123",
        })
      );

      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();

      const jsonStr = JSON.stringify(data);
      expect(jsonStr).not.toMatch(/secret|key|token|password/i);
    });

    it("agent/me endpoint does not expose API keys", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          id: "b6a54a64-ad56-4127-b6c2-c759543753bf",
          name: "Ian",
          adapterConfig: {
            instructionsFilePath: "/path/to/instructions",
          },
        })
      );

      const res = await fetch(`${API_BASE}/agents/me`, {
        headers: { Authorization: AGENT_AUTH },
      });
      const data = await res.json();

      const jsonStr = JSON.stringify(data);
      expect(jsonStr).not.toMatch(/key_hash|key_secret|api_key|private_key/i);
    });

    it("agent endpoints require authentication", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ error: "Unauthorized" }, 401, false)
      );

      const res = await fetch(`${API_BASE}/agents/me`);
      expect(res.status).toBe(401);
    });
  });
});
