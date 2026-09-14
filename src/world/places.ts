export type PlaceId = 'artist' | 'moments' | 'archive' | 'myspace';
export const PLACE_INFO = {
  artist: {title:'Artist Home', subtitle:'Tìm nghệ sĩ mới và chọn nhà mình muốn ghé.', image:'artist', tone:'sage'},
  moments: {title:'Moments', subtitle:'Nhà nghệ sĩ · lời nhắn, sân khấu và những người cùng yêu.', image:'moments', tone:'amber'},
  archive: {title:'Archive', subtitle:'Có những khoảnh khắc, mình muốn giữ thật lâu.', image:'archive', tone:'blue'},
  myspace: {title:'My Space', subtitle:'Một căn phòng, rất nhiều điều là mình.', image:'myspace', tone:'sage'},
};
export const SCENE_ROOT='/images/world-v4';
export function placeRoute(place:PlaceId, _worldId?:string){return {artist:'/artists',moments:'/moments',archive:'/me?section=collection',myspace:'/me'}[place];}
/** Each feature has one home. Cross-place entry points are links, not copies. */
export const PANEL_HOME:Record<string,PlaceId>={news:'moments',artist:'moments',livechat:'moments',worlds:'artist',listening:'moments',concerts:'moments',sessions:'moments',calendar:'moments',hall:'moments',membership:'moments',archive:'myspace',capsules:'myspace',wardrobe:'myspace',showcase:'myspace',bag:'myspace',support:'myspace'};
export function panelRoute(panel:string,worldId?:string){
  const home=PANEL_HOME[panel]||'artist';
  const route=home==='artist'&&worldId?`/worlds/${worldId}`:placeRoute(home);
  const query=new URLSearchParams({panel});
  if(['archive','capsules'].includes(panel))query.set('section','collection');
  if(home==='moments'&&worldId)query.set('artist',worldId);
  return `${route}?${query}`;
}
export interface RoomItem { id:string; kind:'chair'|'table'|'plant'|'lamp'; x:number; y:number; rotation:number }
export interface RoomDesign { theme:'sage'|'dusk'|'sand'; items:RoomItem[]; snap:boolean; layers:{base:boolean;memories:boolean;companions:boolean} }
export const DEFAULT_ROOM:RoomDesign={theme:'sage',snap:true,layers:{base:true,memories:true,companions:true},items:[{id:'chair-1',kind:'chair',x:61,y:65,rotation:0}]};
export function validRoomDesign(value:RoomDesign):boolean {
  if(!value || !['sage','dusk','sand'].includes(value.theme) || typeof value.snap!=='boolean' || !value.layers || !['base','memories','companions'].every(k=>typeof value.layers[k as keyof RoomDesign['layers']]==='boolean') || !Array.isArray(value.items) || value.items.length>8) return false;
  if(!value.items.every(i=>i && typeof i.id==='string' && i.id.length>0 && i.id.length<80 && ['chair','table','plant','lamp'].includes(i.kind) && Number.isFinite(i.x)&&i.x>=23&&i.x<=77&&Number.isFinite(i.y)&&i.y>=48&&i.y<=78 && [0,90,180,270].includes(i.rotation)))return false;
  return new Set(value.items.map(i=>i.id)).size===value.items.length;
}
