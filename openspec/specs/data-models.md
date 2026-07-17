# Data Models Specification

## Realm Schema (v1)

### ApiConfig
Single-record configuration for API connectivity.

```typescript
class ApiConfig extends Realm.Object<ApiConfig> {
  _id: Realm.BSON.ObjectId;           // Primary key
  url: string;                         // Base URL: "https://api.example.com"
  port: number;                        // Port: 443, 3000, 8080 (REQUIRED)
  token: string;                       // Bearer token
  updatedAt: number;                   // Unix timestamp (ms)
}

static schema: Realm.ObjectSchema = {
  name: 'ApiConfig',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    url: 'string',
    port: 'int',
    token: 'string',
    updatedAt: 'int',
  },
}
```

**Constraints:**
- Singleton: only ONE record exists (enforced by `ApiConfigRepository.getConfig()`)
- No default port - user must specify
- Token stored in Realm (encrypted at rest)

---

### PendingOperation
Queue item for offline operations awaiting sync.

```typescript
class PendingOperation extends Realm.Object<PendingOperation> {
  _id: Realm.BSON.ObjectId;                    // Primary key
  type: 'create' | 'update' | 'delete';        // Operation type
  endpoint: string;                             // API endpoint: "/api/orders"
  payload: string;                              // JSON stringified request body
  entityType?: string;                          // Domain: "order", "visit"
  entityId?: string;                            // Entity ID for deduplication
  timestamp: number;                            // Created at (unix ms)
  retries: number;                              // Attempt count (default: 0)
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  lastError?: string;                           // Last error message
}

static schema: Realm.ObjectSchema = {
  name: 'PendingOperation',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    type: 'string',
    endpoint: 'string',
    payload: 'string',
    entityType: { type: 'string', optional: true },
    entityId: { type: 'string', optional: true },
    timestamp: 'int',
    retries: { type: 'int', default: 0 },
    status: { type: 'string', default: 'pending' },
    lastError: { type: 'string', optional: true },
  },
}
```

**Indexes (implicit via queries):**
- `status + timestamp` — ordered pending queue
- `entityType + entityId` — deduplication

**Status Transitions:**
```
pending → syncing → synced → (deleted after batch)
    ↓
  failed → (retries < 3) → pending (with backoff)
    ↓
  failed → (retries >= 3) → failed (dead letter)
```

---

## Adding New Domain Entities

### Template
```typescript
// src/db/models/EntityName.ts
import Realm from 'realm';

export class EntityName extends Realm.Object<EntityName> {
  _id: Realm.BSON.ObjectId;
  // Domain fields...
  name: string;
  status: 'active' | 'inactive';
  // Sync metadata:
  syncedAt?: number;        // Last successful sync
  localOnly?: boolean;      // True if created offline
  serverId?: string;        // Server-assigned ID (if different)
  
  static schema: Realm.ObjectSchema = {
    name: 'EntityName',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      name: 'string',
      status: 'string',
      syncedAt: { type: 'int', optional: true },
      localOnly: { type: 'bool', default: true },
      serverId: { type: 'string', optional: true },
    },
  };
}
```

### Checklist for New Entity
1. [ ] Create model in `src/db/models/`
2. [ ] Add schema to `realmConfig.schema` in `src/db/realm.ts`
3. [ ] Create repository in `src/db/repositories/EntityNameRepository.ts`
4. [ ] Use `queueService.enqueue()` in repository write methods
5. [ ] Add case in `SyncService.executeOperation()` switch
6. [ ] Create feature folder in `src/features/entity-name/`
7. [ ] Update this spec

---

## Migration Strategy

- `schemaVersion: 1` (current)
- Only additive changes: new properties, new models
- Never remove properties - mark deprecated
- Migration function in `realmConfig.migration(oldRealm, newRealm)`

### Example Migration (v1 → v2)
```javascript
migration: (oldRealm, newRealm) => {
  if (oldRealm.schemaVersion < 2) {
    // Add new property with default
    const objects = oldRealm.objects('EntityName');
    newRealm.objects('EntityName').forEach((obj) => {
      obj.newField = 'default-value';
    });
  }
}
```

---

## Query Patterns

| Pattern | Example |
|---------|---------|
| All active | `realm.objects('Entity').filtered('status == "active"')` |
| By ID | `realm.objectForPrimaryKey('Entity', id)` |
| Paginated | `.sorted('createdAt', true).slice(0, 20)` |
| Reactive | `collection.addListener(() => setData([...collection]))` |

---

## Sync Metadata Requirements

Every offline-capable entity SHOULD include:

| Field | Purpose |
|-------|---------|
| `syncedAt` | Last successful server sync |
| `localOnly` | True = never synced (created offline) |
| `serverId` | Server-assigned ID (if different from local) |
| `version` | Optimistic locking (optional) |

---

## Relationships

Current: **No Realm relationships** (avoids sync complexity)
- Logical links via `entityType + entityId` in `PendingOperation`
- Foreign keys as plain strings/ObjectIds
- Joins performed in memory or via separate queries

Future: If relationships needed, use Realm links with `inverse` and cascade rules.

---

*Update when Realm schema, models, or migration strategy changes.*