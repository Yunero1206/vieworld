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
  const particleIdRef = useRef(0);
  const bumpTimeoutRef = useRef<number | null>(null);


  const triggerCheer = () => {
    // Increment cheer count
    setCheerCount(prev => prev + 1);

    // Trigger bump scale animation on badge
    setIsBumping(true);
    if (bumpTimeoutRef.current) clearTimeout(bumpTimeoutRef.current);
    bumpTimeoutRef.current = window.setTimeout(() => setIsBumping(false), 200);

    // Generate 3-4 diverse particles
    const particleTypes: Array<'star' | 'heart' | 'sparkle' | 'zap'> = ['star', 'heart', 'sparkle'];
    const newParticles: Particle[] = Array.from({ length: 3 }).map(() => {
      particleIdRef.current += 1;
      return {
        id: particleIdRef.current,
        startX: (Math.random() - 0.5) * 24,
        endX: (Math.random() - 0.5) * 90,
        rotation: (Math.random() - 0.5) * 60,
        type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
        color: fandom.signatureLightstick.color,
      };
    });

    setParticles(prev => [...prev.slice(-15), ...newParticles]);
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
        </div>

        <button
          type="button"
          className="fandom-cheer-btn"
          style={{
            background: fandom.signatureLightstick.gradient,
            boxShadow: `0 4px 14px ${(fandom.signatureLightstick as any).glowColor || fandom.signatureLightstick.color}`,
          }}
          onClick={triggerCheer}
          onKeyDown={handleKeyDown}
          aria-label="Vẫy Lightstick cổ vũ"
          title={`Vẫy Lightstick ${fandom.fandomName} (Phím Space)`}
        >
          <Sparkles size={20} className="fandom-lightstick-icon" />
        </button>
      </div>
    </div>
  );
};
