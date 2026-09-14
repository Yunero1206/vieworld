import { ownedDigitalLook } from '../world/merchCatalog';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, Lock, Package, Sparkles, Search, Heart, Truck, Monitor, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { WorldPanel } from '../components/WorldPanel';
import { ProductVisual } from '../components/ProductVisual';
import { Product } from '../domain/types';
import { DELIVERY_LABELS, MERCH_IMAGE_ROOT, ownsDigitalProduct } from '../world/merchCatalog';
import { ORDER_LABELS } from '../world/fanWorld';
import { matchesVietnameseQuery } from '../utils/textSearch';
import { getTenantConfig } from '../domain/tenantConfig';

const money = (n: number) => new Intl.NumberFormat('vi-VN', {style:'currency',currency:'VND'}).format(n);
const categories = [['all','Tất cả'],['merch','Merch & Lightstick'],['album','Album / CD'],['membership','Membership'],['ticket','Ticket']];
function MerchArt({product,digital=false}:{product:Product;digital?:boolean}) {
  const [failed,setFailed]=useState(false);
  const image=digital ? product.digitalImage : product.image;
  useEffect(()=>setFailed(false),[image]);
  return image && !failed ? <img src={`${MERCH_IMAGE_ROOT}/${image}.png`} alt={`${product.title} · ${digital || product.delivery === 'digital' ? 'minh họa digital' : 'thiết kế hàng thật'} · AI concept`} loading="lazy" onError={()=>setFailed(true)}/> : <ProductVisual productId={product.id} title={product.title}/>;
}

export function FanShopView() {
  const {state,dispatch}=useApp();
  const tenantConfig = getTenantConfig(state.activeTenantId);
  const shopTitle = tenantConfig.labels.shopTitle || 'VieSHOP';
  const {worldId}=useParams();
  const [params,setParams]=useSearchParams();
  const navigate=useNavigate();

  const query = params.get('q') || '';
  const filter = params.get('artist') || worldId || 'all';
  const category = params.get('category') || 'all';
  const delivery = params.get('delivery') || 'all';
  const sort = params.get('sort') || 'featured';
  const savedOnly = params.get('saved') === 'true';

  const [size,setSize]=useState('');
  const [digitalPhoto,setDigitalPhoto]=useState(false);
  const [trying,setTrying]=useState<Product | null>(null);
  const [added,setAdded]=useState(false);
  const openedHere=useRef(false);

  const selectedId=params.get('product');
  const selected=selectedId ? state.products[selectedId] : undefined;
  const world=worldId ? state.worlds[worldId] : undefined;
  const allProducts=Object.values(state.products);
  const ownOrders=Object.values(state.orders).filter(o=>o.fanId===state.fanProfile.id);
  const saved=state.fanProfile.savedProductIds || [];
  useEffect(()=>{setSize('');setDigitalPhoto(false);setAdded(false);},[selectedId]);

  const updateParam = (key: string, value: string, defaultValue = 'all') => {
    const next = new URLSearchParams(params);
    if (!value || value === defaultValue || value === 'false') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setParams(next, { replace: true });
  };

  const setQuery = (q: string) => updateParam('q', q, '');
  const setFilter = (f: string) => updateParam('artist', f, worldId || 'all');
  const setCategory = (c: string) => updateParam('category', c, 'all');
  const setDelivery = (d: string) => updateParam('delivery', d, 'all');
  const setSort = (s: string) => updateParam('sort', s, 'featured');
  const setSavedOnly = (s: boolean) => updateParam('saved', s ? 'true' : 'false', 'false');

  const openProduct = (id: string) => {
    if (!selectedId) openedHere.current = true;
    const next = new URLSearchParams(params);
    next.set('product', id);
    setParams(next, { replace: !!selectedId });
  };

  const close = () => {
    if (openedHere.current) {
      openedHere.current = false;
      navigate(-1);
    } else {
      const next = new URLSearchParams(params);
      next.delete('product');
      setParams(next, { replace: true });
    }
  };

  const eligible=selected?.requiredBenefitId ? state.benefits[selected.requiredBenefitId] : undefined;
  const locked=!!selected?.requiredBenefitId && (!eligible || !['eligible','claimed'].includes(eligible.status));
  const unavailable=selected && (!selected.isAvailable || selected.stockCount<=0);
  const variants=selected ? allProducts.filter(p=>(p.familyId || p.id)===(selected.familyId || selected.id)) : [];
  const digitalTwin=(p:Product)=>allProducts.find(x=>(x.familyId || x.id)===(p.familyId || p.id) && x.delivery==='digital' && x.digitalSlot);
  const tryProduct=selected && digitalTwin(selected);
  const previewLook=trying?.digitalSlot ? {...ownedDigitalLook(state),[trying.digitalSlot]:trying.digitalItemId} : ownedDigitalLook(state);
  const owned=!!trying && ownsDigitalProduct(state,trying);
  const grouped=new Map<string,Product>();
  const matches=allProducts.filter(p=>(filter==='all'||p.worldId===filter) && (category==='all'||(p.category || 'merch')===category) && (delivery==='all'||(p.delivery || 'physical')===delivery) && (!savedOnly||saved.includes(p.id)) && matchesVietnameseQuery(p.title, query));
  for(const p of matches)if(!grouped.has(p.familyId || p.id))grouped.set(p.familyId || p.id,p);
  const products=[...grouped.values()].sort((a,b)=>sort==='low' ? a.priceVND-b.priceVND : sort==='high' ? b.priceVND-a.priceVND : Number(!!b.familyId)-Number(!!a.familyId));
  function buy(){
    if(!selected||locked||unavailable||selected.previewOnly||(selected.sizes&&!size))return;
    dispatch({type:'ADD_TO_CART',productId:selected.id,optionLabel:size||undefined});setAdded(true);
  }
  if(worldId&&!world)return <div className="fw-empty"><h1>Chưa tìm thấy cửa hàng này</h1><Link className="fw-button" to="/shop">Về {shopTitle}</Link></div>;
  const dressingRoom=(compact=false)=><aside className={`fw-fitting-room ${compact?'compact':''}`} aria-label="Phòng thử đồ digital">
    <p className="fw-eyebrow">YOUR DIGITAL FITTING ROOM</p><h2>Mặc một chút là mình.</h2>
    <div className="fw-fitting-mirror"><AvatarRenderer role="fan" size="preview" appearance={state.fanProfile.avatarPreset} displayName={state.fanProfile.displayName} accessoryId={state.fanProfile.wardrobeChoice?.accessoryId} digitalLook={previewLook}/></div>
    <p>{trying ? trying.title : 'Chọn áo, nón hoặc lightstick để thử trên avatar.'}</p>
    <small>{trying ? owned ? 'Bạn đã sở hữu bản digital này.' : 'Đang thử · Chưa sở hữu · Chưa đổi diện mạo đã lưu' : 'Mua hàng thật không tự tặng đồ digital.'}</small>
    {trying && <div>{owned ? <button className="fw-button" onClick={()=>dispatch({type:'EQUIP_DIGITAL_PRODUCT',productId:trying.id})}><Check size={16}/>Mặc và lưu</button> : <button className="fw-button" onClick={()=>openProduct(trying.id)}>Xem bản digital <ArrowRight size={15}/></button>}<button className="fw-text-button" onClick={()=>setTrying(null)}><X size={15}/>Bỏ thử</button></div>}
    <Link className="fw-text-button" to="/me?panel=wardrobe">Về tủ đồ của mình →</Link>
  </aside>;
  return <div className="fw-shop-page fw-shop-v2">
    <div className="fw-world-topline"><Link className="fw-text-button" to={world?`/moments?artist=${world.id}`:'/artists'}><ArrowLeft size={17}/>Trở về nhà nhạc</Link><span className="fw-world-caption">Artist tạo nên câu chuyện. Bạn chọn điều muốn mang theo.</span><Link className="fw-text-button" to="/cart"><ShoppingBag size={18}/>Giỏ đồ ({(state.cart || []).reduce((n,l)=>n+l.quantity,0)})</Link></div>
    <header className="fw-shop-story"><div><p className="fw-eyebrow">{shopTitle.toUpperCase()} / ARTIST A / CONCEPT COLLECTION 01</p><h1>Ngoài đời. Trong world.<br/><em>Vẫn là điều mình thích.</em></h1><p>Áo mặc đi concert. Lightstick cầm trong world.<br/>Mỗi phiên bản đều ghi rõ những gì bạn nhận.</p><button className="fw-text-button" onClick={()=>{setCategory('merch');setDelivery('all');document.getElementById('shop-catalog')?.scrollIntoView({behavior:'smooth'});}}>Khám phá Star Club <ArrowRight size={17}/></button></div><button onClick={()=>openProduct('product-lightstick-real')} aria-label="Khám phá Star Light lightstick"><MerchArt product={state.products['product-lightstick-real'] || allProducts[0]}/><span>STAR LIGHT <small>Thiết kế mẫu · AI concept</small></span></button></header>
    <nav className="fw-shop-categories" aria-label={`Danh mục ${shopTitle}`}>{categories.map(([id,label])=><button key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}>{label}</button>)}</nav>
    <div className="fw-shop-layout" id="shop-catalog"><section>
      <div className="fw-shop-toolbar"><label className="fw-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm món đồ mình thích" aria-label="Tìm sản phẩm"/></label><button className="fw-text-button" aria-pressed={savedOnly} onClick={()=>setSavedOnly(!savedOnly)}><Heart size={16} fill={savedOnly?'currentColor':'none'}/>Đã lưu</button><select aria-label="Sắp xếp sản phẩm" value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Bộ sưu tập</option><option value="low">Giá tăng dần</option><option value="high">Giá giảm dần</option></select></div>
      <div className="fw-shop-scope"><select aria-label="Lọc theo artist hoặc chương trình" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Mọi nhà nhạc</option>{Object.values(state.worlds).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select><div aria-label="Loại sản phẩm">{[['all','Mọi phiên bản'],...Object.entries(DELIVERY_LABELS)].map(([id,label])=><button key={id} aria-pressed={delivery===id} onClick={()=>setDelivery(id)}>{label}</button>)}</div></div>
      <p className="fw-catalog-count">{products.length} thiết kế · Giá và tồn kho mô phỏng</p>
      {!products.length && <div className="fw-empty"><Package size={30}/><h2>Chưa có món phù hợp.</h2><p>Thử danh mục khác hoặc bỏ bớt bộ lọc.</p><button className="fw-button" onClick={()=>{ const next = new URLSearchParams(); if (selectedId) next.set('product', selectedId); setParams(next, { replace: true }); }}>Xem tất cả</button></div>}
      <div className="fw-product-grid">{products.map(p=><article className="fw-product-tile" key={p.id}><button className="fw-product" onClick={()=>openProduct(p.id)}><div className="fw-product-art"><MerchArt product={p}/><span>{p.previewOnly?'Thiết kế mẫu':DELIVERY_LABELS[p.delivery || 'physical']}</span><i><ArrowRight size={20}/></i></div><small>{state.worlds[p.worldId]?.name} · {p.previewOnly?'Chưa mở bán':!p.isAvailable||p.stockCount<=0?'Hết hàng':p.releaseType==='pre_order'?'Pre-order · Đợt 1':p.delivery==='digital'?'Digital tức thì':'Bộ sưu tập Star Club'}</small><h2>{p.title}</h2><strong>{p.previewOnly?'Xem thông tin':money(p.priceVND)}</strong></button><div className="fw-product-extra"><button className="fw-text-button" aria-label={`${saved.includes(p.id)?'Bỏ lưu':'Lưu'} ${p.title}`} aria-pressed={saved.includes(p.id)} onClick={()=>dispatch({type:'TOGGLE_SAVED_PRODUCT',productId:p.id})}><Heart size={17} fill={saved.includes(p.id)?'currentColor':'none'}/></button>{digitalTwin(p) && <button className="fw-text-button" onClick={()=>{setTrying(digitalTwin(p)!);openProduct(p.id);}}><Sparkles size={15}/>Thử digital</button>}</div></article>)}</div>
    </section>{dressingRoom()}</div>
    <div className="fw-shop-promises"><p><Truck size={20}/><span><strong>Hàng thật</strong>Giao nhận riêng · không tự kèm digital</span></p><p><Monitor size={20}/><span><strong>Digital</strong>Dùng trong VieWorld · không giao hàng vật lý</span></p><p><Package size={20}/><span><strong>Duo</strong>Gồm cả hai · xem danh sách bên trong</span></p></div>
    <footer className="fw-shop-footnote">{shopTitle} · Không gian lưu giữ quà lưu niệm và vật phẩm đồng hành cùng nghệ sĩ. Trong giai đoạn trải nghiệm, hình ảnh đóng vai trò bản dựng ý tưởng (concept preview); không thu tiền hay phát hành vé thương mại ngoài đời thực.</footer>
    {selectedId && <WorldPanel title={selected?.title || 'Không tìm thấy món đồ'} onClose={close}>{selected ? <>
      <div className="fw-product-photo-tabs"><button aria-pressed={!digitalPhoto} onClick={()=>setDigitalPhoto(false)}>{selected.delivery==='digital'?'Ảnh vật phẩm digital':'Ảnh hàng thật'}</button>{selected.digitalImage && selected.delivery!=='digital' && <button aria-pressed={digitalPhoto} onClick={()=>setDigitalPhoto(true)}>Bản digital tương ứng</button>}</div>
      <div className="fw-product-detail-art"><MerchArt product={selected} digital={digitalPhoto}/></div><small className="fw-muted">Thiết kế mẫu · Digital được thể hiện riêng với hàng thật</small>
      <div className="fw-variant-selector" aria-label="Chọn phiên bản sản phẩm">{variants.map(p=><button key={p.id} aria-pressed={p.id===selected.id} onClick={()=>openProduct(p.id)}>{DELIVERY_LABELS[p.delivery || 'physical']}</button>)}</div>
      <p className="fw-eyebrow">{state.worlds[selected.worldId]?.name} / {DELIVERY_LABELS[selected.delivery || 'physical']}{selected.releaseType === 'pre_order' ? ' · PRE-ORDER' : ''}</p><h3 className="fw-product-price">{selected.previewOnly?'Mẫu trưng bày · Chưa mở bán':money(selected.priceVND)}</h3>
      {selected.estimatedShipping && (
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'var(--surface-hover, #f3f4f6)', padding: '6px 12px', borderRadius: '8px', margin: '4px 0 12px 0' }}>
          <Truck size={15} />
          <span>{selected.estimatedShipping}{selected.batchLabel ? ` (${selected.batchLabel})` : ''}</span>
        </p>
      )}
      {selected.description && <p>{selected.description}</p>}<h3>Bạn nhận được</h3><ul className="fw-includes">{(selected.includes || ['1 món merchandise vật lý trong bản mô phỏng','Không kèm vật phẩm digital']).map(item=><li key={item}>{item}</li>)}</ul>
      {selected.sizes && <label className="fw-size-select">Kích cỡ <select aria-label="Kích cỡ" value={size} onChange={e=>setSize(e.target.value)}><option value="">Chọn size</option>{selected.sizes.map(s=><option key={s}>{s}</option>)}</select></label>}
      {tryProduct && <><button className="fw-text-button" onClick={()=>setTrying(tryProduct)}><Sparkles size={17}/>Thử lên avatar · không mua</button>{trying && dressingRoom(true)}</>}
      {!selected.previewOnly && <p>{unavailable?'Món này hiện đã hết hàng.':`Còn ${selected.stockCount} suất trong danh mục mô phỏng.`}</p>}
      {locked && <p className="fw-locked"><Lock size={17}/>Món này cần quyền lợi hợp lệ. <Link to="/me?panel=membership">Xem quyền lợi</Link></p>}
      {selected.previewOnly ? <Link className="fw-button fw-buy" to={selected.category==='membership'?'/me?panel=membership':'/worlds/artist-a?panel=concerts'}>{selected.category==='membership'?'Xem chương trình hội viên':'Xem lịch concert · Không phải mua vé'}</Link> : <button className="fw-button fw-buy" onClick={buy} disabled={!!unavailable||locked||!!(selected.sizes&&!size)}>{unavailable?'Hết hàng':locked?'Chưa đủ điều kiện':selected.sizes&&!size?'Chọn kích cỡ trước':'Thêm vào giỏ đồ'}<ShoppingBag size={18}/></button>}
      {added&&!state.lastError&&<p role="status" className="v5-added">Đã thêm vào giỏ đồ. <Link to="/cart">Xem giỏ & chốt đơn →</Link></p>}
      {state.lastError && <p role="alert">{state.lastError.message}</p>}
      <p className="fw-muted">Trải nghiệm an toàn: Không thu tiền thật. Thử đồ để xem trước diện mạo trên avatar trước khi quyết định thêm vào bộ sưu tập cá nhân.</p>
      <details className="fw-product-terms"><summary>Giao nhận, đổi trả & quyền sử dụng</summary><p>Hướng dẫn trải nghiệm: Trong phiên bản thử nghiệm, bạn không cần nhập thông tin thẻ hay địa chỉ thực tế. Vật phẩm digital sẽ được thêm vào tủ đồ ngay khi nhận; vật phẩm vật lý được mô phỏng theo dõi qua hành trình đơn hàng {shopTitle}.</p></details>
      {ownOrders.filter(o=>o.productId===selected.id).map(o=><Link key={o.id} className="fw-destination" to={`/orders/${o.id}`}><Package/><div><strong>Đơn của bạn</strong><p>{ORDER_LABELS[o.status]}</p></div><ArrowRight/></Link>)}
    </> : <p>Món này không còn trong danh mục. Đóng để tiếp tục xem cửa hàng.</p>}</WorldPanel>}
  </div>;
}
