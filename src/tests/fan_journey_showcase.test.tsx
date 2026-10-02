import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createInitialState } from '../data/fixtures';
import { AppProvider } from '../context/AppContext';
import { appReducer } from '../domain/reducer';
import type { AppAction } from '../domain/types';
import { freshGuestState, isDemoSignedIn } from '../world/account';
import { getCurrentArtistId, setCurrentArtistId } from '../world/currentArtist';
import { cartFingerprint } from '../world/commerce';
import { ownedCollection, displayedItems } from '../world/display';
import { readDisplaySurfaces } from '../world/displaySurfaces';
import { canEnterHall, ownedDigitalLook, ownsDigitalProduct } from '../world/merchCatalog';
import { homeDestination } from '../world/homeDestination';
import { currentPublicFan } from '../world/community';
import { selectPublicVoices } from '../world/exploreDiscovery';
import { loadState, saveState, _resetMemoryFallbackFlagForTesting } from '../services/storageAdapter';
import { FanShell } from '../components/FanShell';
import { ArtistWorldView } from '../views/ArtistWorldView';
import { FanShopView } from '../views/FanShopView';
import { CartView } from '../views/CartView';
import { FanWorldView } from '../views/FanWorldView';
import { CollectionBrowser } from '../components/CollectionBrowser';

beforeEach(() => { cleanup(); localStorage.clear(); _resetMemoryFallbackFlagForTesting(); });
afterEach(cleanup);

describe('One fan, one connected journey — showcase', () => {
  it('runs guest → discovery → membership/live → memory → purchase → collection/room/avatar → resume → logout → reload', () => {
    let state = freshGuestState(createInitialState());
    state.followedWorldIds = []; state.rsvpdSessionIds = []; state.memberships = {}; state.benefits = {}; state.orders = {}; state.capsules = {}; state.participations = {};
    const step = (action: AppAction) => { state = appReducer(state, action); return state; };
    expect(isDemoSignedIn(state)).toBe(false);
    const assigned = getCurrentArtistId(state); expect(assigned).toBeTruthy(); expect(getCurrentArtistId(state)).toBe(assigned);
    setCurrentArtistId(state, 'artist-a'); step({ type: 'VISIT_FAN_WORLD', worldId: 'artist-a' });
    step({ type: 'TOGGLE_FOLLOW', worldId: 'artist-a' }); expect(state.followedWorldIds).toContain('artist-a'); expect(canEnterHall(state, 'artist-a')).toBe(false);
    step({ type: 'DEMO_SIGN_IN', provider: 'google', mode: 'register' }); expect(state.memberships).toEqual({});
    step({ type: 'UPGRADE_MEMBERSHIP', worldId: 'artist-a' }); expect(canEnterHall(state, 'artist-a')).toBe(true);
    step({ type: 'TOGGLE_RSVP', sessionId: 'session-listen-01' }); expect(state.rsvpdSessionIds).toContain('session-listen-01'); expect(state.participations).toEqual({});
    step({ type: 'JOIN_LIVE_SESSION', sessionId: 'session-dropin-01' });
    const attendance = state.participations; step({ type: 'JOIN_LIVE_SESSION', sessionId: 'session-dropin-01' }); expect(state.participations).toBe(attendance);
    const hall = { type: 'SEND_HALL_MESSAGE' as const, worldId: 'artist-a', roomId: 'session-dropin-01', text: 'Cùng nghe nhé — lời nhắn riêng trong Hall.', requestId: 'journey-chat' };
    step(hall); const messages = state.hallMessages; step(hall); expect(state.hallMessages).toBe(messages);
    expect(selectPublicVoices(state, 'artist-a').some(voice => voice.id === hall.requestId)).toBe(false);
    step({ type: 'END_SESSION', sessionId: 'session-dropin-01' });
    const capsule = Object.values(state.capsules)[0]; expect(capsule).toBeDefined();
    step({ type: 'SAVE_CAPSULE', capsuleId: capsule.id, privateNote: 'Private local note' });
    expect(Object.values(state.notifications).find(notification => notification.id === 'notif-capsule-session-dropin-01')?.targetRoute).toBe('/me?section=collection&mode=memories&type=capsule');
    step({ type: 'TOGGLE_SAVED_PRODUCT', productId: 'product-star-shirt-digital' });
    expect(ownsDigitalProduct(state, state.products['product-star-shirt-digital'])).toBe(false);
    step({ type: 'ADD_TO_CART', productId: 'product-star-shirt-digital' });
    step({ type: 'CHECKOUT_CART', requestId: 'journey-checkout', fingerprint: cartFingerprint(state) });
    step({ type: 'PAY_CHECKOUT', checkoutId: 'journey-checkout' });
    const order = Object.values(state.orders)[0]; expect(ownedCollection(state).some(item => item.id === order.productId)).toBe(false);
    step({ type: 'SIMULATE_FULFILMENT', orderId: order.id }); const owned = state.orders;
    step({ type: 'SIMULATE_FULFILMENT', orderId: order.id }); expect(state.orders).toBe(owned);
    expect(ownedCollection(state).filter(item => item.id === order.productId)).toHaveLength(1);
    expect(displayedItems(state)).toEqual([]); // Ownership must not automatically decorate the room.
    step({ type: 'SET_DISPLAY_SURFACE', surfaceId: 'shirt', selection: { itemIds: [order.productId], focalItemId: order.productId, layoutPreset: 'natural' } });
    expect(displayedItems(state).map(item => item.id)).toContain(order.productId);
    step({ type: 'EQUIP_DIGITAL_PRODUCT', productId: order.productId }); expect(ownedDigitalLook(state).shirt).toBe('star-shirt');
    const destination = '/me?section=avatar'; step({ type: 'REMEMBER_FAN_DESTINATION', to: destination });
    expect(homeDestination(state)?.to).toBe(destination);
    const publicFan = currentPublicFan(state); expect(publicFan).not.toHaveProperty('demoAccount'); expect(publicFan).not.toHaveProperty('orders'); expect(JSON.stringify(publicFan)).not.toContain('Private local note');
    saveState(state); state = loadState().state;
    expect(readDisplaySurfaces(state.fanProfile).shirt.itemIds).toEqual([order.productId]); expect(homeDestination(state)?.to).toBe(destination);
    step({ type: 'DEMO_SIGN_OUT' }); expect(canEnterHall(state, 'artist-a')).toBe(false);
    saveState(state); expect(isDemoSignedIn(loadState().state)).toBe(false); expect(ownedCollection(loadState().state).some(item => item.id === order.productId)).toBe(true);
    expect(state.lastError).toBeUndefined();
  });

  it('opens login from a gated Hall and resumes the SAME artist/room before chatting', () => {
    const state = freshGuestState(createInitialState()); state.memberships = {};
    render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/artist/artist-a/hall?room=session-dropin-01']}><Routes><Route element={<FanShell/>}><Route path="/artist/:artistId/hall" element={<ArtistWorldView/>}/></Route></Routes></MemoryRouter></AppProvider>);
    expect(screen.queryByRole('log')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập demo để tiếp tục' }));
    fireEvent.click(screen.getByRole('button', { name: /mô phỏng Google/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục từ đây' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tham gia hội viên (Demo)' }));
    expect(screen.getByRole('log', { name: 'Tin nhắn trong Hall' })).toBeVisible();
    fireEvent.change(screen.getByRole('textbox', { name: 'Gửi lời nhắn trong Hall' }), { target: { value: 'Lời chào trong phòng đúng' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lời nhắn' }));
    expect(loadState().state.hallMessages?.['artist-a'].at(-1)?.sessionId).toBe('session-dropin-01');
  });

  it('distinguishes an unowned collection from a filtered empty list and opens old memory links in the memory mode', () => {
    const state = freshGuestState(createInitialState()); state.orders = {}; state.capsules = {}; state.participations = {};
    render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/me?section=collection']}><CollectionBrowser/></MemoryRouter></AppProvider>);
    expect(screen.getByRole('heading', { name: 'Chưa có vật phẩm đã nhận.' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ghé VieSHOP →' })).toHaveAttribute('href', '/shop');
    expect(screen.queryByRole('button', { name: 'Xem tất cả' })).toBeNull();
    cleanup();
    render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/me?section=collection&type=memory']}><CollectionBrowser/></MemoryRouter></AppProvider>);
    expect(screen.getByRole('button', { name: 'Kỷ niệm & dấu mốc' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Chưa có kỷ niệm ở đây.' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Tìm một cuộc hẹn →' })).toHaveAttribute('href', '/explore');
  });

  it('finishes digital checkout in UI and opens the collection without detouring through an order', () => {
    const state = appReducer(freshGuestState(createInitialState()), { type: 'DEMO_SIGN_IN', provider: 'facebook', mode: 'login' });
    render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/shop?artist=artist-a&product=product-star-shirt-digital']}><Routes>
      <Route path="/shop" element={<FanShopView/>}/><Route path="/cart" element={<CartView/>}/><Route path="/checkout/:checkoutId" element={<CartView/>}/><Route path="/me" element={<FanWorldView/>}/>
    </Routes></MemoryRouter></AppProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ' }));
    fireEvent.click(screen.getByRole('link', { name: 'Xem giỏ →' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra đơn →' })); fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Chốt đơn' }));
    fireEvent.click(screen.getByRole('button', { name: /^Thanh toán thử 45/ }));
    expect(ownedCollection(loadState().state)).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: 'product-star-shirt-digital' })]));
    fireEvent.click(screen.getByRole('button', { name: 'Nhận bản số' }));
    expect(screen.getByText('Đã thêm vào Bộ sưu tập của bạn.')).toBeVisible();
    fireEvent.click(screen.getByRole('link', { name: 'Xem trong Bộ sưu tập →' }));
    expect(screen.getByRole('heading', { name: 'Áo Star Club · Digital' })).toBeVisible();
    expect(ownedCollection(loadState().state).filter(item => item.id === 'product-star-shirt-digital')).toHaveLength(1);
  });

  it('opens the SAME capsule private note from Collection instead of a generic merchandise view', () => {
    let state = createInitialState(); state.capsules = {};
    state = appReducer(state, { type: 'JOIN_LIVE_SESSION', sessionId: 'session-dropin-01' });
    state = appReducer(state, { type: 'END_SESSION', sessionId: 'session-dropin-01' });
    const capsule = Object.values(state.capsules)[0]; capsule.privateNote = 'Ghi chú riêng đúng kỷ niệm';
    state.capsules.other = { ...capsule, id: 'other', sessionId: 'session-listen-01', privateNote: 'Không phải kỷ niệm đang chọn' };
    render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/me?section=collection&mode=memories&type=capsule']}><Routes><Route path="/me" element={<FanWorldView/>}/></Routes></MemoryRouter></AppProvider>);
    fireEvent.click(screen.getByRole('button', { name: `Tùy chọn ${state.sessions[capsule.sessionId].title}` }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Xem chi tiết' }));
    expect(screen.getByRole('textbox', { name: 'Ghi chú riêng' })).toHaveValue('Ghi chú riêng đúng kỷ niệm');
    expect(screen.queryByDisplayValue('Không phải kỷ niệm đang chọn')).toBeNull();
    fireEvent.change(screen.getByRole('textbox',{name:'Ghi chú riêng'}),{target:{value:'Bản ghi chú mới'}});
    fireEvent.click(screen.getByRole('button',{name:'Lưu ghi chú'}));
    expect(loadState().state.capsules[capsule.id].privateNote).toBe('Bản ghi chú mới');
  });
});
