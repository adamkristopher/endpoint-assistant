import { getClient } from "../core/client.js";

export interface TreeEndpoint {
  id: number;
  path: string;
  slug: string;
}

export interface TreeCategory {
  name: string;
  endpoints: TreeEndpoint[];
}

interface TreeResponse {
  categories: TreeCategory[];
}

export interface ExtractedEntity {
  name: string;
  type: string;
  role?: string;
}

export interface MetadataItem {
  filePath: string | null;
  fileType: string;
  fileSize?: number;
  originalText: string;
  summary: string;
  entities: ExtractedEntity[];
}

export interface EndpointDetails {
  endpoint: {
    id: number;
    path: string;
    category: string;
    slug: string;
  };
  metadata: {
    oldMetadata: MetadataItem[];
    newMetadata: MetadataItem[];
  };
  totalItems: number;
}

export interface FileDeleteResult {
  key: string;
  success: boolean;
  error?: string;
}

export interface DeleteEndpointResponse {
  success: boolean;
  deletedFiles: number;
  fileResults: FileDeleteResult[];
}

export interface CreateEndpointResponse {
  endpoint: {
    id: number;
    path: string;
    category: string;
    slug: string;
  };
  itemsAdded: number;
}

export interface CreateEndpointOptions {
  items?: Array<{ data: Record<string, unknown> }>;
}

export interface AppendItemsResponse {
  endpoint: {
    id: number;
    path: string;
    category: string;
    slug: string;
  };
  itemsAdded: number;
  totalItems: number;
}

/**
 * List all endpoints grouped by category
 */
export async function listEndpoints(): Promise<TreeCategory[]> {
  const client = getClient();
  const response = await client.get<TreeResponse>("/api/endpoints/tree");
  return response.categories;
}

/**
 * Get endpoint details including metadata
 * @param path - Endpoint path (e.g., "/job-tracker/january-2026")
 */
export async function getEndpoint(path: string): Promise<EndpointDetails> {
  const client = getClient();

  // Strip leading slash if present for URL construction
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return client.get<EndpointDetails>(`/api/endpoints/${normalizedPath}`);
}

/**
 * Delete an endpoint and all associated files
 * @param path - Endpoint path (e.g., "/job-tracker/january-2026")
 */
export async function deleteEndpoint(path: string): Promise<DeleteEndpointResponse> {
  const client = getClient();

  // Strip leading slash if present for URL construction
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return client.delete<DeleteEndpointResponse>(`/api/endpoints/${normalizedPath}`);
}

/**
 * Create a new endpoint
 * @param path - Endpoint path (e.g., "/projects/q1-2026")
 * @param options - Optional settings including initial items
 */
export async function createEndpoint(
  path: string,
  options: CreateEndpointOptions = {}
): Promise<CreateEndpointResponse> {
  const client = getClient();

  return client.post<CreateEndpointResponse>("/api/endpoints", {
    path,
    items: options.items,
  });
}

/**
 * Append items to an existing endpoint
 * @param path - Endpoint path (e.g., "/job-tracker/january-2026")
 * @param items - Array of items to append
 */
export async function appendItems(
  path: string,
  items: Array<{ data: Record<string, unknown> }>
): Promise<AppendItemsResponse> {
  const client = getClient();

  // Strip leading slash if present for URL construction
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return client.patch<AppendItemsResponse>(`/api/endpoints/${normalizedPath}`, {
    items,
  });
}
