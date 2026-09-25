import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
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
  beforeEach(() => localStorage.clear());

  it('has Home plus the four product destinations and no public tenant switch', () => {
    mount();
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(nav).toHaveClass('fw-side-nav');
    expect(within(nav).getAllByRole('link').map(a => a.textContent)).toEqual(['Home', 'Explore', 'Artist A', 'My Space', 'VieSHOP']);
    expect(screen.queryByText('MFan')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mở menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kịch bản thử nghiệm' }));
    expect(screen.queryByText('MFan')).not.toBeInTheDocument();
    expect(screen.queryByText('FanMe')).not.toBeInTheDocument();
  });

  it('opens a real object panel, saves a letter, closes with Escape and persists it', async () => {
    const view = mount('/?panel=news');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Giữ lời nhắn này' }));
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Đã giữ lời nhắn' })).toBeDisabled();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    view.unmount();
    mount('/?panel=news');
    expect(screen.getByRole('button', { name: 'Đã giữ lời nhắn' })).toBeDisabled();
  });

  it('preserves the last world without switching identity or orders', () => {
    const original = createInitialState('vieworld-demo');
    let state = appReducer(original, { type: 'VISIT_FAN_WORLD', worldId: 'neon-sessions' });
    state = appReducer(state, { type: 'READ_ARTIST_NOTE', noteId: 'neon-letter' });
    expect(state.fanProfile.id).toBe(original.fanProfile.id);
    expect(state.orders).toBe(original.orders);
    expect(state.memberships).toBe(original.memberships);
    expect(state.participations).toBe(original.participations);
    expect(state.capsules).toBe(original.capsules);
    expect(appReducer(state, { type: 'VISIT_FAN_WORLD', worldId: 'neon-sessions' })).toBe(state);
    expect(appReducer(state, { type: 'READ_ARTIST_NOTE', noteId: 'neon-letter' })).toBe(state);
    saveState(state);
    mount();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Neon Sessions');
  });

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

  it('uses direct livestream controls without a decorative room', () => {
    const { container } = mount();
    fireEvent.click(screen.getByRole('button', { name: 'Live & Concert' }));
    expect(container.querySelector('.fw-scene-art')).toBeNull();
    expect(screen.getByRole('link', { name: 'Vào phiên · chat, câu hỏi & âm thanh →' })).toHaveAttribute('href', '/sessions/session-dropin-01');
    fireEvent.click(screen.getByRole('button', { name: /Concert · Lịch dự kiến/ }));
    expect(screen.getByRole('link', { name: 'Vào phiên · chat, câu hỏi & âm thanh →' })).not.toHaveAttribute('href', '/sessions/session-dropin-01');
  });

  it('adding to cart creates no order and never auto pays', async () => {
    const state = createInitialState('vieworld-demo');
    const product = Object.values(state.products).find(p => !p.requiredBenefitId)!;
    saveState(state);
    mount(`/shop?product=${product.id}`);
    fireEvent.click(screen.getByRole('button', { name: /Thêm vào giỏ đồ/ }));
    expect(screen.getByRole('link',{name:'Xem giỏ & chốt đơn →'})).toBeInTheDocument();
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

  it('recovers missing world and product deep links', () => {
    const view = mount('/worlds/not-real');
    expect(screen.getByRole('link', { name: 'Về thế giới' })).toHaveAttribute('href', '/');
    view.unmount();
    mount('/shop?product=not-real');
    expect(screen.getByRole('dialog', { name: 'Không tìm thấy món đồ' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('uses unique SVG paint IDs across shared avatars', () => {
    const { container } = render(<><AvatarRenderer /><AvatarRenderer /><AvatarRenderer role="artist" /></>);
    const ids = [...container.querySelectorAll('svg [id]')].map(n => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
