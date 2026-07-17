# Offline Behavior Specification

## Guiding Principle
**All writes are local-first.** Network is optional for user interaction.

## What Works Offline

| Feature | Offline Support | Notes |
|---------|----------------|-------|
| View cached lists | ✅ Full | Realm reactive queries |
| Create records | ✅ Full | Enqueued to `PendingOperation` |
| Update records | ✅ Full | Enqueued, optimistic UI |
| Delete records | ✅ Full | Enqueued, removed from UI |
| Search/Filter cached data | ✅ Full | Local Realm queries |
| App navigation | ✅ Full | No network dependency |
| Configuration (after first run) | ✅ Full | Stored in Realm |

## What Requires Network

| Feature | Behavior Offline |
|---------|------------------|
| Initial config (first run) | ❌ Blocked - shows ApiConfigScreen |
| Health check | ❌ Fails - sync pauses |
| Sync pending operations | ❌ Queued - processes on reconnect |
| Background fetch | ❌ Skipped - runs when online |
| Real-time updates (future) | ❌ N/A - not implemented |

## Queue Behavior

### Enqueue Rules
- Every `create` → `POST` + `PendingOperation(type='create')`
- Every `update` → `PUT/PATCH` + `PendingOperation(type='update')`
- Every `delete` → `DELETE` + `PendingOperation(type='delete')`
- `entityType` + `entityId` for tracking/debugging

### Processing Order
1. FIFO by `timestamp` (oldest first)
2. Sequential (one at a time)
3. Failure → backoff → retry (max 3)

### Status Transitions
```
PENDING → SYNCING → SYNCED → (deleted after cleanup)
              ↘ FAILED → (retries) → PENDING
              ↘ FAILED (max retries) → FAILED (manual retry)
```

## UI States

### Sync Status Indicators
| State | Indicator | User Action |
|-------|-----------|-------------|
| Online + Healthy | Green dot "En línea" | None |
| Online + Unhealthy | Yellow dot "Servidor no responde" | None (auto-retry) |
| Offline | Red dot "Fuera de línea" | None |
| Syncing | Spinner "Sincronizando..." | None |
| Pending > 0 | Badge on Sync tab | Optional: pull-to-refresh |

### Optimistic Updates
- Create: Item appears immediately in list
- Update: Fields update immediately
- Delete: Item removed immediately
- If sync fails: Show error toast, keep local state, retry later

## Conflict Scenarios

| Scenario | Current Behavior |
|----------|------------------|
| Same entity updated offline + online | Server wins (last write wins) |
| Delete offline, update online | Delete wins (entity removed) |
| Create offline, duplicate online | Both exist (client generates UUID) |

*Future: Add `conflictResolution` field to `PendingOperation`*

## Background Sync

### Trigger Conditions
1. **Foreground**: `NetInfo` online event + health check pass
2. **Background**: `BackgroundFetch` (15 min min interval) + health check pass

### Background Constraints
- iOS: 30s max execution time
- Android: More lenient, but keep under 30s
- Batch size: Process max 10 operations per background run
- If queue > 10, continues on next trigger

## Error Recovery

### Automatic
- Network restore → health check → process queue
- 5xx/timeout → exponential backoff retry
- 401/403 → clear config → redirect to config screen

### Manual
- Sync tab: "Sincronizar Ahora" button
- Pull-to-refresh on Home/Sync screens
- Failed operations: remain in queue, retry on next sync

## Data Persistence

| Data | Storage | Survives Reinstall |
|------|---------|-------------------|
| ApiConfig | Realm | ❌ (App sandbox cleared) |
| Domain Entities | Realm | ❌ |
| PendingOperations | Realm | ❌ |
| Sync Status | Zustand (memory) | ❌ |

*All local data is ephemeral - source of truth is server*

## Testing Scenarios

1. **Cold start offline** → App loads, shows cached data, config persists
2. **Create offline** → Item appears, badge increments, syncs on reconnect
3. **Update offline** → Changes visible immediately, syncs on reconnect
4. **Delete offline** → Item removed, syncs on reconnect
5. **Server down** → Health fails, queue grows, auto-retry when up
6. **Token expiry** → 401 → config cleared → config screen shown
7. **Background sync** → App backgrounded >15min → sync runs

---

*Update when offline capabilities, queue logic, or UI states change.*