import { useApp } from '../context/AppContext';
import { ownsDigitalProduct } from '../world/merchCatalog';
import { Link } from 'react-router-dom';
export function DigitalCloset() {
  const {state,dispatch}=useApp();
  const seen = new Set<string>();
  const products = Object.values(state.products).filter(p => { if (!p.digitalItemId || !ownsDigitalProduct(state,p) || seen.has(p.digitalItemId)) return false; seen.add(p.digitalItemId); return true; });
  return <section className="fw-digital-closet"><h3>Đồ digital của mình</h3><p className="fw-muted">Chỉ món digital đã bàn giao mới vào tủ. Các mẫu diện mạo và phụ kiện miễn phí luôn dùng được.</p>{products.map(p=><div className="fw-event-row" key={p.id}><strong>{p.title}</strong><button className="fw-text-button" onClick={()=>dispatch({type:'EQUIP_DIGITAL_PRODUCT',productId:p.id})}>{p.digitalSlot && state.fanProfile.digitalLook?.[p.digitalSlot]===p.digitalItemId ? 'Đang mặc' : 'Mặc ngay'}</button>{p.digitalSlot && state.fanProfile.digitalLook?.[p.digitalSlot]===p.digitalItemId && <button className="fw-text-button" onClick={()=>dispatch({type:'REMOVE_DIGITAL_SLOT',slot:p.digitalSlot!})}>Tháo ra</button>}</div>)}{!products.length && <Link className="fw-text-button" to="/shop">Thử đồ digital ở VieSHOP →</Link>}</section>;
}
