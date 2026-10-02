import type { Benefit } from '../domain/types';
import { Link } from 'react-router-dom';
import { Gift, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

interface BenefitCardProps { benefit: Benefit; onClaim?: (benefitId: string) => void; showDetailLink?: boolean }
const labels = { eligible:'Đủ điều kiện', pending:'Đang chờ đối soát', claimed:'Đã kích hoạt · Sẵn sàng dùng', expired:'Đã hết hạn', revoked:'Đã thu hồi' };

export function BenefitCard({benefit,onClaim,showDetailLink=true}:BenefitCardProps) {
  const early = benefit.id==='benefit-early-access-01'||benefit.title.toLowerCase().includes('sớm');
  return <section className="card presence-benefit-card" data-testid={`benefit-card-${benefit.id}`}>
    <header><Gift size={22}/><strong>{benefit.title}</strong><span data-testid={`benefit-status-${benefit.id}`}>{labels[benefit.status]}</span></header>
    <p>{benefit.nextAction}</p>
    {early&&<p className="presence-note">Quyền mua sớm không đảm bảo chắc chắn còn hàng trong kho và không bao gồm quyền tương tác riêng với nghệ sĩ.</p>}
    <div className="presence-benefit-actions">
      {showDetailLink&&<Link to={`/benefits/${benefit.id}`} id={`benefit-link-detail-${benefit.id}`}>Chi tiết & điều kiện đối soát <ArrowRight size={14}/></Link>}
      {benefit.status==='eligible'&&onClaim&&<button className="btn btn-primary" id={`claim-benefit-btn-${benefit.id}`} data-testid={`claim-benefit-btn-${benefit.id}`} onClick={()=>onClaim(benefit.id)}>Kích hoạt quyền lợi</button>}
      {benefit.status==='claimed'&&<span data-testid={`benefit-claimed-indicator-${benefit.id}`}><CheckCircle2 size={16}/> Đã kích hoạt thành công</span>}
      {benefit.status==='pending'&&<button className="btn btn-secondary" disabled id={`claim-benefit-btn-${benefit.id}`}><Clock size={16}/> Chờ đối soát từ ban tổ chức</button>}
      {['expired','revoked'].includes(benefit.status)&&<button className="btn btn-secondary" disabled id={`claim-benefit-btn-${benefit.id}`}>Không thể kích hoạt</button>}
    </div>
    <details className="presence-diagnostics"><summary>Thông tin đối chiếu demo</summary><p>Mã: <code>{benefit.id}</code> · Nguồn: <code>{benefit.sourceRef}</code></p><p>Căn cứ: <code>{benefit.reasonCode}</code></p></details>
  </section>;
}
