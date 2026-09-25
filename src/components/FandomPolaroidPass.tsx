import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check, QrCode, Download, AlertCircle } from 'lucide-react';
import { AvatarRenderer } from './AvatarRenderer';
import { VieWorldLogo } from './VieWorldLogo';
import { MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import type { DisplayItem } from '../world/display';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { useApp } from '../context/AppContext';

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
  companionDays = 128,
  items,
  fanId,
}: FandomPolaroidPassProps) {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  useDialogA11y(isOpen, onClose, modalRef);

  const { state } = useApp();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/members/${fanId}`;

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setCopyError(false);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard not supported');
      }
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  // Real canvas-based image export
  const handleDownloadImage = () => {
    try {
      setDownloading(true);
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 600, 800);

      // Border frame
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#EEF2FF';
      ctx.strokeRect(6, 6, 588, 788);

      // Top banner
      ctx.fillStyle = '#5B46E8';
      ctx.fillRect(20, 20, 560, 60);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Be Vietnam Pro", sans-serif';
      ctx.fillText('VIEWORLD · FANDOM PASS', 40, 58);

      // Fandom pill
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px "Be Vietnam Pro", sans-serif';
      ctx.fillText(fandomName, 460, 56);

      // Fan info
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 28px "Be Vietnam Pro", sans-serif';
      ctx.fillText(fanName, 40, 140);

      ctx.fillStyle = '#6B7280';
      ctx.font = 'italic 16px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`"${mood || 'Một góc nhỏ cho những điều mình yêu.'}"`, 40, 180);

      // Member badge box
      ctx.fillStyle = '#F8F9FA';
      ctx.fillRect(40, 210, 520, 100);
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 210, 520, 100);

      ctx.fillStyle = '#5B46E8';
      ctx.font = 'bold 16px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Thành viên đồng hành: ${companionDays} ngày`, 60, 250);

      ctx.fillStyle = '#374151';
      ctx.font = '14px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`ID định danh: @${fanId} · Quyền truy cập: Hall & Moments`, 60, 285);

      // Footer stamp
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '12px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Cộng đồng VieWorld 2026 · ${shareUrl}`, 40, 740);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `vieworld-pass-${fanId}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // ignore
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  const displayedPreviews = items.filter(i => i.image).slice(0, 3);
  const isOwner = fanId === state.fanProfile.id;
  const userBenefits = Object.values(state.benefits || {}).filter(
    b => b.fanId === fanId && ['eligible', 'claimed'].includes(b.status)
  );

  return (
    <div
      className="v7-polaroid-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Thẻ Fandom Pass"
    >
      <div
        ref={modalRef}
        className="v7-polaroid-modal"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <button className="v7-polaroid-close-btn" onClick={onClose} aria-label="Đóng thẻ">
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
                <span className="v7-polaroid-claim-pill">{fandomName} Pass</span>
                <span className="v7-polaroid-claim-pill">
                  {isOwner ? 'Thành viên đang hoạt động' : 'Thành viên kết nối'}
                </span>
                <span className="v7-polaroid-claim-pill">Hall Access ✓</span>
                <span className="v7-polaroid-claim-pill">
                  {userBenefits.length > 0
                    ? `${userBenefits.length} đặc quyền khả dụng`
                    : 'Thẻ giao lưu cộng đồng'}
                </span>
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
                    src={
                      it.image?.startsWith('shirt')
                        ? '/images/world-v6/shirt-cutout.webp'
                        : `${MERCH_IMAGE_ROOT}/${it.image}.png`
                    }
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
              {copied ? (
                <Check size={16} color="#10B981" />
              ) : copyError ? (
                <AlertCircle size={16} color="#DC2626" />
              ) : (
                <Copy size={16} />
              )}
              <span>
                {copied ? 'Đã sao chép link!' : copyError ? 'Chưa thể chép tự động' : 'Chia sẻ liên kết'}
              </span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownloadImage}
              disabled={downloading}
              style={{
                borderRadius: '12px',
                fontSize: '13px',
                padding: '8px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={14} />
              <span>{downloading ? 'Đang xuất ảnh…' : 'Lưu ảnh thẻ'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                navigate('/me?panel=benefits');
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
