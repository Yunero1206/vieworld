/**
 * VieWorld Canonical Synthetic Fixtures (§5.1, §5.4 & docs/CONTRACTS.md)
 */

import {
  AppState,
  TenantId,
  World,
  AvatarAsset,
  Session,
  Membership,
  Benefit,
  Product,
  FanProfile,
  Question,
  Poll,
} from '../domain/types';

export const INITIAL_DEMO_TIME = '2026-09-09T13:00:00.000Z'; // 20:00 Asia/Ho_Chi_Minh

export const DEFAULT_FAN_PROFILE: FanProfile = {
  id: 'fan-linh',
  tenantId: 'vieworld-demo',
  version: 1,
  updatedAt: INITIAL_DEMO_TIME,
  username: 'linh_nguyen',
  displayName: 'Linh Nguyễn',
  avatarUrl: '',
  wardrobeChoice: {
    accessoryId: 'lightstick-star',
    equippedAt: INITIAL_DEMO_TIME,
  },
};

export const CANONICAL_WORLDS: Record<string, World> = {
  'artist-a': {
    id: 'artist-a',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'Artist A',
    description: 'Thế giới âm nhạc và khoảnh khắc kết nối chân thực của nghệ sĩ hư cấu Artist A.',
    linkedWorldIds: ['neon-sessions'],
    avatarAssetId: 'avatar-a-v1',
    bannerAssetId: 'asset-world-artist-a-banner',
  },
  'neon-sessions': {
    id: 'neon-sessions',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'ip',
    name: 'Neon Sessions',
    description: 'Sân khấu âm nhạc và chuỗi chương trình nghệ thuật ban đêm hư cấu.',
    linkedWorldIds: ['artist-a'],
    bannerAssetId: 'asset-world-neon-banner',
  },
};

export const CANONICAL_AVATARS: Record<string, AvatarAsset> = {
  'avatar-a-v1': {
    id: 'avatar-a-v1',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    ownerWorldId: 'artist-a',
    status: 'approved',
    approvalRef: 'APPROVAL-SIM-2026-01',
    allowedContexts: ['dropin', 'listening', 'concert'],
    replayAllowed: true,
    parts: {
      base: 'stage_classic',
      outfit: 'midnight_jacket',
      accessory: 'earpiece_glow',
    },
  },
  'avatar-a-v2': {
    id: 'avatar-a-v2',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    ownerWorldId: 'artist-a',
    status: 'draft',
    allowedContexts: ['dropin'],
    replayAllowed: false,
    parts: {
      base: 'stage_classic',
      outfit: 'festival_hoodie',
      accessory: 'visor_neon',
    },
  },
};

export const CANONICAL_SESSIONS: Record<string, Session> = {
  'session-dropin-01': {
    id: 'session-dropin-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-a',
    title: 'Artist A: Drop-in Trò chuyện đầu tuần',
    avatarAssetId: 'avatar-a-v1',
    format: 'dropin',
    status: 'running',
    hostRole: 'artist',
    artistPresence: 'present',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'pending_review',
    scheduledStartTime: INITIAL_DEMO_TIME,
    demo: true,
  },
  'session-listen-01': {
    id: 'session-listen-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'neon-sessions',
    title: 'Neon Sessions: Phòng nghe bản thu đặc biệt',
    format: 'listening',
    status: 'scheduled',
    hostRole: 'team',
    artistPresence: 'absent',
    segmentMode: 'recorded',
    aiUse: 'captions',
    replayStatus: 'not_planned',
    scheduledStartTime: '2026-09-10T14:00:00.000Z',
    demo: true,
  },
  'session-house-01': {
    id: 'session-house-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-a',
    title: 'Live House: Setlist đêm Thứ Bảy',
    avatarAssetId: 'avatar-a-v1',
    format: 'concert',
    status: 'scheduled',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'not_planned',
    scheduledStartTime: '2026-09-12T13:00:00.000Z',
    demo: true,
  },
};

export const CANONICAL_MEMBERSHIPS: Record<string, Membership> = {
  'member-a-01': {
    id: 'member-a-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    fanId: 'fan-linh',
    worldId: 'artist-a',
    status: 'active',
    expiresAt: '2027-01-01T00:00:00.000Z',
  },
};

export const CANONICAL_BENEFITS: Record<string, Benefit> = {
  'benefit-replay-01': {
    id: 'benefit-replay-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    fanId: 'fan-linh',
    worldId: 'artist-a',
    title: 'Quyền xem lại kho lưu trữ Replay',
    status: 'eligible',
    reasonCode: 'ACTIVE_MEMBERSHIP_VERIFIED',
    sourceRef: 'member-a-01',
    nextAction: 'Nhấn để kích hoạt quyền xem lại các phiên Drop-in đã kết thúc.',
  },
  'benefit-early-access-01': {
    id: 'benefit-early-access-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    fanId: 'fan-linh',
    worldId: 'artist-a',
    title: 'Xác thực quyền mua sớm vé Live House',
    status: 'pending',
    reasonCode: 'PENDING_ORGANIZER_DISPATCH',
    sourceRef: 'member-a-01',
    nextAction: 'Hệ thống đang đối soát dữ liệu phân bổ đợt mở bán.',
  },
};

export const CANONICAL_PRODUCTS: Record<string, Product> = {
  'product-pin-01': {
    id: 'product-pin-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-a',
    title: 'Huy hiệu kim loại kỷ niệm Star Drop-in',
    priceVND: 150000,
    stockCount: 50,
    isAvailable: true,
  },
  'product-shirt-01': {
    id: 'product-shirt-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-a',
    title: 'Áo thun kỷ niệm Midnight Neon Tour',
    priceVND: 380000,
    stockCount: 25,
    isAvailable: true,
    requiredBenefitId: 'benefit-early-access-01',
  },
};

export const INITIAL_QUESTIONS: Record<string, Question> = {
  'question-01': {
    id: 'question-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    sessionId: 'session-dropin-01',
    fanId: 'fan-linh',
    authorName: 'Linh Nguyễn',
    content: 'Bài hát mở màn cho Live House sắp tới có phải là một bản phối acoustic không ạ?',
    status: 'submitted',
  },
};

export const INITIAL_POLLS: Record<string, Poll> = {
  'poll-01': {
    id: 'poll-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    sessionId: 'session-dropin-01',
    prompt: 'Bạn muốn nghe thêm ca khúc nào trong buổi giao lưu tối nay?',
    options: [
      { id: 'opt-1', text: 'Vệt Sáng Đêm', votes: 142 },
      { id: 'opt-2', text: 'Nhịp Điệu Kỷ Niệm', votes: 89 },
      { id: 'opt-3', text: 'Bản phối mới chưa ra mắt', votes: 215 },
    ],
    status: 'open',
  },
};

/**
 * Creates the initial application baseline state
 */
export function createInitialState(tenantId: TenantId = 'vieworld-demo'): AppState {
  return {
    activeTenantId: tenantId,
    demoTime: INITIAL_DEMO_TIME,
    worlds: structuredClone(CANONICAL_WORLDS),
    avatarAssets: structuredClone(CANONICAL_AVATARS),
    sessions: structuredClone(CANONICAL_SESSIONS),
    memberships: structuredClone(CANONICAL_MEMBERSHIPS),
    benefits: structuredClone(CANONICAL_BENEFITS),
    participations: {},
    orders: {},
    supportCases: {},
    fanProfile: structuredClone(DEFAULT_FAN_PROFILE),
    products: structuredClone(CANONICAL_PRODUCTS),
    questions: structuredClone(INITIAL_QUESTIONS),
    polls: structuredClone(INITIAL_POLLS),
    capsules: {},
    notifications: {},
    followedWorldIds: ['artist-a'],
    rsvpdSessionIds: ['session-dropin-01'],
    inLobbySessionIds: [],
  };
}

/**
 * Required Named Scenario Presets (§5.4)
 */
export const scenarioPresets = {
  /** 1. New Fan: No follows, no memberships, no saved capsules, no orders */
  newFan: (tenantId: TenantId = 'vieworld-demo'): AppState => {
    const base = createInitialState(tenantId);
    return {
      ...base,
      followedWorldIds: [],
      rsvpdSessionIds: [],
      memberships: {},
      benefits: {},
      orders: {},
      participations: {},
      capsules: {},
      questions: {},
    };
  },

  /** 2. Active Member: Full baseline with active membership and followed world */
  activeMember: (tenantId: TenantId = 'vieworld-demo'): AppState => {
    return createInitialState(tenantId);
  },

  /** 3. Benefit Pending: Membership active but both benefits pending */
  benefitPending: (tenantId: TenantId = 'vieworld-demo'): AppState => {
    const base = createInitialState(tenantId);
    return {
      ...base,
      benefits: {
        ...base.benefits,
        'benefit-replay-01': {
          ...base.benefits['benefit-replay-01'],
          status: 'pending',
          reasonCode: 'PENDING_TIER_AUDIT',
          nextAction: 'Chờ hệ thống kiểm tra kỳ hạn thành viên.',
        },
      },
    };
  },

  /** 4. Order Paid: Has an existing paid order awaiting fulfillment */
  orderPaid: (tenantId: TenantId = 'vieworld-demo'): AppState => {
    const base = createInitialState(tenantId);
    const orderId = 'order-pin-demo-01';
    return {
      ...base,
      orders: {
        [orderId]: {
          id: orderId,
          tenantId,
          version: 1,
          updatedAt: INITIAL_DEMO_TIME,
          fanId: 'fan-linh',
          worldId: 'artist-a',
          productId: 'product-pin-01',
          status: 'paid',
          sourceRef: 'VieSHOP-DEMO-PAY',
          requestId: 'req-paid-fixture-01',
        },
      },
    };
  },

  /** 5. Session Disconnected: Artist presence is disconnected */
  sessionDisconnected: (tenantId: TenantId = 'vieworld-demo'): AppState => {
    const base = createInitialState(tenantId);
    return {
      ...base,
      sessions: {
        ...base.sessions,
        'session-dropin-01': {
          ...base.sessions['session-dropin-01'],
          artistPresence: 'disconnected',
        },
      },
    };
  },

  /** 6. Replay Expired: Session ended and replay is expired */
  replayExpired: (tenantId: TenantId = 'vieworld-demo'): AppState => {
    const base = createInitialState(tenantId);
    return {
      ...base,
      sessions: {
        ...base.sessions,
        'session-dropin-01': {
          ...base.sessions['session-dropin-01'],
          status: 'ended',
          artistPresence: 'absent',
          replayStatus: 'expired',
        },
      },
    };
  },
};
