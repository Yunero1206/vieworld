import type { AppState } from '../domain/types';

const storageKey = (tenantId: string, fanId: string) => `vieworld:current-artist:${tenantId}:${fanId}`;
export const featuredArtistIds = ['artist-a', 'artist-mira', 'artist-kai', 'artist-c', 'artist-b'];
const memorySelection = new Map<string, string>();

export function resetCurrentArtistSelections(tenantId: string): void {
  for (const key of memorySelection.keys()) if (key.startsWith(`vieworld:current-artist:${tenantId}:`)) memorySelection.delete(key);
}

function isArtist(state: AppState, id: string | undefined | null): id is string {
  return Boolean(id && state.worlds[id]?.type === 'artist' && state.worlds[id]?.tenantId === state.activeTenantId);
}

/** The last visited artist wins. The fallback is chosen only once and persisted. */
export function getCurrentArtistId(state: AppState): string | undefined {
  let stored: string | null = null;
  const key = storageKey(state.activeTenantId, state.fanProfile.id);
  try { stored = localStorage.getItem(key) || (state.fanProfile.id === 'fan-linh' ? localStorage.getItem(`vieworld:current-artist:${state.activeTenantId}`) : null); } catch { stored = memorySelection.get(key) || null; }
  if (isArtist(state, stored)) return stored;
  const last = state.fanProfile.worldJourney?.lastWorldId;
  const followed = state.followedWorldIds.find(id => isArtist(state, id));
  const curated = featuredArtistIds.filter(id => isArtist(state, id));
  const eligible = curated.length ? curated : Object.values(state.worlds).filter(world => isArtist(state, world.id)).map(world => world.id);
  const fallback = isArtist(state, last) ? last : followed || eligible[Math.floor(Math.random() * eligible.length)];
  if (fallback) setCurrentArtistId(state, fallback);
  return fallback;
}

export function setCurrentArtistId(state: AppState, artistId: string): void {
  if (!isArtist(state, artistId)) return;
  const key = storageKey(state.activeTenantId, state.fanProfile.id);
  memorySelection.set(key, artistId);
  try { localStorage.setItem(key, artistId); } catch { /* private storage */ }
}

export function artistIdFromPath(pathname: string): string | undefined {
  return pathname.match(/^\/(?:artist|worlds)\/([^/]+)/)?.[1];
}
