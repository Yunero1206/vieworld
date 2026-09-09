import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Compass, Globe, User, Mail, Sparkles, Info } from 'lucide-react';
import { DemoBanner } from './DemoBanner';

export const AppShell: React.FC = () => {
  return (
    <div className="app-container">
      <DemoBanner />

      <div className="app-shell">
        <aside className="sidebar" aria-label="Điều hướng ứng dụng">
          <div className="brand-logo">
            <span>VieWorld</span>
            <span className="brand-badge">PROTOTYPE</span>
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
        </aside>

        <main className="main-content" id="main-content">
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
        </ul>
      </nav>
    </div>
  );
};
