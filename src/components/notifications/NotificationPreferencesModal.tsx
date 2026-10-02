import React from 'react';
import { Bell, Sparkles, ShoppingBag, Headphones, Megaphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UtilityDialog } from '../account/UtilityDialog';

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
      desc: 'Nhắc lịch live và sự kiện bạn đã đăng ký.',
      color: '#2F6650',
    },
    {
      key: 'capsuleReady' as const,
      icon: Sparkles,
      title: 'Kỷ niệm sẵn sàng',
      desc: 'Khi kỷ niệm từ buổi bạn tham gia được lưu vào My Space.',
      color: '#2563EB',
    },
    {
      key: 'orderUpdates' as const,
      icon: ShoppingBag,
      title: 'Đơn hàng & vật phẩm',
      desc: 'Xác nhận đơn demo và vật phẩm mới trong Bộ sưu tập.',
      color: '#D97706',
    },
    {
      key: 'supportUpdates' as const,
      icon: Headphones,
      title: 'Yêu cầu hỗ trợ',
      desc: 'Cập nhật yêu cầu về đơn hàng, quyền lợi hoặc dữ liệu của bạn.',
      color: '#4F46E5',
    },
    {
      key: 'promotional' as const,
      icon: Megaphone,
      title: 'Tin từ VieSHOP & chương trình',
      desc: 'Vật phẩm và chương trình mới. Nhóm này không bắt buộc.',
      color: '#DC2626',
    },
  ];

  return <UtilityDialog title="Cài đặt thông báo"
    subtitle="Chọn những điều bạn muốn được nhắc. Thay đổi được lưu ngay trong bản demo."
    onClose={onClose} returnFocusRef={returnFocusRef} testId="notification-preferences-dialog"
    footer={<button type="button" className="vw-utility-primary" onClick={onClose}>Xong</button>}>
        <div className="vw-notification-options">
          {preferenceItems.map(({ key, icon: Icon, title, desc }) => {
            const isEnabled = prefs[key] ?? true;
            return (
              <div key={key} className="vw-notification-option">
                <Icon size={20} aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <p>{desc}</p>
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

  </UtilityDialog>;
};
