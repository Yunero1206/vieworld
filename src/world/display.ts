import type { AppState } from '../domain/types';
import { historyCards, hasHistoryBadge } from './history';

export type DisplaySlot = 'shirt' | 'ticket' | 'disc' | 'lightstick' | 'achievement';

export interface DisplayItem {
  id: string;
  slot?: DisplaySlot;
  title: string;
  detail: string;
  image?: string;
  worldId?: string;
  collectedAt?: string;
  isDisplayCompatible?: boolean;
  wearableSlot?: string;
  category?: string;
}

export const DISPLAY_FIXTURES: { slot: DisplaySlot; label: string; x: number; y: number }[] = [
  { slot: 'shirt', label: 'Áo của mình', x: 20, y: 43 },
  { slot: 'ticket', label: 'Vé đáng nhớ', x: 36.5, y: 29 },
  { slot: 'disc', label: 'Đĩa đang nghe', x: 85, y: 48 },
  { slot: 'lightstick', label: 'Ánh sáng fandom', x: 68.5, y: 35 },
  { slot: 'achievement', label: 'Dấu mốc của mình', x: 55.5, y: 26 },
];

/**
 * Returns complete collection of items owned by the current fan in the active tenant.
 * Includes all fulfilled products (compatible and non-compatible), capsules, history cards and badges.
 */
export function ownedCollection(s: AppState): DisplayItem[] {
  const products: DisplayItem[] = Object.values(s.products).flatMap(p => {
    const receipts = Object.values(s.orders).filter(
      o => o.productId === p.id && o.status === 'fulfilled' && o.fanId === s.fanProfile.id && o.tenantId === s.activeTenantId
    );
    if (receipts.length === 0) return [];
    const latestReceipt = receipts.sort((a, b) => (b.fulfilledAt || '').localeCompare(a.fulfilledAt || ''))[0];
    const slot: DisplaySlot | undefined =
      p.digitalSlot === 'shirt' || p.image?.startsWith('shirt') ? 'shirt'
      : p.digitalSlot === 'lightstick' || p.image?.startsWith('lightstick') ? 'lightstick'
      : p.category === 'album' ? 'disc'
      : p.category === 'ticket' ? 'ticket'
      : undefined;

    return [{
      id: p.id,
      slot,
      title: p.title,
      image: p.image,
      worldId: p.worldId,
      collectedAt: latestReceipt?.fulfilledAt,
      isDisplayCompatible: Boolean(slot),
      wearableSlot: p.digitalSlot,
      category: p.category || 'merch',
      detail: slot
        ? 'Món được chủ phòng chọn trưng bày. Không công khai thông tin đơn hàng.'
        : 'Vật phẩm sở hữu cá nhân trong bộ sưu tập (chưa có vị trí cố định trên diorama phòng).',
    }];
  });

  const memories: DisplayItem[] = Object.values(s.capsules)
    .filter(c => c.fanId === s.fanProfile.id && c.tenantId === s.activeTenantId)
    .map(c => ({
      id: c.id,
      slot: 'ticket' as const,
      title: s.sessions[c.sessionId]?.title || 'Kỷ niệm của mình',
      worldId: c.worldId,
      image: 'ticket-digital',
      isDisplayCompatible: true,
      category: 'memory',
      detail: 'Một kỷ niệm được chủ phòng chọn. Ghi chú riêng không được chia sẻ.',
    }));

  const cards: DisplayItem[] = historyCards(s).map(c => ({
    id: c.id,
    slot: 'ticket' as const,
    title: c.eventTitle,
    worldId: c.worldId,
    collectedAt: c.collectedAt,
    image: 'ticket-digital',
    isDisplayCompatible: true,
    category: 'ticket',
    detail: 'Thẻ kỷ niệm mẫu trong bộ sưu tập. Không phải vé vào cửa.',
  }));

  const badges: DisplayItem[] = [10, 20].filter(n => hasHistoryBadge(s, n)).map(n => ({
    id: `badge-${n}`,
    slot: 'achievement' as const,
    title: `Người giữ ký ức · ${n}`,
    isDisplayCompatible: true,
    category: 'achievement',
    detail: 'Huy hiệu ghi nhận việc trao lại thẻ kỷ niệm; không cấp quyền vào sự kiện.',
  }));

  return [...products, ...memories, ...cards, ...badges];
}

/**
 * Returns display candidates specifically compatible with the five diorama fixtures.
 * Preserves existing contract for history verification and slot assignments.
 */
export function displayOptions(s: AppState): (DisplayItem & { slot: DisplaySlot })[] {
  return ownedCollection(s).filter((i): i is DisplayItem & { slot: DisplaySlot } => Boolean(i.isDisplayCompatible && i.slot));
}

export function displayedItems(s: AppState) {
  const selected = s.fanProfile.displaySlots || {};
  return displayOptions(s).filter(i => selected[i.slot] === i.id);
}

