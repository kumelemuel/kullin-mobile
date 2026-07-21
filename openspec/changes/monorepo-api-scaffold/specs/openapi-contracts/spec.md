## ADDED Requirements

### Requirement: OpenAPI is the API contract source of truth
The shared package `packages/contracts` SHALL contain an OpenAPI document that defines the Kullin API HTTP contract. Living narrative specs MUST defer endpoint shapes to this document.

#### Scenario: Health path is documented
- **WHEN** a developer opens the OpenAPI document in `packages/contracts`
- **THEN** it MUST define `GET /api/health` with a 200 response
- **AND** it MUST NOT define example order, visit, or product resources as part of the active contract

### Requirement: Generated TypeScript types
The contracts package SHALL provide a generation script that produces TypeScript types from the OpenAPI document for consumption by workspace packages.

#### Scenario: Generate types
- **WHEN** a developer runs the contracts generate script (exposed as `generate:api` from the root or package)
- **THEN** TypeScript types MUST be written into the contracts package output path
- **AND** `apps/api` MUST be able to depend on those types without copying schemas manually

### Requirement: Mobile and API share the same contract package
Both the API and mobile workspaces SHALL be able to depend on `@kullin/contracts` (or the chosen package name) for shared request/response types derived from OpenAPI.

#### Scenario: Workspace dependency
- **WHEN** workspaces are installed
- **THEN** `apps/api` MUST declare a dependency on the contracts package
- **AND** `apps/mobile` MAY declare the same dependency for typed client usage
