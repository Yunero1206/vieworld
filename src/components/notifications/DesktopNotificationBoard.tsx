import React from 'react';
import { ArrowRight, CheckCheck, Leaf } from 'lucide-react';
import { DisplayNotification } from './notification.types';
import { NotificationNotice } from './NotificationNotice';

interface DesktopNotificationBoardProps {
  notifications: DisplayNotification[];
  onSelectNotification: (item: DisplayNotification) => void;
  onViewAll: () => void;
  onMarkAllAsRead?: () => void;
}

export const DesktopNotificationBoard: React.FC<DesktopNotificationBoardProps> = ({
  notifications,
  onSelectNotification,
  onViewAll,
  onMarkAllAsRead,
}) => {
  // Sort notifications: unread first, then by date recent
  const sorted = [...notifications].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  // Highlight up to 4 priority notices on the 2x2 board
  const visibleNotices = sorted.slice(0, 4);

  return (
    <div className="vw-wide-board-card">
      <header className="vw-bulletin-heading"><Leaf size={22} aria-hidden="true"/><span>VieWorld</span>
        <h2 id="vw-notif-dialog-title" className="vw-board-title">Bảng thông báo</h2>
        <p>{notifications.filter(item => !item.read).length ? `${notifications.filter(item => !item.read).length} điều mới dành cho bạn` : 'Một góc nhỏ để không bỏ lỡ điều quan trọng.'}</p>
      </header>

      {/* 2x2 Pinned Notices Safe Board Surface */}
      <div
        className="vw-wide-board-surface"
        role="region"
        aria-label="Bảng thông báo cộng đồng VieWorld"
      >
        {visibleNotices.length === 0 ? (
          <div className="vw-wide-empty-notice">
            <p>Mọi thứ đều yên tĩnh. Hiện chưa có thông báo mới.</p>
          </div>
        ) : (
          <div className="vw-wide-grid-2x2">
            {visibleNotices.map((item, idx) => (
              <NotificationNotice
                key={item.id}
                item={item}
                index={idx}
                onSelect={onSelectNotification}
              />
            ))}
          </div>
        )}

        {/* Restrained In-Board Action: "Xem tất cả thông báo →" */}
        <div className="vw-wide-board-footer">
          {onMarkAllAsRead && notifications.some(item => !item.read) && <button type="button" className="vw-bulletin-mark" onClick={onMarkAllAsRead}><CheckCheck size={16}/> Đánh dấu đã đọc</button>}
          <button
            type="button"
            className="vw-wide-view-all-btn"
            onClick={onViewAll}
            aria-label="Xem tất cả thông báo trong danh sách đầy đủ"
          >
            <span>Xem tất cả thông báo</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
