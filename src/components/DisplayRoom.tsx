import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X, Plus, Check, SlidersHorizontal, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from './AvatarRenderer';
import { ownedDigitalLook, MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import { DISPLAY_FIXTURES, displayedItems, displayOptions, type DisplayItem, type DisplaySlot } from '../world/display';
import type { PublicFan } from '../world/community';
import { RoomGuestbook } from './RoomGuestbook';

interface DisplayRoomSceneProps {
  fan: Pick<PublicFan, 'name' | 'look' | 'accessory' | 'appearance'> & { id?: string };
  items: DisplayItem[];
  onSelect: (slot: DisplaySlot) => void;
  isVinylPlaying?: boolean;
  isLightstickActive?: boolean;
  onToggleVinyl?: () => void;
  onToggleLightstick?: () => void;
  heartsCount?: number;
  onLike?: () => void;
  isLiked?: boolean;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  isOwner?: boolean;
  showVisitCount?: boolean;
  isVisitorMode?: boolean;
  onToggleVisitorMode?: () => void;
  onOpenPrivacy?: () => void;
}

export function DisplayRoomScene({
  fan,
  items,
  onSelect,
  isVinylPlaying = false,
  isLightstickActive = true,
  onToggleVinyl,
  onToggleLightstick,
  heartsCount = 19,
  onLike,
  isLiked = false,
  isEditMode = false,
  onToggleEditMode,
  isOwner = false,
  showVisitCount = true,
  isVisitorMode = false,
  onToggleVisitorMode,
  onOpenPrivacy,
}: DisplayRoomSceneProps) {
  const [ambientFeedback, setAmbientFeedback] = useState<string | null>(null);
  const feedbackTimeout = useRef<number | null>(null);

  const triggerFeedback = (msg: string) => {
    setAmbientFeedback(msg);
    if (feedbackTimeout.current) window.clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = window.setTimeout(() => setAmbientFeedback(null), 2400);
  };

  const handleFixtureClick = (slot: DisplaySlot) => {
    onSelect(slot);

    if (!isEditMode) {
      if (slot === 'disc' && onToggleVinyl) {
        onToggleVinyl();
        triggerFeedback(!isVinylPlaying ? '▶ Đang phát mâm đĩa than' : '⏸ Đã dừng mâm đĩa than');
      } else if (slot === 'lightstick' && onToggleLightstick) {
        onToggleLightstick();
        triggerFeedback(!isLightstickActive ? 'Đã bật ánh sáng fandom' : 'Đã tắt ánh sáng fandom');
      } else {
        const it = items.find(i => i.slot === slot);
        if (it) {
          triggerFeedback(`Đang trưng: ${it.title}`);
        }
      }
    }
  };

  return (
    <div className="v6-display-scene-wrapper">
      {/* Visitor Projection Top Bar */}
      {isVisitorMode && (
        <div className="v7-visitor-banner" role="status" aria-live="polite">
          <div className="v7-visitor-banner-info">
            <strong>Chế độ xem của khách ghé thăm (Visitor Projection)</strong>
            <p>Chỉ hiển thị phòng, các kỷ vật đã chọn trưng bày và sổ lưu bút công khai.</p>
          </div>
          {onToggleVisitorMode && (
            <button
              type="button"
              className="v7-visitor-back-btn"
              onClick={onToggleVisitorMode}
              aria-label="Quay lại phòng của tôi"
            >
              ← Quay lại phòng của tôi
            </button>
          )}
        </div>
      )}

      {/* Social & Contextual Toolbar */}
      <div className="v7-room-social-bar">
        <div className="v7-social-left">
          {showVisitCount && (
            <span className="v7-visitor-counter">48 lượt ghé thăm</span>
          )}
          <button
            type="button"
            className={`v7-room-heart-btn ${isLiked ? 'liked' : ''}`}
            onClick={onLike}
            aria-label={`Thả tim phòng (${heartsCount})`}
          >
            <Heart size={14} fill={isLiked ? '#E11D48' : 'none'} color={isLiked ? '#E11D48' : 'currentColor'} />
            <span>{heartsCount}</span>
          </button>

          {ambientFeedback && (
            <span className="v7-inscene-toast" role="status">
              {ambientFeedback}
            </span>
          )}
        </div>

        <div className="v7-social-actions">
          {isOwner && !isVisitorMode && (
            <div className="v7-room-controls-group">
              {onToggleEditMode && (
                <button
                  type="button"
                  className={`v7-room-mode-btn ${isEditMode ? 'editing' : ''}`}
                  onClick={onToggleEditMode}
                  aria-label={isEditMode ? 'Xong việc chỉnh phòng' : 'Chỉnh sửa các vị trí trong phòng'}
                >
                  {isEditMode ? (
                    <>
                      <Check size={14} />
                      <span>Xong</span>
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal size={14} />
                      <span>Chỉnh phòng</span>
                    </>
                  )}
                </button>
              )}
              {onToggleVisitorMode && (
                <button
                  type="button"
                  className="v7-room-preview-btn"
                  onClick={onToggleVisitorMode}
                  aria-label="Xem phòng như khách ghé thăm"
                >
                  Xem như khách ↗
                </button>
              )}
              {onOpenPrivacy && (
                <button
                  type="button"
                  className="v7-room-privacy-btn"
                  onClick={onOpenPrivacy}
                  title="Cài đặt quyền riêng tư phòng"
                  aria-label="Cài đặt quyền riêng tư phòng"
                >
                  <Shield size={14} />
                  <span>Quyền riêng tư</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`v6-display-scene ${isEditMode ? 'is-edit-mode' : 'is-view-mode'}`}>
        <img
          className="v6-room-art"
          src="/images/world-v6/myspace.webp"
          width="1672"
          height="941"
          style={{ pointerEvents: 'none' }}
          onError={e => {
            e.currentTarget.style.visibility = 'hidden';
          }}
          alt="Studio cá nhân với giá áo, bảng vé, hốc huy hiệu, giá lightstick và tủ đĩa; không có salon"
        />

        {DISPLAY_FIXTURES.map(f => {
          const item = items.find(i => i.slot === f.slot);
          const isVinylSlot = f.slot === 'disc';
          const isLightSlot = f.slot === 'lightstick';
          const spinningClass = isVinylSlot && isVinylPlaying ? 'v7-vinyl-spinning' : '';
          const glowClass = isLightSlot && isLightstickActive ? 'v7-lightstick-glow' : '';

          return (
            <button
              id={`fixture-${f.slot}`}
              className={`v6-fixture v6-fixture-${f.slot} ${item ? 'occupied' : ''} ${spinningClass} ${glowClass} ${
                isEditMode ? 'edit-hotspot' : 'view-hotspot'
              }`}
              key={f.slot}
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                minWidth: '44px',
                minHeight: '44px',
                pointerEvents: 'auto',
              }}
              onClick={() => handleFixtureClick(f.slot)}
              aria-label={`${f.label}: ${item?.title || 'chưa trưng bày'}`}
              title={
                !isEditMode && isVinylSlot
                  ? isVinylPlaying ? 'Mâm đĩa: Nhấn để dừng nhạc' : 'Mâm đĩa: Nhấn để phát nhạc'
                  : !isEditMode && isLightSlot
                  ? isLightstickActive ? 'Lightstick: Nhấn để tắt sáng' : 'Lightstick: Nhấn để bật sáng'
                  : isEditMode
                  ? `Chỉnh sửa vị trí ${f.label}`
                  : undefined
              }
            >
              {item?.image ? (
                <img
                  src={
                    item.image.startsWith('shirt')
                      ? '/images/world-v6/shirt-cutout.webp'
                      : `${MERCH_IMAGE_ROOT}/${item.image}.png`
                  }
                  alt=""
                />
              ) : item ? (
                <span className="v6-trophy">✦</span>
              ) : isEditMode ? (
                <span className="v6-slot-empty">＋</span>
              ) : null}

              {isEditMode && item && (
                <span className="v7-fixture-edit-chip">Sửa</span>
              )}

              <span className="v6-fixture-label">{f.label}</span>
            </button>
          );
        })}

        <div className="v6-room-avatar">
          <AvatarRenderer
            appearance={fan.appearance}
            role="fan"
            size="preview"
            displayName={fan.name}
            digitalLook={fan.look}
            accessoryId={fan.accessory}
          />
          <span>{fan.name}</span>
        </div>
      </div>

      {/* Accessible semantic fallback for screen readers and keyboard navigation */}
      <div className="v7-accessible-room-list" aria-label="Danh sách vật phẩm đang trưng bày">
        <h3 className="sr-only">Danh sách vật phẩm đang trưng bày trong phòng</h3>
        <ul className="sr-only">
          {DISPLAY_FIXTURES.map(f => {
            const item = items.find(i => i.slot === f.slot);
            return (
              <li key={f.slot}>
                <strong>{f.label}:</strong> {item ? item.title : 'Chưa trưng bày vật phẩm'}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function PersonalDisplayRoom({
  onOpen: _onOpen,
  onOpenPrivacy,
}: {
  onOpen: (panel: string) => void;
  onOpenPrivacy?: () => void;
}) {
  const { state, dispatch } = useApp();

  const [roomMode, setRoomMode] = useState<'view' | 'edit' | 'visitor'>('view');
  const [activeDrawerSlot, setActiveDrawerSlot] = useState<DisplaySlot | null>(null);
  const [isVinylPlaying, setIsVinylPlaying] = useState(false);
  const [isLightstickActive, setIsLightstickActive] = useState(true);
  const [heartsCount, setHeartsCount] = useState(19);
  const [isLiked, setIsLiked] = useState(false);

  const lastTriggerButtonRef = useRef<HTMLElement | null>(null);

  const displayed = useMemo(() => displayedItems(state), [state]);
  const allSlotOptions = useMemo(() => displayOptions(state), [state]);

  const slotEligibleItems = useMemo(() => {
    if (!activeDrawerSlot) return [];
    return allSlotOptions.filter(i => i.slot === activeDrawerSlot);
  }, [allSlotOptions, activeDrawerSlot]);

  const activeFixtureConfig = DISPLAY_FIXTURES.find(f => f.slot === activeDrawerSlot);
  const currentSlotItem = displayed.find(i => i.slot === activeDrawerSlot);

  // Close drawer on Escape and return focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDrawerSlot(null);
        lastTriggerButtonRef.current?.focus();
      }
    };
    if (activeDrawerSlot) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeDrawerSlot]);

  const handleSelectSlot = (slot: DisplaySlot) => {
    if (roomMode !== 'edit') return;
    lastTriggerButtonRef.current = document.getElementById(`fixture-${slot}`);
    setActiveDrawerSlot(slot);
  };

  const handleCloseDrawer = () => {
    setActiveDrawerSlot(null);
    lastTriggerButtonRef.current?.focus();
  };

  const handleApplyItem = (itemId: string) => {
    if (!activeDrawerSlot) return;
    dispatch({ type: 'SET_DISPLAY_SLOT', slot: activeDrawerSlot, itemId });
    handleCloseDrawer();
  };

  const handleClearSlot = () => {
    if (!activeDrawerSlot) return;
    dispatch({ type: 'SET_DISPLAY_SLOT', slot: activeDrawerSlot, itemId: '' });
    handleCloseDrawer();
  };

  const handleLikeRoom = () => {
    setIsLiked(prev => {
      setHeartsCount(c => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const isEditMode = roomMode === 'edit';
  const isVisitorMode = roomMode === 'visitor';

  return (
    <section className="v6-personal-room" aria-label="My Space — năm vị trí trưng bày">
      <DisplayRoomScene
        fan={{
          id: state.fanProfile.id,
          name: state.fanProfile.displayName,
          look: ownedDigitalLook(state),
          accessory: state.fanProfile.wardrobeChoice?.accessoryId,
          appearance: state.fanProfile.avatarPreset,
        }}
        items={displayed}
        onSelect={handleSelectSlot}
        isVinylPlaying={isVinylPlaying}
        isLightstickActive={isLightstickActive}
        onToggleVinyl={() => setIsVinylPlaying(p => !p)}
        onToggleLightstick={() => setIsLightstickActive(p => !p)}
        heartsCount={heartsCount}
        onLike={handleLikeRoom}
        isLiked={isLiked}
        isEditMode={isEditMode}
        onToggleEditMode={() => setRoomMode(m => (m === 'edit' ? 'view' : 'edit'))}
        isOwner={!isVisitorMode}
        isVisitorMode={isVisitorMode}
        onToggleVisitorMode={() => setRoomMode(m => (m === 'visitor' ? 'view' : 'visitor'))}
        onOpenPrivacy={onOpenPrivacy}
      />

      <p className="vw-room-hint">
        {isEditMode
          ? 'Chọn một vị trí để thay đổi vật phẩm trưng bày.'
          : isVisitorMode
          ? 'Đang xem phòng ở góc nhìn của khách ghé thăm.'
          : 'Không gian mang đậm dấu ấn riêng của bạn. Nhấn "Chỉnh phòng" để sắp đặt các món đồ.'}
      </p>

      {/* Visitor Projection: Public displayed items showcase */}
      {isVisitorMode && displayed.length > 0 && (
        <div className="v7-visitor-showcase-section">
          <h3>Kỷ vật đang trưng bày công khai</h3>
          <div className="v7-visitor-items-grid">
            {displayed.map(item => (
              <div key={item.id} className="v7-visitor-item-card">
                {item.image && (
                  <img
                    src={
                      item.image.startsWith('shirt')
                        ? '/images/world-v6/shirt-cutout.webp'
                        : `${MERCH_IMAGE_ROOT}/${item.image}.png`
                    }
                    alt={item.title}
                  />
                )}
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Slot Picker Drawer (In-Room Drawer) */}
      {activeDrawerSlot && (
        <div className="v7-drawer-backdrop" onClick={handleCloseDrawer}>
          <div
            className="v7-slot-picker-drawer"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Trưng bày ${activeFixtureConfig?.label}`}
          >
            <div className="v7-drawer-header">
              <div>
                <span className="v7-drawer-eyebrow">VỊ TRÍ TRƯNG BÀY</span>
                <h3>{activeFixtureConfig?.label}</h3>
              </div>
              <button
                className="v7-drawer-close-btn"
                onClick={handleCloseDrawer}
                aria-label="Đóng"
                autoFocus
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Item in slot */}
            {currentSlotItem && (
              <div className="v7-slot-current-section">
                <div className="v7-slot-current-card">
                  <div className="v7-drawer-item-media">
                    {currentSlotItem.image ? (
                      <img
                        src={
                          currentSlotItem.image.startsWith('shirt')
                            ? '/images/world-v6/shirt-cutout.webp'
                            : `${MERCH_IMAGE_ROOT}/${currentSlotItem.image}.png`
                        }
                        alt={currentSlotItem.title}
                      />
                    ) : (
                      <span className="v6-trophy">✦</span>
                    )}
                  </div>
                  <div className="v7-drawer-item-info">
                    <span className="v7-slot-active-label">Đang trưng bày</span>
                    <strong>{currentSlotItem.title}</strong>
                  </div>
                  <button
                    type="button"
                    className="v7-slot-remove-btn"
                    onClick={handleClearSlot}
                  >
                    Gỡ khỏi phòng
                  </button>
                </div>
              </div>
            )}

            <div className="v7-slot-candidates-section">
              <span className="v7-slot-section-title">
                Các món phù hợp ({slotEligibleItems.length})
              </span>

              <div className="v7-drawer-items-list">
                {slotEligibleItems.map(item => {
                  const isCurrent = currentSlotItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`v7-drawer-item-card ${isCurrent ? 'selected' : ''}`}
                      onClick={() => handleApplyItem(item.id)}
                    >
                      <div className="v7-drawer-item-media">
                        {item.image ? (
                          <img
                            src={
                              item.image.startsWith('shirt')
                                ? '/images/world-v6/shirt-cutout.webp'
                                : `${MERCH_IMAGE_ROOT}/${item.image}.png`
                            }
                            alt={item.title}
                          />
                        ) : (
                          <div className="v7-item-placeholder">✦</div>
                        )}
                      </div>
                      <div className="v7-drawer-item-info">
                        <strong>{item.title}</strong>
                        <small>{item.detail}</small>
                      </div>
                      <div className="v7-drawer-item-action">
                        {isCurrent ? (
                          <span className="v7-item-applied-pill">
                            <Check size={14} /> Đang trưng
                          </span>
                        ) : (
                          <button type="button" className="v7-item-select-btn">
                            <Plus size={14} /> Chọn món
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!slotEligibleItems.length && (
                  <div className="v7-drawer-empty">
                    <p>Chưa có món phù hợp trong bộ sưu tập.</p>
                    <Link to="/shop" className="fw-text-button" onClick={handleCloseDrawer}>
                      Khám phá vật phẩm tại VieSHOP →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="v7-drawer-footer">
              <Link
                to={`/me?section=collection&type=${activeDrawerSlot}`}
                className="v7-drawer-collection-link"
                onClick={handleCloseDrawer}
              >
                Mở trong Bộ sưu tập riêng ↗
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Guestbook Section */}
      <RoomGuestbook fanId={state.fanProfile.id} isOwner={!isVisitorMode} />
    </section>
  );
}
