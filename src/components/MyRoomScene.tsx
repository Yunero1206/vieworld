import React, { useState } from 'react';
import {
  Award,
  CalendarHeart,
  Gift,
  History,
  LifeBuoy,
  Package,
  Shirt,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { AvatarRenderer } from './AvatarRenderer';
import { getAccessoryName } from '../world/assetManifest';

export type RoomSection =
  | 'capsules'
  | 'benefits'
  | 'orders'
  | 'support'
  | 'wardrobe'
  | 'follows'
  | 'history';

export interface RoomCapsulePreview {
  id: string;
  title: string;
  sessionTitle?: string;
  worldName?: string;
}

export interface MyRoomSceneProps {
  displayName: string;
  accessoryName?: string;
  capsuleCount: number;
  benefitCount: number;
  orderCount: number;
  supportCount: number;
  upcomingCount: number;
  participationCount?: number;
  recentCapsules?: RoomCapsulePreview[];
  showcaseSlots?: (RoomCapsulePreview | null)[];
  onSlotClick?: (slotIdx: 0 | 1 | 2) => void;
  onRemoveSlot?: (slotIdx: 0 | 1 | 2) => void;
  myWorldTitle?: string;
  capsulesTitle?: string;
  onOpenSection: (section: RoomSection) => void;
}

export const MyRoomScene: React.FC<MyRoomSceneProps> = ({
  displayName,
  accessoryName,
  capsuleCount,
  benefitCount,
  orderCount,
  supportCount,
  upcomingCount,
  participationCount = 0,
  recentCapsules = [],
  showcaseSlots,
  onSlotClick,
  onRemoveSlot,
  myWorldTitle = 'Phòng tôi',
  capsulesTitle = 'Moment Capsules',
  onOpenSection,
}) => {
  const [showGreeting, setShowGreeting] = useState(false);
  const [artworkError, setArtworkError] = useState(false);
  const effectiveAccLabel = getAccessoryName(accessoryName);

  // 3-slot showcase shelf representation (Ô 1, Ô 2, Ô 3)
  const slots = [0, 1, 2].map((idx) => {
    const item = showcaseSlots !== undefined ? showcaseSlots[idx] : recentCapsules[idx];
    return {
      index: idx + 1,
      item: item || null,
    };
  });

  const handleAvatarClick = () => {
    setShowGreeting((prev) => !prev);
  };

  return (
    <section
      className="my-room room-diorama"
      aria-label={`Căn phòng cá nhân 2.5D của ${displayName}`}
      data-testid="my-room-scene"
    >
      {/* Header bar within room */}
      <div className="room-header-bar">
        <div className="room-header-info">
          <span className="room-eyebrow">
            <Sparkles size={13} /> {myWorldTitle} · 2.5D Diorama
          </span>
          <h1 className="room-title">
            Phòng của {displayName}
          </h1>
          <p className="room-subtitle">
            Không gian lưu giữ kỷ niệm, diện mạo avatar và lịch hẹn sự kiện của riêng bạn.
          </p>
        </div>

        <div className="room-header-status">
          <span className="demo-badge">DEMO</span>
          <span className="room-private-pill">
            <CheckCircle2 size={13} /> Không gian cá nhân
          </span>
        </div>
      </div>

      {/* 2.5D Diorama Scene Viewport */}
      <div className="room-scene-stage" role="region" aria-label="Không gian 2.5D phòng cá nhân">
        {/* 2.5D Matte-Clay Artwork Backdrop with fallback */}
        {!artworkError && (
          <img
            src="/images/world-redesign/drafts/fan-room-scene-sample.png"
            alt=""
            className="room-backdrop-artwork"
            onError={() => setArtworkError(true)}
            data-testid="room-backdrop-artwork"
          />
        )}

        {/* Wall Backdrop */}
        <div className="room-wall" aria-hidden="true">
          {/* Wall Window with night sky and gentle moonlight */}
          <div className="room-window">
            <div className="room-window-frame">
              <div className="room-window-glass">
                <span className="room-window-moon" />
                <div className="room-window-cityscape" />
              </div>
              <div className="room-window-mullion-h" />
              <div className="room-window-mullion-v" />
            </div>
          </div>

          {/* Wall Poster */}
          <div className="room-wall-poster">
            <span className="poster-tag">LIVE</span>
            <strong className="poster-title">VIE MUSIC</strong>
            <small className="poster-sub">Acoustic · Soul</small>
          </div>
        </div>

        {/* 3 Interactive Core Objects + Avatar on Stage */}
        <div className="room-stage-content">
          {/* 1. LỊCH TRÊN TƯỜNG (Wall Calendar Hotspot) */}
          <button
            type="button"
            className="room-spot room-spot--calendar"
            onClick={() => onOpenSection('follows')}
            data-testid="room-calendar-hotspot"
            aria-label={`Lịch hẹn sự kiện trên tường: ${upcomingCount} sự kiện đã hẹn RSVP. Bấm để xem chi tiết`}
          >
            <div className="calendar-graphic" aria-hidden="true">
              <div className="calendar-pin" />
              <div className="calendar-top" />
              <div className="calendar-sheet">
                <span className="calendar-month">THÁNG 9</span>
                <span className="calendar-day">{upcomingCount > 0 ? `${upcomingCount}` : '•'}</span>
                <span className="calendar-badge">RSVP</span>
              </div>
            </div>

            <div className="room-spot-details">
              <span className="room-spot-label">
                <CalendarHeart size={14} /> Lịch hẹn sự kiện
              </span>
              <strong className="room-spot-status">
                {upcomingCount > 0 ? `${upcomingCount} sự kiện đã hẹn` : 'Lịch trống · Chưa có hẹn'}
              </strong>
              <small className="room-spot-hint">
                {upcomingCount > 0 ? 'Mở danh sách RSVP' : 'Khám phá sự kiện để đăng ký'}
              </small>
            </div>
          </button>

          {/* 2. KỆ KỶ NIỆM BA Ô (3-Slot Showcase Shelf) */}
          <div
            className="room-spot room-spot--shelf"
            onClick={() => onOpenSection('capsules')}
            data-testid="room-shelf-hotspot"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenSection('capsules');
              }
            }}
            aria-label={`Kệ kỷ niệm 3 ô: ${capsuleCount} ${capsulesTitle} đã lưu. Bấm để mở toàn bộ bộ sưu tập`}
          >
            <div className="shelf-graphic">
              <div className="shelf-plank">
                <div className="shelf-slots-grid">
                  {slots.map((slot) => (
                    <div
                      key={slot.index}
                      className={`shelf-slot ${slot.item ? 'shelf-slot--occupied' : 'shelf-slot--empty'}`}
                      title={slot.item ? `Ô ${slot.index}: ${slot.item.title}` : `Ô ${slot.index}: Trống`}
                      data-testid={`shelf-slot-${slot.index}`}
                    >
                      <div className="slot-header-row">
                        <span className="slot-number">Ô {slot.index}</span>
                        {slot.item && onRemoveSlot && (
                          <button
                            type="button"
                            className="shelf-remove-btn"
                            data-testid={`shelf-remove-slot-${slot.index}`}
                            aria-label={`Gỡ kỷ niệm khỏi Ô ${slot.index}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveSlot((slot.index - 1) as 0 | 1 | 2);
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {slot.item ? (
                        <div
                          className="slot-content"
                          onClick={(e) => {
                            if (onSlotClick) {
                              e.stopPropagation();
                              onSlotClick((slot.index - 1) as 0 | 1 | 2);
                            }
                          }}
                        >
                          <Gift size={16} className="slot-icon" />
                          <span className="slot-title">{slot.item.title}</span>
                        </div>
                      ) : (
                        <span className="slot-placeholder">Trống</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="room-spot-details">
              <span className="room-spot-label">
                <Gift size={14} /> Kệ kỷ niệm 3 ô
              </span>
              <strong className="room-spot-status">
                {capsuleCount > 0
                  ? `${capsuleCount} ${capsulesTitle} đã lưu`
                  : 'Kệ đang trống · Chờ kỷ niệm đầu tiên'}
              </strong>
              <small className="room-spot-hint">
                {capsuleCount > 0 ? 'Xem bộ sưu tập và chọn trưng bày' : 'Tham gia phiên live để nhận capsule'}
              </small>
            </div>
          </div>

          {/* 3. AVATAR FAN & RUG (Center Stage) */}
          <div className="room-center-area">
            {/* Woven Rug on the wooden floor */}
            <div className="room-rug" aria-hidden="true" />

            {/* Avatar Character Hotspot */}
            <div className="room-avatar-container">
              {/* Speech bubble greeting */}
              {showGreeting && (
                <div
                  className="room-speech-bubble"
                  role="status"
                  aria-live="polite"
                  data-testid="room-avatar-greeting"
                >
                  <p>
                    Chào <strong>{displayName}</strong>! ✨ Chúc bạn có những phút giây âm nhạc thật chill cùng VieWorld!
                  </p>
                  <button
                    type="button"
                    className="speech-bubble-close"
                    onClick={() => setShowGreeting(false)}
                    aria-label="Đóng lời chào"
                  >
                    ×
                  </button>
                </div>
              )}

              <button
                type="button"
                className="room-avatar-btn"
                onClick={handleAvatarClick}
                data-testid="room-avatar-hotspot"
                aria-label={`Avatar của ${displayName}. Đang đeo: ${effectiveAccLabel || 'Mặc định'}. Bấm để chào`}
              >
                <div className="avatar-clay-figure" aria-hidden="true" style={{ position: 'relative' }}>
                  <AvatarRenderer
                    role="fan"
                    accessoryId={accessoryName}
                    size="lg"
                    displayName={displayName}
                    testId="room-avatar-renderer"
                  />
                  <div className="avatar-initial-badge" title={`Chữ cái đại diện: ${displayName.charAt(0)}`}>
                    <span className="avatar-initial">{displayName.charAt(0)}</span>
                  </div>
                </div>

                <div className="avatar-nameplate">
                  <span className="avatar-name">{displayName}</span>
                  <small className="avatar-tag">
                    {effectiveAccLabel ? `✦ ${effectiveAccLabel}` : 'Trang phục thường'}
                  </small>
                </div>
              </button>
            </div>
          </div>

          {/* 4. TỦ ĐỒ AVATAR (Wardrobe Cabinet Hotspot) */}
          <button
            type="button"
            className="room-spot room-spot--wardrobe"
            onClick={() => onOpenSection('wardrobe')}
            data-testid="room-wardrobe-hotspot"
            aria-label={`Tủ đồ avatar: ${effectiveAccLabel ? `Đang mặc ${effectiveAccLabel}` : 'Chưa chọn phụ kiện'}. Bấm để đổi trang phục`}
          >
            <div className="wardrobe-graphic" aria-hidden="true">
              <div className="wardrobe-cabinet">
                <div className="wardrobe-pediment" />
                <div className="wardrobe-doors">
                  <div className="wardrobe-door wardrobe-door--left">
                    <span className="wardrobe-mirror" />
                    <span className="wardrobe-handle" />
                  </div>
                  <div className="wardrobe-door wardrobe-door--right">
                    <span className="wardrobe-hanger">
                      <Shirt size={14} />
                    </span>
                    <span className="wardrobe-handle" />
                  </div>
                </div>
                <div className="wardrobe-drawer" />
              </div>
            </div>

            <div className="room-spot-details">
              <span className="room-spot-label">
                <Shirt size={14} /> Tủ đồ Avatar
              </span>
              <strong className="room-spot-status">
                {effectiveAccLabel ? `Đang mặc: ${effectiveAccLabel}` : 'Chưa chọn phụ kiện'}
              </strong>
              <small className="room-spot-hint">
                Tùy biến phong cách và diện mạo
              </small>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Utility Menu: "Tài khoản & Tiện ích" (Quyền lợi, đơn hàng, hỗ trợ không mất route/recovery) */}
      <div className="room-utility-dock" aria-label="Tiện ích tài khoản và quyền lợi">
        <div className="utility-dock-header">
          <span className="utility-dock-title">Tài khoản & Tiện ích</span>
          <span className="utility-dock-desc">Quyền lợi, đơn hàng và hỗ trợ cá nhân</span>
        </div>

        <div className="utility-dock-grid">
          <button
            type="button"
            className="utility-card utility-card--benefits"
            onClick={() => onOpenSection('benefits')}
            data-testid="room-util-benefits"
            aria-label={`Ví quyền lợi: ${benefitCount} quyền lợi`}
          >
            <div className="utility-icon">
              <Award size={18} />
            </div>
            <div className="utility-text">
              <strong>Ví quyền lợi</strong>
              <small>{benefitCount} quyền lợi</small>
            </div>
          </button>

          <button
            type="button"
            className="utility-card utility-card--orders"
            onClick={() => onOpenSection('orders')}
            data-testid="room-util-orders"
            aria-label={`Đơn hàng & Sở hữu: ${orderCount} đơn hàng`}
          >
            <div className="utility-icon">
              <Package size={18} />
            </div>
            <div className="utility-text">
              <strong>Đơn hàng & Sở hữu</strong>
              <small>{orderCount} đơn hàng</small>
            </div>
          </button>

          <button
            type="button"
            className="utility-card utility-card--support"
            onClick={() => onOpenSection('support')}
            data-testid="room-util-support"
            aria-label={`Hỗ trợ & Đối soát: ${supportCount} hồ sơ`}
          >
            <div className="utility-icon">
              <LifeBuoy size={18} />
            </div>
            <div className="utility-text">
              <strong>Hỗ trợ & Đối soát</strong>
              <small>{supportCount ? `${supportCount} hồ sơ` : 'Cần trợ giúp?'}</small>
            </div>
          </button>

          <button
            type="button"
            className="utility-card utility-card--history"
            onClick={() => onOpenSection('history')}
            data-testid="room-util-history"
            aria-label={`Lịch sử tham dự: ${participationCount} lượt`}
          >
            <div className="utility-icon">
              <History size={18} />
            </div>
            <div className="utility-text">
              <strong>Lịch sử tham dự</strong>
              <small>{participationCount} lượt tham gia</small>
            </div>
          </button>
        </div>
      </div>

      {/* Lối tắt bằng chữ theo Bible Rule 4 (Không có mê cung) */}
      <nav className="room-shortcuts" aria-label="Lối tắt văn bản các khu vực trong phòng">
        <span className="room-shortcuts__label">Lối tắt nhanh:</span>
        <div className="room-shortcuts__links">
          <button
            type="button"
            className="room-shortcut-btn"
            onClick={() => onOpenSection('capsules')}
            data-testid="shortcut-capsules"
          >
            <Gift size={14} />
            <span>Kệ kỷ niệm ({capsuleCount})</span>
          </button>

          <button
            type="button"
            className="room-shortcut-btn"
            onClick={() => onOpenSection('wardrobe')}
            data-testid="shortcut-wardrobe"
          >
            <Shirt size={14} />
            <span>Tủ đồ ({accessoryName || 'Mặc định'})</span>
          </button>

          <button
            type="button"
            className="room-shortcut-btn"
            onClick={() => onOpenSection('follows')}
            data-testid="shortcut-calendar"
          >
            <Calendar size={14} />
            <span>Lịch hẹn ({upcomingCount} sự kiện)</span>
          </button>

          <button
            type="button"
            className="room-shortcut-btn"
            onClick={() => onOpenSection('benefits')}
            data-testid="shortcut-benefits"
          >
            <Award size={14} />
            <span>Quyền lợi ({benefitCount})</span>
          </button>

          <button
            type="button"
            className="room-shortcut-btn"
            onClick={() => onOpenSection('orders')}
            data-testid="shortcut-orders"
          >
            <Package size={14} />
            <span>Đơn hàng ({orderCount})</span>
          </button>

          <button
            type="button"
            className="room-shortcut-btn"
            onClick={() => onOpenSection('support')}
            data-testid="shortcut-support"
          >
            <LifeBuoy size={14} />
            <span>Hỗ trợ ({supportCount})</span>
          </button>
        </div>
      </nav>
    </section>
  );
};
