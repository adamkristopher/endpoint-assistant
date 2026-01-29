import { getClient } from "../core/client.js";

export interface BillingStats {
  tier: string;
  parsesThisMonth: number;
  monthlyParseLimit: number;
  storageUsed: number;
  storageLimit: string;
  status: string;
  currentPeriodEnd: string;
}

/**
 * Get billing stats for the current user
 * Note: This endpoint currently only supports session auth, not API key auth.
 * It may return 401 when using API key authentication.
 */
export async function getBillingStats(): Promise<BillingStats> {
  const client = getClient();

  return client.get<BillingStats>("/api/billing/stats");
}
