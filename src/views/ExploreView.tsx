import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Disc3, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { ARTIST_NOTES, momentTime } from '../world/fanWorld';
import { matchesVietnameseQuery } from '../utils/textSearch';
import { ARTIST_FANDOM_REGISTRY } from '../data/artistChatConfig';

/**
 * Visual identity configuration for canonical worlds (§ World Identity System)
 * Prioritizes real cover artwork and character identity over artificial gradients.
 */
const WORLD_VISUALS: Record<
  string,
  {
    cover: string;
    avatar: string;
    genre: string;
    fandomName: string;
    typeLabel: string;
  }
> = {
  'artist-a': {
    cover: '/images/artist-a-cover.jpg',
    avatar: '/images/characters-v4/artist-a.webp',
    genre: 'Pop / R&B',
    fandomName: 'V-Stars',
    typeLabel: 'Nghệ sĩ',
  },
  'artist-mira': {
    cover: '/images/mira-cover.jpg',
    avatar: '/images/characters-v4/artist-mira.webp',
    genre: 'Dream Pop / Indie',
    fandomName: 'Moonies',
    typeLabel: 'Nghệ sĩ',
  },
  'artist-kai': {
    cover: '/images/kai-cover.jpg',
    avatar: '/images/characters-v4/artist-kai.webp',
    genre: 'Electronic / Hip-hop',
    fandomName: 'Pulse Crew',
    typeLabel: 'Nghệ sĩ',
  },
  'neon-sessions': {
    cover: '/images/neon-sessions-cover.jpg',
    avatar: '/images/neon-sessions-cover.jpg',
    genre: 'Chuỗi âm nhạc trực tiếp',
    fandomName: 'Night Owls',
    typeLabel: 'Chương trình',
  },
};

export function ExploreView() {
  const { state, dispatch } = useApp();

  const [query, setQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'artist' | 'ip' | 'live'>('all');

  // Active worlds within current tenant
  const tenantWorlds = useMemo(
    () => Object.values(state.worlds).filter(w => w.tenantId === state.activeTenantId),
    [state.worlds, state.activeTenantId]
  );

  const inFeedScope = (worldId: string) => tenantWorlds.some(w => w.id === worldId);

  // Live sessions
  const liveSessions = useMemo(
    () =>
      Object.values(state.sessions)
        .filter(s => (s.status === 'running' || s.status === 'open') && inFeedScope(s.worldId))
        .map(s => ({
          id: s.id,
          worldId: s.worldId,
          title: s.title,
          at: s.scheduledStartTime,
          to: `/sessions/${s.id}`,
          isLive: true,
          viewerCount: ARTIST_FANDOM_REGISTRY[s.worldId]?.defaultViewerCount || '1.8K',
        })),
    [state.sessions, tenantWorlds]
  );

  const liveWorldIds = useMemo(() => new Set(liveSessions.map(s => s.worldId)), [liveSessions]);

  // Upcoming sessions (Nearest First: ascending order of scheduledStartTime)
  const upcomingSessions = useMemo(
    () =>
      Object.values(state.sessions)
        .filter(s => s.status === 'scheduled' && inFeedScope(s.worldId))
        .sort((a, b) => a.scheduledStartTime.localeCompare(b.scheduledStartTime))
        .map(s => ({
          id: s.id,
          worldId: s.worldId,
          title: s.title,
          at: s.scheduledStartTime,
          to: `/sessions/${s.id}`,
          isLive: false,
        })),
    [state.sessions, tenantWorlds]
  );

  // Latest artist notes (Newest First: descending order of publishedAt)
  const latestUpdates = useMemo(
    () =>
      ARTIST_NOTES.filter(n => inFeedScope(n.worldId))
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .map(n => ({
          id: n.id,
          worldId: n.worldId,
          title: n.title,
          at: n.publishedAt,
          to: `/moments?artist=${n.worldId}&panel=news`,
          isLive: false,
        })),
    [tenantWorlds]
  );

  // Followed Worlds (Your Worlds)
  const yourWorlds = useMemo(
    () => tenantWorlds.filter(w => state.followedWorldIds.includes(w.id)),
    [tenantWorlds, state.followedWorldIds]
  );

  // Followed worlds filtered when user actively searches
  const displayedYourWorlds = useMemo(() => {
    if (!query.trim()) return yourWorlds;
    return yourWorlds.filter(w => {
      const visual = WORLD_VISUALS[w.id];
      const fandom = ARTIST_FANDOM_REGISTRY[w.id];
      const fandomName = fandom?.fandomName || visual?.fandomName || '';
      return (
        matchesVietnameseQuery(w.name, query) ||
        (fandomName && matchesVietnameseQuery(fandomName, query))
      );
    });
  }, [yourWorlds, query]);

  // Filtered worlds for Discover Worlds
  const filteredWorlds = useMemo(() => {
    return tenantWorlds.filter(w => {
      const visual = WORLD_VISUALS[w.id];
      const fandom = ARTIST_FANDOM_REGISTRY[w.id];
      const fandomName = fandom?.fandomName || visual?.fandomName || '';

      // Match against artist name, fandom name, and program name
      const matchesSearch =
        !query.trim() ||
        matchesVietnameseQuery(w.name, query) ||
        (fandomName && matchesVietnameseQuery(fandomName, query)) ||
        (w.type === 'ip' && matchesVietnameseQuery('chương trình', query));

      if (!matchesSearch) return false;

      // Quick filter
      if (quickFilter === 'artist' && w.type !== 'artist') return false;
      if (quickFilter === 'ip' && w.type !== 'ip') return false;
      if (quickFilter === 'live' && !liveWorldIds.has(w.id)) return false;

      return true;
    });
  }, [tenantWorlds, query, quickFilter, liveWorldIds]);

  const toggleFollow = (worldId: string) => {
    dispatch({ type: 'TOGGLE_FOLLOW', worldId });
  };

  const getVisual = (worldId: string, _worldName: string, worldType: string) => {
    const v = WORLD_VISUALS[worldId];
    if (v) return v;
    const fandom = ARTIST_FANDOM_REGISTRY[worldId];
    return {
      cover: '/images/world-v8/plaza.webp',
      avatar: '/images/characters-v4/artist-a.webp',
      genre: worldType === 'ip' ? 'Chuỗi phát sóng' : 'Âm nhạc',
      fandomName: fandom?.fandomName || 'Fandom',
      typeLabel: worldType === 'ip' ? 'Chương trình' : 'Nghệ sĩ',
    };
  };

  const renderPortrait = (worldId: string, displayName: string) => {
    const w = state.worlds[worldId];
    const asset = state.avatarAssets[w?.avatarAssetId || ''];
    if (asset?.status === 'approved' && asset.ownerWorldId === worldId) {
      return <AvatarRenderer role="artist" displayName={displayName} size="preview" isFrozen />;
    }
    const visual = WORLD_VISUALS[worldId];
    if (visual?.avatar) {
      return <img src={visual.avatar} alt={displayName} loading="lazy" />;
    }
    return <Disc3 size={36} color="#64748B" />;
  };

  return (
    <div className="fw-experience explore-container">
      {/* ==========================================================================
          Section A: Explore Header & Search
          Compact discovery header without giant billboard or AI clutter
          ========================================================================== */}
      <header className="explore-header-section">
        <div className="explore-header-meta">
          <p className="explore-eyebrow">EXPLORE VIEWORLD</p>
          <h1 className="explore-title">Tìm một thế giới để ghé vào.</h1>
          <p className="explore-subtitle">
            Nghệ sĩ, fandom, chương trình và những khoảnh khắc đang diễn ra.
          </p>
        </div>

        <div className="explore-search-wrap">
          <Search size={18} className="explore-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="explore-search-input"
            aria-label="Tìm artist hoặc chương trình"
            placeholder="Tìm nghệ sĩ, fandom hoặc chương trình…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="explore-search-clear"
              aria-label="Xóa tìm kiếm"
              onClick={() => setQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ==========================================================================
            Section B: Quick Filters
            Lightweight, uncluttered filter row directly below search
            ========================================================================== */}
        <div className="explore-filters-row" role="toolbar" aria-label="Bộ lọc nhanh">
          <button
            type="button"
            className={`explore-filter-chip ${quickFilter === 'all' ? 'active' : ''}`}
            aria-pressed={quickFilter === 'all'}
            onClick={() => setQuickFilter('all')}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`explore-filter-chip ${quickFilter === 'artist' ? 'active' : ''}`}
            aria-pressed={quickFilter === 'artist'}
            onClick={() => setQuickFilter(quickFilter === 'artist' ? 'all' : 'artist')}
          >
            Nghệ sĩ
          </button>
          <button
            type="button"
            className={`explore-filter-chip ${quickFilter === 'ip' ? 'active' : ''}`}
            aria-pressed={quickFilter === 'ip'}
            onClick={() => setQuickFilter(quickFilter === 'ip' ? 'all' : 'ip')}
          >
            Chương trình
          </button>
          <button
            type="button"
            className={`explore-filter-chip ${quickFilter === 'live' ? 'active' : ''}`}
            aria-pressed={quickFilter === 'live'}
            onClick={() => setQuickFilter(quickFilter === 'live' ? 'all' : 'live')}
          >
            <span className="explore-filter-live-dot" aria-hidden="true" />
            Đang Live
          </button>
        </div>
      </header>

      {/* ==========================================================================
          Section C: Your Worlds (Followed Worlds Avatar Rail)
          Tightly fits content, no empty vertical white space
          ========================================================================== */}
      {(!query.trim() || displayedYourWorlds.length > 0) && (
        <section className="explore-section" aria-labelledby="your-worlds-heading">
          <div className="explore-section-header">
            <div className="explore-section-title-wrap">
              <h2 id="your-worlds-heading" aria-label="Nghệ sĩ đang theo dõi" className="explore-section-title">
                Worlds của bạn
              </h2>
              <p className="explore-section-desc">Các thế giới bạn đang theo dõi</p>
            </div>
          </div>

          {displayedYourWorlds.length > 0 ? (
            <div className="explore-your-worlds-rail" role="region" aria-label="Danh sách worlds bạn đã theo dõi">
              {displayedYourWorlds.map(w => {
                const visual = getVisual(w.id, w.name, w.type);
                const fandom = ARTIST_FANDOM_REGISTRY[w.id];
                const isLive = liveWorldIds.has(w.id);
                const hasRecentNote = latestUpdates.some(n => n.worldId === w.id);

                return (
                  <Link
                    key={w.id}
                    to={`/moments?artist=${w.id}`}
                    className="explore-avatar-item"
                    aria-label={`World của ${w.name}`}
                  >
                    <div className="explore-avatar-disc">
                      {renderPortrait(w.id, w.name)}
                      {isLive ? (
                        <span className="explore-avatar-status-pill live">LIVE</span>
                      ) : hasRecentNote ? (
                        <span className="explore-avatar-status-pill new">Mới</span>
                      ) : null}
                    </div>
                    <strong className="explore-avatar-name">{w.name}</strong>
                    <span className="explore-avatar-fandom">{fandom?.fandomName || visual.fandomName}</span>
                    {fandom && (
                      <span className="explore-avatar-companion">{fandom.companionDays} ngày</span>
                    )}
                  </Link>
                );
              })}

              {/* Seamless Action item at end of rail */}
              <button
                type="button"
                className="explore-avatar-add-item"
                aria-label="Khám phá thêm thế giới"
                onClick={() => {
                  const discEl = document.getElementById('discover-worlds-section');
                  discEl?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="explore-avatar-add-circle">
                  <Plus size={20} />
                </div>
                <span className="explore-avatar-add-label">+ Khám phá</span>
              </button>
            </div>
          ) : (
            <div className="explore-empty-followed-inline">
              <span>Bạn chưa theo dõi thế giới nào.</span>
              <button
                type="button"
                className="explore-empty-followed-btn"
                onClick={() => {
                  const discEl = document.getElementById('discover-worlds-section');
                  discEl?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Khám phá ngay →
              </button>
            </div>
          )}
        </section>
      )}

      {/* ==========================================================================
          Section D: Có gì mới (Happening Now)
          Clean activity cards with one concise state indicator, no redundant sentences
          ========================================================================== */}
      {(liveSessions.length > 0 || upcomingSessions.length > 0 || latestUpdates.length > 0) && (
        <section className="explore-section" aria-label="Hoạt động nổi bật">
          <div className="explore-section-header">
            <div className="explore-section-title-wrap">
              <h2 className="explore-section-title">Có gì mới</h2>
              <p className="explore-section-desc">Phát sóng trực tiếp, lịch hẹn và lời nhắn mới nhất</p>
            </div>
          </div>

          <div className="explore-happening-rail">
            {/* 1. Live Sessions Group */}
            {liveSessions.length > 0 && (
              <div className="explore-happening-group" style={{ display: 'contents' }}>
                {liveSessions.map((s, idx) => {
                  const w = state.worlds[s.worldId];
                  const visual = getVisual(s.worldId, w?.name || '', w?.type || 'artist');

                  return (
                    <Link key={s.id} to={s.to} className="explore-activity-card" aria-label={`Xem ${s.title}`}>
                      <div className="explore-activity-artist-row">
                        <img src={visual.avatar} alt="" className="explore-activity-artist-avatar" />
                        <span className="explore-activity-artist-name">{w?.name || 'Nghệ sĩ'}</span>
                      </div>
                      <h3 className="explore-activity-title">{s.title}</h3>
                      <div className="explore-activity-state live">
                        <span className="explore-live-dot" />
                        <span>
                          {idx === 0 ? 'Đang diễn ra trực tiếp' : 'Trực tiếp'} · {s.viewerCount} đang ở đây
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* 2. Nearest Upcoming Events */}
            {upcomingSessions.length > 0 && (
              <div className="explore-happening-group" style={{ display: 'contents' }}>
                {upcomingSessions.map((s, idx) => {
                  const w = state.worlds[s.worldId];
                  const visual = getVisual(s.worldId, w?.name || '', w?.type || 'artist');

                  return (
                    <Link key={s.id} to={s.to} className="explore-activity-card" aria-label={`Xem chi tiết ${s.title}`}>
                      <div className="explore-activity-artist-row">
                        <img src={visual.avatar} alt="" className="explore-activity-artist-avatar" />
                        <span className="explore-activity-artist-name">{w?.name || 'Nghệ sĩ'}</span>
                      </div>
                      <h3 className="explore-activity-title">{s.title}</h3>
                      <div className="explore-activity-state upcoming">
                        <span>
                          {idx === 0 ? 'Sắp diễn ra' : 'Lịch hẹn'} · {momentTime(s.at)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* 3. Latest Artist Activity */}
            {latestUpdates.length > 0 && (
              <div className="explore-happening-group" style={{ display: 'contents' }}>
                {latestUpdates.map((n, idx) => {
                  const w = state.worlds[n.worldId];
                  const visual = getVisual(n.worldId, w?.name || '', w?.type || 'artist');

                  return (
                    <Link key={n.id} to={n.to} className="explore-activity-card" aria-label={`Đọc ${n.title}`}>
                      <div className="explore-activity-artist-row">
                        <img src={visual.avatar} alt="" className="explore-activity-artist-avatar" />
                        <span className="explore-activity-artist-name">{w?.name || 'Nghệ sĩ'}</span>
                      </div>
                      <h3 className="explore-activity-title">{n.title}</h3>
                      <div className="explore-activity-state update">
                        <span>
                          {idx === 0 ? 'Cập nhật mới nhất' : 'Lời nhắn mới'} · Lời nhắn
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==========================================================================
          Section E: Khám phá thế giới (Discover Worlds)
          Identity-first: Artist has round avatar overlap, Program has clean landscape card
          ========================================================================== */}
      <section id="discover-worlds-section" className="explore-section" aria-labelledby="discover-heading">
        <div className="explore-section-header">
          <div className="explore-section-title-wrap">
            <h2 id="discover-heading" className="explore-section-title">Khám phá thế giới</h2>
            <p className="explore-section-desc">Chọn một thế giới để bước vào không gian của nghệ sĩ</p>
          </div>
        </div>

        {filteredWorlds.length > 0 ? (
          <div className="explore-discover-grid">
            {filteredWorlds.map(w => {
              const visual = getVisual(w.id, w.name, w.type);
              const fandom = ARTIST_FANDOM_REGISTRY[w.id];
              const isFollowed = state.followedWorldIds.includes(w.id);
              const isLive = liveWorldIds.has(w.id);
              const isProgram = w.type === 'ip';

              return (
                <Link
                  key={w.id}
                  to={`/moments?artist=${w.id}`}
                  className="explore-world-card"
                  aria-label={`Ghé ${w.name}`}
                >
                  {/* Cover Artwork */}
                  <div className="explore-card-cover-wrap">
                    <img
                      src={visual.cover}
                      alt=""
                      className="explore-card-cover-img"
                      loading="lazy"
                    />
                    <div className="explore-card-cover-overlay" />
                    {isLive && (
                      <span className="explore-card-live-indicator">
                        <span className="explore-live-dot" />
                        LIVE
                      </span>
                    )}
                    {isProgram && (
                      <span className="explore-card-program-badge-tag">CHƯƠNG TRÌNH</span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="explore-card-body">
                    {isProgram ? (
                      /* Program Variant: No overlapping circular avatar, crisp show identity */
                      <>
                        <div className="explore-card-program-header">
                          <div className="explore-card-names">
                            <h3 className="explore-card-artist-name">{w.name}</h3>
                            <p className="explore-card-fandom-name">
                              {fandom?.fandomName ? `Fandom ${fandom.fandomName}` : visual.fandomName}
                            </p>
                          </div>
                          <button
                            type="button"
                            className={`explore-card-follow-btn ${isFollowed ? 'following' : ''}`}
                            aria-label={`${isFollowed ? 'Bỏ theo dõi' : 'Theo dõi'} ${w.name}`}
                            aria-pressed={isFollowed}
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFollow(w.id);
                            }}
                          >
                            {isFollowed ? 'Đang theo dõi' : '+ Theo dõi'}
                          </button>
                        </div>
                        <p className="explore-card-context-line">
                          {visual.genre} · {visual.typeLabel}
                        </p>
                      </>
                    ) : (
                      /* Artist Variant: Overlapping circular avatar */
                      <>
                        <div className="explore-card-identity-seam">
                          <div className="explore-card-avatar-circle">
                            {renderPortrait(w.id, w.name)}
                          </div>

                          <button
                            type="button"
                            className={`explore-card-follow-btn ${isFollowed ? 'following' : ''}`}
                            aria-label={`${isFollowed ? 'Bỏ theo dõi' : 'Theo dõi'} ${w.name}`}
                            aria-pressed={isFollowed}
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFollow(w.id);
                            }}
                          >
                            {isFollowed ? 'Đang theo dõi' : '+ Theo dõi'}
                          </button>
                        </div>

                        <div className="explore-card-names">
                          <h3 className="explore-card-artist-name">{w.name}</h3>
                          <p className="explore-card-fandom-name">
                            {fandom?.fandomName ? `Fandom ${fandom.fandomName}` : visual.fandomName}
                          </p>
                        </div>

                        <p className="explore-card-context-line">
                          {visual.genre} · {visual.typeLabel}
                        </p>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="explore-empty-state">
            <h3 className="explore-empty-title">Chưa tìm thấy tên này.</h3>
            <p className="explore-empty-desc">
              Thử tìm kiếm với từ khóa khác hoặc xem lại toàn bộ các thế giới trong VieWorld.
            </p>
            <button
              type="button"
              className="explore-empty-reset-btn"
              onClick={() => {
                setQuery('');
                setQuickFilter('all');
              }}
            >
              Xem tất cả
            </button>
          </div>
        )}

        {/* Bottom clean action instead of heavy database table */}
        {filteredWorlds.length > 0 && (
          <div className="explore-browse-more">
            <button
              type="button"
              className="explore-browse-more-link"
              onClick={() => {
                setQuery('');
                setQuickFilter('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Xem tất cả thế giới ({tenantWorlds.length}) ↑
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
