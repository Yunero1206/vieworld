import React from 'react';
import { useApp } from '../context/AppContext';
import { Link, useSearchParams } from 'react-router-dom';
import { WardrobeCustomizer } from '../components/WardrobeCustomizer';
import { MomentCapsuleCard } from '../components/MomentCapsuleCard';
import { WorldCard } from '../components/WorldCard';
import { MembershipCard } from '../components/MembershipCard';
import { BenefitCard } from '../components/BenefitCard';
import { MyRoomScene } from '../components/MyRoomScene';
import {
  User,
  Sparkles,
  Globe,
  Calendar,
  History,
  CheckCircle2,
  Play,
  ArrowRight,
  Award,
  Gift,
  Package,
  ShoppingBag,
  PackageCheck,
  Receipt,
  LifeBuoy,
} from 'lucide-react';

export const MyWorldView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const availableTabs = ['capsules', 'benefits', 'orders', 'support', 'wardrobe', 'follows', 'history'] as const;
  type MyWorldTab = (typeof availableTabs)[number];
  const requestedTab = searchParams.get('drawer');
  const activeTab: MyWorldTab = availableTabs.includes(requestedTab as MyWorldTab)
    ? (requestedTab as MyWorldTab)
    : 'capsules';

  const openSection = (tab: MyWorldTab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === 'capsules') nextParams.delete('drawer');
    else nextParams.set('drawer', tab);
    setSearchParams(nextParams, { replace: true });
  };

  const { fanProfile, capsules, followedWorldIds, rsvpdSessionIds, participations, worlds, sessions } = state;

  const earnedCapsules = Object.values(capsules);
  const followedWorlds = followedWorldIds
    .map((id) => worlds[id])
    .filter((w): w is typeof worlds[string] => Boolean(w));
  const rsvpdSessions = rsvpdSessionIds
    .map((id) => sessions[id])
    .filter((s): s is typeof sessions[string] => Boolean(s));
  const participationList = Object.values(participations);
  const userBenefits = Object.values(state.benefits);
  const userMemberships = Object.values(state.memberships);
  const activeMembershipsCount = userMemberships.filter((m) => m.status === 'active').length;
  const artistWorlds = Object.values(worlds).filter((w) => w.type === 'artist');
  const userOrders = Object.values(state.orders).filter((o) => o.fanId === fanProfile.id);
  const fulfilledOrders = userOrders.filter((o) => o.status === 'fulfilled');
  const userSupportCases = Object.values(state.supportCases).filter((c) => c.fanId === fanProfile.id);

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
    <div className="container my-world-page">
      <MyRoomScene
        displayName={fanProfile.displayName}
        accessoryName={fanProfile.wardrobeChoice?.accessoryId}
        capsuleCount={earnedCapsules.length}
        benefitCount={userBenefits.length}
        orderCount={userOrders.length}
        supportCount={userSupportCases.length}
        upcomingCount={rsvpdSessions.length}
        onOpenSection={openSection}
      />

      {/* Profile Header */}
      <header
        className="card my-world-profile"
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
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: 0 }}>
                {fanProfile.displayName}
              </h2>
              <span className="demo-badge">DEMO</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
              <span>@{fanProfile.username}</span>
              <span>·</span>
              <span>Góc riêng tư của bạn</span>
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
          <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Quyền lợi</span>
            <strong style={{ fontSize: 'var(--text-md)', color: 'var(--primary)' }} id="stat-benefits-count">
              {userBenefits.length}
            </strong>
          </div>
          <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Đơn hàng</span>
            <strong style={{ fontSize: 'var(--text-md)', color: 'var(--ink)' }} id="stat-orders-count">
              {userOrders.length}
            </strong>
          </div>
          <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Hỗ trợ</span>
            <strong style={{ fontSize: 'var(--text-md)', color: 'var(--primary)' }} id="stat-support-count">
              {userSupportCases.length}
            </strong>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div
        className="my-world-tabs"
        role="tablist"
        aria-label="Các mục không gian cá nhân My World"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'capsules'}
          onClick={() => openSection('capsules')}
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
          aria-selected={activeTab === 'benefits'}
          onClick={() => openSection('benefits')}
          className={`btn ${activeTab === 'benefits' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 'var(--text-sm)', padding: '10px 16px' }}
          id="tab-btn-my-benefits"
        >
          <Award size={16} />
          <span>Quyền lợi & Hội viên ({userBenefits.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'orders'}
          onClick={() => openSection('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 'var(--text-sm)', padding: '10px 16px' }}
          id="tab-btn-my-orders"
        >
          <Package size={16} />
          <span>Đơn hàng & Sở hữu ({userOrders.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'support'}
          onClick={() => openSection('support')}
          className={`btn ${activeTab === 'support' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 'var(--text-sm)', padding: '10px 16px' }}
          id="tab-btn-my-support"
        >
          <LifeBuoy size={16} />
          <span>Hỗ trợ & Đối soát ({userSupportCases.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'wardrobe'}
          onClick={() => openSection('wardrobe')}
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
          onClick={() => openSection('follows')}
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
          onClick={() => openSection('history')}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
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

      {/* TAB: QUYỀN LỢI & HỘI VIÊN */}
      {activeTab === 'benefits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1: Memberships */}
          <section aria-label="Tư cách hội viên theo thế giới">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Award size={20} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', margin: 0 }}>
                Tư cách Hội viên ({activeMembershipsCount} đang hoạt động)
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {artistWorlds.map((w) => {
                const m = Object.values(state.memberships).find(
                  (mem) => mem.worldId === w.id && mem.fanId === state.fanProfile.id
                );
                const isWorldFollowed = followedWorldIds.includes(w.id);

                return (
                  <MembershipCard
                    key={w.id}
                    world={w}
                    membership={m}
                    onUpgrade={() => dispatch({ type: 'UPGRADE_MEMBERSHIP', worldId: w.id })}
                    isFollowed={isWorldFollowed}
                    onToggleFollow={() => dispatch({ type: 'TOGGLE_FOLLOW', worldId: w.id })}
                  />
                );
              })}
            </div>
          </section>

          {/* Section 2: Benefits */}
          <section aria-label="Danh mục quyền lợi của bạn">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Gift size={20} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', margin: 0 }}>
                Danh mục Quyền lợi ({userBenefits.length})
              </h2>
            </div>

            {userBenefits.length === 0 ? (
              <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
                <Gift size={40} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: '8px' }}>
                  Chưa có quyền lợi nào được phân bổ
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
                  Nâng cấp tư cách hội viên trong các thế giới nghệ sĩ hoặc tham gia các sự kiện để được xét duyệt quyền lợi.
                </p>
                <Link to="/worlds" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                  Khám phá Worlds
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {userBenefits.map((benefit) => (
                  <BenefitCard
                    key={benefit.id}
                    benefit={benefit}
                    onClaim={(id) => dispatch({ type: 'CLAIM_BENEFIT', benefitId: id })}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB: ĐƠN HÀNG & SỞ HỮU (ORDERS & FULFILLED ITEMS) */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1: Physical items ownership (FULFILLED ONLY - §2.3) */}
          <section aria-label="Bộ sưu tập vật phẩm đã sở hữu">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <PackageCheck size={20} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', margin: 0 }}>
                Bộ sưu tập vật phẩm đã sở hữu ({fulfilledOrders.length})
              </h2>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', margin: '0 0 14px 0' }}>
              Chỉ vật phẩm đã hoàn tất bàn giao mô phỏng mới xuất hiện trong bộ sưu tập. Đơn đang chờ hoặc mới thanh toán chưa được tính là đã sở hữu.
            </p>

            {fulfilledOrders.length === 0 ? (
              <div className="card" style={{ padding: '28px', textAlign: 'center' }} data-testid="owned-items-empty">
                <ShoppingBag size={36} color="var(--muted)" style={{ margin: '0 auto 10px auto' }} />
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', marginBottom: '6px' }}>
                  Chưa có vật phẩm sở hữu nào
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', maxWidth: '440px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                  Hãy ghé thăm VieSHOP trong các Thế giới để mô phỏng đặt hàng, thanh toán và hoàn tất bàn giao.
                </p>
                <Link to="/worlds" className="btn btn-primary" style={{ display: 'inline-flex', fontSize: 'var(--text-xs)' }}>
                  Khám phá VieSHOP
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }} data-testid="owned-items-grid">
                {fulfilledOrders.map((ord) => {
                  const prod = state.products[ord.productId];
                  const w = state.worlds[ord.worldId];
                  return (
                    <div
                      key={ord.id}
                      className="card"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        border: '2px solid #86EFAC',
                      }}
                      data-testid={`owned-item-${ord.productId}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="tag" style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: '700', fontSize: '11px' }}>
                          ✓ ĐÃ SỞ HỮU
                        </span>
                        <span className="demo-badge">DEMO</span>
                      </div>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '800', margin: 0 }}>
                        {prod ? prod.title : ord.productId}
                      </h4>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                        Nguồn: <strong>{w ? w.name : ord.worldId}</strong> · Mã đơn: <code>{ord.id}</code>
                      </div>
                      <Link
                        to={`/orders/${ord.id}`}
                        style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', marginTop: '4px' }}
                      >
                        Xem chứng từ đơn hàng →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Order History */}
          <section aria-label="Lịch sử đơn hàng mô phỏng">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Receipt size={20} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', margin: 0 }}>
                Lịch sử đơn hàng VieSHOP ({userOrders.length})
              </h2>
            </div>

            {userOrders.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
                  Bạn chưa có đơn hàng nào trong phiên thử nghiệm.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userOrders.map((ord) => {
                  const prod = state.products[ord.productId];
                  const w = state.worlds[ord.worldId];
                  return (
                    <div
                      key={ord.id}
                      className="card"
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                      data-testid={`order-history-row-${ord.id}`}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            className="tag"
                            style={{
                              backgroundColor:
                                ord.status === 'fulfilled'
                                  ? '#EDE9FE'
                                  : ord.status === 'paid'
                                  ? '#DCFCE7'
                                  : '#FEF3C7',
                              color:
                                ord.status === 'fulfilled'
                                  ? 'var(--primary)'
                                  : ord.status === 'paid'
                                  ? '#15803D'
                                  : '#B45309',
                              fontWeight: '700',
                            }}
                          >
                            {ord.status === 'fulfilled'
                              ? 'Đã bàn giao (Fulfilled)'
                              : ord.status === 'paid'
                              ? 'Đã thanh toán (Paid)'
                              : 'Chờ thanh toán (Pending)'}
                          </span>
                          <span className="demo-badge">DEMO</span>
                        </div>
                        <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: '0 0 2px 0' }}>
                          {prod ? prod.title : ord.productId}
                        </h4>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                          Không gian: <strong>{w ? w.name : ord.worldId}</strong> · Giá: {prod ? prod.priceVND.toLocaleString('vi-VN') : 0} VND · Cập nhật: {formatVietnamTime(ord.updatedAt)}
                        </div>
                      </div>

                      <Link
                        to={`/orders/${ord.id}`}
                        className="btn btn-primary"
                        style={{ fontSize: 'var(--text-xs)', padding: '8px 14px' }}
                        id={`open-order-btn-${ord.id}`}
                      >
                        <span>Chi tiết đơn & Tiến trình</span>
                        <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB: HỖ TRỢ & ĐỐI SOÁT (SUPPORT CASES) */}
      {activeTab === 'support' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <header>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <LifeBuoy size={20} color="var(--primary)" />
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', margin: 0 }}>
                Hồ sơ hỗ trợ & Đối soát ({userSupportCases.length})
              </h2>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Theo dõi minh bạch các yêu cầu hỗ trợ về quyền lợi hoặc đơn hàng.
            </p>
          </header>

          {userSupportCases.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center' }} data-testid="support-empty-state">
              <LifeBuoy size={40} color="var(--muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: '8px' }}>
                Chưa có yêu cầu hỗ trợ nào
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', maxWidth: '460px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
                Khi gặp vấn đề về đối soát quyền lợi chờ xác thực hoặc đơn hàng VieSHOP, bạn có thể mở yêu cầu hỗ trợ trực tiếp từ trang chi tiết đối tượng.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => openSection('benefits')}
                  className="btn btn-secondary"
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  Kiểm tra quyền lợi
                </button>
                <button
                  type="button"
                  onClick={() => openSection('orders')}
                  className="btn btn-secondary"
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  Xem đơn hàng
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} data-testid="support-cases-list">
              {userSupportCases.map((sc) => {
                const ben = sc.subjectType === 'benefit' ? state.benefits[sc.subjectId] : undefined;
                const ord = sc.subjectType === 'order' ? state.orders[sc.subjectId] : undefined;
                const prod = ord ? state.products[ord.productId] : undefined;

                return (
                  <article
                    key={sc.id}
                    className="card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                    data-testid={`support-case-card-${sc.id}`}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '560px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="tag"
                          style={{
                            backgroundColor:
                              sc.status === 'resolved'
                                ? '#DCFCE7'
                                : sc.status === 'investigating'
                                ? '#FEF3C7'
                                : sc.status === 'acknowledged'
                                ? '#DBEAFE'
                                : '#EDE9FE',
                            color:
                              sc.status === 'resolved'
                                ? '#15803D'
                                : sc.status === 'investigating'
                                ? '#B45309'
                                : sc.status === 'acknowledged'
                                ? '#1D4ED8'
                                : 'var(--primary)',
                            fontWeight: '700',
                          }}
                        >
                          {sc.status === 'resolved'
                            ? 'Đã có kết luận (Resolved)'
                            : sc.status === 'investigating'
                            ? 'Đang kiểm tra (Investigating)'
                            : sc.status === 'acknowledged'
                            ? 'Đã xác nhận (Acknowledged)'
                            : sc.status === 'closed'
                            ? 'Đã đóng (Closed)'
                            : 'Tiếp nhận (Open)'}
                        </span>
                        <span className="demo-badge">DEMO</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                          Mã: <code>{sc.id}</code>
                        </span>
                      </div>

                      <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: 0 }}>
                        {sc.subjectType === 'benefit'
                          ? `Đối soát: ${ben ? ben.title : sc.subjectId}`
                          : `Hỗ trợ đơn: ${prod ? prod.title : sc.subjectId}`}
                      </h4>

                      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                        <strong>Bước tiếp theo:</strong> {sc.nextAction}
                      </p>

                      {sc.resolution && (
                        <div style={{ fontSize: '11px', color: '#065F46', backgroundColor: '#ECFDF5', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                          <strong>Kết luận:</strong> {sc.resolution}
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/support/${sc.id}`}
                      className="btn btn-primary"
                      style={{ fontSize: 'var(--text-xs)', padding: '8px 16px' }}
                      id={`open-support-case-btn-${sc.id}`}
                      data-testid={`open-support-case-btn-${sc.id}`}
                    >
                      <span>Xem chi tiết hồ sơ</span>
                      <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                    </Link>
                  </article>
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
