// Registration and auth flow tests
import { describe, it, expect, vi } from "vitest";

// Mock the database module - db is null (no DB in test env)
vi.mock("../src/lib/db", () => ({
  db: null,
  schema: {},
}));

describe("Registration API", () => {
  it("should validate email format", async () => {
    const { POST } = await import("../src/app/api/register/route");
    
    const request = new Request("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    expect(body.error).toBe("Valid email is required");
  });

  it("should require email field", async () => {
    const { POST } = await import("../src/app/api/register/route");
    
    const request = new Request("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    expect(body.error).toBe("Valid email is required");
  });

  it("should return 503 when database is not available", async () => {
    const { POST } = await import("../src/app/api/register/route");
    
    const request = new Request("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", name: "Test" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(503);
    
    const body = await response.json();
    expect(body.error).toBe("Database not available");
  });

  it("should accept valid email format", async () => {
    const { POST } = await import("../src/app/api/register/route");
    
    const request = new Request("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com" }),
    });

    // Should return 503 since db is null, but email validation passed
    const response = await POST(request);
    expect(response.status).toBe(503);
  });
});
