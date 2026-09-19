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
  status?: {
    text: string;
    kind: 'live' | 'new' | 'recent' | 'notification';
  } | null;
}

export function WorldPlazaView() {
  const { state } = useApp();
  const [params] = useSearchParams();
  const [failed, setFailed] = useState(false);

  // Keep historical panel deep-links working without making a room the entry point.
  if (params.get('panel') || params.get('zone') || params.get('drawer')) return <FanWorldView />;

  // 1. Explore ambient status: live session or new world
  const liveSessions = Object.values(state.sessions || {}).filter(
    s => s.status === 'running' || s.status === 'open'
  );
  const exploreStatus = liveSessions.length > 0
    ? { text: `${liveSessions.length} artist đang Live`, kind: 'live' as const }
    : { text: 'Khám phá thế giới', kind: 'new' as const };

  // 2. Moments ambient status & contextual re-entry
  const lastWorldId = state.fanProfile?.worldJourney?.lastWorldId;
  const lastArtistWorld = (lastWorldId ? state.worlds[lastWorldId] : undefined) || Object.values(state.worlds || {}).find(w => w.type === 'artist');
  const lastArtistName = lastArtistWorld?.name || 'KAI';
  const momentsStatus = lastArtistName
    ? { text: `${lastArtistName} · gần đây`, kind: 'recent' as const }
    : null;

  // 3. My Space ambient status: unread notes or new item
  const mySpaceStatus = { text: '2 giấy nhớ mới', kind: 'notification' as const };

  // 4. VieSHOP ambient status: new drop
  const shopStatus = { text: 'New drop', kind: 'new' as const };

  const destinations: PlazaDestination[] = [
    {
      id: 'artist',
      name: 'Explore',
      sub: 'Khám phá nghệ sĩ & các world',
      to: '/artists',
      anchor: { x: 25.1, y: 13.0, rotate: 0 },
      status: exploreStatus,
    },
    {
      id: 'myspace',
      name: 'My Space',
      sub: 'Một góc rất riêng mình',
      to: '/me',
      anchor: { x: 75.0, y: 15.9, rotate: 0 },
      status: mySpaceStatus,
    },
    {
      id: 'moments',
      name: 'Moments',
      sub: lastArtistName ? `Trở lại world của ${lastArtistName}` : 'Cuộc hẹn & cộng đồng',
      to: '/moments',
      anchor: { x: 19.0, y: 58.9, rotate: 0 },
      status: momentsStatus,
    },
    {
      id: 'shop',
      name: 'VieSHOP',
      sub: 'Mua khi mình muốn',
      to: '/shop',
      anchor: { x: 81.0, y: 58.6, rotate: 0 },
      status: shopStatus,
    },
  ];

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

          {/* Layer 2, 3, 4: Navigation hit areas, DOM destination labels & single ambient status */}
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
                    ? `Explore · Artist Home: ${p.sub}${p.status ? ` (${p.status.text})` : ''}`
                    : `${p.name}: ${p.sub}${p.status ? ` (${p.status.text})` : ''}`
                }
              >
                {/* Layer 3: Physical Signboard Label (Engraved into the physical signboard) */}
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
                    <ArrowUpRight size={13} className="vw-door-arrow" />
                  </strong>
                </span>

                {/* Layer 4: Ambient Notification Chip (Positioned UNDER the signboard, no dot) */}
                {p.status && (
                  <span className={`vw-door-signal kind-${p.status.kind}`}>
                    {p.status.text}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Center: Fan Character Identity Anchor (Clicking returns to My Space) */}
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

      {/* Mobile 2x2 Navigation Cards for Fast, Comfortable Tap Targets */}
      <nav className="vw-mobile-doors" aria-label="Đi nhanh trong VieWorld">
        {destinations.map(p => (
          <Link key={p.id} to={p.to} className="vw-mobile-door-card">
            <div className="vw-mobile-door-header">
              <span className="vw-mobile-door-title">{p.id === 'artist' ? 'Explore' : p.name}</span>
              {p.status && (
                <span className={`vw-door-signal kind-${p.status.kind}`}>
                  {p.status.text}
                </span>
              )}
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
