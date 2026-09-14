import React from 'react';
import { Session } from '../domain/types';
import {
  Users,
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
  hideReviewControls?: boolean;
}

export interface SessionReviewControlsProps {
  session: Session;
  onSimulateDisconnect: () => void;
  onSimulateReconnect: () => void;
  onSimulateEndSession?: () => void;
  onSimulatePublishReplay?: () => void;
}

export const SessionReviewControls: React.FC<SessionReviewControlsProps> = ({
  session,
  onSimulateDisconnect,
  onSimulateReconnect,
  onSimulateEndSession,
  onSimulatePublishReplay,
}) => {
  const isRunning = session.status === 'running';
  const isEnded = session.status === 'ended';
  const isDisconnected = session.artistPresence === 'disconnected';

  return (
    <details
      className="session-review-controls"
      style={{
        marginTop: '16px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        backgroundColor: 'var(--surface)',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
        }}
      >
        <span className="demo-badge">DEMO</span>
        <span>Công cụ review phiên</span>
      </summary>
      <div
        className="session-review-controls__body"
        style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
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
              style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', borderRadius: '16px' }}
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
              style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', borderRadius: '16px' }}
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
              style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', color: '#B91C1C', borderRadius: '16px' }}
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
              style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', color: 'var(--primary)', borderRadius: '16px' }}
              id="simulate-publish-replay-button"
            >
              <span>Mô phỏng: Duyệt bản ghi Replay</span>
            </button>
          )}
        </div>
      </div>
    </details>
  );
};

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
  hideReviewControls = false,
}) => {
  const isRunning = session.status === 'running';
  const isOpen = session.status === 'open' || session.status === 'scheduled';
  const isEnded = session.status === 'ended';
  const isCancelled = session.status === 'cancelled';

  return (
    <div
      className="session-stream-controls"
      style={{
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: 'transparent',
        border: 'none',
      }}
      aria-label="Bảng điều khiển phiên và sân khấu"
    >
      {/* Primary Fan Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {/* RSVP button */}
        {!isEnded && !isCancelled && (
          <button
            type="button"
            className={isRsvpd ? 'btn btn-secondary' : 'btn btn-primary'}
            onClick={onToggleRsvp}
            id="rsvp-button"
            aria-pressed={isRsvpd}
            style={{ borderRadius: '20px', padding: '6px 16px', fontSize: 'var(--text-xs)', fontWeight: '600' }}
          >
            <CalendarCheck size={14} />
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
                style={{ borderRadius: '20px', padding: '6px 14px', fontSize: 'var(--text-xs)' }}
              >
                <LogOut size={14} />
                <span>Rời phòng chờ</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onEnterLobby}
                id="enter-lobby-button"
                style={{ borderRadius: '20px', padding: '6px 16px', fontSize: 'var(--text-xs)', fontWeight: '700' }}
              >
                <Users size={14} />
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
                  padding: '6px 14px',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  borderRadius: '20px',
                  fontWeight: '700',
                  fontSize: 'var(--text-xs)',
                  border: '1px solid #A7F3D0',
                }}
                id="live-attendance-badge"
              >
                <Sparkles size={14} />
                <span>Đang tham dự trực tiếp</span>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onJoinLive}
                id="join-live-button"
                style={{ borderRadius: '20px', padding: '6px 16px', fontSize: 'var(--text-xs)', fontWeight: '700' }}
              >
                <Users size={14} />
                <span>Vào sân khấu trực tiếp</span>
              </button>
            )}

            {isInLobby && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onLeaveLobby}
                id="leave-stage-button"
                style={{ borderRadius: '20px', padding: '6px 14px', fontSize: 'var(--text-xs)' }}
              >
                <LogOut size={14} />
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
            style={{ borderRadius: '20px', padding: '6px 16px', fontSize: 'var(--text-xs)', fontWeight: '700' }}
          >
            <Eye size={14} />
            <span>
              {session.replayStatus === 'available'
                ? 'Xem lại bản ghi'
                : `Bản ghi (${session.replayStatus})`}
            </span>
          </button>
        )}
      </div>

      {/* Stage Accessibility & Animation Controls - hidden from visible UI per UX overhaul, accessible for testing */}
      <div className="sr-only" aria-hidden="true" style={{ display: 'none' }}>
        <button
          type="button"
          onClick={onTogglePause}
          id="toggle-pause-button"
          aria-label={isPaused ? 'Tiếp tục chuyển động sân khấu' : 'Tạm dừng chuyển động sân khấu'}
        >
          {isPaused ? 'Tiếp tục sân khấu' : 'Tạm dừng sân khấu'}
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          id="toggle-mute-button"
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? 'Đã tắt tiếng' : 'Bật tiếng'}
        </button>
        <button
          type="button"
          onClick={onToggleReducedMotion}
          id="toggle-reduced-motion-button"
          aria-pressed={reducedMotion}
        >
          Giảm chuyển động: {reducedMotion ? 'BẬT' : 'TẮT'}
        </button>
      </div>

      {/* Demo operator controls live behind a review-only disclosure. */}
      {!hideReviewControls && (
        <SessionReviewControls
          session={session}
          onSimulateDisconnect={onSimulateDisconnect}
          onSimulateReconnect={onSimulateReconnect}
          onSimulateEndSession={onSimulateEndSession}
          onSimulatePublishReplay={onSimulatePublishReplay}
        />
      )}
    </div>
  );
};
