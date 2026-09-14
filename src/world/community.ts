import { displayedItems, type DisplayItem } from './display';
import type { AppState, FanProfile } from '../domain/types';
import { DEFAULT_ROOM, type RoomDesign } from './places';
import { ownedDigitalLook } from './merchCatalog';
import { hasHistoryBadge } from './history';

export interface PublicFan { appearance?:FanProfile['avatarPreset']; id:string; name:string; bio:string; mood:string; accessory?:string; look:FanProfile['digitalLook']; room:RoomDesign; items:{title:string; detail:string; image?:string}[]; badge?:number; sample:boolean; displayItems?:DisplayItem[] }
export const DEMO_FANS:PublicFan[]=[
  {id:'fan-mai',name:'Mai Anh',bio:'Mê acoustic, thích những góc nhà có cây xanh.',mood:'Đang chờ một bản acoustic mới ♫',accessory:'accessory_classic',look:{shirt:'star-shirt',hat:'star-cap'},room:{...DEFAULT_ROOM,theme:'sage',items:[{id:'mai-chair',kind:'chair',x:65,y:65,rotation:0},{id:'mai-plant',kind:'plant',x:30,y:55,rotation:0}]},items:[{title:'Áo Star Club · Digital',detail:'Vật phẩm avatar của fan mẫu, không cấp cho tài khoản đang xem.',image:'shirt-digital'},{title:'First Notes · CD Album',detail:'Album được Mai chọn trưng bày trong phòng mẫu.',image:'cd-physical'}],sample:true},
  {id:'fan-minh',name:'Minh Khang',bio:'Đi concert vì âm nhạc, ở lại vì những người bạn.',mood:'Tối nay gặp ở Hall nhé!',accessory:'earpiece_glow',look:{lightstick:'star-light'},room:{...DEFAULT_ROOM,theme:'dusk',items:[{id:'minh-table',kind:'table',x:66,y:66,rotation:0},{id:'minh-lamp',kind:'lamp',x:29,y:54,rotation:0}]},items:[{title:'Star Light · Digital',detail:'Lightstick trong bộ sưu tập minh họa của Minh.',image:'lightstick-digital'},{title:'Live House · Kỷ niệm',detail:'Thẻ trưng bày mẫu, không phải vé vào cửa.',image:'ticket-digital'}],sample:true},
];

/** Explicit projection: never pass orders, private notes, or the full fan state to a public profile. */
export function currentPublicFan(s:AppState):PublicFan {
  const identity=s.fanProfile.publicIdentity;const look=ownedDigitalLook(s);
  const items=(s.fanProfile.showcaseSlots || []).flatMap(id=>{const c=id?s.capsules[id]:undefined;return c?.fanId===s.fanProfile.id&&c.isSaved?[{title:s.sessions[c.sessionId]?.title || 'Kỷ niệm của mình',detail:'Một kỷ niệm được chủ phòng chọn trưng bày.',image:'ticket-digital'}]:[];});
  const products=(identity?.productIds || []).flatMap(id=>{const p=s.products[id];return p&&Object.values(s.orders).some(o=>o.productId===id&&o.fanId===s.fanProfile.id&&o.tenantId===s.activeTenantId&&o.status==='fulfilled')?[{title:p.title,image:p.image,detail:'Món đã nhận, được chủ phòng chọn trưng bày. Chi tiết giao dịch không công khai.'}]:[];});
  const room=s.fanProfile.roomDesign || DEFAULT_ROOM;
  return {appearance:s.fanProfile.avatarPreset,id:s.fanProfile.id,name:s.fanProfile.displayName,bio:identity?.bio || 'Một góc nhỏ cho những điều mình yêu.',mood:identity?.mood || 'Hôm nay, cứ là mình thôi.',accessory:s.fanProfile.wardrobeChoice?.accessoryId,look,room,items:[...products,...(room.layers.memories?items:[])],badge:identity?.badge&&hasHistoryBadge(s,identity.badge)?identity.badge:undefined,sample:false,displayItems:displayedItems(s)};
}
