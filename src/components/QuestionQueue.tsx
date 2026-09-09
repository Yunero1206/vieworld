import React, { useState } from 'react';
import { Question, Session } from '../domain/types';
import { HelpCircle, Send, CheckCircle2, Star, MessageSquareCheck, Clock, ShieldAlert } from 'lucide-react';

export interface QuestionQueueProps {
  session: Session;
  questions: Question[];
  currentFanId: string;
  onSubmitQuestion: (content: string, requestId?: string) => void;
  onSelectQuestion: (questionId: string) => void;
  onAnswerQuestion: (questionId: string) => void;
}

export const QuestionQueue: React.FC<QuestionQueueProps> = ({
  session,
  questions,
  currentFanId,
  onSubmitQuestion,
  onSelectQuestion,
  onAnswerQuestion,
}) => {
  const [content, setContent] = useState('');
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);

  const isRunning = session.status === 'running';
  const charCount = content.length;
  const isTooLong = charCount > 200;
  const isValid = content.trim().length > 0 && !isTooLong;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !isRunning) return;

    // Idempotency client key
    const requestId = `req_q_${Date.now()}_${content.trim().substring(0, 10)}`;
    onSubmitQuestion(content.trim(), requestId);
    setContent('');
    setSubmitNotice('Câu hỏi đã được gửi thành công vào hàng đợi kiểm duyệt.');
    setTimeout(() => setSubmitNotice(null), 4000);
  };

  const getStatusBadge = (status: Question['status']) => {
    switch (status) {
      case 'selected':
        return (
          <span
            className="tag"
            style={{ backgroundColor: '#DCFCE7', color: '#166534', fontWeight: '700' }}
            id="question-status-selected"
          >
            <Star size={12} style={{ marginRight: '4px' }} />
            Được host chọn
          </span>
        );
      case 'answered':
        return (
          <span
            className="tag"
            style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}
            id="question-status-answered"
          >
            <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
            Đã trả lời
          </span>
        );
      case 'under_review':
        return (
          <span
            className="tag"
            style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
            id="question-status-under-review"
          >
            <Clock size={12} style={{ marginRight: '4px' }} />
            Đang duyệt
          </span>
        );
      case 'closed':
        return (
          <span
            className="tag"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
            id="question-status-closed"
          >
            Đã đóng
          </span>
        );
      case 'submitted':
      default:
        return (
          <span
            className="tag"
            style={{ backgroundColor: '#E0F2FE', color: '#075985' }}
            id="question-status-submitted"
          >
            <Clock size={12} style={{ marginRight: '4px' }} />
            Đã gửi (Chờ xem xét)
          </span>
        );
    }
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
      aria-label="Hàng đợi câu hỏi Q&A"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="var(--primary)" />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: 0 }}>
            Hàng đợi câu hỏi Q&A ({questions.length})
          </h3>
          <span className="demo-badge">DEMO</span>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          {isRunning ? 'Nhận câu hỏi trực tiếp' : 'Hàng đợi chỉ mở khi phiên đang diễn ra'}
        </span>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!isRunning}
            placeholder={
              isRunning
                ? 'Đặt câu hỏi chân thành cho nghệ sĩ (tối đa 200 ký tự)...'
                : 'Phiên chưa phát trực tiếp. Hàng đợi câu hỏi tạm thời đóng.'
            }
            rows={3}
            className="input"
            style={{
              width: '100%',
              resize: 'vertical',
              fontSize: 'var(--text-sm)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: isTooLong ? '1px solid #EF4444' : '1px solid var(--border)',
            }}
            id="question-input"
            aria-label="Nội dung câu hỏi"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: isTooLong ? '#EF4444' : 'var(--muted)', fontWeight: isTooLong ? '700' : 'normal' }}>
              {charCount}/200 ký tự
            </span>
            {isTooLong && <span style={{ color: '#EF4444' }}>Vượt quá độ dài cho phép!</span>}
          </div>

          <button
            type="submit"
            disabled={!isValid || !isRunning}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}
            id="submit-question-btn"
          >
            <Send size={14} />
            <span>Gửi câu hỏi</span>
          </button>
        </div>

        {submitNotice && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            data-testid="question-submit-success"
          >
            <CheckCircle2 size={14} />
            <span>{submitNotice}</span>
          </div>
        )}
      </form>

      {/* Honesty Disclosure Banner (§2.3, §3) */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <ShieldAlert size={14} color="var(--primary)" />
        <span>
          Không hỗ trợ trả phí ưu tiên (SuperChat), không có tin nhắn riêng tư với nghệ sĩ, không tạo biên nhận đọc nhân tạo.
        </span>
      </div>

      {/* Question List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
        {questions.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            Chưa có câu hỏi nào trong phiên này. Hãy là người đầu tiên gửi câu hỏi!
          </div>
        ) : (
          questions.map((q) => {
            const isMine = q.fanId === currentFanId;

            return (
              <div
                key={q.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  border: q.status === 'selected' ? '1px solid #34D399' : '1px solid var(--border)',
                  backgroundColor: q.status === 'selected' ? '#F0FDF4' : 'var(--surface)',
                }}
                data-testid={`question-item-${q.id}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                      {q.authorName} {isMine && <span style={{ color: 'var(--primary)' }}>(Bạn)</span>}
                    </span>
                    {getStatusBadge(q.status)}
                  </div>

                  {/* Operator Demo Controls for T05 and manual verification */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {q.status !== 'selected' && q.status !== 'answered' && (
                      <button
                        type="button"
                        onClick={() => onSelectQuestion(q.id)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        id={`select-question-btn-${q.id}`}
                        aria-label="Mô phỏng: Chọn"
                      >
                        <Star size={11} color="#D97706" />
                        <span>Mô phỏng: Chọn</span>
                      </button>
                    )}

                    {q.status === 'selected' && (
                      <button
                        type="button"
                        onClick={() => onAnswerQuestion(q.id)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        id={`answer-question-btn-${q.id}`}
                        aria-label="Mô phỏng: Đã trả lời"
                      >
                        <MessageSquareCheck size={11} color="#10B981" />
                        <span>Mô phỏng: Đã trả lời</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Content (Rendered as safe text string) */}
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink)', lineHeight: '1.5' }}>
                  {q.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
