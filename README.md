# Endpoint Assistant

A TypeScript CLI tool for interacting with the [Endpoints](https://endpoints.work) API programmatically. Use it to list endpoints, inspect metadata, scan documents, manage items, and export data.

## Features

- **List Endpoints** - View all your endpoints organized by category
- **Inspect Metadata** - See Living JSON data for any endpoint
- **Scan Documents** - Process files or text with AI extraction
- **Create Endpoints** - Create new endpoints programmatically
- **Append Items** - Add items to existing endpoints
- **Delete Endpoints** - Remove endpoints and all associated files
- **Delete Items** - Remove individual items from endpoints
- **Download Files** - Fetch files via presigned S3 URLs
- **Export Data** - Save endpoint data as JSON for analysis
- **Billing Stats** - View usage and subscription information

## Prerequisites

- Node.js 18+
- An Endpoints account with an API key

## Installation

```bash
# Clone the repository
git clone https://github.com/adamkristopher/endpoint-assistant.git
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
ENDPOINTS_API_URL=https://endpoints.work

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

### Scan Text

Process text with AI extraction:

```bash
npm run scan -- "track job applications" --text "Applied to Acme Corp as Engineer on Jan 15"
```

### Scan Files

Process files with AI extraction:

```bash
npm run scan -- "track job applications" --file ./resume.pdf
```

With a target endpoint:

```bash
npm run scan -- "track job applications" --file ./resume.pdf --target /job-tracker/january-2026
```

### Create an Endpoint

Create a new empty endpoint:

```bash
npm run create -- /projects/q1-2026
```

Create with initial items:

```bash
npm run create -- /projects/q1-2026 --items '[{"data":{"name":"Project Alpha"}}]'
```

### Append Items to an Endpoint

Add items to an existing endpoint:

```bash
npm run append -- /job-tracker/january-2026 '[{"data":{"company":"New Corp","position":"Developer"}}]'
```

### Delete an Endpoint

Remove an endpoint and all its files:

```bash
npm run delete -- /job-tracker/january-2026
```

### Delete a Single Item

Remove one item from an endpoint:

```bash
npm run delete-item -- abc12345 /job-tracker/january-2026
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

### View Billing Stats

Check your usage and subscription:

```bash
npm run stats
```

Output:
```
📊 Billing Stats

──────────────────────────────────────────────────
Tier:           hobby
Status:         active
Parses:         45 / 200
Storage:        50.0 MB / 500.0 MB
Period ends:    2/15/2026
──────────────────────────────────────────────────
```

## API Reference

### High-Level Functions

```typescript
import {
  overview,
  inspect,
  scan,
  create,
  append,
  removeEndpoint,
  removeItem,
  download,
  exportEndpoint,
  stats
} from "./src/index.js";

// List all endpoints
await overview();

// Inspect an endpoint
await inspect("/job-tracker/january-2026");

// Scan text
await scan("track jobs", { text: "Applied to Acme Corp" });

// Scan files
await scan("track jobs", { file: "./resume.pdf" });

// Create endpoint
await create("/projects/q1-2026");

// Append items
await append("/job-tracker/january-2026", '[{"data":{}}]');

// Delete endpoint
await removeEndpoint("/job-tracker/january-2026");

// Delete item
await removeItem("abc12345", "/job-tracker/january-2026");

// Download file
await download("123/job-tracker/file.pdf");

// Export endpoint
await exportEndpoint("/job-tracker/january-2026");

// View billing stats
await stats();
```

### Low-Level API Functions

#### Endpoints API

```typescript
import {
  listEndpoints,
  getEndpoint,
  deleteEndpoint,
  createEndpoint,
  appendItems
} from "./src/api/endpoints.js";

// List all endpoints by category
const categories = await listEndpoints();

// Get endpoint details
const details = await getEndpoint("/job-tracker/january-2026");

// Delete endpoint
const result = await deleteEndpoint("/job-tracker/january-2026");

// Create endpoint
const endpoint = await createEndpoint("/projects/q1-2026", {
  items: [{ data: { name: "Project" } }]
});

// Append items
const updated = await appendItems("/job-tracker/january-2026", [
  { data: { company: "New Corp" } }
]);
```

#### Items API

```typescript
import { deleteItem } from "./src/api/items.js";

// Delete a single item
const result = await deleteItem("abc12345", "/job-tracker/january-2026");
```

#### Scan API

```typescript
import { scanText, scanFiles } from "./src/api/scan.js";

// Scan text
const result = await scanText("track jobs", "Applied to Acme Corp");

// Scan files
const file = new File([buffer], "resume.pdf");
const result = await scanFiles("track jobs", [file]);

// With target endpoint
const result = await scanText("track jobs", "text", {
  targetEndpoint: "/job-tracker/january-2026"
});
```

#### Files API

```typescript
import { getFileUrl, downloadFile } from "./src/api/files.js";

// Get a presigned URL (expires in 1 hour by default)
const { url, expiresIn } = await getFileUrl("123/path/to/file.pdf");

// Download file to disk
const savedPath = await downloadFile("123/path/to/file.pdf", "./output/file.pdf");
```

#### Billing API

```typescript
import { getBillingStats } from "./src/api/billing.js";

// Get billing stats
const stats = await getBillingStats();
// Returns: { tier, parsesThisMonth, monthlyParseLimit, storageUsed, ... }
```

## API Endpoints

This tool interacts with the following Endpoints API routes:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/endpoints/tree` | GET | List endpoints grouped by category |
| `/api/endpoints/[...path]` | GET | Get endpoint details and metadata |
| `/api/endpoints/[...path]` | DELETE | Delete endpoint and all files |
| `/api/endpoints/[...path]` | PATCH | Append items to endpoint |
| `/api/endpoints` | POST | Create new endpoint |
| `/api/files/[...key]` | GET | Get presigned URL for file access |
| `/api/items/[itemId]` | DELETE | Delete single item |
| `/api/scan` | POST | Scan files/text with AI |
| `/api/billing/stats` | GET | Get billing stats* |

*Note: `/api/billing/stats` currently only supports session auth, not API key auth.

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
│   │   ├── endpoints.ts      # Endpoint CRUD operations
│   │   ├── files.ts          # File access (getFileUrl, downloadFile)
│   │   ├── items.ts          # Item deletion
│   │   ├── scan.ts           # AI scanning (scanText, scanFiles)
│   │   └── billing.ts        # Billing stats
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

1. Add mock response to `tests/mocks/responses.ts`
2. Write failing tests first (RED)
3. Implement minimum code to pass (GREEN)
4. Refactor while keeping tests green

## Troubleshooting

### "ENDPOINTS_API_KEY is required"

Your `.env` file is missing or the API key isn't set. Copy `.env.example` to `.env` and add your key.

### "401 Unauthorized"

Your API key is invalid or expired. Generate a new one from the Endpoints dashboard.

### "403 Forbidden"

You're trying to access a file that doesn't belong to your account.

### "404 Not Found"

The endpoint path doesn't exist. Use `npm run overview` to see available endpoints.

### "429 Too Many Requests"

You've exceeded your monthly parse limit. Upgrade your plan or wait until the next billing cycle.

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Submit a pull request

---

Built for use with [Endpoints](https://endpoints.work) - the document tracking platform with Living JSON.
