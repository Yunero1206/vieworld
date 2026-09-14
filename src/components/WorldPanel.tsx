import { ReactNode, useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export function WorldPanel({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); }
      if (e.key !== 'Tab') return;
      const focusable = [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]') || [])].filter(el => el.getClientRects().length > 0);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!first) { e.preventDefault(); return; }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handle);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handle); document.body.style.overflow = oldOverflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  useEffect(() => { ref.current?.focus(); }, [title]);
  return <div className="fw-panel-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section ref={ref} className="fw-panel" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}>
      <header><h2 id={id}>{title}</h2><button className="fw-icon" onClick={onClose} aria-label="Đóng và về không gian"><X size={22} /></button></header>
      <div className="fw-panel-body">{children}</div>
    </section>
  </div>;
}
