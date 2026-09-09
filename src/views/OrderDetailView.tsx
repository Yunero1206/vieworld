import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { OrderTimeline } from '../components/OrderTimeline';
import {
  CreditCard,
  PackageCheck,
  ArrowLeft,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  LifeBuoy,
} from 'lucide-react';

export const OrderDetailView: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { state, dispatch } = useApp();

  const order = orderId ? state.orders[orderId] : undefined;
  const product = order ? state.products[order.productId] : undefined;
  const world = order ? state.worlds[order.worldId] : undefined;

  const formatVietnamTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  if (!order) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="card" data-testid="order-not-found-recovery" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', padding: '40px 24px' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', marginBottom: '8px' }}>
            Không tìm thấy đơn hàng
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '24px', lineHeight: 1.6 }}>
            Mã đơn hàng <code>{orderId}</code> không tồn tại trong phiên thử nghiệm hiện tại của bạn.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/me" className="btn btn-primary">
              <ArrowLeft size={16} />
              <span>Về My World</span>
            </Link>
            <Link to="/worlds" className="btn btn-secondary">
              Khám phá Worlds
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px 20px 60px 20px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          to="/me"
          className="btn btn-secondary"
          style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
          id="order-back-to-myworld-btn"
        >
          <ArrowLeft size={14} />
          <span>Quay lại My World</span>
        </Link>
        {world && (
          <Link
            to={`/worlds/${world.id}/shop`}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
          >
            <span>Cửa hàng {world.name}</span>
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}>
              CHI TIẾT ĐƠN HÀNG VIESHOP
            </span>
            <span className="demo-badge">DEMO</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: '0 0 8px 0' }}>
            Đơn hàng #{order.id}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
            Hóa đơn thử nghiệm · Không có giao dịch thương mại thực tế.
          </p>
        </header>

        {/* Order Receipt Summary Card */}
        <section
          className="card"
          style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
          aria-label="Thông tin hóa đơn chi tiết"
          data-testid="order-receipt-summary"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <Receipt size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: '0 0 4px 0' }}>
                  {product ? product.title : order.productId}
                </h3>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Không gian: <strong>{world ? world.name : order.worldId}</strong> · Mã định danh yêu cầu: <code>{order.requestId}</code>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              {order.status === 'pending' && (
                <span
                  className="tag"
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    fontWeight: '700',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                  }}
                  data-testid="order-status-badge"
                >
                  Chờ thanh toán (Pending)
                </span>
              )}
              {order.status === 'paid' && (
                <span
                  className="tag"
                  style={{
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    fontWeight: '700',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                  }}
                  data-testid="order-status-badge"
                >
                  Đã thanh toán (Paid)
                </span>
              )}
              {order.status === 'fulfilled' && (
                <span
                  className="tag"
                  style={{
                    backgroundColor: '#EDE9FE',
                    color: 'var(--primary)',
                    fontWeight: '700',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                  }}
                  data-testid="order-status-badge"
                >
                  Đã bàn giao (Fulfilled)
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Số tiền (Mô phỏng)</span>
              <strong style={{ fontSize: 'var(--text-lg)', color: 'var(--primary)' }}>
                {product ? product.priceVND.toLocaleString('vi-VN') : '0'} VND
              </strong>
            </div>

            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Nguồn đặt hàng</span>
              <code style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>{order.sourceRef}</code>
            </div>

            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'block' }}>Cập nhật lần cuối</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                {formatVietnamTime(order.updatedAt)}
              </span>
            </div>
          </div>

          {/* Interactive Simulation Action */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Công cụ review trạng thái đơn hàng
            </span>

            {order.status === 'pending' && (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SIMULATE_PAYMENT',
                    orderId: order.id,
                    requestId: order.requestId,
                  })
                }
                className="btn btn-primary"
                style={{ fontSize: 'var(--text-sm)', padding: '10px 20px', gap: '8px' }}
                id={`simulate-payment-btn-${order.id}`}
                data-testid="simulate-payment-btn"
              >
                <CreditCard size={16} />
                <span>Mô phỏng: Thanh toán đơn hàng</span>
              </button>
            )}

            {order.status === 'paid' && (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SIMULATE_FULFILMENT',
                    orderId: order.id,
                  })
                }
                className="btn btn-primary"
                style={{ fontSize: 'var(--text-sm)', padding: '10px 20px', gap: '8px' }}
                id={`simulate-fulfilment-btn-${order.id}`}
                data-testid="simulate-fulfilment-btn"
              >
                <PackageCheck size={16} />
                <span>Mô phỏng: Xác nhận bàn giao vật phẩm</span>
              </button>
            )}

            {order.status === 'fulfilled' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: '#15803D', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} />
                  <span>Đã ghi nhận quyền sở hữu</span>
                </span>
                <Link to="/me" className="btn btn-secondary" style={{ fontSize: 'var(--text-xs)', padding: '8px 14px' }}>
                  Xem trong My World
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Order Timeline Stepper */}
        <OrderTimeline order={order} />

        {/* Support Section for this Order */}
        <section
          className="card"
          style={{ padding: '20px 24px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          aria-label="Hỗ trợ đơn hàng"
        >
          {Object.values(state.supportCases).find(
            (c) => c.subjectId === order.id && c.status !== 'closed'
          ) ? (
            (() => {
              const activeCase = Object.values(state.supportCases).find(
                (c) => c.subjectId === order.id && c.status !== 'closed'
              )!;
              return (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                  data-testid="order-active-case-card"
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <LifeBuoy size={16} color="var(--primary)" />
                      <strong style={{ fontSize: 'var(--text-sm)' }}>
                        Đang có hồ sơ hỗ trợ cho đơn hàng này
                      </strong>
                      <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontSize: '11px', fontWeight: '700' }}>
                        {activeCase.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                      Mã hồ sơ: <code>{activeCase.id}</code> · {activeCase.nextAction}
                    </div>
                  </div>
                  <Link
                    to={`/support/${activeCase.id}`}
                    className="btn btn-primary"
                    style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
                    id="view-order-support-case-btn"
                    data-testid="view-order-support-case-btn"
                  >
                    <span>Xem tiến trình hồ sơ →</span>
                  </Link>
                </div>
              );
            })()
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <strong style={{ fontSize: 'var(--text-sm)', display: 'block', marginBottom: '2px' }}>
                  Cần hỗ trợ hoặc thắc mắc về đơn hàng này?
                </strong>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Gửi yêu cầu hỗ trợ mô phỏng để đội ngũ kiểm tra trạng thái đơn hàng.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'OPEN_SUPPORT_CASE',
                    subjectType: 'order',
                    subjectId: order.id,
                  })
                }
                className="btn btn-secondary"
                style={{ fontSize: 'var(--text-xs)', padding: '8px 16px', gap: '6px' }}
                id="open-order-support-btn"
                data-testid="open-order-support-btn"
              >
                <LifeBuoy size={14} />
                <span>Yêu cầu hỗ trợ đơn hàng</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
