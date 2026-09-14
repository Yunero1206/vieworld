/**
 * VieWorld Artist & Event Chat Metadata (§5.1, §5.4 & Fandom Personalization)
 * Provides dynamic, authentic fandom data (loyalty days, milestones, viewer counts,
 * signature fandom perks/cues, polls, and seed chats) per artist and per event.
 */

import { CallSampleCue, ChatMessage, Poll, Session } from '../domain/types';

export interface ArtistFandomMeta {
  artistId: string;
  artistName: string;
  fandomName: string;
  companionDays: number;
  companionDate: string;
  fandomMilestones: string[];
  signatureLightstick: {
    name: string;
    color: string;
    gradient: string;
  };
  signatureFanchant: string;
  defaultViewerCount: string;
}

export const ARTIST_FANDOM_REGISTRY: Record<string, ArtistFandomMeta> = {
  'artist-a': {
    artistId: 'artist-a',
    artistName: 'Artist A',
    fandomName: 'V-Stars',
    companionDays: 128,
    companionDate: 'tháng 5/2026',
    fandomMilestones: [
      'Tham dự 4 phiên diễn trực tiếp',
      'Lưu giữ 2 capsule khoảnh khắc',
      'Thành viên Fandom chính thức (Star Badge)',
    ],
    signatureLightstick: {
      name: 'Lightstick Sao Xanh',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    },
    signatureFanchant: 'VI-E-WORLD!',
    defaultViewerCount: '2.1K',
  },
  'artist-mira': {
    artistId: 'artist-mira',
    artistName: 'MIRA',
    fandomName: 'Moonies',
    companionDays: 210,
    companionDate: 'tháng 2/2026',
    fandomMilestones: [
      'Tham dự 7 đêm nhạc Dream Pop & Lofi',
      'Lưu giữ 4 capsule Ánh Trăng Luna',
      'Hội viên Moonies Hoàng Kim (Luna Pass)',
    ],
    signatureLightstick: {
      name: 'Lightstick Ánh Trăng Tím',
      color: '#A855F7',
      gradient: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
    },
    signatureFanchant: 'MIRA IN THE MOONLIGHT! 🌙',
    defaultViewerCount: '4.2K',
  },
  'artist-kai': {
    artistId: 'artist-kai',
    artistName: 'KAI',
    fandomName: 'Pulse Crew',
    companionDays: 85,
    companionDate: 'tháng 6/2026',
    fandomMilestones: [
      'Tham dự 3 phiên Beat Laboratory & EDM',
      'Sở hữu huy hiệu Cyber Pulse độc quyền',
      'Thành viên Pulse Crew Đột Phá',
    ],
    signatureLightstick: {
      name: 'Lightstick Cyber Pulse',
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    },
    signatureFanchant: 'KAI PULSE DROP THE BEAT! ⚡',
    defaultViewerCount: '2.7K',
  },
  'neon-sessions': {
    artistId: 'neon-sessions',
    artistName: 'Neon Sessions',
    fandomName: 'Night Owls',
    companionDays: 64,
    companionDate: 'tháng 7/2026',
    fandomMilestones: [
      'Lắng nghe 5 bản thu phòng thu đặc biệt',
      'Sưu tầm trọn bộ đĩa than Neon Prelude',
      'Khách quen thính phòng đêm muộn',
    ],
    signatureLightstick: {
      name: 'Lightstick Đèn Neon',
      color: '#06B6D4',
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    },
    signatureFanchant: 'NEON NIGHTS LIVE!',
    defaultViewerCount: '1.4K',
  },
  'world-mfan-artist-m': {
    artistId: 'world-mfan-artist-m',
    artistName: 'Artist M',
    fandomName: 'MFan Club',
    companionDays: 52,
    companionDate: 'tháng 8/2026',
    fandomMilestones: [
      'Giao lưu trực tuyến cùng Artist M trên MFan',
      'Sở hữu vé tham dự MFan Priority Pass',
      'Hội viên đối tác MFan chính thức',
    ],
    signatureLightstick: {
      name: 'Lightstick MFan Glow',
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    },
    signatureFanchant: 'MFAN STAND UP!',
    defaultViewerCount: '1.2K',
  },
};

export const SESSION_TO_ARTIST: Record<string, string> = {
  'session-dropin-01': 'artist-a',
  'session-house-01': 'artist-a',
  'session-expired-01': 'artist-a',
  'session-mira-dropin': 'artist-mira',
  'session-kai-pulse': 'artist-kai',
  'session-listen-01': 'neon-sessions',
  'session-mfan-01': 'world-mfan-artist-m',
};

export interface SessionChatMeta {
  viewerCount: string;
  cues: CallSampleCue[];
  initialMessages: ChatMessage[];
  poll: Poll;
}

export const SESSION_CHAT_REGISTRY: Record<string, SessionChatMeta> = {
  'session-dropin-01': {
    viewerCount: '2.1K',
    cues: [
      {
        id: 'cue-01',
        cueText: 'VI-E-WORLD!',
        prompt: 'Đồng thanh hô vang fanchant chính thức hòa nhịp ca khúc!',
        actionLabel: 'Hô vang: VIEWORLD',
      },
      {
        id: 'cue-02',
        cueText: 'ĐIỆP KHÚC!',
        prompt: 'Hòa giọng và gửi lời chúc đính kèm Star Badge độc quyền!',
        actionLabel: 'Lời nhắn ngôi sao',
      },
      {
        id: 'cue-03',
        cueText: 'LIGHTSTICK XANH!',
        prompt: 'Bật và vẫy lightstick ảo tạo biển ánh sáng tiếp sức idol!',
        actionLabel: 'Vẫy lightstick ảo',
      },
    ],
    initialMessages: [
      {
        id: 'msg-seed-1',
        sessionId: 'session-dropin-01',
        fanId: 'fan-linh',
        authorName: 'Linh Nguyễn',
        text: 'Chào cả nhà, sân khấu tối nay thật tuyệt vời!',
        timestamp: '2026-09-09T20:01:00Z',
        isSample: true,
      },
      {
        id: 'msg-seed-2',
        sessionId: 'session-dropin-01',
        fanId: 'fan-minh',
        authorName: 'Minh Tuấn',
        text: 'Âm thanh nghe rất trong trẻo và ấm áp.',
        timestamp: '2026-09-09T20:02:00Z',
        isSample: true,
      },
      {
        id: 'msg-seed-3',
        sessionId: 'session-dropin-01',
        fanId: 'fan-an',
        authorName: 'Hà An',
        text: 'Ủng hộ dự án VieWorld độc lập!',
        timestamp: '2026-09-09T20:03:00Z',
        isSample: true,
      },
      {
        id: 'msg-seed-4',
        sessionId: 'session-dropin-01',
        fanId: 'fan-long',
        authorName: 'Hoàng Long',
        text: 'Hóng bài hát tiếp theo trong setlist quá idol ơi!',
        timestamp: '2026-09-09T20:04:00Z',
        isSample: true,
      },
    ],
    poll: {
      id: 'poll-01',
      tenantId: 'vieworld-demo',
      version: 1,
      updatedAt: '2026-09-09T20:00:00Z',
      sessionId: 'session-dropin-01',
      prompt: 'Bạn muốn nghe thêm ca khúc nào trong buổi giao lưu tối nay?',
      options: [
        { id: 'opt-1', text: 'Vệt Sáng Đêm', votes: 142 },
        { id: 'opt-2', text: 'Nhịp Điệu Kỷ Niệm', votes: 89 },
        { id: 'opt-3', text: 'Bản phối mới chưa ra mắt', votes: 215 },
      ],
      status: 'open',
    },
  },
  'session-house-01': {
    viewerCount: '3.8K',
    cues: [
      {
        id: 'cue-01',
        cueText: 'VI-E-WORLD!',
        prompt: 'Hô vang tên cộng đồng cùng nghệ sĩ tại nhịp dạo đầu Live House!',
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
    initialMessages: [
      {
        id: 'msg-h1',
        sessionId: 'session-house-01',
        fanId: 'fan-linh',
        authorName: 'Linh Nguyễn',
        text: 'Sân khấu Live House hoành tráng quá!',
        timestamp: '2026-09-12T13:01:00Z',
        isSample: true,
      },
      {
        id: 'msg-h2',
        sessionId: 'session-house-01',
        fanId: 'fan-bao',
        authorName: 'Quốc Bảo',
        text: 'Đoạn solo guitar nãy đỉnh chóp luôn cả nhà!',
        timestamp: '2026-09-12T13:02:00Z',
        isSample: true,
      },
      {
        id: 'msg-h3',
        sessionId: 'session-house-01',
        fanId: 'fan-uyen',
        authorName: 'Thu Uyên',
        text: 'Vẫy lightstick xanh tiếp sức cho idol nào mọi người ơi! 🌟',
        timestamp: '2026-09-12T13:03:00Z',
        isSample: true,
      },
      {
        id: 'msg-h4',
        sessionId: 'session-house-01',
        fanId: 'fan-long',
        authorName: 'Hoàng Long',
        text: 'Encore hát Ánh Sáng VieWorld đi idol ơi, chưa muốn về đâu!',
        timestamp: '2026-09-12T13:04:00Z',
        isSample: true,
      },
    ],
    poll: {
      id: 'poll-house',
      tenantId: 'vieworld-demo',
      version: 1,
      updatedAt: '2026-09-12T13:00:00Z',
      sessionId: 'session-house-01',
      prompt: 'Ca khúc Encore đêm nay bạn mong chờ nhất?',
      options: [
        { id: 'opt-h1', text: 'Ánh Sáng VieWorld (Encore Ver)', votes: 312 },
        { id: 'opt-h2', text: 'Khát Vọng Tuổi Trẻ (Rock Ver)', votes: 184 },
        { id: 'opt-h3', text: 'Giai Điệu Kỷ Niệm (Acoustic)', votes: 245 },
      ],
      status: 'open',
    },
  },
  'session-mira-dropin': {
    viewerCount: '4.2K',
    cues: [
      {
        id: 'cue-01',
        cueText: 'LUNA GLOW! 🌙',
        prompt: 'Đồng thanh hô vang khẩu hiệu Ánh Trăng Luna tiếp sức Mira!',
        actionLabel: 'Hô fanchant Luna',
      },
      {
        id: 'cue-02',
        cueText: 'DREAM POP!',
        prompt: 'Hòa giọng và gửi lời chúc đính kèm Moon Badge độc quyền!',
        actionLabel: 'Lời nhắn Ánh Trăng',
      },
      {
        id: 'cue-03',
        cueText: 'LIGHTSTICK TÍM 💜',
        prompt: 'Thắp sáng biển ánh trăng tím dịu dàng tiếp thêm cảm hứng!',
        actionLabel: 'Vẫy lightstick tím',
      },
    ],
    initialMessages: [
      {
        id: 'msg-m1',
        sessionId: 'session-mira-dropin',
        fanId: 'fan-linh',
        authorName: 'Linh Nguyễn',
        text: 'Giọng Mira nghe êm dịu quá, chữa lành thật sự!',
        timestamp: '2026-09-15T13:01:00Z',
        isSample: true,
      },
      {
        id: 'msg-m2',
        sessionId: 'session-mira-dropin',
        fanId: 'fan-ngoc',
        authorName: 'Bảo Ngọc',
        text: 'Giai điệu dream pop này phối lofi đỉnh chóp luôn!',
        timestamp: '2026-09-15T13:02:00Z',
        isSample: true,
      },
      {
        id: 'msg-m3',
        sessionId: 'session-mira-dropin',
        fanId: 'fan-huy',
        authorName: 'Quang Huy',
        text: 'Chào các bạn Moonies! Tối nay nghe Luna cùng nhau nhé 🌙',
        timestamp: '2026-09-15T13:03:00Z',
        isSample: true,
      },
      {
        id: 'msg-m4',
        sessionId: 'session-mira-dropin',
        fanId: 'fan-chi',
        authorName: 'Mai Chi',
        text: 'Nghe một ngụm trà ấm rồi phiêu theo điệu nhạc thôi ~',
        timestamp: '2026-09-15T13:04:00Z',
        isSample: true,
      },
    ],
    poll: {
      id: 'poll-mira',
      tenantId: 'vieworld-demo',
      version: 1,
      updatedAt: '2026-09-15T13:00:00Z',
      sessionId: 'session-mira-dropin',
      prompt: 'Bản phối Luna tiếp theo bạn thích theo phong cách nào?',
      options: [
        { id: 'opt-m1', text: 'Lofi Chill Beat (Đêm trăng thanh)', votes: 288 },
        { id: 'opt-m2', text: 'Dream Pop Synthwave (Mơ màng)', votes: 345 },
        { id: 'opt-m3', text: 'Acoustic Piano (Mộc mạc sâu lắng)', votes: 198 },
      ],
      status: 'open',
    },
  },
  'session-kai-pulse': {
    viewerCount: '2.7K',
    cues: [
      {
        id: 'cue-01',
        cueText: 'KAI PULSE! ⚡',
        prompt: 'Tiếp lửa năng lượng bùng nổ cùng cộng đồng Pulse Crew!',
        actionLabel: 'Hô fanchant Pulse',
      },
      {
        id: 'cue-02',
        cueText: 'DROP THE BASS!',
        prompt: 'Cảm nhận từng đợt sóng âm trầm dồn dập cùng Cyber VIP Badge!',
        actionLabel: 'Nhịp đập Cyber',
      },
      {
        id: 'cue-03',
        cueText: 'LIGHTSTICK HỔ PHÁCH 🕯',
        prompt: 'Bật luồng sáng hổ phách neon rực rỡ hòa cùng nhịp synth!',
        actionLabel: 'Vẫy lightstick hổ phách',
      },
    ],
    initialMessages: [
      {
        id: 'msg-k1',
        sessionId: 'session-kai-pulse',
        fanId: 'fan-linh',
        authorName: 'Linh Nguyễn',
        text: 'Drop beat cháy quá Kai ơi! Bass căng tràn năng lượng!',
        timestamp: '2026-09-16T14:01:00Z',
        isSample: true,
      },
      {
        id: 'msg-k2',
        sessionId: 'session-kai-pulse',
        fanId: 'fan-tuan',
        authorName: 'Tuấn Anh',
        text: 'Thử thách nhịp điệu tiếp theo đi idol, hóng mãi!',
        timestamp: '2026-09-16T14:02:00Z',
        isSample: true,
      },
      {
        id: 'msg-k3',
        sessionId: 'session-kai-pulse',
        fanId: 'fan-trong',
        authorName: 'Đức Trọng',
        text: 'Cyberpunk vibe này đỉnh cao không góc chết!',
        timestamp: '2026-09-16T14:03:00Z',
        isSample: true,
      },
      {
        id: 'msg-k4',
        sessionId: 'session-kai-pulse',
        fanId: 'fan-phuong',
        authorName: 'Lan Phương',
        text: 'Pulse Crew đã sẵn sàng quẩy hết mình rồi anh em ơi! ⚡',
        timestamp: '2026-09-16T14:04:00Z',
        isSample: true,
      },
    ],
    poll: {
      id: 'poll-kai',
      tenantId: 'vieworld-demo',
      version: 1,
      updatedAt: '2026-09-16T14:00:00Z',
      sessionId: 'session-kai-pulse',
      prompt: 'Nhịp beat cho phân đoạn tiếp theo nên theo hướng nào?',
      options: [
        { id: 'opt-k1', text: 'Tăng tốc BPM 140 cực bốc', votes: 312 },
        { id: 'opt-k2', text: 'Drop Bass Trap chậm rãi uy lực', votes: 268 },
        { id: 'opt-k3', text: 'Synthwave hoài niệm Neon Tokyo', votes: 194 },
      ],
      status: 'open',
    },
  },
  'session-listen-01': {
    viewerCount: '1.4K',
    cues: [
      {
        id: 'cue-01',
        cueText: 'NEON NIGHTS!',
        prompt: 'Gửi lời chào thính phòng đêm muộn Neon Sessions!',
        actionLabel: 'Hô vang Neon Nights',
      },
      {
        id: 'cue-02',
        cueText: 'GIAI ĐIỆU MỘC!',
        prompt: 'Hòa mình vào tiếng guitar mộc mạc và hoài niệm!',
        actionLabel: 'Lời nhắn thính phòng',
      },
      {
        id: 'cue-03',
        cueText: 'LIGHTSTICK CYAN 🌟',
        prompt: 'Ánh đèn neon xanh dịu nhẹ cùng phòng nghe nhạc!',
        actionLabel: 'Vẫy đèn neon',
      },
    ],
    initialMessages: [
      {
        id: 'msg-l1',
        sessionId: 'session-listen-01',
        fanId: 'fan-linh',
        authorName: 'Linh Nguyễn',
        text: 'Phòng nghe bản thu chill quá, không gian ấm cúng ghê.',
        timestamp: '2026-09-10T14:01:00Z',
        isSample: true,
      },
      {
        id: 'msg-l2',
        sessionId: 'session-listen-01',
        fanId: 'fan-tung',
        authorName: 'Thanh Tùng',
        text: 'Bản acoustic Neon Prelude nghe mộc mạc và cảm xúc thật sự.',
        timestamp: '2026-09-10T14:02:00Z',
        isSample: true,
      },
      {
        id: 'msg-l3',
        sessionId: 'session-listen-01',
        fanId: 'fan-ha',
        authorName: 'Thu Hà',
        text: 'Rất thích dự án phòng nghe nghệ thuật đêm muộn như thế này.',
        timestamp: '2026-09-10T14:03:00Z',
        isSample: true,
      },
    ],
    poll: {
      id: 'poll-listen',
      tenantId: 'vieworld-demo',
      version: 1,
      updatedAt: '2026-09-10T14:00:00Z',
      sessionId: 'session-listen-01',
      prompt: 'Bản thu phòng thu tiếp theo bạn muốn nghe trọn vẹn?',
      options: [
        { id: 'opt-l1', text: 'Bản phối Neon Prelude mở rộng', votes: 195 },
        { id: 'opt-l2', text: 'Phối khí Ánh Đèn Đêm (Synthwave)', votes: 142 },
        { id: 'opt-l3', text: 'Outro: Ký Ức Thành Phố (Piano Ver)', votes: 110 },
      ],
      status: 'open',
    },
  },
};

/**
 * Returns comprehensive, artist-specific and event-specific chat metadata.
 */
export function getArtistChatMeta(
  worldId?: string,
  session?: Partial<Session> | { id?: string; worldId?: string },
  explicitArtistName?: string
) {
  // Infer worldId if missing
  const effectiveWorldId =
    worldId ||
    session?.worldId ||
    (session?.id ? SESSION_TO_ARTIST[session.id] : undefined) ||
    'artist-a';

  const artistMeta = ARTIST_FANDOM_REGISTRY[effectiveWorldId] || {
    artistId: effectiveWorldId,
    artistName: explicitArtistName || 'Artist',
    fandomName: 'Fandom',
    companionDays: 96,
    companionDate: 'tháng 4/2026',
    fandomMilestones: [
      'Gắn bó cùng nghệ sĩ tại các sự kiện trực tiếp',
      'Lưu giữ kỷ vật và khoảnh khắc kết nối',
      'Thành viên cộng đồng VieWorld chính thức',
    ],
    signatureLightstick: {
      name: 'Lightstick Fandom',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    },
    signatureFanchant: 'VIE-WORLD!',
    defaultViewerCount: '1.9K',
  };

  const effectiveArtistName = explicitArtistName && explicitArtistName !== 'Nghệ sĩ' ? explicitArtistName : artistMeta.artistName;
  const sessionMeta = session?.id ? SESSION_CHAT_REGISTRY[session.id] : undefined;

  // Compute viewer count
  let viewerCount = sessionMeta?.viewerCount || artistMeta.defaultViewerCount;
  if (session && 'status' in session) {
    if (session.status === 'running') {
      viewerCount = session.format === 'concert' ? '3.8K' : viewerCount;
    } else if (session.status === 'scheduled') {
      viewerCount = session.format === 'concert' ? '1.8K' : '950';
    }
  }

  // Compute call sample cues
  const cues: CallSampleCue[] =
    session && 'callSampleCues' in session && session.callSampleCues && session.callSampleCues.length > 0
      ? session.callSampleCues
      : sessionMeta?.cues || [
          {
            id: 'cue-01',
            cueText: artistMeta.signatureFanchant,
            prompt: `Đồng thanh hô vang fanchant chính thức tiếp sức ${effectiveArtistName}!`,
            actionLabel: 'Hô fanchant',
          },
          {
            id: 'cue-02',
            cueText: 'ĐIỆP KHÚC!',
            prompt: `Hòa giọng và gửi lời chúc đính kèm Fandom Star Badge độc quyền!`,
            actionLabel: 'Lời nhắn ngôi sao',
          },
          {
            id: 'cue-03',
            cueText: `${artistMeta.signatureLightstick.name.toUpperCase()}!`,
            prompt: `Bật và vẫy lightstick ảo tạo biển ánh sáng tiếp sức idol!`,
            actionLabel: 'Vẫy lightstick ảo',
          },
        ];

  // Compute initial messages
  const initialMessages: ChatMessage[] = sessionMeta?.initialMessages || [
    {
      id: `msg-seed-${effectiveWorldId}-1`,
      sessionId: session?.id || 'session-demo',
      fanId: 'fan-linh',
      authorName: 'Linh Nguyễn',
      text: `Chào cả nhà, háo hức chờ buổi gặp gỡ cùng ${effectiveArtistName} quá!`,
      timestamp: '2026-09-09T20:01:00Z',
      isSample: true,
    },
    {
      id: `msg-seed-${effectiveWorldId}-2`,
      sessionId: session?.id || 'session-demo',
      fanId: 'fan-minh',
      authorName: 'Minh Tuấn',
      text: 'Âm thanh nghe rất trong trẻo và ấm áp.',
      timestamp: '2026-09-09T20:02:00Z',
      isSample: true,
    },
    {
      id: `msg-seed-${effectiveWorldId}-3`,
      sessionId: session?.id || 'session-demo',
      fanId: 'fan-an',
      authorName: 'Hà An',
      text: `Ủng hộ ${effectiveArtistName} và dự án VieWorld độc lập!`,
      timestamp: '2026-09-09T20:03:00Z',
      isSample: true,
    },
  ];

  // Compute poll
  const poll: Poll = sessionMeta?.poll || {
    id: `poll-${effectiveWorldId}`,
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: '2026-09-09T20:00:00Z',
    sessionId: session?.id || 'session-demo',
    prompt: `Bạn muốn ${effectiveArtistName} chia sẻ thêm về điều gì trong sự kiện này?`,
    options: [
      { id: 'opt-1', text: 'Quá trình sáng tác ca khúc mới', votes: 165 },
      { id: 'opt-2', text: 'Kỷ niệm đáng nhớ cùng người hâm mộ', votes: 142 },
      { id: 'opt-3', text: 'Kế hoạch phát hành ấn phẩm & đĩa than', votes: 208 },
    ],
    status: 'open',
  };

  return {
    ...artistMeta,
    artistName: effectiveArtistName,
    viewerCount,
    cues,
    initialMessages,
    poll,
  };
}
