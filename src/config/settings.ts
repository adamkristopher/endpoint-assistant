import "dotenv/config";

export interface Settings {
  apiUrl: string;
  apiKey: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function getSettings(): Settings {
  const validation = validateSettings();

  if (!validation.valid) {
    throw new Error(`Missing required environment variables: ${validation.errors.join(", ")}`);
  }

  return {
    apiUrl: process.env.ENDPOINTS_API_URL!,
    apiKey: process.env.ENDPOINTS_API_KEY!,
  };
}

export function validateSettings(): ValidationResult {
  const errors: string[] = [];

  if (!process.env.ENDPOINTS_API_URL) {
    errors.push("ENDPOINTS_API_URL is required");
  }

  if (!process.env.ENDPOINTS_API_KEY) {
    errors.push("ENDPOINTS_API_KEY is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
