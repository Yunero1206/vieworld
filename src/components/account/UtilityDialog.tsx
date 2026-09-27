import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialogA11y } from '../../hooks/useDialogA11y';

/** Shared utility overlay: same reading width, typography, internal scroll and focus behavior. */
export function UtilityDialog({ title, subtitle, onClose, children, footer, testId, compact = false }: {
  title: string; subtitle?: string; onClose: () => void; children: ReactNode;
  footer?: ReactNode; testId?: string; compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const root = document.getElementById('root');
    const previousInert = root?.inert;
    const overflow = document.documentElement.style.overflow;
    if (root) root.inert = true;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      if (root) root.inert = Boolean(previousInert);
      document.documentElement.style.overflow = overflow;
    };
  }, []);
  // Unlock the background before the a11y hook restores the trigger's focus.
  useDialogA11y(true, onClose, ref);
  return createPortal(<div className="vw-utility-backdrop" onClick={onClose}>
    <div className={`vw-utility-dialog${compact ? ' is-compact' : ''}`} ref={ref} role="dialog" aria-modal="true"
      aria-labelledby={id} tabIndex={-1} data-testid={testId} onClick={e => e.stopPropagation()}>
      <header className="vw-utility-header"><div><span className="vw-utility-kicker">VIEWORLD · GÓC CỦA BẠN</span>
        <h2 id={id}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button type="button" className="vw-utility-close" onClick={onClose} aria-label={`Đóng ${title}`}><X size={20}/></button>
      </header>
      <div className="vw-utility-body">{children}</div>
      {footer && <footer className="vw-utility-footer">{footer}</footer>}
    </div>
  </div>, document.body);
}
