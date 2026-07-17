# Constitution: Kullin Mobile

## Core Principles

### 1. Specification is the Source of Truth
- Code is derived from specs, not the reverse
- Every feature begins with a spec update
- Specs live in `openspec/specs/` and are versioned with code
- AI agents MUST read relevant specs before implementing

### 2. Offline-First is Non-Negotiable
- All writes go to local DB first
- Network is an enhancement, not a requirement
- User never blocked by connectivity
- Sync is eventually consistent

### 3. Explicit Over Implicit
- No magic, no hidden behavior
- Configuration is explicit (no default ports)
- Errors are visible, not swallowed
- State changes are traceable

### 4. Test the Contract, Not the Implementation
- Unit tests verify behavior against specs
- Integration tests verify offline→online flows
- Contract tests verify API compliance
- No mocking what can be tested for real

### 5. Iterate on Specs, Not Code
- When requirements change: update spec → generate → implement
- Refactoring starts with spec updates
- Code reviews include spec diffs

---

## Development Rules

### Before Writing Code
1. Identify affected specs in `openspec/specs/`
2. Update specs to reflect new behavior
3. Run `npm run generate:api` if API contract changed
4. Implement against generated types/hooks

### Commit Convention
```
<type>(<scope>): <description>

Spec: <spec-file> (if applicable)
```
Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `spec`

### Branch Strategy
- `main` = production-ready
- Feature branches from `main`
- PRs require: typecheck, lint, tests pass
- Squash merge with conventional commit

### Code Quality Gates
```bash
npm run prebuild  # lint + typecheck
npm run test:ci   # unit + coverage
```

---

## Architecture Guardrails

| Rule | Enforcement |
|------|-------------|
| No direct API calls in components | Use generated hooks / repositories |
| No `any` types | ESLint `@typescript-eslint/no-explicit-any: error` |
| No side effects in render | React hooks rules |
| Realm writes only in repositories | Code review |
| All async operations cancellable | AbortController pattern |

---

## AI Agent Instructions

When working on this project:

1. **Read specs first** - Check `openspec/specs/` for relevant documents
2. **Update specs before code** - If behavior changes, spec changes first
3. **Follow existing patterns** - Repositories, services, hooks, stores
4. **Generate, don't hand-write** - Types, hooks, validators from OpenAPI
5. **Test observable behavior** - Not implementation details
6. **Keep context small** - One spec, one feature, one PR

### Slash Commands (OpenSpec)
```
/opsx:new <feature-name>        # Create change folder with proposal
/opsx:ff                        # Fast-forward: generate planning docs
/opsx:apply                     # Implement all tasks
/opsx:archive                   # Archive completed change
```

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-07-17 | Expo managed + Realm | Offline-first, TypeScript, mature |
| 2024-07-17 | Zustand + AsyncStorage | Lightweight, no boilerplate |
| 2024-07-17 | OpenSpec (Fission-AI) | Lightweight SDD, tool-agnostic |
| 2024-07-17 | No auth screen | Config-driven, token from admin |
| 2024-07-17 | Sequential sync + backoff | Simplicity, predictable ordering |

---

## Amendment Process

1. Propose change via `/opsx:new constitution-amendment`
2. Discuss in PR
3. Merge to `main` → constitution updated
4. All agents reload on next session

---

*This constitution governs all development on Kullin Mobile. Changes require explicit agreement and versioned documentation.*