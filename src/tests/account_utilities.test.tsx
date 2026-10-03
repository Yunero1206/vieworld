import { cleanup,fireEvent,render,screen } from '@testing-library/react';
import { MemoryRouter,Route,Routes } from 'react-router-dom';
import { beforeEach,describe,expect,it,vi } from 'vitest';
import { AccountInfoDialog } from '../components/account/AccountInfoDialog';
import { AuthOverlay } from '../components/account/AuthOverlay';
import { PrivacyDialog } from '../components/account/PrivacyDialog';
import { FanShell } from '../components/FanShell';
import { AppProvider,useApp } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import { queryWorldGuide } from '../data/guideKnowledge';
import { appReducer } from '../domain/reducer';
import { loadState,saveState } from '../services/storageAdapter';
import { MemberSpaceView } from '../views/MemberSpaceView';
import { EMPTY_CONTACT,freshGuestState,isDemoSignedIn,privateContact,validateContact } from '../world/account';
import { currentPublicFan } from '../world/community';
import { loadPrivacySettings,savePrivacySettings } from '../world/privacy';

function Probe() { const { state } = useApp(); return <div data-testid="account-probe">{JSON.stringify({ signedIn: isDemoSignedIn(state), contact: privateContact(state), cases: Object.values(state.supportCases) })}</div>; }
beforeEach(() => { cleanup(); localStorage.clear(); });

describe('Demo account, no external identity or ownership mutation', () => {
  it('fresh storage and legacy state without an explicit session remain guests, without deleting data', () => {
    expect(isDemoSignedIn(loadState().state)).toBe(false);
    const legacy = createInitialState(); delete legacy.demoAccount; saveState(legacy);
    expect(isDemoSignedIn(loadState().state)).toBe(false);
    expect(loadState().state.fanProfile.id).toBe(legacy.fanProfile.id);
  });
  it.each(['google', 'facebook'] as const)('%s sign-in preserves membership, products, room, cart and history', provider => {
    const old = freshGuestState(createInitialState());
    const next = appReducer(old, { type: 'DEMO_SIGN_IN', provider, mode: 'register' });
    expect(isDemoSignedIn(next)).toBe(true);
    for (const key of ['memberships', 'products', 'fanProfile', 'orders', 'capsules', 'cart'] as const) expect(next[key]).toBe(old[key]);
    saveState(next); expect(loadState().state.demoAccount?.session?.provider).toBe(provider);
    const out = appReducer(next, { type: 'DEMO_SIGN_OUT' });
    expect(isDemoSignedIn(out)).toBe(false); expect(out.fanProfile).toBe(old.fanProfile); expect(out.orders).toBe(old.orders);
  });
  it('auth overlay explicitly simulates Google/Facebook without password or network', () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<AppProvider initialState={freshGuestState(createInitialState())}><AuthOverlay onClose={vi.fn()}/><Probe/></AppProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));
    expect(screen.queryByLabelText(/mật khẩu/i)).toBeNull();
    fireEvent.change(screen.getByLabelText('Tên hiển thị trong VieWorld'), { target: { value: 'Fan mới' } });
    fireEvent.click(screen.getByRole('button', { name: /mô phỏng Facebook/ }));
    expect(screen.getByRole('status')).toHaveTextContent('góc của Fan mới');
    expect(screen.getByTestId('account-probe')).toHaveTextContent('"signedIn":true');
    expect(fetch).not.toHaveBeenCalled(); fetch.mockRestore();
  });
  it('avatar opens overlay for guests without changing the page', () => {
    render(<AppProvider initialState={freshGuestState(createInitialState())}><MemoryRouter initialEntries={['/shop']}><FanShell/></MemoryRouter></AppProvider>);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(screen.getByTestId('demo-auth-overlay')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Chuyển sang giao diện tối' }));
    expect(screen.getByTestId('app-container')).toHaveAttribute('data-theme', 'dark');
    fireEvent.click(screen.getByRole('button', { name: 'Để sau, tiếp tục khám phá' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('rejects a mismatched account record and guest contact writes', () => {
    const guest = freshGuestState(createInitialState());
    expect(appReducer(guest, { type: 'SAVE_PRIVATE_CONTACT', contact: EMPTY_CONTACT })).toBe(guest);
    guest.demoAccount!.fanId = 'other-fan'; guest.demoAccount!.session = { provider: 'google', mode: 'login' };
    expect(isDemoSignedIn(guest)).toBe(false); expect(privateContact(guest)).toEqual(EMPTY_CONTACT);
  });
});

describe('Contact is private, minimal, validated and separate from public My Space', () => {
  const contact = { ...EMPTY_CONTACT, email: 'demo@example.test', recipient: 'Người nhận mẫu', phone: '0900000000', city: 'TP mẫu', address: '123 Đường mẫu' };
  it('persists contact once without copying it into public projections or old orders', () => {
    const state = createInitialState();
    const updated = appReducer(state, { type: 'SAVE_PRIVATE_CONTACT', contact });
    expect(updated.fanProfile).toBe(state.fanProfile); expect(updated.orders).toBe(state.orders);
    expect(isDemoSignedIn(updated)).toBe(true);
    expect(JSON.stringify(currentPublicFan(updated))).not.toContain('demo@example.test');
    expect(JSON.stringify(currentPublicFan(updated))).not.toContain('123 Đường mẫu');
    saveState(updated); expect(privateContact(loadState().state)).toEqual(contact);
    const out = appReducer(updated, { type: 'DEMO_SIGN_OUT' }); expect(privateContact(out)).toEqual(EMPTY_CONTACT);
    expect(privateContact(appReducer(out, { type: 'DEMO_SIGN_IN', provider: 'google', mode: 'login' }))).toEqual(contact);
  });
  it('accepts no address; rejects malformed email, phone and partial address', () => {
    expect(validateContact(EMPTY_CONTACT)).toBeUndefined();
    expect(validateContact({ ...EMPTY_CONTACT, email: 'broken' })).toMatch(/email/);
    expect(validateContact({ ...contact, phone: 'abc' })).toMatch(/điện thoại/);
    expect(validateContact({ ...EMPTY_CONTACT, recipient: 'Mẫu' })).toMatch(/điền/);
    expect(validateContact({ ...EMPTY_CONTACT, phone: '0900000000' })).toMatch(/điền/);
    expect(validateContact({ ...EMPTY_CONTACT, deliveryNote: 'Ghi chú mẫu' })).toMatch(/điền/);
  });
  it('account form labels fields and gives explicit save feedback', () => {
    render(<AppProvider initialState={createInitialState()}><AccountInfoDialog onClose={vi.fn()}/><Probe/></AppProvider>);
    fireEvent.change(screen.getByLabelText('Email liên hệ (không bắt buộc)'), { target: { value: 'local@example.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thông tin' }));
    expect(screen.getByRole('status')).toHaveTextContent(/Đã lưu|Đã giữ/);
    expect(screen.getByRole('status').closest('footer')).not.toBeNull();
    expect(screen.getByTestId('account-probe')).toHaveTextContent('local@example.test');
  });
});

describe('Consistent utility overlays and truthful privacy/support', () => {
  it('privacy is a cancellable draft and retains existing values', () => {
    const close = vi.fn(); render(<AppProvider initialState={createInitialState()}><PrivacyDialog onClose={close}/></AppProvider>);
    fireEvent.change(screen.getByLabelText('Ai có thể ghé phòng'), { target: { value: 'private' } });
    expect(loadPrivacySettings().roomVisibility).toBe('everyone');
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' })); expect(close).toHaveBeenCalledOnce();
    cleanup(); render(<AppProvider initialState={createInitialState()}><PrivacyDialog onClose={close}/></AppProvider>);
    fireEvent.change(screen.getByLabelText('Ai có thể ghé phòng'), { target: { value: 'private' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu lựa chọn' }));
    expect(loadPrivacySettings().roomVisibility).toBe('private');
  });
  it('private room blocks guest-context preview, not ownership editing', () => {
    savePrivacySettings({ ...loadPrivacySettings(), roomVisibility: 'private' });
    render(<AppProvider initialState={createInitialState()}><MemoryRouter initialEntries={['/members/fan-linh']}><Routes><Route path="/members/:fanId" element={<MemberSpaceView/>}/></Routes></MemoryRouter></AppProvider>);
    expect(screen.getByRole('heading', { name: 'Phòng này chỉ mình bạn xem.' })).toBeVisible();
  });
  it('support cannot open a case for a different fan or tenant', () => {
    const state = createInitialState(); state.benefits['benefit-early-access-01'].fanId = 'different-fan';
    const next = appReducer(state, { type: 'OPEN_SUPPORT_CASE', subjectType: 'benefit', subjectId: 'benefit-early-access-01' });
    expect(Object.keys(next.supportCases)).toHaveLength(0);
  });
  it('guide finds unaccented account keywords without treating your phone as artist private data', () => {
    const result = queryWorldGuide('so dien thoai'); expect(result.type).toBe('answered');
    if (result.type === 'answered') expect(result.cards[0].topic).toBe('account');
    expect(queryWorldGuide('số điện thoại của nghệ sĩ').type).toBe('unsupported_topic');
  });
});
