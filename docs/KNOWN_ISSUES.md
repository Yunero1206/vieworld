# VieWorld Known Issues and Defect Registry

This document tracks known defects, browser compatibility edge cases, and environment anomalies encountered during build phases.

---

## Active Issues

| Issue ID | Discovered Packet | Severity | Description | Status / Mitigation |
|---|---|---|---|---|
| `ISSUE-002` | P00 | Low | Antigravity IDE browser subagent fails to launch due to external CDN 404 when downloading `playwright-1.57.0-win32_x64.zip`. | Active environment issue. Dev server verified running directly on `http://127.0.0.1:5173`; automated unit/DOM tests cover all shell criteria. |

---

## Resolved Issues

| Issue ID | Discovered Packet | Severity | Description | Resolution / Mitigation |
|---|---|---|---|---|
| `ISSUE-001` | P00 | Medium | Standard PowerShell execution policy on Windows blocks direct invocation of `npm.ps1` (`PSSecurityException`). | Resolved in DEC-005: all automated build and runtime invocations explicitly call `npm.cmd` and `npx.cmd`. |

---

## Tracking Conventions
- **Severity Levels**:
  - `Critical`: Blocks build, violates core constitution rules (e.g., secret leakage, missing DEMO badge, data leakage across tenants).
  - `High`: Acceptance test failure on a core user path.
  - `Medium`: Minor layout regression, non-critical console warning, or platform-specific CLI quirk.
  - `Low`: Cosmetic inconsistency or non-blocking typo.
- **Repair Rule**: After two unsuccessful repair attempts with the same symptom, checkpoint evidence, reduce to minimal reproduction, and diagnose before changing more code.
