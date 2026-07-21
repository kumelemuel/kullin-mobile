## Why

Kullin needs a local API that sits between the offline-first mobile app and a self-hosted Actual Budget instance. Today the repo is a single Expo app with placeholder API contracts (`orders`/`visits`/`products`) and no backend. Converting to a monorepo now lets one AI/agent context cover mobile, API, OpenAPI contracts, and OpenSpec — before domain features lock in the wrong layout.

## What Changes

- **BREAKING**: Reorganize the repo into npm workspaces (`apps/mobile`, `apps/api`, `packages/*`); existing mobile root paths move under `apps/mobile`.
- Scaffold `apps/api` with Fastify + TypeScript (health endpoint, modular layout, Actual Budget port/adapter stub).
- Add `packages/contracts` with OpenAPI as source of truth and generated TypeScript types shared by mobile and API.
- Add shared tooling packages/config (TypeScript/ESLint/Prettier) and root scripts for workspaces.
- Add Docker Compose for local API (+ Actual Budget service wiring placeholders).
- Update living specs and agent docs for monorepo paths and the Kullin API role.
- Replace example domain endpoints in API contract with a minimal health/scaffold contract aligned to OpenAPI.

## Non-goals

- Full Actual Budget domain (accounts, categories, transactions CRUD/sync).
- Production hardening (public internet exposure, multi-user auth, rate limits).
- Turborepo, pnpm, or Nx migration.
- Changing mobile offline queue semantics or Realm schema beyond path/import updates.
- Moving API tokens from Realm to SecureStore (follow-up).

## Capabilities

### New Capabilities

- `monorepo-workspace`: npm workspaces layout, root scripts, shared tooling, migration of the Expo app into `apps/mobile`.
- `api-server`: Fastify TypeScript API app with health check, modular structure, and hexagonal Actual Budget port/adapter stub.
- `openapi-contracts`: OpenAPI document and generated shared types in `packages/contracts`.
- `actual-budget-integration`: adapter boundary and local deployment wiring (env secrets, Docker Compose placeholders) without full sync yet.

### Modified Capabilities

- `architecture`: layer paths and system diagram include monorepo apps and the Kullin API as the mobile’s only backend.
- `api-contract`: drop example order/visit/product schemas; require OpenAPI-driven `/api/health` and contract package ownership.

## Impact

- Affected: entire repo layout, `package.json`/`tsconfig`/`eslint`/`jest`/`eas` paths, `AGENTS.md`, `openspec/config.yaml`, specs under `openspec/specs/` (`architecture.md`, `api-contract.md`).
- New deps: Fastify, OpenAPI toolchain, Vitest (API), Docker Compose files.
- Mobile runtime behavior unchanged after path migration; API is new runtime surface for `GET /api/health`.
- References: existing `openspec/specs/architecture.md`, `api-contract.md`, `sync-protocol.md`, `offline-behavior.md`.
