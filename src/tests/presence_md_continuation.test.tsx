import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {cleanup,render,screen,fireEvent,within} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {AppProvider} from '../context/AppContext';
import {createInitialState} from '../data/fixtures';
import type {AppState,ChatMessage} from '../domain/types';
import {appReducer} from '../domain/reducer';
import {selectExploreRows} from '../world/exploreRows';
import {selectWorldPulse} from '../world/exploreDiscovery';
import {selectArtistActivityPair,worldActivities} from '../world/presenceDiscovery';
import {canWriteArtistHallRoom,isArtistHallRoom} from '../world/artistPresentation';
import {currentBenefitsFor,membershipWorldsForFan,orderState} from '../world/personalSelectors';
import {readDisplaySurfaces} from '../world/displaySurfaces';
import {loadState} from '../services/storageAdapter';
import {FanShopView} from '../views/FanShopView';
import {ArtistHall} from '../views/ArtistHall';
import {PersonalUtilityView} from '../views/PersonalUtilityView';
import {DisplayRoomScene,PersonalDisplayRoom} from '../components/DisplayRoom';

const initial=()=>createInitialState('vieworld-demo');
function mount(state:AppState,path:string,element:React.ReactNode){return render(<AppProvider initialState={state}><MemoryRouter initialEntries={[path]}><Routes><Route path="*" element={element}/></Routes></MemoryRouter></AppProvider>);}
function own(state:AppState,productId:string,id=productId){state.orders[id]={id,tenantId:state.activeTenantId,version:1,updatedAt:state.demoTime,fanId:state.fanProfile.id,productId,worldId:'artist-a',sourceRef:'test',requestId:id,status:'fulfilled'};}
beforeEach(()=>{cleanup();localStorage.clear();window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()});});
afterEach(cleanup);

describe('Continuation: canonical MD beats a plausible but unrelated visual',()=>{
 it('does not turn generic Hall concert messages into Shop ownership stories',()=>{mount(initial(),'/shop',<FanShopView/>);expect(screen.queryByLabelText('Lời nhắn từ Hall')).toBeNull();expect(screen.queryByText(/Nay nghe setlist/)).toBeNull();expect(screen.getByText('Mỗi phiên bản ghi rõ những gì bạn nhận.')).toBeVisible();});
 it('ranks exact artist and prefix before a followed live context matching the query',()=>{const state=initial();state.worlds['artist-mira'].name='Concert';state.worlds['artist-kai'].name='Concert KAI';state.sessions['session-dropin-01'].title='Artist A: Concert trực tiếp';state.sessions['session-dropin-01'].status='running';const rows=selectExploreRows(state,'concert');expect(rows.slice(0,2).map(r=>r.world_id)).toEqual(['artist-mira','artist-kai']);});
 it('filters accentless queries without exposing products or private messages as worlds',()=>{const state=initial();const rows=selectExploreRows(state,'ha noi');expect(rows.length).toBeGreaterThan(0);expect(rows.every(r=>state.worlds[r.world_id].type==='artist')).toBe(true);expect(selectExploreRows(state,'secret private message')).toEqual([]);});
 it('does not attribute an artist activity to related artists in search',()=>{const state=initial();expect(selectExploreRows(state,'mira').map(r=>r.world_id)).toEqual(['artist-mira']);const session=Object.values(state.sessions).find(s=>s.worldId==='artist-mira')!;session.title='Exclusive moonlight rendezvous';expect(selectExploreRows(state,'moonlight rendezvous').map(r=>r.world_id)).toEqual(['artist-mira']);expect(selectExploreRows(state,'Neon Sessions').map(r=>r.world_id)).toEqual(['artist-a']);});
 it('selects a primary-context voice before capping unrelated community messages',()=>{const state=initial();state.fanProfile.sharing={communityPresenceEnabled:false,hallPublicProjectionEnabled:true};const msg=(id:string,room:string):ChatMessage=>({id,sessionId:room,fanId:state.fanProfile.id,authorName:'Fan',text:id,timestamp:state.demoTime,explorePreviewConsent:true,explorePreviewStatus:'approved'});state.hallMessages={'artist-a':[msg('relevant','hall-artist-a'),...Array.from({length:5},(_,i)=>msg(`other-${i}`,'session-dropin-01'))]};expect(selectWorldPulse(state,'artist-a','hall-artist-a')?.id).toBe('relevant');state.fanProfile.sharing.hallPublicProjectionEnabled=false;expect(selectWorldPulse(state,'artist-a','hall-artist-a')?.id).not.toBe('relevant');});
 it('uses an active fan project as Main primary when no session is current',()=>{const state=initial();state.sessions={};const pair=selectArtistActivityPair(state,'artist-a');expect(pair[0].id).toBe('project-a-birthday');expect(pair[1].phase).toBe('recent');});
 it('complements an upcoming Main primary with a recent moment rather than another future tile',()=>{const state=initial();const base=state.sessions['session-dropin-01'];state.sessions={future:{...base,id:'future',worldId:'artist-mira',status:'scheduled',scheduledStartTime:'2099-01-01T00:00:00Z'}};const pair=selectArtistActivityPair(state,'artist-mira');expect(pair.map(a=>a.phase)).toEqual(['next','recent']);});
 it('never constructs cross-tenant activities or membership relationships',()=>{const state=initial();state.worlds['artist-a'].tenantId='mfan-demo';expect(worldActivities(state,'artist-a')).toEqual([]);expect(membershipWorldsForFan(state).some(m=>m.world.id==='artist-a')).toBe(false);});
 it('retains ended Hall rooms for reading but rejects messages and reactions',()=>{const state=initial();state.sessions['session-dropin-01'].status='ended';expect(isArtistHallRoom(state,'artist-a','session-dropin-01')).toBe(true);expect(canWriteArtistHallRoom(state,'artist-a','session-dropin-01')).toBe(false);const next=appReducer(state,{type:'SEND_HALL_MESSAGE',worldId:'artist-a',roomId:'session-dropin-01',text:'Not writable',requestId:'late'});expect(next.lastError?.code).toBe('HALL_ROOM_READ_ONLY');expect(next.hallMessages).toEqual(state.hallMessages);expect(appReducer(state,{type:'TOGGLE_HALL_REACTION',worldId:'artist-a',roomId:'session-dropin-01',messageId:'voice-a-1'})).toBe(state);});
 it('shows an ended conversation while disabling its composer',()=>{const state=initial();state.sessions['session-dropin-01'].status='ended';mount(state,'/artist/artist-a/hall?room=session-dropin-01',<ArtistHall artistId="artist-a" name="Artist A" sessions={[]}/>);expect(screen.getByRole('log')).toBeVisible();expect(screen.getByRole('textbox',{name:'Gửi lời nhắn trong Hall'})).toBeDisabled();expect(screen.getByText('Phòng đã khép lại. Bạn vẫn có thể đọc lại cuộc trò chuyện.')).toBeVisible();});
 it('does not admit cancelled or unavailable Hall contexts',()=>{const state=initial();state.sessions['session-dropin-01'].status='cancelled';expect(isArtistHallRoom(state,'artist-a','session-dropin-01')).toBe(false);state.sessions['session-dropin-01'].status='running';state.sessions['session-dropin-01'].mediaStatus='expired';expect(isArtistHallRoom(state,'artist-a','session-dropin-01')).toBe(false);});
 it('counts only useful current benefits and keeps expired/claimed benefits out of overview',()=>{const state=initial();const base=Object.values(state.benefits)[0];state.benefits={active:{...base,id:'active',status:'eligible',title:'Quyền lợi mở'},pending:{...base,id:'pending',status:'pending',title:'Quyền lợi sắp mở'},claimed:{...base,id:'claimed',status:'claimed',title:'Đã nhận trước đây'},expired:{...base,id:'expired',status:'expired',title:'Quyền lợi cũ'}};expect(currentBenefitsFor(state).map(b=>b.id).sort()).toEqual(['active','pending']);mount(state,'/memberships',<PersonalUtilityView/>);expect(screen.getByRole('heading',{name:'Cần chú ý'})).toBeVisible();expect(screen.getByRole('link',{name:/Quyền lợi mở/})).toBeVisible();expect(screen.queryByText('Quyền lợi sắp mở')).toBeNull();expect(screen.queryByText('Đã nhận trước đây')).toBeNull();});
 it('keeps selected-world history collapsed and exposes readable benefit states',()=>{const state=initial();const base=Object.values(state.benefits)[0];state.benefits={active:{...base,id:'active',worldId:'artist-a',status:'eligible',title:'Vé đang mở'},old:{...base,id:'old',worldId:'artist-a',status:'revoked',title:'Quyền lợi đã thu hồi'}};mount(state,'/memberships?artist=artist-a',<PersonalUtilityView/>);expect(screen.getByRole('link',{name:/Vé đang mở.*Có thể nhận/})).toBeVisible();const history=document.querySelector('.presence-benefit-history');expect(history).not.toHaveAttribute('open');expect(screen.getByText('Quyền lợi đã thu hồi')).not.toBeVisible();});
 it('uses a support subject and human state instead of the raw case ID',()=>{const state=initial();const base=Object.values(state.benefits)[0];state.supportCases={raw:{id:'raw-secret-case',tenantId:state.activeTenantId,version:1,updatedAt:state.demoTime,fanId:state.fanProfile.id,subjectType:'benefit',subjectId:base.id,status:'investigating',nextAction:'internal'}};mount(state,'/account/help',<PersonalUtilityView/>);expect(screen.getByRole('link',{name:new RegExp(base.title+'.*Đang kiểm tra')})).toHaveAttribute('href','/support/raw-secret-case');expect(screen.queryByText(/raw-secret-case/)).toBeNull();});
 it('does not pretend bundle fulfillment has independently verified delivery parts',()=>{const state=initial();own(state,'product-cap-real');expect(orderState({...Object.values(state.orders)[0],deliveryType:'bundle'},state)).toBe('Đã hoàn tất đơn demo');});
 it('does not glow or toggle an empty lightstick surface',()=>{
  const toggle=vi.fn();const select=vi.fn();
  const {container}=render(<DisplayRoomScene fan={{name:'Fan',look:{},accessory:'none'}} items={[]} onSelect={select} onToggleLightstick={toggle}/>);
  const fixture=screen.getByRole('button',{name:'Góc ánh sáng: chưa trưng bày'});
  expect(fixture).not.toHaveClass('v7-lightstick-glow');expect(fixture).not.toHaveAttribute('title');
  fireEvent.click(fixture);expect(select).toHaveBeenCalledWith('lightstick');expect(toggle).not.toHaveBeenCalled();
  expect(container.querySelector('.v7-inscene-toast')).toBeNull();
 });
 it('renders hover/focus ghost with the room renderer without persisting, then preserves selection on blur',()=>{
  const state=initial();state.orders={};own(state,'product-lightstick-digital');
  const {container}=mount(state,'/me',<PersonalDisplayRoom onOpen={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Góc ánh sáng: chưa trưng bày'}));
  const choose=within(screen.getByRole('dialog')).getByRole('button',{name:'Đặt vào phòng'});
  fireEvent.mouseEnter(choose);
  expect(container.querySelector('.v6-personal-room')).toHaveAttribute('data-preview-state','hover');
  expect(container.querySelector('[data-room-item="product-lightstick-digital"]')).toHaveClass('is-ghost');
  expect(readDisplaySurfaces(loadState().state.fanProfile).lightstick.itemIds).toEqual([]);
  fireEvent.mouseLeave(choose);expect(container.querySelector('[data-room-item="product-lightstick-digital"]')).toBeNull();
  fireEvent.focus(choose);expect(container.querySelector('.v6-personal-room')).toHaveAttribute('data-preview-state','hover');
  fireEvent.click(choose);fireEvent.blur(choose);expect(container.querySelector('.v6-personal-room')).toHaveAttribute('data-preview-state','selected');
  expect(readDisplaySurfaces(loadState().state.fanProfile).lightstick.itemIds).toEqual([]);
  fireEvent.click(screen.getByRole('button',{name:'Đặt ở đây'}));
  expect(readDisplaySurfaces(loadState().state.fanProfile).lightstick.itemIds).toEqual(['product-lightstick-digital']);
 });
});
