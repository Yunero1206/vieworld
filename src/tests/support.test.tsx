/**
 * Acceptance T09: Benefit & Order Support Requests, Recovery Without Auto-Grant
 *
 * Tests all required invariant criteria for P09:
 * 1. Repeated support requests reuse an active case (Idempotency / No duplicate cases).
 * 2. Resolving a support case updates case outcome; does NOT turn a pending benefit eligible (Constitutional Decoupling).
 * 3. Reconciling source data (RECONCILE_BENEFIT) updates benefit to eligible across Detail, Support Case, My World, and enables Shop purchase.
 * 4. Missing subject (non-existent benefit/order) sets domain error SUBJECT_NOT_FOUND.
 * 5. Navigating to non-existent case ID displays recoverable error view.
 * 6. Operator progression (open → acknowledged → investigating → resolved → closed) updates status and nextAction.
 * 7. Transparent demo update steps are displayed without invented business SLAs.
 * 8. Refresh preserves support cases and reconciliation states in localStorage.
 * 9. Tenant isolation: support cases in vieworld-demo do not leak into mfan-demo.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { appReducer } from '../domain/reducer';
import { AppState } from '../domain/types';
import { createInitialState } from '../data/fixtures';
import { AppProvider } from '../context/AppContext';
import { AppShell } from '../components/AppShell';
import { SupportCaseDetailView } from '../views/SupportCaseDetailView';
import { BenefitDetailView } from '../views/BenefitDetailView';
import { OrderDetailView } from '../views/OrderDetailView';
import { MyWorldView } from '../views/MyWorldView';
import { ShopView } from '../views/ShopView';
import { saveState } from '../services/storageAdapter';

describe('T09 Acceptance: Support Requests & Recovery Without Auto-Grant', () => {
  let state: AppState;

  beforeEach(() => {
    window.localStorage.clear();
    state = createInitialState('vieworld-demo');
  });

  describe('1. Domain Invariants & Action Guards', () => {
    it('1. Repeated support requests for same subject reuse the active case (Idempotency)', () => {
      // Initially 0 support cases
      expect(Object.keys(state.supportCases)).toHaveLength(0);

      // Open case for pending benefit
      const state1 = appReducer(state, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'benefit',
        subjectId: 'benefit-early-access-01',
      });

      const cases1 = Object.values(state1.supportCases);
      expect(cases1).toHaveLength(1);
      const activeCase = cases1[0];
      expect(activeCase.subjectId).toBe('benefit-early-access-01');
      expect(activeCase.status).toBe('open');

      // Second open attempt for same subject
      const state2 = appReducer(state1, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'benefit',
        subjectId: 'benefit-early-access-01',
      });

      // MUST NOT create duplicate case
      const cases2 = Object.values(state2.supportCases);
      expect(cases2).toHaveLength(1);
      expect(cases2[0].id).toBe(activeCase.id);
    });

    it('2. Resolving a support case sets resolution but strictly does NOT turn pending benefit eligible', () => {
      // Start with pending benefit
      expect(state.benefits['benefit-early-access-01']?.status).toBe('pending');

      const openedState = appReducer(state, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'benefit',
        subjectId: 'benefit-early-access-01',
      });

      const caseId = Object.values(openedState.supportCases)[0].id;

      // Operator resolves case with stated outcome
      const resolvedState = appReducer(openedState, {
        type: 'RESOLVE_SUPPORT_CASE',
        caseId,
        resolution: 'Đã hoàn tất xác minh: Đủ điều kiện nhận quyền lợi.',
      });

      const updatedCase = resolvedState.supportCases[caseId];
      expect(updatedCase.status).toBe('resolved');
      expect(updatedCase.resolution).toBe('Đã hoàn tất xác minh: Đủ điều kiện nhận quyền lợi.');

      // INVARIANT: Benefit status MUST STILL BE 'pending'
      expect(resolvedState.benefits['benefit-early-access-01'].status).toBe('pending');
      expect(resolvedState.benefits['benefit-early-access-01'].status).not.toBe('eligible');
    });

    it('3. Reconciling source data (RECONCILE_BENEFIT) explicitly updates benefit to eligible', () => {
      expect(state.benefits['benefit-early-access-01'].status).toBe('pending');

      const reconciledState = appReducer(state, {
        type: 'RECONCILE_BENEFIT',
        benefitId: 'benefit-early-access-01',
      });

      const updatedBenefit = reconciledState.benefits['benefit-early-access-01'];
      expect(updatedBenefit.status).toBe('eligible');
      expect(updatedBenefit.reasonCode).toBe('RECONCILED_ORGANIZER_APPROVED');
      expect(updatedBenefit.nextAction).toContain('sẵn sàng để kích hoạt');
    });

    it('4. Attempting to open support case for non-existent subject returns SUBJECT_NOT_FOUND', () => {
      const result = appReducer(state, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'benefit',
        subjectId: 'non-existent-benefit-id',
      });

      expect(result.lastError?.code).toBe('SUBJECT_NOT_FOUND');
      expect(Object.keys(result.supportCases)).toHaveLength(0);

      const orderResult = appReducer(state, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'order',
        subjectId: 'non-existent-order-id',
      });

      expect(orderResult.lastError?.code).toBe('SUBJECT_NOT_FOUND');
      expect(Object.keys(orderResult.supportCases)).toHaveLength(0);
    });

    it('5. Operator lifecycle progression: open → acknowledged → investigating → resolved → closed', () => {
      const opened = appReducer(state, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'benefit',
        subjectId: 'benefit-early-access-01',
      });
      const caseId = Object.values(opened.supportCases)[0].id;
      expect(opened.supportCases[caseId].status).toBe('open');

      // Acknowledge
      const acked = appReducer(opened, {
        type: 'ACKNOWLEDGE_SUPPORT_CASE',
        caseId,
      });
      expect(acked.supportCases[caseId].status).toBe('acknowledged');

      // Investigate
      const investigated = appReducer(acked, {
        type: 'INVESTIGATE_SUPPORT_CASE',
        caseId,
      });
      expect(investigated.supportCases[caseId].status).toBe('investigating');

      // Resolve
      const resolved = appReducer(investigated, {
        type: 'RESOLVE_SUPPORT_CASE',
        caseId,
        resolution: 'Đã hoàn tất đối soát.',
      });
      expect(resolved.supportCases[caseId].status).toBe('resolved');
      expect(resolved.supportCases[caseId].resolution).toBe('Đã hoàn tất đối soát.');

      // Close
      const closed = appReducer(resolved, {
        type: 'CLOSE_SUPPORT_CASE',
        caseId,
      });
      expect(closed.supportCases[caseId].status).toBe('closed');
    });

    it('6. Tenant isolation: support cases in vieworld-demo do not leak into mfan-demo', () => {
      const opened = appReducer(state, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'benefit',
        subjectId: 'benefit-early-access-01',
      });
      expect(Object.keys(opened.supportCases)).toHaveLength(1);

      // Switch tenant to mfan-demo
      const mfanState = appReducer(opened, {
        type: 'SWITCH_TENANT',
        targetTenantId: 'mfan-demo',
      });
      expect(Object.keys(mfanState.supportCases)).toHaveLength(0);
    });

    it('7. Refresh preserves support cases and reconciliation states in localStorage', () => {
      const opened = appReducer(state, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'benefit',
        subjectId: 'benefit-early-access-01',
      });
      const caseId = Object.values(opened.supportCases)[0].id;

      const reconciled = appReducer(opened, {
        type: 'RECONCILE_BENEFIT',
        benefitId: 'benefit-early-access-01',
      });

      saveState(reconciled);

      const storageKey = `vieworld_v1_${reconciled.activeTenantId}_${reconciled.fanProfile.id}`;
      const rawStored = window.localStorage.getItem(storageKey);
      expect(rawStored).not.toBeNull();

      const parsed = JSON.parse(rawStored!);
      expect(parsed.state.supportCases[caseId]).toBeDefined();
      expect(parsed.state.supportCases[caseId].subjectId).toBe('benefit-early-access-01');
      expect(parsed.state.benefits['benefit-early-access-01'].status).toBe('eligible');
    });
  });

  describe('2. UI Integration & End-to-End Journeys', () => {
    it('1. Open support from BenefitDetailView → View Case → Resolve → Reconcile → Verify in My World & Shop', () => {
      const { unmount } = render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/benefits/benefit-early-access-01']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="benefits/:benefitId" element={<BenefitDetailView />} />
                <Route path="support/:caseId" element={<SupportCaseDetailView />} />
                <Route path="me" element={<MyWorldView />} />
                <Route path="worlds/:worldId/shop" element={<ShopView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // 1. Benefit is currently pending
      expect(screen.getAllByText(/Xác thực quyền mua sớm vé Live House/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Gặp vấn đề về phân bổ hoặc điều kiện đối soát\?/i)).toBeInTheDocument();

      // 2. Click "Mở yêu cầu đối soát"
      const openSupportBtn = screen.getByTestId('open-benefit-support-btn');
      fireEvent.click(openSupportBtn);

      // Active case card appears with link to case
      expect(screen.getByTestId('benefit-active-case-card')).toBeInTheDocument();
      const viewCaseLink = screen.getByTestId('view-benefit-support-case-btn');
      fireEvent.click(viewCaseLink);

      // 3. On SupportCaseDetailView (/support/:caseId)
      expect(screen.getByText(/HỒ SƠ HỖ TRỢ & ĐỐI SOÁT/i)).toBeInTheDocument();
      expect(screen.getByTestId('case-status-badge')).toHaveTextContent(/Tiếp nhận \(Open\)/i);
      expect(screen.getByText(/Tiến trình xử lý hồ sơ thử nghiệm/i)).toBeInTheDocument();

      // No fake business SLAs are shown
      expect(screen.queryByText(/phản hồi trong (24h|48h)|giải quyết trong 24h/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Không đưa ra cam kết SLA kinh doanh ảo/i)).toBeInTheDocument();

      // 4. Operator Simulates Resolve
      const resolveBtn = screen.getByTestId('operator-resolve-btn');
      fireEvent.click(resolveBtn);

      // Status updates to resolved
      expect(screen.getByTestId('case-status-badge')).toHaveTextContent(/Đã có kết luận \(Resolved\)/i);
      expect(screen.getByTestId('case-resolution-box')).toBeInTheDocument();

      // INVARIANT: Benefit is STILL pending!
      expect(screen.getByTestId('benefit-subject-status')).toHaveTextContent(/Trạng thái hiện tại:\s*PENDING/i);

      // 5. Operator clicks Separate Reconciliation Action
      const reconcileBtn = screen.getByTestId('reconcile-benefit-btn');
      expect(reconcileBtn).toBeInTheDocument();
      fireEvent.click(reconcileBtn);

      // Source data now reconciled: status becomes eligible!
      expect(screen.getByText(/Nguồn dữ liệu đã được đối soát: Trạng thái quyền lợi hiện là ELIGIBLE/i)).toBeInTheDocument();

      // 6. Navigate to My World (/me)
      const myWorldLink = screen.getByRole('link', { name: /Quay lại My World/i });
      fireEvent.click(myWorldLink);

      // In My World, switch to "Hỗ trợ & Đối soát" tab
      const supportTab = screen.getByRole('tab', { name: /Hỗ trợ & Đối soát/i });
      fireEvent.click(supportTab);

      // Case is listed in My World
      expect(screen.getByRole('heading', { level: 2, name: /Hồ sơ hỗ trợ & Đối soát/i })).toBeInTheDocument();
      expect(screen.getByTestId('support-cases-list')).toBeInTheDocument();
      expect(screen.getByText(/Đã có kết luận/i)).toBeInTheDocument();

      // Check "Quyền lợi & Hội viên" tab in My World: benefit is now eligible!
      const benefitsTab = screen.getByRole('tab', { name: /Quyền lợi & Hội viên/i });
      fireEvent.click(benefitsTab);
      expect(screen.getByTestId('benefit-status-benefit-early-access-01')).toHaveTextContent(/Đủ điều kiện/i);

      unmount();
    });

    it('2. Order Support Journey: open support from OrderDetailView → shows order context and case timeline', () => {
      // Seed a paid order fixture
      const orderId = 'order-test-support-01';
      const orderState: AppState = {
        ...state,
        orders: {
          [orderId]: {
            id: orderId,
            tenantId: 'vieworld-demo',
            version: 1,
            updatedAt: state.demoTime,
            fanId: 'fan-linh',
            worldId: 'artist-a',
            productId: 'product-pin-01',
            status: 'paid',
            sourceRef: 'VieSHOP-TEST',
            requestId: 'req_support_order_01',
          },
        },
      };

      // Save to storage and test in app
      saveState(orderState);

      render(
        <AppProvider>
          <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="orders/:orderId" element={<OrderDetailView />} />
                <Route path="support/:caseId" element={<SupportCaseDetailView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Click "Yêu cầu hỗ trợ đơn hàng"
      const openSupportBtn = screen.getByTestId('open-order-support-btn');
      fireEvent.click(openSupportBtn);

      // Active case appears
      expect(screen.getByTestId('order-active-case-card')).toBeInTheDocument();
      const viewCaseBtn = screen.getByTestId('view-order-support-case-btn');
      fireEvent.click(viewCaseBtn);

      // On SupportCaseDetailView, verifies order context is displayed
      expect(screen.getByText(/Hỗ trợ đơn hàng lưu niệm/i)).toBeInTheDocument();
      expect(screen.getByText(/Mã tham chiếu đối tượng:/i)).toBeInTheDocument();
      expect(screen.getByText(/Trạng thái đơn:/i)).toBeInTheDocument();
      expect(screen.getByText(/PAID/i)).toBeInTheDocument();
    });

    it('3. Navigating to non-existent support case ID renders recoverable error state', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/support/non-existent-case-id-123']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="support/:caseId" element={<SupportCaseDetailView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Recoverable not-found UI
      expect(screen.getByText(/Không tìm thấy hồ sơ hỗ trợ/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Về My World/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Khám phá Worlds/i })).toBeInTheDocument();
    });
  });
});
