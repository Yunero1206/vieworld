import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import manifest from '../data/imageDelivery.json';
import { optimizedImageUrl } from '../world/imageDelivery';
import { merchImageUrl } from '../world/merchImages';
import { createInitialState } from '../data/fixtures';
import { loadState, saveState } from '../services/storageAdapter';

describe('Image delivery compatibility', () => {
  it('maps old names, absolute public paths and extensions into the same canonical artwork', () => {
    for (const input of ['cap-digital','cap-digital.png','cap-digital.webp','/images/merch-v2/cap-digital.png']) expect(merchImageUrl(input)).toBe('/images/merch-v2/cap-digital.webp');
    expect(merchImageUrl('/images/merch-v2/kai-bomber-digital.png')).toBe('/images/merch-v2/kai-bomber-physical.webp');
    expect(merchImageUrl('mira-lightstick-digital')).toBe('/images/merch-v2/mira-lightstick-physical.webp');
    expect(merchImageUrl('https://example.invalid/artwork.png')).toBe('https://example.invalid/artwork.png');
    expect(optimizedImageUrl('/images/myspace-room-v2.png?demo=1')).toBe('/images/myspace-room-v2.webp?demo=1');
    expect(optimizedImageUrl('/images/unknown.webp')).toBe('/images/unknown.webp');
  });
  it('keeps original URLs and every declared WebP derivative with its delivery budget', () => {
    for (const asset of manifest.assets) {
      expect(existsSync(asset.source), asset.source).toBe(true);
      const bytes = readFileSync(asset.target);
      expect(bytes.toString('ascii',0,4),asset.target).toBe('RIFF');
      expect(bytes.toString('ascii',8,12),asset.target).toBe('WEBP');
      expect(bytes.byteLength,asset.target).toBeLessThanOrEqual(asset.maxBytes);
    }
  });
  it('resolves an older persisted catalogue without rewriting identity, receipts or placements', () => {
    localStorage.clear(); const state=createInitialState('vieworld-demo');
    state.products['product-cap-digital'].image='/images/merch-v2/cap-digital.png';
    state.orders.old={id:'old',tenantId:state.activeTenantId,fanId:state.fanProfile.id,worldId:'artist-a',version:1,updatedAt:state.demoTime,productId:'product-cap-digital',status:'fulfilled',requestId:'old',sourceRef:'old'};
    const before=structuredClone({orders:state.orders,profile:state.fanProfile}); saveState(state);
    const loaded=loadState(state.activeTenantId,state.fanProfile.id).state;
    expect(loaded.orders).toEqual(before.orders); expect(loaded.fanProfile).toEqual(before.profile);
    expect(loaded.products['product-cap-digital'].image).toBe('/images/merch-v2/cap-digital.png');
    expect(merchImageUrl(loaded.products['product-cap-digital'].image!)).toBe('/images/merch-v2/cap-digital.webp');
  });
});
