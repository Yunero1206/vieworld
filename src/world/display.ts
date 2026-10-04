import type { AppState, Product } from '../domain/types';
import { historyCards, hasHistoryBadge } from './history';
import { readDisplaySurfaces } from './displaySurfaces';
import { merchImageUrl } from './merchImages';
import { productRoomMetadata, type RoomItemMetadata } from './roomItemKinds';
import { isDemoSignedIn } from './account';

export type DisplaySlot = 'shirt' | 'ticket' | 'disc' | 'lightstick' | 'achievement';

export interface DisplayItem extends RoomItemMetadata {
  id: string;
  slot?: DisplaySlot;
  title: string;
  detail: string;
  image?: string;
  roomAsset?: string;
  familyId?: string;
  digitalItemId?: string;
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
  { slot: 'shirt', label: 'Giá trang phục', x: 20, y: 41 },
  { slot: 'ticket', label: 'Bảng kỷ niệm', x: 36.5, y: 28 },
  { slot: 'disc', label: 'Góc âm nhạc', x: 73, y: 42 },
  { slot: 'lightstick', label: 'Góc ánh sáng', x: 68.5, y: 35.5 },
  { slot: 'achievement', label: 'Kệ lưu niệm', x: 55.5, y: 27 },
];

export function productDisplaySlot(p: Product): DisplaySlot | undefined {
  if (p.previewCapabilities?.room === false) return undefined;
  return productRoomMetadata(p).supportedSurfaces?.[0];
}

/** A disposable preview projection; never writes ownership or placement. */
export function productRoomPreviewItem(p: Product): DisplayItem {
  return { ...productRoomMetadata(p), id: p.id, title: p.title, detail: '', slot: productDisplaySlot(p), image: p.image,
    roomAsset: p.roomAsset, familyId: p.familyId, digitalItemId: p.digitalItemId,
    footprint: p.roomFootprint, isDisplayCompatible: Boolean(productDisplaySlot(p)) };
}

/**
 * Returns complete collection of items owned by the current fan in the active tenant.
 * Includes all fulfilled products (compatible and non-compatible), capsules, history cards and badges.
 */
export function ownedCollection(s: AppState): DisplayItem[] {
  if (!isDemoSignedIn(s)) return [];
  const products: DisplayItem[] = Object.values(s.products).flatMap(p => {
    if (p.tenantId !== s.activeTenantId) return [];
    const receipts = Object.values(s.orders).filter(
      o => o.productId === p.id && o.status === 'fulfilled' && o.fanId === s.fanProfile.id && o.tenantId === s.activeTenantId
    );
    if (receipts.length === 0) return [];
    const latestReceipt = receipts.sort((a, b) => (b.fulfilledAt || '').localeCompare(a.fulfilledAt || ''))[0];
    const slot = productDisplaySlot(p);

    return [{
      ...productRoomMetadata(p),
      id: p.id,
      slot,
      title: p.title,
      image: p.image,
      roomAsset: p.roomAsset,
      familyId: p.familyId,
      digitalItemId: p.digitalItemId,
      footprint: p.roomFootprint,
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
      itemKind: 'paper-memory' as const,
      supportedSurfaces: ['ticket' as const],
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
    itemKind: 'paper-memory' as const,
    supportedSurfaces: ['ticket' as const],
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
    itemKind: 'achievement-marker' as const,
    supportedSurfaces: ['achievement' as const],
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
  if (/^https?:\/\//.test(item.image)) return item.image;
  return merchImageUrl(item.image);
}

/** A prepared transparent prop is optional. Without it the room uses a designed frame/case. */
export function displayRoomAssetUrl(item: DisplayItem): string | undefined {
  if (item.roomAsset) return item.roomAsset;
  if (item.image === 'shirt-physical') return '/images/world-v6/shirt-cutout.webp';
  return undefined;
}
