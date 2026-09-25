import React from 'react';
import { DisplayNotification } from './notification.types';

interface NotificationNoticeProps {
  item: DisplayNotification;
  onSelect: (item: DisplayNotification) => void;
  index: number;
}

export const NotificationNotice: React.FC<NotificationNoticeProps> = ({
  item,
  onSelect,
  index,
}) => {
  const handleClick = () => {
    onSelect(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(item);
    }
  };

  // Subtle organic rotation for physical pinned paper feel (-0.8deg to +0.8deg)
  const rotationAngles = ['-0.6deg', '0.5deg', '0.4deg', '-0.5deg'];
  const rotation = rotationAngles[index % rotationAngles.length];

  return (
    <article
      className={`vw-paper-notice ${item.read ? 'is-read' : 'is-unread'}`}
      style={{ '--notice-rotate': rotation } as React.CSSProperties}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${item.read ? 'Đã đọc' : 'Chưa đọc'}: ${item.categoryLabel} - ${item.title}`}
    >
      {/* Pinned tape strip at the top */}
      <div className="vw-notice-tape" aria-hidden="true" />

      <div className="vw-notice-layout">
        {/* Polaroid photo thumbnail on the left */}
        {item.thumbnailUrl && (
          <div className="vw-polaroid-frame" aria-hidden="true">
            <img
              src={item.thumbnailUrl}
              alt=""
              className="vw-polaroid-img"
              loading="lazy"
            />
          </div>
        )}

        {/* Content details on the right */}
        <div className="vw-notice-body">
          <div className="vw-notice-header">
            <div className="vw-notice-category">
              <span
                className="vw-notice-dot"
                style={{ backgroundColor: item.categoryDotColor || '#2F6650' }}
                aria-hidden="true"
              />
              <span className="vw-notice-category-text">{item.categoryLabel}</span>
            </div>
            <time className="vw-notice-time">{item.timeAgo}</time>
          </div>

          <h3 className="vw-notice-title">{item.title}</h3>

          {item.body && <p className="vw-notice-desc">{item.body}</p>}

          <div className="vw-notice-cta">
            <span className="vw-notice-cta-link">
              {item.ctaLabel || (item.targetRoute ? 'Xem chi tiết →' : 'Đã nhận')}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
