import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { WorldHeader } from '../components/WorldHeader';
import {
  Tag,
  ArrowLeft,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ShopView: React.FC = () => {
  const { worldId } = useParams<{ worldId: string }>();
  const { state, dispatch } = useApp();

  const world = worldId ? state.worlds[worldId] : undefined;

  if (!world) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="card" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', padding: '40px 24px' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', marginBottom: '8px' }}>
            Không tìm thấy thế giới
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '24px' }}>
            Mã định danh <code>{worldId}</code> không tồn tại trong hệ thống.
          </p>
          <Link to="/worlds" className="btn btn-primary">
            Quay lại danh sách Worlds
          </Link>
        </div>
      </div>
    );
  }

  const worldProducts = Object.values(state.products).filter((p) => p.worldId === world.id);
  const worldOrders = Object.values(state.orders).filter((o) => o.worldId === world.id);

  const handleOrder = (productId: string) => {
    // Generate deterministic idempotency requestId for this purchase action
    const requestId = `req_${productId}_${state.fanProfile.id}`;

    dispatch({
      type: 'CREATE_ORDER',
      productId,
      requestId,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* World Header */}
      <WorldHeader world={world} />

      <div className="container" style={{ padding: '0 20px 60px 20px' }}>
        {/* Navigation & Back to World */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to={`/worlds/${world.id}`}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
            id="back-to-world-detail-btn"
          >
            <ArrowLeft size={14} />
            <span>Quay lại {world.name}</span>
          </Link>
          <Link
            to="/me"
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}
          >
            <span>My World</span>
          </Link>
        </div>

        {/* Page Header */}
        <header style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}>
              VIESHOP CONTEXTUAL COMMERCE
            </span>
            <span className="demo-badge">DEMO</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', margin: '0 0 6px 0' }}>
            Cửa hàng quà tặng lưu niệm {world.name}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 0, maxWidth: '640px', lineHeight: 1.6 }}>
            Vật phẩm thử nghiệm minh bạch số lượng và điều kiện. Không thu tiền thật, không yêu cầu thẻ ngân hàng hay địa chỉ giao dịch.
          </p>
        </header>

        {/* Domain Error Notice */}
        {state.lastError && (
          <div
            className="card"
            style={{
              padding: '16px 20px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
            role="alert"
          >
            <AlertTriangle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', display: 'block' }}>
                Không thể tạo đơn hàng: {state.lastError.code}
              </strong>
              <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: '#7F1D1D' }}>
                {state.lastError.message}
              </p>
              {state.lastError.actionableResolution && (
                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                  <strong>Hướng dẫn:</strong> {state.lastError.actionableResolution}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Product Catalog Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', marginBottom: '36px' }}>
          {worldProducts.map((product) => {
            const requiredBenefit = product.requiredBenefitId
              ? state.benefits[product.requiredBenefitId]
              : undefined;

            const isBenefitSatisfied =
              !product.requiredBenefitId ||
              (requiredBenefit && (requiredBenefit.status === 'eligible' || requiredBenefit.status === 'claimed'));

            const isOutOfStock = !product.isAvailable || product.stockCount <= 0;

            return (
              <article
                key={product.id}
                className="card"
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
                data-testid={`shop-product-card-${product.id}`}
              >
                <div>
                  <div
                    style={{
                      height: '140px',
                      backgroundColor: 'var(--bg)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--primary)',
                    }}
                  >
                    <Tag size={40} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', margin: 0 }}>
                      {product.title}
                    </h3>
                    <span className="demo-badge">DEMO</span>
                  </div>

                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
                    {product.priceVND.toLocaleString('vi-VN')} VND
                  </div>

                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '12px' }}>
                    Tồn kho thử nghiệm: <strong>{product.stockCount}</strong> sản phẩm · Mã: <code>{product.id}</code>
                  </div>

                  {/* Benefit Eligibility Verification & Explanation */}
                  {product.requiredBenefitId && (
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: isBenefitSatisfied ? '#ECFDF5' : '#FFFBEB',
                        border: isBenefitSatisfied ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        lineHeight: 1.5,
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ fontWeight: '700', color: isBenefitSatisfied ? '#065F46' : '#92400E', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isBenefitSatisfied ? <ShieldCheck size={14} /> : <Lock size={14} />}
                        <span>
                          {isBenefitSatisfied
                            ? 'Đủ điều kiện quyền lợi mua sớm'
                            : 'Yêu cầu quyền lợi hội viên chưa thỏa mãn'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 6px 0', color: 'var(--ink)' }}>
                        Yêu cầu quyền: <strong>{requiredBenefit ? requiredBenefit.title : product.requiredBenefitId}</strong>
                        {requiredBenefit && ` · Trạng thái: ${requiredBenefit.status.toUpperCase()}`}
                      </p>
                      {!isBenefitSatisfied && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: '#92400E' }}>
                            {requiredBenefit?.status === 'pending'
                              ? 'Quyền lợi của bạn hiện đang ở trạng thái chờ đối soát (pending). Chưa thể đặt mua vật phẩm này.'
                              : 'Bạn cần có tư cách hội viên và quyền lợi hợp lệ để mua sản phẩm này.'}
                          </span>
                          <Link
                            to={`/benefits/${product.requiredBenefitId}`}
                            style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}
                          >
                            Xem điều kiện đối soát quyền lợi →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Simulated Order Button with Constitutional Confirmation */}
                <div>
                  <button
                    type="button"
                    disabled={isOutOfStock || !isBenefitSatisfied}
                    onClick={() => handleOrder(product.id)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: 'var(--text-sm)',
                      opacity: isOutOfStock || !isBenefitSatisfied ? 0.6 : 1,
                      cursor: isOutOfStock || !isBenefitSatisfied ? 'not-allowed' : 'pointer',
                    }}
                    id={`order-product-btn-${product.id}`}
                    data-testid={`order-product-btn-${product.id}`}
                  >
                    {isOutOfStock
                      ? 'Hết hàng trong kho'
                      : !isBenefitSatisfied
                      ? 'Mô phỏng đặt hàng (Chưa đủ điều kiện)'
                      : 'Mô phỏng đặt hàng'}
                  </button>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', textAlign: 'center', marginTop: '6px' }}>
                    Không thu phí · Không yêu cầu thông tin thanh toán
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Recent Orders Section */}
        {worldOrders.length > 0 && (
          <section aria-label="Đơn hàng của bạn trong thế giới này">
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '800', marginBottom: '14px' }}>
              Đơn hàng gần đây tại {world.name} ({worldOrders.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {worldOrders.map((ord) => {
                const prod = state.products[ord.productId];
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
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}>
                          Trạng thái: {ord.status.toUpperCase()}
                        </span>
                        <span className="demo-badge">DEMO</span>
                      </div>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', margin: '0 0 2px 0' }}>
                        {prod ? prod.title : ord.productId}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        Mã đơn: <code>{ord.id}</code>
                      </span>
                    </div>

                    <Link
                      to={`/orders/${ord.id}`}
                      className="btn btn-primary"
                      style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
                      id={`view-order-btn-${ord.id}`}
                    >
                      <span>Xem tiến trình đơn hàng</span>
                      <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
