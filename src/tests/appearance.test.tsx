import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { APPEARANCE_KEY, readAppearance, useAppearance } from '../hooks/useAppearance';

describe('Fan-owned appearance preference', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => { cleanup(); vi.restoreAllMocks(); delete document.documentElement.dataset.theme; document.documentElement.style.colorScheme = ''; });

  it('defaults to light without using fictional session time', () => {
    const { result } = renderHook(useAppearance);
    expect(result.current.appearance).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('persists a choice across remounts and updates native controls', () => {
    const first = renderHook(useAppearance);
    act(() => first.result.current.toggleAppearance());
    expect(localStorage.getItem(APPEARANCE_KEY)).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    first.unmount();
    const second = renderHook(useAppearance);
    expect(second.result.current.appearance).toBe('dark');
  });

  it('synchronizes an appearance change from another tab', () => {
    const { result } = renderHook(useAppearance);
    localStorage.setItem(APPEARANCE_KEY, 'dark');
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: APPEARANCE_KEY })));
    expect(result.current.appearance).toBe('dark');
  });

  it('falls back safely for an obsolete theme value or blocked storage', () => {
    localStorage.setItem(APPEARANCE_KEY, 'night');
    expect(readAppearance()).toBe('light');
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => { throw new Error('Storage disabled'); });
    expect(readAppearance()).toBe('light');
  });
});
