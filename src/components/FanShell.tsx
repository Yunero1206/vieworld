import { ownedDigitalLook } from '../world/merchCatalog';
import { Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Compass, ShoppingBag, ShoppingCart, UserRound, Menu, X, Music2, HelpCircle, LayoutDashboard, FlaskConical, Shield, Ticket, Heart, ChevronRight, BellRing, Search } from 'lucide-react';
import { StatusNotice } from './StatusNotice';
import { ResetDrawer } from './ResetDrawer';
import { WorldGuidePanel } from './WorldGuidePanel';
import { ErrorBoundary } from './ErrorBoundary';
import { AvatarRenderer } from './AvatarRenderer';
import { useApp } from '../context/AppContext';
import { getTenantConfig } from '../domain/tenantConfig';
import { VieWorldLogo } from './VieWorldLogo';
import { NotificationBell } from './notifications/NotificationBell';
import { NotificationOverlay } from './notifications/NotificationOverlay';
import { NotificationPreferencesModal } from './notifications/NotificationPreferencesModal';
import { mapDomainToDisplay } from './notifications/notificationHelper';
import { DisplayNotification } from './notifications/notification.types';
import { ArtistNavAvatar, GlobalNavigation } from './GlobalNavigation';
import { artistIdFromPath, getCurrentArtistId, setCurrentArtistId } from '../world/currentArtist';

export const FanShell = () => {
  const { state, dispatch, storageNotice, dismissNotice, resetActiveTenant } = useApp();
  const tenantConfig = getTenantConfig(state.activeTenantId);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const [guide, setGuide] = useState(false);
  const [review, setReview] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPrefsOpen, setNotifPrefsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mobileMenuRef = useRef<HTMLElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLElement>(null);
  const accountBtnRef = useRef<HTMLButtonElement>(null);
  const bellBtnRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();
  const cartCount = (state.cart || []).reduce((sum, item) => sum + item.quantity, 0);

  const { pathname, search } = useLocation();
  const unread = Object.values(state.notifications || {}).filter(n => !n.isRead).length;

  const notificationsList: DisplayNotification[] = Object.values(state.notifications || {})
    .sort((a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime())
    .map(mapDomainToDisplay);

  const handleSelectNotification = (item: DisplayNotification) => {
    if (!item.read) {
      dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId: item.id });
    }
    setNotifOpen(false);
    if (item.targetRoute) {
      navigate(item.targetRoute);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };

  useEffect(() => {
    setMobileMenu(false);
    setAccountMenu(false);
    window.scrollTo?.(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (pathname === '/explore' || pathname === '/artists') setSearchQuery(new URLSearchParams(search).get('q') || '');
  }, [pathname, search]);

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

  const routeArtistId = artistIdFromPath(pathname);
  const currentArtistId = routeArtistId && state.worlds[routeArtistId]?.type === 'artist' ? routeArtistId : getCurrentArtistId(state);
  const artistContext = currentArtistId ? state.worlds[currentArtistId] : undefined;
  const inArtistWorld = Boolean(routeArtistId && state.worlds[routeArtistId]?.type === 'artist');
  useEffect(() => {
    if (inArtistWorld && currentArtistId) setCurrentArtistId(state, currentArtistId);
  }, [inArtistWorld, currentArtistId, state.activeTenantId]);
  const navArtist = artistContext?.type === 'artist' ? { id: artistContext.id, name: artistContext.name } : undefined;

  return (
    <div className="fan-shell" data-testid="app-container" data-tenant={state.activeTenantId} data-artist-world={inArtistWorld ? 'true' : undefined}>
      <a href="#main-content" className="skip-link" data-testid="skip-to-content-link">Chuyển đến nội dung chính</a>
      <header className={`fw-header ${pathname === '/' ? 'fw-header-plaza' : ''}`}>
        <NavLink to="/" className="fw-brand" aria-label={`${tenantConfig.labels.brandName} — về thế giới`}>
          <VieWorldLogo size={32} className="fw-brand-logo" />
          <div className="fw-brand-info">
            <span className="fw-brand-title">{tenantConfig.labels.brandName}</span>
            <small>{state.activeTenantId === 'vieworld-demo' ? 'một thế giới, cùng nhau' : tenantConfig.tagline}</small>
          </div>
        </NavLink>

        <form className="fw-global-search" role="search" onSubmit={event => {
          event.preventDefault();
          const query = searchQuery.trim();
          navigate(query ? `/explore?q=${encodeURIComponent(query)}` : '/explore');
        }}>
          <Search size={19} aria-hidden="true" />
          <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} aria-label="Tìm nghệ sĩ, world, sự kiện, capsule" placeholder="Tìm nghệ sĩ, world, sự kiện, capsule…" />
          <button type="submit" aria-label="Tìm kiếm"><Search size={18} aria-hidden="true" /></button>
        </form>
        <span className="fw-header-phrase" aria-hidden="true">For the moments that stay</span>

        <div className="fw-header-tools">
          {/* Permanent Cart Access */}
          <NavLink
            to="/cart"
            className="fw-icon fw-cart-btn"
            aria-label={`Giỏ hàng${cartCount > 0 ? `, ${cartCount} món` : ''}`}
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && <i>{cartCount}</i>}
          </NavLink>

          <NotificationBell
            ref={bellBtnRef}
            unreadCount={unread}
            isOpen={notifOpen}
            onClick={() => setNotifOpen(!notifOpen)}
          />

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
              <NavLink to="/explore?scope=following" className="fw-menu-item" onClick={() => setAccountMenu(false)}>
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
              <button
                type="button"
                className="fw-menu-item fw-menu-btn"
                onClick={() => {
                  setNotifPrefsOpen(true);
                  setAccountMenu(false);
                }}
              >
                <span className="fw-menu-item-icon">
                  <BellRing size={16} />
                </span>
                <span className="fw-menu-item-label">Cài đặt thông báo</span>
              </button>
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
                <span className="fw-menu-item-label">Home</span>
              </NavLink>
              <NavLink to="/explore" className="fw-menu-item" onClick={() => setMobileMenu(false)}>
                <span className="fw-menu-item-icon">
                  <Music2 size={16} />
                </span>
                <span className="fw-menu-item-label">Explore</span>
              </NavLink>
              {artistContext && <NavLink to={`/artist/${artistContext.id}`} className="fw-menu-item" onClick={() => setMobileMenu(false)}>
                <span className="fw-menu-item-icon"><ArtistNavAvatar artist={{ id: artistContext.id, name: artistContext.name }} /></span>
                <span className="fw-menu-item-label">{artistContext.name}</span>
              </NavLink>}
              <NavLink to="/me" className="fw-menu-item" onClick={() => setMobileMenu(false)}>
                <span className="fw-menu-item-icon"><UserRound size={16} /></span>
                <span className="fw-menu-item-label">My Space</span>
              </NavLink>
              <NavLink to="/shop" className="fw-menu-item" onClick={() => setMobileMenu(false)}>
                <span className="fw-menu-item-icon">
                  <ShoppingBag size={16} />
                </span>
                <span className="fw-menu-item-label">VieSHOP</span>
              </NavLink>
              <NavLink to="/cart" className="fw-menu-item" onClick={() => setMobileMenu(false)}>
                <span className="fw-menu-item-icon">
                  <ShoppingCart size={16} />
                </span>
                <span className="fw-menu-item-label">Giỏ hàng ({cartCount})</span>
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
      <div className="fw-site-frame">
        <GlobalNavigation pathname={pathname} artist={navArtist} shopLabel={tenantConfig.labels.shopTitle || 'VieSHOP'} />
        <main id="main-content" className="fw-main">
          {storageNotice && <StatusNotice message={storageNotice} type="info" onDismiss={dismissNotice} />}
          {state.lastError && <StatusNotice message={state.lastError.message} type="error" onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })} />}
          <ErrorBoundary onResetDemoData={resetActiveTenant} onReset={resetActiveTenant}><Suspense fallback={<p className="vx-loading" role="status">Đang mở một góc của thế giới…</p>}><Outlet /></Suspense></ErrorBoundary>
        </main>
      </div>
      <ResetDrawer isOpen={review} onClose={() => setReview(false)} allowTenantSwitch={false} />
      <WorldGuidePanel isOpen={guide} onClose={() => setGuide(false)} />
      <NotificationOverlay
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notificationsList}
        onSelectNotification={handleSelectNotification}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        returnFocusRef={bellBtnRef}
      />
      <NotificationPreferencesModal
        isOpen={notifPrefsOpen}
        onClose={() => setNotifPrefsOpen(false)}
      />
    </div>
  );
};
