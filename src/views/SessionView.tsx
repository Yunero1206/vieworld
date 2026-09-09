import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PresencePanel } from '../components/PresencePanel';
import { AvatarStage } from '../components/AvatarStage';
import { SilentMediaPlaceholder } from '../components/SilentMediaPlaceholder';
import { SessionControls } from '../components/SessionControls';
import { QuestionQueue } from '../components/QuestionQueue';
import { LivePollPanel } from '../components/LivePollPanel';
import { FanChatPanel } from '../components/FanChatPanel';
import { StatusNotice } from '../components/StatusNotice';
import { TrackNotesPanel } from '../components/TrackNotesPanel';
import { SetlistPanel } from '../components/SetlistPanel';
import { CallSampleCueBar } from '../components/CallSampleCueBar';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Info,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Globe,
  Radio,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Star,
  Lock,
} from 'lucide-react';

export const SessionView: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { state, dispatch } = useApp();

  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // Acceptance T13 Invariant: No autoplay audio. Audio playback is strictly user-initiated.
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [interactionTab, setInteractionTab] = useState<'chat' | 'questions' | 'poll'>('chat');

  // Safe Recovery Screen when session is invalid
  const session = sessionId ? state.sessions[sessionId] : undefined;

  // Query questions and active poll for this session
  const sessionQuestions = session
    ? Object.values(state.questions).filter((q) => q.sessionId === session.id)
    : [];
  const sessionPoll = session
    ? Object.values(state.polls).find((p) => p.sessionId === session.id)
    : undefined;

  if (!session) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div
          className="card"
          style={{
            maxWidth: '540px',
            margin: '0 auto',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
          data-testid="session-not-found-card"
        >
          <AlertTriangle size={48} color="#D97706" />
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '800' }}>
            Không tìm thấy phiên sự kiện
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', lineHeight: '1.6' }}>
            Mã định danh sự kiện <code>{sessionId || 'không xác định'}</code> không tồn tại trong hệ thống mô phỏng VieWorld hoặc đã bị xóa.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/worlds" className="btn btn-primary">
              <Globe size={16} />
              <span>Khám phá các thế giới</span>
            </Link>
            <Link to="/" className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Về trang chủ</span>
            </Link>
          </div>
          <span className="demo-badge" style={{ marginTop: '8px' }}>DEMO</span>
        </div>
      </div>
    );
  }

  const world = state.worlds[session.worldId];
  const rawAvatarAsset = session.avatarAssetId ? state.avatarAssets[session.avatarAssetId] : undefined;
  // Constitutional Invariant (§2.3, P11): Draft or retired avatar strictly does not leak into fan session
  const avatarAsset = rawAvatarAsset && rawAvatarAsset.status === 'approved' ? rawAvatarAsset : undefined;

  const isRsvpd = state.rsvpdSessionIds.includes(session.id);
  const isInLobby = state.inLobbySessionIds.includes(session.id);
  const participationKey = `part_${state.fanProfile.id}_${session.id}_live`;
  const hasJoinedLive = Boolean(state.participations[participationKey]);
  const replayParticipationKey = `part_${state.fanProfile.id}_${session.id}_replay`;
  const hasWatchedReplay = Boolean(state.participations[replayParticipationKey]);
  const activeSelectedQuestion = sessionQuestions.find((q) => q.status === 'selected');

  // Format time in Asia/Ho_Chi_Minh timezone (§2.1)
  const formatVietnamTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'running':
        return (
          <span
            className="tag"
            style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: '700' }}
            id="session-status-badge"
          >
            <Radio size={12} className="pulse-icon" style={{ marginRight: '4px' }} />
            Đang diễn ra trực tiếp
          </span>
        );
      case 'open':
        return (
          <span
            className="tag"
            style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: '700' }}
            id="session-status-badge"
          >
            <Clock size={12} style={{ marginRight: '4px' }} />
            Phòng chờ đang mở
          </span>
        );
      case 'scheduled':
        return (
          <span
            className="tag"
            style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}
            id="session-status-badge"
          >
            <Calendar size={12} style={{ marginRight: '4px' }} />
            Sắp diễn ra
          </span>
        );
      case 'ended':
        return (
          <span
            className="tag"
            style={{ backgroundColor: '#F3F4F6', color: '#4B5563', fontWeight: '700' }}
            id="session-status-badge"
          >
            Đã kết thúc
          </span>
        );
      case 'cancelled':
        return (
          <span
            className="tag"
            style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', fontWeight: '700' }}
            id="session-status-badge"
          >
            Đã hủy bỏ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container" style={{ padding: '24px 20px 60px 20px' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Đường dẫn điều hướng" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)' }}>
          <Link to="/worlds" style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={14} />
            <span>Thế giới</span>
          </Link>
          <span style={{ color: 'var(--muted)' }}>/</span>
          {world && (
            <>
              <Link to={`/worlds/${world.id}`} style={{ color: 'var(--muted)' }}>
                {world.name}
              </Link>
              <span style={{ color: 'var(--muted)' }}>/</span>
            </>
          )}
          <span style={{ fontWeight: '700', color: 'var(--text)' }}>{session.title}</span>
        </div>
      </nav>

      {/* Global Error Banner */}
      {state.lastError && (
        <div style={{ marginBottom: '16px' }}>
          <StatusNotice
            message={`${state.lastError.message}${
              state.lastError.actionableResolution ? ` — ${state.lastError.actionableResolution}` : ''
            }`}
            type="error"
            onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
          />
        </div>
      )}

      {/* Cancelled Notice */}
      {session.status === 'cancelled' && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            color: '#991B1B',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          data-testid="cancelled-session-alert"
        >
          <AlertTriangle size={24} />
          <div>
            <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>
              Phiên sự kiện này đã bị hủy bởi ban tổ chức
            </strong>
            <span style={{ fontSize: 'var(--text-xs)' }}>
              Không có giao dịch thanh toán nào phát sinh. Sân khấu và các tính năng tương tác trực tiếp bị khóa.
            </span>
          </div>
        </div>
      )}

      {/* Expired Rights Session Alert */}
      {(session.replayStatus === 'expired' || session.mediaStatus === 'expired') && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            color: '#991B1B',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          data-testid="expired-rights-session-banner"
        >
          <Lock size={24} color="#DC2626" />
          <div>
            <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>
              Bản quyền nội dung đã hết hạn (Expired Rights)
            </strong>
            <span style={{ fontSize: 'var(--text-xs)' }}>
              Theo thỏa thuận bản quyền nội dung với đơn vị nắm giữ bản quyền, phiên sự kiện này không còn khả dụng để phát lại. Kỷ niệm số và ghi chú cá nhân trong My World của bạn vẫn được bảo lưu nguyên vẹn.
            </span>
          </div>
        </div>
      )}

      {/* Session Title Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {getStatusBadge()}
            <span className="tag" data-testid="session-format-tag">{session.format}</span>
            <span
              className="tag"
              style={{
                backgroundColor: session.segmentMode === 'recorded' ? '#F3F4F6' : '#DCFCE7',
                color: session.segmentMode === 'recorded' ? '#374151' : '#15803D',
                fontWeight: '700',
              }}
              data-testid="segment-mode-tag"
            >
              {session.segmentMode === 'recorded' ? 'Đã ghi hình trước (Recorded)' : 'Trực tiếp (Live)'}
            </span>
            <span
              className="tag"
              style={{
                backgroundColor: session.hostRole === 'team' ? '#EDE9FE' : '#FEF3C7',
                color: session.hostRole === 'team' ? 'var(--primary)' : '#B45309',
                fontWeight: '700',
              }}
              data-testid="host-role-tag"
            >
              {session.hostRole === 'team' ? 'Đội ngũ phụ trách (Team)' : 'Nghệ sĩ (Artist)'}
            </span>
            <span className="demo-badge">DEMO</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', margin: '0 0 6px 0' }}>
            {session.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} />
              <span>{formatVietnamTime(session.scheduledStartTime)} (GMT+7)</span>
            </span>
            <span>·</span>
            <span>Định dạng: {session.format}</span>
          </div>
        </div>
      </header>

      {/* Active Selected Question Broadcast Banner (P12 Operator Propagation) */}
      {activeSelectedQuestion && session.status === 'running' && (
        <div
          data-testid="active-selected-question-banner"
          className="card"
          style={{
            padding: '14px 18px',
            marginBottom: '20px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              padding: '8px',
              backgroundColor: '#DCFCE7',
              borderRadius: 'var(--radius-sm)',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Star size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#15803D',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
              }}
            >
              ★ CÂU HỎI ĐANG ĐƯỢC NGHỆ SĨ TRẢ LỜI TRỰC TIẾP
            </span>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: '700', color: '#14532D', marginTop: '2px' }}>
              "{activeSelectedQuestion.content}"
            </div>
            <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
              Người hỏi: {activeSelectedQuestion.authorName || 'Khán giả'}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Grid: Stage + Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left / Top Area: Sân khấu & Media Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Truthful Presence Panel (§2.3, §5.2) */}
          <PresencePanel session={session} />

          {/* 2D Avatar Stage (§2.3, §5.1, P13 Concert Larger Stage) */}
          <AvatarStage
            avatar={avatarAsset}
            artistPresence={session.artistPresence}
            isPaused={isPaused}
            isMuted={isMuted}
            reducedMotion={reducedMotion}
            stageVariant={session.format === 'concert' ? 'concert' : session.format === 'listening' ? 'listening' : 'standard'}
          />

          {/* Simulated Ambient Audio Media Placeholder (§2.4, P13 User-Initiated Audio & Missing Media) */}
          <SilentMediaPlaceholder
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            isPlaying={isPlayingAudio}
            onTogglePlay={() => setIsPlayingAudio((prev) => !prev)}
            reducedMotion={reducedMotion}
            mediaStatus={session.mediaStatus || (session.replayStatus === 'expired' ? 'expired' : 'cleared_local')}
            trackTitle={
              session.format === 'listening' && session.trackNotes?.[0]
                ? `${session.trackNotes[0].title} (Phòng nghe Neon)`
                : undefined
            }
          />

          {/* Live House: Call Sample Cues (Interaction Simulation, no multi-user sync) */}
          {session.format === 'concert' && (
            <CallSampleCueBar cues={session.callSampleCues} />
          )}

          {/* Listening Room: Track Notes & Liner Notes */}
          {session.format === 'listening' && (
            <TrackNotesPanel trackNotes={session.trackNotes} />
          )}

          {/* Live House: Concert Performance Setlist */}
          {session.format === 'concert' && (
            <SetlistPanel setlist={session.setlist} />
          )}

          {/* Session Fan & Stage Controls */}
          <SessionControls
            session={session}
            isRsvpd={isRsvpd}
            isInLobby={isInLobby}
            hasJoinedLive={hasJoinedLive}
            isPaused={isPaused}
            isMuted={isMuted}
            reducedMotion={reducedMotion}
            onToggleRsvp={() => dispatch({ type: 'TOGGLE_RSVP', sessionId: session.id })}
            onEnterLobby={() => dispatch({ type: 'ENTER_LOBBY', sessionId: session.id })}
            onLeaveLobby={() => dispatch({ type: 'LEAVE_LOBBY', sessionId: session.id })}
            onJoinLive={() => dispatch({ type: 'JOIN_LIVE_SESSION', sessionId: session.id })}
            onWatchReplay={() => dispatch({ type: 'WATCH_REPLAY', sessionId: session.id })}
            onTogglePause={() => setIsPaused((prev) => !prev)}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            onToggleReducedMotion={() => setReducedMotion((prev) => !prev)}
            onSimulateDisconnect={() => dispatch({ type: 'DISCONNECT_ARTIST', sessionId: session.id })}
            onSimulateReconnect={() => dispatch({ type: 'RECONNECT_ARTIST', sessionId: session.id })}
            onSimulateEndSession={() => dispatch({ type: 'END_SESSION', sessionId: session.id })}
            onSimulatePublishReplay={() => dispatch({ type: 'PUBLISH_REPLAY', sessionId: session.id })}
          />
        </div>

        {/* Right / Sidebar: Venue Info & Participation Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Fan Participation Status Card */}
          <section className="card" style={{ padding: '20px' }} aria-label="Trạng thái tham dự cá nhân">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: '12px' }}>
              Trạng thái tham dự của bạn
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hasJoinedLive ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    backgroundColor: '#ECFDF5',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #A7F3D0',
                  }}
                  id="fan-live-status-notice"
                >
                  <CheckCircle size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: 'var(--text-xs)', color: '#065F46', display: 'block' }}>
                      Đã ghi nhận tham dự trực tiếp (Live Attendance)
                    </strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: '#047857' }}>
                      Kỷ niệm số (Moment Capsule) đã được khởi tạo trong bộ sưu tập cá nhân của bạn.
                    </span>
                  </div>
                </div>
              ) : isInLobby ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    backgroundColor: '#EFF6FF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #BFDBFE',
                  }}
                  id="fan-lobby-status-notice"
                >
                  <Info size={18} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: 'var(--text-xs)', color: '#1E40AF', display: 'block' }}>
                      Đang ở trong phòng chờ
                    </strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: '#1D4ED8' }}>
                      Bạn đang theo dõi phòng chờ. Nhấn &quot;Vào sân khấu trực tiếp&quot; khi sự kiện phát sóng để nhận huy hiệu tham dự.
                    </span>
                  </div>
                </div>
              ) : hasWatchedReplay ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #E5E7EB',
                  }}
                  id="fan-replay-status-notice"
                >
                  <CheckCircle size={18} color="#4B5563" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: 'var(--text-xs)', color: '#374151', display: 'block' }}>
                      Đã ghi nhận xem lại bản ghi (Replay View)
                    </strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: '#4B5563' }}>
                      Lượt xem lại được phân biệt rạch ròi, không tính vào số liệu tham dự trực tiếp.
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', margin: 0 }}>
                  Bạn chưa tham gia phiên này. Đăng ký nhắc sự kiện (RSVP) hoặc vào phòng chờ để sẵn sàng.
                </p>
              )}
            </div>
          </section>

          {/* Interactive Participation Area: Chat, Q&A, Polls (P05) */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '2px',
            }}
            role="tablist"
            aria-label="Các kênh tương tác phiên sự kiện"
          >
            <button
              type="button"
              role="tab"
              aria-selected={interactionTab === 'chat'}
              onClick={() => setInteractionTab('chat')}
              className={`btn ${interactionTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 'var(--text-xs)', padding: '8px 12px' }}
              id="tab-btn-chat"
            >
              <MessageSquare size={14} />
              <span>Trò chuyện</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={interactionTab === 'questions'}
              onClick={() => setInteractionTab('questions')}
              className={`btn ${interactionTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 'var(--text-xs)', padding: '8px 12px' }}
              id="tab-btn-questions"
            >
              <HelpCircle size={14} />
              <span>Câu hỏi Q&A ({sessionQuestions.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={interactionTab === 'poll'}
              onClick={() => setInteractionTab('poll')}
              className={`btn ${interactionTab === 'poll' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 'var(--text-xs)', padding: '8px 12px' }}
              id="tab-btn-poll"
            >
              <BarChart3 size={14} />
              <span>Bình chọn {sessionPoll && '●'}</span>
            </button>
          </div>

          {/* Active Interaction Tab Panel Content */}
          {interactionTab === 'chat' && (
            <FanChatPanel
              sessionId={session.id}
              currentFanId={state.fanProfile.id}
              currentFanName={state.fanProfile.displayName}
              isChatPaused={session.isChatPaused}
            />
          )}

          {interactionTab === 'questions' && (
            <QuestionQueue
              session={session}
              questions={sessionQuestions}
              currentFanId={state.fanProfile.id}
              onSubmitQuestion={(content, reqId) =>
                dispatch({
                  type: 'SUBMIT_QUESTION',
                  sessionId: session.id,
                  content,
                  requestId: reqId,
                })
              }
              onSelectQuestion={(qId) => dispatch({ type: 'SELECT_QUESTION', questionId: qId })}
              onAnswerQuestion={(qId) => dispatch({ type: 'ANSWER_QUESTION', questionId: qId })}
            />
          )}

          {interactionTab === 'poll' && (
            <LivePollPanel
              poll={sessionPoll}
              onVote={(pollId, optionId) =>
                dispatch({ type: 'VOTE_POLL', pollId, optionId })
              }
            />
          )}

          {/* Stage Asset & Ethics Disclosure Card (§2.3, §5.1) */}
          <section className="card" style={{ padding: '20px' }} aria-label="Cam kết hiện diện chân thực">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: 0 }}>
                Cam kết đạo đức & Bản quyền
              </h3>
            </div>

            <ul
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--muted)',
                paddingLeft: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              <li>
                <strong>Hiện diện chân thực:</strong> Avatar 2D là nhạc cụ do nghệ sĩ trực tiếp điều khiển.
                Khi mất kết nối, avatar ngưng hoạt động; tuyệt đối không dùng AI đóng giả nghệ sĩ.
              </li>
              <li>
                <strong>Bản quyền nội bộ:</strong> Mọi hình ảnh và âm thanh đều là tài sản minh họa thử nghiệm,
                không sử dụng nội dung khai thác lậu hay trích xuất ngoài luồng.
              </li>
              <li>
                <strong>Quyền riêng tư tuyệt đối:</strong> Ứng dụng không bao giờ yêu cầu quyền truy cập micro hay máy ảnh của khán giả.
              </li>
            </ul>
          </section>

          {/* Host & World Info Card */}
          {world && (
            <section className="card" style={{ padding: '20px' }} aria-label="Thông tin thế giới tổ chức">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Thế giới tổ chức
                </span>
                <Link to={`/worlds/${world.id}`} style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--primary)' }}>
                  Xem thế giới
                </Link>
              </div>

              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: '0 0 6px 0' }}>
                {world.name}
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                {world.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                <span>Phụ trách tổ chức:</span>
                <strong>{world.type === 'artist' ? world.name : 'Đội ngũ phụ trách'}</strong>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
