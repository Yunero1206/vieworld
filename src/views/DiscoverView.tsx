import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { NextMomentCard } from '../components/NextMomentCard';
import { WorldCard } from '../components/WorldCard';
import { ArrowRight, CalendarHeart, Play, Sparkles } from 'lucide-react';

import { getTenantConfig } from '../domain/tenantConfig';

export const DiscoverView: React.FC = () => {
  const { state } = useApp();
  const tenantConfig = getTenantConfig(state.activeTenantId);

  // Find priority next moment session (e.g. session-dropin-01 or tenant-scoped fallback)
  const nextSession =
    Object.values(state.sessions).find((s) => s.status === 'running') ||
    Object.values(state.sessions).find((s) => s.status === 'scheduled') ||
    state.sessions['session-dropin-01'] ||
    Object.values(state.sessions)[0];

  const worldsList = Object.values(state.worlds);
  const featuredWorld = nextSession ? state.worlds[nextSession.worldId] : worldsList[0];

  return (
    <div className="discover-page">
      <header className="discover-world-hero">
        <div className="discover-world-hero__sky" aria-hidden="true">
          <span className="discover-world-hero__planet" />
          <span className="discover-world-hero__cloud discover-world-hero__cloud--one" />
          <span className="discover-world-hero__cloud discover-world-hero__cloud--two" />
          <span className="discover-world-hero__city" />
          <span className="discover-world-hero__stage-light discover-world-hero__stage-light--one" />
          <span className="discover-world-hero__stage-light discover-world-hero__stage-light--two" />
        </div>

        <div className="discover-world-hero__copy">
          <span className="discover-world-hero__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            {tenantConfig.labels.brandBadge} · Những world đang thức
          </span>
          <h1 data-testid="discover-hero-heading">{tenantConfig.contentPriorities.welcomeHeading}</h1>
          <p data-testid="discover-hero-desc">
            Tới gần nghệ sĩ qua sân khấu, âm nhạc và những kỷ niệm bạn có thể mang về căn phòng riêng.
          </p>
          <div className="discover-world-hero__actions">
            {featuredWorld && (
              <Link to={`/worlds/${featuredWorld.id}`} className="btn btn-light" id="hero-enter-world-btn">
                <Play size={17} fill="currentColor" aria-hidden="true" />
                Vào {featuredWorld.name}
              </Link>
            )}
            <Link to="/worlds" className="btn btn-ghost-light">
              <CalendarHeart size={17} aria-hidden="true" />
              Xem các world
            </Link>
          </div>
        </div>

        {featuredWorld && (
          <Link className="discover-world-hero__portal" to={`/worlds/${featuredWorld.id}`} aria-label={`Mở ${featuredWorld.name}`}>
            <span aria-hidden="true">
              {featuredWorld.type === 'artist' ? (
                <img src="/images/artist-a-chibi.jpg" alt={featuredWorld.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              ) : (
                featuredWorld.name.charAt(0)
              )}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <small>Tối nay tại</small>
              <strong>{featuredWorld.name}</strong>
            </div>
          </Link>
        )}
      </header>

      <div className="discover-section-heading">
        <div>
          <span>Đang chờ bạn</span>
          <h2>Khoảnh khắc tiếp theo</h2>
        </div>
        <p>Đăng ký nhắc, vào sân khấu và giữ lại một mảnh của đêm nay.</p>
      </div>
      {nextSession && <NextMomentCard session={nextSession} />}

      {/* Featured Worlds Section */}
      <section className="discover-worlds-section">
        <div className="discover-section-heading discover-section-heading--with-action">
          <div>
            <span>Chọn điểm đến</span>
            <h2>Các không gian giải trí nổi bật</h2>
          </div>
          <Link to="/worlds" className="btn btn-secondary" style={{ fontSize: 'var(--text-xs)' }} id="see-all-worlds-btn">
            <span>Xem tất cả ({worldsList.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="discover-world-grid">
          {worldsList.map((world) => (
            <WorldCard key={world.id} world={world} viewMode="scenery" />
          ))}
        </div>
      </section>
    </div>
  );
};
