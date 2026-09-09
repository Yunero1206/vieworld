import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Session } from '../domain/types';
import {
  Radio,
  ShieldCheck,
  Play,
  Pause,
  StopCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  FileCheck,
  ExternalLink,
  Ban,
  Archive,
} from 'lucide-react';

export const OperatorConsoleView: React.FC = () => {
  const { sessionId: paramSessionId } = useParams<{ sessionId?: string }>();
  const { state, dispatch } = useApp();

  const sessionList = Object.values(state.sessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    paramSessionId || sessionList[0]?.id || 'session-dropin-01'
  );

  const session: Session | undefined = state.sessions[selectedSessionId] || sessionList[0];
  const world = session ? state.worlds[session.worldId] : undefined;
  const avatar = session?.avatarAssetId ? state.avatarAssets[session.avatarAssetId] : undefined;

  // Local state for rights checklist items
  const [musicClearance, setMusicClearance] = useState<boolean>(
    session?.rightsChecklist?.musicClearance ?? (session?.rightsApproved ?? false)
  );
  const [artistConsent, setArtistConsent] = useState<boolean>(
    session?.rightsChecklist?.artistConsent ?? (session?.rightsApproved ?? false)
  );
  const [safetyReview, setSafetyReview] = useState<boolean>(
    session?.rightsChecklist?.safetyReview ?? (session?.rightsApproved ?? false)
  );

  const [questionFilter, setQuestionFilter] = useState<'all' | 'submitted' | 'selected' | 'answered'>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Sync checklist states when switching sessions
  const handleSelectSession = (id: string) => {
    setSelectedSessionId(id);
    const targetSession = state.sessions[id];
    if (targetSession) {
      setMusicClearance(targetSession.rightsChecklist?.musicClearance ?? (targetSession.rightsApproved ?? false));
      setArtistConsent(targetSession.rightsChecklist?.artistConsent ?? (targetSession.rightsApproved ?? false));
      setSafetyReview(targetSession.rightsChecklist?.safetyReview ?? (targetSession.rightsApproved ?? false));
      setActionFeedback(null);
    }
  };

  if (!session) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
        <h2>Không tìm thấy phiên sự kiện nào trong hệ thống.</h2>
        <Link to="/studio" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Quay lại Studio
        </Link>
      </div>
    );
  }

  // Filter questions for this session
  const sessionQuestions = Object.values(state.questions).filter((q) => q.sessionId === session.id);
  const filteredQuestions = sessionQuestions.filter((q) => {
    if (questionFilter === 'all') return true;
    return q.status === questionFilter;
  });

  const isRunning = session.status === 'running';
  const isPaused = session.status === 'paused';
  const isScheduled = session.status === 'scheduled';
  const isOpen = session.status === 'open';
  const isEnded = session.status === 'ended';
  const isCancelled = session.status === 'cancelled';

  // Approve Rights Checklist Handler
  const handleApproveRights = () => {
    dispatch({
      type: 'APPROVE_SESSION_RIGHTS',
      sessionId: session.id,
      checklist: {
        musicClearance: true,
        artistConsent: true,
        safetyReview: true,
      },
    });
    setMusicClearance(true);
    setArtistConsent(true);
    setSafetyReview(true);
    setActionFeedback('Đã phê duyệt danh mục bản quyền và cam kết nghệ sĩ cho phiên sự kiện.');
  };

  // Start session handler
  const handleStartSession = () => {
    dispatch({
      type: 'START_SESSION',
      sessionId: session.id,
      avatarAssetId: session.avatarAssetId,
    });
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '20px 20px 60px 20px' }}>
      {/* Breadcrumbs & Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Link
            to="/studio"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
          >
            ← Bàn điều khiển Studio
          </Link>
          <span style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>/</span>
          <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}>
            OPERATOR WORKSPACE · P12
          </span>
          <span className="demo-badge">DEMO</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--ink)' }}>
              Bàn điều khiển Phiên (Operator Session Console)
            </h1>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
              {world ? `Thế giới: ${world.name} · ` : ''}Điều phối phát sóng, giám sát hiện diện nghệ sĩ, duyệt câu hỏi và kiểm soát bản quyền phiên sự kiện.
            </p>
          </div>
          <Link
            to={`/sessions/${session.id}`}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            id="view-fan-stage-link"
            data-testid="view-fan-stage-link"
          >
            <span>Mở góc nhìn Khán giả</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Role Limitation Disclosure Banner (§2.3, §4, P12) */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          marginBottom: '24px',
          backgroundColor: '#F8FAFC',
          borderLeft: '4px solid var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: 'var(--text-xs)' }}>
          <ShieldCheck size={16} />
          <span>MINH BẠCH VAI TRÒ ĐIỀU HÀNH NỘI BỘ (OPERATOR ROLE PREVIEW)</span>
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
          • <strong>Mô phỏng cục bộ (Local-Only):</strong> Chế độ xem trước vai trò điều hành là công cụ giả lập kiểm thử giao diện trong nguyên mẫu, <strong>không phải cơ chế bảo mật phân quyền backend (Secure Auth / RBAC)</strong>.
          <br />
          • <strong>Quyền hạn bất biến:</strong> Hủy phiên (Cancel) là trạng thái vĩnh viễn không thể hoàn tác và được lưu trữ an toàn trong LocalStorage qua các lần tải lại trang.
        </div>
      </div>

      {/* Action feedback / Global error alert */}
      {state.lastError && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            fontSize: 'var(--text-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          data-testid="operator-error-alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>
              <strong>Lỗi thao tác [{state.lastError.code}]:</strong> {state.lastError.message}
            </span>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {actionFeedback && !state.lastError && (
        <div
          role="status"
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontSize: 'var(--text-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Session Selector Strip */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label htmlFor="operator-session-select" style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--ink)' }}>
            Chọn Phiên Điều Hành:
          </label>
          <select
            id="operator-session-select"
            value={session.id}
            onChange={(e) => handleSelectSession(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              fontSize: 'var(--text-xs)',
              fontWeight: '600',
              color: 'var(--ink)',
            }}
          >
            {sessionList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} · [{s.status.toUpperCase()}] ({s.format})
              </option>
            ))}
          </select>
        </div>

        {/* Live Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            className="tag"
            style={{
              backgroundColor:
                session.status === 'running'
                  ? '#DEF7EC'
                  : session.status === 'open'
                  ? '#E0F2FE'
                  : session.status === 'cancelled'
                  ? '#FEE2E2'
                  : '#F1F5F9',
              color:
                session.status === 'running'
                  ? '#03543F'
                  : session.status === 'open'
                  ? '#0369A1'
                  : session.status === 'cancelled'
                  ? '#991B1B'
                  : '#475569',
              fontWeight: '700',
              fontSize: '11px',
            }}
            id="operator-session-status-badge"
          >
            TRẠNG THÁI: {session.status.toUpperCase()}
          </span>

          <span
            className="tag"
            style={{
              backgroundColor: session.segmentMode === 'live' ? '#FEE2E2' : '#F1F5F9',
              color: session.segmentMode === 'live' ? '#991B1B' : '#475569',
              fontWeight: '700',
              fontSize: '11px',
            }}
            id="operator-segment-mode-badge"
          >
            PHÂN ĐOẠN: {session.segmentMode.toUpperCase()}
          </span>

          <span
            className="tag"
            style={{
              backgroundColor: session.artistPresence === 'present' ? '#DEF7EC' : '#FEE2E2',
              color: session.artistPresence === 'present' ? '#03543F' : '#991B1B',
              fontWeight: '700',
              fontSize: '11px',
            }}
            id="operator-artist-presence-badge"
          >
            NGHỆ SĨ: {session.artistPresence.toUpperCase()}
          </span>

          {session.isChatPaused && (
            <span
              className="tag"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: '700', fontSize: '11px' }}
              id="operator-chat-status-badge"
            >
              CHAT: TẠM DỪNG
            </span>
          )}
        </div>
      </div>

      {/* Main Console Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Broadcast Controls & Rights Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pre-Broadcast Rights & Consent Checklist Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={18} color="var(--primary)" />
                <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                  Chứng thực Quyền & Bản quyền (§2.3, T12)
                </h2>
              </div>
              <span
                className="tag"
                style={{
                  backgroundColor: session.rightsApproved !== false ? '#DEF7EC' : '#FEF3C7',
                  color: session.rightsApproved !== false ? '#03543F' : '#92400E',
                  fontWeight: '700',
                  fontSize: '11px',
                }}
                id="rights-status-badge"
                data-testid={session.rightsApproved !== false ? 'rights-approved-badge' : 'rights-pending-badge'}
              >
                {session.rightsApproved !== false ? '✓ ĐÃ PHÊ DUYỆT' : '● CHƯA HOÀN TẤT'}
              </span>
            </div>

            {session.rightsApproved === false && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  color: '#92400E',
                  marginBottom: '12px',
                  fontWeight: '600',
                }}
              >
                CHƯA HOÀN TẤT DUYỆT BẢN QUYỀN & AN TOÀN
              </div>
            )}

            <p style={{ margin: '0 0 14px 0', fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
              Khung kiểm duyệt nội bộ trước phát sóng. Bắt buộc hoàn tất danh mục để mở phiên sự kiện.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)' }}>
                <input
                  type="checkbox"
                  data-testid="chk-musicClearance"
                  checked={musicClearance}
                  onChange={(e) => setMusicClearance(e.target.checked)}
                />
                <span>1. Giấy phép Bản quyền Tác phẩm Âm nhạc (Music Clearance)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)' }}>
                <input
                  type="checkbox"
                  data-testid="chk-artistConsent"
                  checked={artistConsent}
                  onChange={(e) => setArtistConsent(e.target.checked)}
                />
                <span>2. Cam kết & Sự đồng thuận Đại diện số Nghệ sĩ (Artist Consent)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)' }}>
                <input
                  type="checkbox"
                  data-testid="chk-safetyReview"
                  checked={safetyReview}
                  onChange={(e) => setSafetyReview(e.target.checked)}
                />
                <span>3. Kiểm duyệt An toàn Nội dung & Tiêu chuẩn Cộng đồng (Safety Review)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={handleApproveRights}
                className="btn btn-secondary"
                style={{ fontSize: 'var(--text-xs)', padding: '8px 14px' }}
                id="approve-rights-btn"
                data-testid="approve-rights-btn"
              >
                <CheckCircle2 size={14} color="#059669" />
                <span>Xác nhận Phê duyệt Bản quyền</span>
              </button>

              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Avatar: <strong>{avatar ? `${avatar.id} (${avatar.status})` : 'Chưa gán'}</strong>
              </span>
            </div>
          </div>

          {/* Broadcast Lifecycle Controls Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Radio size={18} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                Điều phối Vòng đời Phát sóng (Broadcast Lifecycle)
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {/* Open Lobby button */}
              {isScheduled && (
                <button
                  onClick={() => dispatch({ type: 'OPEN_LOBBY', sessionId: session.id })}
                  className="btn btn-secondary"
                  style={{ fontSize: 'var(--text-xs)', padding: '10px', justifyContent: 'center' }}
                  id="open-lobby-btn"
                  data-testid="open-lobby-btn"
                >
                  <Clock size={14} />
                  <span>Mở Phòng Chờ</span>
                </button>
              )}

              {/* Start Session button */}
              {(isScheduled || isOpen) && (
                <button
                  onClick={handleStartSession}
                  disabled={session.rightsApproved === false}
                  className="btn btn-primary"
                  style={{
                    fontSize: 'var(--text-xs)',
                    padding: '10px',
                    justifyContent: 'center',
                    backgroundColor: session.rightsApproved === false ? 'var(--muted)' : '#059669',
                    borderColor: session.rightsApproved === false ? 'var(--border)' : '#059669',
                    cursor: session.rightsApproved === false ? 'not-allowed' : 'pointer',
                  }}
                  id="start-session-btn"
                  data-testid="start-session-btn"
                >
                  <Play size={14} />
                  <span>Bắt đầu Phát sóng</span>
                </button>
              )}

              {/* Pause Session button */}
              {isRunning && (
                <button
                  onClick={() => dispatch({ type: 'PAUSE_SESSION', sessionId: session.id })}
                  className="btn btn-secondary"
                  style={{ fontSize: 'var(--text-xs)', padding: '10px', justifyContent: 'center' }}
                  id="pause-session-btn"
                  data-testid="pause-session-btn"
                >
                  <Pause size={14} />
                  <span>Tạm dừng Phiên</span>
                </button>
              )}

              {/* Resume Session button */}
              {isPaused && (
                <button
                  onClick={() => dispatch({ type: 'RESUME_SESSION', sessionId: session.id })}
                  className="btn btn-primary"
                  style={{ fontSize: 'var(--text-xs)', padding: '10px', justifyContent: 'center' }}
                  id="resume-session-btn"
                  data-testid="resume-session-btn"
                >
                  <Play size={14} />
                  <span>Tiếp tục Phát sóng</span>
                </button>
              )}

              {/* End Session button */}
              {(isRunning || isPaused) && (
                <button
                  onClick={() => dispatch({ type: 'END_SESSION', sessionId: session.id })}
                  className="btn btn-secondary"
                  style={{ fontSize: 'var(--text-xs)', padding: '10px', justifyContent: 'center', color: '#B91C1C' }}
                  id="end-session-btn"
                  data-testid="end-session-btn"
                >
                  <StopCircle size={14} />
                  <span>Kết thúc Phiên</span>
                </button>
              )}
            </div>

            {/* Cancel Session */}
            {!isEnded && !isCancelled && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button
                  onClick={() => {
                    dispatch({ type: 'CANCEL_SESSION', sessionId: session.id });
                    setActionFeedback(`Đã hủy phiên sự kiện [${session.id}]. Trạng thái hủy là vĩnh viễn và không thể gia nhập lại.`);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #FECACA',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  id="cancel-session-btn"
                  data-testid="cancel-session-btn"
                >
                  <Ban size={14} />
                  <span>Hủy Bỏ Phiên Sự Kiện (Cancel Session)</span>
                </button>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '4px', textAlign: 'center' }}>
                  * Quyết định hủy được lưu trữ an toàn và ngăn chặn vĩnh viễn việc gia nhập phòng.
                </span>
              </div>
            )}
          </div>

          {/* Artist Presence & Segment Mode Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Wifi size={18} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                Mô phỏng Hiện diện Nghệ sĩ & Chế độ Phát sóng
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Presence Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                  Hiện diện thực tế:{' '}
                  <strong>
                    {session.artistPresence === 'disconnected'
                      ? 'Mất kết nối mô phỏng'
                      : session.artistPresence}
                  </strong>
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => dispatch({ type: 'RECONNECT_ARTIST', sessionId: session.id })}
                    disabled={session.artistPresence === 'present'}
                    className={`btn ${session.artistPresence === 'present' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                    id="operator-reconnect-btn"
                    data-testid="presence-toggle-online"
                  >
                    <Wifi size={14} color={session.artistPresence === 'present' ? '#FFFFFF' : '#059669'} />
                    <span>Kết nối Online</span>
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DISCONNECT_ARTIST', sessionId: session.id })}
                    disabled={session.artistPresence === 'disconnected'}
                    className={`btn ${session.artistPresence === 'disconnected' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', color: session.artistPresence === 'disconnected' ? '#FFFFFF' : '#DC2626' }}
                    id="operator-disconnect-btn"
                    data-testid="presence-toggle-disconnected"
                  >
                    <WifiOff size={14} />
                    <span>Mô phỏng Mất kết nối</span>
                  </button>
                </div>
              </div>

              {/* Segment Mode Toggle */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                  Chế độ phân đoạn: <strong>{session.segmentMode}</strong>
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_SEGMENT_MODE', sessionId: session.id, segmentMode: 'live' })}
                    className={`btn ${session.segmentMode === 'live' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    id="set-mode-live-btn"
                    data-testid="segment-mode-live"
                  >
                    Live
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_SEGMENT_MODE', sessionId: session.id, segmentMode: 'recorded' })}
                    className={`btn ${session.segmentMode === 'recorded' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    id="set-mode-recorded-btn"
                    data-testid="segment-mode-recorded"
                  >
                    Recorded
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Replay Governance Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Archive size={18} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                Quản trị Bản ghi Replay
              </h2>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '12px' }}>
              Trạng thái xem lại hiện tại: <strong>{session.replayStatus}</strong>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => dispatch({ type: 'PUBLISH_REPLAY', sessionId: session.id })}
                disabled={session.replayStatus === 'available'}
                className="btn btn-secondary"
                style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                id="publish-replay-btn"
                data-testid="publish-replay-btn"
              >
                Duyệt Bản Ghi Replay
              </button>
              <button
                onClick={() => dispatch({ type: 'WITHDRAW_REPLAY', sessionId: session.id })}
                disabled={session.replayStatus === 'withdrawn'}
                className="btn btn-secondary"
                style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', color: '#DC2626' }}
                id="withdraw-replay-btn"
                data-testid="withdraw-replay-btn"
              >
                Thu Hồi Bản Ghi
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Moderation & Fan Chat Control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Question Review & Moderation Desk */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={18} color="var(--primary)" />
                <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                  Hàng đợi Câu hỏi Khán giả (Q&A Moderation)
                </h2>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['all', 'submitted', 'selected', 'answered'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setQuestionFilter(tab)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: questionFilter === tab ? 'var(--primary)' : 'var(--surface)',
                      color: questionFilter === tab ? '#FFFFFF' : 'var(--ink)',
                      cursor: 'pointer',
                      fontWeight: questionFilter === tab ? '700' : '500',
                    }}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Items List */}
            {filteredQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
                Chưa có câu hỏi nào trong danh mục này.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: q.status === 'selected' ? '#F0FDF4' : 'var(--surface)',
                      border: q.status === 'selected' ? '1.5px solid #059669' : '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                    data-testid={`operator-question-item-${q.id}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>
                        {q.authorName || 'Khán giả ẩn danh'}
                      </span>
                      <span
                        className="tag"
                        style={{
                          backgroundColor:
                            q.status === 'selected'
                              ? '#DEF7EC'
                              : q.status === 'answered'
                              ? '#EDE9FE'
                              : '#FEF3C7',
                          color:
                            q.status === 'selected'
                              ? '#03543F'
                              : q.status === 'answered'
                              ? 'var(--primary)'
                              : '#92400E',
                          fontWeight: '700',
                          fontSize: '10px',
                        }}
                      >
                        {q.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)', lineHeight: 1.4 }}>
                      "{q.content}"
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {q.status !== 'selected' && (
                        <button
                          onClick={() => {
                            dispatch({ type: 'SELECT_QUESTION', questionId: q.id });
                            setActionFeedback(`Đã chọn câu hỏi [${q.id}] lên sân khấu trực tiếp.`);
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '10px', padding: '4px 8px' }}
                          id={`select-question-btn-${q.id}`}
                          data-testid="select-question-btn"
                        >
                          <Star size={12} color="#059669" />
                          <span>Chọn Trả lời</span>
                        </button>
                      )}

                      {q.status !== 'answered' && (
                        <button
                          onClick={() => dispatch({ type: 'ANSWER_QUESTION', questionId: q.id })}
                          className="btn btn-secondary"
                          style={{ fontSize: '10px', padding: '4px 8px' }}
                          id={`answer-question-btn-${q.id}`}
                          data-testid="answer-question-btn"
                        >
                          <CheckCircle2 size={12} color="var(--primary)" />
                          <span>Đánh dấu Đã trả lời</span>
                        </button>
                      )}

                      {q.status !== 'closed' && (
                        <button
                          onClick={() => dispatch({ type: 'CLOSE_QUESTION', questionId: q.id })}
                          className="btn btn-secondary"
                          style={{ fontSize: '10px', padding: '4px 8px', color: 'var(--muted)' }}
                          id={`close-question-btn-${q.id}`}
                          data-testid="close-question-btn"
                        >
                          <span>Đóng</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fan Chat Moderation Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="var(--primary)" />
                <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: 0 }}>
                  Kiểm soát Kênh Trò chuyện (Fan Chat Control)
                </h2>
              </div>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
              Điều hành viên có thể tạm dừng luồng gửi tin nhắn của khán giả trong trường hợp khẩn cấp hoặc khi nghệ sĩ biểu diễn tập trung.
            </p>

            <button
              onClick={() => {
                dispatch({ type: 'TOGGLE_CHAT_PAUSED', sessionId: session.id });
                setActionFeedback(
                  session.isChatPaused
                    ? 'Đã mở lại kênh trò chuyện cho khán giả.'
                    : 'Đã tạm dừng kênh trò chuyện của khán giả.'
                );
              }}
              className={`btn ${session.isChatPaused ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 'var(--text-xs)', padding: '8px 14px' }}
              id="toggle-chat-paused-btn"
              data-testid="toggle-chat-pause-btn"
            >
              <Pause size={14} />
              <span>{session.isChatPaused ? 'Mở lại Kênh Trò chuyện' : 'Tạm dừng Kênh Trò chuyện (Freeze Chat)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
