import { getClient } from "../core/client.js";
import * as fs from "fs/promises";
import * as path from "path";

export interface FileUrlResponse {
  url: string;
  expiresIn: number;
}

/**
 * Get a presigned URL for a file
 * @param key - S3 key path (e.g., "123/job-tracker/file.pdf")
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 */
export async function getFileUrl(key: string, expiresIn?: number): Promise<FileUrlResponse> {
  const client = getClient();

  let path = `/api/files/${key}?format=json`;
  if (expiresIn !== undefined) {
    path += `&expiresIn=${expiresIn}`;
  }

  return client.get<FileUrlResponse>(path);
}

/**
 * Download a file to the local filesystem
 * @param key - S3 key path (e.g., "123/job-tracker/file.pdf")
 * @param outputPath - Local path to save the file (defaults to results directory)
 * @returns The path where the file was saved
 */
export async function downloadFile(key: string, outputPath?: string): Promise<string> {
  // Get presigned URL
  const { url } = await getFileUrl(key);

  // Determine output path
  const filename = path.basename(key);
  const finalPath = outputPath || path.join(process.cwd(), "results", filename);

  // Ensure directory exists
  await fs.mkdir(path.dirname(finalPath), { recursive: true });

  // Download file
  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: HTTP ${response.status}`);
  }

  // Save to disk
  const buffer = await response.arrayBuffer();
  await fs.writeFile(finalPath, Buffer.from(buffer));

  return finalPath;
}
