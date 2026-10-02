import { useEffect, useState } from 'react';
import { displayAssetUrl, displayRoomAssetUrl, type DisplayItem } from '../world/display';
import { roomDigitalVisual } from '../world/itemVisuals';
import {CatalogItemArt,hasCatalogItemArt} from './CatalogItemArt';
import { PreparedPropArt } from './PreparedPropArt';
import { ALBUM_FACE_CROPS } from '../world/propArtwork';

export function RoomPropVisual({ item }: { item: DisplayItem }) {
  const visual = roomDigitalVisual(item);
  // The old Artist C poster fixture borrowed a shirt cutout, not a room sprite.
  const borrowedShirt = item.id === 'product-c-poster-real' && item.roomAsset === '/images/world-v6/shirt-cutout.webp';
  const sprite = borrowedShirt ? undefined : displayRoomAssetUrl(item);
  const source = sprite || displayAssetUrl(item);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [source]);
  if (sprite && !failed) return <img src={sprite} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)}/>;
  if(hasCatalogItemArt(item.id))return <CatalogItemArt id={item.id} title={item.title} cutout/>;
  if (visual) return <PreparedPropArt key={visual.id} visual={visual}/>;
  const albumCrop = ALBUM_FACE_CROPS[item.image || ''];
  if (item.slot === 'disc') return <span className="vw-album-display" data-testid="album-display-stand">
    <span className="vw-album-cover">{source && !failed ? albumCrop ? <svg viewBox={albumCrop} width="100%" height="100%" aria-hidden="true"><image href={source} width="1000" height="1000" onError={()=>setFailed(true)}/></svg> : <img src={source} alt="" loading="lazy" decoding="async" onError={()=>setFailed(true)}/> : '✦'}</span>
    <span className="vw-album-support"/>
  </span>;
  return <span className={`vw-room-keepsake is-${item.slot || 'achievement'}`}>
    {source && !failed ? <img src={source} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)}/> : <span className="myspace-room-prop-symbol">✦</span>}
  </span>;
}
