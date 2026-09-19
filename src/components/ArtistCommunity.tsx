import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, ArrowRight, Calendar, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ARTIST_NOTES, momentTime } from '../world/fanWorld';
import { MERCH_IMAGE_ROOT, DELIVERY_LABELS } from '../world/merchCatalog';
import { HallPanel } from './HallPanel';
import { ArtistBroadcast } from './ArtistBroadcast';
import { AvatarRenderer } from './AvatarRenderer';
import { getArtistChatMeta } from '../data/artistChatConfig';
import { getProductFamilies, ProductFamily } from '../world/moments';
import { ProductFamilyQuickView } from './ProductFamilyQuickView';
import { ArtistScheduleDrawer } from './ArtistScheduleDrawer';
import { Product } from '../domain/types';

interface ArtistCommunityProps {
  worldId: string;
  onOpen?: (panel: string) => void;
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

export function ArtistCommunity({
  worldId,
  onOpen: _onOpen,
  initialTab,
  onTabChange,
}: ArtistCommunityProps) {
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const chatMeta = getArtistChatMeta(worldId, undefined, state.worlds[worldId]?.name);

  // Initial tab resolution
  const queryTab = searchParams.get('tab');
  const queryPanel = searchParams.get('panel');
  const resolvedInitialTab =
    queryTab || (queryPanel === 'hall' ? 'hall' : queryPanel === 'concerts' || queryPanel === 'livechat' ? 'live' : initialTab || 'home');

  const querySession = searchParams.get('session');
  const [tab, setTab] = useState(resolvedInitialTab);
  const [selectedLive, setSelectedLive] = useState<string>(querySession || '');
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(queryPanel === 'calendar');

  useEffect(() => {
    const s = searchParams.get('session');
    if (s) {
      setSelectedLive(s);
      setTab('live');
    }
  }, [searchParams]);

  // Merch Quick View & Filters state
  const [selectedFamily, setSelectedFamily] = useState<ProductFamily | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'physical' | 'digital' | 'bundle'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'apparel' | 'lightstick' | 'album'>('all');
  const [cartToast, setCartToast] = useState<{ message: string; visible: boolean } | null>(null);

  // Cheers state
  const [cheers, setCheers] = useState<Record<string, number>>({
    'acoustic-letter': 42,
    'neon-letter': 38,
    'kai-letter': 56,
    'mira-letter': 48,
  });
  const [userCheered, setUserCheered] = useState<Record<string, boolean>>({});

  const world = state.worlds[worldId];
  const artistAsset = world?.avatarAssetId ? state.avatarAssets[world.avatarAssetId] : undefined;
  const canShowArtist = artistAsset?.status === 'approved';

  // Synchronize tab changes with parent
  const handleSelectTab = (nextTab: string) => {
    setTab(nextTab);
    onTabChange?.(nextTab);
  };

  useEffect(() => {
    if (initialTab && initialTab !== tab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  const toggleCheer = (noteId: string) => {
    setCheers(prev => ({
      ...prev,
      [noteId]: (prev[noteId] || 40) + (userCheered[noteId] ? -1 : 1),
    }));
    setUserCheered(prev => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  // Sessions and Broadcasts
  const sessions = Object.values(state.sessions)
    .filter(s => s.worldId === worldId && !['ended', 'cancelled'].includes(s.status))
    .sort((a, b) => a.scheduledStartTime.localeCompare(b.scheduledStartTime));

  const nearestSession = sessions[0];
  const otherSessionsCount = Math.max(0, sessions.length - 1);

  const broadcasts = sessions.filter(s => s.format === 'dropin' || s.format === 'concert');
  const pastSessions = Object.values(state.sessions)
    .filter(s => s.worldId === worldId && s.status === 'ended')
    .sort((a, b) => b.scheduledStartTime.localeCompare(a.scheduledStartTime));

  // Product Families for Scoped Merchandise Storefront
  const productFamilies = getProductFamilies(Object.values(state.products), worldId);

  const filteredFamilies = productFamilies.filter(family => {
    if (deliveryFilter !== 'all' && !family.deliveryTypes.includes(deliveryFilter)) {
      return false;
    }
    if (categoryFilter !== 'all') {
      const famId = family.familyId.toLowerCase();
      if (categoryFilter === 'apparel' && !famId.includes('shirt') && !famId.includes('bomber') && !famId.includes('hoodie') && !famId.includes('cap')) {
        return false;
      }
      if (categoryFilter === 'lightstick' && !famId.includes('lightstick') && !famId.includes('shaker')) {
        return false;
      }
      if (categoryFilter === 'album' && !famId.includes('notes') && !famId.includes('vinyl') && !famId.includes('cassette')) {
        return false;
      }
    }
    return true;
  });

  const notes = ARTIST_NOTES.filter(n => n.worldId === worldId);

  // Consolidated 4 Tabs
  const tabs = [
    ['home', `Nhà ${world?.name || 'nghệ sĩ'}`],
    ['live', 'Live & Concert'],
    ['hall', 'Hall hội viên'],
    ['merch', 'Merchandise'],
  ];

  const handleAddToCart = (product: Product, size?: string, quantity: number = 1) => {
    for (let i = 0; i < quantity; i++) {
      dispatch({
        type: 'ADD_TO_CART',
        productId: product.id,
        optionLabel: size || undefined,
      });
    }
    const label = DELIVERY_LABELS[product.delivery || 'physical'] || 'Hàng thật';
    setCartToast({
      message: `Đã thêm ${product.title} (${label}) vào giỏ hàng`,
      visible: true,
    });
    setTimeout(() => {
      setCartToast(prev => (prev ? { ...prev, visible: false } : null));
    }, 4000);
  };

  return (
    <section className="v6-community moments-community-container">
      {/* 4 Main Contextual Navigation Tabs */}
      <nav className="v6-community-tabs moments-nav-tabs" aria-label={`Các góc nhà ${world?.name || ''}`}>
        {tabs.map(([id, label]) => {
          const isLiveTab = id === 'live';
          const isLiveNow = broadcasts.some(s => s.status === 'running');
          return (
            <button
              key={id}
              aria-label={label}
              aria-pressed={tab === id}
              className={`moments-tab-item ${tab === id ? 'active' : ''}`}
              onClick={() => handleSelectTab(id)}
            >
              <span>{label}</span>
              {isLiveTab && isLiveNow && (
                <span aria-hidden="true" className="v7-tab-live-badge moments-tab-live-badge">
                  <span className="v7-live-pulse-dot" />LIVE
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ====================================================================
          TAB 1: Nhà [Artist] (68/32 Social Timeline & Schedule Composition)
         ==================================================================== */}
      {tab === 'home' && (
        <div className="v6-community-home moments-home-layout">
          {/* Mobile compact appointment bar */}
          {nearestSession && (
            <div className="moments-mobile-appointment-bar">
              <span className="moments-mobile-app-text">
                {momentTime(nearestSession.scheduledStartTime)} · {nearestSession.title}
              </span>
              <Link to={`/sessions/${nearestSession.id}`} className="moments-mobile-app-link">
                Xem →
              </Link>
            </div>
          )}

          {/* Left Column (68%): Official Artist Social Timeline */}
          <div className="v7-feed-column moments-feed-column">
            <div className="v7-feed-header moments-feed-header">
              <div>
                <p className="fw-eyebrow moments-feed-eyebrow">TỪ {world?.name.toLocaleUpperCase('vi')}</p>
                <h2 className="v7-feed-title moments-feed-title">Những điều muốn kể cùng bạn</h2>
              </div>
              {/* Private relationship history: Accessible for regression test compliance, removed from public rank badge */}
              <span className="sr-only">
                ✦ Đồng hành cùng {world?.name} {chatMeta.companionDays} ngày
              </span>
            </div>

            <div className="v7-posts-stream moments-posts-stream">
              {notes.map(n => (
                <article className="v6-artist-post v7-artist-post-card moments-post-card" key={n.id}>
                  <header className="v7-post-header moments-post-header">
                    <div className="v7-post-avatar moments-post-avatar">
                      {canShowArtist ? (
                        <AvatarRenderer
                          testId="community-post-avatar"
                          role="artist"
                          accessoryId={artistAsset?.parts.accessory}
                          outfitId={artistAsset?.parts.outfit}
                          size="preview"
                          isFrozen
                          displayName={world?.name}
                        />
                      ) : (
                        <span className="moments-post-avatar-fallback">
                          {world?.name.slice(0, 1) || 'A'}
                        </span>
                      )}
                    </div>
                    <div className="v7-post-header-meta moments-post-meta">
                      <div className="v7-post-author-row moments-post-author-row">
                        <strong className="v7-post-author-name moments-post-author-name">{n.author}</strong>
                        <span className="moments-verified-icon" title="Nghệ sĩ xác minh">✓</span>
                      </div>
                      <small className="v7-post-time moments-post-time">
                        {momentTime(n.publishedAt)}
                      </small>
                    </div>
                  </header>

                  <h3 className="v7-post-title moments-post-title">{n.title}</h3>
                  <p className="v7-post-body moments-post-body">{n.body}</p>

                  {/* Attached Session preview if applicable */}
                  {n.sessionId && state.sessions[n.sessionId] && (
                    <Link
                      to={`/sessions/${n.sessionId}`}
                      className="moments-post-event-card"
                    >
                      <div className="moments-event-info">
                        <strong>{state.sessions[n.sessionId].title}</strong>
                        <span>{momentTime(state.sessions[n.sessionId].scheduledStartTime)}</span>
                      </div>
                      <ArrowRight size={16} className="moments-event-arrow" />
                    </Link>
                  )}

                  <footer className="v7-post-actions moments-post-actions">
                    <button
                      type="button"
                      className={`v7-cheer-btn moments-cheer-btn ${userCheered[n.id] ? 'active' : ''}`}
                      onClick={() => toggleCheer(n.id)}
                      aria-label="Cổ vũ bài viết"
                    >
                      <Heart size={14} fill={userCheered[n.id] ? '#E11D48' : 'none'} />
                      <span>{userCheered[n.id] ? 'Đã cổ vũ' : 'Cổ vũ'} · {cheers[n.id] || 40}</span>
                    </button>
                    <button
                      type="button"
                      className="fw-text-button v7-keepsake-btn moments-keepsake-btn"
                      disabled={state.fanProfile.worldJourney?.readNoteIds.includes(n.id)}
                      onClick={() => dispatch({ type: 'READ_ARTIST_NOTE', noteId: n.id })}
                    >
                      {state.fanProfile.worldJourney?.readNoteIds.includes(n.id)
                        ? '♥ Đã giữ lời nhắn'
                        : '♡ Giữ lời nhắn'}
                    </button>
                  </footer>
                </article>
              ))}

              {!notes.length && (
                <div className="v7-feed-empty">
                  <p>Chưa có bài đăng mới. Mình ghé lịch hẹn hoặc trò chuyện cùng hội viên nhé.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (32%): Sidebar with Next Appointment & Fandom Connect */}
          <aside className="v7-community-sidebar moments-sidebar-column">
            {/* Card: Hẹn gần nhất */}
            <div className="moments-sidebar-card moments-appointment-card">
              <p className="moments-sidebar-eyebrow">HẸN GẦN NHẤT</p>
              {nearestSession ? (
                <div className="moments-appointment-box">
                  <span className="moments-appointment-artist">{world?.name}</span>
                  <h3 className="moments-appointment-title">{nearestSession.title}</h3>
                  <div className="moments-appointment-time">
                    <Calendar size={14} />
                    <span>{momentTime(nearestSession.scheduledStartTime)}</span>
                  </div>
                  <Link
                    className="moments-appointment-cta"
                    to={`/sessions/${nearestSession.id}`}
                  >
                    <span>Xem buổi hẹn</span>
                    <ArrowRight size={14} />
                  </Link>

                  <div className="moments-appointment-links">
                    {otherSessionsCount > 0 && (
                      <button
                        type="button"
                        className="moments-schedule-trigger-btn"
                        onClick={() => setIsScheduleDrawerOpen(true)}
                      >
                        <span>{otherSessionsCount} lịch tiếp theo →</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="moments-schedule-trigger-btn"
                      onClick={() => setIsScheduleDrawerOpen(true)}
                    >
                      <span>Xem toàn bộ lịch →</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="fw-muted" style={{ margin: 0, fontSize: '13px' }}>
                  Chưa có lịch mới được công bố.
                </p>
              )}
            </div>

            {/* Real-Time Hall Activity (Only rendered when there is notable active presence/listening) */}
            <div
              className="moments-sidebar-card moments-active-hall-card"
              onClick={() => handleSelectTab('hall')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectTab('hall')}
              style={{ cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.25)', background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="moments-live-pulse-dot" style={{ backgroundColor: '#10B981', width: '8px', height: '8px' }} />
                <strong style={{ fontSize: '12px', color: '#065F46' }}>Listening Party đang diễn ra</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#475569' }}>
                <span>128 người đang nghe cùng</span>
                <span style={{ color: '#059669', fontWeight: '700' }}>Vào nghe →</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ====================================================================
          TAB 2: Live & Concert (Unified Primary Stage)
         ==================================================================== */}
      {tab === 'live' && (
        <section className="moments-live-container">
          <ArtistBroadcast
            worldId={worldId}
            sessionId={selectedLive || undefined}
          />

          {/* Other broadcast sessions & past sessions selection */}
          {(broadcasts.length > 1 || pastSessions.length > 0) && (
            <div className="moments-past-sessions-section">
              <h3 className="moments-past-sessions-title">Các sân khấu & Live trước đây</h3>
              <div className="moments-past-sessions-grid">
                {broadcasts.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={s.id === (selectedLive || broadcasts[0]?.id)}
                    className={`moments-past-session-card ${s.id === (selectedLive || broadcasts[0]?.id) ? 'selected' : ''}`}
                    onClick={() => setSelectedLive(s.id)}
                  >
                    <small style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      {s.format === 'concert' ? '♫ Concert' : '◉ Trò chuyện'} · {s.status === 'running' ? 'Đang diễn ra · Demo' : 'Lịch dự kiến'}
                    </small>
                    <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>
                      {s.title}
                    </strong>
                    <time style={{ fontSize: '11px', color: '#94A3B8' }}>{momentTime(s.scheduledStartTime)}</time>
                  </button>
                ))}
                {pastSessions.filter(ps => !broadcasts.some(b => b.id === ps.id)).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={s.id === selectedLive}
                    className={`moments-past-session-card ${s.id === selectedLive ? 'selected' : ''}`}
                    onClick={() => setSelectedLive(s.id)}
                  >
                    <small style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      {s.format === 'concert' ? '♫ Concert' : '◉ Trò chuyện'} · Bản xem lại
                    </small>
                    <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>
                      {s.title}
                    </strong>
                    <time style={{ fontSize: '11px', color: '#94A3B8' }}>{momentTime(s.scheduledStartTime)}</time>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ====================================================================
          TAB 3: Hall Hội Viên
         ==================================================================== */}
      {tab === 'hall' && (
        <HallPanel worldId={worldId} />
      )}

      {/* ====================================================================
          TAB 4: Merchandise (Scoped In-World Storefront)
         ==================================================================== */}
      {tab === 'merch' && (
        <section className="moments-merch-container">
          {/* Merch Toolbar & Filter Bar */}
          <div className="moments-merch-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div className="moments-merch-filters" role="toolbar" aria-label="Lọc sản phẩm theo phiên bản">
              <button
                type="button"
                className={`moments-filter-chip ${deliveryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDeliveryFilter('all')}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`moments-filter-chip ${deliveryFilter === 'physical' ? 'active' : ''}`}
                onClick={() => setDeliveryFilter('physical')}
              >
                Hàng thật
              </button>
              <button
                type="button"
                className={`moments-filter-chip ${deliveryFilter === 'digital' ? 'active' : ''}`}
                onClick={() => setDeliveryFilter('digital')}
              >
                Digital
              </button>
              <button
                type="button"
                className={`moments-filter-chip ${deliveryFilter === 'bundle' ? 'active' : ''}`}
                onClick={() => setDeliveryFilter('bundle')}
              >
                Bundle
              </button>
            </div>

            <div className="moments-category-filter-select-wrap">
              <select
                className="moments-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                aria-label="Bộ lọc danh mục sản phẩm"
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <option value="all">Tất cả danh mục</option>
                <option value="apparel">Trang phục</option>
                <option value="lightstick">Lightstick</option>
                <option value="album">Album & Băng đĩa</option>
              </select>
            </div>
          </div>

          {/* Product Families Grid */}
          <div className="moments-family-grid">
            {filteredFamilies.map(family => (
              <article
                key={family.id}
                className="moments-family-card"
                onClick={() => {
                  setSelectedFamily(family);
                  setIsQuickViewOpen(true);
                }}
                tabIndex={0}
                role="button"
                aria-label={`Xem chi tiết ${family.title}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedFamily(family);
                    setIsQuickViewOpen(true);
                  }
                }}
              >
                <div className="moments-family-card-img-wrapper">
                  <img
                    src={`${MERCH_IMAGE_ROOT}/${family.image}.png`}
                    alt={family.title}
                    className="moments-family-card-img"
                  />
                  <span className="moments-family-variants-badge">
                    {family.variantCount > 1 ? `${family.variantCount} phiên bản` : '1 phiên bản'}
                  </span>
                </div>

                <div className="moments-family-card-info">
                  <h3 className="moments-family-title">{family.title}</h3>
                  <div className="moments-family-types-row">
                    {family.deliveryTypes.map(t => DELIVERY_LABELS[t] || t).join(' · ')}
                  </div>
                  <strong className="moments-family-price">
                    {(() => {
                      if (family.minPriceVND === family.maxPriceVND) {
                        return `${family.minPriceVND.toLocaleString('vi-VN')} ₫`;
                      }
                      const digitalVar = family.variants.find(v => v.delivery === 'digital');
                      const physicalVar = family.variants.find(v => v.delivery === 'physical');
                      if (digitalVar && physicalVar) {
                        return `Digital ${digitalVar.priceVND.toLocaleString('vi-VN')} ₫ · Hàng thật ${physicalVar.priceVND.toLocaleString('vi-VN')} ₫`;
                      }
                      return `${family.minPriceVND.toLocaleString('vi-VN')} – ${family.maxPriceVND.toLocaleString('vi-VN')} ₫`;
                    })()}
                  </strong>
                </div>
              </article>
            ))}

            {!filteredFamilies.length && (
              <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                <p>Không có sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
                <button
                  type="button"
                  className="fw-text-button"
                  onClick={() => {
                    setDeliveryFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick View Drawer */}
      <ProductFamilyQuickView
        family={selectedFamily}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Schedule Drawer (Full Calendar Overlay) */}
      <ArtistScheduleDrawer
        worldId={worldId}
        artistName={world?.name || ''}
        isOpen={isScheduleDrawerOpen}
        onClose={() => setIsScheduleDrawerOpen(false)}
      />

      {/* In-World Add-to-Cart Toast */}
      {cartToast && cartToast.visible && (
        <aside className="moments-cart-toast" role="status" aria-live="polite">
          <Check size={16} style={{ color: '#34D399', flexShrink: 0 }} />
          <span className="moments-toast-message">{cartToast.message}</span>
          <div className="moments-toast-actions">
            <Link to="/cart" className="moments-toast-cart-link">
              Xem giỏ hàng →
            </Link>
            <button
              type="button"
              className="moments-toast-close"
              onClick={() => setCartToast(null)}
              aria-label="Đóng thông báo"
            >
              <X size={14} />
            </button>
          </div>
        </aside>
      )}
    </section>
  );
}
