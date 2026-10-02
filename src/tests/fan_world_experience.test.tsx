import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { FanShell } from '../components/FanShell';
import { FanWorldView } from '../views/FanWorldView';
import { FanShopView } from '../views/FanShopView';
import { OrderDetailView } from '../views/OrderDetailView';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { loadState, saveState } from '../services/storageAdapter';
import { nextMoment } from '../world/fanWorld';
import { AvatarRenderer } from '../components/AvatarRenderer';

function mount(path = '/') {
  return render(<AppProvider><MemoryRouter initialEntries={[path]}><Routes><Route element={<FanShell />}>
    <Route path="/" element={<FanWorldView />} /><Route path="/me" element={<FanWorldView />} />
    <Route path="/worlds/:worldId" element={<FanWorldView />} />
    <Route path="/shop" element={<FanShopView />} /><Route path="/worlds/:worldId/shop" element={<FanShopView />} />
    <Route path="/orders/:orderId" element={<OrderDetailView />} />
  </Route></Routes></MemoryRouter></AppProvider>);
}

describe('Unified fan world public experience', () => {
  beforeEach(() => { localStorage.clear(); saveState(createInitialState()); });







  it('ignores fabricated world or note progress', () => {
    const state = createInitialState('vieworld-demo');
    expect(appReducer(state, { type: 'VISIT_FAN_WORLD', worldId: 'missing' })).toBe(state);
    expect(appReducer(state, { type: 'READ_ARTIST_NOTE', noteId: 'missing' })).toBe(state);
  });

  it('chooses running then open sessions before later scheduled ones', () => {
    const base = Object.values(createInitialState('vieworld-demo').sessions)[0];
    const scheduled = { ...base, id: 'later', status: 'scheduled' as const };
    const open = { ...base, id: 'open', status: 'open' as const };
    const running = { ...base, id: 'now', status: 'running' as const };
    expect(nextMoment([scheduled, open, running], base.worldId)?.id).toBe('now');
    expect(nextMoment([scheduled, open], base.worldId)?.id).toBe('open');
    expect(nextMoment([{ ...base, status: 'cancelled' }], base.worldId)).toBeUndefined();
  });



  it('adding to cart creates no order and never auto pays', async () => {
    const state = createInitialState('vieworld-demo');
    const product = Object.values(state.products).find(p => !p.requiredBenefitId)!;
    saveState(state);
    mount(`/shop?product=${product.id}`);
    fireEvent.click(screen.getByRole('button', { name: /Thêm vào giỏ/ }));
    expect(screen.getByRole('link',{name:'Xem giỏ →'})).toBeInTheDocument();
    const restored = loadState('vieworld-demo', state.fanProfile.id).state;
    const created = Object.values(restored.orders).filter(o => o.requestId?.startsWith('shop-'));
    expect(created).toHaveLength(0);
    expect(restored.cart?.[0].productId).toBe(product.id);
  });

  it('disables purchase when stock is exhausted', () => {
    const state = createInitialState('vieworld-demo');
    const product = Object.values(state.products)[0];
    product.stockCount = 0;
    saveState(state);
    mount(`/shop?product=${product.id}`);
    expect(screen.getByRole('button', { name: 'Hết hàng' })).toBeDisabled();
  });

  it('disables member-only purchase without valid eligibility', () => {
    const state = createInitialState('vieworld-demo');
    const product = Object.values(state.products)[0];
    product.requiredBenefitId = 'missing-benefit';
    saveState(state);
    mount(`/shop?product=${product.id}`);
    expect(screen.getByRole('button', { name: 'Chưa đủ điều kiện' })).toBeDisabled();
  });



  it('uses unique SVG paint IDs across shared avatars', () => {
    const { container } = render(<><AvatarRenderer /><AvatarRenderer /><AvatarRenderer role="artist" /></>);
    const ids = [...container.querySelectorAll('svg [id]')].map(n => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
