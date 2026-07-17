# API Configuration Specification

## Overview
First-run configuration screen captures API connectivity parameters. No login/auth - token is the credential.

## Config Fields

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `url` | string | Valid hostname (no protocol, no trailing slash) | Yes |
| `port` | integer | 1-65535 | Yes |
| `token` | string | Non-empty | Yes |

## Storage

### Primary: Realm (`ApiConfig` model)
```typescript
class ApiConfig {
  _id: ObjectId;
  url: string;      // e.g., "api.example.com"
  port: number;     // e.g., 443
  token: string;    // Bearer token
  updatedAt: number; // unix ms
}
```
- Single record (enforced by repository)
- Encrypted at rest via Realm encryption

### Secondary: Zustand (`useApiConfigStore`)
```typescript
interface ApiConfigState {
  config: { url: string; port: number; token: string } | null;
  isConfigured: boolean;
  setConfig(config): Promise<void>;
  clearConfig(): Promise<void>;
  loadConfig(): void;  // From Realm on startup
}
```
- Persisted to AsyncStorage (`isConfigured` flag only)
- `config` object synced from Realm on load

## Validation Flow

```
User submits form
      ↓
Client-side validation (required, port range)
      ↓
Health Check: GET https://{url}:{port}/api/health
      ↓
Headers: Authorization: Bearer {token}
Timeout: 5 seconds
      ↓
   ┌───┴───┐
200 OK    Error
   ↓        ↓
Save       Show error:
to Realm   - Timeout → "No se pudo conectar (5s)"
+ Zustand   - Network → "Verifica URL y servidor"
   ↓        - 4xx/5xx → "Health check falló: {status}"
Navigate   - Other   → "Error: {message}"
to App
```

## Health Check Contract

**Endpoint**: `GET {url}:{port}/api/health`
**Auth**: `Authorization: Bearer {token}`
**Success**: `200 OK` (body ignored)
**Failure**: Any non-200, timeout, network error

## Token Management

- Token stored in Realm (plaintext, encrypted at rest)
- No auto-refresh (token is static credential)
- On `401/403` during sync:
  1. `ApiConfigRepository.clearConfig()`
  2. `Zustand.clearConfig()`
  3. Redirect to `ApiConfigScreen`

## First Run vs. Reconfigure

| Scenario | Behavior |
|----------|----------|
| Fresh install | Shows `ApiConfigScreen` |
| Config exists | Loads from Realm → app |
| Token expired (401) | Clears config → shows `ApiConfigScreen` |
| User wants to change | Settings → "Reconfigurar API" → clears → shows screen |

## Security Considerations

- Token stored in Realm (encrypted at rest on device)
- No SecureStore used (app manages own config)
- HTTPS enforced in production (HTTP allowed for dev)
- No token in logs (axios interceptor strips)

## Testing Scenarios

| Test | Expected |
|------|----------|
| Valid config + healthy API | Saves, navigates to app |
| Invalid URL format | Client error, no network call |
| Port out of range | Client error |
| Empty token | Client error |
| Valid config, API returns 500 | Shows "Health check falló: 500" |
| Valid config, timeout (5s) | Shows timeout error |
| Valid config, network error | Shows network error |
| 401 on sync | Clears config, shows config screen |

---

*Update when config fields, validation, or health check contract change.*