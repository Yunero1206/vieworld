import { useId } from 'react';
import type { DigitalVisual } from '../world/itemVisuals';

export function ItemMotif({ visual }: { visual: DigitalVisual }) {
  if (visual.motif === 'moon') return <path d="M9 -12A14 14 0 1 0 9 12A12 12 0 0 1 9 -12Z" fill={visual.accent}/>;
  if (visual.motif === 'wave') return <g stroke={visual.accent} strokeWidth="4" strokeLinecap="round"><path d="M-12 -5V5M-6 -11V11M0 -15V15M6 -9V9M12 -4V4"/></g>;
  return <path d="M0 -15L4 -5L15 -4L7 3L9 14L0 8L-9 14L-7 3L-15 -4L-4 -5Z" fill={visual.accent}/>;
}

/** Native vector props: no shop backgrounds, one palette for room and avatar. */
export function DigitalObjectArt({ visual, context = 'room' }: { visual: DigitalVisual; context?: 'room' | 'avatar' }) {
  const id = useId().replace(/:/g, '');
  const clothing = ['shirt', 'hoodie', 'bomber'].includes(visual.kind);
  const viewBox = context === 'avatar' || clothing ? '0 0 160 200' : visual.kind === 'lightstick' ? '38 17 84 175' : '20 52 120 105';
  return <svg className="vw-digital-object-art" width="160" height="200" viewBox={viewBox} aria-hidden="true" data-visual-id={visual.id}>
    <defs><linearGradient id={`${id}-fabric`} x2=".8" y2="1"><stop stopColor={visual.color}/><stop offset=".6" stopColor={visual.color}/><stop offset="1" stopColor={visual.shade}/></linearGradient></defs>
    {clothing ? <>
      <path d="M80 20V12C80 3 94 3 93 11C92 17 81 18 80 20L39 43Q80 50 121 43Z" fill="none" stroke="#96764b" strokeWidth="3" strokeLinejoin="round"/>
      <path d={visual.kind === 'shirt' ? 'M56 39L34 49L11 83L34 101L47 82L45 171Q80 182 115 171L113 82L126 101L149 83L126 49L104 39Q80 57 56 39Z' : 'M55 39L33 50L14 132L37 140L49 92L45 174Q80 182 115 174L111 92L123 140L146 132L127 50L105 39Q80 51 55 39Z'} fill={`url(#${id}-fabric)`} stroke={visual.shade} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M57 40Q80 63 103 40" fill="none" stroke={visual.kind === 'shirt' ? visual.accent : visual.shade} strokeWidth="5"/>
      {visual.kind === 'hoodie' && <><path d="M54 41Q49 19 80 21Q111 19 106 41L92 52L80 43L67 52Z" fill={visual.color} stroke={visual.shade} strokeWidth="2"/><path d="M66 53V96M94 53V96M60 123L51 157Q80 164 109 157L100 123Z" fill="none" stroke={visual.shade} strokeWidth="2"/></>}
      {visual.kind === 'bomber' && <><path d="M80 50V175M49 154L68 143M111 154L92 143" stroke={visual.accent} strokeWidth="2"/><path d="M46 170Q80 182 114 170" fill="none" stroke={visual.shade} strokeWidth="7"/></>}
      <g transform={visual.kind === 'bomber' ? 'translate(103 83) scale(.55)' : 'translate(80 93) scale(.8)'}><ItemMotif visual={visual}/></g>
      <path d="M53 103L50 162M107 103L110 162" stroke={visual.shade} strokeOpacity=".3" fill="none"/>
    </> : visual.kind === 'lightstick' ? <>
      <ellipse cx="80" cy="192" rx="29" ry="5" fill="#806447" fillOpacity=".25"/>
      <path d="M71 94L69 176Q80 186 91 176L89 94Z" fill={`url(#${id}-fabric)`} stroke={visual.shade} strokeWidth="2"/>
      {visual.motif === 'wave' ? <path d="M80 22L115 48L103 88H57L45 48Z" fill={visual.color} stroke={visual.accent} strokeWidth="3"/> : <circle cx="80" cy="62" r="37" fill={visual.color} fillOpacity=".8" stroke={visual.shade} strokeWidth="3"/>}
      <g transform="translate(80 62) scale(1.5)"><ItemMotif visual={visual}/></g><path d="M59 40Q70 29 86 30" stroke="#fff" strokeOpacity=".7" strokeWidth="4" fill="none"/>
      <rect x="76" y="134" width="8" height="13" rx="4" fill={visual.accent}/><ellipse cx="80" cy="181" rx="20" ry="5" fill={visual.shade}/>
    </> : visual.kind === 'headband' ? <>
      <path d="M32 133Q26 69 80 68Q134 69 128 133" fill="none" stroke={visual.shade} strokeWidth="9"/>
      <g transform="translate(107 77)"><ItemMotif visual={visual}/></g>
    </> : <>
      <path d="M33 116Q27 64 80 62Q133 64 127 116Z" fill={`url(#${id}-fabric)`} stroke={visual.shade} strokeWidth="3"/>
      <path d="M30 115Q80 102 135 124Q109 144 38 129Z" fill={visual.shade}/><g transform="translate(80 94) scale(.75)"><ItemMotif visual={visual}/></g>
    </>}
  </svg>;
}
