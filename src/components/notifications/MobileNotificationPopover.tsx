import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { DisplayNotification } from './notification.types';

interface MobileNotificationPopoverProps {
  notifications: DisplayNotification[];
  onSelectNotification: (item: DisplayNotification) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
  onClose: () => void;
}

export const MobileNotificationPopover: React.FC<MobileNotificationPopoverProps> = ({
  notifications,
  onSelectNotification,
  onMarkAllAsRead,
  onViewAll,
  onClose,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="vw-mobile-notif-popover" role="region" aria-label="Thông báo di động">
      {/* Header */}
      <div className="vw-mobile-notif-header">
        <div className="vw-mobile-notif-title-wrap">
          <h2 className="vw-mobile-notif-title">Thông báo</h2>
          {unreadCount > 0 && (
            <span className="vw-mobile-notif-badge">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="vw-mobile-mark-read-btn"
            onClick={onMarkAllAsRead}
            aria-label="Đánh dấu tất cả thông báo là đã đọc"
            title="Đánh dấu đã đọc tất cả"
          >
            <Check size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="vw-mobile-notif-list" role="feed" aria-label="Danh sách thông báo">
        {notifications.length === 0 ? (
          <div className="vw-mobile-empty">
            <p>Không có thông báo mới.</p>
          </div>
        ) : (
          notifications.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className={`vw-mobile-item ${item.read ? 'is-read' : 'is-unread'}`}
              role="button"
              tabIndex={0}
              onClick={() => {
                onSelectNotification(item);
                onClose();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectNotification(item);
                  onClose();
                }
              }}
            >
              <div className="vw-mobile-item-top">
                <span
                  className="vw-mobile-dot"
                  style={{ backgroundColor: item.categoryDotColor || '#2F6650' }}
                  aria-hidden="true"
                />
                <span className="vw-mobile-category">{item.categoryLabel}</span>
                <span className="vw-mobile-time">{item.timeAgo}</span>
              </div>
              <h3 className="vw-mobile-item-title">{item.title}</h3>
              {item.body && <p className="vw-mobile-item-desc">{item.body}</p>}
            </div>
          ))
        )}
      </div>

      {/* Footer View All */}
      <div className="vw-mobile-notif-footer">
        <button
          type="button"
          className="vw-mobile-view-all-btn"
          onClick={() => {
            onViewAll();
          }}
        >
          <span>Xem tất cả thông báo</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
