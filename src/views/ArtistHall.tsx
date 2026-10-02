import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BarChart3, Check, Crown, Gift, Heart, ImagePlus, Mail, MessageCircle, MoreHorizontal, Pin, Reply, Send, Smile, Tv, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Session } from '../domain/types';
import { canEnterHall } from '../world/merchCatalog';
import { isDemoSignedIn } from '../world/account';
import { getWorldMoments, getWorldProject, type ExploreMedia } from '../world/exploreRows';
import { artistRooms, hallEntries, canWriteArtistHallRoom } from '../world/artistPresentation';
import { ARTIST_NOTES } from '../world/fanWorld';
import { sessionContextUrl } from '../world/worldContext';
import { MembershipBadge } from '../components/MembershipBadge';
import { memberForChat, membershipTenure } from '../world/membershipBadge';
import { ArtistVisualRail } from '../components/ArtistVisualRail';
import { ArtistNavAvatar } from '../components/GlobalNavigation';

const art = (media: ExploreMedia) => ({backgroundImage:`url("${media.src}")`, ...(media.panel === undefined ? {} : {backgroundSize:'300% auto',backgroundPosition:`${media.panel*50}% center`})});
export function ArtistHall({ artistId, name, sessions: _sessions }: { artistId: string; name: string; sessions: Session[] }) {
  const { state, dispatch } = useApp();
  const [params, setParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [threadId,setThreadId] = useState<string>();
  const [replyTo,setReplyTo] = useState<string>();
  const [attachments,setAttachments] = useState<string[]>([]);
  const [picker,setPicker] = useState<'media'|'emoji'|null>(null);
  const [letter,setLetter] = useState('');
  const [letterSaved,setLetterSaved] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const member = canEnterHall(state, artistId);
  const rooms = artistRooms(state,artistId,params.get('room')||undefined);
  const selected = rooms.find(room => room.id === params.get('room')) || rooms[0];
  const writable=member && canWriteArtistHallRoom(state,artistId,selected.id);
  const entries = hallEntries(state,artistId,selected.id);
  const highlightedId = params.get('message');
  const highlightedReplyParent = entries.find(entry=>entry.id===highlightedId)?.replyToId;
  const highlightedRootId = highlightedReplyParent || highlightedId;
  const highlightedEntry = useRef<HTMLElement | null>(null);
  const messageLog = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (member && highlightedReplyParent) setThreadId(highlightedReplyParent);
  }, [member, highlightedReplyParent]);
  useEffect(() => {
    if (!member || !highlightedId || !highlightedEntry.current || !messageLog.current) return;
    const log=messageLog.current;
    const top=highlightedEntry.current.getBoundingClientRect().top-log.getBoundingClientRect().top+log.scrollTop-16;
    // Only the conversation scrolls; opening a bubble must not yank the whole page.
    log.scrollTo?.({top:Math.max(0,top),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }, [member, highlightedId, highlightedRootId, selected.id]);
  const thread = entries.find(entry=>entry.id===threadId);
  const reply = entries.find(entry=>entry.id===replyTo);
  const moments = getWorldMoments(artistId);
  const project = state.activeTenantId === 'vieworld-demo' ? getWorldProject(artistId) : undefined;
  const running = selected.session?.status==='running' && selected.session.artistPresence==='present' ? selected.session : undefined;
  const note = state.activeTenantId==='vieworld-demo' ? ARTIST_NOTES.find(item=>item.worldId===artistId && Date.parse(item.publishedAt)<=Date.parse(state.demoTime) && (!item.sessionId || item.sessionId===selected.id || selected.kind==='general')) : undefined;
  const poll = Object.values(state.polls).find(item => item.tenantId===state.activeTenantId && item.sessionId===selected.id);
  const totalVotes = poll?.options.reduce((sum,option)=>sum+option.votes,0) || 0;
  function chooseRoom(id:string) { setParams({room:id}); setThreadId(undefined); setMessage(''); setReplyTo(undefined); setAttachments([]); setPicker(null); }
  function submit(event: FormEvent) {
    event.preventDefault();
    const text = message.trim() || (attachments.length ? 'Một vài khoảnh khắc muốn chia sẻ cùng mọi người.' : '');
    if (!text || !writable) return;
    dispatch({ type: 'SEND_HALL_MESSAGE', worldId: artistId, roomId: selected.id, text, requestId: crypto.randomUUID(), replyToId:reply?.id, momentIds:attachments });
    setMessage(''); setReplyTo(undefined); setAttachments([]); setPicker(null);
  }
  return <div className="artist-world-body artist-hall-page">
    <header className="artist-inner-heading"><div><h2>Hall</h2><p>Nơi mọi người đang tụ lại.</p></div><span><Crown size={14}/> Dành cho hội viên</span></header>
    <section className="artist-hall-rooms" aria-labelledby="artist-hall-rooms-title">
      <Link className="presence-hall-membership" to={`/memberships?artist=${artistId}`}><Crown size={18}/><strong>{member?'Hội viên của '+name:'Cùng cộng đồng của '+name}</strong><small>{member?'Hall, quyền lợi và những cuộc hẹn của bạn.':'Trò chuyện trong Hall dành cho hội viên.'}</small></Link>
      <h3 id="artist-hall-rooms-title">Đang tụ lại</h3>
      <ArtistVisualRail label="Các phòng trong Hall" className="artist-hall-room-grid">{rooms.map(room => <button key={room.id} type="button" aria-pressed={selected.id === room.id} onClick={()=>chooseRoom(room.id)}>
        <span className="artist-room-art" style={art(room.media)} aria-hidden="true"/><span className="artist-room-copy"><strong>{room.kind==='live' ? <Tv size={18}/> : room.kind==='project' ? <Gift size={18}/> : <MessageCircle size={18}/>} {room.title}</strong><small>{room.description}</small><em>{room.session?.status==='ended'?'Đã khép lại · Chỉ đọc':room.kind==='live' ? '● Đang xem cùng nhau' : room.kind==='project' ? 'Đang mở · Minh họa' : 'Vào trò chuyện'}</em></span>
      </button>)}</ArtistVisualRail>
    </section>
    <div className="artist-hall-layout">
      <section className="artist-hall-conversation" aria-label={`Trò chuyện trong ${selected.title}`}>
        <header><span className="artist-room-art" style={art(selected.media)} aria-hidden="true"/><div><h3>{selected.title}</h3><p>{selected.description}</p></div><details className="artist-room-menu"><summary aria-label="Tùy chọn phòng"><MoreHorizontal size={19}/></summary><div>{selected.session && <Link to={sessionContextUrl(artistId,selected.id)}>Mở hoạt động <ArrowRight size={14}/></Link>}<p>Tin nhắn ở lại Hall. Muốn chia sẻ ra ngoài, cần bật quyền chia sẻ, đồng ý cho từng tin và được duyệt.</p><Link to="/account/settings">Cài đặt quyền chia sẻ →</Link></div></details></header>
        {member ? <><div ref={messageLog} className="artist-hall-messages" role="log" aria-label="Tin nhắn trong Hall">
          {note&&<article className="presence-hall-note" aria-label="Lời nhắn mẫu được ghim"><ArtistNavAvatar artist={{id:artistId,name}}/><div><header><strong>{name}</strong><small><Pin size={12}/> Bài ghim · Minh họa</small></header><p>{note.body}</p></div></article>}
          {entries.filter(item=>!item.replyToId).map((item,index)=>{
            const likedBy=state.hallReactions?.[artistId]?.[item.id] || [];
            const parent=entries.find(entry=>entry.id===item.replyToId);
            const replies=entries.filter(entry=>entry.replyToId===item.id).length;
            return <article key={item.id} ref={item.id===highlightedRootId?highlightedEntry:undefined} className={item.id===highlightedRootId?'presence-hall-source':''} aria-label={item.id===highlightedRootId?'Lời nhắn được mở từ cộng đồng':undefined}><span className="artist-hall-person">{item.authorName.replace('@','').slice(0,1).toUpperCase()}</span><div className="artist-message-content"><header><strong>{item.authorName} <MembershipBadge artistId={artistId} months={item.isSample ? [0,3,12][index%3] : membershipTenure(memberForChat(state,artistId,item.fanId),state.demoTime)} demo={item.isSample}/></strong><small>{item.isSample ? 'Minh họa' : new Date(item.timestamp).toLocaleTimeString('vi',{hour:'2-digit',minute:'2-digit'})}</small></header>
              {parent && <q className="artist-message-parent">{parent.authorName}: {parent.text}</q>}<p>{item.text}</p>
              {item.momentIds?.length ? <div className="artist-chat-attachments">{item.momentIds.map(id=>{const moment=moments.find(m=>m.id===id);return moment && <Link key={id} to={moment.targetUrl} state={{fromArtist:`/artist/${artistId}/hall?room=${selected.id}`}} aria-label={`Xem ${moment.title}`}><span style={art(moment.media)}/></Link>;})}</div> : null}
              <div className="artist-message-actions"><button type="button" aria-label={`Thích lời nhắn của ${item.authorName}`} aria-pressed={likedBy.includes(state.fanProfile.id)} disabled={!writable} onClick={()=>dispatch({type:'TOGGLE_HALL_REACTION',worldId:artistId,roomId:selected.id,messageId:item.id})}><Heart size={14} fill={likedBy.includes(state.fanProfile.id)?'currentColor':'none'}/>{likedBy.length || ''}</button>
                <button type="button" onClick={()=>{setThreadId(item.id);if(writable){setReplyTo(item.id);input.current?.focus();}}}><Reply size={14}/> {replies ? `${replies} trả lời` : 'Trả lời'}</button>
                {!item.isSample && <details><summary aria-label={`Tùy chọn lời nhắn của ${item.authorName}`}><MoreHorizontal size={14}/></summary>{item.fanId===state.fanProfile.id&&<button type="button" onClick={()=>dispatch({type:'SET_HALL_PUBLIC_CONSENT',worldId:artistId,messageId:item.id,consent:!item.explorePreviewConsent})}>{item.explorePreviewConsent?'Rút đồng ý chia sẻ':'Cho phép xét chia sẻ công khai'}</button>}<button type="button" onClick={()=>dispatch({type:'REPORT_HALL_MESSAGE',worldId:artistId,messageId:item.id})}>Ẩn và báo cáo</button></details>}
              </div></div></article>;
          })}
          {!entries.length && <p className="artist-hall-empty">Chưa có lời nhắn trong phòng này. Bạn có thể mở đầu cuộc trò chuyện.</p>}
        </div>{!writable&&<p className="presence-hall-readonly" role="status">{selected.session?.status==='ended'?'Phòng đã khép lại. Bạn vẫn có thể đọc lại cuộc trò chuyện.':'Phòng đang tạm dừng trò chuyện.'}</p>}<fieldset disabled={!writable} className="artist-composer-area">
          {reply && <div className="artist-composer-reply">Trả lời {reply.authorName}<button type="button" aria-label="Hủy trả lời" onClick={()=>setReplyTo(undefined)}><X size={15}/></button></div>}
          {!!attachments.length && <div className="artist-composer-reply">{attachments.length} khoảnh khắc được chọn<button type="button" aria-label="Gỡ khoảnh khắc đã chọn" onClick={()=>setAttachments([])}><X size={15}/></button></div>}
          {picker==='media' && <div className="artist-media-picker" aria-label="Chọn khoảnh khắc để chia sẻ">{moments.slice(0,8).map(moment=><button key={moment.id} type="button" aria-pressed={attachments.includes(moment.id)} disabled={!attachments.includes(moment.id) && attachments.length===3} onClick={()=>setAttachments(ids=>ids.includes(moment.id)?ids.filter(id=>id!==moment.id):[...ids,moment.id])}><span style={art(moment.media)}/><small>{moment.title}</small></button>)}<small>Chọn tối đa 3 khoảnh khắc công khai.</small></div>}
          {picker==='emoji' && <div className="artist-emoji-picker">{['💙','✨','🎶','😭','👏'].map(emoji=><button type="button" key={emoji} aria-label={`Thêm ${emoji}`} onClick={()=>{setMessage(value=>(value+emoji).slice(0,280));setPicker(null);input.current?.focus();}}>{emoji}</button>)}</div>}
          <form className="artist-hall-compose" onSubmit={submit}><label htmlFor="artist-hall-message" className="sr-only">Gửi lời nhắn trong Hall</label>
            <input ref={input} id="artist-hall-message" maxLength={280} value={message} onChange={event=>setMessage(event.target.value)} placeholder="Chia sẻ cảm nghĩ, câu hỏi hoặc điều bạn muốn nói…"/>
            <button className="artist-composer-tool" type="button" aria-label="Chia sẻ khoảnh khắc" aria-expanded={picker==='media'} onClick={()=>setPicker(value=>value==='media'?null:'media')}><ImagePlus size={18}/></button>
            <button className="artist-composer-tool" type="button" aria-label="Thêm biểu cảm" aria-expanded={picker==='emoji'} onClick={()=>setPicker(value=>value==='emoji'?null:'emoji')}><Smile size={18}/></button>
            <button type="submit" disabled={!message.trim()&&!attachments.length} aria-label="Gửi lời nhắn"><Send size={18}/></button></form>
        </fieldset></> : <div className="artist-hall-gate"><p>Cuộc trò chuyện chỉ dành cho hội viên của {name}. Lời nhắn trong Hall không tự động xuất hiện ở Explore.</p><button type="button" onClick={()=>isDemoSignedIn(state) ? dispatch({type:'UPGRADE_MEMBERSHIP',worldId:artistId}) : window.dispatchEvent(new Event('vieworld-open-auth'))}>{isDemoSignedIn(state) ? 'Tham gia hội viên (Demo)' : 'Đăng nhập demo để tiếp tục'}</button></div>}
      </section>
      <aside className="artist-hall-aside" aria-label="Trong Hall lúc này">{member&&thread?<section className="presence-thread"><header><h3>Trả lời</h3><button aria-label="Đóng trả lời" onClick={()=>{setThreadId(undefined);setReplyTo(undefined);}}><X size={16}/></button></header>{[thread,...entries.filter(e=>e.replyToId===thread.id)].map(e=><article key={e.id} className={e.id===highlightedId?'presence-hall-source':''}><strong>{e.authorName}</strong><p>{e.text}</p></article>)}<button disabled={!writable} onClick={()=>{setReplyTo(thread.id);input.current?.focus();}}>Viết trả lời</button></section>:<h3>Trong phòng này</h3>}
        {(running||note) && <div className="artist-hall-activity"><span className="artist-activity-icon" style={art(moments[0]?.media||selected.media)}/><div><strong>{running ? `${name} đang có mặt trong live mẫu` : `Lời nhắn từ ${name}`}</strong><p>{note?.body || 'Artist chỉ hiện diện khi tham gia trực tiếp.'}</p><Link to={running ? sessionContextUrl(artistId,running.id) : `/artist/${artistId}?context=note:${note?.id}`}>Xem trong world <ArrowRight size={14}/></Link></div></div>}
        {project && <Link className="artist-hall-activity" to={project.targetUrl}><Gift size={26}/><div><strong>{project.title}</strong><p>Cùng tạo một điều đặc biệt cho chặng đường sắp tới.</p><small>Đang mở · Minh họa <ArrowRight size={13}/></small></div></Link>}
        {poll && <section className="artist-hall-poll" aria-label={poll.prompt}><h4><BarChart3 size={21}/> {poll.prompt}</h4>{member ? <>{poll.options.map(option=><button key={option.id} type="button" aria-pressed={poll.userVotedOptionId===option.id} disabled={poll.status!=='open'||Boolean(poll.userVotedOptionId)} onClick={()=>dispatch({type:'VOTE_POLL',pollId:poll.id,optionId:option.id})}><span>{poll.userVotedOptionId===option.id ? <Check size={14}/> : '○'} {option.text}</span><span className="artist-poll-bar" aria-hidden="true"><i style={{width:`${totalVotes ? option.votes/totalVotes*100 : 0}%`}}/></span><span className="artist-poll-percent">{totalVotes ? Math.round(option.votes/totalVotes*100) : 0}%</span></button>)}<small>{poll.userVotedOptionId?'Đã ghi nhận bình chọn.':poll.status==='closed'?'Bình chọn đã khép lại.':'Mỗi người một lựa chọn.'}</small></> : <p>Bình chọn dành cho hội viên.</p>}</section>}
        <details className="artist-letter-panel"><summary><Mail size={23}/><span>Gửi lời cho {name}<small>Một lời nhắn riêng, không đăng trong Hall.</small></span></summary>
          {member ? <form onSubmit={event=>{event.preventDefault();if(!letter.trim())return;dispatch({type:'SEND_ARTIST_LETTER',worldId:artistId,text:letter,requestId:crypto.randomUUID()});setLetter('');setLetterSaved(true);}}><label htmlFor="artist-letter">Lời nhắn riêng</label><textarea id="artist-letter" maxLength={1000} value={letter} onChange={event=>{setLetter(event.target.value);setLetterSaved(false);}}/><small>Demo lưu riêng trên thiết bị; chưa gửi đến artist/team.</small><button type="submit" disabled={!letter.trim()}>Giữ lời nhắn</button>{letterSaved&&<p role="status">Đã lưu lời nhắn riêng của bạn.</p>}</form> : <p>Dành cho hội viên của {name}.</p>}
        </details>
      </aside>
    </div>
  </div>;
}
