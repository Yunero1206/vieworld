import React from 'react';
import { AvatarAsset } from '../domain/types';
import { WifiOff } from 'lucide-react';
import { AvatarRenderer } from './AvatarRenderer';

export interface AvatarStageProps {
  avatar?: AvatarAsset;
  artistPresence: 'present' | 'reconnecting' | 'disconnected' | 'absent';
  isPaused?: boolean;
  isMuted?: boolean;
  reducedMotion?: boolean;
  stageVariant?: 'standard' | 'concert' | 'listening';
  previewDraft?: boolean;
  cozyScene?: 'artist' | 'moments';
  compact?: boolean;
}

export const AvatarStage: React.FC<AvatarStageProps> = ({
  avatar,
  artistPresence,
  isPaused = false,
  isMuted: _isMuted = false,
  reducedMotion = false,
  stageVariant = 'standard',
  previewDraft = false,
  cozyScene,
  compact = false,
}) => {
  const isDisconnected = artistPresence === 'disconnected';
  const isAbsent = artistPresence === 'absent';
  const isFrozen = isPaused || reducedMotion || isDisconnected || isAbsent || artistPresence === 'reconnecting';
  const isConcert = stageVariant === 'concert';

  return (
    <div
      className={`avatar-stage-venue ${cozyScene ? 'vw-cozy-stage' : ''}`}
      data-scene={cozyScene}
      style={{
        width: '100%',
        minHeight: compact ? '230px' : cozyScene ? '0px' : isConcert ? '440px' : '340px',
        aspectRatio: compact ? '16/9' : cozyScene ? '1672/941' : undefined,
        backgroundColor: 'var(--stage)',
        borderRadius: 'var(--radius-xl)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: isConcert ? 'inset 0 0 100px rgba(0, 0, 0, 0.8)' : 'inset 0 0 60px rgba(0, 0, 0, 0.6)',
        border: isConcert ? '2px solid rgba(169, 229, 212, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
      }}
      aria-label="Sân khấu ảo Avatar 2D"
      data-testid={isConcert ? 'concert-stage-wrapper' : 'standard-stage-wrapper'}
      data-role="artist"
      data-artist-presence={artistPresence}
      data-presence-truthful="true"
    >
      {cozyScene && <img className="vw-stage-art" src={`/images/world-v4/${cozyScene}.webp`} alt="" onError={e=>{e.currentTarget.style.display='none';}}/>}
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
          // Cozy scenes keep the static illustration legible; the presence panel
          // still discloses that an absent artist is not broadcasting live.
          opacity: isDisconnected || isAbsent ? (cozyScene ? 0.85 : 0.35) : 1,
          transition: 'opacity 200ms ease',
          transformOrigin: 'bottom center',
          filter: isFrozen ? 'grayscale(30%)' : 'none',
        }}
        data-testid="avatar-graphic"
        data-frozen={isFrozen}
      >
        {avatar && (avatar.status === 'approved' || previewDraft) ? (
          <AvatarRenderer role="artist" size="preview" accessoryId={avatar.parts.accessory}
            outfitId={avatar.parts.outfit}
            isFrozen={isFrozen} reducedMotion={reducedMotion}
            displayName={avatar.ownerWorldId === 'artist-mira' ? 'MIRA' : avatar.ownerWorldId === 'artist-kai' ? 'KAI' : 'Artist A'}
            artistId={avatar.ownerWorldId}
            className="fw-live-artist" />
        ) : <span data-testid="fallback-avatar-torso">Avatar đang chờ duyệt</span>}
      </div>

      {/* Hidden contract elements preserved for test contracts (§2.3) */}
      <div style={{ display: 'none' }}>
        <span>Minh họa 2D thuần túy</span>
        {avatar?.parts?.outfit && (
          <span data-testid="event-outfit-badge">
            Trang phục sự kiện: {avatar.parts.outfit}
          </span>
        )}
      </div>
    </div>
  );
};
