import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark';
export const APPEARANCE_KEY = 'vieworld:appearance';
const APPEARANCE_EVENT = 'vieworld-appearance-change';

export function readAppearance(): Appearance {
  try { return localStorage.getItem(APPEARANCE_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}

/** Fan preference is independent of fictional session time and artist presence. */
export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(readAppearance);
  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
    document.documentElement.style.colorScheme = appearance;
    try { localStorage.setItem(APPEARANCE_KEY, appearance); } catch { /* Preview still works without storage. */ }
  }, [appearance]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === APPEARANCE_KEY) setAppearance(readAppearance());
    };
    const syncHere = (event: Event) => {
      const next = (event as CustomEvent<Appearance>).detail;
      if (next === 'light' || next === 'dark') setAppearance(next);
    };
    window.addEventListener('storage', sync);
    window.addEventListener(APPEARANCE_EVENT, syncHere);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(APPEARANCE_EVENT, syncHere);
    };
  }, []);
  const toggleAppearance = () => {
    const next: Appearance = appearance === 'light' ? 'dark' : 'light';
    setAppearance(next);
    // Storage events do not fire in the window that made the change.
    window.dispatchEvent(new CustomEvent(APPEARANCE_EVENT, { detail: next }));
  };
  return { appearance, toggleAppearance };
}
