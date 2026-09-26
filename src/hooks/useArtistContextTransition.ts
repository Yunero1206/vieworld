import { useLayoutEffect, useRef } from 'react';

/** Initial deep links and cross-page scroll remain owned by the global shell. */
export function useArtistContextTransition(pathname: string, contextId: string | null) {
  const previous = useRef({ pathname, contextId });
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = { pathname, contextId };
    if (before.pathname !== pathname || before.contextId === contextId) return;
    const frame = requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>(contextId ? '#artist-context-title' : '.artist-world-hero-identity h1');
      // Keep the compact artist identity visible rather than cropping it away.
      const target = document.querySelector<HTMLElement>('.artist-world-page');
      if (!target) return;
      const header = document.querySelector('.fw-header')?.getBoundingClientRect().bottom || 0;
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - header - 12);
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
      window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, contextId]);
}
