import React from 'react';
import { Link } from 'react-router-dom';
import { World } from '../domain/types';
import { useApp } from '../context/AppContext';
import { UserCheck, UserPlus, Link2, Sparkles, Radio } from 'lucide-react';

export interface WorldCardProps {
  world: World;
  viewMode?: 'scenery' | 'list';
}

export const WorldCard: React.FC<WorldCardProps> = ({ world, viewMode = 'scenery' }) => {
  const { state, dispatch } = useApp();
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
              backgroundColor: isArtist ? '#EDE9FE' : '#E0F2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isArtist ? 'var(--primary)' : '#0284C7',
              fontWeight: '800',
              fontSize: 'var(--text-md)',
              flexShrink: 0,
            }}
          >
            {world.name.charAt(0)}
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
                {isArtist ? 'Nghệ sĩ' : 'IP / Show'}
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
        <span className="world-card__sun" aria-hidden="true" />
        <span className="world-card__horizon" aria-hidden="true" />
        <span className="world-card__platform" aria-hidden="true" />
        <span className="world-card__figure" aria-hidden="true">
          <span />
        </span>
        <span className="world-card__type">
          {isArtist ? <Sparkles size={13} aria-hidden="true" /> : <Radio size={13} aria-hidden="true" />}
          {isArtist ? 'Artist World' : 'IP World'}
        </span>
        <span className="demo-badge">DEMO</span>
      </Link>

      <div className="world-card__content">
        <div className="world-card__title-row">
          <div className="world-card__avatar" aria-hidden="true">{world.name.charAt(0)}</div>
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
