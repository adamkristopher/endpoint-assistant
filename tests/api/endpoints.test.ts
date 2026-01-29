import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { listEndpoints, getEndpoint, deleteEndpoint, createEndpoint, appendItems } from "../../src/api/endpoints.js";
import { resetClient } from "../../src/core/client.js";
import {
  mockTreeResponse,
  mockEndpointDetailsResponse,
  mockDeleteEndpointResponse,
  mockCreateEndpointResponse,
  mockAppendItemsResponse,
} from "../mocks/responses.js";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result.metadata.oldMetadata[0] as any).data.company).toBe("Acme Corp");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result.metadata.newMetadata[0] as any).data.company).toBe("Beta Inc");
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

describe("deleteEndpoint", () => {
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

  it("deletes endpoint and returns cleanup results", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockDeleteEndpointResponse), { status: 200 })
    );

    // Act
    const result = await deleteEndpoint("/job-tracker/january-2026");

    // Assert
    expect(result.success).toBe(true);
    expect(result.deletedFiles).toBe(2);
    expect(result.fileResults).toHaveLength(2);
    expect(result.fileResults[0].key).toBe("123/job-tracker/file1.pdf");
  });

  it("throws 404 for non-existent endpoint", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404 })
    );

    // Act & Assert
    await expect(deleteEndpoint("/non-existent/endpoint")).rejects.toThrow("404");
  });

  it("makes DELETE request to correct URL", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockDeleteEndpointResponse), { status: 200 })
    );

    // Act
    await deleteEndpoint("/job-tracker/january-2026");

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/endpoints/job-tracker/january-2026",
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });
});

describe("createEndpoint", () => {
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

  it("creates endpoint with path only", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockCreateEndpointResponse), { status: 200 })
    );

    // Act
    const result = await createEndpoint("/projects/q1-2026");

    // Assert
    expect(result.endpoint.id).toBe(10);
    expect(result.endpoint.path).toBe("/projects/q1-2026");
    expect(result.endpoint.category).toBe("projects");
    expect(result.itemsAdded).toBe(0);
  });

  it("creates endpoint with initial items", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ...mockCreateEndpointResponse, itemsAdded: 2 }), { status: 200 })
    );
    const items = [
      { data: { company: "Acme" } },
      { data: { company: "Beta" } },
    ];

    // Act
    const result = await createEndpoint("/projects/q1-2026", { items });

    // Assert
    expect(result.itemsAdded).toBe(2);
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.items).toEqual(items);
  });

  it("throws 409 when endpoint already exists", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Endpoint already exists" }), { status: 409 })
    );

    // Act & Assert
    await expect(createEndpoint("/projects/q1-2026")).rejects.toThrow("409");
  });

  it("makes POST request to correct URL", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockCreateEndpointResponse), { status: 200 })
    );

    // Act
    await createEndpoint("/projects/q1-2026");

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/endpoints",
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});

describe("appendItems", () => {
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

  it("appends items to existing endpoint", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockAppendItemsResponse), { status: 200 })
    );
    const items = [{ data: { company: "New Corp" } }];

    // Act
    const result = await appendItems("/job-tracker/january-2026", items);

    // Assert
    expect(result.endpoint.path).toBe("/job-tracker/january-2026");
    expect(result.itemsAdded).toBe(1);
    expect(result.totalItems).toBe(6);
  });

  it("makes PATCH request with items body", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockAppendItemsResponse), { status: 200 })
    );
    const items = [{ data: { company: "New Corp" } }];

    // Act
    await appendItems("/job-tracker/january-2026", items);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/endpoints/job-tracker/january-2026",
      expect.objectContaining({
        method: "PATCH",
      })
    );
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.items).toEqual(items);
  });

  it("throws 404 when endpoint doesn't exist", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404 })
    );

    // Act & Assert
    await expect(appendItems("/non-existent/endpoint", [])).rejects.toThrow("404");
  });
});
