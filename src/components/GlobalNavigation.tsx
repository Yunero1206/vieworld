import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getArtistNavPortrait } from '../world/artistVisuals';
import { VieWorldLogo } from './VieWorldLogo';
import { VieWorldIcon, type VieWorldIconName } from './VieWorldIcon';

export interface CurrentArtistNav {
  id: string;
  name: string;
}

type NavItem = { to: string; label: string; active: boolean; icon?: VieWorldIconName; artist?: CurrentArtistNav };

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
    { to: '/', label: 'Home', active: pathname === '/' },
    { to: '/explore', label: 'Explore', icon: 'explore', active: pathname === '/explore' || pathname === '/artists' },
    ...(artist ? [{ to: `/artist/${artist.id}`, label: artist.name, artist, icon: 'artist' as const, active: pathname === `/artist/${artist.id}` || pathname.startsWith(`/artist/${artist.id}/`) }] : [{to:'/explore?scope=following',label:'Artist',icon:'artist' as const,active:false}]),
    { to: '/me', label: 'My Space', icon: 'room', active: pathname === '/me' || pathname.startsWith('/members/') },
    { to: '/shop', label: shopLabel, icon: 'bag', active: pathname === '/shop' || pathname.endsWith('/shop') || pathname === '/cart' || pathname.startsWith('/checkout/') || pathname.startsWith('/orders/') },
  ];
}

export function GlobalNavigation({ pathname, artist, shopLabel, utilities, accountControl }: { pathname: string; artist?: CurrentArtistNav; shopLabel?: string; utilities?: ReactNode; accountControl?: ReactNode }) {
  const items = itemsFor(pathname, artist, shopLabel);
  const mobileItems: NavItem[] = [items[0], items[1], items[2], items[4]];
  return <>
    <div className="fw-navigation-rail">
    <nav className="fw-side-nav" aria-label="Điều hướng chính">
      {items.map(item => <Link key={item.to} to={item.to} aria-label={item.artist ? `World của ${item.label}` : item.label}
        aria-current={item.active ? 'page' : undefined} className={`${item.active ? 'selected' : ''}${item.to === '/' ? ' presence-rail-brand' : ''}`}>
        <span className="fw-nav-icon">{item.icon ? <VieWorldIcon name={item.icon}/> : <VieWorldLogo size={34}/>}</span>
        <span className="fw-nav-label" aria-hidden="true">{item.artist ? `${item.artist.name} World` : item.to === '/' ? 'VieWorld' : item.label === 'Artist' ? 'Artist World' : item.label}</span>
      </Link>)}
    </nav>
    {utilities}
    </div>
    <nav className="fw-mobile-bottom-nav" aria-label="Điều hướng di động">
      {mobileItems.map(item => <Link key={item.to} to={item.to} className={item.active ? 'active' : ''}
        aria-current={item.active ? 'page' : undefined} aria-label={item.artist ? `World của ${item.label}` : item.label}>
        {item.icon ? <VieWorldIcon name={item.icon} size={24}/> : <VieWorldLogo size={32}/>}
      </Link>)}
      {accountControl}
    </nav>
  </>;
}
