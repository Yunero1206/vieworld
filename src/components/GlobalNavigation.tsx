import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, House, ShoppingBag, UserRound, type LucideIcon } from 'lucide-react';
import { getArtistNavPortrait } from '../world/artistVisuals';

export interface CurrentArtistNav {
  id: string;
  name: string;
}

type NavItem = { to: string; label: string; active: boolean; icon?: LucideIcon; artist?: CurrentArtistNav };

export function ArtistNavAvatar({ artist }: { artist: CurrentArtistNav }) {
  const portrait = getArtistNavPortrait(artist.id);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [artist.id, portrait?.src]);
  return <span className={`fw-artist-avatar${portrait?.crop === 'triptych' ? ' is-triptych' : ''}`} data-initial={artist.name.trim().charAt(0).toLocaleUpperCase('vi') || '♪'} aria-hidden="true">
    {portrait && !failed && <img src={portrait.src} alt="" onError={() => setFailed(true)} />}
  </span>;
}

function itemsFor(pathname: string, artist?: CurrentArtistNav, shopLabel = 'VieSHOP'): NavItem[] {
  return [
    { to: '/', label: 'Home', icon: House, active: pathname === '/' },
    { to: '/explore', label: 'Explore', icon: Compass, active: pathname === '/explore' || pathname === '/artists' },
    ...(artist ? [{ to: `/artist/${artist.id}`, label: artist.name, artist, active: pathname === `/artist/${artist.id}` || pathname.startsWith(`/artist/${artist.id}/`) }] : []),
    { to: '/me', label: 'My Space', icon: UserRound, active: pathname === '/me' || pathname.startsWith('/members/') },
    { to: '/shop', label: shopLabel, icon: ShoppingBag, active: pathname === '/shop' || pathname.endsWith('/shop') || pathname === '/cart' || pathname.startsWith('/checkout/') || pathname.startsWith('/orders/') },
  ];
}

export function GlobalNavigation({ pathname, artist, shopLabel }: { pathname: string; artist?: CurrentArtistNav; shopLabel?: string }) {
  const items = itemsFor(pathname, artist, shopLabel);
  return <>
    <nav className="fw-side-nav" aria-label="Điều hướng chính">
      {items.map(item => <Link key={item.to} to={item.to} aria-label={item.artist ? `World của ${item.label}` : item.label}
        aria-current={item.active ? 'page' : undefined} className={`${item.active ? 'selected' : ''}${item.artist ? ' fw-side-context' : ''}`}>
        {item.artist ? <ArtistNavAvatar artist={item.artist} /> : item.icon && <item.icon size={21} aria-hidden="true" />}
        <span className="fw-nav-label">{item.label}</span>
      </Link>)}
    </nav>
    <nav className="fw-mobile-bottom-nav" aria-label="Điều hướng di động">
      {items.map(item => <Link key={item.to} to={item.to} className={item.active ? 'active' : ''}
        aria-current={item.active ? 'page' : undefined} aria-label={item.artist ? `World của ${item.label}` : item.label}>
        {item.artist ? <ArtistNavAvatar artist={item.artist} /> : item.icon && <item.icon size={18} aria-hidden="true" />}
        <span>{item.label}</span>
      </Link>)}
    </nav>
  </>;
}
