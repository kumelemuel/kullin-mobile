# Sync Engine Specification

## Overview
The sync engine processes the offline operation queue when connectivity is available and the API health check passes.

## Components

| Component | File | Responsibility |
|-----------|------|----------------|
| QueueService | `src/services/queue.service.ts` | CRUD for PendingOperation |
| SyncService | `src/services/sync.service.ts` | Orchestration, backoff, status |
| NetworkMonitor | `src/core/network/networkMonitor.ts` | Connectivity + health check |
| HealthCheck | `src/core/network/networkMonitor.ts` | `GET /api/health` |

## Sync Trigger Conditions

| Trigger | Condition | Action |
|---------|-----------|--------|
| Foreground | `isOnline` changes `false → true` | Immediate health check → sync |
| Background | Background fetch (15 min min interval) | Health check → sync if healthy |
| Manual | User presses "Sincronizar" | Health check → sync |
| Pull-to-refresh | Home/Sync screen refresh | Health check → sync |

## Processing Algorithm

```typescript
async processQueue(): Promise<SyncResult> {
  if (isProcessing) return { success: false, error: 'Already processing' }
  if (!getNetworkStatus()) return { success: false, error: 'Offline' }
  
  const healthy = await checkHealth()
  if (!healthy) return { success: false, error: 'Health check failed' }

  isProcessing = true
  notify({ isSyncing: true, error: null })

  const pending = queueService.getPending()  // Ordered by timestamp ASC
  let synced = 0, failed = 0

  for (const op of pending) {
    if (!getNetworkStatus()) break  // Abort if went offline

    queueService.markSyncing(op._id)

    try {
      await executeOperation(op)
      queueService.markSynced(op._id)
      synced++
    } catch (error) {
      if (op.retries >= MAX_RETRIES) {
        queueService.markFailed(op._id, error.message)
        failed++
      } else {
        queueService.incrementRetries(op._id, error.message)
        await sleep(calculateBackoff(op.retries))
      }
    }

    notify({ pendingCount: queueService.getPendingCount() })
  }

  isProcessing = false
  queueService.deleteSynced()  // Cleanup
  notify({ 
    isSyncing: false, 
    lastSync: Date.now(), 
    pendingCount: queueService.getPendingCount(),
    error: failed > 0 ? `${failed} failed` : null
  })

  return { success: failed === 0, synced, failed }
}
```

## Backoff Strategy

| Attempt | Delay | Jitter | Max |
|---------|-------|--------|-----|
| 1 | 1s | ±1s | 2s |
| 2 | 2s | ±1s | 3s |
| 3 | 4s | ±1s | 5s |
| 4 | 8s | ±1s | 9s |
| 5 | 16s | ±1s | 17s |
| 6+ | 30s | ±1s | 31s |

**Formula**: `min(base * 2^attempt, MAX_DELAY) + random(0, 1000)`
- `BASE_DELAY = 1000ms`
- `MAX_DELAY = 30000ms`
- `MAX_RETRIES = 3`

## Execute Operation

```typescript
async function executeOperation(op: PendingOperation): Promise<void> {
  const { type, endpoint, payload } = op
  
  switch (type) {
    case 'create':
      await apiClient.post(endpoint, payload)
      break
    case 'update':
      await apiClient.put(endpoint, payload)
      break
    case 'delete':
      await apiClient.delete(endpoint)
      break
    default:
      throw new Error(`Unknown operation type: ${type}`)
  }
}
```

## Status Events (Observable)

```typescript
interface SyncStatus {
  isSyncing: boolean
  pendingCount: number
  lastSync: number | null
  error: string | null
}

syncService.subscribe((status) => {
  // UI updates: badge count, spinner, last sync time, error banner
})
```

## Health Check Contract

| Aspect | Spec |
|--------|------|
| Endpoint | `GET {baseURL}/api/health` |
| Timeout | 5 seconds |
| Success | HTTP 200 (any body) |
| Failure | Non-200, timeout, network error |
| Auth | Bearer token in Authorization header |

## Error Handling Matrix

| Error | Retry? | Max Retries | Action |
|-------|--------|-------------|--------|
| Network offline | No | N/A | Wait for online |
| Health check fail | No | N/A | Wait for online |
| 5xx / Timeout | Yes | 3 | Backoff + retry |
| 401 / 403 | No | 0 | Clear config, redirect |
| 4xx (validation) | No | 0 | Mark FAILED, show in UI |
| Realm error | No | 0 | Log, don't crash |

## Concurrency

- **Single sync at a time** (mutex via `isProcessing` flag)
- New triggers while processing are ignored (return early)
- Manual sync during background sync: waits or aborts current

## Cleanup

- Synced operations deleted after batch completes (`deleteSynced()`)
- Failed operations retained (dead letter queue) for inspection
- Max queue size: unbounded (practical limit: device storage)

## Metrics (for observability)

| Metric | Source |
|--------|--------|
| Queue depth | `queueService.getPendingCount()` |
| Sync duration | `lastSync - syncStart` |
| Success rate | `synced / (synced + failed)` |
| Retry count | `op.retries` per operation |
| Time to sync | `op.timestamp` to `synced` |

---

*Update when backoff, retry logic, or health check contract changes.*