import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Disc3, Calendar, MessageSquare, Radio, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { ARTIST_NOTES, momentTime } from '../world/fanWorld';
import { matchesVietnameseQuery } from '../utils/textSearch';
import { getTenantConfig } from '../domain/tenantConfig';
import { ARTIST_FANDOM_REGISTRY } from '../data/artistChatConfig';

export function ArtistGalleryView() {
  const { state, dispatch } = useApp();
  const tenantConfig = getTenantConfig(state.activeTenantId);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const [feed, setFeed] = useState<'following' | 'all'>('following');

  const worlds = Object.values(state.worlds).filter(w => w.tenantId === state.activeTenantId);
  const followed = worlds.filter(w => state.followedWorldIds.includes(w.id));

  const shown = worlds.filter(w =>
    matchesVietnameseQuery(w.name, query) &&
    (scope === 'all' || (scope === 'following' && state.followedWorldIds.includes(w.id)) || scope === w.type)
  );

  const inFeedScope = (worldId: string) =>
    worlds.some(w => w.id === worldId) && (feed === 'all' || state.followedWorldIds.includes(worldId));

  // 1. Live now: active sessions currently broadcasted (running or open)
  const liveSessions = Object.values(state.sessions)
    .filter(s => (s.status === 'running' || s.status === 'open') && inFeedScope(s.worldId))
    .map(s => ({
      id: s.id,
      worldId: s.worldId,
      title: s.title,
      at: s.scheduledStartTime,
      kind: s.format === 'concert' ? 'Online concert' : s.format === 'listening' ? 'Nghe cùng nhau' : 'Ghé chơi (Drop-in)',
      to: `/sessions/${s.id}`,
      isLive: true,
    }));

  // 2. Upcoming sessions: ordered NEAREST FIRST (ascending scheduledStartTime)
  const upcomingSessions = Object.values(state.sessions)
    .filter(s => s.status === 'scheduled' && inFeedScope(s.worldId))
    .sort((a, b) => a.scheduledStartTime.localeCompare(b.scheduledStartTime))
    .map(s => ({
      id: s.id,
      worldId: s.worldId,
      title: s.title,
      at: s.scheduledStartTime,
      kind: s.format === 'concert' ? 'Online concert' : s.format === 'listening' ? 'Nghe cùng nhau' : 'Ghé chơi (Drop-in)',
      to: `/sessions/${s.id}`,
      isLive: false,
    }));

  // 3. Latest updates & artist notes: ordered NEWEST FIRST (descending publishedAt)
  const latestUpdates = ARTIST_NOTES
    .filter(n => inFeedScope(n.worldId))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map(n => ({
      id: n.id,
      worldId: n.worldId,
      title: n.title,
      at: n.publishedAt,
      kind: 'Lời nhắn',
      to: `/moments?artist=${n.worldId}&panel=news`,
      isLive: false,
    }));

  const hasActivity = liveSessions.length > 0 || upcomingSessions.length > 0 || latestUpdates.length > 0;

  // Spotlight session for hero billboard (Live session preferred, else nearest upcoming)
  const spotlightSession = liveSessions[0] || upcomingSessions[0];
  const spotlightWorld = spotlightSession ? state.worlds[spotlightSession.worldId] : undefined;

  const portrait = (id: string) => {
    const w = state.worlds[id];
    const asset = state.avatarAssets[w?.avatarAssetId || ''];
    return asset?.status === 'approved' && asset.ownerWorldId === id ? (
      <AvatarRenderer role="artist" displayName={w.name} size="preview" isFrozen />
    ) : (
      <Disc3 size={56} />
    );
  };

  return (
    <div className="fw-experience v7-artist-home">
      {/* Top Scene Heading */}
      <header className="fw-scene-heading">
        <div>
          <p className="fw-eyebrow">ARTIST HOME</p>
          <h1>
            Người mình yêu, những điều mới.
            <span>Ghé nhà nghệ sĩ, theo dõi hoạt động và tìm thêm một người để đồng hành.</span>
          </h1>
        </div>
        <Link className="fw-text-button" to="/">
          Về {tenantConfig.labels.brandName} ↗
        </Link>
      </header>

      {/* Spotlight Hero Billboard (Weverse / Fandom Portal Standard) */}
      {spotlightSession && (
        <div className="v7-hero-spotlight">
          <div className="v7-hero-content">
            <div className="v7-hero-badge-row">
              {spotlightSession.isLive ? (
                <span className="v7-hero-live-badge">
                  <span className="v7-live-pulse-dot" style={{ background: '#FFFFFF', boxShadow: 'none' }} />
                  ĐANG PHÁT TRỰC TIẾP
                </span>
              ) : (
                <span className="v7-hero-live-badge" style={{ background: '#3B82F6' }}>
                  SỰ KIỆN SẮP TỚI
                </span>
              )}
              <span className="v7-hero-viewer-badge">
                <Sparkles size={12} color="#FCD34D" />
                <span>{spotlightWorld?.name || 'Nghệ sĩ'}</span>
              </span>
            </div>
            <h2 className="v7-hero-title">{spotlightSession.title}</h2>
            <p className="v7-hero-subtitle">
              {spotlightSession.isLive
                ? `Phiên trực tiếp của ${spotlightWorld?.name || 'nghệ sĩ'} đang phát sóng. Tham gia trò chuyện cùng cộng đồng Fandom và thưởng thức âm nhạc ngay!`
                : `Lịch hẹn sắp tới lúc ${momentTime(spotlightSession.at)}. Đăng ký nhắc sự kiện để không bỏ lỡ khoảnh khắc cùng nghệ sĩ.`}
            </p>
            <Link to={spotlightSession.to} className="v7-hero-cta">
              <Radio size={14} />
              <span>{spotlightSession.isLive ? 'Vào xem trực tiếp ngay' : 'Xem chi tiết sự kiện'} →</span>
            </Link>
          </div>
        </div>
      )}

      {/* 1. Nghệ sĩ đang theo dõi (My Artists Story Rail) */}
      <section className="v7-following">
        <div className="v5-section-heading">
          <h2>Nghệ sĩ đang theo dõi</h2>
          <a className="fw-text-button" href="#artist-portraits">
            Khám phá thêm +
          </a>
        </div>
        <div className="v7-artist-shortcuts">
          {followed.map(w => {
            const isLive = liveSessions.some(s => s.worldId === w.id);
            return (
              <Link key={w.id} to={`/moments?artist=${w.id}`} className="v7-story-item">
                <div className={`v7-story-ring ${isLive ? 'is-live' : ''}`}>
                  <div className="v7-story-avatar">
                    {portrait(w.id)}
                  </div>
                  {isLive && <span className="v7-story-live-dot">LIVE</span>}
                </div>
                <strong className="v7-story-name">{w.name}</strong>
                <small className="v7-story-status">{isLive ? '🔴 Đang Live' : 'Vào nhà nghệ sĩ ↗'}</small>
              </Link>
            );
          })}
          {!followed.length && (
            <p>
              Bạn chưa theo dõi ai. Chọn nghệ sĩ bên dưới để cập nhật của họ xuất hiện tại đây.
            </p>
          )}
        </div>
      </section>

      {/* 2. Hoạt động nổi bật (Unified Bento Activity Hub) */}
      <section className="v7-highlights" aria-label="Hoạt động nổi bật">
        <div className="v5-section-heading">
          <div>
            <p className="fw-eyebrow">ĐIỂM HẸN & BẢN TIN NGHỆ SĨ</p>
            <h2>Hoạt động nổi bật</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              Khám phá các buổi phát sóng trực tiếp, lịch hẹn sắp tới và cập nhật mới nhất từ các nghệ sĩ bạn yêu mến.
            </p>
          </div>
          <div className="vx-filter-pair">
            {[
              ['following', 'Đang theo dõi'],
              ['all', 'Toàn platform'],
            ].map(([id, label]) => (
              <button key={id} aria-pressed={feed === id} onClick={() => setFeed(id as 'following' | 'all')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Balanced Bento Grid */}
        <div className="v7-bento-highlights">
          {/* Cột 1: 🔴 Đang diễn ra trực tiếp */}
          <div className="v7-bento-col">
            <div className="v7-bento-col-header">
              <h3 style={{ color: 'var(--danger, #DC2626)' }}>
                <span className="v7-live-pulse-dot" />
                <span>🔴 Đang diễn ra trực tiếp</span>
              </h3>
              {liveSessions.length > 0 && (
                <span className="tag" style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: '10.5px' }}>
                  {liveSessions.length} phiên
                </span>
              )}
            </div>
            <div className="v7-bento-card-list">
              {liveSessions.length > 0 ? (
                liveSessions.map(h => (
                  <Link key={h.id} to={h.to} className="v7-highlight-card is-live">
                    <div className="v7-card-top">
                      <div className="v7-card-artist">
                        <div className="v7-card-avatar">{portrait(h.worldId)}</div>
                        <strong>{state.worlds[h.worldId]?.name}</strong>
                      </div>
                      <span className="v7-badge-live">LIVE · {h.kind}</span>
                    </div>
                    <h3>{h.title}</h3>
                    <div className="v7-card-footer">
                      <time>{momentTime(h.at)}</time>
                      <span className="v7-card-action">Tham gia ngay →</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="v7-highlight-empty">
                  <small>Chưa có phiên phát sóng trực tiếp nào trong mục này.</small>
                </div>
              )}
            </div>
          </div>

          {/* Cột 2: 🗓 Sắp diễn ra */}
          <div className="v7-bento-col">
            <div className="v7-bento-col-header">
              <h3 style={{ color: 'var(--ink, #1E293B)' }}>
                <Calendar size={15} />
                <span>🗓 Sắp diễn ra</span>
              </h3>
              {upcomingSessions.length > 0 && (
                <span className="tag" style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '10.5px' }}>
                  {upcomingSessions.length} lịch hẹn
                </span>
              )}
            </div>
            <div className="v7-bento-card-list">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.slice(0, 4).map(h => (
                  <Link key={h.id} to={h.to} className="v7-highlight-card">
                    <div className="v7-card-top">
                      <div className="v7-card-artist">
                        <div className="v7-card-avatar">{portrait(h.worldId)}</div>
                        <strong>{state.worlds[h.worldId]?.name}</strong>
                      </div>
                      <span className="v7-badge-upcoming">Sắp tới · {h.kind}</span>
                    </div>
                    <h3>{h.title}</h3>
                    <div className="v7-card-footer">
                      <time>{momentTime(h.at)}</time>
                      <span className="v7-card-action">Xem lịch hẹn →</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="v7-highlight-empty">
                  <small>Chưa có lịch hẹn mới.</small>
                </div>
              )}
            </div>
          </div>

          {/* Cột 3: 💬 Cập nhật mới nhất */}
          <div className="v7-bento-col">
            <div className="v7-bento-col-header">
              <h3 style={{ color: 'var(--ink, #1E293B)' }}>
                <MessageSquare size={15} />
                <span>💬 Cập nhật mới nhất</span>
              </h3>
              {latestUpdates.length > 0 && (
                <span className="tag" style={{ background: '#EDE9FE', color: 'var(--primary, #5D6350)', fontSize: '10.5px' }}>
                  {latestUpdates.length} bản tin
                </span>
              )}
            </div>
            <div className="v7-bento-card-list">
              {latestUpdates.length > 0 ? (
                latestUpdates.slice(0, 4).map(h => (
                  <Link key={h.id} to={h.to} className="v7-highlight-card">
                    <div className="v7-card-top">
                      <div className="v7-card-artist">
                        <div className="v7-card-avatar">{portrait(h.worldId)}</div>
                        <strong>{state.worlds[h.worldId]?.name}</strong>
                      </div>
                      <span className="v7-badge-note">Lời nhắn</span>
                    </div>
                    <h3>{h.title}</h3>
                    <div className="v7-card-footer">
                      <time>{momentTime(h.at)}</time>
                      <span className="v7-card-action">Đọc lời nhắn →</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="v7-highlight-empty">
                  <small>Chưa có cập nhật mới.</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {!hasActivity && (
          <p style={{ marginTop: '16px' }}>
            Chưa có cập nhật phù hợp.{' '}
            <button className="fw-text-button" onClick={() => setFeed('all')}>
              Khám phá hoạt động toàn platform →
            </button>
          </p>
        )}
      </section>

      {/* 3. Khám phá nghệ sĩ (Fandom Community Roster) */}
      <section id="artist-portraits" className="v7-directory">
        <div className="v5-section-heading">
          <h2>Khám phá nghệ sĩ</h2>
          <small>{worlds.length} nghệ sĩ / chương trình mẫu</small>
        </div>
        <div className="vx-directory-tools">
          <label className="fw-search">
            <Search size={18} />
            <input
              aria-label="Tìm artist hoặc chương trình"
              placeholder="Tìm tên nghệ sĩ, chương trình…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </label>
          <div className="vx-filter-pair">
            {[
              ['all', 'Tất cả'],
              ['following', 'Đang theo dõi'],
              ['artist', 'Nghệ sĩ'],
              ['ip', 'Chương trình'],
            ].map(([id, label]) => (
              <button key={id} aria-pressed={scope === id} onClick={() => setScope(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Fandom Community Cards Grid (Anti AI-box, Weverse Fandom Styling) */}
        <div className="v7-artist-grid">
          {shown.map(w => {
            const fandom = ARTIST_FANDOM_REGISTRY[w.id];
            const isLive = liveSessions.some(s => s.worldId === w.id);
            const cardGradient = fandom?.signatureLightstick?.gradient || 'linear-gradient(135deg, #334155, #0F172A)';
            const fandomLabel = fandom ? `✨ Fandom ${fandom.fandomName}` : (w.type === 'artist' ? '✨ Fandom Nghệ Sĩ' : '🎬 Chương trình');
            const companionInfo = fandom ? `${fandom.companionDays} ngày gắn bó` : (w.type === 'artist' ? 'Thành viên thân thiết' : 'Chuỗi phát sóng');

            return (
              <article className="v7-artist-card" key={w.id}>
                <div className="v7-card-cover" style={{ background: cardGradient }}>
                  <span className="v7-card-fandom-pill">{fandomLabel}</span>
                  {isLive && (
                    <span className="v7-card-live-pill">
                      <span className="v7-live-pulse-dot" style={{ background: '#FFFFFF', boxShadow: 'none' }} />
                      LIVE NOW
                    </span>
                  )}
                </div>
                <div className="v7-card-body">
                  <div className="v7-card-avatar-wrap">
                    <Link
                      className="v7-artist-portrait"
                      to={`/moments?artist=${w.id}`}
                      aria-label={`Ghé ${w.name}`}
                    >
                      {portrait(w.id)}
                    </Link>
                    <span className="v7-card-stats-pill">♥ {companionInfo}</span>
                  </div>
                  <h3>
                    <Link to={`/moments?artist=${w.id}`}>
                      {w.name} ↗
                    </Link>
                  </h3>
                  <p className="v7-artist-tagline">
                    {fandom ? `Chào mừng đến với không gian âm nhạc của ${w.name} cùng Fandom ${fandom.fandomName}.` : w.description}
                  </p>
                  <div className="v7-card-actions">
                    <Link to={`/moments?artist=${w.id}`} className="v7-btn-enter">
                      <span>Vào nhà nghệ sĩ</span>
                      <ArrowRight size={13} />
                    </Link>
                    <button
                      className={`fw-follow ${state.followedWorldIds.includes(w.id) ? 'following' : ''}`}
                      aria-pressed={state.followedWorldIds.includes(w.id)}
                      onClick={() => dispatch({ type: 'TOGGLE_FOLLOW', worldId: w.id })}
                    >
                      <Heart size={14} fill={state.followedWorldIds.includes(w.id) ? '#EC4899' : 'none'} color={state.followedWorldIds.includes(w.id) ? '#EC4899' : 'currentColor'} />
                      {state.followedWorldIds.includes(w.id) ? 'Đang theo dõi' : 'Theo dõi'} {w.name}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!shown.length && (
          <div className="fw-empty">
            <p>Chưa tìm thấy tên này.</p>
            <button
              className="fw-text-button"
              onClick={() => {
                setQuery('');
                setScope('all');
              }}
            >
              Xem tất cả
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

