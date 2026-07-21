## ADDED Requirements

### Requirement: Actual Budget credentials stay on the API
Actual Budget connection secrets (server URL, password, budget id, data directory) SHALL be configured only via API environment variables or Compose secrets and MUST NOT be required by or stored in the mobile app.

#### Scenario: Mobile configures only Kullin API
- **WHEN** a user completes first-run API configuration on mobile
- **THEN** the mobile app MUST collect Kullin API URL, port, and token only
- **AND** it MUST NOT prompt for Actual Budget password or budget file id

### Requirement: Adapter stub with defined port
The API SHALL define an `ActualBudgetPort` describing the intended operations for later domain work, and SHALL ship an adapter implementation that is explicitly stubbed or no-op until a follow-up change wires `@actual-app/api`.

#### Scenario: Stub does not pretend success for unsupported ops
- **WHEN** application code invokes an unimplemented Actual port method on the stub
- **THEN** the stub MUST fail in a clear, testable way (throw or result error)
- **AND** it MUST NOT write to a real Actual Budget instance

### Requirement: Local Compose wiring placeholders
The repository SHALL include Docker Compose configuration that documents how to run the Kullin API alongside an Actual Budget instance for local development, including env file examples for required secrets.

#### Scenario: Developer finds local run instructions
- **WHEN** a developer inspects Compose and `.env.example` files at the repo root (or `apps/api`)
- **THEN** they MUST see placeholders for API and Actual-related environment variables
- **AND** the Compose file MUST build or reference the `apps/api` service
