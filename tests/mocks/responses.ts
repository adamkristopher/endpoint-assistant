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
