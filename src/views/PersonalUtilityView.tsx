import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bell, ChevronRight, HelpCircle, Moon, Shield, UserRound } from 'lucide-react';
import { isDemoSignedIn } from '../world/account';
import { useApp } from '../context/AppContext';
import { useAppearance } from '../hooks/useAppearance';
import { membershipWorldsForFan, currentBenefitsFor, fanBenefitsFor, benefitStateLabel, purchaseGroupsForFan } from '../world/personalSelectors';
import type { Benefit } from '../domain/types';
import { ArtistNavAvatar } from '../components/GlobalNavigation';
import { AccountInfoDialog } from '../components/account/AccountInfoDialog';
import { PrivacyDialog } from '../components/account/PrivacyDialog';
import { NotificationPreferencesModal } from '../components/notifications/NotificationPreferencesModal';
import { APPROVED_KNOWLEDGE_CARDS, queryWorldGuide } from '../data/guideKnowledge';

export function PersonalUtilityView(){
  const {state,dispatch}=useApp();
  const {pathname}=useLocation();
  const [params,setParams]=useSearchParams();
  const [edit,setEdit]=useState<'profile'|'privacy'|'notifications'|null>(null);
  const [query,setQuery]=useState('');
  const [subject,setSubject]=useState('');
  const {appearance,toggleAppearance}=useAppearance();
  const signedIn=isDemoSignedIn(state);
  const memberships=signedIn?membershipWorldsForFan(state):[];
  const selected=memberships.find(m=>m.world.id===params.get('artist'));
  const requestedWorld=state.worlds[params.get('artist')||''];
  const selectedWorld=requestedWorld?.tenantId===state.activeTenantId&&requestedWorld.type==='artist'?requestedWorld:undefined;
  const selectorWorlds=selectedWorld&&!memberships.some(m=>m.world.id===selectedWorld.id)?[...memberships.map(m=>m.world),selectedWorld]:memberships.map(m=>m.world);
  const benefits=signedIn?fanBenefitsFor(state,selectedWorld?.id):[];
  const current=benefits.filter(b=>['Có thể nhận','Chưa mở'].includes(benefitStateLabel(state,b))&&b.status!=='claimed');
  const history=benefits.filter(b=>!current.includes(b));
  const attention=benefits.filter(b=>benefitStateLabel(state,b)==='Có thể nhận');
  const date=(value:string)=>new Date(value).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});
  const benefitRow=(b:Benefit)=><Link className="presence-list-row" key={b.id} to={`/benefits/${b.id}`}><span><strong>{b.title}</strong><small>{state.worlds[b.worldId]?.name} · {benefitStateLabel(state,b)}{b.availableFrom?' · Mở '+date(b.availableFrom):''}{b.expiresAt?' · Đến '+date(b.expiresAt):''}</small></span><ChevronRight size={18}/></Link>;
  const groups=signedIn?purchaseGroupsForFan(state):[];
  const help=queryWorldGuide(query);
  const cards=query.trim()?(help.type==='answered'?help.cards:[]):APPROVED_KNOWLEDGE_CARDS;
  const cases=signedIn?Object.values(state.supportCases).filter(c=>c.tenantId===state.activeTenantId&&c.fanId===state.fanProfile.id):[];
  return <div className="presence-utility">
    <Link className="presence-back" to="/">← VieWorld</Link>
    <h1>{pathname==='/memberships'?'Hội viên & quyền lợi':pathname==='/orders'?'Đơn hàng':pathname.endsWith('/help')?'Trợ giúp':'Cài đặt & riêng tư'}</h1>
    {pathname==='/memberships'&&<>
      <nav className="presence-world-selector" aria-label="Hội viên theo nghệ sĩ"><button aria-pressed={!selectedWorld} onClick={()=>setParams({})}>Tất cả</button>{selectorWorlds.map(world=><button key={world.id} aria-pressed={selectedWorld?.id===world.id} onClick={()=>setParams({artist:world.id})}><ArtistNavAvatar artist={world}/><span>{world.name}</span></button>)}</nav>
      {selectedWorld?<section className="presence-membership"><header><ArtistNavAvatar artist={selectedWorld}/><div><h2>{selectedWorld.name}</h2><p>{selected?.active?'Đang hoạt động':selected?'Không còn hiệu lực':'Bạn chưa tham gia hội viên'}{selected?.active&&selected.months!==null&&selected.months>=0?' · '+selected.months+' tháng':''}</p></div></header>{selected?.active?<Link to={`/artist/${selectedWorld.id}/hall?room=member-lounge-${selectedWorld.id}`}>Vào Member Lounge<ChevronRight size={18}/></Link>:<div className="hall-membership-preview"><p>Phòng chung và các phòng cộng đồng vẫn miễn phí. Hội viên mở thêm Member Lounge và những phiên riêng được công bố trong Hall.</p><button className="fw-button" onClick={()=>dispatch({type:'UPGRADE_MEMBERSHIP',worldId:selectedWorld.id})}>Tham gia hội viên demo</button><p className="presence-note">Mô phỏng trên thiết bị, không thu tiền thật.</p></div>}</section>:<>
        <section className="presence-attention" aria-labelledby="membership-attention"><h2 id="membership-attention">Cần chú ý</h2>{attention.length?attention.map(benefitRow):<p>Không có quyền lợi nào cần bạn xử lý lúc này.</p>}</section>
        <h2>Hội viên của bạn</h2>{memberships.length?memberships.map(m=><button className="presence-list-row" key={m.world.id} onClick={()=>setParams({artist:m.world.id})}><ArtistNavAvatar artist={m.world}/><span><strong>{m.world.name}</strong><small>{m.active?'Đang hoạt động':'Không còn hiệu lực'}{m.active&&m.months!==null&&m.months>=0?' · '+m.months+' tháng':''} · {currentBenefitsFor(state,m.world.id).length} quyền lợi hiện tại</small></span><ChevronRight size={18}/></button>):<p>Bạn chưa tham gia hội viên. <Link to="/explore">Khám phá artist bạn yêu thích</Link> để xem hội viên.</p>}
      </>}
      {selectedWorld&&selected?.active&&<section className="presence-membership-benefits"><h2>Quyền lợi của bạn</h2>{current.length?current.map(benefitRow):<p>Chưa có quyền lợi riêng đang mở.</p>}{!!history.length&&<details className="presence-benefit-history"><summary>Đã nhận & lịch sử ({history.length})</summary>{history.map(benefitRow)}</details>}</section>}
      {selectedWorld&&<Link className="presence-list-row" to={`/artist/${selectedWorld.id}`}>Vào Artist World<ArrowRight size={18}/></Link>}
    </>}
    {pathname==='/orders'&&<>{groups.length?groups.map(g=><article className="presence-order" key={g.id}><header><strong>{g.count} món</strong><small>{new Date(g.date).toLocaleDateString('vi-VN')}</small></header><p>{g.status}</p>{g.orders.map(o=><Link className="presence-list-row" to={`/orders/${o.id}`} key={o.id}><span>{o.productTitle||state.products[o.productId]?.title||'Vật phẩm'}<small>Số lượng {o.quantity||1}</small></span><ChevronRight size={18}/></Link>)}</article>):<p>Bạn chưa có đơn hàng nào. <Link to="/shop">Ghé VieCollect</Link></p>}<p className="presence-note">Giao dịch mô phỏng, không thu tiền hoặc giao hàng thật.</p></>}
    {pathname.endsWith('/settings')&&<div className="presence-settings">
      <button onClick={()=>setEdit('profile')}><UserRound size={21}/><span>Thông tin tài khoản<small>Liên hệ và địa chỉ giao hàng, chỉ bạn thấy</small></span><ChevronRight size={18}/></button>
      <button onClick={()=>setEdit('privacy')}><Shield size={21}/><span>Quyền riêng tư & chia sẻ<small>Phòng, avatar cộng đồng và lời nhắn Hall</small></span><ChevronRight size={18}/></button>
      <button onClick={()=>setEdit('notifications')}><Bell size={21}/><span>Thông báo<small>Những cập nhật bạn muốn nhận</small></span><ChevronRight size={18}/></button>
      <button onClick={toggleAppearance}><Moon size={21}/><span>Giao diện<small>{appearance==='dark'?'Đang tối, chuyển sang sáng':'Đang sáng, chuyển sang tối'}</small></span><ChevronRight size={18}/></button>
      <p className="presence-note">Dữ liệu demo nằm trong trình duyệt này. Đăng nhập Google/Facebook ở đây là mô phỏng, không kết nối tài khoản thật.</p>
    </div>}
    {pathname.endsWith('/help')&&<>
      <label className="presence-help-search">Tìm trong hướng dẫn<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Hall, avatar, đơn hàng…"/></label>
      <div className="presence-help-topics">{cards.map(card=><details key={card.id}><summary><HelpCircle size={18}/>{card.title}</summary><p>{card.description}</p><Link to={card.actionLink.to}>{card.actionLink.label} →</Link></details>)}{!cards.length&&<p>Chưa có hướng dẫn phù hợp. Thử một từ khóa khác nhé.</p>}</div>
      <section className="presence-support"><h2>Yêu cầu hỗ trợ</h2><p>Chọn đơn hàng hoặc quyền lợi cần kiểm tra.</p><form onSubmit={e=>{e.preventDefault();const [kind,...id]=subject.split(':');if(kind==='order'||kind==='benefit')dispatch({type:'OPEN_SUPPORT_CASE',subjectType:kind,subjectId:id.join(':')});}}><select aria-label="Nội dung cần hỗ trợ" required value={subject} onChange={e=>setSubject(e.target.value)}><option value="">Chọn nội dung</option>{groups.flatMap(g=>g.orders).map(o=><option value={`order:${o.id}`} key={o.id}>{o.productTitle||state.products[o.productId]?.title||'Đơn hàng'}</option>)}{(signedIn?fanBenefitsFor(state):[]).map(b=><option value={`benefit:${b.id}`} key={b.id}>{b.title}</option>)}</select><button disabled={!subject}>Tạo yêu cầu demo</button></form>
      {cases.map(c=>{const source=c.subjectType==='order'?groups.flatMap(g=>g.orders).find(o=>o.id===c.subjectId):undefined;const title=source?.productTitle||(source&&state.products[source.productId]?.title)||(c.subjectType==='benefit'?benefits.find(b=>b.id===c.subjectId)?.title:undefined)||'Nội dung cần kiểm tra';const status={open:'Đã tạo',acknowledged:'Đã tiếp nhận',investigating:'Đang kiểm tra',resolved:'Đã giải quyết',closed:'Đã đóng'}[c.status];return <Link className="presence-list-row" to={`/support/${c.id}`} key={c.id}><span><strong>{title}</strong><small>{c.subjectType==='order'?'Đơn hàng':'Quyền lợi'} · {status}</small></span><ChevronRight size={18}/></Link>;})}<p className="presence-note">Yêu cầu chỉ lưu trên thiết bị, chưa gửi đến đội hỗ trợ. Không có cam kết phản hồi.</p></section>
    </>}
    {edit==='profile'&&<AccountInfoDialog onClose={()=>setEdit(null)}/>}
    {edit==='privacy'&&<PrivacyDialog onClose={()=>setEdit(null)}/>}
    <NotificationPreferencesModal isOpen={edit==='notifications'} onClose={()=>setEdit(null)}/>
  </div>;
}
