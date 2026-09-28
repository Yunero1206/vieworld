import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXPANDED_PRODUCTS } from '../data/expandedUniverse';
import { NEW_MERCH } from '../world/merchCatalog';
import { displayAssetUrl } from '../world/display';
import { merchImageUrl } from '../world/merchImages';

describe('canonical merchandise artwork', () => {
  it('resolves every catalog image and digital companion to one existing public file', () => {
    for (const product of Object.values({ ...NEW_MERCH, ...EXPANDED_PRODUCTS })) {
      for (const image of [product.image, product.digitalImage].filter((value): value is string => Boolean(value))) {
        const url = merchImageUrl(image);
        expect(url, `${product.id}: ${image}`).toMatch(/^\/images\/merch-v2\//);
        expect(existsSync(resolve(__dirname, '../../static', url.slice(1))), `${product.id}: ${url}`).toBe(true);
      }
    }
  });

  it('shares genuinely identical digital/product artwork without changing product IDs', () => {
    expect(merchImageUrl('mira-hoodie-digital')).toBe(merchImageUrl('mira-hoodie-physical'));
    expect(merchImageUrl('kai-lightstick-digital')).toBe(merchImageUrl('kai-lightstick-physical'));
    expect(merchImageUrl('shirt-digital')).not.toBe(merchImageUrl('shirt-physical'));
    expect(merchImageUrl('/images/merch-v2/mira-hoodie-digital.png')).toBe(merchImageUrl('mira-hoodie-physical'));
    expect(displayAssetUrl({ id: 'legacy', title: 'Áo', detail: '', image: '/images/merch-v2/mira-hoodie-digital.png' }))
      .toBe(merchImageUrl('mira-hoodie-physical'));
  });
});
