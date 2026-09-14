import { ownedDigitalLook } from '../world/merchCatalog';
import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Compass, ShoppingBag, House, Mail, Menu, X, Music2, CalendarDays } from 'lucide-react';
import { StatusNotice } from './StatusNotice';
import { ResetDrawer } from './ResetDrawer';
import { WorldGuidePanel } from './WorldGuidePanel';
import { ErrorBoundary } from './ErrorBoundary';
import { AvatarRenderer } from './AvatarRenderer';
import { useApp } from '../context/AppContext';
import { getTenantConfig } from '../domain/tenantConfig';

export const FanShell = () => {
  const { state, dispatch, storageNotice, dismissNotice, resetActiveTenant } = useApp();
  const tenantConfig = getTenantConfig(state.activeTenantId);
  const [menu, setMenu] = useState(false);
  const [guide, setGuide] = useState(false);
  const [review, setReview] = useState(false);
  const { pathname } = useLocation();
  const unread = Object.values(state.notifications || {}).filter(n => !n.isRead).length;
  useEffect(() => { setMenu(false); window.scrollTo?.(0,0); }, [pathname]);
  useEffect(()=>{if(!menu)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false);};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[menu]);
  const inShop = pathname === '/shop' || pathname.endsWith('/shop') || pathname==='/cart' || pathname.startsWith('/checkout/') || pathname.startsWith('/orders/');
  const inMoments=(pathname.startsWith('/worlds/')&&!inShop&&!pathname.endsWith('/archive'))||pathname.endsWith('/moments')||pathname.startsWith('/sessions/')||pathname.startsWith('/benefits/');
  
  const inHome=pathname==='/me'||pathname.startsWith('/members/')||pathname.endsWith('/archive');
  const inArtist=pathname==='/artists';
  return (
    <div className="fan-shell" data-testid="app-container" data-tenant={state.activeTenantId}>
      <a href="#main-content" className="skip-link" data-testid="skip-to-content-link">Chuyển đến nội dung chính</a>
      <header className="fw-header">
        <NavLink to="/" className="fw-brand" aria-label={`${tenantConfig.labels.brandName} — về thế giới`}><span aria-hidden="true">✳</span> {tenantConfig.labels.brandName}<small>{state.activeTenantId === 'vieworld-demo' ? 'một thế giới, cùng nhau' : tenantConfig.tagline}</small></NavLink>
        <nav className="fw-main-nav" aria-label="Điều hướng chính">
          {[[Music2,'/artists','Artist Home',inArtist],[CalendarDays,'/moments','Moments',inMoments],[House,'/me','My Space',inHome],[ShoppingBag,'/shop',tenantConfig.labels.shopTitle || 'VieSHOP',inShop]].map(([Icon,to,label,active])=>{const NavIcon=Icon as typeof Compass;return <Link key={String(to)} to={String(to)} aria-current={active?'page':undefined} className={active?'selected':''}><NavIcon size={19}/><span>{String(label)}</span></Link>;})}
        </nav>
        <div className="fw-header-tools">
          <NavLink to="/inbox" className="fw-icon" aria-label={`Hộp thư${unread ? `, ${unread} chưa đọc` : ''}`}><Mail size={19} />{unread > 0 && <i>{unread}</i>}</NavLink>
          <NavLink to="/me?panel=bag" className="fw-profile" aria-label={`Túi đồ của ${state.fanProfile.displayName}`}><AvatarRenderer role="fan" digitalLook={ownedDigitalLook(state)} size="sm" accessoryId={state.fanProfile.wardrobeChoice?.accessoryId} appearance={state.fanProfile.avatarPreset} displayName={state.fanProfile.displayName} /></NavLink>
          <button className="fw-icon" aria-label={menu ? 'Đóng menu' : 'Mở menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
        {menu && <nav className="fw-menu" aria-label="Tiện ích" onClick={()=>setMenu(false)} onKeyDown={e => { if (e.key === 'Escape') setMenu(false); }}>
          <NavLink to="/">Quảng trường · Thế giới</NavLink><NavLink to="/cart">Giỏ đồ</NavLink><NavLink to="/me?panel=bag">Đơn hàng & đồ đã nhận</NavLink>
          <NavLink to="/moments?panel=calendar">Lịch của tôi</NavLink>
          <NavLink to="/me?section=collection">Bộ sưu tập của tôi</NavLink>
          <button onClick={() => { setGuide(true); setMenu(false); }}>Trợ giúp</button>
          <NavLink to="/studio">Studio của người tổ chức</NavLink>
          <button onClick={() => { setReview(true); setMenu(false); }}>Kịch bản thử nghiệm</button>
        </nav>}
      </header>
      <main id="main-content" className="fw-main">
        {storageNotice && <StatusNotice message={storageNotice} type="info" onDismiss={dismissNotice} />}
        {state.lastError && <StatusNotice message={state.lastError.message} type="error" onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })} />}
        <ErrorBoundary onResetDemoData={resetActiveTenant} onReset={resetActiveTenant}><Suspense fallback={<p className="vx-loading" role="status">Đang mở một góc của thế giới…</p>}><Outlet /></Suspense></ErrorBoundary>
      </main>
      <ResetDrawer isOpen={review} onClose={() => setReview(false)} allowTenantSwitch={false} />
      <WorldGuidePanel isOpen={guide} onClose={() => setGuide(false)} />
    </div>
  );
};
