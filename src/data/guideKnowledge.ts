/**
 * VieWorld Bounded World Guide — Approved Local Knowledge Base (§2.3, §3, §4 & docs/packets/P14.md)
 * Strictly local, deterministic, and read-only.
 * Zero external network calls, zero API keys, zero live LLM dependencies.
 */

export interface GuideKnowledgeCard {
  id: string;
  topic: 'membership' | 'benefits' | 'orders' | 'sessions' | 'capsules' | 'support' | 'avatar' | 'tenants';
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
    id: 'guide-card-membership',
    topic: 'membership',
    topicLabel: 'Tư cách Hội viên',
    title: 'Tư cách Hội viên & Điều kiện nâng cấp',
    description:
      'Hội viên (Membership) là mối quan hệ gắn kết chính thức với từng Thế giới nghệ sĩ. Khác với Theo dõi (Follow miễn phí), hội viên tích cực được quyền kiểm tra tính đủ điều kiện nhận các quyền lợi độc quyền. Người dùng có thể nâng cấp hoặc hủy tại trang thế giới nghệ sĩ.',
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
      to: '/worlds/artist-a',
      label: 'Đến trang Hội viên Artist A',
    },
    sourceTitle: 'docs/CONSTITUTION.md §3 (Follow vs. Membership)',
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
    sourceTitle: 'docs/CONTRACTS.md §7.2 (Entitlement Matrix)',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-orders',
    topic: 'orders',
    topicLabel: 'VieSHOP & Đơn hàng',
    title: 'Cửa hàng VieSHOP & Quy trình Giao nhận (Fulfilment)',
    description:
      'VieSHOP cung cấp các vật phẩm lưu niệm số và hiện vật (huy hiệu, áo thun). Trong bản thử nghiệm, thanh toán hoàn toàn là mô phỏng không thu tiền thật. Sau khi thanh toán (Paid), ban tổ chức sẽ đối soát giao nhận (Fulfilled) để ghi nhận quyền sở hữu hiện vật trong My World.',
    keywords: [
      'đơn hàng',
      'order',
      'vieshop',
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
      to: '/worlds/artist-a/shop',
      label: 'Mở cửa hàng VieSHOP Artist A',
    },
    sourceTitle: 'docs/CONSTITUTION.md §3 (Payment vs. Fulfilment)',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-sessions',
    topic: 'sessions',
    topicLabel: 'Phiên sự kiện & Sân khấu',
    title: 'Các định dạng sự kiện: Drop-in, Phòng nghe & Live House',
    description:
      'Sân khấu VieWorld tổ chức các khoảnh khắc giao lưu trực tiếp (Drop-in), phòng nghe đĩa hát chọn lọc (Listening Room) và đại nhạc hội (Live House). Bạn có thể đăng ký giữ chỗ (RSVP) và vào phòng chờ trước giờ phát sóng.',
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
      to: '/sessions/session-dropin-01',
      label: 'Vào sân khấu sự kiện trực tiếp',
    },
    sourceTitle: 'docs/CONTRACTS.md §4 (Route Surface & Venues)',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-capsules',
    topic: 'capsules',
    topicLabel: 'Kỷ niệm số Moment Capsule',
    title: 'Kỷ niệm số Moment Capsule & Ghi chú cá nhân',
    description:
      'Moment Capsule là kỷ vật số ghi nhận sự hiện diện trực tiếp của bạn trong các phiên diễn cùng nghệ sĩ. Khán giả có thể lưu trữ và viết ghi chú cảm xúc riêng tư trong My World. Người chỉ xem lại bản ghi sẽ không nhận được kỷ niệm tham dự trực tiếp.',
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
      to: '/me',
      label: 'Đến Bộ sưu tập Kỷ niệm số trong My World',
    },
    sourceTitle: 'docs/CONSTITUTION.md §3 (Attendance vs. Replay)',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-support',
    topic: 'support',
    topicLabel: 'Hỗ trợ & Đối soát',
    title: 'Yêu cầu Hỗ trợ khách hàng & Quy trình Đối soát',
    description:
      'Khi quyền lợi hoặc đơn hàng gặp trục trặc, bạn có thể tạo yêu cầu hỗ trợ. Giải quyết khiếu nại ghi nhận kết quả điều tra độc lập; việc phục hồi dữ liệu gốc đòi hỏi hành động đối soát riêng biệt của điều hành viên để đảm bảo tính toàn vẹn dữ liệu.',
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
      to: '/me',
      label: 'Xem mục Hỗ trợ & Đối soát trong My World',
    },
    sourceTitle: 'docs/DECISIONS.md DEC-008 (Decoupled Support Resolution)',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-avatar',
    topic: 'avatar',
    topicLabel: 'Avatar Studio',
    title: 'Quản trị Avatar nghệ sĩ & Tủ đồ cá nhân',
    description:
      'Avatar trong VieWorld là biểu tượng 2D do nghệ sĩ trực tiếp điều khiển, tuyệt đối không dùng AI đóng giả người thật. Điều hành viên quản lý các bản nháp, thẩm định trước phát sóng và ngưng sử dụng trong Avatar Studio.',
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
      to: '/studio/avatar',
      label: 'Mở Avatar Studio',
    },
    sourceTitle: 'docs/DECISIONS.md DEC-010 (Avatar Asset Governance)',
    updatedAt: '2026-09-09',
  },
  {
    id: 'guide-card-tenants',
    topic: 'tenants',
    topicLabel: 'Chuyển đổi Tenant & Portability',
    title: 'Tính di động & Cách ly dữ liệu đối tác (VieWorld, MFan, FanMe)',
    description:
      'VieWorld chứng minh khả năng di động đa đối tác. Khi chuyển đổi giữa VieWorld, MFan và FanMe trong bảng kịch bản, toàn bộ dữ liệu người dùng, theo dõi và giỏ hàng được cách ly tuyệt đối, không rò rỉ dữ liệu giữa các môi trường.',
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
      to: '/about-demo',
      label: 'Xem giới thiệu & Disclosures của Demo',
    },
    sourceTitle: 'docs/CONSTITUTION.md §3 (Portability vs. Shared Accounts)',
    updatedAt: '2026-09-09',
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
    pattern: /(đời\s+tư|người\s+yêu|bạn\s+gái|bạn\s+trai|yêu\s+ai|kết\s+hôn|ly\s+hôn|gia\s+đình|ở\s+đâu|nhà\s+riêng|số\s+điện\s+thoại|quê\s+ở)/i,
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
  const normalized = query.toLowerCase();
  const matchedCards: GuideKnowledgeCard[] = [];

  for (const card of APPROVED_KNOWLEDGE_CARDS) {
    const titleMatch = card.title.toLowerCase().includes(normalized);
    const descMatch = card.description.toLowerCase().includes(normalized);
    const topicMatch = card.topicLabel.toLowerCase().includes(normalized);
    const keywordMatch = card.keywords.some((kw) =>
      normalized.includes(kw.toLowerCase()) || kw.toLowerCase().includes(normalized)
    );

    if (titleMatch || descMatch || topicMatch || keywordMatch) {
      matchedCards.push(card);
    }
  }

  // 4. Return results or honest unknown query decline
  if (matchedCards.length > 0) {
    return {
      type: 'answered',
      query,
      cards: matchedCards,
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
