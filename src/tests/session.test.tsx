/**
 * Acceptance T04: Session Stage and Truthful Presence Invariant Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { SessionView } from '../views/SessionView';
import { AppShell } from '../components/AppShell';
import { PresencePanel } from '../components/PresencePanel';
import { AvatarStage } from '../components/AvatarStage';
import { Session } from '../domain/types';

describe('T04 Acceptance: Session Stage & Truthful Presence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('1. Truthful Presence Status Copy & Badges', () => {
    const baseMockSession: Session = {
      id: 'session-mock-1',
      tenantId: 'vieworld-demo',
      version: 1,
      updatedAt: '2026-03-09T20:00:00Z',
      worldId: 'artist-a',
      title: 'Phiên kiểm thử hiện diện chân thực',
      format: 'listening',
      status: 'running',
      hostRole: 'artist',
      scheduledStartTime: '2026-03-09T20:00:00Z',
      segmentMode: 'live',
      artistPresence: 'present',
      aiUse: 'none',
      replayStatus: 'pending_review',
      demo: true,
    };

    it('renders distinct truthful copy for all 4 artist presence states', () => {
      // 1. Present
      const { rerender } = render(<PresencePanel session={{ ...baseMockSession, artistPresence: 'present' }} />);
      expect(screen.getByText('Nghệ sĩ đang hiện diện trực tiếp')).toBeInTheDocument();
      expect(screen.getByText('DEMO')).toBeInTheDocument();
      expect(screen.getByText('Phân đoạn trực tiếp')).toBeInTheDocument();
      expect(screen.getByText(/Không sử dụng/)).toBeInTheDocument();

      // 2. Reconnecting
      rerender(<PresencePanel session={{ ...baseMockSession, artistPresence: 'reconnecting' }} />);
      expect(screen.getByText('Đang thiết lập lại kết nối tín hiệu cùng nghệ sĩ...')).toBeInTheDocument();

      // 3. Disconnected (§2.3: clear truth, no AI substitution)
      rerender(<PresencePanel session={{ ...baseMockSession, artistPresence: 'disconnected' }} />);
      expect(screen.getByText('Nghệ sĩ đã ngắt kết nối · Không thay thế bằng AI')).toBeInTheDocument();

      // 4. Absent
      rerender(<PresencePanel session={{ ...baseMockSession, artistPresence: 'absent' }} />);
      expect(screen.getByText('Nghệ sĩ không có mặt trong phân đoạn này')).toBeInTheDocument();
    });

    it('displays segment mode distinction properly between live and recorded', () => {
      const { rerender } = render(<PresencePanel session={{ ...baseMockSession, segmentMode: 'live' }} />);
      expect(screen.getByText('Phân đoạn trực tiếp')).toBeInTheDocument();

      rerender(<PresencePanel session={{ ...baseMockSession, segmentMode: 'recorded' }} />);
      expect(screen.getByText('Bản ghi đội ngũ kỹ thuật')).toBeInTheDocument();
    });
  });

  describe('2. Avatar Stage Freezing & Ethics Disclosures', () => {
    it('freezes avatar animation when artist disconnects and shows disclosure overlay', () => {
      render(
        <AvatarStage
          artistPresence="disconnected"
          isPaused={false}
          reducedMotion={false}
        />
      );

      const avatarEl = screen.getByTestId('avatar-graphic');
      expect(avatarEl.getAttribute('data-frozen')).toBe('true');
      expect(screen.getByTestId('disconnected-stage-notice')).toBeInTheDocument();
      expect(screen.getByText(/Sân khấu tạm ngưng chuyển động. Hệ thống không sử dụng AI để đóng giả nghệ sĩ./i)).toBeInTheDocument();
    });

    it('freezes avatar animation when user pauses or activates reduced-motion', () => {
      const { rerender } = render(
        <AvatarStage
          artistPresence="present"
          isPaused={true}
          reducedMotion={false}
        />
      );

      let avatarEl = screen.getByTestId('avatar-graphic');
      expect(avatarEl.getAttribute('data-frozen')).toBe('true');

      // Unpause but turn on reduced motion
      rerender(
        <AvatarStage
          artistPresence="present"
          isPaused={false}
          reducedMotion={true}
        />
      );
      avatarEl = screen.getByTestId('avatar-graphic');
      expect(avatarEl.getAttribute('data-frozen')).toBe('true');
    });
  });

  describe('3. Lobby Admission vs. Live Attendance Invariants', () => {
    it('differentiates lobby entry from live attendance in running session', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/sessions/session-dropin-01']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="sessions/:sessionId" element={<SessionView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Verify Session header
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Artist A: Drop-in Trò chuyện đầu tuần');
      expect(screen.getByText('Nghệ sĩ đang hiện diện trực tiếp')).toBeInTheDocument();

      // Before joining live attendance: user is not yet marked as attended
      expect(screen.getByText(/Bạn chưa tham gia phiên này/i)).toBeInTheDocument();
      expect(screen.queryByText(/Đang tham dự trực tiếp/i)).not.toBeInTheDocument();

      // Click "Vào sân khấu trực tiếp"
      const joinLiveBtn = screen.getByRole('button', { name: /Vào sân khấu trực tiếp/i });
      fireEvent.click(joinLiveBtn);

      // Now user is verified as having live attendance
      expect(screen.getByText('Đã ghi nhận tham dự trực tiếp (Live Attendance)')).toBeInTheDocument();
      expect(screen.getByText('Đang tham dự trực tiếp')).toBeInTheDocument();

      // Leave stage / lobby
      const leaveBtn = screen.getByRole('button', { name: /Rời sân khấu/i });
      fireEvent.click(leaveBtn);

      // Even after leaving view, live attendance record persists (§2.3 idempotency)
      expect(screen.getByText('Đã ghi nhận tham dự trực tiếp (Live Attendance)')).toBeInTheDocument();
    });

    it('entering open lobby does not grant live attendance certificate', () => {
      // In fixture data, session-listen-01 is 'scheduled' with lobby admission available
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/sessions/session-listen-01']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="sessions/:sessionId" element={<SessionView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Session status is scheduled
      expect(screen.getByText('Sắp diễn ra')).toBeInTheDocument();

      // Enter lobby
      const enterLobbyBtn = screen.getByRole('button', { name: /Vào phòng chờ/i });
      fireEvent.click(enterLobbyBtn);

      // Status reflects in-lobby
      expect(screen.getByText('Đang ở trong phòng chờ')).toBeInTheDocument();
      // MUST NOT grant live attendance!
      expect(screen.queryByText('Đã ghi nhận tham dự trực tiếp (Live Attendance)')).not.toBeInTheDocument();

      // Leave lobby
      const leaveLobbyBtn = screen.getByRole('button', { name: /Rời phòng chờ/i });
      fireEvent.click(leaveLobbyBtn);
      expect(screen.getByText(/Bạn chưa tham gia phiên này/i)).toBeInTheDocument();
    });
  });

  describe('4. Truthful Presence Simulation Controls', () => {
    it('simulating artist disconnect halts stage and updates truthful disclosure', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/sessions/session-dropin-01']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="sessions/:sessionId" element={<SessionView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Initially present
      expect(screen.getByText('Nghệ sĩ đang hiện diện trực tiếp')).toBeInTheDocument();
      const avatarEl = screen.getByTestId('avatar-graphic');
      expect(avatarEl.getAttribute('data-frozen')).toBe('false');

      // Trigger disconnect simulation button
      fireEvent.click(screen.getByText(/Công cụ review phiên/i));
      const disconnectBtn = screen.getByRole('button', { name: /Ngắt kết nối nghệ sĩ \(Thử nghiệm\)/i });
      fireEvent.click(disconnectBtn);

      // Verify artist presence transitioned immediately to disconnected
      expect(screen.getByText('Nghệ sĩ đã ngắt kết nối · Không thay thế bằng AI')).toBeInTheDocument();
      expect(avatarEl.getAttribute('data-frozen')).toBe('true');
      expect(screen.getByTestId('disconnected-stage-notice')).toBeInTheDocument();

      // Reconnect simulation
      const reconnectBtn = screen.getByRole('button', { name: /Kết nối lại tín hiệu nghệ sĩ/i });
      fireEvent.click(reconnectBtn);

      // Verify presence restored
      expect(screen.getByText('Nghệ sĩ đang hiện diện trực tiếp')).toBeInTheDocument();
      expect(avatarEl.getAttribute('data-frozen')).toBe('false');
    });
  });

  describe('5. Privacy & Permission Invariants', () => {
    it('never requests getUserMedia, camera or microphone permissions', () => {
      const getUserMediaSpy = vi.fn();
      if (!navigator.mediaDevices) {
        // @ts-expect-error Mocking mediaDevices for test
        navigator.mediaDevices = {};
      }
      navigator.mediaDevices.getUserMedia = getUserMediaSpy;

      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/sessions/session-dropin-01']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="sessions/:sessionId" element={<SessionView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Confirm getUserMedia was never accessed
      expect(getUserMediaSpy).not.toHaveBeenCalled();
      // Confirm privacy statement is present
      expect(screen.getByText(/Quyền riêng tư tuyệt đối:/i)).toBeInTheDocument();
      expect(screen.getByText(/Nội dung âm thanh độc lập, thử nghiệm nội bộ/i)).toBeInTheDocument();
    });
  });

  describe('6. Safe Recovery Screen for Invalid Session ID', () => {
    it('displays clear recovery card when session does not exist', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/sessions/non-existent-session-id']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="sessions/:sessionId" element={<SessionView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      expect(screen.getByTestId('session-not-found-card')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Không tìm thấy phiên sự kiện');
      expect(screen.getByRole('link', { name: /Khám phá các thế giới/i })).toHaveAttribute('href', '/worlds');
      expect(screen.getByRole('link', { name: /Về trang chủ/i })).toHaveAttribute('href', '/');
    });
  });
});
