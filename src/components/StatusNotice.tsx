import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface StatusNoticeProps {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  onDismiss?: () => void;
}

export const StatusNotice: React.FC<StatusNoticeProps> = ({
  message,
  type = 'info',
  onDismiss,
}) => {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'var(--danger-bg)',
          border: '#F8B4BD',
          text: 'var(--danger)',
          icon: <AlertCircle size={18} color="var(--danger)" aria-hidden="true" />,
        };
      case 'warning':
        return {
          bg: '#FFF8E6',
          border: '#FFE29A',
          text: '#7A4100',
          icon: <AlertCircle size={18} color="#B45309" aria-hidden="true" />,
        };
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#065F46',
          icon: <CheckCircle size={18} color="#059669" aria-hidden="true" />,
        };
      case 'info':
      default:
        return {
          bg: '#EDE9FE',
          border: '#DDD6FE',
          text: 'var(--primary)',
          icon: <Info size={18} color="var(--primary)" aria-hidden="true" />,
        };
    }
  };

  const style = getStyles();

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '10px 16px',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        color: style.text,
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {style.icon}
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Đóng thông báo"
          style={{ color: style.text, opacity: 0.8, padding: '2px' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
