import React from 'react';
import { Link } from 'react-router-dom';
import { World } from '../domain/types';
import { useApp } from '../context/AppContext';
import { UserCheck, UserPlus, Link2, Sparkles, Radio } from 'lucide-react';

export interface WorldHeaderProps {
  world: World;
}

export const WorldHeader: React.FC<WorldHeaderProps> = ({ world }) => {
  const { state, dispatch } = useApp();
  const isFollowed = state.followedWorldIds.includes(world.id);
  const isArtist = world.type === 'artist';

  const handleFollowToggle = () => {
    dispatch({ type: 'TOGGLE_FOLLOW', worldId: world.id });
  };

  return (
    <header className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '24px' }}>
      {/* Visual stage header banner */}
      <div
        style={{
          height: '140px',
          background: isArtist
            ? 'linear-gradient(135deg, #3730A3 0%, #1E1B4B 100%)'
            : 'linear-gradient(135deg, #075985 0%, #082F49 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '16px 24px',
        }}
      >
        <span
          className="tag"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {isArtist ? <Sparkles size={14} style={{ marginRight: '4px' }} /> : <Radio size={14} style={{ marginRight: '4px' }} />}
          {isArtist ? 'Không gian Nghệ sĩ' : 'Không gian Chương trình IP'}
        </span>
        <span className="demo-badge">DEMO</span>
      </div>

      <div style={{ padding: '0 24px 24px 24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px',
            marginTop: '-40px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: isArtist ? 'var(--radius-full)' : 'var(--radius-lg)',
                backgroundColor: 'var(--surface)',
                border: '3px solid var(--surface)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '800',
                color: isArtist ? 'var(--primary)' : '#0284C7',
              }}
            >
              {world.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--ink)' }}>
                {world.name}
              </h1>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                Mã định danh: <code>{world.id}</code> · Bản thử nghiệm cục bộ
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFollowToggle}
            className={`btn ${isFollowed ? 'btn-secondary' : 'btn-primary'}`}
            id={`header-follow-btn-${world.id}`}
            style={{ padding: '8px 20px' }}
          >
            {isFollowed ? (
              <>
                <UserCheck size={16} color="#059669" />
                <span>Đang theo dõi</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Theo dõi thế giới</span>
              </>
            )}
          </button>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-base)', lineHeight: 1.6, maxWidth: '780px', marginBottom: '16px' }}>
          {world.description}
        </p>

        {/* Linked worlds (does NOT auto-follow) */}
        {world.linkedWorldIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Link2 size={14} /> Không gian liên kết:
            </span>
            {world.linkedWorldIds.map((lid) => {
              const linked = state.worlds[lid];
              if (!linked) return null;
              return (
                <Link
                  key={lid}
                  to={`/worlds/${lid}`}
                  className="tag hover-tag"
                  style={{ backgroundColor: 'var(--bg)', color: 'var(--primary)', fontWeight: '600' }}
                  id={`linked-world-link-${lid}`}
                >
                  {linked.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
