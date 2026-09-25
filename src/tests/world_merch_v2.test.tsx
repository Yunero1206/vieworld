import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { FanWorldView } from '../views/FanWorldView';
import { FanShopView } from '../views/FanShopView';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { AppState } from '../domain/types';
import { NEW_MERCH, canEnterHall, ownedDigitalLook, ownsDigitalProduct, withMerchCatalog } from '../world/merchCatalog';
import { loadState, saveState } from '../services/storageAdapter';

const initial = () => createInitialState('vieworld-demo');
function fulfilled(productId:string) {
  let state=appReducer(initial(),{type:'CREATE_ORDER',productId,requestId:`test-${productId}`,optionLabel:'M'});
  const order=Object.values(state.orders).find(o=>o.productId===productId)!;
  state=appReducer(state,{type:'SIMULATE_PAYMENT',orderId:order.id,requestId:order.requestId});
  return appReducer(state,{type:'SIMULATE_FULFILMENT',orderId:order.id});
}
function member(state=initial()):AppState {
  return {...state,memberships:{m:{id:'m',tenantId:state.activeTenantId,version:1,updatedAt:state.demoTime,fanId:state.fanProfile.id,worldId:'artist-a',status:'active',expiresAt:'2099-01-01T00:00:00Z'}}};
}
function mount(path:string){return render(<AppProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/" element={<FanWorldView/>}/><Route path="/worlds/:worldId" element={<FanWorldView/>}/><Route path="/me" element={<FanWorldView/>}/><Route path="/shop" element={<FanShopView/>}/></Routes></MemoryRouter></AppProvider>);}

describe('World v2: ownership and access contracts',()=>{
  beforeEach(()=>localStorage.clear());
  it('adds missing SKUs without replacing stock, orders or identity',()=>{
    const state=fulfilled('product-star-shirt-digital');
    delete state.products['product-cap-real'];
    state.products['product-cd-real'].stockCount=0;
    const next=withMerchCatalog(state);
    expect(next.products['product-cap-real']).toBeDefined();
    expect(next.products['product-cd-real'].stockCount).toBe(0);
    expect(next.orders).toBe(state.orders);expect(next.fanProfile).toBe(state.fanProfile);
    expect(withMerchCatalog(next)).toBe(next);
  });
  it('hydrates old storage additively and leaves other tenants alone',()=>{
    const state=initial();for(const id of Object.keys(NEW_MERCH))delete state.products[id];
    saveState(state);const loaded=loadState(state.activeTenantId,state.fanProfile.id).state;
    expect(loaded.products['product-cap-real']).toBeDefined();expect(loaded.fanProfile.id).toBe(state.fanProfile.id);
    const other=createInitialState('mfan-demo');expect(withMerchCatalog(other)).toBe(other);
  });
  it.each(['product-star-shirt-real','product-cap-real','product-lightstick-real'])('physical purchase %s never grants digital',id=>{
    const state=fulfilled(id);const digital=Object.values(state.products).find(p=>p.familyId===state.products[id].familyId&&p.delivery==='digital')!;
    expect(ownsDigitalProduct(state,digital)).toBe(false);
    expect(appReducer(state,{type:'EQUIP_DIGITAL_PRODUCT',productId:digital.id}).lastError?.code).toBe('DIGITAL_NOT_OWNED');
  });
  it.each(['product-star-shirt-digital','product-star-shirt-bundle','product-cap-digital','product-lightstick-digital'])('fulfilled edition %s can equip and survive refresh',id=>{
    let state=fulfilled(id);state=appReducer(state,{type:'EQUIP_DIGITAL_PRODUCT',productId:id});
    const p=state.products[id];expect(ownedDigitalLook(state)[p.digitalSlot!]).toBe(p.digitalItemId);
    saveState(state);expect(ownedDigitalLook(loadState(state.activeTenantId,state.fanProfile.id).state)).toEqual(ownedDigitalLook(state));
    const order=Object.values(state.orders).find(o=>o.productId===id)!;
    state={...state,orders:{...state.orders,[order.id]:{...order,status:'refunded'}}};
    expect(ownedDigitalLook(state)[p.digitalSlot!]).toBeUndefined();
  });
  it('payment alone and another fan’s receipt do not grant an item',()=>{
    let state=appReducer(initial(),{type:'CREATE_ORDER',productId:'product-cap-digital',requestId:'cap'});
    const order=Object.values(state.orders).find(o=>o.requestId==='cap')!;
    state=appReducer(state,{type:'SIMULATE_PAYMENT',orderId:order.id,requestId:order.requestId});
    expect(ownsDigitalProduct(state,state.products[order.productId])).toBe(false);
    state={...state,orders:{[order.id]:{...order,status:'fulfilled',fanId:'someone-else'}}};
    expect(ownsDigitalProduct(state,state.products[order.productId])).toBe(false);
  });
  it('requires valid shirt size, rejects preview passes, and preserves retry idempotency',()=>{
    let state=initial();
    expect(appReducer(state,{type:'CREATE_ORDER',productId:'product-star-shirt-real',requestId:'a'}).lastError?.code).toBe('SIZE_REQUIRED');
    for(const productId of ['product-member-preview','product-ticket-preview'])expect(appReducer(state,{type:'CREATE_ORDER',productId,requestId:'b'}).lastError?.code).toBe('PREVIEW_ONLY');
    const action={type:'CREATE_ORDER' as const,productId:'product-star-shirt-real',requestId:'shirt-retry',optionLabel:'M'};
    state=appReducer(state,action);expect(appReducer(state,action)).toBe(state);
    expect(Object.values(state.orders).find(o=>o.requestId==='shirt-retry')?.optionLabel).toBe('M');
  });
  it('Hall membership is scoped and expires; follow is not enough',()=>{
    let state={...initial(),memberships:{}};
    expect(canEnterHall(state,'artist-a')).toBe(false);
    state=member(state);expect(canEnterHall(state,'artist-a')).toBe(true);expect(canEnterHall(state,'neon-sessions')).toBe(false);
    expect(canEnterHall({...state,demoTime:'2100-01-01T00:00:00Z'},'artist-a')).toBe(false);
  });
  it('guards Hall posting, validates length, deduplicates, persists and hides reports locally',()=>{
    const action={type:'SEND_HALL_MESSAGE' as const,worldId:'artist-a',text:'  Acoustic nhé  ',requestId:'hall-1'};
    expect(appReducer({...initial(),memberships:{}},action).lastError?.code).toBe('HALL_MEMBERSHIP_REQUIRED');
    let state=appReducer(member(),action);expect(state.hallMessages?.['artist-a'][0].text).toBe('Acoustic nhé');expect(appReducer(state,action)).toBe(state);
    expect(appReducer(state,{...action,requestId:'hall-2',text:'x'.repeat(281)}).lastError?.code).toBe('HALL_MESSAGE_INVALID');
    state=appReducer(state,{type:'REPORT_HALL_MESSAGE',worldId:'artist-a',messageId:'hall-1'});saveState(state);
    expect(loadState(state.activeTenantId,state.fanProfile.id).state.hallMessages?.['artist-a'][0].isReported).toBe(true);
  });
  it('offers one discovery entrance instead of a duplicate artist dropdown',()=>{
    mount('/');expect(screen.getByRole('link',{name:'← Khám phá nghệ sĩ'})).toHaveAttribute('href','/artists');
    expect(screen.queryByRole('navigation',{name:'Các nơi trong thế giới'})).not.toBeInTheDocument();
  });
  it('shop filters physical-only albums and saves a design without creating an order',()=>{
    mount('/shop');fireEvent.click(screen.getByRole('button',{name:'Album / CD'}));
    expect(screen.getByRole('heading',{name:'First Notes · CD Album'})).toBeInTheDocument();
    expect(screen.queryByRole('heading',{name:'Áo Star Club'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Lưu First Notes · CD Album'}));
    const state=loadState('vieworld-demo',initial().fanProfile.id).state;
    expect(state.fanProfile.savedProductIds).toContain('product-cd-real');expect(Object.keys(state.orders)).toHaveLength(0);
  });
  it('try-on renders digital but neither buys nor persists appearance',()=>{
    mount('/shop?product=product-star-shirt-real');const dialog=screen.getByRole('dialog');
    expect(within(dialog).getByRole('button',{name:'Chọn kích cỡ trước'})).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button',{name:/Thử trong My Space/}));
    const preview=screen.getByRole('dialog',{name:'Thử trong My Space'});
    expect(within(preview).getByTestId('digital-shirt')).toBeInTheDocument();
    const state=loadState('vieworld-demo',initial().fanProfile.id).state;
    expect(state.fanProfile.digitalLook?.shirt).toBeUndefined();expect(Object.keys(state.orders)).toHaveLength(0);
    fireEvent.click(within(preview).getByRole('button',{name:'Quay lại món đồ'}));
    expect(within(screen.getByRole('dialog')).queryByTestId('digital-shirt')).not.toBeInTheDocument();
  });
  it('dual-commerce: fulfilled digital item activates in wardrobe and persists look', () => {
    let state = fulfilled('product-star-shirt-digital');
    expect(ownsDigitalProduct(state, state.products['product-star-shirt-digital'])).toBe(true);
    state = appReducer(state, { type: 'EQUIP_DIGITAL_PRODUCT', productId: 'product-star-shirt-digital' });
    expect(ownedDigitalLook(state).shirt).toBe('star-shirt');
    saveState(state);
    const loaded = loadState(state.activeTenantId, state.fanProfile.id).state;
    expect(ownedDigitalLook(loaded).shirt).toBe('star-shirt');
  });
  it('dual-commerce: physical purchase preserves delivery tracking and leaves digital look intact', () => {
    let state = appReducer(initial(), { type: 'CREATE_ORDER', productId: 'product-cd-real', requestId: 'req-cd' });
    const order = Object.values(state.orders).find(o => o.productId === 'product-cd-real')!;
    expect(order.deliveryType || state.products[order.productId].delivery).toBe('physical');
    state = appReducer(state, { type: 'SIMULATE_PAYMENT', orderId: order.id, requestId: order.requestId });
    expect(state.orders[order.id].status).toBe('paid');
    expect(state.fanProfile.digitalLook?.shirt).toBeUndefined();
    expect(ownsDigitalProduct(state, state.products[order.productId])).toBe(false);
  });
});
