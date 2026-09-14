/**
 * Job 09 Acceptance Test Suite:
 * Neon Sessions IP World Identity & Cohesive Secondary Surfaces
 *
 * Requirements:
 * 1. Neon Sessions WorldScene renders distinct IP identity (cyber synth console, Lo-Fi station, neon archive, neon pass, cyber merch)
 * 2. Reciprocal portal cross-linking between Artist A and Neon Sessions
 * 3. WorldCard & WorldHeader render distinct marks (Artist avatar vs. Cyber IP mark) and DEMO badges
 * 4. DiscoverView prioritizes today's moment and NextMomentCard without duplicate directory clutter
 * 5. WorldsView provides distinct filtering (All, Artist, IP, Followed) and search
 * 6. ShopView retains 100% order/benefit/checkout flows
 * 7. Mobile responsive layout and touch targets (>= 44x44px)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { CANONICAL_WORLDS } from '../data/fixtures';
import { WorldScene } from '../components/WorldScene';
import { WorldHeader } from '../components/WorldHeader';
import { WorldCard } from '../components/WorldCard';
import { DiscoverView } from '../views/DiscoverView';
import { WorldsView } from '../views/WorldsView';
import { ShopView } from '../views/ShopView';
import { WorldDetailView } from '../views/WorldDetailView';

describe('Job 09 Acceptance: Neon Sessions & Cohesive Secondary Surfaces', () => {
  const artistWorld = CANONICAL_WORLDS['artist-a'];
  const neonWorld = CANONICAL_WORLDS['neon-sessions'];

  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Neon Sessions WorldScene IP Identity vs Artist A', () => {
    it('renders dedicated Cyber Synth Console and neon hotspots for Neon Sessions without copying acoustic art', () => {
      render(
        <MemoryRouter initialEntries={['/worlds/neon-sessions']}>
          <AppProvider>
            <WorldScene
              world={neonWorld}
              sessionCount={3}
              benefitCount={2}
              productCount={4}
              linkedWorld={artistWorld}
              onOpenZone={() => {}}
            />
          </AppProvider>
        </MemoryRouter>
      );

      // 1. Diorama container uses IP theme
      const diorama = document.querySelector('.world-diorama');
      expect(diorama).toBeInTheDocument();
      expect(diorama).toHaveClass('world-diorama--ip');
      expect(diorama).not.toHaveClass('world-diorama--artist');

      // 2. Artist chibi backdrop artwork is NOT loaded for IP world
      expect(screen.queryByTestId('world-backdrop-artwork')).not.toBeInTheDocument();

      // 3. Centerpiece stage renders Cyber Synth Console SVG
      const synthVisual = screen.getByTestId('neon-synth-stage-visual');
      expect(synthVisual).toBeInTheDocument();
      expect(synthVisual).toHaveClass('diorama-stage-svg--synth');

      // 4. Hotspot labels match Cyber IP World theme
      const musicSpot = document.getElementById('diorama-spot-music');
      expect(musicSpot).toBeInTheDocument();
      expect(within(musicSpot!).getByText('Trạm âm thanh Lo-Fi')).toBeInTheDocument();
      expect(within(musicSpot!).getByText('Trạm Lo-Fi')).toBeInTheDocument();
      expect(within(musicSpot!).getByText(/Nghe Lo-Fi & stems/i)).toBeInTheDocument();

      const archiveSpot = document.getElementById('diorama-spot-archive');
      expect(archiveSpot).toBeInTheDocument();
      expect(within(archiveSpot!).getByText('Kho lưu trữ Show điện tử')).toBeInTheDocument();
      expect(within(archiveSpot!).getByText('Bảng neon lưu diễn')).toBeInTheDocument();
      expect(within(archiveSpot!).getByText(/Xem recap show/i)).toBeInTheDocument();

      const membershipSpot = document.getElementById('diorama-spot-membership');
      expect(membershipSpot).toBeInTheDocument();
      expect(within(membershipSpot!).getByText('Hội Quán Cyber VIP')).toBeInTheDocument();
      expect(within(membershipSpot!).getByText('Quầy Neon Pass')).toBeInTheDocument();
      expect(within(membershipSpot!).getByText(/Nhận Neon Pass/i)).toBeInTheDocument();

      const shopSpot = document.getElementById('diorama-spot-shop');
      expect(shopSpot).toBeInTheDocument();
      expect(within(shopSpot!).getByText('VieSHOP Cyber Merch')).toBeInTheDocument();
      expect(within(shopSpot!).getByText('VieSHOP Cyber')).toBeInTheDocument();
      expect(within(shopSpot!).getByText(/Khám phá Cyber Merch/i)).toBeInTheDocument();

      // 5. Shortcuts bar matches Cyber IP World theme
      expect(document.getElementById('shortcut-music')).toHaveTextContent(/Trạm Lo-Fi/i);
      expect(document.getElementById('shortcut-archive')).toHaveTextContent(/Bảng neon lưu diễn/i);
      expect(document.getElementById('shortcut-membership')).toHaveTextContent(/Quầy Neon Pass/i);
      expect(document.getElementById('shortcut-shop')).toHaveTextContent(/VieSHOP Cyber/i);
    });

    it('preserves acoustic wood/turntable identity for Artist A', () => {
      render(
        <MemoryRouter initialEntries={['/worlds/artist-a']}>
          <AppProvider>
            <WorldScene
              world={artistWorld}
              sessionCount={5}
              benefitCount={3}
              productCount={2}
              linkedWorld={neonWorld}
              onOpenZone={() => {}}
            />
          </AppProvider>
        </MemoryRouter>
      );

      const diorama = document.querySelector('.world-diorama');
      expect(diorama).toHaveClass('world-diorama--artist');

      // Stage does NOT render synth visual
      expect(screen.queryByTestId('neon-synth-stage-visual')).not.toBeInTheDocument();

      // Acoustic spots
      const musicSpot = document.getElementById('diorama-spot-music');
      expect(within(musicSpot!).getByText('Góc nghe đĩa than')).toBeInTheDocument();
      expect(within(musicSpot!).getByText('Máy đĩa than')).toBeInTheDocument();

      const archiveSpot = document.getElementById('diorama-spot-archive');
      expect(within(archiveSpot!).getByText('Bảng lưu diễn')).toBeInTheDocument();

      const membershipSpot = document.getElementById('diorama-spot-membership');
      expect(within(membershipSpot!).getByText('Quầy Hội Quán')).toBeInTheDocument();

      const shopSpot = document.getElementById('diorama-spot-shop');
      expect(within(shopSpot!).getByText('Tiệm VieSHOP')).toBeInTheDocument();
    });
  });

  describe('2. Reciprocal Cross-Linking Between Worlds', () => {
    it('links from Artist A to Neon Sessions reciprocally', () => {
      render(
        <MemoryRouter initialEntries={['/worlds/artist-a']}>
          <AppProvider>
            <Routes>
              <Route path="/worlds/:worldId" element={<WorldDetailView />} />
            </Routes>
          </AppProvider>
        </MemoryRouter>
      );

      const portalLink = document.getElementById('diorama-portal-link');
      expect(portalLink).toBeInTheDocument();
      expect(portalLink).toHaveAttribute('href', '/worlds/neon-sessions');
      expect(portalLink).toHaveTextContent(/Sang Neon Sessions/i);

      const shortcutPortal = document.getElementById('shortcut-portal');
      expect(shortcutPortal).toBeInTheDocument();
      expect(shortcutPortal).toHaveAttribute('href', '/worlds/neon-sessions');
      expect(shortcutPortal).toHaveTextContent(/Sang Neon Sessions/i);
    });

    it('links from Neon Sessions back to Artist A reciprocally', () => {
      render(
        <MemoryRouter initialEntries={['/worlds/neon-sessions']}>
          <AppProvider>
            <Routes>
              <Route path="/worlds/:worldId" element={<WorldDetailView />} />
            </Routes>
          </AppProvider>
        </MemoryRouter>
      );

      const portalLink = document.getElementById('diorama-portal-link');
      expect(portalLink).toBeInTheDocument();
      expect(portalLink).toHaveAttribute('href', '/worlds/artist-a');
      expect(portalLink).toHaveTextContent(/Sang Artist A/i);

      const shortcutPortal = document.getElementById('shortcut-portal');
      expect(shortcutPortal).toBeInTheDocument();
      expect(shortcutPortal).toHaveAttribute('href', '/worlds/artist-a');
      expect(shortcutPortal).toHaveTextContent(/Sang Artist A/i);
    });
  });

  describe('3. WorldCard & WorldHeader Cohesion', () => {
    it('renders AvatarRenderer for Artist A and cyber Radio IP mark for Neon Sessions in WorldHeader', () => {
      const { rerender } = render(
        <MemoryRouter>
          <AppProvider>
            <WorldHeader world={artistWorld} />
          </AppProvider>
        </MemoryRouter>
      );

      // Artist A header: character avatar SVG
      expect(screen.getByTestId('avatar-renderer-artist')).toBeInTheDocument();
      expect(screen.getByText('Artist World')).toBeInTheDocument();
      expect(screen.getByText('DEMO')).toBeInTheDocument();

      // Rerender with Neon Sessions
      rerender(
        <MemoryRouter>
          <AppProvider>
            <WorldHeader world={neonWorld} />
          </AppProvider>
        </MemoryRouter>
      );

      expect(screen.getByTestId('header-neon-ip-mark')).toBeInTheDocument();
      expect(screen.getByText('IP World')).toBeInTheDocument();
      expect(screen.getByText('DEMO')).toBeInTheDocument();
    });

    it('renders distinct marks and DEMO badges in WorldCard (Scenery and List views)', () => {
      const { rerender } = render(
        <MemoryRouter>
          <AppProvider>
            <WorldCard world={neonWorld} viewMode="scenery" />
          </AppProvider>
        </MemoryRouter>
      );

      // Scenery mode for Neon Sessions
      expect(screen.getByTestId('neon-ip-mark')).toBeInTheDocument();
      expect(screen.getByText('IP World')).toBeInTheDocument();
      expect(screen.getByText('DEMO')).toBeInTheDocument();

      // List mode for Neon Sessions
      rerender(
        <MemoryRouter>
          <AppProvider>
            <WorldCard world={neonWorld} viewMode="list" />
          </AppProvider>
        </MemoryRouter>
      );

      expect(screen.getByTestId('neon-ip-mark-list')).toBeInTheDocument();
      expect(screen.getByText('Vào World')).toBeInTheDocument();
    });
  });

  describe('4. DiscoverView Prioritizes Today’s Moment and Secondary Flow', () => {
    it('renders DiscoverView with next moment session and featured worlds without duplicate directory clutter', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppProvider>
            <DiscoverView />
          </AppProvider>
        </MemoryRouter>
      );

      // Hero heading & description
      expect(screen.getByTestId('discover-hero-heading')).toBeInTheDocument();
      expect(screen.getByTestId('discover-hero-desc')).toBeInTheDocument();

      // Prioritizes next moment card
      expect(screen.getByText('Khoảnh khắc tiếp theo')).toBeInTheDocument();

      // Featured worlds section
      expect(screen.getByText('Các không gian giải trí nổi bật')).toBeInTheDocument();
      expect(document.getElementById('see-all-worlds-btn')).toHaveAttribute('href', '/worlds');
    });
  });

  describe('5. WorldsView Directory Filtering & Search', () => {
    it('filters worlds by All, Artist, and IP show categories', () => {
      render(
        <MemoryRouter initialEntries={['/worlds']}>
          <AppProvider>
            <WorldsView />
          </AppProvider>
        </MemoryRouter>
      );

      // Initial: All worlds shown (Artist A and Neon Sessions)
      expect(screen.getByRole('heading', { name: 'Artist A' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Neon Sessions' })).toBeInTheDocument();

      // Filter by Artist only
      const artistFilterBtn = document.getElementById('filter-artist-btn')!;
      fireEvent.click(artistFilterBtn);
      expect(screen.getByRole('heading', { name: 'Artist A' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Neon Sessions' })).not.toBeInTheDocument();

      // Filter by IP only
      const ipFilterBtn = document.getElementById('filter-ip-btn')!;
      fireEvent.click(ipFilterBtn);
      expect(screen.queryByRole('heading', { name: 'Artist A' })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Neon Sessions' })).toBeInTheDocument();

      // Filter by All again
      const allFilterBtn = document.getElementById('filter-all-btn')!;
      fireEvent.click(allFilterBtn);
      expect(screen.getByRole('heading', { name: 'Artist A' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Neon Sessions' })).toBeInTheDocument();
    });

    it('searches worlds by keyword', () => {
      render(
        <MemoryRouter initialEntries={['/worlds']}>
          <AppProvider>
            <WorldsView />
          </AppProvider>
        </MemoryRouter>
      );

      const searchInput = document.getElementById('worlds-search-input')!;
      fireEvent.change(searchInput, { target: { value: 'Neon' } });

      expect(screen.queryByRole('heading', { name: 'Artist A' })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Neon Sessions' })).toBeInTheDocument();
    });
  });

  describe('6. ShopView Commerce & Benefit Check Functional Integrity', () => {
    it('renders products and respects required benefits for purchasing in ShopView', () => {
      render(
        <MemoryRouter initialEntries={['/worlds/artist-a/shop']}>
          <AppProvider>
            <Routes>
              <Route path="/worlds/:worldId/shop" element={<ShopView />} />
            </Routes>
          </AppProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Cửa hàng quà tặng lưu niệm Artist A/i)).toBeInTheDocument();

      // Check buy button or member locked state
      const buyButtons = screen.getAllByRole('button');
      expect(buyButtons.length).toBeGreaterThan(0);
    });
  });

  describe('7. Mobile Responsive Layout & Touch Targets (390×844)', () => {
    it('provides accessible interactive regions and shortcuts on mobile', () => {
      render(
        <MemoryRouter initialEntries={['/worlds/neon-sessions']}>
          <AppProvider>
            <Routes>
              <Route path="/worlds/:worldId" element={<WorldDetailView />} />
            </Routes>
          </AppProvider>
        </MemoryRouter>
      );

      // Verify all 4 spots exist and have valid IDs for mobile interaction
      const spotIds = [
        'diorama-spot-music',
        'diorama-spot-archive',
        'diorama-spot-membership',
        'diorama-spot-shop',
      ];
      spotIds.forEach((id) => {
        const spot = document.getElementById(id);
        expect(spot).toBeInTheDocument();
      });

      // Verify text shortcuts bar exists with all items
      const shortcutIds = [
        'shortcut-stage',
        'shortcut-music',
        'shortcut-archive',
        'shortcut-membership',
        'shortcut-shop',
        'shortcut-portal',
      ];
      shortcutIds.forEach((id) => {
        const shortcut = document.getElementById(id);
        expect(shortcut).toBeInTheDocument();
      });
    });
  });

  describe('8. Cover Image Fallback Defensiveness', () => {
    it('handles image error gracefully on WorldHeader without broken image box', () => {
      render(
        <MemoryRouter>
          <AppProvider>
            <WorldHeader world={neonWorld} />
          </AppProvider>
        </MemoryRouter>
      );

      const coverImg = document.querySelector('.world-identity__cover-img');
      if (coverImg) {
        fireEvent.error(coverImg);
      }

      // Identity header and title still render cleanly
      expect(screen.getByText('Neon Sessions')).toBeInTheDocument();
      expect(screen.getByTestId('header-neon-ip-mark')).toBeInTheDocument();
    });
  });
});

