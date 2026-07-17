# Sync Protocol Specification

## Overview
Sequential processing of `PendingOperation` queue with exponential backoff, triggered by network connectivity + health check.

## Queue Structure
```
PendingOperation {
  _id: ObjectId
  type: 'create' | 'update' | 'delete'
  endpoint: string          // e.g., '/api/orders'
  payload: string           // JSON.stringify(requestBody)
  entityType?: string       // e.g., 'order'
  entityId?: string         // e.g., 'order-123'
  timestamp: number         // Date.now()
  retries: number           // 0..3
  status: 'pending' | 'syncing' | 'synced' | 'failed'
  lastError?: string
}
```

## Sync Flow

```
┌─────────────────┐
│ Network Online  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ GET /api/health │◄── 5s timeout
└────────┬────────┘
         │
    ┌────┴────┐
    │ 200 OK  │
    └────┬────┘
         ▼
┌─────────────────┐
│ Process Queue   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
 Success   Failure
    │         │
    ▼         ▼
 Mark      Increment
 Synced    Retries
    │         │
    ▼         ▼
 Delete   Retry ≤3?
  Synced     │
    │      ┌──┴──┐
    ▼      Yes   No
  Next    ┌───────┘
    Op      ▼
         Mark Failed
```

## Retry Policy
| Attempt | Delay (base) | Jitter | Max Delay |
|---------|--------------|--------|-----------|
| 1       | 1s           | ±1s    | 2s        |
| 2       | 2s           | ±1s    | 3s        |
| 3       | 4s           | ±1s    | 5s        |
| 4       | 8s           | ±1s    | 9s        |
| 5       | 16s          | ±1s    | 17s       |
| 6+      | 30s (capped) | ±1s    | 31s       |

**Max retries: 3** (then mark `failed`)

## Error Handling

| Error | Action |
|-------|--------|
| Network offline | Pause queue, wait for online event |
| Health check fail | Abort sync, retry on next online |
| 401/403 | Clear config → redirect to ApiConfigScreen |
| 4xx (other) | Mark failed (non-retryable) |
| 5xx | Retry with backoff |
| Timeout | Retry with backoff |

## Background Sync
- **Foreground**: Immediate on `online` event
- **Background**: `expo-background-fetch` every 15 min (min interval)
- **Task**: `background-sync` → network check → health check → process queue

## Conflict Resolution
**Server wins** (current policy):
- Local `synced` operations deleted after success
- Failed operations remain for manual retry
- No merge logic implemented

*Future: Add `conflictResolution` field to PendingOperation for per-entity strategy.*

## Observability
- `SyncService.subscribe(callback)` → real-time status
- `SyncStatus`: `{ isSyncing, pendingCount, lastSync, error }`
- UI badge on Sync tab shows `pendingCount`

---

*Update when retry policy, conflict resolution, or queue structure changes.*