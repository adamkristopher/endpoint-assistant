import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getBillingStats } from "../../src/api/billing.js";
import { resetClient } from "../../src/core/client.js";
import { mockBillingStatsResponse } from "../mocks/responses.js";

describe("getBillingStats", () => {
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

  it("returns billing stats", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockBillingStatsResponse), { status: 200 })
    );

    // Act
    const result = await getBillingStats();

    // Assert
    expect(result.tier).toBe("hobby");
    expect(result.parsesThisMonth).toBe(45);
    expect(result.monthlyParseLimit).toBe(200);
    expect(result.storageUsed).toBe(52428800);
    expect(result.status).toBe("active");
  });

  it("makes GET request to correct URL", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockBillingStatsResponse), { status: 200 })
    );

    // Act
    await getBillingStats();

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/billing/stats",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("throws 401 for invalid API key", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );

    // Act & Assert
    await expect(getBillingStats()).rejects.toThrow("401");
  });
});
