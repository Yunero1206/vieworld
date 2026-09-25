import { useEffect, useRef } from 'react';

/**
 * Reusable WCAG 2.2 compliant Dialog & Drawer accessibility hook:
 * - Focuses dialog/first element on open
 * - Traps Tab and Shift+Tab key navigation strictly inside the container
 * - Listens for Escape key to trigger onClose()
 * - Restores focus to the triggering element on close
 * - Locks background document.body scroll while open
 */
export function useDialogA11y(
  isOpen: boolean,
  onClose: () => void,
  containerRef: React.RefObject<HTMLElement | null>
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Focus the modal or the first focusable element inside it
    const focusTarget = () => {
      if (!containerRef.current) return;
      const explicitAutofocus = containerRef.current.querySelector<HTMLElement>('[autofocus]');
      if (explicitAutofocus) {
        explicitAutofocus.focus();
        return;
      }
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
      );
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        containerRef.current.focus();
      }
    };

    // Timeout or requestAnimationFrame ensures DOM has painted
    const frameId = requestAnimationFrame(focusTarget);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab') return;

      if (!containerRef.current) return;
      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
        )
      ).filter(el => el.getClientRects().length > 0);

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === containerRef.current) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || document.activeElement === containerRef.current) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = oldOverflow;
      if (previousActiveElementRef.current && previousActiveElementRef.current.isConnected) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, containerRef]);
}
