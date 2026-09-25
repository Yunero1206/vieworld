import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/fixtures';
import { getHomeOrientation } from '../world/homeOrientation';

describe('homepage orientation', () => {
  it('uses relevant live and future sessions without inventing commerce events', () => {
    const state = createInitialState();
    const home = getHomeOrientation(state);
    expect(home.now?.id).toBe('session-dropin-01');
    expect(home.now?.to).toBe('/sessions/session-dropin-01');
    expect(home.upcoming.every(item => item.at && Date.parse(item.at) >= Date.parse(state.demoTime))).toBe(true);
    expect(home.updates.every(item => item.kind === 'note' || item.kind === 'capsule')).toBe(true);
    expect(home.recent.every(item => Date.parse(item.at) <= Date.parse(state.demoTime))).toBe(true);
    expect(home.recent.some(item => item.to === '/sessions/session-dropin-01')).toBe(true);
    expect(home.upcomingAll.every(item => item.at && Date.parse(item.at) >= Date.parse(state.demoTime))).toBe(true);
  });

  it('allows a genuinely quiet and caught-up state', () => {
    const state = createInitialState();
    state.sessions = {};
    state.followedWorldIds = [];
    state.capsules = {};
    const home = getHomeOrientation(state);
    expect(home.now).toBeNull();
    expect(home.upcoming).toHaveLength(0);
    expect(home.updates).toHaveLength(0);
    expect(home.recent).toHaveLength(0);
    expect(home.upcomingAll).toHaveLength(0);
    expect(home.continueWith.to).toBe('/me');
  });

  it('offers a saved personal capsule as the return destination', () => {
    const state = createInitialState();
    state.capsules['capsule-1'] = {
      id: 'capsule-1', tenantId: 'vieworld-demo', version: 1,
      updatedAt: state.demoTime, fanId: state.fanProfile.id,
      sessionId: 'session-dropin-01', worldId: 'artist-a',
      participationId: 'participation-1', isSaved: true,
    };
    const home = getHomeOrientation(state);
    expect(home.continueWith.to).toBe('/me?panel=capsules');
    expect(home.updates).toHaveLength(1);
  });
});
