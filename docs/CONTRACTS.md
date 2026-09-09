# VieWorld Canonical Contracts and Specifications

Version: 1.0  
Owner: Phạm Thanh Phú  
Status: Active Contract Baseline

---

## 1. Canonical Identifiers (§5.1)

All domain operations reference stable canonical identifiers rather than localized display text:

| Entity Type | Canonical Identifier | Description / Role |
|---|---|---|
| **Primary Tenant** | `vieworld-demo` | Standard VieWorld product environment |
| **Secondary Tenants** | `mfan-demo`, `fanme-demo` | Demonstration environments for portability testing |
| **Artist World** | `artist-a` | Flagship fictional artist world |
| **IP World** | `neon-sessions` | Fictional music & entertainment show world |
| **Fan Profile** | `fan-linh` | Primary demo fan identity |
| **Approved Avatar** | `avatar-a-v1` | Official approved 2D modular avatar asset |
| **Draft Avatar** | `avatar-a-v2` | Studio draft avatar awaiting simulated approval |
| **Drop-in Session** | `session-dropin-01` | Interactive live drop-in session |
| **Listening Session** | `session-listen-01` | Pre-recorded listening session with team host |
| **Live House Session** | `session-house-01` | Setlist-driven mini-concert format |
| **Membership** | `member-a-01` | Artist A fan membership record |
| **Benefits** | `benefit-replay-01` | Replay access benefit (eligible / claimed) |
| | `benefit-early-access-01` | Early access verification benefit (pending verification) |
| **Products** | `product-pin-01` | Commemorative enamel pin merchandise |
| | `product-shirt-01` | Limited tour-edition graphic t-shirt |

---

## 2. Canonical TypeScript Schemas (§5.2)

```typescript
export type TenantId = 'vieworld-demo' | 'mfan-demo' | 'fanme-demo';

export interface BaseRecord {
  id: string;
  tenantId: TenantId;
  version: number;
  updatedAt: string; // ISO 8601 UTC string
}

export interface World extends BaseRecord {
  type: 'artist' | 'ip';
  name: string;
  description: string;
  linkedWorldIds: string[];
  avatarAssetId?: string;
  bannerAssetId?: string;
}

export interface AvatarAsset extends BaseRecord {
  ownerWorldId: string;
  status: 'draft' | 'approved' | 'retired';
  parts: Record<string, string>; // accessory and style configurations
  approvalRef?: string;
  allowedContexts: ('dropin' | 'listening' | 'concert')[];
  replayAllowed: boolean;
}

export interface Session extends BaseRecord {
  worldId: string;
  avatarAssetId?: string;
  format: 'dropin' | 'listening' | 'concert';
  status: 'scheduled' | 'open' | 'running' | 'paused' | 'ended' | 'cancelled';
  hostRole: 'artist' | 'team';
  artistPresence: 'absent' | 'present' | 'reconnecting' | 'disconnected';
  segmentMode: 'live' | 'recorded';
  aiUse: 'none' | 'captions' | 'translation';
  replayStatus: 'not_planned' | 'pending_review' | 'available' | 'expired' | 'withdrawn';
  demo: true;
}

export interface Membership extends BaseRecord {
  fanId: string;
  worldId: string;
  status: 'inactive' | 'active' | 'expired';
  expiresAt?: string;
}

export interface Benefit extends BaseRecord {
  fanId: string;
  worldId: string;
  status: 'pending' | 'eligible' | 'claimed' | 'expired' | 'revoked';
  reasonCode: string;
  sourceRef: string;
  nextAction: string;
}

export interface Participation extends BaseRecord {
  fanId: string;
  sessionId: string;
  kind: 'live_attendance' | 'replay_view';
  joinedAt: string;
}

export interface Order extends BaseRecord {
  fanId: string;
  worldId: string;
  productId: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
  sourceRef: string;
  requestId: string; // Idempotency key
}

export interface SupportCase extends BaseRecord {
  fanId: string;
  subjectType: 'benefit' | 'order';
  subjectId: string;
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
  nextAction: string;
  resolution?: string;
}

export interface FanProfile extends BaseRecord {
  username: string;
  displayName: string;
  avatarUrl?: string;
  wardrobeChoice?: {
    accessoryId: string;
    equippedAt: string;
  };
}

export interface Product extends BaseRecord {
  worldId: string;
  title: string;
  priceVND: number;
  stockCount: number;
  isAvailable: boolean;
  requiredBenefitId?: string;
}

export interface Question extends BaseRecord {
  sessionId: string;
  fanId: string;
  content: string;
  status: 'submitted' | 'under_review' | 'selected' | 'answered' | 'closed';
}

export interface Poll extends BaseRecord {
  sessionId: string;
  prompt: string;
  options: { id: string; text: string; votes: number }[];
  status: 'open' | 'closed';
  userVotedOptionId?: string;
}

export interface Capsule extends BaseRecord {
  fanId: string;
  sessionId: string;
  worldId: string;
  participationId: string;
  isSaved: boolean;
  privateNote?: string;
}

export interface Notification extends BaseRecord {
  fanId: string;
  type: 'session_reminder' | 'capsule_ready' | 'support_update' | 'order_update';
  title: string;
  body: string;
  isRead: boolean;
  targetRoute: string;
}

export interface ConsentRecord extends BaseRecord {
  sessionId: string;
  performerId: string;
  isSimulatedConsent: true;
  approvedScopes: string[];
}

export interface DemoEvent extends BaseRecord {
  eventType: string;
  fanId: string;
  metadata: Record<string, unknown>;
}

export interface TenantConfig {
  tenantId: TenantId;
  displayName: string;
  accentColor: string;
  primaryBrandText: string;
}
```

---

## 3. Action Guards and Invariants (§5.3)

| Action | Guard Preconditions | Observable Invariant State |
|---|---|---|
| **Follow** | Valid `worldId` and `tenantId` | Follow toggles state; never modifies membership. |
| **RSVP** | Session `scheduled` or `open`, not `cancelled` | One RSVP record per fan/session; toggleable/reversible. |
| **Lobby Admission** | Session `open` or `running` | Admits fan to lobby view; does not generate attendance. |
| **Live Attendance** | Session `running` and fan actively present | Generates exactly one `live_attendance` record per fan/session. |
| **Watch Replay** | Session `ended`, replay `available` | Generates `replay_view`; never generates `live_attendance`. |
| **Submit Question** | Session `running`, length/cooldown valid | Question status becomes `submitted`; no read receipts. |
| **Select Question** | Operator action, session `running` | Question status becomes `selected`, not `answered`. |
| **Start Artist Session** | Approved avatar, context allowed, consent valid | Status `running`, presence `present` with persistent `DEMO`. |
| **Disconnect Artist** | Active session | Presence immediately becomes `reconnecting` or `disconnected`. |
| **End Session** | Session `running` or `paused` | Presence terminates; replay status becomes `pending_review`. |
| **Publish Replay** | Operator action and approval valid | Replay status becomes `available` for eligible fans. |
| **Simulated Payment** | Valid product, valid order, unique `requestId` | Order transitions to `paid`; idempotent on duplicate request ID. |
| **Fulfilment** | Order is in `paid` status | Order transitions to `fulfilled`; item ownership updates. |
| **Claim Benefit** | Benefit is in `eligible` status | Status becomes `claimed`; `pending` status cannot be bypassed. |
| **Open Support Case** | Blocked benefit or blocked order | Reuses existing active case for same subject; prevents duplicates. |
| **Resolve Support Case**| Operator action with resolution text | Case marked `resolved`; does not bypass entitlement logic. |
| **Switch Tenant** | Persist current tenant state, load target | Zero leakage of follows, orders, claims, or questions. |

---

## 4. Route Surface (§6)

| Path | Purpose |
|---|---|
| `/` | Discover home with upcoming moments and active worlds |
| `/worlds` | All worlds listing with followed status filters |
| `/worlds/:worldId` | World detail (Home, Sessions, Archive, Shop) |
| `/sessions/:sessionId` | Interactive venue stage, presence, questions, poll, chat |
| `/me` | Fan My World continuity hub (Overview, Memories, Benefits, Orders) |
| `/me/capsules/:capsuleId` | Moment Capsule detail, private notes, replay access |
| `/worlds/:worldId/shop` | Contextual world merchandise shop |
| `/orders/:orderId` | Simulated order status, receipt, and fulfilment timeline |
| `/benefits/:benefitId` | Benefit qualification, status, and claim action |
| `/support/:caseId` | Local support case timeline and reconciliation |
| `/inbox` | Truthful notification reminders and status alerts |
| `/studio` | Labeled operator demo studio preview |
| `/studio/avatar` | Avatar Studio: draft, preview, approve, retire |
| `/studio/sessions/:sessionId` | Operator moderation desk, presence switch, replay control |
| `/about-demo` | Full prototype disclosures, honesty statement, and reset drawer |

---

## 5. Design Tokens (§3.1)

```css
:root {
  /* Colors */
  --bg: #F7F5F0;         /* Warm ivory canvas */
  --surface: #FFFFFF;    /* Clean white cards and forms */
  --ink: #20212B;        /* Primary high-contrast text */
  --muted: #5E6373;      /* Secondary copy (WCAG AA compliant) */
  --stage: #151426;      /* Midnight room background for venues */
  --primary: #6551C8;    /* Deep royal purple primary brand */
  --accent: #A9E5D4;     /* Mint accent (used with dark text) */
  --danger: #A52838;     /* Crimson destructive / error state */
  --border: #D8D9E1;     /* Neutral structure border */

  /* Typography */
  --font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;  /* Base body */
  --font-size-lg: 20px;
  --font-size-xl: 28px;
  --font-size-2xl: 40px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;     /* Buttons and inputs */
  --radius-lg: 20px;     /* Content cards */
  --radius-xl: 28px;     /* Venue stage panels */

  /* Layout */
  --max-width: 1280px;
  --gutter-desktop: 24px;
  --gutter-mobile: 16px;
  --sidebar-width: 224px;
  --sidepanel-width: 300px;

  /* Transitions */
  --transition-fast: 120ms ease;
  --transition-normal: 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
