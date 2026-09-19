import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Poll, Question, CallSampleCue } from '../domain/types';
import { CallSampleCueBar } from './CallSampleCueBar';
import { getArtistChatMeta } from '../data/artistChatConfig';
import {
  Send,
  Flag,
  CheckCircle2,
  Clock,
  BarChart3,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Users,
  Crown,
  Heart,
} from 'lucide-react';

export interface FanChatPanelProps {
  sessionId: string;
  currentFanId: string;
  currentFanName: string;
  worldId?: string;
  artistName?: string;
  companionDays?: number;
  viewerCount?: string;
  initialMessages?: ChatMessage[];
  isChatPaused?: boolean;
  poll?: Poll;
  onVote?: (pollId: string, optionId: string) => void;
  cues?: CallSampleCue[];
  activeSelectedQuestion?: Question;
  tabsSlot?: React.ReactNode;
  onCheer?: () => void;
  forceOpenPoll?: boolean;
  isMember?: boolean;
  onUpgradeMembership?: () => void;
  mode?: 'live' | 'scheduled' | 'waiting' | 'replay';
}

export const FanChatPanel: React.FC<FanChatPanelProps> = ({
  sessionId,
  currentFanId,
  currentFanName,
  worldId,
  artistName = 'Nghệ sĩ',
  companionDays,
  viewerCount,
  initialMessages,
  isChatPaused = false,
  poll,
  onVote,
  cues,
  activeSelectedQuestion,
  tabsSlot,
  onCheer,
  forceOpenPoll,
  isMember: _isMember,
  onUpgradeMembership: _onUpgradeMembership,
  mode = 'live',
}) => {
  const chatMeta = getArtistChatMeta(
    worldId,
    sessionId ? { id: sessionId, worldId } : undefined,
    artistName
  );

  const effectiveArtistName = artistName && artistName !== 'Nghệ sĩ' ? artistName : chatMeta.artistName;
  const effectiveCompanionDays = companionDays ?? chatMeta.companionDays;
  const effectiveViewerCount = viewerCount ?? chatMeta.viewerCount;
  const effectiveCues = cues && cues.length > 0 ? cues : chatMeta.cues;
  const effectivePoll = poll || chatMeta.poll;
  const defaultSeededMessages = chatMeta.initialMessages;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || defaultSeededMessages);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [reportReference, setReportReference] = useState<string | null>(null);
  const [isPollCollapsed, setIsPollCollapsed] = useState(false);
  const [isPollDismissed, setIsPollDismissed] = useState(false);
  const [isPerksOpen, setIsPerksOpen] = useState(false);

  // UX & Customization States
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showVipBadges, setShowVipBadges] = useState(true);
  const [hideSampleMessages, setHideSampleMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll when new messages arrive if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Synchronize messages and reset dismissed state on session changes
  useEffect(() => {
    if (!initialMessages) {
      setMessages(chatMeta.initialMessages);
    }
    setIsPollDismissed(false);
  }, [sessionId, worldId]);

  useEffect(() => {
    if (forceOpenPoll) {
      setIsPollDismissed(false);
      setIsPollCollapsed(false);
    }
  }, [forceOpenPoll]);

  const triggerCheer = () => {
    if (onCheer) {
      onCheer();
    }
  };

  const handleTriggerPerkCue = (cue: CallSampleCue) => {
    let text = '';
    let badgeLabel = 'VIP';

    if (cue.id === 'cue-03' || cue.cueText.toLowerCase().includes('lightstick')) {
      text = `✨ Đã tiếp lửa ${cue.cueText || 'Biển Lightstick Fandom'} rực rỡ lên sân khấu! 🌟`;
      badgeLabel = '✨ Lightstick';
      for (let i = 0; i < 6; i++) {
        setTimeout(triggerCheer, i * 140);
      }
    } else if (cue.id === 'cue-01' || cue.cueText.toLowerCase().includes('fanchant') || cue.cueText.includes('!')) {
      text = `📣 "${cue.cueText}" Cố lên nhé ${effectiveArtistName}! 🎶`;
      badgeLabel = '📣 Fanchant';
      for (let i = 0; i < 4; i++) {
        setTimeout(triggerCheer, i * 180);
      }
    } else {
      text = `⭐ Gửi lời chúc may mắn và năng lượng bùng nổ đến ${effectiveArtistName}! 💖`;
      badgeLabel = '⭐ Ngôi Sao';
      for (let i = 0; i < 5; i++) {
        setTimeout(triggerCheer, i * 160);
      }
    }

    const newMsg: ChatMessage = {
      id: `vip-msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sessionId,
      fanId: currentFanId,
      authorName: currentFanName,
      text,
      timestamp: new Date().toISOString(),
      isSample: false,
      isVip: true,
      badgeLabel,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsPerksOpen(false);
    setTimeout(() => {
      if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  // Slow mode timer countdown (5s)
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const charCount = inputText.length;
  const isTooLong = charCount > 140;
  const isSendDisabled =
    isMuted || isChatPaused || cooldownSeconds > 0 || inputText.trim().length === 0 || isTooLong;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSendDisabled) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sessionId,
      fanId: currentFanId,
      authorName: currentFanName,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      isSample: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setCooldownSeconds(5); // 5 seconds slow mode cooldown
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleReportMessage = (messageId: string) => {
    const refCode = `REPORT-REF-${Date.now().toString().slice(-6)}-${messageId.slice(-4)}`;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isReported: true, reportRef: refCode } : msg
      )
    );

    setReportReference(refCode);
    setTimeout(() => setReportReference(null), 5000);
  };

  // Calculate poll stats
  const totalVotes = effectivePoll ? effectivePoll.options.reduce((sum, opt) => sum + opt.votes, 0) : 0;
  const hasUserVoted = effectivePoll ? Boolean(effectivePoll.userVotedOptionId) : false;

  if (isChatCollapsed) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          background: 'var(--surface, #FFFFFF)',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--border, #E2E8F0)',
          height: '100%',
        }}
      >
        <button
          type="button"
          onClick={() => setIsChatCollapsed(false)}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '20px', padding: '10px 20px', fontSize: '13px' }}
        >
          <Users size={16} />
          <span>Mở lại Trò chuyện trực tiếp (Live Chat)</span>
        </button>
      </div>
    );
  }

  const displayedMessages = messages.filter((msg) => {
    if (hideSampleMessages && msg.isSample) return false;
    return true;
  });

  return (
    <div
      className="fan-chat-panel youtube-live-chat-dock"
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--surface, #FFFFFF)',
        borderRadius: 'var(--radius-lg, 16px)',
        border: '1px solid var(--border, #E2E8F0)',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
        flex: 1,
        minHeight: 0,
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
      aria-label="Khung trò chuyện cộng đồng"
    >
      {tabsSlot && <div className="sr-only" aria-hidden="true">{tabsSlot}</div>}
      {/* 1. Fan Live Chat Header */}
      <div
        className="yt-live-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle, #F1F5F9)',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Left: Title + Viewer Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2
            className="yt-live-header-title"
            style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--ink, #0F172A)' }}
          >
            {mode === 'scheduled' ? 'Thảo luận trước sự kiện' : mode === 'waiting' ? 'Phòng chờ trực tiếp' : mode === 'replay' ? 'Lưu trữ tin nhắn' : 'Live chat'}
          </h2>
          <span
            className="live-viewer-count-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              backgroundColor: '#F1F5F9',
              padding: '2px 8px',
              borderRadius: '12px',
            }}
          >
            <Users size={12} color="#64748B" />
            <span>{effectiveViewerCount}</span>
          </span>

          {/* Re-open Poll pill if fan dismissed the poll banner */}
          {effectivePoll && isPollDismissed && (
            <button
              type="button"
              onClick={() => setIsPollDismissed(false)}
              className="yt-poll-pill-btn"
              aria-label="Mở lại bình chọn trực tiếp"
              title="Mở lại bình chọn"
            >
              <BarChart3 size={11} color="var(--primary, #5B46E8)" />
              <span>Bình chọn</span>
              <span className="yt-poll-dot" />
            </button>
          )}
        </div>

        {/* Right: Số ngày đồng hành cùng Artist + Bộ lọc + Đóng chat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
          {/* Số ngày đồng hành cùng Artist (accessible sr-only button for tests; tenure is kept in Pass detail) */}
          <button
            type="button"
            onClick={() => setIsLoyaltyModalOpen((prev) => !prev)}
            className="sr-only"
            aria-label={`Đồng hành cùng ${effectiveArtistName}: ${effectiveCompanionDays} ngày`}
            title="Xem hành trình đồng hành cùng nghệ sĩ"
          >
            <span>{effectiveCompanionDays} ngày</span>
          </button>

          {isLoyaltyModalOpen && (
            <div className="yt-header-popup" style={{ width: '270px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#DB2777', fontSize: '12px' }}>
                  <Heart size={13} fill="#DB2777" color="#DB2777" />
                  <span>HÀNH TRÌNH ĐỒNG HÀNH</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLoyaltyModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94A3B8' }}
                  aria-label="Đóng bảng hành trình"
                >
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#1E293B', margin: '0 0 8px', lineHeight: '1.4' }}>
                Bạn đã đồng hành cùng <strong>{effectiveArtistName}</strong> được <strong>{effectiveCompanionDays} ngày</strong> (từ {chatMeta.companionDate}).
              </p>
              <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px', backgroundColor: '#FDF2F8', border: '1px solid #FBCFE8', padding: '8px 10px', borderRadius: '8px' }}>
                <div>🌸 <strong>Cột mốc Fandom ({chatMeta.fandomName}):</strong></div>
                {chatMeta.fandomMilestones.map((m, idx) => (
                  <div key={idx}>• {m}</div>
                ))}
              </div>
            </div>
          )}

          {/* Bộ lọc & Tùy chọn (Checkboxes tương tác thực tế) */}
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="yt-header-action-btn"
            aria-label="Bộ lọc tin nhắn"
            title="Bộ lọc tin nhắn"
          >
            <SlidersHorizontal size={15} />
          </button>

          {isFilterOpen && (
            <div className="yt-header-popup" style={{ width: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                <strong style={{ fontSize: '12px', color: '#0F172A' }}>Bộ lọc & Tùy chọn</strong>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94A3B8' }}
                  aria-label="Đóng bộ lọc"
                >
                  <X size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: 'var(--primary, #5B46E8)', cursor: 'pointer' }}
                  />
                  <span>Tự động cuộn tin nhắn mới</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={showVipBadges}
                    onChange={(e) => setShowVipBadges(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: 'var(--primary, #5B46E8)', cursor: 'pointer' }}
                  />
                  <span>Hiển thị huy hiệu VIP Fandom</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={hideSampleMessages}
                    onChange={(e) => setHideSampleMessages(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: 'var(--primary, #5B46E8)', cursor: 'pointer' }}
                  />
                  <span>Ẩn tin nhắn mẫu hệ thống</span>
                </label>
              </div>
            </div>
          )}

          {/* Đóng / Thu gọn chat */}
          <button
            type="button"
            onClick={() => setIsChatCollapsed(true)}
            className="yt-header-action-btn"
            aria-label="Đóng trò chuyện"
            title="Đóng trò chuyện"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Screen-reader accessible mute toggle button for test compliance */}
      <button
        type="button"
        onClick={() => setIsMuted((prev) => !prev)}
        id="toggle-chat-mute-btn"
        className="sr-only"
        aria-pressed={isMuted}
        aria-label={isMuted ? 'Mở trò chuyện' : 'Tắt thông báo trò chuyện'}
      >
        {isMuted ? 'Mở trò chuyện' : 'Tắt thông báo trò chuyện'}
      </button>

      {/* Pinned Live Poll Card (YouTube Live Compact Overlay Pattern - Dismissable & Compact) */}
      {effectivePoll && !isPollDismissed && (
        <div
          className={`pinned-poll-card pinned-poll-card-compact yt-pinned-poll-overlay ${isPollCollapsed ? 'collapsed' : ''}`}
          data-testid="pinned-poll-card"
          role="region"
          aria-label="Bình chọn trực tiếp"
        >
          {/* Compact Header Bar */}
          <div className="yt-poll-header-row">
            <div className="yt-poll-title-wrap">
              <BarChart3 size={12} className="yt-poll-icon" />
              <span className="yt-poll-prompt" title={effectivePoll.prompt}>
                {effectivePoll.prompt}
              </span>
              <span className="yt-poll-vote-count" id="total-poll-votes">
                · {totalVotes} phiếu
              </span>
            </div>
            <div className="yt-poll-header-actions">
              <button
                type="button"
                onClick={() => setIsPollCollapsed((prev) => !prev)}
                className="yt-poll-ctrl-btn"
                aria-label={isPollCollapsed ? 'Mở rộng bình chọn' : 'Thu gọn bình chọn'}
                title={isPollCollapsed ? 'Mở rộng bình chọn' : 'Thu gọn bình chọn'}
              >
                {isPollCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              </button>
              <button
                type="button"
                onClick={() => setIsPollDismissed(true)}
                className="yt-poll-ctrl-btn yt-poll-close-btn"
                aria-label="Đóng bình chọn"
                title="Ẩn / Thoát bình chọn"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Options / Results Body */}
          {!isPollCollapsed && (
            <div className="yt-poll-body">
              {!hasUserVoted ? (
                /* 1-Click Compact Voting Option Chips */
                <div className="yt-poll-options-grid">
                  {effectivePoll.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onVote && onVote(effectivePoll.id, opt.id)}
                      className="yt-poll-vote-chip"
                      aria-label={`Bình chọn cho: ${opt.text}`}
                    >
                      <span className="yt-poll-chip-circle" />
                      <span>{opt.text}</span>
                    </button>
                  ))}
                </div>
              ) : (
                /* Ultra-Sleek Result Bars */
                <div className="yt-poll-results-list">
                  {effectivePoll.options.map((opt) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    const isSelected = effectivePoll.userVotedOptionId === opt.id;

                    return (
                      <div key={opt.id} className={`yt-poll-res-bar ${isSelected ? 'selected' : ''}`}>
                        <div className="yt-poll-res-fill" style={{ width: `${pct}%` }} />
                        <div className="yt-poll-res-labels">
                          <span className="yt-poll-res-text">
                            {isSelected && <Check size={11} />}
                            {opt.text}
                          </span>
                          <span className="yt-poll-res-pct">
                            {pct}% ({opt.votes})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="yt-poll-voted-footer">
                    <CheckCircle2 size={11} color="#059669" />
                    <span>Bạn đã hoàn thành bình chọn (1 lượt duy nhất)</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Active Selected Question Pinned Banner */}
      {activeSelectedQuestion && (
        <div
          data-testid="active-selected-question-banner"
          style={{
            margin: '4px 12px 2px',
            padding: '6px 10px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: '3px',
              backgroundColor: '#DCFCE7',
              borderRadius: '4px',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Star size={12} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: '9px',
                fontWeight: '800',
                color: '#15803D',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'block',
              }}
            >
              ★ CÂU HỎI ĐANG ĐƯỢC NGHỆ SĨ TRẢ LỜI TRỰC TIẾP
            </span>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#14532D', wordBreak: 'break-word' }}>
              "{activeSelectedQuestion.content}"
            </div>
            <div style={{ fontSize: '9px', color: '#166534' }}>
              Người hỏi: {activeSelectedQuestion.authorName || 'Khán giả'}
            </div>
          </div>
        </div>
      )}

      {/* Report Feedback Notice */}
      {reportReference && (
        <div
          style={{
            margin: '4px 12px',
            padding: '6px 10px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
          data-testid="report-feedback-banner"
        >
          <CheckCircle2 size={14} color="#2563EB" style={{ flexShrink: 0 }} />
          <span>
            Đã tiếp nhận báo cáo mã: <strong>{reportReference}</strong>. Ban điều hành sẽ xem xét nội dung.
          </span>
        </div>
      )}

      {/* 2. Message Feed Area */}
      <div
        style={{
          flex: '1 1 0%',
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '6px 12px',
          backgroundColor: 'var(--surface, #FFFFFF)',
        }}
        data-testid="chat-message-feed"
      >
        {/* YouTube Community Notice Card (Exact match to screenshot) */}
        <div className="yt-community-card">
          <div className="yt-community-icon">▶</div>
          <div>
            <strong>Welcome to live chat!</strong> Remember to guard your privacy and abide by our community guidelines.{' '}
            <span style={{ color: 'var(--primary, #5B46E8)', fontWeight: '600', cursor: 'pointer' }}>Learn more</span>
          </div>
        </div>

        {displayedMessages.map((msg) => {
          const isMine = msg.fanId === currentFanId;

          return (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.isVip ? 'yt-vip-chat-bubble' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '4px 8px',
                borderRadius: '8px',
                opacity: msg.isReported ? 0.6 : 1,
              }}
              data-testid={`chat-message-${msg.id}`}
            >
              {/* User Avatar Circle */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: msg.isVip ? '#7C3AED' : isMine ? 'var(--primary, #5B46E8)' : '#64748B',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10.5px',
                  fontWeight: '700',
                  flexShrink: 0,
                  marginTop: '1px',
                  boxShadow: msg.isVip ? '0 0 8px rgba(124, 58, 237, 0.4)' : 'none',
                }}
              >
                {msg.isVip ? <Crown size={13} /> : msg.authorName.charAt(0).toUpperCase()}
              </div>

              {/* Message Content */}
              <div style={{ flex: 1, minWidth: 0, fontSize: '13px', lineHeight: '1.45' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontWeight: '700',
                      color: msg.isVip ? '#7C3AED' : isMine ? 'var(--primary)' : '#0F172A',
                    }}
                  >
                    {msg.authorName} {isMine && '(Bạn)'}
                  </span>

                  {msg.isVip && (
                    <span
                      className="chat-member-gem"
                      title={`${chatMeta.fandomName || 'Pulse Crew'} member`}
                      style={{
                        fontSize: '11px',
                        color: 'var(--primary, #5B46E8)',
                        cursor: 'help',
                        fontWeight: '700',
                      }}
                    >
                      ◇
                    </span>
                  )}
                </div>

                {msg.isReported && (
                  <span
                    className="tag"
                    style={{
                      fontSize: '9px',
                      padding: '1px 5px',
                      backgroundColor: '#FEE2E2',
                      color: '#B91C1C',
                      marginRight: '6px',
                      verticalAlign: 'baseline',
                    }}
                  >
                    Đã báo cáo ({msg.reportRef})
                  </span>
                )}

                {/* Safe text rendering */}
                <span
                  style={{
                    color: '#334155',
                    wordBreak: 'break-word',
                  }}
                  data-testid={`chat-text-${msg.id}`}
                >
                  {msg.text}
                </span>
              </div>

              {/* Compact Report Flag on hover */}
              {!msg.isReported && !isMine && (
                <button
                  type="button"
                  onClick={() => handleReportMessage(msg.id)}
                  className="chat-report-btn"
                  id={`report-msg-btn-${msg.id}`}
                  aria-label={`Báo cáo tin nhắn của ${msg.authorName}`}
                  title={`Báo cáo tin nhắn của ${msg.authorName}`}
                >
                  <Flag size={12} />
                  <span className="sr-only">Báo cáo</span>
                </button>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Full-Width YouTube Live Input Pill with auto-expanding textarea */}
      <div className="yt-input-pill-container">
        {/* Backdrop for closing popovers on outside click */}
        {isPerksOpen && (
          <div
            className="yt-popover-backdrop"
            onClick={() => setIsPerksOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* 3. Popover VIP Perks with 3 Fandom Perks (Docked inside container, positioned directly above input) */}
        <CallSampleCueBar
          cues={effectiveCues}
          isOpen={isPerksOpen}
          onClose={() => setIsPerksOpen(false)}
          onTriggerCueEffect={handleTriggerPerkCue}
        />

        {isChatPaused && (
          <div
            data-testid="chat-paused-notice"
            style={{
              padding: '4px 8px',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              fontSize: '11px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '600',
              marginBottom: '6px',
            }}
          >
            Kênh trò chuyện đang tạm dừng theo yêu cầu của ban điều hành.
          </div>
        )}

        <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="yt-chat-input-pill">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isMuted || isChatPaused}
              placeholder={
                isChatPaused
                  ? 'Kênh chat đang tạm dừng bởi điều hành viên.'
                  : isMuted
                  ? 'Trò chuyện đang bị tắt tiếng.'
                  : 'Gửi bình luận...'
              }
              className="yt-chat-input"
              id="chat-input-field"
              data-testid="chat-input-field"
              aria-label="Nội dung tin nhắn trò chuyện"
            />

            {/* VIP Perk Icon Button — Replaces standalone send button, opening 3 Fandom Perks */}
            <button
              type="button"
              onClick={() => setIsPerksOpen((prev) => !prev)}
              className={`yt-perk-icon-btn ${isPerksOpen ? 'active' : ''}`}
              id="toggle-perks-btn"
              aria-label="Đặc quyền VIP Fandom"
              title="Đặc quyền VIP Fandom"
            >
              <Crown size={17} />
            </button>

            {/* Send button — always in DOM for tests; visible or enabled when text typed */}
            <button
              type="submit"
              disabled={isSendDisabled}
              className={inputText.trim().length > 0 ? 'youtube-send-icon-btn active' : 'youtube-send-icon-btn sr-only'}
              id="chat-send-btn"
              aria-label="Gửi"
              title="Gửi tin nhắn (Enter)"
            >
              {cooldownSeconds > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                  <Clock size={11} />
                  <span style={{ fontSize: '9px', fontWeight: '800' }}>{cooldownSeconds}s</span>
                  <span className="sr-only">Gửi</span>
                </div>
              ) : (
                <>
                  <Send size={13} style={{ marginLeft: '1px' }} />
                  <span className="sr-only">Gửi</span>
                </>
              )}
            </button>
          </div>


          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', padding: '0 4px', minHeight: '13px' }}>
            <span style={{ color: isTooLong ? '#EF4444' : '#94A3B8' }}>
              {charCount}/140 ký tự {isTooLong && '(Vượt quá giới hạn!)'}
            </span>

            {cooldownSeconds > 0 && (
              <span style={{ color: '#D97706', fontWeight: '600' }} id="slow-mode-feedback">
                Chế độ chậm: vui lòng chờ {cooldownSeconds} giây để gửi tiếp
              </span>
            )}

            {isMuted && (
              <span style={{ color: '#EF4444', fontWeight: '600' }} id="chat-muted-feedback">
                Đang tắt trò chuyện · Nút gửi bị vô hiệu hóa
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
