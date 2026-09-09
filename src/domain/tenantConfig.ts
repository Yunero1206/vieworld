/**
 * VieWorld Multi-Tenant Configuration Architecture (§1, §2.3, §3, §4 & docs/CONTRACTS.md)
 *
 * Defines declarative configuration presets for:
 * 1. 'vieworld-demo': The primary VieWorld entertainment concept.
 * 2. 'mfan-demo': Clearly labeled external partner configuration demonstrating portability.
 * 3. 'fanme-demo': Clearly labeled external partner configuration demonstrating data isolation.
 *
 * NON-NEGOTIABLE CONSTITUTIONAL RULES:
 * - Zero scraping of external partner websites or proprietary assets.
 * - Zero unauthorized use of official trademarks or proprietary branding.
 * - No claim that real external accounts or backend databases are connected.
 * - Labels, accents, and priorities are driven entirely through config, never through forked page code.
 */

import { TenantId } from './types';

export interface TenantLabels {
  brandName: string;
  brandBadge: string;
  discoverTitle: string;
  worldsTitle: string;
  myWorldTitle: string;
  shopTitle: string;
  sessionsTitle: string;
  inboxTitle: string;
  studioTitle: string;
  membershipsTitle: string;
  capsulesTitle: string;
}

export interface ContentPriorities {
  featuredWorldId: string;
  primaryWorldType: 'artist' | 'ip';
  defaultTab: string;
  welcomeHeading: string;
  welcomeDescription: string;
}

export interface TenantConfig {
  tenantId: TenantId;
  displayName: string;
  tagline: string;
  accentColor: string;
  accentHover: string;
  accentLight: string;
  accentBorder: string;
  primaryBrandText: string;
  disclaimer: string;
  labels: TenantLabels;
  contentPriorities: ContentPriorities;
  availableWorldIds: string[];
}

export const TENANT_CONFIGS: Record<TenantId, TenantConfig> = {
  'vieworld-demo': {
    tenantId: 'vieworld-demo',
    displayName: 'VieWorld',
    tagline: 'Không gian kết nối người hâm mộ và thế giới giải trí qua những khoảnh khắc chân thực.',
    accentColor: '#6551C8',
    accentHover: '#523fa9',
    accentLight: '#EDE9FE',
    accentBorder: '#DDD6FE',
    primaryBrandText: 'VieWorld Demo',
    disclaimer: 'Cấu hình nguyên mẫu VieWorld chính thức. Toàn bộ dữ liệu và tương tác là mô phỏng trong trình duyệt.',
    labels: {
      brandName: 'VieWorld',
      brandBadge: 'PROTOTYPE',
      discoverTitle: 'Khám phá',
      worldsTitle: 'Worlds',
      myWorldTitle: 'My World',
      shopTitle: 'VieSHOP',
      sessionsTitle: 'Sân khấu',
      inboxTitle: 'Hộp thư',
      studioTitle: 'Studio',
      membershipsTitle: 'Hội viên',
      capsulesTitle: 'Moment Capsules',
    },
    contentPriorities: {
      featuredWorldId: 'artist-a',
      primaryWorldType: 'artist',
      defaultTab: 'home',
      welcomeHeading: 'Khám phá thế giới người hâm mộ',
      welcomeDescription:
        'VieWorld là nguyên mẫu kết nối người hâm mộ và thế giới giải trí qua những khoảnh khắc trực tuyến có ý nghĩa, lưu giữ kỷ niệm và quyền lợi minh bạch.',
    },
    availableWorldIds: ['artist-a', 'neon-sessions'],
  },

  'mfan-demo': {
    tenantId: 'mfan-demo',
    displayName: 'MFan Demo',
    tagline: 'Cấu hình minh họa đối tác MFan · Kiểm chứng tính di động (Portability) và cách ly dữ liệu.',
    accentColor: '#0284c7', // Sky Blue
    accentHover: '#0369a1',
    accentLight: '#e0f2fe',
    accentBorder: '#bae6fd',
    primaryBrandText: 'MFan Portability Demo',
    disclaimer:
      'Cấu hình thử nghiệm di động MFan độc lập. Không kết nối tài khoản thật, không sao chép nhãn hiệu hay nội dung của bên thứ ba.',
    labels: {
      brandName: 'MFan Demo',
      brandBadge: 'PARTNER DEMO',
      discoverTitle: 'Trang chủ MFan',
      worldsTitle: 'Cộng đồng Fandom',
      myWorldTitle: 'Không gian cá nhân',
      shopTitle: 'MFan Store',
      sessionsTitle: 'Sự kiện trực tuyến',
      inboxTitle: 'Thông báo',
      studioTitle: 'Quản trị Fandom',
      membershipsTitle: 'Thẻ Fandom',
      capsulesTitle: 'Kỷ vật tham dự',
    },
    contentPriorities: {
      featuredWorldId: 'world-mfan-artist-m',
      primaryWorldType: 'artist',
      defaultTab: 'home',
      welcomeHeading: 'Cộng đồng Fandom MFan Demo',
      welcomeDescription:
        'Minh họa khả năng tái cấu hình nhãn, màu nhấn và dữ liệu đối tác MFan mà không cần chia tách mã nguồn ứng dụng (Zero Forked Code).',
    },
    availableWorldIds: ['world-mfan-artist-m', 'world-mfan-showcase'],
  },

  'fanme-demo': {
    tenantId: 'fanme-demo',
    displayName: 'FanMe Demo',
    tagline: 'Cấu hình minh họa đối tác FanMe · Kiểm chứng tính độc lập dữ liệu và không rò rỉ quyền sở hữu.',
    accentColor: '#db2777', // Rose / Pink
    accentHover: '#be185d',
    accentLight: '#fce7f3',
    accentBorder: '#fbcfe8',
    primaryBrandText: 'FanMe Isolation Demo',
    disclaimer:
      'Cấu hình thử nghiệm độc lập FanMe. Không kết nối tài khoản thật, không sao chép nhãn hiệu hay dữ liệu thực tế.',
    labels: {
      brandName: 'FanMe Demo',
      brandBadge: 'INDEPENDENT DEMO',
      discoverTitle: 'Khám phá FanMe',
      worldsTitle: 'Kênh Nhà Sáng Tạo',
      myWorldTitle: 'Hồ sơ FanMe',
      shopTitle: 'FanMe Goods',
      sessionsTitle: 'Phòng Live FanMe',
      inboxTitle: 'Hộp tin',
      studioTitle: 'Bàn Studio FanMe',
      membershipsTitle: 'Gói FanMe Pass',
      capsulesTitle: 'Thẻ lưu niệm',
    },
    contentPriorities: {
      featuredWorldId: 'world-fanme-creator-k',
      primaryWorldType: 'artist',
      defaultTab: 'home',
      welcomeHeading: 'Kênh Kết Nối Sáng Tạo FanMe Demo',
      welcomeDescription:
        'Minh họa tính di động độc lập của schema VieWorld khi triển khai cho đối tác sáng tạo FanMe, đảm bảo toàn bộ dữ liệu đơn hàng và theo dõi được cách ly hoàn toàn.',
    },
    availableWorldIds: ['world-fanme-creator-k', 'world-fanme-lounge'],
  },
};

/**
 * Returns tenant configuration for the given TenantId with safe fallback to vieworld-demo
 */
export function getTenantConfig(tenantId: TenantId): TenantConfig {
  return TENANT_CONFIGS[tenantId] || TENANT_CONFIGS['vieworld-demo'];
}
