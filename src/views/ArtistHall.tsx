import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Session } from '../domain/types';
import { canEnterHall } from '../world/merchCatalog';
import { getExploreProjectById } from '../world/exploreRows';
import { selectPublicVoices } from '../world/exploreDiscovery';
import { sessionContextUrl } from '../world/worldContext';

export function ArtistHall({ artistId, name, sessions }: { artistId: string; name: string; sessions: Session[] }) {
  const { state, dispatch } = useApp();
  const [params, setParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const member = canEnterHall(state, artistId);
  const sessionRooms = sessions.filter(session => ['running', 'open'].includes(session.status) || (session.status === 'scheduled' && session.scheduledStartTime >= state.demoTime)).slice(0, 3);
  const project = getExploreProjectById(artistId, 'project-c-birthday');
  const rooms = [{ id: `hall-${artistId}`, title: 'Phòng chung', description: `Chuyện thường ngày cùng fan của ${name}` },
    ...sessionRooms.map(session => ({ id: session.id, title: session.title.replace(`${name}: `, ''), description: session.status === 'running' ? 'Đang diễn ra' : 'Cùng trò chuyện trước và sau sự kiện' })),
    ...(project ? [{ id: project.id, title: project.title, description: 'Cùng chuẩn bị trong cộng đồng' }] : [])];
  const selected = rooms.find(room => room.id === params.get('room')) || rooms.find(room => sessionRooms.some(session => session.id === room.id && session.status === 'running')) || rooms[0];
  const messages = (state.hallMessages?.[artistId] || []).filter(item => item.sessionId === selected.id && !item.isReported);
  const demoVoices = state.activeTenantId === 'vieworld-demo' ? selectPublicVoices(state, artistId).filter(voice => voice.isDemo && voice.sourceContextId === selected.id) : [];
  const running = sessions.find(session => session.status === 'running' && session.artistPresence === 'present');
  const poll = Object.values(state.polls).find(item => sessionRooms.some(session => session.id === item.sessionId));
  function submit(event: FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text || !member) return;
    dispatch({ type: 'SEND_HALL_MESSAGE', worldId: artistId, roomId: selected.id, text, requestId: crypto.randomUUID() });
    setMessage('');
  }
  return <div className="artist-world-body artist-hall-page">
    <header className="artist-inner-heading"><div><h2>Hall</h2><p>Nơi mọi người đang tụ lại trong world của {name}.</p></div><span>Dành cho hội viên</span></header>
    <section className="artist-hall-rooms" aria-labelledby="artist-hall-rooms-title">
      <h3 id="artist-hall-rooms-title">Đang tụ lại</h3>
      <div className="artist-hall-room-grid">{rooms.map(room => <button key={room.id} type="button" aria-pressed={selected.id === room.id}
        onClick={() => setParams({ room: room.id })}>
        <span>{room.title}</span><small>{room.description}</small>
      </button>)}</div>
    </section>
    <div className="artist-hall-layout">
      <section className="artist-hall-conversation" aria-label={`Trò chuyện trong ${selected.title}`}>
        <header><h3>{selected.title}</h3><p>{selected.description}</p></header>
        {member ? <><div className="artist-hall-messages" role="log" aria-label="Tin nhắn trong Hall">
          {demoVoices.map(voice => <article key={voice.id}><span className="artist-hall-person">{voice.author.slice(1, 2).toUpperCase()}</span><div><strong>{voice.author} · lời nhắn mẫu</strong><p>{voice.text}</p></div></article>)}
          {messages.length ? messages.map(item => <article key={item.id}><span className="artist-hall-person">{item.authorName.slice(0, 1)}</span><div><strong>{item.authorName}</strong><p>{item.text}</p></div></article>)
            : !demoVoices.length && <p className="artist-hall-empty">Chưa có lời nhắn trong phòng này. Bạn có thể mở đầu cuộc trò chuyện.</p>}
        </div><form className="artist-hall-compose" onSubmit={submit}><label htmlFor="artist-hall-message" className="sr-only">Gửi lời nhắn trong Hall</label>
          <input id="artist-hall-message" maxLength={280} value={message} onChange={event => setMessage(event.target.value)} placeholder={`Chia sẻ cùng mọi người trong ${selected.title}…`} />
          <button type="submit" disabled={!message.trim()} aria-label="Gửi lời nhắn"><Send size={18} /></button></form></>
          : <div className="artist-hall-gate"><p>Cuộc trò chuyện chỉ dành cho hội viên của {name}. Lời nhắn trong Hall không tự động xuất hiện ở Explore.</p>
            <button type="button" onClick={() => dispatch({ type: 'UPGRADE_MEMBERSHIP', worldId: artistId })}>Tham gia hội viên (Demo)</button></div>}
      </section>
      <aside className="artist-hall-aside" aria-label="Trong Hall lúc này"><h3>Trong Hall lúc này</h3>
        {running && <p><strong>{name} trong buổi live mẫu</strong><Link to={sessionContextUrl(artistId, running.id)}>Vào buổi live <ArrowRight size={14} /></Link></p>}
        {project && <p><strong>{project.title}</strong><Link to={project.targetUrl}>Xem dự án <ArrowRight size={14} /></Link></p>}
        {poll && <p><strong>{poll.prompt}</strong><span>{poll.status === 'open' ? 'Bình chọn đang mở trong sự kiện.' : 'Bình chọn đã khép lại.'}</span><Link to={sessionContextUrl(artistId, poll.sessionId)}>Xem bình chọn <ArrowRight size={14} /></Link></p>}
        <p><strong>Gửi lời cho {name}</strong><span>Chia sẻ ở phòng đang chọn; artist chỉ hiện diện khi thực sự tham gia.</span></p>
      </aside>
    </div>
  </div>;
}
