import { lazy, useEffect, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { useApp } from '../context/AppContext';
import { isDemoSignedIn } from '../world/account';
import { ownedDigitalLook } from '../world/merchCatalog';
import { preferredPlazaArtist, selectPlazaState, type PlazaEvent } from '../world/plazaState';

const FanWorldView = lazy(() => import('./FanWorldView').then(module => ({ default: module.FanWorldView })));

function PlaceLink({ place, to, title }: {
  place: 'explore' | 'myspace' | 'artist' | 'shop';
  to: string;
  title: string;
}) {
  return <Link className={`vw-plaza-place vw-plaza-place--${place}`} to={to} aria-label={title}>
    <span>{title}</span>
  </Link>;
}

function StageGathering({ event, names }: { event: PlazaEvent; names: string[] }) {
  return <>
    <Link className="vw-plaza-stage-sign" to={event.to} aria-label={`${event.statusLabel}: ${event.title}`}>
      <small><i aria-hidden="true" />{event.statusLabel}</small>
      <strong>{event.title}</strong>
    </Link>
    {names.length > 0 && <div className="vw-plaza-crowd" aria-label={`${names.join(', ')} đang tụ họp ở sân khấu`}>
      {names.map((name, index) => <span key={name} style={{ '--crowd-index': index } as CSSProperties} title={name}>
        {name.trim().charAt(0).toLocaleUpperCase('vi-VN')}
      </span>)}
    </div>}
  </>;
}

export function WorldPlazaView() {
  const { state } = useApp();
  const [params] = useSearchParams();
  const signedIn = isDemoSignedIn(state);
  const artist = preferredPlazaArtist(state);
  const plaza = selectPlazaState(state);
  const activeEvent = plaza.primary?.phase === 'active' ? plaza.primary : undefined;
  const crowdNames = activeEvent
    ? Array.from(new Set((state.hallMessages?.[activeEvent.worldId] ?? [])
      .filter(message => message.sessionId === activeEvent.id
        && message.explorePreviewConsent === true
        && message.explorePreviewStatus === 'approved')
      .map(message => message.authorName))).slice(0, 5)
    : [];
  const fanFirstName = state.fanProfile.displayName.trim().split(/\s+/)[0] || 'bạn';

  useEffect(() => { document.title = 'Quảng trường · VieWorld'; }, []);

  // Keep old, shared utility links working while Home itself becomes the Plaza.
  if (params.get('panel') || params.get('zone') || params.get('drawer')) return <FanWorldView />;

  return <main className="vw-plaza-home">
    <section className="vw-plaza-scene" aria-label="Các nơi trong quảng trường VieWorld">
      <h1 id="vw-plaza-scene-title" className="vw-visually-hidden">Quảng trường VieWorld</h1>
      <div className="vw-plaza-visual" role="group" aria-label="Quảng trường VieWorld với Explore, My Space, Artist World, VieSHOP và sân khấu sự kiện">
        <div className={`vw-plaza-stage-ambience ${activeEvent ? 'is-live' : ''}`} aria-hidden="true">
          <i /><i /><i />
        </div>

        <nav className="vw-plaza-places" aria-label="Đi đến một nơi trong VieWorld">
          <PlaceLink place="explore" to="/explore" title="Explore" />
          <PlaceLink place="myspace" to="/me" title="My Space" />
          <PlaceLink place="artist" to={artist ? `/artist/${artist.id}` : '/explore'} title="Artist World" />
          <PlaceLink place="shop" to="/shop" title="VieSHOP" />
        </nav>

        {activeEvent && <StageGathering event={activeEvent} names={crowdNames} />}

        <div className={`vw-plaza-presence ${signedIn ? 'is-fan' : 'is-guest'}`}>
          {signedIn ? <Link to="/me" className="vw-plaza-avatar" aria-label={`Mở My Space của ${state.fanProfile.displayName}`}>
            <AvatarRenderer
              role="fan"
              appearance={state.fanProfile.avatarPreset}
              accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
              digitalLook={ownedDigitalLook(state)}
              size="lg"
              displayName={state.fanProfile.displayName}
              reducedMotion
            />
            <span>{fanFirstName}</span>
          </Link> : <Link to="/me" className="vw-plaza-guest" aria-label="Đăng nhập để tạo góc riêng">
            <UserRound size={22} aria-hidden="true" />
            <span>Khách</span>
          </Link>}
        </div>
      </div>
    </section>

    <nav className="vw-plaza-mobile-places" aria-label="Các nơi trong VieWorld">
      <PlaceLink place="explore" to="/explore" title="Explore" />
      <PlaceLink place="artist" to={artist ? `/artist/${artist.id}` : '/explore'} title="Artist World" />
      <PlaceLink place="myspace" to="/me" title="My Space" />
      <PlaceLink place="shop" to="/shop" title="VieSHOP" />
    </nav>
  </main>;
}
