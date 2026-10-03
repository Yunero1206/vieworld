import { beforeEach,describe,expect,it } from 'vitest';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { loadState,saveState } from '../services/storageAdapter';
import { DEFAULT_ROOM,RoomDesign,validRoomDesign } from '../world/places';
import { selectPlazaState } from '../world/plazaState';
const initial=()=>createInitialState('vieworld-demo');
const read=()=>loadState('vieworld-demo',initial().fanProfile.id).state;
describe('Fan home and room',()=>{
  beforeEach(()=>localStorage.clear());



  it('publishes no more than one active and one upcoming session with approved rights',()=>{
    const plaza=selectPlazaState(initial());
    expect(plaza.primary?.id).toBe('session-dropin-01');
    expect(plaza.primary?.statusLabel).toBe('Đang phát');
    expect(plaza.next?.id).toBe('session-a-album-drop');
    expect([plaza.primary,plaza.next].filter(Boolean)).toHaveLength(2);
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
});
