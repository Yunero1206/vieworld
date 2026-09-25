import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { WorldPlazaView } from '../views/WorldPlazaView';
import { FanWorldView } from '../views/FanWorldView';
import { RoomInterior } from '../components/RoomInterior';
import { ArtistBroadcast } from '../components/ArtistBroadcast';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { DEFAULT_ROOM, RoomDesign, validRoomDesign } from '../world/places';
import { loadState, saveState } from '../services/storageAdapter';
const initial=()=>createInitialState('vieworld-demo');
function mount(path='/'){return render(<AppProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/" element={<WorldPlazaView/>}/><Route path="/worlds/:worldId" element={<FanWorldView/>}/><Route path="/worlds/:worldId/moments" element={<FanWorldView/>}/><Route path="/worlds/:worldId/archive" element={<FanWorldView/>}/><Route path="/moments" element={<FanWorldView/>}/><Route path="/archive" element={<FanWorldView/>}/><Route path="/me" element={<FanWorldView/>}/></Routes></MemoryRouter></AppProvider>);}
const read=()=>loadState('vieworld-demo',initial().fanProfile.id).state;
describe('Fan home and room',()=>{
  beforeEach(()=>localStorage.clear());
  it('starts with a brief orientation and a contextual way back, not an artist room',()=>{
    const state=appReducer(initial(),{type:'VISIT_FAN_WORLD',worldId:'neon-sessions'});saveState(state);mount();
    expect(screen.getByRole('heading',{level:1}).textContent).toContain('Chào Linh.');
    expect(screen.getByRole('region',{name:'Gần đây'})).toBeInTheDocument();
    expect(screen.getByRole('region',{name:'Khoảnh khắc sắp tới'})).toBeInTheDocument();
    expect(screen.getByRole('link',{name:/Trở lại với Neon Sessions/})).toHaveAttribute('href','/explore');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
  it('links a real live session without claiming extra activity',()=>{
    mount();
    expect(screen.getByRole('link',{name:/Artist A: Drop-in Trò chuyện đầu tuần/})).toHaveAttribute('href','/sessions/session-dropin-01');
    expect(screen.queryByText(/Mở presale/)).not.toBeInTheDocument();
  });
  it.each([['/worlds/artist-a','moments'],['/worlds/artist-a/moments','moments'],['/worlds/artist-a/archive','archive'],['/me','myspace']])('%s renders its own room artwork', (path,image)=>{
    const {container}=mount(path);if(image==='moments')fireEvent.click(screen.getByRole('button',{name:'Live & Concert'}));if(image==='myspace'){expect(container.querySelector('.v6-room-art')).toHaveAttribute('src','/images/myspace-room-v2.png');expect(screen.getByRole('link',{name:/Về quảng trường/})).toHaveAttribute('href','/');}else expect(container.querySelector('.fw-scene-art')).toBeNull();
  });
  it('saves an edited room without touching orders, memberships or collections',()=>{
    const state=initial();const design:RoomDesign={...DEFAULT_ROOM,theme:'dusk',items:[{id:'a',kind:'lamp',x:60,y:66,rotation:90}]};
    const next=appReducer(state,{type:'SAVE_ROOM_DESIGN',design});
    expect(next.orders).toBe(state.orders);expect(next.memberships).toBe(state.memberships);expect(next.capsules).toBe(state.capsules);
    expect(next.fanProfile.roomDesign).toEqual(design);expect(next.fanProfile.roomDesign).not.toBe(design);
    saveState(next);expect(read().fanProfile.roomDesign).toEqual(design);
  });
  it.each([null,{...DEFAULT_ROOM,items:[null]},{...DEFAULT_ROOM,items:[{...DEFAULT_ROOM.items[0],x:NaN}]},{...DEFAULT_ROOM,items:[{...DEFAULT_ROOM.items[0],y:900}]},{...DEFAULT_ROOM,items:[DEFAULT_ROOM.items[0],DEFAULT_ROOM.items[0]]},{...DEFAULT_ROOM,items:Array.from({length:9},(_,i)=>({...DEFAULT_ROOM.items[0],id:String(i)}))}])('rejects invalid or oversized room data safely: %j',raw=>{
    expect(validRoomDesign(raw as RoomDesign)).toBe(false);
    expect(appReducer(initial(),{type:'SAVE_ROOM_DESIGN',design:raw as RoomDesign}).lastError?.code).toBe('ROOM_DESIGN_INVALID');
  });
  it('adds, moves with keyboard, saves and restores furniture through actual controls',()=>{
    const view=render(<AppProvider><MemoryRouter><RoomInterior place="myspace" onOpen={()=>{}}/></MemoryRouter></AppProvider>);fireEvent.click(screen.getByRole('button',{name:'Trang trí phòng'}));
    fireEvent.click(screen.getByRole('tab',{name:'Furniture'}));fireEvent.click(screen.getByRole('button',{name:/Thêm bàn gỗ/}));
    fireEvent.keyDown(screen.getByRole('button',{name:'Bàn gỗ · chọn và di chuyển'}),{key:'ArrowRight'});
    fireEvent.click(screen.getByRole('button',{name:'Đổi hướng'}));fireEvent.click(screen.getByRole('button',{name:'Lưu căn phòng'}));
    const table=read().fanProfile.roomDesign?.items.find(i=>i.kind==='table');expect(table?.x).toBe(63);expect(table?.rotation).toBe(90);
    view.unmount();render(<AppProvider><MemoryRouter><RoomInterior place="myspace" onOpen={()=>{}}/></MemoryRouter></AppProvider>);expect(screen.getByRole('button',{name:'Bàn gỗ'})).toBeInTheDocument();
  });
  it('cancels draft changes without changing saved room or granting inventory',()=>{
    render(<AppProvider><MemoryRouter><RoomInterior place="myspace" onOpen={()=>{}}/></MemoryRouter></AppProvider>);fireEvent.click(screen.getByRole('button',{name:'Trang trí phòng'}));fireEvent.click(screen.getByRole('tab',{name:'Decor'}));fireEvent.click(screen.getByRole('button',{name:/Thêm chậu cây/}));
    fireEvent.click(screen.getByRole('button',{name:'Hủy thay đổi'}));expect(screen.queryByRole('button',{name:'Chậu cây'})).not.toBeInTheDocument();
    expect(read().fanProfile.roomDesign).toBeUndefined();expect(read().fanProfile.digitalLook).toBeUndefined();expect(Object.keys(read().orders)).toHaveLength(0);
  });
  it('shows only approved contextual artist avatars in a broadcast',()=>{
    const state=initial();const session=Object.values(state.sessions).find(s=>s.worldId==='artist-a'&&s.format==='dropin')!;
    state.avatarAssets[session.avatarAssetId!].status='draft';saveState(state);
    render(<AppProvider><MemoryRouter><ArtistBroadcast worldId="artist-a"/></MemoryRouter></AppProvider>);
    expect(screen.queryByTestId('avatar-renderer-artist')).not.toBeInTheDocument();expect(screen.getByTestId('fallback-avatar-torso')).toBeInTheDocument();
  });
  it('freezes a recorded segment instead of claiming live artist presence',()=>{
    const state=initial();for(const s of Object.values(state.sessions))if(s.worldId==='artist-a'&&s.format==='dropin'){s.status='running';s.segmentMode='recorded';s.artistPresence='present';}
    saveState(state);render(<AppProvider><MemoryRouter><ArtistBroadcast worldId="artist-a"/></MemoryRouter></AppProvider>);
    expect(screen.getByTestId('avatar-graphic')).toHaveAttribute('data-frozen','true');
    expect(screen.getByTestId('standard-stage-wrapper')).toHaveAttribute('data-artist-presence','absent');
  });
});
