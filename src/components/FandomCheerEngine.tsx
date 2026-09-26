import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Zap, Star } from 'lucide-react';
import { ARTIST_FANDOM_REGISTRY } from '../data/artistChatConfig';

interface Particle {
  id: number;
  startX: number;
  endX: number;
  rotation: number;
  type: 'star' | 'heart' | 'sparkle' | 'zap';
  color: string;
}

interface FandomCheerEngineProps {
  worldId: string;
  className?: string;
}

export const FandomCheerEngine: React.FC<FandomCheerEngineProps> = ({ worldId, className = '' }) => {
  const fandom = ARTIST_FANDOM_REGISTRY[worldId] || ARTIST_FANDOM_REGISTRY['artist-a'];
  
  // Base initial cheer counts per artist
  const initialCounts: Record<string, number> = {
    'artist-a': 24580,
    'artist-mira': 31420,
    'artist-kai': 18900,
    'neon-sessions': 12350,
  };

  const [cheerCount, setCheerCount] = useState<number>(initialCounts[worldId] || 20000);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isBumping, setIsBumping] = useState(false);
  const [streak, setStreak] = useState(0);
  const particleIdRef = useRef(0);
  const bumpTimeoutRef = useRef<number | null>(null);
  const streakTimerRef = useRef<number | null>(null);

  const triggerCheer = () => {
    // Increment cheer count
    setCheerCount(prev => prev + 1);

    // Track rhythmic sync streak (resets if idle > 1.8s)
    setStreak(prev => {
      const next = prev + 1;
      if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
      streakTimerRef.current = window.setTimeout(() => setStreak(0), 1800);
      return next;
    });

    // Trigger bump scale animation on badge
    setIsBumping(true);
    if (bumpTimeoutRef.current) clearTimeout(bumpTimeoutRef.current);
    bumpTimeoutRef.current = window.setTimeout(() => setIsBumping(false), 200);

    // Generate 3-5 diverse particles based on streak
    const burstCount = streak >= 5 ? 5 : 3;
    const particleTypes: Array<'star' | 'heart' | 'sparkle' | 'zap'> = ['star', 'heart', 'sparkle', 'zap'];
    const newParticles: Particle[] = Array.from({ length: burstCount }).map(() => {
      particleIdRef.current += 1;
      return {
        id: particleIdRef.current,
        startX: (Math.random() - 0.5) * 28,
        endX: (Math.random() - 0.5) * (streak >= 5 ? 120 : 90),
        rotation: (Math.random() - 0.5) * 70,
        type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
        color: fandom.signatureLightstick.color,
      };
    });

    setParticles(prev => [...prev.slice(-18), ...newParticles]);
  };

  // Clean up old particles after animation finishes (1.2s)
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles(prev => (prev.length > 3 ? prev.slice(3) : []));
    }, 1200);
    return () => clearTimeout(timer);
  }, [particles]);

  // Spacebar keyboard listener when focused or globally during broadcast
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      triggerCheer();
    }
  };

  return (
    <div className={`fandom-cheer-container ${className}`}>
      {/* Floating Particles Area */}
      <div className="fandom-particles-stage" aria-hidden="true">
        {particles.map(p => (
          <span
            key={p.id}
            className="fandom-cheer-particle"
            style={
              {
                '--fly-start-x': `${p.startX}px`,
                '--fly-end-x': `${p.endX}px`,
                '--fly-rot': `${p.rotation}deg`,
                color: p.color,
              } as React.CSSProperties
            }
          >
            {p.type === 'star' && <Star size={20} fill={p.color} />}
            {p.type === 'heart' && <Heart size={18} fill={p.color} />}
            {p.type === 'sparkle' && <Sparkles size={20} />}
            {p.type === 'zap' && <Zap size={18} fill={p.color} />}
          </span>
        ))}
      </div>

      {/* Unified Single Fandom Cheer Card */}
      <div className="fandom-cheer-unified-box">
        <div className="fandom-cheer-info">
          <div className="fandom-cheer-headline">
            <span className="fandom-cheer-badge" style={{ color: fandom.signatureLightstick.color }}>
              Fandom {fandom.fandomName}
            </span>
            <span className={`fandom-cheer-counter ${isBumping ? 'bump' : ''}`}>
              {cheerCount.toLocaleString('vi-VN')} lượt cổ vũ
            </span>
          </div>

          <div className="fandom-cheer-tempo-row">
            <span className="fandom-cheer-tempo-pill">♫ Nhịp hòa thanh 120 BPM</span>
            {streak >= 3 && (
              <span className="fandom-cheer-streak-badge">
                ⚡ x{streak} Hòa nhịp!
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`fandom-cheer-btn in-sync-pulse ${streak >= 4 ? 'is-streaking' : ''}`}
          style={{
            background: fandom.signatureLightstick.gradient,
            boxShadow: `0 4px 14px ${(fandom.signatureLightstick as any).glowColor || fandom.signatureLightstick.color}`,
          }}
          onClick={triggerCheer}
          onKeyDown={handleKeyDown}
          aria-label="Vẫy Lightstick cổ vũ"
          title={`Vẫy Lightstick ${fandom.fandomName} (Phím Space · 120 BPM)`}
        >
          <Sparkles size={20} className="fandom-lightstick-icon" />
        </button>
      </div>
    </div>
  );
};
