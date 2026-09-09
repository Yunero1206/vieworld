import React from 'react';
import { Benefit } from '../domain/types';
import { Link } from 'react-router-dom';
import { Gift, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

interface BenefitCardProps {
  benefit: Benefit;
  onClaim?: (benefitId: string) => void;
  showDetailLink?: boolean;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({
  benefit,
  onClaim,
  showDetailLink = true,
}) => {
  const formatVietnamTime = (isoString: string) => {
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

  const isEarlyAccess = benefit.id === 'benefit-early-access-01' || benefit.title.toLowerCase().includes('sớm');

  return (
    <div
      className="card"
      style={{
        padding: '20px 24px',
        backgroundColor: 'var(--surface)',
        border: benefit.status === 'eligible' ? '2px solid #86EFAC' : '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
      data-testid={`benefit-card-${benefit.id}`}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: benefit.status === 'claimed' ? '#EDE9FE' : benefit.status === 'eligible' ? '#DCFCE7' : 'var(--bg)',
              color: benefit.status === 'claimed' ? 'var(--primary)' : benefit.status === 'eligible' ? '#15803D' : 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Gift size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: 0 }}>
                {benefit.title}
              </h4>
              <span className="demo-badge">DEMO</span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Mã: <code>{benefit.id}</code> · Nguồn: <code>{benefit.sourceRef}</code>
            </div>
          </div>
        </div>

        {/* Status Tag */}
        <div>
          {benefit.status === 'eligible' && (
            <span
              className="tag"
              style={{
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              data-testid={`benefit-status-${benefit.id}`}
            >
              <CheckCircle2 size={12} />
              <span>Đủ điều kiện (Eligible)</span>
            </span>
          )}

          {benefit.status === 'pending' && (
            <span
              className="tag"
              style={{
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              data-testid={`benefit-status-${benefit.id}`}
            >
              <Clock size={12} />
              <span>Đang chờ đối soát (Pending)</span>
            </span>
          )}

          {benefit.status === 'claimed' && (
            <span
              className="tag"
              style={{
                backgroundColor: '#EDE9FE',
                color: 'var(--primary)',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              data-testid={`benefit-status-${benefit.id}`}
            >
              <ShieldCheck size={12} />
              <span>Đã kích hoạt · Sẵn sàng dùng</span>
            </span>
          )}

          {benefit.status === 'expired' && (
            <span
              className="tag"
              style={{
                backgroundColor: '#FEE2E2',
                color: 'var(--danger)',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              data-testid={`benefit-status-${benefit.id}`}
            >
              <AlertTriangle size={12} />
              <span>Đã hết hạn (Expired)</span>
            </span>
          )}

          {benefit.status === 'revoked' && (
            <span
              className="tag"
              style={{
                backgroundColor: '#F3F4F6',
                color: '#4B5563',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
              }}
              data-testid={`benefit-status-${benefit.id}`}
            >
              <span>Đã thu hồi (Revoked)</span>
            </span>
          )}
        </div>
      </div>

      {/* Reason & Rule explanation */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-xs)',
          lineHeight: 1.6,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div>
          <span style={{ color: 'var(--muted)' }}>Căn cứ xác định (Reason Code): </span>
          <strong><code>{benefit.reasonCode}</code></strong>
        </div>
        <div>
          <span style={{ color: 'var(--muted)' }}>Hành động tiếp theo: </span>
          <span>{benefit.nextAction}</span>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '11px' }}>
          Cập nhật lần cuối: {formatVietnamTime(benefit.updatedAt)} (Asia/Ho_Chi_Minh)
        </div>
      </div>

      {/* Constitutional Disclosure for Early Access (§2.3 & docs/packets/P07.md) */}
      {isEarlyAccess && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            color: '#92400E',
            lineHeight: 1.5,
          }}
        >
          <strong>Lưu ý:</strong> Quyền ưu tiên mua sớm chỉ là thứ tự mở đợt mở bán thử nghiệm, không đảm bảo chắc chắn còn hàng trong kho và không bao gồm quyền tương tác riêng với nghệ sĩ.
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
        {showDetailLink ? (
          <Link
            to={`/benefits/${benefit.id}`}
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
            id={`benefit-link-detail-${benefit.id}`}
          >
            <span>Chi tiết & điều kiện đối soát</span>
            <ArrowRight size={12} />
          </Link>
        ) : (
          <span />
        )}

        <div>
          {benefit.status === 'eligible' && onClaim && (
            <button
              type="button"
              onClick={() => onClaim(benefit.id)}
              className="btn btn-primary"
              style={{ fontSize: 'var(--text-xs)', padding: '8px 16px' }}
              id={`claim-benefit-btn-${benefit.id}`}
              data-testid={`claim-benefit-btn-${benefit.id}`}
            >
              Kích hoạt quyền lợi
            </button>
          )}

          {benefit.status === 'claimed' && (
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: '#15803D',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              data-testid={`benefit-claimed-indicator-${benefit.id}`}
            >
              <CheckCircle2 size={14} />
              <span>Đã kích hoạt thành công</span>
            </span>
          )}

          {benefit.status === 'pending' && (
            <button
              type="button"
              disabled
              className="btn btn-secondary"
              style={{ fontSize: 'var(--text-xs)', padding: '6px 14px', opacity: 0.6, cursor: 'not-allowed' }}
              aria-disabled="true"
              id={`claim-benefit-btn-${benefit.id}`}
            >
              Chờ đối soát từ ban tổ chức
            </button>
          )}

          {(benefit.status === 'expired' || benefit.status === 'revoked') && (
            <button
              type="button"
              disabled
              className="btn btn-secondary"
              style={{ fontSize: 'var(--text-xs)', padding: '6px 14px', opacity: 0.5, cursor: 'not-allowed' }}
              aria-disabled="true"
              id={`claim-benefit-btn-${benefit.id}`}
            >
              Không thể kích hoạt
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
