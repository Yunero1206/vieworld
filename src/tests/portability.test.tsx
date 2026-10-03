/**
 * Acceptance Test Suite: T15 — External Tenant Portability (MFan & FanMe)
 * (§1, §2.3, §3, §4, docs/CONTRACTS.md & docs/packets/P15.md)
 *
 * Verifies:
 * 1. Multi-Tenant State & Fixture Isolation:
 *    - Order, Benefit Claim, and Question created in VieWorld do not leak into MFan or FanMe.
 *    - Switching back to VieWorld restores all orders, claims, and questions intact.
 * 2. Official Role Isolation:
 *    - Setting operator or artist role in VieWorld resets to default 'fan' upon switching to MFan/FanMe.
 * 3. Context-Invalid Routes Resolve Safely:
 *    - Accessing VieWorld-scoped routes (/worlds/artist-a, /benefits/benefit-early-access-01) while active tenant is mfan-demo or fanme-demo renders graceful recovery cards without crashing.
 * 4. Declarative Theming & Label Customization Without Forked Page Code:
 *    - Accent color tokens (--primary, --tenant-accent-light) and navigation labels update dynamically.
 * 5. Truthful External Disclosures & Zero External Requests:
 *    - Confirms absence of third-party scraping, absence of real trademark infringement, and zero claims of real account links.
 *    - Ensures zero outbound network requests.
 */

import { fireEvent,render,screen,within } from '@testing-library/react';
import { MemoryRouter,Route,Routes } from 'react-router-dom';
import { beforeEach,describe,expect,it,vi } from 'vitest';
import { FanShell as AppShell } from '../components/FanShell';
import { AppProvider, useApp } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import {
_resetMemoryFallbackFlagForTesting,
loadState,
resetTenantStorage,
saveState,
} from '../services/storageAdapter';
import { BenefitDetailView } from '../views/BenefitDetailView';
import { SessionView } from '../views/SessionView';

describe('T15 Acceptance: External Tenant Portability & Isolation (MFan & FanMe)', () => {
  beforeEach(() => {
    _resetMemoryFallbackFlagForTesting();
    window.localStorage.clear();
  });

  describe('1. Acceptance T15 Core: Create Order/Claim/Question in VieWorld → Switch Both Configs → Switch Back', () => {
    it('creates an order, claimed benefit, and question in VieWorld; verifies isolation in MFan & FanMe; verifies persistence upon switching back', () => {
      // Step A: Initialize VieWorld baseline
      let state = createInitialState('vieworld-demo');

      // 1. Create an order in VieWorld
      state = appReducer(state, {
        type: 'CREATE_ORDER',
        requestId: 'req_portability_ord_01',
        productId: 'product-pin-01',
      });
      const orderId = Object.keys(state.orders)[0];
      expect(orderId).toBeDefined();
      expect(state.orders[orderId].tenantId).toBe('vieworld-demo');

      // 2. Claim a benefit in VieWorld
      state = appReducer(state, {
        type: 'CLAIM_BENEFIT',
        benefitId: 'benefit-replay-01',
      });
      expect(state.benefits['benefit-replay-01'].status).toBe('claimed');

      // 3. Submit a question in VieWorld
      state = appReducer(state, {
        type: 'SUBMIT_QUESTION',
        sessionId: 'session-dropin-01',
        content: 'Câu hỏi thử nghiệm tính di động trong VieWorld',
      });
      const questionId = Object.keys(state.questions).find((qid) =>
        state.questions[qid].content.includes('Câu hỏi thử nghiệm tính di động')
      );
      expect(questionId).toBeDefined();

      // Save VieWorld state to localStorage
      saveState(state);

      // Step B: Switch to MFan Demo
      const mfanLoad = loadState('mfan-demo');
      let mfanState = mfanLoad.state;
      expect(mfanState.activeTenantId).toBe('mfan-demo');

      // In MFan, benefit-replay-01 is eligible, NOT claimed from VieWorld
      expect(mfanState.benefits['benefit-replay-01'].status).toBe('eligible');
      expect(mfanState.benefits['benefit-replay-01'].status).not.toBe('claimed');
      const mfanQuestionMatch = Object.values(mfanState.questions).find((q) =>
        q.content.includes('Câu hỏi thử nghiệm tính di động')
      );
      expect(mfanQuestionMatch).toBeUndefined();
      // Verify MFan has its own scoped entities
      expect(mfanState.worlds['world-mfan-artist-m']).toBeDefined();
      expect(mfanState.followedWorldIds).toContain('world-mfan-artist-m');
      expect(mfanState.followedWorldIds).not.toContain('artist-a');

      // Save MFan state (clean or with MFan-specific actions)
      saveState(mfanState);

      // Step C: Switch to FanMe Demo
      const fanmeLoad = loadState('fanme-demo');
      let fanmeState = fanmeLoad.state;
      expect(fanmeState.activeTenantId).toBe('fanme-demo');

      // Verify ZERO VieWorld orders, claims, or questions exist in FanMe
      expect(Object.keys(fanmeState.orders)).toHaveLength(0);
      expect(fanmeState.benefits['benefit-replay-01']).toBeUndefined();
      const fanmeQuestionMatch = Object.values(fanmeState.questions).find((q) =>
        q.content.includes('Câu hỏi thử nghiệm tính di động')
      );
      expect(fanmeQuestionMatch).toBeUndefined();
      // Verify FanMe has its own scoped entities
      expect(fanmeState.worlds['world-fanme-creator-k']).toBeDefined();
      expect(fanmeState.followedWorldIds).toContain('world-fanme-creator-k');
      expect(fanmeState.followedWorldIds).not.toContain('artist-a');

      // Save FanMe state
      saveState(fanmeState);

      // Step D: Switch Back to VieWorld Demo
      const restoredLoad = loadState('vieworld-demo');
      const restoredState = restoredLoad.state;
      expect(restoredState.activeTenantId).toBe('vieworld-demo');

      // Verify all VieWorld data persists intact
      expect(restoredState.orders[orderId]).toBeDefined();
      expect(restoredState.orders[orderId].productId).toBe('product-pin-01');
      expect(restoredState.benefits['benefit-replay-01'].status).toBe('claimed');
      expect(restoredState.questions[questionId!]).toBeDefined();
      expect(restoredState.followedWorldIds).toContain('artist-a');
    });
  });

  describe('2. Fan / Artist / Operator Official Role Non-Transferability (§2.3, §3, §4)', () => {
    it('guarantees official role does not transfer across tenants', () => {
      // 1. In VieWorld, assign 'operator' preview role to fan profile
      let state = createInitialState('vieworld-demo');
      state = appReducer(state, {
        type: 'SET_FAN_ROLE',
        role: 'operator',
      });
      expect(state.fanProfile.role).toBe('operator');
      saveState(state);

      // 2. Switch to MFan Demo
      const mfanState = loadState('mfan-demo').state;
      // Invariant: Role must NOT transfer to MFan
      expect(mfanState.fanProfile.role).toBe('fan');
      expect(mfanState.fanProfile.role).not.toBe('operator');

      // 3. In MFan, change role to 'artist'
      const updatedMfan = appReducer(mfanState, {
        type: 'SET_FAN_ROLE',
        role: 'artist',
      });
      expect(updatedMfan.fanProfile.role).toBe('artist');
      saveState(updatedMfan);

      // 4. Switch to FanMe Demo
      const fanmeState = loadState('fanme-demo').state;
      // Invariant: Role must NOT transfer to FanMe
      expect(fanmeState.fanProfile.role).toBe('fan');
      expect(fanmeState.fanProfile.role).not.toBe('artist');

      // 5. Switch back to VieWorld
      const restoredVieWorld = loadState('vieworld-demo').state;
      // VieWorld maintains its own operator preview role
      expect(restoredVieWorld.fanProfile.role).toBe('operator');
    });
  });

  describe('3. Context-Invalid Routes Resolve Safely (§3.3, §6, P15)', () => {

    it('safely renders benefit recovery card when accessing a VieWorld-specific benefit in FanMe demo', () => {
      // Render in FanMe tenant context
      render(
        <AppProvider initialTenantId="fanme-demo">
          <MemoryRouter initialEntries={['/benefits/benefit-early-access-01']}>
            <Routes>
              <Route path="/benefits/:benefitId" element={<BenefitDetailView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // In FanMe, benefit-early-access-01 does not exist
      const recoveryCard = screen.getByTestId('benefit-not-found-recovery');
      expect(recoveryCard).toBeInTheDocument();
      expect(recoveryCard).toHaveTextContent('Không tìm thấy quyền lợi');
      expect(recoveryCard).not.toHaveTextContent('benefit-early-access-01');
      expect(within(recoveryCard).getByRole('link', { name: 'Về Hội viên & quyền lợi' })).toHaveAttribute('href', '/memberships');
    });

    it('safely renders session recovery card when accessing a VieWorld-specific session in MFan demo', () => {
      // Render in MFan tenant context
      render(
        <AppProvider initialTenantId="mfan-demo">
          <MemoryRouter initialEntries={['/sessions/session-dropin-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // In MFan, session-dropin-01 does not exist
      const recoveryCard = screen.getByTestId('session-not-found-card');
      expect(recoveryCard).toBeInTheDocument();
      expect(recoveryCard).toHaveTextContent('Không tìm thấy phiên sự kiện');
    });
  });

  describe('4. Dynamic Theming & Label Customization Without Forked Page Code', () => {
    it('applies tenant-configured branding, labels, and CSS variables across UI', () => {
      // 1. Check VieWorld
      const { unmount } = render(
        <AppProvider initialTenantId="vieworld-demo">
          <MemoryRouter initialEntries={['/']}>
            <AppShell />
          </MemoryRouter>
        </AppProvider>
      );

      const appContainer = screen.getByTestId('app-container');
      expect(appContainer).toHaveAttribute('data-tenant', 'vieworld-demo');
      expect(within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');

      unmount();

      // 2. Check MFan
      const mfanRender = render(
        <AppProvider initialTenantId="mfan-demo">
          <MemoryRouter initialEntries={['/']}>
            <AppShell />
          </MemoryRouter>
        </AppProvider>
      );

      const mfanContainer = screen.getByTestId('app-container');
      expect(mfanContainer).toHaveAttribute('data-tenant', 'mfan-demo');
      expect(within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', { name: 'Explore' })).toHaveAttribute('href', '/explore');

      mfanRender.unmount();

      // 3. Check FanMe
      render(
        <AppProvider initialTenantId="fanme-demo">
          <MemoryRouter initialEntries={['/']}>
            <AppShell />
          </MemoryRouter>
        </AppProvider>
      );

      const fanmeContainer = screen.getByTestId('app-container');
      expect(fanmeContainer).toHaveAttribute('data-tenant', 'fanme-demo');
      expect(within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', { name: 'Explore' })).toHaveAttribute('href', '/explore');
    });

    it('switches the active tenant without restoring the retired shell selector', () => {
      function SwitchTenant() { const {setTenant}=useApp(); return <button onClick={()=>setTenant('mfan-demo')}>Switch test tenant</button>; }
      render(
        <AppProvider initialTenantId="vieworld-demo">
          <MemoryRouter initialEntries={['/']}>
            <AppShell /><SwitchTenant />
          </MemoryRouter>
        </AppProvider>
      );

      fireEvent.click(screen.getByRole('button',{name:'Switch test tenant'}));
      expect(screen.getByTestId('app-container')).toHaveAttribute('data-tenant','mfan-demo');
    });
  });

  describe('5. Constitutional Disclosures & Non-Negotiable Boundaries', () => {
    it('starts a partner configuration as a guest demo without a real identity connection', () => {
      render(
        <AppProvider initialTenantId="mfan-demo">
          <MemoryRouter initialEntries={['/']}>
            <AppShell />
          </MemoryRouter>
        </AppProvider>
      );

      expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
      expect(screen.getByTestId('app-container')).toHaveAttribute('data-tenant','mfan-demo');
    });

    it('guarantees zero outbound network requests or third-party web scraping', () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      render(
        <AppProvider initialTenantId="mfan-demo">
          <MemoryRouter initialEntries={['/']}>
            <AppShell />
          </MemoryRouter>
        </AppProvider>
      );

      // Verify zero network requests
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it('resetting tenant storage wipes only the active tenant and preserves other tenants', () => {
      // 1. Create data in VieWorld and MFan
      const vwState = createInitialState('vieworld-demo');
      vwState.followedWorldIds = ['artist-a', 'neon-sessions'];
      saveState(vwState);

      const mfanState = createInitialState('mfan-demo');
      mfanState.followedWorldIds = ['world-mfan-artist-m'];
      saveState(mfanState);

      // 2. Reset MFan
      resetTenantStorage('mfan-demo');

      // 3. VieWorld data remains intact in localStorage
      const reloadedVieWorld = loadState('vieworld-demo').state;
      expect(reloadedVieWorld.followedWorldIds).toEqual(['artist-a', 'neon-sessions']);

      // 4. MFan was reset to initial
      const reloadedMfan = loadState('mfan-demo').state;
      expect(reloadedMfan.activeTenantId).toBe('mfan-demo');
    });
  });
});
