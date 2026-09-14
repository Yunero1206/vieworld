/**
 * Job 04 Acceptance Test Suite: Fan Personal Room Diorama & Interactive Objects
 *
 * Requirements (§Job 04 in ANTIGRAVITY_JOBS.md & VIEWORLD_WORLD_PLAN.md):
 * 1. Replaces the old 6-button dashboard with a 2.5D graybox diorama room matching music venue camera/scale.
 * 2. 3 Core Interactive Objects + Avatar on Stage:
 *    - Avatar Fan: Interactive avatar standing on rug, shows initial, equipped accessory, interactive speech bubble.
 *    - Kệ ba ô (3-Slot Shelf): 3 distinct display cubbies (Ô 1, Ô 2, Ô 3), opens capsule collection, meaningful empty state.
 *    - Tủ đồ Avatar: Wardrobe cabinet displaying equipped accessory status, opens wardrobe customizer.
 *    - Lịch trên tường (Wall Calendar): Displays upcoming RSVP count, opens RSVP schedule.
 * 3. Secondary Utility Dock: Quyền lợi, đơn hàng, hỗ trợ, lịch sử into secondary menu without losing route/recovery.
 * 4. Text Shortcuts: Conforms to Bible Rule 4 (No maze).
 * 5. Dynamic naming & Tenant Config: Zero hardcoding of "Linh" or tenant strings.
 * 6. Responsive & Accessible: All tap targets >= 44×44px, keyboard accessible.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { MyRoomScene } from '../components/MyRoomScene';
import { MyWorldView } from '../views/MyWorldView';

describe('Job 04 Acceptance: Fan Room 2.5D Diorama with Interactive Objects', () => {
  describe('1. MyRoomScene Component Hotspots & 3-Slot Shelf Behavior', () => {
    it('renders 2.5D diorama with 3-slot shelf, wardrobe cabinet, wall calendar, and avatar', () => {
      const onOpenSection = vi.fn();

      render(
        <MyRoomScene
          displayName="Minh An"
          accessoryName="Acoustic Pin"
          capsuleCount={2}
          benefitCount={3}
          orderCount={1}
          supportCount={0}
          upcomingCount={2}
          participationCount={2}
          recentCapsules={[
            { id: 'cap-1', title: 'Acoustic Night Live', worldName: 'Artist A' },
            { id: 'cap-2', title: 'Star Drop-in Chat', worldName: 'Artist A' },
          ]}
          myWorldTitle="Phòng tôi"
          capsulesTitle="Moment Capsules"
          onOpenSection={onOpenSection}
        />
      );

      // Verify diorama container
      expect(screen.getByTestId('my-room-scene')).toBeInTheDocument();
      expect(screen.getByText(/Phòng của Minh An/i)).toBeInTheDocument();

      // 1. Kệ 3 ô (Showcase Shelf)
      const shelfSpot = screen.getByTestId('room-shelf-hotspot');
      expect(shelfSpot).toBeInTheDocument();
      expect(shelfSpot).toHaveTextContent(/Kệ kỷ niệm 3 ô/i);
      expect(shelfSpot).toHaveTextContent(/2 Moment Capsules đã lưu/i);

      // Verify 3 distinct slots
      expect(within(shelfSpot).getByText('Ô 1')).toBeInTheDocument();
      expect(within(shelfSpot).getByText('Acoustic Night Live')).toBeInTheDocument();
      expect(within(shelfSpot).getByText('Ô 2')).toBeInTheDocument();
      expect(within(shelfSpot).getByText('Star Drop-in Chat')).toBeInTheDocument();
      expect(within(shelfSpot).getByText('Ô 3')).toBeInTheDocument();
      expect(within(shelfSpot).getByText('Trống')).toBeInTheDocument();

      // Click shelf opens capsules
      fireEvent.click(shelfSpot);
      expect(onOpenSection).toHaveBeenCalledWith('capsules');

      // 2. Tủ đồ (Wardrobe)
      const wardrobeSpot = screen.getByTestId('room-wardrobe-hotspot');
      expect(wardrobeSpot).toBeInTheDocument();
      expect(wardrobeSpot).toHaveTextContent(/Tủ đồ Avatar/i);
      expect(wardrobeSpot).toHaveTextContent(/Đang mặc: Acoustic Pin/i);

      // Click wardrobe opens wardrobe customizer
      fireEvent.click(wardrobeSpot);
      expect(onOpenSection).toHaveBeenCalledWith('wardrobe');

      // 3. Lịch trên tường (Calendar)
      const calendarSpot = screen.getByTestId('room-calendar-hotspot');
      expect(calendarSpot).toBeInTheDocument();
      expect(calendarSpot).toHaveTextContent(/Lịch hẹn sự kiện/i);
      expect(calendarSpot).toHaveTextContent(/2 sự kiện đã hẹn/i);

      // Click calendar opens follows/RSVP
      fireEvent.click(calendarSpot);
      expect(onOpenSection).toHaveBeenCalledWith('follows');

      // 4. Avatar Fan
      const avatarBtn = screen.getByTestId('room-avatar-hotspot');
      expect(avatarBtn).toBeInTheDocument();
      expect(within(avatarBtn).getByText('Minh An')).toBeInTheDocument();
      expect(within(avatarBtn).getByText('M')).toBeInTheDocument(); // initial
      expect(within(avatarBtn).getByText('✦ Acoustic Pin')).toBeInTheDocument();

      // Click avatar shows friendly speech bubble
      expect(screen.queryByTestId('room-avatar-greeting')).not.toBeInTheDocument();
      fireEvent.click(avatarBtn);
      expect(screen.getByTestId('room-avatar-greeting')).toBeInTheDocument();
      expect(screen.getByTestId('room-avatar-greeting')).toHaveTextContent(/Chào Minh An!/i);
    });

    it('displays meaningful empty state for all 3 slots, calendar, and wardrobe when fan is new', () => {
      const onOpenSection = vi.fn();

      render(
        <MyRoomScene
          displayName="Bảo Nhi"
          accessoryName={undefined}
          capsuleCount={0}
          benefitCount={0}
          orderCount={0}
          supportCount={0}
          upcomingCount={0}
          participationCount={0}
          recentCapsules={[]}
          myWorldTitle="Không gian cá nhân"
          capsulesTitle="Kỷ vật tham dự"
          onOpenSection={onOpenSection}
        />
      );

      // Shelf empty state
      const shelfSpot = screen.getByTestId('room-shelf-hotspot');
      expect(shelfSpot).toHaveTextContent(/Kệ đang trống · Chờ kỷ niệm đầu tiên/i);
      expect(within(shelfSpot).getByText('Ô 1')).toBeInTheDocument();
      expect(within(shelfSpot).getByText('Ô 2')).toBeInTheDocument();
      expect(within(shelfSpot).getByText('Ô 3')).toBeInTheDocument();
      const emptySlots = within(shelfSpot).getAllByText('Trống');
      expect(emptySlots).toHaveLength(3);

      // Calendar empty state
      const calendarSpot = screen.getByTestId('room-calendar-hotspot');
      expect(calendarSpot).toHaveTextContent(/Lịch trống · Chưa có hẹn/i);

      // Wardrobe empty state
      const wardrobeSpot = screen.getByTestId('room-wardrobe-hotspot');
      expect(wardrobeSpot).toHaveTextContent(/Chưa chọn phụ kiện/i);

      // Dynamic tenant title and display name
      expect(screen.getByText(/Không gian cá nhân · 2.5D Diorama/i)).toBeInTheDocument();
      expect(screen.getByText(/Phòng của Bảo Nhi/i)).toBeInTheDocument();
    });

    it('renders secondary utility dock for benefits, orders, support, and history', () => {
      const onOpenSection = vi.fn();

      render(
        <MyRoomScene
          displayName="Hoàng Nam"
          capsuleCount={1}
          benefitCount={2}
          orderCount={3}
          supportCount={1}
          upcomingCount={1}
          participationCount={4}
          onOpenSection={onOpenSection}
        />
      );

      // Utility cards exist in secondary dock
      const benefitsCard = screen.getByTestId('room-util-benefits');
      expect(benefitsCard).toHaveTextContent(/Ví quyền lợi/i);
      expect(benefitsCard).toHaveTextContent(/2 quyền lợi/i);
      fireEvent.click(benefitsCard);
      expect(onOpenSection).toHaveBeenCalledWith('benefits');

      const ordersCard = screen.getByTestId('room-util-orders');
      expect(ordersCard).toHaveTextContent(/Đơn hàng & Sở hữu/i);
      expect(ordersCard).toHaveTextContent(/3 đơn hàng/i);
      fireEvent.click(ordersCard);
      expect(onOpenSection).toHaveBeenCalledWith('orders');

      const supportCard = screen.getByTestId('room-util-support');
      expect(supportCard).toHaveTextContent(/Hỗ trợ & Đối soát/i);
      expect(supportCard).toHaveTextContent(/1 hồ sơ/i);
      fireEvent.click(supportCard);
      expect(onOpenSection).toHaveBeenCalledWith('support');

      const historyCard = screen.getByTestId('room-util-history');
      expect(historyCard).toHaveTextContent(/Lịch sử tham dự/i);
      expect(historyCard).toHaveTextContent(/4 lượt tham gia/i);
      fireEvent.click(historyCard);
      expect(onOpenSection).toHaveBeenCalledWith('history');
    });

    it('provides accessible text shortcuts fulfilling Bible Rule 4 (No maze)', () => {
      const onOpenSection = vi.fn();

      render(
        <MyRoomScene
          displayName="Linh Chi"
          accessoryName="Star Lightstick"
          capsuleCount={3}
          benefitCount={1}
          orderCount={2}
          supportCount={0}
          upcomingCount={1}
          onOpenSection={onOpenSection}
        />
      );

      // Text shortcuts
      fireEvent.click(screen.getByTestId('shortcut-capsules'));
      expect(onOpenSection).toHaveBeenCalledWith('capsules');

      fireEvent.click(screen.getByTestId('shortcut-wardrobe'));
      expect(onOpenSection).toHaveBeenCalledWith('wardrobe');

      fireEvent.click(screen.getByTestId('shortcut-calendar'));
      expect(onOpenSection).toHaveBeenCalledWith('follows');

      fireEvent.click(screen.getByTestId('shortcut-benefits'));
      expect(onOpenSection).toHaveBeenCalledWith('benefits');

      fireEvent.click(screen.getByTestId('shortcut-orders'));
      expect(onOpenSection).toHaveBeenCalledWith('orders');

      fireEvent.click(screen.getByTestId('shortcut-support'));
      expect(onOpenSection).toHaveBeenCalledWith('support');
    });
  });

  describe('2. MyWorldView End-to-End Integration & Route Preservation', () => {
    it('renders room diorama in MyWorldView and navigates to tabs via hotspots', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/me']}>
            <Routes>
              <Route path="/me" element={<MyWorldView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // 1. Verify Room Diorama is present at top
      expect(screen.getByTestId('my-room-scene')).toBeInTheDocument();

      // 2. Click Wardrobe hotspot in room -> switches to wardrobe tab
      const wardrobeSpot = screen.getByTestId('room-wardrobe-hotspot');
      fireEvent.click(wardrobeSpot);

      // Wardrobe customizer is rendered
      expect(screen.getByTestId('wardrobe-customizer')).toBeInTheDocument();
      expect(screen.getByText(/Tủ đồ phụ kiện Avatar/i)).toBeInTheDocument();

      // 3. Click Calendar hotspot in room -> switches to follows/RSVP tab
      const calendarSpot = screen.getByTestId('room-calendar-hotspot');
      fireEvent.click(calendarSpot);

      // RSVP section is immediately visible at top of tab
      expect(screen.getByRole('heading', { level: 2, name: /Lịch hẹn sự kiện \(RSVP\)/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /Thế giới đang theo dõi/i })).toBeInTheDocument();

      // 4. Click Orders utility card -> switches to orders tab
      const ordersCard = screen.getByTestId('room-util-orders');
      fireEvent.click(ordersCard);
      expect(screen.getByRole('heading', { level: 2, name: /Bộ sưu tập vật phẩm đã sở hữu/i })).toBeInTheDocument();

      // 5. Existing tabs remain accessible and functional
      const capsulesTab = screen.getByRole('tab', { name: /Kỷ niệm số/i });
      fireEvent.click(capsulesTab);
      expect(screen.getByRole('heading', { level: 2, name: /Bộ sưu tập Kỷ niệm số/i })).toBeInTheDocument();
    });
  });
});
