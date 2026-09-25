import type { Product } from '../domain/types';
import { money } from './commerce';

export type ShopCategory = 'all' | 'merch' | 'album' | 'membership';
export type PreviewCapabilities = { avatar: boolean; room: boolean };

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
  all: 'Tất cả',
  merch: 'Merch & Lightstick',
  album: 'Album / CD',
  membership: 'Pass & Membership',
};

export function shopCategory(product: Product): ShopCategory {
  if (product.category === 'album') return 'album';
  if (product.category === 'membership' || product.category === 'ticket') return 'membership';
  return 'merch';
}

export function availableShopCategories(products: Product[]): ShopCategory[] {
  const found = new Set(products.map(shopCategory));
  return (Object.keys(SHOP_CATEGORY_LABELS) as ShopCategory[]).filter(category => category === 'all' || found.has(category));
}

export function getPreviewCapabilities(product: Product, catalog: Product[]): PreviewCapabilities {
  if (product.previewCapabilities) return { avatar: !!product.previewCapabilities.avatar, room: !!product.previewCapabilities.room };
  if (product.category === 'membership') return { avatar: false, room: false };
  const family = product.familyId || product.id;
  const hasAvatarEdition = !!product.digitalSlot || catalog.some(candidate =>
    (candidate.familyId || candidate.id) === family && !!candidate.digitalSlot,
  );
  const room = product.category === 'album' || product.category === 'ticket'
    || product.digitalSlot === 'lightstick' || product.digitalSlot === 'shirt'
    || /^(shirt|lightstick)/.test(product.image || '')
    || /-(hoodie|bomber|lightstick)-/.test(product.image || '');
  return { avatar: hasAvatarEdition, room };
}

export function previewEdition(product: Product, catalog: Product[]): Product | undefined {
  if (product.digitalSlot) return product;
  const family = product.familyId || product.id;
  return catalog.find(candidate => (candidate.familyId || candidate.id) === family && !!candidate.digitalSlot);
}

export function productBadge(product: Product): string | undefined {
  if (product.previewOnly) return 'Concept';
  if (!product.isAvailable || product.stockCount <= 0) return 'Hết hàng';
  if (product.releaseType === 'pre_order') return 'Pre-order';
  if (product.category === 'membership') return 'Membership';
  if (product.delivery === 'bundle') return 'Kèm digital';
  if (product.delivery === 'physical' && product.digitalItemId) return 'Kèm digital';
  // A separately sold digital edition is not a free companion.
  return undefined;
}

export function productPrice(product: Product, comparableVariants: Product[] = [product]): { current: string; compareAt?: string } {
  const prices = comparableVariants.map(item => item.priceVND).sort((a, b) => a - b);
  const current = prices.length > 1 && prices[0] !== prices[prices.length - 1]
    ? `${money(prices[0]).replace(/\s*₫$/, '')}–${money(prices[prices.length - 1])}`
    : money(product.priceVND);
  return {
    current,
    compareAt: product.compareAtPriceVND && product.compareAtPriceVND > product.priceVND
      ? money(product.compareAtPriceVND)
      : undefined,
  };
}
