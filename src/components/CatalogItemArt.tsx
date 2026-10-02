import { catalogVisual } from '../world/catalogVisuals';

export function hasCatalogItemArt(id: string) { return Boolean(catalogVisual(id)); }

/** One product identity across Shop, Artist rails, Collection and Room.
 * Studio backing belongs to UI; transparent merchandise remains usable in the room.
 * This does not grant ownership or substitute a catalogue photo for an avatar fit. */
export function CatalogItemArt({ id, title, cutout = false }: { id: string; title: string; cutout?: boolean }) {
  const visual = catalogVisual(id);
  if (!visual) return null;
  return <span className={`presence-catalog-art${cutout ? ' is-cutout' : ' is-studio'}`} data-catalog-art={visual.kind}>
    <img src={visual.src} alt={`${title} · Hình minh họa AI`} width="800" height="800" loading="lazy" decoding="async" />
  </span>;
}
