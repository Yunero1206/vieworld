import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Compass, Globe, User, Mail, Sparkles, Sliders, HelpCircle, ArrowRightLeft } from 'lucide-react';
import { DemoBanner } from './DemoBanner';
import { StatusNotice } from './StatusNotice';
import { ResetDrawer } from './ResetDrawer';
import { WorldGuidePanel } from './WorldGuidePanel';
import { ErrorBoundary } from './ErrorBoundary';
import { useApp } from '../context/AppContext';
import { getTenantConfig } from '../domain/tenantConfig';
import { TenantId } from '../domain/types';
import { AvatarRenderer } from './AvatarRenderer';
import { getAccessoryName } from '../world/assetManifest';

export const AppShell: React.FC = () => {
  const { state, storageNotice, dismissNotice, dispatch, setTenant, resetActiveTenant } = useApp();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!/jsdom/i.test(window.navigator.userAgent)) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname]);

  const tenantConfig = getTenantConfig(state.activeTenantId);
  const unreadNotifCount = Object.values(state.notifications || {}).filter((n) => !n.isRead).length;

  return (
    <div
      className="app-container"
      data-testid="app-container"
      data-tenant={state.activeTenantId}
      style={
        {
          '--primary': tenantConfig.accentColor,
          '--primary-hover': tenantConfig.accentHover,
          '--tenant-accent-light': tenantConfig.accentLight,
          '--tenant-accent-border': tenantConfig.accentBorder,
        } as React.CSSProperties
      }
    >
      <a href="#main-content" className="skip-link" data-testid="skip-to-content-link">
        Chuyển đến nội dung chính
      </a>
      <DemoBanner />

      {/* Mobile Top Header */}
      <div className="mobile-header" aria-label="Thanh thương hiệu di động">
        <div className="brand-logo" data-testid="mobile-brand-logo">
          <span className="brand-orbit" aria-hidden="true">✦</span>
          <span>{tenantConfig.labels.brandName}</span>
          <span className="brand-badge">{tenantConfig.labels.brandBadge}</span>
        </div>

        <div className="mobile-header-tools">
          <div className="header-tenant-switcher">
            <label htmlFor="mobile-tenant-select" className="sr-only">
              <span>Không gian (Tenant):</span>
            </label>
            <select
              id="mobile-tenant-select"
              value={state.activeTenantId}
              onChange={(e) => setTenant(e.target.value as TenantId)}
              aria-label="Chọn không gian Tenant"
            >
              <option value="vieworld-demo">VieWorld</option>
              <option value="mfan-demo">MFan</option>
              <option value="fanme-demo">FanMe</option>
            </select>
          </div>

          <NavLink
            to="/studio"
            className="btn btn-secondary btn-header-tool mobile-studio-btn"
            id="mobile-nav-studio"
            aria-label={tenantConfig.labels.studioTitle}
            title={tenantConfig.labels.studioTitle}
          >
            <Sparkles size={14} color="var(--primary)" aria-hidden="true" />
            <span>Studio</span>
          </NavLink>
        </div>
      </div>

      <div className="app-shell">
        <aside className="sidebar" aria-label="Điều hướng ứng dụng">
          <div className="sidebar-brand-group">
            <div className="brand-logo" data-testid="brand-logo">
              <span className="brand-orbit" aria-hidden="true">✦</span>
              <span>{tenantConfig.labels.brandName}</span>
              <span className="brand-badge" data-testid="brand-badge">{tenantConfig.labels.brandBadge}</span>
            </div>

            {/* Quick Tenant Switcher Selector (§1, §3, P15) */}
            <div className="header-tenant-switcher">
              <label
                htmlFor="quick-tenant-select"
                className="sr-only"
              >
                <ArrowRightLeft size={12} color="var(--primary)" />
                <span>Không gian (Tenant):</span>
              </label>
              <select
                id="quick-tenant-select"
                data-testid="tenant-switcher-select"
                value={state.activeTenantId}
                onChange={(e) => setTenant(e.target.value as TenantId)}
                aria-label="Chọn không gian Tenant"
              >
                <option value="vieworld-demo">VieWorld</option>
                <option value="mfan-demo">MFan</option>
                <option value="fanme-demo">FanMe</option>
              </select>
            </div>
          </div>

          <nav aria-label="Menu chính" className="header-nav-container">
            <ul className="nav-links">
              <li className="nav-item">
                <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} id="nav-discover" data-testid="nav-discover-link">
                  <Compass size={18} aria-hidden="true" />
                  <span>{tenantConfig.labels.discoverTitle}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/worlds" className={({ isActive }) => (isActive ? 'active' : '')} id="nav-worlds" data-testid="nav-worlds-link">
                  <Globe size={18} aria-hidden="true" />
                  <span>{tenantConfig.labels.worldsTitle}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/me" className={({ isActive }) => (isActive ? 'active' : '')} id="nav-my-world" data-testid="nav-my-world-link">
                  <User size={18} aria-hidden="true" />
                  <span>{state.activeTenantId === 'vieworld-demo' ? 'Phòng tôi' : tenantConfig.labels.myWorldTitle}</span>
                  {state.activeTenantId === 'vieworld-demo' && <span className="sr-only"> (My World)</span>}
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="sidebar-tools" role="toolbar" aria-label="Công cụ và tiện ích">
            <NavLink
              to="/studio"
              className={({ isActive }) => `btn btn-secondary btn-header-tool ${isActive ? 'active' : ''}`}
              id="nav-studio"
              data-testid="nav-studio-link"
              title={tenantConfig.labels.studioTitle}
              aria-label={tenantConfig.labels.studioTitle}
            >
              <Sparkles size={15} color="var(--primary)" aria-hidden="true" />
              <span className="header-tool-label">{tenantConfig.labels.studioTitle}</span>
            </NavLink>

            <NavLink
              to="/inbox"
              className={({ isActive }) => `btn btn-secondary btn-header-tool ${isActive ? 'active' : ''}`}
              id="nav-inbox"
              data-testid="nav-inbox-link"
              aria-label={`${tenantConfig.labels.inboxTitle}${unreadNotifCount > 0 ? ` (${unreadNotifCount} chưa đọc)` : ''}`}
              title={tenantConfig.labels.inboxTitle}
            >
              <Mail size={15} color="var(--primary)" aria-hidden="true" />
              <span className="header-tool-label">{tenantConfig.labels.inboxTitle}</span>
              {unreadNotifCount > 0 && (
                <span
                  data-testid="unread-notif-badge"
                  className="unread-badge-pill"
                >
                  {unreadNotifCount}
                </span>
              )}
            </NavLink>

            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              id="sidebar-world-guide-btn"
              data-testid="open-world-guide-btn"
              className="btn btn-secondary btn-header-tool"
              aria-label="Mở trợ giúp và hướng dẫn"
              title="Trợ giúp"
            >
              <HelpCircle size={15} color="var(--primary)" aria-hidden="true" />
              <span className="header-tool-label">Trợ giúp</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              id="sidebar-scenario-drawer-btn"
              data-testid="open-scenario-drawer-btn"
              className="btn btn-secondary btn-header-tool"
              aria-label="Mở bảng kịch bản review"
              title="Review"
            >
              <Sliders size={15} color="var(--primary)" aria-hidden="true" />
              <span className="header-tool-label">Review</span>
            </button>

            <NavLink
              to="/me"
              className="header-user-avatar"
              aria-label={`Mở trang cá nhân My World - ${state.fanProfile.displayName}`}
              data-testid="header-user-avatar"
              title={`Hồ sơ của ${state.fanProfile.displayName}${state.fanProfile.wardrobeChoice?.accessoryId ? ` · Đang đeo: ${getAccessoryName(state.fanProfile.wardrobeChoice.accessoryId)}` : ''}`}
            >
              <AvatarRenderer
                role="fan"
                accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
                size="sm"
                displayName={state.fanProfile.displayName}
                testId="header-avatar-renderer"
              />
            </NavLink>
          </div>
        </aside>

        <main className="main-content" id="main-content">
          {/* Active Status & Recovery Notices */}
          {storageNotice && (
            <StatusNotice
              message={storageNotice}
              type="info"
              onDismiss={dismissNotice}
            />
          )}

          {/* Domain Error Notice */}
          {state.lastError && (
            <StatusNotice
              message={`${state.lastError.message}${
                state.lastError.actionableResolution ? ` — ${state.lastError.actionableResolution}` : ''
              }`}
              type="error"
              onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
            />
          )}

          <ErrorBoundary onResetDemoData={() => resetActiveTenant()} onReset={() => resetActiveTenant()}>
            <Outlet />
          </ErrorBoundary>
        </main>

        <footer className="app-footer">
          <div data-testid="tenant-disclaimer-notice" className="app-footer__disclaimer">
            <span className="sr-only">{tenantConfig.disclaimer}</span>
            <span className="sr-only">Không gian: <code>{state.activeTenantId}</code></span>
            <span className="app-footer__copyright">
              © 2026 {tenantConfig.displayName} · Fandom Entertainment Platform
            </span>
            <NavLink to="/about-demo" className="app-footer__link" id="nav-about">
              Về Demo
            </NavLink>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav" aria-label="Điều hướng di động">
        <ul className="mobile-nav-list">
          <li className="mobile-nav-item">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} id="mobile-nav-discover">
              <Compass size={20} aria-hidden="true" />
              <span>{tenantConfig.labels.discoverTitle}</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink to="/worlds" className={({ isActive }) => (isActive ? 'active' : '')} id="mobile-nav-worlds">
              <Globe size={20} aria-hidden="true" />
              <span>{tenantConfig.labels.worldsTitle}</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink to="/me" className={({ isActive }) => (isActive ? 'active' : '')} id="mobile-nav-my-world">
              <User size={20} aria-hidden="true" />
              <span>{state.activeTenantId === 'vieworld-demo' ? 'Phòng tôi' : tenantConfig.labels.myWorldTitle}</span>
              {state.activeTenantId === 'vieworld-demo' && <span className="sr-only"> (My World)</span>}
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink to="/inbox" className={({ isActive }) => (isActive ? 'active' : '')} id="mobile-nav-inbox">
              <div className="mobile-icon-badge-wrap">
                <Mail size={20} aria-hidden="true" />
                {unreadNotifCount > 0 && (
                  <span
                    data-testid="mobile-unread-notif-badge"
                    className="mobile-badge-pill"
                  >
                    {unreadNotifCount}
                  </span>
                )}
              </div>
              <span>{tenantConfig.labels.inboxTitle}</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              id="mobile-nav-guide-btn"
              data-testid="mobile-open-world-guide-btn"
              className="mobile-tool-btn"
            >
              <HelpCircle size={20} color="var(--primary)" aria-hidden="true" />
              <span>Hướng dẫn</span>
            </button>
          </li>
          <li className="mobile-nav-item">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              id="mobile-nav-drawer-btn"
              className="mobile-tool-btn"
            >
              <Sliders size={20} color="var(--primary)" aria-hidden="true" />
              <span>Kịch bản</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Reset & Scenario Drawer */}
      <ResetDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* World Guide Panel */}
      <WorldGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};
