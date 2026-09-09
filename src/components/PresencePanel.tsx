import React from 'react';
import { Session } from '../domain/types';
import { Radio, AlertCircle, WifiOff, RefreshCw, Film, Sparkles } from 'lucide-react';

export interface PresencePanelProps {
  session: Session;
}

export const PresencePanel: React.FC<PresencePanelProps> = ({ session }) => {
  const getPresenceDetails = () => {
    switch (session.artistPresence) {
      case 'present':
        return {
          label: 'Nghệ sĩ đang hiện diện trực tiếp',
          color: '#10B981',
          bg: '#ECFDF5',
          border: '#A7F3D0',
          icon: <Radio size={14} className="pulse-icon" />,
        };
      case 'reconnecting':
        return {
          label: 'Đang thiết lập lại kết nối tín hiệu cùng nghệ sĩ...',
          color: '#D97706',
          bg: '#FFFBEB',
          border: '#FDE68A',
          icon: <RefreshCw size={14} className="spin-icon" />,
        };
      case 'disconnected':
        return {
          label: 'Nghệ sĩ đã ngắt kết nối · Không thay thế bằng AI',
          color: '#DC2626',
          bg: '#FEF2F2',
          border: '#FECACA',
          icon: <WifiOff size={14} />,
        };
      case 'absent':
      default:
        return {
          label: 'Nghệ sĩ không có mặt trong phân đoạn này',
          color: 'var(--muted)',
          bg: 'var(--bg)',
          border: 'var(--border)',
          icon: <AlertCircle size={14} />,
        };
    }
  };

  const presence = getPresenceDetails();
  const isRecorded = session.segmentMode === 'recorded';

  return (
    <section
      className="card"
      style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: presence.bg,
        border: `1px solid ${presence.border}`,
      }}
      aria-label="Bảng trạng thái hiện diện và phân đoạn"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: presence.color,
            fontWeight: '700',
            fontSize: 'var(--text-sm)',
          }}
        >
          {presence.icon}
          <span id="presence-status-label">{presence.label}</span>
        </div>

        {/* Persistent DEMO badge (§2.2) */}
        <span className="demo-badge" aria-label="Huy hiệu thử nghiệm">DEMO</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: 'var(--text-xs)' }}>
        {/* Segment Mode distinction (§2.3) */}
        <span
          className="tag"
          style={{
            backgroundColor: isRecorded ? '#FEF3C7' : '#EDE9FE',
            color: isRecorded ? '#92400E' : 'var(--primary)',
            fontWeight: '700',
          }}
          id="segment-mode-tag"
        >
          {isRecorded ? (
            <>
              <Film size={12} style={{ marginRight: '4px' }} />
              <span>Bản ghi đội ngũ kỹ thuật</span>
            </>
          ) : (
            <>
              <Sparkles size={12} style={{ marginRight: '4px' }} />
              <span>Phân đoạn trực tiếp</span>
            </>
          )}
        </span>

        {/* AI Usage Disclosure (§5.2) */}
        <span style={{ color: 'var(--muted)' }}>
          AI: <strong>{session.aiUse === 'none' ? 'Không sử dụng' : session.aiUse === 'captions' ? 'Phụ đề tự động' : 'Dịch thuật'}</strong>
        </span>
      </div>
    </section>
  );
};
