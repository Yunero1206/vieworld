import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X, Plus, Check, SlidersHorizontal, Shield, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from './AvatarRenderer';
import { ownedDigitalLook, MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import { DISPLAY_FIXTURES, displayedItems, displayOptions, displayAssetUrl, displayRoomAssetUrl, type DisplayItem, type DisplaySlot } from '../world/display';
import { DISPLAY_SURFACES, itemFootprint, readDisplaySurfaces, validateSurfaceSelection, type SurfaceSelection, type SurfacePreset } from '../world/displaySurfaces';
import { composeRoomSurface } from '../world/roomComposition';
import type { PublicFan } from '../world/community';
import { RoomGuestbook } from './RoomGuestbook';
import { loadPrivacySettings, type SpacePrivacySettings } from '../world/privacy';
import { RoomPolaroidModal } from './RoomPolaroidModal';

interface DisplayRoomSceneProps {
  fan: Pick<PublicFan, 'name' | 'look' | 'accessory' | 'appearance'> & { id?: string };
  items: DisplayItem[];
  surfaces?: Record<DisplaySlot, SurfaceSelection>;
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
  onOpenPolaroid?: () => void;
}

export function DisplayRoomScene({
  fan,
  items,
  surfaces,
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
  onOpenPolaroid,
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
        const it = surfaces ? items.find(i => surfaces[slot].itemIds.includes(i.id)) : items.find(i => i.slot === slot);
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
              {onOpenPolaroid && (
                <button
                  type="button"
                  className="v7-room-polaroid-btn"
                  onClick={onOpenPolaroid}
                  title="Chụp ảnh góc phòng chia sẻ nhanh"
                  aria-label="Chụp ảnh góc phòng chia sẻ nhanh"
                >
                  <Camera size={14} />
                  <span>Chụp ảnh phòng</span>
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
          src="/images/myspace-room-v2.png"
          width="1536"
          height="864"
          style={{ pointerEvents: 'none' }}
          onError={e => {
            e.currentTarget.style.visibility = 'hidden';
          }}
          alt="Studio cá nhân với giá áo, bảng vé, hốc huy hiệu, giá lightstick và tủ đĩa; không có salon"
        />

        {DISPLAY_FIXTURES.map(f => {
          const surface = DISPLAY_SURFACES.find(candidate => candidate.id === f.slot)!;
          const selection = surfaces?.[f.slot];
          const surfaceObjects = selection
            ? selection.itemIds.map(id => items.find(item => item.id === id)).filter((item): item is DisplayItem => Boolean(item))
            : items.filter(item => item.slot === f.slot);
          const item = surfaceObjects[0];
          const composition = composeRoomSurface(surface, surfaceObjects, selection);
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
              aria-label={`${DISPLAY_SURFACES.find(surface => surface.id === f.slot)?.label}: ${surfaceObjects.length ? surfaceObjects.map(object => object.title).join(', ') : 'chưa trưng bày'}`}
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
              {surfaceObjects.length ? (
                <span className="myspace-surface-composition">
                  {composition.map(({ item: object, anchor, focal }) => {
                    const roomAsset = displayRoomAssetUrl(object);
                    const sourceAsset = displayAssetUrl(object);
                    return <span key={object.id} className={`myspace-room-prop ${roomAsset ? 'is-cutout' : `is-${surface.type}`} ${focal ? 'is-focal' : ''}`}
                      style={{ left: `${anchor.x}%`, top: `${anchor.y}%`, width: `${anchor.width}%`, height: `${anchor.height}%`, zIndex: anchor.z, transform: `translate(-50%, -50%) rotate(${anchor.rotate}deg)` }}>
                      {roomAsset ? <img src={roomAsset} alt="" loading="lazy" /> : <span className="myspace-room-prop-matte">
                        {sourceAsset ? <img src={sourceAsset} alt="" loading="lazy" /> : <span className="myspace-room-prop-symbol">✦</span>}
                      </span>}
                    </span>;
                  })}
                </span>
              ) : isEditMode ? (
                <span className="v6-slot-empty">＋</span>
              ) : null}

              {isEditMode && item && (
                <span className="v7-fixture-edit-chip">Sửa</span>
              )}

              <span className="v6-fixture-label">{DISPLAY_SURFACES.find(surface => surface.id === f.slot)?.label || f.label}</span>
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
            const names = surfaces?.[f.slot].itemIds.map(id => items.find(item => item.id === id)?.title).filter(Boolean)
              || items.filter(item => item.slot === f.slot).map(item => item.title);
            return (
              <li key={f.slot}>
                <strong>{f.label}:</strong> {names.length ? names.join(', ') : 'Chưa trưng bày vật phẩm'}
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
  privacySettings: propPrivacy,
}: {
  onOpen: (panel: string) => void;
  onOpenPrivacy?: () => void;
  privacySettings?: SpacePrivacySettings;
}) {
  const { state, dispatch } = useApp();
  const privacy = propPrivacy || loadPrivacySettings();

  const [roomMode, setRoomMode] = useState<'view' | 'edit' | 'visitor'>('view');
  const [activeDrawerSlot, setActiveDrawerSlot] = useState<DisplaySlot | null>(null);
  const [isVinylPlaying, setIsVinylPlaying] = useState(false);
  const [isLightstickActive, setIsLightstickActive] = useState(true);
  const [heartsCount, setHeartsCount] = useState(19);
  const [isLiked, setIsLiked] = useState(false);
  const [isPolaroidOpen, setIsPolaroidOpen] = useState(false);

  const lastTriggerButtonRef = useRef<HTMLElement | null>(null);

  const displayed = useMemo(() => displayedItems(state), [state]);
  const allSlotOptions = useMemo(() => displayOptions(state), [state]);
  const selections = useMemo(() => readDisplaySurfaces(state.fanProfile, allSlotOptions), [state.fanProfile, allSlotOptions]);
  const [drawerNotice, setDrawerNotice] = useState('');

  const slotEligibleItems = useMemo(() => {
    if (!activeDrawerSlot) return [];
    const surface = DISPLAY_SURFACES.find(item => item.id === activeDrawerSlot);
    return allSlotOptions.filter(item => item.slot && surface?.allowedItemTypes.includes(item.slot));
  }, [allSlotOptions, activeDrawerSlot]);

  const activeFixtureConfig = DISPLAY_SURFACES.find(f => f.id === activeDrawerSlot);
  const currentSelection = activeDrawerSlot ? selections[activeDrawerSlot] : undefined;
  const currentSurfaceItems = currentSelection?.itemIds.map(id => displayed.find(item => item.id === id)).filter((item): item is (typeof displayed)[number] => Boolean(item)) || [];
  const currentUnits = currentSurfaceItems.reduce((total, item) => total + itemFootprint(item), 0);

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
    setDrawerNotice('');
    lastTriggerButtonRef.current = document.getElementById(`fixture-${slot}`);
    setActiveDrawerSlot(slot);
  };

  const handleCloseDrawer = () => {
    setActiveDrawerSlot(null);
    lastTriggerButtonRef.current?.focus();
  };

  const applySelection = (selection: SurfaceSelection, success: string) => {
    if (!activeDrawerSlot) return;
    const problem = validateSurfaceSelection(state.fanProfile, activeDrawerSlot, selection, allSlotOptions);
    if (problem) { setDrawerNotice(`${problem} Đổi món hoặc chọn chỗ khác.`); return; }
    dispatch({ type: 'SET_DISPLAY_SURFACE', surfaceId: activeDrawerSlot, selection });
    setDrawerNotice(success);
  };

  const handleApplyItem = (itemId: string) => {
    if (!currentSelection) return;
    applySelection({ ...currentSelection, itemIds: [...currentSelection.itemIds, itemId], focalItemId: currentSelection.focalItemId || itemId }, 'Đã đặt món vào phòng.');
  };

  const handleRemoveItem = (itemId: string) => {
    if (!currentSelection) return;
    const itemIds = currentSelection.itemIds.filter(id => id !== itemId);
    applySelection({ ...currentSelection, itemIds, focalItemId: currentSelection.focalItemId === itemId ? itemIds[0] : currentSelection.focalItemId }, 'Đã cất món. Bộ sưu tập vẫn còn nguyên.');
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
        surfaces={selections}
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
        showVisitCount={privacy.showVisitCount}
        isVisitorMode={isVisitorMode}
        onToggleVisitorMode={() => setRoomMode(m => (m === 'visitor' ? 'view' : 'visitor'))}
        onOpenPrivacy={onOpenPrivacy}
        onOpenPolaroid={() => setIsPolaroidOpen(true)}
      />

      {isEditMode && <nav className="myspace-mobile-surfaces" aria-label="Chọn khu vực trưng bày">
        {DISPLAY_SURFACES.map(surface => <button key={surface.id} type="button" onClick={() => handleSelectSlot(surface.id)}>
          <strong>{surface.label}</strong><small>{selections[surface.id].itemIds.length}/{surface.maxItems} món</small>
        </button>)}
      </nav>}

      <p className="vw-room-hint">
        {isEditMode
          ? 'Chọn một khu vực, chọn món bạn muốn giữ gần mình — phòng sẽ tự sắp xếp.'
          : isVisitorMode
          ? 'Đang xem phòng ở góc nhìn của khách ghé thăm.'
          : 'Một góc nhỏ cho những điều mình yêu.'}
      </p>

      {/* Visitor Projection: Warning if room is set to private */}
      {isVisitorMode && privacy.roomVisibility === 'private' && (
        <div
          className="v7-visitor-banner"
          style={{ background: '#FEF2F2', borderLeft: '4px solid #DC2626', margin: '12px 0' }}
          role="status"
          aria-live="polite"
        >
          <div className="v7-visitor-banner-info">
            <strong style={{ color: '#991B1B' }}>Phòng đang ở chế độ Riêng tư (Chỉ mình tôi)</strong>
            <p style={{ color: '#B91C1C' }}>
              Khách ghé thăm ngoài đời/trên mạng sẽ không nhìn thấy phòng và vật phẩm trưng bày này.
            </p>
          </div>
        </div>
      )}

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

            <p className="myspace-surface-capacity">
              {currentSurfaceItems.length}/{activeFixtureConfig?.maxItems || 5} món · {currentUnits}/{activeFixtureConfig?.capacityUnits || 0} sức chứa
            </p>
            <div className="myspace-layout-presets" aria-label="Kiểu tự sắp xếp">
              {([['balanced', 'Cân đối'], ['focus', 'Tập trung'], ['natural', 'Tự nhiên']] as [SurfacePreset, string][]).map(([preset, label]) => (
                <button key={preset} type="button" aria-pressed={currentSelection?.layoutPreset === preset}
                  onClick={() => currentSelection && applySelection({ ...currentSelection, layoutPreset: preset }, 'Đã sắp lại khu vực.')}>
                  {label}
                </button>
              ))}
              <button type="button" onClick={() => currentSelection && applySelection({
                ...currentSelection,
                itemIds: currentSelection.itemIds.length > 1 ? [...currentSelection.itemIds.slice(1), currentSelection.itemIds[0]] : currentSelection.itemIds,
              }, 'Đã sắp lại các món.')}>Sắp lại ↻</button>
            </div>
            {currentSurfaceItems.length > 0 && <div className="v7-slot-current-section">
              <span className="v7-slot-section-title">Đang trưng bày</span>
              {currentSurfaceItems.map(item => <div className="v7-slot-current-card" key={item.id}>
                <div className="v7-drawer-item-media">{displayAssetUrl(item) ? <img src={displayAssetUrl(item)} alt="" /> : <span className="v6-trophy">✦</span>}</div>
                <div className="v7-drawer-item-info"><strong>{item.title}</strong><small>{itemFootprint(item)} sức chứa</small></div>
                <div className="myspace-surface-item-actions">
                  <button type="button" aria-pressed={currentSelection?.focalItemId === item.id}
                    onClick={() => currentSelection && applySelection({ ...currentSelection, focalItemId: item.id }, 'Đã đặt làm điểm nhấn.')}>Đặt làm điểm nhấn</button>
                  <button type="button" onClick={() => handleRemoveItem(item.id)}>Gỡ khỏi phòng</button>
                </div>
              </div>)}
            </div>}
            {drawerNotice && <p className="myspace-drawer-notice" role="status">{drawerNotice}</p>}
            {currentSurfaceItems.length >= (activeFixtureConfig?.maxItems || 5) && <p className="myspace-drawer-notice" role="status">Khu vực này đã đầy. Đổi món bằng cách gỡ một món, hoặc chọn chỗ khác.</p>}

            <div className="v7-slot-candidates-section">
              <span className="v7-slot-section-title">
                Món phù hợp trong Bộ sưu tập ({slotEligibleItems.length})
              </span>

              <div className="v7-drawer-items-list">
                {slotEligibleItems.map(item => {
                  const isCurrent = currentSelection?.itemIds.includes(item.id);
                  const isElsewhere = Object.entries(selections).some(([id, surface]) => id !== activeDrawerSlot && surface.itemIds.includes(item.id));
                  const canFit = currentSurfaceItems.length < (activeFixtureConfig?.maxItems || 0) && currentUnits + itemFootprint(item) <= (activeFixtureConfig?.capacityUnits || 0);
                  return (
                    <div
                      key={item.id}
                      className={`v7-drawer-item-card ${isCurrent ? 'selected' : ''}`}
                    >
                      <div className="v7-drawer-item-media">
                        {displayAssetUrl(item) ? (
                          <img src={displayAssetUrl(item)} alt={item.title} />
                        ) : (
                          <div className="v7-item-placeholder">✦</div>
                        )}
                      </div>
                      <div className="v7-drawer-item-info">
                        <strong>{item.title}</strong>
                        <small>{itemFootprint(item)} sức chứa{isElsewhere ? ' · Đang ở chỗ khác' : ''}</small>
                      </div>
                      <div className="v7-drawer-item-action">
                        {isCurrent ? (
                          <span className="v7-item-applied-pill">
                            <Check size={14} /> Đang trưng
                          </span>
                        ) : (
                          <button type="button" className="v7-item-select-btn" disabled={isElsewhere || !canFit} onClick={() => handleApplyItem(item.id)}>
                            <Plus size={14} /> {canFit ? 'Đặt vào phòng' : 'Khu vực đã đầy'}
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
              <div className="myspace-other-surfaces" aria-label="Chọn chỗ khác">
                {DISPLAY_SURFACES.filter(surface => surface.id !== activeDrawerSlot).map(surface => <button key={surface.id} type="button" onClick={() => { setDrawerNotice(''); setActiveDrawerSlot(surface.id); }}>{surface.label}</button>)}
              </div>
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
      {privacy.guestbookEnabled ? (
        <RoomGuestbook fanId={state.fanProfile.id} isOwner={!isVisitorMode} />
      ) : (
        <div
          className="v7-guestbook-disabled-note"
          style={{
            padding: '24px',
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: '13px',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            margin: '20px 0',
            border: '1px dashed var(--border)',
          }}
        >
          <p>Chủ phòng đã tạm ẩn sổ lưu bút.</p>
        </div>
      )}

      <RoomPolaroidModal
        isOpen={isPolaroidOpen}
        onClose={() => setIsPolaroidOpen(false)}
        fanName={state.fanProfile.displayName}
        avatarPreset={state.fanProfile.avatarPreset}
        digitalLook={ownedDigitalLook(state)}
        accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
        mood={state.fanProfile.publicIdentity?.mood}
        companionDays={128}
        items={displayed}
        fanId={state.fanProfile.id}
      />
    </section>
  );
}
