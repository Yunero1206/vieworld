/**
 * VieWorld Test Universe Expansion Fixtures & Canonical Data Manifest
 * Corresponds to VieWorld_Test_Universe_Expansion_Implementation_Plan.md
 */

import {
  World,
  Session,
  Product,
  FanProfile,
  ChatMessage,
  Capsule,
  Order,
  Membership,
  AppState,
} from '../domain/types';
import type { PublicVoice } from '../world/exploreDiscovery';
import type { DisplaySlot } from '../world/display';
import type { SurfaceSelection } from '../world/displaySurfaces';

export const CANONICAL_INITIAL_DEMO_TIME = '2026-09-09T13:00:00.000Z'; // 20:00 Asia/Ho_Chi_Minh
export const INITIAL_DEMO_TIME = CANONICAL_INITIAL_DEMO_TIME;

// Deterministic timestamps relative to demo clock
export const TIME_PAST_30D = '2026-08-10T13:00:00.000Z';
export const TIME_PAST_2D = '2026-09-07T13:00:00.000Z';
export const TIME_JUST_ENDED = '2026-09-09T11:00:00.000Z';
export const TIME_NOW = CANONICAL_INITIAL_DEMO_TIME;
export const TIME_PLUS_30M = '2026-09-09T13:30:00.000Z';
export const TIME_PLUS_3H = '2026-09-09T16:00:00.000Z';
export const TIME_PLUS_2D = '2026-09-11T13:00:00.000Z';
export const TIME_PLUS_30D = '2026-10-09T13:00:00.000Z';

/* ==========================================================================
   1. WORLDS & ARTISTS (7 distinct test roles)
   - Artist A: Flagship (live, event, Hall, Archive, Shop)
   - Artist B: Quiet world (minimal activity)
   - Artist C: 2-3 active contexts (active live, upcoming concert, active fan project)
   - Artist D: Thick archive (history 3 years: 2026, 2025, 2024)
   - Artist E: Debut / new artist (sparse archive 1-2 chapters, empty states)
   - Artist MIRA (Role F): Commerce-heavy (multiple product capabilities)
   - Artist KAI (Role G): Event & community-heavy (beat lab, community meetup)
   ========================================================================== */

export const EXPANDED_WORLDS: Record<string, World> = {
  'artist-a': {
    id: 'artist-a',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'Artist A',
    description: 'Thế giới âm nhạc và khoảnh khắc kết nối chân thực của nghệ sĩ hư cấu Artist A (Flagship World).',
    linkedWorldIds: ['neon-sessions', 'artist-mira', 'artist-kai'],
    avatarAssetId: 'avatar-a-v1',
    bannerAssetId: 'asset-world-artist-a-banner',
  },
  'artist-b': {
    id: 'artist-b',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'Artist B',
    description: 'Một nghệ sĩ indie-pop hư cấu với không gian yên tĩnh và những buổi diễn gần gũi (Quiet World).',
    linkedWorldIds: [],
  },
  'artist-c': {
    id: 'artist-c',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'Artist C',
    description: 'Một nghệ sĩ alt-pop hư cấu với sân khấu sắc tím và nhiều hoạt động diễn ra đồng thời (Multi-context World).',
    linkedWorldIds: [],
  },
  'artist-d': {
    id: 'artist-d',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'Artist D',
    description: 'Một nghệ sĩ acoustic hư cấu với kho lưu trữ hành trình 3 năm 2024-2026 (Deep Archive World).',
    linkedWorldIds: [],
  },
  'artist-e': {
    id: 'artist-e',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'Artist E',
    description: 'Nghệ sĩ trẻ vừa ra mắt, với những bản thu đầu tiên và không gian đang hình thành (Debut / Sparse World).',
    linkedWorldIds: [],
  },
  'artist-mira': {
    id: 'artist-mira',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    type: 'artist',
    name: 'MIRA',
    description: 'Không gian Dream Pop & Lofi R&B với bộ sưu tập merch phong phú và nhiều capability (Commerce-heavy World).',
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
    description: 'Sân khấu Future Beats & Cyber-Pop ngập tràn hoạt động cộng đồng và meetup thử thách nhịp (Community-heavy World).',
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
};

/* ==========================================================================
   2. WORLD CONTEXTS / SESSIONS (18 Canonical Sessions across phases)
   Phases: upcoming, active, ended
   Types: live, concert, release, fan_project, drop, community
   ========================================================================== */

export const EXPANDED_SESSIONS: Record<string, Session> = {
  // --- Artist A: Flagship (Live active, upcoming concert, ended session, drop) ---
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
    scheduledStartTime: TIME_NOW,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
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
    scheduledStartTime: TIME_PLUS_2D,
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
    scheduledStartTime: TIME_PAST_30D,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },
  'session-a-album-drop': {
    id: 'session-a-album-drop',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-a',
    title: 'Artist A: Buổi ra mắt Album First Notes & Merch Drop',
    avatarAssetId: 'avatar-a-v1',
    format: 'dropin',
    status: 'scheduled',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'not_planned',
    scheduledStartTime: TIME_PLUS_30M,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },

  // --- Artist B: Quiet World (Intimate past session, no noisy ongoing live) ---
  'session-b-intimate': {
    id: 'session-b-intimate',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-b',
    title: 'Artist B: Buổi diễn mộc bên thềm nhà',
    format: 'concert',
    status: 'ended',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'available',
    scheduledStartTime: TIME_PAST_2D,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },

  // --- Artist C: Multi-Context Stress Test (3 active contexts concurrently) ---
  'session-c-live': {
    id: 'session-c-live',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-c',
    title: 'Artist C: Đêm Ánh Tím Live Studio',
    format: 'dropin',
    status: 'running',
    hostRole: 'artist',
    artistPresence: 'present',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'pending_review',
    scheduledStartTime: TIME_NOW,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },
  'session-c-concert': {
    id: 'session-c-concert',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-c',
    title: 'Artist C: Purple Stage Mini Concert',
    format: 'concert',
    status: 'scheduled',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'not_planned',
    scheduledStartTime: TIME_PLUS_3H,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
    setlist: [
      { order: 1, title: 'Intro: Hoàng Hôn Tím', status: 'upcoming' },
      { order: 2, title: 'Điệp Khúc Giấc Mơ', status: 'upcoming' },
      { order: 3, title: 'Phía Sau Ánh Đèn', status: 'upcoming' },
    ],
  },
  'session-c-fanproject': {
    id: 'session-c-fanproject',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-c',
    title: 'Artist C: Birthday Project 2026 - Cùng chuẩn bị sân khấu',
    format: 'dropin',
    status: 'open',
    hostRole: 'team',
    artistPresence: 'absent',
    segmentMode: 'recorded',
    aiUse: 'none',
    replayStatus: 'not_planned',
    scheduledStartTime: TIME_NOW,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },

  // --- Artist D: Deep Archive World (Spanning 2024, 2025, 2026) ---
  'session-d-2024-debut': {
    id: 'session-d-2024-debut',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-d',
    title: 'Artist D: First Live 2024 - Khởi đầu mộc',
    format: 'concert',
    status: 'ended',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'available',
    scheduledStartTime: '2024-03-15T13:00:00.000Z',
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },
  'session-d-2025-acoustic': {
    id: 'session-d-2025-acoustic',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-d',
    title: 'Artist D: Bangkok Acoustic Tour 2025',
    format: 'concert',
    status: 'ended',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'available',
    scheduledStartTime: '2025-06-20T13:00:00.000Z',
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },
  'session-d-2026-anniversary': {
    id: 'session-d-2026-anniversary',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-d',
    title: 'Artist D: Đêm Nhạc Kỷ Niệm 3 Năm Hành Trình',
    format: 'dropin',
    status: 'ended',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'available',
    scheduledStartTime: TIME_PAST_2D,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },
  'session-d-upcoming': {
    id: 'session-d-upcoming',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-d',
    title: 'Artist D: Sân Khấu Mộc Mùa Thu 2026',
    format: 'concert',
    status: 'scheduled',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'not_planned',
    scheduledStartTime: TIME_PLUS_2D,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },

  // --- Artist E: Debut / Sparse World ---
  'session-e-debut': {
    id: 'session-e-debut',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-e',
    title: 'Artist E: Debut Showcase - Tín Hiệu Đầu Tiên',
    format: 'concert',
    status: 'scheduled',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'not_planned',
    scheduledStartTime: TIME_PLUS_30D,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },

  // --- Artist MIRA (Commerce-heavy) ---
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
    scheduledStartTime: TIME_PLUS_2D,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },
  'session-mira-midnight': {
    id: 'session-mira-midnight',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-mira',
    title: 'MIRA: Midnight Reverie - Listening Party & Merch Drop',
    avatarAssetId: 'avatar-mira-v1',
    format: 'dropin',
    status: 'scheduled',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'not_planned',
    scheduledStartTime: TIME_PLUS_30M,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },

  // --- Artist KAI (Community-heavy) ---
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
    scheduledStartTime: TIME_PLUS_2D,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },
  'session-kai-meetup': {
    id: 'session-kai-meetup',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    worldId: 'artist-kai',
    title: 'KAI: Cyber Community Meetup & Fan Jam Live',
    avatarAssetId: 'avatar-kai-v1',
    format: 'dropin',
    status: 'running',
    hostRole: 'artist',
    artistPresence: 'present',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'pending_review',
    scheduledStartTime: TIME_NOW,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
  },

  // --- Neon Sessions (IP Stage) ---
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
    scheduledStartTime: TIME_PLUS_2D,
    demo: true,
    rightsApproved: true,
    rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
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
};

/* ==========================================================================
   3. PUBLIC FAN VOICES (23 Curated Voices with Consent & Selection)
   Hall messages never leak to Explore unless explicit consent + approved.
   ========================================================================== */

export const EXPANDED_PUBLIC_VOICES: PublicVoice[] = [
  // Artist A
  { id: 'voice-a-1', worldId: 'artist-a', author: '@minh', text: 'Nay nghe setlist vậy chắc tui xỉu mất 😭', selectedBy: 'artist', sourceContextId: 'session-dropin-01', isDemo: true },
  { id: 'voice-a-2', worldId: 'artist-a', author: '@luna', text: 'Ai đi Hà Nội nhớ mang banner và lightstick nha 💙', selectedBy: 'community', sourceContextId: 'session-dropin-01', isDemo: true },
  { id: 'voice-a-3', worldId: 'artist-a', author: '@linh', text: 'Bridge live hôm nay hòa giọng quá đỉnh.', selectedBy: 'community', sourceContextId: 'session-dropin-01', isDemo: true },
  { id: 'voice-a-4', worldId: 'artist-a', author: '@nam_phan', text: 'Chiếc áo Star Club mặc vừa in, sẵn sàng cho tour!', selectedBy: 'artist', sourceContextId: 'session-dropin-01', isDemo: true },

  // Artist B (Quiet)
  { id: 'voice-b-1', worldId: 'artist-b', author: '@nhi', text: 'Đoạn guitar tối qua vẫn ở trong đầu mình thật lâu.', selectedBy: 'community', sourceContextId: 'session-b-intimate', isDemo: true },
  { id: 'voice-b-2', worldId: 'artist-b', author: '@han', text: 'Buổi diễn gần gũi đến lạ, như ngồi hát cùng bạn bè.', selectedBy: 'artist', sourceContextId: 'session-b-intimate', isDemo: true },
  { id: 'voice-b-3', worldId: 'artist-b', author: '@an', text: 'Hẹn gặp nhau ở buổi diễn nhỏ tiếp theo nhé.', selectedBy: 'community', sourceContextId: 'session-b-intimate', isDemo: true },

  // Artist C (Multi-context)
  { id: 'voice-c-1', worldId: 'artist-c', author: '@mi', text: 'Sân khấu tím lần này phối màu nghệ thuật quá.', selectedBy: 'artist', sourceContextId: 'session-c-live', isDemo: true },
  { id: 'voice-c-2', worldId: 'artist-c', author: '@yen', text: 'Điệp khúc bài mới cứ vang mãi trong tâm trí.', selectedBy: 'community', sourceContextId: 'session-c-live', isDemo: true },
  { id: 'voice-c-3', worldId: 'artist-c', author: '@vy', text: 'Đã hoàn thành thiệp cho Birthday Project rồi nè 💜', selectedBy: 'community', sourceContextId: 'project-c-birthday', isDemo: true },

  // Artist D (Archive & Acoustic)
  { id: 'voice-d-1', worldId: 'artist-d', author: '@hoang', text: 'Nhìn lại hành trình từ First Live 2024 đến nay mà rưng rưng.', selectedBy: 'artist', sourceContextId: 'session-d-2026-anniversary', isDemo: true },
  { id: 'voice-d-2', worldId: 'artist-d', author: '@mai_anh', text: 'Tiếng đàn mộc của anh luôn là liều thuốc chữa lành.', selectedBy: 'community', sourceContextId: 'session-d-2026-anniversary', isDemo: true },
  { id: 'voice-d-3', worldId: 'artist-d', author: '@truc_quyen', text: 'Kỷ niệm Bangkok Tour 2025 lưu vào My Space nhìn mãi không chán.', selectedBy: 'community', sourceContextId: 'session-d-2025-acoustic', isDemo: true },

  // Artist E (Debut)
  { id: 'voice-e-1', worldId: 'artist-e', author: '@khanh', text: 'Giai điệu teaser debut nghe bắt tai xỉu, hóng showcase!', selectedBy: 'artist', sourceContextId: 'session-e-debut', isDemo: true },
  { id: 'voice-e-2', worldId: 'artist-e', author: '@thao_nhi', text: 'Tín hiệu đầu tiên siêu tiềm năng, ủng hộ bạn hết mình.', selectedBy: 'community', sourceContextId: 'session-e-debut', isDemo: true },

  // Artist MIRA (Commerce / Dream Pop)
  { id: 'voice-mira-1', worldId: 'artist-mira', author: '@uyen', text: 'Bản Luna nghe như một tối trời dịu hẳn xuống.', selectedBy: 'artist', sourceContextId: 'session-mira-dropin', isDemo: true },
  { id: 'voice-mira-2', worldId: 'artist-mira', author: '@bao', text: 'Hẹn cả nhà trong buổi nghe thử đĩa than nhé 🌙', selectedBy: 'community', sourceContextId: 'session-mira-dropin', isDemo: true },
  { id: 'voice-mira-3', worldId: 'artist-mira', author: '@tram', text: 'Crescent Lightstick lên đèn tím lung linh quá.', selectedBy: 'artist', sourceContextId: 'session-mira-dropin', isDemo: true },
  { id: 'voice-mira-4', worldId: 'artist-mira', author: '@quoc', text: 'Chiếc áo hoodie lavender chất vải sờ êm tay cực kỳ.', selectedBy: 'community', sourceContextId: 'session-mira-dropin', isDemo: true },

  // Artist KAI (Community / Future Beats)
  { id: 'voice-kai-1', worldId: 'artist-kai', author: '@chi', text: 'Đoạn beat mới nghe một lần đã muốn bật nhún nhảy.', selectedBy: 'artist', sourceContextId: 'session-kai-pulse', isDemo: true },
  { id: 'voice-kai-2', worldId: 'artist-kai', author: '@khang', text: 'Ai tới buổi thử nhịp Cyber Jam thì gặp nhau ở hàng đầu!', selectedBy: 'community', sourceContextId: 'session-kai-meetup', isDemo: true },
  { id: 'voice-kai-3', worldId: 'artist-kai', author: '@tuan_anh', text: 'Áo khoác bomber phản quang đi concert đêm là nổi bật nhất.', selectedBy: 'artist', sourceContextId: 'session-kai-meetup', isDemo: true },
  { id: 'voice-kai-4', worldId: 'artist-kai', author: '@duc_phuc', text: 'Tape cassette trong suốt nhìn đậm chất cyberpunk retro.', selectedBy: 'community', sourceContextId: 'session-kai-meetup', isDemo: true },
];

/* ==========================================================================
   4. ARCHIVE CHAPTERS (23 Canonical Chapters)
   Artist D covers 3 years: 2026, 2025, 2024.
   Artist E has sparse 1-2 chapters.
   ========================================================================== */

export interface CanonicalArchiveChapter {
  id: string;
  worldId: string;
  title: string;
  year: number;
  kind: 'Sự kiện' | 'Era' | 'Capsule' | 'Fan project';
  detail: string;
  to?: string;
  demo?: boolean;
}

export const EXPANDED_ARCHIVE_CHAPTERS: CanonicalArchiveChapter[] = [
  // --- Artist D (3 Years History: 2026, 2025, 2024) ---
  { id: 'chapter-d-2026-concert', worldId: 'artist-d', title: 'Concert Mùa Thu 2026', year: 2026, kind: 'Sự kiện', detail: 'Sân khấu acoustic ngoài trời tại Đà Lạt với 1,200 khán giả.', demo: true },
  { id: 'chapter-d-2026-album', worldId: 'artist-d', title: 'Album Era: "Tiếng Gỗ"', year: 2026, kind: 'Era', detail: 'Giai đoạn thu âm mộc mạc không nhạc cụ điện tử.', demo: true },
  { id: 'chapter-d-2026-project', worldId: 'artist-d', title: 'Birthday Project: Rừng Cây Của D', year: 2026, kind: 'Fan project', detail: 'Dự án cộng đồng quyên góp 500 cây xanh mang tên Artist D.', demo: true },
  { id: 'chapter-d-2025-bangkok', worldId: 'artist-d', title: 'Bangkok Acoustic Tour 2025', year: 2025, kind: 'Sự kiện', detail: 'Chuỗi đêm nhạc ấm áp tại Thái Lan cùng cộng đồng indie.', demo: true },
  { id: 'chapter-d-2025-fanmeet', worldId: 'artist-d', title: 'Fan Meeting Sài Gòn: Trà & Guitar', year: 2025, kind: 'Sự kiện', detail: 'Buổi gặp gỡ 150 bạn fan gắn bó từ những ngày đầu.', demo: true },
  { id: 'chapter-d-2025-daily', worldId: 'artist-d', title: 'Những Ngày Thường Bên Guitar', year: 2025, kind: 'Capsule', detail: 'Ghi chú âm nhạc và những bản nháp acoustic ngẫu hứng.', demo: true },
  { id: 'chapter-d-2024-debut', worldId: 'artist-d', title: 'Debut Era: Những Nốt Nhạc Đầu Tiên', year: 2024, kind: 'Era', detail: 'Khởi đầu hành trình âm nhạc của Artist D.', demo: true },
  { id: 'chapter-d-2024-firstlive', worldId: 'artist-d', title: 'First Live House 2024', year: 2024, kind: 'Sự kiện', detail: 'Đêm diễn live đầu tiên trước 80 khán giả thân thiết.', demo: true },

  // --- Artist E (Sparse Archive: 2 chapters only) ---
  { id: 'chapter-e-2026-debut', worldId: 'artist-e', title: 'Debut Era: Tín Hiệu Đầu Tiên', year: 2026, kind: 'Era', detail: 'Chương mở màn cho hành trình ra mắt của Artist E.', demo: true },
  { id: 'chapter-e-2026-practice', worldId: 'artist-e', title: 'Nhật Ký Phòng Tập Mùa Hè', year: 2026, kind: 'Capsule', detail: 'Những buổi tập luyện miệt mài trước thềm showcase.', demo: true },

  // --- Artist A (Flagship Archive) ---
  { id: 'chapter-a-2026-hanoi', worldId: 'artist-a', title: 'Concert Hà Nội 2026', year: 2026, kind: 'Sự kiện', detail: 'Đêm nhạc sân vận động bùng nổ cùng hàng ngàn lightstick xanh.', demo: true },
  { id: 'chapter-a-2026-neon', worldId: 'artist-a', title: 'Neon Sessions Season 1', year: 2026, kind: 'Era', detail: 'Chuỗi phòng thu thử nghiệm âm hưởng thành phố về đêm.', demo: true },
  { id: 'chapter-a-2025-bangkok', worldId: 'artist-a', title: 'Bangkok Tour 2025', year: 2025, kind: 'Sự kiện', detail: 'Hành trình lưu diễn quốc tế đầu tiên của Artist A.', demo: true },
  { id: 'chapter-a-2024-firstlive', worldId: 'artist-a', title: 'Buổi Diễn Đầu Tiên 2024', year: 2024, kind: 'Era', detail: 'Chương mở đầu đáng nhớ của cộng đồng fan Artist A.', demo: true },

  // --- Artist C (Multi-context) ---
  { id: 'chapter-c-2026-purple', worldId: 'artist-c', title: 'Đêm Ánh Tím Live 2026', year: 2026, kind: 'Sự kiện', detail: 'Không gian visual tím neon cùng các bản alt-pop độc đáo.', demo: true },
  { id: 'chapter-c-2026-birthday', worldId: 'artist-c', title: 'Birthday Project: Tím Mộng Mơ', year: 2026, kind: 'Fan project', detail: 'Cộng đồng fan cùng chuẩn bị lời chúc sinh nhật ý nghĩa.', demo: true },
  { id: 'chapter-c-2025-horizon', worldId: 'artist-c', title: 'Purple Horizon Tour 2025', year: 2025, kind: 'Era', detail: 'Hành trình định hình phong cách biểu diễn sắc tím.', demo: true },

  // --- Artist MIRA (Commerce / Dream Pop) ---
  { id: 'chapter-mira-2026-midnight', worldId: 'artist-mira', title: 'Midnight Reverie Era', year: 2026, kind: 'Era', detail: 'Album đầu tay và bộ sưu tập đĩa than giới hạn.', demo: true },
  { id: 'chapter-mira-2026-luna', worldId: 'artist-mira', title: 'Luna Listening Tea 2026', year: 2026, kind: 'Sự kiện', detail: 'Giờ trà lofi ngắm trăng cùng những bản thảo mộng mơ.', demo: true },
  { id: 'chapter-mira-2025-prelude', worldId: 'artist-mira', title: 'Dream Pop Prelude 2025', year: 2025, kind: 'Capsule', detail: 'Những bản thu demo đầu tiên dưới ánh trăng.', demo: true },

  // --- Artist KAI (Community / Cyber Beats) ---
  { id: 'chapter-kai-2026-pulse', worldId: 'artist-kai', title: 'Pulse Wave Tour 2026', year: 2026, kind: 'Sự kiện', detail: 'Sân khấu điện tử neon cùng dàn equalizer bùng nổ.', demo: true },
  { id: 'chapter-kai-2026-cyber', worldId: 'artist-kai', title: 'Future Beats Showcase', year: 2026, kind: 'Era', detail: 'Tuyển tập synth-wave và cassette tape giới hạn.', demo: true },
  { id: 'chapter-kai-2025-streets', worldId: 'artist-kai', title: 'Cyber Streets Jam 2025', year: 2025, kind: 'Fan project', detail: 'Buổi jam ngẫu hứng cùng các bạn trẻ yêu beatbox và DJ.', demo: true },
];

/* ==========================================================================
   5. EXTENDED MERCHANDISE / PRODUCTS (42 canonical records with explicit capabilities)
   Capabilities: avatar only, room only, both, none
   Statuses: available, preorder, limited, sold_out, concept, membership
   ========================================================================== */

export const EXPANDED_PRODUCTS: Record<string, Product> = {
  // --- Artist C: Alt-pop items ---
  'product-c-poster-real': {
    id: 'product-c-poster-real',
    familyId: 'c-poster',
    tenantId: 'vieworld-demo',
    worldId: 'artist-c',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Poster Đêm Ánh Tím Artist C',
    priceVND: 180000,
    stockCount: 45,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'ticket-digital',
    roomAsset: '/images/world-v6/shirt-cutout.webp',
    roomSurface: 'ticket',
    previewCapabilities: { avatar: false, room: true },
    description: 'Poster mỹ thuật in tráng kim loại khổ A2 mang sắc tím neon huyền ảo của Artist C.',
    includes: ['1 poster A2 tráng kim loại', 'Ống bảo quản chống gãy gập'],
  },
  'product-c-photocard-real': {
    id: 'product-c-photocard-real',
    familyId: 'c-photocard',
    tenantId: 'vieworld-demo',
    worldId: 'artist-c',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Bộ Photocard Hologram Artist C (Hà Nội & Sài Gòn)',
    priceVND: 120000,
    stockCount: 60,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'ticket-digital',
    previewCapabilities: { avatar: false, room: false },
    description: 'Set 5 photocard hologram hiệu ứng cầu vồng ghi lại khoảnh khắc biểu diễn tại Hà Nội và Sài Gòn.',
    includes: ['5 photocard hologram cán mờ', 'Bao bì bảo vệ PVC'],
  },
  'product-c-lightstick-real': {
    id: 'product-c-lightstick-real',
    familyId: 'c-lightstick',
    tenantId: 'vieworld-demo',
    worldId: 'artist-c',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Lightstick Tím Neon C · Purple Beam',
    priceVND: 650000,
    stockCount: 20,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'pre_order',
    batchLabel: 'Pre-order',
    image: 'lightstick-physical',
    roomSurface: 'lightstick',
    previewCapabilities: { avatar: false, room: true },
    description: 'Lightstick chính thức của Artist C phát ánh sáng tím ultraviolet đồng bộ cùng sân khấu.',
    includes: ['1 gậy cổ vũ Purple Beam', 'Dây đeo và hộp đựng'],
  },
  'product-c-lightstick-digital': {
    id: 'product-c-lightstick-digital',
    familyId: 'c-lightstick',
    tenantId: 'vieworld-demo',
    worldId: 'artist-c',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Lightstick Tím Neon C · Digital Edition',
    priceVND: 49000,
    stockCount: 999,
    isAvailable: true,
    category: 'merch',
    delivery: 'digital',
    kind: 'digital',
    releaseType: 'in_stock',
    batchLabel: 'Digital',
    image: 'lightstick-digital',
    digitalSlot: 'lightstick',
    digitalItemId: 'c-lightstick-digital',
    previewCapabilities: { avatar: true, room: false },
    description: 'Vật phẩm cầm tay phát sáng tím neon cho avatar VieWorld trong các buổi biểu diễn trực tuyến.',
    includes: ['1 lightstick tím cho avatar VieWorld'],
  },

  // --- Artist D: Acoustic & Songbook items ---
  'product-d-songbook-real': {
    id: 'product-d-songbook-real',
    familyId: 'd-songbook',
    tenantId: 'vieworld-demo',
    worldId: 'artist-d',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Sách Nhạc Acoustic & Hợp Âm Artist D',
    priceVND: 220000,
    stockCount: 35,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'cd-physical',
    roomSurface: 'disc',
    previewCapabilities: { avatar: false, room: true },
    description: 'Tuyển tập 20 bản nhạc mộc kèm ký âm và lời nhắn của Artist D gửi gắm người yêu guitar.',
    includes: ['1 sách nhạc bìa kraft 80 trang', 'Mã nghe thử trực tuyến các bản nháp'],
  },
  'product-d-pick-real': {
    id: 'product-d-pick-real',
    familyId: 'd-pick',
    tenantId: 'vieworld-demo',
    worldId: 'artist-d',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Bộ 3 Phím Gảy Guitar Gỗ Mun Artist D',
    priceVND: 95000,
    stockCount: 50,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'cap-physical',
    roomSurface: 'disc',
    previewCapabilities: { avatar: false, room: true },
    description: 'Phím gảy đàn chế tác thủ công từ gỗ mun tự nhiên khắc logo kỷ niệm 3 năm của Artist D.',
    includes: ['3 phím gảy gỗ mun độ dày khác nhau', 'Túi vải canvas nhỏ'],
  },
  'product-d-tote-real': {
    id: 'product-d-tote-real',
    familyId: 'd-tote',
    tenantId: 'vieworld-demo',
    worldId: 'artist-d',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Túi Canvas Mộc "Những Ngày Thường" Artist D',
    priceVND: 160000,
    stockCount: 40,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'shirt-physical',
    previewCapabilities: { avatar: false, room: false },
    description: 'Túi tote vải bố mộc mạc màu ngà voi, quai đeo chắc chắn phù hợp đựng sách và máy nghe nhạc.',
    includes: ['1 túi canvas 38x42cm có khóa kéo'],
  },

  // --- Artist E: Debut Concept & Preorder Items ---
  'product-e-concept-preview': {
    id: 'product-e-concept-preview',
    familyId: 'e-concept',
    tenantId: 'vieworld-demo',
    worldId: 'artist-e',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Concept Card Debut Artist E · Tín Hiệu Mới',
    priceVND: 0,
    stockCount: 0,
    isAvailable: false,
    category: 'merch',
    delivery: 'digital',
    kind: 'digital',
    releaseType: 'in_stock',
    batchLabel: 'Concept',
    previewOnly: true,
    image: 'ticket-digital',
    previewCapabilities: { avatar: false, room: false },
    description: 'Thiết kế thẻ ý tưởng mở màn cho thế giới của Artist E. Bản xem trước, chưa phát hành thương mại.',
    includes: ['Bản mẫu thiết kế số · Chưa mở bán'],
  },
  'product-e-ticket-preview': {
    id: 'product-e-ticket-preview',
    familyId: 'e-ticket',
    tenantId: 'vieworld-demo',
    worldId: 'artist-e',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Vé Mời Showcase Ra Mắt Artist E (Demo)',
    priceVND: 0,
    stockCount: 0,
    isAvailable: false,
    category: 'ticket',
    delivery: 'digital',
    kind: 'digital',
    releaseType: 'in_stock',
    batchLabel: 'Event',
    previewOnly: true,
    image: 'ticket-digital',
    previewCapabilities: { avatar: false, room: false },
    description: 'Vé mời thử nghiệm cho đêm ra mắt đầu tiên. Hệ thống sẽ mở đăng ký khi ngày biểu diễn được xác nhận.',
    includes: ['Vé mẫu kỹ thuật số · Chưa mở đăng ký'],
  },

  // --- Artist MIRA / Role F: Additional Commerce capabilities ---
  'product-mira-tea-cup-real': {
    id: 'product-mira-tea-cup-real',
    familyId: 'mira-cup',
    tenantId: 'vieworld-demo',
    worldId: 'artist-mira',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Cốc Gốm Sứ Luna MIRA · Midnight Tea',
    priceVND: 210000,
    stockCount: 30,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'cd-physical',
    roomSurface: 'achievement',
    previewCapabilities: { avatar: false, room: true },
    description: 'Cốc gốm men mờ màu tím khói in họa tiết trăng khuyết và những tầng mây của MIRA.',
    includes: ['1 cốc gốm dung tích 350ml', 'Đế lót ly bằng gỗ bần'],
  },
  'product-mira-polaroid-real': {
    id: 'product-mira-polaroid-real',
    familyId: 'mira-polaroid',
    tenantId: 'vieworld-demo',
    worldId: 'artist-mira',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Bộ Ảnh Polaroid Giới Hạn MIRA "Under Moonlight"',
    priceVND: 175000,
    stockCount: 15,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Limited',
    image: 'ticket-digital',
    roomSurface: 'ticket',
    previewCapabilities: { avatar: false, room: true },
    description: 'Bộ 6 ảnh phong cách polaroid ghi lại khoảnh khắc buổi ghi hình album Midnight Reverie.',
    includes: ['6 ảnh polaroid viền tím', 'Kẹp gỗ và dây gai treo trang trí'],
  },
  'product-mira-digital-companion': {
    id: 'product-mira-digital-companion',
    familyId: 'mira-companion',
    tenantId: 'vieworld-demo',
    worldId: 'artist-mira',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Băng Đô Ánh Trăng MIRA · Digital Companion',
    priceVND: 35000,
    stockCount: 999,
    isAvailable: true,
    category: 'merch',
    delivery: 'digital',
    kind: 'digital',
    releaseType: 'in_stock',
    batchLabel: 'Digital',
    image: 'cap-digital',
    digitalSlot: 'hat',
    digitalItemId: 'mira-moon-headband',
    previewCapabilities: { avatar: true, room: false },
    description: 'Phụ kiện băng đô cài tóc hình vầng trăng bạc phát sáng dịu nhẹ cho avatar trong My Space.',
    includes: ['1 băng đô cài tóc cho avatar VieWorld'],
  },

  // --- Artist KAI / Role G: Community & Cyber items ---
  'product-kai-keychain-real': {
    id: 'product-kai-keychain-real',
    familyId: 'kai-keychain',
    tenantId: 'vieworld-demo',
    worldId: 'artist-kai',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Móc Khóa Thẻ Đèn Neon KAI Wave Pulse',
    priceVND: 85000,
    stockCount: 65,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'cd-physical',
    roomSurface: 'achievement',
    previewCapabilities: { avatar: false, room: true },
    description: 'Móc khóa chất liệu acrylic phát quang dạ quang màu xanh ngọc cyan lấy cảm hứng từ mạch điện tương lai.',
    includes: ['1 móc khóa acrylic dạ quang', 'Dây móc kim loại chống gỉ'],
  },
  'product-kai-stickers-real': {
    id: 'product-kai-stickers-real',
    familyId: 'kai-stickers',
    tenantId: 'vieworld-demo',
    worldId: 'artist-kai',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Bộ Sticker Hologram Cyberpunk KAI City Pulse',
    priceVND: 65000,
    stockCount: 80,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'ticket-digital',
    previewCapabilities: { avatar: false, room: false },
    description: 'Tuyển tập 12 sticker hologram chống nước dán laptop, bình nước hoặc nón bảo hiểm.',
    includes: ['12 miếng dán hologram chống nước'],
  },

  // --- Artist A: Additional Flagship & Keyword Overlap items ("Hà Nội") ---
  'product-a-hanoi-ticket': {
    id: 'product-a-hanoi-ticket',
    familyId: 'a-hanoi-pass',
    tenantId: 'vieworld-demo',
    worldId: 'artist-a',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Vé Kỷ Niệm Concert Hà Nội · VIP Stage Pass',
    priceVND: 450000,
    stockCount: 25,
    isAvailable: true,
    category: 'ticket',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'VIP Pass',
    image: 'ticket-digital',
    roomSurface: 'ticket',
    previewCapabilities: { avatar: false, room: true },
    description: 'Thẻ vé cứng kỷ niệm đêm diễn Live House tại Hà Nội, dập nổi hologram và số thứ tự kỷ niệm.',
    includes: ['1 thẻ vé cứng kỷ niệm có dây đeo', 'Quyền lưu kỷ niệm số vào My Space'],
  },
  'product-a-hanoi-towel': {
    id: 'product-a-hanoi-towel',
    familyId: 'a-hanoi-towel',
    tenantId: 'vieworld-demo',
    worldId: 'artist-a',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Khăn Cổ Vũ Concert Hà Nội Tour · Star Slogan',
    priceVND: 140000,
    stockCount: 50,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'shirt-physical',
    roomSurface: 'shirt',
    previewCapabilities: { avatar: false, room: true },
    description: 'Khăn slogan dệt sợi microfiber mềm mịn in khẩu hiệu chính thức của đêm diễn tại Hà Nội.',
    includes: ['1 khăn cổ vũ kích thước 20x100cm'],
  },
  'product-a-poster-soldout': {
    id: 'product-a-poster-soldout',
    familyId: 'a-poster-soldout',
    tenantId: 'vieworld-demo',
    worldId: 'artist-a',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Poster Khởi Đầu Tour 2024 (Đợt 2)',
    priceVND: 120000,
    stockCount: 25,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'ticket-digital',
    previewCapabilities: { avatar: false, room: false },
    description: 'Phiên bản poster đợt 2 mở bán thêm cho người hâm mộ sau tour diễn thành công.',
    includes: ['1 poster kích thước A2 kèm ống đựng bảo quản'],
  },
  'product-b-pin-real': {
    id: 'product-b-pin-real',
    familyId: 'b-pin',
    tenantId: 'vieworld-demo',
    worldId: 'artist-b',
    version: 1,
    updatedAt: INITIAL_DEMO_TIME,
    title: 'Huy Hiệu Kim Loại Artist B · Góc Nhỏ Bình Yên',
    priceVND: 110000,
    stockCount: 20,
    isAvailable: true,
    category: 'merch',
    delivery: 'physical',
    kind: 'physical',
    releaseType: 'in_stock',
    batchLabel: 'Sẵn hàng',
    image: 'cap-physical',
    roomSurface: 'achievement',
    previewCapabilities: { avatar: false, room: true },
    description: 'Huy hiệu kim loại men đen tối giản lấy cảm hứng từ những góc phòng trà acoustic của Artist B.',
    includes: ['1 huy hiệu tráng men cao cấp có khóa cài an toàn'],
  },
};

/* ==========================================================================
   6. EXTENDED GUESTBOOK NOTES (15 diverse sticky notes across fans)
   Variations: short, medium, emojis, Vietnamese diacritics, timestamps
   ========================================================================== */

export interface ExtendedStickyNote {
  id: string;
  authorId: string;
  authorName: string;
  avatarPreset?: string;
  text: string;
  sticker?: string;
  color: 'yellow' | 'pink' | 'mint' | 'purple';
  createdAt: string;
  isPinned?: boolean;
}

export const EXPANDED_GUESTBOOK_NOTES: Record<string, ExtendedStickyNote[]> = {
  'fan-linh': [
    {
      id: 'note-linh-1',
      authorId: 'fan-mai',
      authorName: 'Mai Anh',
      text: 'Ghé phòng Linh thấy mâm đĩa than acoustic mê xỉu! Bữa nào hẹn nhau đi Concert Hà Nội nhé!',
      sticker: '🎵 Yêu acoustic',
      color: 'yellow',
      createdAt: 'Hôm qua, 18:24',
      isPinned: true,
    },
    {
      id: 'note-linh-2',
      authorId: 'fan-minh',
      authorName: 'Minh Khang',
      text: 'Phòng decor chiếc áo Star Club siêu hợp tone! Chúc bạn tuần mới vui vẻ và tràn ngập năng lượng 💙',
      sticker: '✨ Phòng xinh xỉu',
      color: 'pink',
      createdAt: '2 ngày trước',
    },
    {
      id: 'note-linh-3',
      authorId: 'fan-hoang',
      authorName: 'Hoàng Nam',
      text: 'Lightstick trên góc ánh sáng phát màu dịu mắt quá bạn ơi.',
      sticker: '🔥 Cháy concert',
      color: 'mint',
      createdAt: '3 ngày trước',
    },
    {
      id: 'note-linh-4',
      authorId: 'fan-vy',
      authorName: 'Thảo Vy',
      text: 'Cậu sưu tầm được vé VIP Hà Nội từ đợt đầu luôn hả? Ngưỡng mộ ghê á! Chúc tình bạn fandom chúng mình mãi bền.',
      sticker: '🌙 Đồng hương Moonie',
      color: 'purple',
      createdAt: 'Tuần trước',
    },
    {
      id: 'note-linh-5',
      authorId: 'fan-hung',
      authorName: 'Quốc Hưng',
      text: 'Góc âm nhạc bày biện có gu lắm nha!',
      sticker: '☕ Chúc ngày an lành',
      color: 'yellow',
      createdAt: '15/08/2026',
    },
  ],
  'fan-mai': [
    {
      id: 'note-mai-1',
      authorId: 'fan-linh',
      authorName: 'Linh Nguyễn',
      text: 'Kệ đĩa First Notes của Mai đỉnh quá! Hôm nay ghé thăm phòng Mai học hỏi decor nè.',
      sticker: '✨ Phòng xinh xỉu',
      color: 'mint',
      createdAt: 'Hôm nay, 14:10',
      isPinned: true,
    },
    {
      id: 'note-mai-2',
      authorId: 'fan-truc',
      authorName: 'Thanh Trúc',
      text: 'Sổ lưu niệm của cậu dày dặn ghê, lưu lại cả tour 2024 luôn!',
      sticker: '🎵 Yêu acoustic',
      color: 'yellow',
      createdAt: 'Hôm qua, 09:15',
    },
    {
      id: 'note-mai-3',
      authorId: 'fan-nam',
      authorName: 'Tuấn Kiệt',
      text: 'Chào bạn, chúc một ngày bình yên bên những giai điệu yêu thích 🌸',
      sticker: '☕ Chúc ngày an lành',
      color: 'pink',
      createdAt: '4 ngày trước',
    },
  ],
  'fan-minh': [
    {
      id: 'note-minh-1',
      authorId: 'fan-mai',
      authorName: 'Mai Anh',
      text: 'Cây Star Light của Khang phát sáng đẹp ghê! Khi nào có concert nhớ rủ nhé!',
      sticker: '🔥 Cháy concert',
      color: 'purple',
      createdAt: '3 ngày trước',
      isPinned: true,
    },
    {
      id: 'note-minh-2',
      authorId: 'fan-linh',
      authorName: 'Linh Nguyễn',
      text: 'Áo Bomber KAI treo ngay giá trang phục nhìn ngầu đét luôn Khang ơi!',
      sticker: '✨ Phòng xinh xỉu',
      color: 'yellow',
      createdAt: '5 ngày trước',
    },
    {
      id: 'note-minh-3',
      authorId: 'fan-quyen',
      authorName: 'Thục Quyên',
      text: 'Băng cassette trong suốt nhìn mê quá, mua ở đợt nào thế bạn?',
      sticker: '🎵 Yêu acoustic',
      color: 'mint',
      createdAt: 'Tuần trước',
    },
  ],
  'fan-collector': [
    {
      id: 'note-col-1',
      authorId: 'fan-linh',
      authorName: 'Linh Nguyễn',
      text: 'Trời ơi cả một bảo tàng fandom trong phòng! Trưng bày kín cả 5 kệ luôn đỉnh quá trời!',
      sticker: '✨ Phòng xinh xỉu',
      color: 'pink',
      createdAt: 'Hôm qua, 20:30',
      isPinned: true,
    },
    {
      id: 'note-col-2',
      authorId: 'fan-mai',
      authorName: 'Mai Anh',
      text: 'Hâm mộ bộ sưu tập vinyl và photobook của bạn từ lâu, hôm nay mới ghé thăm tận mắt.',
      sticker: '🎵 Yêu acoustic',
      color: 'mint',
      createdAt: '2 ngày trước',
    },
    {
      id: 'note-col-3',
      authorId: 'fan-minh',
      authorName: 'Minh Khang',
      text: 'Cách phối đồ cho avatar trên giá áo chất chơi quá bạn ơi 🔥',
      sticker: '🔥 Cháy concert',
      color: 'purple',
      createdAt: '3 ngày trước',
    },
    {
      id: 'note-col-4',
      authorId: 'fan-vy',
      authorName: 'Thảo Vy',
      text: 'Thả tim cho căn phòng ngập tràn tình yêu nghệ thuật này nha!',
      sticker: '☕ Chúc ngày an lành',
      color: 'yellow',
      createdAt: 'Tuần trước',
    },
  ],
};

/* ==========================================================================
   7. 8 KEY FAN PERSONAS & 22 CROWD FIXTURES (~30 Total Fans)
   ========================================================================== */

export interface KeyFanPersonaConfig {
  id: string;
  name: string;
  username: string;
  role: string;
  description: string;
  followedWorldIds: string[];
  memberships: Record<string, Membership>;
  orders: Record<string, Order>;
  capsules: Record<string, Capsule>;
  savedProductIds: string[];
  rsvpdSessionIds: string[];
  displaySurfaces?: Partial<Record<DisplaySlot, SurfaceSelection>>;
}

export const KEY_FAN_PERSONAS: Record<string, KeyFanPersonaConfig> = {
  // 1. New Fan: 0 follows, 0 memberships, 0 items
  'new-fan': {
    id: 'fan-new',
    name: 'Người Mới',
    username: 'fan_newbie',
    role: 'fan',
    description: 'Người dùng vừa tạo tài khoản, chưa theo dõi world hay sở hữu vật phẩm.',
    followedWorldIds: [],
    memberships: {},
    orders: {},
    capsules: {},
    savedProductIds: [],
    rsvpdSessionIds: [],
  },

  // 2. Casual Fan: Follow 2 artists (Artist B & Artist C), no membership
  'casual-fan': {
    id: 'fan-casual',
    name: 'Hoàng Nam',
    username: 'nam_casual',
    role: 'fan',
    description: 'Fan theo dõi 2 nghệ sĩ nhưng chưa đăng ký hội viên.',
    followedWorldIds: ['artist-b', 'artist-c'],
    memberships: {},
    orders: {
      'order-casual-01': {
        id: 'order-casual-01',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: INITIAL_DEMO_TIME,
        fanId: 'fan-casual',
        worldId: 'artist-c',
        productId: 'product-c-poster-real',
        status: 'fulfilled',
        sourceRef: 'VieSHOP-CASUAL',
        requestId: 'req-cas-01',
        fulfilledAt: TIME_PAST_2D,
      },
    },
    capsules: {},
    savedProductIds: ['product-c-lightstick-real'],
    rsvpdSessionIds: ['session-c-concert'],
  },

  // 3. Hall Member: Active member of Artist A, Hall-active
  'hall-member': {
    id: 'fan-linh',
    name: 'Linh Nguyễn',
    username: 'linh_nguyen',
    role: 'fan',
    description: 'Hội viên kỳ cựu của Artist A, tích cực tham gia thảo luận trong Hall.',
    followedWorldIds: ['artist-a'],
    memberships: {
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
    },
    orders: {
      'order-linh-shirt': {
        id: 'order-linh-shirt',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: INITIAL_DEMO_TIME,
        fanId: 'fan-linh',
        worldId: 'artist-a',
        productId: 'product-star-shirt-real',
        status: 'fulfilled',
        sourceRef: 'VieSHOP-LINH',
        requestId: 'req-linh-01',
        fulfilledAt: TIME_PAST_30D,
      },
      'order-linh-pin': {
        id: 'order-linh-pin',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: INITIAL_DEMO_TIME,
        fanId: 'fan-linh',
        worldId: 'artist-a',
        productId: 'product-pin-01',
        status: 'fulfilled',
        sourceRef: 'VieSHOP-LINH',
        requestId: 'req-linh-02',
        fulfilledAt: TIME_PAST_2D,
      },
    },
    capsules: {
      'capsule-linh-01': {
        id: 'capsule-linh-01',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: INITIAL_DEMO_TIME,
        fanId: 'fan-linh',
        worldId: 'artist-a',
        sessionId: 'session-dropin-01',
        participationId: 'part-linh-01',
        isSaved: true,
        explorePublic: true,
      },
    },
    savedProductIds: ['product-cd-real'],
    rsvpdSessionIds: ['session-dropin-01', 'session-house-01'],
  },

  // 4. Multi-fandom Fan: Follows all 7 worlds
  'multi-fandom': {
    id: 'fan-multifandom',
    name: 'Thảo Vy',
    username: 'vy_multifandom',
    role: 'fan',
    description: 'Người yêu âm nhạc theo dõi và tham gia nhiều thế giới khác nhau.',
    followedWorldIds: ['artist-a', 'artist-b', 'artist-c', 'artist-d', 'artist-e', 'artist-mira', 'artist-kai'],
    memberships: {},
    orders: {},
    capsules: {},
    savedProductIds: ['product-star-shirt-real', 'product-mira-hoodie-real', 'product-kai-bomber-real'],
    rsvpdSessionIds: ['session-dropin-01', 'session-c-live', 'session-mira-dropin', 'session-kai-pulse'],
  },

  // 5. Collector: ~30 owned items, room diorama densely placed
  'collector': {
    id: 'fan-collector',
    name: 'Quốc Hưng',
    username: 'hung_collector',
    role: 'fan',
    description: 'Nhà sưu tầm đam mê với hơn 30 vật phẩm và căn phòng trưng bày gần kín.',
    followedWorldIds: ['artist-a', 'artist-mira', 'artist-kai', 'artist-d'],
    memberships: {
      'member-collector-a': {
        id: 'member-collector-a',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: INITIAL_DEMO_TIME,
        fanId: 'fan-collector',
        worldId: 'artist-a',
        status: 'active',
        expiresAt: '2027-12-31T00:00:00.000Z',
      },
    },
    orders: {
      // 12 core orders defined explicitly here for full test coverage
      'col-ord-1': { id: 'col-ord-1', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-a', productId: 'product-star-shirt-real', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-1', fulfilledAt: TIME_PAST_30D },
      'col-ord-2': { id: 'col-ord-2', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-a', productId: 'product-lightstick-real', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-2', fulfilledAt: TIME_PAST_30D },
      'col-ord-3': { id: 'col-ord-3', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-a', productId: 'product-cd-real', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-3', fulfilledAt: TIME_PAST_30D },
      'col-ord-4': { id: 'col-ord-4', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-a', productId: 'product-pin-01', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-4', fulfilledAt: TIME_PAST_30D },
      'col-ord-5': { id: 'col-ord-5', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-mira', productId: 'product-mira-hoodie-real', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-5', fulfilledAt: TIME_PAST_2D },
      'col-ord-6': { id: 'col-ord-6', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-mira', productId: 'product-mira-vinyl-real', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-6', fulfilledAt: TIME_PAST_2D },
      'col-ord-7': { id: 'col-ord-7', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-mira', productId: 'product-mira-lightstick-real', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-7', fulfilledAt: TIME_PAST_2D },
      'col-ord-8': { id: 'col-ord-8', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-kai', productId: 'product-kai-bomber-real', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-8', fulfilledAt: TIME_PAST_2D },
      'col-ord-9': { id: 'col-ord-9', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-kai', productId: 'product-kai-cassette-real', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-9', fulfilledAt: TIME_PAST_2D },
      'col-ord-10': { id: 'col-ord-10', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-c', productId: 'product-c-poster-real', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-10', fulfilledAt: TIME_PAST_2D },
      'col-ord-11': { id: 'col-ord-11', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-d', productId: 'product-d-songbook-real', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-11', fulfilledAt: TIME_PAST_2D },
      'col-ord-12': { id: 'col-ord-12', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-collector', worldId: 'artist-a', productId: 'product-a-hanoi-ticket', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'col-12', fulfilledAt: TIME_PAST_2D },
    },
    capsules: {},
    savedProductIds: [],
    rsvpdSessionIds: [],
    displaySurfaces: {
      shirt: { itemIds: ['product-star-shirt-real', 'product-mira-hoodie-real', 'product-kai-bomber-real'], focalItemId: 'product-star-shirt-real', layoutPreset: 'balanced' },
      ticket: { itemIds: ['product-c-poster-real', 'product-a-hanoi-ticket'], focalItemId: 'product-a-hanoi-ticket', layoutPreset: 'focus' },
      disc: { itemIds: ['product-cd-real', 'product-mira-vinyl-real', 'product-kai-cassette-real', 'product-d-songbook-real'], focalItemId: 'product-mira-vinyl-real', layoutPreset: 'natural' },
      lightstick: { itemIds: ['product-lightstick-real', 'product-mira-lightstick-real'], focalItemId: 'product-lightstick-real', layoutPreset: 'balanced' },
      achievement: { itemIds: ['product-pin-01'], focalItemId: 'product-pin-01', layoutPreset: 'natural' },
    },
  },

  // 6. Long-time Fan: Many memories & milestones across 2024, 2025, 2026
  'long-time-fan': {
    id: 'fan-longtime',
    name: 'Mai Anh',
    username: 'mai_veteran',
    role: 'fan',
    description: 'Người đồng hành lâu năm với các kỷ niệm lưu giữ từ năm 2024 đến nay.',
    followedWorldIds: ['artist-a', 'artist-d'],
    memberships: {
      'member-longtime-a': {
        id: 'member-longtime-a',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: INITIAL_DEMO_TIME,
        fanId: 'fan-longtime',
        worldId: 'artist-a',
        status: 'active',
        expiresAt: '2028-01-01T00:00:00.000Z',
      },
    },
    orders: {
      'order-lt-1': { id: 'order-lt-1', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, fanId: 'fan-longtime', worldId: 'artist-a', productId: 'product-pin-01', status: 'fulfilled', sourceRef: 'VieSHOP', requestId: 'lt-1', fulfilledAt: '2024-04-01T10:00:00Z' },
    },
    capsules: {
      'cap-lt-2024': { id: 'cap-lt-2024', tenantId: 'vieworld-demo', version: 1, updatedAt: '2024-03-15T15:00:00Z', fanId: 'fan-longtime', worldId: 'artist-d', sessionId: 'session-d-2024-debut', participationId: 'p-lt-1', isSaved: true, privateNote: 'Đêm diễn mộc đầu tiên thật nhiều cảm xúc.' },
      'cap-lt-2025': { id: 'cap-lt-2025', tenantId: 'vieworld-demo', version: 1, updatedAt: '2025-06-20T16:00:00Z', fanId: 'fan-longtime', worldId: 'artist-d', sessionId: 'session-d-2025-acoustic', participationId: 'p-lt-2', isSaved: true, privateNote: 'Chuyến lưu diễn Bangkok cùng nhóm bạn thân.' },
      'cap-lt-2026': { id: 'cap-lt-2026', tenantId: 'vieworld-demo', version: 1, updatedAt: TIME_PAST_2D, fanId: 'fan-longtime', worldId: 'artist-a', sessionId: 'session-dropin-01', participationId: 'p-lt-3', isSaved: true, privateNote: 'Gặp lại Artist A trong buổi trò chuyện đầu tuần.' },
    },
    savedProductIds: [],
    rsvpdSessionIds: ['session-house-01'],
  },

  // 7. Commerce Fan: Saved, cart, preorder, fulfilled digital items
  'commerce-fan': {
    id: 'fan-commerce',
    name: 'Minh Khang',
    username: 'khang_commerce',
    role: 'fan',
    description: 'Người dùng yêu thích mua sắm merch, có giỏ hàng sẵn và nhiều đơn đặt trước.',
    followedWorldIds: ['artist-a', 'artist-mira'],
    memberships: {},
    orders: {
      'ord-comm-preorder': {
        id: 'ord-comm-preorder',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: INITIAL_DEMO_TIME,
        fanId: 'fan-commerce',
        worldId: 'artist-a',
        productId: 'product-star-shirt-real',
        status: 'paid',
        sourceRef: 'VieSHOP',
        requestId: 'comm-pre',
        paidAt: TIME_PAST_2D,
      },
      'ord-comm-digital': {
        id: 'ord-comm-digital',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: INITIAL_DEMO_TIME,
        fanId: 'fan-commerce',
        worldId: 'artist-a',
        productId: 'product-star-shirt-digital',
        status: 'fulfilled',
        sourceRef: 'VieSHOP',
        requestId: 'comm-dig',
        fulfilledAt: TIME_PAST_2D,
      },
    },
    capsules: {},
    savedProductIds: ['product-cd-real', 'product-mira-vinyl-real', 'product-mira-lightstick-real'],
    rsvpdSessionIds: [],
  },

  // 8. Public Voice Fan: Consented + artist-selected voice
  'public-voice-fan': {
    id: 'fan-public-voice',
    name: 'Thanh Trúc',
    username: 'truc_voice',
    role: 'fan',
    description: 'Fan có lời nhắn gửi trong Hall được nghệ sĩ tuyển chọn để hiển thị công khai.',
    followedWorldIds: ['artist-a'],
    memberships: {
      'member-truc-a': {
        id: 'member-truc-a',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: INITIAL_DEMO_TIME,
        fanId: 'fan-public-voice',
        worldId: 'artist-a',
        status: 'active',
        expiresAt: '2027-06-01T00:00:00.000Z',
      },
    },
    orders: {},
    capsules: {},
    savedProductIds: [],
    rsvpdSessionIds: ['session-dropin-01'],
  },
};
KEY_FAN_PERSONAS['longtime-fan'] = KEY_FAN_PERSONAS['long-time-fan'];

// 22 Crowd Fans for realistic community density (Total = 8 + 22 = 30)
export const CROWD_FANS: FanProfile[] = [
  { id: 'fan-crowd-01', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'bao_anh', displayName: 'Bảo Anh', role: 'fan' },
  { id: 'fan-crowd-02', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'kim_ngan', displayName: 'Kim Ngân', role: 'fan' },
  { id: 'fan-crowd-03', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'tuan_kiet', displayName: 'Tuấn Kiệt', role: 'fan' },
  { id: 'fan-crowd-04', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'quynh_nhu', displayName: 'Quỳnh Như', role: 'fan' },
  { id: 'fan-crowd-05', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'dang_khoa', displayName: 'Đăng Khoa', role: 'fan' },
  { id: 'fan-crowd-06', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'bich_phuong', displayName: 'Bích Phương', role: 'fan' },
  { id: 'fan-crowd-07', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'nhat_minh', displayName: 'Nhật Minh', role: 'fan' },
  { id: 'fan-crowd-08', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'my_duyen', displayName: 'Mỹ Duyên', role: 'fan' },
  { id: 'fan-crowd-09', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'trong_hieu', displayName: 'Trọng Hiếu', role: 'fan' },
  { id: 'fan-crowd-10', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'thuc_quyen', displayName: 'Thục Quyên', role: 'fan' },
  { id: 'fan-crowd-11', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'duc_phuc', displayName: 'Đức Phúc', role: 'fan' },
  { id: 'fan-crowd-12', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'anh_tuyet', displayName: 'Ánh Tuyết', role: 'fan' },
  { id: 'fan-crowd-13', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'hai_dang', displayName: 'Hải Đăng', role: 'fan' },
  { id: 'fan-crowd-14', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'lan_anh', displayName: 'Lan Anh', role: 'fan' },
  { id: 'fan-crowd-15', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'viet_anh', displayName: 'Việt Anh', role: 'fan' },
  { id: 'fan-crowd-16', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'cam_tu', displayName: 'Cẩm Tú', role: 'fan' },
  { id: 'fan-crowd-17', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'gia_huy', displayName: 'Gia Huy', role: 'fan' },
  { id: 'fan-crowd-18', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'minh_chau', displayName: 'Minh Châu', role: 'fan' },
  { id: 'fan-crowd-19', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'phuong_nam', displayName: 'Phương Nam', role: 'fan' },
  { id: 'fan-crowd-20', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'thuy_tien', displayName: 'Thủy Tiên', role: 'fan' },
  { id: 'fan-crowd-21', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'huu_thang', displayName: 'Hữu Thắng', role: 'fan' },
  { id: 'fan-crowd-22', tenantId: 'vieworld-demo', version: 1, updatedAt: INITIAL_DEMO_TIME, username: 'yen_nhi', displayName: 'Yến Nhi', role: 'fan' },
];

/* ==========================================================================
   8. CANONICAL HALL MESSAGES WITH PRIVACY & CONSENT BOUNDARIES
   Private messages stay inside Hall; consented + approved emerge to PublicFanVoice.
   ========================================================================== */

export const EXPANDED_HALL_MESSAGES: Record<string, ChatMessage[]> = {
  'artist-a': [
    { id: 'msg-a-01', sessionId: 'session-dropin-01', fanId: 'fan-minh', authorName: 'Minh', text: 'Nay nghe setlist Concert Hà Nội vậy chắc tui xỉu mất 😭', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist' },
    { id: 'msg-a-02', sessionId: 'session-dropin-01', fanId: 'fan-mai', authorName: 'Luna', text: 'Ai đi Hà Nội nhớ mang banner và lightstick nha 💙', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
    { id: 'msg-a-03', sessionId: 'session-dropin-01', fanId: 'fan-linh', authorName: 'Linh Nguyễn', text: 'Bridge live hôm nay hòa giọng quá đỉnh.', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
    { id: 'msg-a-04', sessionId: 'session-dropin-01', fanId: 'fan-public-voice', authorName: 'Thanh Trúc', text: 'Chiếc áo Star Club mặc vừa in, sẵn sàng cho tour!', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist' },
    { id: 'msg-a-private-1', sessionId: 'hall-artist-a', fanId: 'fan-linh', authorName: 'Linh Nguyễn', text: 'Mọi người cho mình hỏi quà tặng offline nhận ở cổng nào vậy?', timestamp: TIME_NOW, explorePreviewConsent: false },
    { id: 'msg-a-private-2', sessionId: 'hall-artist-a', fanId: 'fan-minh', authorName: 'Minh Khang', text: 'Cổng B2 nhé bạn ơi, có banner hướng dẫn to lắm.', timestamp: TIME_NOW, explorePreviewConsent: false },
    { id: 'msg-a-reported-1', sessionId: 'hall-artist-a', fanId: 'fan-crowd-01', authorName: 'Spam Bot', text: 'Mua bán vé giá rẻ inbox ngay!', timestamp: TIME_NOW, isReported: true, reportRef: 'REP-001' },
  ],
  'artist-b': [
    { id: 'msg-b-01', sessionId: 'hall-artist-b', fanId: 'fan-crowd-02', authorName: 'Nhi', text: 'Đoạn guitar tối qua vẫn ở trong đầu mình thật lâu.', timestamp: TIME_PAST_2D, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
    { id: 'msg-b-02', sessionId: 'hall-artist-b', fanId: 'fan-crowd-03', authorName: 'Hân', text: 'Buổi diễn gần gũi đến lạ, như ngồi hát cùng bạn bè.', timestamp: TIME_PAST_2D, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist' },
    { id: 'msg-b-03', sessionId: 'hall-artist-b', fanId: 'fan-crowd-04', authorName: 'An', text: 'Hẹn gặp nhau ở buổi diễn nhỏ tiếp theo nhé.', timestamp: TIME_PAST_2D, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
    { id: 'msg-b-private', sessionId: 'hall-artist-b', fanId: 'fan-casual', authorName: 'Hoàng Nam', text: 'Thích không gian phòng trà hôm nọ ghê.', timestamp: TIME_PAST_2D, explorePreviewConsent: false },
  ],
  'artist-c': [
    { id: 'msg-c-01', sessionId: 'session-c-live', fanId: 'fan-crowd-05', authorName: 'Mi', text: 'Sân khấu tím lần này phối màu nghệ thuật quá.', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist' },
    { id: 'msg-c-02', sessionId: 'session-c-live', fanId: 'fan-crowd-06', authorName: 'Yến', text: 'Điệp khúc bài mới cứ vang mãi trong tâm trí.', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
    { id: 'msg-c-03', sessionId: 'project-c-birthday', fanId: 'fan-multifandom', authorName: 'Vy', text: 'Đã hoàn thành thiệp cho Birthday Project rồi nè 💜', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
    { id: 'msg-c-private', sessionId: 'session-c-live', fanId: 'fan-casual', authorName: 'Hoàng Nam', text: 'Có ai còn dư vé Purple Stage không ạ?', timestamp: TIME_NOW, explorePreviewConsent: false },
  ],
  'artist-d': [
    { id: 'msg-d-01', sessionId: 'hall-artist-d', fanId: 'fan-crowd-07', authorName: 'Hoàng', text: 'Nhìn lại hành trình từ First Live 2024 đến nay mà rưng rưng.', timestamp: TIME_PAST_2D, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist' },
    { id: 'msg-d-02', sessionId: 'hall-artist-d', fanId: 'fan-longtime', authorName: 'Mai Anh', text: 'Tiếng đàn mộc của anh luôn là liều thuốc chữa lành.', timestamp: TIME_PAST_2D, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
    { id: 'msg-d-03', sessionId: 'hall-artist-d', fanId: 'fan-crowd-08', authorName: 'Trúc Quyên', text: 'Kỷ niệm Bangkok Tour 2025 lưu vào My Space nhìn mãi không chán.', timestamp: TIME_PAST_2D, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
  ],
  'artist-e': [
    { id: 'msg-e-01', sessionId: 'hall-artist-e', fanId: 'fan-crowd-09', authorName: 'Khánh', text: 'Giai điệu teaser debut nghe bắt tai xỉu, hóng showcase!', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist' },
    { id: 'msg-e-02', sessionId: 'hall-artist-e', fanId: 'fan-crowd-10', authorName: 'Thảo Nhi', text: 'Tín hiệu đầu tiên siêu tiềm năng, ủng hộ bạn hết mình.', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
  ],
  'artist-mira': [
    { id: 'msg-mira-01', sessionId: 'session-mira-dropin', fanId: 'fan-crowd-11', authorName: 'Uyên', text: 'Bản Luna nghe như một tối trời dịu hẳn xuống.', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist' },
    { id: 'msg-mira-02', sessionId: 'session-mira-dropin', fanId: 'fan-crowd-12', authorName: 'Bảo', text: 'Hẹn cả nhà trong buổi nghe thử đĩa than nhé 🌙', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
    { id: 'msg-mira-03', sessionId: 'session-mira-dropin', fanId: 'fan-crowd-13', authorName: 'Trâm', text: 'Crescent Lightstick lên đèn tím lung linh quá.', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist' },
    { id: 'msg-mira-04', sessionId: 'session-mira-dropin', fanId: 'fan-collector', authorName: 'Quốc Hưng', text: 'Chiếc áo hoodie lavender chất vải sờ êm tay cực kỳ.', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
  ],
  'artist-kai': [
    { id: 'msg-kai-01', sessionId: 'session-kai-pulse', fanId: 'fan-crowd-14', authorName: 'Chi', text: 'Đoạn beat mới nghe một lần đã muốn bật nhún nhảy.', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist' },
    { id: 'msg-kai-02', sessionId: 'session-kai-meetup', fanId: 'fan-minh', authorName: 'Khang', text: 'Ai tới buổi thử nhịp Cyber Jam thì gặp nhau ở hàng đầu!', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
    { id: 'msg-kai-03', sessionId: 'session-kai-meetup', fanId: 'fan-crowd-15', authorName: 'Tuấn Anh', text: 'Áo khoác bomber phản quang đi concert đêm là nổi bật nhất.', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist' },
    { id: 'msg-kai-04', sessionId: 'session-kai-meetup', fanId: 'fan-crowd-16', authorName: 'Đức Phúc', text: 'Tape cassette trong suốt nhìn đậm chất cyberpunk retro.', timestamp: TIME_NOW, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'community' },
  ],
};

/**
 * Applies a key fan persona or edge scenario preset to an AppState.
 */
export function applyPersonaToState(base: AppState, presetKey: string): AppState {
  const normalizedKey = presetKey
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

  const fanId = base.fanProfile.id; // canonical fanId (e.g. 'fan-linh') for storage key consistency

  if (normalizedKey === 'new-fan') {
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
      notifications: {},
      fanProfile: {
        ...base.fanProfile,
        displayName: 'Người Mới',
        username: 'fan_newbie',
        savedProductIds: [],
      },
    };
  }

  const persona = KEY_FAN_PERSONAS[normalizedKey];
  if (persona) {
    const mappedMemberships = Object.fromEntries(
      Object.entries(persona.memberships).map(([k, m]) => [k, { ...m, fanId }])
    );
    const mappedOrders = Object.fromEntries(
      Object.entries(persona.orders).map(([k, o]) => [k, { ...o, fanId }])
    );
    const mappedCapsules = Object.fromEntries(
      Object.entries(persona.capsules).map(([k, c]) => [k, { ...c, fanId }])
    );

    return {
      ...base,
      fanProfile: {
        ...base.fanProfile,
        displayName: persona.name,
        username: persona.username,
        displaySurfaces: persona.displaySurfaces || base.fanProfile.displaySurfaces,
        savedProductIds: persona.savedProductIds,
      },
      followedWorldIds: persona.followedWorldIds,
      memberships: mappedMemberships,
      orders: mappedOrders,
      capsules: mappedCapsules,
      rsvpdSessionIds: persona.rsvpdSessionIds,
      hallMessages: normalizedKey === 'hall-member' ? structuredClone(EXPANDED_HALL_MESSAGES) : base.hallMessages,
    };
  }

  // Edge cases scenario
  if (normalizedKey === 'edge-cases') {
    return {
      ...base,
      followedWorldIds: ['artist-b', 'artist-e'], // quiet + debut artists
      orders: {},
      capsules: {},
      memberships: {},
      rsvpdSessionIds: [],
    };
  }

  return base;
}

