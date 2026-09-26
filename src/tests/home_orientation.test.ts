import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/fixtures';
import { getHomeOrientation } from '../world/homeOrientation';
import { appReducer } from '../domain/reducer';

describe('homepage orientation', () => {
  it('uses relevant live and future sessions without inventing commerce events', () => {
    const state = createInitialState();
    const home = getHomeOrientation(state);
    expect(home.now?.id).toBe('session-dropin-01');
    expect(home.now?.to).toBe('/sessions/session-dropin-01');
    expect(home.upcoming.every(item => item.at && Date.parse(item.at) >= Date.parse(state.demoTime))).toBe(true);
    expect(home.updates.every(item => item.kind === 'note' || item.kind === 'capsule')).toBe(true);
    expect(home.recent.every(item => Date.parse(item.at) <= Date.parse(state.demoTime))).toBe(true);
    expect(home.recent.some(item => item.to === '/sessions/session-dropin-01')).toBe(false);
    expect(home.upcomingAll.every(item => item.at && Date.parse(item.at) >= Date.parse(state.demoTime))).toBe(true);
  });

  it('isolates tenant content and blocks unapproved live sessions from every Home section', () => {
    const state = createInitialState();
    state.sessions['session-dropin-01'].rightsApproved = false;
    state.sessions['session-listen-01'].tenantId = 'mfan-demo';
    const home = getHomeOrientation(state);
    expect(home.now).toBeNull();
    expect([...home.upcoming, ...home.upcomingAll, ...home.recent].some(item => item.to.includes('session-listen-01') || item.to.includes('session-dropin-01'))).toBe(false);
    state.worlds['artist-a'].tenantId = 'mfan-demo';
    expect(getHomeOrientation(state).recent.some(item => item.worldId === 'artist-a')).toBe(false);
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

  it('does not mistake a saved capsule for the last visited destination', () => {
    const state = createInitialState();
    state.capsules['capsule-1'] = {
      id: 'capsule-1', tenantId: 'vieworld-demo', version: 1,
      updatedAt: state.demoTime, fanId: state.fanProfile.id,
      sessionId: 'session-dropin-01', worldId: 'artist-a',
      participationId: 'participation-1', isSaved: true,
    };
    const home = getHomeOrientation(state);
    expect(home.continueWith.to).toBe('/me');
    expect(home.updates).toHaveLength(1);
  });
  it('restores the exact last local destination and falls back to the visited world for old data', () => {
    const state=createInitialState();
    state.fanProfile.worldJourney={visitedWorldIds:['artist-a'],readNoteIds:[],lastWorldId:'artist-a',lastDestination:'/artist/artist-a?context=session%3Asession-dropin-01'};
    expect(getHomeOrientation(state).continueWith.to).toBe(state.fanProfile.worldJourney.lastDestination);
    delete state.fanProfile.worldJourney.lastDestination;
    expect(getHomeOrientation(state).continueWith.to).toBe('/artist/artist-a');
  });
  it('remembers local fan routes idempotently without letting Home or external links overwrite them', () => {
    const state=createInitialState();
    const next=appReducer(state,{type:'REMEMBER_FAN_DESTINATION',to:'/me?section=collection&type=achievement'});
    expect(getHomeOrientation(next).continueWith.to).toBe('/me?section=collection&type=achievement');
    expect(appReducer(next,{type:'REMEMBER_FAN_DESTINATION',to:'/'})).toBe(next);
    expect(appReducer(next,{type:'REMEMBER_FAN_DESTINATION',to:'//example.com'})).toBe(next);
    expect(appReducer(next,{type:'REMEMBER_FAN_DESTINATION',to:'/studio'})).toBe(next);
    expect(appReducer(next,{type:'REMEMBER_FAN_DESTINATION',to:'/me?section=collection&type=achievement'})).toBe(next);
  });
});
