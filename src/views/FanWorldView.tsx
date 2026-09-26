import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Disc3, Heart, Music2, Sparkles, CalendarDays, BookOpen, Package, X, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { PersonalDisplayRoom } from '../components/DisplayRoom';
import { ArtistCommunity } from '../components/ArtistCommunity';
import { ArtistBroadcast } from '../components/ArtistBroadcast';
import { PlaceId, PANEL_HOME, panelRoute } from '../world/places';
import { CollectionBrowser } from '../components/CollectionBrowser';
import { HallPanel } from '../components/HallPanel';
import { DigitalCloset } from '../components/DigitalCloset';
import { WorldPanel } from '../components/WorldPanel';
import { FanAvatarCustomizer } from '../components/FanAvatarCustomizer';
import { MembershipCard } from '../components/MembershipCard';
import { BenefitCard } from '../components/BenefitCard';
import { ARTIST_NOTES, momentTime, ORDER_LABELS } from '../world/fanWorld';
import { getTenantConfig } from '../domain/tenantConfig';
import { ARTIST_FANDOM_REGISTRY, getArtistAvatar } from '../data/artistChatConfig';
import { FandomPolaroidPass } from '../components/FandomPolaroidPass';
import { displayedItems } from '../world/display';
import { ownedDigitalLook } from '../world/merchCatalog';
import { loadPrivacySettings, savePrivacySettings as persistPrivacySettings, type SpacePrivacySettings } from '../world/privacy';
import { useDialogA11y } from '../hooks/useDialogA11y';

const panelTitles: Record<string, string> = {
  hall: 'Hall · Gặp những người cùng yêu nhạc', concerts: 'Live Concert · Sân khấu chung', livechat: 'Live Chat · Lời nhắn từ artist',
  worlds: 'Những nơi bạn có thể ghé thăm', news: 'Bản tin từ nghệ sĩ', sessions: 'Lịch hẹn sân khấu',
  listening: 'Góc nghe nhạc', archive: 'Những đêm nhạc đã qua', wardrobe: 'Diện mạo của bạn',
  capsules: 'Kệ kỷ niệm', calendar: 'Lịch hẹn của bạn', bag: 'Túi đồ của bạn',
  membership: 'Đồng hành cùng nghệ sĩ', support: 'Hỗ trợ & Trợ giúp', artist: 'Gặp gỡ nghệ sĩ', showcase: 'Trưng bày trong phòng',
};
const aliases: Record<string, string> = { follows: 'calendar', history: 'archive', orders: 'bag', benefits: 'membership' };

interface ArtistPromoBanner {
  title: string;
  subtitle: string;
  targetRoute?: string;
  bgImage: string;
  gradientOverlay: string;
}

const ARTIST_PROMO_BANNERS: Record<string, ArtistPromoBanner> = {
  'artist-a': {
    title: 'Đêm Nhạc Trực Tuyến & Merch Drop Exclusive',
    subtitle: 'Bộ sưu tập áo khoác Varsity, lightstick sao xanh và các sự kiện giao lưu trực tiếp đặc biệt.',
    targetRoute: '/shop',
    bgImage: '/images/banner-artist-a.jpg',
    gradientOverlay: 'linear-gradient(90deg, rgba(16, 24, 32, 0.92) 0%, rgba(16, 24, 32, 0.7) 55%, rgba(16, 24, 32, 0.25) 100%)',
  },
  'artist-mira': {
    title: 'Bộ Sưu Tập Hoodie & Đĩa Than Vinyl MIRA',
    subtitle: 'Đắm chìm trong không gian âm nhạc Lofi Dream Pop và quà tặng độc quyền dành riêng cho Moonies.',
    targetRoute: '/shop',
    bgImage: '/images/banner-artist-mira.jpg',
    gradientOverlay: 'linear-gradient(90deg, rgba(35, 18, 55, 0.92) 0%, rgba(35, 18, 55, 0.7) 55%, rgba(35, 18, 55, 0.25) 100%)',
  },
  'artist-kai': {
    title: 'Áo Bomber Phản Quang & Cyber Pulse Lightstick',
    subtitle: 'Trang bị phụ kiện bùng nổ cho các đêm nhạc EDM và phiên thử nghiệm âm thanh sống động.',
    targetRoute: '/shop',
    bgImage: '/images/banner-artist-kai.jpg',
    gradientOverlay: 'linear-gradient(90deg, rgba(12, 22, 36, 0.92) 0%, rgba(12, 22, 36, 0.7) 55%, rgba(12, 22, 36, 0.25) 100%)',
  },
  'neon-sessions': {
    title: 'Tuyển Tập Đĩa Than & Kỷ Vật Neon Prelude',
    subtitle: 'Lắng nghe những bản thu mộc mạc và lưu giữ kỷ vật âm nhạc đặc sắc từ các nghệ sĩ.',
    targetRoute: '/shop',
    bgImage: '/images/banner-neon-sessions.jpg',
    gradientOverlay: 'linear-gradient(90deg, rgba(30, 20, 12, 0.92) 0%, rgba(30, 20, 12, 0.7) 55%, rgba(30, 20, 12, 0.25) 100%)',
  },
};

export function FanWorldView() {
  const { state, dispatch } = useApp();
  const tenantConfig = getTenantConfig(state.activeTenantId);
  const { worldId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [isEditIntroOpen, setIsEditIntroOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const [privacySettings, setPrivacySettings] = useState<SpacePrivacySettings>(loadPrivacySettings);

  const introModalRef = useRef<HTMLDivElement>(null);
  const privacyModalRef = useRef<HTMLDivElement>(null);

  const savePrivacySettings = (next: SpacePrivacySettings) => {
    setPrivacySettings(next);
    persistPrivacySettings(next);
  };

  useEffect(() => {
    const p = params.get('panel');
    if (p === 'pass') {
      setIsPassOpen(true);
    } else if (p === 'privacy') {
      setIsPrivacyOpen(true);
    }
  }, [params]);

  const handleClosePass = () => {
    setIsPassOpen(false);
    if (params.get('panel') === 'pass') {
      const nextParams = new URLSearchParams(params);
      nextParams.delete('panel');
      setParams(nextParams, { replace: true });
    }
  };

  const handleClosePrivacy = () => {
    setIsPrivacyOpen(false);
    if (params.get('panel') === 'privacy') {
      const nextParams = new URLSearchParams(params);
      nextParams.delete('panel');
      setParams(nextParams, { replace: true });
    }
  };

  useDialogA11y(isEditIntroOpen, () => setIsEditIntroOpen(false), introModalRef);
  useDialogA11y(isPrivacyOpen, handleClosePrivacy, privacyModalRef);

  const isRoom = pathname === '/me' || pathname.endsWith('/archive');
  const rawSection = params.get('section');
  const currentSection: 'room' | 'collection' | 'avatar' =
    pathname.endsWith('/archive') || rawSection === 'collection' || !!params.get('custom')
      ? 'collection'
      : rawSection === 'avatar'
      ? 'avatar'
      : 'room';

  function selectSpace(section: 'room' | 'collection' | 'avatar') {
    const q = new URLSearchParams();
    if (section === 'collection') q.set('section', 'collection');
    else if (section === 'avatar') q.set('section', 'avatar');
    navigate(`/me${q.size ? '?' + q : ''}`);
  }

  const handleTabKeyDown = (e: React.KeyboardEvent, section: 'room' | 'collection' | 'avatar') => {
    const tabs: ('room' | 'collection' | 'avatar')[] = ['room', 'collection', 'avatar'];
    const idx = tabs.indexOf(section);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = tabs[(idx + 1) % tabs.length];
      selectSpace(next);
      document.getElementById(`tab-${next}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
      selectSpace(prev);
      document.getElementById(`tab-${prev}`)?.focus();
    }
  };

  const place = (isRoom ? 'myspace' : pathname.endsWith('/moments') ? 'moments' : pathname.endsWith('/archive') ? 'archive' : 'moments') as PlaceId;
  const savedWorld = state.fanProfile.worldJourney?.lastWorldId;
  const hasExplicitContext = Boolean(worldId || params.get('artist') || savedWorld);
  const selectedArtist = worldId || params.get('artist') || savedWorld || state.followedWorldIds[0] || Object.keys(state.worlds)[0];
  const isShared = isRoom || place === 'archive';
  const world = state.worlds[isShared ? (Object.keys(state.worlds)[0] || '') : selectedArtist];

  const queryTab = params.get('tab') || (params.get('session') || params.get('panel') === 'concerts' || params.get('panel') === 'livechat' ? 'live' : params.get('panel') === 'hall' ? 'hall' : 'home');
  const [momentsTab, setMomentsTab] = useState(queryTab);

  useEffect(() => {
    if (queryTab && queryTab !== momentsTab) {
      setMomentsTab(queryTab);
    }
  }, [queryTab]);

  const handleMomentsTabChange = (nextTab: string) => {
    setMomentsTab(nextTab);
    const nextParams = new URLSearchParams(params);
    nextParams.set('tab', nextTab);
    setParams(nextParams, { replace: false });
  };

  useEffect(() => {
    if (pathname.endsWith('/moments') && world?.id) {
      dispatch({ type: 'VISIT_FAN_WORLD', worldId: world.id });
    }
  }, [pathname, world?.id, dispatch]);

  useEffect(() => {
    if (isRoom) {
      document.title = `My Space · ${state.fanProfile.displayName} — VieWorld`;
    } else if (pathname.endsWith('/moments') || world) {
      const tabNames: Record<string, string> = {
        home: `Nhà ${world?.name || 'nghệ sĩ'}`,
        live: 'Live & Concert',
        hall: 'Hall hội viên',
        merch: 'Merchandise',
      };
      const t = tabNames[momentsTab] || 'Moments';
      document.title = `${t} · ${world?.name || 'Cộng đồng'} — VieWorld`;
    }
  }, [isRoom, pathname, world?.name, momentsTab, state.fanProfile.displayName]);

  const rawPanel = params.get('panel') || params.get('zone') || params.get('drawer') || (pathname === '/worlds' ? 'worlds' : '');
  const panel = rawPanel === 'shop' ? 'bag' : (aliases[rawPanel] || rawPanel);
  const activePanel = panelTitles[panel] ? panel : '';
  const ownPanel = useRef(false);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [slot, setSlot] = useState<0 | 1 | 2>(0);
  const sessions = Object.values(state.sessions);
  const note = ARTIST_NOTES.find(n => n.worldId === world?.id);
  const noteRead = !!note && !!state.fanProfile.worldJourney?.readNoteIds.includes(note.id);
  const capsules = Object.values(state.capsules).filter(c => c.fanId === state.fanProfile.id && c.tenantId === state.activeTenantId);
  const savedCapsules = capsules.filter(c => c.isSaved);
  const slots = state.fanProfile.showcaseSlots || [null, null, null];
  const orders = Object.values(state.orders).filter(o => o.fanId === state.fanProfile.id);

  useEffect(() => {
    if (world && !isShared) dispatch({ type: 'VISIT_FAN_WORLD', worldId: world.id });
  }, [world?.id, isShared, dispatch]);
  useEffect(() => {
    if (rawPanel === 'shop' && world) navigate(`/worlds/${world.id}/shop`, { replace: true });
  }, [rawPanel, world?.id, navigate]);

  function open(name: string) {
    const target = PANEL_HOME[name];
    if (name === 'worlds') { navigate('/artists'); return; }
    if (target && target !== place) { navigate(panelRoute(name, isShared ? undefined : world?.id)); return; }
    if (!activePanel) ownPanel.current = true;
    const nextParams = new URLSearchParams(params); nextParams.set('panel', name);
    setParams(nextParams, { replace: !!activePanel });
  }

  function close() {
    if (ownPanel.current) { ownPanel.current = false; navigate(-1); }
    else if (pathname === '/worlds') navigate('/', { replace: true });
    else { const nextParams = new URLSearchParams(params); ['panel', 'zone', 'drawer'].forEach(k => nextParams.delete(k)); setParams(nextParams, { replace: true }); }
  }

  if (!world) return <section className="fw-empty"><h1>Chưa tìm thấy nghệ sĩ này</h1><Link className="fw-button" to="/">Về thế giới</Link></section>;
  const ip = world.type === 'ip';
  const artistAsset = world.avatarAssetId ? state.avatarAssets[world.avatarAssetId] : undefined;
  const canShowArtist = artistAsset?.status === 'approved';

  const list = (panel === 'calendar' ? sessions.filter(s => state.rsvpdSessionIds.includes(s.id) && (isShared || s.worldId === world.id))
    : sessions.filter(s => (isShared || s.worldId === world.id) && (panel !== 'listening' || s.format === 'listening') && (panel !== 'concerts' || s.format === 'concert') && (panel === 'archive' ? s.replayStatus === 'available' : !['ended', 'cancelled'].includes(s.status)))).sort((a, b) => (a.scheduledStartTime || '').localeCompare(b.scheduledStartTime || ''));

  const isMoments = place === 'moments' || place === 'artist';
  const fandom = ARTIST_FANDOM_REGISTRY[world.id];

  const hasActiveMembership = Object.values(state.memberships).some(
    m => m.fanId === state.fanProfile.id && m.status === 'active'
  );

  const fanMood = state.fanProfile.publicIdentity?.mood || 'Hôm nay, cứ là mình thôi.';
  const fanBio = state.fanProfile.publicIdentity?.bio || 'Một góc nhỏ cho những điều mình yêu.';

  return <div className={`fw-experience vw-place-page vw-page-${place}`}>
    {isRoom ? (
      <header className="v7-space-header-block">
        <div className="v7-space-hero-row">
          <div className="v7-space-hero-left">
            <div className="v7-space-eyebrow-row">
              <span className="v7-space-eyebrow">MY LITTLE CORNER</span>
            </div>

            <div className="v7-space-identity-name-row">
              <h1 className="v7-space-title">
                <span className="sr-only">My Space · </span>{state.fanProfile.displayName}
                {hasActiveMembership && privacySettings.showMembershipSignal && (
                  <button
                    type="button"
                    className="v7-member-subtle-gem-btn"
                    onClick={() => setIsPassOpen(true)}
                    title="Pulse Crew Member · Xem Fandom Pass"
                    aria-label="Pulse Crew Member · Xem Fandom Pass"
                  >
                    ◇
                  </button>
                )}
              </h1>
              <button
                type="button"
                className="v7-space-edit-intro-btn"
                onClick={() => setIsEditIntroOpen(true)}
                aria-label="Sửa giới thiệu"
              >
                Sửa giới thiệu
              </button>
            </div>

            <p className="v7-space-mood">{fanMood}</p>
            <p className="v7-space-bio">{fanBio}</p>
          </div>

          <div className="v7-space-hero-right">
            <Link to="/" className="sr-only">Về quảng trường</Link>
            {/* Primary 3-tab Navigation: Phòng của tôi | Bộ sưu tập | Avatar */}
            <nav className="v7-space-tabs" aria-label="Các phần My Space">
              <button
                type="button"
                id="tab-room"
                aria-controls="panel-room"
                className={`v7-tab-pill ${currentSection === 'room' ? 'active' : ''}`}
                aria-selected={currentSection === 'room'}
                aria-pressed={currentSection === 'room'}
                aria-label="Phòng trưng bày"
                onClick={() => selectSpace('room')}
                onKeyDown={e => handleTabKeyDown(e, 'room')}
              >
                <span>Phòng của tôi</span>
              </button>
              <button
                type="button"
                id="tab-collection"
                aria-controls="panel-collection"
                className={`v7-tab-pill ${currentSection === 'collection' ? 'active' : ''}`}
                aria-selected={currentSection === 'collection'}
                aria-pressed={currentSection === 'collection'}
                aria-label="Bộ sưu tập riêng"
                onClick={() => selectSpace('collection')}
                onKeyDown={e => handleTabKeyDown(e, 'collection')}
              >
                <span>Bộ sưu tập</span>
              </button>
              <button
                type="button"
                id="tab-avatar"
                aria-controls="panel-avatar"
                className={`v7-tab-pill ${currentSection === 'avatar' ? 'active' : ''}`}
                aria-selected={currentSection === 'avatar'}
                aria-pressed={currentSection === 'avatar'}
                aria-label="Avatar"
                onClick={() => selectSpace('avatar')}
                onKeyDown={e => handleTabKeyDown(e, 'avatar')}
              >
                <span>Avatar</span>
              </button>
            </nav>
          </div>
        </div>
      </header>
    ) : isMoments ? (
      <div className={`v7-community-header-block moments-masthead ${momentsTab === 'home' ? 'expanded' : 'collapsed'}`}>
        {!hasExplicitContext && (
          <div className="v7-artist-picker-banner" role="region" aria-label="Bộ chọn nghệ sĩ">
            <div className="v7-artist-picker-content">
              <span className="v7-artist-picker-hint">Chọn nghệ sĩ để xem Moments:</span>
              <div className="v7-artist-picker-chips">
                {Object.values(state.worlds).filter(w => w.tenantId === state.activeTenantId).map(w => (
                  <button
                    key={w.id}
                    type="button"
                    className={`v7-picker-chip ${w.id === world.id ? 'active' : ''}`}
                    onClick={() => navigate(w.type === 'artist' ? `/artist/${w.id}` : '/explore')}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
            <Link to="/explore" className="v7-picker-explore-link">
              Khám phá thêm ở Explore →
            </Link>
          </div>
        )}
        <Link className="sr-only" to="/artists">← Khám phá nghệ sĩ</Link>
        <select
          aria-label="Chọn nhà nghệ sĩ"
          value={world.id}
          onChange={e => navigate(state.worlds[e.target.value]?.type === 'artist' ? `/artist/${e.target.value}` : '/explore')}
          className="sr-only"
          tabIndex={-1}
        >
          {Object.values(state.worlds).map(w => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        {/* Promotional / Event / Merch Cover Banner */}
        {(() => {
          const promoBanner = ARTIST_PROMO_BANNERS[world.id] || {
            title: `Không Gian Âm Nhạc & Kỷ Vật · ${world.name}`,
            subtitle: 'Đồng hành cùng nghệ sĩ, tham gia sự kiện và lưu giữ những kỷ niệm đáng nhớ.',
            targetRoute: '/shop',
            bgImage: '/images/banner-artist-a.jpg',
            gradientOverlay: 'linear-gradient(90deg, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.75) 55%, rgba(15, 23, 42, 0.3) 100%)',
          };

          const bannerContent = (
            <div className="moments-cover-promo-content">
              <h2 className="moments-cover-promo-title">{promoBanner.title}</h2>
              <p className="moments-cover-promo-subtitle">{promoBanner.subtitle}</p>
            </div>
          );

          const bannerStyle = {
            backgroundImage: `${promoBanner.gradientOverlay}, url(${promoBanner.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          };

          if (promoBanner.targetRoute) {
            return (
              <Link
                to={promoBanner.targetRoute}
                className="v7-community-cover-banner moments-cover-banner is-clickable"
                style={bannerStyle}
                aria-label={`${promoBanner.title} - ${promoBanner.subtitle}`}
              >
                {bannerContent}
              </Link>
            );
          }

          return (
            <div
              className="v7-community-cover-banner moments-cover-banner"
              style={bannerStyle}
            >
              {bannerContent}
            </div>
          );
        })()}

        {/* Profile Overlap Seam */}
        <div className="v7-community-profile-seam moments-profile-seam">
          <div className="v7-profile-left moments-profile-left">
            <div className="v7-community-main-avatar moments-main-avatar">
              <img
                src={getArtistAvatar(world.id)}
                alt={world.name}
                className="moments-profile-avatar-img"
                data-testid="community-profile-avatar"
              />
            </div>
            <div className="v7-profile-meta moments-profile-meta">
              <div className="v7-profile-title-row moments-profile-title-row">
                <h1 className="moments-profile-name">
                  <span className="sr-only">Moments · </span>{world.name}
                </h1>
                <span className="moments-fandom-tag">
                  {fandom?.fandomName || 'VieWorld'}
                </span>
              </div>
            </div>
          </div>

          <div className="v7-profile-actions moments-profile-actions">
            <button
              className={`v7-community-follow-btn moments-follow-btn ${state.followedWorldIds.includes(world.id) ? 'following' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_FOLLOW', worldId: world.id })}
              aria-pressed={state.followedWorldIds.includes(world.id)}
            >
              <Heart
                size={16}
                fill={state.followedWorldIds.includes(world.id) ? '#EC4899' : 'none'}
                color={state.followedWorldIds.includes(world.id) ? '#EC4899' : 'currentColor'}
              />
              <span>{state.followedWorldIds.includes(world.id) ? 'Đang theo dõi' : 'Theo dõi nghệ sĩ'}</span>
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="vx-context-bar">Bộ sưu tập cá nhân · từ mọi artist bạn yêu mến</div>
    )}

    {isRoom ? (
      currentSection === 'collection' ? (
        <div id="panel-collection" role="tabpanel" aria-labelledby="tab-collection">
          <CollectionBrowser />
          <details className="v8-private-tools">
            <summary>Nhật ký, phiên xem lại & đơn hàng khác</summary>
            <div className="v7-collection-tools">
              <button className="fw-text-button" onClick={() => open('capsules')}>
                Nhật ký & kỷ niệm →
              </button>
              <button className="fw-text-button" onClick={() => open('archive')}>
                Các phiên xem lại →
              </button>
              <button className="fw-text-button" onClick={() => open('bag')}>
                Đồ đã nhận & đơn hàng →
              </button>
            </div>
          </details>
        </div>
      ) : currentSection === 'avatar' ? (
        <div id="panel-avatar" role="tabpanel" aria-labelledby="tab-avatar" className="v7-avatar-tab-wrapper">
          <FanAvatarCustomizer onBackToRoom={() => selectSpace('room')} />
        </div>
      ) : (
        <div id="panel-room" role="tabpanel" aria-labelledby="tab-room">
          <PersonalDisplayRoom
            onOpen={open}
            privacySettings={privacySettings}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        </div>
      )
    ) : (
      <ArtistCommunity
        key={world.id}
        worldId={world.id}
        onOpen={open}
        initialTab={momentsTab}
        onTabChange={handleMomentsTabChange}
      />
    )}

    {/* Sửa giới thiệu Modal */}
    {isEditIntroOpen && (
      <div className="v7-modal-backdrop" onClick={() => setIsEditIntroOpen(false)}>
        <div
          ref={introModalRef}
          className="v7-intro-modal"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Sửa lời giới thiệu"
          tabIndex={-1}
        >
          <div className="v7-modal-header">
            <div>
              <span className="v7-modal-eyebrow">IDENTITY & EXPRESSION</span>
              <h3>Sửa giới thiệu không gian</h3>
            </div>
            <button
              type="button"
              className="v7-modal-close-btn"
              onClick={() => setIsEditIntroOpen(false)}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const mood = String(form.get('mood') || '').trim();
              const bio = String(form.get('bio') || '').trim();
              dispatch({
                type: 'SAVE_PUBLIC_IDENTITY',
                mood: mood || 'Hôm nay, cứ là mình thôi.',
                bio: bio || 'Một góc nhỏ cho những điều mình yêu.',
                badge: state.fanProfile.publicIdentity?.badge,
                productIds: state.fanProfile.publicIdentity?.productIds,
              });
              setIsEditIntroOpen(false);
            }}
          >
            <div className="v7-form-group">
              <label htmlFor="intro-mood-input">Hôm nay bạn thế nào? (Mood / Status)</label>
              <input
                id="intro-mood-input"
                name="mood"
                defaultValue={fanMood}
                maxLength={60}
                placeholder="Hôm nay, cứ là mình thôi."
              />
              <small>Tối đa 60 ký tự · Thể hiện tâm trạng hoặc lời chào khi người khác ghé phòng.</small>
            </div>

            <div className="v7-form-group">
              <label htmlFor="intro-bio-input">Đôi dòng giới thiệu bản thân</label>
              <textarea
                id="intro-bio-input"
                name="bio"
                defaultValue={fanBio}
                maxLength={160}
                rows={3}
                placeholder="Một góc nhỏ cho những điều mình yêu."
              />
              <small>Tối đa 160 ký tự · Lời giới thiệu xuất hiện dưới tên bạn.</small>
            </div>

            <div className="v7-modal-actions">
              <button
                type="button"
                className="fw-text-button"
                onClick={() => setIsEditIntroOpen(false)}
              >
                Hủy
              </button>
              <button type="submit" className="fw-button">
                Lưu giới thiệu
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Privacy Settings Modal */}
    {isPrivacyOpen && (
      <div className="v7-modal-backdrop" onClick={handleClosePrivacy}>
        <div
          ref={privacyModalRef}
          className="v7-privacy-modal"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Cài đặt quyền riêng tư không gian"
          tabIndex={-1}
        >
          <div className="v7-modal-header">
            <div>
              <span className="v7-modal-eyebrow">PRIVACY & CONTROL</span>
              <h3>Quyền riêng tư không gian</h3>
            </div>
            <button
              type="button"
              className="v7-modal-close-btn"
              onClick={handleClosePrivacy}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          <div className="v7-privacy-form">
            <div className="v7-privacy-field">
              <label htmlFor="privacy-room-visibility">
                <strong>Ai có thể ghé phòng</strong>
              </label>
              <select
                id="privacy-room-visibility"
                value={privacySettings.roomVisibility}
                onChange={e =>
                  savePrivacySettings({
                    ...privacySettings,
                    roomVisibility: e.target.value as SpacePrivacySettings['roomVisibility'],
                  })
                }
              >
                <option value="everyone">Tất cả mọi người (Public)</option>
                <option value="users">Chỉ thành viên VieWorld</option>
                <option value="private">Chỉ mình tôi (Private)</option>
              </select>
              <small>
                Khách ghé thăm chỉ thấy đúng những món bạn chủ động đưa lên kệ phòng. Không bao giờ thấy toàn bộ kho đồ hay ghi chú riêng.
              </small>
            </div>

            <div className="v7-privacy-toggle-row">
              <label htmlFor="privacy-show-visit-count" style={{ cursor: 'pointer', flex: 1 }}>
                <strong>Hiện số lượt ghé thăm</strong>
                <p>Hiển thị số lượt ghé phòng (không dùng để xếp hạng hay đua top).</p>
              </label>
              <input
                id="privacy-show-visit-count"
                type="checkbox"
                checked={privacySettings.showVisitCount}
                onChange={e =>
                  savePrivacySettings({
                    ...privacySettings,
                    showVisitCount: e.target.checked,
                  })
                }
              />
            </div>

            <div className="v7-privacy-toggle-row">
              <label htmlFor="privacy-guestbook-enabled" style={{ cursor: 'pointer', flex: 1 }}>
                <strong>Cho phép dán giấy nhớ (Guestbook)</strong>
                <p>Cho phép người ghé thăm để lại lời nhắn trên tường lưu bút.</p>
              </label>
              <input
                id="privacy-guestbook-enabled"
                type="checkbox"
                checked={privacySettings.guestbookEnabled}
                onChange={e =>
                  savePrivacySettings({
                    ...privacySettings,
                    guestbookEnabled: e.target.checked,
                  })
                }
              />
            </div>

            <div className="v7-privacy-toggle-row">
              <label htmlFor="privacy-membership-signal" style={{ cursor: 'pointer', flex: 1 }}>
                <strong>Hiện biểu tượng hội viên (◇)</strong>
                <p>Biểu tượng nhỏ bên cạnh tên khi bạn có quyền lợi hội viên đang hoạt động.</p>
              </label>
              <input
                id="privacy-membership-signal"
                type="checkbox"
                checked={privacySettings.showMembershipSignal}
                onChange={e =>
                  savePrivacySettings({
                    ...privacySettings,
                    showMembershipSignal: e.target.checked,
                  })
                }
              />
            </div>

            <div className="v7-modal-actions">
              <button
                type="button"
                className="fw-button"
                onClick={handleClosePrivacy}
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {activePanel && <WorldPanel title={panelTitles[activePanel]} onClose={close}>
      {panel === 'livechat' && <ArtistBroadcast worldId={world.id}/>}
      {panel === 'concerts' && !isShared && <ArtistBroadcast worldId={world.id} format="concert"/>}
      {panel === 'hall' && (isShared ? <><p>Chọn hội của artist bạn muốn ghé. Theo dõi không tự cấp membership.</p>{Object.values(state.worlds).filter(w => w.type === 'artist').map(w=><Link className="fw-destination" key={w.id} to={`/artist/${w.id}/hall`}><Heart/><div><strong>{w.name}</strong><p>Kiểm tra membership và ghé Hall</p></div><ArrowRight/></Link>)}</> : <HallPanel worldId={world.id} />)}
      {panel === 'worlds' && <><p className="fw-muted">Mỗi nhà nhạc là một thế giới. Bạn vẫn là bạn ở mọi nơi.</p>{Object.values(state.worlds).map(w => <Link className="fw-destination" key={w.id} to={`/worlds/${w.id}`}><span className={w.type === 'ip' ? 'neon' : ''}>{w.type === 'ip' ? <Disc3 /> : <Music2 />}</span><div><strong>{w.name}</strong><p>{w.type === 'artist' ? 'Ghé chơi, nghe nhạc, gặp artist.' : 'Những âm thanh và cuộc gặp mới.'}</p></div><ArrowRight size={19} /></Link>)}<Link className="fw-destination" to="/me"><span><BookOpen /></span><div><strong>Phòng của bạn</strong><p>Về với những kỷ niệm đã giữ.</p></div><ArrowRight size={19} /></Link></>}
      {panel === 'artist' && <div className="fw-artist-story">{canShowArtist && <AvatarRenderer role="artist" accessoryId={artistAsset?.parts.accessory} outfitId={artistAsset?.parts.outfit} size="preview" isFrozen displayName={world.name} />}<p className="fw-eyebrow">{ip ? 'CHƯƠNG TRÌNH ĐẶC BIỆT' : 'NGHỆ SĨ ĐỒNG HÀNH'} · DEMO</p><h3>{world.name}</h3><p>{world.description}</p><button className="fw-button" onClick={() => open('news')}>Đọc lời nhắn từ nhà nhạc <ArrowRight size={16} /></button></div>}
      {panel === 'news' && (note ? <article className="fw-note"><p className="fw-eyebrow">{note.author} · Bài đăng mẫu</p><time>{momentTime(note.publishedAt)}</time><h3>{note.title}</h3><p>{note.body}</p><div className="fw-note-signature">Hẹn gặp ở nhà nhạc,<br /><strong>{note.author}</strong></div><button className="fw-button" onClick={() => dispatch({ type: 'READ_ARTIST_NOTE', noteId: note.id })} disabled={noteRead}>{noteRead ? <><Check size={17} /> Đã giữ lời nhắn</> : <><Heart size={17} /> Giữ lời nhắn này</>}</button>{note.sessionId && state.sessions[note.sessionId] && <Link className="fw-destination" to={`/sessions/${note.sessionId}`}><CalendarDays /><div><strong>{state.sessions[note.sessionId].title}</strong><p>{momentTime(state.sessions[note.sessionId].scheduledStartTime)}</p></div><ArrowRight /></Link>}</article> : <p>Nhà nhạc chưa có lời nhắn mới.</p>)}
      {['sessions', 'concerts', 'listening', 'archive', 'calendar'].includes(panel) && <>
        <p className="fw-muted">{panel === 'calendar' ? 'Lịch đã nhắc của bạn. RSVP là lời nhắc, chưa phải vé vào cửa.' : panel === 'archive' ? 'Các bản ghi được phép xem lại. Xem lại không tính là tham dự trực tiếp.' : 'Chọn một cuộc hẹn. Nhạc chỉ phát khi bạn chủ động bật.'}</p>
        {!list.length && <div className="fw-empty"><CalendarDays size={35} /><h3>{panel === 'calendar' ? 'Mình chưa có lịch hẹn nào.' : 'Chưa có phiên phù hợp.'}</h3><button className="fw-button" onClick={() => open(panel === 'sessions' ? 'worlds' : 'sessions')}>{panel === 'sessions' ? 'Ghé nhà nhạc khác' : 'Xem lịch nhà nhạc'}</button></div>}
        {list.map(s => <article className="fw-event-row" key={s.id}><small>{state.worlds[s.worldId]?.name} · {momentTime(s.scheduledStartTime)}{s.status === 'running' ? ' · LIVE · DEMO' : s.status === 'cancelled' ? ' · Đã hủy' : s.status === 'ended' ? ' · Đã kết thúc' : ' · DEMO'}</small><h3>{s.title}</h3><div><Link className="fw-button" to={`/sessions/${s.id}`}>{s.replayStatus === 'available' && s.status === 'ended' ? 'Xem lại' : 'Ghé sân khấu'}<ArrowRight size={16} /></Link>{['scheduled', 'open', 'running'].includes(s.status) && <button className="fw-text-button" onClick={() => dispatch({ type: 'TOGGLE_RSVP', sessionId: s.id })}>{state.rsvpdSessionIds.includes(s.id) ? 'Hủy nhắc lịch' : 'Nhắc mình'}</button>}</div></article>)}
        {panel === 'sessions' && <button className="fw-text-button" onClick={() => open('archive')}>Xem những đêm đã qua <ArrowRight size={16} /></button>}
      </>}
      {panel === 'wardrobe' && <><p className="fw-muted">Chọn một chi tiết của riêng mình. Diện mạo này đồng hành cùng bạn ở mọi không gian nghệ sĩ.</p><FanAvatarCustomizer/><DigitalCloset /></>}
      {panel === 'capsules' && <>
        <p className="fw-muted">Kỷ niệm từ những phiên bạn đã tham dự. Bỏ khỏi kệ vẫn giữ trong bộ sưu tập.</p>
        <Link className="fw-text-button" to="/me?section=collection&type=ticket">Chọn kỷ niệm công khai trong My Space ↗</Link>
        {!capsules.length && <div className="fw-empty"><Sparkles size={35} /><h3>Để dành một chỗ cho đêm đầu tiên.</h3><p>Tham dự một phiên đủ điều kiện để nhận kỷ niệm của riêng bạn.</p><Link className="fw-button" to="/explore">Tìm một cuộc hẹn <ArrowRight size={16} /></Link></div>}
        {capsules.map(c => <article key={c.id} className="fw-event-row"><small>{state.worlds[c.worldId]?.name}</small><h3>{state.sessions[c.sessionId]?.title || 'Kỷ niệm của bạn'}</h3><form className="fw-keepsake-note" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); dispatch({ type: 'SAVE_CAPSULE', capsuleId: c.id, privateNote: String(data.get('note') || ''), isSaved: c.isSaved }); setSavedNoteId(c.id); }}><label htmlFor={`note-${c.id}`}>Ghi chú riêng</label><textarea id={`note-${c.id}`} name="note" onChange={() => setSavedNoteId(null)} defaultValue={c.privateNote || ''} maxLength={1000} rows={2} /><button className="fw-text-button" type="submit">Giữ ghi chú</button>{savedNoteId === c.id && <small role="status">Đã giữ ghi chú riêng.</small>}</form><div><button className="fw-text-button" onClick={() => dispatch({ type: 'SAVE_CAPSULE', capsuleId: c.id, isSaved: !c.isSaved })}>{c.isSaved ? 'Bỏ lưu' : 'Lưu kỷ niệm'}</button></div></article>)}
      </>}
      {panel === 'showcase' && <>
        <p className="fw-muted">Chỉ chọn những kỷ niệm đã lưu để trưng bày. Quản lý ghi chú trong Bộ sưu tập riêng.</p>
        <div className="fw-slot-picker" aria-label="Chọn ô trên kệ">{slots.map((id,i)=><button key={i} aria-label={`Ô ${i+1}`} aria-pressed={slot===i} onClick={()=>setSlot(i as 0|1|2)}><span>{id?'✦':'+'}</span>Ô {i+1}</button>)}</div>
        {slots[slot]&&<button className="fw-text-button" onClick={()=>dispatch({type:'CLEAR_SHOWCASE_SLOT',slotIndex:slot})}>Bỏ kỷ niệm khỏi ô {slot+1}</button>}
        {!savedCapsules.length&&<p>Chưa có kỷ niệm đã lưu để trưng bày.</p>}
        {savedCapsules.map(c=><article className="fw-event-row" key={c.id}><small>{state.worlds[c.worldId]?.name}</small><h3>{state.sessions[c.sessionId]?.title||'Kỷ niệm của bạn'}</h3><button className="fw-button" onClick={()=>dispatch({type:'SET_SHOWCASE_SLOT',slotIndex:slot,capsuleId:c.id})}>{slots[slot]===c.id?'Đang ở ô này':`Đặt vào ô ${slot+1}`}</button></article>)}
        <Link className="fw-text-button" to="/me?section=collection&panel=capsules">Mở bộ sưu tập riêng →</Link>
      </>}
      {panel === 'bag' && <>
        <p className="fw-muted">Những món đồ và đơn hàng đi cùng hành trình của {state.fanProfile.displayName}.</p>
        {!orders.length && (
          <div className="fw-empty">
            <Package size={36} />
            <h3>Túi đồ đang trống.</h3>
            <p>Ghé {tenantConfig.labels.shopTitle} tìm một món mình thích.</p>
            <Link className="fw-button" to="/shop">
              Khám phá {tenantConfig.labels.shopTitle} <ArrowRight size={16} />
            </Link>
          </div>
        )}
        {orders.map(o => (
          <Link className="fw-destination" key={o.id} to={`/orders/${o.id}`}>
            <Package />
            <div>
              <strong>{state.products[o.productId]?.title || 'Đơn hàng'}</strong>
              <p>{ORDER_LABELS[o.status]}</p>
            </div>
            <ArrowRight size={18} />
          </Link>
        ))}
      </>}
      {panel === 'membership' && <><p className="fw-muted">Theo dõi là miễn phí. Hội viên và quyền lợi được quản lý riêng cho từng nghệ sĩ; mọi giao dịch ở đây đều là mô phỏng.</p>{Object.values(state.worlds).map(w => <MembershipCard key={w.id} world={w} membership={Object.values(state.memberships).find(m => m.fanId === state.fanProfile.id && m.worldId === w.id)} isFollowed={state.followedWorldIds.includes(w.id)} onToggleFollow={() => dispatch({ type: 'TOGGLE_FOLLOW', worldId: w.id })} onUpgrade={() => dispatch({ type: 'UPGRADE_MEMBERSHIP', worldId: w.id })} />)}{Object.values(state.benefits).filter(b => b.fanId === state.fanProfile.id).map(b => <BenefitCard key={b.id} benefit={b} onClaim={benefitId => dispatch({ type: 'CLAIM_BENEFIT', benefitId })} />)}</>}
      {panel === 'support' && (
        <div className="fw-support-content">
          <p className="fw-muted">
            VieWorld luôn đồng hành cùng bạn. Bất kỳ thắc mắc nào về quyền lợi hội viên, đơn hàng kỷ niệm hoặc tài khoản đều được hỗ trợ chu đáo.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '18px 0' }}>
            {Object.values(state.supportCases).filter(c => c.fanId === state.fanProfile.id).length === 0 ? (
              <div className="fw-empty">
                <HelpCircle size={36} />
                <h3>Bạn chưa có hồ sơ hỗ trợ nào đang mở.</h3>
                <p>Nếu gặp vấn đề với đơn hàng lưu niệm hoặc quyền lợi hội viên, bạn có thể tạo yêu cầu đối soát trực tiếp từ trang chi tiết.</p>
                <Link className="fw-button" to="/me?panel=bag">
                  Xem đơn hàng của bạn <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              Object.values(state.supportCases)
                .filter(c => c.fanId === state.fanProfile.id)
                .map(c => (
                  <Link className="fw-destination" key={c.id} to={`/support/${c.id}`}>
                    <HelpCircle />
                    <div>
                      <strong>{c.subjectType === 'benefit' ? 'Hỗ trợ đối soát quyền lợi' : 'Hỗ trợ đơn hàng lưu niệm'} · #{c.id}</strong>
                      <p>Trạng thái: {c.status === 'open' ? 'Đang chờ xử lý' : c.status === 'resolved' ? 'Đã giải quyết' : c.status}</p>
                    </div>
                    <ArrowRight size={18} />
                  </Link>
                ))
            )}
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', marginTop: '14px' }}>
            <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
              💡 <strong>Cần hỗ trợ trực tiếp?</strong> Đội ngũ chăm sóc fandom phản hồi các yêu cầu đối soát trong vòng 24 giờ. Bạn luôn có thể kiểm tra trạng thái tại đây bất cứ lúc nào.
            </p>
          </div>
        </div>
      )}
    </WorldPanel>}

    {isRoom && (
      <FandomPolaroidPass
        isOpen={isPassOpen}
        onClose={handleClosePass}
        fanName={state.fanProfile.displayName}
        avatarPreset={state.fanProfile.avatarPreset}
        digitalLook={ownedDigitalLook(state)}
        accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
        mood={state.fanProfile.publicIdentity?.mood}
        badge={state.fanProfile.publicIdentity?.badge}
        companionDays={128}
        items={displayedItems(state)}
        fanId={state.fanProfile.id}
      />
    )}
  </div>;
}
