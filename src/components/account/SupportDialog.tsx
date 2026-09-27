import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CircleHelp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UtilityDialog } from './UtilityDialog';

const STATUS: Record<string, string> = { open: 'Đã tạo', acknowledged: 'Đã tiếp nhận', investigating: 'Đang kiểm tra', resolved: 'Đã giải quyết', closed: 'Đã đóng' };
export function SupportDialog({ onClose, onGuide }: { onClose: () => void; onGuide?: () => void }) {
  const { state, dispatch } = useApp();
  const [subject, setSubject] = useState('');
  const cases = Object.values(state.supportCases).filter(c => c.fanId === state.fanProfile.id && c.tenantId === state.activeTenantId);
  const orders = Object.values(state.orders).filter(o => o.fanId === state.fanProfile.id && o.tenantId === state.activeTenantId);
  const benefits = Object.values(state.benefits).filter(b => b.fanId === state.fanProfile.id && b.tenantId === state.activeTenantId);
  return <UtilityDialog title="Yêu cầu hỗ trợ" subtitle="Tìm hướng dẫn hoặc kiểm tra một đơn hàng, quyền lợi cụ thể." onClose={onClose} testId="support-dialog">
    <div className="vw-support-shortcuts">{onGuide && <button className="vw-utility-secondary" onClick={onGuide}><CircleHelp size={18}/>Hướng dẫn VieWorld</button>}
      <Link className="vw-utility-secondary" to="/me?panel=bag" onClick={onClose}>Đồ & đơn hàng <ArrowRight size={16}/></Link></div>
    <section className="vw-support-create"><h3>Tạo yêu cầu kiểm tra</h3><p>Chọn đúng đơn hàng hoặc quyền lợi để giữ đầy đủ ngữ cảnh. Gửi lại cùng một vấn đề sẽ mở hồ sơ đang có, không tạo bản trùng.</p>
      <form onSubmit={e => { e.preventDefault(); const [subjectType, ...parts] = subject.split(':');
        if (subjectType === 'order' || subjectType === 'benefit') dispatch({ type: 'OPEN_SUPPORT_CASE', subjectType, subjectId: parts.join(':') });
      }}><label className="vw-account-field" htmlFor="support-subject">Bạn cần kiểm tra điều gì?
        <select id="support-subject" value={subject} required onChange={e => setSubject(e.target.value)}><option value="">Chọn đơn hàng hoặc quyền lợi</option>
          {orders.map(o => <option key={o.id} value={`order:${o.id}`}>Đơn hàng · {state.products[o.productId]?.title || o.id}</option>)}
          {benefits.map(b => <option key={b.id} value={`benefit:${b.id}`}>Quyền lợi · {b.title}</option>)}
        </select></label><button className="vw-utility-primary" disabled={!subject}>Mở hồ sơ hỗ trợ demo</button></form>
      {!orders.length && !benefits.length && <p>Chưa có đơn hàng hay quyền lợi để kiểm tra. Bạn vẫn có thể đọc hướng dẫn.</p>}
    </section>
    <section className="vw-support-history" aria-live="polite"><h3>Hồ sơ của bạn <span>({cases.length})</span></h3>
      {!cases.length ? <p>Chưa có yêu cầu nào. Khi tạo, hồ sơ và trạng thái sẽ xuất hiện tại đây.</p> : cases.map(c => <Link to={`/support/${c.id}`} key={c.id} onClick={onClose}>
        <div><strong>{c.subjectType === 'order' ? 'Kiểm tra đơn hàng' : 'Kiểm tra quyền lợi'}</strong><small>{c.id} · {STATUS[c.status] || c.status}</small></div><ArrowRight size={18}/>
      </Link>)}
    </section>
    <aside className="vw-utility-note"><strong>Hỗ trợ mô phỏng</strong><p>Hồ sơ chỉ lưu trong trình duyệt; chưa được gửi đến đội ngũ VieWorld. Không có thời gian phản hồi cam kết. Vấn đề tài khoản và kỹ thuật hiện chỉ có hướng dẫn, chưa có kênh gửi yêu cầu thật.</p></aside>
  </UtilityDialog>;
}
