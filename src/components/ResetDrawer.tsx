import React, { useState } from 'react';
import { Sliders, RefreshCw, Layers, AlertCircle, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmDialog } from './ConfirmDialog';
import { TenantId } from '../domain/types';
import { scenarioPresets } from '../data/fixtures';

export interface ResetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetDrawer: React.FC<ResetDrawerProps> = ({ isOpen, onClose }) => {
  const {
    state,
    isMemoryFallback,
    loadScenarioPreset,
    resetActiveTenant,
    setTenant,
  } = useApp();

  const [confirmAction, setConfirmAction] = useState<{
    type: 'scenario' | 'reset';
    scenarioKey?: keyof typeof scenarioPresets;
  } | null>(null);

  if (!isOpen) return null;

  const scenarios: { key: keyof typeof scenarioPresets; label: string; desc: string }[] = [
    { key: 'newFan', label: '1. Fan Mới (New Fan)', desc: 'Chưa theo dõi, chưa có hội viên hay đơn hàng.' },
    { key: 'activeMember', label: '2. Hội Viên Hoạt Động (Active Member)', desc: 'Đã theo dõi Artist A, hội viên active, quyền lợi replay sẵn sàng.' },
    { key: 'benefitPending', label: '3. Quyền Lợi Chờ Duyệt (Benefit Pending)', desc: 'Hội viên active nhưng các quyền lợi đều đang chờ đối soát.' },
    { key: 'orderPaid', label: '4. Đã Thanh Toán (Order Paid)', desc: 'Đã hoàn tất thanh toán mô phỏng một đơn hàng huy hiệu pin.' },
    { key: 'sessionDisconnected', label: '5. Mất Kết Nối (Session Disconnected)', desc: 'Nghệ sĩ bị mất kết nối, kiểm chứng trạng thái hiện diện trung thực.' },
    { key: 'replayExpired', label: '6. Replay Hết Hạn (Replay Expired)', desc: 'Phiên đã kết thúc và thời hạn xem lại bản ghi đã hết.' },
  ];

  const handleApplyScenario = (key: keyof typeof scenarioPresets) => {
    setConfirmAction({ type: 'scenario', scenarioKey: key });
  };

  const handleTriggerReset = () => {
    setConfirmAction({ type: 'reset' });
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'scenario' && confirmAction.scenarioKey) {
      loadScenarioPreset(confirmAction.scenarioKey);
    } else if (confirmAction.type === 'reset') {
      resetActiveTenant();
    }
    setConfirmAction(null);
    onClose();
  };

  return (
    <>
      <div
        className="drawer-overlay"
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(21, 20, 38, 0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 1500,
        }}
      />

      <aside
        className="reset-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1510,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="var(--primary)" />
            <h2 id="drawer-title" style={{ fontSize: 'var(--text-lg)', fontWeight: '700' }}>
              Bảng điều khiển thử nghiệm
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng điều khiển"
            id="close-drawer-btn"
            style={{ color: 'var(--muted)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Storage Health Status */}
        <section style={{ marginBottom: '24px', padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--muted)' }}>TRẠNG THÁI LƯU TRỮ</span>
            <span
              className="tag"
              style={{
                backgroundColor: isMemoryFallback ? 'var(--danger-bg)' : '#ECFDF5',
                color: isMemoryFallback ? 'var(--danger)' : '#065F46',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isMemoryFallback ? <AlertCircle size={12} /> : <Check size={12} />}
              {isMemoryFallback ? 'Bộ nhớ tạm (In-Memory)' : 'LocalStorage V1'}
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            {isMemoryFallback
              ? 'Trình duyệt từ chối lưu trữ hoặc hết hạn ngạch. Dữ liệu sẽ mất khi đóng tab.'
              : 'Dữ liệu được lưu trữ an toàn trong namespace trình duyệt của bạn.'}
          </p>
        </section>

        {/* Tenant Configuration Switcher */}
        <section style={{ marginBottom: '24px' }}>
          <label htmlFor="tenant-select" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--muted)', marginBottom: '8px' }}>
            KHÔNG GIAN NỀN TẢNG (TENANT)
          </label>
          <select
            id="tenant-select"
            value={state.activeTenantId}
            onChange={(e) => setTenant(e.target.value as TenantId)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              color: 'var(--ink)',
            }}
          >
            <option value="vieworld-demo">VieWorld (Không gian chính thức)</option>
            <option value="mfan-demo">MFan (Cấu hình minh họa di động)</option>
            <option value="fanme-demo">FanMe (Cấu hình minh họa độc lập)</option>
          </select>
        </section>

        {/* Named Scenario Presets */}
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Layers size={16} color="var(--primary)" />
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '700' }}>Kịch bản mẫu (§5.4)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scenarios.map((sc) => (
              <button
                key={sc.key}
                type="button"
                onClick={() => handleApplyScenario(sc.key)}
                id={`scenario-btn-${sc.key}`}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
              >
                <div style={{ fontWeight: '600', fontSize: 'var(--text-sm)', marginBottom: '2px', color: 'var(--ink)' }}>
                  {sc.label}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  {sc.desc}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Reset Action */}
        <section style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={handleTriggerReset}
            id="reset-tenant-btn"
            className="btn"
            style={{
              width: '100%',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid #F8B4BD',
            }}
          >
            <RefreshCw size={16} />
            <span>Thiết lập lại không gian '{state.activeTenantId}'</span>
          </button>
          <p style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', marginTop: '8px' }}>
            Chỉ xóa dữ liệu của tenant được chọn. Không gọi localStorage.clear().
          </p>
        </section>
      </aside>

      {/* Confirmation Dialog for Scenarios and Resets */}
      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        title={
          confirmAction?.type === 'reset'
            ? `Xác nhận thiết lập lại không gian ${state.activeTenantId}?`
            : `Áp dụng kịch bản mẫu '${confirmAction?.scenarioKey}'?`
        }
        description={
          confirmAction?.type === 'reset'
            ? `Toàn bộ lịch sử theo dõi, đơn hàng, tham gia và quyền lợi của không gian '${state.activeTenantId}' sẽ trở về trạng thái ban đầu. Dữ liệu của các không gian khác và trình duyệt sẽ được giữ nguyên hoàn toàn.`
            : `Dữ liệu hiện tại trong không gian '${state.activeTenantId}' sẽ được thay thế bằng dữ liệu của kịch bản này. Bạn có thể thiết lập lại bất cứ lúc nào.`
        }
        confirmLabel={confirmAction?.type === 'reset' ? 'Thiết lập lại ngay' : 'Áp dụng kịch bản'}
        isDestructive={confirmAction?.type === 'reset'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
};
