import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { scanText, scanFiles } from "../../src/api/scan.js";
import { resetClient } from "../../src/core/client.js";
import { mockScanResponse } from "../mocks/responses.js";

describe("scanText", () => {
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

  it("sends prompt and text as FormData", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockScanResponse), { status: 200 })
    );

    // Act
    const result = await scanText("track job applications", "Applied to Acme Corp as Engineer");

    // Assert
    expect(result.success).toBe(true);
    expect(result.endpoint.path).toBe("/job-tracker/january-2026");
    expect(result.entriesAdded).toBe(1);

    // Verify FormData was sent
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toBe("http://localhost:3000/api/scan");
    expect(callArgs[1]?.method).toBe("POST");
    const body = callArgs[1]?.body as FormData;
    expect(body.get("prompt")).toBe("track job applications");
    expect(body.get("text")).toBe("Applied to Acme Corp as Engineer");
  });

  it("includes target endpoint when specified", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockScanResponse), { status: 200 })
    );

    // Act
    await scanText("track job", "Applied to Acme", { targetEndpoint: "/job-tracker/january-2026" });

    // Assert
    const body = mockFetch.mock.calls[0][1]?.body as FormData;
    expect(body.get("targetEndpoint")).toBe("/job-tracker/january-2026");
  });

  it("throws 400 when prompt is missing", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 })
    );

    // Act & Assert
    await expect(scanText("", "some text")).rejects.toThrow("400");
  });

  it("throws 429 when parse limit exceeded", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Parse limit exceeded" }), { status: 429 })
    );

    // Act & Assert
    await expect(scanText("prompt", "text")).rejects.toThrow("429");
  });
});

describe("scanFiles", () => {
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

  it("sends prompt and files as FormData", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockScanResponse), { status: 200 })
    );
    const file = new File(["test content"], "test.pdf", { type: "application/pdf" });

    // Act
    const result = await scanFiles("track job applications", [file]);

    // Assert
    expect(result.success).toBe(true);
    expect(result.endpoint.path).toBe("/job-tracker/january-2026");

    // Verify FormData was sent
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toBe("http://localhost:3000/api/scan");
    expect(callArgs[1]?.method).toBe("POST");
    const body = callArgs[1]?.body as FormData;
    expect(body.get("prompt")).toBe("track job applications");
    expect(body.get("file")).toBeInstanceOf(File);
  });

  it("sends multiple files", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockScanResponse), { status: 200 })
    );
    const file1 = new File(["content1"], "test1.pdf", { type: "application/pdf" });
    const file2 = new File(["content2"], "test2.pdf", { type: "application/pdf" });

    // Act
    await scanFiles("prompt", [file1, file2]);

    // Assert
    const body = mockFetch.mock.calls[0][1]?.body as FormData;
    const files = body.getAll("file");
    expect(files).toHaveLength(2);
  });

  it("includes target endpoint when specified", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockScanResponse), { status: 200 })
    );
    const file = new File(["test"], "test.pdf", { type: "application/pdf" });

    // Act
    await scanFiles("prompt", [file], { targetEndpoint: "/job-tracker/january-2026" });

    // Assert
    const body = mockFetch.mock.calls[0][1]?.body as FormData;
    expect(body.get("targetEndpoint")).toBe("/job-tracker/january-2026");
  });
});
