import { useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { selectExploreRows, type ExploreMedia, type ExploreMoment, type ExploreWorldRow } from '../world/exploreRows';

function mediaStyle(media: ExploreMedia): CSSProperties {
  return media.panel === undefined
    ? { backgroundImage: `url("${media.src}")` }
    : { backgroundImage: `url("${media.src}")`, backgroundSize: '300% auto', backgroundPosition: `${media.panel * 50}% center` };
}

type BackState = { fromExplore: string; restoreExploreY: number };
function rememberExplorePosition() {
  try { sessionStorage.setItem('vieworld:explore-scroll-y', String(window.scrollY)); } catch { /* storage may be unavailable */ }
}

function MomentSlice({ moment, backState }: { moment: ExploreMoment; backState: BackState }) {
  return <Link className="explore-slice" to={moment.targetUrl} state={backState} onClick={rememberExplorePosition}
    aria-label={`Xem khoảnh khắc ${moment.title}`}>
    <span className="explore-slice-art" style={mediaStyle(moment.media)} aria-hidden="true" />
    {moment.kind === 'video' && <Play className="explore-slice-play" size={17} fill="currentColor" aria-hidden="true" />}
    <span className="explore-slice-caption">{moment.title}</span>
  </Link>;
}

function FeaturedRow({ row, backState }: { row: ExploreWorldRow; backState: BackState }) {
  const worldPath = `/artist/${row.world_id}`;
  return <article className="explore-featured-row" data-world={row.world_id}>
    <div className="explore-featured-artist">
      <Link className="explore-featured-name" to={worldPath}>{row.artist_name}</Link>
      <Link className="explore-featured-avatar" to={worldPath} aria-label={`Vào world của ${row.artist_name}`}><span style={mediaStyle(row.avatar)} aria-hidden="true" /></Link>
    </div>
    <div className="explore-featured-moments" aria-label={`Hai khoảnh khắc của ${row.artist_name}`}>
      {row.moments.map(moment => <MomentSlice key={moment.id} moment={moment} backState={backState} />)}
    </div>
    <div className="explore-featured-people">
      {row.public_fan_voices.map((voice, index) => <Link key={voice.id} className="explore-voice-line" to={`${worldPath}?context=explore-voice:${voice.id}`} state={backState} onClick={rememberExplorePosition}
        aria-label={`Xem lời nhắn công khai của ${voice.author} trong world của ${row.artist_name}`}>
        <img src={`${import.meta.env.BASE_URL}images/world-v8/fan-${index % 3 + 1}.webp`} alt="" loading="lazy" />
        <span>“{voice.text}”</span>
      </Link>)}
      {row.featured_project && <Link className="explore-project-line" to={row.featured_project.targetUrl} state={backState} onClick={rememberExplorePosition}>✧ {row.featured_project.title} <ArrowRight size={13} aria-hidden="true" /></Link>}
    </div>
  </article>;
}

function CompactWorldTile({ row }: { row: ExploreWorldRow }) {
  return <Link className="explore-compact-tile" data-world={row.world_id} to={`/artist/${row.world_id}`} aria-label={`Vào world của ${row.artist_name}`}>
    <span className="explore-compact-avatar" style={mediaStyle(row.avatar)} aria-hidden="true" />
    <strong>{row.artist_name}</strong>
  </Link>;
}

export function ExploreView() {
  const { state } = useApp();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const followingOnly = searchParams.get('scope') === 'following';
  const rows = useMemo(() => {
    const selected = selectExploreRows(state, query);
    const visible = followingOnly ? selected.filter(row => state.followedWorldIds.includes(row.world_id)) : selected;
    return visible.map((row, index) => ({ ...row, display_mode: (index < 5 ? 'featured' : 'compact') as ExploreWorldRow['display_mode'] }));
  }, [state, query, followingOnly]);
  const backState = { fromExplore: location.pathname + location.search, restoreExploreY: window.scrollY };
  useEffect(() => { document.title = 'Explore · VieWorld'; }, []);
  useEffect(() => {
    const requested = (location.state as { restoreExploreY?: unknown } | null)?.restoreExploreY;
    if (typeof requested !== 'number' || !Number.isFinite(requested) || requested < 0) return;
    let stored: number | undefined;
    try { stored = Number(sessionStorage.getItem('vieworld:explore-scroll-y')); } catch { /* storage may be unavailable */ }
    const y = stored && Number.isFinite(stored) ? stored : requested;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
    return () => cancelAnimationFrame(frame);
  }, [location.key, location.state]);
  const clearQuery = () => {
    if (!searchParams.has('q')) return;
    const next = new URLSearchParams(searchParams); next.delete('q'); setSearchParams(next, { replace: true });
  };

  return <div className="explore-world-list">
    <header className="explore-world-header"><h1>Explore</h1><p>{followingOnly ? 'Những artist world bạn đang theo dõi.' : 'Nhìn qua một world: nghệ sĩ, những khoảnh khắc và người ở trong đó.'}</p></header>
    {followingOnly && <p className="explore-world-query"><Link to="/explore">← Tất cả world</Link></p>}
    {query && <p className="explore-world-query">Kết quả cho “{query}” <button type="button" onClick={clearQuery}>Xóa tìm kiếm</button></p>}
    <section aria-labelledby="explore-featured-heading">
      <h2 id="explore-featured-heading" className="explore-world-section-title">✦ <span>{followingOnly ? 'Đang theo dõi' : 'Nổi bật'}</span></h2>
      {rows.length ? <div>{rows.filter(row => row.display_mode === 'featured').map(row => <FeaturedRow key={row.world_id} row={row} backState={backState} />)}</div>
        : <p className="explore-world-empty">{followingOnly && !query ? 'Bạn chưa theo dõi Artist World nào. Khám phá và chọn một nơi mình thích nhé.' : 'Chưa tìm thấy Artist World phù hợp. Thử tìm tên khác nhé.'} {followingOnly && !query && <Link to="/explore">Xem tất cả world →</Link>}</p>}
    </section>
    {rows.some(row => row.display_mode === 'compact') && <section className="explore-compact-section" aria-labelledby="explore-more-heading">
      <h2 id="explore-more-heading" className="explore-world-section-title">Các world khác</h2>
      <div className="explore-compact-grid">{rows.filter(row => row.display_mode === 'compact').map(row => <CompactWorldTile key={row.world_id} row={row} />)}</div>
    </section>}
    <p className="explore-world-demo-note">Một số nghệ sĩ, hình ảnh và lời nhắn ở đây là nội dung minh họa cho bản demo.</p>
  </div>;
}
