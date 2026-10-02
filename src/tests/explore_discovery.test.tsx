import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/fixtures';
import type { ChatMessage } from '../domain/types';
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
    const message: ChatMessage = { id: 'privacy-test', sessionId: 'session-dropin-01', fanId: state.fanProfile.id, authorName: 'Fan Test', text: 'Private Hall test phrase', timestamp: state.demoTime };
    state.hallMessages = { 'artist-a': [message] };
    expect(selectPublicVoices(state, 'artist-a').some(voice => voice.id === message.id)).toBe(false);
    message.explorePreviewConsent = true;
    expect(selectPublicVoices(state, 'artist-a').some(voice => voice.id === message.id)).toBe(false);
    message.explorePreviewStatus = 'approved';
    state.fanProfile.sharing={hallPublicProjectionEnabled:true,communityPresenceEnabled:false};
    expect(selectPublicVoices(state, 'artist-a').some(voice => voice.id === message.id)).toBe(true);
    message.isReported = true;
    expect(selectPublicVoices(state, 'artist-a').some(voice => voice.id === message.id)).toBe(false);
  });



  it('has one row per Artist World, two moments each and no program row', () => {
    const rows = selectExploreRows(createInitialState('vieworld-demo'));
    expect(rows).toHaveLength(7);
    expect(new Set(rows.map(row => row.world_id)).size).toBe(rows.length);
    expect(rows.every(row => row.moments.length === 2)).toBe(true);
    expect(rows.some(row => row.world_id === 'neon-sessions')).toBe(false);
    expect(rows.filter(row => row.featured_project)).toHaveLength(2);
  });


});
