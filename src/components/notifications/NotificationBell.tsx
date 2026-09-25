import { forwardRef } from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  unreadCount: number;
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const NotificationBell = forwardRef<HTMLButtonElement, NotificationBellProps>(
  ({ unreadCount, isOpen, onClick, className = '' }, ref) => {
    const label = unreadCount > 0
      ? `Bảng thông báo, có ${unreadCount} thông báo mới chưa đọc`
      : 'Bảng thông báo';

    return (
      <button
        ref={ref}
        type="button"
        className={`fw-icon fw-bell-btn ${className} ${isOpen ? 'active' : ''}`}
        onClick={onClick}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title={label}
      >
        <Bell size={19} aria-hidden="true" />
        {unreadCount > 0 && <i>{unreadCount > 99 ? '99+' : unreadCount}</i>}
      </button>
    );
  }
);

NotificationBell.displayName = 'NotificationBell';
