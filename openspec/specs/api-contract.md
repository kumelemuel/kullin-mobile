# API Contract Specification

## Base Configuration
- **Base URL**: `${ApiConfig.url}:${ApiConfig.port}` (dynamic, from config)
- **Auth**: `Authorization: Bearer ${ApiConfig.token}`
- **Health Check**: `GET /api/health` → `200 OK` (no body required)
- **Timeout**: 10s requests, 5s health check
- **Content-Type**: `application/json`

## Error Response Format
All error responses follow RFC 7807 (Problem Details):
```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Request body validation failed",
  "instance": "/api/orders",
  "errors": [
    { "field": "clientId", "message": "Client ID is required" }
  ]
}
```

## Standard Headers
| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <token>` |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` |
| `X-Client-Version` | `1.0.0` (from app.json) |

## Pagination
```
GET /api/orders?page=1&limit=20&sort=createdAt:desc
```
Response:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Filtering
```
GET /api/orders?status=pending&clientId=client-123&dateFrom=2024-01-01
```

## Endpoints by Domain

### Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check (returns 200 OK) |

### Orders (Example Domain)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/orders` | Yes | List orders (paginated, filterable) |
| GET | `/api/orders/:id` | Yes | Get order by ID |
| POST | `/api/orders` | Yes | Create order |
| PUT | `/api/orders/:id` | Yes | Full update |
| PATCH | `/api/orders/:id` | Yes | Partial update |
| DELETE | `/api/orders/:id` | Yes | Delete order |

### Visits (Example Domain)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/visits` | Yes | List visits |
| POST | `/api/visits` | Yes | Create visit |
| PATCH | `/api/visits/:id/status` | Yes | Update visit status |

### Products (Example Domain)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | Yes | List products |
| GET | `/api/products/:id` | Yes | Get product |
| POST | `/api/products` | Yes | Create product |

## Request/Response Schemas

### Order
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "status": "pending|confirmed|delivered|cancelled",
  "items": [
    { "productId": "uuid", "quantity": 2, "unitPrice": 10.50 }
  ],
  "total": 21.00,
  "notes": "string",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Visit
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "scheduledAt": "2024-01-15T14:00:00Z",
  "status": "scheduled|in-progress|completed|cancelled",
  "notes": "string",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Product
```json
{
  "id": "uuid",
  "name": "string",
  "sku": "string",
  "price": 10.50,
  "stock": 100,
  "active": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Sync-Relevant Endpoints
All write endpoints must be idempotent or support client-generated IDs for offline-first:

| Operation | Idempotency Key |
|-----------|-----------------|
| `POST /api/orders` | Client generates UUID → send in `id` field |
| `PUT /api/orders/:id` | Full replace |
| `PATCH /api/orders/:id` | Partial update |
| `DELETE /api/orders/:id` | Idempotent by nature |

## Versioning
- API version in URL: `/api/v1/...` (future)
- Current: no version prefix (v1 implicit)
- Breaking changes → new version path

## Rate Limiting
- Not enforced client-side
- Backend may return `429 Too Many Requests`
- Client: retry with backoff on 429

---

*Update when API contract changes. This spec drives codegen.*