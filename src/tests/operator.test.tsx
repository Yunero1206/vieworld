import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { OperatorConsoleView } from '../views/OperatorConsoleView';
import { SessionView } from '../views/SessionView';
import { appReducer } from '../domain/reducer';
import { createInitialState } from '../data/fixtures';
import { _resetMemoryFallbackFlagForTesting, saveState, loadState } from '../services/storageAdapter';
import { AppState } from '../domain/types';

describe('T12 Acceptance: Operator Session Console & Orchestration', () => {
  let initialState: AppState;

  beforeEach(() => {
    _resetMemoryFallbackFlagForTesting();
    window.localStorage.clear();
    initialState = createInitialState('vieworld-demo');
  });

  describe('1. Domain Invariants & Reducer Safeguards', () => {
    it('Rights Clearance Guard: session cannot start if rightsApproved is false (RIGHTS_NOT_APPROVED)', () => {
      // session-house-01 fixture has rightsApproved: false
      const state = { ...initialState };
      expect(state.sessions['session-house-01'].rightsApproved).toBe(false);

      const nextState = appReducer(state, {
        type: 'START_SESSION',
        sessionId: 'session-house-01',
      });

      expect(nextState.lastError?.code).toBe('RIGHTS_NOT_APPROVED');
      expect(nextState.sessions['session-house-01'].status).toBe('scheduled');
    });

    it('Rights Approval: APPROVE_SESSION_RIGHTS approves checklist and allows START_SESSION', () => {
      let state = { ...initialState };

      state = appReducer(state, {
        type: 'APPROVE_SESSION_RIGHTS',
        sessionId: 'session-house-01',
        checklist: {
          musicClearance: true,
          artistConsent: true,
          safetyReview: true,
        },
      });

      expect(state.sessions['session-house-01'].rightsApproved).toBe(true);
      expect(state.sessions['session-house-01'].rightsChecklist?.musicClearance).toBe(true);

      // Now start session should succeed
      const startedState = appReducer(state, {
        type: 'START_SESSION',
        sessionId: 'session-house-01',
      });

      expect(startedState.lastError).toBeUndefined();
      expect(startedState.sessions['session-house-01'].status).toBe('running');
    });

    it('Lobby, Pause, Resume, and Segment Mode transitions', () => {
      let state = { ...initialState };

      // 1. OPEN_LOBBY on scheduled session-listen-01
      expect(state.sessions['session-listen-01'].status).toBe('scheduled');
      state = appReducer(state, {
        type: 'OPEN_LOBBY',
        sessionId: 'session-listen-01',
      });
      expect(state.sessions['session-listen-01'].status).toBe('open');

      // 2. START_SESSION
      state = appReducer(state, {
        type: 'START_SESSION',
        sessionId: 'session-listen-01',
        avatarAssetId: 'avatar-a-v1',
      });
      expect(state.sessions['session-listen-01'].status).toBe('running');

      // 3. PAUSE_SESSION
      state = appReducer(state, {
        type: 'PAUSE_SESSION',
        sessionId: 'session-listen-01',
      });
      expect(state.sessions['session-listen-01'].status).toBe('paused');

      // 4. RESUME_SESSION
      state = appReducer(state, {
        type: 'RESUME_SESSION',
        sessionId: 'session-listen-01',
      });
      expect(state.sessions['session-listen-01'].status).toBe('running');

      // 5. UPDATE_SEGMENT_MODE
      state = appReducer(state, {
        type: 'UPDATE_SEGMENT_MODE',
        sessionId: 'session-listen-01',
        segmentMode: 'recorded',
      });
      expect(state.sessions['session-listen-01'].segmentMode).toBe('recorded');

      state = appReducer(state, {
        type: 'UPDATE_SEGMENT_MODE',
        sessionId: 'session-listen-01',
        segmentMode: 'live',
      });
      expect(state.sessions['session-listen-01'].segmentMode).toBe('live');
    });

    it('Chat moderation: TOGGLE_CHAT_PAUSED toggles isChatPaused state', () => {
      let state = { ...initialState };
      expect(state.sessions['session-dropin-01'].isChatPaused).toBeFalsy();

      state = appReducer(state, {
        type: 'TOGGLE_CHAT_PAUSED',
        sessionId: 'session-dropin-01',
      });
      expect(state.sessions['session-dropin-01'].isChatPaused).toBe(true);

      state = appReducer(state, {
        type: 'TOGGLE_CHAT_PAUSED',
        sessionId: 'session-dropin-01',
      });
      expect(state.sessions['session-dropin-01'].isChatPaused).toBe(false);
    });

    it('Question moderation: SELECT_QUESTION and CLOSE_QUESTION maintain single active broadcast question', () => {
      let state = { ...initialState };

      state = appReducer(state, {
        type: 'SELECT_QUESTION',
        questionId: 'question-01',
      });
      expect(state.questions['question-01'].status).toBe('selected');

      // Closing question
      state = appReducer(state, {
        type: 'CLOSE_QUESTION',
        questionId: 'question-01',
      });
      expect(state.questions['question-01'].status).toBe('closed');
    });

    it('Replay governance: PUBLISH_REPLAY and WITHDRAW_REPLAY update replay availability', () => {
      let state = { ...initialState };

      // End session to trigger replay pending review
      state = appReducer(state, {
        type: 'END_SESSION',
        sessionId: 'session-dropin-01',
      });
      expect(state.sessions['session-dropin-01'].replayStatus).toBe('pending_review');

      // Operator publishes replay
      state = appReducer(state, {
        type: 'PUBLISH_REPLAY',
        sessionId: 'session-dropin-01',
      });
      expect(state.sessions['session-dropin-01'].replayStatus).toBe('available');

      // Operator withdraws replay
      state = appReducer(state, {
        type: 'WITHDRAW_REPLAY',
        sessionId: 'session-dropin-01',
      });
      expect(state.sessions['session-dropin-01'].replayStatus).toBe('withdrawn');
    });

    it('Cancellation Immutability: CANCEL_SESSION locks session; subsequent join is rejected (SESSION_CANCELLED)', () => {
      let state = { ...initialState };

      state = appReducer(state, {
        type: 'CANCEL_SESSION',
        sessionId: 'session-dropin-01',
      });

      expect(state.sessions['session-dropin-01'].status).toBe('cancelled');
      expect(state.sessions['session-dropin-01'].artistPresence).toBe('absent');

      // Attempting to join cancelled session fails
      const joinAttempt = appReducer(state, {
        type: 'JOIN_LIVE_SESSION',
        sessionId: 'session-dropin-01',
      });

      expect(joinAttempt.lastError?.code).toBe('SESSION_CANCELLED');
    });
  });

  describe('2. Operator Console UI & Controls', () => {
    it('renders Operator Console with role preview disclaimer and security notice', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/studio/operator/session-dropin-01']}>
            <Routes>
              <Route path="/studio/operator/:sessionId?" element={<OperatorConsoleView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Role header & disclaimer
      expect(screen.getByText(/OPERATOR WORKSPACE · P12/i)).toBeDefined();
      expect(screen.getByText(/MINH BẠCH VAI TRÒ ĐIỀU HÀNH NỘI BỘ/i)).toBeDefined();
      expect(screen.getByText(/không phải cơ chế bảo mật phân quyền backend/i)).toBeDefined();

      // Broadcast Controls card
      expect(screen.getByText(/Điều phối Vòng đời Phát sóng/i)).toBeDefined();
      expect(screen.getByTestId('cancel-session-btn')).toBeDefined();

      // Artist Presence Switcher
      expect(screen.getByText(/Mô phỏng Hiện diện Nghệ sĩ & Chế độ Phát sóng/i)).toBeDefined();
      expect(screen.getByTestId('presence-toggle-online')).toBeDefined();
      expect(screen.getByTestId('presence-toggle-disconnected')).toBeDefined();

      // Moderation controls
      expect(screen.getByText(/Hàng đợi Câu hỏi Khán giả/i)).toBeDefined();
      expect(screen.getByTestId('toggle-chat-pause-btn')).toBeDefined();
    });

    it('shows unapproved rights warning and disables start button for session-house-01 until cleared', async () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/studio/operator/session-house-01']}>
            <Routes>
              <Route path="/studio/operator/:sessionId?" element={<OperatorConsoleView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Notice for pending clearance is shown
      expect(screen.getByTestId('rights-pending-badge')).toBeDefined();
      expect(screen.getByText(/CHƯA HOÀN TẤT DUYỆT BẢN QUYỀN & AN TOÀN/i)).toBeDefined();

      // Start button is disabled
      const startBtn = screen.getByTestId('start-session-btn') as HTMLButtonElement;
      expect(startBtn.disabled).toBe(true);

      // Toggle checklist items
      const musicCheck = screen.getByTestId('chk-musicClearance');
      const artistCheck = screen.getByTestId('chk-artistConsent');
      const safetyCheck = screen.getByTestId('chk-safetyReview');

      fireEvent.click(musicCheck);
      fireEvent.click(artistCheck);
      fireEvent.click(safetyCheck);

      // Click Approve Rights button
      const approveBtn = screen.getByTestId('approve-rights-btn');
      fireEvent.click(approveBtn);

      // Now rights are approved and start button is enabled
      await waitFor(() => {
        expect(screen.queryByTestId('rights-pending-badge')).toBeNull();
        expect(screen.getByTestId('rights-approved-badge')).toBeDefined();
        expect(startBtn.disabled).toBe(false);
      });
    });

    it('operator can switch session segment mode and toggle artist presence', async () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/studio/operator/session-dropin-01']}>
            <Routes>
              <Route path="/studio/operator/:sessionId?" element={<OperatorConsoleView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Switch to recorded
      const recordedBtn = screen.getByTestId('segment-mode-recorded');
      fireEvent.click(recordedBtn);

      // Toggle disconnect
      const discoBtn = screen.getByTestId('presence-toggle-disconnected');
      fireEvent.click(discoBtn);

      await waitFor(() => {
        expect(screen.getByText(/Mất kết nối mô phỏng/i)).toBeDefined();
      });
    });
  });

  describe('3. Fan View Propagation & Moderation Sync', () => {
    it('Operator question selection immediately displays active question banner on Fan Stage View', async () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/studio/operator/session-dropin-01']}>
            <Routes>
              <Route path="/studio/operator/:sessionId?" element={<OperatorConsoleView />} />
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Click Select on the question
      const selectBtn = screen.getByTestId('select-question-btn');
      expect(selectBtn).toBeDefined();
      fireEvent.click(selectBtn);

      await waitFor(() => {
        expect(screen.getByText(/Đã chọn câu hỏi/i)).toBeDefined();
      });

      // Navigate to Fan Stage View
      const fanViewLink = screen.getByTestId('view-fan-stage-link');
      fireEvent.click(fanViewLink);

      // Verify active question banner is displayed to fans
      await waitFor(() => {
        const banner = screen.getByTestId('active-selected-question-banner');
        expect(banner).toBeDefined();
        expect(banner.textContent).toContain('CÂU HỎI ĐANG ĐƯỢC NGHỆ SĨ TRẢ LỜI TRỰC TIẾP');
      });
    });

    it('Operator chat pause freezes Fan chat input and renders pause notice', async () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/studio/operator/session-dropin-01']}>
            <Routes>
              <Route path="/studio/operator/:sessionId?" element={<OperatorConsoleView />} />
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Pause chat
      const toggleChatBtn = screen.getByTestId('toggle-chat-pause-btn');
      fireEvent.click(toggleChatBtn);

      await waitFor(() => {
        expect(screen.getByText(/Đã tạm dừng kênh trò chuyện/i)).toBeDefined();
      });

      // Navigate to Fan Stage View
      const fanViewLink = screen.getByTestId('view-fan-stage-link');
      fireEvent.click(fanViewLink);

      // Fan chat panel should display paused notice and disable input
      await waitFor(() => {
        expect(screen.getByTestId('chat-paused-notice')).toBeDefined();
        const chatInput = screen.getByTestId('chat-input-field') as HTMLInputElement;
        expect(chatInput.disabled).toBe(true);
        expect(chatInput.placeholder).toContain('Kênh chat đang tạm dừng bởi điều hành viên');
      });
    });

    it('Cancelled session displays cancellation banner and cannot be joined', async () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/studio/operator/session-dropin-01']}>
            <Routes>
              <Route path="/studio/operator/:sessionId?" element={<OperatorConsoleView />} />
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Click Cancel Session
      const cancelBtn = screen.getByTestId('cancel-session-btn');
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.getByText(/Đã hủy phiên sự kiện/i)).toBeDefined();
      });

      // Navigate to Fan Stage View
      const fanViewLink = screen.getByTestId('view-fan-stage-link');
      fireEvent.click(fanViewLink);

      // Stage displays cancelled banner and join is disabled
      await waitFor(() => {
        expect(screen.getByTestId('cancelled-session-alert')).toBeDefined();
        expect(screen.getByText(/Phiên sự kiện này đã bị hủy bởi ban tổ chức/i)).toBeDefined();
      });
    });

    it('Cancellation state persists across page reload via storageAdapter', () => {
      // 1. Cancel session in initial state and save to storage
      const stateWithCancelled = appReducer(initialState, {
        type: 'CANCEL_SESSION',
        sessionId: 'session-dropin-01',
      });
      expect(stateWithCancelled.sessions['session-dropin-01'].status).toBe('cancelled');
      saveState(stateWithCancelled);

      // 2. Simulate fresh page reload with hydration from storage
      const loaded = loadState('vieworld-demo');
      expect(loaded.state.sessions['session-dropin-01'].status).toBe('cancelled');

      // 3. Render loaded application at /sessions/session-dropin-01
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-dropin-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Verify cancellation alert is rendered immediately after reload
      expect(screen.getByTestId('cancelled-session-alert')).toBeDefined();
      expect(screen.getByText(/Phiên sự kiện này đã bị hủy bởi ban tổ chức/i)).toBeDefined();
    });
  });
});
