import { act,fireEvent,render,screen } from '@testing-library/react';
import { MemoryRouter,Route,Routes } from 'react-router-dom';
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AppProvider,useApp } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { _resetMemoryFallbackFlagForTesting,buildStorageKey,collectLocalDemoBackup,loadState,saveState,SCHEMA_VERSION } from '../services/storageAdapter';
import { BenefitDetailView } from '../views/BenefitDetailView';
import { SupportCaseDetailView } from '../views/SupportCaseDetailView';
import { freshGuestState,isDemoSignedIn } from '../world/account';
import { canEnterHall,ownsDigitalProduct } from '../world/merchCatalog';

beforeEach(() => { localStorage.clear(); _resetMemoryFallbackFlagForTesting(); });
afterEach(() => vi.restoreAllMocks());

describe('Showcase connection and recovery guards', () => {
  it('does not render private benefit/support records belonging to another fan or tenant', () => {
    const state = createInitialState();
    const benefit = Object.values(state.benefits)[0]; benefit.fanId = 'foreign-fan';
    state.supportCases.foreign = { id: 'foreign', tenantId: 'mfan-demo', fanId: state.fanProfile.id, version: 1, updatedAt: state.demoTime, subjectType: 'benefit', subjectId: benefit.id, status: 'open', nextAction: 'Private foreign case' };
    const mounted = render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/support/foreign']}><Routes><Route path="/support/:caseId" element={<SupportCaseDetailView/>}/></Routes></MemoryRouter></AppProvider>);
    expect(screen.getByRole('heading', { name: 'Không tìm thấy hồ sơ hỗ trợ' })).toBeVisible();
    expect(screen.queryByText('Private foreign case')).toBeNull(); mounted.unmount();
    render(<AppProvider initialState={state}><MemoryRouter initialEntries={[`/benefits/${benefit.id}`]}><Routes><Route path="/benefits/:benefitId" element={<BenefitDetailView/>}/></Routes></MemoryRouter></AppProvider>);
    expect(screen.getByRole('heading', { name: 'Không tìm thấy quyền lợi' })).toBeVisible();
  });
  it('revokes private Hall access on logout, preserves records and restores access after demo sign-in', () => {
    const state = createInitialState(); expect(canEnterHall(state, 'artist-a')).toBe(true);
    const out = appReducer(state, { type: 'DEMO_SIGN_OUT' });
    expect(canEnterHall(out, 'artist-a')).toBe(false);
    expect(out.hallMessages).toBe(state.hallMessages);
    expect(appReducer(out, { type: 'UPGRADE_MEMBERSHIP', worldId: 'artist-c' }).lastError?.code).toBe('DEMO_LOGIN_REQUIRED');
    const denied = appReducer(out, { type: 'SEND_HALL_MESSAGE', worldId: 'artist-a', text: 'Private', requestId: 'guest' });
    expect(denied.hallMessages).toBe(out.hallMessages);
    expect(canEnterHall(appReducer(out, { type: 'DEMO_SIGN_IN', provider: 'google', mode: 'login' }), 'artist-a')).toBe(true);
  });
  it('does not grant digital equipment through another tenant receipt', () => {
    const state = createInitialState(); const product = state.products['product-cap-digital'];
    state.orders.foreign = { id: 'foreign', tenantId: 'mfan-demo', version: 1, updatedAt: state.demoTime, fanId: state.fanProfile.id, worldId: 'artist-a', productId: product.id, status: 'fulfilled', createdAt: state.demoTime, sourceRef: 'demo', requestId: 'foreign' };
    expect(ownsDigitalProduct(state, product)).toBe(false);
    expect(appReducer(state, { type: 'EQUIP_DIGITAL_PRODUCT', productId: product.id }).lastError?.code).toBe('DIGITAL_NOT_OWNED');
  });
  it('renews an expired active membership instead of getting stuck in an idempotent no-op', () => {
    const state = createInitialState(); const member = Object.values(state.memberships).find(item => item.worldId === 'artist-a')!;
    member.expiresAt = '2025-01-01T00:00:00Z'; expect(canEnterHall(state, 'artist-a')).toBe(false);
    const renewed = appReducer(state, { type: 'UPGRADE_MEMBERSHIP', worldId: 'artist-a' });
    expect(canEnterHall(renewed, 'artist-a')).toBe(true);
    expect(renewed.benefits).toBe(state.benefits);
  });
  it.each(['{{broken', JSON.stringify({ schemaVersion: SCHEMA_VERSION, state: { activeTenantId: 'vieworld-demo' } })])('preserves unreadable/partial original data before recovering (%s)', raw => {
    const key = buildStorageKey('vieworld-demo'); localStorage.setItem(key, raw);
    const result = loadState(); expect(result.recoveredFromError).toBe(true);
    expect(isDemoSignedIn(result.state)).toBe(false);
    saveState(result.state); expect(collectLocalDemoBackup()[`${key}_recovery`]).toBe(raw);
    expect(loadState().recoveredFromError).toBeFalsy();
  });
  it('exports canonical state, privacy and namespaced settings but not unrelated storage', () => {
    const state = createInitialState(); saveState(state);
    localStorage.setItem('vieworld:appearance', 'dark'); localStorage.setItem('vieworld_privacy_settings', '{}'); localStorage.setItem('unrelated_secret', 'do not export');
    const dump = collectLocalDemoBackup(); expect(dump[buildStorageKey(state.activeTenantId)]).toContain('fan-linh');
    expect(dump['vieworld:appearance']).toBe('dark'); expect(dump.vieworld_privacy_settings).toBe('{}'); expect(dump).not.toHaveProperty('unrelated_secret');
  });
  it('reports memory-only writes as non-durable and exposes a visible warning immediately', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('Quota'); });
    expect(saveState(freshGuestState(createInitialState()))).toBe(false);
    function Probe() { const app = useApp(); return <p>{String(app.isMemoryFallback)} · {app.storageNotice}</p>; }
    render(<AppProvider initialState={createInitialState()}><Probe/></AppProvider>);
    expect(screen.getByText(/true · Trình duyệt không lưu được/)).toBeVisible();
    expect(isDemoSignedIn(loadState().state)).toBe(true);
  });
  it('pauses stale autosave when another tab changes the same fan, not an unrelated tenant', () => {
    function Probe() { const { state, dispatch, persistenceConflict } = useApp(); return <button onClick={() => dispatch({ type: 'TOGGLE_FOLLOW', worldId: 'artist-c' })}>{String(persistenceConflict)} · {state.followedWorldIds.length}</button>; }
    render(<AppProvider initialState={createInitialState()}><Probe/></AppProvider>);
    const key = buildStorageKey('vieworld-demo'); const raw = localStorage.getItem(key);
    const notify = (changedKey: string) => { const event = new StorageEvent('storage', { key: changedKey, oldValue: 'old', newValue: 'new' }); Object.defineProperty(event, 'storageArea', { value: localStorage }); window.dispatchEvent(event); };
    act(() => notify(buildStorageKey('mfan-demo')));
    expect(screen.getByRole('button')).toHaveTextContent('false');
    act(() => notify(key));
    fireEvent.click(screen.getByRole('button')); expect(screen.getByRole('button')).toHaveTextContent('true');
    expect(localStorage.getItem(key)).toBe(raw);
  });
  it('can leave a failed route without requiring a destructive reset', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    function Broken({ broken }: { broken: boolean }) { if (broken) throw new Error('Lazy route unavailable'); return <p>Recovered route</p>; }
    const view = render(<ErrorBoundary resetKey="/artist/a"><Broken broken/></ErrorBoundary>);
    expect(screen.getByTestId('error-boundary-fallback')).toBeVisible();
    view.rerender(<ErrorBoundary resetKey="/shop"><Broken broken={false}/></ErrorBoundary>);
    expect(screen.getByText('Recovered route')).toBeVisible();
  });
});
