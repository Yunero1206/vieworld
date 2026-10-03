import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import type { Question, Session } from '../domain/types';

const statusLabel: Record<Question['status'], string> = { submitted: 'Đã gửi', under_review: 'Đang xem xét', selected: 'Đang được chọn', answered: 'Đã trả lời', closed: 'Đã khép lại' };

/** Fan-facing presentation of the existing Question domain, never operator simulation. */
export function HallQARoom({ session, questions, currentFanId, canSubmit, onSubmit }: {
  session: Session; questions: Question[]; currentFanId: string; canSubmit: boolean;
  onSubmit: (content: string, requestId: string) => void;
}) {
  const [content, setContent] = useState('');
  const own = questions.filter(q => q.fanId === currentFanId && !['selected', 'answered'].includes(q.status));
  const selected = questions.filter(q => q.status === 'selected');
  const answered = questions.filter(q => q.status === 'answered');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || !content.trim() || content.trim().length > 200) return;
    onSubmit(content.trim(), crypto.randomUUID()); setContent('');
  }
  const entry = (question: Question) => <article className="hall-qa-question" key={question.id}>
    <header><strong>{question.authorName}</strong><small>{statusLabel[question.status]}</small></header><p>{question.content}</p>
    {question.status === 'answered' && <blockquote><strong>{session.demo ? 'Câu trả lời minh họa' : 'Câu trả lời'}</strong><p>{question.answerText || 'Câu hỏi đã được đánh dấu trả lời; chưa có nội dung trả lời được lưu.'}</p></blockquote>}
  </article>;
  return <div className="hall-qa-room">
    <p className="presence-note">Phiên Q&A mẫu của nghệ sĩ hư cấu. Không có trả lời tự động hoặc cam kết được chọn.</p>
    {canSubmit ? <form className="hall-qa-compose" onSubmit={submit}><label htmlFor="hall-qa-question">Đặt câu hỏi</label><textarea id="hall-qa-question" maxLength={200} value={content} onChange={e=>setContent(e.target.value)} placeholder="Điều bạn muốn hỏi Artist…"/><footer><small>{content.length}/200</small><button className="fw-button" disabled={!content.trim()}><Send size={15}/> Gửi câu hỏi</button></footer></form>
      : <p className="presence-hall-readonly" role="status">{session.status === 'ended' ? 'Bạn vẫn có thể đọc lại các câu hỏi và câu trả lời.' : 'Phiên chưa nhận câu hỏi hoặc đang tạm dừng.'}</p>}
    {!!own.length && <section aria-label="Câu hỏi của bạn"><h4>Câu hỏi của bạn</h4>{own.map(entry)}</section>}
    <section aria-label="Câu hỏi đang được chọn"><h4>Đang được chọn</h4>{selected.length ? selected.map(entry) : <p className="presence-note">Chưa có câu hỏi được chọn.</p>}</section>
    <section aria-label="Câu hỏi đã trả lời"><h4>Đã trả lời</h4>{answered.length ? answered.map(entry) : <p className="presence-note">Chưa có câu trả lời được lưu.</p>}</section>
  </div>;
}
