import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getSettings, validateSettings } from "../../src/config/settings.js";

describe("getSettings", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns settings from environment variables", () => {
    // Arrange
    process.env.ENDPOINTS_API_URL = "http://localhost:3000";
    process.env.ENDPOINTS_API_KEY = "ep_test_key_123";

    // Act
    const settings = getSettings();

    // Assert
    expect(settings.apiUrl).toBe("http://localhost:3000");
    expect(settings.apiKey).toBe("ep_test_key_123");
  });

  it("throws error when API key missing", () => {
    // Arrange
    process.env.ENDPOINTS_API_URL = "http://localhost:3000";
    delete process.env.ENDPOINTS_API_KEY;

    // Act & Assert
    expect(() => getSettings()).toThrow("ENDPOINTS_API_KEY");
  });

  it("throws error when API URL missing", () => {
    // Arrange
    delete process.env.ENDPOINTS_API_URL;
    process.env.ENDPOINTS_API_KEY = "ep_test_key_123";

    // Act & Assert
    expect(() => getSettings()).toThrow("ENDPOINTS_API_URL");
  });
});

describe("validateSettings", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns valid:true when all required vars present", () => {
    // Arrange
    process.env.ENDPOINTS_API_URL = "http://localhost:3000";
    process.env.ENDPOINTS_API_KEY = "ep_test_key_123";

    // Act
    const result = validateSettings();

    // Assert
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("returns errors array when missing vars", () => {
    // Arrange
    delete process.env.ENDPOINTS_API_URL;
    delete process.env.ENDPOINTS_API_KEY;

    // Act
    const result = validateSettings();

    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("ENDPOINTS_API_URL is required");
    expect(result.errors).toContain("ENDPOINTS_API_KEY is required");
  });
});
