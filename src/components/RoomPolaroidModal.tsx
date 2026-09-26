import { useState, useRef } from 'react';
import { X, Copy, Check, Download, Camera, Sparkles } from 'lucide-react';
import { AvatarRenderer } from './AvatarRenderer';
import { VieWorldLogo } from './VieWorldLogo';
import { MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import type { DisplayItem } from '../world/display';
import { useDialogA11y } from '../hooks/useDialogA11y';

interface RoomPolaroidModalProps {
  isOpen: boolean;
  onClose: () => void;
  fanName: string;
  avatarPreset?: 'original' | 'wave' | 'bob' | 'curl';
  digitalLook?: { shirt?: string; hat?: string; lightstick?: string };
  accessoryId?: string;
  mood?: string;
  companionDays?: number;
  items: DisplayItem[];
  fanId: string;
}

export function RoomPolaroidModal({
  isOpen,
  onClose,
  fanName,
  avatarPreset,
  digitalLook,
  accessoryId,
  mood,
  companionDays = 128,
  items,
  fanId,
}: RoomPolaroidModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useDialogA11y(isOpen, onClose, modalRef);

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/members/${fanId}`;

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const handleDownloadSnapshot = () => {
    try {
      setDownloading(true);
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 960;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Pure white Polaroid card background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 720, 960);

      // Card frame border
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#EEF2FF';
      ctx.strokeRect(7, 7, 706, 946);

      // Top banner
      ctx.fillStyle = '#5B46E8';
      ctx.fillRect(24, 24, 672, 60);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Be Vietnam Pro", sans-serif';
      ctx.fillText('VIEWORLD · GÓC NHỎ KỶ NIỆM', 48, 62);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '14px "Be Vietnam Pro", sans-serif';
      ctx.fillText('MY SPACE SNAPSHOT', 520, 62);

      // Room Area Simulated Frame
      ctx.fillStyle = '#F8F9FA';
      ctx.fillRect(36, 104, 648, 420);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 104, 648, 420);

      // Room Header text inside snapshot
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 15px "Be Vietnam Pro", sans-serif';
      ctx.fillText('PHÒNG TRƯNG BÀY 2.5D CỦA BẠN', 56, 136);

      // Draw displayed items list inside room section
      let itemY = 176;
      ctx.fillStyle = '#1E293B';
      ctx.font = '15px "Be Vietnam Pro", sans-serif';
      items.slice(0, 5).forEach(item => {
        ctx.fillStyle = '#5B46E8';
        ctx.fillText('✦', 60, itemY);
        ctx.fillStyle = '#1E293B';
        ctx.fillText(`${item.title} (${item.detail || 'Kỷ vật'})`, 80, itemY);
        itemY += 34;
      });

      if (items.length === 0) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'italic 15px "Be Vietnam Pro", sans-serif';
        ctx.fillText('Chưa có vật phẩm nào được đưa lên kệ trưng bày.', 60, itemY);
      }

      // Fan Identity Details
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 28px "Be Vietnam Pro", sans-serif';
      ctx.fillText(fanName, 48, 574);

      ctx.fillStyle = '#64748B';
      ctx.font = 'italic 17px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`"${mood || 'Một góc nhỏ cho những điều mình yêu.'}"`, 48, 614);

      // Companion Days Box
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(48, 646, 624, 76);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.strokeRect(48, 646, 624, 76);

      ctx.fillStyle = '#5B46E8';
      ctx.font = 'bold 18px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Đồng hành cùng VieWorld: ${companionDays} ngày`, 72, 692);

      // Footer Watermark & URL
      ctx.fillStyle = '#94A3B8';
      ctx.font = '13px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Ghé thăm phòng: ${shareUrl}`, 48, 770);
      ctx.fillText('Bản quyền © 2026 VieWorld · Phạm Thanh Phú. All rights reserved.', 48, 910);

      // Trigger download
      const link = document.createElement('a');
      link.download = `myspace-polaroid-${fanName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setTimeout(() => setDownloading(false), 1200);
    } catch {
      setDownloading(false);
    }
  };

  return (
    <div className="v7-modal-backdrop" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="v7-polaroid-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Ảnh Polaroid phòng của ${fanName}`}
        tabIndex={-1}
      >
        <div className="v7-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <span className="v7-modal-eyebrow">ONE-CLICK POLAROID</span>
              <h3>Chụp ảnh góc phòng kỷ niệm</h3>
            </div>
          </div>
          <button
            type="button"
            className="v7-modal-close-btn"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Polaroid Card Visual Preview */}
        <div className="v7-polaroid-preview-card" aria-label="Khung ảnh Polaroid">
          <div className="v7-polaroid-inner-frame">
            <div className="v7-polaroid-top-pill">
              <VieWorldLogo size={18} />
              <span>VieWorld · My Space</span>
            </div>

            <div className="v7-polaroid-room-view">
              <img
                src="/images/myspace-room-v2.png"
                alt="Góc phòng 2.5D của fan"
                className="v7-polaroid-room-art"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="v7-polaroid-avatar-badge">
                <AvatarRenderer
                  role="fan"
                  appearance={avatarPreset}
                  displayName={fanName}
                  digitalLook={digitalLook}
                  accessoryId={accessoryId}
                  size="preview"
                />
              </div>
            </div>

            <div className="v7-polaroid-meta">
              <h4 className="v7-polaroid-fan-name">{fanName}</h4>
              <p className="v7-polaroid-mood-quote">
                &ldquo;{mood || 'Một góc nhỏ cho những điều mình yêu.'}&rdquo;
              </p>

              <div className="v7-polaroid-items-row">
                <span className="v7-polaroid-items-label">Đang trưng bày:</span>
                <div className="v7-polaroid-items-chips">
                  {items.length > 0 ? (
                    items.map(item => (
                      <span key={item.id} className="v7-polaroid-chip">
                        {item.image && (
                          <img
                            src={`${MERCH_IMAGE_ROOT}/${item.image}.png`}
                            alt=""
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <span>{item.title}</span>
                      </span>
                    ))
                  ) : (
                    <span className="v7-polaroid-empty-chip">✦ Chưa đặt món lên kệ</span>
                  )}
                </div>
              </div>

              <div className="v7-polaroid-footer-row">
                <span className="v7-polaroid-companion-tag">
                  <Sparkles size={12} />
                  <span>{companionDays} ngày đồng hành</span>
                </span>
                <span className="v7-polaroid-date-stamp">
                  {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="v7-polaroid-actions">
          <button
            type="button"
            className="fw-button"
            onClick={handleDownloadSnapshot}
            disabled={downloading}
          >
            <Download size={16} />
            <span>{downloading ? 'Đang xuất ảnh…' : 'Tải ảnh Polaroid (PNG)'}</span>
          </button>

          <button
            type="button"
            className="fw-text-button"
            onClick={handleCopyLink}
          >
            {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
            <span>{copied ? 'Đã sao chép link phòng!' : 'Sao chép link phòng'}</span>
          </button>

          <button
            type="button"
            className="fw-text-button"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
