import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { World } from '../domain/types';
import { useApp } from '../context/AppContext';
import { UserCheck, UserPlus, Link2, Sparkles, Radio } from 'lucide-react';
import { AvatarRenderer } from './AvatarRenderer';

export interface WorldCardProps {
  world: World;
  viewMode?: 'scenery' | 'list';
}

export const WorldCard: React.FC<WorldCardProps> = ({ world, viewMode = 'scenery' }) => {
  const { state, dispatch } = useApp();
  const [coverFailed, setCoverFailed] = useState(false);
  const isFollowed = state.followedWorldIds.includes(world.id);

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_FOLLOW', worldId: world.id });
  };

  const isArtist = world.type === 'artist';

  if (viewMode === 'list') {
    return (
      <article
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: isArtist ? 'var(--radius-full)' : 'var(--radius-md)',
              backgroundColor: isArtist ? '#EDE9FE' : '#0F172A',
              border: isArtist ? '1px solid #C4B5FD' : '1px solid rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isArtist ? 'var(--primary)' : '#22D3EE',
              fontWeight: '800',
              fontSize: 'var(--text-md)',
              flexShrink: 0,
            }}
          >
            {isArtist ? (
              <AvatarRenderer role="artist" displayName={world.name} size="sm" isFrozen={false} />
            ) : (
              <Radio size={20} color="#22D3EE" data-testid="neon-ip-mark-list" />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Link
                to={`/worlds/${world.id}`}
                style={{ fontWeight: '700', fontSize: 'var(--text-md)', color: 'var(--ink)' }}
                className="hover-underline"
              >
                {world.name}
              </Link>
              <span className="tag" style={{ fontSize: '11px' }}>
                {isArtist ? 'Artist World' : 'IP World'}
              </span>
            </div>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '420px',
              }}
            >
              {world.description}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleFollowToggle}
            className={`btn ${isFollowed ? 'btn-secondary' : 'btn-primary'}`}
            style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}
            id={`follow-btn-${world.id}`}
            aria-label={isFollowed ? `Bỏ theo dõi ${world.name}` : `Theo dõi ${world.name}`}
          >
            {isFollowed ? (
              <>
                <UserCheck size={14} color="#059669" />
                <span>Đang theo dõi</span>
              </>
            ) : (
              <>
                <UserPlus size={14} />
                <span>Theo dõi</span>
              </>
            )}
          </button>
          <Link
            to={`/worlds/${world.id}`}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
          >
            Vào World
          </Link>
        </div>
      </article>
    );
  }

  // Scenery (Card) View Mode
  return (
    <article className={`world-card world-card--${isArtist ? 'artist' : 'ip'}`}>
      <Link to={`/worlds/${world.id}`} className="world-card__art" aria-label={`Mở ${world.name}`}>
        {!coverFailed && (
          <img
            src={
              world.id === 'artist-mira'
                ? '/images/mira-cover.jpg'
                : world.id === 'artist-kai'
                ? '/images/kai-cover.jpg'
                : world.id === 'artist-a'
                ? '/images/artist-a-cover.jpg'
                : '/images/neon-sessions-cover.jpg'
            }
            alt=""
            className="world-card__cover-img"
            onError={() => setCoverFailed(true)}
          />
        )}
        <div className="world-card__cover-gradient" aria-hidden="true" />
        <span className="world-card__type">
          {isArtist ? <Sparkles size={13} aria-hidden="true" /> : <Radio size={13} aria-hidden="true" />}
          {isArtist ? 'Artist World' : 'IP World'}
        </span>
        <span className="demo-badge">DEMO</span>
      </Link>

      <div className="world-card__content">
        <div className="world-card__title-row">
          <div className="world-card__avatar" aria-hidden="true">
            {isArtist ? (
              <AvatarRenderer role="artist" displayName={world.name} size="sm" isFrozen={false} />
            ) : (
              <div className="world-card__ip-mark" data-testid="neon-ip-mark">
                <Radio size={18} color="#22D3EE" />
              </div>
            )}
          </div>
          <div>
            <span>{isFollowed ? 'Bạn đang theo dõi' : 'Đang mở cửa'}</span>
            <h3><Link to={`/worlds/${world.id}`}>{world.name}</Link></h3>
          </div>
        </div>

        <p>{world.description}</p>

      {/* Linked Worlds display (Does NOT auto-follow) */}
      {world.linkedWorldIds.length > 0 && (
          <div className="world-card__links">
          <span>
            <Link2 size={12} /> Liên kết liên quan:
          </span>
          <div>
            {world.linkedWorldIds.map((lid) => {
              const linked = state.worlds[lid];
              if (!linked) return null;
              return (
                <Link
                  key={lid}
                  to={`/worlds/${lid}`}
                    className="tag hover-tag"
                >
                  {linked.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

        <div className="world-card__actions">
        <button
          type="button"
          onClick={handleFollowToggle}
          className={`btn ${isFollowed ? 'btn-secondary' : 'btn-primary'}`}
          id={`scenery-follow-btn-${world.id}`}
          aria-label={isFollowed ? `Bỏ theo dõi ${world.name}` : `Theo dõi ${world.name}`}
        >
          {isFollowed ? (
            <>
              <UserCheck size={16} color="#059669" />
              <span>Đang theo dõi</span>
            </>
          ) : (
            <>
              <UserPlus size={16} />
              <span>Theo dõi</span>
            </>
          )}
        </button>
        <Link
          to={`/worlds/${world.id}`}
          className="btn btn-secondary"
          id={`enter-world-btn-${world.id}`}
        >
          Vào World
        </Link>
        </div>
      </div>
    </article>
  );
};
