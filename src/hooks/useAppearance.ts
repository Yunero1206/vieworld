import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark';
export const APPEARANCE_KEY = 'vieworld:appearance';

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
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return { appearance, toggleAppearance: () => setAppearance(current => current === 'light' ? 'dark' : 'light') };
}
