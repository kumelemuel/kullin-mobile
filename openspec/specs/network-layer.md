# Network Layer Specification

## Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| `ApiClient` | `src/core/api/client.ts` | Axios instance, JWT interceptor, base URL management |
| `NetworkMonitor` | `src/core/network/networkMonitor.ts` | NetInfo listener, online/offline events, health check |
| `HealthCheck` | `src/core/network/networkMonitor.ts` | `GET /api/health` with 5s timeout |

---

## ApiClient

### Configuration
```typescript
// Dynamic base URL from ApiConfigStore
baseURL = `https://${config.url}:${config.port}`
timeout = 10000
headers = { 'Content-Type': 'application/json' }
```

### Interceptors

**Request Interceptor:**
```typescript
// Attaches Bearer token from config
request.headers.Authorization = `Bearer ${config.token}`
```

**Response Interceptor:**
```typescript
// 401/403 → Clear config → Redirect to config screen
if (error.response?.status === 401 || 403) {
  useApiConfigStore.getState().clearConfig();
}
```

### Public Methods
```typescript
apiClient.get<T>(url, config?)
apiClient.post<T>(url, data, config?)
apiClient.put<T>(url, data, config?)
apiClient.patch<T>(url, data, config?)
apiClient.delete<T>(url, config?)
```

### Reset on Config Change
```typescript
// Called when config saved/cleared
resetApiClient() → destroys instance → next request recreates with new baseURL
```

---

## NetworkMonitor

### State
```typescript
isOnline: boolean  // true = connected + internet reachable
listeners: Set<(online: boolean) => void>
```

### Events
```typescript
// NetInfo subscription
NetInfo.addEventListener((state) => {
  const online = state.isConnected === true && state.isInternetReachable !== false;
  if (online !== isOnline) {
    isOnline = online;
    notifyListeners(online);
  }
});
```

### API
```typescript
getNetworkStatus(): boolean
subscribeNetwork(listener): () => void
initNetworkMonitor(): void  // Called once at app start
```

### Health Check
```typescript
async checkHealth(): Promise<boolean> {
  // Deduplicates concurrent calls
  if (healthCheckPromise) return healthCheckPromise;
  
  healthCheckPromise = (async () => {
    try {
      const response = await apiClient.get('/api/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    } finally {
      healthCheckPromise = null;
    }
  })();
  
  return healthCheckPromise;
}
```

---

## Integration Points

### App Startup (`app/_layout.tsx`)
```typescript
useEffect(() => {
  initNetworkMonitor();
  
  const unsubscribe = subscribeNetwork(async (online) => {
    if (online) {
      const healthy = await checkHealth();
      if (healthy) syncService.triggerSync();
    }
  });
  
  return () => unsubscribe();
}, []);
```

### Sync Trigger Conditions
| Condition | Action |
|-----------|--------|
| `online` event + health check OK | `syncService.triggerSync()` |
| App foreground + online | `syncService.triggerSync()` |
| Background fetch (15min) + online | `syncService.triggerSync()` |
| Manual pull-to-refresh | `syncService.triggerSync()` |

---

## Offline Behavior

### Request Queueing
- All writes go through `queueService.enqueue()`
- Reads hit Realm directly (cached data)
- No network requests made when offline

### Online Transition
```
NetInfo: offline → online
    ↓
checkHealth() → 200 OK?
    ↓
  Yes → syncService.processQueue()
    ↓
  Sequential execution with backoff
    ↓
  On 401/403 → clear config → redirect
```

---

## Error Handling

| Error | ApiClient | NetworkMonitor | SyncService |
|-------|-----------|----------------|-------------|
| Timeout | Rejects | Health check false | Retry with backoff |
| Network error | Rejects | `isOnline = false` | Pause queue |
| 401/403 | Clear config | N/A | Clear config |
| 4xx (other) | Rejects | N/A | Mark failed (no retry) |
| 5xx | Rejects | N/A | Retry with backoff |

---

## Configuration

| Setting | Value | Location |
|---------|-------|----------|
| Request timeout | 10s | `ApiClient` |
| Health check timeout | 5s | `checkHealth()` |
| Background fetch interval | 15 min | `app.json` → `expo-background-fetch` |
| Max retries | 3 | `SyncService` |
| Backoff base | 1s | `SyncService` |
| Max backoff | 30s | `SyncService` |

---

## Testing Contracts

### NetworkMonitor
```typescript
// Mock NetInfo
// Test: online → offline → online transitions
// Test: subscribe/unsubscribe
// Test: health check deduplication
```

### ApiClient
```typescript
// Mock axios
// Test: token attached to requests
// Test: 401 clears config
// Test: baseURL updates on config change
// Test: timeout behavior
```

### Health Check
```typescript
// Mock apiClient.get
// Test: 200 → true
// Test: 4xx/5xx → false
// Test: timeout → false
// Test: network error → false
```

---

*Update when network behavior, timeouts, or integration points change.*