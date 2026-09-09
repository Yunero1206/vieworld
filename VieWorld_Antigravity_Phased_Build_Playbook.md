# VieWorld — Antigravity phased build playbook

Version 1.0 · 8 September 2026 · Owner: Phạm Thanh Phú

Companion: `VieWorld_Living_Fan_World_Case_Study.docx`.
Purpose: build a stateful, testable product prototype, not a portfolio page and not a production fandom platform.

## 0. Cách dùng nhanh cho Phú

1. Đưa file này vào một project app riêng. Không cho agent sửa source website portfolio.
2. Paste prompt Bootstrap ở §10. Agent đọc brief, kiểm tra workspace và tạo các file checkpoint trước.
3. Mặc định làm một work packet mỗi lượt. Muốn chạy tiếp tự động trong phạm vi prototype thì dùng prompt Auto-continue ở §10; nó vẫn phải lưu checkpoint sau mỗi packet.
4. Khi đổi chat/model hoặc hết context, chỉ paste prompt Resume. Không cần paste lại toàn bộ lịch sử chat.
5. Đến packet P17, dừng ở bản demo đã QA. Các packet X01–X03 là extension bị khóa; không tự bật API trả phí, streaming thật, camera/mic, auth thật hay deploy.
6. Review đặc biệt: badge DEMO luôn có; avatar không giả là artist thật; không có payment thật; mọi nút core có hành vi thật trong demo; state còn sau refresh.

Code và hướng dẫn chi tiết dùng tiếng Anh để giảm ambiguity khi handoff. UI mặc định tiếng Việt; proper product names giữ nguyên. UI copy phải tự nhiên, không trộn hai ngôn ngữ trong một câu. Có thể thêm English locale sau core QA, không nằm trong mặc định.

## 1. Model, context and execution limits

Google's official Gemini 3.8 Flash API page lists 1,048,576 input tokens and 65,536 output tokens as of the research cut. Those API limits do not establish the effective context, tool budget, quota or compaction behavior inside a particular Antigravity workspace. Confirm the selected model in the actual application. [Google model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)

This playbook deliberately does not fill the nominal context window. A work packet has one outcome, a small file surface and its own acceptance tests. Recommended working budget: read a concise constitution, current state and one packet; inspect only relevant source. Aim for roughly 8–16k tokens of task context where practical, not a hard model limit. Start a new conversation at a natural packet boundary when logs or repeated repair attempts become noisy.

No prompt can guarantee automatic continuation after the host stops an agent. Durable project files provide continuity; the Resume prompt restarts work. Do not claim that progress is remembered unless the checkpoint actually exists on disk.

## 2. Product constitution — immutable unless Phú changes it

### 2.1 What the app is

VieWorld is a portable fan relationship product concept. An Artist World or entertainment IP World hosts meaningful shared moments. My World keeps the fan's follows, avatar, attendance, memories, membership, benefits, orders and support history. VieSHOP is the connected commerce concept. MFan and FanMe appear only as clearly labeled configuration demonstrations.

The signature loop is:

Discover → enter World → follow/RSVP → participate → save Moment Capsule → view My World → own/recover → return to the next moment.

Success means the loop works and users understand it. It does not mean maximizing animation, artificial intimacy or feature count.

### 2.2 Product status and honesty

- Independent concept; not an announced or endorsed DatVietVAC product.
- Use fictional `Artist A` and fictional show `Neon Sessions`; label fictional content clearly.
- Persistent banner: `Bản thử nghiệm · Dữ liệu và tương tác mô phỏng`.
- Every simulated live badge has adjacent `DEMO`; no fake artist identity verification.
- Demo group messages, counts, media and responses are marked as sample content.
- No fabricated testimonials, research results, real attendance, verified rights or public deployment URL.
- Official avatar in this brief means the approved asset within the fictional demo, not an endorsement by a real artist.
- A recorded clip cannot silently become live media. A disconnected artist cannot be replaced by AI pretending to be them.
- A local operator switch is a demonstration of role behavior, not authentication.

### 2.3 Non-negotiable distinctions

| Distinction | Required product behavior |
|---|---|
| Follow vs membership | Follow is free relationship state; membership is separate. |
| Membership vs benefit | Active membership does not automatically guarantee every benefit. |
| Eligibility vs inventory | Explain both; a benefit can be eligible while an item is unavailable. |
| Payment vs fulfilment | Simulated payment creates paid state; fulfilment is a separate action. |
| Attendance vs replay | Replay viewers do not receive a live-attendance record. |
| Avatar vs artist presence | Animation alone never sets presence. |
| Session vs segment | Live host may introduce recorded media; label each segment correctly. |
| Portability vs shared accounts | Config switching never merges account/order data. |
| App Guide vs artist | Guide has a separate identity; never speaks as the artist. |
| Local simulation vs real platform | All production capabilities remain explicitly unimplemented. |

### 2.4 Scope and exclusions

Baseline: one artist, one IP world, one approved avatar plus draft, two reusable session formats and a mini-concert presentation, one fan profile, one membership, two benefits, two products, one order flow and one recovery flow. Additional configuration packs are secondary.

Do not implement production auth, billing, payments, real streaming-provider login, open voice, direct artist DMs, a 3D engine, blockchain, gacha, spending leaderboards, an AI artist clone, face tracking or a cross-company identity service. Do not request camera/microphone permissions in the baseline. Do not modify, publish or link into the existing portfolio site.

No auto-install of large toolchains, unexplained stack migration, destructive reset, force push, credential extraction or third-party upload. Existing files belong to the user. Ask if a meaningful scope or permission expansion is required.

## 3. Experience and visual system

### 3.1 Art direction

Premium, warm, playful 2D entertainment venue framed by a readable product UI. Product clarity first; the world artwork supplies personality. Avoid an enterprise analytics dashboard, endless neon gradients, anonymous template cards, mandatory avatar walking or a miniature metaverse.

| Token | Value / use |
|---|---|
| `--bg` | `#F7F5F0` warm ivory utility background |
| `--surface` | `#FFFFFF` cards and forms |
| `--ink` | `#20212B` primary text |
| `--muted` | `#5E6373` supporting copy; verify contrast |
| `--stage` | `#151426` midnight room background |
| `--primary` | `#6551C8` primary action |
| `--accent` | `#A9E5D4` decorative mint; use dark text |
| `--danger` | `#A52838` destructive/error state |
| `--border` | `#D8D9E1` neutral borders |
| Typography | Inter or Noto Sans with Vietnamese glyphs; system sans fallback |
| Type scale | 12, 14, 16, 20, 28, 40 px; normal UI body 16 px |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64 px |
| Radius | 12 px input/button, 20 px card, 28 px venue panel |
| Content width | 1280 px maximum, 24 px desktop / 16 px mobile gutters |
| Motion | 120–200 ms UI transitions; no automatic motion in reduced mode |

Use a coherent original fictional avatar throughout. Baseline illustration can be a small bundled original SVG assembled from approved parts. Do not make image generation, stock downloads or real artist photography a build dependency. An exclusive imported illustration can replace it through an asset manifest later. Keep all important text in HTML.

### 3.2 Layout

Desktop: left navigation approximately 224 px, flexible main content, optional contextual side panel around 300 px on wide session screens. On smaller screens the side panel becomes tabs or a sheet. No content must require a wide desktop to function.

Mobile: four bottom destinations—Khám phá, Worlds, My World, Hộp thư. Session view puts presence above the stage, controls below it, then Câu hỏi / Trò chuyện / Danh sách bài tabs. Shop is contextual to a world, not a fifth mobile destination. Operator preview has a separate header and obvious return-to-fan control.

Artist World sections: Home, Sessions, Archive, Shop. A list-view option reaches the same destinations without scenery. My World is a private personal space with tabs or sections: Tổng quan, Kỷ niệm, Quyền lợi, Đơn hàng. Orders and support are calm utility screens, not game rooms.

### 3.3 Core component inventory

`DemoBanner`, `AppShell`, `WorldCard`, `WorldHeader`, `NextMomentCard`, `PresencePanel`, `AvatarStage`, `SessionControls`, `QuestionQueue`, `PollCard`, `ModeratedChat`, `CapsuleCard`, `MembershipCard`, `BenefitCard`, `OrderTimeline`, `RecoveryCard`, `EmptyState`, `ErrorState`, `ConfirmDialog`, `Toast`, `GuidePanel`.

One component per stable responsibility, not one giant page containing every behavior. Use semantic HTML. All actions must be buttons/links, not click-only divs. Keyboard focus, escape/return focus for dialogs, mute/pause, reduced motion and clear status text are required. Target WCAG 2.2 AA; automated checks alone do not certify compliance. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### 3.4 Assets and reserved outputs

Create `docs/ASSET_MANIFEST.md` listing asset ID, local path, author/source, license/permission, fictional or real status, allowed use, alt text and approval state. Unknown rights means do not use. Media absence should show a deliberate placeholder, not a broken player.

Case slots: V00 cover; V01 world model; V02 Avatar Studio; V03 Artist Session; V04 Listening/Live House; V05 My World/recovery; V06 journey screenshots; V07 technical boundary; V08 test setup. App slots APP01 main URL, APP02 walkthrough, APP03 operator preview. Do not invent those URLs. Store screenshots only after relevant features exist and label them by packet/build version.

## 4. Stack and boundaries

For an empty project, default to React + TypeScript + Vite with CSS variables, React Router and a compact central reducer/store. Use Vitest/Testing Library for unit/component tests and Playwright for end-to-end tests if supported. These are stack choices, not version-specific API instructions: verify current official docs, pin compatible versions and keep one lockfile at setup. If the repository already has a suitable stack, reuse it and record the decision rather than migrating automatically.

Baseline persistence is versioned localStorage, namespaced by tenant and demo profile. Use a storage adapter so a future backend can replace it. Catch invalid JSON, storage denial and quota errors; fall back to an in-memory session with a visible non-persistence notice. Never place credentials or real personal data in localStorage.

Put behavior in domain functions, not scattered component effects. Use injected/demo time for session tests. Media playback is a local cleared file, a neutral authored audio loop or a silent visual demonstration. Never scrape, rip, proxy or restream music. Spotify or another provider requires a separate product/rights/terms review; a visible login button is not an integration. [Spotify Developer Policy](https://developer.spotify.com/policy)

Avoid backend services until the complete local loop passes. A later real pilot requires server-side authorization, authenticated operator presence, a managed media design, server-side rate limiting and authoritative benefit/order state. Client-only role gates are not security.

## 5. Canonical data and state contract

### 5.1 Demo identifiers

Stable IDs, not display text, are keys. Initial tenant `vieworld-demo`; secondary `mfan-demo` and `fanme-demo`. Artist world `artist-a`; IP world `neon-sessions`; fan `fan-linh`; approved avatar `avatar-a-v1`; draft `avatar-a-v2`; session `session-dropin-01`; listening session `session-listen-01`; concert format `session-house-01`; membership `member-a-01`; benefits `benefit-replay-01` and `benefit-early-access-01`; products `product-pin-01` and `product-shirt-01`.

Default fixtures are fully synthetic. The drop-in is an interactive simulation. The listening session demonstrates recorded media with a team host. No seeded notification states that a real artist sent a personal message.

### 5.2 Minimum schemas

```ts
type TenantId = 'vieworld-demo' | 'mfan-demo' | 'fanme-demo';
type BaseRecord = { id: string; tenantId: TenantId; version: number; updatedAt: string };
type World = BaseRecord & {
  type: 'artist' | 'ip'; name: string; linkedWorldIds: string[];
  avatarAssetId?: string; description: string;
};
type AvatarAsset = BaseRecord & {
  ownerWorldId: string; status: 'draft' | 'approved' | 'retired';
  parts: Record<string, string>; approvalRef?: string;
  allowedContexts: ('dropin' | 'listening' | 'concert')[];
  replayAllowed: boolean;
};
type Session = BaseRecord & {
  worldId: string; avatarAssetId?: string;
  format: 'dropin' | 'listening' | 'concert';
  status: 'scheduled' | 'open' | 'running' | 'paused' | 'ended' | 'cancelled';
  hostRole: 'artist' | 'team';
  artistPresence: 'absent' | 'present' | 'reconnecting' | 'disconnected';
  segmentMode: 'live' | 'recorded';
  aiUse: 'none' | 'captions' | 'translation';
  replayStatus: 'not_planned' | 'pending_review' | 'available' | 'expired' | 'withdrawn';
  demo: true;
};
type Membership = BaseRecord & {
  fanId: string; worldId: string; status: 'inactive' | 'active' | 'expired'; expiresAt?: string;
};
type Benefit = BaseRecord & {
  fanId: string; worldId: string;
  status: 'pending' | 'eligible' | 'claimed' | 'expired' | 'revoked';
  reasonCode: string; sourceRef: string; nextAction: string;
};
type Participation = BaseRecord & {
  fanId: string; sessionId: string;
  kind: 'live_attendance' | 'replay_view'; joinedAt: string;
};
type Order = BaseRecord & {
  fanId: string; worldId: string; productId: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
  sourceRef: string; requestId: string;
};
type SupportCase = BaseRecord & {
  fanId: string; subjectType: 'benefit' | 'order'; subjectId: string;
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
  nextAction: string; resolution?: string;
};
```

Also define `FanProfile`, `Product`, `Question`, `Poll`, `Capsule`, `Notification`, `ConsentRecord`, `DemoEvent`, `TenantConfig`. Capsule references participation/session, not a second contradictory copy of replay status. `Product` distinguishes stock from benefit eligibility. `ConsentRecord` is synthetic and labeled. Questions use submitted/under_review/selected/answered/closed. Never infer seen/read from submission. Store timestamps in ISO UTC and display in Asia/Ho_Chi_Minh. Demo clock is explicit and resettable.

### 5.3 Action guards and idempotency

| Action | Guard | Observable result |
|---|---|---|
| Follow | Valid world and tenant | State toggles; no membership created. |
| RSVP | Scheduled/open, not cancelled | One RSVP per fan/session; reversible. |
| Enter lobby / attend | Open/running and applicable entitlement | Open admits to lobby only. Create live_attendance only while running and fan is present; one record per fan/session/kind. |
| Watch replay | Ended, approved and available replay, applicable entitlement | Create replay_view only; never live_attendance. Withdrawal/expiry disables playback. |
| Submit question | Session running, user not muted, length/rate valid | Submitted state; no automatic artist read receipt. |
| Select question | Operator demo role, valid session | Fan sees selected, not answered. |
| Start artist session | Approved/context-allowed avatar, synthetic consent complete | Simulated presence shown with DEMO; no real consent claim. |
| Disconnect artist | Artist-controlled segment | Reconnecting/disconnected; no AI substitution. |
| End session | Running/paused | Stop presence; capsule eligibility, replay pending review. |
| Publish replay | Operator approval and demo rights valid | Available; revoked/expired later disables playback. |
| Pay simulation | Valid product and order | Paid once per requestId, no card fields or network payment. |
| Fulfil simulation | Paid order | Fulfilled; matching purchased-item record appears once. |
| Claim benefit | Eligible and action allowed | Claimed once; pending never bypassed. |
| Open support | Existing blocked benefit/order | Reuse open case for same subject; no duplicates on retry. |
| Resolve support | Operator role and resolution text | Fan sees outcome; no automatic entitlement grant unless separately reconciled. |
| Switch tenant | Persist old state, load new namespace | No follows, claims, orders or questions leak. |

Invalid actions return domain errors shown with actionable copy. Refresh must not repeat order creation or participation. In a real pilot these rules must be enforced server-side; prototype checks only demonstrate intended behavior.

### 5.4 Required scenarios and reset

Create a demo drawer with named fixtures: New fan; Active member; Benefit pending; Order paid; Session disconnected; Replay expired. Applying a fixture shows a confirmation because it replaces current demo state in the selected tenant. Full reset names the selected tenant and preserves unrelated browser data. Never call `localStorage.clear()`.

## 6. Routes and acceptance surface

| Route | Core purpose |
|---|---|
| `/` | Discover and current/next moments |
| `/worlds` | World list and followed destinations |
| `/worlds/:worldId` | Artist/IP World with contextual sessions/archive/shop |
| `/sessions/:sessionId` | Presence, stage, questions, poll and moderated chat |
| `/me` | Private My World and next actions |
| `/me/capsules/:capsuleId` | Memory, replay availability and return-to-world |
| `/worlds/:worldId/shop` | Relevant products and terms |
| `/orders/:orderId` | Simulated order and fulfilment state |
| `/benefits/:benefitId` | Eligibility reason and claim/recovery |
| `/support/:caseId` | Reference, state, resolution and next action |
| `/inbox` | Truthful demo reminders and support updates |
| `/studio` | Explicitly labeled operator demo preview |
| `/studio/avatar` | Draft, preview, approval and retirement |
| `/studio/sessions/:sessionId` | Session and moderation controls |
| `/about-demo` | Scope, credits, limitations and reset controls |

Missing IDs return a useful not-found state and world/home link. Direct links work after refresh in the chosen hosting environment; do not assume a deployment has history fallback. Context switching with an invalid ID redirects safely and explains why.

## 7. Continuity protocol — create these files first

The supplied playbook is the source brief. Bootstrap creates concise working documents in `docs/`; it does not require Phú to split this file manually.

| File | Role / size guidance |
|---|---|
| `docs/CONSTITUTION.md` | Immutable intent and exclusions; about 700–1,000 words maximum. |
| `docs/BUILD_STATE.md` | Current packet/subtask, actual state and next action; about 500–800 words maximum. |
| `docs/DECISIONS.md` | Append-only IDs and rationale; index latest decisions at top. |
| `docs/CONTRACTS.md` | Types, routes, invariants; update deliberately with migration note. |
| `docs/TEST_MATRIX.md` | Test IDs mapped to packet, status and evidence path. |
| `docs/ASSET_MANIFEST.md` | Rights/source/alt-text record; unknown assets blocked. |
| `docs/KNOWN_ISSUES.md` | Reproduction, severity, owner/packet, current status. |
| `docs/packets/Pxx.md` | One independently readable packet each, including dependency and definition of done. |
| `docs/handoffs/Pxx.md` | Historical packet completion and next exact action. |

### 7.1 BUILD_STATE template

```markdown
# Build state
Brief version: 1.0
Active packet: P00
Status: not_started | in_progress | blocked | passed
Active subtask: ...
Last completed packet: none
Branch / commit if available: ...
Working tree changes to preserve: ...
App schema version: 1
Actual stack / package manager / run command: ...

## Completed and verified
- Only verified facts; reference test IDs/evidence paths.

## Current partial implementation
- Files/functions changed; exactly what still fails.

## Last checks
- Command, exit status, result, timestamp. Mark NOT RUN honestly.

## Next exact action
- One executable instruction and relevant files.

## Blocking decisions / permissions
- None, or the specific issue requiring Phú.

## Resume reading list
- Constitution, this state, active packet, relevant contract section,
  latest decisions, at most the source/tests needed next.
```

### 7.2 Per-packet operating loop

1. Read constitution, state, active packet and relevant contracts. Inspect `git status` if a repo exists.
2. State the packet goal and up to four small subtasks. Do not reopen settled scope.
3. Inspect existing code before editing. Reuse components; no unrelated refactor.
4. Implement one subtask, then run focused tests. Save partial state before a risky or long step.
5. Run the packet acceptance checks plus affected regression tests.
6. Update state, test matrix, decisions and handoff from actual results. Note blocked checks explicitly.
7. A clean local commit is optional if permitted; never auto-push, deploy or include unrelated changes.
8. If continuing is authorized, select the next unblocked baseline packet. Otherwise stop with a short handoff.

Recommended packet budget: one user-facing outcome, around 3–6 meaningful implementation/test files, excluding generated lockfiles and small checkpoint updates. If larger, split into Pxx-a/Pxx-b with the same parent acceptance criteria. This is a scope heuristic, not a token guarantee. Do not sacrifice tests to stay below a file count.

After two unsuccessful repair attempts with the same symptom, checkpoint the evidence, reduce the reproducer and diagnose before changing more code. Do not delete passing tests or weaken assertions to mark a packet passed.

### 7.3 Recovery after context loss

The repository and tests are the truth. If BUILD_STATE says passed but tests fail, change status to in_progress and preserve the discrepancy. If code exists without a checkpoint, inspect and test it; do not blindly rebuild. If a command was interrupted, verify its result before repeating a mutation. Read the last handoff and current diff; never assume the preceding chat completed a save.

## 8. Phase map and dependencies

The baseline ends at P17. P00–P06 are the smallest complete moment loop; P07–P10 add trustworthy ownership and recovery; P11–P13 make artist controls credible; P14–P17 add guide, portability and test readiness. Never start a later dependent packet while its prerequisite is failing.

| Phase | Packets | Exit condition |
|---|---|---|
| Foundation | P00–P02 | Project, state model, shell and fixtures work. |
| Signature experience | P03–P06 | Follow → session → capsule → My World works. |
| Relationship utility | P07–P10 | Benefits, orders, recovery and inbox agree. |
| Artist control | P11–P13 | Avatar approval and operator state affect fan UI. |
| Completion | P14–P17 | Guide, isolation, QA and evidence package pass. |
| Optional, blocked | X01–X03 | Requires separate explicit approval per extension. |

## 9. Work packets — implementation instructions

### P00 — Bootstrap and preserve the workspace

Dependencies: none. Read §§0–8 once and create the condensed project documents.

Inspect repository, existing stack, scripts and working tree. Do not modify portfolio code. If the selected workspace is a portfolio repository, ask for a separate app location before implementation. For an empty app folder, scaffold the selected stack and pin dependencies after checking official docs. Record the actual commands; no guessed command list.

Create the continuity files and extract all §9 packet bodies verbatim into `docs/packets/`, preserving IDs, dependencies and acceptance criteria. Create `docs/TEST_MATRIX.md` with packet IDs and not-run status. The app opens a minimal shell with DEMO banner and About Demo.

Acceptance T00: install/build/typecheck succeed; no secrets; instructions preserve the existing tree; state names P01 as next. Do not mark browser QA passed without opening the app.

### P01 — Domain types, fixture data and reducer

Dependencies: P00. Scope: `src/domain/`, `src/data/`, focused tests.

Implement canonical types, stable fixtures and pure actions from §5. Keep display copy separate from IDs. Start with follow, RSVP, participation, session transition, benefit and order guards; define remaining actions without fake successful side effects. Configure injected demo time. Add every contradictory/invalid transition as a unit-test case.

Acceptance T01: follow never creates membership; lobby entry and replay never create live attendance; a fan present when the session starts receives attendance once; duplicate action IDs are idempotent; cancelled session cannot be joined. Fixtures contain one artist, one IP, two benefits/products and all required scenario states.

### P02 — Persistence, reset and reusable shell

Dependencies: P01. Scope: storage adapter, provider, layout and basic UI primitives.

Add schema-versioned tenant/profile storage, hydration, migration/reset policy and in-memory fallback. Build shell, primary navigation, dialogs and status components. Add confirmed named-fixture selection and selected-tenant reset. Use generic route stubs only where a future screen is explicitly marked coming in demo; do not fake completion.

Acceptance T02: refresh preserves follows; invalid saved JSON recovers visibly; storage denial does not crash; reset deletes only the selected app namespace; keyboard navigation and 390 px layout work.

### P03 — Discover and World destinations

Dependencies: P02. Scope: Discover, world list/detail and shared World components.

Build the first polished product slice: editorial home, upcoming moment, Artist A World and Neon Sessions IP World. Show linked artists without auto-following them. Implement follow/RSVP, world tabs and contextual Shop/Archive entry. Show useful offline/empty states. Add list-view alternative.

Acceptance T03: Discover → IP → artist works; follow and RSVP persist; changing scenery/list view preserves tasks; no navigation dead ends; Artist World has a clear next moment without implying live presence.

### P04 — Session stage and truthful presence

Dependencies: P03. Scope: Session page, PresencePanel, AvatarStage, controls.

Render one original approved fictional avatar with bounded idle/gesture animation. Create presence from session/segment state, not animation. Display DEMO next to live indicators. Add start/join/leave, mute, pause and reduced-motion controls. For baseline, use synthetic media or a silent deliberate placeholder. Model reconnecting, disconnected, recorded and ended states. Fan role cannot change host identity.

Acceptance T04: presence copy correctly distinguishes all §5 states; lobby admission is not attendance and replay has separate access checks; a disconnect removes active artist presence; pause/reduced-motion works; no mic/camera request; no fake tracking claim; invalid session ID has recovery navigation.

### P05 — Questions, poll and moderated fan chat

Dependencies: P04. Scope: participation components and domain actions.

Separate question queue from chat. Questions are submitted/under_review/selected/answered/closed. A demo selection control may temporarily live in the labeled scenario drawer until operator UI exists. Add one vote per fan/poll, slow mode, configurable message-length limit, cooldown feedback, mute and report. Seeded messages are visibly sample content. Render text safely, never raw user HTML.

Acceptance T05: duplicate submissions/retries do not create ghost entries; selected is not answered; chat mute disables send; report produces a local reference; poll totals reconcile with unique votes; script-like strings render harmlessly. No paid recognition, private artist DM or artificial read receipt.

### P06 — Capsule and My World: complete the first loop

Dependencies: P05. Scope: capsule domain/view and My World.

End the session through demo controls. Generate one capsule record per eligible live participation; lobby-only visitors are ineligible and replay viewers receive a replay-history entry, not live attendance. Save/unsave a capsule, add a local private note and return to artist world. My World contains follows, next moments and memories with a restrained avatar/shelf area. Add a small free wardrobe: choose among three original preset accessories, preview, save and persist the choice by fan/tenant. This is optional expression, with no purchase or effect on eligibility. Replay starts pending_review and becomes available only through demo approval.

Acceptance T06: follow → RSVP → join running session → question/poll → end → save capsule → My World passes after refresh. Ending twice creates no duplicate; lobby-only entry earns no live capsule. Wardrobe selection persists and can be changed without affecting attendance. Expired/withdrawn replay is disabled while permitted metadata/private note remains. This is the first full-loop milestone; capture a labeled screenshot set but do not claim user validation.

### P07 — Membership and benefits

Dependencies: P06. Scope: membership/benefit cards, detail, eligibility tests.

Display inactive/active/expired membership separately from benefit state. Implement one available replay benefit and one pending early-access verification. Show reason, source reference, last update and next action. Claim is deterministic and guarded. Add explicit copy that early access is not guaranteed inventory or artist interaction.

Acceptance T07: active member with pending benefit cannot claim; eligible claim is idempotent; expired membership has correct next action; no AI required to determine state. All controls work in mobile/list view.

### P08 — Contextual VieSHOP and simulated order

Dependencies: P07. Scope: product list/detail or sheet, order creation and timeline.

Build two fictional products, clear simulated prices/terms and no real payment form. Button says `Mô phỏng đặt hàng`; confirmation repeats no charge will occur. A requestId prevents duplicate orders. Separate pending, paid, fulfilled, cancelled and refunded. Do not add physical ownership to My World before fulfilment. Keep world/product/order references.

Acceptance T08: double click/retry produces one order; no card/password/address collection; invalid inventory/eligibility has an explanation; paid is not fulfilled; reset never alters other tenant orders. Do not implement checkout analytics as real GMV.

### P09 — Benefit/order recovery

Dependencies: P08. Scope: SupportCase creation/detail and reconciliation actions.

From a blocked benefit or order, open or reuse the existing active case. Show local demo reference, status, last update and next action. Operator simulation acknowledges/investigates/resolves with a stated outcome. Resolution and benefit reconciliation are separate actions. Do not display an invented business SLA; indicate demo update steps.

Acceptance T09: repeated support requests reuse an active case; pending benefit does not turn eligible merely because case status says resolved; a reconciled source update changes both detail and My World; missing subject shows recoverable error.

### P10 — Inbox and notification preferences

Dependencies: P09. Scope: Inbox, preferences and truthful notification events.

Add local in-app reminders for RSVP/session end/capsule ready/support update. Notification copy attributes artist/team/platform correctly. Separate event reminders and promotional preference. No browser push permission, email or SMS. Avoid repeated notifications on refresh and disable scheduled reminders for cancelled sessions.

Acceptance T10: state transitions produce one appropriate notification; read/unread persists; opted-out categories remain off; no fabricated personal artist message; linked notification opens the correct tenant/object.

### P11 — Artist Avatar Studio

Dependencies: P10. Scope: operator avatar editor and asset state.

Build preset selection, controlled customization, preview, usage-context selection and synthetic approval. The exclusive-model option is an explanatory reserved slot, not a fake auto-rig button. Save draft without replacing approved avatar. Publish creates an approved version; revert chooses a prior allowed version. Retirement prevents new use but does not rewrite past session history.

Acceptance T11: draft does not appear in fan session; approved context-allowed asset can be assigned; retired/disallowed asset cannot start a new session; manifest records every part; no real artist photo upload or face cloning. The interface labels approval as simulated.

### P12 — Operator session and moderation preview

Dependencies: P11. Scope: operator session page, question review and fan-state propagation.

Move temporary operator controls from the scenario drawer to Studio. Add synthetic consent/rights checklist, session open/start/pause/end/cancel, artist connect/disconnect, current segment mode, question selection/answer, chat pause and replay approval/withdrawal. Expose role preview with explicit local-only limitations.

Acceptance T12: unapproved avatar/rights fixture prevents start; operator selects a question and fan view changes; disconnect/stop changes presence immediately; cancelled event cannot be rejoined without an explicit reschedule flow (not required in baseline). A browser refresh cannot erase a cancellation. Do not describe role switching as secure auth.

### P13 — Listening Room and mini Live House variants

Dependencies: P12. Scope: format variants of the existing session, not duplicate apps.

Listening: cleared local media, track notes, user-initiated play/pause and poll, truthful recorded/team-hosted state. Live House: larger stage and setlist using the same question/reaction/capsule behavior. Call sample cues an interaction simulation, not multi-user audio sync. Handle missing media and expired rights. Allow event-specific outfit if approved.

Acceptance T13: both formats reuse session contracts; labels remain correct during recorded segments; no autoplay audio; no third-party login, media ripping or real-time jam claim; replay expiration is consistent in Archive and My World. If actual audio assets are absent, silent demo state remains fully usable.

### P14 — Bounded World Guide, deterministic first

Dependencies: P13. Scope: guide panel and approved local knowledge.

Create a distinctly named platform guide with visible `Hướng dẫn demo · Không phải nghệ sĩ`. It retrieves approved local help cards by topic and links to actual app objects. Return source title and updated date. Unsupported, private, medical/financial or artist-opinion questions route to a clear limitation; guide cannot mutate entitlements, place orders or send messages.

Acceptance T14: guide answers membership navigation with a valid link; unknown query does not invent an answer; prompt-injection text cannot alter app state; no API key or outbound request; canned behavior is not labeled live AI. Real LLM integration is X02 only.

### P15 — Portability configuration and isolation

Dependencies: P14. Scope: TenantConfig, configuration selector, scoped fixture sets.

Add clearly labeled MFan and FanMe demo configurations without scraping their sites or using official marks. Change labels, accent and content priorities through config, not forked page code. All product rules remain invariant. Switching tenant saves current state and loads isolated data; context-invalid routes resolve safely.

Acceptance T15: create an order/claim/question in VieWorld; switch both configs and verify none appears; switch back and it persists. Fan/artist official role cannot transfer across tenants. No claim that real accounts are connected. Document what needed configuration versus actual code change.

### P16 — Accessibility, resilience and security-oriented demo QA

Dependencies: P15. Scope: regression and targeted fixes only.

Test 390×844, 768×1024 and 1440×900; keyboard-only path; dialogs; focus return; contrast; 200% text zoom; reduced motion; muted audio; missing media; slow/failed local adapter; denied storage; corrupted state; invalid route; repeated action; revoked replay and operator disconnect. Use available automated tests plus manual evidence. Tests not available in the environment remain explicitly blocked.

Acceptance T16: no horizontal overflow on core routes; no critical console errors; no uncontrolled HTML rendering; no credentials or real personal data; all invariant tests pass. Fix defects without unrelated visual redesign. Document residual limitations honestly.

### P17 — Evidence package and honest handoff

Dependencies: P16. Scope: documentation, app walkthrough, final regression.

Run build/typecheck/unit/E2E commands from the actual package scripts. Record output status and environment. Capture core screenshot set V02–V06 with demo labels, one failure state and app version. Add a conventional page/list-view comparison path for future testing if not already present; no synthetic test results. Write `docs/DEMO_WALKTHROUGH.md`, `docs/RELEASE_NOTES.md` and `docs/UNIMPLEMENTED.md`.

Acceptance T17: guided loop can be completed from reset; all required object states have at least one test; documentation distinguishes simulated from real capabilities; fresh start instructions work. APP01 remains pending unless a separate deployment was authorized and verified. Do not touch the portfolio site. Stop baseline auto-continuation here and report ready for owner review, not production ready.

### X01 — Optional real multi-user pilot (LOCKED)

Requires explicit owner approval of users, hosting, privacy, identity, roles, moderation coverage, rights and costs. Split into independent packets: authenticated state backend; tenant/role authorization tests; managed room/media provider proof; server-side consent/presence; bounded pilot rehearsal. Use separate staging data, not a conversion of local demo records into verified history. Public launch is a separate decision.

### X02 — Optional live AI guide (LOCKED)

Requires provider/data-use approval and a spend cap. Split into: server-side provider adapter; approved-document retrieval; read-only allowlisted tools; refusal/source tests; rate limit/budget cutoff/fallback; adversarial evaluation. No client secret. No artist impersonation or voice clone. Do not enable merely because an API key happens to exist. [OWASP LLM application risks](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

### X03 — Optional artist-controlled capture (LOCKED)

Requires an authorized performer, approved model asset, capture permission and recording policy. Split into local capture experiment, approved avatar pipeline, managed media delivery, presence heartbeat, failure rehearsal and consented session. Camera/mic must be explicitly requested and stoppable. Do not promise privacy simply because an avatar hides the camera image. Full music jamming and large concerts remain separate engineering/rights projects. [MDN WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

## 10. Copy-ready prompts

### Bootstrap prompt

```text
Build the VieWorld prototype defined in VieWorld_Antigravity_Phased_Build_Playbook.md.
This is a separate product app, not my portfolio website. Read §§0–8 and all packet
headings before acting. Preserve existing files and inspect the workspace first.
Implement P00 only: choose/reuse a suitable stack, record actual commands and create
the constitution, contracts, build state, decisions, test matrix, asset manifest,
known issues, and individual packet files. Do not implement the whole app in one turn.
The source brief has priority over aesthetic improvisation. Persistent DEMO labels,
fictional artists, local-only data, truthful presence and no real payments are mandatory.
Use current official documentation for the chosen stack; pin compatible dependencies.
Finish with actual checks, a saved checkpoint and the exact P01 resume action.
Do not push, publish, spend, request credentials or enable external integrations.
```

### Build one packet

```text
Continue VieWorld using the repository as source of truth. Read docs/CONSTITUTION.md,
docs/BUILD_STATE.md, the active docs/packets/Pxx.md and only relevant contracts,
decisions, source and tests. Verify previous work before editing.
Complete the next unblocked baseline packet only. If it is too large, split it into
named subpackets and checkpoint after each. Do not change scope or skip acceptance.
Preserve unrelated changes. Run focused and affected regression checks. Record tests
not run honestly. Update BUILD_STATE, TEST_MATRIX, KNOWN_ISSUES and the packet handoff.
End with: completed, verified, incomplete, exact next action. No auto-publish or paid API.
```

### Auto-continue within the approved baseline

```text
You may continue through the unblocked baseline packets P00–P17 of the VieWorld
playbook, one packet at a time. This authorization is local prototype work only.
At every boundary run acceptance/regression checks and save a complete checkpoint.
Never trade tests or presence/rights boundaries for speed. Keep progress messages short.
If context is becoming unreliable, stop after saving BUILD_STATE and a resume handoff;
do not claim you can restart yourself after the host ends your execution.
Pause for permissions, spending, a conflicting user change, unknown asset rights,
or a product decision outside the constitution. Do not execute X01–X03, push or deploy.
Stop at P17 with the verified demo, screenshots and honest limitations.
```

### Resume after a new chat, compaction or interruption

```text
Resume VieWorld. Do not restart or redesign the app.
Read docs/CONSTITUTION.md, docs/BUILD_STATE.md, the latest handoff, active packet,
relevant contracts and current working-tree diff. Treat files and test evidence as
truth, not the prior chat summary. Verify whether interrupted commands completed.
State the last verified milestone and current incomplete subtask in two sentences.
Then continue the saved next exact action within the approved local baseline.
If state and code disagree, reconcile by inspection and tests; do not overwrite work.
Save a fresh checkpoint before stopping. All external/pilot extensions remain locked.
```

### Repair a failed packet

```text
Repair the currently failing VieWorld packet only. Reproduce the failure from
docs/KNOWN_ISSUES.md and the recorded test output. Identify the smallest cause and
patch the narrowest affected area. Do not weaken tests, suppress errors globally,
remove features, reset the repo or redesign passing screens to make the check green.
Run the failing test plus affected regression checks. Record the fix, remaining
limits and exact next action. If blocked by approval or permissions, stop and explain.
```

### Independent final review prompt

```text
Review the implemented VieWorld app against the playbook and actual tests.
Do not assume a completion claim is true. Trace the full fan journey from reset;
test live/recorded/disconnected labels, question state, replay expiry, membership vs
benefit, payment vs fulfilment, recovery, tenant isolation and reduced-motion mode.
Separate real behavior, simulation, missing feature and untested assertion.
Check every core route on phone and desktop; verify assets and source attribution.
Report blocking defects first, then small fixes. Do not publish or enable paid services.
```

## 11. Completion, measurement and research boundaries

Prototype telemetry is local, opt-in where user-entered notes are involved, and labeled demo. Suggested event vocabulary: world_opened, follow_changed, rsvp_changed, session_joined, question_submitted, poll_voted, capsule_saved, benefit_claim_attempted, demo_order_created, support_opened, presence_disclosure_checked. Never store raw private chat content in analytics. Provide export of synthetic events as JSON only on explicit user action; no third-party analytics endpoint.

Future test measures: unassisted task completion, accurate presence interpretation, capsule usefulness, return to a second offered moment and artist total effort. In a small formative test, report observed counts and any serious confusion; do not enforce an invented 5% statistical safety threshold. Engagement ratings and all retention/revenue outcomes remain unknown until a real study.

Definition of done for the baseline:

- The full signature and recovery journeys are stateful and reproducible.
- All invariant tests pass; blocked checks are disclosed, not silently counted as pass.
- Media, avatar, AI and demo labels match actual implementation.
- Artist creation includes draft/approval/version behavior; exclusive art production is not falsely automated.
- Fan interactions do not create fake artist replies or personal attention claims.
- No real money, credentials, media permissions, cross-company data or paid provider is used.
- My World is private in product design; the app admits local-only privacy/security limitations.
- Docs let a new agent resume without the old chat.
- Screenshots and walkthrough show real prototype behavior, not fabricated results.
- App has not been pushed into or deployed as the portfolio site without separate instruction.

## 12. Reference links and maintenance

These links ground product mechanics and build constraints. They do not prove VieWorld demand or give rights to replicate assets. Recheck mutable APIs/terms when an optional integration is approved.

- [Weverse official app description](https://play.google.com/store/apps/details?id=co.benx.weverse): shared moments and personal continuity precedent.
- [ZEPETO official app description](https://play.google.com/store/apps/details?id=me.zepeto.main): avatar-mediated streaming precedent.
- [Gemini 3.8 Flash model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash): API limits, not an Antigravity execution guarantee.
- [React documentation](https://react.dev/learn), [Vite guide](https://vite.dev/guide/), [TypeScript documentation](https://www.typescriptlang.org/docs/): verify setup at P00.
- [Playwright documentation](https://playwright.dev/docs/intro), [Vitest guide](https://vitest.dev/guide/): verify test setup at P00.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Spotify Developer Policy](https://developer.spotify.com/policy), [OWASP LLM application guidance](https://owasp.org/www-project-top-10-for-large-language-model-applications/): accessibility and integration review.

If Phú changes the product direction, record a decision ID and version this brief. Update both case assumptions and build contracts before implementing a contradictory feature. The purpose of phase discipline is a coherent product, not blindly completing an old checklist.
