import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DisplayRoomScene } from '../components/DisplayRoom';
import type { DisplayItem } from '../world/display';
import { currentPublicFan, DEMO_FANS } from '../world/community';
import { MERCH_IMAGE_ROOT } from '../world/merchCatalog';

export function MemberSpaceView(){
  const {state}=useApp();const {fanId}=useParams();const [selected,setSelected]=useState<number|null>(null);
  const own=fanId===state.fanProfile.id;const fan=own?currentPublicFan(state):DEMO_FANS.find(f=>f.id===fanId);
  if(!fan)return <div className="fw-empty"><h1>Chưa tìm thấy người bạn này.</h1><Link to="/moments">Về Moments</Link></div>;
  const displayItems:DisplayItem[]=fan.displayItems||fan.items.map((i,n)=>({...i,id:`sample-${n}`,slot:i.image?.startsWith('lightstick')?'lightstick':i.image?.startsWith('ticket')?'ticket':i.image?.startsWith('cd')?'disc':'shirt'}));
  const visibleItems=fan.displayItems||fan.items;
  const item=selected===null?undefined:visibleItems[selected];
  return <div className="fw-experience v5-member-space">
    <Link className="fw-text-button" to={own?'/me':'/moments?artist=artist-a&panel=hall'}><ArrowLeft size={16}/>{own?'Về chỉnh sửa My Space':'Về Hall'}</Link>
    <header className="fw-scene-heading"><h1>Ghé nhà {fan.name}<span>{fan.sample?'Fan hư cấu · Phòng và vật phẩm mẫu, không phải người đang online':'Bản xem như khách · chỉ lưu trên thiết bị, chưa chia sẻ online'}</span></h1></header>
    <DisplayRoomScene fan={fan} items={displayItems} onSelect={slot=>{const i=displayItems.findIndex(v=>v.slot===slot);setSelected(i<0?null:i);}}/>
    <section className="v5-identity"><div><p className="fw-eyebrow">DANH THIẾP CỦA {fan.name.toLocaleUpperCase('vi')}</p><h2>{fan.mood}</h2><p>{fan.bio}</p>{fan.badge&&<span className="v5-badge">✦ Người giữ ký ức · {fan.badge}</span>}</div><div><h3>Đang mặc</h3><p>{[fan.look?.shirt?'Áo Star Club':null,fan.look?.hat?'Nón Everyday Star':null,fan.look?.lightstick?'Star Light':null].filter(Boolean).join(' · ') || 'Diện mạo cơ bản'}</p><small>{fan.sample?'Tủ đồ dựng sẵn cho fan mẫu':'Chỉ vật phẩm có quyền sử dụng hiện tại'}</small></div></section>
    <section className="v5-public-items" aria-label="Những món được trưng bày"><h2>Những điều {fan.name.split(' ')[0]} muốn kể</h2><p>Chạm vào một món trên kệ để xem câu chuyện.</p><div className="v5-public-item-links">{visibleItems.map((v,i)=><button className="fw-text-button" key={i} onClick={()=>setSelected(i)} aria-pressed={selected===i}>{v.title} ↗</button>)}</div>{!visibleItems.length&&<p>Chủ phòng chưa trưng bày kỷ niệm nào.</p>}{item&&<article className="v5-item-detail" aria-live="polite">{item.image&&<img src={`${MERCH_IMAGE_ROOT}/${item.image}.png`} alt={item.title}/>}<div><h3>{item.title}</h3><p>{item.detail}</p><button className="fw-text-button" onClick={()=>setSelected(null)}>Cất bảng xem</button></div></article>}</section>
  </div>;
}
