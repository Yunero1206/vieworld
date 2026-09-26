import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useArtistContextTransition } from '../hooks/useArtistContextTransition';

describe('Artist context reading transition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<header class="fw-header"></header><div class="artist-world-page"><h1>Artist</h1><nav class="artist-world-local-nav"></nav><h2 id="artist-context-title">Live</h2></div>';
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    vi.mocked(window.scrollTo).mockClear();
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); document.body.innerHTML = ''; });
  it('does not hijack initial deep links or a different artist route', () => {
    const { rerender } = renderHook(({ path, id }) => useArtistContextTransition(path, id), { initialProps: { path: '/artist/a', id: 'live' } });
    rerender({ path: '/artist/b', id: 'next' });
    act(() => vi.runAllTimers());
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
  it('smoothly preserves artist identity and focuses the stage without a second scroll', () => {
    const heading = document.querySelector<HTMLElement>('#artist-context-title')!;
    const focus = vi.spyOn(heading, 'focus');
    const { rerender } = renderHook(({ id }) => useArtistContextTransition('/artist/a', id), { initialProps: { id: null as string | null } });
    rerender({ id: 'live' });
    act(() => vi.runAllTimers());
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });
  it('honors reduced motion and cancels a pending transition on unmount', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const { rerender, unmount } = renderHook(({ id }) => useArtistContextTransition('/artist/a', id), { initialProps: { id: null as string | null } });
    rerender({ id: 'live' });
    act(() => vi.runAllTimers());
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    vi.mocked(window.scrollTo).mockClear();
    rerender({ id: 'other' }); unmount();
    act(() => vi.runAllTimers());
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
