import React from 'react';
import { AvatarAsset } from '../domain/types';
import { Sparkles, WifiOff, VolumeX } from 'lucide-react';

export interface AvatarStageProps {
  avatar?: AvatarAsset;
  artistPresence: 'present' | 'reconnecting' | 'disconnected' | 'absent';
  isPaused?: boolean;
  isMuted?: boolean;
  reducedMotion?: boolean;
}

export const AvatarStage: React.FC<AvatarStageProps> = ({
  avatar,
  artistPresence,
  isPaused = false,
  isMuted = false,
  reducedMotion = false,
}) => {
  const isDisconnected = artistPresence === 'disconnected';
  const isAbsent = artistPresence === 'absent';
  const isFrozen = isPaused || reducedMotion || isDisconnected || isAbsent;

  return (
    <div
      className="avatar-stage-venue"
      style={{
        width: '100%',
        minHeight: '340px',
        backgroundColor: 'var(--stage)',
        borderRadius: 'var(--radius-xl)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      aria-label="Sân khấu ảo Avatar 2D"
    >
      {/* Stage ambient spotlight vectors */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          left: '20%',
          width: '200px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(169, 229, 212, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '20%',
          width: '220px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(101, 81, 200, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Stage floor circle */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          width: '260px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(169, 229, 212, 0.2)',
          boxShadow: '0 0 20px rgba(101, 81, 200, 0.3)',
        }}
      />

      {/* Disconnected / Reconnecting Overlay Notice */}
      {isDisconnected && (
        <div
          style={{
            position: 'absolute',
            zIndex: 20,
            backgroundColor: 'rgba(21, 20, 38, 0.85)',
            backdropFilter: 'blur(6px)',
            padding: '16px 24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #F87171',
            color: '#FFFFFF',
            textAlign: 'center',
            maxWidth: '360px',
          }}
          data-testid="disconnected-stage-notice"
        >
          <WifiOff size={28} color="#F87171" style={{ margin: '0 auto 8px auto' }} />
          <strong style={{ display: 'block', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
            Nghệ sĩ đã ngắt kết nối
          </strong>
          <span style={{ fontSize: 'var(--text-xs)', color: '#D8D9E1' }}>
            Sân khấu tạm ngưng chuyển động. Hệ thống không sử dụng AI để đóng giả nghệ sĩ.
          </span>
        </div>
      )}

      {/* Modular 2D Original SVG Avatar Asset */}
      <div
        className={`avatar-graphic ${isFrozen ? 'frozen' : 'animating-idle'}`}
        style={{
          zIndex: 10,
          opacity: isDisconnected || isAbsent ? 0.35 : 1,
          transition: 'opacity 200ms ease',
          transformOrigin: 'bottom center',
          filter: isFrozen ? 'grayscale(30%)' : 'none',
        }}
        data-testid="avatar-graphic"
        data-frozen={isFrozen}
      >
        <svg
          width="200"
          height="240"
          viewBox="0 0 200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Hình minh họa avatar 2D nghệ sĩ"
        >
          {/* Stage Glow Aura */}
          <circle cx="100" cy="110" r="70" fill="url(#stageGlow)" opacity="0.4" />

          {/* Avatar Body / Torso with Midnight Jacket */}
          <path
            d="M55 210C55 175 75 160 100 160C125 160 145 175 145 210V220H55V210Z"
            fill="#201E3C"
            stroke="#6551C8"
            strokeWidth="3"
          />

          {/* Midnight Jacket Lapels */}
          <path d="M75 160L90 195L100 180L110 195L125 160" stroke="#A9E5D4" strokeWidth="2.5" strokeLinecap="round" />

          {/* Neck */}
          <rect x="90" y="130" width="20" height="35" rx="6" fill="#FCD34D" />

          {/* Head */}
          <circle cx="100" cy="105" r="42" fill="#FDE68A" stroke="#20212B" strokeWidth="2.5" />

          {/* Stylized Stage Hair */}
          <path
            d="M60 100C60 65 75 55 100 55C125 55 140 65 140 100C130 90 120 90 100 95C80 90 70 90 60 100Z"
            fill="#312E81"
          />

          {/* Eyes (Friendly, stylized) */}
          <ellipse cx="86" cy="105" rx="4" ry="5.5" fill="#1E1B4B" />
          <ellipse cx="114" cy="105" rx="4" ry="5.5" fill="#1E1B4B" />
          <circle cx="88" cy="103" r="1.5" fill="#FFFFFF" />
          <circle cx="116" cy="103" r="1.5" fill="#FFFFFF" />

          {/* Smile */}
          <path d="M94 122C97 125 103 125 106 122" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />

          {/* Earpiece Glow Accessory (§5.1: avatar-a-v1) */}
          <circle cx="140" cy="108" r="5" fill="#A9E5D4" />
          <circle cx="140" cy="108" r="8" stroke="#A9E5D4" strokeWidth="1.5" opacity="0.6" />

          <defs>
            <radialGradient id="stageGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#A9E5D4" />
              <stop offset="100%" stopColor="#6551C8" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Stage Status Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: 'var(--text-xs)',
          color: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <Sparkles size={12} color="#A9E5D4" />
        <span>Avatar: {avatar?.id || 'avatar-a-v1'} · Minh họa 2D thuần túy</span>
        {isMuted && <VolumeX size={12} color="#F87171" aria-label="Đang tắt tiếng" />}
      </div>
    </div>
  );
};
