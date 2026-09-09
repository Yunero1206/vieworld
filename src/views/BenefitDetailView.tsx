import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BenefitCard } from '../components/BenefitCard';
import {
  ArrowLeft,
  AlertTriangle,
  Award,
  ShieldAlert,
  Info,
  LifeBuoy,
} from 'lucide-react';

export const BenefitDetailView: React.FC = () => {
  const { benefitId } = useParams<{ benefitId: string }>();
  const { state, dispatch } = useApp();

  const benefit = benefitId ? state.benefits[benefitId] : undefined;
  const world = benefit ? state.worlds[benefit.worldId] : undefined;
  const membership = benefit
    ? Object.values(state.memberships).find(
        (m) => m.worldId === benefit.worldId && m.fanId === state.fanProfile.id
      )
    : undefined;

  const isFollowed = benefit ? state.followedWorldIds.includes(benefit.worldId) : false;

  if (!benefit) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="card" data-testid="benefit-not-found-recovery" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '36px 24px' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', marginBottom: '8px' }}>
            Không tìm thấy quyền lợi
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '24px', lineHeight: 1.6 }}>
            Mã quyền lợi <code>{benefitId}</code> không tồn tại trong hệ thống hoặc thuộc về phân vùng khác.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/me" className="btn btn-primary">
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

  const isEarlyAccess = benefit.id === 'benefit-early-access-01' || benefit.title.toLowerCase().includes('sớm');

  return (
    <div className="container" style={{ padding: '24px 20px 60px 20px' }}>
      {/* Breadcrumb / Back button */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          to="/me"
          className="btn btn-secondary"
          style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
          id="back-to-myworld-btn"
        >
          <ArrowLeft size={14} />
          <span>Quay lại My World</span>
        </Link>
        {world && (
          <Link
            to={`/worlds/${world.id}`}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
          >
            <span>Đến {world.name}</span>
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Page Header */}
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}>
              CHI TIẾT QUYỀN LỢI & ĐỐI SOÁT
            </span>
            <span className="demo-badge">DEMO</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: '0 0 8px 0' }}>
            {benefit.title}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
            Đối soát điều kiện hội viên và quy trình kích hoạt quyền lợi trung thực (§2.3, §7.2).
          </p>
        </header>

        {/* Domain Error Notice (if any occurred recently) */}
        {state.lastError && (
          <div
            className="card"
            style={{
              padding: '16px 20px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
            role="alert"
          >
            <ShieldAlert size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: '2px' }}>
                Thao tác bị từ chối: {state.lastError.code}
              </strong>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: '#7F1D1D', lineHeight: 1.5 }}>
                {state.lastError.message}
              </p>
              {state.lastError.actionableResolution && (
                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                  <strong>Hướng dẫn giải quyết:</strong> {state.lastError.actionableResolution}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Primary Benefit Card */}
        <BenefitCard
          benefit={benefit}
          onClaim={(id) => dispatch({ type: 'CLAIM_BENEFIT', benefitId: id })}
          showDetailLink={false}
        />

        {/* Qualification & Associated World / Membership Context */}
        <section
          className="card"
          style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          aria-label="Điều kiện xác thực và tư cách hội viên liên quan"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--primary)" />
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', margin: 0 }}>
              Tư cách hội viên & Nguồn gốc quyền lợi (§2.3)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                Không gian áp dụng
              </span>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>
                {world ? world.name : benefit.worldId}
              </strong>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                {isFollowed ? '✓ Bạn đang theo dõi thế giới này' : 'Chưa theo dõi'}
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                Tình trạng hội viên liên kết
              </span>
              <strong style={{ fontSize: 'var(--text-sm)', color: membership?.status === 'active' ? '#15803D' : 'var(--muted)' }}>
                {membership ? `Hội viên: ${membership.status.toUpperCase()}` : 'Chưa đăng ký hội viên'}
              </strong>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                Mã tham chiếu: <code>{benefit.sourceRef}</code>
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                Mã đối soát hệ thống
              </span>
              <code style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--primary)' }}>
                {benefit.reasonCode}
              </code>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                Xác định tất định (không dùng AI)
              </div>
            </div>
          </div>

          {/* Explanation paragraphs */}
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.6 }}>
            {benefit.status === 'eligible' && (
              <p style={{ margin: 0 }}>
                Quyền lợi này đã vượt qua bộ lọc kiểm tra tính hợp lệ: tài khoản sở hữu tư cách hội viên tích cực và không vi phạm điều khoản chương trình. Bạn có thể kích hoạt quyền lợi này ngay để sử dụng.
              </p>
            )}

            {benefit.status === 'pending' && (
              <p style={{ margin: 0 }}>
                Quyền lợi đang ở trạng thái <strong>đang chờ xác thực (pending)</strong>. Mặc dù bạn có thể đã là hội viên tích cực, ban tổ chức vẫn cần đối soát phân bổ số lượng hoặc khung giờ trước khi cấp quyền. Theo hiến pháp (§2.3), quyền lợi pending không thể bị bỏ qua để kích hoạt trước hạn.
              </p>
            )}

            {benefit.status === 'claimed' && (
              <p style={{ margin: 0 }}>
                Quyền lợi đã được <strong>kích hoạt thành công (claimed)</strong>. Quyền này đã được liên kết vĩnh viễn vào tài khoản fan của bạn trong phiên thử nghiệm hiện tại và không thể kích hoạt lặp lại.
              </p>
            )}

            {benefit.status === 'expired' && (
              <p style={{ margin: 0 }}>
                Quyền lợi đã <strong>hết hạn (expired)</strong>. Kỳ hạn sử dụng hoặc kỳ hạn hội viên bảo chứng cho quyền lợi này đã chấm dứt.
              </p>
            )}
          </div>

          {/* Support & Reconciliation Action Box */}
          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '16px',
              marginTop: '8px',
            }}
          >
            {Object.values(state.supportCases).find(
              (c) => c.subjectId === benefit.id && c.status !== 'closed'
            ) ? (
              (() => {
                const activeCase = Object.values(state.supportCases).find(
                  (c) => c.subjectId === benefit.id && c.status !== 'closed'
                )!;
                return (
                  <div
                    style={{
                      padding: '14px 18px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                    data-testid="benefit-active-case-card"
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <LifeBuoy size={16} color="#1E40AF" />
                        <strong style={{ fontSize: 'var(--text-sm)', color: '#1E40AF' }}>
                          Đang có hồ sơ hỗ trợ cho quyền lợi này
                        </strong>
                        <span className="tag" style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: '11px', fontWeight: '700' }}>
                          {activeCase.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: '#1E3A8A' }}>
                        Mã hồ sơ: <code>{activeCase.id}</code> · {activeCase.nextAction}
                      </div>
                    </div>
                    <Link
                      to={`/support/${activeCase.id}`}
                      className="btn btn-primary"
                      style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
                      id="view-benefit-support-case-btn"
                      data-testid="view-benefit-support-case-btn"
                    >
                      <span>Xem tiến trình hồ sơ →</span>
                    </Link>
                  </div>
                );
              })()
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)', display: 'block', marginBottom: '2px' }}>
                    Gặp vấn đề về phân bổ hoặc điều kiện đối soát?
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    Mở hồ sơ hỗ trợ cục bộ để theo dõi tiến trình kiểm tra (§2.3, P09).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'OPEN_SUPPORT_CASE',
                      subjectType: 'benefit',
                      subjectId: benefit.id,
                    })
                  }
                  className="btn btn-secondary"
                  style={{ fontSize: 'var(--text-xs)', padding: '6px 14px', gap: '6px' }}
                  id="open-benefit-support-btn"
                  data-testid="open-benefit-support-btn"
                >
                  <LifeBuoy size={14} />
                  <span>Mở yêu cầu đối soát</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Constitutional Guardrails */}
        <section
          className="card"
          style={{
            padding: '20px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Info size={16} color="var(--primary)" />
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>
              Nguyên tắc trung thực về quyền lợi VieWorld (§2.3)
            </strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>
              <strong>Hội viên không tự động cấp mọi quyền lợi:</strong> Tư cách hội viên tích cực cho phép hệ thống đánh giá điều kiện nhưng không tự động mở khóa toàn bộ đặc quyền nếu chưa đối soát.
            </li>
            <li>
              <strong>Quyền lợi không đồng nghĩa với tồn kho:</strong> Fan đủ điều kiện nhận quyền mua sớm vẫn có thể gặp trường hợp sản phẩm hết hàng nếu số lượng vật phẩm giới hạn.
            </li>
            {isEarlyAccess && (
              <li style={{ color: '#92400E' }}>
                <strong>Mua sớm vé / sản phẩm:</strong> Chỉ xác thực quyền ưu tiên trong khung giờ mở bán demo, không đảm bảo suất ngồi hoặc quyền tương tác độc quyền ngoài kế hoạch phát sóng.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
};
