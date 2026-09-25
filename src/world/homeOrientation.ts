import type { AppState, Session } from '../domain/types';
import { ARTIST_NOTES } from './fanWorld';
import { getTruthfulSessionStatus } from './eventStatus';

export interface HomeCue {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  to: string;
  kind: 'now' | 'upcoming' | 'note' | 'capsule';
  at?: string;
}

export interface HomeActivity {
  id: string;
  category: 'moment' | 'event' | 'capsule' | 'shop';
  label: string;
  title: string;
  to: string;
  worldId?: string;
  at: string;
}

export interface HomeUpcoming extends HomeCue {
  worldId: string;
  related: boolean;
}

const sessionRoute = (session: Session) => `/sessions/${encodeURIComponent(session.id)}`;

export function getHomeOrientation(state: AppState) {
  const sessions = Object.values(state.sessions);
  const isRelevant = (session: Session) =>
    state.followedWorldIds.includes(session.worldId) || state.rsvpdSessionIds.includes(session.id);
  const relevant = sessions.filter(isRelevant);
  const live = relevant.find(session => getTruthfulSessionStatus(session, state.demoTime) === 'live');
  const open = relevant.find(session => getTruthfulSessionStatus(session, state.demoTime) === 'open');
  const active = live || open;
  const now: HomeCue | null = active ? {
    id: active.id,
    eyebrow: live ? (active.segmentMode === 'live' ? 'Đang phát trực tiếp' : 'Đang diễn ra') : 'Sảnh đã mở',
    title: active.title,
    detail: state.worlds[active.worldId]?.name || 'Moments',
    to: sessionRoute(active),
    kind: 'now',
    at: active.scheduledStartTime,
  } : null;

  const upcoming: HomeCue[] = relevant
    .filter(session => getTruthfulSessionStatus(session, state.demoTime) === 'upcoming')
    .sort((a, b) => Date.parse(a.scheduledStartTime) - Date.parse(b.scheduledStartTime))
    .slice(0, 2)
    .map(session => ({
      id: session.id,
      eyebrow: state.rsvpdSessionIds.includes(session.id) ? 'Đã nhắc lịch' : 'Sắp tới',
      title: session.title,
      detail: state.worlds[session.worldId]?.name || 'Moments',
      to: sessionRoute(session),
      kind: 'upcoming' as const,
      at: session.scheduledStartTime,
    }));

  const readNoteIds = state.fanProfile.worldJourney?.readNoteIds || [];
  const notes: HomeCue[] = ARTIST_NOTES
    .filter(note => state.followedWorldIds.includes(note.worldId)
      && Date.parse(note.publishedAt) <= Date.parse(state.demoTime)
      && !readNoteIds.includes(note.id))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 2)
    .map(note => ({
      id: note.id,
      eyebrow: 'Lời nhắn chưa xem',
      title: note.title,
      detail: note.author,
      to: `/artist/${encodeURIComponent(note.worldId)}?context=note:${encodeURIComponent(note.id)}`,
      kind: 'note' as const,
      at: note.publishedAt,
    }));

  const capsules: HomeCue[] = Object.values(state.capsules)
    .filter(capsule => capsule.fanId === state.fanProfile.id && !capsule.isSaved)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 1)
    .map(capsule => ({
      id: capsule.id,
      eyebrow: 'Kỷ niệm của bạn',
      title: state.sessions[capsule.sessionId]?.title || 'Một Moment Capsule',
      detail: 'Có một kỷ niệm đang chờ bạn giữ lại',
      to: '/me?panel=capsules',
      kind: 'capsule' as const,
      at: capsule.updatedAt,
    }));

  const updates = [...capsules, ...notes].slice(0, 3);

  const recent: HomeActivity[] = [
    ...(now ? [{
      id: `event-${now.id}`, category: 'event' as const, label: now.eyebrow,
      title: now.title, to: now.to,
      worldId: active?.worldId, at: state.demoTime,
    }] : []),
    ...ARTIST_NOTES
      .filter(note => state.followedWorldIds.includes(note.worldId)
        && Date.parse(note.publishedAt) <= Date.parse(state.demoTime))
      .map(note => ({
        id: `note-${note.id}`, category: 'moment' as const, label: 'Lời nhắn nghệ sĩ',
        title: note.title, to: `/artist/${encodeURIComponent(note.worldId)}?context=note:${encodeURIComponent(note.id)}`,
        worldId: note.worldId, at: note.publishedAt,
      })),
    ...Object.values(state.capsules)
      .filter(capsule => capsule.fanId === state.fanProfile.id)
      .map(capsule => ({
        id: `capsule-${capsule.id}`, category: 'capsule' as const, label: 'Capsule của bạn',
        title: state.sessions[capsule.sessionId]?.title || 'Một kỷ niệm đã giữ',
        to: '/me?panel=capsules', worldId: capsule.worldId, at: capsule.updatedAt,
      })),
    ...Object.values(state.products)
      .filter(product => product.tenantId === state.activeTenantId
        && state.followedWorldIds.includes(product.worldId)
        && product.isAvailable && product.stockCount > 0 && !product.previewOnly
        && !product.requiredBenefitId && Date.parse(product.updatedAt) <= Date.parse(state.demoTime))
      .slice(0, 1)
      .map(product => ({
        id: `product-${product.id}`, category: 'shop' as const, label: 'Đang có ở VieSHOP',
        title: product.title, to: `/shop?product=${encodeURIComponent(product.id)}`,
        worldId: product.worldId, at: product.updatedAt,
      })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 8);

  const upcomingAll: HomeUpcoming[] = sessions
    .filter(session => session.tenantId === state.activeTenantId
      && session.rightsApproved !== false
      && getTruthfulSessionStatus(session, state.demoTime) === 'upcoming')
    .sort((a, b) => Date.parse(a.scheduledStartTime) - Date.parse(b.scheduledStartTime))
    .slice(0, 3)
    .map(session => ({
      id: session.id, eyebrow: state.rsvpdSessionIds.includes(session.id) ? 'Đã nhắc lịch' : 'Sắp tới',
      title: session.title, detail: state.worlds[session.worldId]?.name || 'Moments',
      to: sessionRoute(session), kind: 'upcoming' as const, at: session.scheduledStartTime,
      worldId: session.worldId, related: isRelevant(session),
    }));
  const savedCapsule = Object.values(state.capsules)
    .filter(capsule => capsule.fanId === state.fanProfile.id && capsule.isSaved)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
  const lastWorldId = state.fanProfile.worldJourney?.lastWorldId;
  const lastWorld = lastWorldId && state.worlds[lastWorldId];
  const continueWith = savedCapsule ? {
    visual: 'capsule' as const,
    worldId: savedCapsule.worldId,
    title: state.sessions[savedCapsule.sessionId]?.title || 'Moment Capsule của bạn',
    detail: 'Kỷ niệm bạn đã giữ lại',
    to: '/me?panel=capsules',
    action: 'Mở kỷ niệm',
  } : lastWorld ? {
    visual: 'world' as const,
    worldId: lastWorld.id,
    title: `Trở lại với ${lastWorld.name}`,
    detail: 'Một nơi bạn đã ghé',
    to: lastWorld.type === 'artist' ? `/artist/${encodeURIComponent(lastWorld.id)}` : '/explore',
    action: 'Ghé lại',
  } : {
    visual: 'space' as const,
    title: 'Một góc của riêng bạn',
    detail: 'Những điều bạn chọn giữ và trưng bày',
    to: '/me',
    action: 'Mở My Space',
  };

  return { now, upcoming, updates, recent, upcomingAll, continueWith };
}
