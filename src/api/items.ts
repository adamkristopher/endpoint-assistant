import { getClient } from "../core/client.js";

export interface DeleteItemResult {
  itemId: string;
  hadFile: boolean;
  fileDeleted: boolean;
}

export interface DeleteItemResponse {
  success: boolean;
  deleted: DeleteItemResult;
  endpointDeleted: boolean;
  remainingItems: number;
}

/**
 * Delete a single item from an endpoint
 * @param itemId - The item ID to delete
 * @param path - The endpoint path (e.g., "/job-tracker/january-2026")
 */
export async function deleteItem(itemId: string, path: string): Promise<DeleteItemResponse> {
  const client = getClient();

  const encodedPath = encodeURIComponent(path);

  return client.delete<DeleteItemResponse>(`/api/items/${itemId}?path=${encodedPath}`);
}
