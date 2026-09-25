import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { displayedItems, displayOptions, displayRoomAssetUrl, type DisplayItem } from '../world/display';
import { itemFootprint, readDisplaySurfaces, validateSurfaceSelection } from '../world/displaySurfaces';
import { withMerchCatalog } from '../world/merchCatalog';

describe('My Space display surfaces', () => {
  const shirt = (id: string): DisplayItem => ({ id, slot: 'shirt', title: id, detail: '', isDisplayCompatible: true });
  const ticket = (id: string): DisplayItem => ({ id, slot: 'ticket', title: id, detail: '', isDisplayCompatible: true });

  it('migrates legacy single slots to one-item surfaces without mutating the profile', () => {
    const profile = { ...createInitialState('vieworld-demo').fanProfile, displaySlots: { shirt: 'old-shirt' } };
    const surfaces = readDisplaySurfaces(profile);
    expect(surfaces.shirt.itemIds).toEqual(['old-shirt']);
    expect(surfaces.shirt.focalItemId).toBe('old-shirt');
    expect(profile.displaySurfaces).toBeUndefined();
    expect(readDisplaySurfaces(profile, [shirt('another-shirt')]).shirt.itemIds).toEqual([]);
  });

  it('enforces type, footprint, maximum density and intentional placement', () => {
    const profile = createInitialState('vieworld-demo').fanProfile;
    const objects = [shirt('a'), shirt('b'), shirt('c'), shirt('d'), ...Array.from({ length: 6 }, (_, i) => ticket(`t${i}`))];
    expect(itemFootprint(objects[0])).toBe(3);
    expect(validateSurfaceSelection(profile, 'shirt', { itemIds: ['a', 'b', 'c'] }, objects)).toBeUndefined();
    expect(validateSurfaceSelection(profile, 'shirt', { itemIds: ['a', 'b', 'c', 'd'] }, objects)).toMatch(/đầy/);
    expect(validateSurfaceSelection(profile, 'shirt', { itemIds: ['t0'] }, objects)).toMatch(/không phù hợp/);
    expect(validateSurfaceSelection(profile, 'ticket', { itemIds: ['t0', 't1', 't2', 't3', 't4', 't5'] }, objects)).toMatch(/đầy/);
  });

  it('stores item IDs only, while the owned collection remains canonical', () => {
    let state = withMerchCatalog(createInitialState('vieworld-demo'));
    state = appReducer(state, { type: 'CREATE_ORDER', productId: 'product-star-shirt-real', optionLabel: 'M', requestId: 'my-space-1' });
    const orderId = Object.values(state.orders)[0].id;
    state = appReducer(state, { type: 'SIMULATE_PAYMENT', orderId, requestId: 'my-space-1' });
    state = appReducer(state, { type: 'SIMULATE_FULFILMENT', orderId });
    const product = state.products['product-star-shirt-real'];
    state = appReducer(state, { type: 'SET_DISPLAY_SURFACE', surfaceId: 'shirt', selection: { itemIds: [product.id], focalItemId: product.id, layoutPreset: 'focus' } });
    expect(state.lastError).toBeUndefined();
    expect(readDisplaySurfaces(state.fanProfile).shirt.itemIds).toEqual([product.id]);
    expect(displayedItems(state).map(item => item.id)).toContain(product.id);
    expect(state.fanProfile.displaySlots?.shirt).toBe(product.id);
  });

  it('maps acquired hoodie merchandise to the rack and falls back to a framed room representation', () => {
    let state = withMerchCatalog(createInitialState('vieworld-demo'));
    state = appReducer(state, { type: 'CREATE_ORDER', productId: 'product-mira-hoodie-real', optionLabel: 'M', requestId: 'my-space-hoodie' });
    const orderId = Object.values(state.orders)[0].id;
    state = appReducer(state, { type: 'SIMULATE_PAYMENT', orderId, requestId: 'my-space-hoodie' });
    state = appReducer(state, { type: 'SIMULATE_FULFILMENT', orderId });
    const hoodie = displayOptions(state).find(item => item.id === 'product-mira-hoodie-real');
    expect(hoodie?.slot).toBe('shirt');
    expect(hoodie && displayRoomAssetUrl(hoodie)).toBeUndefined();
    expect(displayRoomAssetUrl({ id: 'shirt', slot: 'shirt', title: '', detail: '', image: 'shirt-physical' })).toBe('/images/world-v6/shirt-cutout.webp');
  });
});
