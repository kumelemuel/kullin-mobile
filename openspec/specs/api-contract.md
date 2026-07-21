# API Contract Specification

## Ownership

- **Source of truth**: `packages/contracts/openapi/openapi.yaml`
- **Generated types**: `packages/contracts/src/generated/` via `npm run generate:api`
- This document summarizes auth, errors, and phase scope. Endpoint schemas live in OpenAPI.

## Base Configuration
- **Base URL**: `${ApiConfig.url}:${ApiConfig.port}` (Kullin API, from mobile config)
- **Auth**: `Authorization: Bearer ${ApiConfig.token}` for protected routes
- **Health Check**: `GET /api/health` → `200 OK` (**no auth**)
- **Timeout**: 10s requests, 5s health check
- **Content-Type**: `application/json`

## Error Response Format
All error responses follow RFC 7807 (Problem Details):
```json
{
  "type": "https://api.kullin.local/errors/validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Request body validation failed",
  "instance": "/api/health",
  "errors": [
    { "field": "fieldName", "message": "…" }
  ]
}
```

## Standard Headers
| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <token>` (protected routes) |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` |
| `X-Client-Version` | from `apps/mobile/app.json` |

## Active Endpoints (this phase)

### Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check; response `{ "status": "ok" }` |

Domain endpoints (accounts, categories, transactions) will be added in later changes and MUST be defined in OpenAPI first.

## Deprecated Example Domains

~~Orders / Visits / Products~~ example schemas are **removed** from the active contract. Do not implement mobile clients against those placeholders.

## Sync-Relevant Notes
- Future write endpoints MUST support client-generated IDs / idempotent `operationId`s for offline-first replay.
- Details belong in OpenAPI + sync specs when domain work lands.

## Versioning
- Current: no version prefix (v1 implicit)
- Breaking changes → new version path (`/api/v1/...`) when needed

## Rate Limiting
- Not enforced client-side
- Backend may return `429`; client retries with backoff

---

*Update OpenAPI first, then this summary. This spec no longer embeds full schemas.*
