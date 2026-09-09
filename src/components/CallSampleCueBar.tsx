import React, { useState } from 'react';
import { CallSampleCue } from '../domain/types';
import { Megaphone, Sparkles, ShieldAlert } from 'lucide-react';

export interface CallSampleCueBarProps {
  cues?: CallSampleCue[];
}

export const CallSampleCueBar: React.FC<CallSampleCueBarProps> = ({
  cues = [],
}) => {
  const [activeCueId, setActiveCueId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!cues || cues.length === 0) {
    return null;
  }

  const handleTriggerCue = (cue: CallSampleCue) => {
    setActiveCueId(cue.id);
    setFeedbackMessage(`★ Bạn vừa hưởng ứng: "${cue.cueText}" (Mô phỏng hiệu ứng cục bộ)`);
    setTimeout(() => {
      setActiveCueId(null);
    }, 2000);
  };

  return (
    <section
      className="card"
      style={{
        padding: '16px 20px',
        backgroundColor: '#1E1B4B',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(169, 229, 212, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      aria-label="Khẩu hiệu cổ vũ trực tiếp"
      data-testid="call-sample-cue-bar"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Megaphone size={16} color="#A9E5D4" />
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', color: '#E0E7FF', margin: 0 }}>
            Khẩu hiệu tương tác trực tiếp (Call Sample Cues)
          </h4>
        </div>
        <span className="demo-badge">TƯƠNG TÁC CỤC BỘ</span>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {cues.map((cue) => {
          const isActive = activeCueId === cue.id;
          return (
            <button
              key={cue.id}
              type="button"
              onClick={() => handleTriggerCue(cue)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
                color: isActive ? '#151426' : '#FFFFFF',
                border: '1px solid rgba(169, 229, 212, 0.4)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              data-testid={`trigger-cue-${cue.id}`}
              aria-label={cue.prompt}
            >
              <Sparkles size={14} color={isActive ? '#151426' : '#A9E5D4'} />
              <span>{cue.actionLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback notice */}
      {feedbackMessage && (
        <div
          style={{
            fontSize: '11px',
            color: '#A9E5D4',
            fontWeight: '600',
            padding: '6px 10px',
            backgroundColor: 'rgba(169, 229, 212, 0.1)',
            borderRadius: 'var(--radius-sm)',
          }}
          data-testid="cue-feedback-message"
        >
          {feedbackMessage}
        </div>
      )}

      {/* Truthful Disclosure: No Multi-User Audio Jam (§2.3, P13 Acceptance T13) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#9CA3AF',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        data-testid="call-sample-cue-disclaimer"
      >
        <ShieldAlert size={14} color="#FBBF24" style={{ flexShrink: 0 }} />
        <span>
          Mô phỏng hiệu ứng tương tác cục bộ để tăng trải nghiệm cá nhân. Không đồng bộ âm thanh WebRTC đa người dùng hay cam kết jam nhạc thời gian thực.
        </span>
      </div>
    </section>
  );
};
