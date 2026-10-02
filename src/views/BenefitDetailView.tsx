import {useParams,Link} from 'react-router-dom';
import {useApp} from '../context/AppContext';
import {benefitDestination} from '../world/benefitDestination';
import {memberForChat,membershipTenure} from '../world/membershipBadge';
import {BenefitCard} from '../components/BenefitCard';

export function BenefitDetailView(){
 const {benefitId}=useParams<{benefitId:string}>();const {state,dispatch}=useApp();
 const candidate=benefitId?state.benefits[benefitId]:undefined;
 const benefit=candidate?.fanId===state.fanProfile.id&&candidate.tenantId===state.activeTenantId?candidate:undefined;
 if(!benefit)return <div className="presence-utility"><section className="card presence-detail-card" data-testid="benefit-not-found-recovery"><h1>Không tìm thấy quyền lợi</h1><p>Quyền lợi không có trong tài khoản demo này.</p><Link to="/memberships">Về Hội viên & quyền lợi</Link><Link to="/explore">Khám phá Worlds</Link></section></div>;
 const world=state.worlds[benefit.worldId];const membership=memberForChat(state,benefit.worldId,state.fanProfile.id);
 const destination=benefitDestination(state,benefit);
 const activeCase=Object.values(state.supportCases).find(c=>c.subjectType==='benefit'&&c.subjectId===benefit.id&&c.fanId===state.fanProfile.id&&c.tenantId===state.activeTenantId&&c.status!=='closed');
 const status={open:'Đã tạo',acknowledged:'Đã tiếp nhận',investigating:'Đang kiểm tra',resolved:'Đã có kết luận',closed:'Đã đóng'};
 const date=(value:string)=>new Date(value).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});
 return <div className="presence-utility presence-benefit-detail">
  <Link className="presence-back" to="/memberships" id="back-to-myworld-btn">← Hội viên & quyền lợi</Link>
  <h1>{benefit.title}</h1><p className="presence-note">Quyền lợi của {world?.name||'artist'} trong bản demo.</p>
  {state.lastError&&<p className="vw-utility-error" role="alert">{state.lastError.message}</p>}
  <BenefitCard benefit={benefit} onClaim={id=>dispatch({type:'CLAIM_BENEFIT',benefitId:id})} showDetailLink={false}/>
  {destination&&<Link className="btn btn-primary" to={destination}>Mở nội dung của quyền lợi</Link>}
  {benefit.availableFrom&&<p className="presence-note">Mở từ {date(benefit.availableFrom)}</p>}
  {benefit.expiresAt&&<p className="presence-note">Có hiệu lực đến {date(benefit.expiresAt)}</p>}
  <section className="presence-detail-card" aria-label="Điều kiện xác thực và tư cách hội viên liên quan"><h2>Hội viên & điều kiện</h2>
    <p>{membership&&membershipTenure(membership,state.demoTime)!==null?'Hội viên đang hoạt động.':'Hội viên chưa hoạt động hoặc đã hết hạn.'} Mỗi quyền lợi có điều kiện và thời gian mở riêng.</p>
    <Link to={`/memberships?artist=${benefit.worldId}`}>Hội viên của {world?.name||'artist'} →</Link>
    <p>Quyền mua sớm không đảm bảo còn vé hoặc hàng. Kích hoạt chỉ được ghi nhận trong demo, chưa thay thế quyền lợi ngoài đời.</p>
  </section>
  <section className="presence-detail-card"><h2>Cần kiểm tra lại?</h2>
    {activeCase?<div data-testid="benefit-active-case-card"><p>{status[activeCase.status]}</p><Link data-testid="view-benefit-support-case-btn" id="view-benefit-support-case-btn" to={`/support/${activeCase.id}`}>Xem tiến trình hồ sơ →</Link></div>
      :<><p>Gặp vấn đề về phân bổ hoặc điều kiện đối soát?</p><button className="btn btn-secondary" id="open-benefit-support-btn" data-testid="open-benefit-support-btn" onClick={()=>dispatch({type:'OPEN_SUPPORT_CASE',subjectType:'benefit',subjectId:benefit.id})}>Mở yêu cầu đối soát</button></>}
    <p className="presence-note">Yêu cầu chỉ lưu trên thiết bị, chưa gửi đến đội hỗ trợ.</p>
  </section>
 </div>;
}
