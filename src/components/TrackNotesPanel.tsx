import React, { useState } from 'react';
import { TrackNote } from '../domain/types';
import { Disc, Info, ShieldCheck, Music, Clock } from 'lucide-react';

export interface TrackNotesPanelProps {
  trackNotes?: TrackNote[];
  title?: string;
}

export const TrackNotesPanel: React.FC<TrackNotesPanelProps> = ({
  trackNotes = [],
  title = 'Ghi chú đĩa hát (Track Notes)',
}) => {
  const [selectedTrackNumber, setSelectedTrackNumber] = useState<number>(
    trackNotes.find((t) => t.isCurrent)?.trackNumber || (trackNotes[0]?.trackNumber ?? 1)
  );

  const selectedTrack = trackNotes.find((t) => t.trackNumber === selectedTrackNumber) || trackNotes[0];

  if (!trackNotes || trackNotes.length === 0) {
    return (
      <div
        className="card"
        style={{ padding: '20px', textAlign: 'center' }}
        data-testid="track-notes-empty"
      >
        <Disc size={28} color="var(--muted)" style={{ margin: '0 auto 8px auto' }} />
        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', margin: 0 }}>
          Chưa có danh sách ghi chú bản thu cho phiên nghe này.
        </p>
      </div>
    );
  }

  return (
    <section
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'var(--surface)',
        border: '1px solid rgba(101, 81, 200, 0.2)',
        borderRadius: 'var(--radius-lg)',
      }}
      aria-label="Danh sách bài hát và ghi chú đĩa hát"
      data-testid="track-notes-panel"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Disc size={18} color="var(--primary)" />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: 0 }}>
            {title}
          </h3>
        </div>
        <span className="demo-badge">PHÒNG NGHE</span>
      </div>

      {/* Track List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
        role="list"
        aria-label="Danh sách bài hát trong tuyển tập"
      >
        {trackNotes.map((track) => {
          const isSelected = track.trackNumber === selectedTrackNumber;
          return (
            <div
              key={track.trackNumber}
              onClick={() => setSelectedTrackNumber(track.trackNumber)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? '#FAF5FF' : 'var(--bg)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              data-testid={`track-item-${track.trackNumber}`}
              role="listitem"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: '800',
                    color: isSelected ? 'var(--primary)' : 'var(--muted)',
                    minWidth: '20px',
                  }}
                >
                  #{track.trackNumber}
                </span>
                <div>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-xs)',
                      color: isSelected ? 'var(--primary)' : 'var(--ink)',
                    }}
                  >
                    {track.title}
                  </strong>
                  {track.isCurrent && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#059669',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      data-testid="current-track-badge"
                    >
                      <Music size={10} />
                      Đang phát trong phòng nghe
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '11px' }}>
                <Clock size={12} />
                <span>{track.duration}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Track Liner Notes Detail */}
      {selectedTrack && (
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
          data-testid="selected-track-notes"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} color="var(--primary)" />
            <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>
              Lời bộc bạch bản thu #{selectedTrack.trackNumber}: {selectedTrack.title}
            </strong>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-xs)',
              color: 'var(--ink)',
              lineHeight: '1.6',
            }}
          >
            {selectedTrack.notes}
          </p>
        </div>
      )}

      {/* Truthful Cleared Local Media Disclosure (§2.3, §4) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--muted)',
          paddingTop: '8px',
          borderTop: '1px solid var(--border)',
        }}
        data-testid="cleared-local-media-notice"
      >
        <ShieldCheck size={14} color="#059669" style={{ flexShrink: 0 }} />
        <span>
          Âm thanh thử nghiệm nội bộ đã kiểm duyệt bản quyền. Không sử dụng API trích xuất ngoài luồng (no media ripping) hay yêu cầu tài khoản bên thứ ba.
        </span>
      </div>
    </section>
  );
};
