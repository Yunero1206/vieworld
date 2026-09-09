# VieWorld Test Matrix

This matrix tracks acceptance criteria across all packets. No test may be marked `PASSED` without recorded execution evidence.

---

## Acceptance Test Status Overview

| Test ID | Packet | Description / Key Invariants | Status | Evidence Path |
|---|---|---|---|---|
| **T00** | P00 | Install, build, typecheck succeed; no secrets; workspace preserved; P01 named next; app opens minimal shell with DEMO banner. | **PASSED** | `src/tests/bootstrap.test.tsx`, `npm.cmd run build` (exit 0), `npm.cmd test` (3/3 passed) |
| **T01** | P01 | Follow never creates membership; lobby entry & replay never create live attendance; attendance granted once; duplicate action IDs idempotent; cancelled session cannot be joined. | **PASSED** | `src/tests/domain.test.ts` (21/21 passed), `npm.cmd test` (24/24 passed) |
| **T02** | P02 | Refresh preserves follows; corrupted saved state visibly recovers; storage denial falls back gracefully; tenant reset deletes only target namespace; keyboard & 390px mobile layout function. | **PASSED** | `src/tests/storage.test.tsx` (7/7 passed), `npm.cmd test` (31/31 passed) |
| **T03** | P03 | Discover → IP → artist journey works; follow/RSVP persist; scenery / list view preserves state; Artist World displays next moment without fake live presence. | NOT RUN | `src/tests/worlds.test.tsx` (Scheduled) |
| **T04** | P04 | Presence copy distinguishes all §5 states; disconnect removes artist presence; pause/reduced-motion works; no mic/camera requests; invalid session ID recovers. | NOT RUN | `src/tests/session.test.tsx` (Scheduled) |
| **T05** | P05 | Duplicate question submissions idempotent; selected is not answered; chat mute disables send; poll totals reconcile with unique votes; script tags render safely. | NOT RUN | `src/tests/chat_poll.test.tsx` (Scheduled) |
| **T06** | P06 | Full loop: follow → RSVP → join running session → question/poll → end → save capsule → My World persists after refresh; wardrobe selection persists without affecting eligibility. | NOT RUN | `src/tests/loop.test.tsx` (Scheduled) |
| **T07** | P07 | Active member with pending benefit cannot claim; eligible claim is idempotent; expired membership shows renewal path; no AI needed for eligibility. | NOT RUN | `src/tests/benefits.test.tsx` (Scheduled) |
| **T08** | P08 | Simulated order creates single order on double-click; no card/address collection; paid is not fulfilled; fulfilment updates ownership; reset isolates orders. | NOT RUN | `src/tests/orders.test.tsx` (Scheduled) |
| **T09** | P09 | Support requests reuse active case; pending benefit not automatically granted by case resolution; reconciled update propagates to My World. | NOT RUN | `src/tests/support.test.tsx` (Scheduled) |
| **T10** | P10 | Transitions produce exactly one notification; read status persists; opted-out categories silent; no fake personal artist messages; links open correct object. | NOT RUN | `src/tests/notifications.test.tsx` (Scheduled) |
| **T11** | P11 | Draft avatar does not leak into fan session; approved asset can be assigned; retired asset blocked from new sessions; asset manifest records all parts. | NOT RUN | `src/tests/avatar_studio.test.tsx` (Scheduled) |
| **T12** | P12 | Unapproved avatar/rights blocks session start; operator question selection updates fan view; disconnect changes presence immediately; cancellation persists across reload. | NOT RUN | `src/tests/operator.test.tsx` (Scheduled) |
| **T13** | P13 | Listening Room & Live House reuse session contracts; labels correct during recorded segments; no autoplay audio; expired rights disables playback consistently. | NOT RUN | `src/tests/session_variants.test.tsx` (Scheduled) |
| **T14** | P14 | Bounded World Guide answers membership queries with valid link; unknown queries decline honestly; prompt injection cannot mutate state; no outbound network calls. | NOT RUN | `src/tests/guide.test.tsx` (Scheduled) |
| **T15** | P15 | Data created in VieWorld does not leak into MFan or FanMe; switching back restores state; roles do not transfer across tenants; configuration differences documented. | NOT RUN | `src/tests/portability.test.tsx` (Scheduled) |
| **T16** | P16 | Responsive tests at 390×844, 768×1024, 1440×900; keyboard navigation & focus return; WCAG AA contrast; 200% zoom; reduced motion; error resilience. | NOT RUN | `src/tests/accessibility.test.tsx` (Scheduled) |
| **T17** | P17 | Full guided regression from clean reset; all object states covered; documentation distinguishes simulated from real capabilities; fresh start reproducible. | NOT RUN | `docs/DEMO_WALKTHROUGH.md` (Scheduled) |
| **TX01**| X01 | Multi-user pilot authorization, real media provider, backend identity. | LOCKED | Blocked pending explicit approval |
| **TX02**| X02 | Live AI guide integration, spend caps, read-only tools, retrieval guardrails. | LOCKED | Blocked pending explicit approval |
| **TX03**| X03 | Real artist video/audio capture, WebRTC media delivery, device consent. | LOCKED | Blocked pending explicit approval |
