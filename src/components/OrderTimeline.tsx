import { useApp } from '../context/AppContext';
import type { Order } from '../domain/types';
import { SHIPPING_STEPS } from '../world/shipping';
import { getTenantConfig } from '../domain/tenantConfig';

const time=(value?:string)=>value?new Date(value).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}):'Đơn cũ chưa có thời điểm riêng';
export function OrderTimeline({order}:{order:Order}){
 const {state,dispatch}=useApp();
 const tenantConfig = getTenantConfig(order.tenantId || state.activeTenantId);
 const digital=state.products[order.productId]?.delivery==='digital';
 const events=order.shipment?.events||[];const closed=['cancelled','refunded'].includes(order.status);
 const current=events.length?SHIPPING_STEPS[events.length-1]:undefined;
 const steps=[
  {id:'pending',title:'Khởi tạo đơn hàng',detail:`${tenantConfig.labels.shopTitle} đã tiếp nhận yêu cầu mua hàng.`,done:true,at:order.createdAt},
  {id:'paid',title:'Xác nhận thanh toán',detail:digital?'Chuẩn bị bàn giao digital vào tài khoản.':'Chờ shop xác nhận món và đóng gói sau thanh toán.',done:['paid','fulfilled'].includes(order.status)||!!order.paidAt,at:order.paidAt},
  ...(!digital?SHIPPING_STEPS.map((step,i)=>({id:i===4?'fulfilled':`shipping-${i}`,title:step.title,detail:`${step.location} · ${step.detail}`,done:events.some(e=>e.stage===i)||(i===4&&order.status==='fulfilled'),at:events.find(e=>e.stage===i)?.at||(i===4?order.fulfilledAt:undefined)})):[{id:'fulfilled',title:'Bàn giao vật phẩm digital',detail:'Ghi nhận quyền sở hữu trên tài khoản. Không có kiện hàng hay đơn vị vận chuyển.',done:order.status==='fulfilled',at:order.fulfilledAt}])
 ];
 return <section className="v6-order-journey" aria-label="Tiến trình trạng thái đơn hàng" data-testid={`order-timeline-${order.id}`}>
  <p className="fw-eyebrow">HÀNH TRÌNH ĐƠN HÀNG · MÔ PHỎNG</p>
  <h2>{closed?(order.status==='cancelled'?'Đơn đã hủy':'Đơn đã hoàn tiền'):order.status==='fulfilled'?'Món đồ đã đến với bạn':digital?'Bàn giao vào tài khoản':current?.title||'Chuẩn bị hành trình của món đồ'}</h2>
  {!digital&&!closed&&<div className="v6-shipment-summary"><div><small>Kiện đang ở đâu?</small><strong>{order.status==='fulfilled'?'Đã bàn giao · không có định vị trực tiếp':current?.location||'Chưa bàn giao cho vận chuyển'}</strong></div><div><small>Đơn vị vận chuyển</small><strong>{events.length>=2?'Vie Delivery Demo':'Chưa bàn giao'}</strong></div><div><small>Mã vận đơn mẫu</small><strong>{events.length>=2?`DEMO-${order.id}`:'Chưa phát hành'}</strong></div><div><small>Dự kiến giao</small><strong>{order.status==='fulfilled'?'Đã hoàn tất':order.shipment?time(order.shipment.estimatedAt):'Khoảng 3 ngày sau xác nhận shop (kịch bản mẫu)'}</strong></div></div>}
  <p className="fw-muted">Không kết nối hãng vận chuyển thật. Địa điểm, vận đơn và ETA là kịch bản minh họa; thời gian ghi theo đồng hồ demo của app.</p>
  <ol className="v6-order-steps">{steps.map(step=><li key={step.id} data-testid={`timeline-step-${step.id}`} className={step.done?'done':''}><i aria-label={step.done?'Đã hoàn thành':'Chưa ghi nhận'}>{step.done?'✓':'·'}</i><div><h3>{step.title}</h3><p>{step.detail}</p><small>{step.done?time(step.at):closed?'Không tiếp tục xử lý':order.status==='fulfilled'?'Đơn cũ không lưu mốc này':'Chưa ghi nhận'}</small></div></li>)}</ol>
  {!digital&&order.status==='paid'&&<button className="fw-button" data-testid="advance-shipment-btn" onClick={()=>dispatch({type:'ADVANCE_SHIPMENT',orderId:order.id,expectedStage:events.length})}>Mô phỏng: {SHIPPING_STEPS[events.length]?.title}</button>}
  <p className="fw-muted">Thanh toán không đồng nghĩa đã nhận đồ. Chỉ khi bàn giao thành công, vật phẩm mới được ghi nhận sở hữu.</p>
 </section>;
}
