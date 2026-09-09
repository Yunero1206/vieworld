import React from 'react';
import { SetlistItem } from '../domain/types';
import { ListMusic, Radio, CheckCircle, Clock } from 'lucide-react';

export interface SetlistPanelProps {
  setlist?: SetlistItem[];
  title?: string;
}

export const SetlistPanel: React.FC<SetlistPanelProps> = ({
  setlist = [],
  title = 'Danh sách tiết mục biểu diễn (Setlist)',
}) => {
  if (!setlist || setlist.length === 0) {
    return null;
  }

  const performingItem = setlist.find((s) => s.status === 'performing');

  return (
    <section
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'var(--surface)',
        border: '1px solid rgba(101, 81, 200, 0.25)',
        borderRadius: 'var(--radius-lg)',
      }}
      aria-label="Danh sách tiết mục biểu diễn trực tiếp"
      data-testid="setlist-panel"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListMusic size={18} color="var(--primary)" />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: 0 }}>
            {title}
          </h3>
        </div>
        <span className="demo-badge">LIVE HOUSE</span>
      </div>

      {/* Marquee / Current performing banner */}
      {performingItem && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          data-testid="current-performing-banner"
        >
          <Radio size={16} color="#DC2626" className="pulse-icon" />
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#B91C1C',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
              }}
            >
              ★ ĐANG BIỂU DIỄN TRỰC TIẾP
            </span>
            <strong style={{ fontSize: 'var(--text-sm)', color: '#991B1B' }}>
              #{performingItem.order}. {performingItem.title}
            </strong>
          </div>
        </div>
      )}

      {/* Setlist items */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
        role="list"
        aria-label="Các bài hát trong setlist"
      >
        {setlist.map((item) => {
          const isPerforming = item.status === 'performing';
          const isCompleted = item.status === 'completed';

          return (
            <div
              key={item.order}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isPerforming ? '#FEF2F2' : isCompleted ? '#F9FAFB' : 'var(--bg)',
                border: isPerforming ? '1px solid #FCA5A5' : '1px solid transparent',
              }}
              data-testid={`setlist-item-${item.order}`}
              role="listitem"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: '800',
                    color: isPerforming ? '#DC2626' : 'var(--muted)',
                    minWidth: '20px',
                  }}
                >
                  #{item.order}
                </span>
                <strong
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: isPerforming ? '#991B1B' : isCompleted ? 'var(--muted)' : 'var(--ink)',
                  }}
                >
                  {item.title}
                </strong>
              </div>

              <div>
                {isPerforming ? (
                  <span
                    className="tag"
                    style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', fontWeight: '700', fontSize: '11px' }}
                    data-testid="performing-song-badge"
                  >
                    <Radio size={10} style={{ marginRight: '4px' }} />
                    Đang diễn
                  </span>
                ) : isCompleted ? (
                  <span
                    className="tag"
                    style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '11px' }}
                  >
                    <CheckCircle size={10} style={{ marginRight: '4px' }} />
                    Đã hoàn thành
                  </span>
                ) : (
                  <span
                    className="tag"
                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '11px' }}
                  >
                    <Clock size={10} style={{ marginRight: '4px' }} />
                    Sắp diễn
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
