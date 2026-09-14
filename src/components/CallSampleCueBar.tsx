import React, { useState } from 'react';
import { CallSampleCue } from '../domain/types';
import { Sparkles, Megaphone, Star, X } from 'lucide-react';

export interface CallSampleCueBarProps {
  cues?: CallSampleCue[];
  isOpen?: boolean;
  onClose?: () => void;
  onTriggerCueEffect?: (cue: CallSampleCue) => void;
}

export const CallSampleCueBar: React.FC<CallSampleCueBarProps> = ({
  cues = [],
  isOpen = true,
  onClose,
  onTriggerCueEffect,
}) => {
  const [activeCueId, setActiveCueId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [lightstickActive, setLightstickActive] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleTriggerCue = (cue: CallSampleCue) => {
    setActiveCueId(cue.id);
    const isLightstick =
      cue.id === 'cue-03' ||
      cue.cueText.toLowerCase().includes('lightstick') ||
      cue.actionLabel.toLowerCase().includes('lightstick');

    if (isLightstick) {
      setLightstickActive(true);
      setFeedbackMessage(
        '★ Đang vẫy lightstick ảo (hiệu ứng cục bộ trên màn hình). Không tăng số lượng khán giả và không tự động cấp capsule.'
      );
    } else if (cue.id === 'cue-01' || cue.cueText.toLowerCase().includes('fanchant')) {
      setFeedbackMessage('★ Bạn vừa hưởng ứng: "VI-E-WORLD!" (Mô phỏng hiệu ứng cục bộ)');
    } else {
      setFeedbackMessage(`★ Bạn vừa hưởng ứng: "${cue.cueText || 'ĐIỆP KHÚC!'}" (Mô phỏng hiệu ứng cục bộ)`);
    }

    if (onTriggerCueEffect) {
      onTriggerCueEffect(cue);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveCueId(null);
      if (isLightstick) {
        setLightstickActive(false);
      }
    }, 2800);
  };

  // Find or fallback the 3 Fandom Membership Perks
  const fanchantCue: CallSampleCue = cues.find(c => c.id === 'cue-01') || {
    id: 'cue-01',
    cueText: 'VI-E-WORLD!',
    prompt: 'Đồng thanh hô vang fanchant chính thức hòa nhịp ca khúc!',
    actionLabel: 'Hô fanchant',
  };

  const spotlightCue: CallSampleCue = cues.find(c => c.id === 'cue-02') || {
    id: 'cue-02',
    cueText: 'ĐIỆP KHÚC!',
    prompt: 'Hòa giọng và gửi lời chúc đính kèm Star Badge độc quyền!',
    actionLabel: 'Lời nhắn ngôi sao',
  };

  const lightstickCue: CallSampleCue = cues.find(c => c.id === 'cue-03') || {
    id: 'cue-03',
    cueText: 'LIGHTSTICK XANH!',
    prompt: 'Bật và vẫy lightstick ảo tạo biển ánh sáng tiếp sức idol!',
    actionLabel: 'Vẫy lightstick ảo',
  };

  return (
    <div
      className="call-sample-cue-bar yt-vip-perks-dock"
      data-testid="call-sample-cue-bar"
      aria-label="Đặc quyền Fandom Hội viên VIP"
    >
      <div
        className="yt-vip-perks-popover"
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        {/* Popover Header */}
        <div className="yt-vip-popover-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.03em' }}>
            <Sparkles size={13} />
            <span>ĐẶC QUYỀN HỘI VIÊN (IDOL VIP)</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              aria-label="Đóng bảng đặc quyền"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Perk 1: Lightstick Tiếp Lửa (Fandom Lightstick Glow) */}
        <button
          key={lightstickCue.id}
          type="button"
          onClick={() => handleTriggerCue(lightstickCue)}
          className={`yt-vip-card cue-button--lightstick ${activeCueId === lightstickCue.id ? 'active' : ''}`}
          data-testid="trigger-cue-cue-03"
          aria-label={lightstickCue.prompt}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0 }}>
            <Sparkles size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
              ✨ {lightstickCue.actionLabel || 'Lightstick Tiếp Lửa'}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', lineHeight: '1.3' }}>
              {lightstickCue.prompt || 'Vẫy biển ánh sáng Fandom rực rỡ trên sân khấu'}
            </div>
          </div>
        </button>

        {/* Perk 2: Fanchant Đồng Thanh (Official Fanchant Anthem) */}
        <button
          key={fanchantCue.id}
          type="button"
          onClick={() => handleTriggerCue(fanchantCue)}
          className={`yt-vip-card ${activeCueId === fanchantCue.id ? 'active' : ''}`}
          data-testid="trigger-cue-cue-01"
          aria-label={fanchantCue.prompt}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #5B46E8 0%, #4338CA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0 }}>
            <Megaphone size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
              📣 {fanchantCue.actionLabel || 'Fanchant Đồng Thanh'}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', lineHeight: '1.3' }}>
              {fanchantCue.prompt || 'Đồng thanh hô vang khẩu hiệu chính thức tiếp sức Idol'}
            </div>
          </div>
        </button>

        {/* Perk 3: Lời Nhắn Ngôi Sao (VIP Spotlight Cheer) */}
        <button
          key={spotlightCue.id}
          type="button"
          onClick={() => handleTriggerCue(spotlightCue)}
          className={`yt-vip-card ${activeCueId === spotlightCue.id ? 'active' : ''}`}
          data-testid="trigger-cue-cue-02"
          aria-label={spotlightCue.prompt}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0 }}>
            <Star size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
              ⭐ {spotlightCue.actionLabel || 'Lời Nhắn Ngôi Sao'}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', lineHeight: '1.3' }}>
              {spotlightCue.prompt || 'Lời nhắn gắn huy hiệu Membership Star Badge độc quyền'}
            </div>
          </div>
        </button>
      </div>

      {/* Active Lightstick Local Visual Pulse */}
      {lightstickActive && (
        <div
          className="lightstick-active-badge"
          data-testid="lightstick-local-feedback"
          aria-live="polite"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '6px',
            color: '#1D4ED8',
            fontSize: '10.5px',
            fontWeight: '600',
            marginTop: '4px',
          }}
        >
          <Sparkles size={11} color="#2563EB" className="lightstick-pulse-icon" />
          <span>✨ Đang vẫy lightstick ảo cục bộ (chỉ hiển thị trên màn hình của bạn)</span>
        </div>
      )}

      {/* Feedback notice toast */}
      {feedbackMessage && (
        <div
          style={{
            fontSize: '10.5px',
            color: '#15803D',
            fontWeight: '600',
            padding: '4px 8px',
            backgroundColor: '#DCFCE7',
            borderRadius: '6px',
            border: '1px solid #86EFAC',
            marginTop: '4px',
          }}
          data-testid="cue-feedback-message"
        >
          {feedbackMessage}
        </div>
      )}

      {/* Accessible disclaimers for test contracts (§5.2 invariant) */}
      <span
        data-testid="call-sample-cue-disclaimer"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Mô phỏng hiệu ứng tương tác cục bộ để tăng trải nghiệm cá nhân. Không đồng bộ âm thanh WebRTC đa người dùng hay cam kết jam nhạc thời gian thực.
      </span>

      <span
        data-testid="lightstick-disclaimer"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Hiệu ứng vẫy lightstick chỉ diễn ra cục bộ trên thiết bị của bạn. Tuyệt đối không làm tăng số lượng khán giả ảo và không tự động cấp capsule khi chưa đủ điều kiện tham dự thực tế.
      </span>
    </div>
  );
};
