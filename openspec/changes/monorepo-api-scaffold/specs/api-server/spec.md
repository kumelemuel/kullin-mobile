## ADDED Requirements

### Requirement: Fastify API application exists
The system SHALL provide a TypeScript Fastify application at `apps/api` that can be started as a workspace package and exposes an HTTP API for the mobile client.

#### Scenario: API process starts
- **WHEN** a developer runs the API start/dev script for `apps/api`
- **THEN** the Fastify server MUST listen on a configured host and port
- **AND** the process MUST load configuration from environment variables

### Requirement: Health endpoint
The API SHALL expose `GET /api/health` that returns HTTP 200 when the API process is running, without requiring Bearer authentication, matching the mobile health-check contract.

#### Scenario: Health check succeeds
- **WHEN** a client sends `GET /api/health`
- **THEN** the API MUST respond with status 200
- **AND** the response MUST be suitable for the mobile `NetworkMonitor` health check

### Requirement: Modular API layout with Actual port boundary
The API SHALL organize code into modules and isolate Actual Budget access behind an `ActualBudgetPort` interface with a concrete adapter (stub allowed in this change).

#### Scenario: Domain code does not import Actual SDK directly
- **WHEN** application or route modules need Actual Budget capabilities
- **THEN** they MUST depend on `ActualBudgetPort`
- **AND** only the adapter module MAY reference `@actual-app/api` (or remain a stub until wired)

### Requirement: API quality gates
The API package SHALL provide TypeScript typecheck and Vitest test scripts that fail the CI/quality gate when broken.

#### Scenario: Health route is tested
- **WHEN** API tests run
- **THEN** there MUST be at least one automated test covering `GET /api/health`
