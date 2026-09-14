import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CollectionBrowser } from '../components/CollectionBrowser';
import { FanShell } from '../components/FanShell';
import { ArtistGalleryView } from '../views/ArtistGalleryView';
import { FanShopView } from '../views/FanShopView';
import { OrderDetailView } from '../views/OrderDetailView';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { saveState, loadState } from '../services/storageAdapter';
import { ownedCollection, displayOptions } from '../world/display';
import {
  filterDisplayItems,
  formatCollectionDate,
  COLLECTION_TIMEZONE,
} from '../world/displayFilter';
import { matchesVietnameseQuery, normalizeVietnameseText } from '../utils/textSearch';

function ProblemChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test crash in child component');
  }
  return <div>Component rendered successfully</div>;
}

describe('Review Fixes & UX Regression Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. P1 Apparent reload resets fan data (ErrorBoundary preservation)', () => {
    it('recovery reload/retry preserves orders, avatar, and display selection in storage', () => {
      let state = createInitialState('vieworld-demo');
      // Customize avatar preset
      state = appReducer(state, { type: 'SET_AVATAR_PRESET', preset: 'bob' });
      // Create and fulfill order
      state = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-star-shirt-real',
        requestId: 'req-save-1',
        optionLabel: 'M',
      });
      const order = Object.values(state.orders)[0];
      state = appReducer(state, { type: 'SIMULATE_PAYMENT', orderId: order.id, requestId: order.requestId });
      state = appReducer(state, { type: 'SIMULATE_FULFILMENT', orderId: order.id });
      // Set display slot
      state = appReducer(state, {
        type: 'SET_DISPLAY_SLOT',
        slot: 'shirt',
        itemId: 'product-star-shirt-real',
      });

      saveState(state);

      const resetTenantMock = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = render(
        <ErrorBoundary onResetDemoData={resetTenantMock}>
          <ProblemChild shouldThrow={false} />
        </ErrorBoundary>
      );

      // Trigger error
      rerender(
        <ErrorBoundary onResetDemoData={resetTenantMock}>
          <ProblemChild shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByTestId('error-boundary-title')).toHaveTextContent('Đã xảy ra lỗi giao diện không mong muốn');

      // Click "Tải lại trang"
      const reloadBtn = screen.getByRole('button', { name: 'Tải lại trang' });
      fireEvent.click(reloadBtn);

      // Verify resetTenantMock was NOT called on reload
      expect(resetTenantMock).not.toHaveBeenCalled();

      // Verify data in storage is completely intact
      const loaded = loadState('vieworld-demo', state.fanProfile.id).state;
      expect(loaded.fanProfile.avatarPreset).toBe('bob');
      expect(Object.keys(loaded.orders)).toHaveLength(1);
      expect(loaded.orders[order.id].status).toBe('fulfilled');
      expect(loaded.fanProfile.displaySlots?.shirt).toBe('product-star-shirt-real');

      consoleSpy.mockRestore();
    });

    it('destructive reset is guarded behind explicit confirmation', () => {
      const resetTenantMock = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary onResetDemoData={resetTenantMock}>
          <ProblemChild shouldThrow={true} />
        </ErrorBoundary>
      );

      // Trigger button to reveal confirmation panel
      const triggerResetBtn = screen.getByTestId('error-boundary-trigger-reset-btn');
      expect(triggerResetBtn).toBeInTheDocument();
      expect(screen.queryByTestId('error-boundary-confirm-panel')).not.toBeInTheDocument();

      fireEvent.click(triggerResetBtn);

      // Confirmation panel is now visible
      const panel = screen.getByTestId('error-boundary-confirm-panel');
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveTextContent('Xác nhận đặt lại toàn bộ dữ liệu mẫu?');

      // Cancel button hides panel without calling reset
      const cancelBtn = screen.getByTestId('error-boundary-cancel-reset-btn');
      fireEvent.click(cancelBtn);
      expect(screen.queryByTestId('error-boundary-confirm-panel')).not.toBeInTheDocument();
      expect(resetTenantMock).not.toHaveBeenCalled();

      // Open again and confirm
      fireEvent.click(screen.getByTestId('error-boundary-trigger-reset-btn'));
      fireEvent.click(screen.getByTestId('error-boundary-confirm-reset-btn'));
      expect(resetTenantMock).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });
  });

  describe('2. P2 Collection dates disagree with the date filter', () => {
    it('aligns date filter and display in Asia/Ho_Chi_Minh timezone (UTC+7)', () => {
      expect(COLLECTION_TIMEZONE).toBe('Asia/Ho_Chi_Minh');

      // 2026-09-12T18:30:00Z is 01:30 on 2026-09-13 in Asia/Ho_Chi_Minh
      const timestamp = '2026-09-12T18:30:00Z';
      const formatted = formatCollectionDate(timestamp);
      expect(formatted).toBe('13/09/2026');

      const items = [
        {
          id: 'item-1',
          slot: 'shirt' as const,
          title: 'Áo Concert Mùa Thu',
          detail: 'Chi tiết áo',
          worldId: 'artist-a',
          collectedAt: timestamp,
        },
      ];

      // Filter for 2026-09-13 inclusive must match item-1
      const matched = filterDisplayItems(items, {
        slot: 'all',
        query: '',
        artist: 'all',
        from: '2026-09-13',
        to: '2026-09-13',
      });
      expect(matched.map(i => i.id)).toEqual(['item-1']);

      // Filter for 2026-09-12 must NOT match item-1
      const notMatched = filterDisplayItems(items, {
        slot: 'all',
        query: '',
        artist: 'all',
        from: '2026-09-12',
        to: '2026-09-12',
      });
      expect(notMatched).toHaveLength(0);
    });

    it('tests midnight boundaries, missing dates and reversed ranges', () => {
      const items = [
        {
          id: 'midnight-start',
          slot: 'disc' as const,
          title: 'Đĩa Midnight',
          detail: '',
          collectedAt: '2026-09-13T00:00:00+07:00',
        },
        {
          id: 'midnight-end',
          slot: 'disc' as const,
          title: 'Đĩa Late Night',
          detail: '',
          collectedAt: '2026-09-13T23:59:59.999+07:00',
        },
        {
          id: 'next-day-start',
          slot: 'disc' as const,
          title: 'Đĩa Next Day',
          detail: '',
          collectedAt: '2026-09-14T00:00:00+07:00',
        },
        {
          id: 'no-date',
          slot: 'ticket' as const,
          title: 'Vé chưa ngày',
          detail: '',
        },
        {
          id: 'no-utc-suffix',
          slot: 'lightstick' as const,
          title: 'Lightstick No Suffix',
          detail: '',
          collectedAt: '2026-09-13T15:30:00',
        },
      ];

      // Both midnight-start and midnight-end and no-utc-suffix match 2026-09-13
      const onDay = filterDisplayItems(items, {
        slot: 'all',
        query: '',
        artist: 'all',
        from: '2026-09-13',
        to: '2026-09-13',
      });
      expect(onDay.map(i => i.id).sort()).toEqual(['midnight-end', 'midnight-start', 'no-utc-suffix'].sort());
      expect(onDay.some(i => i.id === 'next-day-start')).toBe(false);
      expect(onDay.some(i => i.id === 'no-date')).toBe(false);

      // Reversed ranges safely return empty
      const reversed = filterDisplayItems(items, {
        slot: 'all',
        query: '',
        artist: 'all',
        from: '2026-09-20',
        to: '2026-09-10',
      });
      expect(reversed).toEqual([]);

      // Without date filters, item without date is preserved
      const allItems = filterDisplayItems(items, {
        slot: 'all',
        query: '',
        artist: 'all',
        from: '',
        to: '',
      });
      expect(allItems).toHaveLength(5);
    });
  });

  describe('3. P2 All collection items includes non-display compatible owned items', () => {
    it('derives complete owned collection including caps while preserving displayOptions fixtures', () => {
      let state = createInitialState('vieworld-demo');
      // Fulfill a cap (non-display compatible) and a shirt (display compatible)
      state = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-cap-real',
        requestId: 'req-cap',
      });
      state = appReducer(state, {
        type: 'SIMULATE_PAYMENT',
        orderId: Object.values(state.orders)[0].id,
        requestId: 'req-cap',
      });
      state = appReducer(state, {
        type: 'SIMULATE_FULFILMENT',
        orderId: Object.values(state.orders)[0].id,
      });

      const allOwned = ownedCollection(state);
      const displayCandidates = displayOptions(state);

      // Cap is in allOwned
      const cap = allOwned.find(i => i.id === 'product-cap-real');
      expect(cap).toBeDefined();
      expect(cap?.isDisplayCompatible).toBe(false);
      expect(cap?.slot).toBeUndefined();

      // displayCandidates only includes display-compatible items
      expect(displayCandidates.some(i => i.id === 'product-cap-real')).toBe(false);
    });

    it('renders cap in CollectionBrowser "Tất cả" tab with wardrobe link and no display button', () => {
      let state = createInitialState('vieworld-demo');
      state = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-cap-digital',
        requestId: 'req-cap-dig',
      });
      state = appReducer(state, {
        type: 'SIMULATE_PAYMENT',
        orderId: Object.values(state.orders)[0].id,
        requestId: 'req-cap-dig',
      });
      state = appReducer(state, {
        type: 'SIMULATE_FULFILMENT',
        orderId: Object.values(state.orders)[0].id,
      });
      saveState(state);

      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/me?section=collection']}>
            <CollectionBrowser />
          </MemoryRouter>
        </AppProvider>
      );

      // Cap is rendered in "Tất cả"
      expect(screen.getByText('Nón Everyday Star · Digital')).toBeInTheDocument();
      expect(
        screen.getByText('Vật phẩm sưu tập cá nhân · Không có vị trí trên diorama phòng')
      ).toBeInTheDocument();

      // Does not offer "Đặt vào Phòng trưng bày" for the cap
      expect(screen.queryByRole('button', { name: 'Đặt vào Phòng trưng bày' })).not.toBeInTheDocument();
      // Offers wardrobe shortcut
      expect(screen.getByRole('link', { name: 'Mặc trong Tủ đồ →' })).toBeInTheDocument();
    });
  });

  describe('4. P2 Artist activity mixes different kinds of time', () => {
    it('separates live now, upcoming nearest first, and latest published updates newest first', () => {
      let state = createInitialState('vieworld-demo');
      // Set artist-a as followed
      state.followedWorldIds = ['artist-a'];

      // Add a live session (status: 'running')
      state.sessions['live-session'] = {
        id: 'live-session',
        worldId: 'artist-a',
        title: 'Live Chat Đang Diễn Ra',
        format: 'dropin',
        scheduledStartTime: '2026-09-13T20:00:00+07:00',
        status: 'running',
        hostRole: 'artist',
        artistPresence: 'present',
        segmentMode: 'live',
        aiUse: 'none',
        replayStatus: 'not_planned',
        demo: true,
        tenantId: state.activeTenantId,
        version: 1,
        updatedAt: state.demoTime,
      };

      // Add two upcoming sessions with different dates
      state.sessions['upcoming-near'] = {
        id: 'upcoming-near',
        worldId: 'artist-a',
        title: 'Concert Gần Nhất (Ngày 15)',
        format: 'concert',
        scheduledStartTime: '2026-09-15T20:00:00+07:00',
        status: 'scheduled',
        hostRole: 'artist',
        artistPresence: 'present',
        segmentMode: 'live',
        aiUse: 'none',
        replayStatus: 'not_planned',
        demo: true,
        tenantId: state.activeTenantId,
        version: 1,
        updatedAt: state.demoTime,
      };
      state.sessions['upcoming-far'] = {
        id: 'upcoming-far',
        worldId: 'artist-a',
        title: 'Concert Xa Hơn (Ngày 25)',
        format: 'concert',
        scheduledStartTime: '2026-09-25T20:00:00+07:00',
        status: 'scheduled',
        hostRole: 'artist',
        artistPresence: 'present',
        segmentMode: 'live',
        aiUse: 'none',
        replayStatus: 'not_planned',
        demo: true,
        tenantId: state.activeTenantId,
        version: 1,
        updatedAt: state.demoTime,
      };

      saveState(state);

      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/artists']}>
            <ArtistGalleryView />
          </MemoryRouter>
        </AppProvider>
      );

      // Section region exists
      const region = screen.getByRole('region', { name: 'Hoạt động nổi bật' });
      expect(region).toBeInTheDocument();

      // Live now section is visible
      expect(within(region).getByText(/Đang diễn ra trực tiếp/)).toBeInTheDocument();
      expect(within(region).getByText('Live Chat Đang Diễn Ra')).toBeInTheDocument();

      // Upcoming section is visible
      expect(within(region).getByText(/Sắp diễn ra/)).toBeInTheDocument();
      const upcomingCards = within(region)
        .getAllByRole('link')
        .filter(l => l.textContent?.includes('Concert'));
      // Near session must come before far session
      const nearIndex = upcomingCards.findIndex(c => c.textContent?.includes('Concert Gần Nhất'));
      const farIndex = upcomingCards.findIndex(c => c.textContent?.includes('Concert Xa Hơn'));
      expect(nearIndex).toBeLessThan(farIndex);

      // Updates section is visible
      expect(within(region).getByText(/Cập nhật mới nhất/)).toBeInTheDocument();
    });
  });

  describe('5. P2 Shop search and navigation forgiving search & URL state', () => {
    it('accent-normalized search matches "ao" to "Áo"', () => {
      expect(normalizeVietnameseText('Áo Thun Star Light')).toBe('ao thun star light');
      expect(matchesVietnameseQuery('Áo Thun Star Light', 'ao')).toBe(true);
      expect(matchesVietnameseQuery('Áo Thun Star Light', 'áo')).toBe(true);
      expect(matchesVietnameseQuery('Nón lưỡi trai', 'non')).toBe(true);
      expect(matchesVietnameseQuery('Đĩa Nhạc', 'dia')).toBe(true);
    });

    it('stores search & filters in URL and preserves values when opening product and going back', () => {
      const { container } = render(
        <AppProvider>
          <MemoryRouter initialEntries={['/shop?q=ao&category=merch']}>
            <Routes>
              <Route path="/shop" element={<FanShopView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Search box has value from URL
      const searchBox = screen.getByRole('textbox', { name: 'Tìm sản phẩm' }) as HTMLInputElement;
      expect(searchBox.value).toBe('ao');

      // Merch category button is selected
      const merchTab = screen.getByRole('button', { name: 'Merch & Lightstick' });
      expect(merchTab).toHaveAttribute('aria-pressed', 'true');

      // Product "Áo Star Club" matches and is shown
      expect(screen.getByText('Áo Star Club')).toBeInTheDocument();

      // Open product
      const productTile = container.querySelector('button.fw-product') as HTMLElement;
      expect(productTile).toBeInTheDocument();
      fireEvent.click(productTile);

      // Product panel opens
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { level: 2, name: 'Áo Star Club' })).toBeInTheDocument();

      // Close product panel
      const closeBtn = screen.getByRole('button', { name: 'Đóng và về không gian' });
      fireEvent.click(closeBtn);

      // Panel is closed, search input and category are still retained
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(searchBox.value).toBe('ao');
      expect(merchTab).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('6. Weverse & MFan Parity Refinements', () => {
    it('collection uses clean category tabs and provides 1-tap reset via clear button without duplicate chips', () => {
      const state = createInitialState('vieworld-demo');
      saveState(state);

      render(
        <AppProvider disableAutoHydrate={false}>
          <MemoryRouter initialEntries={['/me?section=collection&type=shirt']}>
            <CollectionBrowser />
          </MemoryRouter>
        </AppProvider>
      );

      // Shirt tab is actively pressed
      const shirtTab = screen.getByRole('button', { name: 'Áo' });
      expect(shirtTab).toHaveAttribute('aria-pressed', 'true');

      // Redundant chips below are absent as requested
      expect(screen.queryByLabelText('Bộ lọc đang áp dụng')).not.toBeInTheDocument();

      // Enter query
      const searchBox = screen.getByRole('searchbox');
      fireEvent.change(searchBox, { target: { value: 'star' } });
      expect(searchBox).toHaveValue('star');

      // Click "Xóa bộ lọc"
      const clearBtn = screen.getByRole('button', { name: 'Xóa bộ lọc' });
      fireEvent.click(clearBtn);

      // Search box is cleared and All button is now active
      expect(searchBox).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Tất cả' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('order snapshot immutability preserves order detail even if product is deleted from catalog', () => {
      const state = createInitialState('vieworld-demo');
      const testOrderId = 'order-archived-sku-1';
      state.orders[testOrderId] = {
        id: testOrderId,
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: state.demoTime,
        fanId: state.fanProfile.id,
        worldId: 'artist-a',
        productId: 'deleted-sku-archived-999', // SKU removed from products catalog
        status: 'paid',
        createdAt: state.demoTime,
        sourceRef: 'VieSHOP-CART-SIM',
        requestId: 'req-archived-1',
        productTitle: 'Áo Kỷ Niệm Star Club (Archived)',
        productImage: 'shirt-physical',
        deliveryType: 'physical',
        estimatedShipping: 'Dự kiến giao hàng: Tháng 10/2026',
        batchLabel: 'Đợt 1',
        unitPriceVND: 390000,
        quantity: 1,
      };

      saveState(state);

      render(
        <AppProvider disableAutoHydrate={false}>
          <MemoryRouter initialEntries={[`/orders/${testOrderId}`]}>
            <Routes>
              <Route path="/orders/:orderId" element={<OrderDetailView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Successfully displays snapshot details without crashing
      expect(screen.getAllByText('Áo Kỷ Niệm Star Club (Archived)')[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Dự kiến giao hàng: Tháng 10\/2026/i).length).toBeGreaterThan(0);
      expect(screen.getByAltText('Áo Kỷ Niệm Star Club (Archived)')).toHaveAttribute(
        'src',
        '/images/merch-v2/shirt-physical.png'
      );
      expect(screen.getByTestId('order-status-badge')).toHaveTextContent('Đã thanh toán (Paid)');
    });

    it('VieSHOP renders pre-order metadata and shipping ETA disclosures matching Weverse Shop', () => {
      const state = createInitialState('vieworld-demo');
      saveState(state);

      render(
        <AppProvider disableAutoHydrate={false}>
          <MemoryRouter initialEntries={['/shop']}>
            <FanShopView />
          </MemoryRouter>
        </AppProvider>
      );

      // Pre-order badge is shown on pre-order items
      expect(screen.getAllByText(/Pre-order · Đợt 1/i).length).toBeGreaterThan(0);

      // Click product to open detail
      const starShirtBtn = screen.getByRole('heading', { name: 'Áo Star Club' }).closest('button');
      expect(starShirtBtn).toBeInTheDocument();
      fireEvent.click(starShirtBtn!);

      // Detail modal opens with shipping estimate
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByText(/Dự kiến giao hàng: Tháng 10\/2026 \(Đợt 1\)/i)).toBeInTheDocument();
    });

    it('FanShell and FanShop dynamically adapt to MFan partner configuration (Tenant Portability)', () => {
      const state = createInitialState('mfan-demo');
      saveState(state);

      render(
        <AppProvider initialTenantId="mfan-demo" disableAutoHydrate={false}>
          <MemoryRouter initialEntries={['/artists']}>
            <FanShell />
          </MemoryRouter>
        </AppProvider>
      );

      // Container uses mfan-demo
      const appContainer = screen.getByTestId('app-container');
      expect(appContainer).toHaveAttribute('data-tenant', 'mfan-demo');

      // Brand displays MFan Demo
      expect(screen.getByRole('link', { name: /MFan Demo — về thế giới/i })).toBeInTheDocument();

      // Navigation uses MFan Store instead of hardcoded VieSHOP
      const navLinks = within(screen.getByRole('navigation', { name: 'Điều hướng chính' }))
        .getAllByRole('link')
        .map(l => l.textContent);
      expect(navLinks).toContain('MFan Store');
      expect(navLinks).not.toContain('VieSHOP');
    });
  });
});
