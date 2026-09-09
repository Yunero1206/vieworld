import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { SessionView } from '../views/SessionView';
import { WorldDetailView } from '../views/WorldDetailView';
import { MyWorldView } from '../views/MyWorldView';
import { createInitialState } from '../data/fixtures';
import { saveState, _resetMemoryFallbackFlagForTesting } from '../services/storageAdapter';
import { AppState, Session } from '../domain/types';

describe('T13 Acceptance: Session Variants (Listening Room & Live House)', () => {
  let mockState: AppState;

  beforeEach(() => {
    _resetMemoryFallbackFlagForTesting();
    window.localStorage.clear();
    mockState = createInitialState('vieworld-demo');
    saveState(mockState);
  });

  describe('1. Contract Reuse & Unified Venue Stage', () => {
    it('reuses unified session contract and /sessions/:sessionId route for Listening Room', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-listen-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Confirms session loaded on standard SessionView
      expect(screen.getByRole('heading', { level: 1, name: 'Neon Sessions: Phòng nghe bản thu đặc biệt' })).toBeInTheDocument();
      expect(screen.getByTestId('session-format-tag')).toHaveTextContent('listening');
      expect(screen.getByTestId('standard-stage-wrapper')).toBeInTheDocument();
    });

    it('reuses unified session contract and /sessions/:sessionId route for Live House', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-house-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Confirms session loaded on standard SessionView
      expect(screen.getByRole('heading', { level: 1, name: 'Live House: Setlist đêm Thứ Bảy' })).toBeInTheDocument();
      expect(screen.getByTestId('session-format-tag')).toHaveTextContent('concert');
      expect(screen.getByTestId('concert-stage-wrapper')).toBeInTheDocument();
    });
  });

  describe('2. User-Initiated Audio (No Autoplay Audio Invariant)', () => {
    it('initializes in paused audio state and requires user interaction to play', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-listen-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Initial state must NOT be playing (No Autoplay Audio)
      const playToggle = screen.getByTestId('audio-play-toggle');
      expect(playToggle).toHaveTextContent('Phát âm thanh');

      // User initiates playback
      fireEvent.click(playToggle);
      expect(playToggle).toHaveTextContent('Tạm dừng');

      // User pauses playback
      fireEvent.click(playToggle);
      expect(playToggle).toHaveTextContent('Phát âm thanh');
    });
  });

  describe('3. Listening Room Variant Features & Disclosures', () => {
    it('displays truthful team-host role, recorded segment badge, and track liner notes', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-listen-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Truthful tags
      expect(screen.getByTestId('host-role-tag')).toHaveTextContent('Đội ngũ phụ trách (Team)');
      expect(screen.getByTestId('segment-mode-tag')).toHaveTextContent('Đã ghi hình trước (Recorded)');

      // Track Notes Panel
      expect(screen.getByTestId('track-notes-panel')).toBeInTheDocument();
      expect(screen.getByText('Neon Prelude (Bản nháp Acoustic)')).toBeInTheDocument();
      expect(screen.getByTestId('current-track-badge')).toHaveTextContent('Đang phát trong phòng nghe');

      // Inspect selected track liner notes
      expect(screen.getByTestId('selected-track-notes')).toHaveTextContent('Bản thu mộc guitar tại phòng thu Sài Gòn');

      // Switching track note selection updates details
      fireEvent.click(screen.getByTestId('track-item-2'));
      expect(screen.getByTestId('selected-track-notes')).toHaveTextContent('Bản phối synthwave thử nghiệm');

      // Cleared local media disclosure
      expect(screen.getByTestId('cleared-local-media-notice')).toBeInTheDocument();
    });
  });

  describe('4. Live House Variant Features & Disclosures', () => {
    it('renders expanded concert stage, setlist with current performing song, and event outfit', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-house-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Expanded concert stage
      expect(screen.getByTestId('concert-stage-wrapper')).toBeInTheDocument();

      // Approved event outfit badge
      expect(screen.getByTestId('event-outfit-badge')).toHaveTextContent('midnight_jacket');

      // Setlist panel
      expect(screen.getByTestId('setlist-panel')).toBeInTheDocument();
      expect(screen.getByTestId('current-performing-banner')).toHaveTextContent('Điểm Tựa Tương Lai (Bản phối Live House)');
      expect(screen.getByTestId('performing-song-badge')).toHaveTextContent('Đang diễn');
    });

    it('triggers call sample cues and explicitly disclaims multi-user audio jam', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-house-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Call sample cues bar
      expect(screen.getByTestId('call-sample-cue-bar')).toBeInTheDocument();

      // Trigger interaction cue
      const triggerBtn = screen.getByTestId('trigger-cue-cue-01');
      fireEvent.click(triggerBtn);
      expect(screen.getByTestId('cue-feedback-message')).toHaveTextContent('VI-E-WORLD!');

      // Constitutional disclaimer: No multi-user WebRTC audio synchronization or jam claim
      const disclaimer = screen.getByTestId('call-sample-cue-disclaimer');
      expect(disclaimer).toHaveTextContent('Không đồng bộ âm thanh WebRTC đa người dùng hay cam kết jam nhạc thời gian thực');
    });
  });

  describe('5. Missing Media Graceful Fallback', () => {
    it('gracefully degrades to silent demo mode when media is missing without breaking interactions', () => {
      const missingMediaSession: Session = {
        ...mockState.sessions['session-listen-01'],
        id: 'session-missing-01',
        title: 'Phòng Nghe Demo Thiếu Media',
        mediaStatus: 'missing',
      };

      const stateWithMissing: AppState = {
        ...mockState,
        sessions: {
          ...mockState.sessions,
          'session-missing-01': missingMediaSession,
        },
      };

      saveState(stateWithMissing);

      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-missing-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Missing media banner displayed
      expect(screen.getByTestId('missing-media-notice')).toHaveTextContent('Tệp âm thanh mẫu không khả dụng — Trình mô phỏng im lặng');

      // Silent spectrum and interactions remain functional
      expect(screen.getByTestId('silent-media-player')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Trò chuyện/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Câu hỏi Q&A/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Bình chọn/i })).toBeInTheDocument();
    });
  });

  describe('6. Cross-View Replay Expiration Consistency', () => {
    it('consistently represents expired rights and disables playback in SessionView, Archive, and My World', () => {
      const stateWithExpired: AppState = {
        ...mockState,
        capsules: {
          'capsule-expired-01': {
            id: 'capsule-expired-01',
            tenantId: 'vieworld-demo',
            version: 1,
            updatedAt: '2026-09-09T00:00:00.000Z',
            fanId: 'fan-linh',
            sessionId: 'session-expired-01',
            worldId: 'artist-a',
            participationId: 'part_fan-linh_session-expired-01_live',
            isSaved: true,
            privateNote: 'Kỷ niệm mùa hè đầu tiên.',
          },
        },
      };

      saveState(stateWithExpired);

      // 1. Check SessionView: expired banner and disabled audio play toggle
      const { unmount: unmountSession } = render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-expired-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      expect(screen.getByTestId('expired-rights-session-banner')).toHaveTextContent('Bản quyền nội dung đã hết hạn (Expired Rights)');
      expect(screen.getByTestId('expired-rights-audio-notice')).toHaveTextContent('Bản quyền âm thanh đã hết hạn');
      expect(screen.getByTestId('audio-play-toggle')).toBeDisabled();
      unmountSession();

      // 2. Check WorldDetailView (Archive tab): shows expired rights tag
      const { unmount: unmountWorld } = render(
        <AppProvider>
          <MemoryRouter initialEntries={['/worlds/artist-a']}>
            <Routes>
              <Route path="/worlds/:worldId" element={<WorldDetailView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Open Archive tab
      fireEvent.click(screen.getByRole('tab', { name: /Kho lưu trữ/i }));
      expect(screen.getByTestId('archive-replay-expired-session-expired-01')).toHaveTextContent('Bản quyền đã hết hạn');
      unmountWorld();

      // 3. Check MyWorldView (Capsules tab): shows expired replay notice while preserving private note
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/me']}>
            <Routes>
              <Route path="/me" element={<MyWorldView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      expect(screen.getByTestId('replay-expired-notice-capsule-expired-01')).toHaveTextContent('Bản ghi Replay đã hết hạn bản quyền');
      expect(screen.getByText('Kỷ niệm mùa hè đầu tiên.')).toBeInTheDocument();
    });
  });

  describe('7. Constitutional Boundaries & Non-Negotiables', () => {
    it('ensures absence of third-party login prompts or external media ripping claims', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-listen-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Check that no OAuth or third-party streaming prompts exist
      expect(screen.queryByText(/spotify/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/apple music/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/đăng nhập để nghe/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/tải xuống trái phép/i)).not.toBeInTheDocument();
    });
  });
});
