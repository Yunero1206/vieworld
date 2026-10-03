import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import { selectHomePresence } from '../world/presenceDiscovery';
import { AmbientHallEcho } from '../components/AmbientHallEcho';
import { GlobalNavigation } from '../components/GlobalNavigation';
import { FanShell } from '../components/FanShell';
import { ContextStage } from '../components/ContextStage';
import { WorldPanel } from '../components/WorldPanel';
import { FanWorldView } from '../views/FanWorldView';
import { OrderDetailView } from '../views/OrderDetailView';
import { CartView } from '../views/CartView';

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

function echo() {
  const voices = selectHomePresence(createInitialState('vieworld-demo')).voices;
  return { voices, ...render(<MemoryRouter><AmbientHallEcho voices={voices}/></MemoryRouter>) };
}

describe('Latest canonical dock and ambient scene', () => {
  it('has one Home V, one custom orbit, a room doorway and no artist portrait in the dock', () => {
    const { container } = render(<MemoryRouter><GlobalNavigation pathname="/artist/artist-a" artist={{ id: 'artist-a', name: 'Artist A' }}/></MemoryRouter>);
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getAllByRole('link')).toHaveLength(5);
    expect(nav.querySelectorAll('.presence-rail-brand')).toHaveLength(1);
    expect(nav.querySelectorAll('.vieworld-logo-icon')).toHaveLength(1);
    expect(nav.querySelector('.fw-artist-avatar')).toBeNull();
    expect([...nav.querySelectorAll('[data-vw-icon]')].map(e => e.getAttribute('data-vw-icon'))).toEqual(['explore', 'artist', 'room', 'collect']);
    expect(container.querySelectorAll('.fw-side-nav .selected')).toHaveLength(1);
  });
  it('keeps Cart local to Shop, not as a second utility in the global dock', () => {
    render(<AppProvider initialState={createInitialState('vieworld-demo')}><MemoryRouter><FanShell/></MemoryRouter></AppProvider>);
    const rail = document.querySelector('.fw-navigation-rail') as HTMLElement;
    expect(within(rail).queryByRole('link', { name: /Giỏ hàng/ })).toBeNull();
    expect(rail.querySelector('a[href="/cart"]')).toBeNull();
    expect(rail.querySelector('[data-vw-icon="bell"]')).toBeInTheDocument();
  });
  it('uses smaller desktop artwork without shrinking the mobile icon family', () => {
    render(<MemoryRouter><GlobalNavigation pathname="/shop"/></MemoryRouter>);
    const desktop = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    const mobile = screen.getByRole('navigation', { name: 'Điều hướng di động' });
    for (const icon of desktop.querySelectorAll('[data-vw-icon]')) {
      expect(icon).toHaveAttribute('width', '22');
      expect(icon).toHaveAttribute('height', '22');
    }
    expect(desktop.querySelector('.vieworld-logo-icon')).toHaveAttribute('width', '30');
    for (const icon of mobile.querySelectorAll('[data-vw-icon]')) {
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    }
  });
  it('keeps mobile navigation icon-only while preserving accessible destination names', () => {
    render(<AppProvider initialState={createInitialState('vieworld-demo')}><MemoryRouter><FanShell/></MemoryRouter></AppProvider>);
    const nav = screen.getByRole('navigation', { name: 'Điều hướng di động' });
    for (const link of within(nav).getAllByRole('link')) {
      expect(link).toHaveAccessibleName();
      expect(link.textContent?.trim()).toBe('');
    }
    expect(nav).not.toHaveTextContent('Bạn');
    expect(nav).not.toHaveTextContent('Đăng nhập');
    expect(within(nav).getByRole('button', {name:/Tài khoản/})).toHaveAttribute('aria-expanded','false');
  });
  it('renders one human trace with no avatar, initials or post metadata', () => {
    const { container } = echo();
    expect(container.querySelectorAll('.presence-home-echo')).toHaveLength(1);
    expect(container.querySelector('img, .avatar-renderer, .presence-bubble-avatar')).toBeNull();
    expect(container.querySelector('.presence-home-echo small')).toHaveTextContent('@minh');
    expect(screen.queryByText('Từ Hall')).toBeNull();
  });
  it('leaves a quiet gap, then advances to the next approved anchor without mounting multiple echoes', () => {
    vi.useFakeTimers();
    const { container, voices } = echo();
    act(() => vi.advanceTimersByTime(9000));
    expect(container.querySelector('.presence-home-echo')).not.toHaveClass('is-visible');
    expect(container.querySelector('.presence-home-echo')).toHaveAttribute('tabindex', '-1');
    act(() => vi.advanceTimersByTime(3250));
    expect(container.querySelectorAll('.presence-home-echo.is-visible')).toHaveLength(1);
    expect(container.querySelector('.presence-home-echo')).toHaveClass('anchor-1');
    expect(container.querySelector('.presence-home-echo')).toHaveTextContent(voices[1].text);
  });
  it('does not disappear while keyboard focused, even after the pointer leaves', () => {
    vi.useFakeTimers();
    const { container } = echo();
    const link = container.querySelector('.presence-home-echo')!;
    fireEvent.mouseEnter(link); fireEvent.focus(link); fireEvent.mouseLeave(link);
    act(() => vi.advanceTimersByTime(20000));
    expect(link).toHaveClass('is-visible');
    fireEvent.blur(link);
    act(() => vi.advanceTimersByTime(9000));
    expect(link).not.toHaveClass('is-visible');
  });
  it('shows a static single echo for reduced motion', () => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const { container, voices } = echo();
    act(() => vi.advanceTimersByTime(60000));
    expect(container.querySelector('.presence-home-echo')).toHaveClass('is-visible', 'anchor-0');
    expect(container.querySelector('.presence-home-echo')).toHaveTextContent(voices[0].text);
  });
  it('removes all traces immediately when the eligible pool is withdrawn', () => {
    const { rerender, container } = echo();
    rerender(<MemoryRouter><AmbientHallEcho voices={[]}/></MemoryRouter>);
    expect(container.querySelector('.presence-home-echo')).toBeNull();
  });
});

describe('Connected contextual panels after browser audit', () => {
  it.each([
    ['product-cap-digital', 'accessories'],
    ['product-lightstick-digital', 'accessories'],
    ['product-star-shirt-digital', 'outfit'],
  ] as const)('opens the right avatar tab from a received %s order', (productId, tab) => {
    const state = createInitialState('vieworld-demo');
    const product = state.products[productId];
    state.orders = { audit: { id: 'audit', tenantId: state.activeTenantId, fanId: state.fanProfile.id, version: 1, updatedAt: state.demoTime, productId, worldId: product.worldId, digitalSlot: product.digitalSlot, requestId: 'audit-request', sourceRef: 'audit', status: 'fulfilled' } };
    render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/orders/audit']}><Routes><Route path="/orders/:orderId" element={<OrderDetailView/>}/><Route path="/me" element={<FanWorldView/>}/></Routes></MemoryRouter></AppProvider>);
    expect(document.querySelector('.presence-diagnostics')).not.toHaveAttribute('open');
    const destination = screen.getByRole('link', { name: 'Mở tủ đồ' });
    expect(destination).toHaveAttribute('href', `/me?section=avatar&tab=${tab}`);
    fireEvent.click(destination);
    expect(screen.getByRole('button', { name: tab === 'outfit' ? 'Trang phục' : 'Phụ kiện' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(product.title.replace(' · Digital', ''))).toBeInTheDocument();
  });
  it.each([
    ['product-cap-digital', 'accessories'],
    ['product-lightstick-digital', 'accessories'],
    ['product-star-shirt-digital', 'outfit'],
  ] as const)('opens the right avatar tab after checkout for %s', (productId, tab) => {
    const state = createInitialState('vieworld-demo');
    const product = state.products[productId];
    state.orders = { audit: { id: 'audit', checkoutId: 'audit-checkout', tenantId: state.activeTenantId, fanId: state.fanProfile.id, version: 1, updatedAt: state.demoTime, productId, worldId: product.worldId, digitalSlot: product.digitalSlot, requestId: 'audit-request', sourceRef: 'audit', status: 'fulfilled' } };
    render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/checkout/audit-checkout']}><Routes><Route path="/checkout/:checkoutId" element={<CartView/>}/><Route path="/me" element={<FanWorldView/>}/></Routes></MemoryRouter></AppProvider>);
    const destination = screen.getByRole('link', { name: 'Thử trên Avatar →' });
    expect(destination).toHaveAttribute('href', `/me?section=avatar&tab=${tab}`);
    fireEvent.click(destination);
    expect(screen.getByRole('button', { name: tab === 'outfit' ? 'Trang phục' : 'Phụ kiện' })).toHaveAttribute('aria-pressed', 'true');
  });
  it.each(['ended', 'chat-paused', 'writable'])('respects inline Hall write access for %s', mode => {
    const state = createInitialState('vieworld-demo');
    const session = state.sessions['session-dropin-01'];
    if (mode === 'ended') session.status = 'ended';
    if (mode === 'chat-paused') session.isChatPaused = true;
    render(<AppProvider initialState={state}><MemoryRouter><ContextStage session={session} artistId="artist-a" artistName="Artist A" image="/images/artist-a-concert.jpg"/></MemoryRouter></AppProvider>);
    expect(screen.getByRole('log', { name: 'Trò chuyện cùng Hall' })).toBeInTheDocument();
    if (mode === 'writable') expect(screen.getByRole('textbox', { name: 'Gửi lời trong Hall' })).toBeInTheDocument();
    else {
      expect(screen.queryByRole('textbox', { name: 'Gửi lời trong Hall' })).toBeNull();
      expect(screen.getByText(/Phòng đang chỉ đọc/)).toBeInTheDocument();
    }
  });
  it('reuses the product panel for avatar/collection workspace rather than adding another shell', () => {
    render(<WorldPanel title="Avatar của bạn" variant="workspace" onClose={vi.fn()}><p>Không gian chỉnh avatar</p></WorldPanel>);
    expect(screen.getByRole('dialog')).toHaveClass('fw-panel-product', 'is-workspace');
  });
});
