import type { AppState, Question } from '../domain/types';
import { ARTIST_PROJECTS } from '../data/artistProjects';
import { isDemoSignedIn } from './account';
import { hasActiveMembership } from './merchCatalog';
import { artistForWorld } from './worldContext';

export type HallRoomAccess = 'public' | 'member';
export type HallRoomMode = 'chat' | 'qa';
export type HallRoomLifecycle = 'permanent' | 'scheduled' | 'active' | 'archived';
export interface HallRoomPolicy { access: HallRoomAccess; mode: HallRoomMode; lifecycle: HallRoomLifecycle }
export const MEMBER_QA_SESSION_ID = 'session-artist-a-qa';
/** Registry identity must survive a revoked/expired session so invalid media cannot bypass the gate. */
export const isMemberQASession = (state: AppState, sessionId: string) => state.activeTenantId === 'vieworld-demo' && sessionId === MEMBER_QA_SESSION_ID;

/** The only room-policy registry. Access, mode and lifecycle are independent. */
export function getHallRoomPolicy(state: AppState, artistId: string, roomId: string): HallRoomPolicy | undefined {
  const artist = state.worlds[artistId];
  if (artist?.tenantId !== state.activeTenantId || artist.type !== 'artist') return;
  if (roomId === `hall-${artistId}`) return { access: 'public', mode: 'chat', lifecycle: 'permanent' };
  if (roomId === `member-lounge-${artistId}`) return { access: 'member', mode: 'chat', lifecycle: 'permanent' };
  if (state.activeTenantId === 'vieworld-demo' && ARTIST_PROJECTS[artistId]?.id === roomId) return { access: 'public', mode: 'chat', lifecycle: 'active' };
  const session = state.sessions[roomId];
  if (!session || session.tenantId !== state.activeTenantId || session.rightsApproved !== true
    || session.status === 'cancelled' || ['missing', 'expired'].includes(session.mediaStatus || '')
    || artistForWorld(state, session.worldId) !== artistId) return;
  const memberQA = isMemberQASession(state, roomId);
  return {
    access: memberQA ? 'member' : 'public', mode: memberQA ? 'qa' : 'chat',
    lifecycle: session.status === 'ended' ? 'archived' : session.status === 'scheduled' ? 'scheduled' : 'active',
  };
}
export const isArtistHallRoom = (state: AppState, artistId: string, roomId: string) => Boolean(getHallRoomPolicy(state, artistId, roomId));
export const isMemberHallRoom = (state: AppState, artistId: string, roomId: string) => getHallRoomPolicy(state, artistId, roomId)?.access === 'member';
export const isPublicProjectableHallRoom = (state: AppState, artistId: string, roomId: string) => getHallRoomPolicy(state, artistId, roomId)?.access === 'public';
export function canReadArtistHallRoom(state: AppState, artistId: string, roomId: string): boolean {
  const policy = getHallRoomPolicy(state, artistId, roomId);
  return Boolean(policy && (policy.access === 'public' || hasActiveMembership(state, artistId)));
}
/** No endedAt/grace deadline exists: archived rooms remain strictly read-only. */
export function canWriteArtistHallRoom(state: AppState, artistId: string, roomId: string): boolean {
  const policy = getHallRoomPolicy(state, artistId, roomId);
  const session = state.sessions[roomId];
  return isDemoSignedIn(state) && canReadArtistHallRoom(state, artistId, roomId) && policy?.mode === 'chat'
    && policy.lifecycle !== 'archived' && !session?.isChatPaused && session?.status !== 'paused';
}
export function canSubmitArtistHallQuestion(state: AppState, artistId: string, roomId: string): boolean {
  return isDemoSignedIn(state) && canReadArtistHallRoom(state, artistId, roomId)
    && getHallRoomPolicy(state, artistId, roomId)?.mode === 'qa'
    && state.sessions[roomId]?.status === 'running' && !state.sessions[roomId]?.isChatPaused;
}
/** Pending questions belong to their author; only selected/answered questions are shared in Q&A. */
export function hallQuestions(state: AppState, artistId: string, roomId: string): Question[] {
  if (!canReadArtistHallRoom(state, artistId, roomId) || getHallRoomPolicy(state, artistId, roomId)?.mode !== 'qa') return [];
  return Object.values(state.questions).filter(q => q.tenantId === state.activeTenantId && q.sessionId === roomId
    && (q.fanId === state.fanProfile.id || ['selected', 'answered'].includes(q.status)));
}
