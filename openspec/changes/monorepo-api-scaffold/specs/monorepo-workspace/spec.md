## ADDED Requirements

### Requirement: Repository uses npm workspaces
The repository SHALL be organized as an npm workspaces monorepo with workspace packages under `apps/*` and `packages/*`, and a root `package.json` that defines those workspaces and proxies common scripts.

#### Scenario: Root declares workspaces
- **WHEN** a developer inspects the root `package.json`
- **THEN** it MUST list workspaces including `apps/*` and `packages/*`
- **AND** root scripts MUST be able to invoke mobile and API package scripts

### Requirement: Mobile app lives under apps/mobile
The existing Expo React Native application SHALL reside in `apps/mobile` with its own `package.json`, and SHALL preserve offline-first behavior after the path migration.

#### Scenario: Mobile package is self-contained
- **WHEN** a developer runs the mobile typecheck and lint scripts from the workspace
- **THEN** TypeScript and ESLint resolve sources under `apps/mobile`
- **AND** Expo entrypoints (`app/`, `src/`, `app.json`) MUST live under `apps/mobile`

### Requirement: Shared packages directory exists
The repository SHALL include a `packages/` directory for shared libraries, starting with the OpenAPI contracts package and optional shared TypeScript config.

#### Scenario: Contracts package is a workspace member
- **WHEN** workspaces are installed
- **THEN** `packages/contracts` MUST be resolvable as a workspace dependency by `apps/api` and optionally `apps/mobile`
