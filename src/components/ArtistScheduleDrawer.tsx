import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Calendar, Bell, BellOff, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { momentTime } from '../world/fanWorld';

interface ArtistScheduleDrawerProps {
  worldId: string;
  artistName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ArtistScheduleDrawer({
  worldId,
  artistName,
  isOpen,
  onClose,
}: ArtistScheduleDrawerProps) {
  const { state, dispatch } = useApp();
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sessions = Object.values(state.sessions)
    .filter(s => s.worldId === worldId && !['ended', 'cancelled'].includes(s.status))
    .sort((a, b) => a.scheduledStartTime.localeCompare(b.scheduledStartTime));

  const filteredSessions = sessions.filter(
    s => !savedOnly || state.rsvpdSessionIds.includes(s.id)
  );

  return (
    <div className="moments-drawer-backdrop" onClick={onClose}>
      <div
        className="moments-drawer-panel moments-schedule-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Toàn bộ lịch hẹn của ${artistName}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="moments-drawer-header">
          <div className="moments-drawer-title-group">
            <span className="moments-drawer-eyebrow">Lịch phát sóng & sự kiện</span>
            <h2 className="moments-drawer-title">Lịch của {artistName}</h2>
          </div>
          <button
            type="button"
            className="moments-drawer-close-btn"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </header>

        <div className="moments-drawer-body">
          <div className="moments-schedule-filter-bar">
            <button
              type="button"
              className={`moments-schedule-filter-btn ${!savedOnly ? 'active' : ''}`}
              onClick={() => setSavedOnly(false)}
            >
              Toàn bộ lịch ({sessions.length})
            </button>
            <button
              type="button"
              className={`moments-schedule-filter-btn ${savedOnly ? 'active' : ''}`}
              onClick={() => setSavedOnly(true)}
            >
              Lịch đã lưu ({sessions.filter(s => state.rsvpdSessionIds.includes(s.id)).length})
            </button>
          </div>

          <p className="moments-schedule-hint">
            Lưu lịch để nhận thông báo trước khi phiên diễn ra. Lời nhắc không phải vé vào cửa.
          </p>

          <div className="moments-schedule-list">
            {filteredSessions.map(s => {
              const isRsvpd = state.rsvpdSessionIds.includes(s.id);
              const formatLabel =
                s.format === 'concert'
                  ? 'Online concert'
                  : s.format === 'listening'
                  ? 'Nghe cùng nhau'
                  : 'Livestream trò chuyện';

              return (
                <article key={s.id} className="moments-schedule-card">
                  <div className="moments-schedule-meta-row">
                    <span className="moments-schedule-format-tag">{formatLabel}</span>
                    <time className="moments-schedule-time">{momentTime(s.scheduledStartTime)}</time>
                  </div>

                  <h3 className="moments-schedule-card-title">{s.title}</h3>

                  <div className="moments-schedule-card-actions">
                    <Link
                      to={`/sessions/${s.id}`}
                      className="moments-schedule-detail-btn"
                      onClick={onClose}
                    >
                      <span>Xem buổi hẹn</span>
                      <ArrowRight size={14} />
                    </Link>

                    <button
                      type="button"
                      className={`moments-schedule-rsvp-btn ${isRsvpd ? 'rsvpd' : ''}`}
                      onClick={() => dispatch({ type: 'TOGGLE_RSVP', sessionId: s.id })}
                    >
                      {isRsvpd ? (
                        <>
                          <BellOff size={14} />
                          <span>Hủy nhắc</span>
                        </>
                      ) : (
                        <>
                          <Bell size={14} />
                          <span>Nhắc mình</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}

            {!filteredSessions.length && (
              <div className="moments-schedule-empty">
                <Calendar size={32} />
                <p>
                  {savedOnly
                    ? 'Bạn chưa lưu lịch hẹn nào của nghệ sĩ này.'
                    : 'Chưa có lịch phát sóng mới được công bố.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="moments-drawer-footer">
          <Link
            to="/me?section=collection"
            className="moments-schedule-archive-link"
            onClick={onClose}
          >
            Xem lại lịch & kỷ niệm trong My Space ↗
          </Link>
        </footer>
      </div>
    </div>
  );
}
