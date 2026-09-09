/**
 * Acceptance T06: The Full Signature Loop, Moment Capsules, and Wardrobe Customization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { AppShell } from '../components/AppShell';
import { DiscoverView } from '../views/DiscoverView';
import { WorldsView } from '../views/WorldsView';
import { WorldDetailView } from '../views/WorldDetailView';
import { SessionView } from '../views/SessionView';
import { MyWorldView } from '../views/MyWorldView';
import { WardrobeCustomizer } from '../components/WardrobeCustomizer';
import { MomentCapsuleCard } from '../components/MomentCapsuleCard';
import { Capsule, Session, World } from '../domain/types';

describe('T06 Acceptance: The Signature Loop & My World', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('1. Full Signature Loop & Post-Refresh Persistence', () => {
    it('executes: Follow → RSVP → Join Live → Interact → End Session → Save Capsule → My World persists after refresh', async () => {
      // PHASE 1: Execution of the loop in the application
      const { unmount } = render(
        <AppProvider>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route index element={<DiscoverView />} />
                <Route path="worlds" element={<WorldsView />} />
                <Route path="worlds/:worldId" element={<WorldDetailView />} />
                <Route path="sessions/:sessionId" element={<SessionView />} />
                <Route path="me" element={<MyWorldView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // 1. Follow World from Discover
      const followBtns = screen.getAllByRole('button', { name: /Theo dõi/i });
      fireEvent.click(followBtns[0]);

      // 2. RSVP for Next Moment
      const rsvpBtn = screen.getByRole('button', { name: /Đăng ký.*RSVP|Đăng ký nhận thông báo/i });
      fireEvent.click(rsvpBtn);

      // 3. Enter Session Stage
      const enterSessionLink = screen.getByRole('link', { name: /Vào phiên sự kiện/i });
      fireEvent.click(enterSessionLink);

      // Verify on Session Stage
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Artist A: Drop-in Trò chuyện đầu tuần');

      // 4. Join Live Attendance
      const joinLiveBtn = screen.getByRole('button', { name: /Vào sân khấu trực tiếp/i });
      fireEvent.click(joinLiveBtn);
      expect(screen.getByText('Đã ghi nhận tham dự trực tiếp (Live Attendance)')).toBeInTheDocument();

      // 5. Interact: Ask Question and Vote Poll
      const questionsTab = screen.getByRole('tab', { name: /Câu hỏi Q&A/i });
      fireEvent.click(questionsTab);
      const qInput = screen.getByLabelText(/Nội dung câu hỏi/i);
      fireEvent.change(qInput, { target: { value: 'Ca khúc nào được sáng tác đầu tiên ạ?' } });
      fireEvent.click(screen.getByRole('button', { name: /Gửi câu hỏi/i }));
      expect(screen.getByText('Ca khúc nào được sáng tác đầu tiên ạ?')).toBeInTheDocument();

      const pollTab = screen.getByRole('tab', { name: /Bình chọn/i });
      fireEvent.click(pollTab);
      const voteBtn = screen.getByLabelText(/Bình chọn cho: Vệt Sáng Đêm/i);
      fireEvent.click(voteBtn);
      expect(screen.getByText(/Bạn đã hoàn thành bình chọn \(1 lượt duy nhất\)/i)).toBeInTheDocument();

      // 6. End Session via Operator Demo Control
      fireEvent.click(screen.getByText(/Công cụ review phiên/i));
      const endSessionBtn = screen.getByRole('button', { name: /Mô phỏng: Kết thúc phiên sự kiện/i });
      fireEvent.click(endSessionBtn);
      expect(screen.getByText('Đã kết thúc')).toBeInTheDocument();

      // 7. Navigate to My World (/me)
      const myWorldNav = screen.getAllByRole('link', { name: /My World/i })[0];
      fireEvent.click(myWorldNav);

      // Verify My World shows the newly created Moment Capsule
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Linh Nguyễn');
      expect(screen.getByText('Artist A: Drop-in Trò chuyện đầu tuần')).toBeInTheDocument();
      expect(screen.getByText('Kỷ niệm tham dự trực tiếp (Live)')).toBeInTheDocument();

      // 8. Add personal private note to capsule
      const editNoteBtn = screen.getByRole('button', { name: /Sửa ghi chú|Thêm ghi chú/i });
      fireEvent.click(editNoteBtn);
      const noteInput = screen.getByLabelText(/Ghi chú cá nhân cho kỷ niệm/i);
      fireEvent.change(noteInput, { target: { value: 'Một buổi tối âm nhạc acoustic thật lắng đọng và ý nghĩa!' } });
      fireEvent.click(screen.getByRole('button', { name: /Lưu ghi chú/i }));

      expect(screen.getByText('Một buổi tối âm nhạc acoustic thật lắng đọng và ý nghĩa!')).toBeInTheDocument();

      // Unmount to simulate browser refresh / tab close
      unmount();

      // PHASE 2: Fresh Mount (Auto-hydration from storage)
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/me']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="me" element={<MyWorldView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Verify all loop assets persisted after refresh (§1 Signature Loop, Acceptance T06)
      await waitFor(() => {
        expect(screen.getByText('Artist A: Drop-in Trò chuyện đầu tuần')).toBeInTheDocument();
        expect(screen.getByText('Một buổi tối âm nhạc acoustic thật lắng đọng và ý nghĩa!')).toBeInTheDocument();
        expect(screen.getByText('Kỷ niệm tham dự trực tiếp (Live)')).toBeInTheDocument();
      });
    }, 15000);
  });

  describe('2. Ending Session Idempotency', () => {
    it('calling end session repeatedly creates no duplicate capsule or participation', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/sessions/session-dropin-01']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="sessions/:sessionId" element={<SessionView />} />
                <Route path="me" element={<MyWorldView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Join live
      fireEvent.click(screen.getByRole('button', { name: /Vào sân khấu trực tiếp/i }));

      // End session once
      fireEvent.click(screen.getByText(/Công cụ review phiên/i));
      const endBtn = screen.getByRole('button', { name: /Mô phỏng: Kết thúc phiên sự kiện/i });
      fireEvent.click(endBtn);

      // Go to My World
      fireEvent.click(screen.getAllByRole('link', { name: /My World/i })[0]);

      // Exactly 1 capsule item for this session exists
      const capsules = screen.getAllByText('Artist A: Drop-in Trò chuyện đầu tuần');
      expect(capsules).toHaveLength(1);
    });
  });

  describe('3. Invariant: Lobby-Only Visitor Ineligibility', () => {
    it('entering lobby without live attendance earns no live capsule when session ends', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/sessions/session-listen-01']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="sessions/:sessionId" element={<SessionView />} />
                <Route path="me" element={<MyWorldView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Enter open lobby only
      const enterLobbyBtn = screen.getByRole('button', { name: /Vào phòng chờ/i });
      fireEvent.click(enterLobbyBtn);
      expect(screen.getByText('Đang ở trong phòng chờ')).toBeInTheDocument();

      // Navigate to My World
      fireEvent.click(screen.getAllByRole('link', { name: /My World/i })[0]);

      // Invariant: MUST NOT have a capsule for session-listen-01
      expect(screen.queryByText('Neon Sessions: Phòng nghe bản thu đặc biệt')).not.toBeInTheDocument();
      expect(screen.getByTestId('capsules-empty-state')).toBeInTheDocument();
    });
  });

  describe('4. Wardrobe Customization Independence', () => {
    it('persists wardrobe selection without affecting live attendance records or eligibility', () => {
      const mockEquip = vi.fn();
      render(
        <WardrobeCustomizer
          equippedAccessoryId="earpiece_glow"
          onEquip={mockEquip}
        />
      );

      // Initially wearing earpiece_glow
      expect(screen.getByTestId('equipped-badge-earpiece_glow')).toBeInTheDocument();

      // Click Cyber Visor card
      const visorCard = screen.getByTestId('accessory-card-visor_neon');
      fireEvent.click(visorCard);

      // Save new accessory choice
      const saveBtn = screen.getByRole('button', { name: /Lưu lựa chọn 'Kính thực tế ảo Cyber'/i });
      fireEvent.click(saveBtn);

      expect(mockEquip).toHaveBeenCalledWith('visor_neon');
      expect(screen.getByTestId('wardrobe-save-notice')).toBeInTheDocument();
      // Verify constitutional statement
      expect(screen.getByText(/tuyệt đối không ảnh hưởng đến điều kiện tham dự/i)).toBeInTheDocument();
    });
  });

  describe('5. Expired / Withdrawn Replay Rights Preservation', () => {
    it('disables replay playback button while preserving capsule metadata and personal note', () => {
      const mockCapsule: Capsule = {
        id: 'capsule-expired-test',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: '2026-09-09T20:00:00Z',
        fanId: 'fan-linh',
        sessionId: 'session-expired-01',
        worldId: 'artist-a',
        participationId: 'part_live_123',
        isSaved: true,
        privateNote: 'Kỷ niệm quý giá dù bản ghi đã hết hạn.',
      };

      const expiredSession: Session = {
        id: 'session-expired-01',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: '2026-09-09T20:00:00Z',
        worldId: 'artist-a',
        title: 'Buổi hòa nhạc đêm giao mùa (Bản ghi hết hạn)',
        avatarAssetId: 'avatar-a-v1',
        format: 'concert',
        status: 'ended',
        hostRole: 'artist',
        artistPresence: 'absent',
        segmentMode: 'live',
        aiUse: 'none',
        replayStatus: 'expired', // Expired rights
        scheduledStartTime: '2026-08-01T20:00:00Z',
        demo: true,
      };

      const mockWorld: World = {
        id: 'artist-a',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: '2026-09-09T20:00:00Z',
        type: 'artist',
        name: 'Artist A',
        description: 'Thế giới của Artist A',
        linkedWorldIds: [],
      };

      render(
        <MemoryRouter>
          <MomentCapsuleCard
            capsule={mockCapsule}
            session={expiredSession}
            world={mockWorld}
            onSaveNote={vi.fn()}
            onToggleSaved={vi.fn()}
          />
        </MemoryRouter>
      );

      // Invariant: Playback button is NOT rendered
      expect(screen.queryByRole('link', { name: /Xem lại bản ghi Replay/i })).not.toBeInTheDocument();

      // Invariant: Expiration notice is displayed
      expect(screen.getByTestId('replay-expired-notice-capsule-expired-test')).toBeInTheDocument();
      expect(screen.getByText(/Bản ghi Replay đã hết hạn bản quyền/i)).toBeInTheDocument();

      // Invariant: Personal note and attendance badge remain completely intact
      expect(screen.getByText('Kỷ niệm quý giá dù bản ghi đã hết hạn.')).toBeInTheDocument();
      expect(screen.getByText('Kỷ niệm tham dự trực tiếp (Live)')).toBeInTheDocument();
    });
  });
});
