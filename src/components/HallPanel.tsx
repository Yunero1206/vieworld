import { DEMO_FANS } from '../world/community';
import { ownedDigitalLook } from '../world/merchCatalog';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Send, Flag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { canEnterHall } from '../world/merchCatalog';
import { AvatarRenderer } from './AvatarRenderer';

export function HallPanel({ worldId }: { worldId: string }) {
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const [cooldown, setCooldown] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const allowed = canEnterHall(state, worldId);
  const world = state.worlds[worldId];
  if (!allowed) return <div className="fw-empty"><Lock size={30}/><h3>Hall của {world?.name}</h3><p>Góc giao lưu dành cho hội viên đang hoạt động của nhà nhạc này. Theo dõi artist hoặc mua merchandise chưa phải membership.</p><Link className="fw-button" to={`/moments?artist=${worldId}&panel=membership`}>Xem hội viên & quyền lợi</Link></div>;
  return <div className="fw-hall"><p className="fw-eyebrow">MEMBERS HALL · DEMO</p><h3>Ngồi lại một chút, cùng nhau.</h3>
    <p className="fw-muted">Đây là Hall mô phỏng cục bộ, chưa kết nối người dùng thật. Artist không có mặt trong Hall này. Không có lời hứa được artist đọc hay trả lời.</p>
    <div className="v5-hall-fans" aria-label="Bạn và hai hội viên mẫu"><Link to={`/members/${state.fanProfile.id}`}><AvatarRenderer appearance={state.fanProfile.avatarPreset} displayName={state.fanProfile.displayName} digitalLook={ownedDigitalLook(state)} accessoryId={state.fanProfile.wardrobeChoice?.accessoryId} size="lg"/><strong>{state.fanProfile.displayName}</strong><small>Bạn · xem phòng công khai</small></Link>{DEMO_FANS.map(f=><Link key={f.id} to={`/members/${f.id}`}><AvatarRenderer displayName={f.name} digitalLook={f.look} accessoryId={f.accessory} size="lg"/><strong>{f.name}</strong><small>Fan mẫu · ghé phòng ↗</small></Link>)}</div>
    <div className="v5-sample-conversation" aria-label="Cuộc trò chuyện dựng sẵn"><p><Link to="/members/fan-mai">Mai Anh</Link><small> · Hội thoại mẫu</small><br/>Tui vote acoustic! Vừa đặt CD lên kệ, ghé phòng tui xem nha.</p><p><Link to="/members/fan-minh">Minh Khang</Link><small> · Hội thoại mẫu</small><br/>Hôm đó mang Star Light đi nữa. Mai chọn góc trưng bày xinh ghê!</p></div>
    <p className="fw-hall-prompt">Chủ đề từ đội ngũ · Nội dung mẫu<br/><strong>Bạn muốn nghe bản acoustic nào trong buổi gặp tới?</strong></p>
    <div aria-live="polite" className="fw-hall-messages">{(state.hallMessages?.[worldId] || []).map(m => <article key={m.id}><small>{m.authorName} · lời nhắn lưu trên máy này</small><p>{m.isReported ? 'Đã ẩn trên thiết bị sau báo cáo mô phỏng.' : m.text}</p><button className="fw-text-button" disabled={m.isReported} onClick={() => dispatch({type:'REPORT_HALL_MESSAGE',worldId,messageId:m.id})}><Flag size={13}/>{m.isReported ? 'Đã ghi nhận báo cáo demo' : 'Báo cáo / ẩn'}</button></article>)}</div>
    <form onSubmit={e => { e.preventDefault(); if (!text.trim() || cooldown) return; dispatch({type:'SEND_HALL_MESSAGE',worldId,text,requestId:crypto.randomUUID()}); setText(''); setCooldown(true); timer.current = window.setTimeout(() => setCooldown(false),3000); }}><label htmlFor="hall-message">Gửi lời nhắn vào Hall</label><textarea id="hall-message" maxLength={280} rows={3} value={text} onChange={e => setText(e.target.value)}/><div><small>{text.length}/280 · Không chia sẻ thông tin riêng tư</small><button className="fw-button" disabled={!text.trim() || cooldown}><Send size={16}/>{cooldown ? 'Đợi một chút…' : 'Gửi demo'}</button></div></form>
  </div>;
}
