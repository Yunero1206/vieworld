import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Compass, Globe, User, Mail, Sparkles, Info, Sliders, HelpCircle, ArrowRightLeft } from 'lucide-react';
import { DemoBanner } from './DemoBanner';
import { StatusNotice } from './StatusNotice';
import { ResetDrawer } from './ResetDrawer';
import { WorldGuidePanel } from './WorldGuidePanel';
import { ErrorBoundary } from './ErrorBoundary';
import { useApp } from '../context/AppContext';
import { getTenantConfig } from '../domain/tenantConfig';
import { TenantId } from '../domain/types';

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

      <div className="app-shell">
        <aside className="sidebar" aria-label="Điều hướng ứng dụng">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="brand-logo" data-testid="brand-logo">
              <span className="brand-orbit" aria-hidden="true">✦</span>
              <span>{tenantConfig.labels.brandName}</span>
              <span className="brand-badge" data-testid="brand-badge">{tenantConfig.labels.brandBadge}</span>
            </div>

            {/* Quick Tenant Switcher Selector (§1, §3, P15) */}
            <div className="review-only-control">
              <label
                htmlFor="quick-tenant-select"
                style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowRightLeft size={12} color="var(--primary)" />
                <span>Không gian (Tenant):</span>
              </label>
              <select
                id="quick-tenant-select"
                data-testid="tenant-switcher-select"
                value={state.activeTenantId}
                onChange={(e) => setTenant(e.target.value as TenantId)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                <option value="vieworld-demo">VieWorld (Nguyên mẫu gốc)</option>
                <option value="mfan-demo">MFan (Cấu hình đối tác)</option>
                <option value="fanme-demo">FanMe (Cấu hình độc lập)</option>
              </select>
            </div>
          </div>

          <nav aria-label="Menu chính">
            <ul className="nav-links">
              <li className="nav-item">
                <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} id="nav-discover" data-testid="nav-discover-link">
                  <Compass size={20} aria-hidden="true" />
                  <span>{tenantConfig.labels.discoverTitle}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/worlds" className={({ isActive }) => (isActive ? 'active' : '')} id="nav-worlds" data-testid="nav-worlds-link">
                  <Globe size={20} aria-hidden="true" />
                  <span>{tenantConfig.labels.worldsTitle}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/me" className={({ isActive }) => (isActive ? 'active' : '')} id="nav-my-world" data-testid="nav-my-world-link">
                  <User size={20} aria-hidden="true" />
                  <span>{tenantConfig.labels.myWorldTitle}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/inbox" className={({ isActive }) => (isActive ? 'active' : '')} id="nav-inbox" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Mail size={20} aria-hidden="true" />
                  <span>{tenantConfig.labels.inboxTitle}</span>
                  {unreadNotifCount > 0 && (
                    <span
                      data-testid="unread-notif-badge"
                      style={{
                        marginLeft: 'auto',
                        backgroundColor: 'var(--primary)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '1px 7px',
                        borderRadius: '10px',
                        lineHeight: 1.3,
                      }}
                    >
                      {unreadNotifCount}
                    </span>
                  )}
                </NavLink>
              </li>
              <li className="nav-item nav-item--review-only">
                <NavLink to="/studio" className={({ isActive }) => (isActive ? 'active' : '')} id="nav-studio">
                  <Sparkles size={20} aria-hidden="true" />
                  <span>{tenantConfig.labels.studioTitle}</span>
                </NavLink>
              </li>
              <li className="nav-item nav-item--review-only">
                <NavLink to="/about-demo" className={({ isActive }) => (isActive ? 'active' : '')} id="nav-about">
                  <Info size={20} aria-hidden="true" />
                  <span>Về Demo</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="sidebar-tools">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              id="sidebar-world-guide-btn"
              data-testid="open-world-guide-btn"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', fontSize: 'var(--text-xs)' }}
            >
              <HelpCircle size={16} color="var(--primary)" />
              <span>Trợ giúp</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              id="sidebar-scenario-drawer-btn"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', fontSize: 'var(--text-xs)' }}
            >
              <Sliders size={16} color="var(--primary)" />
              <span>Chế độ review</span>
            </button>
          </div>
        </aside>

        <main className="main-content" id="main-content">
          {/* Tenant Disclaimer Notice (§1, §2.3, §3, P15) */}
          <div
            data-testid="tenant-disclaimer-notice"
            className="review-context-strip"
          >
            <span className="review-context-strip__visible">
              <span className="review-context-strip__dot" aria-hidden="true" />
              DEMO · {tenantConfig.displayName} · Dữ liệu mô phỏng
            </span>
            <span className="sr-only">{tenantConfig.disclaimer}</span>
            <span className="sr-only">Không gian: <code>{state.activeTenantId}</code></span>
          </div>
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

          <ErrorBoundary onReset={() => resetActiveTenant()}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Điều hướng di động">
        <ul className="mobile-nav-list">
          <li className="mobile-nav-item">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} id="mobile-nav-discover">
              <Compass size={22} aria-hidden="true" />
              <span>{tenantConfig.labels.discoverTitle}</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink to="/worlds" className={({ isActive }) => (isActive ? 'active' : '')} id="mobile-nav-worlds">
              <Globe size={22} aria-hidden="true" />
              <span>{tenantConfig.labels.worldsTitle}</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink to="/me" className={({ isActive }) => (isActive ? 'active' : '')} id="mobile-nav-my-world">
              <User size={22} aria-hidden="true" />
              <span>{tenantConfig.labels.myWorldTitle}</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink to="/inbox" className={({ isActive }) => (isActive ? 'active' : '')} id="mobile-nav-inbox">
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Mail size={22} aria-hidden="true" />
                {unreadNotifCount > 0 && (
                  <span
                    data-testid="mobile-unread-notif-badge"
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-8px',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      lineHeight: 1,
                    }}
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
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: 'var(--muted)', fontSize: 'var(--text-xs)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <HelpCircle size={22} color="var(--primary)" aria-hidden="true" />
              <span>Hướng dẫn</span>
            </button>
          </li>
          <li className="mobile-nav-item">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              id="mobile-nav-drawer-btn"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: 'var(--muted)', fontSize: 'var(--text-xs)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Sliders size={22} color="var(--primary)" aria-hidden="true" />
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
