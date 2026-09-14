import React, { useState } from 'react';
import { PRESET_ACCESSORIES, WardrobeAccessory } from '../domain/types';
import { Sparkles, Check, ShieldCheck } from 'lucide-react';
import { AvatarRenderer } from './AvatarRenderer';

export interface WardrobeCustomizerProps {
  equippedAccessoryId?: string;
  onEquip: (accessoryId: string) => void;
}

export const WardrobeCustomizer: React.FC<WardrobeCustomizerProps> = ({
  equippedAccessoryId = 'earpiece_glow',
  onEquip,
}) => {
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string>(equippedAccessoryId);
  const [saveConfirmation, setSaveConfirmation] = useState<string | null>(null);

  const selectedAccessory =
    PRESET_ACCESSORIES.find((a) => a.id === selectedAccessoryId) || PRESET_ACCESSORIES[0];
  const isCurrentlyEquipped = equippedAccessoryId === selectedAccessoryId;

  const handleSave = () => {
    onEquip(selectedAccessoryId);
    setSaveConfirmation(`Đã lưu phụ kiện '${selectedAccessory.name}' vào diện mạo của bạn.`);
    setTimeout(() => setSaveConfirmation(null), 3500);
  };

  return (
    <div
      className="card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: 'var(--surface)',
      }}
      aria-label="Tủ đồ phụ kiện Avatar"
      data-testid="wardrobe-customizer"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--primary)" />
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: '800', margin: 0 }}>
            Tủ đồ phụ kiện Avatar (3 mẫu miễn phí)
          </h3>
          <span className="demo-badge">DEMO</span>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          Biểu đạt tự do · Không thu phí
        </span>
      </div>

      {/* Main interactive area: Avatar Preview + Accessories Shelf */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* Left: 2D Avatar Mini Preview with live accessory visual */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: 'var(--stage)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: '220px',
            position: 'relative',
          }}
          data-testid="avatar-preview-box"
        >
          <AvatarRenderer
            role="fan"
            accessoryId={selectedAccessoryId}
            size="preview"
            displayName="Bạn"
            testId="avatar-preview-renderer"
          />

          <span style={{ fontSize: 'var(--text-xs)', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px' }}>
            Xem trước: <strong>{selectedAccessory.name}</strong>
          </span>
        </div>

        {/* Right: Shelf selection cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PRESET_ACCESSORIES.map((acc: WardrobeAccessory) => {
            const isSelected = selectedAccessoryId === acc.id;
            const isEquipped = equippedAccessoryId === acc.id;

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccessoryId(acc.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? '#F5F3FF' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                data-testid={`accessory-card-${acc.id}`}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedAccessoryId(acc.id);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: acc.previewColor,
                      boxShadow: `0 0 8px ${acc.previewColor}`,
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: 'var(--ink)' }}>
                      {acc.name}
                    </strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                      {acc.description}
                    </span>
                  </div>
                </div>

                {isEquipped && (
                  <span
                    className="tag"
                    style={{ backgroundColor: '#DCFCE7', color: '#166534', fontWeight: '700' }}
                    id={`equipped-badge-${acc.id}`}
                    data-testid={`equipped-badge-${acc.id}`}
                  >
                    <Check size={12} style={{ marginRight: '4px' }} />
                    Đang đeo
                  </span>
                )}
              </div>
            );
          })}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={isCurrentlyEquipped}
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px 16px', fontSize: 'var(--text-sm)' }}
              id="save-wardrobe-button"
            >
              {isCurrentlyEquipped ? 'Đang sử dụng phụ kiện này' : `Lưu lựa chọn '${selectedAccessory.name}'`}
            </button>
          </div>

          {saveConfirmation && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              data-testid="wardrobe-save-notice"
            >
              <Check size={14} />
              <span>{saveConfirmation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Constitutional Non-Negotiable Disclosure (§3, P06) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          backgroundColor: 'var(--bg)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
        }}
      >
        <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span>
          Phụ kiện tủ đồ hoàn toàn miễn phí, mang tính biểu đạt tự do cá nhân. Thay đổi phụ kiện <strong>tuyệt đối không ảnh hưởng đến điều kiện tham dự, chứng nhận hay quyền lợi hội viên</strong>.
        </span>
      </div>
    </div>
  );
};
