# Architecture Specification

## High-Level Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   UI Layer  │────▶│  Repositories │────▶│   Realm DB  │
│ (Components)│     │  (CRUD +     │     │  (Offline   │
│             │     │   Enqueue)  │     │   First)    │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ QueueService│     │ SyncService │
                    │ (enqueue,   │     │ (process,   │
                    │  getPending)│     │  retry,     │
                    │             │     │  backoff)   │
                    └──────┬──────┘     └──────┬──────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  ApiClient  │     │ NetworkMon  │
                    │ (Axios +    │     │ (NetInfo +  │
                    │   JWT)      │     │  Health)    │
                    └──────┬──────┘     └──────┬──────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   REST API  │     │  Online/    │
                    │  (External) │     │  Offline    │
                    └─────────────┘     └─────────────┘
```

## Layer Responsibilities

| Layer | Path | Responsibility |
|-------|------|----------------|
| **UI** | `app/(tabs)/*.tsx` | Screens, navigation, user interaction |
| **Features** | `src/features/{feature}/` | Domain logic, Zustand stores, feature components |
| **Core** | `src/core/` | Cross-cutting: API client, network, auth |
| **DB** | `src/db/` | Realm config, models, repositories |
| **Services** | `src/services/` | Business logic: queue, sync |
| **Shared** | `src/components/`, `src/hooks/`, `src/utils/` | Reusable utilities |

## Key Patterns

### Offline-First Write
```typescript
// In any Repository create/update/delete:
await queueService.enqueue({
  type: 'create',
  endpoint: '/api/orders',
  payload: newOrder,
  entityType: 'order',
  entityId: newOrder.id,
});
// Realm write happens optimistically
// UI updates reactively via Realm listeners
```

### Reactive Queries
```typescript
// Components use useQuery/useObject from @realm/react
const orders = useQuery(Order); // Auto-updates on Realm changes
```

### Config-Driven API
- No hardcoded base URL
- `ApiConfigRepository` provides `url:port` + token
- `ApiClient` reads config on each request (auto-refresh)

## State Management

| Store | Path | Scope |
|-------|------|-------|
| `useApiConfigStore` | `src/features/api-config/store.ts` | Global config + `isConfigured` |
| `useSyncStore` | `src/features/sync/store.ts` | Sync status (pendingCount, lastSync, isSyncing) |
| Realm | `@realm/react` | All domain entities + pending queue |

## Navigation
- **Expo Router** (file-based)
- Tabs: `index` (Home) + `sync` (Sync status)
- First run: `ApiConfigScreen` (conditional in `_layout.tsx`)

## Background Tasks
- `expo-task-manager` + `expo-background-fetch`
- Task `background-sync` registered in `_layout.tsx`
- Minimum interval: 15 minutes (iOS limitation)

## Security
- Token stored in Realm (not SecureStore - app manages own config)
- 401/403 → auto-clear config → redirect to config screen
- No user auth - config is the credential

## TypeScript Conventions
- Strict mode enabled
- Path aliases: `@/*`, `@core/*`, `@db/*`, `@features/*`, `@services/*`, `@hooks/*`, `@utils/*`
- No `any` (warn), no unused vars (error)

## Testing Strategy
| Type | Tool | Target |
|------|------|--------|
| Unit | Vitest + @testing-library/react-native | Services, hooks, utils |
| Integration | Detox | Sync flows, offline→online |
| Contract | Pact / openapi-validator | API request/response |

---

*Update when layer boundaries, patterns, or tech stack change.*