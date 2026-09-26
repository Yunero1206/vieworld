import type { AppState } from '../domain/types';

/** Keep only local fan destinations, never Home itself or administrative screens. */
export function validHomeDestination(state: AppState, to: string): boolean {
  if (!to.startsWith('/') || to.startsWith('//') || /[\\\u0000-\u001f]/.test(to)) return false;
  const path = to.split(/[?#]/)[0];
  if (['/explore','/shop','/me'].includes(path)) return true;
  const artist = path.match(/^\/artist\/([^/]+)(?:\/(?:hall|archive|moment\/[^/]+))?$/)?.[1];
  return Boolean(artist && state.worlds[artist]?.type === 'artist' && state.worlds[artist]?.tenantId === state.activeTenantId);
}

export function homeDestination(state: AppState) {
  const to = state.fanProfile.worldJourney?.lastDestination;
  if (!to || !validHomeDestination(state,to)) return undefined;
  const [path,query] = to.split('?');
  const params = new URLSearchParams(query);
  const worldId = path.match(/^\/artist\/([^/]+)/)?.[1];
  const world = worldId ? state.worlds[worldId] : undefined;
  const title = world ? `${world.name} · ${path.endsWith('/hall') ? 'Hall' : path.endsWith('/archive') ? 'Kho lưu trữ' : path.includes('/moment/') ? 'Khoảnh khắc' : params.has('context') ? 'Cuộc hẹn trong world' : 'Trang chính'}`
    : path === '/shop' ? 'VieSHOP' : path === '/explore' ? 'Explore' : `My Space · ${params.get('section') === 'collection' ? 'Bộ sưu tập' : params.get('section') === 'avatar' ? 'Avatar' : params.get('panel') === 'capsules' ? 'Kệ kỷ niệm' : 'Phòng của tôi'}`;
  return {visual:world ? 'world' as const : 'space' as const,worldId,title,detail:'Nơi bạn vừa ghé — tiếp tục từ đây.',to,action:'Ghé lại'};
}
