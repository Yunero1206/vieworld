import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AvatarStage } from './AvatarStage';
import { PresencePanel } from './PresencePanel';
import { FanChatPanel } from './FanChatPanel';
import { FandomCheerEngine } from './FandomCheerEngine';
import { getArtistChatMeta } from '../data/artistChatConfig';
import { hasActiveMembership } from '../world/merchCatalog';
import { getPrimaryLiveSession } from '../world/moments';
import { momentTime } from '../world/fanWorld';
import { Bell, BellOff, Calendar } from 'lucide-react';

export function ArtistBroadcast({
  worldId,
  format: _format = 'dropin',
  sessionId,
}: {
  worldId: string;
  format?: 'dropin' | 'concert';
  sessionId?: string;
}) {
  const { state, dispatch } = useApp();
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const world = state.worlds[worldId];

  // Resolve session using primary stage logic or explicit sessionId
  const sessions = Object.values(state.sessions);
  const session = sessionId
    ? sessions.find(s => s.id === sessionId)
    : getPrimaryLiveSession(sessions, worldId);

  if (!session) {
    return (
      <div className="moments-live-empty">
        <p className="fw-muted">
          Nhà nhạc chưa có phiên phát sóng trực tiếp phù hợp. Bạn có thể ghé Hall hội viên hoặc xem các bài viết mới.
        </p>
      </div>
    );
  }

  const raw = session.avatarAssetId ? state.avatarAssets[session.avatarAssetId] : undefined;
  const approved =
    raw?.status === 'approved' &&
    raw.ownerWorldId === session.worldId &&
    raw.allowedContexts.includes(session.format);

  const isLive = session.status === 'running';
  const isWaiting = session.status === 'open';
  const isScheduled = session.status === 'scheduled';
  const isEnded = session.status === 'ended';

  const presence =
    isLive && session.segmentMode === 'live' && session.hostRole === 'artist'
      ? session.artistPresence
      : 'absent';

  const sessionPoll = Object.values(state.polls).find(p => p.sessionId === session.id);
  const chatMeta = getArtistChatMeta(worldId, session, world?.name);
  const isMember = hasActiveMembership(state, worldId);
  const isRsvpd = state.rsvpdSessionIds.includes(session.id);

  return (
    <section className="vw-broadcast" aria-label="Khung phát avatar artist 2D">
      {/* First-Class Artist Presence Banner */}
      <div className="moments-presence-banner">
        <div className="moments-presence-left">
          {isLive && presence === 'present' ? (
            <span className="moments-presence-badge moments-presence-live">
              <span className="moments-presence-dot" />
              <strong>{world?.name || 'Nghệ sĩ'} đang hiện diện trực tiếp</strong>
            </span>
          ) : isEnded || session.segmentMode === 'recorded' ? (
            <span className="moments-presence-badge moments-presence-replay">
              <span className="moments-presence-dot" />
              <strong>Đang phát lại — {world?.name || 'Nghệ sĩ'} không hiện diện</strong>
            </span>
          ) : isScheduled || isWaiting ? (
            <span className="moments-presence-badge moments-presence-replay">
              <span className="moments-presence-dot" />
              <strong>{isWaiting ? `${world?.name || 'Nghệ sĩ'} đang chuẩn bị vào sân khấu` : `${world?.name || 'Nghệ sĩ'} chưa vào sân khấu`}</strong>
            </span>
          ) : (
            <span className="moments-presence-badge moments-presence-replay">
              <span className="moments-presence-dot" />
              <strong>Auto playlist — {world?.name || 'Nghệ sĩ'} không hiện diện</strong>
            </span>
          )}
        </div>
        <div className="moments-presence-right">
          <time className="moments-live-time-pill">
            {momentTime(session.scheduledStartTime)}
          </time>
        </div>
      </div>

      <PresencePanel session={{ ...session, artistPresence: presence }} />

      {/* Primary Stage Renderer */}
      {isScheduled ? (
        <div className="moments-scheduled-stage">
          <span className="moments-scheduled-eyebrow">Sắp diễn ra · Đặt lịch nhắc</span>
          <h3 className="moments-scheduled-title">{session.title}</h3>
          <p className="moments-scheduled-time">
            <Calendar size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />
            {momentTime(session.scheduledStartTime)}
          </p>
          <div className="moments-scheduled-actions">
            <button
              type="button"
              className={`moments-rsvp-btn ${isRsvpd ? 'rsvpd' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_RSVP', sessionId: session.id })}
            >
              {isRsvpd ? (
                <>
                  <BellOff size={16} />
                  <span>Hủy nhắc lịch</span>
                </>
              ) : (
                <>
                  <Bell size={16} />
                  <span>Nhắc mình khi mở màn</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="stage-theater-chip"
              onClick={() => setIsInfoDrawerOpen(true)}
            >
              Chi tiết buổi hẹn →
            </button>
          </div>
        </div>
      ) : (
        <AvatarStage
          compact
          avatar={approved ? raw : undefined}
          artistPresence={presence}
          isPaused={!isLive}
          stageVariant={session.format === 'concert' ? 'concert' : 'standard'}
        />
      )}

      <p className="fw-muted" style={{ margin: '8px 0' }}>
        Không gian trực tiếp mô phỏng · Chuyển động sân khấu tương tác.{' '}
        {session.segmentMode === 'recorded' ? 'Đây là phân đoạn phát lại.' : ''}
      </p>

      <div
        className="broadcast-stage-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '10px 0 14px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Accessible hidden link for compatibility & tests */}
        <Link
          className="stage-theater-chip sr-only"
          to={`/sessions/${session.id}`}
          title="Mở phòng chiếu toàn màn hình chuyên biệt"
        >
          Vào phiên · chat, câu hỏi & âm thanh →
        </Link>
        <FandomCheerEngine worldId={worldId} />
      </div>

      {isScheduled && (
        <div
          className="moments-scheduled-chat-notice"
          style={{
            padding: '10px 14px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            margin: '8px 0 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12px',
            color: '#334155',
          }}
        >
          <div>
            <strong style={{ color: '#0F172A', display: 'block', marginBottom: '2px' }}>
              Phòng chờ sự kiện sẽ mở trước giờ diễn 15 phút
            </strong>
            <span>{world?.name || 'Nghệ sĩ'} chưa vào sân khấu. Kênh đang mở thảo luận trước sự kiện cùng fandom.</span>
          </div>
          <button
            type="button"
            className="fw-text-button"
            style={{ flexShrink: 0, fontWeight: '700', color: 'var(--primary, #5B46E8)' }}
            onClick={() => setIsInfoDrawerOpen(true)}
          >
            Chi tiết buổi hẹn →
          </button>
        </div>
      )}

      {/* Unified Live Chat Feature for All Artists in Moments */}
      <div
        className="moments-chat-dock-container"
        style={{
          height: '480px',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '12px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <FanChatPanel
          sessionId={session.id}
          worldId={worldId}
          artistName={world?.name || chatMeta.artistName}
          currentFanId={state.fanProfile.id}
          currentFanName={state.fanProfile.displayName}
          isChatPaused={session.isChatPaused}
          isMember={isMember}
          onUpgradeMembership={() => dispatch({ type: 'UPGRADE_MEMBERSHIP', worldId })}
          poll={sessionPoll || chatMeta.poll}
          onVote={(pollId, optionId) => dispatch({ type: 'VOTE_POLL', pollId, optionId })}
          cues={
            session.callSampleCues && session.callSampleCues.length > 0
              ? session.callSampleCues
              : chatMeta.cues
          }
          mode={isScheduled ? 'scheduled' : isWaiting ? 'waiting' : isEnded ? 'replay' : 'live'}
        />
      </div>

      {/* In-Place Session Info Drawer Modal */}
      {isInfoDrawerOpen && (
        <div
          className="moments-drawer-backdrop"
          onClick={() => setIsInfoDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="moments-drawer-content"
            role="dialog"
            aria-modal="true"
            aria-label={`Chi tiết buổi hẹn: ${session.title}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary, #5B46E8)', letterSpacing: '0.5px' }}>
                  {session.format === 'concert' ? '♫ Concert trực tiếp' : '◉ Gặp gỡ & Trò chuyện'}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                  {session.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#94A3B8' }}
                aria-label="Đóng chi tiết buổi hẹn"
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Thời gian dự kiến:</span>
                <strong>{momentTime(session.scheduledStartTime)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Chủ trì:</span>
                <span>{world?.name} ({session.hostRole === 'artist' ? 'Nghệ sĩ' : 'Đội ngũ phụ trách'})</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Trạng thái hiện diện:</span>
                <span style={{ fontWeight: '600', color: presence === 'present' ? '#10B981' : '#D97706' }}>
                  {presence === 'present' ? 'Nghệ sĩ đang hiện diện trực tiếp' : `${world?.name || 'Nghệ sĩ'} chưa vào sân khấu`}
                </span>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '4px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Tiêu chuẩn minh bạch & Bản quyền
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#475569' }}>
                  <div>✓ Bản quyền âm nhạc & phát sóng: Đã xác thực</div>
                  <div>✓ Đồng thuận trực tiếp nghệ sĩ: Đã ký duyệt</div>
                  <div>✓ Kiểm duyệt an toàn cộng đồng: Đạt chuẩn</div>
                  <div>✓ AI không được dùng để giả lập sự hiện diện của nghệ sĩ</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className={`moments-rsvp-btn ${isRsvpd ? 'rsvpd' : ''}`}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: '12px' }}
                  onClick={() => dispatch({ type: 'TOGGLE_RSVP', sessionId: session.id })}
                >
                  {isRsvpd ? (
                    <>
                      <BellOff size={16} />
                      <span>Hủy nhắc lịch</span>
                    </>
                  ) : (
                    <>
                      <Bell size={16} />
                      <span>Nhắc mình khi mở màn</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsInfoDrawerOpen(false)}
                  style={{ borderRadius: '12px', padding: '10px 18px' }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
