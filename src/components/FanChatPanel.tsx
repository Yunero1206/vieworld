import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../domain/types';
import {
  MessageSquare,
  Send,
  Volume2,
  VolumeX,
  Flag,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export interface FanChatPanelProps {
  sessionId: string;
  currentFanId: string;
  currentFanName: string;
  initialMessages?: ChatMessage[];
}

export const FanChatPanel: React.FC<FanChatPanelProps> = ({
  sessionId,
  currentFanId,
  currentFanName,
  initialMessages,
}) => {
  // Default seeded messages if none passed
  const defaultSeededMessages: ChatMessage[] = [
    {
      id: 'msg-seed-1',
      sessionId,
      fanId: 'fan-linh',
      authorName: 'Linh Nguyễn',
      text: 'Chào cả nhà, sân khấu tối nay thật tuyệt vời!',
      timestamp: '2026-09-09T20:01:00Z',
      isSample: true,
    },
    {
      id: 'msg-seed-2',
      sessionId,
      fanId: 'fan-minh',
      authorName: 'Minh Tuấn',
      text: 'Âm thanh nghe rất trong trẻo và ấm áp.',
      timestamp: '2026-09-09T20:02:00Z',
      isSample: true,
    },
    {
      id: 'msg-seed-3',
      sessionId,
      fanId: 'fan-an',
      authorName: 'Hà An',
      text: 'Ủng hộ dự án VieWorld độc lập!',
      timestamp: '2026-09-09T20:03:00Z',
      isSample: true,
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || defaultSeededMessages);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [reportReference, setReportReference] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    isMuted || cooldownSeconds > 0 || inputText.trim().length === 0 || isTooLong;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'var(--surface)',
      }}
      aria-label="Khung trò chuyện cộng đồng"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--primary)" />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: 0 }}>
            Trò chuyện phòng chờ ({messages.length})
          </h3>
          <span className="demo-badge">DEMO</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mute Chat Stream Toggle */}
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: 'var(--text-xs)',
              backgroundColor: isMuted ? '#FEE2E2' : undefined,
              color: isMuted ? '#B91C1C' : undefined,
              borderColor: isMuted ? '#FCA5A5' : undefined,
            }}
            id="toggle-chat-mute-btn"
            aria-pressed={isMuted}
            aria-label={isMuted ? 'Mở trò chuyện' : 'Tắt thông báo trò chuyện'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isMuted ? 'Đã tắt trò chuyện' : 'Bật trò chuyện'}</span>
          </button>
        </div>
      </div>

      {/* Moderation & Transparency Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
        }}
      >
        <ShieldCheck size={14} color="#059669" />
        <span>
          Chế độ làm chậm 5s bảo vệ cộng đồng. Tin nhắn mẫu được gắn nhãn minh bạch.
        </span>
      </div>

      {/* Report Feedback Notice */}
      {reportReference && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          data-testid="report-feedback-banner"
        >
          <CheckCircle2 size={16} color="#2563EB" />
          <span>
            Đã tiếp nhận báo cáo mã: <strong>{reportReference}</strong>. Ban điều hành sẽ xem xét nội dung theo tiêu chuẩn cộng đồng.
          </span>
        </div>
      )}

      {/* Message Feed Area */}
      <div
        style={{
          minHeight: '220px',
          maxHeight: '340px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '12px',
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
        data-testid="chat-message-feed"
      >
        {messages.map((msg) => {
          const isMine = msg.fanId === currentFanId;

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                backgroundColor: msg.isReported ? '#FEF2F2' : 'var(--surface)',
                borderRadius: 'var(--radius-sm)',
                border: msg.isReported ? '1px dashed #F87171' : '1px solid var(--border)',
                opacity: msg.isReported ? 0.6 : 1,
              }}
              data-testid={`chat-message-${msg.id}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: 'var(--text-xs)', color: isMine ? 'var(--primary)' : 'var(--ink)' }}>
                    {msg.authorName} {isMine && '(Bạn)'}
                  </strong>

                  {msg.isSample && (
                    <span
                      className="tag"
                      style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#EDE9FE', color: 'var(--primary)' }}
                    >
                      Mẫu
                    </span>
                  )}

                  {msg.isReported && (
                    <span
                      className="tag"
                      style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#FEE2E2', color: '#B91C1C' }}
                    >
                      Đã báo cáo ({msg.reportRef})
                    </span>
                  )}
                </div>

                {!msg.isReported && !isMine && (
                  <button
                    type="button"
                    onClick={() => handleReportMessage(msg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    id={`report-msg-btn-${msg.id}`}
                    aria-label={`Báo cáo tin nhắn của ${msg.authorName}`}
                  >
                    <Flag size={12} />
                    <span>Báo cáo</span>
                  </button>
                )}
              </div>

              {/* CRITICAL INVARIANT (§2.3, P05 Acceptance T05): Safe text rendering */}
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink)',
                  wordBreak: 'break-word',
                  lineHeight: '1.4',
                }}
                data-testid={`chat-text-${msg.id}`}
              >
                {msg.text}
              </p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Slow Mode & Length limit */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isMuted}
            placeholder={
              isMuted
                ? 'Trò chuyện đang bị tắt tiếng. Bật trò chuyện để gửi tin nhắn.'
                : 'Nhập tin nhắn giao lưu (tối đa 140 ký tự)...'
            }
            className="input"
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
              border: isTooLong ? '1px solid #EF4444' : '1px solid var(--border)',
            }}
            id="chat-input-field"
            aria-label="Nội dung tin nhắn trò chuyện"
          />

          <button
            type="submit"
            disabled={isSendDisabled}
            className="btn btn-primary"
            style={{ padding: '10px 18px', fontSize: 'var(--text-sm)' }}
            id="chat-send-btn"
          >
            {cooldownSeconds > 0 ? (
              <>
                <Clock size={14} />
                <span>{cooldownSeconds}s</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Gửi</span>
              </>
            )}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
          <span style={{ color: isTooLong ? '#EF4444' : 'var(--muted)' }}>
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
  );
};
