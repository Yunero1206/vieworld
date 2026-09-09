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
    <header className="world-identity">
      <div className={`world-identity__mark ${isArtist ? 'world-identity__mark--artist' : 'world-identity__mark--ip'}`} aria-hidden="true">
        {world.name.charAt(0)}
      </div>

      <div className="world-identity__copy">
        <div className="world-identity__meta">
          <span>
            {isArtist ? <Sparkles size={13} aria-hidden="true" /> : <Radio size={13} aria-hidden="true" />}
            {isArtist ? 'Artist World' : 'IP World'}
          </span>
          <span className="demo-badge">DEMO</span>
        </div>
        <h1>{world.name}</h1>
        <p>{world.description}</p>

        {world.linkedWorldIds.length > 0 && (
          <div className="world-identity__links">
            <span><Link2 size={13} aria-hidden="true" /> Kết nối với</span>
            {world.linkedWorldIds.map((linkedId) => {
              const linked = state.worlds[linkedId];
              if (!linked) return null;
              return (
                <Link key={linkedId} to={`/worlds/${linkedId}`} id={`linked-world-link-${linkedId}`}>
                  {linked.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleFollowToggle}
        className={`btn ${isFollowed ? 'btn-secondary' : 'btn-primary'} world-identity__follow`}
        id={`header-follow-btn-${world.id}`}
        aria-label={isFollowed ? `Bỏ theo dõi ${world.name}` : `Theo dõi ${world.name}`}
      >
        {isFollowed ? <UserCheck size={17} color="#3ddc97" /> : <UserPlus size={17} />}
        <span>{isFollowed ? 'Đang theo dõi' : 'Theo dõi World'}</span>
      </button>
    </header>
  );
};
