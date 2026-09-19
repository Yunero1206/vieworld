import { lazy, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { ownedDigitalLook } from '../world/merchCatalog';

const FanWorldView = lazy(() => import('./FanWorldView').then(m => ({ default: m.FanWorldView })));

interface PlazaDestination {
  id: 'artist' | 'myspace' | 'moments' | 'shop';
  name: string;
  sub: string;
  to: string;
  anchor: {
    x: number;
    y: number;
    rotate?: number;
  };
}

interface StandeeEvent {
  kind: 'live' | 'upcoming' | 'drop';
  eyebrow: string;
  title: string;
  actionLabel: string;
  to: string;
}

// Derive the single active world-level event (Priority: Live now > Starting soon > Merch drop)
function resolveWorldEvent(
  state: ReturnType<typeof useApp>['state'],
  override?: string | null
): StandeeEvent | null {
  if (override === 'none') return null;

  // 1. Priority 1: LIVE NOW (running or open broadcast session)
  const liveSessions = Object.values(state.sessions || {}).filter(
    s => s.status === 'running' || s.status === 'open'
  );
  if (override === 'live' || (override !== 'upcoming' && override !== 'drop' && liveSessions.length > 0)) {
    const s = liveSessions[0];
    const artist = s?.worldId ? state.worlds[s.worldId] : undefined;
    const artistName = artist?.name || 'Artist A';
    return {
      kind: 'live',
      eyebrow: 'LIVE NOW',
      title: `${artistName} đang trò chuyện trực tiếp`,
      actionLabel: 'Vào Explore ↗',
      to: '/artists',
    };
  }

  // 2. Priority 2: STARTING SOON / UPCOMING (scheduled session)
  const scheduledSessions = Object.values(state.sessions || {}).filter(
    s => s.status === 'scheduled'
  );
  if (override === 'upcoming' || (override !== 'drop' && scheduledSessions.length > 0)) {
    const s = scheduledSessions[0];
    const titleClean = s?.title ? s.title.replace(/^[^:]+:\s*/, '') : 'KAI Live Beat Lab · 20:00';
    return {
      kind: 'upcoming',
      eyebrow: 'SẮP BẮT ĐẦU',
      title: titleClean,
      actionLabel: 'Xem lịch hẹn ↗',
      to: '/moments',
    };
  }

  // 3. Priority 3: NEW DROP (merch release)
  if (override === 'drop' || !override) {
    return {
      kind: 'drop',
      eyebrow: 'NEW DROP',
      title: 'Pulse Crew vừa mở bộ sưu tập mới',
      actionLabel: 'Ghé VieSHOP ↗',
      to: '/shop',
    };
  }

  return null;
}

export function WorldPlazaView() {
  const { state } = useApp();
  const [params] = useSearchParams();
  const [failed, setFailed] = useState(false);

  // Keep historical panel deep-links working without making a room the entry point.
  if (params.get('panel') || params.get('zone') || params.get('drawer')) return <FanWorldView />;

  const lastWorldId = state.fanProfile?.worldJourney?.lastWorldId;
  const lastArtistWorld = (lastWorldId ? state.worlds[lastWorldId] : undefined) || Object.values(state.worlds || {}).find(w => w.type === 'artist');
  const lastArtistName = lastArtistWorld?.name || 'KAI';

  // 4 Core Destinations: exactly matching the physical cream signboards of the restored base diorama
  const destinations: PlazaDestination[] = [
    {
      id: 'artist',
      name: 'Explore',
      sub: 'Khám phá nghệ sĩ & các world',
      to: '/artists',
      anchor: { x: 25.0, y: 11.0, rotate: -7 },
    },
    {
      id: 'myspace',
      name: 'My Space',
      sub: 'Một góc rất riêng mình',
      to: '/me',
      anchor: { x: 74.5, y: 13.8, rotate: 6 },
    },
    {
      id: 'moments',
      name: 'Moments',
      sub: lastArtistName ? `Trở lại world của ${lastArtistName}` : 'Cuộc hẹn & cộng đồng',
      to: '/moments',
      anchor: { x: 19.2, y: 51.8, rotate: -7 },
    },
    {
      id: 'shop',
      name: 'VieSHOP',
      sub: 'Mua khi mình muốn',
      to: '/shop',
      anchor: { x: 80.8, y: 52.6, rotate: 6 },
    },
  ];

  // Derive the single active world announcement for the shared standee
  const standeeEvent = resolveWorldEvent(state, params.get('event'));

  return (
    <div className="vw-plaza-page">
      <header className="vw-plaza-heading">
        <div>
          <p className="fw-eyebrow">VIE WORLD · NHÀ CHUNG CỦA FAN</p>
          <h1>Hôm nay, mình ghé đâu?</h1>
          <p>Gặp người mình mến. Giữ điều mình yêu. Trở về một góc của riêng mình.</p>
        </div>
      </header>

      {/* Visual Metaphor 4-Building Plaza Scene */}
      <div className="vw-plaza-scroll" tabIndex={0} aria-label="Quảng trường VieWorld với bốn toà nhà">
        <div className={`vw-plaza-scene ${failed ? 'vw-no-art' : ''}`}>
          {/* Layer 1: Base illustration artwork with blank physical signboards */}
          {!failed && (
            <img
              src="/images/world-v8/plaza.webp"
              width="1376"
              height="768"
              fetchPriority="high"
              alt="Quảng trường bốn toà nhà VieWorld: Explore, Moments, My Space, VieSHOP"
              className="vw-background plaza-artwork"
              onError={() => setFailed(true)}
            />
          )}

          {/* Layer 2: Clean Architectural Destination Doors (No attached badges) */}
          <nav aria-label="Các nơi của VieWorld">
            {destinations.map(p => (
              <Link
                key={p.id}
                className={`vw-place-door vw-door-${p.id}`}
                to={p.to}
                style={{
                  left: `${p.anchor.x}%`,
                  top: `${p.anchor.y}%`,
                }}
                title={p.sub}
                aria-label={
                  p.id === 'artist'
                    ? `Explore · Artist Home: ${p.sub}`
                    : `${p.name}: ${p.sub}`
                }
              >
                {/* Physical Signboard Label: Engraved cleanly into the architectural cream signboard */}
                <span
                  className="vw-door-board"
                  style={{
                    transform: `rotate(${p.anchor.rotate || 0}deg)`,
                  }}
                >
                  <strong>
                    {p.id === 'artist' ? (
                      <>
                        Explore<span className="sr-only"> · Artist Home</span>
                      </>
                    ) : (
                      p.name
                    )}
                    <ArrowUpRight size={13} className="vw-door-arrow" aria-hidden="true" />
                  </strong>
                </span>
              </Link>
            ))}
          </nav>

          {/* Layer 3: Shared World Event Standee (Freestanding announcement board in central courtyard) */}
          {standeeEvent && (
            <aside className="vw-plaza-standee-container" aria-label="Bảng thông báo sự kiện quảng trường">
              <Link
                to={standeeEvent.to}
                className={`vw-plaza-standee kind-${standeeEvent.kind}`}
                aria-label={`${standeeEvent.eyebrow}: ${standeeEvent.title}. ${standeeEvent.actionLabel}`}
                title={`${standeeEvent.eyebrow}: ${standeeEvent.title}`}
              >
                <div className="vw-standee-board">
                  <div className="vw-standee-pin" aria-hidden="true" />
                  <span className={`vw-standee-tag kind-${standeeEvent.kind}`}>
                    {standeeEvent.kind === 'live' && <span className="vw-standee-dot" aria-hidden="true" />}
                    {standeeEvent.eyebrow}
                  </span>
                  <strong className="vw-standee-title">{standeeEvent.title}</strong>
                  <span className="vw-standee-cta">
                    {standeeEvent.actionLabel}
                  </span>
                </div>
                <div className="vw-standee-legs" aria-hidden="true">
                  <div className="vw-standee-leg-left" />
                  <div className="vw-standee-leg-right" />
                  <div className="vw-standee-shadow" />
                </div>
              </Link>
            </aside>
          )}

          {/* Layer 4: Center Fan Character Identity Anchor (Clicking returns to My Space) */}
          <Link
            className="vw-plaza-fan"
            to="/me"
            aria-label={`Về My Space của ${state.fanProfile.displayName}`}
            title={`Về phòng của ${state.fanProfile.displayName}`}
          >
            <AvatarRenderer
              role="fan"
              size="lg"
              appearance={state.fanProfile.avatarPreset}
              displayName={state.fanProfile.displayName}
              digitalLook={ownedDigitalLook(state)}
              accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
            />
            <strong className="vw-plaza-fan-name">{state.fanProfile.displayName}</strong>
            <span className="vw-plaza-fan-pill">Về phòng của bạn ↗</span>
          </Link>
        </div>
      </div>

      <p className="vw-plaza-hint">
        <Compass size={14} />
        Chạm vào toà nhà hoặc bảng tên để bước vào không gian bạn muốn ghé.
      </p>

      {/* Mobile World Event Announcement Banner */}
      {standeeEvent && (
        <Link
          to={standeeEvent.to}
          className={`vw-mobile-standee-banner kind-${standeeEvent.kind}`}
          aria-label={`${standeeEvent.eyebrow}: ${standeeEvent.title}`}
        >
          <span className={`vw-standee-tag kind-${standeeEvent.kind}`}>
            {standeeEvent.kind === 'live' && <span className="vw-standee-dot" aria-hidden="true" />}
            {standeeEvent.eyebrow}
          </span>
          <div className="vw-mobile-standee-body">
            <strong>{standeeEvent.title}</strong>
            <span className="vw-mobile-standee-cta">{standeeEvent.actionLabel}</span>
          </div>
        </Link>
      )}

      {/* Mobile 2x2 Navigation Cards for Fast, Comfortable Tap Targets */}
      <nav className="vw-mobile-doors" aria-label="Đi nhanh trong VieWorld">
        {destinations.map(p => (
          <Link key={p.id} to={p.to} className="vw-mobile-door-card">
            <div className="vw-mobile-door-header">
              <span className="vw-mobile-door-title">{p.id === 'artist' ? 'Explore' : p.name}</span>
              <ArrowUpRight size={14} className="vw-mobile-door-arrow" aria-hidden="true" />
            </div>
            <small className="vw-mobile-door-sub">{p.sub}</small>
          </Link>
        ))}
      </nav>

      <footer className="vw-plaza-footer">
        <span>Khám phá → gặp gỡ → giữ kỷ niệm → trở về nhà.</span>
        <Link to="/me?panel=support">Luôn có chỗ để hỏi giúp đỡ ↗</Link>
      </footer>
    </div>
  );
}
