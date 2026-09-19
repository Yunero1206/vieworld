import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Flag, Users, Pin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { canEnterHall } from '../world/merchCatalog';
import { ARTIST_FANDOM_REGISTRY } from '../data/artistChatConfig';

interface InitialMessage {
  id: string;
  authorId: string;
  authorName: string;
  isSelf?: boolean;
  avatarLetter: string;
  avatarBg: string;
  text: string;
  time: string;
  role: string;
  isArtist?: boolean;
}

const SEED_MESSAGES: InitialMessage[] = [
  {
    id: 'seed-artist-greeting',
    authorId: 'artist-kai-official',
    authorName: 'KAI',
    avatarLetter: 'K',
    avatarBg: '#0F172A',
    text: 'Chào cả nhà Pulse Crew! Đêm nay các bạn đang nghe playlist nào vậy? Cùng thả lỏng theo nhịp pulse nhé.',
    time: '10 phút trước',
    role: 'Nghệ sĩ xác minh',
    isArtist: true,
  },
  {
    id: 'seed-1',
    authorId: 'fan-mai',
    authorName: 'Mai Anh',
    avatarLetter: 'M',
    avatarBg: '#059669',
    text: 'Tui vote acoustic! Vừa đặt CD lên kệ phòng trưng bày, ghé My Space tui xem nha cả nhà ✨',
    time: '5 phút trước',
    role: 'Hội viên kỳ cựu',
  },
  {
    id: 'seed-2',
    authorId: 'fan-minh',
    authorName: 'Minh Khang',
    avatarLetter: 'K',
    avatarBg: '#2563EB',
    text: 'Hôm đó mang Star Light đi nữa. Mai chọn góc trưng bày xinh ghê!',
    time: '3 phút trước',
    role: 'Hội viên tích cực',
  },
];

export function HallPanel({ worldId }: { worldId: string }) {
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const [cooldown, setCooldown] = useState(false);
  const [roomMode, setRoomMode] = useState<'community' | 'artist_present' | 'listening_party' | 'fandom_radio'>('listening_party');
  const [pinnedDismissed, setPinnedDismissed] = useState(false);

  const timer = useRef<number | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const isMember = canEnterHall(state, worldId);
  const world = state.worlds[worldId];
  const fandom = ARTIST_FANDOM_REGISTRY[worldId];
  const fandomName = fandom?.fandomName || 'Pulse Crew';

  const userMessages = state.hallMessages?.[worldId] || [];

  const FANDOM_RADIO_TRACKS: Record<string, { title: string; album: string; duration: string; currentProgress: string }> = {
    'artist-a': { title: 'Starry Night (Acoustic Ver.)', album: 'V-Stars Melody EP', duration: '3:45', currentProgress: '02:10' },
    'artist-mira': { title: 'Moonlight Serenade (Live Replay)', album: 'Moonies Universe', duration: '4:12', currentProgress: '01:45' },
    'artist-kai': { title: 'Cyber Pulse (Live Edit)', album: 'Pulse Horizon', duration: '3:30', currentProgress: '01:42' },
    'neon-sessions': { title: 'Midnight Neon (Extended)', album: 'Night Owls Sessions', duration: '5:02', currentProgress: '03:15' },
  };
  const currentTrack = FANDOM_RADIO_TRACKS[worldId] || { title: 'Fandom Special Acoustic', album: 'VieWorld Sessions', duration: '3:50', currentProgress: '01:20' };

  // Auto-scroll when new user messages are sent
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || cooldown || !isMember) return;
    dispatch({
      type: 'SEND_HALL_MESSAGE',
      worldId,
      text: text.trim(),
      requestId: crypto.randomUUID(),
    });
    setText('');
    setCooldown(true);
    timer.current = window.setTimeout(() => setCooldown(false), 2000);
  };

  return (
    <div className="v7-hall-livechat moments-hall-panel">
      {/* 1. Livechat Header with Room State Selector */}
      <header className="v7-chat-header">
        <div className="v7-chat-header-main">
          <div className="v7-chat-title-row">
            <span className="v7-chat-live-indicator" />
            <h3 className="v7-chat-title">Hall hội viên · {world?.name}</h3>
            {roomMode === 'artist_present' && (
              <span className="moments-hall-artist-badge">
                ● {world?.name} đang ở Hall
              </span>
            )}
          </div>
          <p className="v7-chat-subtitle">
            Giao lưu và ghé My Space của hội viên, nghe nhạc cùng nhau và trò chuyện trực tiếp.
          </p>
        </div>

        <div className="moments-hall-modes" role="group" aria-label="Chế độ phòng sinh hoạt" style={{ display: 'inline-flex', gap: '4px' }}>
          <button
            type="button"
            className={`moments-hall-mode-btn ${roomMode === 'listening_party' ? 'active' : ''}`}
            onClick={() => setRoomMode('listening_party')}
            title="Chế độ nghe nhạc cùng nhau"
          >
            Listening
          </button>
          <button
            type="button"
            className={`moments-hall-mode-btn ${roomMode === 'artist_present' ? 'active' : ''}`}
            onClick={() => setRoomMode('artist_present')}
            title="Chế độ nghệ sĩ có mặt"
          >
            Artist
          </button>
          <button
            type="button"
            className={`moments-hall-mode-btn ${roomMode === 'fandom_radio' ? 'active' : ''}`}
            onClick={() => setRoomMode('fandom_radio')}
            title="Chế độ radio fandom"
          >
            Radio
          </button>
        </div>
      </header>

      {/* 2. Unified Current Room State Bar */}
      <div className="moments-now-playing-bar moments-current-room-bar" role="region" aria-label="Trạng thái phòng hiện tại">
        <div className="moments-now-playing-left">
          <div className="v7-radio-soundwave" aria-hidden="true" style={{ width: '18px', height: '12px' }}>
            <span /><span /><span /><span />
          </div>
          <span className="moments-now-playing-track">
            ▶ {currentTrack.title} — {world?.name} · {currentTrack.album}
          </span>
        </div>
        <div className="moments-now-playing-listeners">
          <Users size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
          <span>{currentTrack.currentProgress} / {currentTrack.duration} · 128 người đang nghe cùng</span>
        </div>
      </div>

      {/* 3. Compact Pinned Topic / Discussion */}
      {!pinnedDismissed && (
        <div className="moments-pinned-topic">
          <span className="moments-pinned-topic-tag">
            <Pin size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
            Chủ đề ghim
          </span>
          <strong style={{ fontSize: '13px', color: '#0F172A' }}>
            Bạn muốn nghe bản acoustic nào trong buổi gặp tiếp theo?
          </strong>
          <button
            type="button"
            className="fw-text-button"
            style={{ marginLeft: 'auto', fontSize: '11px', color: '#64748B' }}
            onClick={() => setPinnedDismissed(true)}
            aria-label="Thu gọn chủ đề ghim"
          >
            Ẩn
          </button>
        </div>
      )}

      {/* 4. Live Message Stream */}
      <div
        className="v7-chat-stream"
        role="log"
        aria-live="polite"
        aria-label="Luồng trò chuyện hội viên"
      >
        {SEED_MESSAGES.map(msg => (
          <article
            key={msg.id}
            className={`v7-chat-bubble ${msg.isArtist ? 'moments-artist-bubble' : 'v7-chat-bubble-peer'}`}
          >
            <div
              className="v7-chat-avatar"
              style={{ backgroundColor: msg.avatarBg }}
              aria-hidden="true"
            >
              {msg.avatarLetter}
            </div>
            <div className="v7-chat-content">
              <div className="v7-chat-meta">
                <Link
                  to={msg.isArtist ? `/moments?artist=${worldId}` : `/members/${msg.authorId}`}
                  className="v7-chat-author-name"
                  title={msg.isArtist ? `Thế giới của ${msg.authorName}` : `Ghé thăm ${msg.authorName}`}
                >
                  {msg.authorName} {msg.isArtist && '✓'}
                </Link>
                {!msg.isArtist && (
                  <span
                    className="v7-chat-badge-gem"
                    title={`Hội viên ${fandomName}`}
                    style={{ fontSize: '11px', color: 'var(--primary, #5B46E8)', cursor: 'help', fontWeight: '700' }}
                  >
                    ◇
                  </span>
                )}
                <time className="v7-chat-time">{msg.time}</time>
              </div>
              <p className="v7-chat-text">{msg.text}</p>
            </div>
          </article>
        ))}

        {userMessages.map(m => {
          const isMe = m.authorName === state.fanProfile.displayName;
          return (
            <article
              key={m.id}
              className={`v7-chat-bubble ${isMe ? 'v7-chat-bubble-me' : 'v7-chat-bubble-peer'}`}
            >
              <div
                className="v7-chat-avatar"
                style={{ backgroundColor: isMe ? '#E11D48' : '#6366F1' }}
                aria-hidden="true"
              >
                {m.authorName ? m.authorName.charAt(0).toUpperCase() : 'B'}
              </div>
              <div className="v7-chat-content">
                <div className="v7-chat-meta">
                  <Link
                    to={isMe ? '/me' : `/members/${(m as any).authorId || 'fan-mai'}`}
                    className="v7-chat-author-name"
                    title={isMe ? 'Ghé thăm My Space của bạn' : `Ghé thăm My Space của ${m.authorName}`}
                  >
                    {m.authorName} {isMe && '(Bạn)'}
                  </Link>
                  <span
                    className="v7-chat-badge-gem"
                    title={`Hội viên ${fandomName}`}
                    style={{ fontSize: '11px', color: 'var(--primary, #5B46E8)', cursor: 'help', fontWeight: '700' }}
                  >
                    ◇
                  </span>
                  <time className="v7-chat-time">Vừa xong</time>

                  <button
                    className="v7-chat-report-btn"
                    disabled={m.isReported}
                    onClick={() => dispatch({ type: 'REPORT_HALL_MESSAGE', worldId, messageId: m.id })}
                    title="Báo cáo tin nhắn không phù hợp"
                  >
                    <Flag size={11} />
                    <span>{m.isReported ? 'Đã ẩn' : 'Báo cáo'}</span>
                  </button>
                </div>

                <p className="v7-chat-text">
                  {m.isReported ? 'Tin nhắn đã ẩn sau báo cáo mô phỏng.' : m.text}
                </p>
              </div>
            </article>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 5. Sticky Bottom Chat Input Bar / Gated State */}
      {isMember ? (
        <form className="v7-chat-input-bar" onSubmit={handleSend}>
          <label htmlFor="hall-message" className="sr-only">
            Gửi lời nhắn vào Hall
          </label>
          <div className="v7-chat-input-wrapper">
            <input
              id="hall-message"
              type="text"
              className="v7-chat-input"
              maxLength={280}
              placeholder={`Nhắn gửi cùng ${fandomName}, chia sẻ âm nhạc và ghé My Space...`}
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button
              type="submit"
              className="v7-chat-send-btn"
              disabled={!text.trim() || cooldown}
              aria-label="Gửi tin nhắn"
            >
              <Send size={16} />
              <span>{cooldown ? 'Chờ...' : 'Gửi'}</span>
            </button>
          </div>
          <div className="v7-chat-input-footer">
            <small>{text.length}/280 ký tự · Tôn trọng cộng đồng và không chia sẻ thông tin riêng tư</small>
          </div>
        </form>
      ) : (
        <div className="moments-chat-gated-bar">
          <div className="moments-gated-text">
            <span className="moments-gated-title">
              Chỉ hội viên {fandomName} mới có thể gửi lời nhắn vào Hall
            </span>
            <span className="moments-gated-sub">
              Bạn đang ở chế độ xem và nghe nhạc cùng fandom. Kích hoạt membership để mở quyền trò chuyện.
            </span>
          </div>
          <button
            type="button"
            className="moments-gated-btn"
            onClick={() => dispatch({ type: 'UPGRADE_MEMBERSHIP', worldId })}
          >
            Tham gia {fandomName} (Demo)
          </button>
        </div>
      )}
    </div>
  );
}
