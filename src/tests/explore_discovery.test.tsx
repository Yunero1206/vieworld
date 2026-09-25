import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import type { ChatMessage } from '../domain/types';
import { ExploreView } from '../views/ExploreView';
import { ArtistWorldView } from '../views/ArtistWorldView';
import { selectPublicVoices } from '../world/exploreDiscovery';
import { selectExploreRows } from '../world/exploreRows';

describe('Explore world browser connections', () => {
  beforeEach(() => localStorage.clear());

  it('ranks only Artist Worlds and keeps programs within their owning artist', () => {
    const state = createInitialState('vieworld-demo');
    const worlds = selectExploreRows(state);
    expect(worlds.map(item => item.world_id)).toEqual(expect.arrayContaining(['artist-a', 'artist-mira', 'artist-kai']));
    expect(worlds.some(item => item.world_id === 'neon-sessions')).toBe(false);
    expect(selectExploreRows(state, 'Neon Sessions').map(item => item.world_id)).toEqual(['artist-a']);
    expect(worlds.find(item => item.world_id === 'artist-a')?.moments[1].sourceContext).toBe('neon-sessions');
  });

  it('requires both opt-in and approval for runtime Hall messages', () => {
    const state = createInitialState('vieworld-demo');
    const message: ChatMessage = { id: 'privacy-test', sessionId: 'session-dropin-01', fanId: 'fan-test', authorName: 'Fan Test', text: 'Private Hall test phrase', timestamp: state.demoTime };
    state.hallMessages = { 'artist-a': [message] };
    expect(selectPublicVoices(state, 'artist-a').some(voice => voice.id === message.id)).toBe(false);
    message.explorePreviewConsent = true;
    expect(selectPublicVoices(state, 'artist-a').some(voice => voice.id === message.id)).toBe(false);
    message.explorePreviewStatus = 'approved';
    expect(selectPublicVoices(state, 'artist-a').some(voice => voice.id === message.id)).toBe(true);
    message.isReported = true;
    expect(selectPublicVoices(state, 'artist-a').some(voice => voice.id === message.id)).toBe(false);
  });

  it('renders five featured rows, then compact rows, and opens a focused moment within its world', () => {
    render(<AppProvider><MemoryRouter initialEntries={['/explore']}><Routes>
      <Route path="/explore" element={<ExploreView />} />
      <Route path="/artist/:artistId" element={<ArtistWorldView />} />
      <Route path="/artist/:artistId/moment/:momentId" element={<ArtistWorldView />} />
    </Routes></MemoryRouter></AppProvider>);
    expect(screen.getByRole('heading', { name: /Nổi bật/ })).toBeInTheDocument();
    expect(document.querySelectorAll('.explore-featured-row')).toHaveLength(5);
    expect(document.querySelectorAll('.explore-compact-tile')).toHaveLength(2);
    expect(document.querySelectorAll('.explore-compact-grid .explore-slice')).toHaveLength(0);
    expect([...document.querySelectorAll<HTMLAnchorElement>('.explore-compact-tile')].map(link => link.getAttribute('href')))
      .toEqual(selectExploreRows(createInitialState('vieworld-demo')).slice(5).map(row => `/artist/${row.world_id}`));
    expect(screen.queryByRole('link', { name: 'Vào world của Neon Sessions' })).not.toBeInTheDocument();
    const moment = screen.getByRole('link', { name: 'Xem khoảnh khắc Concert Hà Nội' });
    expect(moment).toHaveAttribute('href', '/artist/artist-a/moment/artist-a-moment-1');
    fireEvent.click(moment);
    expect(screen.getByRole('heading', { name: 'Concert Hà Nội' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Quay lại Explore/ })).toHaveAttribute('href', '/explore');
  });

  it('has one row per Artist World, two moments each and no program row', () => {
    const rows = selectExploreRows(createInitialState('vieworld-demo'));
    expect(rows).toHaveLength(7);
    expect(new Set(rows.map(row => row.world_id)).size).toBe(rows.length);
    expect(rows.every(row => row.moments.length === 2)).toBe(true);
    expect(rows.some(row => row.world_id === 'neon-sessions')).toBe(false);
    expect(rows.filter(row => row.featured_project)).toHaveLength(1);
  });

  it('opens the account menu following shortcut as a scoped Explore view', () => {
    render(<AppProvider><MemoryRouter initialEntries={['/explore?scope=following']}><Routes>
      <Route path="/explore" element={<ExploreView />} />
    </Routes></MemoryRouter></AppProvider>);
    expect(screen.getByRole('heading', { name: /Đang theo dõi/ })).toBeInTheDocument();
    expect(document.querySelectorAll('.explore-featured-row')).toHaveLength(1);
    expect(document.querySelector('.explore-featured-row')).toHaveAttribute('data-world', 'artist-a');
    expect(screen.getByRole('link', { name: /Tất cả world/ })).toHaveAttribute('href', '/explore');
  });
});
