import { fireEvent,render,screen } from '@testing-library/react';
import { describe,expect,it,vi } from 'vitest';
import { DisplayNotification } from '../components/notifications/notification.types';
import { NotificationOverlay } from '../components/notifications/NotificationOverlay';


describe('In-World Notification Board Feature Suite', () => {
  const sampleNotifications: DisplayNotification[] = [
    {
      id: 'notif-1',
      type: 'artist',
      categoryLabel: 'Artist Drop',
      categoryDotColor: '#2F6650',
      title: 'Artist A vừa mở Drop-in trò chuyện',
      body: 'Gặp gỡ thân mật cùng Artist A lúc 20:00 tối nay.',
      timeAgo: '2 giờ trước',
      read: false,
      targetRoute: '/sessions/session-dropin-a',
    },
    {
      id: 'notif-2',
      type: 'order',
      categoryLabel: 'Đơn hàng VieCollect',
      categoryDotColor: '#D97706',
      title: 'Đơn hàng #VIE-2026 đã giao thành công',
      body: 'Gói phụ kiện độc quyền đã sẵn sàng trong My Space.',
      timeAgo: 'Hôm qua',
      read: true,
      targetRoute: '/orders/order-1',
    },
  ];

  describe('3. NotificationOverlay Component & Accessibility', () => {
    it('keeps one unified inbox and closes immediately with Escape', () => {
      const handleClose = vi.fn();
      render(<NotificationOverlay isOpen onClose={handleClose} notifications={sampleNotifications} onSelectNotification={vi.fn()} onMarkAllAsRead={vi.fn()} />);
      expect(screen.getByRole('dialog', { name: 'Bảng thông báo' })).toBeInTheDocument();
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
      expect(screen.getByRole('region', { name: 'Tất cả thông báo' })).toBeInTheDocument();
      expect(screen.queryByText(/Xem chi tiết|Xem tất cả thông báo/)).not.toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
    it('renders dialog portal with accessibility attributes and handles close button', () => {
      const handleClose = vi.fn();

      render(
        <NotificationOverlay
          isOpen={true}
          onClose={handleClose}
          notifications={sampleNotifications}
          onSelectNotification={vi.fn()}
          onMarkAllAsRead={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');

      // Close button
      const closeBtn = screen.getByRole('button', { name: /đóng bảng thông báo/i });
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press', () => {
      const handleClose = vi.fn();

      render(
        <NotificationOverlay
          isOpen={true}
          onClose={handleClose}
          notifications={sampleNotifications}
          onSelectNotification={vi.fn()}
          onMarkAllAsRead={vi.fn()}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when isOpen is false', () => {
      render(
        <NotificationOverlay
          isOpen={false}
          onClose={vi.fn()}
          notifications={sampleNotifications}
          onSelectNotification={vi.fn()}
          onMarkAllAsRead={vi.fn()}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
