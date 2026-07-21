# Architecture Specification

## High-Level Data Flow

```
┌──────────────── apps/mobile ────────────────┐
│  UI → Repositories → Realm (offline-first)  │
│         │                    │              │
│         ▼                    ▼              │
│   QueueService          SyncService         │
│         │                    │              │
│         └────────┬───────────┘              │
│                  ▼                          │
│         ApiClient + NetworkMonitor          │
└──────────────────┬──────────────────────────┘
                   │ HTTPS (LAN/VPN)
                   ▼
┌──────────────── apps/api ───────────────────┐
│  Fastify modules → ActualBudgetPort         │
│                         │                   │
│                         ▼                   │
│              ActualBudgetAdapter (stub→SDK) │
└──────────────────┬──────────────────────────┘
                   ▼
            Actual Budget instance
```

Mobile MUST NOT talk to Actual Budget directly.

## Monorepo Layer Responsibilities

| Layer | Path | Responsibility |
|-------|------|----------------|
| **UI** | `apps/mobile/app/(tabs)/*.tsx` | Screens, navigation |
| **Features** | `apps/mobile/src/features/{feature}/` | Domain logic, Zustand |
| **Core** | `apps/mobile/src/core/` | API client, network |
| **DB** | `apps/mobile/src/db/` | Realm models, repositories |
| **Services** | `apps/mobile/src/services/` | Queue, sync |
| **API** | `apps/api/src/` | HTTP, modules, Actual port |
| **Contracts** | `packages/contracts/` | OpenAPI + generated types |

## Key Patterns

### Offline-First Write
```typescript
await queueService.enqueue({
  type: 'create',
  endpoint: '/api/...',
  payload: entity,
  entityType: '...',
  entityId: entity.id,
});
```

### Config-Driven API
- Mobile configures Kullin API `url` + `port` + `token` only
- Actual credentials are API env vars only

### Actual Budget Boundary
- Application code depends on `ActualBudgetPort`
- Only the adapter may use `@actual-app/api` (stub until wired)

## State Management

| Store | Path | Scope |
|-------|------|-------|
| `useApiConfigStore` | `apps/mobile/src/features/api-config/store.ts` | Config + `isConfigured` |
| `useSyncStore` | `apps/mobile/src/features/sync/store.ts` | Sync status |
| Realm | `@realm/react` | Domain entities + queue |

## Navigation
- Expo Router in `apps/mobile/app/`
- Tabs: Home + Sync; first run: ApiConfigScreen

## Security
- Mobile token in Realm (SecureStore migration is a follow-up)
- 401/403 → clear config → config screen
- Actual password never leaves the API host

## Testing
| Package | Tool |
|---------|------|
| `@kullin/mobile` | Jest + Testing Library |
| `@kullin/api` | Vitest + Fastify `inject` |

---

*Update when layer boundaries, patterns, or tech stack change.*
