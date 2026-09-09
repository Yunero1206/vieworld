import React from 'react';
import { Membership, World } from '../domain/types';
import { Award, CheckCircle2, AlertCircle, Clock, Sparkles, Heart } from 'lucide-react';

interface MembershipCardProps {
  world: World;
  membership?: Membership;
  onUpgrade?: () => void;
  isFollowed?: boolean;
  onToggleFollow?: () => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  world,
  membership,
  onUpgrade,
  isFollowed = false,
  onToggleFollow,
}) => {
  const status = membership?.status || 'inactive';

  const formatVietnamTime = (isoString?: string) => {
    if (!isoString) return 'Chưa xác định';
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

  return (
    <div
      className="card"
      style={{
        padding: '24px',
        backgroundColor: 'var(--surface)',
        border: status === 'active' ? '2px solid var(--primary)' : '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        boxShadow: status === 'active' ? '0 4px 16px rgba(101, 81, 200, 0.12)' : 'none',
      }}
      data-testid={`membership-card-${world.id}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: status === 'active' ? 'var(--primary)' : 'var(--bg)',
              color: status === 'active' ? '#FFFFFF' : 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: 0 }}>
                Hội viên {world.name}
              </h3>
              <span className="demo-badge">DEMO</span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', margin: 0 }}>
              Mã chương trình: <code>{membership?.id || `member-${world.id}-program`}</code>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {status === 'active' && (
            <span
              className="tag"
              style={{
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontWeight: '700',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              data-testid="membership-status-active"
            >
              <CheckCircle2 size={14} />
              <span>Đang hoạt động (Active)</span>
            </span>
          )}

          {status === 'expired' && (
            <span
              className="tag"
              style={{
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                fontWeight: '700',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              data-testid="membership-status-expired"
            >
              <AlertCircle size={14} />
              <span>Đã hết hạn (Expired)</span>
            </span>
          )}

          {status === 'inactive' && (
            <span
              className="tag"
              style={{
                backgroundColor: 'var(--bg)',
                color: 'var(--muted)',
                fontWeight: '700',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              data-testid="membership-status-inactive"
            >
              <span>Chưa tham gia (Inactive)</span>
            </span>
          )}
        </div>
      </div>

      {/* Distinction Callout: Follow vs Membership (§2.3) */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-xs)',
          lineHeight: 1.6,
          color: 'var(--ink)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong>Phân định rõ ràng (§2.3):</strong> Theo dõi (Follow) là kết nối tự do và hoàn toàn miễn phí. Đăng ký hội viên là chương trình gắn kết độc lập, cung cấp quyền lợi có điều kiện.
          </div>
          {onToggleFollow && (
            <button
              type="button"
              onClick={onToggleFollow}
              className={`btn ${isFollowed ? 'btn-secondary' : 'btn-primary'}`}
              style={{ fontSize: 'var(--text-xs)', padding: '4px 10px' }}
              aria-label={isFollowed ? `Bỏ theo dõi ${world.name}` : `Theo dõi ${world.name}`}
            >
              <Heart size={12} fill={isFollowed ? 'currentColor' : 'none'} style={{ marginRight: '4px' }} />
              <span>{isFollowed ? 'Đang theo dõi World' : 'Theo dõi World miễn phí'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Details & Next Action */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {status === 'active' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)' }}>
              <Clock size={16} color="var(--primary)" />
              <span>
                Thời hạn hội viên đến: <strong>{formatVietnamTime(membership?.expiresAt)}</strong> (Asia/Ho_Chi_Minh)
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', margin: 0 }}>
              Hành động tiếp theo: Bạn đang sở hữu tư cách hội viên hợp lệ. Có thể kiểm tra và kích hoạt các quyền lợi bên dưới.
            </p>
          </>
        )}

        {status === 'expired' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', color: '#B45309' }}>
              <AlertCircle size={16} />
              <span>Hội viên đã hết hiệu lực từ ngày: {formatVietnamTime(membership?.expiresAt)}</span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', margin: 0 }}>
              Hành động tiếp theo: Bạn có thể nhấn gia hạn mô phỏng để khôi phục trạng thái hội viên mà không làm ảnh hưởng hay thay đổi sai lệch dữ liệu quyền lợi đã tích lũy.
            </p>
          </>
        )}

        {status === 'inactive' && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', margin: 0 }}>
            Hành động tiếp theo: Nhấn tham gia gói hội viên thử nghiệm để đủ điều kiện xét duyệt các quyền lợi độc quyền.
          </p>
        )}
      </div>

      {/* Action / Upgrade simulation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          Mô phỏng phi thương mại · Không thu tiền thật
        </span>

        {status !== 'active' ? (
          <button
            type="button"
            onClick={onUpgrade}
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-sm)', padding: '10px 20px', gap: '8px' }}
            id={`upgrade-membership-btn-${world.id}`}
            data-testid={`upgrade-membership-btn-${world.id}`}
          >
            <Sparkles size={16} />
            <span>{status === 'expired' ? 'Mô phỏng: Gia hạn hội viên' : 'Mô phỏng: Nâng cấp hội viên'}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-xs)', padding: '8px 16px', opacity: 0.8, cursor: 'default' }}
            aria-disabled="true"
          >
            <CheckCircle2 size={14} color="#15803D" style={{ marginRight: '6px' }} />
            <span>Đã là hội viên chính thức</span>
          </button>
        )}
      </div>
    </div>
  );
};
