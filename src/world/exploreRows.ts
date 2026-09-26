import type { AppState } from '../domain/types';
import { matchesVietnameseQuery } from '../utils/textSearch';
import { selectPublicVoices, type PublicVoice } from './exploreDiscovery';
import aConcert from '../assets/home/concert-night.png';
import aStudio from '../assets/home/neon-cover.jpg';
import miraCover from '../assets/home/mira-cover.jpg';
import kaiCover from '../assets/home/kai-cover.jpg';
import bTriptych from '../assets/explore-demo/artist-b-triptych.jpg';
import cTriptych from '../assets/explore-demo/artist-c-triptych.jpg';
import dTriptych from '../assets/explore-demo/artist-d-triptych.jpg';
import eTriptych from '../assets/explore-demo/artist-e-triptych.jpg';

export interface ExploreMedia { src: string; panel?: 0 | 1 | 2 }
export interface ExploreMoment {
  id: string;
  worldId: string;
  title: string;
  media: ExploreMedia;
  kind: 'image' | 'video';
  sourceContext: string;
  targetUrl: string;
  freshness: number;
  isDemo: boolean;
}
export interface ExploreProject { id: string; worldId: string; title: string; targetUrl: string; isDemo: boolean }
export interface ExploreWorldRow {
  world_id: string;
  artist_name: string;
  avatar: ExploreMedia;
  moments: [ExploreMoment, ExploreMoment];
  public_fan_voices: PublicVoice[];
  featured_project?: ExploreProject;
  display_mode: 'featured' | 'compact';
}

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const mediaByWorld: Record<string, { avatar: ExploreMedia; moments: [ExploreMedia, ExploreMedia]; titles: [string, string]; kinds?: ['image' | 'video', 'image' | 'video']; freshness: number }> = {
  'artist-a': { avatar: { src: publicAsset('images/characters-v4/avatar-artist-a.webp') }, moments: [{ src: aConcert }, { src: aStudio }], titles: ['Concert Hà Nội', 'Soundcheck · Neon Sessions'], freshness: 100 },
  'artist-mira': { avatar: { src: publicAsset('images/characters-v4/avatar-artist-mira.webp') }, moments: [{ src: miraCover }, { src: publicAsset('images/merch-v2/mira-vinyl-physical.png') }], titles: ['Một tối cùng MIRA', 'Kỷ niệm · Luna'], freshness: 90 },
  'artist-kai': { avatar: { src: publicAsset('images/characters-v4/avatar-artist-kai.webp') }, moments: [{ src: kaiCover }, { src: publicAsset('images/merch-v2/kai-cassette-physical.png') }], titles: ['Nhịp đêm của KAI', 'Kỷ niệm · Pulse'], freshness: 80 },
  'artist-b': { avatar: { src: bTriptych, panel: 0 }, moments: [{ src: bTriptych, panel: 1 }, { src: bTriptych, panel: 2 }], titles: ['B · Live ở sân khấu nhỏ', 'B · Trước giờ diễn'], freshness: 50 },
  'artist-c': { avatar: { src: cTriptych, panel: 0 }, moments: [{ src: cTriptych, panel: 1 }, { src: cTriptych, panel: 2 }], titles: ['C · Đêm ánh tím', 'C · Sau cánh gà'], freshness: 65 },
  'artist-d': { avatar: { src: dTriptych, panel: 0 }, moments: [{ src: dTriptych, panel: 1 }, { src: dTriptych, panel: 2 }], titles: ['D · Buổi diễn acoustic', 'D · Một chiều tập nhạc'], freshness: 50 },
  'artist-e': { avatar: { src: eTriptych, panel: 0 }, moments: [{ src: eTriptych, panel: 1 }, { src: eTriptych, panel: 2 }], titles: ['E · Tín hiệu mới', 'E · Trong phòng thu'], freshness: 50 },
};

const projects: Record<string, { id: string; title: string }> = {
  'artist-a': { id: 'project-a-birthday', title: 'Gửi lời chúc đến Artist A' },
  'artist-c': { id: 'project-c-birthday', title: 'Birthday Project đang mở' },
};

// Extended moments catalog ensuring 45-60 total moments across worlds
interface ExtendedMomentDef {
  id: string;
  worldId: string;
  title: string;
  panel?: 0 | 1 | 2;
  src?: string;
  kind?: 'image' | 'video';
  sourceContext?: string;
  freshness?: number;
}

const EXTENDED_MOMENT_DEFS: ExtendedMomentDef[] = [
  // Artist A (11 moments)
  { id: 'artist-a-moment-3', worldId: 'artist-a', title: 'Hậu trường tập nhảy Midnight Neon', src: aStudio, kind: 'video' },
  { id: 'artist-a-moment-4', worldId: 'artist-a', title: 'Buổi giao lưu ký tặng Hà Nội', src: aConcert, kind: 'image' },
  { id: 'artist-a-moment-5', worldId: 'artist-a', title: 'Thu âm đĩa đơn First Notes', src: aStudio, kind: 'video' },
  { id: 'artist-a-moment-6', worldId: 'artist-a', title: 'Countdown giao thừa cùng fan', src: aConcert, kind: 'image' },
  { id: 'artist-a-moment-7', worldId: 'artist-a', title: 'Thử trang phục Star Club', src: aStudio, kind: 'image' },
  { id: 'artist-a-moment-8', worldId: 'artist-a', title: 'Banner concert tại Mỹ Đình', src: aConcert, kind: 'image' },
  { id: 'artist-a-moment-9', worldId: 'artist-a', title: 'Đêm diễn acoustic dưới mưa', src: aConcert, kind: 'video' },
  { id: 'artist-a-moment-10', worldId: 'artist-a', title: 'Lời cảm ơn sau tour Hà Nội', src: aStudio, kind: 'image' },
  { id: 'artist-a-moment-11', worldId: 'artist-a', title: 'Kỷ niệm 1 năm fandom Star Club', src: aConcert, kind: 'image' },

  // Artist D (11 moments)
  { id: 'artist-d-moment-3', worldId: 'artist-d', title: 'First Live House 2024', src: dTriptych, panel: 1, kind: 'image' },
  { id: 'artist-d-moment-4', worldId: 'artist-d', title: 'Bản nháp guitar bên bờ hồ', src: dTriptych, panel: 2, kind: 'video' },
  { id: 'artist-d-moment-5', worldId: 'artist-d', title: 'Bangkok Acoustic Cafe 2025', src: dTriptych, panel: 1, kind: 'image' },
  { id: 'artist-d-moment-6', worldId: 'artist-d', title: 'Hòa âm mộc cùng ban nhạc', src: dTriptych, panel: 2, kind: 'image' },
  { id: 'artist-d-moment-7', worldId: 'artist-d', title: 'Đêm nhạc Đà Lạt dưới thông', src: dTriptych, panel: 1, kind: 'video' },
  { id: 'artist-d-moment-8', worldId: 'artist-d', title: 'Sách hợp âm mộc mạc', src: dTriptych, panel: 2, kind: 'image' },
  { id: 'artist-d-moment-9', worldId: 'artist-d', title: 'Lời nhắn kỷ niệm 3 năm', src: dTriptych, panel: 1, kind: 'image' },
  { id: 'artist-d-moment-10', worldId: 'artist-d', title: 'Sau cánh gà Sài Gòn 2025', src: dTriptych, panel: 2, kind: 'image' },
  { id: 'artist-d-moment-11', worldId: 'artist-d', title: 'Tiếng đàn lúc hoàng hôn', src: dTriptych, panel: 1, kind: 'image' },

  // Artist C (8 moments)
  { id: 'artist-c-moment-3', worldId: 'artist-c', title: 'Thiết kế sân khấu Purple Stage', src: cTriptych, panel: 1, kind: 'image' },
  { id: 'artist-c-moment-4', worldId: 'artist-c', title: 'Thử mic trước giờ diễn', src: cTriptych, panel: 2, kind: 'video' },
  { id: 'artist-c-moment-5', worldId: 'artist-c', title: 'Birthday Project thiệp chúc mừng', src: cTriptych, panel: 1, kind: 'image' },
  { id: 'artist-c-moment-6', worldId: 'artist-c', title: 'Sắc tím rực rỡ tại khán đài', src: cTriptych, panel: 2, kind: 'image' },
  { id: 'artist-c-moment-7', worldId: 'artist-c', title: 'Bản phối alt-pop mới', src: cTriptych, panel: 1, kind: 'image' },
  { id: 'artist-c-moment-8', worldId: 'artist-c', title: 'Ánh laser tím kết thúc show', src: cTriptych, panel: 2, kind: 'video' },

  // Artist MIRA (6 moments)
  { id: 'artist-mira-moment-3', worldId: 'artist-mira', title: 'Đĩa than Midnight Reverie lên kệ', src: publicAsset('images/merch-v2/mira-vinyl-physical.png'), kind: 'image' },
  { id: 'artist-mira-moment-4', worldId: 'artist-mira', title: 'Trà lofi ngắm trăng khuyết', src: miraCover, kind: 'image' },
  { id: 'artist-mira-moment-5', worldId: 'artist-mira', title: 'Ánh tím pastel trong phòng thu', src: miraCover, kind: 'image' },
  { id: 'artist-mira-moment-6', worldId: 'artist-mira', title: 'Hậu trường chụp photobook', src: miraCover, kind: 'video' },

  // Artist KAI (6 moments)
  { id: 'artist-kai-moment-3', worldId: 'artist-kai', title: 'Thử thách beatbox cùng fan', src: kaiCover, kind: 'video' },
  { id: 'artist-kai-moment-4', worldId: 'artist-kai', title: 'Áo khoác bomber neon phản quang', src: publicAsset('images/merch-v2/kai-bomber-physical.png'), kind: 'image' },
  { id: 'artist-kai-moment-5', worldId: 'artist-kai', title: 'Dàn synthesizer phòng thí nghiệm', src: kaiCover, kind: 'image' },
  { id: 'artist-kai-moment-6', worldId: 'artist-kai', title: 'Cyber Jam tại phố đi bộ', src: kaiCover, kind: 'video' },

  // Artist B (4 moments)
  { id: 'artist-b-moment-3', worldId: 'artist-b', title: 'Một góc quán quen', src: bTriptych, panel: 1, kind: 'image' },
  { id: 'artist-b-moment-4', worldId: 'artist-b', title: 'Bản thu cassette mộc', src: bTriptych, panel: 2, kind: 'image' },
];

export function getExploreMomentById(worldId: string, id: string): ExploreMoment | undefined {
  const entry = mediaByWorld[worldId];
  if (!entry) return undefined;

  if (id === `${worldId}-moment-1`) {
    return {
      id, worldId, title: entry.titles[0], media: entry.moments[0], kind: entry.kinds?.[0] || 'image',
      sourceContext: worldId,
      targetUrl: `/artist/${worldId}/moment/${id}`,
      freshness: entry.freshness,
      isDemo: worldId.startsWith('artist-') && !['artist-a', 'artist-mira', 'artist-kai'].includes(worldId),
    };
  }

  if (id === `${worldId}-moment-2`) {
    return {
      id, worldId, title: entry.titles[1], media: entry.moments[1], kind: entry.kinds?.[1] || 'image',
      sourceContext: worldId === 'artist-a' ? 'neon-sessions' : worldId,
      targetUrl: `/artist/${worldId}/moment/${id}`,
      freshness: entry.freshness,
      isDemo: worldId.startsWith('artist-') && !['artist-a', 'artist-mira', 'artist-kai'].includes(worldId),
    };
  }

  // Look in extended catalog
  const ext = EXTENDED_MOMENT_DEFS.find(m => m.worldId === worldId && m.id === id);
  if (ext) {
    return {
      id: ext.id,
      worldId,
      title: ext.title,
      media: ext.panel !== undefined ? { src: ext.src || entry.moments[0].src, panel: ext.panel } : { src: ext.src || entry.moments[0].src },
      kind: ext.kind || 'image',
      sourceContext: ext.sourceContext || worldId,
      targetUrl: `/artist/${worldId}/moment/${id}`,
      freshness: ext.freshness || entry.freshness - 10,
      isDemo: true,
    };
  }

  return undefined;
}

export function getWorldMoments(worldId: string): ExploreMoment[] {
  const top1 = getExploreMomentById(worldId, `${worldId}-moment-1`);
  const top2 = getExploreMomentById(worldId, `${worldId}-moment-2`);
  const base = [top1, top2].filter((m): m is ExploreMoment => Boolean(m));
  const ext = EXTENDED_MOMENT_DEFS
    .filter(m => m.worldId === worldId)
    .map(m => getExploreMomentById(worldId, m.id))
    .filter((m): m is ExploreMoment => Boolean(m));
  return [...base, ...ext];
}

export function getExploreProjectById(worldId: string, id: string): ExploreProject | undefined {
  const project = projects[worldId];
  return project?.id === id ? { id, worldId, title: project.title, targetUrl: `/artist/${worldId}?context=explore-project:${id}`, isDemo: true } : undefined;
}

export function getWorldProject(worldId: string): ExploreProject | undefined {
  const project = projects[worldId];
  return project ? getExploreProjectById(worldId, project.id) : undefined;
}

/** Artist Worlds are the unit of discovery; programs such as Neon Sessions cannot become rows. */
export function selectExploreRows(state: AppState, query = ''): ExploreWorldRow[] {
  const demoRotation = ['artist-b', 'artist-c', 'artist-d', 'artist-e'];
  const day = Math.floor(Date.parse(state.demoTime) / 86_400_000);
  const candidates = Object.values(state.worlds)
    .filter(world => world.tenantId === state.activeTenantId && world.type === 'artist' && mediaByWorld[world.id])
    .filter(world => {
      if (!query.trim()) return true;
      const publicContexts = Object.values(state.sessions).filter(session => session.tenantId === state.activeTenantId && session.rightsApproved !== false && (session.worldId === world.id || state.worlds[session.worldId]?.linkedWorldIds.includes(world.id))).map(session => session.title);
      const products = Object.values(state.products).filter(product => product.tenantId === state.activeTenantId && product.worldId === world.id).map(product => product.title);
      return matchesVietnameseQuery(`${world.name} ${world.description} ${getWorldMoments(world.id).map(moment => moment.title).join(' ')} ${projects[world.id]?.title || ''} ${publicContexts.join(' ')} ${products.join(' ')}`, query);
    })
    .map(world => {
      const media = mediaByWorld[world.id];
      const owned = Object.values(state.sessions).filter(session => session.worldId === world.id && session.rightsApproved !== false);
      const activity = owned.some(session => session.status === 'running') ? 4 : owned.some(session => session.status === 'open') ? 3 : owned.some(session => session.status === 'scheduled' && session.scheduledStartTime >= state.demoTime) ? 2 : 0;
      // Popularity is intentionally absent. Equally fresh demo worlds rotate daily instead of locking the same five in place.
      const rotationIndex = demoRotation.indexOf(world.id);
      const rotation = rotationIndex < 0 ? 0 : (4 - ((rotationIndex + day) % 4)) * 3;
      const score = activity * 100 + Number(state.followedWorldIds.includes(world.id)) * 20 + media.freshness + rotation;
      return { world, media, score };
    })
    .sort((a, b) => b.score - a.score || a.world.name.localeCompare(b.world.name, 'vi'));

  return candidates.map(({ world, media }, index) => ({
    world_id: world.id,
    artist_name: world.name,
    avatar: media.avatar,
    moments: [getExploreMomentById(world.id, `${world.id}-moment-1`)!, getExploreMomentById(world.id, `${world.id}-moment-2`)!],
    public_fan_voices: selectPublicVoices(state, world.id).slice(0, 3),
    featured_project: projects[world.id] ? getExploreProjectById(world.id, projects[world.id].id) : undefined,
    display_mode: index < 5 ? 'featured' : 'compact',
  }));
}
