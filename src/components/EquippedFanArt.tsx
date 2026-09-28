import { useId } from 'react';
import { digitalVisual } from '../world/itemVisuals';
import { ItemMotif } from './DigitalObjectArt';
import { PreparedPropArt } from './PreparedPropArt';
import { merchImageUrl } from '../world/merchImages';

type Appearance = 'original' | 'wave' | 'bob' | 'curl';
type Look = { shirt?: string; hat?: string; lightstick?: string };
// Measured against the existing four character files, not against the CSS preview box.
export const FAN_ART_RIGS = {
  original: { width: 450, height: 550, x: 107, y: 249, sx: 1.18, sy: 1.07, handX: 326, handY: 406, hatX: 83, hatY: 34, hatScale: 1.72 },
  wave: { width: 400, height: 560, x: 78, y: 240, sx: 1.24, sy: 1.12, handX: 300, handY: 407, hatX: 66, hatY: 31, hatScale: 1.65 },
  bob: { width: 400, height: 560, x: 78, y: 234, sx: 1.24, sy: 1.12, handX: 300, handY: 401, hatX: 66, hatY: 30, hatScale: 1.65 },
  curl: { width: 400, height: 560, x: 81, y: 240, sx: 1.24, sy: 1.12, handX: 307, handY: 407, hatX: 69, hatY: 34, hatScale: 1.65 },
};
const hoodieOutline = 'M43 5Q50 -5 75 8L99 20L125 7Q151 -7 159 5L164 27L181 52L198 90Q203 111 194 120L192 141L164 146L151 122L155 152Q100 160 45 152L43 125L34 146L7 139L5 123Q-5 110 4 94L22 64L36 36Z';

export function EquippedFanArt({ source, appearance, look, onError }: { source: string; appearance: Appearance; look: Look; onError: () => void }) {
  const id = useId().replace(/:/g, '');
  const rig = FAN_ART_RIGS[appearance];
  const shirt = digitalVisual(look.shirt);
  const hat = digitalVisual(look.hat);
  const light = digitalVisual(look.lightstick);
  const transform = `translate(${rig.x} ${rig.y}) scale(${rig.sx} ${rig.sy})`;
  const tint = shirt ? [shirt.color.slice(1,3),shirt.color.slice(3,5),shirt.color.slice(5,7)].map(value => parseInt(value,16)/255) : [1,1,1];
  return <svg className="vx-character-art vw-equipped-fan" viewBox={`0 0 ${rig.width} ${rig.height}`} aria-hidden="true" data-rig={appearance}>
    <defs>
      <mask id={`${id}-base`} maskUnits="userSpaceOnUse" x="0" y="0" width={rig.width} height={rig.height}><rect width={rig.width} height={rig.height} fill="white"/>{shirt && <path transform={transform} d={hoodieOutline} fill="black" stroke="black" strokeWidth="3"/>}</mask>
      <mask id={`${id}-cloth`} maskUnits="userSpaceOnUse" x="0" y="0" width={rig.width} height={rig.height}><path transform={transform} d={hoodieOutline} fill="white"/></mask>
      <filter id={`${id}-tint`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={`${tint.map(c => `${.24*c} ${.65*c} ${.11*c} 0 0`).join(' ')} 0 0 0 1 0`}/></filter>
      <linearGradient id={`${id}-fabric`} x2=".8" y2="1"><stop stopColor={shirt?.color}/><stop offset=".65" stopColor={shirt?.color}/><stop offset="1" stopColor={shirt?.shade}/></linearGradient>
      <clipPath id={`${id}-hand`}><ellipse cx={rig.handX} cy={rig.handY+1} rx="18" ry="16"/></clipPath>
      <clipPath id={`${id}-shirtTexture`}><path d="M67 17L48 27L15 66L36 87L49 70L45 151Q100 161 155 151L151 70L164 87L185 66L152 27L133 17Q100 41 67 17Z"/></clipPath>
      <clipPath id={`${id}-jacketTexture`}><path d="M66 36L135 36L146 74L152 146Q99 154 48 146L54 74Z"/></clipPath>
    </defs>
    <image href={source} width={rig.width} height={rig.height} mask={shirt ? `url(#${id}-base)` : undefined} onError={onError}/>
    {shirt && <g data-testid="digital-shirt" data-visual-id={shirt.id}>
      {shirt.kind === 'hoodie' ? <>
        <image href={source} width={rig.width} height={rig.height} filter={`url(#${id}-tint)`} mask={`url(#${id}-cloth)`}/>
        <g transform={`${transform} translate(129 70) scale(.6)`}><ItemMotif visual={shirt}/></g>
      </> : <g transform={transform} strokeLinejoin="round">
        <path d="M73 8Q100 21 127 8L136 30L100 45L64 30Z" fill="#f4cba7" stroke="#ad795a" strokeWidth="1.5"/>
        {shirt.kind === 'shirt' && <g fill="#f4cba7" stroke="#ac795b" strokeWidth="2"><path d="M16 68L1 114Q-2 126 9 142L33 146L47 82Z"/><path d="M184 68L199 114Q202 126 191 142L167 146L153 82Z"/></g>}
        <path d={shirt.kind === 'shirt' ? 'M67 17L48 27L15 66L36 87L49 70L45 151Q100 161 155 151L151 70L164 87L185 66L152 27L133 17Q100 41 67 17Z' : 'M67 17L43 28L23 58L2 115L8 139L33 144L49 96L45 150Q100 161 155 150L151 96L167 144L193 139L199 115L177 58L157 28L133 17Q100 38 67 17Z'} fill={`url(#${id}-fabric)`} stroke={shirt.shade} strokeWidth="2.5"/>
        <path d="M67 18Q100 46 133 18" stroke={shirt.kind === 'shirt' ? shirt.accent : shirt.shade} strokeWidth={shirt.kind === 'shirt' ? 5 : 8} fill="none"/>
        {shirt.kind === 'bomber' && <><path d="M100 32V153M51 125L78 115M149 125L122 115" stroke={shirt.accent} strokeWidth="2"/><path d="M47 148Q100 163 153 148M8 136L33 141M167 141L192 136" stroke={shirt.shade} strokeWidth="6" fill="none"/></>}
        <path d="M54 78L50 136M146 78L150 136M63 141Q81 137 91 143" stroke={shirt.shade} strokeOpacity=".4" strokeWidth="2" fill="none"/>
        {shirt.kind === 'shirt' ? <image href="/images/world-v6/shirt-cutout.webp" width="200" height="171" preserveAspectRatio="none" clipPath={`url(#${id}-shirtTexture)`}/>
          : <image href={merchImageUrl('kai-bomber-digital')} x="-20" y="-4" width="240" height="168" preserveAspectRatio="none" clipPath={`url(#${id}-jacketTexture)`}/>}
      </g>}
    </g>}
    {hat && <g data-testid="digital-hat" data-visual-id={hat.id} transform={`translate(${rig.hatX} ${rig.hatY}) scale(${rig.hatScale})`}>
      {hat.kind === 'headband' ? <><path d="M13 51Q21 1 78 3Q132 2 143 51" fill="none" stroke={hat.shade} strokeWidth="9"/><g transform="translate(112 9) scale(.8)"><ItemMotif visual={hat}/></g></> : <svg x="0" y="-4" width="155" height="102"><PreparedPropArt visual={hat}/></svg>}
    </g>}
    {light && <>
      <g data-testid="digital-lightstick" data-visual-id={light.id} transform={`translate(${rig.handX-36} ${rig.handY-74}) scale(.45)`}><svg width="160" height="200"><PreparedPropArt visual={light}/></svg></g>
      <image href={source} width={rig.width} height={rig.height} clipPath={`url(#${id}-hand)`}/>
    </>}
  </svg>;
}
