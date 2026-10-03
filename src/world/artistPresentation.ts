import type { AppState, ChatMessage, Session } from '../domain/types';
import { getWorldMoments, getWorldProject, type ExploreMedia } from './exploreRows';
import { getArtistCover } from './artistVisuals';
import { selectPublicVoices } from './exploreDiscovery';
import { canReadArtistHallRoom, getHallRoomPolicy, type HallRoomPolicy } from './hallRooms';
export { isArtistHallRoom, canWriteArtistHallRoom } from './hallRooms';

export function contextMedia(artistId: string, session?: Session): ExploreMedia {
  if (artistId === 'artist-a' && session?.id === 'session-dropin-01') {
    return { src: `${import.meta.env.BASE_URL}images/merch-studio/artist-a-dropin.webp` };
  }
  if (artistId === 'artist-a' && session?.id === 'session-a-album-drop') {
    return { src: `${import.meta.env.BASE_URL}images/merch-studio/artist-a-album-launch.webp` };
  }
  const moments = getWorldMoments(artistId);
  const studio = session?.format === 'listening' || /album|thu âm|bản thu/i.test(session?.title || '');
  return moments[studio ? 1 : 0]?.media || { src: getArtistCover(artistId) };
}
export interface ArtistRoom extends HallRoomPolicy { id: string; title: string; description: string; media: ExploreMedia; kind: 'live' | 'event' | 'project' | 'general' | 'member'; session?: Session }
export function artistRooms(state: AppState, artistId: string, selectedRoomId?: string): ArtistRoom[] {
  if (!getHallRoomPolicy(state, artistId, `hall-${artistId}`)) return [];
  const name = state.worlds[artistId]?.name || '';
  const sessions = Object.values(state.sessions).filter(session => getHallRoomPolicy(state,artistId,session.id)
    && (['running','open','paused'].includes(session.status) || (session.status === 'scheduled' && session.scheduledStartTime >= state.demoTime) || (session.id === selectedRoomId && session.status==='ended')));
  const project = state.activeTenantId === 'vieworld-demo' ? getWorldProject(artistId) : undefined;
  const rooms: ArtistRoom[] = [{ id: `hall-${artistId}`, title: 'Phòng chung', description: `Chuyện thường ngày cùng fan của ${name}`, media: contextMedia(artistId), kind: 'general', ...getHallRoomPolicy(state,artistId,`hall-${artistId}`)! },
    ...sessions.map(session => ({ id: session.id, title: session.title.replace(`${name}: `,''),
    description: getHallRoomPolicy(state,artistId,session.id)?.mode==='qa' ? 'Gửi câu hỏi khi phiên đang mở.' : session.status === 'running' ? 'Cùng xem, cùng bàn luận' : session.status === 'ended' ? 'Những câu chuyện sau khi hoạt động khép lại' : 'Chuyện trước, trong và sau sự kiện',
    media: contextMedia(artistId,session), kind: (session.status === 'running' ? 'live' : 'event') as ArtistRoom['kind'], session, ...getHallRoomPolicy(state,artistId,session.id)! })),
    ...(project ? [{ id: project.id, title: project.title, description: 'Cùng chuẩn bị một điều đặc biệt', media: contextMedia(artistId), kind: 'project' as const, ...getHallRoomPolicy(state,artistId,project.id)! }] : []),
    { id: `member-lounge-${artistId}`, title: 'Member Lounge', description: 'Một góc nhỏ hơn dành cho hội viên.', media: contextMedia(artistId), kind: 'member', ...getHallRoomPolicy(state,artistId,`member-lounge-${artistId}`)! }];
  const rank=(room:ArtistRoom)=>room.kind==='general'?0:room.access==='public'?(room.lifecycle==='scheduled'?2:1):room.kind==='member'?3:4;
  return rooms.sort((a,b)=>rank(a)-rank(b)||(a.session?.scheduledStartTime||'').localeCompare(b.session?.scheduledStartTime||''));
}
/** Same canonical room as Context Mode; demo excerpts remain visibly illustrative. */
export function hallEntries(state: AppState, artistId: string, roomId: string): ChatMessage[] {
  if (!canReadArtistHallRoom(state,artistId,roomId) || getHallRoomPolicy(state,artistId,roomId)?.mode !== 'chat') return [];
  const messages = (state.hallMessages?.[artistId] || []).filter(message => message.sessionId === roomId && !message.isReported);
  const fixtures = selectPublicVoices(state,artistId,roomId).filter(voice => voice.isDemo && !messages.some(message=>message.id===voice.id))
    .map(voice => ({ id: voice.id, sessionId: roomId, fanId: `demo-${voice.id}`, authorName: voice.author, text: voice.text, timestamp: '', isSample: true }));
  return [...fixtures, ...messages];
}
