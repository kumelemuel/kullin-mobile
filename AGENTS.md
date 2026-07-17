# Kullin Mobile - Agent Instructions

## Project Overview
Offline-first React Native app (Expo managed) for Android/iOS with intermittent API connectivity. Stores data locally via Realm and syncs when `/api/health` returns 200.

## Quick Commands

```bash
# Development
npm start              # Expo dev server
npm run android        # Android emulator
npm run ios            # iOS simulator (macOS only)

# Quality
npm run lint           # ESLint
npm run typecheck      # TypeScript strict check
npm run test           # Jest unit tests
npm run test:watch     # Watch mode
npm run format         # Prettier write
npm run format:check   # Prettier check

# Build (EAS)
npm run eas:build      # Build all platforms
npm run eas:build:preview  # Preview build (internal dist)
```

## Architecture

```
src/
├── core/
│   ├── api/client.ts          # Axios instance with JWT interceptor
│   └── network/networkMonitor.ts  # NetInfo + health check
├── db/
│   ├── realm.ts               # Realm singleton + config
│   ├── models/
│   │   ├── ApiConfig.ts       # { url, port, token } - single record
│   │   └── PendingOperation.ts # Offline queue items
│   └── repositories/          # Data access layer
├── features/
│   ├── api-config/            # First-run config screen + Zustand store
│   └── sync/                  # Sync status UI + Zustand store
├── services/
│   ├── queue.service.ts       # Enqueue/dequeue pending ops
│   └── sync.service.ts        # Sequential sync with backoff
└── components/                # Shared UI components
```

## Key Patterns

### Offline-First Write
```typescript
// In any repository create/update/delete:
await queueService.enqueue({
  type: 'create',
  endpoint: '/api/orders',
  payload: newOrder,
  entityType: 'order',
  entityId: newOrder.id,
});
// UI updates optimistically via Realm reactive queries
```

### Sync Flow
1. `NetworkMonitor` detects online → `checkHealth()` → `GET /api/health`
2. If healthy → `SyncService.processQueue()` processes `PendingOperation` sequentially
3. Exponential backoff: 1s, 2s, 4s... max 30s, max 3 retries
4. On 401/403 → clear config → redirect to `ApiConfigScreen`

### API Config (First Run)
- No login. App starts at `ApiConfigScreen` asking for `url`, `port`, `token`
- Validates via `GET {url}:{port}/api/health` with `Authorization: Bearer {token}`
- Persisted in Realm (`ApiConfig` model) + Zustand (for `isConfigured` flag)

## Configuration Files
- `tsconfig.json` — strict, path aliases `@/*`, `@core/*`, `@db/*`, `@features/*`, etc.
- `.eslintrc.cjs` — Expo + TypeScript + Prettier
- `.prettierrc` — single quotes, 100 width, trailing commas
- `jest.config.js` — jest-expo + ts-jest, module aliases
- `eas.json` — development/preview/production profiles
- `app.json` — scheme `kullin-mobile`, iOS background fetch, Android permissions

## Realm Schema (v1)
- `ApiConfig` — single record: `url`, `port`, `token`, `updatedAt`
- `PendingOperation` — queue: `type` (create/update/delete), `endpoint`, `payload` (JSON), `entityType`, `entityId`, `status` (pending/syncing/synced/failed), `retries`, `lastError`

## Testing
```bash
npm run test        # Unit tests
npm run test:watch  # Watch mode
```

## Common Tasks

### Add New Entity
1. Create model in `src/db/models/Entity.ts`
2. Add to `realmConfig.schema` in `src/db/realm.ts`
3. Create repository in `src/db/repositories/EntityRepository.ts`
4. Use `queueService.enqueue()` in repository write methods

### Modify Sync Logic
Edit `src/services/sync.service.ts` — `executeOperation()` handles create/update/delete

### Change Health Endpoint
Edit `src/core/network/networkMonitor.ts` — `checkHealth()` function

## Environment
- Node 20+
- Expo SDK 57
- React Native 0.86
- TypeScript 6 strict mode

## Git
- Branch: `main`
- Commit style: Conventional Commits (`feat:`, `fix:`, `chore:`)