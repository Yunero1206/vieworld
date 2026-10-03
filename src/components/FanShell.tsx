import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, HelpCircle, LogOut, Settings, ShoppingBag, Ticket } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isDemoSignedIn } from '../world/account';
import { ownedDigitalLook } from '../world/merchCatalog';
import { membershipWorldsForFan, purchaseGroupsForFan } from '../world/personalSelectors';
import { artistIdFromPath, setCurrentArtistId } from '../world/currentArtist';
import { preferredPlazaArtist } from '../world/plazaState';
import { validHomeDestination } from '../world/homeDestination';
import { useAppearance } from '../hooks/useAppearance';
import { AvatarRenderer } from './AvatarRenderer';
import { GlobalNavigation } from './GlobalNavigation';
import { VieWorldIcon } from './VieWorldIcon';
import { StatusNotice } from './StatusNotice';
import { ApplicationHealth } from './ApplicationHealth';
import { ErrorBoundary } from './ErrorBoundary';
import { AuthOverlay } from './account/AuthOverlay';
import { NotificationOverlay } from './notifications/NotificationOverlay';
import { mapDomainToDisplay } from './notifications/notificationHelper';

export function FanShell() {
  const {state,dispatch,storageNotice,dismissNotice,resetActiveTenant}=useApp();
  const signedIn=isDemoSignedIn(state);
  const {appearance,toggleAppearance}=useAppearance();
  const {pathname,search}=useLocation();
  const navigate=useNavigate();
  const [accountOpen,setAccountOpen]=useState(false);
  const [authOpen,setAuthOpen]=useState(false);
  const [inboxOpen,setInboxOpen]=useState(false);
  const accountRef=useRef<HTMLElement>(null);
  const triggerRef=useRef<HTMLButtonElement|null>(null);
  const bellRef=useRef<HTMLButtonElement>(null);
  const inboxReturnRef=useRef<HTMLElement|null>(null);
  const notifications=signedIn?Object.values(state.notifications).filter(n=>n.tenantId===state.activeTenantId&&n.fanId===state.fanProfile.id):[];
  const unread=notifications.filter(n=>!n.isRead).length;
  const routeArtist=artistIdFromPath(pathname);
  const artist=routeArtist&&state.worlds[routeArtist]?.type==='artist'?state.worlds[routeArtist]:preferredPlazaArtist(state);
  const memberships=membershipWorldsForFan(state).filter(m=>m.active).length;
  const orders=purchaseGroupsForFan(state).filter(g=>g.open).length;
  const followCount=state.followedWorldIds.filter(id=>state.worlds[id]?.tenantId===state.activeTenantId).length;
  const avatar=<AvatarRenderer role="fan" size="sm" appearance={state.fanProfile.avatarPreset} digitalLook={ownedDigitalLook(state)} displayName={state.fanProfile.displayName}/>;
  function accountClick(button:HTMLButtonElement){triggerRef.current=button;if(signedIn)setAccountOpen(v=>!v);else setAuthOpen(true);}
  function inbox(){inboxReturnRef.current=accountOpen?triggerRef.current:bellRef.current;setAccountOpen(false);if(signedIn)setInboxOpen(true);else setAuthOpen(true);}
  useEffect(()=>{
    const open=()=>{setAccountOpen(false);setAuthOpen(true);};
    window.addEventListener('vieworld-open-auth',open);
    return()=>window.removeEventListener('vieworld-open-auth',open);
  },[]);
  useEffect(()=>{setAccountOpen(false);window.scrollTo?.(0,0);},[pathname]);
  useEffect(()=>{
    const pageTitles:Record<string,string>={'/':'Home','/explore':'Explore','/shop':'VieCollect','/me':'My Space','/memberships':'Hội viên & quyền lợi','/orders':'Đơn hàng','/account/settings':'Cài đặt & riêng tư','/account/help':'Trợ giúp'};
    const title=artist&&routeArtist?artist.name:pageTitles[pathname];
    document.title=title?`${title} · VieWorld`:'VieWorld';
    if(routeArtist&&artist)setCurrentArtistId(state,artist.id);
    if(signedIn&&validHomeDestination(state,pathname+search))dispatch({type:'REMEMBER_FAN_DESTINATION',to:pathname+search});
  },[pathname,search,signedIn,state.activeTenantId]);
  useEffect(()=>{
    if(!accountOpen)return;
    const timer=window.setTimeout(()=>accountRef.current?.querySelector<HTMLElement>('a,button')?.focus(),0);
    const outside=(e:PointerEvent)=>{if(!accountRef.current?.contains(e.target as Node)&&!triggerRef.current?.contains(e.target as Node))setAccountOpen(false);};
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setAccountOpen(false);triggerRef.current?.focus();}};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);
    return()=>{clearTimeout(timer);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);};
  },[accountOpen]);
  const utilities=<div className="fw-header-tools">
    <button ref={bellRef} className="fw-icon" onClick={inbox} aria-label={`Thông báo, ${unread} chưa đọc`}><VieWorldIcon name="bell"/><span className="fw-nav-label">Thông báo</span>{unread>0&&<i>{unread>99?'99+':unread}</i>}</button>
    <button className="fw-profile-btn" onClick={e=>accountClick(e.currentTarget)} aria-expanded={accountOpen} aria-controls="fan-account-menu" aria-label={signedIn?'Tài khoản':'Đăng nhập'}>{signedIn?avatar:<VieWorldIcon name="account"/>}<span className="fw-nav-label">{signedIn?'Tài khoản':'Đăng nhập'}</span></button>
  </div>;
  return <div className="fan-shell presence-shell" data-testid="app-container" data-theme={appearance} data-tenant={state.activeTenantId}>
    <a href="#main-content" className="skip-link">Chuyển đến nội dung chính</a>
    <GlobalNavigation pathname={pathname} artist={artist?{id:artist.id,name:artist.name}:undefined} utilities={utilities}
      accountControl={<button className={accountOpen?'active':''} onClick={e=>accountClick(e.currentTarget)} aria-expanded={accountOpen} aria-controls="fan-account-menu" aria-label={`Tài khoản${unread?', '+unread+' thông báo chưa đọc':''}`}>{signedIn?avatar:<VieWorldIcon name="account" size={24}/>} {unread>0&&<i aria-hidden="true">{unread>99?'99+':unread}</i>}</button>}/>
    {accountOpen&&<nav id="fan-account-menu" ref={accountRef} className="presence-account" aria-label="Tài khoản">
      <Link to="/me" className="presence-account-profile" onClick={()=>setAccountOpen(false)}>{avatar}<span><strong>{state.fanProfile.displayName}</strong><small>Vào My Space</small></span><ChevronRight size={18}/></Link>
      <button className="presence-mobile-only" onClick={inbox}><VieWorldIcon name="bell" size={20}/>Thông báo<span className="presence-count">{unread||''}</span></button>
      <Link to="/explore?scope=following" onClick={()=>setAccountOpen(false)}><Heart size={19}/>Đang theo dõi<span className="presence-count">{followCount||''}</span></Link>
      <Link to="/memberships"><Ticket size={19}/>Hội viên & quyền lợi<span className="presence-count">{memberships||''}</span></Link>
      <Link to="/orders"><ShoppingBag size={19}/>Đơn hàng<span className="presence-count">{orders||''}</span></Link>
      <hr/><Link to="/account/settings"><Settings size={19}/>Cài đặt & riêng tư</Link><Link to="/account/help"><HelpCircle size={19}/>Trợ giúp</Link><hr/>
      <button onClick={()=>{dispatch({type:'DEMO_SIGN_OUT'});setAccountOpen(false);triggerRef.current?.focus();}}><LogOut size={19}/>Đăng xuất</button>
      {import.meta.env.DEV&&<details><summary>Công cụ demo</summary><Link to="/studio">Studio</Link></details>}
    </nav>}
    <main id="main-content" className="fw-main">
      {storageNotice&&<StatusNotice message={storageNotice} type="info" onDismiss={dismissNotice}/>}<ApplicationHealth/>
      {state.lastError&&<StatusNotice message={state.lastError.message} type="error" onDismiss={()=>dispatch({type:'CLEAR_ERROR'})}/>}
      <ErrorBoundary resetKey={pathname+search} onReset={resetActiveTenant} onResetDemoData={resetActiveTenant}><Suspense fallback={<p role="status">Đang mở…</p>}><Outlet/></Suspense></ErrorBoundary>
    </main>
    {authOpen&&<AuthOverlay onClose={()=>setAuthOpen(false)} appearance={appearance} onToggleAppearance={toggleAppearance}/>}
    <NotificationOverlay isOpen={inboxOpen} onClose={()=>setInboxOpen(false)} notifications={notifications.sort((a,b)=>(b.createdAt||b.updatedAt).localeCompare(a.createdAt||a.updatedAt)).map(mapDomainToDisplay)}
      onSelectNotification={item=>{dispatch({type:'MARK_NOTIFICATION_READ',notificationId:item.id});setInboxOpen(false);if(item.targetRoute)navigate(item.targetRoute);}}
      onMarkAllAsRead={()=>dispatch({type:'MARK_ALL_NOTIFICATIONS_READ'})} returnFocusRef={inboxReturnRef}/>
  </div>;
}
