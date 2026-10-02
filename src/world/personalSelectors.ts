import type { AppState, Order, Benefit } from '../domain/types';
import { membershipTenure } from './membershipBadge';

export function membershipWorldsForFan(state: AppState) {
  const records = Object.values(state.memberships).filter(m => m.tenantId === state.activeTenantId && m.fanId === state.fanProfile.id && state.worlds[m.worldId]?.tenantId === state.activeTenantId && state.worlds[m.worldId]?.type === 'artist');
  return [...new Set(records.map(m => m.worldId))].map(id => {
    const members = records.filter(m => m.worldId === id).sort((a,b) => Number(membershipTenure(b,state.demoTime) !== null) - Number(membershipTenure(a,state.demoTime) !== null) || b.updatedAt.localeCompare(a.updatedAt));
    return { world: state.worlds[id], membership: members[0], months: membershipTenure(members[0],state.demoTime), active: membershipTenure(members[0],state.demoTime) !== null };
  }).sort((a,b) => a.world.name.localeCompare(b.world.name,'vi'));
}
export function benefitStateLabel(state:AppState, benefit:Benefit):string {
  if(benefit.status==='revoked')return 'Đã thu hồi';
  if(benefit.status==='expired'||(benefit.expiresAt&&Date.parse(benefit.expiresAt)<=Date.parse(state.demoTime)))return 'Đã hết hạn';
  if(benefit.status==='claimed')return 'Đã nhận';
  if(benefit.status==='pending'||(benefit.availableFrom&&Date.parse(benefit.availableFrom)>Date.parse(state.demoTime)))return 'Chưa mở';
  return 'Có thể nhận';
}
export function fanBenefitsFor(state: AppState, worldId?: string) {
  const rank=(b:Benefit)=>['Có thể nhận','Chưa mở','Đã nhận','Đã hết hạn','Đã thu hồi'].indexOf(benefitStateLabel(state,b));
  return Object.values(state.benefits).filter(b => b.tenantId === state.activeTenantId && b.fanId === state.fanProfile.id && state.worlds[b.worldId]?.tenantId===state.activeTenantId && (!worldId || b.worldId === worldId))
    .sort((a,b)=>rank(a)-rank(b)||a.title.localeCompare(b.title,'vi'));
}
export function currentBenefitsFor(state:AppState,worldId?:string) {
  return fanBenefitsFor(state,worldId).filter(b=>['pending','eligible'].includes(b.status)&&!['Đã hết hạn','Đã thu hồi'].includes(benefitStateLabel(state,b)));
}
export function orderState(order: Order, state: AppState) {
  const delivery = order.deliveryType || state.products[order.productId]?.delivery;
  if(order.status === 'cancelled') return 'Đã hủy';
  if(order.status === 'refunded') return 'Đã hoàn tiền';
  if(order.status === 'pending') return 'Chờ thanh toán';
  if(order.status === 'fulfilled') return delivery === 'digital' ? 'Đã thêm vào My Space' : delivery === 'bundle' ? 'Đã hoàn tất đơn demo' : 'Đã giao';
  if(delivery === 'digital') return 'Đang chờ bàn giao';
  return order.shipment?.events.some(e => e.stage >= 2) ? 'Đang giao' : 'Đang chuẩn bị hàng';
}
export function purchaseGroupsForFan(state: AppState) {
  const groups = new Map<string, Order[]>();
  Object.values(state.orders).filter(o => o.tenantId === state.activeTenantId && o.fanId === state.fanProfile.id).forEach(o => { const key = o.checkoutId || o.id; groups.set(key,[...(groups.get(key)||[]),o]); });
  return [...groups].map(([id,orders]) => ({ id, orders, open: orders.some(o => ['pending','paid'].includes(o.status)), title: orders.map(o => o.productTitle || state.products[o.productId]?.title || 'Vật phẩm').join(', '), count: orders.reduce((n,o)=>n+(o.quantity||1),0), status: [...new Set(orders.map(o=>orderState(o,state)))].join(' · '), date: orders[0].createdAt || orders[0].updatedAt })).sort((a,b)=>b.date.localeCompare(a.date));
}
