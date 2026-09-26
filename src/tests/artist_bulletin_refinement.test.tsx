import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { selectPublicVoices } from '../world/exploreDiscovery';
import { artistArchiveChapters } from '../world/artistArchive';
import { getWorldMoments } from '../world/exploreRows';
import { artistRooms, hallEntries } from '../world/artistPresentation';
import { DesktopNotificationBoard } from '../components/notifications/DesktopNotificationBoard';
import { AppProvider } from '../context/AppContext';
import { ArtistHall } from '../views/ArtistHall';
import { ArtistWorldView } from '../views/ArtistWorldView';

describe('Artist tabs and bulletin refinement',()=>{
  beforeEach(()=>localStorage.clear());
  it('renders a content-sized board, not a standee background',()=>{
    const read=vi.fn(); const {container}=render(<DesktopNotificationBoard notifications={[{id:'n',type:'system',categoryLabel:'VieWorld',categoryDotColor:'#365c42',title:'Một lời nhắc',read:false,timeAgo:'Hôm nay'}]} onSelectNotification={vi.fn()} onViewAll={vi.fn()} onMarkAllAsRead={read}/>);
    expect(container.querySelector('img[src*="standee"]')).toBeNull();
    expect(screen.getByRole('heading',{name:'Bảng thông báo'})).toBeVisible();
    fireEvent.click(screen.getByRole('button',{name:'Đánh dấu đã đọc'}));expect(read).toHaveBeenCalledOnce();
  });
  it('resolves live, project and general rooms without duplicating an IP world',()=>{
    const state=createInitialState('vieworld-demo');const rooms=artistRooms(state,'artist-a');
    expect(rooms.some(room=>room.id==='session-listen-01')).toBe(true);
    expect(rooms.some(room=>room.id==='project-a-birthday')).toBe(true);
    expect(rooms.every(room=>!room.session || room.session.worldId==='artist-a' || state.worlds[room.session.worldId]?.type==='ip')).toBe(true);
    expect(new Set(rooms.map(room=>room.id)).size).toBe(rooms.length);
    state.sessions['session-dropin-01'].status='ended';
    expect(artistRooms(state,'artist-a','session-dropin-01').some(room=>room.id==='session-dropin-01')).toBe(true);
  });
  it('stores replies and public Moment references once and rejects cross-room/artist references',()=>{
    const state=createInitialState('vieworld-demo');const parent=hallEntries(state,'artist-a','session-dropin-01')[0];
    const action={type:'SEND_HALL_MESSAGE' as const,worldId:'artist-a',roomId:'session-dropin-01',text:'Cùng nghe lại nhé',requestId:'reply',replyToId:parent.id,momentIds:['artist-a-moment-1']};
    const next=appReducer(state,action);
    expect(next.hallMessages?.['artist-a'].at(-1)).toMatchObject({replyToId:parent.id,momentIds:['artist-a-moment-1']});
    expect(appReducer(next,action)).toBe(next);
    expect(appReducer(state,{...action,momentIds:['artist-b-moment-1']})).toBe(state);
    expect(appReducer(state,{...action,roomId:'hall-artist-a'})).toBe(state);
    expect(selectPublicVoices(next,'artist-a').some(voice=>voice.id==='reply')).toBe(false);
  });
  it('toggles reactions only for valid rooms and active members',()=>{
    const state=createInitialState('vieworld-demo');const id=hallEntries(state,'artist-a','session-dropin-01')[0].id;
    const action={type:'TOGGLE_HALL_REACTION' as const,worldId:'artist-a',roomId:'session-dropin-01',messageId:id};
    const next=appReducer(state,action);expect(next.hallReactions?.['artist-a'][id]).toEqual([state.fanProfile.id]);
    expect(appReducer(next,action).hallReactions?.['artist-a'][id]).toEqual([]);
    const visitor={...state,memberships:{}};expect(appReducer(visitor,action)).toBe(visitor);
    expect(appReducer(state,{...action,roomId:'hall-artist-a'})).toBe(state);
    const foreign={...state,memberships:Object.fromEntries(Object.entries(state.memberships).map(([key,value])=>[key,{...value,tenantId:'mfan-demo' as const}]))};
    expect(appReducer(foreign,action)).toBe(foreign);
  });
  it('keeps letters private, idempotent and separate from Hall',()=>{
    const state=createInitialState('vieworld-demo');const action={type:'SEND_ARTIST_LETTER' as const,worldId:'artist-a',text:'Một lời cảm ơn',requestId:'letter'};
    const next=appReducer(state,action);expect(next.artistLetters).toHaveLength(1);
    expect(appReducer(next,action)).toBe(next);expect(next.hallMessages).toEqual(state.hallMessages);
    expect(selectPublicVoices(next,'artist-a')).toEqual(selectPublicVoices(state,'artist-a'));
    const visitor={...state,memberships:{}};expect(appReducer(visitor,action)).toBe(visitor);
  });
  it('groups Moments in chapters instead of turning each Moment into a chapter',()=>{
    const state=createInitialState('vieworld-demo');const moments=getWorldMoments('artist-a');
    const chapters=artistArchiveChapters(state,'artist-a',moments,Object.values(state.sessions).filter(session=>session.worldId==='artist-a'));
    const ids=chapters.flatMap(chapter=>chapter.momentIds);
    expect(ids).toHaveLength(moments.length);expect(new Set(ids).size).toBe(ids.length);
    expect(chapters.filter(chapter=>chapter.momentIds.length).length).toBeLessThan(moments.length);
    expect(chapters.some(chapter=>chapter.year===2024)).toBe(true);
  });
  it('exposes working reply, emoji, Moment picker, poll and private-letter controls',()=>{
    const state=createInitialState('vieworld-demo');render(<AppProvider><MemoryRouter><ArtistHall artistId="artist-a" name="Artist A" sessions={Object.values(state.sessions).filter(session=>session.worldId==='artist-a')}/></MemoryRouter></AppProvider>);
    const log=screen.getByRole('log',{name:'Tin nhắn trong Hall'});fireEvent.click(within(log).getAllByRole('button',{name:'Trả lời'})[0]);expect(screen.getByRole('button',{name:'Hủy trả lời'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Thêm biểu cảm'}));fireEvent.click(screen.getByRole('button',{name:'Thêm 💙'}));expect(screen.getByRole('textbox',{name:'Gửi lời nhắn trong Hall'})).toHaveValue('💙');
    fireEvent.click(screen.getByRole('button',{name:'Chia sẻ khoảnh khắc'}));expect(screen.getByText('Chọn tối đa 3 khoảnh khắc công khai.')).toBeInTheDocument();
    expect(screen.getByText('Mỗi người một lựa chọn.')).toBeInTheDocument();expect(screen.getByText('Demo lưu riêng trên thiết bị; chưa gửi đến artist/team.')).toBeInTheDocument();
  });
  it('returns from Moment Focus to the open Archive chapter and keeps secondary filters usable',()=>{
    const {container}=render(<AppProvider><MemoryRouter initialEntries={['/artist/artist-a/archive']}><Routes>
      <Route path="/artist/:artistId/archive" element={<ArtistWorldView/>}/>
      <Route path="/artist/:artistId/moment/:momentId" element={<ArtistWorldView/>}/>
    </Routes></MemoryRouter></AppProvider>);
    fireEvent.click(screen.getByRole('heading',{name:'Concert Hà Nội 2026'}));
    expect(container.querySelector('.artist-chapter[open]')).not.toBeNull();
    fireEvent.click(screen.getByRole('link',{name:'Concert Hà Nội'}));
    fireEvent.click(screen.getByRole('link',{name:'Quay lại world'}));
    expect(container.querySelector('.artist-chapter[open]')).not.toBeNull();
    fireEvent.click(screen.getByRole('button',{name:'Era'}));
    expect(screen.queryByRole('heading',{name:'Concert Hà Nội 2026'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Xem tất cả'}));
    expect(container.querySelectorAll('.artist-archive-recent a').length).toBeGreaterThan(3);
  });
});
