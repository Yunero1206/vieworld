import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { NotificationOverlay } from '../components/notifications/NotificationOverlay';
import { DesktopNotificationBoard } from '../components/notifications/DesktopNotificationBoard';
import { MobileNotificationPopover } from '../components/notifications/MobileNotificationPopover';
import { DisplayNotification } from '../components/notifications/notification.types';


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
      categoryLabel: 'Đơn hàng VieSHOP',
      categoryDotColor: '#D97706',
      title: 'Đơn hàng #VIE-2026 đã giao thành công',
      body: 'Gói phụ kiện độc quyền đã sẵn sàng trong My Space.',
      timeAgo: 'Hôm qua',
      read: true,
      targetRoute: '/orders/order-1',
    },
  ];

  describe('1. NotificationBell Component', () => {
    it('renders bell button with unread count badge when unread > 0', () => {
      const handleClick = vi.fn();
      render(<NotificationBell unreadCount={2} isOpen={false} onClick={handleClick} />);

      const button = screen.getByRole('button', { name: /bảng thông báo/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not display badge when unreadCount is 0', () => {
      render(<NotificationBell unreadCount={0} isOpen={false} onClick={vi.fn()} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('3. NotificationOverlay Component & Accessibility', () => {
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

  describe('5. Desktop Wide Community Board (2x2 Layout)', () => {
    it('renders 2x2 pinned paper notices, polaroids, and bottom action button', () => {
      const handleSelect = vi.fn();
      const handleViewAll = vi.fn();

      render(
        <DesktopNotificationBoard
          notifications={sampleNotifications}
          onSelectNotification={handleSelect}
          onViewAll={handleViewAll}
        />
      );

      // Check board region
      expect(screen.getByRole('region', { name: /Bảng thông báo cộng đồng/i })).toBeInTheDocument();

      // Check notices rendered
      expect(screen.getByText('Artist A vừa mở Drop-in trò chuyện')).toBeInTheDocument();
      expect(screen.getByText('Đơn hàng #VIE-2026 đã giao thành công')).toBeInTheDocument();

      // Click on notice
      fireEvent.click(screen.getByText('Artist A vừa mở Drop-in trò chuyện'));
      expect(handleSelect).toHaveBeenCalledWith(sampleNotifications[0]);

      // Click "Xem tất cả thông báo"
      const viewAllBtn = screen.getByRole('button', { name: /Xem tất cả thông báo/i });
      expect(viewAllBtn).toBeInTheDocument();
      fireEvent.click(viewAllBtn);
      expect(handleViewAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('6. Mobile Notification Popover', () => {
    it('renders lightweight vertical list and quick mark-read button', () => {
      const handleSelect = vi.fn();
      const handleMarkAll = vi.fn();
      const handleViewAll = vi.fn();
      const handleClose = vi.fn();

      render(
        <MobileNotificationPopover
          notifications={sampleNotifications}
          onSelectNotification={handleSelect}
          onMarkAllAsRead={handleMarkAll}
          onViewAll={handleViewAll}
          onClose={handleClose}
        />
      );

      expect(screen.getByRole('region', { name: /Thông báo di động/i })).toBeInTheDocument();
      expect(screen.getByText('Artist A vừa mở Drop-in trò chuyện')).toBeInTheDocument();

      // Quick mark all as read
      const markBtn = screen.getByRole('button', { name: /Đánh dấu tất cả thông báo là đã đọc/i });
      fireEvent.click(markBtn);
      expect(handleMarkAll).toHaveBeenCalledTimes(1);
    });
  });
});
