import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  AlertTriangle,
  FileQuestion,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  LifeBuoy,
  Sparkles,
} from 'lucide-react';

export const SupportCaseDetailView: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { state, dispatch } = useApp();

  const supportCase = caseId ? state.supportCases[caseId] : undefined;

  const formatVietnamTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  if (!supportCase) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="card" data-testid="support-case-not-found-recovery" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '36px 24px' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', marginBottom: '8px' }}>
            Không tìm thấy hồ sơ hỗ trợ
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '24px', lineHeight: 1.6 }}>
            Mã hồ sơ <code>{caseId}</code> không tồn tại trong phiên thử nghiệm hiện tại hoặc thuộc về phân vùng khác.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/me" className="btn btn-primary" id="support-back-to-myworld-btn">
              <ArrowLeft size={16} />
              <span>Về My World</span>
            </Link>
            <Link to="/worlds" className="btn btn-secondary">
              Khám phá Worlds
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const benefit = supportCase.subjectType === 'benefit' ? state.benefits[supportCase.subjectId] : undefined;
  const order = supportCase.subjectType === 'order' ? state.orders[supportCase.subjectId] : undefined;
  const product = order ? state.products[order.productId] : undefined;
  const world = benefit
    ? state.worlds[benefit.worldId]
    : order
    ? state.worlds[order.worldId]
    : undefined;

  const steps = [
    {
      id: 'open',
      title: '1. Khởi tạo & Tiếp nhận',
      desc: 'Hồ sơ đã được gửi thành công. Đội ngũ tiếp nhận vào hàng đợi xử lý.',
      isCompleted: true,
      isActive: supportCase.status === 'open',
    },
    {
      id: 'acknowledged',
      title: '2. Xác nhận hồ sơ',
      desc: 'Nhân viên hỗ trợ đã xác nhận thông tin và chuyển giao dữ liệu sang bộ phận đối soát.',
      isCompleted:
        supportCase.status === 'acknowledged' ||
        supportCase.status === 'investigating' ||
        supportCase.status === 'resolved' ||
        supportCase.status === 'closed',
      isActive: supportCase.status === 'acknowledged',
    },
    {
      id: 'investigating',
      title: '3. Đối soát kỹ thuật',
      desc: 'Kiểm tra dữ liệu phân bổ quyền lợi hoặc tình trạng vận chuyển với đơn vị vận hành.',
      isCompleted:
        supportCase.status === 'investigating' ||
        supportCase.status === 'resolved' ||
        supportCase.status === 'closed',
      isActive: supportCase.status === 'investigating',
    },
    {
      id: 'resolved',
      title: '4. Kết luận xử lý',
      desc: 'Đưa ra kết luận chính thức. (Lưu ý: Kết luận hồ sơ tách biệt với việc kích hoạt nguồn dữ liệu).',
      isCompleted: supportCase.status === 'resolved' || supportCase.status === 'closed',
      isActive: supportCase.status === 'resolved',
    },
  ];

  return (
    <div className="container" style={{ padding: '24px 20px 60px 20px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Link
          to="/me"
          className="btn btn-secondary"
          style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
          id="back-to-myworld-btn"
        >
          <ArrowLeft size={14} />
          <span>Quay lại My World</span>
        </Link>

        {benefit && (
          <Link
            to={`/benefits/${benefit.id}`}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
          >
            <span>Chi tiết quyền lợi</span>
          </Link>
        )}

        {order && (
          <Link
            to={`/orders/${order.id}`}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
          >
            <span>Chi tiết đơn hàng #{order.id}</span>
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}>
              HỒ SƠ HỖ TRỢ & ĐỐI SOÁT
            </span>
            <span className="demo-badge">DEMO</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: '0 0 8px 0' }}>
            Hồ sơ hỗ trợ #{supportCase.id}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
            Hệ thống hỗ trợ và kiểm tra minh bạch · Không đưa ra cam kết thời gian phản hồi giả định.
          </p>
        </header>

        {/* Case Summary Card */}
        <section
          className="card"
          style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
          aria-label="Thông tin chi tiết hồ sơ hỗ trợ"
          data-testid="support-case-summary"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <LifeBuoy size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: '0 0 4px 0' }}>
                  {supportCase.subjectType === 'benefit' ? 'Hỗ trợ đối soát quyền lợi' : 'Hỗ trợ đơn hàng lưu niệm'}
                </h3>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Mã tham chiếu đối tượng: <code>{supportCase.subjectId}</code>
                  {world && ` · Thế giới: ${world.name}`}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              {supportCase.status === 'open' && (
                <span
                  className="tag"
                  style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}
                  data-testid="case-status-badge"
                >
                  Tiếp nhận (Open)
                </span>
              )}
              {supportCase.status === 'acknowledged' && (
                <span
                  className="tag"
                  style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', fontWeight: '700', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}
                  data-testid="case-status-badge"
                >
                  Đã ghi nhận (Acknowledged)
                </span>
              )}
              {supportCase.status === 'investigating' && (
                <span
                  className="tag"
                  style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: '700', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}
                  data-testid="case-status-badge"
                >
                  Đang đối soát (Investigating)
                </span>
              )}
              {supportCase.status === 'resolved' && (
                <span
                  className="tag"
                  style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: '700', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}
                  data-testid="case-status-badge"
                >
                  Đã có kết luận (Resolved)
                </span>
              )}
              {supportCase.status === 'closed' && (
                <span
                  className="tag"
                  style={{ backgroundColor: '#F3F4F6', color: '#4B5563', fontWeight: '700', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}
                  data-testid="case-status-badge"
                >
                  Đã đóng (Closed)
                </span>
              )}
            </div>
          </div>

          {/* Subject Context Box */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
              ĐỐI TƯỢNG YÊU CẦU HỖ TRỢ
            </span>
            {benefit && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>{benefit.title}</strong>
                  <div data-testid="benefit-subject-status" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                    Trạng thái hiện tại: <strong>{benefit.status.toUpperCase()}</strong> · Lý do: <code>{benefit.reasonCode}</code>
                  </div>
                </div>
                <Link
                  to={`/benefits/${benefit.id}`}
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Xem quyền lợi</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            )}

            {order && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>
                    {product ? product.title : order.productId}
                  </strong>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>
                    Trạng thái đơn: <strong>{order.status.toUpperCase()}</strong> · Nguồn: <code>{order.sourceRef}</code>
                  </div>
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Xem đơn hàng</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Mã hồ sơ</span>
              <code style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>{supportCase.id}</code>
            </div>

            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Tài khoản người yêu cầu</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>{supportCase.fanId}</span>
            </div>

            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Cập nhật lần cuối</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                {formatVietnamTime(supportCase.updatedAt)}
              </span>
            </div>
          </div>

          {/* Next Action Callout */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: '#1E40AF', display: 'block', marginBottom: '2px' }}>
              Bước tiếp theo của hồ sơ:
            </strong>
            <span style={{ color: '#1E3A8A' }}>{supportCase.nextAction}</span>
          </div>

          {/* Stated Resolution (if resolved) */}
          {supportCase.resolution && (
            <div
              style={{
                padding: '16px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                lineHeight: 1.6,
              }}
              data-testid="case-resolution-box"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#065F46', marginBottom: '4px' }}>
                <CheckCircle2 size={16} />
                <span>Kết luận xử lý từ bộ phận hỗ trợ</span>
              </div>
              <p style={{ margin: '0 0 8px 0', color: '#047857', fontWeight: '600' }}>
                {supportCase.resolution}
              </p>
              <div style={{ color: '#065F46', fontSize: '11px', borderTop: '1px dashed #A7F3D0', paddingTop: '6px' }}>
                <strong>Lưu ý:</strong> Việc giải quyết hồ sơ chỉ xác lập kết luận dịch vụ. Quyền lợi hội viên không tự động được kích hoạt nếu chưa qua bước kiểm tra nguồn dữ liệu độc lập.
              </div>
            </div>
          )}
        </section>

        {/* Transparent Demo Update Steps (No Invented SLAs) */}
        <section
          className="card"
          style={{ padding: '24px' }}
          aria-label="Tiến trình các bước cập nhật thử nghiệm"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: 0 }}>
              Tiến trình xử lý hồ sơ thử nghiệm
            </h3>
            <span className="demo-badge">DEMO</span>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            Hệ thống hiển thị trung thực các bước cập nhật thử nghiệm cục bộ và không hứa hẹn thời gian phản hồi không có thật.
          </p>

          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {steps.map((step) => (
              <li
                key={step.id}
                style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative' }}
                data-testid={`support-step-${step.id}`}
              >
                {/* Step Icon */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: step.isCompleted ? 'var(--primary)' : 'var(--bg)',
                    color: step.isCompleted ? '#FFFFFF' : 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {step.isCompleted ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <strong style={{ fontSize: 'var(--text-sm)', color: step.isCompleted ? 'var(--ink)' : 'var(--muted)' }}>
                      {step.title}
                    </strong>
                    {step.isActive && (
                      <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontSize: '11px', fontWeight: '700' }}>
                        Hiện tại
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Operator Simulation Desk */}
        <section
          className="card"
          style={{ padding: '24px', backgroundColor: '#FAF9FE', border: '1px solid #DDD6FE' }}
          aria-label="Bàn điều khiển mô phỏng vận hành"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FileQuestion size={20} color="var(--primary)" />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: 0, color: 'var(--primary)' }}>
              Bàn mô phỏng vận hành hỗ trợ
            </h3>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Thao tác mô phỏng dành cho kiểm thử: chuyển trạng thái hồ sơ và thực hiện đối soát nguồn dữ liệu một cách độc lập.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Step Lifecycle Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {supportCase.status === 'open' && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'ACKNOWLEDGE_SUPPORT_CASE', caseId: supportCase.id })}
                  className="btn btn-primary"
                  style={{ fontSize: 'var(--text-xs)', padding: '8px 16px' }}
                  id="operator-ack-btn"
                  data-testid="operator-ack-btn"
                >
                  <Clock size={14} />
                  <span>Mô phỏng: Xác nhận tiếp nhận (Acknowledge)</span>
                </button>
              )}

              {(supportCase.status === 'open' || supportCase.status === 'acknowledged') && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'INVESTIGATE_SUPPORT_CASE', caseId: supportCase.id })}
                  className="btn btn-primary"
                  style={{ fontSize: 'var(--text-xs)', padding: '8px 16px' }}
                  id="operator-investigate-btn"
                  data-testid="operator-investigate-btn"
                >
                  <Search size={14} />
                  <span>Mô phỏng: Bắt đầu đối soát (Investigate)</span>
                </button>
              )}

              {supportCase.status !== 'resolved' && supportCase.status !== 'closed' && (
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'RESOLVE_SUPPORT_CASE',
                      caseId: supportCase.id,
                      resolution: 'Đã hoàn tất đối chiếu thông tin với ban tổ chức: Đủ điều kiện nhận quyền lợi.',
                    })
                  }
                  className="btn btn-primary"
                  style={{ fontSize: 'var(--text-xs)', padding: '8px 16px' }}
                  id="operator-resolve-btn"
                  data-testid="operator-resolve-btn"
                >
                  <CheckCircle2 size={14} />
                  <span>Mô phỏng: Đưa ra kết luận xử lý (Resolve)</span>
                </button>
              )}

              {supportCase.status === 'resolved' && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'CLOSE_SUPPORT_CASE', caseId: supportCase.id })}
                  className="btn btn-secondary"
                  style={{ fontSize: 'var(--text-xs)', padding: '8px 16px' }}
                  id="operator-close-btn"
                  data-testid="operator-close-btn"
                >
                  <span>Đóng hồ sơ (Close)</span>
                </button>
              )}
            </div>

            {/* Separate Source Reconciliation Section */}
            {benefit && (
              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="var(--primary)" />
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>
                    Đối soát nguồn dữ liệu quyền lợi (Separate Reconciliation Action)
                  </strong>
                </div>

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                  Quy tắc cốt lõi: Kết luận hồ sơ hỗ trợ (resolved) <strong>không tự động</strong> đổi trạng thái quyền lợi. Bạn phải thực hiện lệnh đối soát nguồn dữ liệu để cấp trạng thái hợp lệ (eligible) cho quyền lợi này.
                </p>

                {benefit.status === 'pending' ? (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'RECONCILE_BENEFIT', benefitId: benefit.id })}
                    className="btn btn-primary"
                    style={{ fontSize: 'var(--text-xs)', padding: '10px 18px', alignSelf: 'flex-start', backgroundColor: '#059669', borderColor: '#059669' }}
                    id="reconcile-benefit-btn"
                    data-testid="reconcile-benefit-btn"
                  >
                    <Sparkles size={14} />
                    <span>Thực hiện đối soát: Cấp trạng thái Đủ điều kiện (Eligible)</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontSize: 'var(--text-xs)', fontWeight: '700' }}>
                    <CheckCircle2 size={16} />
                    <span>Nguồn dữ liệu đã được đối soát: Trạng thái quyền lợi hiện là {benefit.status.toUpperCase()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
