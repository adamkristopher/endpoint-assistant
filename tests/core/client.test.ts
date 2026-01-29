import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EndpointsClient, getClient, resetClient } from "../../src/core/client.js";

describe("EndpointsClient", () => {
  const mockSettings = {
    apiUrl: "http://localhost:3000",
    apiKey: "ep_test_key_123",
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("includes Authorization header with Bearer token", async () => {
    // Arrange
    const client = new EndpointsClient(mockSettings);
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: "test" }), { status: 200 })
    );

    // Act
    await client.get("/api/test");

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer ep_test_key_123",
        }),
      })
    );
  });

  it("makes GET request to correct URL", async () => {
    // Arrange
    const client = new EndpointsClient(mockSettings);
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: "test" }), { status: 200 })
    );

    // Act
    await client.get("/api/endpoints/tree");

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/endpoints/tree",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("makes POST request with body", async () => {
    // Arrange
    const client = new EndpointsClient(mockSettings);
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const body = { file: "test.pdf" };

    // Act
    await client.post("/api/scan", body);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/scan",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("throws on non-2xx response", async () => {
    // Arrange
    const client = new EndpointsClient(mockSettings);
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );

    // Act & Assert
    await expect(client.get("/api/test")).rejects.toThrow("401");
  });

  it("parses JSON response", async () => {
    // Arrange
    const client = new EndpointsClient(mockSettings);
    const responseData = { categories: [{ name: "job-tracker" }] };
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responseData), { status: 200 })
    );

    // Act
    const result = await client.get<typeof responseData>("/api/endpoints/tree");

    // Assert
    expect(result).toEqual(responseData);
  });

  it("makes DELETE request to correct URL", async () => {
    // Arrange
    const client = new EndpointsClient(mockSettings);
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    // Act
    await client.delete("/api/endpoints/job-tracker/january-2026");

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/endpoints/job-tracker/january-2026",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: "Bearer ep_test_key_123",
        }),
      })
    );
  });

  it("makes PATCH request with body", async () => {
    // Arrange
    const client = new EndpointsClient(mockSettings);
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const body = { items: [{ data: { company: "Test" } }] };

    // Act
    await client.patch("/api/endpoints/job-tracker/january-2026", body);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/endpoints/job-tracker/january-2026",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(body),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer ep_test_key_123",
        }),
      })
    );
  });

  it("makes POST request with FormData", async () => {
    // Arrange
    const client = new EndpointsClient(mockSettings);
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    const formData = new FormData();
    formData.append("prompt", "test prompt");
    formData.append("text", "test text");

    // Act
    await client.postFormData("/api/scan", formData);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/scan",
      expect.objectContaining({
        method: "POST",
        body: formData,
        headers: expect.objectContaining({
          Authorization: "Bearer ep_test_key_123",
        }),
      })
    );
    // Should NOT include Content-Type (browser sets it with boundary)
    const callArgs = mockFetch.mock.calls[0][1] as RequestInit;
    expect(callArgs.headers).not.toHaveProperty("Content-Type");
  });
});

describe("getClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetClient();
    process.env = { ...originalEnv };
    process.env.ENDPOINTS_API_URL = "http://localhost:3000";
    process.env.ENDPOINTS_API_KEY = "ep_test_key_123";
  });

  afterEach(() => {
    process.env = originalEnv;
    resetClient();
  });

  it("returns singleton instance", () => {
    // Act
    const client1 = getClient();
    const client2 = getClient();

    // Assert
    expect(client1).toBe(client2);
  });
});

describe("resetClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ENDPOINTS_API_URL = "http://localhost:3000";
    process.env.ENDPOINTS_API_KEY = "ep_test_key_123";
  });

  afterEach(() => {
    process.env = originalEnv;
    resetClient();
  });

  it("creates new instance after reset", () => {
    // Arrange
    const client1 = getClient();

    // Act
    resetClient();
    const client2 = getClient();

    // Assert
    expect(client1).not.toBe(client2);
  });
});
