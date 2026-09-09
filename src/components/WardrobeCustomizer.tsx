import React, { useState } from 'react';
import { PRESET_ACCESSORIES, WardrobeAccessory } from '../domain/types';
import { Sparkles, Check, ShieldCheck } from 'lucide-react';

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
          {/* Stylized 2D Vector Avatar Mini Graphic */}
          <svg
            width="140"
            height="160"
            viewBox="0 0 200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Minh họa xem trước diện mạo avatar"
          >
            {/* Stage aura */}
            <circle cx="100" cy="110" r="65" fill="#6551C8" opacity="0.3" />

            {/* Torso */}
            <path d="M55 210C55 175 75 160 100 160C125 160 145 175 145 210V220H55V210Z" fill="#201E3C" stroke="#6551C8" strokeWidth="3" />
            <path d="M75 160L90 195L100 180L110 195L125 160" stroke="#A9E5D4" strokeWidth="2.5" strokeLinecap="round" />

            {/* Neck & Head */}
            <rect x="90" y="130" width="20" height="35" rx="6" fill="#FCD34D" />
            <circle cx="100" cy="105" r="42" fill="#FDE68A" stroke="#20212B" strokeWidth="2.5" />

            {/* Hair */}
            <path d="M60 100C60 65 75 55 100 55C125 55 140 65 140 100C130 90 120 90 100 95C80 90 70 90 60 100Z" fill="#312E81" />

            {/* Eyes */}
            <ellipse cx="86" cy="105" rx="4" ry="5.5" fill="#1E1B4B" />
            <ellipse cx="114" cy="105" rx="4" ry="5.5" fill="#1E1B4B" />
            <circle cx="88" cy="103" r="1.5" fill="#FFFFFF" />
            <circle cx="116" cy="103" r="1.5" fill="#FFFFFF" />

            {/* Smile */}
            <path d="M94 122C97 125 103 125 106 122" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />

            {/* DYNAMIC ACCESSORY VECTOR DRAWINGS */}
            {selectedAccessoryId === 'earpiece_glow' && (
              <g data-testid="preview-accessory-earpiece">
                <circle cx="140" cy="108" r="6" fill="#10B981" />
                <circle cx="140" cy="108" r="10" stroke="#10B981" strokeWidth="1.5" opacity="0.7" />
              </g>
            )}

            {selectedAccessoryId === 'visor_neon' && (
              <g data-testid="preview-accessory-visor">
                <rect x="74" y="98" width="52" height="14" rx="4" fill="rgba(139, 92, 246, 0.7)" stroke="#A78BFA" strokeWidth="2" />
                <line x1="74" y1="105" x2="126" y2="105" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
              </g>
            )}

            {selectedAccessoryId === 'accessory_classic' && (
              <g data-testid="preview-accessory-star">
                <polygon points="100,166 103,174 111,174 105,178 107,186 100,181 93,186 95,178 89,174 97,174" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
              </g>
            )}
          </svg>

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
