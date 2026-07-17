# Kullin Mobile - Living Specifications

This directory contains the living specifications that evolve with the codebase. Each spec is a markdown file describing a domain area, data model, or system behavior.

## Spec Index

| Spec | Description | Last Updated |
|------|-------------|--------------|
| [architecture.md](architecture.md) | System architecture, data flow, offline-first patterns | 2024-07-17 |
| [data-models.md](data-models.md) | Realm schemas, relationships, migrations | 2024-07-17 |
| [sync-engine.md](sync-engine.md) | Queue processing, health checks, backoff, retry logic | 2024-07-17 |
| [api-config.md](api-config.md) | First-run configuration, validation, token management | 2024-07-17 |
| [offline-behavior.md](offline-behavior.md) | Offline capabilities, queue logic, UI states | 2024-07-17 |
| [network-layer.md](network-layer.md) | Connectivity monitoring, API client, interceptors | 2024-07-17 |

## Spec Lifecycle

```
1. /opsx:new <feature>        → Creates change folder with proposal.md
2. /opsx:ff                   → Generates specs/, design.md, tasks.md
3. Review & edit specs        → Update living specs in openspec/specs/
4. /opsx:apply                → Implements tasks
5. /opsx:archive              → Archives change, specs updated
```

## Quick Reference

### For New Features
1. Check if spec exists in this directory
2. If not, create it (or update existing)
3. Use `/opsx:new` to start the SDD cycle
4. Update spec after implementation

### For Bug Fixes
1. Identify which spec describes expected behavior
2. Update spec if behavior was wrong/undocumented
3. Fix code to match spec
4. Add test for regression

### For Refactoring
1. Update spec to reflect new structure
2. Run `/opsx:new refactor-<area>`
3. Implement with `/opsx:apply`
4. Verify behavior unchanged via tests

---

> **Rule**: Code follows specs. Specs follow requirements. Both are versioned together.