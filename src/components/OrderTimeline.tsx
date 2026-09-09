import React from 'react';
import { Order } from '../domain/types';
import { ShoppingBag, CreditCard, PackageCheck, AlertCircle, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const formatVietnamTime = (isoString: string) => {
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

  const steps = [
    {
      id: 'pending',
      title: '1. Khởi tạo đơn hàng (Mô phỏng)',
      desc: 'Đơn hàng được tạo thành công với mã yêu cầu định danh duy nhất (requestId). Chưa ghi nhận thanh toán hay bàn giao.',
      icon: ShoppingBag,
      isCompleted: true, // Always completed if order exists
      isActive: order.status === 'pending',
    },
    {
      id: 'paid',
      title: '2. Thanh toán mô phỏng',
      desc: 'Xác nhận trạng thái thanh toán thử nghiệm. Lưu ý hiến pháp (§2.3): Đơn hàng đã thanh toán không đồng nghĩa với đã bàn giao vật phẩm.',
      icon: CreditCard,
      isCompleted: order.status === 'paid' || order.status === 'fulfilled',
      isActive: order.status === 'paid',
    },
    {
      id: 'fulfilled',
      title: '3. Bàn giao & Ghi nhận sở hữu',
      desc: 'Đơn vị phân phối hoàn tất giao vật phẩm. Chỉ sau bước này, vật phẩm mới chính thức được ghi nhận quyền sở hữu trong My World.',
      icon: PackageCheck,
      isCompleted: order.status === 'fulfilled',
      isActive: order.status === 'fulfilled',
    },
  ];

  const isAbnormal = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div
      className="card"
      style={{
        padding: '24px',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
      }}
      aria-label="Tiến trình trạng thái đơn hàng"
      data-testid={`order-timeline-${order.id}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: 0 }}>
          Tiến trình xử lý đơn hàng ({order.id})
        </h3>
        <span className="demo-badge">DEMO</span>
      </div>

      {isAbnormal ? (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <XCircle size={24} color="var(--danger)" />
          <div>
            <strong style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', display: 'block' }}>
              Đơn hàng ở trạng thái: {order.status.toUpperCase()}
            </strong>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: '#7F1D1D' }}>
              Đơn hàng này đã kết thúc xử lý hoặc được hoàn trả mô phỏng.
            </p>
          </div>
        </div>
      ) : (
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li
                key={step.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  position: 'relative',
                }}
                data-testid={`timeline-step-${step.id}`}
              >
                {/* Step Connector Line */}
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '36px',
                      left: '18px',
                      width: '2px',
                      bottom: '-12px',
                      backgroundColor: step.isCompleted ? 'var(--primary)' : 'var(--border)',
                      zIndex: 0,
                    }}
                    aria-hidden="true"
                  />
                )}

                {/* Step Icon */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: step.isCompleted ? 'var(--primary)' : 'var(--bg)',
                    color: step.isCompleted ? '#FFFFFF' : 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                    boxShadow: step.isActive ? '0 0 0 4px rgba(101, 81, 200, 0.2)' : 'none',
                  }}
                  aria-label={step.isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                >
                  <Icon size={18} />
                </div>

                {/* Step Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <h4
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: '700',
                        margin: 0,
                        color: step.isCompleted ? 'var(--ink)' : 'var(--muted)',
                      }}
                    >
                      {step.title}
                    </h4>
                    {step.isActive && (
                      <span
                        className="tag"
                        style={{
                          backgroundColor: '#EDE9FE',
                          color: 'var(--primary)',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                        }}
                      >
                        Hiện tại
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--muted)',
                      margin: '0 0 4px 0',
                      lineHeight: 1.5,
                    }}
                  >
                    {step.desc}
                  </p>
                  {step.isCompleted && (
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>
                      Cập nhật: {formatVietnamTime(order.updatedAt)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Constitutional Disclosure Callout */}
      <div
        style={{
          marginTop: '24px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <AlertCircle size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Nguyên tắc phân định (§2.3):</strong> Thanh toán mô phỏng tạo trạng thái `paid`. Bàn giao vật phẩm là hành động kiểm soát độc lập (`fulfilled`). Quyền sở hữu chỉ xuất hiện trong My World khi đơn hàng đã bàn giao thành công.
        </span>
      </div>
    </div>
  );
};
