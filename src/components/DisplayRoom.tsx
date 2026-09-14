import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from './AvatarRenderer';
import { ownedDigitalLook, MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import { DISPLAY_FIXTURES, displayedItems, type DisplayItem, type DisplaySlot } from '../world/display';
import type { PublicFan } from '../world/community';

export function DisplayRoomScene({fan,items,onSelect}:{fan:Pick<PublicFan,'name'|'look'|'accessory'|'appearance'>;items:DisplayItem[];onSelect:(slot:DisplaySlot)=>void}){
 return <div className="v6-display-scene">
  <img className="v6-room-art" src="/images/world-v6/myspace.webp" width="1672" height="941" onError={e=>{e.currentTarget.style.visibility='hidden';}} alt="Studio cá nhân với giá áo, bảng vé, hốc huy hiệu, giá lightstick và tủ đĩa; không có salon"/>
  {DISPLAY_FIXTURES.map(f=>{const item=items.find(i=>i.slot===f.slot);return <button className={`v6-fixture v6-fixture-${f.slot} ${item?'occupied':''}`} key={f.slot} style={{left:`${f.x}%`,top:`${f.y}%`}} onClick={()=>onSelect(f.slot)} aria-label={`${f.label}: ${item?.title||'chưa trưng bày'}`}>
   {item?.image?<img src={item.image.startsWith('shirt')?'/images/world-v6/shirt-cutout.webp':`${MERCH_IMAGE_ROOT}/${item.image}.png`} alt=""/>:item?<span className="v6-trophy">✦</span>:<span className="v6-slot-empty">＋</span>}
   <span className="v6-fixture-label">{f.label}</span>
  </button>;})}
  <div className="v6-room-avatar"><AvatarRenderer appearance={fan.appearance} role="fan" size="preview" displayName={fan.name} digitalLook={fan.look} accessoryId={fan.accessory}/><span>{fan.name}</span></div>
 </div>;
}

export function PersonalDisplayRoom({onOpen}:{onOpen:(panel:string)=>void}){
 const {state}=useApp();const navigate=useNavigate();
 const selectSlot=(slot:DisplaySlot)=>navigate('/me?section=collection&type='+slot);
 return <section className="v6-personal-room" aria-label="My Space — năm vị trí trưng bày">
 <div className="vw-room-breadcrumb"><Link className="fw-text-button" to="/">← Về quảng trường</Link><button className="fw-text-button" onClick={()=>onOpen('wardrobe')}>Chỉnh avatar ↗</button></div>
 <DisplayRoomScene fan={{name:state.fanProfile.displayName,look:ownedDigitalLook(state),accessory:state.fanProfile.wardrobeChoice?.accessoryId,appearance:state.fanProfile.avatarPreset}} items={displayedItems(state)} onSelect={selectSlot}/>
 <p className="vw-room-hint">Phòng chỉ kể những điều bạn chọn. Chạm một vị trí để tìm món trong Bộ sưu tập riêng.</p>
 <Link className="fw-button" to="/me?section=collection">Chọn món từ Bộ sưu tập →</Link>
 </section>;
}
