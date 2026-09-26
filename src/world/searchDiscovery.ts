import type { AppState } from '../domain/types';
import type { SearchSuggestion } from '../utils/searchSuggestions';
import { getWorldMoments } from './exploreRows';
/** Only public destinations. Never index private Hall chat or personal collection. */
export function globalSearchSuggestions(state: AppState): SearchSuggestion[] {
  const worlds = Object.values(state.worlds).filter(world => world.tenantId === state.activeTenantId && world.type === 'artist');
  const artists = new Set(worlds.map(world => world.id));
  return [
    ...worlds.map(world => ({ id: `world-${world.id}`, label: world.name, context: 'Artist World', target: `/artist/${world.id}` })),
    ...Object.values(state.sessions).filter(session => session.tenantId === state.activeTenantId && session.rightsApproved !== false && artists.has(session.worldId)).map(session => ({ id: `event-${session.id}`, label: session.title, context: `${state.worlds[session.worldId]?.name} · Sự kiện`, target: `/artist/${session.worldId}?context=${encodeURIComponent(`session:${session.id}`)}` })),
    ...worlds.flatMap(world => getWorldMoments(world.id).map(moment => ({ id: `moment-${moment.id}`, label: moment.title, context: `${world.name} · Khoảnh khắc`, target: moment.targetUrl }))),
    ...Object.values(state.products).filter(product => product.tenantId === state.activeTenantId).map(product => ({ id: `product-${product.id}`, label: product.title, context: `${state.worlds[product.worldId]?.name || 'VieWorld'} · VieSHOP`, target: `/shop?artist=${product.worldId}&product=${encodeURIComponent(product.id)}` })),
  ];
}
