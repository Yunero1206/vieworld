import { ownedDigitalLook } from '../world/merchCatalog';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Compass, ShoppingBag, House, Mail, Menu, X, Music2, CalendarDays, HelpCircle, LayoutDashboard, FlaskConical, Shield, Ticket, Heart, ChevronRight } from 'lucide-react';
import { StatusNotice } from './StatusNotice';
import { ResetDrawer } from './ResetDrawer';
import { WorldGuidePanel } from './WorldGuidePanel';
import { ErrorBoundary } from './ErrorBoundary';
import { AvatarRenderer } from './AvatarRenderer';
import { useApp } from '../context/AppContext';
import { getTenantConfig } from '../domain/tenantConfig';
import { VieWorldLogo } from './VieWorldLogo';

export const FanShell = () => {
  const { state, dispatch, storageNotice, dismissNotice, resetActiveTenant } = useApp();
  const tenantConfig = getTenantConfig(state.activeTenantId);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const [guide, setGuide] = useState(false);
  const [review, setReview] = useState(false);

  const mobileMenuRef = useRef<HTMLElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLElement>(null);
  const accountBtnRef = useRef<HTMLButtonElement>(null);

  const { pathname } = useLocation();
  const unread = Object.values(state.notifications || {}).filter(n => !n.isRead).length;

  useEffect(() => {
    setMobileMenu(false);
    setAccountMenu(false);
    window.scrollTo?.(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        mobileMenu &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        mobileMenuBtnRef.current &&
        !mobileMenuBtnRef.current.contains(target)
      ) {
        setMobileMenu(false);
      }
      if (
        accountMenu &&
        accountRef.current &&
        !accountRef.current.contains(target) &&
        accountBtnRef.current &&
        !accountBtnRef.current.contains(target)
      ) {
        setAccountMenu(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenu(false);
        setAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [mobileMenu, accountMenu]);

  const inShop = pathname === '/shop' || pathname.endsWith('/shop') || pathname === '/cart' || pathname.startsWith('/checkout/') || pathname.startsWith('/orders/');
  const inMoments = (pathname.startsWith('/worlds/') && !inShop && !pathname.endsWith('/archive')) || pathname.endsWith('/moments') || pathname.startsWith('/sessions/') || pathname.startsWith('/benefits/');
  const inHome = pathname === '/me' || pathname.startsWith('/members/') || pathname.endsWith('/archive');
  const inExplore = pathname === '/artists' || pathname === '/explore';

  return (
    <div className="fan-shell" data-testid="app-container" data-tenant={state.activeTenantId}>
      <a href="#main-content" className="skip-link" data-testid="skip-to-content-link">Chuyển đến nội dung chính</a>
      <header className={`fw-header ${pathname === '/' ? 'fw-header-plaza' : ''}`}>
        <NavLink to="/" className="fw-brand" aria-label={`${tenantConfig.labels.brandName} — về thế giới`}>
          <VieWorldLogo size={32} className="fw-brand-logo" />
          <div className="fw-brand-info">
            <span className="fw-brand-title">{tenantConfig.labels.brandName}</span>
            <small>{state.activeTenantId === 'vieworld-demo' ? 'một thế giới, cùng nhau' : tenantConfig.tagline}</small>
          </div>
        </NavLink>

        <nav className="fw-main-nav" aria-label="Điều hướng chính">
          {[
            [Music2, '/explore', 'Explore', inExplore],
            [CalendarDays, '/moments', 'Moments', inMoments],
            [House, '/me', 'My Space', inHome],
            [ShoppingBag, '/shop', tenantConfig.labels.shopTitle || 'VieSHOP', inShop],
          ].map(([Icon, to, label, active]) => {
            const NavIcon = Icon as typeof Compass;
            return (
              <Link key={String(to)} to={String(to)} aria-current={active ? 'page' : undefined} className={active ? 'selected' : ''}>
                <NavIcon size={19} />
                <span>{String(label)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="fw-header-tools">
          <NavLink to="/inbox" className="fw-icon" aria-label={`Hộp thư${unread ? `, ${unread} chưa đọc` : ''}`}>
            <Mail size={19} />
            {unread > 0 && <i>{unread}</i>}
          </NavLink>

          {/* Desktop & Mobile Avatar Menu Button */}
          <button
            ref={accountBtnRef}
            type="button"
            className={`fw-profile-btn ${accountMenu ? 'active' : ''}`}
            aria-label={`Tài khoản của ${state.fanProfile.displayName}`}
            aria-haspopup="menu"
            aria-expanded={accountMenu}
            onClick={() => {
              setAccountMenu(!accountMenu);
              setMobileMenu(false);
            }}
          >
            <AvatarRenderer
              role="fan"
              digitalLook={ownedDigitalLook(state)}
              size="sm"
              accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
              appearance={state.fanProfile.avatarPreset}
              displayName={state.fanProfile.displayName}
            />
          </button>

          {/* Mobile-only Hamburger Menu Button */}
          <button
            ref={mobileMenuBtnRef}
            type="button"
            className="fw-icon fw-mobile-menu-btn"
            aria-label={mobileMenu ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenu}
            onClick={() => {
              setMobileMenu(!mobileMenu);
              setAccountMenu(false);
            }}
          >
            {mobileMenu ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {/* Account Menu Popover */}
        {accountMenu && (
          <nav
            ref={accountRef}
            className="fw-menu fw-account-menu-popover"
            aria-label="Tài khoản và tiện ích"
            onKeyDown={e => {
              if (e.key === 'Escape') setAccountMenu(false);
            }}
          >
            <NavLink
              to="/me"
              className="fw-menu-profile-card fw-menu-profile-link"
              aria-label={`Mở My Space của ${state.fanProfile.displayName}`}
              onClick={() => setAccountMenu(false)}
            >
              <div className="fw-menu-avatar-wrap">
                <AvatarRenderer
                  role="fan"
                  digitalLook={ownedDigitalLook(state)}
                  size="sm"
                  accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
                  appearance={state.fanProfile.avatarPreset}
                  displayName={state.fanProfile.displayName}
                />
              </div>
              <div className="fw-menu-profile-meta">
                <strong className="fw-menu-profile-name">{state.fanProfile.displayName}</strong>
                <span className="fw-menu-profile-sub">Hồ sơ fan</span>
              </div>
              <ChevronRight className="fw-menu-profile-arrow" size={18} aria-hidden="true" />
            </NavLink>

            <div className="fw-menu-group">
              <span className="fw-menu-group-title">Dành cho fan</span>
              <NavLink to="/explore#your-worlds-heading" className="fw-menu-item" onClick={() => setAccountMenu(false)}>
                <span className="fw-menu-item-icon">
                  <Heart size={16} />
                </span>
                <span className="fw-menu-item-label">Đang theo dõi</span>
                <span className="fw-menu-count-badge fw-menu-count-neutral">{state.followedWorldIds.length}</span>
              </NavLink>
              <NavLink to="/me?panel=pass" className="fw-menu-item" onClick={() => setAccountMenu(false)}>
                <span className="fw-menu-item-icon">
                  <Ticket size={16} />
                </span>
                <span className="fw-menu-item-label">Fandom Pass</span>
              </NavLink>
              <NavLink to="/me?panel=bag" className="fw-menu-item" onClick={() => setAccountMenu(false)}>
                <span className="fw-menu-item-icon">
                  <ShoppingBag size={16} />
                </span>
                <span className="fw-menu-item-label">Túi đồ &amp; đơn hàng</span>
              </NavLink>
            </div>

            <div className="fw-menu-divider" />

            <div className="fw-menu-group">
              <span className="fw-menu-group-title">Tài khoản &amp; hỗ trợ</span>
              <NavLink to="/me?panel=privacy" className="fw-menu-item" onClick={() => setAccountMenu(false)}>
                <span className="fw-menu-item-icon">
                  <Shield size={16} />
                </span>
                <span className="fw-menu-item-label">Quyền riêng tư</span>
              </NavLink>
              <button
                type="button"
                className="fw-menu-item fw-menu-btn"
                onClick={() => {
                  setGuide(true);
                  setAccountMenu(false);
                }}
              >
                <span className="fw-menu-item-icon">
                  <HelpCircle size={16} />
                </span>
                <span className="fw-menu-item-label">Trợ giúp</span>
              </button>
            </div>

            <div className="fw-menu-divider" />

            <div className="fw-menu-utility-row" aria-label="Công cụ bản thử nghiệm">
              <NavLink to="/studio" onClick={() => setAccountMenu(false)}>
                <LayoutDashboard size={14} />
                <span>Studio</span>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setReview(true);
                  setAccountMenu(false);
                }}
              >
                <FlaskConical size={14} />
                <span>Kịch bản demo</span>
              </button>
            </div>
          </nav>
        )}

        {/* Mobile-only Global Navigation Popover */}
        {mobileMenu && (
          <nav
            ref={mobileMenuRef}
            className="fw-menu fw-mobile-nav-popover"
            aria-label="Điều hướng di động"
            onKeyDown={e => {
              if (e.key === 'Escape') setMobileMenu(false);
            }}
          >
            <div className="fw-menu-group">
              <span className="fw-menu-group-title">Điều hướng</span>
              <NavLink to="/" className="fw-menu-item" onClick={() => setMobileMenu(false)}>
                <span className="fw-menu-item-icon">
                  <Compass size={16} />
                </span>
                <span className="fw-menu-item-label">Quảng trường · Thế giới</span>
              </NavLink>
              <NavLink to="/explore" className="fw-menu-item" onClick={() => setMobileMenu(false)}>
                <span className="fw-menu-item-icon">
                  <Music2 size={16} />
                </span>
                <span className="fw-menu-item-label">Explore</span>
              </NavLink>
              <NavLink to="/moments" className="fw-menu-item" onClick={() => setMobileMenu(false)}>
                <span className="fw-menu-item-icon">
                  <CalendarDays size={16} />
                </span>
                <span className="fw-menu-item-label">Moments</span>
              </NavLink>
              <NavLink to="/shop" className="fw-menu-item" onClick={() => setMobileMenu(false)}>
                <span className="fw-menu-item-icon">
                  <ShoppingBag size={16} />
                </span>
                <span className="fw-menu-item-label">VieSHOP</span>
              </NavLink>
            </div>

            <div className="fw-menu-divider" />

            <div className="fw-menu-group">
              <span className="fw-menu-group-title">Hệ thống & Hỗ trợ</span>
              <NavLink to="/studio" className="fw-menu-item" onClick={() => setMobileMenu(false)}>
                <span className="fw-menu-item-icon">
                  <LayoutDashboard size={16} />
                </span>
                <span className="fw-menu-item-label">Studio người tổ chức</span>
              </NavLink>
              <button
                type="button"
                className="fw-menu-item fw-menu-btn"
                onClick={() => {
                  setGuide(true);
                  setMobileMenu(false);
                }}
              >
                <span className="fw-menu-item-icon">
                  <HelpCircle size={16} />
                </span>
                <span className="fw-menu-item-label">Trợ giúp</span>
              </button>
              <button
                type="button"
                className="fw-menu-item fw-menu-btn"
                onClick={() => {
                  setReview(true);
                  setMobileMenu(false);
                }}
              >
                <span className="fw-menu-item-icon">
                  <FlaskConical size={16} />
                </span>
                <span className="fw-menu-item-label">Kịch bản thử nghiệm</span>
              </button>
            </div>
          </nav>
        )}
      </header>
      <main id="main-content" className="fw-main">
        {storageNotice && <StatusNotice message={storageNotice} type="info" onDismiss={dismissNotice} />}
        {state.lastError && <StatusNotice message={state.lastError.message} type="error" onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })} />}
        <ErrorBoundary onResetDemoData={resetActiveTenant} onReset={resetActiveTenant}><Suspense fallback={<p className="vx-loading" role="status">Đang mở một góc của thế giới…</p>}><Outlet /></Suspense></ErrorBoundary>
      </main>
      <nav className="fw-mobile-bottom-nav" aria-label="Điều hướng di động">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          <Compass size={18} />
          <span>Quảng trường</span>
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => (isActive || pathname === '/artists' ? 'active' : '')}>
          <Music2 size={18} />
          <span>Explore</span>
        </NavLink>
        <NavLink to="/moments" className={({ isActive }) => (isActive ? 'active' : '')}>
          <CalendarDays size={18} />
          <span>Moments</span>
        </NavLink>
        <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : '')}>
          <ShoppingBag size={18} />
          <span>Shop</span>
        </NavLink>
        <NavLink to="/me" className={({ isActive }) => (isActive ? 'active' : '')}>
          <House size={18} />
          <span>Của tôi</span>
        </NavLink>
      </nav>
      <ResetDrawer isOpen={review} onClose={() => setReview(false)} allowTenantSwitch={false} />
      <WorldGuidePanel isOpen={guide} onClose={() => setGuide(false)} />
    </div>
  );
};
