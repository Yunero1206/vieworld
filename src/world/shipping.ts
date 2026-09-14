import type { AppAction, AppState } from '../domain/types';
export const SHIPPING_STEPS=[
 {title:'Shop xác nhận & đóng gói',location:'Kho VieSHOP · TP.HCM (mẫu)',detail:'Đối soát món, kích cỡ và số lượng; chuẩn bị kiện hàng.'},
 {title:'Bàn giao đơn vị vận chuyển',location:'Điểm lấy hàng · Kho VieSHOP (mẫu)',detail:'Vie Delivery Demo đã nhận kiện từ shop; bắt đầu theo dõi vận đơn.'},
 {title:'Đến trung tâm phân loại',location:'Trung tâm phân loại · TP.HCM (mẫu)',detail:'Kiện được phân tuyến đến trạm giao gần người nhận.'},
 {title:'Đang giao đến bạn',location:'Trạm giao nội thành · TP.HCM (mẫu)',detail:'Kiện đã lên tuyến giao cuối. Đây không phải vị trí GPS thật.'},
 {title:'Giao hàng thành công',location:'Điểm nhận của fan (mẫu)',detail:'Hoàn tất bàn giao vật phẩm; quyền sở hữu được ghi nhận.'},
];
export function shippingReducer(s:AppState,a:AppAction):AppState|undefined{
 if(a.type!=='ADVANCE_SHIPMENT')return undefined;
 const o=s.orders[a.orderId];const p=o&&s.products[o.productId];
 if(!o||o.fanId!==s.fanProfile.id||o.tenantId!==s.activeTenantId||!p||p.delivery==='digital'||o.status!=='paid')return {...s,lastError:{code:'SHIPMENT_INVALID',message:'Chỉ theo dõi vận chuyển đơn hàng thật đã thanh toán của bạn.'}};
 const events=o.shipment?.events||[];if(a.expectedStage!==events.length||events.length>=SHIPPING_STEPS.length)return s;
 const shipment={events:[...events,{stage:events.length,at:s.demoTime}],estimatedAt:o.shipment?.estimatedAt||new Date(Date.parse(s.demoTime)+3*86400000).toISOString()};
 return {...s,lastError:undefined,orders:{...s.orders,[o.id]:{...o,shipment,updatedAt:s.demoTime,version:o.version+1,...(events.length===4?{status:'fulfilled' as const,fulfilledAt:s.demoTime}:{})}}};
}
