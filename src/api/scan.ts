import { getClient } from "../core/client.js";

export interface ScanEndpoint {
  id: number;
  path: string;
  category: string;
  slug: string;
}

export interface ScanResponse {
  success: boolean;
  endpoint: ScanEndpoint;
  entriesAdded: number;
  totalEntries: number;
}

export interface ScanOptions {
  targetEndpoint?: string;
}

/**
 * Scan text content with AI extraction
 * @param prompt - The prompt describing what to extract
 * @param text - The text content to scan
 * @param options - Optional settings like target endpoint
 */
export async function scanText(
  prompt: string,
  text: string,
  options: ScanOptions = {}
): Promise<ScanResponse> {
  const client = getClient();

  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("text", text);

  if (options.targetEndpoint) {
    formData.append("targetEndpoint", options.targetEndpoint);
  }

  return client.postFormData<ScanResponse>("/api/scan", formData);
}

/**
 * Scan files with AI extraction
 * @param prompt - The prompt describing what to extract
 * @param files - Array of files to scan
 * @param options - Optional settings like target endpoint
 */
export async function scanFiles(
  prompt: string,
  files: File[],
  options: ScanOptions = {}
): Promise<ScanResponse> {
  const client = getClient();

  const formData = new FormData();
  formData.append("prompt", prompt);

  for (const file of files) {
    formData.append("file", file);
  }

  if (options.targetEndpoint) {
    formData.append("targetEndpoint", options.targetEndpoint);
  }

  return client.postFormData<ScanResponse>("/api/scan", formData);
}
