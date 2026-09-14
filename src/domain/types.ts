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

export type SessionFormat = 'dropin' | 'listening' | 'concert';

export interface AvatarParts {
  base?: 'stage_classic' | 'cyber_neon' | 'acoustic_minimal' | string;
  outfit?: 'midnight_jacket' | 'festival_hoodie' | 'cyber_suit' | string;
  accessory?: 'none' | 'earpiece_glow' | 'visor_neon' | 'star_badge' | string;
  [key: string]: string | undefined;
}

export interface AvatarAsset extends BaseRecord {
  ownerWorldId: string;
  status: 'draft' | 'approved' | 'retired';
  parts: AvatarParts; // accessory and style configurations
  approvalRef?: string;
  allowedContexts: SessionFormat[];
  replayAllowed: boolean;
}

export interface SessionRightsChecklist {
  musicClearance: boolean;
  artistConsent: boolean;
  safetyReview: boolean;
}

export interface TrackNote {
  trackNumber: number;
  title: string;
  duration: string;
  notes: string;
  isCurrent?: boolean;
}

export interface SetlistItem {
  order: number;
  title: string;
  status: 'completed' | 'performing' | 'upcoming';
  notes?: string;
}

export interface CallSampleCue {
  id: string;
  cueText: string;
  prompt: string;
  actionLabel: string;
}

export interface Session extends BaseRecord {
  worldId: string;
  title: string;
  avatarAssetId?: string;
  format: SessionFormat;
  status: 'scheduled' | 'open' | 'running' | 'paused' | 'ended' | 'cancelled';
  hostRole: 'artist' | 'team';
  artistPresence: 'absent' | 'present' | 'reconnecting' | 'disconnected';
  segmentMode: 'live' | 'recorded';
  aiUse: 'none' | 'captions' | 'translation';
  replayStatus: 'not_planned' | 'pending_review' | 'available' | 'expired' | 'withdrawn';
  scheduledStartTime: string;
  demo: true;
  rightsApproved?: boolean;
  rightsChecklist?: SessionRightsChecklist;
  isChatPaused?: boolean;
  trackNotes?: TrackNote[];
  setlist?: SetlistItem[];
  callSampleCues?: CallSampleCue[];
  mediaStatus?: 'cleared_local' | 'missing' | 'expired';
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
  createdAt?: string;
  paidAt?: string;
  fulfilledAt?: string;
  shipment?: { events: { stage: number; at: string }[]; estimatedAt: string };
  checkoutId?: string;
  quantity?: number;
  unitPriceVND?: number;
  productTitle?: string;
  productImage?: string;
  deliveryType?: 'physical' | 'digital' | 'bundle';
  digitalSlot?: 'shirt' | 'hat' | 'lightstick' | string;
  estimatedShipping?: string;
  batchLabel?: string;
  fanId: string;
  worldId: string;
  productId: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
  sourceRef: string;
  requestId: string; // Idempotency key
  optionLabel?: string;
}

export interface SupportCase extends BaseRecord {
  fanId: string;
  subjectType: 'benefit' | 'order';
  subjectId: string;
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
  nextAction: string;
  resolution?: string;
}

export type FanRole = 'fan' | 'artist' | 'operator';

export interface FanProfile extends BaseRecord {
  avatarPreset?: 'original' | 'wave' | 'bob' | 'curl';
  displaySlots?: Partial<Record<'shirt' | 'ticket' | 'disc' | 'lightstick' | 'achievement', string>>;
  publicIdentity?: { bio: string; mood: string; badge?: 10 | 20; productIds?: string[] };
  username: string;
  displayName: string;
  avatarUrl?: string;
  role?: FanRole;
  wardrobeChoice?: {
    accessoryId: string;
    equippedAt: string;
  };
  showcaseSlots?: [string | null, string | null, string | null];
  worldJourney?: { visitedWorldIds: string[]; readNoteIds: string[]; lastWorldId?: string };
  digitalLook?: { shirt?: string; hat?: string; lightstick?: string };
  savedProductIds?: string[];
  roomDesign?: import('../world/places').RoomDesign;
}

export interface Product extends BaseRecord {
  worldId: string;
  title: string;
  priceVND: number;
  stockCount: number;
  isAvailable: boolean;
  requiredBenefitId?: string;
  familyId?: string;
  category?: 'merch' | 'album' | 'membership' | 'ticket';
  delivery?: 'physical' | 'digital' | 'bundle';
  image?: string;
  digitalImage?: string;
  description?: string;
  includes?: string[];
  sizes?: string[];
  digitalSlot?: 'shirt' | 'hat' | 'lightstick';
  digitalItemId?: string;
  previewOnly?: boolean;
  releaseType?: 'in_stock' | 'pre_order';
  estimatedShipping?: string;
  batchLabel?: string;
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
  isVip?: boolean;
  badgeLabel?: string;
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
  type: 'session_reminder' | 'capsule_ready' | 'support_update' | 'order_update' | 'promotional';
  title: string;
  body: string;
  isRead: boolean;
  targetRoute: string;
  createdAt?: string;
  category?: 'session' | 'capsule' | 'support' | 'order' | 'promotional';
  sourceAttribution?: 'platform' | 'organizer' | 'session_system';
}

export interface NotificationPreferences {
  sessionReminders: boolean; // Event reminders for RSVP / sessions
  capsuleReady: boolean;     // Moment capsule generated reminders
  supportUpdates: boolean;   // Support & reconciliation updates
  orderUpdates: boolean;     // Order fulfilment and receipt updates
  promotional: boolean;      // Promotional announcements
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
  cart?: import('../world/commerce').CartLine[];
  ticketArchive?: import('../world/history').HistoryCard[];
  hallMessages?: Record<string, ChatMessage[]>;
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
  notificationPreferences: NotificationPreferences;
  followedWorldIds: string[];
  rsvpdSessionIds: string[];
  inLobbySessionIds: string[]; // Sessions where fan is currently in lobby
}

/**
 * Pure Action Definitions
 */
export type AppAction =
  | { type: 'SET_DISPLAY_SLOT'; slot: 'shirt' | 'ticket' | 'disc' | 'lightstick' | 'achievement'; itemId?: string }
  | { type: 'ADVANCE_SHIPMENT'; orderId: string; expectedStage: number }
  | { type: 'ADD_TO_CART'; productId: string; optionLabel?: string }
  | { type: 'SET_CART_QUANTITY'; key: string; quantity: number }
  | { type: 'CHECKOUT_CART'; requestId: string; fingerprint: string }
  | { type: 'PAY_CHECKOUT'; checkoutId: string }
  | { type: 'CANCEL_CHECKOUT'; checkoutId: string }
  | { type: 'IMPORT_DEMO_CARDS' }
  | { type: 'RETURN_HISTORY_CARDS'; cardIds: string[] }
  | { type: 'SAVE_PUBLIC_IDENTITY'; bio: string; mood: string; badge?: 10 | 20; productIds?: string[] }
  | { type: 'SAVE_ROOM_DESIGN'; design: import('../world/places').RoomDesign }
  | { type: 'SEND_HALL_MESSAGE'; worldId: string; text: string; requestId: string }
  | { type: 'REPORT_HALL_MESSAGE'; worldId: string; messageId: string }
  | { type: 'TOGGLE_SAVED_PRODUCT'; productId: string }
  | { type: 'EQUIP_DIGITAL_PRODUCT'; productId: string }
  | { type: 'REMOVE_DIGITAL_SLOT'; slot: 'shirt' | 'hat' | 'lightstick' }
  | { type: 'VISIT_FAN_WORLD'; worldId: string }
  | { type: 'READ_ARTIST_NOTE'; noteId: string }
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
  | { type: 'START_SESSION'; sessionId?: string; avatarAssetId?: string; payload?: { sessionId?: string; avatarAssetId?: string } }
  | { type: 'DISCONNECT_ARTIST'; sessionId: string }
  | { type: 'RECONNECT_ARTIST'; sessionId: string }
  | { type: 'END_SESSION'; sessionId: string }
  | { type: 'PUBLISH_REPLAY'; sessionId: string }
  | { type: 'SIMULATE_PAYMENT'; orderId: string; requestId: string }
  | { type: 'SIMULATE_FULFILMENT'; orderId: string }
  | { type: 'CREATE_ORDER'; productId: string; requestId: string; optionLabel?: string }
  | { type: 'CLAIM_BENEFIT'; benefitId: string }
  | { type: 'OPEN_SUPPORT_CASE'; subjectType: 'benefit' | 'order'; subjectId: string }
  | { type: 'ACKNOWLEDGE_SUPPORT_CASE'; caseId: string }
  | { type: 'INVESTIGATE_SUPPORT_CASE'; caseId: string }
  | { type: 'RESOLVE_SUPPORT_CASE'; caseId: string; resolution: string }
  | { type: 'CLOSE_SUPPORT_CASE'; caseId: string }
  | { type: 'RECONCILE_BENEFIT'; benefitId: string }
  | { type: 'RECONCILE_ORDER'; orderId: string }
  | { type: 'MARK_NOTIFICATION_READ'; notificationId: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'UPDATE_NOTIFICATION_PREFERENCES'; preferences: Partial<NotificationPreferences> }
  | { type: 'CREATE_NOTIFICATION'; notification: Notification }
  | {
      type: 'SAVE_AVATAR_DRAFT';
      asset?: {
        id: string;
        ownerWorldId: string;
        parts: AvatarParts;
        allowedContexts: SessionFormat[];
        replayAllowed: boolean;
      };
      payload?: {
        avatar?: AvatarAsset;
        asset?: any;
      };
    }
  | {
      type: 'APPROVE_AVATAR_ASSET';
      assetId?: string;
      approvalRef?: string;
      payload?: { assetId?: string; approvalRef?: string };
    }
  | { type: 'RETIRE_AVATAR_ASSET'; assetId?: string; payload?: { assetId?: string } }
  | {
      type: 'REVERT_AVATAR_VERSION';
      worldId?: string;
      targetAssetId?: string;
      payload?: { worldId?: string; assetId?: string; targetAssetId?: string };
    }
  | {
      type: 'ASSIGN_AVATAR_TO_SESSION';
      sessionId?: string;
      avatarAssetId?: string;
      payload?: { sessionId?: string; avatarAssetId?: string };
    }
  | { type: 'OPEN_LOBBY'; sessionId: string }
  | { type: 'PAUSE_SESSION'; sessionId: string }
  | { type: 'RESUME_SESSION'; sessionId: string }
  | { type: 'CANCEL_SESSION'; sessionId: string }
  | { type: 'UPDATE_SEGMENT_MODE'; sessionId: string; segmentMode: 'live' | 'recorded' }
  | { type: 'TOGGLE_CHAT_PAUSED'; sessionId: string }
  | { type: 'WITHDRAW_REPLAY'; sessionId: string }
  | {
      type: 'APPROVE_SESSION_RIGHTS';
      sessionId: string;
      checklist?: SessionRightsChecklist;
    }
  | { type: 'CLOSE_QUESTION'; questionId: string }
  | { type: 'SAVE_CAPSULE'; capsuleId: string; privateNote?: string; isSaved?: boolean }
  | { type: 'EQUIP_WARDROBE'; accessoryId: string }
  | { type: 'SET_AVATAR_PRESET'; preset: 'original' | 'wave' | 'bob' | 'curl' }
  | { type: 'SET_SHOWCASE_SLOT'; slotIndex: 0 | 1 | 2; capsuleId: string | null }
  | { type: 'CLEAR_SHOWCASE_SLOT'; slotIndex: 0 | 1 | 2 }
  | { type: 'UPGRADE_MEMBERSHIP'; worldId: string }
  | { type: 'SET_FAN_ROLE'; role: FanRole }
  | { type: 'SWITCH_TENANT'; targetTenantId: TenantId }
  | { type: 'LOAD_SCENARIO'; scenarioState: AppState }
  | { type: 'ADVANCE_DEMO_TIME'; newIsoTime: string }
  | { type: 'CLEAR_ERROR' };

export interface WardrobeAccessory {
  id: string;
  name: string;
  description: string;
  previewColor: string;
}

export const PRESET_ACCESSORIES: WardrobeAccessory[] = [
  {
    id: 'accessory_classic',
    name: 'Huy hiệu Ngôi sao Cổ điển',
    description: 'Huy hiệu kim loại vàng kỷ niệm phong cách sân khấu cổ điển.',
    previewColor: '#F59E0B',
  },
  {
    id: 'earpiece_glow',
    name: 'Tai nghe Neon Phát sáng',
    description: 'Phụ kiện tai nghe sân khấu phát ánh sáng xanh ngọc dịu.',
    previewColor: '#10B981',
  },
  {
    id: 'visor_neon',
    name: 'Kính thực tế ảo Cyber',
    description: 'Kính viền neon hiện đại lấy cảm hứng từ thế giới Neon Sessions.',
    previewColor: '#8B5CF6',
  },
];
