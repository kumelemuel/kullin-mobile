## ADDED Requirements

### Requirement: System topology includes Kullin API and Actual Budget
The architecture SHALL describe the mobile app talking only to the Kullin API, which in turn integrates with Actual Budget through an adapter boundary. Direct mobile-to-Actual communication MUST NOT be part of the architecture.

#### Scenario: Documented data flow
- **WHEN** a reader consults the architecture specification
- **THEN** the high-level diagram or equivalent description MUST show Mobile → Kullin API → Actual Budget adapter → Actual Budget
- **AND** Realm offline-first writes on mobile MUST remain the path for user mutations

### Requirement: Monorepo layer paths
Architecture layer path documentation SHALL use monorepo locations (`apps/mobile/...`, `apps/api/...`, `packages/contracts/...`) instead of assuming a single-app repository root.

#### Scenario: Agent or developer locates layers
- **WHEN** following architecture layer guidance
- **THEN** UI/features/db/services paths MUST be under `apps/mobile`
- **AND** HTTP API modules MUST be under `apps/api`
- **AND** shared OpenAPI contracts MUST be under `packages/contracts`
