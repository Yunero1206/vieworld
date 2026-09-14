import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { currentPublicFan } from '../world/community';
import { hasHistoryBadge } from '../world/history';

export function PublicIdentity(){
  const {state,dispatch}=useApp();const fan=currentPublicFan(state);const [editing,setEditing]=useState(false);
  return <section className="v5-identity" aria-label="Danh thiếp công khai">
    <div><p className="fw-eyebrow">ĐÂY LÀ MÌNH, HÔM NAY</p><h2>{fan.mood}</h2><p>{fan.bio}</p>{fan.badge&&<span className="v5-badge">✦ Người giữ ký ức · {fan.badge}</span>}</div>
    <div className="v5-identity-actions"><Link className="fw-button" to={`/members/${fan.id}`}>Xem như khách ghé phòng ↗</Link><button className="fw-text-button" onClick={()=>setEditing(!editing)}>{editing?'Đóng chỉnh sửa':'Sửa lời giới thiệu'}</button></div>
    {editing&&<form className="v5-identity-form" onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);dispatch({type:'SAVE_PUBLIC_IDENTITY',bio:String(d.get('bio') || ''),mood:String(d.get('mood') || ''),badge:d.get('badge')?Number(d.get('badge')) as 10|20:undefined,productIds:(state.fanProfile.publicIdentity?.productIds||[]).filter(id=>Object.values(state.orders).some(o=>o.productId===id&&o.fanId===state.fanProfile.id&&o.tenantId===state.activeTenantId&&o.status==='fulfilled'))});setEditing(false);}}>
      <label>Hôm nay bạn thế nào?<input name="mood" defaultValue={fan.mood} maxLength={60}/></label><label>Giới thiệu để bạn khác đọc<textarea name="bio" defaultValue={fan.bio} maxLength={160} rows={2}/></label><label>Huy hiệu muốn đeo<select name="badge" defaultValue={fan.badge || ''}><option value="">Chưa đeo huy hiệu</option>{([10,20] as const).filter(n=>hasHistoryBadge(state,n)).map(n=><option key={n} value={n}>Người giữ ký ức · {n}</option>)}</select></label><p>Chọn đồ trưng bày tại năm vị trí trong phòng phía trên.</p><button className="fw-button">Lưu danh thiếp</button><small>Chỉ danh thiếp, diện mạo và đồ chọn trưng bày được đưa vào bản xem công khai. Chưa xuất bản ra internet.</small>
    </form>}
  </section>;
}
