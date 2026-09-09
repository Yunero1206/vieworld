import React from 'react';
import { Session } from '../domain/types';
import {
  Users,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  CalendarCheck,
  Wifi,
  WifiOff,
  LogOut,
  Sparkles,
} from 'lucide-react';

export interface SessionControlsProps {
  session: Session;
  isRsvpd: boolean;
  isInLobby: boolean;
  hasJoinedLive: boolean;
  isPaused: boolean;
  isMuted: boolean;
  reducedMotion: boolean;
  onToggleRsvp: () => void;
  onEnterLobby: () => void;
  onLeaveLobby: () => void;
  onJoinLive: () => void;
  onWatchReplay: () => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleReducedMotion: () => void;
  onSimulateDisconnect: () => void;
  onSimulateReconnect: () => void;
  onSimulateEndSession?: () => void;
  onSimulatePublishReplay?: () => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  session,
  isRsvpd,
  isInLobby,
  hasJoinedLive,
  isPaused,
  isMuted,
  reducedMotion,
  onToggleRsvp,
  onEnterLobby,
  onLeaveLobby,
  onJoinLive,
  onWatchReplay,
  onTogglePause,
  onToggleMute,
  onToggleReducedMotion,
  onSimulateDisconnect,
  onSimulateReconnect,
  onSimulateEndSession,
  onSimulatePublishReplay,
}) => {
  const isRunning = session.status === 'running';
  const isOpen = session.status === 'open' || session.status === 'scheduled';
  const isEnded = session.status === 'ended';
  const isCancelled = session.status === 'cancelled';
  const isDisconnected = session.artistPresence === 'disconnected';

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
      }}
      aria-label="Bảng điều khiển phiên và sân khấu"
    >
      {/* Primary Fan Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {/* RSVP button */}
        {!isEnded && !isCancelled && (
          <button
            type="button"
            className={isRsvpd ? 'btn btn-secondary' : 'btn btn-primary'}
            onClick={onToggleRsvp}
            id="rsvp-button"
            aria-pressed={isRsvpd}
          >
            <CalendarCheck size={16} />
            <span>{isRsvpd ? 'Đã nhắc sự kiện (Hủy)' : 'Nhắc tôi (RSVP)'}</span>
          </button>
        )}

        {/* Lobby Controls */}
        {isOpen && (
          <>
            {isInLobby ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onLeaveLobby}
                id="leave-lobby-button"
              >
                <LogOut size={16} />
                <span>Rời phòng chờ</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onEnterLobby}
                id="enter-lobby-button"
              >
                <Users size={16} />
                <span>Vào phòng chờ</span>
              </button>
            )}
          </>
        )}

        {/* Live Attendance Controls */}
        {isRunning && (
          <>
            {hasJoinedLive ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  fontSize: 'var(--text-sm)',
                  border: '1px solid #A7F3D0',
                }}
                id="live-attendance-badge"
              >
                <Sparkles size={16} />
                <span>Đang tham dự trực tiếp</span>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onJoinLive}
                id="join-live-button"
              >
                <Users size={16} />
                <span>Vào sân khấu trực tiếp</span>
              </button>
            )}

            {isInLobby && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onLeaveLobby}
                id="leave-stage-button"
              >
                <LogOut size={16} />
                <span>Rời sân khấu</span>
              </button>
            )}
          </>
        )}

        {/* Replay Controls */}
        {isEnded && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onWatchReplay}
            disabled={session.replayStatus !== 'available'}
            id="watch-replay-button"
          >
            <Eye size={16} />
            <span>
              {session.replayStatus === 'available'
                ? 'Xem lại bản ghi'
                : `Bản ghi (${session.replayStatus})`}
            </span>
          </button>
        )}
      </div>

      {/* Stage Accessibility & Animation Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--muted)' }}>
          Điều khiển hiển thị:
        </span>

        {/* Pause/Resume Stage Animation */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onTogglePause}
          style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
          id="toggle-pause-button"
          aria-label={isPaused ? 'Tiếp tục chuyển động sân khấu' : 'Tạm dừng chuyển động sân khấu'}
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
          <span>{isPaused ? 'Tiếp tục sân khấu' : 'Tạm dừng sân khấu'}</span>
        </button>

        {/* Mute/Unmute Audio */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onToggleMute}
          style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
          id="toggle-mute-button"
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{isMuted ? 'Đã tắt tiếng' : 'Bật tiếng'}</span>
        </button>

        {/* Reduced Motion Toggle */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onToggleReducedMotion}
          style={{
            padding: '6px 12px',
            fontSize: 'var(--text-xs)',
            backgroundColor: reducedMotion ? '#EDE9FE' : undefined,
            color: reducedMotion ? 'var(--primary)' : undefined,
            borderColor: reducedMotion ? 'var(--primary)' : undefined,
          }}
          id="toggle-reduced-motion-button"
          aria-pressed={reducedMotion}
        >
          <span>Giảm chuyển động: {reducedMotion ? 'BẬT' : 'TẮT'}</span>
        </button>
      </div>

      {/* Demo operator controls live behind a review-only disclosure. */}
      <details className="session-review-controls">
        <summary>
          <span className="demo-badge">DEMO</span>
          Công cụ review phiên
        </summary>
        <div className="session-review-controls__body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 'var(--text-xs)' }}>Mô phỏng trạng thái hiện diện nghệ sĩ</strong>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Hiện tại: <strong>{session.artistPresence}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {isDisconnected ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onSimulateReconnect}
                style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                id="simulate-reconnect-button"
              >
                <Wifi size={14} color="#10B981" />
                <span>Kết nối lại tín hiệu nghệ sĩ</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onSimulateDisconnect}
                style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                id="simulate-disconnect-button"
              >
                <WifiOff size={14} color="#EF4444" />
                <span>Ngắt kết nối nghệ sĩ (Thử nghiệm)</span>
              </button>
            )}

            {/* End Session Operator Button (P06) */}
            {isRunning && onSimulateEndSession && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onSimulateEndSession}
                style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', color: '#B91C1C' }}
                id="simulate-end-session-button"
              >
                <span>Mô phỏng: Kết thúc phiên sự kiện</span>
              </button>
            )}

            {/* Publish Replay Operator Button (P06) */}
            {isEnded && session.replayStatus === 'pending_review' && onSimulatePublishReplay && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onSimulatePublishReplay}
                style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', color: 'var(--primary)' }}
                id="simulate-publish-replay-button"
              >
                <span>Mô phỏng: Duyệt bản ghi Replay</span>
              </button>
            )}
          </div>
        </div>
      </details>
    </div>
  );
};
