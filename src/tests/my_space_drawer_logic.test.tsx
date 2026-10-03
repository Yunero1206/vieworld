import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider, useApp } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import type { AppState, Product } from '../domain/types';
import { PersonalDisplayRoom } from '../components/DisplayRoom';
import { displayOptions, productRoomPreviewItem, type DisplayItem } from '../world/display';
import { DISPLAY_SURFACES, planRoomPlacement, readDisplaySurfaces, roomCandidates, surfaceSupportsItem, validateDisplaySurfaces } from '../world/displaySurfaces';
import { NEW_MERCH, withMerchCatalog } from '../world/merchCatalog';
import { EXPANDED_PRODUCTS } from '../data/expandedUniverse';
import { freshGuestState } from '../world/account';

afterEach(()=>{cleanup();localStorage.clear();});
const stateWithItems=(ids:string[])=>{
  const state=withMerchCatalog(createInitialState('vieworld-demo'));
  state.orders=Object.fromEntries(ids.map((id,i)=>[String(i),{id:String(i),tenantId:state.activeTenantId,fanId:state.fanProfile.id,worldId:state.products[id].worldId,version:1,updatedAt:state.demoTime,productId:id,status:'fulfilled' as const,sourceRef:'test',requestId:String(i),fulfilledAt:state.demoTime}]));
  return state;
};
function RoomProbe(){const {state}=useApp();return <><PersonalDisplayRoom onOpen={()=>{}}/><output data-testid="saved-room">{JSON.stringify(state.fanProfile.displaySurfaces||{})}</output></>;}
function renderRoom(state:AppState){return render(<AppProvider initialState={state}><MemoryRouter><RoomProbe/></MemoryRouter></AppProvider>);}
const fixture=(label:string)=>screen.getByRole('button',{name:new RegExp(`^${label}:`)});

describe('canonical My Space taxonomy and drawer',()=>{
  it('uses object semantics, not shipping or legacy achievement category',()=>{
    const products={...NEW_MERCH,...EXPANDED_PRODUCTS};
    const expectations:Record<string,string[]>={
      'product-mira-tea-cup-real':['achievement'], 'product-b-pin-real':['achievement'],
      'product-cap-real':['achievement'], 'product-c-photocard-real':['ticket'],
      'product-c-lightstick-real':['lightstick'], 'product-d-pick-real':['disc'],
      'product-d-songbook-real':['disc'], 'product-a-hanoi-towel':['shirt'],
    };
    for(const [id,expected] of Object.entries(expectations)){
      const item=productRoomPreviewItem(products[id]);
      expect(DISPLAY_SURFACES.filter(surface=>surfaceSupportsItem(surface,item)).map(surface=>surface.id),id).toEqual(expected);
    }
    const unknown={...products['product-c-photocard-real'],id:'unknown',roomSurface:undefined,familyId:undefined,category:'album',image:'lightstick-digital'} as Product;
    expect(productRoomPreviewItem(unknown).isDisplayCompatible).toBe(false);
  });
  it('lets explicit authored metadata win over legacy slot and image',()=>{
    const item:DisplayItem={id:'authored',slot:'lightstick',title:'',detail:'',isDisplayCompatible:true,itemKind:'music-media',supportedSurfaces:['disc','achievement']};
    expect(DISPLAY_SURFACES.filter(surface=>surfaceSupportsItem(surface,item)).map(surface=>surface.id)).toEqual(['achievement','disc']);
  });
  it('does not revive an incompatible legacy placement or change ownership',()=>{
    const state=stateWithItems(['product-mira-tea-cup-real']);
    state.fanProfile.displaySurfaces={ticket:{itemIds:['product-mira-tea-cup-real']}};
    const owned=displayOptions(state);
    const room=readDisplaySurfaces(state.fanProfile,owned);
    expect(room.ticket.itemIds).toEqual([]);
    expect(roomCandidates('achievement',room,owned).map(item=>item.id)).toContain('product-mira-tea-cup-real');
    expect(state.fanProfile.displaySurfaces.ticket?.itemIds).toEqual(['product-mira-tea-cup-real']);
    const invalid={...room,ticket:{itemIds:['product-mira-tea-cup-real']}};
    expect(validateDisplaySurfaces(state.fanProfile,invalid,owned)).toMatch(/không phù hợp/);
  });
  it('never silently replaces a full surface',()=>{
    const state=stateWithItems(['product-star-shirt-real','product-mira-hoodie-real','product-kai-bomber-real']);
    const owned=displayOptions(state);
    const surfaces=readDisplaySurfaces({...state.fanProfile,displaySurfaces:{shirt:{itemIds:owned.slice(0,2).map(item=>item.id)}}},owned);
    const before=JSON.stringify(surfaces);
    expect(planRoomPlacement(state.fanProfile,surfaces,'shirt',owned[2].id,owned).problem).toMatch(/đầy/);
    expect(JSON.stringify(surfaces)).toBe(before);
    const plan=planRoomPlacement(state.fanProfile,surfaces,'shirt',owned[2].id,owned,owned[1].id);
    expect(plan.surfaces?.shirt.itemIds).toEqual([owned[0].id,owned[2].id]);
    expect(roomCandidates('shirt',surfaces,owned).map(item=>item.id)).toEqual([owned[2].id]);
  });
  it('moves atomically, normalizes source focus, keeps ownership, and rejects duplicate or guest writes',()=>{
    let state=stateWithItems(['product-cd-real']);
    // Deliberately authored secondary shelf capability; no generic type grants it.
    state.products['product-cd-real']={...state.products['product-cd-real'],supportedSurfaces:['disc','achievement']};
    state.fanProfile.displaySurfaces={achievement:{itemIds:['product-cd-real'],focalItemId:'product-cd-real'}};
    const surfaces=readDisplaySurfaces(state.fanProfile,displayOptions(state));
    const plan=planRoomPlacement(state.fanProfile,surfaces,'disc','product-cd-real',displayOptions(state));
    expect(plan.surfaces?.achievement.itemIds).toEqual([]);
    expect(plan.surfaces?.achievement.focalItemId).toBeUndefined();
    const saved=appReducer(state,{type:'SET_DISPLAY_SURFACES',surfaces:plan.surfaces!});
    expect(saved.lastError).toBeUndefined();
    expect(saved.orders).toBe(state.orders);
    expect(saved.fanProfile.displaySlots?.achievement).toBe('');
    expect(saved.fanProfile.displaySlots?.disc).toBe('product-cd-real');
    const duplicate={...plan.surfaces!,achievement:{itemIds:['product-cd-real']}};
    expect(validateDisplaySurfaces(state.fanProfile,duplicate,displayOptions(state))).toMatch(/một khu vực/);
    expect(appReducer(state,{type:'SET_DISPLAY_SURFACES',surfaces:duplicate}).fanProfile).toBe(state.fanProfile);
    expect(appReducer(freshGuestState(state),{type:'SET_DISPLAY_SURFACES',surfaces:plan.surfaces!}).lastError?.code).toBe('DEMO_LOGIN_REQUIRED');
  });
  it('opens the rack display inspector, previews without saving, and cancels or saves explicitly',()=>{
    const state=stateWithItems(['product-star-shirt-real']);renderRoom(state);
    fireEvent.click(fixture('Giá trang phục'));
    const drawer=screen.getByRole('dialog',{name:'Trưng bày Giá trang phục'});
    expect(within(drawer).queryByRole('textbox')).toBeNull();
    expect(drawer.textContent).not.toMatch(/sức chứa|Điểm nhấn|VieSHOP|Chọn chỗ khác/);
    const saved=screen.getByTestId('saved-room').textContent;
    fireEvent.click(within(drawer).getByRole('button',{name:'Đặt vào đây'}));
    expect(screen.getByTestId('saved-room').textContent).toBe(saved);
    expect(within(drawer).queryByRole('button',{name:'Đặt vào đây'})).toBeNull();
    expect(within(drawer).getByRole('button',{name:'Lưu thay đổi'})).toBeVisible();
    fireEvent.click(within(drawer).getByRole('button',{name:'Hủy'}));
    expect(screen.getByTestId('saved-room').textContent).toBe(saved);
    fireEvent.click(within(drawer).getByRole('button',{name:'Đặt vào đây'}));
    fireEvent.click(within(drawer).getByRole('button',{name:'Lưu thay đổi'}));
    expect(screen.getByTestId('saved-room').textContent).toContain('product-star-shirt-real');
    fireEvent.click(within(drawer).getByRole('button',{name:/^Gỡ /}));
    expect(screen.getByTestId('saved-room').textContent).toContain('product-star-shirt-real');
    fireEvent.click(within(drawer).getByRole('button',{name:'Lưu thay đổi'}));
    expect(screen.getByTestId('saved-room').textContent).not.toContain('product-star-shirt-real');
  });
  it('offers explicit replacement and preserves the draft when switching room fixtures',()=>{
    const state=stateWithItems(['product-star-shirt-real','product-mira-hoodie-real','product-kai-bomber-real']);
    state.fanProfile.displaySurfaces={shirt:{itemIds:['product-star-shirt-real','product-mira-hoodie-real']}};
    renderRoom(state);fireEvent.click(fixture('Giá trang phục'));
    fireEvent.click(screen.getByRole('button',{name:'Đặt vào đây'}));
    expect(screen.queryByRole('button',{name:'Lưu thay đổi'})).toBeNull();
    fireEvent.click(screen.getAllByRole('button',{name:'Thay bằng món đã chọn'})[1]);
    expect(fixture('Giá trang phục').getAttribute('aria-label')).toContain('Bomber');
    expect(screen.getByTestId('saved-room').textContent).toContain('product-mira-hoodie-real');
    fireEvent.click(fixture('Góc âm nhạc'));
    expect(screen.getByRole('dialog',{name:'Trưng bày Góc âm nhạc'})).toBeVisible();
    fireEvent.click(screen.getByRole('button',{name:'Hủy'}));
    expect(fixture('Giá trang phục').getAttribute('aria-label')).toContain('Hoodie');
  });
  it('only adds search at six candidates; filtering never hides current rows',()=>{
    const state=withMerchCatalog(createInitialState('vieworld-demo'));
    state.ticketArchive=Array.from({length:7},(_,i)=>({id:`memory-${i}`,fanId:state.fanProfile.id,tenantId:state.activeTenantId,eventTitle:`Memory ${i}`,worldId:'artist-a',collectedAt:state.demoTime,physicalStatus:'owned',source:'demo-serialized-card'}));
    state.fanProfile.displaySurfaces={ticket:{itemIds:['memory-0']}};
    renderRoom(state);fireEvent.click(fixture('Bảng kỷ niệm'));
    fireEvent.change(screen.getByRole('textbox',{name:'Tìm trong Bộ sưu tập'}),{target:{value:'not-found'}});
    expect(within(screen.getByRole('dialog')).getByText('Memory 0')).toBeVisible();
    expect(screen.getByText('Không tìm thấy món phù hợp.')).toBeVisible();
  });
});
