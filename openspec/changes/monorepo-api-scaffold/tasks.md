## 1. Monorepo workspace skeleton

- [x] 1.1 Create `apps/` and `packages/` directories; add root workspace `package.json` with `workspaces: ["apps/*", "packages/*"]` and placeholder root scripts
- [x] 1.2 Move existing Expo app into `apps/mobile` via `git mv` (app, src, assets, config files, lockfile strategy) and restore a mobile `package.json`
- [x] 1.3 Fix mobile paths (`tsconfig`, ESLint, Jest, EAS, Expo entry) so `npm run typecheck` / `lint` / `test` work from `apps/mobile`
- [x] 1.4 Reinstall workspaces at root (`npm install`) and verify mobile scripts are invocable via root proxies

## 2. OpenAPI contracts package

- [x] 2.1 Scaffold `packages/contracts` with package name `@kullin/contracts`, TypeScript config, and `openapi/openapi.yaml` defining `GET /api/health`
- [x] 2.2 Add OpenAPI → TypeScript generation script and commit generated types output path
- [x] 2.3 Wire root `generate:api` script; verify generation runs cleanly

## 3. API server scaffold (backend)

- [x] 3.1 Scaffold `apps/api` Fastify + TypeScript ESM package with env-based host/port and dependency on `@kullin/contracts` **(backend)**
- [x] 3.2 Implement `GET /api/health` returning 200 without auth **(backend)**
- [x] 3.3 Add `ActualBudgetPort` + stub adapter under `apps/api/src/actual/` with clear unimplemented errors **(backend)**
- [x] 3.4 Add Vitest + health route test; add API `typecheck` / `test` / `dev` scripts **(backend)**

## 4. Local Actual / Compose wiring (backend)

- [x] 4.1 Add root `docker-compose.yml` with `api` service build for `apps/api` and Actual service/placeholder **(backend)**
- [x] 4.2 Add `.env.example` documenting `KULLIN_API_TOKEN`, Actual-related vars, and ports; ensure secrets are not committed **(backend)**

## 5. Docs and living specs

- [x] 5.1 Update `AGENTS.md` and `openspec/config.yaml` for monorepo paths, API package, and OpenAPI generate command
- [x] 5.2 Update living `openspec/specs/architecture.md` and `api-contract.md` to match delta requirements (Mobile → Kullin API → Actual; health-only active contract)
- [x] 5.3 Remove or clearly deprecate example order/visit/product contract content from living API docs

## 6. Verification

- [x] 6.1 Run mobile typecheck, lint, and tests; fix path regressions
- [x] 6.2 Run API typecheck and Vitest; manually hit `GET /api/health` **(backend)**
- [x] 6.3 Run `generate:api` and confirm contracts package builds; spot-check workspace dependency resolution
