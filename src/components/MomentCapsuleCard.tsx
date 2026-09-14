import React, { useState } from 'react';
import { Capsule, Session, World } from '../domain/types';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  Sparkles,
  Edit3,
  Save,
  Play,
  Lock,
  Globe,
  ArrowRight,
} from 'lucide-react';

export interface MomentCapsuleCardProps {
  capsule: Capsule;
  session?: Session;
  world?: World;
  currentSlotIndex?: 0 | 1 | 2;
  onSaveNote: (capsuleId: string, privateNote: string) => void;
  onToggleSaved: (capsuleId: string, isSaved: boolean) => void;
  onAssignSlot?: (capsuleId: string, slotIndex: 0 | 1 | 2) => void;
  onRemoveFromSlot?: (slotIndex: 0 | 1 | 2) => void;
}

export const MomentCapsuleCard: React.FC<MomentCapsuleCardProps> = ({
  capsule,
  session,
  world,
  currentSlotIndex,
  onSaveNote,
  onToggleSaved,
  onAssignSlot,
  onRemoveFromSlot,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(capsule.privateNote || '');
  const [saveNoteSuccess, setSaveNoteSuccess] = useState(false);

  const formatVietnamTime = (isoString?: string) => {
    if (!isoString) return 'Thời gian không xác định';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const handleSaveNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNote(capsule.id, noteText.trim());
    setIsEditingNote(false);
    setSaveNoteSuccess(true);
    setTimeout(() => setSaveNoteSuccess(false), 3000);
  };

  const isReplayExpiredOrWithdrawn =
    session?.replayStatus === 'expired' || session?.replayStatus === 'withdrawn';
  const isReplayAvailable = session?.replayStatus === 'available';

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: 'var(--surface)',
        border: '1px solid rgba(101, 81, 200, 0.25)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}
      data-testid={`capsule-card-${capsule.id}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            className="tag"
            style={{ backgroundColor: '#ECFDF5', color: '#065F46', fontWeight: '700' }}
            id={`capsule-live-badge-${capsule.id}`}
          >
            <Sparkles size={12} color="#059669" style={{ marginRight: '4px' }} />
            Kỷ niệm tham dự trực tiếp (Live)
          </span>

          <span className="demo-badge">DEMO</span>

          {currentSlotIndex !== undefined && (
            <span
              className="tag"
              style={{ backgroundColor: '#EEF2FF', color: '#4338CA', fontWeight: '700' }}
              data-testid={`capsule-slot-badge-${capsule.id}`}
            >
              ⭐ Đang ở Ô {currentSlotIndex + 1}
            </span>
          )}
        </div>

        {/* Bookmark / Save Toggle */}
        <button
          type="button"
          onClick={() => onToggleSaved(capsule.id, !capsule.isSaved)}
          style={{
            background: 'none',
            border: 'none',
            color: capsule.isSaved ? 'var(--primary)' : 'var(--muted)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--text-xs)',
            fontWeight: '600',
          }}
          id={`toggle-capsule-save-${capsule.id}`}
          data-testid={`toggle-capsule-save-${capsule.id}`}
          aria-label={capsule.isSaved ? 'Bỏ lưu kỷ niệm' : 'Lưu trữ kỷ niệm'}
        >
          {capsule.isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          <span>{capsule.isSaved ? 'Đã lưu trữ' : 'Lưu trữ'}</span>
        </button>
      </div>

      {/* Session & World Info */}
      <div>
        <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: '0 0 6px 0' }}>
          {session ? session.title : 'Khoảnh khắc trực tiếp VieWorld'}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          {world && (
            <Link
              to={`/worlds/${world.id}`}
              style={{ color: 'var(--primary)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Globe size={12} />
              <span>{world.name}</span>
            </Link>
          )}
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            <span>{formatVietnamTime(session?.scheduledStartTime || capsule.updatedAt)} (GMT+7)</span>
          </span>
        </div>
      </div>

      {/* Private Personal Note Section */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
        data-testid={`capsule-note-section-${capsule.id}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--muted)' }}>
            Ghi chú riêng tư (Chỉ bạn nhìn thấy):
          </span>

          {!isEditingNote && (
            <button
              type="button"
              onClick={() => setIsEditingNote(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '600',
              }}
              id={`edit-note-btn-${capsule.id}`}
            >
              <Edit3 size={12} />
              <span>{capsule.privateNote ? 'Sửa ghi chú' : 'Thêm ghi chú'}</span>
            </button>
          )}
        </div>

        {isEditingNote ? (
          <form onSubmit={handleSaveNoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ghi lại cảm xúc, kỷ niệm của bạn về buổi diễn..."
              rows={2}
              className="input"
              style={{ width: '100%', fontSize: 'var(--text-xs)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}
              id={`note-input-${capsule.id}`}
              aria-label="Ghi chú cá nhân cho kỷ niệm"
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsEditingNote(false)}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '4px 12px', fontSize: '11px' }}
                id={`save-note-submit-${capsule.id}`}
              >
                <Save size={12} />
                <span>Lưu ghi chú</span>
              </button>
            </div>
          </form>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-xs)',
              color: capsule.privateNote ? 'var(--ink)' : 'var(--muted)',
              fontStyle: capsule.privateNote ? 'normal' : 'italic',
            }}
            id={`note-content-${capsule.id}`}
          >
            {capsule.privateNote || 'Chưa có ghi chú nào. Hãy thêm vài dòng cảm nhận của bạn!'}
          </p>
        )}

        {saveNoteSuccess && (
          <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
            ✓ Đã lưu ghi chú riêng tư thành công!
          </span>
        )}
      </div>

      {/* Showcase Shelf Actions (§Job 07) */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: capsule.isSaved ? '#F5F3FF' : '#F8FAFC',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${capsule.isSaved ? 'rgba(101, 81, 200, 0.25)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
        data-testid={`capsule-shelf-action-bar-${capsule.id}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)' }}>
          <Sparkles size={14} color="var(--primary)" />
          <strong>Kệ phòng tôi:</strong>
          {currentSlotIndex !== undefined ? (
            <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
              Đang ở Ô {currentSlotIndex + 1}
            </span>
          ) : (
            <span style={{ color: 'var(--muted)' }}>
              {capsule.isSaved ? 'Chưa đặt lên kệ' : 'Cần lưu trữ để đặt lên kệ'}
            </span>
          )}
        </div>

        {capsule.isSaved && onAssignSlot && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {currentSlotIndex !== undefined ? (
              <>
                {onRemoveFromSlot && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px', color: '#DC2626' }}
                    onClick={() => onRemoveFromSlot(currentSlotIndex)}
                    data-testid={`slot-unassign-btn-${capsule.id}`}
                  >
                    Gỡ khỏi kệ
                  </button>
                )}
                {([0, 1, 2] as const).filter((idx) => idx !== currentSlotIndex).map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => onAssignSlot(capsule.id, idx)}
                    data-testid={`slot-assign-btn-${capsule.id}-${idx}`}
                  >
                    Chuyển sang Ô {idx + 1}
                  </button>
                ))}
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Đặt lên kệ:</span>
                {([0, 1, 2] as const).map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => onAssignSlot(capsule.id, idx)}
                    data-testid={`slot-assign-btn-${capsule.id}-${idx}`}
                  >
                    + Ô {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Replay Rights Status Notice & Actions (§2.3, P06 Acceptance T06) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '6px' }}>
        {isReplayExpiredOrWithdrawn ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--text-xs)',
              color: '#DC2626',
            }}
            data-testid={`replay-expired-notice-${capsule.id}`}
          >
            <Lock size={14} />
            <span>
              Bản ghi Replay đã {session?.replayStatus === 'expired' ? 'hết hạn bản quyền' : 'tạm thu hồi'}. Kỷ niệm số và ghi chú cá nhân luôn được bảo lưu nguyên vẹn.
            </span>
          </div>
        ) : isReplayAvailable ? (
          <Link
            to={`/sessions/${capsule.sessionId}`}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            id={`capsule-replay-link-${capsule.id}`}
          >
            <Play size={12} />
            <span>Xem lại bản ghi Replay</span>
          </Link>
        ) : (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            Trạng thái Replay: <strong>{session?.replayStatus || 'Đang chuẩn bị'}</strong>
          </span>
        )}

        {world && (
          <Link
            to={`/worlds/${world.id}`}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Đến thế giới</span>
            <ArrowRight size={12} />
          </Link>
        )}
      </div>
    </div>
  );
};
