import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Compass, Globe, User, Mail, Sparkles, Info, Sliders } from 'lucide-react';
import { DemoBanner } from './DemoBanner';
import { StatusNotice } from './StatusNotice';
import { ResetDrawer } from './ResetDrawer';
import { useApp } from '../context/AppContext';

export const AppShell: React.FC = () => {
  const { state, storageNotice, dismissNotice, dispatch } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getTenantLabel = () => {
    switch (state.activeTenantId) {
      case 'mfan-demo':
        return 'MFan';
      case 'fanme-demo':
        return 'FanMe';
      case 'vieworld-demo':
      default:
        return 'VieWorld';
    }
  };

  return (
    <div className="app-container">
      <DemoBanner />

      <div className="app-shell">
        <aside className="sidebar" aria-label="Điều hướng ứng dụng">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="brand-logo">
              <span>{getTenantLabel()}</span>
              <span className="brand-badge">PROTOTYPE</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
              Tenant: <code>{state.activeTenantId}</code>
            </div>
          </div>

          <nav aria-label="Menu chính">
            <ul className="nav-links">
              <li className="nav-item">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} id="nav-discover">
                  <Compass size={20} aria-hidden="true" />
                  <span>Khám phá</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/worlds" className={({ isActive }) => isActive ? 'active' : ''} id="nav-worlds">
                  <Globe size={20} aria-hidden="true" />
                  <span>Worlds</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/me" className={({ isActive }) => isActive ? 'active' : ''} id="nav-my-world">
                  <User size={20} aria-hidden="true" />
                  <span>My World</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/inbox" className={({ isActive }) => isActive ? 'active' : ''} id="nav-inbox">
                  <Mail size={20} aria-hidden="true" />
                  <span>Hộp thư</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/studio" className={({ isActive }) => isActive ? 'active' : ''} id="nav-studio">
                  <Sparkles size={20} aria-hidden="true" />
                  <span>Studio Demo</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about-demo" className={({ isActive }) => isActive ? 'active' : ''} id="nav-about">
                  <Info size={20} aria-hidden="true" />
                  <span>Về Demo</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              id="sidebar-scenario-drawer-btn"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', fontSize: 'var(--text-xs)' }}
            >
              <Sliders size={16} color="var(--primary)" />
              <span>Bảng thử nghiệm & Kịch bản</span>
            </button>
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

          <Outlet />
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Điều hướng di động">
        <ul className="mobile-nav-list">
          <li className="mobile-nav-item">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} id="mobile-nav-discover">
              <Compass size={22} aria-hidden="true" />
              <span>Khám phá</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink to="/worlds" className={({ isActive }) => isActive ? 'active' : ''} id="mobile-nav-worlds">
              <Globe size={22} aria-hidden="true" />
              <span>Worlds</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink to="/me" className={({ isActive }) => isActive ? 'active' : ''} id="mobile-nav-my-world">
              <User size={22} aria-hidden="true" />
              <span>My World</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink to="/inbox" className={({ isActive }) => isActive ? 'active' : ''} id="mobile-nav-inbox">
              <Mail size={22} aria-hidden="true" />
              <span>Hộp thư</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              id="mobile-nav-drawer-btn"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}
            >
              <Sliders size={22} color="var(--primary)" aria-hidden="true" />
              <span>Kịch bản</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Reset & Scenario Drawer */}
      <ResetDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};
