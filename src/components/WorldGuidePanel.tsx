import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  X,
  Search,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Compass,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  APPROVED_KNOWLEDGE_CARDS,
  queryWorldGuide,
  GuideQueryResult,
  GuideKnowledgeCard,
} from '../data/guideKnowledge';

export interface WorldGuidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldGuidePanel: React.FC<WorldGuidePanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [queryResult, setQueryResult] = useState<GuideQueryResult>({
    type: 'unknown',
    query: '',
    message: 'Chọn một chủ đề gợi ý bên dưới hoặc nhập câu hỏi tra cứu thông tin ứng dụng.',
    suggestedTopics: APPROVED_KNOWLEDGE_CARDS.slice(0, 4),
  });

  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Handle ESC key to close and restore focus
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else if (previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = queryWorldGuide(searchInput);
    setQueryResult(result);
  };

  const handleSelectTopic = (card: GuideKnowledgeCard) => {
    setSearchInput(card.title);
    setQueryResult({
      type: 'answered',
      query: card.title,
      cards: [card],
    });
  };

  const handleClear = () => {
    setSearchInput('');
    setQueryResult({
      type: 'unknown',
      query: '',
      message: 'Chọn một chủ đề gợi ý bên dưới hoặc nhập câu hỏi tra cứu thông tin ứng dụng.',
      suggestedTopics: APPROVED_KNOWLEDGE_CARDS.slice(0, 4),
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(21, 20, 38, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      data-testid="world-guide-modal"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '100%',
          backgroundColor: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          overflowY: 'auto',
        }}
      >
        {/* Header with Visible Disclaimer (§2.3, P14 Acceptance T14) */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--surface-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={22} color="var(--primary)" />
              <h2 id="guide-title" style={{ fontSize: 'var(--text-lg)', fontWeight: '800', margin: 0, color: 'var(--ink)' }}>
                Hướng dẫn VieWorld
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--muted)',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
              }}
              aria-label="Đóng bảng hướng dẫn"
              data-testid="close-world-guide-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mandatory Visible Attribution Banner (CONSTITUTION §3, Acceptance T14) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'var(--surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: 'var(--text-xs)',
              color: 'var(--primary)',
              fontWeight: '700',
            }}
            data-testid="guide-disclaimer-banner"
          >
            <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>Hướng dẫn demo · Không phải nghệ sĩ</span>
          </div>

          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink)', fontWeight: '500', lineHeight: '1.5' }}>
            Tìm đường trong Artist World, Hall và My Space; tra cứu vật phẩm, cuộc hẹn và quyền lợi của bạn.
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: '1.4' }}>
            Hướng dẫn có sẵn trong bản demo, không đại diện cho nghệ sĩ và không thay đổi tài khoản hay đơn hàng của bạn.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                color="var(--muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tra cứu: hội viên, quyền lợi, đơn hàng, sân khấu..."
                className="input"
                style={{ width: '100%', paddingLeft: '36px', fontSize: 'var(--text-xs)' }}
                data-testid="guide-search-input"
                aria-label="Nhập câu hỏi hoặc từ khóa tra cứu"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: 'var(--text-xs)', padding: '0 16px' }}
              data-testid="guide-search-submit-btn"
            >
              Tra cứu
            </button>
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary"
                style={{ fontSize: 'var(--text-xs)', padding: '0 12px' }}
                data-testid="guide-clear-search-btn"
              >
                Xóa
              </button>
            )}
          </form>

          {/* Quick Topic Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Bạn cần tìm gì?
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {APPROVED_KNOWLEDGE_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectTopic(card)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    fontSize: '11px',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                  data-testid={`guide-topic-chip-${card.topic}`}
                >
                  <Sparkles size={11} color="var(--primary)" />
                  <span>{card.topicLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search / Answer Result Presentation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            {/* 1. Answered Knowledge Cards */}
            {queryResult.type === 'answered' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: '600' }}>
                  Tìm thấy {queryResult.cards.length} nội dung hướng dẫn phù hợp:
                </span>
                {queryResult.cards.map((card) => (
                  <article
                    key={card.id}
                    className="card"
                    style={{
                      padding: '16px 18px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid rgba(101, 81, 200, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                    data-testid="guide-answer-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span className="tag" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--primary)', fontWeight: '700', fontSize: '10px' }}>
                        {card.topicLabel}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--muted)' }}>
                        <Clock size={10} />
                        <span>Cập nhật: {card.updatedAt}</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '800', margin: 0, color: 'var(--ink)' }}>
                      {card.title}
                    </h3>

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
                      {card.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--muted)' }}>
                        <FileText size={11} color="var(--primary)" />
                        <span>Nguồn: <code>{card.sourceTitle}</code></span>
                      </div>

                      <Link
                        to={card.actionLink.to}
                        onClick={onClose}
                        className="btn btn-primary"
                        style={{ fontSize: '11px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        data-testid="guide-action-link"
                      >
                        <span>{card.actionLink.label}</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* 2. Prompt Injection Neutralized Notice */}
            {queryResult.type === 'injection_blocked' && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 'var(--radius-md)',
                  color: '#991B1B',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
                data-testid="guide-injection-blocked-notice"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="#DC2626" />
                  <strong style={{ fontSize: 'var(--text-xs)', color: '#991B1B' }}>
                    Phát hiện câu lệnh can thiệp hệ thống bị chặn
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', lineHeight: '1.5' }}>
                  {queryResult.message}
                </p>
                <span style={{ fontSize: '10px', color: '#B91C1C' }}>
                  Trạng thái bảo mật: Quyền sở hữu, hội viên và đơn hàng hoàn toàn được bảo vệ nguyên vẹn.
                </span>
              </div>
            )}

            {/* 3. Unsupported Topic Limitation Notice */}
            {queryResult.type === 'unsupported_topic' && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: 'var(--radius-md)',
                  color: '#92400E',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
                data-testid="guide-limitation-notice"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} color="#D97706" />
                  <strong style={{ fontSize: 'var(--text-xs)', color: '#92400E' }}>
                    Phạm vi trả lời bị giới hạn
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', lineHeight: '1.5' }}>
                  {queryResult.message}
                </p>
                <span style={{ fontSize: '10px', color: '#B45309' }}>
                  Lý do từ chối: {queryResult.limitationReason}
                </span>
              </div>
            )}

            {/* 4. Unknown Query Honest Decline Notice */}
            {queryResult.type === 'unknown' && queryResult.query && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--surface-subtle)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
                data-testid="guide-unknown-query-notice"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={18} color="var(--muted)" />
                  <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                    Không tìm thấy nội dung hướng dẫn phù hợp
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: '1.5' }}>
                  {queryResult.message}
                </p>
                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                    Gợi ý tra cứu:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {queryResult.suggestedTopics.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectTopic(s)}
                        className="btn btn-secondary"
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                      >
                        {s.topicLabel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--muted)',
          }}
        >
          <span>Cẩm nang VieWorld · Bản thử nghiệm</span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
