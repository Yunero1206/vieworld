import { useEffect, useId, useState, type CSSProperties } from 'react';
import type { DigitalVisual } from '../world/itemVisuals';
import { PROP_ARTWORK } from '../world/propArtwork';
import { DigitalObjectArt } from './DigitalObjectArt';

export function PreparedPropArt({ visual }: { visual: DigitalVisual }) {
  const id = useId().replace(/:/g,'');
  const art = PROP_ARTWORK[visual.id];
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [visual.id]);
  if (!art || failed) return <DigitalObjectArt visual={visual}/>;
  const [x,y,width,height] = art.viewBox.split(' ').map(Number);
  const hanger = art.hanger ? height*.11 : 0;
  const center = x+width/2;
  const sourceSize = visual.id === 'star-shirt' ? 600 : 1000;
  return <svg className={`vw-prepared-prop ${visual.kind === 'lightstick' ? 'is-light-art' : ''}`} style={{'--prop-glow': visual.accent} as CSSProperties}
    width="100%" height="100%" viewBox={`${x} ${y-hanger} ${width} ${height+hanger}`} aria-hidden="true" data-visual-id={visual.id} data-source-art={art.source}>
    <defs>
      {art.silhouette && <clipPath id={`${id}-edge`}><path d={art.silhouette}/></clipPath>}
      {art.tint && <filter id={`${id}-tint`}><feColorMatrix type="saturate" values="0"/><feColorMatrix type="matrix" values=".65 0 0 0 .18 0 .53 0 0 .12 0 0 .9 0 .09 0 0 0 1 0"/></filter>}
    </defs>
    {art.hanger && <path d={`M${center} ${y-hanger+3}q${width*.045} ${-hanger*.12} ${width*.045} ${hanger*.18}q0 ${hanger*.18} ${-width*.045} ${hanger*.22}v${hanger*.3}l${-width*.24} ${hanger*.4}q${width*.24} ${hanger*.13} ${width*.48} 0l${-width*.24} ${-hanger*.4}`} fill="none" stroke="#8b6540" strokeWidth={width*.012} strokeLinecap="round" strokeLinejoin="round"/>}
    <image href={art.source} width={sourceSize} height={sourceSize} clipPath={art.silhouette ? `url(#${id}-edge)` : undefined} filter={art.tint ? `url(#${id}-tint)` : undefined} onError={()=>setFailed(true)}/>
  </svg>;
}
