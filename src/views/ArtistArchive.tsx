import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sessionContextUrl } from '../world/worldContext';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Session } from '../domain/types';
import type { ExploreMedia, ExploreMoment } from '../world/exploreRows';

import { EXPANDED_ARCHIVE_CHAPTERS } from '../data/expandedUniverse';

type Chapter = { id: string; title: string; year: number; kind: 'Sự kiện' | 'Era' | 'Capsule' | 'Fan project'; image: ExploreMedia; detail: string; to?: string; demo?: boolean };
function mediaStyle(media: ExploreMedia) {
  return media.panel === undefined ? { backgroundImage: `url("${media.src}")` }
    : { backgroundImage: `url("${media.src}")`, backgroundSize: '300% auto', backgroundPosition: `${media.panel * 50}% center` };
}

export function ArtistArchive({ artistId, name, moments, sessions }: { artistId: string; name: string; moments: ExploreMoment[]; sessions: Session[] }) {
  const { state } = useApp();
  const [filter, setFilter] = useState('Tất cả');
  const currentYear = Number(state.demoTime.slice(0, 4)) || 2026;
  const fallbackMedia = moments[0]?.media;
  const chapters: Chapter[] = sessions.filter(session => session.status === 'ended' && fallbackMedia).map(session => ({
    id: session.id, title: session.title, year: Number(session.scheduledStartTime.slice(0, 4)), kind: 'Sự kiện',
    image: fallbackMedia, detail: 'Buổi diễn đã khép lại.', to: sessionContextUrl(artistId, session.id),
  }));
  chapters.push(...moments.map((moment, index) => ({
    id: moment.id, title: moment.title, year: currentYear, kind: index === 0 ? 'Sự kiện' as const : 'Era' as const,
    image: moment.media, detail: 'Những lát cắt được giữ trong world.', to: `/artist/${artistId}/moment/${moment.id}`, demo: moment.isDemo,
  })));
  if (fallbackMedia) chapters.push(...Object.values(state.capsules).filter(capsule => capsule.worldId === artistId && capsule.isSaved).map(capsule => ({
    id: capsule.id, title: `Capsule · ${state.sessions[capsule.sessionId]?.title || 'Kỷ niệm của bạn'}`,
    year: Number((state.sessions[capsule.sessionId]?.scheduledStartTime || state.demoTime).slice(0, 4)), kind: 'Capsule' as const,
    image: fallbackMedia, detail: 'Kỷ niệm riêng được giữ lại.', to: '/me?panel=capsules',
  })));
  // Canonical historical chapters across years (including Artist D 3 years, Artist E sparse, etc.)
  if (state.activeTenantId === 'vieworld-demo' && fallbackMedia) {
    const canonical = EXPANDED_ARCHIVE_CHAPTERS.filter(ch => ch.worldId === artistId);
    chapters.push(...canonical.map(ch => ({
      id: ch.id,
      title: ch.title,
      year: ch.year,
      kind: ch.kind,
      image: fallbackMedia,
      detail: ch.detail,
      to: ch.to,
      demo: ch.demo ?? true,
    })));
  }
  // Deduplicate by chapter id while preserving priority
  const seenIds = new Set<string>();
  const uniqueChapters = chapters.filter(ch => {
    if (seenIds.has(ch.id)) return false;
    seenIds.add(ch.id);
    return true;
  });
  const filtered = uniqueChapters.filter(chapter => filter === 'Tất cả' || chapter.kind === filter);
  const years = [...new Set(filtered.map(chapter => chapter.year))].sort((a, b) => b - a);
  return <div className="artist-world-body artist-archive-page">
    <header className="artist-inner-heading"><div><h2>Kho lưu trữ</h2><p>Những chương đã ở lại cùng {name}.</p></div></header>
    <div className="artist-archive-layout"><div>
      <div className="artist-archive-filters" role="group" aria-label="Lọc chương trong kho lưu trữ">
        {['Tất cả', 'Sự kiện', 'Era', 'Capsule', 'Fan project'].map(item => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      {years.length ? years.map(year => <section className="artist-archive-year" key={year} aria-labelledby={`artist-archive-${year}`}>
        <h3 id={`artist-archive-${year}`}>{year}</h3><div className="artist-archive-chapters">{filtered.filter(chapter => chapter.year === year).map(chapter => <article key={chapter.id}>
          <div className="artist-archive-art" style={mediaStyle(chapter.image)} aria-hidden="true" />
          <div><small>{chapter.kind}{chapter.demo ? ' · Minh họa' : ''}</small><h4>{chapter.title}</h4><p>{chapter.detail}</p>
            {chapter.to && <Link to={chapter.to} state={{ fromArtist: `/artist/${artistId}/archive` }}>Mở chương <ArrowRight size={14} /></Link>}</div>
        </article>)}</div>
      </section>) : <p className="artist-world-empty">Chưa có chương nào thuộc nhóm này.</p>}
    </div><aside className="artist-archive-recent"><h3>Mới được giữ lại</h3>{moments.slice(0, 2).map(moment => <Link key={moment.id} to={`/artist/${artistId}/moment/${moment.id}`} state={{ fromArtist: `/artist/${artistId}/archive` }}>
      <span style={mediaStyle(moment.media)} /><strong>{moment.title}</strong><ArrowRight size={15} /></Link>)}</aside></div>
  </div>;
}
