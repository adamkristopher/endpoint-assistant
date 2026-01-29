// Mock responses for testing

export const mockFileUrlResponse = {
  url: "https://s3.amazonaws.com/bucket/123/job-tracker/file.pdf?signature=xxx",
  expiresIn: 3600,
};

export const mockTreeResponse = {
  categories: [
    {
      name: "job-tracker",
      endpoints: [
        { id: 1, path: "/job-tracker/january-2026", slug: "january-2026" },
        { id: 2, path: "/job-tracker/february-2026", slug: "february-2026" },
      ],
    },
    {
      name: "receipts",
      endpoints: [
        { id: 3, path: "/receipts/2026-q1", slug: "2026-q1" },
      ],
    },
  ],
};

export const mockEndpointDetailsResponse = {
  endpoint: {
    id: 1,
    path: "/job-tracker/january-2026",
    category: "job-tracker",
    slug: "january-2026",
  },
  metadata: {
    oldMetadata: [
      { id: 101, data: { company: "Acme Corp" }, createdAt: "2026-01-01T00:00:00Z" },
    ],
    newMetadata: [
      { id: 102, data: { company: "Beta Inc" }, createdAt: "2026-01-15T00:00:00Z" },
    ],
  },
  totalItems: 5,
};

export const mockUnauthorizedResponse = {
  error: "Unauthorized",
};

export const mockForbiddenResponse = {
  error: "Forbidden",
};

export const mockNotFoundResponse = {
  error: "Not found",
};

export const mockDeleteEndpointResponse = {
  success: true,
  deletedFiles: 2,
  fileResults: [
    { key: "123/job-tracker/file1.pdf", success: true },
    { key: "123/job-tracker/file2.pdf", success: true },
  ],
};

export const mockDeleteItemResponse = {
  success: true,
  deleted: { itemId: "abc12345", hadFile: true, fileDeleted: true },
  endpointDeleted: false,
  remainingItems: 4,
};

export const mockScanResponse = {
  success: true,
  endpoint: {
    id: 1,
    path: "/job-tracker/january-2026",
    category: "job-tracker",
    slug: "january-2026",
  },
  entriesAdded: 1,
  totalEntries: 5,
};

export const mockCreateEndpointResponse = {
  endpoint: {
    id: 10,
    path: "/projects/q1-2026",
    category: "projects",
    slug: "q1-2026",
  },
  itemsAdded: 0,
};

export const mockAppendItemsResponse = {
  endpoint: {
    id: 1,
    path: "/job-tracker/january-2026",
    category: "job-tracker",
    slug: "january-2026",
  },
  itemsAdded: 1,
  totalItems: 6,
};

export const mockBillingStatsResponse = {
  tier: "hobby",
  parsesThisMonth: 45,
  monthlyParseLimit: 200,
  storageUsed: 52428800,
  storageLimit: "524288000",
  status: "active",
  currentPeriodEnd: "2026-02-15T00:00:00Z",
};
