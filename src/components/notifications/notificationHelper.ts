import { Notification as DomainNotification } from '../../domain/types';
import { DisplayNotification, NotificationCategory } from './notification.types';

export function formatTimeAgo(isoString: string | undefined, referenceTime: string): string {
  if (!isoString) return 'Vừa xong';
  const time = new Date(isoString).getTime();
  const reference = new Date(referenceTime).getTime();
  if (isNaN(time) || isNaN(reference)) return 'Vừa xong';

  const diffSeconds = Math.max(0, Math.floor((reference - time) / 1000));

  if (diffSeconds < 60) return 'Vừa xong';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;

  const parts = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: 'numeric', month: 'numeric' }).formatToParts(new Date(time));
  return `${parts.find(part => part.type === 'day')?.value} thg ${parts.find(part => part.type === 'month')?.value}`;
}

export function getCategoryInfo(notif: DomainNotification): {
  type: NotificationCategory;
  label: string;
  dotColor: string;
  thumbnailUrl: string;
  ctaLabel: string;
} {
  const explicit = (notif.category || notif.type || '').toLowerCase();
  // Promotional notices often lack a useful category; the canonical destination is a safer signal than title keywords.
  const route = notif.targetRoute || '';
  const cat = explicit === 'promotional' ? /^\/shop(?:[/?]|$)/.test(route) ? 'shop'
    : /^\/me(?:[/?]|$)/.test(route) ? 'space'
    : /^\/sessions\//.test(route) ? 'session' : explicit : explicit;
  if (cat.includes('session') || cat.includes('artist')) {
    return {
      type: 'session',
      label: 'Cuộc hẹn nghệ sĩ',
      dotColor: '#2F6650',
      thumbnailUrl: '/images/place-stage-thumb.webp',
      ctaLabel: 'Xem chi tiết →',
    };
  }
  if (cat.includes('shop') || cat.includes('order')) {
    return {
      type: 'shop',
      label: 'VieCollect',
      dotColor: '#D97706',
      thumbnailUrl: '/images/place-shop-thumb.webp',
      ctaLabel: 'Xem ngay →',
    };
  }
  if (cat.includes('moment') || cat.includes('community') || cat.includes('capsule')) {
    return {
      type: 'moment',
      label: 'Cộng đồng',
      dotColor: '#2563EB',
      thumbnailUrl: '/images/place-club-thumb.webp',
      ctaLabel: 'Khám phá ngay →',
    };
  }
  if (cat.includes('space') || cat.includes('room') || cat.includes('fan')) {
    return {
      type: 'space',
      label: 'Không gian của tôi',
      dotColor: '#DC2626',
      thumbnailUrl: '/images/place-lounge-thumb.webp',
      ctaLabel: 'Về không gian của tôi →',
    };
  }
  if (cat.includes('support')) {
    return {
      type: 'support',
      label: 'Hỗ trợ',
      dotColor: '#4F46E5',
      thumbnailUrl: '/images/place-memory-thumb.webp',
      ctaLabel: 'Xem hỗ trợ →',
    };
  }
  return {
    type: 'system',
    label: 'VieWorld',
    dotColor: '#059669',
    thumbnailUrl: '/images/vieworld-brand-thumb.webp',
    ctaLabel: 'Xem chi tiết →',
  };
}

export function mapDomainToDisplay(notif: DomainNotification, referenceTime: string): DisplayNotification {
  const { type, label, dotColor, thumbnailUrl, ctaLabel } = getCategoryInfo(notif);
  return {
    id: notif.id,
    type,
    categoryLabel: label,
    categoryDotColor: dotColor,
    // Old locally saved notices keep their data; presentation follows the current brand.
    title: notif.title.replace(/vie\s?shop/gi, 'VieCollect'),
    body: notif.body.replace(/vie\s?shop/gi, 'VieCollect'),
    createdAt: notif.createdAt || notif.updatedAt,
    timeAgo: formatTimeAgo(notif.createdAt || notif.updatedAt, referenceTime),
    read: Boolean(notif.isRead),
    targetRoute: notif.targetRoute || (type === 'session' ? '/explore' : type === 'shop' ? '/shop' : type === 'space' ? '/me' : '/explore'),
    thumbnailUrl,
    ctaLabel,
  };
}
