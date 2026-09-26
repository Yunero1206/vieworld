import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, MessageCircle, Send, BarChart3 } from 'lucide-react';
import type { Session } from '../domain/types';
import { useApp } from '../context/AppContext';
import { AvatarStage } from './AvatarStage';
import { SilentMediaPlaceholder } from './SilentMediaPlaceholder';
import { canEnterHall } from '../world/merchCatalog';
import { selectPublicVoices } from '../world/exploreDiscovery';
import { sessionWorldContext } from '../world/worldContext';
import { MembershipBadge } from './MembershipBadge';
import { membershipTenure, memberForChat } from '../world/membershipBadge';
import { LiveCheer } from './LiveCheer';

const formatTime = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
}).format(new Date(value));

function ContextHall({ artistId, artistName, roomId, heading = 'Hall đang xem cùng nhau' }: { artistId: string; artistName: string; roomId: string; heading?: string }) {
  const { state, dispatch } = useApp();
  const [message, setMessage] = useState('');
  const member = canEnterHall(state, artistId);
  const logRef = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const poll = Object.values(state.polls).find(item => item.tenantId === state.activeTenantId && item.sessionId === roomId);
  const messages = (state.hallMessages?.[artistId] || []).filter(item => item.sessionId === roomId && !item.isReported);
  useEffect(() => {
    if (followLatest.current && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages.length, roomId]);
  const publicDemo = state.activeTenantId === 'vieworld-demo'
    ? selectPublicVoices(state, artistId).filter(voice => voice.isDemo && voice.sourceContextId === roomId) : [];
  const hallUrl = `/artist/${artistId}/hall?room=${encodeURIComponent(roomId)}`;
  function submit(event: FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!member || !text) return;
    followLatest.current = true;
    dispatch({ type: 'SEND_HALL_MESSAGE', worldId: artistId, roomId, text, requestId: crypto.randomUUID() });
    setMessage('');
  }
  return <aside className="artist-context-hall" aria-label={`Hall của ${artistName} trong hoạt động này`}>
    <header><div><MessageCircle size={18} /><strong>{heading}</strong></div><Link to={hallUrl}>Vào Hall <ArrowRight size={15} /></Link></header>
    {member ? <>
      {poll && <details className="vw-context-poll"><summary><BarChart3 size={15}/>{poll.prompt}</summary><div>{poll.options.map(option => <button key={option.id} type="button" aria-pressed={poll.userVotedOptionId === option.id} disabled={poll.status !== 'open' || Boolean(poll.userVotedOptionId)} onClick={() => dispatch({ type: 'VOTE_POLL', pollId: poll.id, optionId: option.id })}>{poll.userVotedOptionId === option.id && <Check size={14}/>} {option.text}</button>)}<small>{poll.userVotedOptionId ? 'Đã ghi nhận lựa chọn của bạn.' : poll.status === 'closed' ? 'Bình chọn đã khép lại.' : 'Chọn một câu trả lời.'}</small></div></details>}
      <div ref={logRef} className="artist-context-hall-messages" role="log" aria-label="Trò chuyện cùng Hall" onScroll={event => { const log = event.currentTarget; followLatest.current = log.scrollHeight - log.scrollTop - log.clientHeight < 40; }}>
        {publicDemo.slice(0, 3).map((voice, index) => <p key={voice.id}><strong><span className="vw-chat-initial" aria-hidden="true">{voice.author.replace('@','').charAt(0).toUpperCase()}</span>{voice.author}<MembershipBadge artistId={artistId} months={[0,3,12][index]} demo/><small>mẫu</small></strong><span>{voice.text}</span></p>)}
        {messages.slice(-12).map(item => <p key={item.id}><strong><span className="vw-chat-initial" aria-hidden="true">{item.authorName.charAt(0)}</span>{item.authorName}<MembershipBadge artistId={artistId} months={membershipTenure(memberForChat(state, artistId, item.fanId), state.demoTime)}/>{item.badgeLabel && <small>{item.badgeLabel}</small>}</strong><span>{item.text}</span></p>)}
        {!messages.length && !publicDemo.length && <p>Hall đang yên. Bạn có thể bắt đầu câu chuyện.</p>}
      </div>
      <form onSubmit={submit}><label htmlFor="artist-context-message" className="sr-only">Gửi lời trong Hall</label><input id="artist-context-message" value={message} maxLength={280} onChange={event => setMessage(event.target.value)} placeholder="Chia sẻ với Hall…" /><button type="submit" disabled={!message.trim()} aria-label="Gửi lời nhắn"><Send size={17} /></button></form>
    </> : <div className="artist-context-hall-gate"><strong>Không gian trò chuyện dành cho thành viên</strong><p>{heading}. Tin nhắn riêng không hiện ở ngoài Hall.</p><Link to={hallUrl}>Tìm hiểu Hall <ArrowRight size={16} /></Link></div>}
  </aside>;
}

export function ContextStage({ session, artistId, artistName, image }: { session: Session; artistId: string; artistName: string; image: string }) {
  const { state, dispatch } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const context = sessionWorldContext(session, artistId);
  const isRsvpd = state.rsvpdSessionIds.includes(session.id);
  const participated = Boolean(state.participations[`part_${state.fanProfile.id}_${session.id}_live`]);
  const replayAvailable = session.replayStatus === 'available' && session.mediaStatus !== 'expired';
  const avatar = session.avatarAssetId && state.avatarAssets[session.avatarAssetId]?.status === 'approved'
    ? state.avatarAssets[session.avatarAssetId] : undefined;
  const liveStage = context.type === 'live' && context.phase === 'active' && session.rightsApproved !== false;
  return <section className="artist-context-stage" aria-labelledby="artist-context-title">
    <div className="artist-context-stage-heading"><div><small>{context.phase === 'active' ? '● ĐANG DIỄN RA' : context.phase === 'upcoming' ? 'SẮP DIỄN RA' : 'ĐÃ KHÉP LẠI'} · {context.type === 'live' ? 'LIVE' : 'SỰ KIỆN'}</small><h2 id="artist-context-title">{context.title}</h2><p><CalendarDays size={15} />{formatTime(session.scheduledStartTime)} · {artistName}</p></div><Link to={`/artist/${artistId}`} className="artist-context-close">Về Trang chính</Link></div>
    <div className="artist-context-stage-grid"><div className="artist-context-main">
      {liveStage ? <div className="artist-context-live-media"><div className="vw-live-scene" data-live={session.status === 'running' && session.artistPresence === 'present'}><AvatarStage avatar={avatar} artistPresence={session.artistPresence} isPaused={session.status === 'paused'} compact stageVariant={session.format === 'concert' ? 'concert' : 'standard'} /><div className="vw-live-lights" aria-hidden="true"/>{session.status === 'running' && <LiveCheer artistId={artistId}/>}</div><SilentMediaPlaceholder showCheer={false} isMuted={isMuted} onToggleMute={() => setIsMuted(value => !value)} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(value => !value)} mediaStatus={session.mediaStatus || 'cleared_local'} trackTitle="Âm thanh demo · chọn để phát" /></div>
        : <div className="artist-context-artwork"><img src={image} alt="" /><div><span>{context.phase === 'upcoming' ? 'Hẹn gặp ở đây' : context.phase === 'ended' ? 'Một chương đã ở lại' : 'Đang diễn ra'}</span><strong>{context.title}</strong></div></div>}
      <div className="artist-context-actions">
        {context.phase === 'upcoming' && <button type="button" onClick={() => dispatch({ type: 'TOGGLE_RSVP', sessionId: session.id })}>{isRsvpd ? <Check size={16} /> : <CalendarDays size={16} />}{isRsvpd ? 'Đã nhắc mình' : 'Nhắc mình (RSVP)'}</button>}
        {context.phase === 'active' && session.status === 'running' && <button type="button" disabled={participated} onClick={() => dispatch({ type: 'JOIN_LIVE_SESSION', sessionId: session.id })}>{participated ? <Check size={16} /> : undefined}{participated ? 'Đã ghi nhận tham dự' : 'Tham dự trực tiếp'}</button>}
        {session.status === 'paused' && <span>Buổi live đang tạm dừng. Hãy đợi artist quay lại.</span>}
        {context.phase === 'ended' && replayAvailable && <button type="button" onClick={() => dispatch({ type: 'WATCH_REPLAY', sessionId: session.id })}>Ghi nhận xem lại</button>}
        {context.phase === 'ended' && !replayAvailable && <span>Bản phát lại chưa khả dụng; kỷ niệm vẫn được giữ trong Kho lưu trữ.</span>}
        {session.format === 'concert' && session.setlist?.length ? <details><summary>Chương trình biểu diễn</summary><ul>{session.setlist.map((entry, index) => <li key={index}>{entry.title}</li>)}</ul></details> : null}
      </div>
      <p className="artist-context-honesty">Bản demo không tự phát media và không giả lập artist đang hiện diện khi họ vắng mặt.</p>
    </div><ContextHall artistId={artistId} artistName={artistName} roomId={context.hallRoomId || session.id} /></div>
  </section>;
}

export function ProjectContextStage({ projectId, title, artistId, artistName, image }: { projectId: string; title: string; artistId: string; artistName: string; image: string }) {
  return <section className="artist-context-stage" aria-labelledby="artist-context-title">
    <div className="artist-context-stage-heading"><div><small>FAN PROJECT · MINH HỌA</small><h2 id="artist-context-title">{title}</h2><p>Cộng đồng của {artistName} đang cùng chuẩn bị.</p></div><Link to={`/artist/${artistId}`} className="artist-context-close">Về Trang chính</Link></div>
    <div className="artist-context-stage-grid"><div className="artist-context-main">
      <div className="artist-context-artwork"><img src={image} alt="" /><div><span>Cùng tạo nên một điều để nhớ</span><strong>{title}</strong></div></div>
      <div className="artist-context-actions"><Link to={`/artist/${artistId}/hall?room=${encodeURIComponent(projectId)}`}>Ghé phòng dự án <ArrowRight size={16} /></Link></div>
      <p className="artist-context-honesty">Đây là dự án minh họa; VieWorld không hiển thị tiến độ hay số người tham gia khi chưa có dữ liệu thật.</p>
    </div><ContextHall artistId={artistId} artistName={artistName} roomId={projectId} heading="Hall đang cùng chuẩn bị" /></div>
  </section>;
}
