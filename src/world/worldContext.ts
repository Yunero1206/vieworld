import type { Session } from '../domain/types';

export type WorldContextType = 'live' | 'event' | 'release' | 'fan_project' | 'drop';
export type WorldContextPhase = 'upcoming' | 'active' | 'ended';
export type ContextModule = 'media' | 'schedule' | 'hall' | 'participation' | 'shop';

export interface WorldContext {
  id: string;
  artistId: string;
  type: WorldContextType;
  phase: WorldContextPhase;
  title: string;
  startsAt?: string;
  hallRoomId?: string;
  archiveChapterId?: string;
  modules: ContextModule[];
}

/** Session status remains canonical; context is only its Artist Home presentation. */
export function sessionWorldContext(session: Session, artistId: string): WorldContext {
  const phase: WorldContextPhase = ['running', 'paused'].includes(session.status) ? 'active'
    : ['ended', 'cancelled'].includes(session.status) ? 'ended' : 'upcoming';
  const type: WorldContextType = session.format === 'concert' ? 'event' : 'live';
  return {
    id: session.id, artistId, type, phase, title: session.title,
    startsAt: session.scheduledStartTime, hallRoomId: session.id,
    archiveChapterId: phase === 'ended' ? session.id : undefined,
    modules: type === 'live' ? ['media', 'schedule', 'hall', 'participation'] : ['schedule', 'hall', 'participation'],
  };
}

export const sessionContextUrl = (artistId: string, sessionId: string) =>
  `/artist/${encodeURIComponent(artistId)}?context=session:${encodeURIComponent(sessionId)}`;
