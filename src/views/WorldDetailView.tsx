import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { WorldHeader } from '../components/WorldHeader';
import { NextMomentCard } from '../components/NextMomentCard';
import {
  Calendar,
  Archive,
  ShoppingBag,
  Home,
  Clock,
  Radio,
  Bell,
  CheckCircle2,
  Lock,
  ArrowLeft,
  AlertTriangle,
  Tag,
} from 'lucide-react';

export const WorldDetailView: React.FC = () => {
  const { worldId } = useParams<{ worldId: string }>();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'home' | 'sessions' | 'archive' | 'shop'>('home');

  const world = worldId ? state.worlds[worldId] : undefined;

  // Graceful recovery for invalid world ID (§6, §3.3)
  if (!world) {
    return (
      <div className="card" style={{ maxWidth: '520px', margin: '40px auto', textAlign: 'center', padding: '40px 24px' }}>
        <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 16px auto' }} />
        <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', marginBottom: '8px' }}>
          Không tìm thấy không gian
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '24px', lineHeight: 1.6 }}>
          Mã định danh <code>{worldId}</code> không tồn tại hoặc đã bị xóa khỏi hệ thống thử nghiệm.
        </p>
        <Link to="/worlds" className="btn btn-primary" id="return-worlds-btn">
          <ArrowLeft size={16} />
          <span>Quay lại danh sách Worlds</span>
        </Link>
      </div>
    );
  }

  // Filter sessions belonging to this world
  const worldSessions = Object.values(state.sessions).filter((s) => s.worldId === world.id);
  const nextSession =
    worldSessions.find((s) => s.status === 'running') ||
    worldSessions.find((s) => s.status === 'scheduled');

  // Filter products for this world
  const worldProducts = Object.values(state.products).filter((p) => p.worldId === world.id);

  const formatTime = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return '20:00 (Asia/Ho_Chi_Minh)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* World Header */}
      <WorldHeader world={world} />

      {/* World Tabs Navigation (§3.2) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '2px',
          overflowX: 'auto',
        }}
        role="tablist"
        aria-label="Các mục trong thế giới"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
          className={`btn ${activeTab === 'home' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          id="tab-world-home"
        >
          <Home size={16} />
          <span>Trang chủ</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sessions'}
          onClick={() => setActiveTab('sessions')}
          className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          id="tab-world-sessions"
        >
          <Calendar size={16} />
          <span>Phiên sự kiện ({worldSessions.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'archive'}
          onClick={() => setActiveTab('archive')}
          className={`btn ${activeTab === 'archive' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          id="tab-world-archive"
        >
          <Archive size={16} />
          <span>Kho Lưu Trữ Replay</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'shop'}
          onClick={() => setActiveTab('shop')}
          className={`btn ${activeTab === 'shop' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          id="tab-world-shop"
        >
          <ShoppingBag size={16} />
          <span>VieSHOP ({worldProducts.length})</span>
        </button>
      </div>

      {/* TAB 1: TRANG CHỦ (HOME) */}
      {activeTab === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {nextSession ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Clock size={16} color="var(--primary)" />
                <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '700' }}>Khoảnh khắc sắp tới</h2>
              </div>
              <NextMomentCard session={nextSession} showWorldLink={false} />
            </div>
          ) : (
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                Hiện chưa có lịch sự kiện mới cho không gian này. Hãy nhấn Theo dõi để nhận thông báo.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="card">
              <h3 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Quy chế tham gia (§2.2)</h3>
              <p className="card-desc">
                Mọi tương tác trong không gian này hoàn toàn là dữ liệu mô phỏng. Huy hiệu DEMO gắn liền với mọi phòng họp. Không mạo danh con người thực.
              </p>
            </div>
            <div className="card">
              <h3 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Quyền lợi gắn kết</h3>
              <p className="card-desc">
                Tham dự các buổi giao lưu trực tiếp để nhận Moment Capsule độc quyền lưu trong My World của bạn.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHIÊN SỰ KIỆN (SESSIONS) */}
      {activeTab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '700' }}>Danh sách các phiên giao lưu & âm nhạc</h2>
          {worldSessions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {worldSessions.map((s) => {
                const isRsvpd = state.rsvpdSessionIds.includes(s.id);
                const isLive = s.status === 'running';
                return (
                  <article
                    key={s.id}
                    className="card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                      padding: '16px 20px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span
                          className="tag"
                          style={{
                            backgroundColor: isLive ? 'var(--danger-bg)' : 'var(--bg)',
                            color: isLive ? 'var(--danger)' : 'var(--primary)',
                            fontWeight: '700',
                          }}
                        >
                          {isLive ? <Radio size={12} style={{ marginRight: '4px' }} /> : <Calendar size={12} style={{ marginRight: '4px' }} />}
                          {isLive ? 'ĐANG DIỄN RA' : s.status === 'ended' ? 'ĐÃ KẾT THÚC' : 'SẮP DIỄN RA'}
                        </span>
                        <span className="demo-badge">DEMO</span>
                        <span className="tag" style={{ fontSize: '11px' }}>
                          {s.format === 'listening' ? 'Phòng nghe' : s.format === 'concert' ? 'Live House' : 'Drop-in'}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: '4px' }}>
                        {s.title}
                      </h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                        Thời gian: {formatTime(s.scheduledStartTime)} (Asia/Ho_Chi_Minh) · Phân đoạn: {s.segmentMode === 'recorded' ? 'Bản ghi đội ngũ' : 'Trực tiếp'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {s.status !== 'ended' && (
                        <button
                          type="button"
                          onClick={() => dispatch({ type: 'TOGGLE_RSVP', sessionId: s.id })}
                          className={`btn ${isRsvpd ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
                          id={`session-list-rsvp-${s.id}`}
                        >
                          {isRsvpd ? (
                            <>
                              <CheckCircle2 size={14} color="#059669" />
                              <span>Đã RSVP</span>
                            </>
                          ) : (
                            <>
                              <Bell size={14} />
                              <span>Đăng ký RSVP</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)' }}>Chưa có phiên sự kiện nào.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KHO LƯU TRỮ REPLAY (ARCHIVE) */}
      {activeTab === 'archive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ backgroundColor: '#EDE9FE', border: '1px solid #DDD6FE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Lock size={16} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', color: 'var(--primary)' }}>
                Chính sách xem lại Replay (§2.3)
              </h2>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)', lineHeight: 1.5 }}>
              Khán giả xem lại bản ghi Replay sẽ được ghi nhận nhật ký xem lại (replay_view), nhưng <strong>tuyệt đối không nhận chứng nhận tham dự trực tiếp (live_attendance)</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {worldSessions.map((s) => (
              <article key={s.id} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="demo-badge">DEMO</span>
                      <span className="tag" style={{ fontSize: '11px' }}>
                        Trạng thái Replay: <strong>{s.replayStatus}</strong>
                      </span>
                    </div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: '4px' }}>
                      {s.title}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                      Yêu cầu quyền lợi: <code>benefit-replay-01</code> · Xem lại có kiểm soát bản quyền
                    </p>
                  </div>

                  <div>
                    {s.replayStatus === 'available' ? (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'WATCH_REPLAY', sessionId: s.id })}
                        className="btn btn-primary"
                        style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
                      >
                        Xem lại bản ghi
                      </button>
                    ) : (
                      <span className="tag" style={{ backgroundColor: 'var(--bg)', color: 'var(--muted)' }}>
                        {s.replayStatus === 'pending_review' ? 'Chờ kiểm duyệt' : 'Chưa khả dụng'}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VIESHOP (SHOP) */}
      {activeTab === 'shop' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <header>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '700' }}>Cửa hàng quà tặng lưu niệm VieSHOP</h2>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
              Vật phẩm kỷ niệm có điều kiện và số lượng minh bạch. Không thu phí thanh toán thật.
            </p>
          </header>

          {worldProducts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {worldProducts.map((p) => (
                <article key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div
                      style={{
                        height: '120px',
                        backgroundColor: 'var(--bg)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                        color: 'var(--muted)',
                      }}
                    >
                      <Tag size={32} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: '4px' }}>
                      {p.title}
                    </h3>
                    <div style={{ fontSize: 'var(--text-md)', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
                      {p.priceVND.toLocaleString('vi-VN')} VND
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '12px' }}>
                      Còn lại trong kho: <strong>{p.stockCount}</strong> chiếc · Mã: <code>{p.id}</code>
                    </div>
                    {p.requiredBenefitId && (
                      <div className="tag" style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '11px', marginBottom: '12px' }}>
                        Yêu cầu quyền lợi: {p.requiredBenefitId}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      dispatch({
                        type: 'CREATE_ORDER',
                        productId: p.id,
                        requestId: `req_${Date.now()}`,
                      });
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: 'var(--text-xs)', padding: '8px' }}
                    id={`order-product-btn-${p.id}`}
                  >
                    Mô phỏng đặt hàng
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)' }}>Không có sản phẩm nào cho không gian này.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
