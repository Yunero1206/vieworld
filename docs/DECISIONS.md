# VieWorld Decision Log

This document records architectural, product, and implementation decisions. It is append-only. Newer decisions are indexed at the top.

---

- [DEC-015: Comprehensive Accessibility, Viewport Resilience, Focus Management, and Defensive Fallbacks](#dec-015-comprehensive-accessibility-viewport-resilience-focus-management-and-defensive-fallbacks)
- [DEC-014: Declarative Tenant Configuration, Scoped Multi-Tenant Fixtures, and Profile Role Isolation](#dec-014-declarative-tenant-configuration-scoped-multi-tenant-fixtures-and-profile-role-isolation)
- [DEC-013: Deterministic Bounded In-App Knowledge Guide, Prompt-Injection Defenses, and Distinct Non-Artist Attribution](#dec-013-deterministic-bounded-in-app-knowledge-guide-prompt-injection-defenses-and-distinct-non-artist-attribution)
- [DEC-012: Unified Session Contracts for Format Variants, User-Initiated Audio, and Cross-View Expiration Consistency](#dec-012-unified-session-contracts-for-format-variants-user-initiated-audio-and-cross-view-expiration-consistency)
- [DEC-011: Operator Session Orchestration, Rights Clearance Guardrails, and Cancellation Immutability](#dec-011-operator-session-orchestration-rights-clearance-guardrails-and-cancellation-immutability)
- [DEC-010: Artist Avatar Asset Governance, Context Gating, and Retirement Immutability](#dec-010-artist-avatar-asset-governance-context-gating-and-retirement-immutability)
- [DEC-009: In-App Truthful Notification Architecture and Category Opt-Out Invariants](#dec-009-in-app-truthful-notification-architecture-and-category-opt-out-invariants)
- [DEC-008: Explicit Decoupling of Customer Support Resolution and Source Record Reconciliation](#dec-008-explicit-decoupling-of-customer-support-resolution-and-source-record-reconciliation)
- [DEC-007: Decoupled Fulfilment and Physical Ownership Gating in Simulated Commerce](#dec-007-decoupled-fulfilment-and-physical-ownership-gating-in-simulated-commerce)
- [DEC-006: Reconciling Benefit Status Progression and Canonical Schema Stability](#dec-006-reconciling-benefit-status-progression-and-canonical-schema-stability)
- [DEC-005: Tooling Execution via npm.cmd on Windows Systems](#dec-005-tooling-execution-via-npmcmd-on-windows-systems)
- [DEC-004: Native CSS Custom Properties and Semantic HTML over Utility Frameworks](#dec-004-native-css-custom-properties-and-semantic-html-over-utility-frameworks)
- [DEC-003: Deterministic Pure Reducer Architecture and Injected Demo Time](#dec-003-deterministic-pure-reducer-architecture-and-injected-demo-time)
- [DEC-002: Namespaced Versioned LocalStorage with In-Memory Memory Fallback](#dec-002-namespaced-versioned-localstorage-with-in-memory-memory-fallback)
- [DEC-001: Stack Selection — React 19, Vite, TypeScript, React Router 7, and Vitest](#dec-001-stack-selection--react-19-vite-typescript-react-router-7-and-vitest)

---

## DEC-015: Comprehensive Accessibility, Viewport Resilience, Focus Management, and Defensive Fallbacks
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: Packet P16, CONSTITUTION §2, §3, §4, and CONTRACTS §7.2 mandate:
  1. Multi-viewport resilience: mobile (390×844), tablet (768×1024), and desktop (1440×900) without horizontal overflow or clipped controls.
  2. Keyboard-only navigation path, skip-to-content bypass link (`#main-content`), and visible `:focus-visible` styling.
  3. Dialog and drawer focus management: Escape key dismissal, `aria-modal="true"`, and focus restoration to the trigger element on close.
  4. WCAG AA color contrast verification (> 4.5:1 for body text, > 3.0:1 for large text / boundaries).
  5. 200% text zoom and fluid text wrap without horizontal scroll or truncated text.
  6. Support for reduced motion preferences (`prefers-reduced-motion: reduce`) freezing idle animations and suppressing visual equalizers.
  7. Audio strictly user-initiated, paused/muted by default, zero autoplay.
  8. Defensive fallbacks: missing media notices, fallback avatar silhouettes on unrecognized parts, storage denial in-memory fallback.
  9. ErrorBoundary component containing uncaught UI exceptions with accessible recovery interface.
  10. Security: zero uncontrolled HTML rendering (`dangerouslySetInnerHTML`), zero credential/card forms.
- **Decision**:
  1. Add `.skip-link` in `AppShell.tsx` and `src/index.css` targeting `#main-content`.
  2. Create `src/components/ErrorBoundary.tsx` class component with `getDerivedStateFromError`, `componentDidCatch`, and recovery UI (`[data-testid="error-boundary-fallback"]`). Wrap `<Outlet />` in `AppShell`.
  3. Update `ResetDrawer.tsx` and `WorldGuidePanel.tsx` with `previouslyFocusedElement` ref and Escape key dismissal.
  4. Implement fluid CSS containment (`overflow-x: hidden; max-width: 100vw;`) on `html, body, .app-container`.
  5. Adjust view grids from fixed minimums (360px, 340px) to fluid minimums (`minmax(min(100%, 340px), 1fr)`) across `AvatarStudioView`, `OperatorConsoleView`, `SessionView`, `MyWorldView`, `StudioOverviewView`, and `ShopView`.
  6. Add neutral torso fallback in `AvatarStage.tsx` (`[data-testid="fallback-avatar-torso"]`).
  7. Implement Acceptance Test Suite `src/tests/accessibility.test.tsx` (16/16 tests passing).
- **Consequences**: Full compliance with WCAG AA, robust keyboard paths, error recovery boundaries, zero horizontal overflow across all tested viewports, and zero regressions across all 185 tests.

---

## DEC-014: Declarative Tenant Configuration, Scoped Multi-Tenant Fixtures, and Profile Role Isolation
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: Packet P15, CONSTITUTION §1, §2.3, §3, §4, and CONTRACTS §7.2 mandate external tenant portability configurations demonstrating schema portability and data isolation across **VieWorld** (`vieworld-demo`), **MFan** (`mfan-demo`), and **FanMe** (`fanme-demo`). Specifically:
  1. MFan and FanMe must be clearly labeled demo configurations without scraping third-party websites or using proprietary trademarks.
  2. Labels, accent color tokens, and content priorities must be driven purely through declarative configuration (`TenantConfig`), never through forked page code.
  3. Switching tenant configurations must save current state, load target isolated data, and guarantee zero data bleed across tenant namespaces.
  4. Fan/artist official roles cannot transfer across tenants.
  5. Context-invalid routes (e.g. accessing a VieWorld-specific world route `/worlds/artist-a` while in MFan) must resolve safely with informative recovery cards without crashing.
  6. The application must explicitly disclaim that real external accounts are NOT connected.
  7. Document what needed configuration versus actual code change.
- **Decision**:
  1. Implement `src/domain/tenantConfig.ts` with typed `TenantConfig` registry containing distinct branding, accent tokens (`#6551C8` for VieWorld, `#0284c7` for MFan, `#db2777` for FanMe), localized labels, content priorities, and non-affiliation disclaimers.
  2. Implement scoped fixtures in `src/data/fixtures.ts` (`MFAN_WORLDS`, `MFAN_AVATARS`, `MFAN_SESSIONS`, `MFAN_MEMBERSHIPS`, `MFAN_BENEFITS`, `MFAN_PRODUCTS`, `MFAN_FAN_PROFILE`, and `FANME_` equivalents) so that `createInitialState(tenantId)` generates clean, isolated domain models.
  3. Apply CSS custom properties dynamically on `.app-container` in `AppShell` (`--primary`, `--primary-hover`, `--tenant-accent-light`, `--tenant-accent-border`), allowing all standard views and buttons to reflect the active tenant's palette without code branches.
  4. Add `role?: FanRole` (`'fan' | 'artist' | 'operator'`) to `FanProfile` and support `SET_FAN_ROLE` in the reducer. When switching tenants, target profile hydrates with its own isolated role (defaulting to `'fan'`), strictly preventing official roles from leaking.
  5. Enforce safe route recovery screens across detail views (`WorldDetailView`, `SessionView`, `BenefitDetailView`, `OrderDetailView`, `SupportCaseDetailView`) with dedicated `data-testid` recovery cards.
  6. Add prominent persistent tenant disclaimer banner (`[data-testid="tenant-disclaimer-notice"]`) in `AppShell`.
  7. **Documentation of What Needed Configuration vs. Actual Code Change**:
     - **Needed Configuration (Declarative data & metadata)**:
       - Tenant branding: `displayName`, `tagline`, `primaryBrandText`, `brandBadge`.
       - Accent color tokens: `accentColor`, `accentHover`, `accentLight`, `accentBorder`.
       - Domain vocabulary: `discoverTitle`, `worldsTitle`, `myWorldTitle`, `shopTitle`, `sessionsTitle`, `inboxTitle`, `studioTitle`.
       - Content priorities & welcome hero text: `featuredWorldId`, `welcomeHeading`, `welcomeDescription`.
       - Scoped data fixtures: Distinct artist worlds, sessions, products, memberships, benefits, and fan profiles for MFan and FanMe.
       - Disclaimers: Explicit disclosures denying third-party account connections or trademark claims.
     - **Actual Code Change (Generic architectural machinery)**:
       - `src/domain/tenantConfig.ts`: Core configuration module and `getTenantConfig()` lookup function.
       - `src/domain/types.ts`: `FanRole` type and `SET_FAN_ROLE` action addition.
       - `src/domain/reducer.ts`: Reducer handler for `SET_FAN_ROLE`.
       - `src/components/AppShell.tsx`: Dynamic CSS variable injection, dynamic navigation labels, quick tenant selector (`[data-testid="tenant-switcher-select"]`), and disclaimer banner (`[data-testid="tenant-disclaimer-notice"]`).
       - `src/views/DiscoverView.tsx`: Dynamic welcome hero rendering and safe session fallback.
       - Detail views: Safe recovery screens with explicit `data-testid` attributes.
- **Consequences**: Verified multi-tenant portability, zero data leakage across namespaces, zero forked page code, zero network/scraping dependencies, and total role isolation.

---

## DEC-013: Deterministic Bounded In-App Knowledge Guide, Prompt-Injection Defenses, and Distinct Non-Artist Attribution
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: Packet P14, CONSTITUTION §2.3, §3.3, §7.2, and CONTRACTS §7.2 mandate an in-app assistance guide (**VieGuide**) that strictly assists users with navigation, rules, and troubleshooting without impersonating artists or deploying unapproved live generative models. Specifically:
  1. The guide must prominently display a non-artist disclaimer banner (`Hướng dẫn demo · Không phải nghệ sĩ` / `[data-testid="guide-disclaimer-banner"]`).
  2. All answers must derive deterministically from approved local knowledge cards with source links and updated dates; zero live LLM dependencies, zero outbound network calls, zero API keys (real LLM integration is strictly gated under expansion packet X02).
  3. Canned responses must never be deceptively labeled as live generative AI.
  4. The query processor must honestly decline unknown questions rather than hallucinating or guessing.
  5. The query processor must enforce strict topic boundaries, declining private life questions, artist personal opinions, and medical or financial advice with clear limitation notices (`[data-testid="guide-limitation-notice"]`).
  6. The guide must defend against adversarial prompt injection, jailbreaking, and state mutation attempts, safely blocking them without mutating application state.
  7. The guide is strictly read-only: it cannot mutate memberships, claim benefits, place orders, or modify data.
- **Decision**:
  1. Create `src/data/guideKnowledge.ts` providing 8 approved knowledge cards with canonical schema (`id`, `topic`, `title`, `description`, `keywords`, `actionLink`, `sourceTitle`, `updatedAt`).
  2. Implement `queryWorldGuide(query)` as a deterministic, pure matching function with tiered evaluation:
     - Injection Detection: Neutralizes `ignore previous instructions`, `grant me vip`, script tags, eval, and mutation keywords.
     - Out-of-Scope Limitation: Detects private life inquiries, financial speculation, medical diagnoses, and personal opinion questions.
     - Keyword Scoring: Matches query tokens against approved card keywords and titles.
     - Honest Unknown Fallback: Returns explicit `unknown` status with recommended topics if no cards match.
  3. Create `WorldGuidePanel` (`src/components/WorldGuidePanel.tsx`) with launcher buttons in desktop sidebar and mobile navigation (`[data-testid="open-world-guide-btn"]`).
  4. Validate strictly in `src/tests/guide.test.tsx` (13/13 passing tests) that `fetch` is never called, state remains unmutated, and all disclaimer and decline notices render appropriately.
- **Consequences**: Deterministic, zero-network, secure, and transparent app assistance completely isolated from artist persona and generative hallucination risks.

---

## DEC-012: Unified Session Contracts for Format Variants, User-Initiated Audio, and Cross-View Expiration Consistency
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: Packet P13, CONSTITUTION §2.3, §4, and CONTRACTS §7.2 mandate that session format variants (Listening Room `listening` and Live House `concert`) must NOT be architected as duplicate applications or detached routes. Rather, they must reuse the unified `Session` domain contract and venue stage (`/sessions/:sessionId`). Furthermore:
  1. Audio playback must NEVER autoplay on page load; playback must be user-initiated (`no autoplay audio`).
  2. Listening Room must accurately reflect team-hosted roles (`hostRole: 'team'`) and pre-recorded segments (`segmentMode: 'recorded'`), presenting cleared local liner track notes without pretending to be live artist appearances.
  3. Live House must feature expanded stage dimensions, setlist tracking with live song indicators, and call sample cues that explicitly disclaim real-time multi-user WebRTC audio jam sync.
  4. Missing media must gracefully fall back to silent demo mode without breaking audience participation.
  5. Expired replay rights must be enforced consistently across all application surfaces: `SessionView`, World Archive (`WorldDetailView`), and My World Capsules (`MomentCapsuleCard`).
- **Decision**:
  1. Preserve `/sessions/:sessionId` as the single venue route; enrich `Session` with optional `trackNotes`, `setlist`, `callSampleCues`, and `mediaStatus`.
  2. Initialize `isPlayingAudio` to `false` in `SessionView`, requiring explicit user action to play.
  3. Build `TrackNotesPanel` for Listening Room with track selector and cleared local media disclaimer.
  4. Build `SetlistPanel` and `CallSampleCueBar` for Live House with clear notices that interaction cues are simulated locally.
  5. In `SilentMediaPlaceholder`, handle `mediaStatus: 'missing'` by rendering an informative warning while keeping the silent spectrum usable, and `mediaStatus: 'expired'` by disabling the play button.
  6. Display consistent expired rights badges and banners across `SessionView`, World Archive tab (`archive-replay-expired-${s.id}`), and My World Capsules (`replay-expired-notice-${capsule.id}`), ensuring historical memories and private notes remain preserved.
- **Consequences**: Guaranteed architectural reuse, prevention of unsolicited autoplay audio, truthful operational disclosures, and consistent rights governance across all views.

---

## DEC-011: Operator Session Orchestration, Rights Clearance Guardrails, and Cancellation Immutability
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: Packet P12, CONSTITUTION §2.3, and CONTRACTS §7.2 dictate that live session broadcasting requires strict operational controls, synthetic pre-broadcast rights clearance, truthful stage moderation, and permanent lifecycle cancellation without ghost re-activations. Specifically:
  1. Controls must be relocated from transient scenario drawers to dedicated Studio Operator Console (`/studio/operator` and `/studio/operator/:sessionId`).
  2. Pre-broadcast checklist (music clearance, artist consent, safety review) must gate session starting (`RIGHTS_NOT_APPROVED`).
  3. Session starting must also respect avatar validity/retirement invariants prior to rights approval.
  4. Real-time operator interventions (artist presence disconnect/reconnect, live/recorded segment mode, question selection/curation, fan chat pausing) must immediately propagate to fan stage views.
  5. Session cancellation must be permanently immutable: once cancelled, neither fans nor operators can resume or join (`SESSION_CANCELLED`), surviving browser reloads.
  6. The prototype environment operates with client-side state; role switching must be transparently disclosed as a local operational UI test preview rather than pretending to provide backend-enforced RBAC.
- **Decision**:
  1. Relocate all operator controls to `OperatorConsoleView` accessible via Studio navigation (`/studio/operator`).
  2. Implement `rightsApproved` and `rightsChecklist` in `Session` model. The `START_SESSION` reducer transition blocks if avatar is invalid or if `rightsApproved !== true` with `RIGHTS_NOT_APPROVED`.
  3. Implement `OPEN_LOBBY`, `PAUSE_SESSION`, `RESUME_SESSION`, `CANCEL_SESSION`, `UPDATE_SEGMENT_MODE`, `TOGGLE_CHAT_PAUSED`, `APPROVE_SESSION_RIGHTS`, `DISCONNECT_ARTIST`, `RECONNECT_ARTIST`, `SELECT_QUESTION`, `CLOSE_QUESTION`, `PUBLISH_REPLAY`, and `WITHDRAW_REPLAY` in domain reducer.
  4. Pass `isChatPaused` and active selected question banner dynamically to `FanChatPanel` and `SessionView`, disabling input and displaying clear moderation notices.
  5. Enforce immutable cancellation in `JOIN_SESSION` and `START_SESSION`, persisted to localStorage.
  6. Prominently display a local-only role preview banner in the Operator Console explicitly clarifying that role switching is a client-side test preview and not secure backend authentication.
- **Consequences**: Full compliance with CONSTITUTION §2.3, testable and robust broadcast orchestration, strict stage safety and rights governance, clear and truthful UI disclosures.

---

## DEC-010: Artist Avatar Asset Governance, Context Gating, and Retirement Immutability
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: Packet P11 and CONSTITUTION §2.3 dictate that artist avatar representations must strictly protect artist dignity and maintain platform integrity. Digital fan-artist spaces frequently suffer from uncontrolled draft asset leakage, deepfake/face cloning risks, deceptive auto-rig claims, and historical revisionism when assets are retired. Specifically:
  1. Draft avatars must never leak into live fan sessions.
  2. Photo uploads, webcam feeds, and face cloning tools are strictly banned.
  3. The exclusive model slot must be an explanatory reserved partner slot, not a fake auto-rig tool.
  4. Asset usage contexts must be strictly enforced (`dropin`, `listening`, `concert`).
  5. Retired assets must be permanently blocked from starting new sessions without rewriting historical session logs.
  6. Operator approval in the prototype must be explicitly disclosed as simulated.
- **Decision**:
  1. **Draft Isolation**: `SessionView` quarantines draft or retired avatars, rendering only approved avatar assets. Reducer `START_SESSION` and `ASSIGN_AVATAR_TO_SESSION` reject draft avatars with `AVATAR_NOT_APPROVED`.
  2. **Decoupled Draft Saving**: `SAVE_AVATAR_DRAFT` persists working assets to `state.avatarAssets` without mutating the active world avatar (`world.avatarAssetId`), which only updates upon explicit `APPROVE_AVATAR_ASSET` or `REVERT_AVATAR_VERSION`.
  3. **Context Gating**: `ASSIGN_AVATAR_TO_SESSION` enforces `avatar.allowedContexts.includes(session.format)`. If format is not allowed, it sets error `AVATAR_CONTEXT_DISALLOWED`.
  4. **Retirement Immutability**: `RETIRE_AVATAR_ASSET` sets `status: 'retired'`. `START_SESSION` and `ASSIGN_AVATAR_TO_SESSION` reject retired avatars with `AVATAR_RETIRED`, while past session records in `state.sessions` retain their historical avatar asset IDs.
  5. **Truthful UI Disclosures**: Zero `<input type="file">`, webcam/mic, or deepfake/face cloning tools exist. The reserved 3D model slot is explicitly rendered as an inactive reserved slot for authorized partner 3D rigs (GLB/USDZ). The approval button and notes prominently state "Mô phỏng phê duyệt (Simulated Approval)".
- **Consequences**: Strict compliance with CONSTITUTION §2.3 and CONTRACTS §7.2; immutable audit history; guaranteed draft quarantine; robust operator tooling.

---

## DEC-009: In-App Truthful Notification Architecture and Category Opt-Out Invariants
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: Packet P10 and CONSTITUTION §2.3 dictate that notification delivery must be 100% in-app, completely avoiding browser push permission prompts, emails, or SMS spam. Furthermore, in fan-artist digital spaces, platforms frequently simulate deceptive 1-on-1 private artist chats or direct messages. VieWorld constitutionally prohibits fabricating personal artist messages. Additionally, fans must be able to opt out of categories (especially promotional) without disabling essential event reminders (RSVP, stage opening). Finally, notifications must be idempotent and survive page reloads without duplicates.
- **Decision**:
  1. All notifications are stored in `AppState.notifications` with deterministic IDs keyed by trigger and subject (e.g. `notif-rsvp-${sessionId}`, `notif-capsule-${sessionId}`, `notif-order-${orderId}-${status}`).
  2. Each notification includes explicit `sourceAttribution` (`'platform'`, `'organizer'`, `'session_system'`) and `category`. UI overtly disclaims that artists never send simulated private 1-on-1 direct messages.
  3. Independent category toggles (`sessionReminders`, `capsuleReady`, `supportUpdates`, `orderUpdates`, `promotional`) are persisted in `AppState.notificationPreferences`. Transitions check these flags and suppress notifications when opted out.
  4. Toggling an RSVP off immediately retracts the pending event reminder.
  5. No Web Push API, Service Workers, email collection, or SMS mechanisms are introduced.
- **Consequences**: Guaranteed fan privacy, zero deceptive communications, fully predictable and testable state machine, seamless persistence across browser refresh.

---

## DEC-008: Explicit Decoupling of Customer Support Resolution and Source Record Reconciliation
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: In customer support workflows, resolving a ticket might erroneously be coupled with automatically mutating underlying source records (e.g. automatically granting a benefit or modifying order ledger states). However, in VieWorld (CONSTITUTION §2.3, CONTRACTS §7.2, and PACKET P09), automatic granting of benefits upon support case resolution is strictly forbidden. Resolving a support case (`RESOLVE_SUPPORT_CASE`) records operator findings, reference numbers, and stated outcomes, but MUST NOT mutate underlying source objects (such as setting a pending benefit to eligible or altering order fulfilment). Source record recovery requires an explicit, separate reconciliation action (`RECONCILE_BENEFIT` or `RECONCILE_ORDER`) executed by an authorized operator after review.
- **Decision**:
  1. `RESOLVE_SUPPORT_CASE` updates `SupportCase.status` to `'resolved'`, writes `resolution: { resolvedAt, summary, outcome, operatorId }`, and sets `nextAction`, while leaving the subject benefit/order state completely untouched.
  2. A dedicated `RECONCILE_BENEFIT` action updates `Benefit.status` from `'pending'` to `'eligible'`, updates `reasonCode` to `'RECONCILED_ORGANIZER_APPROVED'`, and appends an audit event.
  3. The Support Case Detail UI clearly presents the current status of the subject record and surfaces the separate reconciliation trigger only when appropriate.
  4. Both the case detail view and My World immediately reflect the updated state upon reconciliation, unlocking dependent actions (such as member-exclusive merchandise purchase in VieSHOP).
- **Consequences**: Strict compliance with CONSTITUTION §2.3 ("Non-auto-grant decoupling"); zero hidden state mutations; clear audit trail for both customer service inquiries and operational source corrections.

---

## DEC-007: Decoupled Fulfilment and Physical Ownership Gating in Simulated Commerce
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: In standard e-commerce flows, payment confirmation often immediately triggers receipt of goods or treats an order as complete. However, VieWorld Constitutional Invariant §2.3 and CONTRACTS §7.2 mandate that simulated checkout (`pending` -> `paid`) records no charges and does NOT grant physical ownership. Furthermore, merchandise items must remain separate from general order receipts until an explicit fulfilment step occurs (`fulfilled`).
- **Decision**: Strictly enforce a 3-step state machine (`pending` -> `paid` -> `fulfilled`). In `src/views/MyWorldView.tsx`, physical items appear in the "Bộ sưu tập vật phẩm đã sở hữu" collection ONLY when `order.status === 'fulfilled'`. Orders in `pending` and `paid` states remain exclusively in the "Lịch sử đơn hàng VieSHOP" section with transparent timeline badges and direct links to `/orders/:orderId`.
- **Consequences**: Fans never mistake payment simulation for finished delivery, preventing false expectations regarding physical ownership while honoring zero-charge demo disclaimers.

---

## DEC-006: Reconciling Benefit Status Progression and Canonical Schema Stability
- **Date**: 2026-09-09
- **Status**: Accepted
- **Context**: Packet P07 description mentioned status progression `(claimed, ready_to_use, expired)`. However, canonical contracts (`docs/CONTRACTS.md` §2 and `src/domain/types.ts`) explicitly define `Benefit.status` as `'pending' | 'eligible' | 'claimed' | 'expired' | 'revoked'`, and §3.3 action guards specify that claiming an eligible benefit transitions status directly to `'claimed'`. Silently mutating the schema union to add `ready_to_use` would break schema consistency, persistence deserialization, and contract invariants.
- **Decision**: Preserve the canonical `Benefit.status` union (`'pending' | 'eligible' | 'claimed' | 'expired' | 'revoked'`) without schema modification. Reconcile `ready_to_use` as an operational and display state representation of the terminal `'claimed'` status. When a benefit is `'claimed'`, the UI presents it as "Đã kích hoạt · Sẵn sàng sử dụng" with direct operational resource links (e.g., viewing replay archives) and descriptive `nextAction` updates.
- **Consequences**: Zero schema divergence, full backward compatibility across tenant storage, and clear adherence to constitutional domain invariants.

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
