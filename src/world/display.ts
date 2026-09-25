import type { AppState } from '../domain/types';
import { historyCards, hasHistoryBadge } from './history';
import { readDisplaySurfaces } from './displaySurfaces';

export type DisplaySlot = 'shirt' | 'ticket' | 'disc' | 'lightstick' | 'achievement';

export interface DisplayItem {
  id: string;
  slot?: DisplaySlot;
  title: string;
  detail: string;
  image?: string;
  roomAsset?: string;
  footprint?: 1 | 2 | 3;
  worldId?: string;
  collectedAt?: string;
  isDisplayCompatible?: boolean;
  wearableSlot?: string;
  category?: string;
  sourceType?: 'event' | 'merchandise' | 'membership' | 'achievement' | 'moment';
  eventName?: string;
  deliveryKind?: 'physical' | 'digital' | 'bundle';
  privateNote?: string;
}

export const DISPLAY_FIXTURES: { slot: DisplaySlot; label: string; x: number; y: number }[] = [
  { slot: 'shirt', label: 'Áo kỷ niệm', x: 20, y: 41 },
  { slot: 'ticket', label: 'Vé sự kiện', x: 36.5, y: 28 },
  { slot: 'disc', label: 'Đĩa đang nghe', x: 84.5, y: 48 },
  { slot: 'lightstick', label: 'Ánh sáng fandom', x: 68.5, y: 35.5 },
  { slot: 'achievement', label: 'Cột mốc & Kỷ vật', x: 55.5, y: 27 },
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
    const slot: DisplaySlot | undefined = p.roomSurface
      || (p.digitalSlot === 'shirt' || /(?:shirt|hoodie|bomber)-/.test(p.image || '') ? 'shirt'
      : p.digitalSlot === 'lightstick' || /lightstick-/.test(p.image || '') ? 'lightstick'
      : p.category === 'album' ? 'disc'
      : p.category === 'ticket' ? 'ticket'
      : undefined);

    return [{
      id: p.id,
      slot,
      title: p.title,
      image: p.image,
      roomAsset: p.roomAsset,
      footprint: p.roomFootprint || (/(?:cap)-/.test(p.image || '') ? 1 : undefined),
      worldId: p.worldId,
      collectedAt: latestReceipt?.fulfilledAt,
      isDisplayCompatible: Boolean(slot),
      wearableSlot: p.digitalSlot,
      category: p.category || 'merch',
      sourceType: 'merchandise' as const,
      deliveryKind: (p.delivery || (p.kind === 'digital' ? 'digital' : 'physical')) as 'physical' | 'digital' | 'bundle',
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
      sourceType: 'event' as const,
      eventName: s.sessions[c.sessionId]?.title,
      collectedAt: c.updatedAt,
      deliveryKind: 'digital' as const,
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
    sourceType: 'event' as const,
    eventName: c.eventTitle,
    deliveryKind: 'physical' as const,
    detail: 'Thẻ kỷ niệm mẫu trong bộ sưu tập. Không phải vé vào cửa.',
  }));

  const badges: DisplayItem[] = [10, 20].filter(n => hasHistoryBadge(s, n)).map(n => ({
    id: `badge-${n}`,
    slot: 'achievement' as const,
    title: `Người giữ ký ức · ${n}`,
    isDisplayCompatible: true,
    category: 'achievement',
    sourceType: 'achievement' as const,
    deliveryKind: 'digital' as const,
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
  const options = displayOptions(s);
  const selected = readDisplaySurfaces(s.fanProfile, options);
  return options.filter(i => Object.values(selected).some(surface => surface.itemIds.includes(i.id)));
}

export function displayAssetUrl(item: DisplayItem): string | undefined {
  if (!item.image) return undefined;
  if (item.image.startsWith('/') || /^https?:\/\//.test(item.image)) return item.image;
  return `/images/merch-v2/${item.image}.png`;
}

/** A prepared transparent prop is optional. Without it the room uses a designed frame/case. */
export function displayRoomAssetUrl(item: DisplayItem): string | undefined {
  if (item.roomAsset) return item.roomAsset;
  if (item.image === 'shirt-physical') return '/images/world-v6/shirt-cutout.webp';
  return undefined;
}
