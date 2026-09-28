import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider, useApp } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import type { AppAction } from '../domain/types';
import { freshGuestState, isDemoSignedIn } from '../world/account';
import { PersonalSpaceGate } from '../components/account/PersonalSpaceGate';
import { FanWorldView } from '../views/FanWorldView';
import { WorldPlazaView } from '../views/WorldPlazaView';
import { RoomPropVisual } from '../components/RoomPropVisual';
import { FanShopView } from '../views/FanShopView';
import { loadState, saveState } from '../services/storageAdapter';

beforeEach(()=>{cleanup();localStorage.clear();});
function PrivateTestContent() {
  const {dispatch}=useApp();
  return <><h2>PRIVATE ROOM</h2><button onClick={()=>dispatch({type:'DEMO_SIGN_OUT'})}>Leave demo</button></>;
}
describe('Guest identity and display regression',()=>{
  it.each(['/me','/me?section=avatar','/me?section=collection','/me?panel=capsules','/archive'])('does not mount personal content at %s while signed out',path=>{
    render(<AppProvider initialState={freshGuestState(createInitialState())}><MemoryRouter initialEntries={[path]}><FanWorldView/></MemoryRouter></AppProvider>);
    expect(screen.getByRole('heading',{name:'Một góc riêng, khi bạn sẵn sàng.'})).toBeVisible();
    expect(document.querySelector('.v6-room-art')).toBeNull();
    expect(screen.queryByRole('combobox',{name:'Tìm trong bộ sưu tập'})).toBeNull();
    expect(document.body.textContent).not.toContain('Linh');
  });
  it('only mounts private content after an explicit demo provider choice, then removes it on sign-out',()=>{
    const guest=freshGuestState(createInitialState());
    render(<AppProvider initialState={guest}><MemoryRouter><PersonalSpaceGate><PrivateTestContent/></PersonalSpaceGate></MemoryRouter></AppProvider>);
    expect(screen.queryByText('PRIVATE ROOM')).toBeNull();
    fireEvent.click(screen.getByRole('button',{name:'Đăng nhập / Đăng ký'}));
    fireEvent.click(screen.getByRole('button',{name:/Tiếp tục với Google/}));
    expect(screen.getByText('PRIVATE ROOM')).toBeVisible();
    const next=loadState().state;
    expect(next.orders).toEqual(guest.orders); expect(next.fanProfile).toEqual(guest.fanProfile);
    expect(isDemoSignedIn(appReducer(next,{type:'DEMO_SIGN_OUT'}))).toBe(false);
    fireEvent.click(screen.getByRole('button',{name:'Leave demo'}));
    expect(screen.queryByText('PRIVATE ROOM')).toBeNull();
    expect(screen.getByRole('button',{name:'Đăng nhập / Đăng ký'})).toBeVisible();
    expect(screen.queryByTestId('demo-auth-overlay')).toBeNull();
  });
  it('greets an anonymous visitor without showing an old fan name or capsule history',()=>{
    const guest=freshGuestState(createInitialState());
    guest.fanProfile.displayName='PRIVATE NAME';
    render(<AppProvider initialState={guest}><MemoryRouter><WorldPlazaView/></MemoryRouter></AppProvider>);
    expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Chào bạn');
    expect(document.body.textContent).not.toContain('PRIVATE NAME');
  });
  it('preserves legacy ownership but never interprets a profile alone as login',()=>{
    const old=createInitialState(); delete old.demoAccount; saveState(old);
    expect(isDemoSignedIn(loadState().state)).toBe(false);
    expect(loadState().state.fanProfile).toEqual(old.fanProfile);
  });
  it('refuses guest equipment and room writes without deleting existing inventory',()=>{
    const guest=freshGuestState(createInitialState());
    const actions: AppAction[] = [{type:'SET_AVATAR_PRESET',preset:'bob'},{type:'REMOVE_DIGITAL_SLOT',slot:'shirt'},{type:'SET_DISPLAY_SURFACE',surfaceId:'shirt',selection:{itemIds:[]}}];
    for (const action of actions) {
      const next=appReducer(guest,action);
      expect(next.lastError?.code).toBe('DEMO_LOGIN_REQUIRED');
      expect(next.fanProfile).toBe(guest.fanProfile); expect(next.orders).toBe(guest.orders);
    }
  });
  it('uses a cropped jacket face and physical support instead of a floating product tile for albums',()=>{
    const view=render(<RoomPropVisual item={{id:'album',title:'Album',detail:'',slot:'disc',image:'mira-vinyl-physical'}}/>);
    expect(screen.getByTestId('album-display-stand').querySelector('.vw-album-support')).not.toBeNull();
    expect(view.container.querySelector('svg')).toHaveAttribute('viewBox','100 213 545 586');
  });
  it('offers neutral product-specific Shop previews, not the signed-out fan identity',()=>{
    const guest=freshGuestState(createInitialState());
    guest.fanProfile.displayName='PRIVATE NAME';
    render(<AppProvider initialState={guest}><MemoryRouter initialEntries={['/shop']}><FanShopView/></MemoryRouter></AppProvider>);
    const card=screen.getByRole('heading',{name:'Áo Star Club'}).closest('article')!;
    fireEvent.click(within(card).getByRole('button',{name:'Thử trong My Space'}));
    expect(screen.getByRole('img',{name:'Avatar 2D của Khách'})).toBeVisible();
    expect(document.querySelector('[data-visual-id="star-shirt"]')).not.toBeNull();
    expect(screen.queryByRole('button',{name:'Mặc và lưu'})).toBeNull();
    expect(document.body.textContent).not.toContain('PRIVATE NAME');
  });
});
