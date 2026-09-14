import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ARTIST_NOTES, momentTime } from '../world/fanWorld';
import { MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import { getTenantConfig } from '../domain/tenantConfig';
import { HallPanel } from './HallPanel';
import { ArtistBroadcast } from './ArtistBroadcast';
import { getArtistChatMeta } from '../data/artistChatConfig';

export function ArtistCommunity({worldId,onOpen}:{worldId:string;onOpen:(panel:string)=>void}){
 const {state,dispatch}=useApp();
 const tenantConfig = getTenantConfig(state.activeTenantId);
 const chatMeta = getArtistChatMeta(worldId, undefined, state.worlds[worldId]?.name);
 const [tab,setTab]=useState('home');const [savedOnly,setSavedOnly]=useState(false);const [selectedLive,setSelectedLive]=useState('');
 const [cheers, setCheers] = useState<Record<string, number>>({
   'acoustic-letter': 42,
   'neon-letter': 38,
 });
 const [userCheered, setUserCheered] = useState<Record<string, boolean>>({});

 const toggleCheer = (noteId: string) => {
   setCheers(prev => ({
     ...prev,
     [noteId]: (prev[noteId] || 40) + (userCheered[noteId] ? -1 : 1),
   }));
   setUserCheered(prev => ({
     ...prev,
     [noteId]: !prev[noteId],
   }));
 };

 const world=state.worlds[worldId];
 const sessions=Object.values(state.sessions).filter(s=>s.worldId===worldId&&!['ended','cancelled'].includes(s.status)).sort((a,b)=>a.scheduledStartTime.localeCompare(b.scheduledStartTime));
 const broadcasts=sessions.filter(s=>s.format==='dropin'||s.format==='concert').sort((a,b)=>Number(b.status==='running')-Number(a.status==='running'));const active=broadcasts.find(s=>s.id===selectedLive)||broadcasts[0];
 const products=Object.values(state.products).filter(p=>p.worldId===worldId&&p.tenantId===state.activeTenantId&&p.isAvailable&&p.image);
 const notes=ARTIST_NOTES.filter(n=>n.worldId===worldId);
 const tabs=[['home','Nhà nghệ sĩ'],['live','Live & Concert'],['calendar','Lịch hẹn'],['hall','Hall hội viên'],['merch','Merchandise']];
 return <section className="v6-community">
  <nav className="v6-community-tabs" aria-label={`Các góc nhà ${world.name}`}>{tabs.map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
  {tab==='home'&&<div className="v6-community-home"><div><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}><p className="fw-eyebrow" style={{ margin: 0 }}>TỪ {world.name.toLocaleUpperCase('vi')}</p><span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', background: 'var(--surface-subtle)', padding: '3px 10px', borderRadius: '12px', border: '1px solid var(--border)' }}>✦ Đồng hành cùng {world.name} {chatMeta.companionDays} ngày</span></div><h2>Những điều muốn kể cùng bạn</h2>{notes.map(n=><article className="v6-artist-post" key={n.id}><small>{n.author} · Bài đăng mẫu · {momentTime(n.publishedAt)}</small><h3>{n.title}</h3><p>{n.body}</p><div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}><button className="v7-cheer-btn" onClick={() => toggleCheer(n.id)} aria-label="Cổ vũ bài viết"><Heart size={14} fill={userCheered[n.id] ? '#E11D48' : 'none'} /><span>{userCheered[n.id] ? 'Đã cổ vũ' : 'Cổ vũ'} · {cheers[n.id] || 40}</span></button><button className="fw-text-button" disabled={state.fanProfile.worldJourney?.readNoteIds.includes(n.id)} onClick={()=>dispatch({type:'READ_ARTIST_NOTE',noteId:n.id})}>{state.fanProfile.worldJourney?.readNoteIds.includes(n.id)?'♥ Đã giữ lời nhắn':'♡ Giữ lời nhắn'}</button></div></article>)}{!notes.length&&<p>Chưa có bài đăng. Mình ghé lịch hẹn hoặc trò chuyện với hội viên nhé.</p>}</div><aside><p className="fw-eyebrow">HẸN GẦN NHẤT</p>{sessions[0]?<><h3>{sessions[0].title}</h3><p>{momentTime(sessions[0].scheduledStartTime)}</p><Link className="fw-button" to={`/sessions/${sessions[0].id}`}>Xem buổi hẹn ↗</Link></>:<p>Chưa có lịch mới được công bố.</p>}<hr/><h3>Khi artist chưa lên sóng</h3><p>Dù nghệ sĩ đang nghỉ ngơi, góc Fandom Hall vẫn luôn sáng đèn để các bạn trò chuyện, kết bạn và cùng chia sẻ tình yêu âm nhạc 24/7.</p><button className="fw-text-button" onClick={()=>setTab('hall')}>Ghé Hall hội viên →</button><button className="fw-text-button" onClick={()=>onOpen('artist')}>Về {world.name} →</button></aside></div>}
  {tab==='live'&&<section className="v8-live"><header className="v5-section-heading"><div><h2>Live & Concert</h2><p>Nghe cùng nhau, trò chuyện cùng {world.name}.</p></div><button className="fw-text-button" onClick={()=>setTab('calendar')}>Lịch phát sóng →</button></header>{active?<div className="v8-live-layout"><div><h3>{active.title}</h3><ArtistBroadcast worldId={worldId} sessionId={active.id} format={active.format==='concert'?'concert':'dropin'}/></div><aside aria-label="Chọn buổi phát"><h3>Các buổi phát</h3>{broadcasts.map(s=><button key={s.id} aria-pressed={s.id===active.id} onClick={()=>setSelectedLive(s.id)}><small>{s.format==='concert'?'♫ Concert':'◉ Trò chuyện'} · {s.status==='running'?'Đang diễn ra · Demo':'Lịch dự kiến'}</small><strong>{s.title}</strong><time>{momentTime(s.scheduledStartTime)}</time></button>)}<p>Tham gia phòng phát trực tiếp để trò chuyện, gửi câu hỏi và cổ vũ nghệ sĩ theo thời gian thực.</p></aside></div>:<p>Chưa có buổi phát được lên lịch. Mình vẫn có thể ghé Hall gặp hội viên.</p>}</section>}
  {tab==='calendar'&&<><div className="v5-section-heading"><h2>Lịch của {world.name}</h2><button className="fw-text-button" aria-pressed={savedOnly} onClick={()=>setSavedOnly(!savedOnly)}>{savedOnly?'Hiện toàn bộ lịch artist':'Chỉ lịch mình đã hẹn'}</button></div><p>Lưu lịch để nhớ cuộc hẹn; lời nhắc không phải vé vào cửa.</p>{sessions.filter(s=>!savedOnly||state.rsvpdSessionIds.includes(s.id)).map(s=><article className="fw-event-row" key={s.id}><small>{momentTime(s.scheduledStartTime)} · {s.format==='concert'?'Online concert':s.format==='listening'?'Nghe cùng nhau':'Livestream'} · Demo</small><h3>{s.title}</h3><div><Link className="fw-button" to={`/sessions/${s.id}`}>Chi tiết buổi hẹn →</Link><button className="fw-text-button" onClick={()=>dispatch({type:'TOGGLE_RSVP',sessionId:s.id})}>{state.rsvpdSessionIds.includes(s.id)?'Hủy nhắc lịch':'Nhắc mình'}</button></div></article>)}{!sessions.some(s=>!savedOnly||state.rsvpdSessionIds.includes(s.id))&&<p>Chưa có cuộc hẹn trong mục này.</p>}<Link className="fw-text-button" to="/me?section=collection">Xem lại trong bộ sưu tập của tôi ↗</Link></>}
  {tab==='hall'&&<><h2>Ở lại vì những người bạn.</h2><p>Giao lưu và ghé My Space của hội viên, kể cả khi artist không live. Cuộc trò chuyện hiện là bản demo trên thiết bị.</p><HallPanel worldId={worldId}/></>}
  {tab==='merch'&&<><div className="v5-section-heading"><h2>Mang một chút {world.name} về nhà</h2><Link className="fw-text-button" to={`/shop?artist=${worldId}`}>Mở {tenantConfig.labels.shopTitle} của artist ↗</Link></div><p>Hàng thật và đồ digital được ghi riêng. Chọn món để xem phiên bản, thử đồ và đặt mua tại {tenantConfig.labels.shopTitle}.</p><div className="v6-community-merch">{products.slice(0,6).map(p=><Link key={p.id} to={`/shop?artist=${worldId}&product=${p.id}`}><img src={`${MERCH_IMAGE_ROOT}/${p.image}.png`} alt={p.title}/><small>{p.delivery==='digital'?'Digital':p.delivery==='bundle'?'Hàng thật + Digital':'Hàng thật'}</small><h3>{p.title}</h3><span>{p.priceVND.toLocaleString('vi-VN')} ₫</span></Link>)}</div></>}
 </section>;
}
