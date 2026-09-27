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
          bg: 'var(--surface-subtle)',
          border: 'var(--border)',
          text: 'var(--ink)',
          icon: <AlertCircle size={18} aria-hidden="true" />,
        };
      case 'success':
        return {
          bg: 'var(--surface-subtle)',
          border: 'var(--border)',
          text: 'var(--ink)',
          icon: <CheckCircle size={18} aria-hidden="true" />,
        };
      case 'info':
      default:
        return {
          bg: 'var(--surface-subtle)',
          border: 'var(--border)',
          text: 'var(--ink)',
          icon: <Info size={18} aria-hidden="true" />,
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
