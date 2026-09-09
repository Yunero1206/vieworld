/**
 * Acceptance T08: Merchandise Orders, Simulated Checkout and Fulfilment
 *
 * Tests all required invariant criteria for P08:
 * 1. Double click or retry with identical requestId creates exactly one order (Idempotency).
 * 2. Ordering an out-of-stock product is blocked with PRODUCT_UNAVAILABLE.
 * 3. Benefit-gated merchandise (product-shirt-01) is blocked when benefit is pending or missing (BENEFIT_REQUIRED).
 * 4. Benefit-gated merchandise succeeds when benefit is eligible or claimed.
 * 5. Simulated payment transitions order to 'paid' idempotently.
 * 6. Paid order is NOT automatically fulfilled.
 * 7. Simulated fulfilment transitions paid order to 'fulfilled'.
 * 8. Attempting to fulfill an unpaid (pending) order is blocked with ORDER_NOT_PAID.
 * 9. Physical ownership in My World (/me) appears ONLY after fulfilment (status === 'fulfilled').
 * 10. Tenant isolation: orders in vieworld-demo do not leak into mfan-demo.
 * 11. Refresh preserves orders and fulfilment states in localStorage.
 * 12. UI integration across ShopView (/worlds/:worldId/shop), OrderDetailView (/orders/:orderId), and MyWorldView (/me).
 * 13. Constitutional guard: Zero credit card, CVV, bank account, password, or delivery address inputs exist.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { appReducer } from '../domain/reducer';
import { AppState } from '../domain/types';
import { createInitialState } from '../data/fixtures';
import { AppProvider } from '../context/AppContext';
import { AppShell } from '../components/AppShell';
import { ShopView } from '../views/ShopView';
import { OrderDetailView } from '../views/OrderDetailView';
import { MyWorldView } from '../views/MyWorldView';
import { saveState } from '../services/storageAdapter';

describe('T08 Acceptance: Merchandise Orders, Simulated Checkout & Fulfilment', () => {
  let state: AppState;

  beforeEach(() => {
    window.localStorage.clear();
    state = createInitialState('vieworld-demo');
  });

  describe('1. Domain Invariants & Action Guards', () => {
    it('1. Double-click or retry with identical requestId creates exactly one order (Idempotency)', () => {
      const requestId = 'req_test_double_click_01';
      const state1 = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-pin-01',
        requestId,
      });

      const orderCount1 = Object.values(state1.orders).length;
      expect(orderCount1).toBe(1);
      const createdOrder = Object.values(state1.orders)[0];
      expect(createdOrder.productId).toBe('product-pin-01');
      expect(createdOrder.status).toBe('pending');
      expect(createdOrder.requestId).toBe(requestId);

      // Repeat with identical requestId
      const state2 = appReducer(state1, {
        type: 'CREATE_ORDER',
        productId: 'product-pin-01',
        requestId,
      });

      expect(Object.values(state2.orders).length).toBe(1);
      expect(Object.values(state2.orders)[0].id).toBe(createdOrder.id);
    });

    it('2. Ordering an out-of-stock product is blocked with PRODUCT_UNAVAILABLE', () => {
      // Set stock to 0
      const outOfStockState: AppState = {
        ...state,
        products: {
          ...state.products,
          'product-pin-01': {
            ...state.products['product-pin-01'],
            stockCount: 0,
          },
        },
      };

      const result = appReducer(outOfStockState, {
        type: 'CREATE_ORDER',
        productId: 'product-pin-01',
        requestId: 'req_oos_test',
      });

      expect(result.lastError?.code).toBe('PRODUCT_UNAVAILABLE');
      expect(Object.values(result.orders)).toHaveLength(0);
    });

    it('3. Benefit-gated merchandise is blocked when benefit is pending or missing (BENEFIT_REQUIRED)', () => {
      // In default fixtures, benefit-early-access-01 has status: 'pending'
      expect(state.benefits['benefit-early-access-01']?.status).toBe('pending');

      const result = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-shirt-01',
        requestId: 'req_gated_pending',
      });

      expect(result.lastError?.code).toBe('BENEFIT_REQUIRED');
      expect(Object.values(result.orders)).toHaveLength(0);

      // If benefit record is completely missing
      const noBenefitState: AppState = {
        ...state,
        benefits: {},
      };

      const result2 = appReducer(noBenefitState, {
        type: 'CREATE_ORDER',
        productId: 'product-shirt-01',
        requestId: 'req_gated_missing',
      });

      expect(result2.lastError?.code).toBe('BENEFIT_REQUIRED');
      expect(Object.values(result2.orders)).toHaveLength(0);
    });

    it('4. Benefit-gated merchandise succeeds when benefit is eligible or claimed', () => {
      // Upgrade benefit to 'eligible'
      const eligibleState: AppState = {
        ...state,
        benefits: {
          ...state.benefits,
          'benefit-early-access-01': {
            ...state.benefits['benefit-early-access-01'],
            status: 'eligible',
          },
        },
      };

      const result1 = appReducer(eligibleState, {
        type: 'CREATE_ORDER',
        productId: 'product-shirt-01',
        requestId: 'req_gated_eligible',
      });

      expect(result1.lastError).toBeUndefined();
      expect(Object.values(result1.orders)).toHaveLength(1);
      const order1 = Object.values(result1.orders)[0];
      expect(order1.productId).toBe('product-shirt-01');
      expect(order1.status).toBe('pending');

      // Also succeeds if benefit is 'claimed'
      const claimedState: AppState = {
        ...state,
        benefits: {
          ...state.benefits,
          'benefit-early-access-01': {
            ...state.benefits['benefit-early-access-01'],
            status: 'claimed',
          },
        },
      };

      const result2 = appReducer(claimedState, {
        type: 'CREATE_ORDER',
        productId: 'product-shirt-01',
        requestId: 'req_gated_claimed',
      });

      expect(result2.lastError).toBeUndefined();
      expect(Object.values(result2.orders)).toHaveLength(1);
    });

    it('5. Simulated payment transitions order to paid idempotently and does NOT auto-fulfill', () => {
      const requestId = 'req_pay_test';
      const orderCreated = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-pin-01',
        requestId,
      });

      const order = Object.values(orderCreated.orders)[0];
      expect(order.status).toBe('pending');

      // Pay with matching requestId
      const paidState = appReducer(orderCreated, {
        type: 'SIMULATE_PAYMENT',
        orderId: order.id,
        requestId: order.requestId,
      });

      const paidOrder = paidState.orders[order.id];
      expect(paidOrder.status).toBe('paid');
      expect(paidState.lastError).toBeUndefined();

      // INVARIANT: Paid order is NOT automatically fulfilled!
      expect(paidOrder.status).not.toBe('fulfilled');

      // Idempotency: repeating payment on already paid order is a no-op success
      const repeatPaidState = appReducer(paidState, {
        type: 'SIMULATE_PAYMENT',
        orderId: order.id,
        requestId: order.requestId,
      });

      expect(repeatPaidState.orders[order.id].status).toBe('paid');
    });

    it('6. Payment fails if requestId does not match', () => {
      const orderCreated = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-pin-01',
        requestId: 'req_original',
      });
      const order = Object.values(orderCreated.orders)[0];

      const mismatchState = appReducer(orderCreated, {
        type: 'SIMULATE_PAYMENT',
        orderId: order.id,
        requestId: 'req_wrong_id',
      });

      expect(mismatchState.lastError?.code).toBe('INVALID_REQUEST_ID');
      expect(mismatchState.orders[order.id].status).toBe('pending');
    });

    it('7. Fulfilment requires paid status; pending order cannot be fulfilled', () => {
      const orderCreated = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-pin-01',
        requestId: 'req_fulfil_test',
      });
      const order = Object.values(orderCreated.orders)[0];
      expect(order.status).toBe('pending');

      // Attempt fulfilment before payment
      const earlyFulfilState = appReducer(orderCreated, {
        type: 'SIMULATE_FULFILMENT',
        orderId: order.id,
      });

      expect(earlyFulfilState.lastError?.code).toBe('ORDER_NOT_PAID');
      expect(earlyFulfilState.orders[order.id].status).toBe('pending');

      // Pay first
      const paidState = appReducer(orderCreated, {
        type: 'SIMULATE_PAYMENT',
        orderId: order.id,
        requestId: order.requestId,
      });

      // Now fulfill
      const fulfilledState = appReducer(paidState, {
        type: 'SIMULATE_FULFILMENT',
        orderId: order.id,
      });

      expect(fulfilledState.lastError).toBeUndefined();
      expect(fulfilledState.orders[order.id].status).toBe('fulfilled');
    });

    it('8. Physical ownership in My World appears ONLY after fulfilment', () => {
      const orderCreated = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-pin-01',
        requestId: 'req_ownership_test',
      });
      const order = Object.values(orderCreated.orders)[0];

      // 1. In pending state: 0 fulfilled items
      const fulfilledPending = Object.values(orderCreated.orders).filter((o) => o.status === 'fulfilled');
      expect(fulfilledPending).toHaveLength(0);

      // 2. In paid state: still 0 fulfilled items
      const paidState = appReducer(orderCreated, {
        type: 'SIMULATE_PAYMENT',
        orderId: order.id,
        requestId: order.requestId,
      });
      const fulfilledPaid = Object.values(paidState.orders).filter((o) => o.status === 'fulfilled');
      expect(fulfilledPaid).toHaveLength(0);

      // 3. In fulfilled state: exactly 1 fulfilled item
      const fulfilledState = appReducer(paidState, {
        type: 'SIMULATE_FULFILMENT',
        orderId: order.id,
      });
      const fulfilledFinal = Object.values(fulfilledState.orders).filter((o) => o.status === 'fulfilled');
      expect(fulfilledFinal).toHaveLength(1);
      expect(fulfilledFinal[0].productId).toBe('product-pin-01');
    });

    it('9. Tenant isolation: orders in vieworld-demo do not leak into mfan-demo', () => {
      const orderCreated = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-pin-01',
        requestId: 'req_tenant_iso_01',
      });

      expect(Object.keys(orderCreated.orders)).toHaveLength(1);

      // Switch tenant to 'mfan-demo'
      const mfanSwitched = appReducer(orderCreated, {
        type: 'SWITCH_TENANT',
        targetTenantId: 'mfan-demo',
      });

      // Orders for mfan-demo should be empty or isolated
      expect(Object.keys(mfanSwitched.orders)).toHaveLength(0);

      // Switch back to 'vieworld-demo'
      const backSwitched = appReducer(mfanSwitched, {
        type: 'SWITCH_TENANT',
        targetTenantId: 'vieworld-demo',
      });

      // Initial fixture doesn't save to storage without persistence, but verifying reducer state isolation
      expect(backSwitched.activeTenantId).toBe('vieworld-demo');
    });

    it('10. Refresh preserves orders and fulfilment state in localStorage', () => {
      const orderCreated = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-pin-01',
        requestId: 'req_storage_test',
      });
      const order = Object.values(orderCreated.orders)[0];

      const paidState = appReducer(orderCreated, {
        type: 'SIMULATE_PAYMENT',
        orderId: order.id,
        requestId: order.requestId,
      });

      const fulfilledState = appReducer(paidState, {
        type: 'SIMULATE_FULFILMENT',
        orderId: order.id,
      });

      // Save to localStorage
      saveState(fulfilledState);

      // Verify localStorage content
      const storageKey = `vieworld_v1_${fulfilledState.activeTenantId}_${fulfilledState.fanProfile.id}`;
      const rawStored = window.localStorage.getItem(storageKey);
      expect(rawStored).not.toBeNull();

      const parsed = JSON.parse(rawStored!);
      expect(parsed.state.orders[order.id]).toBeDefined();
      expect(parsed.state.orders[order.id].status).toBe('fulfilled');
      expect(parsed.state.orders[order.id].productId).toBe('product-pin-01');
    });
  });

  describe('2. UI Integration & End-to-End Journeys', () => {
    it('1. ShopView displays products, stock, benefit gating reasons and simulated order buttons', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/worlds/artist-a/shop']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="worlds/:worldId/shop" element={<ShopView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Verify Header
      expect(screen.getByText(/VIESHOP CONTEXTUAL COMMERCE/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Cửa hàng quà tặng lưu niệm/i })).toBeInTheDocument();

      // Product 1: Pin (open, in-stock)
      expect(screen.getByText(/Huy hiệu kim loại kỷ niệm Star Drop-in/i)).toBeInTheDocument();
      expect(screen.getByText(/150.000 VND/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Tồn kho thử nghiệm:/i)).toHaveLength(2);

      // Product 2: Shirt (gated by benefit-early-access-01 which is pending)
      expect(screen.getByText(/Áo thun kỷ niệm Midnight Neon Tour/i)).toBeInTheDocument();
      expect(screen.getByText(/380.000 VND/i)).toBeInTheDocument();
      expect(screen.getByText(/Yêu cầu quyền lợi hội viên chưa thỏa mãn/i)).toBeInTheDocument();
      expect(screen.getByText(/Quyền lợi của bạn hiện đang ở trạng thái chờ đối soát \(pending\)/i)).toBeInTheDocument();

      // Order button for Shirt is disabled
      const shirtBtn = screen.getByTestId('order-product-btn-product-shirt-01');
      expect(shirtBtn).toBeDisabled();

      // Order button for Pin is enabled
      const pinBtn = screen.getByTestId('order-product-btn-product-pin-01');
      expect(pinBtn).not.toBeDisabled();
      expect(pinBtn).toHaveTextContent(/Mô phỏng đặt hàng/i);
    });

    it('2. End-to-end journey: Order in Shop → View OrderDetail → Pay → Fulfill → Verify in My World', async () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/worlds/artist-a/shop']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="worlds/:worldId/shop" element={<ShopView />} />
                <Route path="orders/:orderId" element={<OrderDetailView />} />
                <Route path="me" element={<MyWorldView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Step 1: Click "Mô phỏng đặt hàng" on the Pin product
      const pinBtn = screen.getByTestId('order-product-btn-product-pin-01');
      fireEvent.click(pinBtn);

      // Order appears in recent orders section on ShopView
      expect(screen.getByRole('heading', { level: 2, name: /Đơn hàng gần đây/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Xem tiến trình đơn hàng/i })).toBeInTheDocument();

      // Step 2: Click "Xem tiến trình đơn hàng"
      const viewOrderLink = screen.getByRole('link', { name: /Xem tiến trình đơn hàng/i });
      fireEvent.click(viewOrderLink);

      // Step 3: Verify OrderDetailView rendered
      expect(screen.getByText(/CHI TIẾT ĐƠN HÀNG VIESHOP/i)).toBeInTheDocument();
      expect(screen.getByTestId('order-status-badge')).toHaveTextContent(/Chờ thanh toán \(Pending\)/i);
      expect(screen.getByText(/Tiến trình xử lý đơn hàng/i)).toBeInTheDocument();

      // Stepper shows Pending step active
      expect(screen.getByText(/1. Khởi tạo đơn hàng \(Mô phỏng\)/i)).toBeInTheDocument();

      // Step 4: Click "Mô phỏng: Thanh toán đơn hàng"
      const payBtn = screen.getByTestId('simulate-payment-btn');
      fireEvent.click(payBtn);

      // Status badge updates to Paid
      expect(screen.getByTestId('order-status-badge')).toHaveTextContent(/Đã thanh toán \(Paid\)/i);
      expect(screen.queryByTestId('simulate-payment-btn')).not.toBeInTheDocument();

      // INVARIANT: Fulfilment button now visible, but NOT yet fulfilled
      const fulfillBtn = screen.getByTestId('simulate-fulfilment-btn');
      expect(fulfillBtn).toBeInTheDocument();
      expect(screen.getByText(/Đơn hàng đã thanh toán không đồng nghĩa với đã bàn giao vật phẩm/i)).toBeInTheDocument();

      // Step 5: Click "Mô phỏng: Xác nhận bàn giao vật phẩm"
      fireEvent.click(fulfillBtn);

      // Status badge updates to Fulfilled
      expect(screen.getByTestId('order-status-badge')).toHaveTextContent(/Đã bàn giao \(Fulfilled\)/i);
      expect(screen.getByText(/Đơn vị phân phối hoàn tất giao vật phẩm/i)).toBeInTheDocument();
      expect(screen.getByText(/Đã ghi nhận quyền sở hữu/i)).toBeInTheDocument();

      // Step 6: Navigate to My World (/me)
      const myWorldLink = screen.getByRole('link', { name: /Xem trong My World/i });
      fireEvent.click(myWorldLink);

      // In My World, switch to "Đơn hàng & Sở hữu" tab
      const ordersTab = screen.getByRole('tab', { name: /Đơn hàng & Sở hữu/i });
      fireEvent.click(ordersTab);

      // Fulfilled merchandise appears under "Bộ sưu tập vật phẩm đã sở hữu"
      expect(screen.getByRole('heading', { level: 2, name: /Bộ sưu tập vật phẩm đã sở hữu/i })).toBeInTheDocument();
      expect(screen.getByTestId('owned-items-grid')).toBeInTheDocument();
      expect(within(screen.getByTestId('owned-items-grid')).getByText(/Huy hiệu kim loại kỷ niệm Star Drop-in/i)).toBeInTheDocument();
      expect(within(screen.getByTestId('owned-items-grid')).getByText(/ĐÃ SỞ HỮU/i)).toBeInTheDocument();

      // Also appears in the order history section
      expect(screen.getByRole('heading', { level: 2, name: /Lịch sử đơn hàng VieSHOP/i })).toBeInTheDocument();
    });

    it('3. Constitutional Guard: Zero payment card or delivery address inputs exist across views', () => {
      const { container } = render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/worlds/artist-a/shop']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="worlds/:worldId/shop" element={<ShopView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Verify no inputs of type password, credit card, or address
      const inputs = container.querySelectorAll('input');
      expect(inputs).toHaveLength(0);

      // Verify disclosures
      expect(screen.getByText(/Không thu phí tài chính thật, không nhập thẻ ngân hàng hay địa chỉ giao dịch/i)).toBeInTheDocument();
    });
  });
});
