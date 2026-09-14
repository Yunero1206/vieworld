import type { AppAction, AppState, Order } from '../domain/types';

export interface CartLine { key: string; productId: string; optionLabel?: string; quantity: number }
export const cartKey = (id:string, option='') => `${id}::${option}`;
export const money = (n:number) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n);
export const cartFingerprint = (s:AppState) => JSON.stringify((s.cart || []).map(l=>[l.key,l.quantity,s.products[l.productId]?.priceVND]));
export const orderAmount = (o:Order,s:AppState) => (o.unitPriceVND ?? s.products[o.productId]?.priceVND ?? 0)*(o.quantity || 1);
const fail=(s:AppState,message:string):AppState=>({...s,lastError:{code:'CHECKOUT_INVALID',message}});

export function cartProblem(s:AppState, lines:CartLine[]=s.cart || []):string|undefined {
  if(!lines.length)return 'Giỏ hàng đang trống.';
  if(lines.length>50 || new Set(lines.map(l=>l.key)).size!==lines.length)return 'Giỏ hàng chưa hợp lệ.';
  const quantities:Record<string,number>={};
  for(const l of lines){
    const p=s.products[l.productId];
    if(!p || p.tenantId!==s.activeTenantId || !p.isAvailable || p.previewOnly)return 'Một món trong giỏ không còn mở bán. Vui lòng bỏ món đó.';
    if(!Number.isInteger(l.quantity)||l.quantity<1||l.quantity>10)return 'Mỗi phiên bản được chọn từ 1 đến 10 món.';
    if(p.sizes && !p.sizes.includes(l.optionLabel || ''))return `Chọn lại kích cỡ cho ${p.title}.`;
    if(p.delivery==='digital' && l.quantity!==1)return 'Vật phẩm digital chỉ cần một bản cho tài khoản của bạn.';
    const benefit=p.requiredBenefitId?s.benefits[p.requiredBenefitId]:undefined;
    if(p.requiredBenefitId && (!benefit || benefit.fanId!==s.fanProfile.id || benefit.worldId!==p.worldId || !['eligible','claimed'].includes(benefit.status)))return `${p.title} cần quyền lợi hội viên còn hợp lệ.`;
    quantities[p.id]=(quantities[p.id] || 0)+l.quantity;
    if(quantities[p.id]>p.stockCount)return `${p.title} không đủ tồn kho cho số lượng đã chọn.`;
  }
}

/** One receipt per cart line preserves the existing fulfilment and digital-entitlement contract.
 * A checkout groups these receipts; validation/payment are atomic across the entire group. */
export function commerceReducer(s:AppState,a:AppAction):AppState|undefined {
  switch(a.type){
    case 'ADD_TO_CART': {
      const key=cartKey(a.productId,a.optionLabel);const cart=s.cart || [];const p=s.products[a.productId];
      const old=cart.find(l=>l.key===key);
      const quantity=p?.delivery==='digital'?1:(old?.quantity || 0)+1;
      const next=old?cart.map(l=>l.key===key?{...l,quantity}:l):[...cart,{key,productId:a.productId,optionLabel:a.optionLabel,quantity}];
      const problem=cartProblem(s,next);return problem?fail(s,problem):{...s,cart:next,lastError:undefined};
    }
    case 'SET_CART_QUANTITY': {
      if(!Number.isInteger(a.quantity)||a.quantity<0||a.quantity>10)return fail(s,'Số lượng không hợp lệ.');
      const cart=(s.cart || []).flatMap(l=>l.key===a.key?(a.quantity?[{...l,quantity:a.quantity}]:[]):[l]);
      // Removal always works, even when another item is unavailable.
      const problem=a.quantity?cartProblem(s,cart):undefined;
      return problem?fail(s,problem):{...s,cart,lastError:undefined};
    }
    case 'CHECKOUT_CART': {
      if(!a.requestId || a.requestId.length>100)return fail(s,'Mã chốt đơn không hợp lệ.');
      if(Object.values(s.orders).some(o=>o.checkoutId===a.requestId))return s;
      if(cartFingerprint(s)!==a.fingerprint)return fail(s,'Giỏ hoặc giá đã thay đổi. Vui lòng kiểm tra lại trước khi chốt.');
      const problem=cartProblem(s);if(problem)return fail(s,problem);
      const orders={...s.orders};
      (s.cart || []).forEach((l,i)=>{const p=s.products[l.productId];const id=`checkout-${a.requestId}-${i}`;
        orders[id]={id,tenantId:s.activeTenantId,version:1,updatedAt:s.demoTime,fanId:s.fanProfile.id,worldId:p.worldId,productId:p.id,status:'pending',createdAt:s.demoTime,sourceRef:'VieSHOP-CART-SIM',requestId:id,checkoutId:a.requestId,quantity:l.quantity,optionLabel:l.optionLabel,unitPriceVND:p.priceVND,productTitle:p.title,productImage:p.image,deliveryType:p.delivery,digitalSlot:p.digitalSlot,estimatedShipping:p.estimatedShipping,batchLabel:p.batchLabel};
      });
      return {...s,orders,cart:[],lastError:undefined};
    }
    case 'PAY_CHECKOUT':
    case 'CANCEL_CHECKOUT': {
      const group=Object.values(s.orders).filter(o=>o.checkoutId===a.checkoutId && o.fanId===s.fanProfile.id && o.tenantId===s.activeTenantId);
      if(!group.length)return fail(s,'Không tìm thấy lần chốt đơn này.');
      if(a.type==='PAY_CHECKOUT' && group.every(o=>['paid','fulfilled'].includes(o.status)))return s;
      if(a.type==='CANCEL_CHECKOUT' && group.every(o=>o.status==='cancelled'))return s;
      if(group.some(o=>o.status!=='pending'))return fail(s,'Đơn đã xử lý. Mở chi tiết để xem hoặc yêu cầu hỗ trợ.');
      const lines=group.map(o=>({key:o.id,productId:o.productId,optionLabel:o.optionLabel,quantity:o.quantity || 1}));
      if(a.type==='PAY_CHECKOUT'){const problem=cartProblem(s,lines);if(problem)return fail(s,problem);}
      const orders={...s.orders},products={...s.products};
      for(const o of group){orders[o.id]={...o,status:a.type==='PAY_CHECKOUT'?'paid':'cancelled',...(a.type==='PAY_CHECKOUT'?{paidAt:s.demoTime}:{}),updatedAt:s.demoTime};
        if(a.type==='PAY_CHECKOUT')products[o.productId]={...products[o.productId],stockCount:products[o.productId].stockCount-(o.quantity || 1)};
      }
      return {...s,orders,products,lastError:undefined};
    }
  }
}
