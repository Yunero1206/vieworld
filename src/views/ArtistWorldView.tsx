import { useEffect, useMemo, type CSSProperties } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, MessageCircle, Play, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import { ARTIST_NOTES, momentTime } from '../world/fanWorld';
import { selectPublicVoices } from '../world/exploreDiscovery';
import { getExploreMomentById, getExploreProjectById, getWorldMoments, type ExploreMedia } from '../world/exploreRows';
import { setCurrentArtistId } from '../world/currentArtist';
import { getArtistCover } from '../world/artistVisuals';
import { ArtistHall } from './ArtistHall';
import { ArtistArchive } from './ArtistArchive';
import { ContextStage, ProjectContextStage } from '../components/ContextStage';
import { sessionContextUrl } from '../world/worldContext';

export const artistMediaStyle = (media: ExploreMedia): CSSProperties => media.panel === undefined
  ? { backgroundImage: `url("${media.src}")` }
  : { backgroundImage: `url("${media.src}")`, backgroundSize: '300% auto', backgroundPosition: `${media.panel * 50}% center` };

const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
const sectionFor = (path: string): 'home' | 'hall' | 'archive' | 'moment' => path.includes('/moment/') ? 'moment' : path.endsWith('/hall') ? 'hall' : path.endsWith('/archive') ? 'archive' : 'home';
const identityLines: Record<string, string> = {
  'artist-a': 'Từ bên trong thế giới này.', 'artist-mira': 'Những giai điệu dịu dưới ánh trăng.',
  'artist-kai': 'Nhịp đêm dành cho người thích chuyển động.', 'artist-b': 'Indie-pop và những sân khấu gần.',
  'artist-c': 'Sắc tím sau ánh đèn.', 'artist-d': 'Một góc acoustic ấm cúng.', 'artist-e': 'Những bản phối của đêm.',
};

export function ArtistWorldView() {
  const { artistId, momentId } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const { state, dispatch } = useApp();
  const world = artistId ? state.worlds[artistId] : undefined;
  const scoped = world?.type === 'artist' && world.tenantId === state.activeTenantId;
  const section = sectionFor(location.pathname);
  const path = `/artist/${artistId}`;
  const image = getArtistCover(artistId);
  const sessions = useMemo(() => Object.values(state.sessions).filter(session => session.worldId === artistId && session.rightsApproved !== false), [state.sessions, artistId]);
  const active = sessions.filter(session => ['running', 'open'].includes(session.status) || (session.status === 'scheduled' && session.scheduledStartTime >= state.demoTime))
    .sort((a, b) => (a.status === 'running' ? -1 : b.status === 'running' ? 1 : a.scheduledStartTime.localeCompare(b.scheduledStartTime)));
  const linkedActive = Object.values(state.sessions).filter(session => session.rightsApproved !== false && ['running', 'open', 'scheduled'].includes(session.status)
    && (session.status !== 'scheduled' || session.scheduledStartTime >= state.demoTime)
    && state.worlds[session.worldId]?.type === 'ip' && state.worlds[session.worldId]?.linkedWorldIds.includes(artistId || ''));
  const activeContexts = [...active, ...linkedActive].slice(0, 3);
  const voices = selectPublicVoices(state, artistId || '');
  const moments = artistId ? getWorldMoments(artistId) : [];
  const note = ARTIST_NOTES.find(item => item.worldId === artistId && item.publishedAt <= state.demoTime);
  const products = Object.values(state.products).filter(product => product.worldId === artistId && product.image && product.priceVND > 0 && !product.previewOnly && product.delivery !== 'digital')
    .filter((product, index, all) => all.findIndex(other => other.familyId === product.familyId) === index).slice(0, 4);
  const focused = momentId && artistId ? getExploreMomentById(artistId, momentId) : undefined;
  const context = params.get('context');
  const contextSession = context?.startsWith('session:') ? state.sessions[context.slice(8)] : undefined;
  const validContextSession = contextSession?.rightsApproved !== false && contextSession?.tenantId === state.activeTenantId
    && (contextSession.worldId === artistId || state.worlds[contextSession.worldId]?.linkedWorldIds.includes(artistId || '')) ? contextSession : undefined;
  const contextNote = context?.startsWith('note:') ? ARTIST_NOTES.find(item => item.id === context.slice(5) && item.worldId === artistId) : undefined;
  const project = artistId ? getExploreProjectById(artistId, 'project-c-birthday') : undefined;
  const selectedProject = context?.startsWith('explore-project:') && project?.id === context.slice(16) ? project : undefined;
  const returnState = location.state as { fromExplore?: unknown; fromArtist?: unknown; restoreExploreY?: unknown } | null;
  const returnPath = typeof returnState?.fromExplore === 'string' && returnState.fromExplore.startsWith('/explore') ? returnState.fromExplore
    : typeof returnState?.fromArtist === 'string' && returnState.fromArtist.startsWith(path) ? returnState.fromArtist : path;
  useEffect(() => {
    document.title = scoped ? `${world!.name} · VieWorld` : 'Artist World · VieWorld';
    if (scoped && artistId) { setCurrentArtistId(state, artistId); dispatch({ type: 'VISIT_FAN_WORLD', worldId: artistId }); }
  }, [artistId, scoped]);

  if (!world || !scoped || !artistId) return <div className="artist-world-missing"><h1>Không tìm thấy Artist World này.</h1><Link to="/explore">Trở về Explore <ArrowRight size={17} /></Link></div>;
  const followed = state.followedWorldIds.includes(artistId);
  const heroCompact = section !== 'home' || Boolean(validContextSession || selectedProject);
  return <div className="artist-world-page">
    <header className={`artist-world-hero${heroCompact ? ' compact' : ''}`}>
      <img className="artist-world-cover" src={image} alt="" fetchPriority="high" /><div className="artist-world-hero-shade" />
      {heroCompact && <img className="artist-world-avatar" src={image} alt="" />}
      <div className="artist-world-hero-identity"><p>ARTIST WORLD</p><h1>{world.name}</h1><span>{identityLines[artistId] || world.description.split(/[.!?]/)[0].trim()}</span>
        {!heroCompact && <button type="button" aria-pressed={followed} onClick={() => dispatch({ type: 'TOGGLE_FOLLOW', worldId: artistId })}><Heart size={16} fill={followed ? 'currentColor' : 'none'} />{followed ? 'Đang theo dõi' : 'Theo dõi'}</button>}
      </div>
      {!heroCompact && active[0] && <Link to={sessionContextUrl(artistId, active[0].id)} className="artist-world-next"><small>{active[0].status === 'running' ? 'ĐANG DIỄN RA · DEMO' : 'SẮP TỚI · DEMO'}</small><strong>{active[0].title}</strong><span>{momentTime(active[0].scheduledStartTime)} <ArrowRight size={17} /></span></Link>}
    </header>
    <nav className="artist-world-local-nav" aria-label={`Trong world của ${world.name}`}>
      <Link to={path} aria-current={section === 'home' || section === 'moment' ? 'page' : undefined}>Trang chính</Link>
      <Link to={`${path}/hall`} aria-current={section === 'hall' ? 'page' : undefined}>Hall</Link>
      <Link to={`${path}/archive`} aria-current={section === 'archive' ? 'page' : undefined}>Kho lưu trữ</Link>
    </nav>
    {section === 'moment' && <div className="artist-world-body artist-moment-focus"><Link to={returnPath} state={returnPath.startsWith('/explore') ? { restoreExploreY: returnState?.restoreExploreY } : undefined} className="artist-focus-back"><ArrowLeft size={17} /> Quay lại {returnPath.startsWith('/explore') ? 'Explore' : 'world'}</Link>
      {focused ? <article><div className="artist-moment-media" style={artistMediaStyle(focused.media)} role="img" aria-label={focused.title} /><div><small>KHOẢNH KHẮC · {world.name}{focused.isDemo ? ' · MINH HỌA' : ''}</small><h2>{focused.title}</h2><p>Một lát cắt được giữ trong world của {world.name}.</p><Link to={`${path}/archive`}>Xem Kho lưu trữ <ArrowRight size={16} /></Link></div></article>
        : <p className="artist-world-empty">Không tìm thấy khoảnh khắc này trong world.</p>}
    </div>}
    {section === 'home' && <div className="artist-world-body artist-world-home">
      {(validContextSession || selectedProject) && <nav className="artist-context-switcher" aria-label="Đổi hoạt động trong world">
        {activeContexts.map(session => <Link key={session.id} to={sessionContextUrl(artistId, session.id)} aria-current={validContextSession?.id === session.id ? 'page' : undefined}>{session.status === 'running' ? '● ' : ''}{session.title.replace(`${world.name}: `, '')}</Link>)}
        {project && <Link to={project.targetUrl} aria-current={selectedProject ? 'page' : undefined}>{project.title}</Link>}
      </nav>}
      {validContextSession && <ContextStage key={validContextSession.id} session={validContextSession} artistId={artistId} artistName={world.name} image={image} />}
      {selectedProject && <ProjectContextStage projectId={selectedProject.id} title={selectedProject.title} artistId={artistId} artistName={world.name} image={image} />}
      {contextNote && <aside className="artist-world-context"><div><small>LỜI NHẮN TỪ {world.name.toUpperCase()}</small><strong>{contextNote.title}</strong><span>{contextNote.body}</span></div><Link to={path}>Đóng</Link></aside>}
      {context?.startsWith('explore-voice:') && voices.some(voice => voice.id === context.slice(14)) && <aside className="artist-world-context"><div><small>LỜI NHẮN CÔNG KHAI</small><strong>“{voices.find(voice => voice.id === context.slice(14))?.text}”</strong></div><Link to={path}>Đóng</Link></aside>}
      {!validContextSession && !selectedProject && <section className="artist-home-section" aria-labelledby="artist-now-heading"><div className="artist-world-section-head"><h2 id="artist-now-heading">Đang có gì</h2></div>
        {activeContexts.length || project ? <div className="artist-home-contexts">{activeContexts.slice(0, project ? 2 : 3).map(session => <Link key={session.id} to={sessionContextUrl(artistId, session.id)} className="artist-world-object"><img src={image} alt="" loading="lazy" /><span className="artist-world-object-shade" /><small>{session.status === 'running' ? '● LIVE ĐANG DIỄN RA · DEMO' : 'SẮP DIỄN RA · DEMO'}</small><strong>{session.title}</strong><span>{momentTime(session.scheduledStartTime)}</span><ArrowRight size={18} /></Link>)}
          {project && <Link to={project.targetUrl} className="artist-world-object"><img src={image} alt="" loading="lazy" /><span className="artist-world-object-shade" /><small>FAN PROJECT · MINH HỌA</small><strong>{project.title}</strong><ArrowRight size={18} /></Link>}</div>
          : <p className="artist-world-empty">Hôm nay world đang yên. Khi có hoạt động được công bố, nó sẽ hiện ở đây.</p>}
      </section>}
      {!validContextSession && !selectedProject && <section className="artist-home-section" aria-labelledby="artist-hall-preview-heading"><div className="artist-world-section-head"><h2 id="artist-hall-preview-heading">Từ Hall</h2><Link to={`${path}/hall`}>Vào Hall <ArrowRight size={17} /></Link></div>
        {voices.length ? <div className="artist-home-voices">{voices.slice(0, 3).map(voice => <blockquote key={voice.id}><MessageCircle size={17} /><p>“{voice.text}”</p><footer>{voice.author}{voice.selectedBy === 'artist' ? ' · Artist chọn' : ''}{voice.isDemo ? ' · mẫu' : ''}</footer></blockquote>)}</div>
          : <p className="artist-world-empty">Chưa có lời nhắn nào được đồng ý chia sẻ ra ngoài Hall.</p>}
      </section>}
      <section className="artist-home-section" aria-labelledby="artist-recent-heading"><div className="artist-world-section-head"><h2 id="artist-recent-heading">Gần đây trong world</h2><Link to={`${path}/archive`}>Xem kho lưu trữ <ArrowRight size={17} /></Link></div>
        <div className="artist-home-moments">{moments.map(moment => <Link key={moment.id} to={`${path}/moment/${moment.id}`} state={{ fromArtist: path }} aria-label={`Xem khoảnh khắc ${moment.title}`}><span style={artistMediaStyle(moment.media)} /><strong>{moment.title}</strong>{moment.kind === 'video' && <Play size={16} />}</Link>)}
          {note && <Link to={note.sessionId ? sessionContextUrl(artistId, note.sessionId) : path}><span style={{ backgroundImage: `url("${image}")` }} /><strong>{note.title}</strong></Link>}
          {sessions.filter(session => session.status === 'ended').slice(0, 2).map(session => <Link key={session.id} to={sessionContextUrl(artistId, session.id)}><span style={{ backgroundImage: `url("${image}")` }} /><strong>{session.title}</strong></Link>)}</div>
      </section>
      <section className="artist-home-section" aria-labelledby="artist-products-heading"><div className="artist-world-section-head"><h2 id="artist-products-heading">Gần {world.name} hơn một chút</h2><Link to={`/shop?artist=${artistId}`}>VieSHOP của {world.name} <ArrowRight size={17} /></Link></div>
        {products.length ? <div className="artist-home-products">{products.map(product => <Link key={product.id} to={`/shop?artist=${artistId}&product=${product.id}`}><img src={`${MERCH_IMAGE_ROOT}/${product.image}.png`} alt="" loading="lazy" /><span><strong>{product.title}</strong><small>{money(product.priceVND)}</small></span><ShoppingBag size={15} /></Link>)}</div>
          : <p className="artist-world-empty">Chưa có sản phẩm nào được mở trong VieSHOP của {world.name}.</p>}
      </section>
      <section className="artist-home-section artist-home-deeper" aria-label="Khám phá sâu hơn trong world">
        <Link to={`${path}/archive`}>Kho lưu trữ <ArrowRight size={16} /></Link>
        {project && <Link to={project.targetUrl}>Fan project <ArrowRight size={16} /></Link>}
        <details><summary>Về {world.name}</summary><p>{world.description}</p></details>
      </section>
    </div>}
    {section === 'hall' && <ArtistHall artistId={artistId} name={world.name} sessions={sessions} />}
    {section === 'archive' && <ArtistArchive artistId={artistId} name={world.name} moments={moments} sessions={sessions} />}
  </div>;
}
