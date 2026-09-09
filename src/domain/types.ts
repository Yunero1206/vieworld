/**
 * VieWorld Canonical Types and Schemas (§5.2 & docs/CONTRACTS.md)
 */

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
  title: string;
  avatarAssetId?: string;
  format: 'dropin' | 'listening' | 'concert';
  status: 'scheduled' | 'open' | 'running' | 'paused' | 'ended' | 'cancelled';
  hostRole: 'artist' | 'team';
  artistPresence: 'absent' | 'present' | 'reconnecting' | 'disconnected';
  segmentMode: 'live' | 'recorded';
  aiUse: 'none' | 'captions' | 'translation';
  replayStatus: 'not_planned' | 'pending_review' | 'available' | 'expired' | 'withdrawn';
  scheduledStartTime: string;
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
  title: string;
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
  authorName: string;
  content: string;
  status: 'submitted' | 'under_review' | 'selected' | 'answered' | 'closed';
  requestId?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  fanId: string;
  authorName: string;
  text: string;
  timestamp: string;
  isSample?: boolean;
  isReported?: boolean;
  reportRef?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll extends BaseRecord {
  sessionId: string;
  prompt: string;
  options: PollOption[];
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

/**
 * Domain Error structure for actionable, user-friendly UI errors
 */
export interface DomainError {
  code: string;
  message: string;
  actionableResolution?: string;
}

/**
 * Consolidated Application State Container
 */
export interface AppState {
  activeTenantId: TenantId;
  demoTime: string; // ISO UTC injected clock
  lastError?: DomainError;
  worlds: Record<string, World>;
  avatarAssets: Record<string, AvatarAsset>;
  sessions: Record<string, Session>;
  memberships: Record<string, Membership>;
  benefits: Record<string, Benefit>;
  participations: Record<string, Participation>;
  orders: Record<string, Order>;
  supportCases: Record<string, SupportCase>;
  fanProfile: FanProfile;
  products: Record<string, Product>;
  questions: Record<string, Question>;
  polls: Record<string, Poll>;
  capsules: Record<string, Capsule>;
  notifications: Record<string, Notification>;
  followedWorldIds: string[];
  rsvpdSessionIds: string[];
  inLobbySessionIds: string[]; // Sessions where fan is currently in lobby
}

/**
 * Pure Action Definitions
 */
export type AppAction =
  | { type: 'TOGGLE_FOLLOW'; worldId: string }
  | { type: 'TOGGLE_RSVP'; sessionId: string }
  | { type: 'ENTER_LOBBY'; sessionId: string }
  | { type: 'LEAVE_LOBBY'; sessionId: string }
  | { type: 'JOIN_LIVE_SESSION'; sessionId: string }
  | { type: 'WATCH_REPLAY'; sessionId: string }
  | { type: 'SUBMIT_QUESTION'; sessionId: string; content: string; requestId?: string }
  | { type: 'SELECT_QUESTION'; questionId: string }
  | { type: 'ANSWER_QUESTION'; questionId: string }
  | { type: 'VOTE_POLL'; pollId: string; optionId: string }
  | { type: 'START_SESSION'; sessionId: string; avatarAssetId: string }
  | { type: 'DISCONNECT_ARTIST'; sessionId: string }
  | { type: 'RECONNECT_ARTIST'; sessionId: string }
  | { type: 'END_SESSION'; sessionId: string }
  | { type: 'PUBLISH_REPLAY'; sessionId: string }
  | { type: 'SIMULATE_PAYMENT'; orderId: string; requestId: string }
  | { type: 'SIMULATE_FULFILMENT'; orderId: string }
  | { type: 'CREATE_ORDER'; productId: string; requestId: string }
  | { type: 'CLAIM_BENEFIT'; benefitId: string }
  | { type: 'OPEN_SUPPORT_CASE'; subjectType: 'benefit' | 'order'; subjectId: string }
  | { type: 'RESOLVE_SUPPORT_CASE'; caseId: string; resolution: string }
  | { type: 'SAVE_CAPSULE'; capsuleId: string; privateNote?: string }
  | { type: 'EQUIP_WARDROBE'; accessoryId: string }
  | { type: 'SWITCH_TENANT'; targetTenantId: TenantId }
  | { type: 'LOAD_SCENARIO'; scenarioState: AppState }
  | { type: 'ADVANCE_DEMO_TIME'; newIsoTime: string }
  | { type: 'CLEAR_ERROR' };
