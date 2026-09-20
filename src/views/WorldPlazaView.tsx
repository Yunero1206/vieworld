import { lazy, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { ownedDigitalLook } from '../world/merchCatalog';

const FanWorldView = lazy(() => import('./FanWorldView').then(m => ({ default: m.FanWorldView })));


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
      eyebrow: 'LIVE',
      title: artistName,
      actionLabel: 'Vào ngay →',
      to: s ? `/moments?artist=${encodeURIComponent(s.worldId)}&tab=live&session=${encodeURIComponent(s.id)}` : '/moments?tab=live',
    };
  }

  // 2. Priority 2: STARTING SOON / UPCOMING (scheduled session)
  const scheduledSessions = Object.values(state.sessions || {}).filter(
    s => s.status === 'scheduled'
  );
  if (override === 'upcoming' || (override !== 'drop' && scheduledSessions.length > 0)) {
    const s = scheduledSessions[0];
    const artist = s?.worldId ? state.worlds[s.worldId] : undefined;
    return {
      kind: 'upcoming',
      eyebrow: 'SẮP TỚI',
      title: artist?.name || 'KAI Live',
      actionLabel: 'Xem lịch →',
      to: s ? `/moments?artist=${encodeURIComponent(s.worldId)}&tab=live&session=${encodeURIComponent(s.id)}` : '/moments?tab=live',
    };
  }

  // 3. Priority 3: NEW DROP (merch release)
  if (override === 'drop') {
    return {
      kind: 'drop',
      eyebrow: 'MERCH MỚI',
      title: 'Pulse Crew',
      actionLabel: 'Xem ngay →',
      to: '/shop',
    };
  }

  return null;
}

export const PLAZA_LAYOUT = {
  scene: {
    nativeWidth: 1672,
    nativeHeight: 941,
    aspectRatio: '1672 / 941',
  },
  destinations: [
    {
      id: 'artist' as const,
      name: 'Explore',
      sub: 'Khám phá nghệ sĩ & các world',
      to: '/artists',
      x: 25.6,
      y: 10.3,
      width: 10.1,
      height: 8.0,
    },
    {
      id: 'myspace' as const,
      name: 'My Space',
      sub: 'Một góc rất riêng mình',
      to: '/me',
      x: 74.0,
      y: 12.0,
      width: 10.6,
      height: 8.0,
    },
    {
      id: 'moments' as const,
      name: 'Moments',
      sub: 'Cuộc hẹn & cộng đồng',
      to: '/moments',
      x: 19.3,
      y: 51.9,
      width: 13.5,
      height: 8.1,
    },
    {
      id: 'shop' as const,
      name: 'VieSHOP',
      sub: 'Mua khi mình muốn',
      to: '/shop',
      x: 80.4,
      y: 51.8,
      width: 13.4,
      height: 8.0,
    },
  ],
  standee: {
    // A small ambient world signal, anchored off the avatar's focal axis.
    x: 61.7,
    y: 36.5,
    width: 8.7,
    aspectRatio: '682 / 1024',
  },
  fan: {
    x: 45.0,
    y: 49.0,
  },
  slogan: {
    left: 2.5,
    bottom: 2.0,
  },
} as const;

export function WorldPlazaView() {
  const { state } = useApp();
  const [params] = useSearchParams();
  const [failed, setFailed] = useState(false);

  // Keep historical panel deep-links working without making a room the entry point.
  if (params.get('panel') || params.get('zone') || params.get('drawer')) return <FanWorldView />;

  const lastWorldId = state.fanProfile?.worldJourney?.lastWorldId;
  const lastArtistWorld = (lastWorldId ? state.worlds[lastWorldId] : undefined) || Object.values(state.worlds || {}).find(w => w.type === 'artist');
  const lastArtistName = lastArtistWorld?.name || 'KAI';

  // Destinations with dynamic artist subtitle
  const destinations = PLAZA_LAYOUT.destinations.map(d => ({
    ...d,
    sub: d.id === 'moments' && lastArtistName ? `Trở lại world của ${lastArtistName}` : d.sub,
  }));

  // Derive the single active world announcement for the shared standee
  const standeeEvent = resolveWorldEvent(state, params.get('event'));

  return (
    <div className="vw-plaza-page">
      {/* Visual Metaphor 4-Building Plaza Scene (Placed immediately under top nav) */}
      <div className="vw-plaza-scroll" tabIndex={0} aria-label="Quảng trường VieWorld với bốn toà nhà">
        <div className={`vw-plaza-scene ${failed ? 'vw-no-art' : ''}`}>
          {/* Layer 1: Base illustration artwork with blank physical signboards */}
          {!failed && (
            <img
              src="/images/world-v8/plaza.webp"
              width="1672"
              height="941"
              fetchPriority="high"
              alt="Quảng trường bốn toà nhà VieWorld: Explore, Moments, My Space, VieSHOP"
              className="vw-background plaza-artwork"
              onError={() => setFailed(true)}
            />
          )}

          {/* Layer 2: Clean Architectural Destination Doors positioned in the 4 signboard frames */}
          <nav aria-label="Các nơi của VieWorld">
            {destinations.map(p => (
              <Link
                key={p.id}
                className={`vw-place-door vw-door-${p.id}`}
                to={p.to}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.width}%`,
                  height: `${p.height}%`,
                }}
                title={p.sub}
                aria-label={
                  p.id === 'artist'
                    ? `Explore · Artist Home: ${p.sub}`
                    : `${p.name}: ${p.sub}`
                }
              >
                {/* Physical Signboard Label: Centered in the architectural cream signboard */}
                <span className="vw-door-board">
                  <strong>
                    {p.id === 'artist' ? (
                      <>
                        Explore<span className="sr-only"> · Artist Home</span>
                      </>
                    ) : (
                      p.name
                    )}
                  </strong>
                </span>
              </Link>
            ))}
          </nav>

          {/* Layer 3: One ambient world signal. Notification history stays in Inbox. */}
          {standeeEvent && (
            <aside
              className="vw-plaza-standee-container"
              style={{
                left: `${PLAZA_LAYOUT.standee.x}%`,
                top: `${PLAZA_LAYOUT.standee.y}%`,
                width: `${PLAZA_LAYOUT.standee.width}%`,
              }}
              aria-label="Sự kiện đang diễn ra trong VieWorld"
              aria-live="polite"
            >
              <Link
                to={standeeEvent.to}
                className={`vw-plaza-standee kind-${standeeEvent.kind}`}
                aria-label={`${standeeEvent.eyebrow}: ${standeeEvent.title}. ${standeeEvent.actionLabel}`}
                title={`${standeeEvent.eyebrow}: ${standeeEvent.title}`}
              >
                <img
                  src="/images/world-v8/standee-blank.png"
                  alt=""
                  aria-hidden="true"
                  className="vw-standee-artwork"
                  draggable={false}
                />
                <div className="vw-standee-content-area">
                  <span className="vw-standee-status">{standeeEvent.eyebrow}</span>
                  <strong className="vw-standee-title">{standeeEvent.title}</strong>
                </div>
              </Link>
            </aside>
          )}

          {/* Layer 4: Foreground Fan Character Identity Anchor (Clicking returns to My Space) */}
          <Link
            className="vw-plaza-fan"
            to="/me"
            style={{
              left: `${PLAZA_LAYOUT.fan.x}%`,
              top: `${PLAZA_LAYOUT.fan.y}%`,
            }}
            aria-label={`Về My Space của ${state.fanProfile.displayName}`}
            title={`Về phòng của ${state.fanProfile.displayName}`}
          >
            {/* Interactive Thought / Speech Bubble appearing on hover */}
            <div className="vw-plaza-fan-bubble" role="tooltip">
              <h1 className="vw-fan-bubble-text">Hôm nay, mình ghé đâu?</h1>
              <span className="vw-fan-bubble-tail" aria-hidden="true" />
            </div>

            <AvatarRenderer
              role="fan"
              size="lg"
              appearance={state.fanProfile.avatarPreset}
              displayName={state.fanProfile.displayName}
              digitalLook={ownedDigitalLook(state)}
              accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
            />
            <strong className="vw-plaza-fan-name">{state.fanProfile.displayName}</strong>
          </Link>

          {/* Layer 5: Slogan placed at bottom-left corner of the plaza */}
          <div
            className="vw-plaza-slogan-corner"
            style={{
              left: `${PLAZA_LAYOUT.slogan.left}%`,
              bottom: `${PLAZA_LAYOUT.slogan.bottom}%`,
            }}
            aria-label="Phương châm VieWorld"
          >
            <p>Gặp người mình mến · Giữ điều mình yêu · Trở về một góc của riêng mình.</p>
          </div>
        </div>
      </div>

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
    </div>
  );
}
