import { useEffect, useMemo, type CSSProperties } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, MoreHorizontal, Play, ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { merchImageUrl } from '../world/merchImages';
import { ARTIST_NOTES, momentTime } from '../world/fanWorld';
import { selectPublicVoices, selectWorldPulse, publicVoiceHallUrl } from '../world/exploreDiscovery';
import { getExploreMomentById, getWorldProject, getWorldMoments, type ExploreMedia } from '../world/exploreRows';
import { ArtistVisualRail } from '../components/ArtistVisualRail';
import { CatalogItemArt, hasCatalogItemArt } from '../components/CatalogItemArt';
import { setCurrentArtistId } from '../world/currentArtist';
import { getArtistCover } from '../world/artistVisuals';
import { ArtistHall } from './ArtistHall';
import { ArtistArchive } from './ArtistArchive';
import { ContextStage, ProjectContextStage } from '../components/ContextStage';
import { artistForWorld, sessionContextUrl } from '../world/worldContext';
import { productBadge, productPrice } from '../world/shopPresentation';
import { membershipWorldsForFan } from '../world/personalSelectors';
import { isDemoSignedIn } from '../world/account';
import { worldActivities, selectArtistActivityPair } from '../world/presenceDiscovery';
import { useArtistContextTransition } from '../hooks/useArtistContextTransition';
import { isMemberQASession, isPublicProjectableHallRoom } from '../world/hallRooms';

export const artistMediaStyle = (media: ExploreMedia): CSSProperties => media.panel === undefined
  ? { backgroundImage: `url("${media.src}")` }
  : { backgroundImage: `url("${media.src}")`, backgroundSize: '300% auto', backgroundPosition: `${media.panel * 50}% center` };

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
  const sessions = useMemo(() => Object.values(state.sessions).filter(session => artistId && session.worldId === artistId && isPublicProjectableHallRoom(state,artistId,session.id)), [state.sessions, artistId, state.activeTenantId]);
  const activeContexts = (artistId ? worldActivities(state,artistId) : []).filter(activity=>activity.phase!=='recent'&&state.sessions[activity.id]).map(activity=>state.sessions[activity.id]).sort((a,b)=>Number(['running','open','paused'].includes(b.status))-Number(['running','open','paused'].includes(a.status))||a.scheduledStartTime.localeCompare(b.scheduledStartTime)).slice(0,3);
  const [primary,secondary]=selectArtistActivityPair(state,artistId||'');
  const pulse=selectWorldPulse(state,artistId||'',primary?.id);
  const voices=pulse?[pulse,...selectPublicVoices(state,artistId||'',pulse.sourceContextId).filter(v=>v.id!==pulse.id)].slice(0,2):[];
  const moments = artistId ? getWorldMoments(artistId) : [];
  const note = ARTIST_NOTES.find(item => item.worldId === artistId && item.publishedAt <= state.demoTime);
  const products = useMemo(() => {
    const families = new Set<string>();
    return Object.values(state.products).filter(product => {
      const family = product.familyId || product.id;
      if (product.tenantId !== state.activeTenantId || product.worldId !== artistId || !product.image || product.priceVND <= 0 || product.previewOnly || product.delivery === 'digital' || families.has(family)) return false;
      families.add(family);
      return true;
    }).slice(0, 4);
  }, [state.products, artistId, state.activeTenantId]);
  const focused = momentId && artistId ? getExploreMomentById(artistId, momentId) : undefined;
  const context = params.get('context');
  const contextSession = context?.startsWith('session:') ? state.sessions[context.slice(8)] : undefined;
  const validContextSession = contextSession?.rightsApproved === true && contextSession.status !== 'cancelled' && contextSession.mediaStatus !== 'expired' && contextSession.mediaStatus !== 'missing' && contextSession?.tenantId === state.activeTenantId
    && artistForWorld(state, contextSession.worldId) === artistId ? contextSession : undefined;
  const contextNote = context?.startsWith('note:') ? ARTIST_NOTES.find(item => item.id === context.slice(5) && item.worldId === artistId && item.publishedAt <= state.demoTime) : undefined;
  const project = artistId && state.activeTenantId === 'vieworld-demo' ? getWorldProject(artistId) : undefined;
  const selectedProject = context?.startsWith('explore-project:') && project?.id === context.slice(16) ? project : undefined;
  useArtistContextTransition(location.pathname, validContextSession?.id || selectedProject?.id || null);
  const returnState = location.state as { fromExplore?: unknown; fromArtist?: unknown; restoreExploreY?: unknown } | null;
  const returnPath = typeof returnState?.fromExplore === 'string' && returnState.fromExplore.startsWith('/explore') ? returnState.fromExplore
    : typeof returnState?.fromArtist === 'string' && returnState.fromArtist.startsWith(path) ? returnState.fromArtist : path;
  useEffect(() => {
    document.title = scoped ? `${world!.name} · VieWorld` : 'Artist World · VieWorld';
    if (scoped && artistId) { setCurrentArtistId(state, artistId); dispatch({ type: 'VISIT_FAN_WORLD', worldId: artistId }); }
  }, [artistId, scoped]);

  if (!world || !scoped || !artistId) return <div className="artist-world-missing"><h1>Không tìm thấy Artist World này.</h1><Link to="/explore">Trở về Explore <ArrowRight size={17} /></Link></div>;
  if (contextSession && isMemberQASession(state,contextSession.id)) return <Navigate to={`${path}/hall?room=${contextSession.id}`} replace/>;
  const member = isDemoSignedIn(state) ? membershipWorldsForFan(state).find(m=>m.world.id===artistId && m.active) : undefined;
  const followed = isDemoSignedIn(state) && state.followedWorldIds.includes(artistId);
  const toggleFollow = () => isDemoSignedIn(state) ? dispatch({type:'TOGGLE_FOLLOW',worldId:artistId}) : window.dispatchEvent(new Event('vieworld-open-auth'));
  const heroCompact = ['hall','archive','moment'].includes(section) || Boolean(validContextSession || selectedProject);
  return <div className="artist-world-page">
    <header className={`artist-world-hero${heroCompact ? ' compact' : ''}`}>
      <img className="artist-world-cover" src={image} alt="" fetchPriority="high" /><div className="artist-world-hero-shade" />
      {heroCompact && <img className="artist-world-avatar" src={image} alt="" />}
      <div className="artist-world-hero-identity"><p>ARTIST WORLD</p><h1>{world.name}</h1><span>{identityLines[artistId] || world.description.split(/[.!?]/)[0].trim()}</span>
        {!heroCompact && <button type="button" aria-pressed={followed} onClick={toggleFollow}><Heart size={16} fill={followed ? 'currentColor' : 'none'} />{followed ? 'Đang theo dõi' : 'Theo dõi'}</button>}{member&&<Link className="presence-membership-chip" to={`/memberships?artist=${artistId}`}>◇ Hội viên{member.months!==null&&member.months>=0?' · '+member.months+' tháng':''}</Link>}
      </div>
      {!heroCompact && <p className="artist-world-signature">Good music.<br/>Better people.</p>}
      <details className="artist-identity-menu"><summary aria-label={`Tùy chọn world của ${world.name}`}><MoreHorizontal size={20}/></summary><div><button type="button" onClick={toggleFollow}>{followed?'Bỏ theo dõi':'Theo dõi'} {world.name}</button><Link to={`/shop?artist=${artistId}`}>VieCollect của {world.name}</Link><Link to={`${path}/archive`}>Xem Kho lưu trữ</Link></div></details>
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
      {!validContextSession&&!selectedProject&&<section className="presence-artist-main" aria-label="Hoạt động trong world">
        {primary?<Link to={primary.to} className="artist-world-object"><span className="artist-context-card-art" style={artistMediaStyle(primary.media)}/><span className="artist-world-object-shade"/><small>{primary.label.toLocaleUpperCase('vi')}{primary.demo?' · MINH HỌA':''}</small><strong>{primary.title}</strong>{primary.at&&<span>{momentTime(primary.at)}</span>}<ArrowRight size={20}/></Link>:<div className="artist-world-empty">Chưa có hoạt động mới. Những khoảnh khắc cũ vẫn ở đây.</div>}
        <div className="presence-artist-side">{secondary&&<Link to={secondary.to} className="artist-world-object"><span className="artist-context-card-art" style={artistMediaStyle(secondary.media)}/><span className="artist-world-object-shade"/><small>{secondary.label}{secondary.demo?' · Minh họa':''}</small><strong>{secondary.title}</strong>{secondary.at&&<span>{momentTime(secondary.at)}</span>}<ArrowRight size={18}/></Link>}
        <div className="presence-artist-voices"><header><strong>TRONG FANDOM</strong><Link to={`${path}/hall`}>Vào Hall →</Link></header>{voices.map(voice=><Link className="presence-artist-voice" to={publicVoiceHallUrl(voice)} key={voice.id}><blockquote><strong>{voice.author}</strong><small>{voice.isDemo?' · Lời nhắn mẫu':''}</small><p>“{voice.text}”</p></blockquote></Link>)}{!voices.length&&<p>Chưa có lời nhắn công khai.</p>}</div></div>
      </section>}
      <section className="artist-home-section" aria-labelledby="artist-recent-heading"><div className="artist-world-section-head"><h2 id="artist-recent-heading">Khoảnh khắc gần đây</h2><Link to={`${path}/archive`}>Xem kho lưu trữ <ArrowRight size={17} /></Link></div>
        <ArtistVisualRail label="Khoảnh khắc gần đây" className="artist-home-moments">{moments.slice(0, 5).map(moment => <Link key={moment.id} to={`${path}/moment/${moment.id}`} state={{ fromArtist: path }} aria-label={`Xem khoảnh khắc ${moment.title}`}><span style={artistMediaStyle(moment.media)} /><strong>{moment.title}</strong>{moment.kind === 'video' ? <Play size={16} /> : <ImageIcon size={15}/>}</Link>)}
          {moments.length < 5 && note && <Link to={note.sessionId ? sessionContextUrl(artistId, note.sessionId) : path}><span style={{ backgroundImage: `url("${image}")` }} /><strong>{note.title}</strong></Link>}
          {sessions.filter(session => session.status === 'ended').slice(0, Math.min(2, Math.max(0, 5 - moments.length - (note ? 1 : 0)))).map(session => <Link key={session.id} to={sessionContextUrl(artistId, session.id)}><span style={{ backgroundImage: `url("${image}")` }} /><strong>{session.title}</strong></Link>)}</ArtistVisualRail>
      </section>
      <section className="artist-home-section" aria-labelledby="artist-products-heading"><div className="artist-world-section-head"><h2 id="artist-products-heading">Gần {world.name} hơn một chút</h2><Link to={`/shop?artist=${artistId}`}>VieCollect của {world.name} <ArrowRight size={17} /></Link></div>
        {products.length ? <ArtistVisualRail label="Vật phẩm trong world" className="artist-home-products">{products.map(product => <Link key={product.id} to={`/shop?artist=${artistId}&product=${product.id}`}>
          {hasCatalogItemArt(product.id) ? <CatalogItemArt id={product.id} title={product.title} cutout /> : <img src={product.image ? merchImageUrl(product.image) : '/images/vieworld-logo.svg'} alt="" loading="lazy" />}
          <span><strong>{product.title}</strong><small>{productPrice(product).current}{productBadge(product) ? ` · ${productBadge(product)}` : ''}</small></span><ShoppingBag size={15} /></Link>)}</ArtistVisualRail>
          : <p className="artist-world-empty">Chưa có sản phẩm nào được mở trong VieCollect của {world.name}.</p>}
      </section>
    </div>}
    {section === 'hall' && <ArtistHall artistId={artistId} name={world.name} sessions={sessions} />}
    {section === 'archive' && <ArtistArchive artistId={artistId} name={world.name} moments={moments} sessions={sessions} />}
  </div>;
}
