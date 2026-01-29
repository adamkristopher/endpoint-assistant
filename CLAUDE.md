# Endpoint Assistant

CLI tool for interacting with the Endpoints API using API key authentication.

## Commands

```bash
npm test                            # Run all tests
npm run test:watch                  # Watch mode
npm run overview                    # List all endpoints
npm run inspect -- /path/to/endpoint   # Get endpoint details
npm run download -- file-key        # Download a file
npm start export /path/to/endpoint  # Export endpoint as JSON
npm run scan -- "prompt" --text "text"     # Scan text with AI
npm run scan -- "prompt" --file path       # Scan file with AI
npm run delete -- /path             # Delete an endpoint
npm run delete-item -- <id> /path   # Delete a single item
npm run create -- /path             # Create an endpoint
npm run append -- /path '[items]'   # Append items to endpoint
npm run stats                       # Show billing stats
```

## Architecture

```
src/
├── index.ts              # CLI entry + high-level functions
├── api/
│   ├── endpoints.ts      # listEndpoints, getEndpoint, deleteEndpoint, createEndpoint, appendItems
│   ├── files.ts          # getFileUrl, downloadFile
│   ├── items.ts          # deleteItem
│   ├── scan.ts           # scanText, scanFiles
│   └── billing.ts        # getBillingStats
├── core/
│   └── client.ts         # EndpointsClient class (get, post, delete, patch, postFormData)
└── config/
    └── settings.ts       # getSettings(), validateSettings()
```

### Key Patterns

- **TDD**: Tests written first using Vitest with AAA pattern (Arrange, Act, Assert)
- **Singleton Client**: `getClient()` returns cached HTTP client instance
- **Bearer Auth**: All requests include `Authorization: Bearer ep_xxx` header

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/endpoints/tree` | GET | List endpoints by category |
| `/api/endpoints/[...path]` | GET | Get endpoint metadata |
| `/api/endpoints/[...path]` | DELETE | Delete endpoint and files |
| `/api/endpoints/[...path]` | PATCH | Append items to endpoint |
| `/api/endpoints` | POST | Create new endpoint |
| `/api/files/[...key]` | GET | Get presigned S3 URL |
| `/api/items/[itemId]` | DELETE | Delete single item |
| `/api/scan` | POST | Scan files/text with AI |
| `/api/billing/stats` | GET | Get billing stats* |

*Note: `/api/billing/stats` currently only supports session auth, not API key auth.

## Testing

Tests mirror `src/` structure in `tests/`. Mock responses in `tests/mocks/responses.ts`.

```bash
npm test                    # Run once
npm run test:watch          # Watch mode
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
ENDPOINTS_API_URL=http://localhost:3000
ENDPOINTS_API_KEY=ep_your_api_key_here
```

## Adding New Features

1. Add mock response to `tests/mocks/responses.ts`
2. Write failing test (RED)
3. Implement in `src/` (GREEN)
4. Refactor
