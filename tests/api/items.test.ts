import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { deleteItem } from "../../src/api/items.js";
import { resetClient } from "../../src/core/client.js";
import { mockDeleteItemResponse } from "../mocks/responses.js";

describe("deleteItem", () => {
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

  it("deletes item by ID with endpoint path", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockDeleteItemResponse), { status: 200 })
    );

    // Act
    const result = await deleteItem("abc12345", "/job-tracker/january-2026");

    // Assert
    expect(result.success).toBe(true);
    expect(result.deleted.itemId).toBe("abc12345");
    expect(result.deleted.hadFile).toBe(true);
    expect(result.deleted.fileDeleted).toBe(true);
    expect(result.endpointDeleted).toBe(false);
    expect(result.remainingItems).toBe(4);
  });

  it("includes path as query parameter", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockDeleteItemResponse), { status: 200 })
    );

    // Act
    await deleteItem("abc12345", "/job-tracker/january-2026");

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/items/abc12345?path=%2Fjob-tracker%2Fjanuary-2026",
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });

  it("throws 404 when item not found", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Item not found" }), { status: 404 })
    );

    // Act & Assert
    await expect(deleteItem("nonexistent", "/job-tracker/january-2026")).rejects.toThrow("404");
  });

  it("throws 400 when path is missing", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Path is required" }), { status: 400 })
    );

    // Act & Assert
    await expect(deleteItem("abc12345", "")).rejects.toThrow("400");
  });
});
