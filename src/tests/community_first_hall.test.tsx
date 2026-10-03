import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from '../context/AppContext';
import { createFreshFanState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import type { AppState, ChatMessage } from '../domain/types';
import { freshGuestState } from '../world/account';
import { artistRooms, hallEntries } from '../world/artistPresentation';
import { canReadArtistHallRoom, canWriteArtistHallRoom, getHallRoomPolicy, hallQuestions, MEMBER_QA_SESSION_ID as QA } from '../world/hallRooms';
import { selectPublicVoices, selectWorldPulse } from '../world/exploreDiscovery';
import { selectHomePresence, worldActivities } from '../world/presenceDiscovery';
import { selectExploreRows, getWorldMoments } from '../world/exploreRows';
import { artistArchiveChapters } from '../world/artistArchive';
import { withCommunityHallFixture } from '../data/communityHall';
import { saveState, loadState } from '../services/storageAdapter';
import { ArtistHall } from '../views/ArtistHall';
import { ArtistWorldView } from '../views/ArtistWorldView';
import { PersonalUtilityView } from '../views/PersonalUtilityView';
import { GlobalNavigation } from '../components/GlobalNavigation';

const general='hall-artist-a', lounge='member-lounge-artist-a', event='session-dropin-01';
const nonmember=()=>appReducer(createFreshFanState('vieworld-demo','fan-hall-qa','Fan mới'),{type:'DEMO_SIGN_IN',provider:'google',mode:'login'});
const member=()=>appReducer(nonmember(),{type:'UPGRADE_MEMBERSHIP',worldId:'artist-a'});
const send=(state:AppState,roomId=general,text='Xin chào cả nhà!',requestId='hello')=>appReducer(state,{type:'SEND_HALL_MESSAGE',worldId:'artist-a',roomId,text,requestId});
const message=(state:AppState,roomId:string,id='private'):ChatMessage=>({id,sessionId:roomId,fanId:state.fanProfile.id,authorName:'Fan',text:`Nội dung ${id}`,timestamp:state.demoTime,explorePreviewConsent:true,explorePreviewStatus:'approved'});
function StateProbe(){const{state,dispatch}=useApp();return <><div hidden data-testid="hall-state">{JSON.stringify(state)}</div><button onClick={()=>dispatch({type:'DEMO_SIGN_OUT'})}>Sign out QA</button></>;}
function mount(state:AppState,path='/artist/artist-a/hall'){
 return render(<AppProvider initialState={state}><MemoryRouter initialEntries={[path]}><Routes>
  <Route path="/artist/:artistId/hall" element={<><ArtistHall artistId="artist-a" name="Artist A" sessions={[]}/><StateProbe/></>}/>
  <Route path="/artist/:artistId" element={<ArtistWorldView/>}/>
  <Route path="/memberships" element={<PersonalUtilityView/>}/>
 </Routes></MemoryRouter></AppProvider>);
}
const renderedState=()=>JSON.parse(screen.getByTestId('hall-state').textContent!) as AppState;
beforeEach(()=>{localStorage.clear();window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()});});
afterEach(cleanup);

describe('Community-first Hall: public belonging and private depth',()=>{
 it('1 guest reads Phòng chung, with login instead of a composer or membership gate',()=>{
  mount(freshGuestState(nonmember()));expect(screen.getByRole('log')).toHaveTextContent('Mình mới ghé world');
  expect(screen.queryByRole('textbox')).toBeNull();expect(screen.getByRole('button',{name:'Đăng nhập'})).toBeVisible();
  expect(screen.queryByRole('link',{name:/Xem hội viên/})).toBeNull();
 });
 it('2 fresh nonmember posts in public Hall without membership',()=>{
  const state=send(nonmember());expect(state.lastError).toBeUndefined();expect(state.hallMessages?.['artist-a'].at(-1)).toMatchObject({sessionId:general,text:'Xin chào cả nhà!'});
 });
 it('3 nonmember can reply and react, but cannot reference another room',()=>{
  const state=nonmember(), parent=hallEntries(state,'artist-a',general)[0];
  const reply=appReducer(state,{type:'SEND_HALL_MESSAGE',worldId:'artist-a',roomId:general,text:'Chào bạn!',replyToId:parent.id,requestId:'reply'});
  expect(reply.hallMessages?.['artist-a'].at(-1)?.replyToId).toBe(parent.id);
  const liked=appReducer(reply,{type:'TOGGLE_HALL_REACTION',worldId:'artist-a',roomId:general,messageId:parent.id});expect(liked.hallReactions?.['artist-a'][parent.id]).toContain(state.fanProfile.id);
  expect(appReducer(state,{type:'SEND_HALL_MESSAGE',worldId:'artist-a',roomId:event,text:'Cross room',replyToId:parent.id,requestId:'cross'})).toBe(state);
 });
 it('4 running public event admits nonmembers',()=>expect(send(nonmember(),event).lastError).toBeUndefined());
 it('5 fan-project room admits nonmembers',()=>expect(send(nonmember(),'project-a-birthday').lastError).toBeUndefined());
 it('6 locked Lounge exposes neither saved message nor aside',()=>{
  const state=nonmember();state.hallMessages={'artist-a':[message(state,lounge)]};mount(state,`/artist/artist-a/hall?room=${lounge}`);
  expect(screen.getByRole('link',{name:'Xem hội viên'})).toHaveAttribute('href','/memberships?artist=artist-a');
  expect(screen.queryByRole('log')).toBeNull();expect(screen.queryByText('Nội dung private')).toBeNull();expect(screen.queryByLabelText('Trong Hall lúc này')).toBeNull();
  expect(send(state,lounge).lastError?.code).toBe('HALL_MEMBERSHIP_REQUIRED');
 });
 it('7 active member reads, writes and reacts in Lounge',()=>{
  const state=send(member(),lounge);expect(canReadArtistHallRoom(state,'artist-a',lounge)).toBe(true);
  const next=appReducer(state,{type:'TOGGLE_HALL_REACTION',worldId:'artist-a',roomId:lounge,messageId:'hello'});expect(next.hallReactions?.['artist-a'].hello).toContain(state.fanProfile.id);
 });
 it('8 ended public event is readable by direct URL, excludes default rail, and forbids writes/reactions',()=>{
  let state=send(nonmember(),event);state.sessions[event].status='ended';
  expect(artistRooms(state,'artist-a').some(r=>r.id===event)).toBe(false);expect(artistRooms(state,'artist-a',event).find(r=>r.id===event)?.lifecycle).toBe('archived');
  mount(state,`/artist/artist-a/hall?room=${event}`);expect(screen.getByRole('log')).toHaveTextContent('Xin chào');expect(screen.getByRole('textbox')).toBeDisabled();expect(screen.getByRole('link',{name:'Xem Kho lưu trữ'})).toHaveAttribute('href','/artist/artist-a/archive');
  expect(send(state,event,'Too late','late').lastError?.code).toBe('HALL_ROOM_READ_ONLY');expect(appReducer(state,{type:'TOGGLE_HALL_REACTION',worldId:'artist-a',roomId:event,messageId:'hello'})).toBe(state);
 });
 it.each(['cancelled','missing','expired','rights'] as const)('9 %s event cannot be used by deep link',reason=>{
  const state=nonmember();if(reason==='cancelled')state.sessions[event].status='cancelled';else if(reason==='rights')state.sessions[event].rightsApproved=false;else state.sessions[event].mediaStatus=reason;
  expect(getHallRoomPolicy(state,'artist-a',event)).toBeUndefined();expect(send(state,event).lastError?.code).toBe('HALL_ROOM_INVALID');
 });
 it('10 scheduled event is upcoming but allows preparation chat',()=>{
  const state=nonmember(),id='session-a-album-drop';expect(artistRooms(state,'artist-a').find(r=>r.id===id)?.lifecycle).toBe('scheduled');expect(send(state,id).lastError).toBeUndefined();
 });
 it('11 paused chat remains readable and disables the composer and poll',()=>{
  const state=nonmember();state.sessions[event].isChatPaused=true;expect(canReadArtistHallRoom(state,'artist-a',event)).toBe(true);expect(canWriteArtistHallRoom(state,'artist-a',event)).toBe(false);
  mount(state,`/artist/artist-a/hall?room=${event}`);expect(screen.getByRole('textbox')).toBeDisabled();expect(screen.getByRole('status')).toHaveTextContent('tạm dừng');
  const poll=Object.values(state.polls).find(p=>p.sessionId===event)!;expect(appReducer(state,{type:'VOTE_POLL',pollId:poll.id,optionId:poll.options[0].id}).lastError?.code).toBe('POLL_CLOSED');
 });
 it('12 Q&A direct URL hides answers and rejects questions for nonmembers',()=>{
  const state=nonmember();mount(state,`/artist/artist-a/hall?room=${QA}`);expect(within(screen.getByRole('region',{name:'Trò chuyện trong Q&A với Artist A'})).queryByText(/Bạn thường bắt đầu viết/)).toBeNull();expect(screen.queryByRole('textbox')).toBeNull();
  expect(hallQuestions(state,'artist-a',QA)).toEqual([]);expect(appReducer(state,{type:'SUBMIT_QUESTION',sessionId:QA,content:'Câu hỏi'}).lastError?.code).toBe('HALL_MEMBERSHIP_REQUIRED');
 });
 it('13 member Q&A is a question surface without chat or operator controls',()=>{
  mount(member(),`/artist/artist-a/hall?room=${QA}`);expect(screen.getByRole('textbox',{name:'Đặt câu hỏi'})).toHaveAttribute('maxlength','200');
  expect(screen.queryByRole('textbox',{name:'Gửi lời nhắn trong Hall'})).toBeNull();expect(screen.queryByRole('button',{name:/Chọn câu hỏi|Đánh dấu đã trả lời|Đóng hàng đợi/})).toBeNull();
 });
 it('14 valid questions are stored idempotently and own pending status is visible',()=>{
  mount(member(),`/artist/artist-a/hall?room=${QA}`);fireEvent.change(screen.getByRole('textbox'),{target:{value:'Mình muốn hỏi về bài mới'}});fireEvent.click(screen.getByRole('button',{name:'Gửi câu hỏi'}));
  const state=renderedState(), q=Object.values(state.questions).find(q=>q.content==='Mình muốn hỏi về bài mới')!;expect(q.status).toBe('submitted');expect(screen.getByText('Đã gửi')).toBeVisible();
  expect(appReducer(state,{type:'SUBMIT_QUESTION',sessionId:QA,content:q.content,requestId:q.requestId})).toBe(state);
  expect(appReducer(state,{type:'SUBMIT_QUESTION',sessionId:QA,content:'a'.repeat(201)}).lastError?.code).toBe('INVALID_QUESTION_LENGTH');
 });
 it('15 seeded answer is optional additive content, clearly illustrative',()=>{
  mount(member(),`/artist/artist-a/hall?room=${QA}`);expect(screen.getByText('Câu trả lời minh họa')).toBeVisible();expect(screen.getByText(/được chọn không đồng nghĩa đã trả lời/)).toBeVisible();
 });
 it('16 generic session questions remain available without Hall membership',()=>{
  const state=nonmember();expect(appReducer(state,{type:'SUBMIT_QUESTION',sessionId:event,content:'Câu hỏi phiên cũ',requestId:'generic'}).lastError).toBeUndefined();
 });
 it('17 public approved consented voice projects, reported voice does not',()=>{
  const state=nonmember();state.fanProfile.sharing={hallPublicProjectionEnabled:true,communityPresenceEnabled:false};state.hallMessages={'artist-a':[message(state,general,'public')]};
  expect(selectPublicVoices(state,'artist-a').some(v=>v.id==='public')).toBe(true);
  const reported=appReducer(state,{type:'REPORT_HALL_MESSAGE',worldId:'artist-a',messageId:'public'});expect(selectPublicVoices(reported,'artist-a').some(v=>v.id==='public')).toBe(false);
 });
 it.each([lounge,QA])('18 private %s voice never projects despite old consent/approval',roomId=>{
  const state=member();state.fanProfile.sharing={hallPublicProjectionEnabled:true,communityPresenceEnabled:true};state.hallMessages={'artist-a':[message(state,roomId)]};
  expect(selectPublicVoices(state,'artist-a').some(v=>v.id==='private')).toBe(false);expect(selectWorldPulse(state,'artist-a',roomId)?.id).not.toBe('private');expect(JSON.stringify(selectHomePresence(state))).not.toContain('Nội dung private');
 });
 it('19 nonmember cannot read private entries through a selector',()=>{
  const state=nonmember();state.hallMessages={'artist-a':[message(state,lounge)]};expect(hallEntries(state,'artist-a',lounge)).toEqual([]);
 });
 it('20 sample fan voices get no invented membership or tenure',()=>{
  mount(member());expect(within(screen.getByRole('log')).queryByRole('img',{name:/Hội viên/})).toBeNull();
 });
 it('21 actual active fan still has canonical membership identity',()=>{
  mount(send(member()));expect(within(screen.getByRole('log')).getByRole('img',{name:/Hội viên/})).toBeVisible();
 });
});

describe('Community-first integration and sign-out contracts',()=>{
 it('defaults to Phòng chung with independent access, mode and lifecycle metadata',()=>{
  const rooms=artistRooms(nonmember(),'artist-a');expect(rooms[0].id).toBe(general);expect(rooms.find(r=>r.id===lounge)).toMatchObject({access:'member',mode:'chat',lifecycle:'permanent'});expect(rooms.find(r=>r.id===QA)).toMatchObject({access:'member',mode:'qa',lifecycle:'active'});
 });
 it('excludes Q&A from public activities, search and Archive even after ending',()=>{
  const state=member();state.sessions[QA].status='ended';state.sessions[QA].title='Secret QA keyword';expect(worldActivities(state,'artist-a').some(a=>a.id===QA)).toBe(false);expect(selectExploreRows(state,'Secret QA keyword')).toEqual([]);
  expect(artistArchiveChapters(state,'artist-a',getWorldMoments('artist-a'),Object.values(state.sessions)).some(c=>c.id===QA||c.to?.includes(QA))).toBe(false);
 });
 it('routes old Q&A context links into the same protected Hall',()=>{
  mount(nonmember(),`/artist/artist-a?context=session:${QA}`);expect(screen.getByRole('link',{name:'Xem hội viên'})).toBeVisible();expect(screen.queryByText('Tham dự trực tiếp')).toBeNull();
 });
 it('rights revoked on registered Q&A cannot bypass membership or closed guards',()=>{
  const state=member();state.sessions[QA].rightsApproved=false;expect(appReducer(state,{type:'SUBMIT_QUESTION',sessionId:QA,content:'Không hợp lệ'}).lastError?.code).toBe('QUESTION_SUBMISSION_CLOSED');
 });
 it('pending questions from other fans stay hidden; selected is not answered',()=>{
  const state=member(),base=Object.values(state.questions).find(q=>q.sessionId===QA)!;state.questions.other={...base,id:'other',fanId:'other',status:'submitted'};state.questions.chosen={...base,id:'chosen',status:'selected',answerText:undefined};
  expect(hallQuestions(state,'artist-a',QA).some(q=>q.id==='other')).toBe(false);mount(state,`/artist/artist-a/hall?room=${QA}`);expect(within(screen.getByLabelText('Câu hỏi đang được chọn')).queryByText('Câu trả lời minh họa')).toBeNull();
 });
 it('sign-out clears Q&A and chat drafts, hides private content immediately',()=>{
  mount(member(),`/artist/artist-a/hall?room=${QA}`);fireEvent.change(screen.getByRole('textbox'),{target:{value:'Private draft'}});fireEvent.click(screen.getByRole('button',{name:'Sign out QA'}));expect(screen.queryByRole('textbox')).toBeNull();expect(screen.queryByText('Câu trả lời minh họa')).toBeNull();
 });
 it('expired membership locks both Lounge and Q&A, not general community',()=>{
  const state=member();state.demoTime='2099-01-01T00:00:00Z';expect(canReadArtistHallRoom(state,'artist-a',lounge)).toBe(false);expect(canReadArtistHallRoom(state,'artist-a',QA)).toBe(false);expect(canWriteArtistHallRoom(state,'artist-a',general)).toBe(true);
 });
 it('membership link offers explicit demo join, then links to Lounge instead of public Hall',()=>{
  mount(nonmember(),'/memberships?artist=artist-a');fireEvent.click(screen.getByRole('button',{name:'Tham gia hội viên demo'}));expect(screen.getByRole('link',{name:'Vào Member Lounge'})).toHaveAttribute('href',`/artist/artist-a/hall?room=${lounge}`);
 });
 it('adds fixtures to old saved profiles without overriding ended sessions or personal data',()=>{
  const state=member();delete state.sessions[QA];state.questions={};saveState(state);let restored=loadState(state.activeTenantId,state.fanProfile.id).state;expect(restored.sessions[QA]).toBeDefined();expect(restored.fanProfile.id).toBe(state.fanProfile.id);
  restored.sessions[QA].status='ended';expect(withCommunityHallFixture(restored).sessions[QA].status).toBe('ended');
 });
 it('rejects foreign tenant, artist and invalid room writes',()=>{
  const state=nonmember();state.sessions[event].tenantId='mfan-demo';expect(send(state,event).lastError?.code).toBe('HALL_ROOM_INVALID');expect(canReadArtistHallRoom(state,'artist-b',general)).toBe(false);
 });
 it('uses the same new collection icon on desktop and mobile without legacy brand',()=>{
  const{container}=render(<MemoryRouter><GlobalNavigation pathname="/shop"/></MemoryRouter>);for(const label of ['Điều hướng chính','Điều hướng di động'])expect(within(screen.getByRole('navigation',{name:label})).getByRole('link',{name:'VieCollect'})).toHaveAttribute('href','/shop');expect(container.querySelectorAll('[data-vw-icon=collect]')).toHaveLength(2);expect(container.textContent).not.toMatch(/VieSHOP/i);
 });
});
