import { lazy, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
const FanWorldView = lazy(()=>import('./FanWorldView').then(m=>({default:m.FanWorldView})));

import { ownedDigitalLook } from '../world/merchCatalog';

export function WorldPlazaView(){
  const {state}=useApp();const [params]=useSearchParams();const [failed,setFailed]=useState(false);const [zoomed,setZoomed]=useState(false);
  const viewport=useRef<HTMLDivElement>(null);
  useEffect(()=>{const v=viewport.current;if(v)v.scrollLeft=(v.scrollWidth-v.clientWidth)/2;},[zoomed]);
  // Keep historical panel deep-links working without making a room the entry point.
  if(params.get('panel')||params.get('zone')||params.get('drawer'))return <FanWorldView/>;
  const places=[
    {id:'artist',name:'Artist Home',sub:'Gặp người mình yêu mến',to:'/artists',x:25.5,y:10},
    {id:'myspace',name:'My Space',sub:'Một góc rất riêng mình',to:'/me',x:74,y:12},
    {id:'moments',name:'Moments',sub:'Cuộc hẹn & cộng đồng',to:'/moments',x:19.3,y:52},
    
    {id:'shop',name:'VieSHOP',sub:'Mua khi mình muốn',to:'/shop',x:80.5,y:52},
  ];
  return <div className="vw-plaza-page">
    <header className="vw-plaza-heading"><div><p className="fw-eyebrow">VIE WORLD · NHÀ CHUNG CỦA FAN</p><h1>Hôm nay, mình ghé đâu?</h1><p>Gặp người mình mến. Giữ điều mình yêu. Trở về một góc của riêng mình.</p></div></header>
    <div className={`vw-plaza-scroll ${zoomed?'vx-zoomed':''}`} ref={viewport} tabIndex={0} aria-label="Quảng trường VieWorld; có thể phóng gần và vuốt ngang"><div className={`vw-plaza-scene ${failed?'vw-no-art':''}`}>
      {!failed&&<img src="/images/world-v8/plaza.webp" width="1672" height="941" fetchPriority="high" alt="" className="vw-background" onError={()=>setFailed(true)}/>}
      <nav aria-label="Các nơi của VieWorld">{places.map(p=><Link key={p.id} className={`vw-place-door vw-door-${p.id}`} to={p.to} style={{left:`${p.x}%`,top:`${p.y}%`}}><strong>{p.name}<ArrowUpRight size={14}/></strong><small>{p.sub}</small></Link>)}</nav>
      <Link className="vw-plaza-fan" to="/me" aria-label={`Về My Space của ${state.fanProfile.displayName}`}><AvatarRenderer role="fan" size="lg" appearance={state.fanProfile.avatarPreset} displayName={state.fanProfile.displayName} digitalLook={ownedDigitalLook(state)} accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}/><strong>{state.fanProfile.displayName}</strong><small>Bạn đang ở quảng trường</small></Link>
    </div></div>
    <div className="vx-zoom-tools"><button className="fw-text-button" aria-pressed={zoomed} onClick={()=>setZoomed(!zoomed)}>{zoomed?'Xem toàn cảnh':'Nhìn gần hơn'} ↗</button></div>
    <p className="vw-plaza-hint"><Compass size={14}/>{zoomed?'Vuốt ngang để khám phá. Chọn toàn cảnh để thấy cả thế giới.':'Chạm vào bảng tên để ghé một nơi.'}</p>
    <nav className="vw-mobile-doors" aria-label="Đi nhanh trong VieWorld">{places.map(p=><Link key={p.id} to={p.to}>{p.name}</Link>)}</nav>
    <footer className="vw-plaza-footer"><span>Khám phá → gặp gỡ → giữ kỷ niệm → trở về nhà.</span><Link to="/me?panel=support">Luôn có chỗ để hỏi giúp đỡ ↗</Link></footer>
  </div>;
}
