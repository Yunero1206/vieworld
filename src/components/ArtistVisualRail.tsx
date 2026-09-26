import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ArtistVisualRail({ children, label, className = '' }: { children: ReactNode; label: string; className?: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const [edges,setEdges] = useState({start:true,end:true});
  function update() { const el=rail.current; if(el) { const next={start:el.scrollLeft < 2,end:el.scrollLeft + el.clientWidth >= el.scrollWidth - 2}; setEdges(previous => previous.start === next.start && previous.end === next.end ? previous : next); } }
  useEffect(() => {
    update(); const el=rail.current;
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    if(el) observer?.observe(el);
    return () => observer?.disconnect();
  },[children]);
  function move(direction: number) { const el=rail.current; el?.scrollBy({left:direction*el.clientWidth*.85,behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto':'smooth'}); }
  return <div className="artist-visual-rail">{!(edges.start && edges.end) && <div className="artist-rail-controls">
    <button type="button" aria-label={`Trước · ${label}`} disabled={edges.start} onClick={()=>move(-1)}><ChevronLeft size={16}/></button>
    <button type="button" aria-label={`Tiếp · ${label}`} disabled={edges.end} onClick={()=>move(1)}><ChevronRight size={16}/></button>
  </div>}<div ref={rail} className={`artist-rail-items ${className}`} onScroll={update} aria-label={label}>{children}</div></div>;
}
