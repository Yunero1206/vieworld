import { useEffect, useRef, useState } from 'react';
import { Sparkles, Star } from 'lucide-react';
import { ARTIST_FANDOM_REGISTRY } from '../data/artistChatConfig';
/** Local reactions, not a fabricated audience total. No interval runs when idle. */
export function LiveCheer({ artistId }: { artistId: string }) {
  const [burst, setBurst] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const color = ARTIST_FANDOM_REGISTRY[artistId]?.signatureLightstick.color || '#b9d7be';
  return <div className="vw-live-cheer" style={{ '--cheer-color': color } as React.CSSProperties}>
    <button type="button" onClick={() => { setBurst(value => value + 1); clearTimeout(timer.current); timer.current = setTimeout(() => setBurst(0), 1300); }} aria-label="Vẫy lightstick cổ vũ"><Sparkles size={17}/>Cổ vũ</button>
    {burst > 0 && <div className="vw-live-cheer-particles" key={burst} aria-hidden="true">{[0,1,2,3,4].map(index => <Star key={index} size={16} style={{ '--particle': index } as React.CSSProperties}/>)}</div>}
  </div>;
}
