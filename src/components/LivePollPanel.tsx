import React from 'react';
import { Poll } from '../domain/types';
import { BarChart3, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

export interface LivePollPanelProps {
  poll?: Poll;
  onVote: (pollId: string, optionId: string) => void;
}

export const LivePollPanel: React.FC<LivePollPanelProps> = ({ poll, onVote }) => {
  if (!poll) {
    return (
      <div
        className="card"
        style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--surface)' }}
        aria-label="Bình chọn trực tiếp"
      >
        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
          Hiện chưa có cuộc bình chọn nào đang diễn ra trong phiên này.
        </p>
      </div>
    );
  }

  const isClosed = poll.status === 'closed';
  const hasVoted = Boolean(poll.userVotedOptionId);

  // Total votes reconciliation: guaranteed exact sum
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

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
      aria-label="Bảng bình chọn trực tiếp"
      data-testid={`poll-panel-${poll.id}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="var(--primary)" />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: 0 }}>
            Bình chọn trực tiếp cùng nghệ sĩ
          </h3>
          <span className="demo-badge">DEMO</span>
        </div>

        <span
          className="tag"
          style={{
            backgroundColor: isClosed ? '#F3F4F6' : '#DCFCE7',
            color: isClosed ? '#6B7280' : '#15803D',
            fontWeight: '700',
          }}
        >
          {isClosed ? <Lock size={12} style={{ marginRight: '4px' }} /> : null}
          {isClosed ? 'Đã đóng bình chọn' : 'Đang mở bình chọn'}
        </span>
      </div>

      {/* Prompt question */}
      <h4 style={{ fontSize: 'var(--text-md)', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--ink)' }}>
        {poll.prompt}
      </h4>

      {/* Options list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {poll.options.map((opt) => {
          const isSelected = poll.userVotedOptionId === opt.id;
          const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

          return (
            <div
              key={opt.id}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: isSelected ? '#F5F3FF' : 'var(--bg)',
                transition: 'all 200ms ease',
              }}
              data-testid={`poll-option-${opt.id}`}
            >
              {/* Progress bar background fill */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${percentage}%`,
                  backgroundColor: isSelected ? 'rgba(101, 81, 200, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                  transition: 'width 400ms ease',
                  zIndex: 1,
                }}
                aria-hidden="true"
              />

              {/* Option row interactive content */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  {isSelected && <CheckCircle2 size={16} color="var(--primary)" />}
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: isSelected ? '700' : '500' }}>
                    {opt.text}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: '600' }}>
                    {opt.votes.toLocaleString('vi-VN')} phiếu ({percentage}%)
                  </span>

                  {!hasVoted && !isClosed && (
                    <button
                      type="button"
                      onClick={() => onVote(poll.id, opt.id)}
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}
                      id={`vote-btn-${opt.id}`}
                      aria-label={`Bình chọn cho: ${opt.text}`}
                    >
                      Bình chọn
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Reconciliation & Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border)',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#059669" />
          <span id="poll-reconciled-total">
            Tổng cộng: <strong>{totalVotes.toLocaleString('vi-VN')}</strong> lượt bình chọn (Khớp số liệu minh bạch)
          </span>
        </div>

        {hasVoted && (
          <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
            ✓ Bạn đã hoàn thành bình chọn (1 lượt duy nhất)
          </span>
        )}
      </div>
    </div>
  );
};
