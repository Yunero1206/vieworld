import React, { useState, useEffect } from 'react';
import { MessageSquare, Pin, Trash2, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface StickyNote {
  id: string;
  authorId: string;
  authorName: string;
  avatarPreset?: string;
  text: string;
  sticker?: string;
  color: 'yellow' | 'pink' | 'mint' | 'purple';
  createdAt: string;
  isPinned?: boolean;
}

import { EXPANDED_GUESTBOOK_NOTES } from '../data/expandedUniverse';

const DEFAULT_NOTES: Record<string, StickyNote[]> = EXPANDED_GUESTBOOK_NOTES;

const STICKER_PRESETS = [
  '✨ Phòng xinh xỉu',
  '🎵 Yêu acoustic',
  '🌙 Đồng hương Moonie',
  '🔥 Cháy concert',
  '☕ Chúc ngày an lành',
];

const COLOR_PRESETS: StickyNote['color'][] = ['yellow', 'pink', 'mint', 'purple'];

export function RoomGuestbook({ fanId, isOwner }: { fanId: string; isOwner: boolean }) {
  const { state } = useApp();
  const storageKey = `vieworld_guestbook_${fanId}`;

  const [notes, setNotes] = useState<StickyNote[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_NOTES[fanId] || [];
  });

  const [isComposing, setIsComposing] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedSticker, setSelectedSticker] = useState(STICKER_PRESETS[0]);
  const [selectedColor, setSelectedColor] = useState<StickyNote['color']>('yellow');

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes, storageKey]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote: StickyNote = {
      id: `note-${Date.now()}`,
      authorId: state.fanProfile.id,
      authorName: state.fanProfile.displayName,
      avatarPreset: state.fanProfile.avatarPreset,
      text: noteText.trim().slice(0, 120),
      sticker: selectedSticker,
      color: selectedColor,
      createdAt: 'Vừa xong',
    };

    setNotes(prev => [newNote, ...prev]);
    setNoteText('');
    setIsComposing(false);
  };

  const handleTogglePin = (noteId: string) => {
    setNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const sortedNotes = [...notes].sort((a, b) => Number(b.isPinned || false) - Number(a.isPinned || false));

  return (
    <section className="v7-guestbook-section" aria-label="Sổ lưu bút phòng">
      <div className="v7-guestbook-header">
        <div>
          <div className="v7-guestbook-badge">
            <MessageSquare size={14} />
            <span>FANDOM GUESTBOOK</span>
          </div>
          <h2 className="v7-guestbook-title">
            {isOwner ? 'Sổ lưu bút của bạn' : 'Để lại lời nhắn cho chủ phòng'}
          </h2>
          <p className="v7-guestbook-subtitle">
            {isOwner
              ? 'Những mẩu giấy nhớ ấm áp từ bạn bè có cùng niềm đam mê ghé thăm phòng.'
              : 'Gửi vài dòng chúc mừng hoặc chia sẻ bài hát bạn yêu thích cùng chủ phòng nhé!'}
          </p>
        </div>

        {!isOwner ? (
          <button
            className="v7-add-note-btn"
            onClick={() => setIsComposing(!isComposing)}
            aria-expanded={isComposing}
          >
            <span>{isComposing ? 'Đóng lại' : 'Dán giấy nhớ'}</span>
          </button>
        ) : (
          <button
            className="v7-add-note-btn v7-add-note-btn-demo"
            onClick={() => setIsComposing(!isComposing)}
            aria-expanded={isComposing}
            style={{ opacity: 0.75, fontSize: '12px' }}
            title="Dán thử nghiệm mẩu giấy nhớ vào sổ lưu bút"
          >
            <span>{isComposing ? 'Đóng lại' : 'Dán thử lời nhắn'}</span>
          </button>
        )}
      </div>

      {isComposing && (
        <form className="v7-note-composer" onSubmit={handleAddNote}>
          <div className="v7-composer-top">
            <span className="v7-composer-label">Lời nhắn từ: <strong>{state.fanProfile.displayName}</strong></span>
            <div className="v7-color-picker">
              {COLOR_PRESETS.map(c => (
                <button
                  type="button"
                  key={c}
                  className={`v7-color-dot color-${c} ${selectedColor === c ? 'active' : ''}`}
                  onClick={() => setSelectedColor(c)}
                  aria-label={`Màu ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="v7-sticker-pills">
            {STICKER_PRESETS.map(s => (
              <button
                type="button"
                key={s}
                className={`v7-sticker-pill ${selectedSticker === s ? 'active' : ''}`}
                onClick={() => setSelectedSticker(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <textarea
            className="v7-note-textarea"
            rows={3}
            maxLength={120}
            placeholder="Viết vài dòng gửi chủ phòng (tối đa 120 ký tự)..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            required
          />

          <div className="v7-composer-actions">
            <small className="v7-char-count">{noteText.length}/120 ký tự</small>
            <button type="submit" className="v7-submit-note-btn">
              <Send size={14} />
              <span>Dán lên tường</span>
            </button>
          </div>
        </form>
      )}

      <div className="v7-guestbook-grid">
        {sortedNotes.map(n => (
          <article key={n.id} className={`v7-sticky-note note-color-${n.color} ${n.isPinned ? 'is-pinned' : ''}`}>
            {n.isPinned && (
              <div className="v7-pin-indicator" title="Lời nhắn được ghim">
                <Pin size={13} />
              </div>
            )}

            <div className="v7-note-top">
              <span className="v7-note-author">{n.authorName}</span>
              <span className="v7-note-time">{n.createdAt}</span>
            </div>

            {n.sticker && <div className="v7-note-sticker">{n.sticker}</div>}

            <p className="v7-note-body">{n.text}</p>

            <div className="v7-note-footer">
              {isOwner ? (
                <div className="v7-note-owner-actions">
                  <button
                    className="v7-note-icon-btn"
                    onClick={() => handleTogglePin(n.id)}
                    title={n.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                    aria-label={n.isPinned ? 'Bỏ ghim lời nhắn' : 'Ghim lời nhắn'}
                  >
                    <Pin size={12} />
                  </button>
                  <button
                    className="v7-note-icon-btn danger"
                    onClick={() => handleDeleteNote(n.id)}
                    title="Xóa lời nhắn"
                    aria-label="Xóa lời nhắn"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <span className="v7-note-fandom-tag">♥ Cùng chung đam mê</span>
              )}
            </div>
          </article>
        ))}

        {!sortedNotes.length && (
          <div className="v7-guestbook-empty">
            <p>Chưa có mẩu giấy nhớ nào. Hãy là người đầu tiên dán lời chúc lên tường nhé!</p>
          </div>
        )}
      </div>
    </section>
  );
}
