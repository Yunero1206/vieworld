import React from 'react';
import { Link } from 'react-router-dom';
import { Session } from '../domain/types';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, Bell, CheckCircle2, Radio, ArrowRight } from 'lucide-react';

export interface NextMomentCardProps {
  session: Session;
  showWorldLink?: boolean;
}

export const NextMomentCard: React.FC<NextMomentCardProps> = ({ session, showWorldLink = true }) => {
  const { state, dispatch } = useApp();
  const world = state.worlds[session.worldId];
  const isRsvpd = state.rsvpdSessionIds.includes(session.id);

  const handleRsvpToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: 'TOGGLE_RSVP', sessionId: session.id });
  };

  const formatSessionDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return '20:00 (Asia/Ho_Chi_Minh)';
    }
  };

  const getFormatBadge = () => {
    switch (session.format) {
      case 'listening':
        return 'Phòng nghe Listening';
      case 'concert':
        return 'Mini Live House';
      case 'dropin':
      default:
        return 'Drop-in Thân Mật';
    }
  };

  const isLive = session.status === 'running';

  return (
    <section
      className="card"
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1E1B4B 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-xl)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}
      aria-label="Khoảnh khắc tiếp theo"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span
              className="tag"
              style={{
                backgroundColor: isLive ? '#DC2626' : 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '700',
              }}
            >
              <Radio size={14} className={isLive ? 'pulse-icon' : ''} />
              <span>{isLive ? 'ĐANG DIỄN RA' : 'KHOẢNH KHẮC TIẾP THEO'}</span>
            </span>

            {/* Persistent DEMO badge (§2.2) */}
            <span className="demo-badge">DEMO</span>

            <span className="tag" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#A9E5D4' }}>
              {getFormatBadge()}
            </span>
          </div>

          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', marginBottom: '8px', color: '#FFFFFF' }}>
            {session.title}
          </h2>

          {world && showWorldLink && (
            <div style={{ fontSize: 'var(--text-sm)', color: '#D8D9E1', marginBottom: '10px' }}>
              Không gian: <Link to={`/worlds/${world.id}`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{world.name}</Link>
            </div>
          )}

          <p style={{ color: '#D8D9E1', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: '20px' }}>
            {session.segmentMode === 'recorded'
              ? 'Phiên phát lại trích đoạn đặc biệt với người dẫn dắt đội ngũ kỹ thuật. Không mạo danh sự hiện diện trực tiếp.'
              : 'Giao lưu trực tiếp cùng avatar được phê duyệt trong không gian mô phỏng. Gửi câu hỏi và nhận Moment Capsule lưu niệm.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: '#A9E5D4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <span>{formatSessionDate(session.scheduledStartTime)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span>Giờ chuẩn: Asia/Ho_Chi_Minh</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' }}>
          <button
            type="button"
            onClick={handleRsvpToggle}
            className="btn"
            style={{
              backgroundColor: isRsvpd ? 'rgba(255, 255, 255, 0.15)' : 'var(--primary)',
              color: '#FFFFFF',
              border: isRsvpd ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
              padding: '10px 18px',
              fontSize: 'var(--text-sm)',
            }}
            id={`rsvp-btn-${session.id}`}
            aria-label={isRsvpd ? 'Hủy đăng ký nhận thông báo' : 'Đăng ký nhận thông báo RSVP'}
          >
            {isRsvpd ? (
              <>
                <CheckCircle2 size={16} color="#A9E5D4" />
                <span>Đã đăng ký RSVP</span>
              </>
            ) : (
              <>
                <Bell size={16} />
                <span>Đăng ký RSVP</span>
              </>
            )}
          </button>

          <Link
            to={`/sessions/${session.id}`}
            className="btn btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: 'var(--text-sm)',
              justifyContent: 'center',
            }}
            id={`enter-session-btn-${session.id}`}
          >
            <span>Vào phiên sự kiện</span>
            <ArrowRight size={14} />
          </Link>

          {showWorldLink && world && (
            <Link
              to={`/worlds/${world.id}`}
              className="btn btn-secondary"
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '10px 18px',
                fontSize: 'var(--text-sm)',
                justifyContent: 'center',
              }}
            >
              <span>Xem chi tiết World</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
