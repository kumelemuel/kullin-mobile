## Context

The repo is a single Expo app (`kullin-mobile`) with offline-first scaffolding and living specs that still describe a generic external REST API and example domains (orders/visits/products). Exploration decided the mobile app will talk only to a Kullin API, which adapts to a local Actual Budget instance via `@actual-app/api`.

This change scaffolds the monorepo and API surface so later domain work (transactions, accounts, sync) lands in the right places. Mobile Realm schema, queue semantics, and sync backoff stay as-is.

## Goals / Non-Goals

**Goals:**

- Convert to npm workspaces: `apps/mobile`, `apps/api`, `packages/contracts`, shared config.
- Move existing Expo app into `apps/mobile` without changing runtime behavior.
- Scaffold Fastify + TypeScript API with `GET /api/health`, modular layout, and Actual Budget port/adapter stub.
- Establish OpenAPI as the shared contract; generate TypeScript types into `packages/contracts`.
- Provide Docker Compose placeholders for API + Actual Budget local wiring.
- Update OpenSpec living docs / agent instructions for monorepo paths.

**Non-Goals:**

- Implementing accounts/categories/transactions endpoints or Actual sync/idempotency store.
- Turborepo/pnpm/Nx.
- Public deployment, HTTPS reverse proxy production config, or multi-user auth.
- Realm schema migrations or SecureStore token migration.
- Changing mobile offline queue / conflict policy.

## Decisions

### 1. npm workspaces (not Turborepo yet)

- **Choice**: Root `package.json` with `"workspaces": ["apps/*", "packages/*"]`.
- **Why**: Already on npm; low ceremony. Turborepo can be added when build caching matters.
- **Alternatives**: pnpm workspaces (faster, but migration cost); separate repos (splits AI context).

### 2. Target layout

```
kullin/   (repo root; package name may become "kullin")
├── apps/mobile/          # existing Expo app
├── apps/api/             # Fastify API
├── packages/contracts/   # OpenAPI + generated types
├── packages/typescript-config/  # shared tsconfig bases (optional thin)
├── openspec/
├── docker-compose.yml
└── package.json
```

Mobile keeps its path aliases relative to `apps/mobile`. Root scripts proxy: `npm run mobile`, `npm run api`, `npm run typecheck`, etc.

### 3. API stack: Fastify + Vitest + hexagonal stub

- **HTTP**: Fastify, TypeScript strict, ESM.
- **Modules**: `health`, later `accounts`/`transactions`; `actual/` holds `ActualBudgetPort` + `ActualBudgetAdapter` (stub returns not-implemented / no-op sync until a later change).
- **Auth (scaffold)**: Keep Bearer token check pluggable; health may remain unauthenticated to match current mobile `GET /api/health` contract. Document that protected routes will require `Authorization: Bearer <token>` matching `KULLIN_API_TOKEN`.
- **Tests**: Vitest for API unit/integration; mobile keeps Jest.

### 4. OpenAPI ownership

- Source of truth: `packages/contracts/openapi/openapi.yaml` (or `.json`).
- Generate: TypeScript types (e.g. `openapi-typescript`) consumed by API and optionally mobile.
- First paths: `GET /api/health` only; remove example order/visit/product schemas from living `api-contract` spec.
- Script: `npm run generate:api` at root or in contracts package.

### 5. Actual Budget boundary

- Credentials (`ACTUAL_SERVER_URL`, `ACTUAL_PASSWORD`, `ACTUAL_BUDGET_ID`, data dir) live only in API env / Compose secrets — never in the mobile app.
- Mobile continues to configure URL/port/token for the **Kullin API** only.
- Adapter stub implements the port interface; real `@actual-app/api` wiring is a follow-up once SDK behavior is verified against the installed Actual version.

### 6. Docker Compose

- Services: `api` (build `apps/api`), `actual` (official/community Actual image or documented external instance).
- Volumes for Actual data and optional API SQLite later.
- Document LAN/VPN-only exposure; no public ports assumed for production.

### 7. Data model / queue / sync (this change)

- **Realm**: No schema changes. Path-only migration of existing models.
- **Queue**: No new entity operation types. Placeholder domains in docs removed; no new enqueue endpoints yet.
- **Sync**: Mobile sync engine unchanged (health → process queue). Actual reconciliation / idempotent `operationId` design deferred to a future change; note in architecture as planned direction only.

### 8. Docs / OpenSpec

- Update `AGENTS.md`, `openspec/config.yaml` context paths.
- Living specs: rewrite `architecture.md` diagram to include Kullin API + Actual; slim `api-contract.md` to health + OpenAPI ownership.
- Prefer capability-folder deltas under this change; archive/sync to main specs later.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Moving Expo root breaks EAS/path aliases | Checklist: update `eas.json`, `app.json`, tsconfig paths, CI scripts; smoke `npm run typecheck` / `lint` / `test` in mobile |
| `@actual-app/api` Node/runtime constraints unknown | Keep real SDK behind adapter; stub first; spike ticket in follow-up |
| OpenAPI codegen toolchain friction with Expo metro | Generate plain `.ts` types; avoid Node-only runtime deps in mobile imports |
| Dual test runners (Jest + Vitest) | Scope by package; root `test` runs both via workspaces |
| Repo rename / folder move confuses local clones | Document one-time migration steps; keep git history via `git mv` |

## Migration Plan

1. Create workspace root + empty `apps/` / `packages/` scaffolding.
2. `git mv` mobile files into `apps/mobile`; fix package.json workspaces and lockfile.
3. Add `packages/contracts` + minimal OpenAPI + generate script.
4. Add `apps/api` Fastify app with health + Actual port stub.
5. Add Docker Compose + `.env.example`.
6. Update specs/docs; verify quality gates per package.
7. Rollback: revert the reorganization commit if mobile cannot typecheck/start.

## Open Questions

1. Exact Actual Budget Docker image / sync-server version to pin in Compose (validate against user’s local instance).
2. Whether health stays unauthenticated forever or gains a lightweight readiness that also checks Actual connectivity (recommend: separate `/api/ready` later).
3. Repo display name: keep folder `kullin-mobile` vs rename to `kullin` (cosmetic; not required for scaffold).
