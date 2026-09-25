import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Notification } from '../domain/types';
import {
  CheckCheck,
  Settings,
  Calendar,
  Sparkles,
  Package,
  LifeBuoy,
  Bell,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Inbox as InboxIcon,
} from 'lucide-react';

type FilterTab = 'all' | 'session' | 'capsule' | 'order' | 'support' | 'unread';

export const InboxView: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showPreferences, setShowPreferences] = useState(false);

  const notifications = Object.values(state.notifications || {}).sort(
    (a, b) =>
      new Date(b.createdAt || b.updatedAt).getTime() -
      new Date(a.createdAt || a.updatedAt).getTime()
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.isRead;
    if (activeTab === 'all') return true;
    const cat = notif.category || notif.type.replace('_reminder', '').replace('_ready', '').replace('_update', '');
    return cat.includes(activeTab);
  });

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId: id });
  };

  const handleMarkAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };

  const handleNavigateTarget = (notif: Notification) => {
    if (!notif.isRead) {
      dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId: notif.id });
    }
    if (notif.targetRoute) {
      navigate(notif.targetRoute);
    }
  };

  const handleTogglePreference = (key: keyof typeof state.notificationPreferences) => {
    const current = state.notificationPreferences?.[key] ?? true;
    dispatch({
      type: 'UPDATE_NOTIFICATION_PREFERENCES',
      preferences: {
        [key]: !current,
      },
    });
  };

  const getAttributionBadge = (attribution?: Notification['sourceAttribution']) => {
    switch (attribution) {
      case 'organizer':
        return { label: 'Ban tổ chức', bg: '#EFF6FF', color: '#1D4ED8' };
      case 'session_system':
        return { label: 'Sân khấu trực tiếp', bg: '#F5F3FF', color: '#6D28D9' };
      case 'platform':
      default:
        return { label: 'Hệ thống VieWorld', bg: '#F3F4F6', color: '#374151' };
    }
  };

  const getCategoryIcon = (notif: Notification) => {
    const cat = notif.category || notif.type;
    if (cat.includes('session')) return <Calendar size={18} color="var(--primary)" />;
    if (cat.includes('capsule')) return <Sparkles size={18} color="#D97706" />;
    if (cat.includes('order')) return <Package size={18} color="#059669" />;
    if (cat.includes('support')) return <LifeBuoy size={18} color="#DC2626" />;
    return <Bell size={18} color="var(--muted)" />;
  };

  const getNotificationActionLabel = (notif: Notification) => {
    const route = notif.targetRoute || '';
    if (route.includes('/sessions') || route.includes('session=')) return 'Xem phiên trực tiếp';
    if (route.includes('/orders') || route.includes('panel=bag') || route.includes('/cart')) return 'Xem đơn hàng';
    if (route.includes('/support')) return 'Xem vụ việc hỗ trợ';
    if (route.includes('/benefits') || route.includes('panel=membership')) return 'Xem quyền lợi';
    if (route.includes('panel=capsules') || route.includes('/me')) return 'Xem kỷ niệm';
    if (route.includes('/shop')) return 'Ghé VieSHOP';
    return 'Xem chi tiết';
  };

  const formatNotificationTime = (isoTime: string) => {
    try {
      const date = new Date(isoTime);
      return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoTime;
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 20px 60px 20px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', margin: 0, color: 'var(--ink)' }}>
              Hộp thư thông báo
            </h1>
            {unreadCount > 0 && (
              <span
                className="tag"
                data-testid="inbox-unread-count-tag"
                style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF', fontWeight: '700' }}
              >
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
            Nhắc nhở phiên giao lưu, thông báo đơn hàng và kết quả đối soát minh bạch.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleMarkAllAsRead}
              data-testid="mark-all-read-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)' }}
            >
              <CheckCheck size={16} />
              <span>Đánh dấu đã đọc tất cả</span>
            </button>
          )}

          <button
            type="button"
            className={showPreferences ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setShowPreferences(!showPreferences)}
            data-testid="toggle-preferences-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)' }}
          >
            <Settings size={16} />
            <span>{showPreferences ? 'Đóng cài đặt' : 'Cài đặt nhận tin'}</span>
          </button>
        </div>
      </div>

      {/* Truthful System Disclosures (Collapsible details to prioritize notifications list) */}
      <details
        className="card"
        style={{
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: 'var(--surface)',
          borderLeft: '4px solid var(--primary)',
          cursor: 'pointer',
        }}
      >
        <summary
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--primary)',
            fontWeight: '700',
            fontSize: 'var(--text-xs)',
            outline: 'none',
          }}
        >
          <ShieldCheck size={16} />
          <span>CAM KẾT MINH BẠCH &amp; BẢO VỆ QUYỀN RIÊNG TƯ (Nhấn để xem)</span>
        </summary>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.6, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          • <strong>Thông báo cục bộ:</strong> 100% thông báo diễn ra in-app. Không yêu cầu quyền Browser Push, không thu thập email hay số điện thoại của fan.
          <br />
          • <strong>Không giả lập tin nhắn riêng tư:</strong> Mọi thông báo đều xuất phát từ sự kiện hệ thống hoặc ban tổ chức. Nghệ sĩ ảo không gửi tin nhắn cá nhân 1-1 giả tạo.
        </div>
      </details>

      {/* Preferences Subpanel */}
      {showPreferences && (
        <section
          aria-label="Cài đặt thông báo"
          className="card"
          data-testid="notification-preferences-panel"
          style={{ padding: '24px', marginBottom: '24px', backgroundColor: '#FAF9F6', border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: 0, color: 'var(--ink)' }}>
              Tùy chọn nhận thông báo cục bộ
            </h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Tự động lưu vào bộ nhớ trình duyệt</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Session Reminders */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: 'var(--ink)' }}>
                  Nhắc nhở sự kiện & Phiên trực tiếp
                </strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Nhận thông báo khi giữ chỗ (RSVP), khi sảnh chờ mở và khi phiên giao lưu bắt đầu.
                </span>
              </div>
              <label className="switch" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  data-testid="pref-session-reminders"
                  checked={state.notificationPreferences?.sessionReminders ?? true}
                  onChange={() => handleTogglePreference('sessionReminders')}
                />
                <span style={{ marginLeft: '8px', fontSize: 'var(--text-xs)', fontWeight: '600', color: state.notificationPreferences?.sessionReminders ? 'var(--primary)' : 'var(--muted)' }}>
                  {state.notificationPreferences?.sessionReminders ? 'Bật' : 'Tắt'}
                </span>
              </label>
            </div>

            {/* Capsule Ready */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: 'var(--ink)' }}>
                  Kỷ vật Moment Capsule
                </strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Thông báo khi kỷ vật ghi nhận tham gia phiên trực tiếp được tạo và lưu trữ trong My World.
                </span>
              </div>
              <label className="switch" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  data-testid="pref-capsule-ready"
                  checked={state.notificationPreferences?.capsuleReady ?? true}
                  onChange={() => handleTogglePreference('capsuleReady')}
                />
                <span style={{ marginLeft: '8px', fontSize: 'var(--text-xs)', fontWeight: '600', color: state.notificationPreferences?.capsuleReady ? 'var(--primary)' : 'var(--muted)' }}>
                  {state.notificationPreferences?.capsuleReady ? 'Bật' : 'Tắt'}
                </span>
              </label>
            </div>

            {/* Support Updates */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: 'var(--ink)' }}>
                  Hồ sơ hỗ trợ & Đối soát
                </strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Cập nhật tiến trình xác minh, kết luận hồ sơ và đồng bộ quyền lợi từ ban tổ chức.
                </span>
              </div>
              <label className="switch" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  data-testid="pref-support-updates"
                  checked={state.notificationPreferences?.supportUpdates ?? true}
                  onChange={() => handleTogglePreference('supportUpdates')}
                />
                <span style={{ marginLeft: '8px', fontSize: 'var(--text-xs)', fontWeight: '600', color: state.notificationPreferences?.supportUpdates ? 'var(--primary)' : 'var(--muted)' }}>
                  {state.notificationPreferences?.supportUpdates ? 'Bật' : 'Tắt'}
                </span>
              </label>
            </div>

            {/* Order Updates */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: 'var(--ink)' }}>
                  Cập nhật đơn hàng VieSHOP
                </strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Thông báo xác nhận đơn hàng mô phỏng và bàn giao vật phẩm vào Bộ sưu tập.
                </span>
              </div>
              <label className="switch" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  data-testid="pref-order-updates"
                  checked={state.notificationPreferences?.orderUpdates ?? true}
                  onChange={() => handleTogglePreference('orderUpdates')}
                />
                <span style={{ marginLeft: '8px', fontSize: 'var(--text-xs)', fontWeight: '600', color: state.notificationPreferences?.orderUpdates ? 'var(--primary)' : 'var(--muted)' }}>
                  {state.notificationPreferences?.orderUpdates ? 'Bật' : 'Tắt'}
                </span>
              </label>
            </div>

            {/* Promotional (Separated from Event Reminders) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: 'var(--ink)' }}>
                  Thông tin quảng bá & Tin tức (Tách biệt)
                </strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Tách riêng thông tin quảng bá, ra mắt vật phẩm và chương trình mới khỏi nhắc nhở lịch diễn.
                </span>
              </div>
              <label className="switch" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  data-testid="pref-promotional"
                  checked={state.notificationPreferences?.promotional ?? false}
                  onChange={() => handleTogglePreference('promotional')}
                />
                <span style={{ marginLeft: '8px', fontSize: 'var(--text-xs)', fontWeight: '600', color: state.notificationPreferences?.promotional ? 'var(--primary)' : 'var(--muted)' }}>
                  {state.notificationPreferences?.promotional ? 'Bật' : 'Tắt'}
                </span>
              </label>
            </div>
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <div
        role="tablist"
        aria-label="Danh mục thông báo"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px',
          marginBottom: '20px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          className={activeTab === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
        >
          Tất cả ({notifications.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'unread'}
          onClick={() => setActiveTab('unread')}
          className={activeTab === 'unread' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
        >
          Chưa đọc ({unreadCount})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'session'}
          onClick={() => setActiveTab('session')}
          className={activeTab === 'session' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
        >
          Sự kiện & Phiên
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'capsule'}
          onClick={() => setActiveTab('capsule')}
          className={activeTab === 'capsule' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
        >
          Moment Capsule
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'order'}
          onClick={() => setActiveTab('order')}
          className={activeTab === 'order' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
        >
          Đơn hàng
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'support'}
          onClick={() => setActiveTab('support')}
          className={activeTab === 'support' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
        >
          Hỗ trợ & Đối soát
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div
          className="card"
          data-testid="empty-notifications-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: 'var(--surface)',
            border: '1px dashed var(--border)',
          }}
        >
          <InboxIcon size={44} color="var(--muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: '0 0 6px 0', color: 'var(--ink)' }}>
            Không có thông báo nào
          </h3>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--muted)', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            {activeTab === 'unread'
              ? 'Tất cả thông báo đều đã được đọc. Hãy khám phá các thế giới nghệ sĩ để nhận thêm tin tức mới.'
              : 'Hiện chưa có thông báo nào trong danh mục này.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} data-testid="notifications-list">
          {filteredNotifications.map((notif) => {
            const badge = getAttributionBadge(notif.sourceAttribution);

            return (
              <article
                key={notif.id}
                className="card"
                data-testid={`notification-item-${notif.id}`}
                style={{
                  padding: '18px 20px',
                  backgroundColor: notif.isRead ? 'var(--surface)' : '#FBF9FE',
                  border: notif.isRead ? '1px solid var(--border)' : '1px solid var(--primary)',
                  boxShadow: notif.isRead ? 'none' : '0 2px 8px rgba(101, 81, 200, 0.08)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Left Icon */}
                <div
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: notif.isRead ? '#F3F4F6' : '#EDE9FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getCategoryIcon(notif)}
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    {/* Attribution Tag */}
                    <span
                      className="tag"
                      style={{
                        backgroundColor: badge.bg,
                        color: badge.color,
                        fontWeight: '700',
                        fontSize: '11px',
                        padding: '2px 8px',
                      }}
                    >
                      {badge.label}
                    </span>

                    {/* Demo Tag */}
                    <span className="demo-badge">DEMO</span>

                    {/* Unread Indicator */}
                    {!notif.isRead && (
                      <span
                        data-testid="unread-indicator"
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          display: 'inline-block',
                        }}
                        title="Chưa đọc"
                      />
                    )}

                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginLeft: 'auto' }}>
                      {formatNotificationTime(notif.createdAt || notif.updatedAt)}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: notif.isRead ? '600' : '700',
                      color: 'var(--ink)',
                      margin: '0 0 6px 0',
                    }}
                  >
                    {notif.title}
                  </h3>

                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--muted)',
                      lineHeight: 1.5,
                    }}
                  >
                    {notif.body}
                  </p>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {notif.targetRoute && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleNavigateTarget(notif)}
                        data-testid={`notif-action-btn-${notif.id}`}
                        style={{
                          fontSize: 'var(--text-xs)',
                          padding: '6px 14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{getNotificationActionLabel(notif)}</span>
                        <ArrowRight size={14} />
                      </button>
                    )}

                    {!notif.isRead && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        data-testid={`mark-read-btn-${notif.id}`}
                        style={{
                          fontSize: 'var(--text-xs)',
                          padding: '6px 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Đã đọc</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
