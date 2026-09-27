import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { APPROVED_KNOWLEDGE_CARDS, queryWorldGuide, type GuideQueryResult, type GuideKnowledgeCard } from '../data/guideKnowledge';
import { UtilityDialog } from './account/UtilityDialog';

export interface WorldGuidePanelProps { isOpen: boolean; onClose: () => void }
export function WorldGuidePanel({ isOpen, onClose }: WorldGuidePanelProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<GuideQueryResult | null>(null);
  if (!isOpen) return null;
  function select(card: GuideKnowledgeCard) { setInput(card.title); setResult({ type: 'answered', query: card.title, cards: [card] }); }
  function submit(e: FormEvent) { e.preventDefault(); setResult(queryWorldGuide(input)); }
  return <UtilityDialog title="Hướng dẫn VieWorld" subtitle="Tìm đường trong world, phòng riêng và những món bạn giữ lại." onClose={onClose}
    testId="world-guide-modal" footer={<><span>Cẩm nang có sẵn · không phải chat AI</span><button className="vw-utility-secondary" onClick={onClose}>Đóng</button></>}>
    <p className="vw-guide-disclaimer" data-testid="guide-disclaimer-banner">Hướng dẫn demo · Không phải nghệ sĩ</p>
    <form className="vw-guide-search" onSubmit={submit}><label><Search size={18}/><input value={input} onChange={e => setInput(e.target.value)}
      aria-label="Nhập câu hỏi hoặc từ khóa tra cứu" placeholder="Tìm: Hall, đơn hàng, avatar…" data-testid="guide-search-input" maxLength={200}/></label>
      <button className="vw-utility-primary" data-testid="guide-search-submit-btn">Tra cứu</button>
      {input && <button type="button" className="vw-utility-secondary" data-testid="guide-clear-search-btn" onClick={() => { setInput(''); setResult(null); }}>Xóa</button>}
    </form>
    <section className="vw-guide-topics"><h3>Bạn cần tìm gì?</h3><div>{APPROVED_KNOWLEDGE_CARDS.map(card => <button key={card.id}
      data-testid={`guide-topic-chip-${card.topic}`} onClick={() => select(card)} aria-pressed={result?.type === 'answered' && result.cards.length === 1 && result.cards[0].id === card.id}>{card.topicLabel}</button>)}</div></section>
    <div className="vw-guide-results" aria-live="polite">
      {result?.type === 'answered' && result.cards.map(card => <article className="vw-guide-answer" key={card.id} data-testid="guide-answer-card">
        <small>{card.topicLabel}</small><h3>{card.title}</h3><p>{card.description}</p>
        <Link className="vw-utility-text" to={card.actionLink.to} onClick={onClose} data-testid="guide-action-link">{card.actionLink.label}<ArrowRight size={16}/></Link>
        <details><summary>Về hướng dẫn này</summary><p>Nguồn nội bộ: {card.sourceTitle} · {card.updatedAt}</p></details>
      </article>)}
      {result?.type === 'injection_blocked' && <div className="vw-utility-note" data-testid="guide-injection-blocked-notice"><strong>Phát hiện câu lệnh can thiệp hệ thống bị chặn</strong><p>Cẩm nang chỉ tra cứu nội dung có sẵn, không thực hiện lệnh hay thay đổi dữ liệu.</p></div>}
      {result?.type === 'unsupported_topic' && <div className="vw-utility-note" data-testid="guide-limitation-notice"><strong>Phạm vi trả lời bị giới hạn</strong><p>{result.limitationReason}</p><p>Hướng dẫn chỉ nói về cách dùng VieWorld, không phát ngôn thay nghệ sĩ.</p></div>}
      {result?.type === 'unknown' && <div className="vw-utility-note" data-testid="guide-unknown-query-notice"><strong>Không tìm thấy nội dung hướng dẫn phù hợp</strong><p>Thử từ khóa ngắn hơn hoặc chọn một chủ đề ở trên.</p></div>}
    </div>
    <p className="vw-utility-muted">Hướng dẫn có sẵn trong bản demo, không đại diện cho nghệ sĩ và không thay đổi tài khoản hay đơn hàng của bạn.</p>
  </UtilityDialog>;
}
