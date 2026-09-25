import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { sessionContextUrl, sessionWorldContext } from '../world/worldContext';

describe('Artist Home context mode', () => {
  it('projects canonical session phase and keeps one artist-scoped URL', () => {
    const state = createInitialState();
    const live = state.sessions['session-dropin-01'];
    expect(sessionWorldContext(live, 'artist-a')).toMatchObject({
      id: live.id, artistId: 'artist-a', type: 'live', phase: 'active', hallRoomId: live.id,
    });
    expect(sessionContextUrl('artist-a', live.id)).toBe('/artist/artist-a?context=session:session-dropin-01');
    expect(sessionWorldContext({ ...live, status: 'scheduled' }, 'artist-a').phase).toBe('upcoming');
    expect(sessionWorldContext({ ...live, status: 'ended' }, 'artist-a').phase).toBe('ended');
  });

  it('uses the same Hall room for a fan project while still enforcing membership', () => {
    const state = createInitialState();
    const action = { type: 'SEND_HALL_MESSAGE' as const, worldId: 'artist-c', roomId: 'project-c-birthday', text: 'Cùng chuẩn bị nhé!', requestId: 'project-message-1' };
    const denied = appReducer(state, action);
    expect(denied.lastError?.code).toBe('HALL_MEMBERSHIP_REQUIRED');
    const memberState = appReducer(state, { type: 'UPGRADE_MEMBERSHIP', worldId: 'artist-c' });
    const sent = appReducer(memberState, action);
    expect(sent.lastError).toBeUndefined();
    const cMessages = sent.hallMessages?.['artist-c'] ?? [];
    expect(cMessages.at(-1)).toMatchObject({ sessionId: 'project-c-birthday', text: action.text });
    const afterDup = appReducer(sent, action).hallMessages?.['artist-c'] ?? [];
    expect(afterDup).toHaveLength(cMessages.length);
  });
});
