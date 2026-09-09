/**
 * Acceptance T05: Questions, Poll and Moderated Fan Chat Invariant Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { SessionView } from '../views/SessionView';
import { AppShell } from '../components/AppShell';
import { QuestionQueue } from '../components/QuestionQueue';
import { LivePollPanel } from '../components/LivePollPanel';
import { FanChatPanel } from '../components/FanChatPanel';
import { Session, Poll } from '../domain/types';

describe('T05 Acceptance: Questions, Poll and Moderated Fan Chat', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const baseSession: Session = {
    id: 'session-dropin-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: '2026-09-09T20:00:00Z',
    worldId: 'artist-a',
    title: 'Artist A: Drop-in Trò chuyện đầu tuần',
    avatarAssetId: 'avatar-a-v1',
    format: 'dropin',
    status: 'running',
    hostRole: 'artist',
    artistPresence: 'present',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'pending_review',
    scheduledStartTime: '2026-09-09T20:00:00Z',
    demo: true,
  };

  describe('1. Question Queue Submission & Idempotency', () => {
    it('submits a question and prevents duplicate ghost entries on retry/identical content', () => {
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

      // Switch to Questions tab
      const questionsTab = screen.getByRole('tab', { name: /Câu hỏi Q&A/i });
      fireEvent.click(questionsTab);

      // Verify initial seeded question exists
      expect(screen.getByText(/Bài hát mở màn cho Live House sắp tới/i)).toBeInTheDocument();

      const input = screen.getByLabelText(/Nội dung câu hỏi/i);
      const submitBtn = screen.getByRole('button', { name: /Gửi câu hỏi/i });

      // Submit unique question
      fireEvent.change(input, { target: { value: 'Nghệ sĩ có kế hoạch phát hành album vinyl không ạ?' } });
      fireEvent.click(submitBtn);

      // Verify success notice and question appeared in the queue
      expect(screen.getByText('Nghệ sĩ có kế hoạch phát hành album vinyl không ạ?')).toBeInTheDocument();
      expect(screen.getAllByText('Nghệ sĩ có kế hoạch phát hành album vinyl không ạ?')).toHaveLength(1);

      // Try submitting the EXACT same question again
      fireEvent.change(input, { target: { value: 'Nghệ sĩ có kế hoạch phát hành album vinyl không ạ?' } });
      fireEvent.click(submitBtn);

      // Invariant: Idempotency prevents creating a duplicate ghost entry
      expect(screen.getAllByText('Nghệ sĩ có kế hoạch phát hành album vinyl không ạ?')).toHaveLength(1);
    });

    it('enforces 200-character limit on question submission', () => {
      const mockSubmit = vi.fn();
      render(
        <QuestionQueue
          session={baseSession}
          questions={[]}
          currentFanId="fan-linh"
          onSubmitQuestion={mockSubmit}
          onSelectQuestion={vi.fn()}
          onAnswerQuestion={vi.fn()}
        />
      );

      const input = screen.getByLabelText(/Nội dung câu hỏi/i);
      const submitBtn = screen.getByRole('button', { name: /Gửi câu hỏi/i });

      // Enter 201 characters
      const tooLongText = 'A'.repeat(201);
      fireEvent.change(input, { target: { value: tooLongText } });

      expect(screen.getByText(/201\/200 ký tự/i)).toBeInTheDocument();
      expect(screen.getByText(/Vượt quá độ dài cho phép!/i)).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();

      fireEvent.click(submitBtn);
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe('2. Question Status Invariant: Selected is NOT Answered', () => {
    it('ensures operator selection sets status to selected, not answered', () => {
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

      // Switch to Questions tab
      const questionsTab = screen.getByRole('tab', { name: /Câu hỏi Q&A/i });
      fireEvent.click(questionsTab);

      // Initially question-01 has status 'submitted'
      expect(screen.getByText('Đã gửi (Chờ xem xét)')).toBeInTheDocument();
      expect(screen.queryByText('Được host chọn')).not.toBeInTheDocument();
      expect(screen.queryByText('Đã trả lời')).not.toBeInTheDocument();

      // Click "Mô phỏng: Chọn"
      const selectBtn = screen.getByRole('button', { name: /Mô phỏng: Chọn/i });
      fireEvent.click(selectBtn);

      // Invariant: Status must be 'selected' (Được host chọn), NOT 'answered' (Đã trả lời)
      expect(screen.getByText('Được host chọn')).toBeInTheDocument();
      expect(screen.queryByText('Đã trả lời')).not.toBeInTheDocument();

      // Now click "Mô phỏng: Đã trả lời"
      const answerBtn = screen.getByRole('button', { name: /Mô phỏng: Đã trả lời/i });
      fireEvent.click(answerBtn);

      // Status transitions to 'answered'
      expect(screen.getByText('Đã trả lời')).toBeInTheDocument();
    });
  });

  describe('3. Live Poll Voting and Reconciliation', () => {
    const mockPoll: Poll = {
      id: 'poll-test-1',
      tenantId: 'vieworld-demo',
      version: 1,
      updatedAt: '2026-09-09T20:00:00Z',
      sessionId: 'session-dropin-01',
      prompt: 'Bạn muốn nghe bài hát nào tiếp theo?',
      options: [
        { id: 'opt-a', text: 'Bài hát A', votes: 10 },
        { id: 'opt-b', text: 'Bài hát B', votes: 20 },
      ],
      status: 'open',
    };

    it('reconciles total votes with exact sum of option counts', () => {
      const mockVote = vi.fn();
      render(<LivePollPanel poll={mockPoll} onVote={mockVote} />);

      // Total votes: 10 + 20 = 30
      expect(screen.getByText(/Tổng cộng:/i)).toHaveTextContent('30');
      expect(screen.getByText(/10 phiếu \(33%\)/i)).toBeInTheDocument();
      expect(screen.getByText(/20 phiếu \(67%\)/i)).toBeInTheDocument();

      // Click vote on Option A
      const voteBtnA = screen.getByLabelText(/Bình chọn cho: Bài hát A/i);
      fireEvent.click(voteBtnA);
      expect(mockVote).toHaveBeenCalledWith('poll-test-1', 'opt-a');
    });

    it('enforces single vote per fan and highlights selected option', () => {
      const votedPoll: Poll = {
        ...mockPoll,
        options: [
          { id: 'opt-a', text: 'Bài hát A', votes: 11 },
          { id: 'opt-b', text: 'Bài hát B', votes: 20 },
        ],
        userVotedOptionId: 'opt-a',
      };

      render(<LivePollPanel poll={votedPoll} onVote={vi.fn()} />);

      // Verify voted badge and no voting buttons rendered
      expect(screen.getByText(/Bạn đã hoàn thành bình chọn \(1 lượt duy nhất\)/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Bình chọn/i })).not.toBeInTheDocument();
      // Total reconciled: 11 + 20 = 31
      expect(screen.getByText(/Tổng cộng:/i)).toHaveTextContent('31');
    });
  });

  describe('4. Fan Chat Slow Mode, Length Limit & Cooldown', () => {
    it('enforces 140-char limit and triggers slow mode cooldown after message sent', () => {
      render(
        <FanChatPanel
          sessionId="session-dropin-01"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      const input = screen.getByLabelText(/Nội dung tin nhắn trò chuyện/i);
      const sendBtn = screen.getByRole('button', { name: /Gửi/i });

      // Verify character counter
      expect(screen.getByText('0/140 ký tự')).toBeInTheDocument();

      // Send a normal message
      fireEvent.change(input, { target: { value: 'Tuyệt vời quá nghệ sĩ ơi!' } });
      expect(screen.getByText('25/140 ký tự')).toBeInTheDocument();
      fireEvent.click(sendBtn);

      // Verify message is added
      expect(screen.getByText('Tuyệt vời quá nghệ sĩ ơi!')).toBeInTheDocument();

      // Invariant: Slow mode cooldown triggers immediately, disabling send button
      expect(screen.getByText(/Chế độ chậm: vui lòng chờ 5 giây/i)).toBeInTheDocument();
      expect(sendBtn).toBeDisabled();

      // Attempting to send during cooldown is blocked
      fireEvent.change(input, { target: { value: 'Tin nhắn liên tiếp...' } });
      fireEvent.click(sendBtn);
      expect(screen.queryByText('Tin nhắn liên tiếp...')).not.toBeInTheDocument();
    });

    it('blocks message submission when text exceeds 140 characters', () => {
      render(
        <FanChatPanel
          sessionId="session-dropin-01"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      const input = screen.getByLabelText(/Nội dung tin nhắn trò chuyện/i);
      const sendBtn = screen.getByRole('button', { name: /Gửi/i });

      const longMsg = 'X'.repeat(141);
      fireEvent.change(input, { target: { value: longMsg } });

      expect(screen.getByText(/141\/140 ký tự \(Vượt quá giới hạn!\)/i)).toBeInTheDocument();
      expect(sendBtn).toBeDisabled();
    });
  });

  describe('5. Fan Chat Mute and Local Report Reference', () => {
    it('disables sending when chat is muted', () => {
      render(
        <FanChatPanel
          sessionId="session-dropin-01"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      const muteBtn = screen.getByRole('button', { name: /Tắt thông báo trò chuyện/i });
      const input = screen.getByLabelText(/Nội dung tin nhắn trò chuyện/i);
      const sendBtn = screen.getByRole('button', { name: /Gửi/i });

      // Click mute
      fireEvent.click(muteBtn);

      // Verify muted state
      expect(screen.getByText(/Đang tắt trò chuyện · Nút gửi bị vô hiệu hóa/i)).toBeInTheDocument();
      expect(input).toBeDisabled();
      expect(sendBtn).toBeDisabled();

      // Unmute restores input
      fireEvent.click(screen.getByRole('button', { name: /Mở trò chuyện/i }));
      expect(input).not.toBeDisabled();
    });

    it('clicking report generates a local report reference and flags message', () => {
      render(
        <FanChatPanel
          sessionId="session-dropin-01"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      // Find report button on seeded message from another fan
      const reportBtn = screen.getByLabelText(/Báo cáo tin nhắn của Minh Tuấn/i);
      fireEvent.click(reportBtn);

      // Verify report reference is generated and displayed
      expect(screen.getByTestId('report-feedback-banner')).toHaveTextContent(/Đã tiếp nhận báo cáo mã: REPORT-REF-/i);

      // Verify message is visually flagged
      expect(screen.getByText(/Đã báo cáo \(REPORT-REF-/i)).toBeInTheDocument();
    });
  });

  describe('6. Security & Text Safety (No Raw HTML / Script Execution)', () => {
    it('renders script tags and HTML markup harmlessly as inert text', () => {
      render(
        <FanChatPanel
          sessionId="session-dropin-01"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      const input = screen.getByLabelText(/Nội dung tin nhắn trò chuyện/i);
      const sendBtn = screen.getByRole('button', { name: /Gửi/i });

      // Submit script injection test string
      const maliciousScript = '<script>window.__maliciousTest = true;</script>';
      fireEvent.change(input, { target: { value: maliciousScript } });
      fireEvent.click(sendBtn);

      // Verify the script tag is printed as visible plain text
      const renderedText = screen.getByText('<script>window.__maliciousTest = true;</script>');
      expect(renderedText).toBeInTheDocument();

      // Verify window property was never executed
      // @ts-expect-error verifying non-execution
      expect(window.__maliciousTest).toBeUndefined();
    });
  });

  describe('7. Honesty & Non-Negotiable Boundaries', () => {
    it('confirms absence of paid SuperChat, private DMs, or fake read receipts', () => {
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

      // Switch to Questions tab to verify honesty & transparency statement
      const questionsTab = screen.getByRole('tab', { name: /Câu hỏi Q&A/i });
      fireEvent.click(questionsTab);

      // Verify transparency statement
      expect(
        screen.getByText(/Không hỗ trợ trả phí ưu tiên \(SuperChat\), không có tin nhắn riêng tư với nghệ sĩ/i)
      ).toBeInTheDocument();

      // Verify no SuperChat or paid promotion buttons exist anywhere in the view
      expect(screen.queryByRole('button', { name: /SuperChat/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Ưu tiên/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Tin nhắn riêng/i })).not.toBeInTheDocument();
    });
  });
});
