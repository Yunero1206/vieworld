import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Eye, EyeOff, RotateCw, Trash2, Move, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from './AvatarRenderer';
import { FurnitureSprite } from './FurnitureSprite';
import { DEFAULT_ROOM, PLACE_INFO, PlaceId, RoomDesign, RoomItem, SCENE_ROOT, placeRoute, validRoomDesign } from '../world/places';
import { ownedDigitalLook } from '../world/merchCatalog';

const names={chair:'Ghế bành',table:'Bàn gỗ',plant:'Chậu cây',lamp:'Đèn ấm'};
const rooms={
  artist:[['livechat','Live Chat',58,65],['news','Bảng tin',78,35],['artist','Về artist',39,38]],
  moments:[['sessions','Sân khấu & lịch diễn',50,52],['calendar','Lịch đã hẹn',19,41],['hall','Hall hội viên',78,65]],
  archive:[['capsules','Nhật ký riêng',26,42],['archive','Xem lại',73,43],['tickets','Vé & thành tựu',50,62]],
  myspace:[['wardrobe','Tủ đồ',71,27],['showcase','Kệ trưng bày',50,23]],
} as const;
const clone=(d:RoomDesign):RoomDesign=>({...d,layers:{...d.layers},items:d.items.map(i=>({...i}))});

export function RoomInterior({place,worldId,onOpen}:{place:PlaceId;worldId?:string;onOpen:(name:string)=>void}){
  const {state,dispatch}=useApp();const [failed,setFailed]=useState(false);const [editing,setEditing]=useState(false);const [zoomed,setZoomed]=useState(false);const [tab,setTab]=useState('room');const [selected,setSelected]=useState<string|null>(null);const [saved,setSaved]=useState(false);
  const persisted=state.fanProfile.roomDesign;
  const initial=persisted&&validRoomDesign(persisted)?persisted:DEFAULT_ROOM;
  const [draft,setDraft]=useState<RoomDesign>(()=>clone(initial));
  const viewport=useRef<HTMLDivElement>(null);const scene=useRef<HTMLDivElement>(null);const dragging=useRef<{id:string;dx:number;dy:number}|null>(null);
  const isHome=place==='myspace';const design=editing?draft:initial;
  const world=worldId?state.worlds[worldId]:undefined;const asset=world?.avatarAssetId?state.avatarAssets[world.avatarAssetId]:undefined;
  const artistApproved=asset?.status==='approved'&&asset.ownerWorldId===worldId;
  const slots=state.fanProfile.showcaseSlots||[null,null,null];
  useEffect(()=>{setFailed(false);setEditing(false);setSaved(false);const v=viewport.current;if(v)v.scrollLeft=(v.scrollWidth-v.clientWidth)/2;},[place,worldId]);
  useEffect(()=>{const v=viewport.current;if(v)v.scrollLeft=(v.scrollWidth-v.clientWidth)/2;},[zoomed,editing]);
  function move(id:string,x:number,y:number){setDraft(d=>({...d,items:d.items.map(i=>i.id===id?{...i,x:Math.max(23,Math.min(77,d.snap?Math.round(x/3)*3:x)),y:Math.max(48,Math.min(78,d.snap?Math.round(y/3)*3:y))}:i)}));}
  function add(kind:RoomItem['kind']){if(draft.items.length>=8)return;const id=`${kind}-${crypto.randomUUID()}`;setDraft(d=>({...d,items:[...d.items,{id,kind,x:60,y:66,rotation:0}]}));setSelected(id);}
  const picked=draft.items.find(i=>i.id===selected);
  return <section className={`vw-interior vw-interior-${place}`} aria-label={`${PLACE_INFO[place].title} — không gian tương tác`}>
    <div className="vw-room-breadcrumb"><Link className="fw-text-button" to="/"><ArrowLeft size={15}/>Về quảng trường</Link><span className="vx-place-purpose">{place==='artist'?'Lời nhắn & hiện diện':place==='moments'?'Tham gia & gặp gỡ':place==='archive'?'Lưu giữ & xem lại':'Diện mạo & trang trí'}</span>{place==='artist'&&<Link className="fw-text-button" to={placeRoute('artist')}>Sảnh artist ↗</Link>}{place==='moments'&&<button className="fw-text-button" onClick={()=>onOpen('membership')}>Hội viên & quyền lợi ↗</button>}{isHome&&!editing&&<button className="fw-button" onClick={()=>{setDraft(clone(initial));setEditing(true);setSaved(false);}}>Trang trí phòng</button>}</div>
    {isHome&&editing&&<div className="vw-editor-intro"><p><strong>Nhà mình, mình sắp đặt.</strong> Kéo món đồ hoặc dùng phím mũi tên. Không cần mua hàng.</p><div><button className="fw-text-button" onClick={()=>{setEditing(false);setSelected(null);}}><X size={16}/>Hủy thay đổi</button><button className="fw-button" onClick={()=>{dispatch({type:'SAVE_ROOM_DESIGN',design:draft});setEditing(false);setSelected(null);setSaved(true);}}><Check size={16}/>Lưu căn phòng</button></div></div>}
    {saved&&<p role="status" className="vw-save-note">Đã lưu căn phòng trên thiết bị này.</p>}
    <div className={`fw-scene-viewport vw-room-scroll ${zoomed||editing?'vx-zoomed':''}`} ref={viewport} tabIndex={0} aria-label="Phòng tương tác; có thể phóng gần và vuốt ngang"><div ref={scene} className={`fw-scene vw-room-scene ${failed?'fw-scene-fallback vw-no-art':''} ${isHome?`vw-theme-${design.theme}`:''}`}>
      {!failed&&<img className="fw-scene-art vw-background" width="1672" height="941" fetchPriority="high" src={`${SCENE_ROOT}/${PLACE_INFO[place].image}.webp`} alt="" onError={()=>setFailed(true)}/>}
      {rooms[place].map(([panel,label,x,y])=><button key={`${panel}-${label}`} aria-label={label} className={`vw-room-object vw-object-${panel}`} style={{left:`${x}%`,top:`${y}%`}} onClick={()=>panel==='tickets'?document.getElementById('ticket-archive')?.scrollIntoView({behavior:'smooth'}):onOpen(panel)}><strong>{label}</strong><small>{panel==='livechat'?'Artist 2D · demo':'Chạm để mở'}</small></button>)}
      {(place==='artist'||place==='moments')&&artistApproved&&world&&<button className={`vw-room-artist vw-room-artist-${place}`} onClick={()=>onOpen(place==='moments'?'concerts':'livechat')} aria-label={`Xem avatar 2D ${world.name} · bản trưng bày demo`}><AvatarRenderer role="artist" size="preview" isFrozen displayName={world.name} outfitId={asset.parts.outfit} accessoryId={asset.parts.accessory}/><small>Avatar mẫu · không phải đang live</small></button>}
      {isHome&&design.layers.base&&design.items.map(item=><button key={item.id} className={`vw-furniture ${editing?'editable':''} ${selected===item.id?'picked':''}`} style={{left:`${item.x}%`,top:`${item.y}%`,zIndex:Math.round(item.y),touchAction:editing?'none':'auto'}} aria-label={`${names[item.kind]}${editing?' · chọn và di chuyển':''}`} aria-pressed={editing?selected===item.id:undefined} onClick={()=>editing&&setSelected(item.id)} onKeyDown={e=>{if(!editing||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();move(item.id,item.x+(e.key==='ArrowRight'?3:e.key==='ArrowLeft'?-3:0),item.y+(e.key==='ArrowDown'?3:e.key==='ArrowUp'?-3:0));}} onPointerDown={e=>{if(!editing)return;setSelected(item.id);const bounds=scene.current!.getBoundingClientRect();dragging.current={id:item.id,dx:e.clientX-bounds.left-bounds.width*item.x/100,dy:e.clientY-bounds.top-bounds.height*item.y/100};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const d=dragging.current;if(!editing||!d||d.id!==item.id)return;const bounds=scene.current!.getBoundingClientRect();move(item.id,(e.clientX-bounds.left-d.dx)/bounds.width*100,(e.clientY-bounds.top-d.dy)/bounds.height*100);}} onPointerUp={()=>{dragging.current=null;}} onPointerCancel={()=>{dragging.current=null;}}><span style={{transform:`rotate(${item.rotation===90?-8:item.rotation===270?8:0}deg) scaleX(${item.rotation>=180?-1:1})`}}><FurnitureSprite kind={item.kind}/></span>{editing&&selected===item.id&&<small><Move size={12}/>Kéo hoặc dùng ← ↑ ↓ →</small>}</button>)}
      {isHome&&design.layers.memories&&<div className="vw-room-memories" aria-label="Ba ô kỷ niệm trên kệ">{slots.map((id,i)=><button key={i} onClick={()=>onOpen('showcase')} aria-label={`Ô kỷ niệm ${i+1}${id?': đã trưng bày':': còn trống'}`} className={id?'filled':''}>{id?'✦':'+'}</button>)}</div>}
      {isHome&&design.layers.companions&&ownedDigitalLook(state).lightstick&&<div className="vw-owned-companion" title="Lightstick digital bạn sở hữu">✦<small>Star Light</small></div>}
      <button className="fw-fan-in-scene vw-room-fan" style={{left:place==='myspace'?'46%':'47%',top:'77%',zIndex:65}} onClick={()=>onOpen('wardrobe')} aria-label="Avatar của bạn — đổi diện mạo"><AvatarRenderer role="fan" size="lg" appearance={state.fanProfile.avatarPreset} displayName={state.fanProfile.displayName} digitalLook={ownedDigitalLook(state)} accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}/><span>{state.fanProfile.displayName}<small>Bạn đang ở đây</small></span></button>
      {isHome&&editing&&<div className="vw-floor-grid" aria-hidden="true"/>}
    </div></div>
    {!editing&&<div className="vx-zoom-tools"><button className="fw-text-button" aria-pressed={zoomed} onClick={()=>setZoomed(!zoomed)}>{zoomed?'Xem toàn cảnh':'Nhìn gần hơn'} ↗</button></div>}
    <p className="vw-room-hint">{isHome?'Một diện mạo, một căn phòng — của riêng bạn.':'Chạm vào đồ vật có tên để mở. Không cần điều khiển avatar.'}</p>
    {isHome&&editing&&<div className="vw-room-editor"><div className="vw-editor-tabs" role="tablist" aria-label="Trang trí My Space">{[['room','Room'],['furniture','Furniture'],['decor','Decor'],['memories','Memories'],['avatar','Avatar']].map(([id,label])=><button role="tab" id={`room-tab-${id}`} aria-controls="room-edit-options" aria-selected={tab===id} key={id} onClick={()=>setTab(id)}>{label}</button>)}</div><div id="room-edit-options" role="tabpanel" aria-labelledby={`room-tab-${tab}`}>
      {tab==='room'&&<div className="vw-room-themes">{[['sage','Sage · bình yên'],['dusk','Blue · chiều muộn'],['sand','Sand · nắng ấm']].map(([theme,label])=><button key={theme} aria-pressed={draft.theme===theme} onClick={()=>setDraft(d=>({...d,theme:theme as RoomDesign['theme']}))}><i className={`vw-swatch-${theme}`}/>{label}</button>)}</div>}
      {(tab==='furniture'||tab==='decor')&&<div className="vw-prop-catalog">{(tab==='furniture'?['chair','table']:['plant','lamp']).map(kind=><button key={kind} disabled={draft.items.length>=8} onClick={()=>add(kind as RoomItem['kind'])}><FurnitureSprite kind={kind as RoomItem['kind']}/><span>Thêm {names[kind as RoomItem['kind']].toLowerCase()}</span><small>Miễn phí</small></button>)}</div>}
      {tab==='memories'&&<p>Ba khung trên tường dùng các kỷ niệm đã lưu. <button className="fw-text-button" onClick={()=>onOpen('showcase')}>Chọn kỷ niệm trưng bày →</button></p>}
      {tab==='avatar'&&<p>Một diện mạo theo bạn ở mọi nơi. <button className="fw-text-button" onClick={()=>onOpen('wardrobe')}>Mở tủ đồ →</button></p>}
    </div><div className="vw-editor-settings"><div className="vw-layer-toggles">{([['base','Nội thất'],['memories','Kỷ niệm'],['companions','Đồ digital']] as const).map(([key,label])=><button key={key} aria-pressed={draft.layers[key]} onClick={()=>setDraft(d=>({...d,layers:{...d.layers,[key]:!d.layers[key]}}))}>{draft.layers[key]?<Eye size={15}/>:<EyeOff size={15}/>} {label}</button>)}</div><button className="fw-text-button" aria-pressed={draft.snap} onClick={()=>setDraft(d=>({...d,snap:!d.snap}))}>{draft.snap?'Snap · bám lưới':'Đặt tự do'}</button><small>{draft.items.length}/8 món · Đồ nền cố định</small></div>
    {picked&&<div className="vw-picked-controls"><strong>{names[picked.kind]}</strong><button className="fw-text-button" onClick={()=>setDraft(d=>({...d,items:d.items.map(i=>i.id===picked.id?{...i,rotation:(i.rotation+90)%360}:i)}))}><RotateCw size={15}/>Đổi hướng</button>{[['←',-3,0],['↑',0,-3],['↓',0,3],['→',3,0]].map(([label,x,y])=><button className="fw-icon" key={label} aria-label={`Di chuyển ${label}`} onClick={()=>move(picked.id,picked.x+Number(x),picked.y+Number(y))}>{label}</button>)}<button className="fw-text-button" onClick={()=>{setDraft(d=>({...d,items:d.items.filter(i=>i.id!==picked.id)}));setSelected(null);}}><Trash2 size={15}/>Cất món</button></div>}
    </div>}
  </section>;
}
