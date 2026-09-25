/**
 * VieWorld Canonical Synthetic Fixtures (§5.1, §5.4 & docs/CONTRACTS.md)
 */

import { NEW_MERCH } from '../world/merchCatalog';
import {
  CANONICAL_INITIAL_DEMO_TIME,
  EXPANDED_WORLDS,
  EXPANDED_SESSIONS,
  EXPANDED_PRODUCTS,
  EXPANDED_HALL_MESSAGES,
  applyPersonaToState,
} from './expandedUniverse';
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
  Notification,
  NotificationPreferences,
} from '../domain/types';

export const INITIAL_DEMO_TIME = CANONICAL_INITIAL_DEMO_TIME; // 20:00 Asia/Ho_Chi_Minh

export const DEFAULT_FAN_PROFILE: FanProfile = {
  id: 'fan-linh',
  tenantId: 'vieworld-demo',
  version: 1,
  updatedAt: INITIAL_DEMO_TIME,
  username: 'linh_nguyen',
  displayName: 'Linh Nguyễn',
  role: 'fan',
  avatarUrl: '',
  wardrobeChoice: {
    accessoryId: 'lightstick-star',
    equippedAt: INITIAL_DEMO_TIME,
  },
  showcaseSlots: [null, null, null],
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
    linkedWorldIds: ['neon-sessions', 'artist-mira', 'artist-kai'],
    avatarAssetId: 'avatar-a-v1',
    bannerAssetId: 'asset-world-artist-a-banner',
  },
  'artist-mira': {
    id: 'artist-mira',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'MIRA',
    description: 'Không gian Dream Pop & Lofi R&B mộng mơ, nơi những giai điệu ánh trăng vỗ về tâm hồn.',
    linkedWorldIds: ['artist-a', 'artist-kai'],
    avatarAssetId: 'avatar-mira-v1',
    bannerAssetId: 'asset-world-mira-banner',
  },
  'artist-kai': {
    id: 'artist-kai',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'KAI',
    description: 'Sân khấu Future Beats & Cyber-Pop ngập tràn năng lượng đường phố và hiệu ứng ánh sáng neon điện tử.',
    linkedWorldIds: ['artist-a', 'artist-mira'],
    avatarAssetId: 'avatar-kai-v1',
    bannerAssetId: 'asset-world-kai-banner',
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
  // Fictional demo artists for Explore density. No real-person identity is implied.
  'artist-b': {
    id: 'artist-b', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME,
    type: 'artist', name: 'Artist B',
    description: 'Một nghệ sĩ indie-pop hư cấu với những buổi diễn gần gũi.',
    linkedWorldIds: [],
  },
  'artist-c': {
    id: 'artist-c', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME,
    type: 'artist', name: 'Artist C',
    description: 'Một nghệ sĩ alt-pop hư cấu với sân khấu nhiều sắc tím.',
    linkedWorldIds: [],
  },
  'artist-d': {
    id: 'artist-d', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME,
    type: 'artist', name: 'Artist D',
    description: 'Một nghệ sĩ acoustic hư cấu, thích những buổi diễn ấm cúng.',
    linkedWorldIds: [],
  },
  'artist-e': {
    id: 'artist-e', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME,
    type: 'artist', name: 'Artist E',
    description: 'Một nghệ sĩ electronic-pop hư cấu với những bản phối đêm khuya.',
    linkedWorldIds: [],
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
  'avatar-mira-v1': {
    id: 'avatar-mira-v1',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    ownerWorldId: 'artist-mira',
    status: 'approved',
    approvalRef: 'APPROVAL-MIRA-2026-01',
    allowedContexts: ['dropin', 'listening', 'concert'],
    replayAllowed: true,
    parts: {
      base: 'stage_classic',
      outfit: 'festival_hoodie',
      accessory: 'lightstick_star',
    },
  },
  'avatar-kai-v1': {
    id: 'avatar-kai-v1',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    ownerWorldId: 'artist-kai',
    status: 'approved',
    approvalRef: 'APPROVAL-KAI-2026-01',
    allowedContexts: ['dropin', 'listening', 'concert'],
    replayAllowed: true,
    parts: {
      base: 'stage_classic',
      outfit: 'midnight_jacket',
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
    rightsApproved: true,
    rightsChecklist: {
      musicClearance: true,
      artistConsent: true,
      safetyReview: true,
    },
  },
  'session-mira-dropin': {
    id: 'session-mira-dropin',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-mira',
    title: 'MIRA: Giờ trà lofi & nghe thử bản thảo Luna',
    avatarAssetId: 'avatar-mira-v1',
    format: 'dropin',
    status: 'scheduled',
    hostRole: 'artist',
    artistPresence: 'present',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'pending_review',
    scheduledStartTime: '2026-09-15T13:00:00.000Z',
    demo: true,
    rightsApproved: true,
    rightsChecklist: {
      musicClearance: true,
      artistConsent: true,
      safetyReview: true,
    },
  },
  'session-kai-pulse': {
    id: 'session-kai-pulse',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-kai',
    title: 'KAI: Live Beat Laboratory & Thử thách nhịp điệu',
    avatarAssetId: 'avatar-kai-v1',
    format: 'dropin',
    status: 'scheduled',
    hostRole: 'artist',
    artistPresence: 'present',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'pending_review',
    scheduledStartTime: '2026-09-16T14:00:00.000Z',
    demo: true,
    rightsApproved: true,
    rightsChecklist: {
      musicClearance: true,
      artistConsent: true,
      safetyReview: true,
    },
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
    mediaStatus: 'cleared_local',
    scheduledStartTime: '2026-09-10T14:00:00.000Z',
    demo: true,
    rightsApproved: true,
    rightsChecklist: {
      musicClearance: true,
      artistConsent: true,
      safetyReview: true,
    },
    trackNotes: [
      {
        trackNumber: 1,
        title: 'Neon Prelude (Bản nháp Acoustic)',
        duration: '03:24',
        notes: 'Bản thu mộc guitar tại phòng thu Sài Gòn, 08/2026. Thử nghiệm âm hưởng mộc mạc trước khi phối khí.',
        isCurrent: true,
      },
      {
        trackNumber: 2,
        title: 'Ánh Đèn Đêm (Demo Version)',
        duration: '04:10',
        notes: 'Bản phối synthwave thử nghiệm với nhịp điệu hoài niệm.',
      },
      {
        trackNumber: 3,
        title: 'Outro: Ký Ức Thành Phố',
        duration: '02:45',
        notes: 'Đoạn outro không lời khép lại tuyển tập phòng nghe Neon Sessions.',
      },
    ],
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
    mediaStatus: 'cleared_local',
    scheduledStartTime: '2026-09-12T13:00:00.000Z',
    demo: true,
    rightsApproved: false,
    rightsChecklist: {
      musicClearance: false,
      artistConsent: false,
      safetyReview: false,
    },
    setlist: [
      { order: 1, title: 'Mở màn: Khát Vọng Tuổi Trẻ', status: 'completed' },
      { order: 2, title: 'Điểm Tựa Tương Lai (Bản phối Live House)', status: 'performing' },
      { order: 3, title: 'Giai Điệu Kỷ Niệm', status: 'upcoming' },
      { order: 4, title: 'Encore: Ánh Sáng VieWorld', status: 'upcoming' },
    ],
    callSampleCues: [
      {
        id: 'cue-01',
        cueText: 'VI-E-WORLD!',
        prompt: 'Hô vang tên cộng đồng cùng nghệ sĩ tại nhịp dạo đầu!',
        actionLabel: 'Hô vang: VIEWORLD',
      },
      {
        id: 'cue-02',
        cueText: 'ĐIỆP KHÚC!',
        prompt: 'Hòa giọng vào đoạn điệp khúc cao trào!',
        actionLabel: 'Hòa giọng điệp khúc',
      },
      {
        id: 'cue-03',
        cueText: 'LIGHTSTICK XANH!',
        prompt: 'Bật và vẫy lightstick ảo theo nhịp trống dồn!',
        actionLabel: 'Vẫy lightstick ảo',
      },
    ],
  },
  'session-expired-01': {
    id: 'session-expired-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-a',
    title: 'Đêm Nhạc Kỷ Niệm Mùa 1 (Bản quyền đã hết hạn)',
    avatarAssetId: 'avatar-a-v1',
    format: 'listening',
    status: 'ended',
    hostRole: 'team',
    artistPresence: 'absent',
    segmentMode: 'recorded',
    aiUse: 'none',
    replayStatus: 'expired',
    mediaStatus: 'expired',
    scheduledStartTime: '2026-08-01T14:00:00.000Z',
    demo: true,
    rightsApproved: true,
    rightsChecklist: {
      musicClearance: true,
      artistConsent: true,
      safetyReview: true,
    },
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
    previewCapabilities: { avatar: false, room: true },
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
    previewCapabilities: { avatar: true, room: true },
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

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  sessionReminders: true,
  capsuleReady: true,
  supportUpdates: true,
  orderUpdates: true,
  promotional: false,
};

export const INITIAL_NOTIFICATIONS: Record<string, Notification> = {
  'notif-rsvp-dropin': {
    id: 'notif-rsvp-dropin',
    tenantId: 'vieworld-demo',
    version: 1,
    fanId: 'fan-linh',
    type: 'session_reminder',
    category: 'session',
    sourceAttribution: 'session_system',
    title: 'Nhắc nhở: Phiên giao lưu nghệ sĩ ảo sắp diễn ra!',
    body: 'Bạn đã đăng ký giữ chỗ (RSVP) cho "Đêm Nhạc Cùng VieWorld". Sảnh chờ sẽ mở trước 15 phút.',
    isRead: false,
    targetRoute: '/sessions/session-dropin-01',
    createdAt: '2026-09-09T18:00:00Z',
    updatedAt: '2026-09-09T18:00:00Z',
  },
  'notif-shop-drop': {
    id: 'notif-shop-drop',
    tenantId: 'vieworld-demo',
    version: 1,
    fanId: 'fan-linh',
    type: 'promotional',
    category: 'promotional',
    sourceAttribution: 'platform',
    title: 'Sản phẩm mới đã lên kệ!',
    body: 'Khám phá bộ sưu tập thu với nhiều món đồ xinh xắn dành riêng cho bạn.',
    isRead: false,
    targetRoute: '/shop',
    createdAt: '2026-09-08T10:00:00Z',
    updatedAt: '2026-09-08T10:00:00Z',
  },
  'notif-community-moment': {
    id: 'notif-community-moment',
    tenantId: 'vieworld-demo',
    version: 1,
    fanId: 'fan-linh',
    type: 'promotional',
    category: 'promotional',
    sourceAttribution: 'platform',
    title: 'Khoảnh khắc mới từ cộng đồng',
    body: 'Cùng xem những khoảnh khắc đáng yêu mà mọi người đã chia sẻ trong tuần qua nhé!',
    isRead: false,
    targetRoute: '/explore',
    createdAt: '2026-09-07T14:30:00Z',
    updatedAt: '2026-09-07T14:30:00Z',
  },
  'notif-space-care': {
    id: 'notif-space-care',
    tenantId: 'vieworld-demo',
    version: 1,
    fanId: 'fan-linh',
    type: 'promotional',
    category: 'promotional',
    sourceAttribution: 'platform',
    title: 'Đừng quên chăm sóc không gian của bạn nhé!',
    body: 'Không gian của bạn đã lâu chưa cập nhật. Thêm vài món đồ mới để làm mới góc nhỏ nào!',
    isRead: true,
    targetRoute: '/me',
    createdAt: '2026-09-06T09:15:00Z',
    updatedAt: '2026-09-06T09:15:00Z',
  },
};

/**
 * Scoped Fixture Sets for MFan Partner Configuration (§1, §3, P15)
 * Distinct simulated entities without scraping external sites or using official marks.
 */
export const MFAN_WORLDS: Record<string, World> = {
  'world-mfan-artist-m': {
    id: 'world-mfan-artist-m',
    tenantId: 'mfan-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'Artist M (MFan Demo)',
    description: 'Không gian cộng đồng fandom của nghệ sĩ giả lập Artist M trong cấu hình đối tác MFan.',
    linkedWorldIds: ['world-mfan-showcase'],
    avatarAssetId: 'avatar-mfan-m1',
    bannerAssetId: 'asset-world-mfan-banner',
  },
  'world-mfan-showcase': {
    id: 'world-mfan-showcase',
    tenantId: 'mfan-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'ip',
    name: 'MFan Showcase Stage',
    description: 'Sân khấu tổng hợp các sự kiện giao lưu trực tuyến đối tác MFan.',
    linkedWorldIds: ['world-mfan-artist-m'],
    bannerAssetId: 'asset-world-mfan-showcase-banner',
  },
};

export const MFAN_AVATARS: Record<string, AvatarAsset> = {
  'avatar-mfan-m1': {
    id: 'avatar-mfan-m1',
    tenantId: 'mfan-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    ownerWorldId: 'world-mfan-artist-m',
    status: 'approved',
    approvalRef: 'APPROVAL-MFAN-2026-01',
    allowedContexts: ['dropin', 'listening', 'concert'],
    replayAllowed: true,
    parts: {
      base: 'stage_classic',
      outfit: 'festival_hoodie',
      accessory: 'earpiece_glow',
    },
  },
};

export const MFAN_SESSIONS: Record<string, Session> = {
  'session-mfan-01': {
    id: 'session-mfan-01',
    tenantId: 'mfan-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'world-mfan-artist-m',
    title: 'MFan Fandom Meet & Greet Demo',
    format: 'dropin',
    status: 'scheduled',
    scheduledStartTime: '2026-09-09T14:00:00.000Z',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'not_planned',
    demo: true,
    rightsApproved: true,
    mediaStatus: 'cleared_local',
    avatarAssetId: 'avatar-mfan-m1',
  },
};

export const MFAN_MEMBERSHIPS: Record<string, Membership> = {
  'member-mfan-01': {
    id: 'member-mfan-01',
    tenantId: 'mfan-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    fanId: 'fan-linh',
    worldId: 'world-mfan-artist-m',
    status: 'active',
    expiresAt: '2027-01-01T00:00:00.000Z',
  },
};

export const MFAN_BENEFITS: Record<string, Benefit> = {
  'benefit-mfan-01': {
    id: 'benefit-mfan-01',
    tenantId: 'mfan-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    fanId: 'fan-linh',
    worldId: 'world-mfan-artist-m',
    title: 'MFan Priority Pass',
    status: 'eligible',
    reasonCode: 'ACTIVE_MEMBERSHIP_VERIFIED',
    sourceRef: 'member-mfan-01',
    nextAction: 'Quyền ưu tiên nhận thông báo và tham gia phòng chờ sớm sự kiện MFan.',
  },
  'benefit-replay-01': {
    id: 'benefit-replay-01',
    tenantId: 'mfan-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    fanId: 'fan-linh',
    worldId: 'world-mfan-artist-m',
    title: 'Quyền xem lại Replay (MFan Demo)',
    status: 'eligible',
    reasonCode: 'ACTIVE_MEMBERSHIP_VERIFIED',
    sourceRef: 'member-mfan-01',
    nextAction: 'Nhấn để kích hoạt quyền xem lại các phiên Drop-in đã kết thúc.',
  },
};

export const MFAN_PRODUCTS: Record<string, Product> = {
  'product-mfan-lightband': {
    id: 'product-mfan-lightband',
    tenantId: 'mfan-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'world-mfan-artist-m',
    title: 'Vòng tay phát sáng MFan Lightband (Demo)',
    priceVND: 120000,
    stockCount: 50,
    isAvailable: true,
  },
};

export const MFAN_FAN_PROFILE: FanProfile = {
  id: 'fan-linh',
  tenantId: 'mfan-demo',
  version: 1,
  updatedAt: INITIAL_DEMO_TIME,
  username: 'linh_mfan',
  displayName: 'Linh Nguyễn (MFan)',
  role: 'fan',
  avatarUrl: '',
  wardrobeChoice: {
    accessoryId: 'earpiece_glow',
    equippedAt: INITIAL_DEMO_TIME,
  },
  showcaseSlots: [null, null, null],
};

/**
 * Scoped Fixture Sets for FanMe Partner Configuration (§1, §3, P15)
 * Distinct simulated creator space without scraping external sites or using official marks.
 */
export const FANME_WORLDS: Record<string, World> = {
  'world-fanme-creator-k': {
    id: 'world-fanme-creator-k',
    tenantId: 'fanme-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'Creator K (FanMe Demo)',
    description: 'Kênh sáng tạo nội dung và âm nhạc của nhà sáng tạo hư cấu Creator K trên FanMe.',
    linkedWorldIds: ['world-fanme-lounge'],
    avatarAssetId: 'avatar-fanme-k1',
    bannerAssetId: 'asset-world-fanme-banner',
  },
  'world-fanme-lounge': {
    id: 'world-fanme-lounge',
    tenantId: 'fanme-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'ip',
    name: 'FanMe Live Lounge',
    description: 'Không gian phát sóng trực tiếp và trò chuyện sáng tạo định kỳ.',
    linkedWorldIds: ['world-fanme-creator-k'],
    bannerAssetId: 'asset-world-fanme-lounge-banner',
  },
};

export const FANME_AVATARS: Record<string, AvatarAsset> = {
  'avatar-fanme-k1': {
    id: 'avatar-fanme-k1',
    tenantId: 'fanme-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    ownerWorldId: 'world-fanme-creator-k',
    status: 'approved',
    approvalRef: 'APPROVAL-FANME-2026-01',
    allowedContexts: ['dropin', 'listening'],
    replayAllowed: true,
    parts: {
      base: 'cyber_neon',
      outfit: 'cyber_suit',
      accessory: 'visor_neon',
    },
  },
};

export const FANME_SESSIONS: Record<string, Session> = {
  'session-fanme-01': {
    id: 'session-fanme-01',
    tenantId: 'fanme-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'world-fanme-creator-k',
    title: 'FanMe Creator Live Chat Demo',
    format: 'dropin',
    status: 'scheduled',
    scheduledStartTime: '2026-09-09T15:00:00.000Z',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'not_planned',
    demo: true,
    rightsApproved: true,
    mediaStatus: 'cleared_local',
    avatarAssetId: 'avatar-fanme-k1',
  },
};

export const FANME_MEMBERSHIPS: Record<string, Membership> = {
  'member-fanme-01': {
    id: 'member-fanme-01',
    tenantId: 'fanme-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    fanId: 'fan-linh',
    worldId: 'world-fanme-creator-k',
    status: 'active',
    expiresAt: '2027-01-01T00:00:00.000Z',
  },
};

export const FANME_BENEFITS: Record<string, Benefit> = {
  'benefit-fanme-01': {
    id: 'benefit-fanme-01',
    tenantId: 'fanme-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    fanId: 'fan-linh',
    worldId: 'world-fanme-creator-k',
    title: 'FanMe Digital Badge (Demo)',
    status: 'eligible',
    reasonCode: 'ACTIVE_MEMBERSHIP_VERIFIED',
    sourceRef: 'member-fanme-01',
    nextAction: 'Huy hiệu số chứng nhận người ủng hộ kênh Creator K.',
  },
};

export const FANME_PRODUCTS: Record<string, Product> = {
  'product-fanme-photocard': {
    id: 'product-fanme-photocard',
    tenantId: 'fanme-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'world-fanme-creator-k',
    title: 'Bộ thẻ ảnh số FanMe Digital Photocard (Demo)',
    priceVND: 50000,
    stockCount: 100,
    isAvailable: true,
  },
};

export const FANME_FAN_PROFILE: FanProfile = {
  id: 'fan-linh',
  tenantId: 'fanme-demo',
  version: 1,
  updatedAt: INITIAL_DEMO_TIME,
  username: 'linh_fanme',
  displayName: 'Linh Nguyễn (FanMe)',
  role: 'fan',
  avatarUrl: '',
  wardrobeChoice: {
    accessoryId: 'visor_neon',
    equippedAt: INITIAL_DEMO_TIME,
  },
  showcaseSlots: [null, null, null],
};

/**
 * Creates the initial application baseline state for the specified tenant
 */
export function createInitialState(tenantId: TenantId = 'vieworld-demo'): AppState {
  if (tenantId === 'mfan-demo') {
    return {
      activeTenantId: 'mfan-demo',
      demoTime: INITIAL_DEMO_TIME,
      worlds: structuredClone(MFAN_WORLDS),
      avatarAssets: structuredClone(MFAN_AVATARS),
      sessions: structuredClone(MFAN_SESSIONS),
      memberships: structuredClone(MFAN_MEMBERSHIPS),
      benefits: structuredClone(MFAN_BENEFITS),
      participations: {},
      orders: {},
      supportCases: {},
      fanProfile: structuredClone(MFAN_FAN_PROFILE),
      products: structuredClone(MFAN_PRODUCTS),
      questions: {},
      polls: {},
      capsules: {},
      notifications: {},
      notificationPreferences: structuredClone(DEFAULT_NOTIFICATION_PREFERENCES),
      followedWorldIds: ['world-mfan-artist-m'],
      rsvpdSessionIds: ['session-mfan-01'],
      inLobbySessionIds: [],
    };
  }

  if (tenantId === 'fanme-demo') {
    return {
      activeTenantId: 'fanme-demo',
      demoTime: INITIAL_DEMO_TIME,
      worlds: structuredClone(FANME_WORLDS),
      avatarAssets: structuredClone(FANME_AVATARS),
      sessions: structuredClone(FANME_SESSIONS),
      memberships: structuredClone(FANME_MEMBERSHIPS),
      benefits: structuredClone(FANME_BENEFITS),
      participations: {},
      orders: {},
      supportCases: {},
      fanProfile: structuredClone(FANME_FAN_PROFILE),
      products: structuredClone(FANME_PRODUCTS),
      questions: {},
      polls: {},
      capsules: {},
      notifications: {},
      notificationPreferences: structuredClone(DEFAULT_NOTIFICATION_PREFERENCES),
      followedWorldIds: ['world-fanme-creator-k'],
      rsvpdSessionIds: ['session-fanme-01'],
      inLobbySessionIds: [],
    };
  }

  // Canonical Baseline: vieworld-demo
  return {
    activeTenantId: 'vieworld-demo',
    demoTime: INITIAL_DEMO_TIME,
    worlds: { ...structuredClone(EXPANDED_WORLDS), ...structuredClone(CANONICAL_WORLDS) },
    avatarAssets: structuredClone(CANONICAL_AVATARS),
    sessions: { ...structuredClone(EXPANDED_SESSIONS), ...structuredClone(CANONICAL_SESSIONS) },
    memberships: structuredClone(CANONICAL_MEMBERSHIPS),
    benefits: structuredClone(CANONICAL_BENEFITS),
    participations: {},
    orders: {},
    supportCases: {},
    fanProfile: structuredClone(DEFAULT_FAN_PROFILE),
    products: { ...structuredClone(EXPANDED_PRODUCTS), ...structuredClone(NEW_MERCH), ...structuredClone(CANONICAL_PRODUCTS) },
    questions: structuredClone(INITIAL_QUESTIONS),
    polls: structuredClone(INITIAL_POLLS),
    capsules: {},
    notifications: structuredClone(INITIAL_NOTIFICATIONS),
    notificationPreferences: structuredClone(DEFAULT_NOTIFICATION_PREFERENCES),
    followedWorldIds: ['artist-a'],
    rsvpdSessionIds: ['session-dropin-01'],
    inLobbySessionIds: [],
    hallMessages: { ...structuredClone(EXPANDED_HALL_MESSAGES), 'artist-a': [] },
  };
}

/**
 * Required Named Scenario Presets (§5.4 & §5 of Implementation Plan)
 */
export const scenarioPresets = {
  /** 1. New Fan: No follows, no memberships, no saved capsules, no orders */
  newFan: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'newFan'),

  /** 2. Casual Fan: Follow 2 artists (Artist B & C), no membership */
  casualFan: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'casualFan'),

  /** 3. Hall Member: Active member of Artist A, Hall-active */
  hallMember: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'hallMember'),
  activeMember: (tenantId: TenantId = 'vieworld-demo'): AppState => createInitialState(tenantId),

  /** 4. Multi-fandom Fan: Follows all 7 worlds */
  multiFandom: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'multiFandom'),

  /** 5. Collector: ~30 owned items, dense room diorama */
  collector: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'collector'),

  /** 6. Long-time Fan: Milestones & capsules across 2024, 2025, 2026 */
  longtimeFan: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'longtimeFan'),

  /** 7. Commerce Fan: Saved products, cart, preorders, digital equipment */
  commerceFan: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'commerceFan'),

  /** 8. Public Voice Fan: Consented + artist-selected message */
  publicVoiceFan: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'publicVoiceFan'),

  /** Room fixtures */
  roomDense: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'roomDense'),
  roomSparse: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'roomSparse'),
  edgeCases: (tenantId: TenantId = 'vieworld-demo'): AppState => applyPersonaToState(createInitialState(tenantId), 'edgeCases'),

  /** Benefit Pending: Membership active but both benefits pending */
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
