import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { createFreshFanState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import type { AppAction } from '../domain/types';
import { freshGuestState, isDemoSignedIn } from '../world/account';
import { currentPublicFan } from '../world/community';
import { ownedCollection, productRoomPreviewItem } from '../world/display';
import { ownsDigitalProduct, withMerchCatalog } from '../world/merchCatalog';
import { cartProblem, checkProductEligibility } from '../world/commerce';
import { artistArchiveChapters } from '../world/artistArchive';
import { getWorldMoments } from '../world/exploreRows';
import { worldActivities } from '../world/presenceDiscovery';
import { sessionWorldContext } from '../world/worldContext';
import { artistRooms } from '../world/artistPresentation';
import { isPersistedState, loadState, saveState } from '../services/storageAdapter';
import { MemberSpaceView } from '../views/MemberSpaceView';
import { FanShopView } from '../views/FanShopView';
import { CartView } from '../views/CartView';
import { PresencePanel } from '../components/PresencePanel';
import { FandomPolaroidPass } from '../components/FandomPolaroidPass';

const fan = () => appReducer(createFreshFanState('vieworld-demo', 'fan-truth-audit', 'Fan kiểm thử'), { type: 'DEMO_SIGN_IN', provider: 'google', mode: 'login' });
const event = 'session-dropin-01';
function mount(state: ReturnType<typeof fan>, path: string, element: React.ReactNode) {
  return render(<AppProvider initialState={state}><MemoryRouter initialEntries={[path]}><Routes><Route path="*" element={element}/></Routes></MemoryRouter></AppProvider>);
}
beforeEach(() => { localStorage.clear(); window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }); });
afterEach(cleanup);

describe('Final prototype truth boundaries', () => {
  it('uses the same open/paused/ended phase in context, Hall and public activity', () => {
    for (const status of ['open', 'paused', 'ended'] as const) {
      const state = fan(); state.sessions[event].status = status;
      expect(sessionWorldContext(state.sessions[event], 'artist-a').phase).toBe(status === 'ended' ? 'ended' : 'active');
      expect(worldActivities(state, 'artist-a').find(item => item.id === event)?.phase).toBe(status === 'ended' ? 'recent' : 'now');
      expect(artistRooms(state, 'artist-a', event).find(room => room.id === event)?.lifecycle).toBe(status === 'ended' ? 'archived' : 'active');
    }
  });
  it('Archive excludes foreign worlds/moments and private or invalid sessions', () => {
    const state = fan(); state.sessions[event].status = 'ended';
    const moments = [...getWorldMoments('artist-a'), ...getWorldMoments('artist-mira')];
    let chapters = artistArchiveChapters(state, 'artist-a', moments, Object.values(state.sessions));
    expect(chapters.some(chapter => chapter.id === `session-${event}`)).toBe(true);
    expect(chapters.flatMap(chapter => chapter.momentIds).some(id => id.includes('mira'))).toBe(false);
    for (const status of ['cancelled', 'ended'] as const) {
      state.sessions[event].status = status; state.sessions[event].rightsApproved = false;
      expect(artistArchiveChapters(state, 'artist-a', moments, Object.values(state.sessions)).some(chapter => chapter.id === `session-${event}`)).toBe(false);
    }
    state.worlds['artist-a'].tenantId = 'mfan-demo';
    expect(artistArchiveChapters(state, 'artist-a', moments, Object.values(state.sessions))).toEqual([]);
  });
  it('curated artist moments are explicitly fixtures, including the first two', () => {
    for (const id of ['artist-a', 'artist-mira', 'artist-kai']) expect(getWorldMoments(id).every(moment => moment.isDemo)).toBe(true);
  });
  it('guest selectors cannot project the retained identity or digital ownership', () => {
    const state = fan(), id = 'product-cap-digital';
    state.orders.receipt = { id: 'receipt', tenantId: state.activeTenantId, fanId: state.fanProfile.id, worldId: 'artist-a', version: 1, updatedAt: state.demoTime, productId: id, status: 'fulfilled', sourceRef: 'test', requestId: 'test' };
    expect(ownsDigitalProduct(state, state.products[id])).toBe(true);
    const guest = freshGuestState(state);
    expect(currentPublicFan(guest)).toBeUndefined(); expect(ownedCollection(guest)).toEqual([]);
    expect(ownsDigitalProduct(guest, guest.products[id])).toBe(false);
    expect(guest.orders).toBe(state.orders); // Hide, do not destroy provenance.
  });
  it('account and hydration reject a mismatched fan tenant', () => {
    const state = fan(); state.fanProfile.tenantId = 'mfan-demo';
    expect(isDemoSignedIn(state)).toBe(false);
    expect(isPersistedState(state, 'vieworld-demo', state.fanProfile.id)).toBe(false);
    expect(currentPublicFan(state)).toBeUndefined();
  });
  it('public identity cannot decorate from a foreign product even with a local receipt', () => {
    const state = fan(), id = 'product-cap-digital'; state.fanProfile.publicIdentity = { bio: '', mood: '', productIds: [id] };
    state.orders.receipt = { id: 'receipt', tenantId: state.activeTenantId, fanId: state.fanProfile.id, worldId: 'artist-a', version: 1, updatedAt: state.demoTime, productId: id, status: 'fulfilled', sourceRef: 'test', requestId: 'test' };
    state.products[id].tenantId = 'mfan-demo';
    expect(currentPublicFan(state)?.items).toEqual([]);
  });
  it('guest cannot import or earn history markers through reducer actions', () => {
    const state = freshGuestState(fan());
    for (const action of [{ type: 'IMPORT_DEMO_CARDS' }, { type: 'RETURN_HISTORY_CARDS', cardIds: [] }] satisfies AppAction[]) {
      const next = appReducer(state, action);
      expect(next.lastError?.code).toBe('DEMO_LOGIN_REQUIRED'); expect(next.ticketArchive).toBe(state.ticketArchive);
    }
  });
  it('direct public-room preview does not resurrect identity after sign-out', () => {
    const state = freshGuestState(fan());
    mount(state, `/members/${state.fanProfile.id}`, <Routes><Route path="/members/:fanId" element={<MemberSpaceView/>}/></Routes>);
    expect(screen.getByRole('button', { name: 'Đăng nhập / Đăng ký' })).toBeVisible();
    expect(screen.queryByText('Fan kiểm thử')).toBeNull();
  });
  it('recorded, open, paused and ended sessions never claim direct presence', () => {
    const base = fan().sessions[event];
    for (const session of [{ ...base, segmentMode: 'recorded' as const }, ...(['open', 'paused', 'ended'] as const).map(status => ({ ...base, status }))]) {
      const view = render(<PresencePanel session={{ ...session, artistPresence: 'present' }}/>);
      expect(screen.queryByText('Nghệ sĩ đang hiện diện trực tiếp')).toBeNull();
      expect(screen.getByText('Trạng thái minh họa · Không có nghệ sĩ thật')).toBeVisible(); view.unmount();
    }
  });
  it('Fandom Pass is not proof of membership, access or invented tenure', () => {
    mount(fan(), '/', <FandomPolaroidPass isOpen onClose={() => {}} fanName="Fan kiểm thử" fanId="fan-truth-audit" companionDays={128} items={[]}/>);
    expect(screen.getByText('Không phải thẻ hội viên')).toBeVisible();
    expect(screen.queryByText('Hall Access ✓')).toBeNull(); expect(screen.queryByText(/128 ngày/)).toBeNull();
  });
  it('VieCollect includes physical objects with an explicit demo boundary, not digital-only', () => {
    const state = fan();
    mount(state, '/shop?product=product-star-shirt-real', <FanShopView/>);
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByText(/Giá, tồn kho và giao dịch là dữ liệu minh họa/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Chọn kích cỡ trước' })).toBeDisabled();
    expect(screen.getAllByText('Có bản avatar riêng').length).toBeGreaterThan(0);
    expect(ownedCollection(state)).toEqual([]);
  });
  it('physical cart supports demo checkout but never becomes ownership before fulfillment', () => {
    const state = appReducer(fan(), { type: 'ADD_TO_CART', productId: 'product-star-shirt-real', optionLabel: 'M' });
    mount(state, '/cart', <CartView/>);
    expect(screen.getByRole('button', { name: 'Kiểm tra đơn →' })).toBeVisible();
    expect(ownedCollection(state)).toEqual([]);
    expect(screen.getByRole('button', { name: /Bỏ.*khỏi giỏ/ })).toBeVisible();
  });
  it('hybrid is a visible concept, not a new coupled ownership grant', () => {
    const state = fan(), productId = 'product-star-shirt-bundle';
    mount(state, `/shop?product=${productId}`, <FanShopView/>);
    expect(screen.getByText(/Demo chưa tách quyền bản số khỏi giao hàng/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Thêm vào giỏ' })).toBeNull();
    expect(checkProductEligibility(state, state.products[productId], 'M').eligible).toBe(false);
    expect(appReducer(state, { type: 'ADD_TO_CART', productId, optionLabel: 'M' }).cart).toEqual([]);
    const next = appReducer(state, { type: 'CREATE_ORDER', productId, optionLabel: 'M', requestId: 'hybrid-new' });
    expect(next.orders).toBe(state.orders); expect(next.lastError?.code).toBe('PREVIEW_ONLY');
  });
  it('commerce rejects foreign products and foreign benefit grants on both acquisition paths', () => {
    const state = fan(), product = state.products['product-cap-real'];
    product.tenantId = 'mfan-demo';
    expect(appReducer(state, { type: 'CREATE_ORDER', productId: product.id, requestId: 'foreign' }).orders).toBe(state.orders);
    product.tenantId = state.activeTenantId; product.requiredBenefitId = 'foreign-benefit';
    state.benefits['foreign-benefit'] = { id: 'foreign-benefit', tenantId: 'mfan-demo', fanId: state.fanProfile.id, worldId: product.worldId, version: 1, updatedAt: state.demoTime, title: 'Fixture', status: 'eligible', reasonCode: 'test', sourceRef: 'test', nextAction: '' };
    expect(checkProductEligibility(state, product).eligible).toBe(false);
    expect(cartProblem(state, [{ key: product.id, productId: product.id, quantity: 1 }])).toBeDefined();
    expect(appReducer(state, { type: 'CREATE_ORDER', productId: product.id, requestId: 'foreign-benefit' }).orders).toBe(state.orders);
    state.benefits['foreign-benefit'].tenantId = state.activeTenantId;
    state.benefits['foreign-benefit'].fanId = 'another-fan';
    expect(appReducer(state, { type: 'CREATE_ORDER', productId: product.id, requestId: 'foreign-fan' }).orders).toBe(state.orders);
  });
  it('preorder payment is not ownership and guest cannot advance retained shipments', () => {
    const state = fan(), productId = 'product-star-shirt-real';
    const pending = appReducer(state, { type: 'CREATE_ORDER', productId, optionLabel: 'M', requestId: 'preorder' });
    const order = Object.values(pending.orders)[0];
    const paid = appReducer(pending, { type: 'SIMULATE_PAYMENT', orderId: order.id, requestId: order.requestId });
    expect(ownedCollection(paid)).toEqual([]);
    const next = appReducer(freshGuestState(paid), { type: 'ADVANCE_SHIPMENT', orderId: order.id, expectedStage: 0 });
    expect(next.orders).toBe(paid.orders); expect(next.lastError?.code).toBe('DEMO_LOGIN_REQUIRED');
  });
  it('room footprint uses authored metadata, never the image filename', () => {
    const state = fan(); const product = { ...state.products['product-cap-digital'], roomFootprint: undefined, image: 'cap-unrelated' };
    expect(productRoomPreviewItem(product).footprint).toBeUndefined();
  });
  it('hydration preserves ended state and creates no fresh ownership or membership', () => {
    const state = fan(); state.sessions[event].status = 'ended'; saveState(state);
    const restored = loadState(state.activeTenantId, state.fanProfile.id).state;
    expect(restored.sessions[event].status).toBe('ended'); expect(restored.orders).toEqual(state.orders); expect(restored.memberships).toEqual(state.memberships);
  });
  it('catalogue truth correction preserves legacy stock, receipts and identity', () => {
    const state = fan(), id = 'product-mira-lightstick-real';
    state.products[id].batchLabel = 'Official Lightstick'; state.products[id].stockCount = 2;
    const next = withMerchCatalog(state);
    expect(next.products[id].batchLabel).toBe('Thiết kế minh họa'); expect(next.products[id].stockCount).toBe(2);
    expect(next.orders).toBe(state.orders); expect(next.fanProfile).toBe(state.fanProfile);
    expect(withMerchCatalog(next)).toBe(next);
  });
});
