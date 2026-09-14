import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Play, Pause, Lock, AlertCircle, Radio, Heart } from 'lucide-react';

export interface SilentMediaPlaceholderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  reducedMotion?: boolean;
  mediaStatus?: 'cleared_local' | 'missing' | 'expired';
  trackTitle?: string;
  cheerCount?: number;
  onCheer?: () => void;
  floatingHearts?: { id: number; left: number; color: string }[];
}

export const SilentMediaPlaceholder: React.FC<SilentMediaPlaceholderProps> = ({
  isMuted,
  onToggleMute,
  isPlaying,
  onTogglePlay,
  reducedMotion = false,
  mediaStatus = 'cleared_local',
  trackTitle = 'Không gian trò chuyện trực tiếp · Ambient Acoustic',
  cheerCount: controlledCheerCount,
  onCheer: controlledOnCheer,
  floatingHearts: controlledFloatingHearts,
}) => {
  const [internalCheerCount, setInternalCheerCount] = useState(1280);
  const [internalFloatingHearts, setInternalFloatingHearts] = useState<{ id: number; left: number; color: string }[]>([]);

  const cheerCount = controlledCheerCount !== undefined ? controlledCheerCount : internalCheerCount;
  const floatingHearts = controlledFloatingHearts !== undefined ? controlledFloatingHearts : internalFloatingHearts;

  const handleCheer = () => {
    if (controlledOnCheer) {
      controlledOnCheer();
    } else {
      setInternalCheerCount(prev => prev + 1);
      const id = Date.now() + Math.random();
      const colors = ['#EF4444', '#EC4899', '#F43F5E', '#8B5CF6', '#F59E0B'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.floor(Math.random() * 50) + 40;
      setInternalFloatingHearts(prev => [...prev.slice(-12), { id, left, color }]);
      setTimeout(() => {
        setInternalFloatingHearts(prev => prev.filter(h => h.id !== id));
      }, 1800);
    }
  };

  const isExpired = mediaStatus === 'expired';
  const isMissing = mediaStatus === 'missing';
  const effectivePlaying = isPlaying && !isExpired;
  const isVisualActive = effectivePlaying && !isMuted && !reducedMotion;

  // 12 bars for simulated acoustic spectrum
  const spectrumHeights = [30, 65, 45, 80, 50, 90, 75, 40, 85, 60, 35, 70];

  return (
    <div
      className="silent-media-player-strip stage-player-overlay"
      style={{
        padding: '10px 16px',
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(8px)',
        color: '#FFFFFF',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
      aria-label="Khối âm thanh mô phỏng thử nghiệm"
      data-testid="silent-media-player"
    >
      {/* Missing Media Notice */}
      {isMissing && (
        <div
          style={{
            padding: '6px 10px',
            backgroundColor: 'rgba(245, 158, 11, 0.18)',
            border: '1px solid #F59E0B',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
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
            padding: '6px 10px',
            backgroundColor: 'rgba(239, 68, 68, 0.18)',
            border: '1px solid #EF4444',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
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

      {/* Modern Player Bar: Left Controls & Info | Right Spectrum Equalizer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        {/* Left: Play/Pause, Mute, Live Badge, Track Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={isExpired ? undefined : onTogglePlay}
            disabled={isExpired}
            className="player-control-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: isExpired
                ? 'rgba(255, 255, 255, 0.08)'
                : effectivePlaying
                ? 'rgba(255, 255, 255, 0.15)'
                : '#10B981',
              color: isExpired ? 'rgba(255, 255, 255, 0.4)' : '#FFFFFF',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: isExpired ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
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
              <Lock size={13} />
            ) : effectivePlaying ? (
              <Pause size={13} />
            ) : (
              <Play size={13} />
            )}
            <span className="player-btn-label">
              {isExpired
                ? 'Hết hạn bản quyền'
                : effectivePlaying
                ? 'Tạm dừng'
                : <><span>Phát</span><span className="sr-only"> âm thanh</span></>}
            </span>
          </button>

          {/* Volume/Mute Button — icon-only with volume slider */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
            <button
              type="button"
              onClick={onToggleMute}
              className="player-control-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                padding: 0,
                backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50%',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              data-testid="audio-mute-toggle"
              aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
              title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            {/* Volume Slider */}
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={isMuted ? 0 : 75}
              onChange={() => {}}
              aria-label="Âm lượng"
              style={{
                width: '60px',
                height: '4px',
                accentColor: '#34D399',
                cursor: 'pointer',
                opacity: 0.85,
              }}
            />
          </div>

          {/* Live Indicator Dot */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '12px',
              color: '#F87171',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.02em',
            }}
          >
            <Radio size={11} className="pulse-icon" />
            <span>LIVE</span>
          </div>

          {/* Track Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
            <Music size={13} color="#34D399" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: '600' }}>{trackTitle}</span>
          </div>
        </div>

        {/* Right: Simulated Equalizer Spectrum & Video Cheer Heart Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '3px',
              height: '24px',
              padding: '2px 8px',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '6px',
            }}
            data-testid="audio-spectrum"
            aria-hidden="true"
          >
            {spectrumHeights.map((height, idx) => (
              <div
                key={idx}
                style={{
                  width: '3px',
                  height: isVisualActive ? `${Math.max(15, height)}%` : '15%',
                  backgroundColor: isVisualActive ? '#34D399' : '#64748B',
                  borderRadius: '1.5px',
                  transition: isVisualActive ? 'height 120ms ease' : 'height 250ms ease',
                }}
              />
            ))}
          </div>

          {/* YouTube / Weverse Live Stream Cheer Heart Button */}
          <button
            type="button"
            onClick={handleCheer}
            className="stage-cheer-btn"
            id="chat-cheer-btn"
            data-testid="stage-cheer-btn"
            aria-label="Thả tim cổ vũ nghệ sĩ"
            title="Thả tim cổ vũ nghệ sĩ"
          >
            <Heart size={15} fill="#F43F5E" color="#F43F5E" className="heart-icon-bounce" />
            <span>{cheerCount >= 1000 ? `${(cheerCount / 1000).toFixed(1)}k` : cheerCount}</span>
          </button>
        </div>
      </div>

      {/* Floating Hearts stream rising up from bottom-right of video */}
      <div className="stage-floating-hearts-container" aria-hidden="true">
        {floatingHearts.map((h) => (
          <span
            key={h.id}
            className="stage-floating-heart"
            style={{ left: `${h.left}%`, color: h.color }}
          >
            ♥
          </span>
        ))}
      </div>

      {/* Accessible disclaimer node for test contract compatibility (§5.2 invariant) */}
      <span
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Nội dung âm thanh độc lập, thử nghiệm nội bộ. Không sử dụng API phát trực tuyến của bên thứ ba, không yêu cầu quyền micro hay camera.
      </span>
    </div>
  );
};
