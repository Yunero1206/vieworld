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
          icon: <Radio size={14} className="pulse-icon" />,
        };
      case 'reconnecting':
        return {
          label: 'Đang thiết lập lại kết nối tín hiệu cùng nghệ sĩ...',
          color: '#D97706',
          icon: <RefreshCw size={14} className="spin-icon" />,
        };
      case 'disconnected':
        return {
          label: 'Nghệ sĩ đã ngắt kết nối · Không thay thế bằng AI',
          color: '#DC2626',
          icon: <WifiOff size={14} />,
        };
      case 'absent':
      default:
        return {
          label: 'Nghệ sĩ không có mặt trong phân đoạn này',
          color: 'var(--muted)',
          icon: <AlertCircle size={14} />,
        };
    }
  };

  const presence = getPresenceDetails();
  const isRecorded = session.segmentMode === 'recorded';

  return (
    <div
      className="presence-status-ribbon"
      style={{
        padding: '8px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--border)',
        marginBottom: '14px',
        fontSize: 'var(--text-xs)',
      }}
      aria-label="Bảng trạng thái hiện diện và phân đoạn"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: presence.color,
            fontWeight: '700',
            fontSize: 'var(--text-xs)',
          }}
        >
          {presence.icon}
          <span id="presence-status-label">{presence.label}</span>
        </div>

        <span style={{ color: 'var(--border)' }}>·</span>

        {/* Segment Mode distinction (§2.3) */}
        <span
          className="tag"
          style={{
            backgroundColor: isRecorded ? '#F3F4F6' : '#DCFCE7',
            color: isRecorded ? '#374151' : '#15803D',
            fontWeight: '700',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
          }}
          id="segment-mode-tag"
        >
          {isRecorded ? (
            <>
              <Film size={11} style={{ marginRight: '4px' }} />
              <span>Bản ghi đội ngũ kỹ thuật</span>
            </>
          ) : (
            <>
              <Sparkles size={11} style={{ marginRight: '4px' }} />
              <span>Phân đoạn trực tiếp</span>
            </>
          )}
        </span>

        {/* Canonical segment-mode test tag */}
        <span
          className="tag"
          style={{
            backgroundColor: isRecorded ? '#F3F4F6' : '#DCFCE7',
            color: isRecorded ? '#374151' : '#15803D',
            fontWeight: '700',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
          }}
          data-testid="segment-mode-tag"
        >
          {isRecorded ? 'Đã ghi hình trước (Recorded)' : 'Trực tiếp (Live)'}
        </span>

        {/* Host role tag */}
        <span
          className="tag"
          style={{
            backgroundColor: session.hostRole === 'team' ? '#EDE9FE' : '#FEF3C7',
            color: session.hostRole === 'team' ? 'var(--primary)' : '#B45309',
            fontWeight: '700',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
          }}
          data-testid="host-role-tag"
        >
          {session.hostRole === 'team' ? 'Đội ngũ phụ trách (Team)' : 'Nghệ sĩ (Artist)'}
        </span>

        {/* Format tag */}
        <span
          className="tag"
          style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', textTransform: 'capitalize' }}
          data-testid="session-format-tag"
        >
          {session.format}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', color: 'var(--muted)' }}>
        <span>
          Tín hiệu Studio · AI: <strong>{session.aiUse === 'none' ? 'Không sử dụng' : session.aiUse === 'captions' ? 'Phụ đề tự động' : 'Dịch thuật'}</strong>
        </span>
        <span className="demo-badge" aria-label="Huy hiệu thử nghiệm">DEMO</span>
      </div>
    </div>
  );
};
