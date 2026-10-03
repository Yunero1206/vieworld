import type { DisplaySlot } from './display';

export type RoomItemKind = 'apparel' | 'paper-memory' | 'music-media' | 'light' | 'keepsake' | 'achievement-marker';
export interface RoomItemMetadata {
  itemKind?: RoomItemKind;
  supportedSurfaces?: DisplaySlot[];
  roomPresentation?: 'hanger' | 'frame' | 'stand' | 'light' | 'keepsake';
}

export const ROOM_KIND_SURFACES: Record<RoomItemKind, DisplaySlot[]> = {
  apparel: ['shirt'], 'paper-memory': ['ticket'], 'music-media': ['disc'],
  light: ['lightstick'], keepsake: ['achievement'], 'achievement-marker': ['achievement'],
};
export const ROOM_KIND_LABELS: Record<RoomItemKind, string> = {
  apparel: 'Trang phục', 'paper-memory': 'Kỷ niệm', 'music-media': 'Vật phẩm âm nhạc',
  light: 'Vật phẩm ánh sáng', keepsake: 'Vật lưu niệm', 'achievement-marker': 'Dấu mốc',
};
const familyLabels: Record<string, string> = {
  'star-shirt':'Áo', 'mira-hoodie':'Hoodie', 'kai-bomber':'Áo khoác', 'star-cap':'Nón',
  'first-notes':'CD', 'mira-vinyl':'Đĩa than', 'kai-cassette':'Cassette',
  'star-light':'Lightstick', 'mira-lightstick':'Lightstick', 'kai-lightstick':'Lightstick',
};
const itemLabels: Record<string, string> = {
  'product-d-songbook-real':'Sách nhạc', 'product-d-pick-real':'Phím gảy',
  'product-mira-tea-cup-real':'Cốc', 'product-kai-keychain-real':'Móc khóa',
  'product-b-pin-real':'Ghim', 'product-pin-01':'Ghim', 'product-shirt-01':'Áo',
  'product-c-poster-real':'Poster', 'product-a-poster-soldout':'Poster',
  'product-c-photocard-real':'Photocard', 'product-mira-polaroid-real':'Polaroid',
  'product-e-concept-preview':'Photocard', 'product-fanme-photocard':'Photocard',
  'product-a-hanoi-ticket':'Vé kỷ niệm', 'product-a-hanoi-towel':'Khăn cổ vũ',
  'product-c-lightstick-real':'Lightstick', 'product-c-lightstick-digital':'Lightstick',
};
/** Short, authored object labels for the inspector; never a compatibility rule. */
export function roomItemLabel(item: RoomItemMetadata & {id:string;familyId?:string;slot?:DisplaySlot}): string {
  return itemLabels[item.id] || familyLabels[item.familyId||''] || ROOM_KIND_LABELS[item.itemKind||legacyRoomKind(item.slot)||'keepsake'];
}

// Authored capabilities for the existing catalogue. Never infer object form from
// shipping mode, price, category, or an image filename. Saved IDs stay unchanged.
const families: Record<string, RoomItemKind> = {
  'star-shirt': 'apparel', 'mira-hoodie': 'apparel', 'kai-bomber': 'apparel',
  'star-cap': 'keepsake', 'first-notes': 'music-media', 'mira-vinyl': 'music-media', 'kai-cassette': 'music-media',
  'star-light': 'light', 'mira-lightstick': 'light', 'kai-lightstick': 'light',
};
const products: Record<string, RoomItemKind> = {
  'product-pin-01': 'keepsake', 'product-shirt-01': 'apparel',
  'product-c-poster-real': 'paper-memory', 'product-a-poster-soldout': 'paper-memory',
  'product-c-photocard-real': 'paper-memory', 'product-mira-polaroid-real': 'paper-memory',
  'product-e-concept-preview': 'paper-memory', 'product-fanme-photocard': 'paper-memory',
  'product-d-songbook-real': 'music-media', 'product-d-pick-real': 'music-media',
  'product-mira-tea-cup-real': 'keepsake', 'product-kai-keychain-real': 'keepsake',
  'product-b-pin-real': 'keepsake', 'product-a-hanoi-ticket': 'paper-memory',
  'product-a-hanoi-towel': 'apparel', 'product-c-lightstick-real': 'light', 'product-c-lightstick-digital': 'light',
};
const presentation: Record<RoomItemKind, NonNullable<RoomItemMetadata['roomPresentation']>> = {
  apparel: 'hanger', 'paper-memory': 'frame', 'music-media': 'stand', light: 'light',
  keepsake: 'keepsake', 'achievement-marker': 'keepsake',
};
export function legacyRoomKind(slot?: DisplaySlot): RoomItemKind | undefined {
  return slot ? ({shirt:'apparel',ticket:'paper-memory',disc:'music-media',lightstick:'light',achievement:'keepsake'} as const)[slot] : undefined;
}
export function productRoomMetadata(product: RoomItemMetadata & { id: string; familyId?: string; roomSurface?: DisplaySlot }): RoomItemMetadata {
  const itemKind = product.itemKind || products[product.id] || families[product.familyId || ''] || legacyRoomKind(product.roomSurface);
  if (!itemKind) return {};
  return {
    itemKind,
    supportedSurfaces: product.supportedSurfaces || ROOM_KIND_SURFACES[itemKind],
    roomPresentation: product.roomPresentation || presentation[itemKind],
  };
}
