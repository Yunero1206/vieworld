import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Trash2, Check, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cartFingerprint, cartProblem, money, orderAmount } from '../world/commerce';
import { DELIVERY_LABELS, MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import { ORDER_LABELS } from '../world/fanWorld';

export function CartView(){
  const {state,dispatch}=useApp();const navigate=useNavigate();const {checkoutId}=useParams();
  const [review,setReview]=useState(false);const [consent,setConsent]=useState(false);const [cancel,setCancel]=useState(false);
  const pending=useRef<string|null>(null);const [busy,setBusy]=useState(false);
  const cart=state.cart || [];const fingerprint=cartFingerprint(state);
  useEffect(()=>{setConsent(false);},[fingerprint,review]);
  useEffect(()=>{if(!pending.current)return;const id=pending.current;
    if(Object.values(state.orders).some(o=>o.checkoutId===id)){pending.current=null;setBusy(false);setReview(false);navigate(`/checkout/${id}`,{replace:true});}
    else if(state.lastError){pending.current=null;setBusy(false);}
  },[state.orders,state.lastError,navigate]);
  const group=Object.values(state.orders).filter(o=>o.checkoutId===checkoutId && o.fanId===state.fanProfile.id && o.tenantId===state.activeTenantId);
  const total=checkoutId?group.reduce((n,o)=>n+orderAmount(o,state),0):cart.reduce((n,l)=>n+(state.products[l.productId]?.priceVND || 0)*l.quantity,0);
  const problem=cartProblem(state);
  const paid=group.length>0&&group.every(o=>['paid','fulfilled'].includes(o.status));
  const cancelled=group.length>0&&group.every(o=>o.status==='cancelled');
  const pendingGroup=group.length>0&&group.every(o=>o.status==='pending');
  const physical=checkoutId?group.some(o=>state.products[o.productId]?.delivery!=='digital'):cart.some(l=>state.products[l.productId]?.delivery!=='digital');
  function checkout(){if(pending.current || !consent)return;const id=crypto.randomUUID();pending.current=id;setBusy(true);dispatch({type:'CHECKOUT_CART',requestId:id,fingerprint});}
  return <div className="fw-experience v5-commerce">
    <Link className="fw-text-button" to="/shop"><ArrowLeft size={16}/>Tiếp tục chọn đồ</Link>
    <header className="fw-scene-heading"><h1>{checkoutId?paid?'Đã thanh toán mô phỏng':cancelled?'Đã hủy lần chốt đơn':'Thanh toán mô phỏng':review?'Kiểm tra trước khi chốt':'Giỏ đồ của mình'}<span>Chọn đúng phiên bản. Biết rõ điều mình nhận.</span></h1></header>
    <ol className="v5-checkout-steps" aria-label="Tiến trình mua hàng">{['Giỏ đồ','Kiểm tra','Thanh toán','Nhận đồ'].map((v,i)=><li key={v} aria-current={i===(checkoutId?paid?3:2:review?1:0)?'step':undefined}><span>{i+1}</span>{v}</li>)}</ol>
    {checkoutId && !group.length ? <div className="fw-empty"><h2>Không tìm thấy lần chốt đơn này.</h2><Link to="/cart" className="fw-button">Về giỏ đồ</Link></div> : !checkoutId&&!cart.length?<div className="fw-empty"><ShoppingBag size={36}/><h2>Giỏ đồ đang nhẹ tênh.</h2><p>Thử đồ ở VieSHOP rồi thêm đúng phiên bản mình thích.</p><Link to="/shop" className="fw-button">Ghé VieSHOP</Link><Link to="/me?panel=bag" className="fw-text-button">Xem đơn đã chốt →</Link></div>:<div className="v5-checkout-layout"><section aria-label="Món đã chọn">
      {(checkoutId?group.map(o=>({key:o.id,productId:o.productId,quantity:o.quantity || 1,optionLabel:o.optionLabel,order:o})):cart.map(l=>({...l,order:undefined}))).map(l=>{const p=state.products[l.productId];return <article className="v5-cart-line" key={l.key}>
        {p?.image?<img src={`${MERCH_IMAGE_ROOT}/${p.image}.png`} alt={p.title} width="100" height="100"/>:<Package size={40}/>}
        <div><small>{state.worlds[p?.worldId]?.name} · {DELIVERY_LABELS[p?.delivery || 'physical']}</small><h2>{l.order?.productTitle || p?.title || 'Món không còn trong danh mục'}</h2><p>{l.optionLabel?`Size ${l.optionLabel} · `:''}{money(l.order?.unitPriceVND ?? p?.priceVND ?? 0)} / món</p>
          {!checkoutId&&!review?<div className="v5-cart-quantity"><label>Số lượng <select aria-label={`Số lượng ${p?.title}`} value={l.quantity} onChange={e=>dispatch({type:'SET_CART_QUANTITY',key:l.key,quantity:Number(e.target.value)})}>{Array.from({length:p?.delivery==='digital'?1:10},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label><button className="fw-text-button" onClick={()=>dispatch({type:'SET_CART_QUANTITY',key:l.key,quantity:0})} aria-label={`Bỏ ${p?.title} khỏi giỏ`}><Trash2 size={14}/>Bỏ món</button></div>:<p>Số lượng: {l.quantity}</p>}
          {l.order&&<Link to={`/orders/${l.order.id}`} className="fw-text-button">{ORDER_LABELS[l.order.status]} · Chi tiết & hỗ trợ →</Link>}
        </div><strong>{money(l.order?orderAmount(l.order,state):(p?.priceVND || 0)*l.quantity)}</strong>
      </article>;})}
      <p className="fw-muted">{physical?'Đơn gồm vật phẩm vật lý: bạn có thể theo dõi quy trình đóng gói và vận chuyển mô phỏng mà không cần cung cấp địa chỉ thật.':'Đơn chỉ gồm vật phẩm digital: trang phục và phụ kiện sẽ được chuyển thẳng vào tủ đồ avatar của bạn.'}</p>
      {review&&<button className="fw-text-button" onClick={()=>setReview(false)}>← Sửa lại giỏ đồ</button>}
    </section><aside className="v5-order-summary"><p className="fw-eyebrow">VIESHOP · TRẢI NGHIỆM THỬ NGHIỆM</p><h2>{paid?'Đồ của bạn đang được chuẩn bị':'Tóm tắt lần mua'}</h2><p><span>Tiền sản phẩm</span><strong>{money(total)}</strong></p><p><span>Giao nhận demo</span><span>0 ₫</span></p><p className="v5-total"><span>Tổng mô phỏng</span><strong>{money(total)}</strong></p>
      {!checkoutId&&problem&&<p role="alert">{problem}</p>}
      {!checkoutId&&!review&&<button className="fw-button" disabled={!!problem} onClick={()=>setReview(true)}>Kiểm tra đơn →</button>}
      {!checkoutId&&review&&<><label className="v5-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Tui đã kiểm tra size, số lượng và bản hàng thật / digital. Đây là giao dịch mô phỏng.</label><button className="fw-button" disabled={!consent||!!problem||busy} onClick={checkout}>{busy?'Đang chốt…':'Chốt đơn · sang thanh toán'}</button><small>Chốt đơn chưa trừ tiền, chưa giữ tồn kho và chưa cấp vật phẩm.</small></>}
      {pendingGroup&&<><p>Thanh toán an toàn trong phiên bản thử nghiệm · Bạn không cần nhập thông tin thẻ hay tài khoản ngân hàng.</p><button className="fw-button" onClick={()=>dispatch({type:'PAY_CHECKOUT',checkoutId:checkoutId!})}>Thanh toán mô phỏng {money(total)}</button>{cancel?<div><p>Hủy toàn bộ món chưa thanh toán trong lần này?</p><button className="fw-text-button" onClick={()=>{dispatch({type:'CANCEL_CHECKOUT',checkoutId:checkoutId!});setCancel(false);}}>Xác nhận hủy</button><button className="fw-text-button" onClick={()=>setCancel(false)}>Giữ đơn</button></div>:<button className="fw-text-button" onClick={()=>setCancel(true)}>Hủy lần chốt đơn này</button>}</>}
      {paid&&<><p role="status"><Check size={17}/>Thanh toán trải nghiệm thành công!</p><p>Mở chi tiết món đồ bên trái để nhận đồ vào tủ hoặc theo dõi tiến trình giao hàng.</p><Link to="/me?panel=bag" className="fw-button">Túi đồ & Đơn hàng của tôi</Link></>}
      {cancelled&&<><p>Không phát sinh thanh toán hay quyền sở hữu.</p><Link to="/shop" className="fw-button">Chọn lại ở VieSHOP</Link></>}
      <Link to="/me?panel=bag" className="fw-text-button">Mọi đơn đã chốt →</Link>
    </aside></div>}
  </div>;
}
