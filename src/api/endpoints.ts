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

export interface MetadataItem {
  id: number;
  data: Record<string, unknown>;
  createdAt: string;
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
