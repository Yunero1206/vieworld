import React from 'react';
import { Volume2, VolumeX, Music, ShieldCheck, Play, Pause } from 'lucide-react';

export interface SilentMediaPlaceholderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  reducedMotion?: boolean;
}

export const SilentMediaPlaceholder: React.FC<SilentMediaPlaceholderProps> = ({
  isMuted,
  onToggleMute,
  isPlaying,
  onTogglePlay,
  reducedMotion = false,
}) => {
  const isVisualActive = isPlaying && !isMuted && !reducedMotion;

  // 12 bars for simulated acoustic spectrum
  const spectrumHeights = [30, 65, 45, 80, 50, 90, 75, 40, 85, 60, 35, 70];

  return (
    <div
      className="card"
      style={{
        padding: '16px 20px',
        backgroundColor: '#1E1B4B',
        color: '#FFFFFF',
        border: '1px solid rgba(169, 229, 212, 0.2)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      aria-label="Khối âm thanh mô phỏng thử nghiệm"
    >
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Music size={16} color="#A9E5D4" />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: '700', color: '#E0E7FF' }}>
            demo-audio-ambient-loop-v1 (Âm thanh thử nghiệm nội bộ)
          </span>
          <span className="demo-badge">DEMO</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Play/Pause toggle */}
          <button
            type="button"
            onClick={onTogglePlay}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: isPlaying ? 'rgba(255, 255, 255, 0.1)' : 'var(--accent)',
              color: isPlaying ? '#FFFFFF' : '#151426',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: '700',
              cursor: 'pointer',
            }}
            aria-label={isPlaying ? 'Tạm dừng âm thanh' : 'Phát âm thanh'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Tạm dừng' : 'Phát tiếp'}</span>
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
