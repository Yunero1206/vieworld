import { useEffect } from 'react';
import { ArrowLeft, X, CheckCheck } from 'lucide-react';
import { DisplayNotification } from './notification.types';

interface AllNotificationsDrawerProps {
  embedded?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onBackToBoard: () => void;
  notifications: DisplayNotification[];
  onSelectNotification: (item: DisplayNotification) => void;
  onMarkAllAsRead: () => void;
}

export const AllNotificationsDrawer: React.FC<AllNotificationsDrawerProps> = ({
  embedded = false,
  isOpen,
  onClose,
  onBackToBoard,
  notifications,
  onSelectNotification,
  onMarkAllAsRead,
}) => {


  useEffect(() => {
    if (!isOpen || embedded) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, embedded]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="vw-all-notif-panel" role={embedded ? 'region' : 'dialog'} aria-modal={embedded ? undefined : true} aria-labelledby="vw-all-notif-title">
      <div className="vw-all-notif-header">
        <button
          type="button"
          className="vw-all-back-btn"
          onClick={onBackToBoard}
          aria-label="Quay lại bảng thông báo"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          <span>Bảng thông báo</span>
        </button>

        <div className="vw-all-header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="vw-all-mark-read-btn"
              onClick={onMarkAllAsRead}
              aria-label="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck size={15} aria-hidden="true" />
              <span>Đã đọc tất cả</span>
            </button>
          )}

          <button
            type="button"
            className="vw-all-close-btn"
            onClick={onClose}
            aria-label="Đóng (Esc)"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="vw-all-title-bar">
        <h2 id="vw-all-notif-title" className="vw-all-title">
          Tất cả thông báo ({notifications.length})
        </h2>
      </div>

      <div className="vw-all-list" role="feed" aria-label="Danh sách tất cả thông báo">
        {notifications.length === 0 ? (
          <div className="vw-all-empty">
            <p>Chưa có thông báo nào được ghi nhận.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <article
              key={item.id}
              className={`vw-all-item ${item.read ? 'is-read' : 'is-unread'}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectNotification(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectNotification(item);
                }
              }}
            >
              {item.thumbnailUrl && (
                <div className="vw-all-thumb">
                  <img src={item.thumbnailUrl} alt="" loading="lazy" />
                </div>
              )}
              <div className="vw-all-item-body">
                <div className="vw-all-item-meta">
                  <span
                    className="vw-all-dot"
                    style={{ backgroundColor: item.categoryDotColor || '#2F6650' }}
                    aria-hidden="true"
                  />
                  <span className="vw-all-category">{item.categoryLabel}</span>
                  <span className="vw-all-time">{item.timeAgo}</span>
                </div>
                <h3 className="vw-all-item-title">{item.title}</h3>
                {item.body && <p className="vw-all-item-desc">{item.body}</p>}
                <div className="vw-all-item-cta">
                  <span>{item.ctaLabel || 'Xem chi tiết →'}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
