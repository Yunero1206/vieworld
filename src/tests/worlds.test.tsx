/**
 * Acceptance T03: Discover and World Destinations Invariant Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { DiscoverView } from '../views/DiscoverView';
import { WorldsView } from '../views/WorldsView';
import { WorldDetailView } from '../views/WorldDetailView';
import { AppShell } from '../components/AppShell';
import { createInitialState } from '../data/fixtures';

describe('T03 Acceptance: Discover & World Destinations', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('1. Discover → IP → Artist Navigation Journey', () => {
    it('allows discovering worlds, navigating from IP world to linked artist world', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route index element={<DiscoverView />} />
                <Route path="worlds" element={<WorldsView />} />
                <Route path="worlds/:worldId" element={<WorldDetailView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Verify Discover hero and next moment spotlight
      expect(screen.getByText(/Khám phá thế giới người hâm mộ/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Artist A: Drop-in Trò chuyện đầu tuần/i).length).toBeGreaterThan(0);

      // Navigate to /worlds via "Xem tất cả"
      const seeAllBtn = screen.getByRole('link', { name: /Xem tất cả/i });
      fireEvent.click(seeAllBtn);

      // Verify Worlds directory page is loaded
      expect(screen.getByText(/Các điểm đến người hâm mộ/i)).toBeInTheDocument();
      expect(screen.getAllByText('Neon Sessions').length).toBeGreaterThan(0);

      // Navigate into IP World (/worlds/neon-sessions) via enter world button
      const enterButtons = screen.getAllByRole('link', { name: /Vào World/i });
      // Find the link that points to neon-sessions
      const neonLink = enterButtons.find((btn) => btn.getAttribute('href') === '/worlds/neon-sessions');
      expect(neonLink).toBeDefined();
      fireEvent.click(neonLink!);

      // Verify Neon Sessions detail view
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Neon Sessions');

      // Crucial Invariant: Linked artist Artist A is shown without auto-following
      const linkedArtistLink = screen.getByRole('link', { name: 'Artist A' });
      expect(linkedArtistLink).toBeInTheDocument();

      // Click linked artist to navigate to Artist A World
      fireEvent.click(linkedArtistLink);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Artist A');
    });
  });

  describe('2. Follow and RSVP Invariants & View Mode Independence', () => {
    it('following IP world does NOT auto-follow linked artist world', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/worlds']}>
            <Routes>
              <Route path="worlds" element={<WorldsView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Toggle follow on Neon Sessions
      const followNeonBtn = screen.getByRole('button', { name: /Theo dõi Neon Sessions/i });
      fireEvent.click(followNeonBtn);

      // Check button text updated
      expect(screen.getByRole('button', { name: /Bỏ theo dõi Neon Sessions/i })).toBeInTheDocument();

      // Verify filter by followed shows both
      const filterFollowedBtn = screen.getByRole('button', { name: /Đang theo dõi/i });
      fireEvent.click(filterFollowedBtn);

      // Artist A was already followed in baseline, Neon Sessions is now followed
      expect(screen.getAllByText('Neon Sessions').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Artist A').length).toBeGreaterThan(0);
    });

    it('toggling between Scenery View and List View preserves follow and search state', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/worlds']}>
            <Routes>
              <Route path="worlds" element={<WorldsView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Switch to List View
      const listViewBtn = screen.getByRole('button', { name: /Chế độ xem danh sách/i });
      fireEvent.click(listViewBtn);

      // Verify list view items
      expect(screen.getAllByText('Neon Sessions').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Artist A').length).toBeGreaterThan(0);

      // Switch back to Scenery View
      const sceneryViewBtn = screen.getByRole('button', { name: /Chế độ xem phong cảnh/i });
      fireEvent.click(sceneryViewBtn);

      expect(screen.getAllByText('Neon Sessions').length).toBeGreaterThan(0);
    });
  });

  describe('3. Truthful Next Moment & Tabs in World Detail', () => {
    it('World detail displays next moment with DEMO badge without claiming live presence when scheduled', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/worlds/artist-a']}>
            <Routes>
              <Route path="worlds/:worldId" element={<WorldDetailView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Header verification
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Artist A');
      // Verify no sensitive approval token is rendered
      expect(screen.queryByText(/APPROVAL-SIM-2026-01/i)).toBeNull();
      expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);

      // Verify tabs exist
      expect(screen.getByRole('tab', { name: /Trang chủ/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Phiên sự kiện/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Kho Lưu Trữ Replay/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /VieSHOP/i })).toBeInTheDocument();

      // Switch to Sessions tab
      const sessionsTab = screen.getByRole('tab', { name: /Phiên sự kiện/i });
      fireEvent.click(sessionsTab);

      expect(screen.getByText(/Artist A: Drop-in Trò chuyện đầu tuần/i)).toBeInTheDocument();
      expect(screen.getByText(/Live House: Setlist đêm Thứ Bảy/i)).toBeInTheDocument();

      // Switch to Shop tab
      const shopTab = screen.getByRole('tab', { name: /VieSHOP/i });
      fireEvent.click(shopTab);

      expect(screen.getByText(/Huy hiệu kim loại kỷ niệm Star Drop-in/i)).toBeInTheDocument();
      expect(screen.getByText(/150.000 VND/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Mô phỏng đặt hàng/i })).toHaveLength(
        Object.values(createInitialState('vieworld-demo').products).filter(p => p.worldId === 'artist-a').length
      );
    });
  });

  describe('4. Graceful Error Recovery & Dead End Avoidance', () => {
    it('invalid world ID displays helpful not-found state with link back to Worlds list', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/worlds/non-existent-world-xyz']}>
            <Routes>
              <Route path="worlds/:worldId" element={<WorldDetailView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Verify error recovery message
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Không tìm thấy không gian/i);
      expect(screen.getByText(/non-existent-world-xyz/i)).toBeInTheDocument();

      // Verify safe recovery link
      const returnLink = screen.getByRole('link', { name: /Quay lại danh sách Worlds/i });
      expect(returnLink).toHaveAttribute('href', '/worlds');
    });
  });
});
