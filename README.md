# Endpoint Assistant

A TypeScript CLI tool for interacting with the [Endpoints](https://github.com/your-org/endpoints) API programmatically. Use it to list endpoints, inspect metadata, download files, and export data.

## Features

- **List Endpoints** - View all your endpoints organized by category
- **Inspect Metadata** - See Living JSON data for any endpoint
- **Download Files** - Fetch files via presigned S3 URLs
- **Export Data** - Save endpoint data as JSON for analysis

## Prerequisites

- Node.js 18+
- An Endpoints account with an API key

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/endpoint-assistant.git
cd endpoint-assistant

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

## Getting Your API Key

1. Log in to your Endpoints dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **Create New Key**
4. Give your key a descriptive name (e.g., "CLI Tool")
5. Copy the key immediately - it won't be shown again

API keys use the format `ep_xxxxxxxxxxxxxxxxxxxx`.

> **Security Note**: Keep your API key secret. Never commit it to version control or share it publicly.

## Configuration

Edit your `.env` file:

```env
# Required: Your Endpoints API base URL
ENDPOINTS_API_URL=https://app.endpoints.example.com

# Required: Your API key (starts with ep_)
ENDPOINTS_API_KEY=ep_your_api_key_here
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ENDPOINTS_API_URL` | Yes | Base URL of the Endpoints API |
| `ENDPOINTS_API_KEY` | Yes | Your API key (ep_xxx format) |

## Usage

### List All Endpoints

View all your endpoints grouped by category:

```bash
npm run overview
```

Output:
```
📁 Endpoints Overview

──────────────────────────────────────────────────

job-tracker/
  └─ january-2026
  └─ february-2026

receipts/
  └─ 2026-q1

──────────────────────────────────────────────────
Total: 2 categories, 3 endpoints
```

### Inspect an Endpoint

Get detailed metadata for a specific endpoint:

```bash
npm run inspect -- /job-tracker/january-2026
```

Output:
```
📋 Endpoint Details

──────────────────────────────────────────────────
Path:     /job-tracker/january-2026
Category: job-tracker
Slug:     january-2026
ID:       123
──────────────────────────────────────────────────
Total Items: 5
  Old Metadata: 2
  New Metadata: 3

📝 Recent Metadata:

  ID: 456
  Created: 2026-01-15T10:30:00Z
  Data: {
    "company": "Acme Corp",
    "position": "Software Engineer"
  }
```

### Download a File

Download a file using its S3 key:

```bash
npm run download -- 123/job-tracker/january-2026/resume.pdf
```

Files are saved to the `results/` directory by default.

### Export Endpoint Data

Export full endpoint data as JSON:

```bash
npm start export /job-tracker/january-2026
```

Creates `results/job-tracker-january-2026.json`.

## API Reference

### Functions

The following functions are available for programmatic use:

#### `overview()`

Lists all endpoints grouped by category.

```typescript
import { overview } from "./src/index.js";

await overview();
```

#### `inspect(path: string)`

Displays detailed metadata for an endpoint.

```typescript
import { inspect } from "./src/index.js";

await inspect("/job-tracker/january-2026");
```

#### `download(key: string, outputDir?: string)`

Downloads a file to local filesystem.

```typescript
import { download } from "./src/index.js";

const savedPath = await download("123/job-tracker/file.pdf");
// Returns: "/path/to/results/file.pdf"
```

#### `exportEndpoint(path: string)`

Exports endpoint data as JSON file.

```typescript
import { exportEndpoint } from "./src/index.js";

const jsonPath = await exportEndpoint("/job-tracker/january-2026");
// Returns: "/path/to/results/job-tracker-january-2026.json"
```

### Low-Level API Functions

#### Files API

```typescript
import { getFileUrl, downloadFile } from "./src/api/files.js";

// Get a presigned URL (expires in 1 hour by default)
const { url, expiresIn } = await getFileUrl("123/path/to/file.pdf");

// With custom expiration (seconds)
const { url } = await getFileUrl("123/path/to/file.pdf", 7200);

// Download file to disk
const savedPath = await downloadFile("123/path/to/file.pdf", "./output/file.pdf");
```

#### Endpoints API

```typescript
import { listEndpoints, getEndpoint } from "./src/api/endpoints.js";

// List all endpoints by category
const categories = await listEndpoints();
// Returns: [{ name: "job-tracker", endpoints: [...] }, ...]

// Get endpoint details
const details = await getEndpoint("/job-tracker/january-2026");
// Returns: { endpoint: {...}, metadata: { oldMetadata: [...], newMetadata: [...] }, totalItems: 5 }
```

## API Endpoints

This tool interacts with the following Endpoints API routes:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/endpoints/tree` | GET | List endpoints grouped by category |
| `/api/endpoints/[...path]` | GET | Get endpoint details and metadata |
| `/api/files/[...key]` | GET | Get presigned URL for file access |

All endpoints support Bearer token authentication:

```
Authorization: Bearer ep_your_api_key_here
```

## Project Structure

```
endpoint-assistant/
├── src/
│   ├── index.ts              # CLI entry point and high-level functions
│   ├── api/
│   │   ├── files.ts          # File access (getFileUrl, downloadFile)
│   │   └── endpoints.ts      # Endpoint listing and details
│   ├── core/
│   │   └── client.ts         # HTTP client with Bearer auth
│   └── config/
│       └── settings.ts       # Environment configuration
├── tests/                    # Vitest tests (TDD)
├── results/                  # Downloaded files and exports
├── .env.example              # Environment template
└── package.json
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

### Test Structure

Tests follow the AAA pattern (Arrange, Act, Assert):

```typescript
it("returns presigned URL for valid file key", async () => {
  // Arrange
  vi.spyOn(global, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ url: "https://...", expiresIn: 3600 }))
  );

  // Act
  const result = await getFileUrl("123/file.pdf");

  // Assert
  expect(result.url).toContain("https://");
  expect(result.expiresIn).toBe(3600);
});
```

### Adding New Features

1. Write failing tests first (RED)
2. Implement minimum code to pass (GREEN)
3. Refactor while keeping tests green

## Troubleshooting

### "ENDPOINTS_API_KEY is required"

Your `.env` file is missing or the API key isn't set. Copy `.env.example` to `.env` and add your key.

### "401 Unauthorized"

Your API key is invalid or expired. Generate a new one from the Endpoints dashboard.

### "403 Forbidden"

You're trying to access a file that doesn't belong to your account.

### "404 Not Found"

The endpoint path doesn't exist. Use `npm run overview` to see available endpoints.

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Submit a pull request

---

Built for use with [Endpoints](https://github.com/your-org/endpoints) - the document tracking platform with Living JSON.
