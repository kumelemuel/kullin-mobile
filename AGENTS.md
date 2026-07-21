# Kullin - Agent Instructions

## Project Overview

npm workspaces monorepo for an offline-first Expo mobile app and a local Fastify API that will integrate with Actual Budget.

```
Mobile (Realm offline-first) → Kullin API (Fastify) → Actual Budget adapter → Actual Budget
```

## Quick Commands (from repo root)

```bash
# Mobile
npm run mobile              # Expo dev server
npm run mobile:android
npm run mobile:ios

# API
npm run api                 # Fastify dev (tsx watch)
npm run api:start

# Contracts
npm run generate:api        # OpenAPI → TypeScript types

# Quality (all workspaces)
npm run lint
npm run typecheck
npm run test
npm run format
npm run format:check

# Mobile-only EAS (from apps/mobile or via -w)
npm run eas:build -w @kullin/mobile
```

## Monorepo layout

```
apps/mobile/          # Expo React Native app (@kullin/mobile)
apps/api/             # Fastify API (@kullin/api)
packages/contracts/   # OpenAPI + generated types (@kullin/contracts)
openspec/             # Specs and changes
docker-compose.yml    # Local API (+ optional Actual profile)
```

### Mobile (`apps/mobile/src`)

```
src/
├── core/          # API client, network monitor
├── db/            # Realm models + repositories
├── features/      # api-config, sync, …
├── services/      # queue, sync
└── components/
```

### API (`apps/api/src`)

```
src/
├── app.ts / server.ts
├── modules/health/
└── actual/        # ActualBudgetPort + stub adapter
```

## Key Patterns

### Offline-First Write (mobile)
```typescript
await queueService.enqueue({
  type: 'create',
  endpoint: '/api/...',
  payload: entity,
  entityType: '...',
  entityId: entity.id,
});
```

### Sync Flow
1. `NetworkMonitor` online → `GET /api/health` on Kullin API
2. If 200 → process `PendingOperation` queue with backoff
3. On 401/403 → clear config → `ApiConfigScreen`

### API Config (First Run)
- Mobile collects Kullin API `url`, `port`, `token` only
- Actual Budget secrets live only in API env (see `.env.example`)

### OpenAPI
- Source of truth: `packages/contracts/openapi/openapi.yaml`
- Regenerate: `npm run generate:api`
- Active contract (this phase): `GET /api/health` only

## Configuration Files
- Root: `package.json` (workspaces), `.prettierrc`, `docker-compose.yml`, `.env.example`
- Mobile: `apps/mobile/tsconfig.json`, `eslint.config.js`, `jest.config.js`, `eas.json`, `app.json`
- API: `apps/api/tsconfig.json`, `vitest.config.ts`
- Contracts: `packages/contracts/openapi/openapi.yaml`

## Realm Schema (v1)
- `ApiConfig` — `url`, `port`, `token`, `updatedAt`
- `PendingOperation` — offline queue

## Environment
- Node 20+
- Expo SDK 57 / React Native 0.86
- TypeScript 6 strict
- Fastify 5 (API)
- Vitest (API) / Jest (mobile)

## Git
- Branch: `main`
- Conventional Commits (`feat:`, `fix:`, `chore:`)

### Tools

When you need to search docs, use `context7` tools.
