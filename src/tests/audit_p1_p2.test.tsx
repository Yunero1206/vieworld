import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { FanShell } from '../components/FanShell';
import { FanShopView } from '../views/FanShopView';
import { CartView } from '../views/CartView';
import { InboxView } from '../views/InboxView';
import { createInitialState } from '../data/fixtures';
import { resolveStandeeEvent, getTruthfulSessionStatus } from '../world/eventStatus';
import { DEFAULT_PRIVACY, canAccessRoom, loadPrivacySettings, savePrivacySettings } from '../world/privacy';
import { checkProductEligibility } from '../world/commerce';
import { saveState } from '../services/storageAdapter';

describe('Audit P1 & P2 Quality Verification Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = vi.fn();
  });

  describe('1. Truthful Session Status Resolution', () => {
    const baseSession = {
      id: 's1',
      worldId: 'artist-a',
      title: 'Hát ngẫu hứng',
      scheduledStart: '2026-09-20T20:00:00Z',
      scheduledStartTime: '2026-09-20T20:00:00Z',
      scheduledEnd: '2026-09-20T22:00:00Z',
      format: 'dropin' as const,
      mediaMode: 'audio' as const,
      artistPresence: 'present' as const,
      audioTrackUrl: '',
      spatialEnabled: false,
      chatEnabled: true,
      questionsEnabled: true,
      replayAllowed: true,
      hostRole: 'artist' as const,
      segmentMode: 'live' as const,
      aiUse: 'none' as const,
      replayStatus: 'not_planned' as const,
      demo: true as const,
      tenantId: 'vieworld-demo' as const,
      version: 1,
      updatedAt: '2026-09-20T20:00:00Z',
    };

    it('identifies running sessions truthfully as LIVE', () => {
      const running = { ...baseSession, status: 'running' as const };
      expect(getTruthfulSessionStatus(running, '2026-09-20T20:30:00Z')).toBe('live');
    });

    it('identifies open lobby sessions as open (Sảnh mở)', () => {
      const open = { ...baseSession, status: 'open' as const };
      expect(getTruthfulSessionStatus(open, '2026-09-20T19:50:00Z')).toBe('open');
    });

    it('identifies future scheduled sessions as upcoming, and past scheduled as ended', () => {
      const scheduled = { ...baseSession, status: 'scheduled' as const };
      expect(getTruthfulSessionStatus(scheduled, '2026-09-20T19:00:00Z')).toBe('upcoming');
      // If demo time is past scheduledStartTime
      expect(getTruthfulSessionStatus(scheduled, '2026-09-20T21:00:00Z')).toBe('ended');
    });

    it('resolveStandeeEvent returns active running session first with kind live as general announcement', () => {
      const s = createInitialState('vieworld-demo');
      const sessions = {
        s1: { ...baseSession, status: 'running' as const },
      };
      const resolved = resolveStandeeEvent(sessions, s.worlds, s.demoTime);
      expect(resolved).toBeDefined();
      expect(resolved?.kind).toBe('live');
      expect(resolved?.eyebrow).toBe('THÔNG BÁO CHUNG');
    });

    it('resolveStandeeEvent returns open lobby with kind open as general announcement', () => {
      const s = createInitialState('vieworld-demo');
      const sessions = {
        s1: { ...baseSession, status: 'open' as const },
      };
      const resolved = resolveStandeeEvent(sessions, s.worlds, s.demoTime);
      expect(resolved).toBeDefined();
      expect(resolved?.kind).toBe('open');
      expect(resolved?.eyebrow).toBe('THÔNG BÁO CHUNG');
    });
  });

  describe('2. Space Privacy Access Control', () => {
    it('initializes with default public privacy settings', () => {
      const settings = loadPrivacySettings();
      expect(settings).toEqual(DEFAULT_PRIVACY);
      expect(settings.roomVisibility).toBe('everyone');
      expect(settings.showVisitCount).toBe(true);
      expect(settings.guestbookEnabled).toBe(true);
    });

    it('persists customized privacy settings', () => {
      savePrivacySettings({
        roomVisibility: 'users',
        showVisitCount: false,
        guestbookEnabled: false,
        showMembershipSignal: false,
      });
      const updated = loadPrivacySettings();
      expect(updated.roomVisibility).toBe('users');
      expect(updated.showVisitCount).toBe(false);
      expect(updated.guestbookEnabled).toBe(false);
    });

    it('canAccessRoom honors privacy levels correctly', () => {
      // Owner always has access
      expect(canAccessRoom({ roomVisibility: 'private', showVisitCount: false, guestbookEnabled: false, showMembershipSignal: false }, true, false)).toBe(true);

      // Everyone is accessible to anyone
      expect(canAccessRoom({ roomVisibility: 'everyone', showVisitCount: true, guestbookEnabled: true, showMembershipSignal: true }, false, false)).toBe(true);

      // Private is denied to non-owners
      expect(canAccessRoom({ roomVisibility: 'private', showVisitCount: true, guestbookEnabled: true, showMembershipSignal: true }, false, true)).toBe(false);

      // Users only
      expect(canAccessRoom({ roomVisibility: 'users', showVisitCount: true, guestbookEnabled: true, showMembershipSignal: true }, false, true)).toBe(true);
      expect(canAccessRoom({ roomVisibility: 'users', showVisitCount: true, guestbookEnabled: true, showMembershipSignal: true }, false, false)).toBe(false);
    });
  });

  describe('3. Commerce Product Eligibility Checks', () => {
    it('allows eligible products with positive stock and satisfied benefits', () => {
      const s = createInitialState('vieworld-demo');
      const product = Object.values(s.products).find(p => !p.requiredBenefitId && p.stockCount > 0)!;
      const res = checkProductEligibility(s, product);
      expect(res.eligible).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    it('blocks products with zero stock', () => {
      const s = createInitialState('vieworld-demo');
      const product = { ...Object.values(s.products)[0], stockCount: 0 };
      const res = checkProductEligibility(s, product);
      expect(res.eligible).toBe(false);
      expect(res.reason).toContain('không đủ tồn kho');
    });

    it('blocks products requiring unowned membership benefit', () => {
      const s = createInitialState('vieworld-demo');
      const product = { ...Object.values(s.products)[0], stockCount: 10, requiredBenefitId: 'unowned-vip-pass' };
      const res = checkProductEligibility(s, product);
      expect(res.eligible).toBe(false);
      expect(res.reason).toContain('hội viên còn hợp lệ');
    });
  });

  describe('4. FanShell Header Tools & Cart Access', () => {
    it('displays persistent cart button with item count', () => {
      const s = createInitialState('vieworld-demo');
      const product = Object.values(s.products)[0];
      s.cart = [{ key: 'k1', productId: product.id, quantity: 2 }];
      saveState(s);

      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/shop']}>
            <Routes>
              <Route element={<FanShell />}>
                <Route path="/shop" element={<FanShopView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      const cartLinks = screen.getAllByRole('link', { name: /Giỏ hàng/i });
      expect(cartLinks.length).toBeGreaterThanOrEqual(1);
      expect(cartLinks[0]).toHaveAttribute('href', '/cart');
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. CartView Truthful Stepper and Sandbox QR Disclosures', () => {
    it('labels step 3 "Đã thanh toán · Đang chuẩn bị" when paid but not fulfilled', () => {
      const s = createInitialState('vieworld-demo');
      const product = Object.values(s.products)[0];
      const checkoutId = 'checkout-test-123';
      s.orders['order-test-1'] = {
        id: 'order-test-1',
        checkoutId,
        fanId: s.fanProfile.id,
        tenantId: s.activeTenantId,
        worldId: 'artist-a',
        productId: product.id,
        status: 'paid',
        quantity: 1,
        unitPriceVND: 100000,
        createdAt: s.demoTime,
        updatedAt: s.demoTime,
        version: 1,
        sourceRef: 'test',
        requestId: 'req-test-1',
      };
      saveState(s);

      render(
        <AppProvider>
          <MemoryRouter initialEntries={[`/checkout/${checkoutId}`]}>
            <Routes>
              <Route path="/checkout/:checkoutId" element={<CartView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      expect(screen.getByText('Đã thanh toán · Đang chuẩn bị')).toBeInTheDocument();
      // Step 4 "Nhận đồ" should NOT have aria-current="step"
      const step4 = screen.getByText('Nhận đồ').closest('li');
      expect(step4).not.toHaveAttribute('aria-current', 'step');
    });

    it('highlights step 4 "Nhận đồ" only when all items are fulfilled', () => {
      const s = createInitialState('vieworld-demo');
      const product = Object.values(s.products)[0];
      const checkoutId = 'checkout-fulfilled-123';
      s.orders['order-test-2'] = {
        id: 'order-test-2',
        checkoutId,
        fanId: s.fanProfile.id,
        tenantId: s.activeTenantId,
        worldId: 'artist-a',
        productId: product.id,
        status: 'fulfilled',
        quantity: 1,
        unitPriceVND: 100000,
        createdAt: s.demoTime,
        updatedAt: s.demoTime,
        version: 1,
        sourceRef: 'test',
        requestId: 'req-test-2',
      };
      saveState(s);

      render(
        <AppProvider>
          <MemoryRouter initialEntries={[`/checkout/${checkoutId}`]}>
            <Routes>
              <Route path="/checkout/:checkoutId" element={<CartView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      const step4 = screen.getByText('Nhận đồ').closest('li');
      expect(step4).toHaveAttribute('aria-current', 'step');
    });

    it('displays explicit Demo Sandbox QR notice and honest CTA button', () => {
      const s = createInitialState('vieworld-demo');
      const product = Object.values(s.products)[0];
      const checkoutId = 'checkout-pending-123';
      s.orders['order-test-3'] = {
        id: 'order-test-3',
        checkoutId,
        fanId: s.fanProfile.id,
        tenantId: s.activeTenantId,
        worldId: 'artist-a',
        productId: product.id,
        status: 'pending',
        quantity: 1,
        unitPriceVND: 100000,
        createdAt: s.demoTime,
        updatedAt: s.demoTime,
        version: 1,
        sourceRef: 'test',
        requestId: 'req-test-3',
      };
      saveState(s);

      render(
        <AppProvider>
          <MemoryRouter initialEntries={[`/checkout/${checkoutId}`]}>
            <Routes>
              <Route path="/checkout/:checkoutId" element={<CartView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Select QR payment method
      fireEvent.click(screen.getByRole('button', { name: /Quét MoMo \/ VNPay QR/i }));

      // Demo sandbox tag must be visible
      expect(screen.getByText('Mã QR thanh toán mô phỏng (Demo Sandbox)')).toBeInTheDocument();

      // CTA button must not claim real payment was verified
      const confirmBtn = screen.getByRole('button', { name: /Xác nhận thanh toán thử nghiệm \(Demo\) · Không trừ tiền thật/i });
      expect(confirmBtn).toBeInTheDocument();
    });
  });

  describe('6. InboxView Transparency Banner and Contextual CTAs', () => {
    it('renders collapsible transparency disclaimer and actionable contextual CTAs', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/inbox']}>
            <Routes>
              <Route path="/inbox" element={<InboxView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Details disclosure exists
      expect(screen.getByText(/CAM KẾT MINH BẠCH/i)).toBeInTheDocument();

      // Check contextual buttons (e.g. "Xem vụ việc hỗ trợ", "Xem đơn hàng", "Xem phiên trực tiếp")
      const actionButtons = screen.getAllByRole('button');
      const hasSpecificCta = actionButtons.some(b =>
        b.textContent?.includes('Xem') || b.textContent?.includes('Đọc')
      );
      expect(hasSpecificCta).toBe(true);
    });
  });
});
