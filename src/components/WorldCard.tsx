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
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative scenery backdrop */}
      <div
        style={{
          height: '110px',
          margin: '-24px -24px 16px -24px',
          background: isArtist
            ? 'linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)'
            : 'linear-gradient(135deg, #0C4A6E 0%, #082F49 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '16px',
        }}
      >
        <span
          className="tag"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {isArtist ? <Sparkles size={12} style={{ marginRight: '4px' }} /> : <Radio size={12} style={{ marginRight: '4px' }} />}
          {isArtist ? 'Nghệ sĩ hư cấu' : 'Chương trình IP'}
        </span>
        <span className="demo-badge">DEMO</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: isArtist ? 'var(--radius-full)' : 'var(--radius-md)',
            backgroundColor: 'var(--surface)',
            border: '2px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-lg)',
            fontWeight: '800',
            color: isArtist ? 'var(--primary)' : '#0284C7',
            marginTop: '-40px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {world.name.charAt(0)}
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: '700' }}>
            <Link to={`/worlds/${world.id}`} style={{ color: 'var(--ink)' }}>
              {world.name}
            </Link>
          </h3>
        </div>
      </div>

      <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
        {world.description}
      </p>

      {/* Linked Worlds display (Does NOT auto-follow) */}
      {world.linkedWorldIds.length > 0 && (
        <div style={{ marginBottom: '16px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <Link2 size={12} /> Liên kết liên quan:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {world.linkedWorldIds.map((lid) => {
              const linked = state.worlds[lid];
              if (!linked) return null;
              return (
                <Link
                  key={lid}
                  to={`/worlds/${lid}`}
                  className="tag hover-tag"
                  style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)' }}
                >
                  {linked.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={handleFollowToggle}
          className={`btn ${isFollowed ? 'btn-secondary' : 'btn-primary'}`}
          style={{ flex: 1, padding: '8px 12px' }}
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
          style={{ padding: '8px 16px' }}
          id={`enter-world-btn-${world.id}`}
        >
          Vào World
        </Link>
      </div>
    </article>
  );
};
