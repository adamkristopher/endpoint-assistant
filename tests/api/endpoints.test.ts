import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { listEndpoints, getEndpoint } from "../../src/api/endpoints.js";
import { resetClient } from "../../src/core/client.js";
import { mockTreeResponse, mockEndpointDetailsResponse } from "../mocks/responses.js";

describe("listEndpoints", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetClient();
    process.env = { ...originalEnv };
    process.env.ENDPOINTS_API_URL = "http://localhost:3000";
    process.env.ENDPOINTS_API_KEY = "ep_test_key_123";
    vi.resetAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetClient();
  });

  it("returns categories with endpoints", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockTreeResponse), { status: 200 })
    );

    // Act
    const result = await listEndpoints();

    // Assert
    expect(result).toEqual(mockTreeResponse.categories);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("job-tracker");
    expect(result[0].endpoints).toHaveLength(2);
  });

  it("throws 401 for invalid API key", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );

    // Act & Assert
    await expect(listEndpoints()).rejects.toThrow("401");
  });
});

describe("getEndpoint", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetClient();
    process.env = { ...originalEnv };
    process.env.ENDPOINTS_API_URL = "http://localhost:3000";
    process.env.ENDPOINTS_API_KEY = "ep_test_key_123";
    vi.resetAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetClient();
  });

  it("returns endpoint details with metadata", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockEndpointDetailsResponse), { status: 200 })
    );

    // Act
    const result = await getEndpoint("/job-tracker/january-2026");

    // Assert
    expect(result.endpoint.id).toBe(1);
    expect(result.endpoint.path).toBe("/job-tracker/january-2026");
    expect(result.endpoint.category).toBe("job-tracker");
    expect(result.totalItems).toBe(5);
  });

  it("returns 404 for non-existent endpoint", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404 })
    );

    // Act & Assert
    await expect(getEndpoint("/non-existent/endpoint")).rejects.toThrow("404");
  });

  it("includes oldMetadata and newMetadata arrays", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockEndpointDetailsResponse), { status: 200 })
    );

    // Act
    const result = await getEndpoint("/job-tracker/january-2026");

    // Assert
    expect(result.metadata.oldMetadata).toHaveLength(1);
    expect(result.metadata.newMetadata).toHaveLength(1);
    expect(result.metadata.oldMetadata[0].data.company).toBe("Acme Corp");
    expect(result.metadata.newMetadata[0].data.company).toBe("Beta Inc");
  });

  it("strips leading slash from path for API call", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockEndpointDetailsResponse), { status: 200 })
    );

    // Act
    await getEndpoint("/job-tracker/january-2026");

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/endpoints/job-tracker/january-2026",
      expect.anything()
    );
  });
});
