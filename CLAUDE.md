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
```

## Architecture

```
src/
├── index.ts              # CLI entry + high-level functions (overview, inspect, download, export)
├── api/
│   ├── files.ts          # getFileUrl(), downloadFile()
│   └── endpoints.ts      # listEndpoints(), getEndpoint()
├── core/
│   └── client.ts         # EndpointsClient class with Bearer auth
└── config/
    └── settings.ts       # getSettings(), validateSettings()
```

### Key Patterns

- **TDD**: Tests written first using Vitest with AAA pattern (Arrange, Act, Assert)
- **Singleton Client**: `getClient()` returns cached HTTP client instance
- **Bearer Auth**: All requests include `Authorization: Bearer ep_xxx` header

### API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/endpoints/tree` | List endpoints by category |
| `GET /api/endpoints/[...path]` | Get endpoint metadata |
| `GET /api/files/[...key]?format=json` | Get presigned S3 URL |

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
