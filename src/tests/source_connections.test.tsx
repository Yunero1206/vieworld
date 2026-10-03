import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { App } from '../App';
import { AppProvider, useApp } from '../context/AppContext';
import { createFreshFanState, createInitialState } from '../data/fixtures';
import type { AppAction } from '../domain/types';
import { appReducer } from '../domain/reducer';
import { _resetMemoryFallbackFlagForTesting, saveState } from '../services/storageAdapter';
import { freshGuestState } from '../world/account';
import { cartFingerprint } from '../world/commerce';
import { artistForWorld, sessionContextUrl } from '../world/worldContext';
import { worldActivities } from '../world/presenceDiscovery';
import { DEFAULT_PRIVACY, savePrivacySettings } from '../world/privacy';
import { ArtistWorldView } from '../views/ArtistWorldView';
import { FanWorldView } from '../views/FanWorldView';
import { InboxView } from '../views/InboxView';
import { ContextStage } from '../components/ContextStage';

beforeEach(()=>{localStorage.clear();_resetMemoryFallbackFlagForTesting();window.history.replaceState({},'', '/');});
afterEach(cleanup);

describe('Current app connections and account boundaries',()=>{
  it.each(['/cart','/checkout/private-checkout','/orders','/memberships','/account/settings','/inbox'])('protects personal routes from logged-out profiles: %s',async path=>{
    saveState(freshGuestState(createInitialState()));window.history.replaceState({},'',path);render(<App/>);
    expect(await screen.findByRole('heading',{name:'Một góc riêng, khi bạn sẵn sàng.'})).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
  });
  it.each(['/explore','/artist/artist-a','/artist/artist-a/hall','/artist/artist-a/archive','/shop','/me','/me?section=collection','/me?section=avatar','/memberships','/orders','/account/settings','/account/help'])('mounts the actual current route without a broken lazy import: %s',async path=>{
    saveState(createInitialState());window.history.replaceState({},'',path);const view=render(<App/>);
    await waitFor(()=>{expect(view.container.querySelector('.fw-main > p[role="status"]')).toBeNull();expect(view.container.querySelector('main')).not.toBeNull();});
    expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
    expect(screen.queryByText('Góc này chưa có trong VieWorld.')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation',{name:'Điều hướng di động'})).toBeInTheDocument();
  });
  it('sends the old Worlds directory link to discovery, not back to Home',async()=>{
    window.history.replaceState({},'', '/worlds');render(<App/>);
    await waitFor(()=>expect(window.location.pathname).toBe('/explore'));
  });
  it('resolves programme activities to the owning artist only',()=>{
    const state=createInitialState();
    for(const artist of Object.values(state.worlds).filter(w=>w.type==='artist')) for(const activity of worldActivities(state,artist.id)){
      expect(activity.to).toMatch(new RegExp(`^/artist/${artist.id}(?:[/?]|$)`));
      if(state.sessions[activity.id])expect(artistForWorld(state,state.sessions[activity.id].worldId)).toBe(artist.id);
    }
  });
  it.each(['cancelled','foreign-owner'] as const)('does not open an invalid session context: %s',kind=>{
    const state=createInitialState();const session=state.sessions['session-listen-01'];
    const artist=kind==='foreign-owner'?'artist-mira':'artist-a';
    if(kind==='cancelled')session.status='cancelled';
    else state.worlds[session.worldId].linkedWorldIds=['artist-a','artist-mira'];
    const view=render(<AppProvider initialState={state}><MemoryRouter initialEntries={[sessionContextUrl(artist,session.id)]}><Routes><Route path="/artist/:artistId" element={<ArtistWorldView/>}/></Routes></MemoryRouter></AppProvider>);
    expect(view.container.querySelector('.artist-context-stage')).toBeNull();
  });
  it('filters the legacy Inbox route by both tenant and current fan',()=>{
    const state=createInitialState();const template=Object.values(state.notifications)[0];
    state.notifications.otherFan={...template,id:'otherFan',fanId:'another-fan',title:'PRIVATE OTHER FAN'};
    state.notifications.otherTenant={...template,id:'otherTenant',tenantId:'mfan-demo',title:'PRIVATE OTHER TENANT'};
    render(<AppProvider initialState={state}><MemoryRouter><InboxView/></MemoryRouter></AppProvider>);
    expect(screen.queryByText('PRIVATE OTHER FAN')).toBeNull();expect(screen.queryByText('PRIVATE OTHER TENANT')).toBeNull();
  });
  it('does not mutate the previous fan cart or orders after sign-out',()=>{
    let state=createInitialState();state=appReducer(state,{type:'ADD_TO_CART',productId:'product-pin-01'});
    const guest=freshGuestState(state);
    const actions:AppAction[]=[{type:'ADD_TO_CART',productId:'product-pin-01'},{type:'SET_CART_QUANTITY',key:guest.cart![0].key,quantity:2},{type:'CHECKOUT_CART',requestId:'guest-checkout',fingerprint:cartFingerprint(guest)},{type:'CREATE_ORDER',productId:'product-pin-01',requestId:'guest-order'}];
    for(const action of actions){const result=appReducer(guest,action);expect(result.lastError?.code).toBe('DEMO_LOGIN_REQUIRED');expect(result.orders).toBe(guest.orders);expect(result.cart).toBe(guest.cart);}
  });
  it('does not save guest follows, favourites or event participation to the previous fan',()=>{
    const guest=freshGuestState(createInitialState());
    const actions:AppAction[]=[{type:'TOGGLE_FOLLOW',worldId:'artist-a'},{type:'TOGGLE_SAVED_PRODUCT',productId:'product-pin-01'},{type:'TOGGLE_RSVP',sessionId:'session-listen-01'},{type:'ENTER_LOBBY',sessionId:'session-listen-01'},{type:'JOIN_LIVE_SESSION',sessionId:'session-listen-01'},{type:'WATCH_REPLAY',sessionId:'session-listen-01'}];
    for(const action of actions){const result=appReducer(guest,action);expect(result.lastError?.code).toBe('DEMO_LOGIN_REQUIRED');expect(result.fanProfile).toBe(guest.fanProfile);expect(result.followedWorldIds).toBe(guest.followedWorldIds);expect(result.rsvpdSessionIds).toBe(guest.rsvpdSessionIds);expect(result.participations).toBe(guest.participations);}
    expect(appReducer(guest,{type:'VISIT_FAN_WORLD',worldId:'artist-a'})).toBe(guest);
    expect(appReducer(guest,{type:'REMEMBER_FAN_DESTINATION',to:'/shop'})).toBe(guest);
  });
  it('opens the existing sign-in flow for guest RSVP without showing the previous fan reminder',()=>{
    const guest=freshGuestState(createInitialState());
    const session={...guest.sessions['session-listen-01'],status:'scheduled' as const};
    guest.rsvpdSessionIds=[session.id];
    const onAuth=vi.fn();window.addEventListener('vieworld-open-auth',onAuth);
    try{
      render(<AppProvider initialState={guest}><MemoryRouter><ContextStage session={session} artistId="artist-a" artistName="Artist A" image="/images/artist-a-stage.jpg"/></MemoryRouter></AppProvider>);
      fireEvent.click(screen.getByRole('button',{name:'Nhắc mình (RSVP)'}));
      expect(onAuth).toHaveBeenCalledOnce();expect(screen.queryByText('Đã nhắc mình')).toBeNull();
    }finally{window.removeEventListener('vieworld-open-auth',onAuth);}
  });
  it('refreshes room privacy and local UI when the active account changes',()=>{
    const first=createInitialState();const second=appReducer(createFreshFanState(first.activeTenantId,'private-fan','Fan riêng'),{type:'DEMO_SIGN_IN',provider:'google',mode:'login'});
    savePrivacySettings({...DEFAULT_PRIVACY,guestbookEnabled:false},second.activeTenantId,second.fanProfile.id);
    function Switcher(){const {dispatch}=useApp();return <button onClick={()=>dispatch({type:'LOAD_SCENARIO',scenarioState:second})}>Switch fan</button>;}
    render(<AppProvider initialState={first}><MemoryRouter><Switcher/><FanWorldView/></MemoryRouter></AppProvider>);
    expect(screen.getByRole('button',{name:'Sổ lưu bút'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Switch fan'}));
    expect(screen.queryByRole('button',{name:'Sổ lưu bút'})).toBeNull();
  });
});
