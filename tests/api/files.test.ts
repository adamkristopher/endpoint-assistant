import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getFileUrl, downloadFile } from "../../src/api/files.js";
import { resetClient } from "../../src/core/client.js";
import { mockFileUrlResponse } from "../mocks/responses.js";
import * as fs from "fs/promises";
import * as path from "path";

describe("getFileUrl", () => {
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

  it("returns presigned URL for valid file key", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockFileUrlResponse), { status: 200 })
    );

    // Act
    const result = await getFileUrl("123/job-tracker/file.pdf");

    // Assert
    expect(result.url).toBe(mockFileUrlResponse.url);
    expect(result.expiresIn).toBe(3600);
  });

  it("accepts custom expiresIn parameter", async () => {
    // Arrange
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ...mockFileUrlResponse, expiresIn: 7200 }), { status: 200 })
    );

    // Act
    await getFileUrl("123/job-tracker/file.pdf", 7200);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("expiresIn=7200"),
      expect.anything()
    );
  });

  it("throws 401 for invalid API key", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );

    // Act & Assert
    await expect(getFileUrl("123/job-tracker/file.pdf")).rejects.toThrow("401");
  });

  it("throws 403 for file not owned by user", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
    );

    // Act & Assert
    await expect(getFileUrl("999/other-user/file.pdf")).rejects.toThrow("403");
  });
});

describe("downloadFile", () => {
  const originalEnv = process.env;
  const testResultsDir = path.join(process.cwd(), "results");

  beforeEach(async () => {
    resetClient();
    process.env = { ...originalEnv };
    process.env.ENDPOINTS_API_URL = "http://localhost:3000";
    process.env.ENDPOINTS_API_KEY = "ep_test_key_123";
    vi.resetAllMocks();

    // Ensure results directory exists
    await fs.mkdir(testResultsDir, { recursive: true });
  });

  afterEach(async () => {
    process.env = originalEnv;
    resetClient();

    // Clean up test files
    try {
      const files = await fs.readdir(testResultsDir);
      for (const file of files) {
        if (file.startsWith("test-")) {
          await fs.unlink(path.join(testResultsDir, file));
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  it("fetches file content via presigned URL", async () => {
    // Arrange
    const fileContent = Buffer.from("test file content");
    const mockFetch = vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockFileUrlResponse), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(fileContent, { status: 200 })
      );

    // Act
    const outputPath = path.join(testResultsDir, "test-download.pdf");
    await downloadFile("123/job-tracker/file.pdf", outputPath);

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(2, mockFileUrlResponse.url, expect.anything());
  });

  it("saves file to results directory", async () => {
    // Arrange
    const fileContent = "test file content";
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockFileUrlResponse), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(fileContent, { status: 200 })
      );

    // Act
    const outputPath = path.join(testResultsDir, "test-saved.txt");
    const savedPath = await downloadFile("123/job-tracker/file.txt", outputPath);

    // Assert
    expect(savedPath).toBe(outputPath);
    const content = await fs.readFile(outputPath, "utf-8");
    expect(content).toBe(fileContent);
  });
});
