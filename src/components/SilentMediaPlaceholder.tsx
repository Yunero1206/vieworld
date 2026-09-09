import React from 'react';
import { Volume2, VolumeX, Music, ShieldCheck, Play, Pause, Lock, AlertCircle } from 'lucide-react';

export interface SilentMediaPlaceholderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  reducedMotion?: boolean;
  mediaStatus?: 'cleared_local' | 'missing' | 'expired';
  trackTitle?: string;
}

export const SilentMediaPlaceholder: React.FC<SilentMediaPlaceholderProps> = ({
  isMuted,
  onToggleMute,
  isPlaying,
  onTogglePlay,
  reducedMotion = false,
  mediaStatus = 'cleared_local',
  trackTitle = 'demo-audio-ambient-loop-v1 (Âm thanh thử nghiệm nội bộ)',
}) => {
  const isExpired = mediaStatus === 'expired';
  const isMissing = mediaStatus === 'missing';
  const effectivePlaying = isPlaying && !isExpired;
  const isVisualActive = effectivePlaying && !isMuted && !reducedMotion;

  // 12 bars for simulated acoustic spectrum
  const spectrumHeights = [30, 65, 45, 80, 50, 90, 75, 40, 85, 60, 35, 70];

  return (
    <div
      className="card"
      style={{
        padding: '16px 20px',
        backgroundColor: '#1E1B4B',
        color: '#FFFFFF',
        border: isExpired
          ? '1px solid rgba(239, 68, 68, 0.4)'
          : isMissing
          ? '1px solid rgba(245, 158, 11, 0.4)'
          : '1px solid rgba(169, 229, 212, 0.2)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      aria-label="Khối âm thanh mô phỏng thử nghiệm"
      data-testid="silent-media-player"
    >
      {/* Missing Media Notice */}
      {isMissing && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid #F59E0B',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            color: '#FCD34D',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          data-testid="missing-media-notice"
        >
          <AlertCircle size={14} color="#FBBF24" style={{ flexShrink: 0 }} />
          <span>
            Tệp âm thanh mẫu không khả dụng — Trình mô phỏng im lặng (Silent Demo Mode) vẫn hoạt động bình thường.
          </span>
        </div>
      )}

      {/* Expired Rights Notice */}
      {isExpired && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            color: '#FCA5A5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          data-testid="expired-rights-audio-notice"
        >
          <Lock size={14} color="#F87171" style={{ flexShrink: 0 }} />
          <span>
            Bản quyền âm thanh đã hết hạn — Tính năng phát lại bị vô hiệu hóa theo thỏa thuận bản quyền.
          </span>
        </div>
      )}

      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Music size={16} color="#A9E5D4" />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: '700', color: '#E0E7FF' }}>
            {trackTitle}
          </span>
          <span className="demo-badge">DEMO</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Play/Pause toggle - Disabled if expired */}
          <button
            type="button"
            onClick={isExpired ? undefined : onTogglePlay}
            disabled={isExpired}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: isExpired
                ? 'rgba(255, 255, 255, 0.05)'
                : effectivePlaying
                ? 'rgba(255, 255, 255, 0.1)'
                : 'var(--accent)',
              color: isExpired ? 'rgba(255, 255, 255, 0.4)' : effectivePlaying ? '#FFFFFF' : '#151426',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: '700',
              cursor: isExpired ? 'not-allowed' : 'pointer',
              opacity: isExpired ? 0.6 : 1,
            }}
            data-testid="audio-play-toggle"
            aria-label={
              isExpired
                ? 'Phát âm thanh bị vô hiệu hóa do hết hạn bản quyền'
                : effectivePlaying
                ? 'Tạm dừng âm thanh'
                : 'Phát âm thanh'
            }
          >
            {isExpired ? (
              <Lock size={14} />
            ) : effectivePlaying ? (
              <Pause size={14} />
            ) : (
              <Play size={14} />
            )}
            <span>
              {isExpired
                ? 'Hết hạn bản quyền'
                : effectivePlaying
                ? 'Tạm dừng'
                : 'Phát âm thanh'}
            </span>
          </button>

          {/* Mute/Unmute toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: isMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: '700',
              cursor: 'pointer',
            }}
            data-testid="audio-mute-toggle"
            aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isMuted ? 'Đã tắt tiếng' : 'Bật tiếng'}</span>
          </button>
        </div>
      </div>

      {/* Visual Spectrum Bars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '6px',
          height: '48px',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
        }}
        data-testid="audio-spectrum"
        aria-hidden="true"
      >
        {spectrumHeights.map((height, idx) => (
          <div
            key={idx}
            style={{
              width: '8px',
              height: isVisualActive ? `${height}%` : '8%',
              backgroundColor: isVisualActive ? '#A9E5D4' : '#6B7280',
              borderRadius: '2px',
              transition: isVisualActive ? 'height 150ms ease' : 'height 300ms ease',
            }}
          />
        ))}
      </div>

      {/* Rights & Integrity Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: 'var(--text-xs)',
          color: '#9CA3AF',
        }}
      >
        <ShieldCheck size={14} color="#34D399" />
        <span>
          Nội dung âm thanh độc lập, thử nghiệm nội bộ. Không sử dụng API phát trực tuyến của bên thứ ba, không yêu cầu quyền micro hay camera.
        </span>
      </div>
    </div>
  );
};
