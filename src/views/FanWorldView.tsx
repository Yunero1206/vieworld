import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Disc3, Heart, Mail, Music2, ShoppingBag, Sparkles, CalendarDays, BookOpen, Package, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { PersonalDisplayRoom } from '../components/DisplayRoom';
import { ArtistCommunity } from '../components/ArtistCommunity';
import { ArtistBroadcast } from '../components/ArtistBroadcast';
import { PLACE_INFO, PlaceId, PANEL_HOME, panelRoute } from '../world/places';
import { CollectionBrowser } from '../components/CollectionBrowser';
import { PublicIdentity } from '../components/PublicIdentity';
import { HallPanel } from '../components/HallPanel';
import { DigitalCloset } from '../components/DigitalCloset';
import { WorldPanel } from '../components/WorldPanel';
import { FanAvatarCustomizer } from '../components/FanAvatarCustomizer';
import { MembershipCard } from '../components/MembershipCard';
import { BenefitCard } from '../components/BenefitCard';
import { ARTIST_NOTES, momentTime, ORDER_LABELS } from '../world/fanWorld';
import { getTenantConfig } from '../domain/tenantConfig';

const panelTitles: Record<string, string> = {
  hall: 'Hall · Gặp những người cùng yêu nhạc', concerts: 'Live Concert · Sân khấu chung', livechat: 'Live Chat · Lời nhắn từ artist',
  worlds: 'Những nơi mình có thể ghé', news: 'Thư từ nhà nhạc', sessions: 'Hẹn nhau ở sân khấu',
  listening: 'Góc nghe', archive: 'Những đêm đã qua', wardrobe: 'Diện mạo của bạn',
  capsules: 'Kệ kỷ niệm', calendar: 'Lịch hẹn của bạn', bag: 'Túi đồ của bạn',
  membership: 'Gắn bó cùng nhà nhạc', support: 'Cần một chút giúp đỡ?', artist: 'Gặp chủ nhà', showcase: 'Trưng bày trong phòng',
};
const aliases: Record<string, string> = { follows: 'calendar', history: 'archive', orders: 'bag', benefits: 'membership' };


export function FanWorldView() {
  const { state, dispatch } = useApp();
  const tenantConfig = getTenantConfig(state.activeTenantId);
  const { worldId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const isRoom = pathname === '/me' || pathname.endsWith('/archive');
  const collection = isRoom && (params.get('section')==='collection' || !!params.get('custom') || pathname.endsWith('/archive'));
  function selectSpace(section:string){const q=new URLSearchParams();if(section==='collection')q.set('section','collection');navigate(`/me${q.size?'?'+q:''}`);}
  const place = (isRoom?'myspace':pathname.endsWith('/moments')?'moments':pathname.endsWith('/archive')?'archive':'moments') as PlaceId;
  const savedWorld = state.fanProfile.worldJourney?.lastWorldId;
  const selectedArtist = worldId || params.get('artist') || savedWorld || state.followedWorldIds[0] || Object.keys(state.worlds)[0];
  const isShared = isRoom || place === 'archive';
  const world = state.worlds[isShared ? (Object.keys(state.worlds)[0] || '') : selectedArtist];
  const rawPanel = params.get('panel') || params.get('zone') || params.get('drawer') || (pathname === '/worlds' ? 'worlds' : '');
  const panel = rawPanel === 'shop' ? 'bag' : (aliases[rawPanel] || rawPanel);
  const activePanel = panelTitles[panel] ? panel : '';
  const ownPanel = useRef(false);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [slot, setSlot] = useState<0 | 1 | 2>(0);
  const sessions = Object.values(state.sessions);
  const note = ARTIST_NOTES.find(n => n.worldId === world?.id);
  const noteRead = !!note && !!state.fanProfile.worldJourney?.readNoteIds.includes(note.id);
  const capsules = Object.values(state.capsules).filter(c => c.fanId === state.fanProfile.id);
  const savedCapsules = capsules.filter(c => c.isSaved);
  const slots = state.fanProfile.showcaseSlots || [null, null, null];
  const orders = Object.values(state.orders).filter(o => o.fanId === state.fanProfile.id);

  useEffect(() => {
    if (world && !isShared) dispatch({ type: 'VISIT_FAN_WORLD', worldId: world.id });
  }, [world?.id, isShared, dispatch]);
  useEffect(() => {
    if (rawPanel === 'shop' && world) navigate(`/worlds/${world.id}/shop`, { replace: true });
  }, [rawPanel, world?.id, navigate]);

  function open(name: string) {
    const target = PANEL_HOME[name];
    if (name === 'worlds') { navigate('/artists'); return; }
    if (target && target !== place) { navigate(panelRoute(name,isShared?undefined:world?.id)); return; }
    if (!activePanel) ownPanel.current = true;
    const nextParams = new URLSearchParams(params);nextParams.set('panel',name);
    setParams(nextParams, { replace: !!activePanel });
  }
  function close() {
    if (ownPanel.current) { ownPanel.current = false; navigate(-1); }
    else if (pathname === '/worlds') navigate('/', { replace: true });
    else { const nextParams=new URLSearchParams(params);['panel','zone','drawer'].forEach(k=>nextParams.delete(k));setParams(nextParams, { replace: true }); }
  }
  if (!world) return <section className="fw-empty"><h1>Chưa tìm thấy nhà nhạc này</h1><Link className="fw-button" to="/">Về thế giới</Link></section>;
  const ip = world.type === 'ip';
  const artistAsset = world.avatarAssetId ? state.avatarAssets[world.avatarAssetId] : undefined;
  const canShowArtist = artistAsset?.status === 'approved';

  const list = (panel === 'calendar' ? sessions.filter(s => state.rsvpdSessionIds.includes(s.id) && (isShared || s.worldId===world.id))
    : sessions.filter(s => (isShared || s.worldId === world.id) && (panel !== 'listening' || s.format === 'listening') && (panel !== 'concerts' || s.format === 'concert') && (panel === 'archive' ? s.replayStatus === 'available' : !['ended','cancelled'].includes(s.status)))).sort((a,b)=>a.scheduledStartTime.localeCompare(b.scheduledStartTime));

  return <div className={`fw-experience vw-place-page vw-page-${place}`}>
    {isRoom ? <div className="fw-world-topline"><span className="fw-location">Phòng & danh thiếp của bạn</span><span className="fw-world-caption">Diện mạo hôm nay, để bạn bè nhận ra mình.</span><button className="fw-text-button" onClick={() => open('bag')}><ShoppingBag size={16}/>Túi đồ ({orders.length})</button></div> : place==='artist' ? null : place==='moments' ? <div className="vx-context-bar"><Link className="fw-text-button" to="/artists">← Khám phá nghệ sĩ</Link><label>Nhà nghệ sĩ<select aria-label="Chọn nhà nghệ sĩ" value={world.id} onChange={e=>navigate(`/moments?artist=${e.target.value}`)}>{Object.values(state.worlds).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></label></div> : <div className="vx-context-bar">Bộ sưu tập cá nhân · từ mọi artist bạn yêu mến</div>}
    <header className="fw-scene-heading">
      <div><p className="fw-eyebrow">{isRoom ? 'MY LITTLE CORNER' : place!=='artist' ? 'CÙNG NGHỆ SĨ, GẦN HƠN MỖI NGÀY' : ip ? 'CHƯƠNG TRÌNH / IP · TEAM HOSTED' : 'A LITTLE CLOSER, TOGETHER'}</p>
        <h1>{isRoom ? `My Space · ${state.fanProfile.displayName.split(' ')[0]}` : place==='artist'||place==='moments' ? `Moments · ${world.name}` : PLACE_INFO[place].title}<span>{PLACE_INFO[place].subtitle}</span></h1>
      </div>
      {(place==='artist'||place==='moments') && <button className={`fw-follow ${state.followedWorldIds.includes(world.id) ? 'following' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_FOLLOW', worldId: world.id })} aria-pressed={state.followedWorldIds.includes(world.id)}><Heart size={16} />{state.followedWorldIds.includes(world.id) ? 'Đang theo dõi' : 'Theo dõi nhà nhạc'}</button>}
    </header>

    {isRoom?<><nav className="v7-space-tabs" aria-label="Các phần My Space"><button aria-pressed={!collection} onClick={()=>selectSpace('room')}>Phòng trưng bày</button><button aria-pressed={collection} onClick={()=>selectSpace('collection')}>Bộ sưu tập riêng</button></nav>{collection?<><p className="v7-private-note">Chỉ mình bạn thấy toàn bộ bộ sưu tập và ghi chú. Trưng bày từng món trong phòng là một lựa chọn riêng.</p><details className="v8-private-tools"><summary>Nhật ký, phiên xem lại & đơn hàng</summary><div className="v7-collection-tools"><button className="fw-text-button" onClick={()=>open('capsules')}>Nhật ký & kỷ niệm →</button><button className="fw-text-button" onClick={()=>open('archive')}>Các phiên xem lại →</button><button className="fw-text-button" onClick={()=>open('bag')}>Đồ đã nhận & đơn hàng →</button></div></details><CollectionBrowser/></>:<><PersonalDisplayRoom onOpen={open}/><PublicIdentity/></>}</>:<ArtistCommunity key={world.id} worldId={world.id} onOpen={open}/>}

    {activePanel && <WorldPanel title={panelTitles[activePanel]} onClose={close}>
      {panel === 'livechat' && <ArtistBroadcast worldId={world.id}/>}
      {panel === 'concerts' && !isShared && <ArtistBroadcast worldId={world.id} format="concert"/>}
      {panel === 'hall' && (isShared ? <><p>Chọn hội của artist bạn muốn ghé. Theo dõi không tự cấp membership.</p>{Object.values(state.worlds).map(w=><Link className="fw-destination" key={w.id} to={`/moments?artist=${w.id}&panel=hall`}><Heart/><div><strong>{w.name}</strong><p>Kiểm tra membership và ghé Hall</p></div><ArrowRight/></Link>)}</> : <HallPanel worldId={world.id} />)}
      {panel === 'worlds' && <><p className="fw-muted">Mỗi nhà nhạc là một thế giới. Bạn vẫn là bạn ở mọi nơi.</p>{Object.values(state.worlds).map(w => <Link className="fw-destination" key={w.id} to={`/worlds/${w.id}`}><span className={w.type === 'ip' ? 'neon' : ''}>{w.type === 'ip' ? <Disc3 /> : <Music2 />}</span><div><strong>{w.name}</strong><p>{w.type === 'artist' ? 'Ghé chơi, nghe nhạc, gặp artist.' : 'Những âm thanh và cuộc gặp mới.'}</p></div><ArrowRight size={19} /></Link>)}<Link className="fw-destination" to="/me"><span><BookOpen /></span><div><strong>Phòng của bạn</strong><p>Về với những kỷ niệm đã giữ.</p></div><ArrowRight size={19} /></Link></>}
      {panel === 'artist' && <div className="fw-artist-story">{canShowArtist && <AvatarRenderer role="artist" accessoryId={artistAsset?.parts.accessory} outfitId={artistAsset?.parts.outfit} size="preview" isFrozen displayName={world.name} />}<p className="fw-eyebrow">{ip ? 'CHƯƠNG TRÌNH ĐẶC BIỆT' : 'NGHỆ SĨ ĐỒNG HÀNH'} · DEMO</p><h3>{world.name}</h3><p>{world.description}</p><button className="fw-button" onClick={() => open('news')}>Đọc lời nhắn từ nhà nhạc <ArrowRight size={16} /></button></div>}
      {panel === 'news' && (note ? <article className="fw-note"><p className="fw-eyebrow">{note.author} · Bài đăng mẫu</p><time>{momentTime(note.publishedAt)}</time><h3>{note.title}</h3><p>{note.body}</p><div className="fw-note-signature">Hẹn gặp ở nhà nhạc,<br /><strong>{note.author}</strong></div><button className="fw-button" onClick={() => dispatch({ type: 'READ_ARTIST_NOTE', noteId: note.id })} disabled={noteRead}>{noteRead ? <><Check size={17} /> Đã giữ lời nhắn</> : <><Heart size={17} /> Giữ lời nhắn này</>}</button>{note.sessionId && state.sessions[note.sessionId] && <Link className="fw-destination" to={`/sessions/${note.sessionId}`}><CalendarDays /><div><strong>{state.sessions[note.sessionId].title}</strong><p>{momentTime(state.sessions[note.sessionId].scheduledStartTime)}</p></div><ArrowRight /></Link>}</article> : <p>Nhà nhạc chưa có lời nhắn mới.</p>)}
      {['sessions', 'concerts', 'listening', 'archive', 'calendar'].includes(panel) && <>
        <p className="fw-muted">{panel === 'calendar' ? 'Lịch đã nhắc của bạn. RSVP là lời nhắc, chưa phải vé vào cửa.' : panel === 'archive' ? 'Các bản ghi được phép xem lại. Xem lại không tính là tham dự trực tiếp.' : 'Chọn một cuộc hẹn. Nhạc chỉ phát khi bạn chủ động bật.'}</p>
        {!list.length && <div className="fw-empty"><CalendarDays size={35} /><h3>{panel === 'calendar' ? 'Mình chưa có lịch hẹn nào.' : 'Chưa có phiên phù hợp.'}</h3><button className="fw-button" onClick={() => open(panel === 'sessions' ? 'worlds' : 'sessions')}>{panel === 'sessions' ? 'Ghé nhà nhạc khác' : 'Xem lịch nhà nhạc'}</button></div>}
        {list.map(s => <article className="fw-event-row" key={s.id}><small>{state.worlds[s.worldId]?.name} · {momentTime(s.scheduledStartTime)}{s.status === 'running' ? ' · LIVE · DEMO' : s.status === 'cancelled' ? ' · Đã hủy' : s.status === 'ended' ? ' · Đã kết thúc' : ' · DEMO'}</small><h3>{s.title}</h3><div><Link className="fw-button" to={`/sessions/${s.id}`}>{s.replayStatus === 'available' && s.status === 'ended' ? 'Xem lại' : 'Ghé sân khấu'}<ArrowRight size={16} /></Link>{['scheduled', 'open', 'running'].includes(s.status) && <button className="fw-text-button" onClick={() => dispatch({ type: 'TOGGLE_RSVP', sessionId: s.id })}>{state.rsvpdSessionIds.includes(s.id) ? 'Hủy nhắc lịch' : 'Nhắc mình'}</button>}</div></article>)}
        {panel === 'sessions' && <button className="fw-text-button" onClick={() => open('archive')}>Xem những đêm đã qua <ArrowRight size={16} /></button>}
      </>}
      {panel === 'wardrobe' && <><p className="fw-muted">Chọn một chi tiết của riêng mình. Diện mạo này theo bạn ở mọi nhà nhạc.</p><FanAvatarCustomizer/><DigitalCloset /></>}
      {panel === 'capsules' && <>
        <p className="fw-muted">Kỷ niệm từ những phiên bạn đã tham dự. Bỏ khỏi kệ vẫn giữ trong bộ sưu tập.</p>
        <Link className="fw-text-button" to="/me?section=collection&type=ticket">Chọn kỷ niệm công khai trong My Space ↗</Link>
        {!capsules.length && <div className="fw-empty"><Sparkles size={35} /><h3>Để dành một chỗ cho đêm đầu tiên.</h3><p>Tham dự một phiên đủ điều kiện để nhận kỷ niệm của riêng bạn.</p><Link className="fw-button" to="/moments?panel=sessions">Tìm một cuộc hẹn <ArrowRight size={16} /></Link></div>}
        {capsules.map(c => <article key={c.id} className="fw-event-row"><small>{state.worlds[c.worldId]?.name}</small><h3>{state.sessions[c.sessionId]?.title || 'Kỷ niệm của bạn'}</h3><form className="fw-keepsake-note" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); dispatch({ type: 'SAVE_CAPSULE', capsuleId: c.id, privateNote: String(data.get('note') || ''), isSaved: c.isSaved }); setSavedNoteId(c.id); }}><label htmlFor={`note-${c.id}`}>Ghi chú riêng</label><textarea id={`note-${c.id}`} name="note" onChange={() => setSavedNoteId(null)} defaultValue={c.privateNote || ''} maxLength={1000} rows={2} /><button className="fw-text-button" type="submit">Giữ ghi chú</button>{savedNoteId === c.id && <small role="status">Đã giữ ghi chú riêng.</small>}</form><div><button className="fw-text-button" onClick={() => dispatch({ type: 'SAVE_CAPSULE', capsuleId: c.id, isSaved: !c.isSaved })}>{c.isSaved ? 'Bỏ lưu' : 'Lưu kỷ niệm'}</button></div></article>)}
      </>}
      {panel === 'showcase' && <>
        <p className="fw-muted">Chỉ chọn những kỷ niệm đã lưu để trưng bày. Quản lý ghi chú trong Bộ sưu tập riêng.</p>
        <div className="fw-slot-picker" aria-label="Chọn ô trên kệ">{slots.map((id,i)=><button key={i} aria-label={`Ô ${i+1}`} aria-pressed={slot===i} onClick={()=>setSlot(i as 0|1|2)}><span>{id?'✦':'+'}</span>Ô {i+1}</button>)}</div>
        {slots[slot]&&<button className="fw-text-button" onClick={()=>dispatch({type:'CLEAR_SHOWCASE_SLOT',slotIndex:slot})}>Bỏ kỷ niệm khỏi ô {slot+1}</button>}
        {!savedCapsules.length&&<p>Chưa có kỷ niệm đã lưu để trưng bày.</p>}
        {savedCapsules.map(c=><article className="fw-event-row" key={c.id}><small>{state.worlds[c.worldId]?.name}</small><h3>{state.sessions[c.sessionId]?.title||'Kỷ niệm của bạn'}</h3><button className="fw-button" onClick={()=>dispatch({type:'SET_SHOWCASE_SLOT',slotIndex:slot,capsuleId:c.id})}>{slots[slot]===c.id?'Đang ở ô này':`Đặt vào ô ${slot+1}`}</button></article>)}
        <Link className="fw-text-button" to="/me?section=collection&panel=capsules">Mở bộ sưu tập riêng →</Link>
      </>}
      {panel === 'bag' && <><p className="fw-muted">Những món đồ đi cùng hành trình của {state.fanProfile.displayName}.</p>{!orders.length && <div className="fw-empty"><Package size={36} /><h3>Túi đồ đang nhẹ tênh.</h3><p>Ghé {tenantConfig.labels.shopTitle} tìm một món mình thích.</p><Link className="fw-button" to="/shop">Mở {tenantConfig.labels.shopTitle} <ArrowRight size={16} /></Link></div>}{orders.map(o => <Link className="fw-destination" key={o.id} to={`/orders/${o.id}`}><Package /><div><strong>{state.products[o.productId]?.title || 'Đơn hàng'}</strong><p>{ORDER_LABELS[o.status]}</p></div><ArrowRight size={18} /></Link>)}<button className="fw-destination" onClick={() => open('membership')}><Gift /><div><strong>Hội viên & quyền lợi</strong><p>Xem quyền lợi gắn với nhà nhạc.</p></div><ArrowRight size={18} /></button><button className="fw-destination" onClick={() => open('support')}><Mail /><div><strong>Cần hỗ trợ?</strong><p>Theo dõi yêu cầu hoặc mở từ đơn hàng.</p></div><ArrowRight size={18} /></button></>}
      {panel === 'membership' && <><p className="fw-muted">Theo dõi là miễn phí. Hội viên và quyền lợi được quản lý riêng cho từng nhà nhạc; mọi giao dịch ở đây đều là mô phỏng.</p>{Object.values(state.worlds).map(w => <MembershipCard key={w.id} world={w} membership={Object.values(state.memberships).find(m => m.fanId === state.fanProfile.id && m.worldId === w.id)} isFollowed={state.followedWorldIds.includes(w.id)} onToggleFollow={() => dispatch({ type: 'TOGGLE_FOLLOW', worldId: w.id })} onUpgrade={() => dispatch({ type: 'UPGRADE_MEMBERSHIP', worldId: w.id })} />)}{Object.values(state.benefits).filter(b => b.fanId === state.fanProfile.id).map(b => <BenefitCard key={b.id} benefit={b} onClaim={benefitId => dispatch({ type: 'CLAIM_BENEFIT', benefitId })} />)}</>}
      {panel === 'support' && <><p>Mở đơn hàng trong túi đồ rồi chọn hỗ trợ; thông tin món hàng sẽ được điền sẵn.</p><button className="fw-button" onClick={() => open('bag')}>Xem đơn hàng</button>{Object.values(state.supportCases).filter(c => c.fanId === state.fanProfile.id).map(c => <Link className="fw-destination" key={c.id} to={`/support/${c.id}`}><Mail /><div><strong>Yêu cầu về {c.subjectType === 'order' ? 'đơn hàng' : 'quyền lợi'}</strong><p>{c.nextAction}</p></div><ArrowRight /></Link>)}</>}
    </WorldPanel>}
  </div>;
}
