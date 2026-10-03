import type { AppState, Session, World } from '../domain/types';
import { isDemoSignedIn } from './account';
import { isPublicProjectableHallRoom } from './hallRooms';

export interface PlazaEvent {
  id: string;
  title: string;
  worldId: string;
  worldName: string;
  to: string;
  phase: 'active' | 'upcoming';
  statusLabel: string;
  timeLabel: string;
  related: boolean;
}

export interface PlazaState {
  primary?: PlazaEvent;
  next?: PlazaEvent;
}

const DATE = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: 'numeric',
  month: 'numeric',
});
const DAY_KEY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const TIME = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  hour: '2-digit',
  minute: '2-digit',
});

function isSameDay(left: Date, right: Date) {
  return DAY_KEY.format(left) === DAY_KEY.format(right);
}

function timeLabel(session: Session, now: Date) {
  const at = new Date(session.scheduledStartTime);
  if (!Number.isFinite(at.getTime())) return 'Xem thời gian trong world';
  return `${isSameDay(at, now) ? 'Hôm nay' : DATE.format(at)} · ${TIME.format(at)}`;
}

function isPublicSession(state: AppState, session: Session): World | undefined {
  const world = state.worlds[session.worldId];
  if (!world || world.type !== 'artist' || world.tenantId !== state.activeTenantId) return undefined;
  if (!isPublicProjectableHallRoom(state,world.id,session.id)) return undefined;
  if (session.mediaStatus === 'expired' || session.mediaStatus === 'missing') return undefined;
  return world;
}

function relatedToFan(state: AppState, session: Session) {
  return isDemoSignedIn(state) && (state.followedWorldIds.includes(session.worldId) || state.rsvpdSessionIds.includes(session.id));
}

function activeRank(session: Session) {
  if (session.status === 'running') return 0;
  if (session.status === 'open') return 1;
  return 2;
}

function activeLabel(session: Session) {
  if (session.status === 'open') return 'Sảnh đã mở';
  if (session.status === 'paused') return 'Đang tạm dừng';
  return session.segmentMode === 'live' ? 'Đang phát' : 'Đang diễn ra';
}

function toPlazaEvent(state: AppState, session: Session, world: World, phase: PlazaEvent['phase'], now: Date): PlazaEvent {
  return {
    id: session.id,
    title: session.title.replace(`${world.name}: `, ''),
    worldId: world.id,
    worldName: world.name,
    to: `/sessions/${session.id}`,
    phase,
    statusLabel: phase === 'active' ? activeLabel(session) : 'Sắp diễn ra',
    timeLabel: timeLabel(session, now),
    related: relatedToFan(state, session),
  };
}

/**
 * Plaza is a public orientation layer, not a second notification feed.
 * It deliberately selects at most one active event and one upcoming event.
 */
export function selectPlazaState(state: AppState): PlazaState {
  const now = new Date(state.demoTime);
  const sessions = Object.values(state.sessions)
    .map(session => ({ session, world: isPublicSession(state, session) }))
    .filter((entry): entry is { session: Session; world: World } => Boolean(entry.world));

  const active = sessions
    .filter(({ session }) => ['running', 'open', 'paused'].includes(session.status))
    .sort((a, b) => activeRank(a.session) - activeRank(b.session)
      || Number(relatedToFan(state, b.session)) - Number(relatedToFan(state, a.session))
      || a.session.scheduledStartTime.localeCompare(b.session.scheduledStartTime)
      || a.session.id.localeCompare(b.session.id));

  const upcoming = sessions
    .filter(({ session }) => session.status === 'scheduled' && new Date(session.scheduledStartTime).getTime() >= now.getTime())
    .sort((a, b) => Number(relatedToFan(state, b.session)) - Number(relatedToFan(state, a.session))
      || a.session.scheduledStartTime.localeCompare(b.session.scheduledStartTime)
      || a.session.id.localeCompare(b.session.id));

  if (active[0]) {
    return {
      primary: toPlazaEvent(state, active[0].session, active[0].world, 'active', now),
      next: upcoming[0] ? toPlazaEvent(state, upcoming[0].session, upcoming[0].world, 'upcoming', now) : undefined,
    };
  }

  return {
    primary: upcoming[0] ? toPlazaEvent(state, upcoming[0].session, upcoming[0].world, 'upcoming', now) : undefined,
  };
}

/** Do not randomly assign an Artist World to a guest or a fan who has not chosen one. */
export function preferredPlazaArtist(state: AppState): World | undefined {
  if (!isDemoSignedIn(state)) return undefined;
  const ids = [state.fanProfile.worldJourney?.lastWorldId, ...state.followedWorldIds].filter((id): id is string => Boolean(id));
  return ids.map(id => state.worlds[id]).find(world => world?.tenantId === state.activeTenantId && world.type === 'artist');
}
