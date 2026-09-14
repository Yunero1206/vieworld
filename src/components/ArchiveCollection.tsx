import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Award, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { historyCards, returnedCount } from '../world/history';
import { momentTime } from '../world/fanWorld';

export function ArchiveCollection(){
  const {state,dispatch}=useApp();const [tab,setTab]=useState('cards');const [all,setAll]=useState(false);const [filter,setFilter]=useState('all');
  const [selected,setSelected]=useState<string[]>([]);const [confirm,setConfirm]=useState(false);
  const cards=historyCards(state);const returned=returnedCount(state);const target=returned<10?10:20;
  const participation=Object.values(state.participations).filter(p=>p.fanId===state.fanProfile.id && p.tenantId===state.activeTenantId);
  const attended=[...new Map(participation.filter(p=>p.kind==='live_attendance').map(p=>[p.sessionId,p])).values()];
  const shown=cards.filter(c=>filter==='all'||c.worldId===filter).sort((a,b)=>b.collectedAt.localeCompare(a.collectedAt));
  function toggle(id:string){setConfirm(false);setSelected(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);}
  return <section className="v5-archive" id="ticket-archive" aria-label="Lịch sử vé và thành tựu">
    <header className="v5-section-heading"><div><p className="fw-eyebrow">I WAS HERE · I KEEP THIS</p><h2>Lịch sử còn đây. Kỷ niệm vẫn là của bạn.</h2><p>Thẻ đã sưu tầm và những lần đã tham dự là hai câu chuyện riêng.</p></div><Link className="fw-text-button" to="/me?custom=ticket">Chọn điều muốn trưng bày ↗</Link></header>
    <div className="v5-history-counts"><p><strong>{cards.length}</strong> thẻ đã lưu</p><p><strong>{attended.length}</strong> sự kiện đã tham dự demo</p><p><strong>{returned}</strong> thẻ đã trả demo</p></div>
    <section className="v5-achievement" aria-label="Mốc thành tựu"><Award size={35}/><div><h3>{returned>=20?'Một chặng đường đáng nhớ':`Chặng kế tiếp · ${target} thẻ`}</h3><p>{returned>=20?'Bạn đã nhận đủ hai huy hiệu demo. Toàn bộ thẻ vẫn ở trong lịch sử.':`Đã trả ${returned}/${target} thẻ · Trả thẻ là lựa chọn, không phải điều kiện để giữ kỷ niệm.`}</p><progress max={20} value={returned} aria-label="Số thẻ đã trả trên mốc 20"/>
      <div className="v5-milestones">{[10,20].map(n=><span className={returned>=n?'earned':''} key={n}>{returned>=n?'✦':'○'} Người giữ ký ức · {n}</span>)}</div>
      <small>Huy hiệu trang trí trong demo · Không phải membership, vé vào cửa hay voucher.</small>{returned>=10&&<Link className="fw-text-button" to="/me">Đeo huy hiệu trên danh thiếp →</Link>}
    </div></section>
    <div className="v5-section-tabs"><div className="vx-filter-pair"><button aria-pressed={tab==='cards'} onClick={()=>setTab('cards')}>Thẻ & vé kỷ niệm</button><button aria-pressed={tab==='attendance'} onClick={()=>setTab('attendance')}>Đã tham dự</button></div><label>Nhà nhạc <select aria-label="Lọc thẻ theo nhà nhạc" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tất cả</option>{Object.values(state.worlds).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></label></div>
    {tab==='attendance'?<div>{!attended.length&&<div className="fw-empty"><Ticket size={30}/><h3>Chưa có dấu mốc tham dự.</h3><p>Sưu tầm thẻ hoặc xem replay không tự tạo chứng nhận tham dự.</p><Link to="/moments" className="fw-button">Tìm một cuộc hẹn</Link></div>}{attended.filter(p=>filter==='all'||state.sessions[p.sessionId]?.worldId===filter).map(p=><Link className="fw-destination" key={p.id} to={`/sessions/${p.sessionId}`}><Ticket/><div><strong>{state.sessions[p.sessionId]?.title || 'Phiên đã tham dự'}</strong><p>{momentTime(p.joinedAt)} · Ghi nhận tham dự trong demo</p></div></Link>)}</div>:<>
      {!cards.length&&<div className="fw-empty"><Ticket size={34}/><h3>Chờ tấm vé đầu tiên của mình.</h3><p>Hiện chưa kết nối hệ thống phát hành vé thật. Bạn có thể thử bộ thẻ hư cấu bên dưới.</p></div>}
      <div className="v5-ticket-grid">{(all?shown:shown.slice(0,6)).map(c=><article key={c.id} className={`v5-ticket ${c.physicalStatus==='returned'?'returned':''}`}>
        <div className="v5-ticket-art"><Ticket size={26}/><span>{state.worlds[c.worldId]?.name}</span><small>THẺ MẪU · KHÔNG VÀO CỬA</small></div><div><h3>{c.eventTitle}</h3><small>{c.id}</small><p>Đã lưu · {new Date(c.collectedAt).toLocaleDateString('vi-VN')}</p>{c.returnedAt?<p><Check size={13}/>Đã trả demo · {new Date(c.returnedAt).toLocaleDateString('vi-VN')}<br/>Bản ghi digital còn nguyên.</p>:returned<20?<label className="v5-consent"><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>toggle(c.id)}/>Chọn trả thẻ này</label>:<p>Đang giữ thẻ</p>}</div>
      </article>)}</div>
      {shown.length>6&&<button className="fw-text-button v5-more-tickets" onClick={()=>setAll(!all)}>{all?'Thu gọn bộ thẻ':`Xem đủ ${shown.length} thẻ trong lịch sử ↓`}</button>}
      {cards.length>0&&returned<20&&<div className="v5-return-bar"><div><strong>Đã chọn {selected.length}/{target-returned} thẻ cho mốc {target}</strong><p>Giữ tất cả cũng được. Thao tác này chỉ mô phỏng việc trả bản vật lý; lịch sử không bị xóa.</p></div><button className="fw-text-button" onClick={()=>{setSelected(cards.filter(c=>c.physicalStatus==='owned').slice(0,target-returned).map(c=>c.id));setConfirm(false);}}>Chọn {target-returned} thẻ còn giữ</button><button className="fw-button" disabled={selected.length!==target-returned} onClick={()=>setConfirm(true)}>Kiểm tra lựa chọn</button>{confirm&&<div className="v5-return-confirm" role="group" aria-label="Xác nhận trả thẻ"><details><summary>Xem chính xác các thẻ đã chọn ({selected.length})</summary><ul>{cards.filter(c=>selected.includes(c.id)).map(c=><li key={c.id}>{c.eventTitle} · {c.id}</li>)}</ul></details><p>Ghi nhận trả {selected.length} thẻ mẫu và nhận huy hiệu mốc {target}? Không gửi thẻ thật, không phát voucher.</p><button className="fw-button" onClick={()=>{dispatch({type:'RETURN_HISTORY_CARDS',cardIds:selected});setSelected([]);setConfirm(false);}}>Xác nhận trả thẻ demo</button><button className="fw-text-button" onClick={()=>setConfirm(false)}>Giữ lại, chưa trả</button></div>}</div>}
      <details className="v5-demo-history"><summary>Thử hành trình với dữ liệu mẫu</summary><p>Thêm 20 thẻ có serial hư cấu để thử mốc 10/20. Không tăng số lần tham dự, không thay thế thẻ/đơn hiện có; bấm lại không thêm trùng.</p><button className="fw-button" onClick={()=>dispatch({type:'IMPORT_DEMO_CARDS'})}>Thêm bộ 20 thẻ mẫu</button></details>
    </>}
  </section>;
}
