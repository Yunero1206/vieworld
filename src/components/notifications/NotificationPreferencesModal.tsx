import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Sparkles, ShoppingBag, Headphones, Megaphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, dispatch } = useApp();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const prefs = state.notificationPreferences || {
    sessionReminders: true,
    capsuleReady: true,
    supportUpdates: true,
    orderUpdates: true,
    promotional: false,
  };

  const handleToggle = (key: keyof typeof prefs) => {
    dispatch({
      type: 'UPDATE_NOTIFICATION_PREFERENCES',
      preferences: {
        ...prefs,
        [key]: !prefs[key],
      },
    });
  };

  const preferenceItems = [
    {
      key: 'sessionReminders' as const,
      icon: Bell,
      title: 'Nhắc nhở sự kiện & Phiên trực tiếp',
      desc: 'Nhận thông báo khi giữ chỗ (RSVP), khi sảnh chờ mở và khi phiên giao lưu nghệ sĩ ảo bắt đầu.',
      color: '#2F6650',
    },
    {
      key: 'capsuleReady' as const,
      icon: Sparkles,
      title: 'Kỷ vật Moment Capsule',
      desc: 'Thông báo khi kỷ vật ghi nhận tham gia phiên trực tiếp được tạo và lưu trữ trong My Space.',
      color: '#2563EB',
    },
    {
      key: 'orderUpdates' as const,
      icon: ShoppingBag,
      title: 'Cập nhật đơn hàng VieSHOP',
      desc: 'Thông báo xác nhận đơn hàng mô phỏng và bàn giao vật phẩm vào Bộ sưu tập của bạn.',
      color: '#D97706',
    },
    {
      key: 'supportUpdates' as const,
      icon: Headphones,
      title: 'Hồ sơ hỗ trợ & Đối soát',
      desc: 'Cập nhật tiến trình xác minh, kết luận hỗ trợ và đồng bộ quyền lợi từ ban tổ chức.',
      color: '#4F46E5',
    },
    {
      key: 'promotional' as const,
      icon: Megaphone,
      title: 'Thông tin quảng bá & Tin tức mới',
      desc: 'Tách riêng thông tin ra mắt vật phẩm, chương trình quà tặng đặc biệt và sự kiện mùa giải.',
      color: '#DC2626',
    },
  ];

  return createPortal(
    <div className="vw-prefs-backdrop" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="vw-prefs-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vw-prefs-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vw-prefs-header">
          <div className="vw-prefs-header-info">
            <h2 id="vw-prefs-title" className="vw-prefs-title">
              Cài đặt thông báo
            </h2>
            <p className="vw-prefs-subtitle">
              Tùy chỉnh các thông báo bạn muốn nhận trong thế giới VieWorld.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="vw-prefs-close-btn"
            onClick={onClose}
            aria-label="Đóng cài đặt thông báo"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="vw-prefs-list">
          {preferenceItems.map(({ key, icon: Icon, title, desc, color }) => {
            const isEnabled = prefs[key] ?? true;
            return (
              <div key={key} className="vw-prefs-item">
                <div className="vw-prefs-item-icon" style={{ backgroundColor: `${color}14`, color }}>
                  <Icon size={18} />
                </div>
                <div className="vw-prefs-item-content">
                  <div className="vw-prefs-item-title-row">
                    <strong className="vw-prefs-item-name">{title}</strong>
                  </div>
                  <p className="vw-prefs-item-desc">{desc}</p>
                </div>
                <label className="vw-switch" aria-label={`Bật/tắt ${title}`}>
                  <input
                    type="checkbox"
                    data-testid={`pref-${key}`}
                    checked={isEnabled}
                    onChange={() => handleToggle(key)}
                  />
                  <span className="vw-slider" />
                </label>
              </div>
            );
          })}
        </div>

        <div className="vw-prefs-footer">
          <button type="button" className="vw-prefs-done-btn" onClick={onClose}>
            Xong
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
