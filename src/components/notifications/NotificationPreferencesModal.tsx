import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Sparkles, ShoppingBag, Headphones, Megaphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  returnFocusRef,
}) => {
  const { state, dispatch } = useApp();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      } else if (e.key === 'Tab' && modalRef.current) {
        const elements = modalRef.current.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)');
        const first = elements[0];
        const last = elements[elements.length - 1];
        if ((e.shiftKey && document.activeElement === first) || (!e.shiftKey && document.activeElement === last) || !modalRef.current.contains(document.activeElement)) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      if (previousFocus?.isConnected) previousFocus.focus();
      else returnFocusRef?.current?.focus();
    };
  }, [isOpen, returnFocusRef]);

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
      title: 'Cuộc hẹn đã giữ chỗ',
      desc: 'Nhắc lịch live và sự kiện bạn đã đăng ký, từ phòng chờ đến lúc bắt đầu.',
      color: '#2F6650',
    },
    {
      key: 'capsuleReady' as const,
      icon: Sparkles,
      title: 'Kỷ niệm sẵn sàng',
      desc: 'Khi capsule ghi nhận buổi bạn tham gia được lưu vào My Space.',
      color: '#2563EB',
    },
    {
      key: 'orderUpdates' as const,
      icon: ShoppingBag,
      title: 'Đơn hàng & vật phẩm',
      desc: 'Xác nhận đơn hàng demo và cập nhật vật phẩm vào Bộ sưu tập của bạn.',
      color: '#D97706',
    },
    {
      key: 'supportUpdates' as const,
      icon: Headphones,
      title: 'Yêu cầu hỗ trợ',
      desc: 'Cập nhật yêu cầu của bạn về đơn hàng, quyền lợi hoặc dữ liệu cần kiểm tra.',
      color: '#4F46E5',
    },
    {
      key: 'promotional' as const,
      icon: Megaphone,
      title: 'Tin từ VieSHOP & chương trình',
      desc: 'Tin ra mắt vật phẩm và chương trình mới. Bạn có thể tắt riêng nhóm này.',
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
              Chỉ nhận những điều bạn muốn được nhắc. Không phải mọi cập nhật đều cần thông báo.
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
          {preferenceItems.map(({ key, icon: Icon, title, desc }) => {
            const isEnabled = prefs[key] ?? true;
            return (
              <div key={key} className="vw-prefs-item">
                <div className="vw-prefs-item-icon" style={{ backgroundColor: 'var(--appearance-selected)', color: 'var(--appearance-accent)' }}>
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
