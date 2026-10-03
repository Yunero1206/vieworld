/**
 * VieWorld Bounded World Guide — Approved Local Knowledge Base (§2.3, §3, §4 & docs/packets/P14.md)
 * Strictly local, deterministic, and read-only.
 * Zero external network calls, zero API keys, zero live LLM dependencies.
 */

export interface GuideKnowledgeCard {
  id: string;
  topic: 'membership' | 'benefits' | 'orders' | 'sessions' | 'capsules' | 'support' | 'avatar' | 'tenants' | 'account';
  topicLabel: string;
  title: string;
  description: string;
  keywords: string[];
  actionLink: {
    to: string;
    label: string;
  };
  sourceTitle: string;
  updatedAt: string;
}

export type GuideQueryResult =
  | {
      type: 'answered';
      query: string;
      cards: GuideKnowledgeCard[];
    }
  | {
      type: 'unknown';
      query: string;
      message: string;
      suggestedTopics: GuideKnowledgeCard[];
    }
  | {
      type: 'unsupported_topic';
      query: string;
      message: string;
      limitationReason: string;
    }
  | {
      type: 'injection_blocked';
      query: string;
      message: string;
    };

export const APPROVED_KNOWLEDGE_CARDS: GuideKnowledgeCard[] = [
  {
    id: 'guide-card-account', topic: 'account', topicLabel: 'Tài khoản & riêng tư',
    title: 'Tài khoản riêng, phòng chia sẻ',
    description: 'Icon tài khoản cho tạo hồ sơ demo riêng hoặc chọn hồ sơ đã lưu trên thiết bị. Google/Facebook chỉ mô phỏng giao diện, không xác minh danh tính hay kết nối dịch vụ thật. Mỗi hồ sơ có My Space, bộ sưu tập, đơn hàng và quyền riêng tư riêng; hồ sơ mới không nhận dữ liệu mẫu của Linh. Thông tin liên hệ và nơi nhận chỉ nên là dữ liệu giả. Ai dùng chung trình duyệt có thể mở các hồ sơ demo; không có đồng bộ hoặc bảo vệ tài khoản thật.',
    keywords: ['đăng nhập', 'đăng ký', 'gmail', 'facebook', 'google', 'tài khoản', 'email', 'liên hệ', 'địa chỉ', 'giao hàng', 'số điện thoại', 'quyền riêng tư'],
    actionLink: { to: '/me?panel=account', label: 'Mở thông tin tài khoản riêng' },
    sourceTitle: 'VieWorld demo · Tài khoản và quyền riêng tư', updatedAt: '2026-09-27',
  },
  {
    id: 'guide-card-membership',
    topic: 'membership',
    topicLabel: 'Tư cách Hội viên',
    title: 'Tư cách Hội viên & Điều kiện nâng cấp',
    description:
      'Hall là nơi fan gặp nhau. Phòng chung và các phòng cộng đồng miễn phí: khách đọc được, đăng nhập là có thể trò chuyện. Hội viên của từng artist mở thêm Member Lounge và phiên riêng như Q&A. Mở Hội viên & quyền lợi để xem tư cách và quyền lợi. Demo không thu tiền thật.',
    keywords: [
      'hội viên',
      'membership',
      'thành viên',
      'nâng cấp',
      'gia hạn',
      'đăng ký hội viên',
      'tier',
      'artist a',
      'điều kiện',
    ],
    actionLink: {
      to: '/me?panel=membership',
      label: 'Xem Hội viên & quyền lợi',
    },
    sourceTitle: 'VieWorld demo · Theo dõi và Hội viên',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-benefits',
    topic: 'benefits',
    topicLabel: 'Quyền lợi Hội viên',
    title: 'Danh mục Quyền lợi & Quy trình nhận (Claim Benefit)',
    description:
      'Quyền lợi hội viên bao gồm quyền mua sớm vé sự kiện và quyền xem lại bản ghi độc quyền. Quyền lợi chỉ có thể nhận (Claim) khi chuyển sang trạng thái Đủ điều kiện (Eligible). Trạng thái Chờ xử lý (Pending) không thể tự động nhận mà cần ban tổ chức đối soát hợp lệ.',
    keywords: [
      'quyền lợi',
      'benefit',
      'claim',
      'nhận quyền lợi',
      'mua sớm',
      'early access',
      'vé',
      'đủ điều kiện',
      'eligible',
      'pending',
    ],
    actionLink: {
      to: '/benefits/benefit-early-access-01',
      label: 'Xem chi tiết quyền lợi Mua Sớm',
    },
    sourceTitle: 'VieWorld demo · Điều kiện quyền lợi',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-orders',
    topic: 'orders',
    topicLabel: 'VieCollect & Bộ sưu tập',
    title: 'VieCollect: sưu tập và thể hiện bản thân',
    description:
      'VieCollect giúp bạn sưu tập những vật phẩm gắn với artist và tạo dấu ấn riêng. Có món để giữ ngoài đời, có bản số để mặc hoặc trưng trong My Space. Vật phẩm đã nhận nằm trong Bộ sưu tập; chỉ món tương thích mới dùng được trong phòng hoặc trên avatar. Luồng đặt hàng là mô phỏng, không thu tiền hay giao hàng thật.',
    keywords: [
      'đơn hàng',
      'order',
      'viecollect',
      'shop',
      'cửa hàng',
      'mua hàng',
      'thanh toán',
      'giao nhận',
      'fulfilment',
      'sở hữu',
      'áo thun',
      'huy hiệu',
      'pin',
      'shirt',
    ],
    actionLink: {
      to: '/shop?artist=artist-a',
      label: 'Khám phá VieCollect của Artist A',
    },
    sourceTitle: 'VieWorld demo · Thanh toán và bàn giao',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-sessions',
    topic: 'sessions',
    topicLabel: 'Phiên sự kiện & Sân khấu',
    title: 'Các định dạng sự kiện: Drop-in, Phòng nghe & Live House',
    description:
      'Chọn cuộc hẹn ở Artist World để mở hoạt động trong Trang chính; shell và các tab giữ nguyên. Nhắc lịch (RSVP) không phải vé hay hội viên. Nhạc chỉ phát khi bạn chủ động bật. Chat công cộng dùng cùng phòng Hall: khách có thể đọc, đăng nhập để tham gia. Q&A hội viên mở riêng trong Hall của đúng artist.',
    keywords: [
      'phiên',
      'session',
      'sân khấu',
      'dropin',
      'listening',
      'live house',
      'phòng nghe',
      'buổi diễn',
      'rsvp',
      'phòng chờ',
      'lobby',
      'lịch diễn',
    ],
    actionLink: {
      to: '/artist/artist-a',
      label: 'Vào sân khấu sự kiện trực tiếp',
    },
    sourceTitle: 'VieWorld demo · Sự kiện và phòng chờ',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-capsules',
    topic: 'capsules',
    topicLabel: 'Kỷ niệm số Moment Capsule',
    title: 'Kỷ niệm số Moment Capsule & Ghi chú cá nhân',
    description:
      'Moment Capsule giữ dấu vết của buổi bạn đã tham gia. Mở My Space / Bộ sưu tập để xem kỷ niệm và ghi chú cá nhân. Xem lại bản ghi không tự tạo kỷ niệm tham dự trực tiếp.',
    keywords: [
      'kỷ niệm',
      'capsule',
      'moment',
      'ký ức',
      'ghi chú',
      'lưu trữ',
      'my world',
      'tham dự',
      'attendance',
    ],
    actionLink: {
      to: '/me?section=collection&panel=capsules',
      label: 'Mở kệ kỷ niệm trong phòng',
    },
    sourceTitle: 'VieWorld demo · Tham dự và kỷ niệm',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-support',
    topic: 'support',
    topicLabel: 'Hỗ trợ & Đối soát',
    title: 'Yêu cầu Hỗ trợ khách hàng & Quy trình Đối soát',
    description:
      'Mở Yêu cầu hỗ trợ từ icon tài khoản, chọn đơn hàng hoặc quyền lợi để tạo hồ sơ demo. Gửi lại cùng vấn đề sẽ mở hồ sơ đang có. Bạn có thể xem trạng thái tại trang chi tiết. Hồ sơ lưu trong trình duyệt, chưa gửi cho đội hỗ trợ; không có cam kết phản hồi. Giải quyết hồ sơ không tự thay đổi quyền lợi hoặc trạng thái giao hàng.',
    keywords: [
      'hỗ trợ',
      'support',
      'khiếu nại',
      'đối soát',
      'reconciliation',
      'trục trặc',
      'lỗi',
      'case',
      'giải quyết',
    ],
    actionLink: {
      to: '/me?panel=support',
      label: 'Mở hỗ trợ trong phòng',
    },
    sourceTitle: 'VieWorld demo · Hỗ trợ và đối soát',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-avatar',
    topic: 'avatar',
    topicLabel: 'Avatar của bạn',
    title: 'Diện mạo, trang phục và phụ kiện',
    description:
      'Mở My Space / Avatar để chọn diện mạo, trang phục và phụ kiện từ tài sản hiện có. Bạn có thể xem trước trong phòng rồi lưu thay đổi. Đồ trưng bày trong phòng không tự trở thành phụ kiện; chỉ vật phẩm tương thích mới dùng được trên avatar. Không có tạo avatar bằng AI trong bản này.',
    keywords: [
      'avatar',
      'studio',
      'trang phục',
      'outfit',
      'tủ đồ',
      'wardrobe',
      'phụ kiện',
      'bản nháp',
      'nghệ sĩ ảo',
    ],
    actionLink: {
      to: '/me?section=avatar',
      label: 'Chỉnh avatar trong My Space',
    },
    sourceTitle: 'VieWorld demo · Trang phục Avatar',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-tenants',
    topic: 'tenants',
    topicLabel: 'Một thế giới, một danh tính',
    title: 'Home, Explore, Artist World, My Space và VieCollect',
    description:
      'Home giúp bạn nắm tình hình; Explore là nơi ghé những Artist World khác. World đang ghé nằm ở slot artist trên sidebar, với Trang chính / Hall / Kho lưu trữ bên trong. Moment mở trong world, không có kênh Moments riêng. My Space giữ phòng, bộ sưu tập và avatar của bạn; VieCollect giúp sưu tập vật phẩm và tạo dấu ấn riêng. Dữ liệu demo lưu trong trình duyệt này, chưa đồng bộ qua dịch vụ bên ngoài.',
    keywords: [
      'tenant',
      'mfan',
      'fanme',
      'vieworld',
      'di động',
      'portability',
      'cách ly',
      'chuyển đổi',
      'reset',
    ],
    actionLink: {
      to: '/me?section=collection',
      label: 'Mở bộ sưu tập trong My Space',
    },
    sourceTitle: 'VieWorld demo · Một trải nghiệm fan',
    updatedAt: '2026-09-11',
  },
];

// Patterns for prompt injection, jailbreaking, or state mutation attempts
const INJECTION_PATTERNS = [
  /ignore\s+(previous|all)\s+instructions/i,
  /hãy\s+quên\s+(các\s+)?chỉ\s+dẫn/i,
  /bỏ\s+qua\s+quy\s+tắc/i,
  /grant\s+(me\s+)?(vip|membership|benefit)/i,
  /cấp\s+quyền/i,
  /thay\s+đổi\s+trạng\s+thái/i,
  /system:\s*/i,
  /admin:\s*/i,
  /<script\b[^>]*>/i,
  /eval\s*\(/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /update\s+app_state/i,
  /mutate/i,
];

// Patterns for unsupported, private, medical, financial, or artist-opinion topics
const UNSUPPORTED_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /(đời\s+tư|người\s+yêu|bạn\s+gái|bạn\s+trai|yêu\s+ai|kết\s+hôn|ly\s+hôn|nhà\s+riêng|quê\s+ở|(?:nghệ\s+sĩ|artist).*(?:số\s+điện\s+thoại|gia\s+đình|ở\s+đâu)|(?:số\s+điện\s+thoại|địa\s+chỉ).*(?:nghệ\s+sĩ|artist))/i,
    reason: 'Câu hỏi liên quan đến đời tư hoặc thông tin cá nhân ngoài phạm vi ứng dụng.',
  },
  {
    pattern: /(nghệ\s+sĩ\s+(nghĩ\s+gì|thích\s+gì|quan\s+điểm|thích\s+ai|ghét\s+ai)|tâm\s+sự\s+với\s+nghệ\s+sĩ)/i,
    reason: 'Trợ lý hướng dẫn không đại diện cho ý kiến cá nhân hoặc phát ngôn của nghệ sĩ.',
  },
  {
    pattern: /(đầu\s+tư|mua\s+coin|crypto|chứng\s+khoán|làm\s+giàu|vay\s+tiền|lãi\s+suất)/i,
    reason: 'Ứng dụng không cung cấp tư vấn tài chính hoặc đầu tư tiền tệ.',
  },
  {
    pattern: /(bệnh|thuốc|khám|chữa|triệu\s+chứng|sức\s+khỏe|y\s+tế)/i,
    reason: 'Ứng dụng không cung cấp tư vấn y tế hoặc sức khỏe.',
  },
];

/**
 * Deterministic Query Processor for World Guide
 * Strictly read-only, local keyword matching, and prompt-injection immune.
 */
export function queryWorldGuide(rawQuery: string): GuideQueryResult {
  const query = (rawQuery || '').trim();

  if (!query) {
    return {
      type: 'unknown',
      query: '',
      message: 'Vui lòng nhập từ khóa cần tìm kiếm hoặc chọn một chủ đề gợi ý bên dưới.',
      suggestedTopics: APPROVED_KNOWLEDGE_CARDS.slice(0, 4),
    };
  }

  // 1. Guardrail against Prompt Injection / State Mutation Attempts
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(query)) {
      return {
        type: 'injection_blocked',
        query,
        message:
          'Yêu cầu không hợp lệ. Trợ lý hướng dẫn là công cụ tra cứu thông tin tĩnh được xác thực nội bộ, không có quyền can thiệp hay thay đổi trạng thái dữ liệu hệ thống.',
      };
    }
  }

  // 2. Guardrail against Private, Medical, Financial, or Artist-Opinion Topics
  for (const item of UNSUPPORTED_PATTERNS) {
    if (item.pattern.test(query)) {
      return {
        type: 'unsupported_topic',
        query,
        message:
          'Xin lỗi, tôi là trợ lý thông tin kỹ thuật nền tảng VieWorld. Tôi không có thẩm quyền và không được phép trả lời các câu hỏi về đời tư, ý kiến cá nhân của nghệ sĩ hoặc tư vấn tài chính / y tế.',
        limitationReason: item.reason,
      };
    }
  }

  // 3. Local Deterministic Keyword & Semantic Matching
  const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  const normalized = normalize(query);
  const matchedCards: GuideKnowledgeCard[] = [];
  const scores = new Map<string, number>();

  for (const card of APPROVED_KNOWLEDGE_CARDS) {
    const titleMatch = normalize(card.title).includes(normalized);
    const descMatch = normalize(card.description).includes(normalized);
    const topicMatch = normalize(card.topicLabel).includes(normalized);
    const keywordMatch = card.keywords.some((kw) =>
      normalized.includes(normalize(kw)) || normalize(kw).includes(normalized)
    );

    if (titleMatch || descMatch || topicMatch || keywordMatch) {
      matchedCards.push(card);
      scores.set(card.id, (titleMatch ? 6 : 0) + (topicMatch ? 4 : 0) + (keywordMatch ? 3 : 0) + (descMatch ? 1 : 0));
    }
  }

  // 4. Return results or honest unknown query decline
  if (matchedCards.length > 0) {
    return {
      type: 'answered',
      query,
      cards: matchedCards.sort((a, b) => (scores.get(b.id) || 0) - (scores.get(a.id) || 0)),
    };
  }

  return {
    type: 'unknown',
    query,
    message:
      'Xin lỗi, câu hỏi này nằm ngoài phạm vi kiến thức đã được phê duyệt của trợ lý hướng dẫn. Bạn có thể tra cứu theo các chủ đề gợi ý bên dưới hoặc liên hệ ban tổ chức.',
    suggestedTopics: APPROVED_KNOWLEDGE_CARDS.slice(0, 4),
  };
}
