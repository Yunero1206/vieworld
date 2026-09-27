import type { AppState } from '../domain/types';
import type { SearchSuggestion } from '../utils/searchSuggestions';
import { getWorldMoments } from './exploreRows';
import { artistForWorld } from './worldContext';
/** Only public destinations. Never index private Hall chat or personal collection. */
export function globalSearchSuggestions(state: AppState): SearchSuggestion[] {
  const worlds = Object.values(state.worlds).filter(world => world.tenantId === state.activeTenantId && world.type === 'artist');
  return [
    ...worlds.map(world => ({ id: `world-${world.id}`, label: world.name, context: 'Artist World', target: `/artist/${world.id}` })),
    ...Object.values(state.sessions).flatMap(session => {
      const artistId = artistForWorld(state, session.worldId);
      return session.tenantId === state.activeTenantId && session.rightsApproved !== false && artistId ? [{ id: `event-${session.id}`, label: session.title, context: `${state.worlds[session.worldId]?.name} · Sự kiện`, target: `/artist/${artistId}?context=${encodeURIComponent(`session:${session.id}`)}` }] : [];
    }),
    ...worlds.flatMap(world => getWorldMoments(world.id).map(moment => ({ id: `moment-${moment.id}`, label: moment.title, context: `${world.name} · Khoảnh khắc`, target: moment.targetUrl }))),
    ...Object.values(state.products).filter(product => product.tenantId === state.activeTenantId).map(product => ({ id: `product-${product.id}`, label: product.title, context: `${state.worlds[product.worldId]?.name || 'VieWorld'} · VieSHOP`, target: `/shop?artist=${product.worldId}&product=${encodeURIComponent(product.id)}` })),
  ];
}
