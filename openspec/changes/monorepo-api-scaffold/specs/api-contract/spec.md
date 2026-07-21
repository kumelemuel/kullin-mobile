## ADDED Requirements

### Requirement: Contract ownership via OpenAPI package
The API contract capability SHALL treat `packages/contracts` OpenAPI as the authoritative endpoint definition. Narrative `api-contract` documentation MUST summarize auth, errors, and health behavior and point to OpenAPI for schemas.

#### Scenario: Schema drift is avoided
- **WHEN** an endpoint request/response shape changes
- **THEN** the OpenAPI document MUST be updated first
- **AND** generated types MUST be regenerated before implementation is considered complete

### Requirement: Active contract is health-only for this phase
Until a later domain change, the published Kullin API contract SHALL include `GET /api/health` and SHALL NOT require clients to implement order, visit, or product APIs.

#### Scenario: Example domains removed from active contract
- **WHEN** a client integrates against the current contract
- **THEN** only the health endpoint is required for connectivity validation
- **AND** order/visit/product example schemas MUST be absent from the active OpenAPI document

## MODIFIED Requirements

### Requirement: Base configuration and health check
The API base URL remains `${ApiConfig.url}:${ApiConfig.port}` from mobile config with `Authorization: Bearer ${ApiConfig.token}` for protected routes. Health check remains `GET /api/health` → `200 OK`. Timeout guidance remains 10s requests and 5s health check. Content-Type remains `application/json` for JSON APIs.

The health endpoint MUST NOT require authentication. Future protected routes MUST validate the Bearer token against the API-configured token.

#### Scenario: Mobile health validation
- **WHEN** mobile performs first-run or sync health validation
- **THEN** it MUST call `GET /api/health` on the configured Kullin API base URL
- **AND** a 200 response MUST be treated as healthy regardless of response body
