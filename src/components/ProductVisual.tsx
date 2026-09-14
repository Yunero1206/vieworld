import { useId } from 'react';

/** Original repo-native product art; not a photograph or an artist likeness. */
export function ProductVisual({ productId, title }: { productId: string; title: string }) {
  const id = useId().replace(/:/g, '');
  const shirt = productId.includes('shirt');
  return <svg viewBox="0 0 480 420" role="img" aria-label={`${title} — minh họa sản phẩm demo`} className="fw-product-illustration">
    <defs>
      <linearGradient id={`${id}-cloth`} x2="1" y2="1"><stop stopColor="#faf5e8"/><stop offset="1" stopColor="#d9ccb2"/></linearGradient>
      <linearGradient id={`${id}-metal`} x2="1" y2="1"><stop stopColor="#ebcb7b"/><stop offset=".5" stopColor="#fbebbc"/><stop offset="1" stopColor="#b38c47"/></linearGradient>
    </defs>
    <ellipse cx="240" cy="355" rx={shirt ? 132 : 91} ry="14" fill="#645e4b" opacity=".1"/>
    {shirt ? <g transform="rotate(-7 240 215)">
      <path d="M174 87L114 119L72 198L135 226L151 198L148 336Q240 353 332 336L329 198L345 226L408 198L366 119L306 87Q275 108 240 107Q205 108 174 87Z" fill={`url(#${id}-cloth)`} stroke="#b8aa91" strokeWidth="2"/>
      <path d="M204 94Q240 151 276 94" fill="#827662"/><path d="M202 92Q240 139 278 92" stroke="#e4dac6" strokeWidth="9" fill="none"/>
      <path d="M150 188L163 137M330 188L317 137M157 327Q240 341 323 327" stroke="#c5b9a3" strokeWidth="2" fill="none"/>
      <g transform="translate(240 212)"><circle r="37" fill="#516548"/><path d="M-17 8V-14L0 16L17-14V8" stroke="#efe7cc" strokeWidth="4" strokeLinejoin="round" fill="none"/><path d="M-24 28Q0 42 24 28" stroke="#516548" strokeWidth="2" fill="none"/></g>
      <text x="240" y="280" textAnchor="middle" fontSize="11" letterSpacing="4" fill="#516548">A LITTLE CLOSER</text>
    </g> : <g transform="translate(240 204) rotate(12)">
      <circle r="103" fill={`url(#${id}-metal)`} stroke="#b49151" strokeWidth="2"/><circle r="91" fill="#53664d" stroke="#f5e6b0" strokeWidth="3"/>
      <path d="M0-58L15-17L59-16L24 10L37 52L0 27L-37 52L-24 10L-59-16L-15-17Z" fill={`url(#${id}-metal)`} stroke="#f9eac0" strokeWidth="2"/>
      <circle cx="0" cy="-2" r="10" fill="#53664d"/><path d="M-55 67Q0 90 55 67" stroke="#d9c28b" strokeWidth="2" fill="none"/>
    </g>}
  </svg>;
}
