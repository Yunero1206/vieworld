/**
 * Job 01 Acceptance Test Suite: Shell, CSS & Navigation Simplification
 * (docs/CONSTITUTION.md §2, §3, VIEWORLD_WORLD_PLAN.md §4, ANTIGRAVITY_JOBS.md Job 01)
 *
 * Verifies:
 * 1. Primary navigation is streamlined to exactly 3 core destinations: Khám phá / World / Phòng tôi
 * 2. Inbox is a utility tool with accessible name and notification count badge
 * 3. Studio access is preserved in utility tools
 * 4. Trợ giúp (Guide), Review (Scenario Drawer), and DEMO banner are preserved
 * 5. Quick tenant switcher is visible and accessible
 * 6. Mobile (390×844) and Desktop (1440×900) layout resilience
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { AppShell } from '../components/AppShell';
import { DiscoverView } from '../views/DiscoverView';
import { _resetMemoryFallbackFlagForTesting } from '../services/storageAdapter';

describe('Job 01: Shell CSS & Streamlined Navigation', () => {
  beforeEach(() => {
    _resetMemoryFallbackFlagForTesting();
    window.localStorage.clear();
  });

  const renderShellAtViewport = (width: number, height: number, initialRoute = '/') => {
    window.innerWidth = width;
    window.innerHeight = height;

    return render(
      <AppProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<DiscoverView />} />
              <Route path="worlds" element={<div data-testid="worlds-view">Worlds Page</div>} />
              <Route path="me" element={<div data-testid="my-world-view">My Room Page</div>} />
              <Route path="inbox" element={<div data-testid="inbox-view">Inbox Page</div>} />
              <Route path="studio" element={<div data-testid="studio-view">Studio Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AppProvider>
    );
  };

  describe('1. Core 3-Item Primary Navigation', () => {
    it('renders exactly 3 primary navigation links in the main header menu', () => {
      renderShellAtViewport(1440, 900);

      const navContainer = screen.getByRole('navigation', { name: /Menu chính/i });
      expect(navContainer).toBeInTheDocument();

      const discoverLink = screen.getByTestId('nav-discover-link');
      const worldsLink = screen.getByTestId('nav-worlds-link');
      const myWorldLink = screen.getByTestId('nav-my-world-link');

      expect(discoverLink).toBeInTheDocument();
      expect(discoverLink).toHaveAttribute('href', '/');
      expect(discoverLink).toHaveTextContent(/Khám phá/i);

      expect(worldsLink).toBeInTheDocument();
      expect(worldsLink).toHaveAttribute('href', '/worlds');
      expect(worldsLink).toHaveTextContent(/World/i);

      expect(myWorldLink).toBeInTheDocument();
      expect(myWorldLink).toHaveAttribute('href', '/me');
      expect(myWorldLink).toHaveTextContent(/Phòng tôi/i);

      // Verify that the main nav-links list contains exactly these 3 primary items
      const primaryLinks = navContainer.querySelectorAll('.nav-links > li');
      expect(primaryLinks.length).toBe(3);
    });
  });

  describe('2. Utility Tools & Preserved Access (Inbox, Studio, Trợ giúp, Review)', () => {
    it('renders Inbox as a utility tool with accessible name and unread badge', () => {
      renderShellAtViewport(1440, 900);

      const inboxLink = screen.getByTestId('nav-inbox-link');
      expect(inboxLink).toBeInTheDocument();
      expect(inboxLink).toHaveAttribute('href', '/inbox');
      expect(inboxLink).toHaveAttribute('title', 'Hộp thư');

      // Unread notification badge is present in utility tool
      const unreadBadge = screen.getByTestId('unread-notif-badge');
      expect(unreadBadge).toBeInTheDocument();
      expect(Number(unreadBadge.textContent)).toBeGreaterThan(0);
    });

    it('preserves Studio access in the utility tools section', () => {
      renderShellAtViewport(1440, 900);

      const studioLink = screen.getByTestId('nav-studio-link');
      expect(studioLink).toBeInTheDocument();
      expect(studioLink).toHaveAttribute('href', '/studio');
      expect(studioLink).toHaveTextContent(/Studio/i);
    });

    it('preserves Trợ giúp and Review action buttons in utility tools', () => {
      renderShellAtViewport(1440, 900);

      const guideBtn = screen.getByTestId('open-world-guide-btn');
      expect(guideBtn).toBeInTheDocument();
      expect(guideBtn).toHaveTextContent(/Trợ giúp/i);

      const reviewBtn = screen.getByTestId('open-scenario-drawer-btn');
      expect(reviewBtn).toBeInTheDocument();
      expect(reviewBtn).toHaveTextContent(/Review/i);
    });

    it('renders persistent DEMO banner and tenant switcher', () => {
      renderShellAtViewport(1440, 900);

      // DEMO banner is persistently rendered
      const demoBanners = screen.getAllByLabelText(/Thông báo phiên bản thử nghiệm/i);
      expect(demoBanners.length).toBeGreaterThan(0);
      expect(screen.getAllByText('DEMO')[0]).toBeInTheDocument();
      expect(screen.getByText(/Bản thử nghiệm · Dữ liệu và tương tác mô phỏng/i)).toBeInTheDocument();

      // Tenant switcher selector is rendered and functional
      const tenantSelect = screen.getByTestId('tenant-switcher-select');
      expect(tenantSelect).toBeInTheDocument();
      expect(tenantSelect).toHaveValue('vieworld-demo');
    });
  });

  describe('3. Viewport Verification (390×844 Mobile & 1440×900 Desktop)', () => {
    it('renders mobile layout (390×844) with mobile top header and bottom nav', () => {
      renderShellAtViewport(390, 844);

      // Mobile brand logo in top header
      const mobileBrandLogo = screen.getByTestId('mobile-brand-logo');
      expect(mobileBrandLogo).toBeInTheDocument();
      expect(mobileBrandLogo).toHaveTextContent('VieWorld');

      // Mobile bottom nav exists with 3 core links + utilities
      const mobileNav = screen.getByRole('navigation', { name: /Điều hướng di động/i });
      expect(mobileNav).toBeInTheDocument();

      expect(mobileNav.querySelector('#mobile-nav-discover')).toBeInTheDocument();
      expect(mobileNav.querySelector('#mobile-nav-worlds')).toBeInTheDocument();
      expect(mobileNav.querySelector('#mobile-nav-my-world')).toBeInTheDocument();

      // Mobile utilities
      const mobileInbox = mobileNav.querySelector('#mobile-nav-inbox');
      expect(mobileInbox).toBeInTheDocument();
      expect(mobileInbox).toHaveAttribute('href', '/inbox');
      expect(screen.getByTestId('mobile-unread-notif-badge')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-open-world-guide-btn')).toBeInTheDocument();
      expect(mobileNav.querySelector('#mobile-nav-drawer-btn')).toBeInTheDocument();

      // Mobile Studio button exists in mobile header
      const mobileStudio = document.getElementById('mobile-nav-studio');
      expect(mobileStudio).toBeInTheDocument();
      expect(mobileStudio).toHaveAttribute('href', '/studio');
    });

    it('renders desktop layout (1440×900) with top horizontal header and tools toolbar', () => {
      renderShellAtViewport(1440, 900);

      const desktopSidebar = screen.getByRole('complementary', { name: /Điều hướng ứng dụng/i }) || screen.getByLabelText(/Điều hướng ứng dụng/i);
      expect(desktopSidebar).toBeInTheDocument();

      // Tools toolbar
      const toolsToolbar = screen.getByRole('toolbar', { name: /Công cụ và tiện ích/i });
      expect(toolsToolbar).toBeInTheDocument();
    });
  });
});
