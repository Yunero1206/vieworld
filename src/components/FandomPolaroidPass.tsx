import { useState } from 'react';
import { X, Copy, Check, QrCode } from 'lucide-react';
import { AvatarRenderer } from './AvatarRenderer';
import { VieWorldLogo } from './VieWorldLogo';
import { MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import type { DisplayItem } from '../world/display';

interface FandomPolaroidPassProps {
  isOpen: boolean;
  onClose: () => void;
  fanName: string;
  avatarPreset?: string;
  digitalLook?: { shirt?: string; hat?: string; lightstick?: string };
  accessoryId?: string;
  mood?: string;
  badge?: number;
  fandomName?: string;
  companionDays?: number;
  items: DisplayItem[];
  fanId: string;
}

export function FandomPolaroidPass({
  isOpen,
  onClose,
  fanName,
  avatarPreset,
  digitalLook,
  accessoryId,
  mood,
  badge: _badge,
  fandomName = 'VieWorld',
  companionDays: _companionDays = 128,
  items,
  fanId,
}: FandomPolaroidPassProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/members/${fanId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displayedPreviews = items.filter(i => i.image).slice(0, 3);

  return (
    <div className="v7-polaroid-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Thẻ Fandom Pass">
      <div className="v7-polaroid-modal" onClick={e => e.stopPropagation()}>
        <button className="v7-polaroid-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        {/* The Polaroid Card Frame */}
        <div className="v7-polaroid-frame">
          <div className="v7-polaroid-header">
            <div className="v7-polaroid-brand">
              <VieWorldLogo size={18} />
              <strong>VIEWORLD · FANDOM PASS</strong>
            </div>
            <span className="v7-polaroid-fandom-pill">{fandomName}</span>
          </div>

          <div className="v7-polaroid-content">
            <div className="v7-polaroid-avatar-wrap">
              <AvatarRenderer
                role="fan"
                size="preview"
                appearance={avatarPreset as any}
                digitalLook={digitalLook}
                accessoryId={accessoryId}
                displayName={fanName}
                isFrozen
              />
            </div>

            <div className="v7-polaroid-info">
              <h3 className="v7-polaroid-name">{fanName}</h3>
              <p className="v7-polaroid-mood">"{mood || 'Một góc nhỏ cho những điều mình yêu.'}"</p>
              
              <div className="v7-polaroid-claims-grid">
                <span className="v7-polaroid-claim-pill">Pulse Crew Membership</span>
                <span className="v7-polaroid-claim-pill">Active Member since Sep 2026</span>
                <span className="v7-polaroid-claim-pill">Hall Access ✓</span>
                <span className="v7-polaroid-claim-pill">3 đặc quyền khả dụng</span>
              </div>
            </div>
          </div>

          {/* Mini Showcase on Pass */}
          <div className="v7-polaroid-showcase">
            <span className="v7-polaroid-section-title">GÓC KỶ VẬT ĐANG TRƯNG BÀY</span>
            <div className="v7-polaroid-items-row">
              {displayedPreviews.map((it, idx) => (
                <div key={idx} className="v7-polaroid-item-chip" title={it.title}>
                  <img
                    src={it.image?.startsWith('shirt') ? '/images/world-v6/shirt-cutout.webp' : `${MERCH_IMAGE_ROOT}/${it.image}.png`}
                    alt={it.title}
                  />
                  <span>{it.title}</span>
                </div>
              ))}
              {!displayedPreviews.length && (
                <span className="v7-polaroid-no-items">Phòng đang chờ đặt thêm kỷ vật mới.</span>
              )}
            </div>
          </div>

          {/* Footer of the Polaroid Card */}
          <div className="v7-polaroid-footer">
            <div className="v7-polaroid-qr">
              <QrCode size={28} />
              <span>Ghé thăm: /members/{fanId}</span>
            </div>
            <span className="v7-polaroid-stamp">COMMUNITY ACCESS · 2026</span>
          </div>
        </div>

        {/* Action Bar below Polaroid */}
        <div className="v7-polaroid-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="v7-polaroid-copy-btn"
              onClick={handleCopyLink}
              style={{ flex: '1 1 140px' }}
            >
              {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              <span>{copied ? 'Đã sao chép link!' : 'Chia sẻ liên kết'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                alert('Ảnh thẻ Fandom Pass đã sẵn sàng để lưu về máy!');
              }}
              style={{ borderRadius: '12px', fontSize: '13px', padding: '8px 14px' }}
            >
              Lưu ảnh
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                window.location.href = '/me?panel=benefits';
              }}
              style={{ borderRadius: '12px', fontSize: '13px', padding: '8px 14px' }}
            >
              Xem quyền lợi
            </button>
          </div>

          <small className="v7-polaroid-hint">
            Fandom Pass là thẻ định danh truy cập quyền lợi và kết nối cộng đồng tại VieWorld.
          </small>
        </div>
      </div>
    </div>
  );
}
