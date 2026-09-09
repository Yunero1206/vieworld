import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { WardrobeCustomizer } from '../components/WardrobeCustomizer';
import { MomentCapsuleCard } from '../components/MomentCapsuleCard';
import { WorldCard } from '../components/WorldCard';
import {
  User,
  Sparkles,
  Globe,
  Calendar,
  History,
  CheckCircle2,
  Play,
  ArrowRight,
} from 'lucide-react';

export const MyWorldView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'capsules' | 'wardrobe' | 'follows' | 'history'>('capsules');

  const { fanProfile, capsules, followedWorldIds, rsvpdSessionIds, participations, worlds, sessions } = state;

  const earnedCapsules = Object.values(capsules);
  const followedWorlds = followedWorldIds
    .map((id) => worlds[id])
    .filter((w): w is typeof worlds[string] => Boolean(w));
  const rsvpdSessions = rsvpdSessionIds
    .map((id) => sessions[id])
    .filter((s): s is typeof sessions[string] => Boolean(s));
  const participationList = Object.values(participations);

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

  return (
    <div className="container" style={{ padding: '24px 20px 60px 20px' }}>
      {/* Profile Header */}
      <header
        className="card"
        style={{
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '800',
              boxShadow: '0 4px 12px rgba(101, 81, 200, 0.3)',
            }}
          >
            {fanProfile.displayName.charAt(0)}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: 0 }}>
                {fanProfile.displayName}
              </h1>
              <span className="demo-badge">DEMO</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
              <span>@{fanProfile.username}</span>
              <span>·</span>
              <span>Tenant: <code>{state.activeTenantId}</code></span>
              <span>·</span>
              <span>Phụ kiện: <strong>{fanProfile.wardrobeChoice?.accessoryId || 'Chưa chọn'}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick stats badges */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Kỷ niệm</span>
            <strong style={{ fontSize: 'var(--text-md)', color: 'var(--primary)' }} id="stat-capsules-count">
              {earnedCapsules.length}
            </strong>
          </div>
          <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Theo dõi</span>
            <strong style={{ fontSize: 'var(--text-md)', color: 'var(--ink)' }} id="stat-follows-count">
              {followedWorldIds.length}
            </strong>
          </div>
          <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>RSVP</span>
            <strong style={{ fontSize: 'var(--text-md)', color: 'var(--ink)' }} id="stat-rsvp-count">
              {rsvpdSessionIds.length}
            </strong>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
        role="tablist"
        aria-label="Các mục không gian cá nhân My World"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'capsules'}
          onClick={() => setActiveTab('capsules')}
          className={`btn ${activeTab === 'capsules' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 'var(--text-sm)', padding: '10px 16px' }}
          id="tab-btn-my-capsules"
        >
          <Sparkles size={16} />
          <span>Kỷ niệm số ({earnedCapsules.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'wardrobe'}
          onClick={() => setActiveTab('wardrobe')}
          className={`btn ${activeTab === 'wardrobe' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 'var(--text-sm)', padding: '10px 16px' }}
          id="tab-btn-my-wardrobe"
        >
          <User size={16} />
          <span>Tủ đồ Avatar</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'follows'}
          onClick={() => setActiveTab('follows')}
          className={`btn ${activeTab === 'follows' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 'var(--text-sm)', padding: '10px 16px' }}
          id="tab-btn-my-follows"
        >
          <Globe size={16} />
          <span>Thế giới theo dõi & Lịch hẹn ({followedWorldIds.length + rsvpdSessionIds.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 'var(--text-sm)', padding: '10px 16px' }}
          id="tab-btn-my-history"
        >
          <History size={16} />
          <span>Lịch sử tham dự ({participationList.length})</span>
        </button>
      </div>

      {/* TAB 1: KỶ NIỆM SỐ (MOMENT CAPSULES) */}
      {activeTab === 'capsules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <header>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', margin: '0 0 4px 0' }}>
              Bộ sưu tập Kỷ niệm số (Moment Capsules)
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Kỷ niệm ghi dấu sự hiện diện trực tiếp cùng nghệ sĩ trong các phiên sự kiện.
            </p>
          </header>

          {earnedCapsules.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center' }} data-testid="capsules-empty-state">
              <Sparkles size={40} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: '8px' }}>
                Chưa có Kỷ niệm số nào
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
                Kỷ niệm số chỉ được trao tặng khi bạn tham dự trực tiếp phiên sự kiện phát sóng. Người chỉ xem lại Replay hoặc chỉ vào phòng chờ sẽ không nhận được kỷ niệm này.
              </p>
              <Link to="/worlds" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                Khám phá sự kiện sắp tới
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {earnedCapsules.map((capsule) => {
                const session = sessions[capsule.sessionId];
                const world = worlds[capsule.worldId];

                return (
                  <MomentCapsuleCard
                    key={capsule.id}
                    capsule={capsule}
                    session={session}
                    world={world}
                    onSaveNote={(cId, note) =>
                      dispatch({ type: 'SAVE_CAPSULE', capsuleId: cId, privateNote: note })
                    }
                    onToggleSaved={(cId, saved) =>
                      dispatch({ type: 'SAVE_CAPSULE', capsuleId: cId, isSaved: saved })
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TỦ ĐỒ AVATAR (WARDROBE CUSTOMIZER) */}
      {activeTab === 'wardrobe' && (
        <div>
          <WardrobeCustomizer
            equippedAccessoryId={fanProfile.wardrobeChoice?.accessoryId}
            onEquip={(accId) => dispatch({ type: 'EQUIP_WARDROBE', accessoryId: accId })}
          />
        </div>
      )}

      {/* TAB 3: THẾ GIỚI THEO DÕI & LỊCH HẸN RSVP */}
      {activeTab === 'follows' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Followed Worlds */}
          <section aria-label="Danh sách thế giới đang theo dõi">
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', marginBottom: '14px' }}>
              Thế giới đang theo dõi ({followedWorlds.length})
            </h2>

            {followedWorlds.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: '0 0 12px 0' }}>
                  Bạn chưa theo dõi thế giới người hâm mộ nào.
                </p>
                <Link to="/worlds" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                  Khám phá Worlds
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {followedWorlds.map((w) => (
                  <WorldCard
                    key={w.id}
                    world={w}
                    viewMode="list"
                  />
                ))}
              </div>
            )}
          </section>

          {/* RSVP Upcoming Sessions */}
          <section aria-label="Danh sách sự kiện đã đăng ký nhắc">
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', marginBottom: '14px' }}>
              Sự kiện đã nhắc (RSVP) ({rsvpdSessions.length})
            </h2>

            {rsvpdSessions.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
                  Bạn chưa đăng ký nhận thông báo sự kiện nào.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rsvpdSessions.map((s) => (
                  <div
                    key={s.id}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}>
                          {s.format}
                        </span>
                        <span className="demo-badge">DEMO</span>
                      </div>
                      <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: '0 0 4px 0' }}>
                        {s.title}
                      </h4>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} />
                        <span>{formatVietnamTime(s.scheduledStartTime)} (Asia/Ho_Chi_Minh)</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link to={`/sessions/${s.id}`} className="btn btn-primary" style={{ fontSize: 'var(--text-xs)', padding: '8px 14px' }}>
                        <span>Vào phiên</span>
                        <ArrowRight size={12} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'TOGGLE_RSVP', sessionId: s.id })}
                        className="btn btn-secondary"
                        style={{ fontSize: 'var(--text-xs)', padding: '8px 14px' }}
                      >
                        Hủy nhắc
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 4: LỊCH SỬ THAM DỰ & REPLAY */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <header>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', margin: '0 0 4px 0' }}>
              Lịch sử tham dự & Xem lại ({participationList.length})
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Minh bạch tuyệt đối giữa tham dự trực tiếp (live_attendance) và xem lại bản ghi (replay_view).
            </p>
          </header>

          {participationList.length === 0 ? (
            <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
                Chưa có dữ liệu tham dự nào trong phiên đăng nhập này.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {participationList.map((part) => {
                const session = sessions[part.sessionId];
                const isLive = part.kind === 'live_attendance';

                return (
                  <div
                    key={part.id}
                    className="card"
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                    data-testid={`participation-item-${part.id}`}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          className="tag"
                          style={{
                            backgroundColor: isLive ? '#DCFCE7' : '#F3F4F6',
                            color: isLive ? '#15803D' : '#4B5563',
                            fontWeight: '700',
                          }}
                        >
                          {isLive ? <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> : <Play size={12} style={{ marginRight: '4px' }} />}
                          {isLive ? 'Tham dự trực tiếp (Live)' : 'Xem lại bản ghi (Replay)'}
                        </span>
                        <span className="demo-badge">DEMO</span>
                      </div>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>
                        {session ? session.title : part.sessionId}
                      </strong>
                    </div>

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                      Ghi nhận: {formatVietnamTime(part.joinedAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
