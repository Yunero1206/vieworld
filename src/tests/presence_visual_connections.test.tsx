import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import type { AppState, ChatMessage } from '../domain/types';
import { freshGuestState } from '../world/account';
import { selectHomePresence } from '../world/presenceDiscovery';
import { canProjectHallVoice, publicVoiceHallUrl, selectPublicVoices } from '../world/exploreDiscovery';
import { artistRooms, hallEntries, isArtistHallRoom } from '../world/artistPresentation';
import { ROOM_SURFACE_BOUNDS } from '../world/roomComposition';
import { WorldPlazaView } from '../views/WorldPlazaView';
import { ArtistHall } from '../views/ArtistHall';
import { SearchCombobox } from '../components/SearchCombobox';

const initial = () => createInitialState('vieworld-demo');
const message = (state: AppState, id: string, room = 'session-dropin-01'): ChatMessage => ({
  id, sessionId: room, fanId: state.fanProfile.id, authorName: 'Fan đã đồng ý', text: `Lời nhắn ${id}`,
  timestamp: state.demoTime, explorePreviewConsent: true, explorePreviewStatus: 'approved', exploreSelectedBy: 'artist',
});
beforeEach(() => { localStorage.clear(); window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }); });
afterEach(cleanup);

describe('Canonical visual connections without fabricated presence', () => {
  it('shows at most three voices, all about the selected current context', () => {
    const state = initial(); const home = selectHomePresence(state);
    expect(home.voices).toHaveLength(3);
    expect(home.voices.every(v => v.worldId === home.now?.artistId && v.sourceContextId === home.now?.id)).toBe(true);
  });
  it('does not fill a quiet Home with unrelated Hall excerpts', () => {
    const state = initial(); state.sessions = {}; state.activeTenantId = 'mfan-demo';
    expect(selectHomePresence(state).voices).toEqual([]);
  });
  it('filters the source room before applying the public excerpt limit', () => {
    const state = initial(); state.fanProfile.sharing = { communityPresenceEnabled: false, hallPublicProjectionEnabled: true };
    state.hallMessages = { 'artist-a': [message(state,'elsewhere-1','hall-artist-a'),message(state,'elsewhere-2','hall-artist-a'),message(state,'here')] };
    const home = selectHomePresence(state);
    expect(home.voices.some(v => v.id === 'here')).toBe(true);
    expect(home.voices.some(v => v.id.startsWith('elsewhere'))).toBe(false);
  });
  it('withdrawn, reported and unapproved messages never appear as bubbles', () => {
    const state = initial(); state.fanProfile.sharing = { communityPresenceEnabled: false, hallPublicProjectionEnabled: true };
    state.hallMessages = { 'artist-a': [
      {...message(state,'private'),explorePreviewConsent:false},
      {...message(state,'reported'),isReported:true},
      {...message(state,'pending'),explorePreviewStatus:'pending'},
    ] };
    expect(selectHomePresence(state).voices.some(v => ['private','reported','pending'].includes(v.id))).toBe(false);
  });
  it('an anonymous visitor cannot project a retained account message', () => {
    const state = freshGuestState(initial()); state.fanProfile.sharing = { communityPresenceEnabled: true, hallPublicProjectionEnabled: true };
    const privateMessage = message(state,'retained'); state.hallMessages = {'artist-a':[privateMessage]};
    expect(canProjectHallVoice(state,'artist-a',privateMessage)).toBe(false);
    expect(selectPublicVoices(state,'artist-a').some(v => v.id === privateMessage.id)).toBe(false);
  });
  it('editorial fixture voices cannot escape the active tenant', () => {
    const state = initial(); state.worlds['artist-a'].tenantId = 'mfan-demo';
    expect(selectPublicVoices(state,'artist-a')).toEqual([]);
  });
  it('renders anonymous decorative bench art with no fake online count or fan identity', () => {
    render(<AppProvider initialState={freshGuestState(initial())}><MemoryRouter><WorldPlazaView/></MemoryRouter></AppProvider>);
    const bench = document.querySelector('.presence-home-bench');
    expect(bench).toHaveAttribute('aria-hidden','true'); expect(bench).toHaveAttribute('alt','');
    expect(screen.getByText(/Fan minh họa/)).toBeVisible(); expect(screen.queryByText('Linh Nguyễn')).toBeNull();
    expect(screen.queryByText(/đang online/i)).toBeNull();
    expect(document.querySelector('.presence-home-bubbles .avatar-renderer')).toBeNull();
  });
  it('bubble destinations carry the actual room and source message', () => {
    const state = initial(); const voice = selectHomePresence(state).voices[0];
    const url = new URL(publicVoiceHallUrl(voice),'https://example.test');
    expect(url.pathname).toBe(`/artist/${voice.worldId}/hall`); expect(url.searchParams.get('room')).toBe(voice.sourceContextId);
    expect(url.searchParams.get('message')).toBe(voice.id);
  });
  it('keeps a source excerpt available in its room even when other rooms have approved messages', () => {
    const state = initial(); state.fanProfile.sharing = { communityPresenceEnabled: false, hallPublicProjectionEnabled: true };
    state.hallMessages = {'artist-a':[message(state,'one','hall-artist-a'),message(state,'two','hall-artist-a')]};
    expect(hallEntries(state,'artist-a','session-dropin-01').some(m => m.id === 'voice-a-3')).toBe(true);
  });
  it('does not duplicate an approved sample message as both a fixture and runtime entry', () => {
    const state = initial(); state.fanProfile.sharing = { communityPresenceEnabled: false, hallPublicProjectionEnabled: true };
    state.hallMessages = {'artist-a':[{...message(state,'sample'),isSample:true}]};
    expect(hallEntries(state,'artist-a','session-dropin-01').filter(m => m.id === 'sample')).toHaveLength(1);
  });
  it('highlights the requested source in Hall without removing the membership gate', () => {
    const state = initial();
    const {unmount} = render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/artist/artist-a/hall?room=session-dropin-01&message=voice-a-2']}><ArtistHall artistId="artist-a" name="Artist A" sessions={[]}/></MemoryRouter></AppProvider>);
    expect(screen.getByLabelText('Lời nhắn được mở từ cộng đồng')).toHaveTextContent('@luna');
    unmount(); state.memberships = {};
    render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/artist/artist-a/hall?room=session-dropin-01&message=voice-a-2']}><ArtistHall artistId="artist-a" name="Artist A" sessions={[]}/></MemoryRouter></AppProvider>);
    expect(screen.queryByRole('log')).toBeNull();
  });
  it('does not admit a Hall session whose content rights are unknown', () => {
    const state = initial(); delete state.sessions['session-dropin-01'].rightsApproved;
    expect(artistRooms(state,'artist-a').some(r => r.id === 'session-dropin-01')).toBe(false);
    expect(isArtistHallRoom(state,'artist-a','session-dropin-01')).toBe(false);
  });
  it('opens the parent thread when a selected public voice is a reply', () => {
    const state=initial();
    state.hallMessages={'artist-a':[message(state,'parent'),{...message(state,'reply'),replyToId:'parent'}]};
    render(<AppProvider initialState={state}><MemoryRouter initialEntries={['/artist/artist-a/hall?room=session-dropin-01&message=reply']}><ArtistHall artistId="artist-a" name="Artist A" sessions={[]}/></MemoryRouter></AppProvider>);
    expect(screen.getByLabelText('Lời nhắn được mở từ cộng đồng')).toHaveTextContent('Lời nhắn parent');
    expect(document.querySelector('.presence-thread .presence-hall-source')).toHaveTextContent('Lời nhắn reply');
  });
  it('places the music surface on the actual console, wholly inside the room canvas', () => {
    const b = ROOM_SURFACE_BOUNDS.disc;
    expect(b.x).toBeGreaterThanOrEqual(70); expect(b.x+b.width).toBeLessThanOrEqual(94);
    expect(b.y).toBeLessThan(50);
  });
  it('grouped search remains manual and keyboard accessible', () => {
    const choose = vi.fn();
    render(<SearchCombobox value="mira" onChange={vi.fn()} onSelect={choose} label="Tìm trong Explore" placeholder="Tìm" groups={[{id:'artist',label:'Nghệ sĩ'},{id:'activity',label:'Hoạt động'}]} suggestions={[
      {id:'mira',label:'MIRA',context:'Artist World',group:'artist'},
      {id:'live',label:'MIRA Live',context:'Sắp tới',group:'activity'},
    ]}/>);
    const input = screen.getByRole('combobox'); fireEvent.focus(input);
    expect(within(screen.getByRole('group',{name:'Nghệ sĩ'})).getAllByRole('option')).toHaveLength(1);
    expect(choose).not.toHaveBeenCalled(); fireEvent.keyDown(input,{key:'ArrowDown'});
    expect(input).toHaveAttribute('aria-activedescendant'); fireEvent.keyDown(input,{key:'Enter'});
    expect(choose).toHaveBeenCalledWith(expect.objectContaining({id:'mira'}));
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
