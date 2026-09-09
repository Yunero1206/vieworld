# VieWorld Decision Log

This document records architectural, product, and implementation decisions. It is append-only. Newer decisions are indexed at the top.

---

## Index of Decisions

- [DEC-005: Tooling Execution via npm.cmd on Windows Systems](#dec-005-tooling-execution-via-npmcmd-on-windows-systems)
- [DEC-004: Native CSS Custom Properties and Semantic HTML over Utility Frameworks](#dec-004-native-css-custom-properties-and-semantic-html-over-utility-frameworks)
- [DEC-003: Deterministic Pure Reducer Architecture and Injected Demo Time](#dec-003-deterministic-pure-reducer-architecture-and-injected-demo-time)
- [DEC-002: Namespaced Versioned LocalStorage with In-Memory Memory Fallback](#dec-002-namespaced-versioned-localstorage-with-in-memory-memory-fallback)
- [DEC-001: Stack Selection — React 19, Vite, TypeScript, React Router 7, and Vitest](#dec-001-stack-selection--react-19-vite-typescript-react-router-7-and-vitest)

---

## DEC-005: Tooling Execution via npm.cmd on Windows Systems
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: On Windows workstations with standard PowerShell execution policy restrictions, executing `npm` directly invokes `npm.ps1`, triggering a `PSSecurityException`.
- **Decision**: All package management and build script invocations must explicitly use `npm.cmd` or `npx.cmd` in Windows terminal environments.
- **Consequences**: Consistent automated execution across Windows developer environments without requiring elevated global execution policy modifications.

---

## DEC-004: Native CSS Custom Properties and Semantic HTML over Utility Frameworks
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: The project brief specifies explicit design tokens (§3.1) and mandates semantic HTML, accessible dialogs, and high visual polish without ad-hoc utility clutter or external styling engine overhead.
- **Decision**: Implement the design system directly in `src/index.css` using CSS custom properties matching §3.1 token values (`--bg`, `--surface`, `--ink`, `--muted`, `--stage`, `--primary`, `--accent`, `--danger`, `--border`). All interactive elements must use native semantic tags (`<button>`, `<a>`, `<dialog>`).
- **Consequences**: Zero stylesheet build dependencies, predictable cascading styles, instant CSS variable updates for tenant theme switching (P15), and compliance with WCAG 2.2 AA.

---

## DEC-003: Deterministic Pure Reducer Architecture and Injected Demo Time
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: Action guards (§5.3) require strict idempotency (e.g., duplicate orders, duplicate attendance, double RSVP) and verifiable transition rules across simulated session clocks.
- **Decision**: Domain logic will be housed in pure domain transition functions inside `src/domain/`, backed by a centralized React reducer. Time must be injected via a configurable demo clock rather than raw `Date.now()` calls.
- **Consequences**: 100% testable state transitions in Vitest unit tests without mocking timers or relying on asynchronous timing races.

---

## DEC-002: Namespaced Versioned LocalStorage with In-Memory Memory Fallback
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: The prototype must persist state across browser page refreshes, isolate tenant data (`vieworld-demo`, `mfan-demo`, `fanme-demo`), and gracefully handle quota exhaustion or private browsing storage denials without crashing.
- **Decision**: Create a dedicated storage adapter (`src/services/storageAdapter.ts`) with schema versioning (`app_schema_v1`) and tenant-keyed prefixes (`vieworld_v1_${tenantId}`). If localStorage throws `SecurityError` or `QuotaExceededError`, seamlessly fall back to an in-memory storage dictionary and expose an active non-persistence notification in the UI.
- **Consequences**: State survives normal reloads; tenant switching never leaks state; private browsing remains functional; no user or application crash.

---

## DEC-001: Stack Selection — React 19, Vite, TypeScript, React Router 7, and Vitest
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: The repository is an empty application folder. §4 recommends React + TypeScript + Vite with React Router, Vitest/Testing Library for component tests, and Playwright for E2E tests.
- **Decision**: Initialize with:
  - React 19 (`react`, `react-dom`)
  - Vite 6 / 8 bundler
  - TypeScript 5 (strict mode enabled)
  - React Router 7 (`react-router-dom`)
  - Vitest + `@testing-library/react` + `jsdom`
  - Lucide React for consistent icons
- **Consequences**: Ultra-fast build times, strict static type safety matching §5.2 schemas, modern client-side routing, and seamless browser component testing.
