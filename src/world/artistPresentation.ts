import type { AppState, ChatMessage, Session } from '../domain/types';
import { getWorldMoments, getWorldProject, type ExploreMedia } from './exploreRows';
import { getArtistCover } from './artistVisuals';
import { selectPublicVoices } from './exploreDiscovery';

export function contextMedia(artistId: string, session?: Session): ExploreMedia {
  const moments = getWorldMoments(artistId);
  const studio = session?.format === 'listening' || /album|thu âm|bản thu/i.test(session?.title || '');
  return moments[studio ? 1 : 0]?.media || { src: getArtistCover(artistId) };
}
export interface ArtistRoom { id: string; title: string; description: string; media: ExploreMedia; kind: 'live' | 'event' | 'project' | 'general'; session?: Session }
export function isArtistHallRoom(state: AppState, artistId: string, roomId: string): boolean {
  if (state.worlds[artistId]?.tenantId !== state.activeTenantId || state.worlds[artistId]?.type !== 'artist') return false;
  if (roomId === `hall-${artistId}`) return true;
  if (state.activeTenantId === 'vieworld-demo' && getWorldProject(artistId)?.id === roomId) return true;
  const session = state.sessions[roomId];
  return Boolean(session && session.tenantId === state.activeTenantId && session.rightsApproved !== false
    && (session.worldId === artistId || (state.worlds[session.worldId]?.type === 'ip' && state.worlds[session.worldId]?.linkedWorldIds.includes(artistId))));
}
export function artistRooms(state: AppState, artistId: string, selectedRoomId?: string): ArtistRoom[] {
  const name = state.worlds[artistId]?.name || '';
  const sessions = Object.values(state.sessions).filter(session => session.tenantId === state.activeTenantId && session.rightsApproved !== false
    && (session.worldId === artistId || (state.worlds[session.worldId]?.type === 'ip' && state.worlds[session.worldId]?.linkedWorldIds.includes(artistId)))
    && (['running','open'].includes(session.status) || (session.status === 'scheduled' && session.scheduledStartTime >= state.demoTime) || (session.id === selectedRoomId && ['ended','paused'].includes(session.status))))
    .sort((a,b) => Number(b.status === 'running') - Number(a.status === 'running'));
  const project = state.activeTenantId === 'vieworld-demo' ? getWorldProject(artistId) : undefined;
  return [...sessions.map(session => ({ id: session.id, title: session.title.replace(`${name}: `,''),
    description: session.status === 'running' ? 'Cùng xem, cùng bàn luận' : session.status === 'ended' ? 'Những câu chuyện sau khi hoạt động khép lại' : 'Chuyện trước, trong và sau sự kiện',
    media: contextMedia(artistId,session), kind: (session.status === 'running' ? 'live' : 'event') as ArtistRoom['kind'], session })),
    ...(project ? [{ id: project.id, title: project.title, description: 'Cùng chuẩn bị một điều đặc biệt', media: contextMedia(artistId), kind: 'project' as const }] : []),
    { id: `hall-${artistId}`, title: 'Phòng chung', description: `Chuyện thường ngày cùng fan của ${name}`, media: contextMedia(artistId), kind: 'general' as const }];
}
/** Same canonical room as Context Mode; demo excerpts remain visibly illustrative. */
export function hallEntries(state: AppState, artistId: string, roomId: string): ChatMessage[] {
  const fixtures = selectPublicVoices(state,artistId).filter(voice => voice.isDemo && voice.sourceContextId === roomId)
    .map(voice => ({ id: voice.id, sessionId: roomId, fanId: `demo-${voice.id}`, authorName: voice.author, text: voice.text, timestamp: '', isSample: true }));
  return [...fixtures, ...(state.hallMessages?.[artistId] || []).filter(message => message.sessionId === roomId && !message.isReported)];
}
