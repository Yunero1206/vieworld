import { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, X, Plus, Check, SlidersHorizontal, Shield, Camera, MoreHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from './AvatarRenderer';
import { ownedDigitalLook } from '../world/merchCatalog';
import { DISPLAY_FIXTURES, displayedItems, displayOptions, displayAssetUrl, type DisplayItem, type DisplaySlot } from '../world/display';
import { DISPLAY_SURFACES, itemFootprint, readDisplaySurfaces, surfaceSupportsItem, validateSurfaceSelection, type SurfaceSelection } from '../world/displaySurfaces';
import { composeRoomSurface, ROOM_SURFACE_BOUNDS } from '../world/roomComposition';
import {CatalogItemArt,hasCatalogItemArt} from './CatalogItemArt';
import { RoomPropVisual } from './RoomPropVisual';
import type { PublicFan } from '../world/community';
import { loadPrivacySettings, type SpacePrivacySettings } from '../world/privacy';
import { RoomPolaroidModal } from './RoomPolaroidModal';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { matchesVietnameseQuery } from '../utils/textSearch';

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
  compact?: boolean;
  isVisitorMode?: boolean;
  onToggleVisitorMode?: () => void;
  onOpenPrivacy?: () => void;
  onOpenPolaroid?: () => void;
  onOpenAvatar?: () => void;
  onOpenGuestbook?: () => void;
  previewItemId?: string;
}

export function DisplayRoomScene({
  fan,
  items,
  surfaces,
  onSelect,
  isLightstickActive = true,
  onToggleLightstick,
  heartsCount = 0,
  onLike,
  isLiked = false,
  isEditMode = false,
  onToggleEditMode,
  isOwner = false,
  showVisitCount = false,
  compact = false,
  isVisitorMode = false,
  onToggleVisitorMode,
  onOpenPrivacy,
  onOpenPolaroid,
  onOpenAvatar,
  onOpenGuestbook,
  previewItemId,
}: DisplayRoomSceneProps) {
  const [ambientFeedback, setAmbientFeedback] = useState<string | null>(null);
  const feedbackTimeout = useRef<number | null>(null);
  useEffect(() => () => { if (feedbackTimeout.current) window.clearTimeout(feedbackTimeout.current); }, []);

  const triggerFeedback = (msg: string) => {
    setAmbientFeedback(msg);
    if (feedbackTimeout.current) window.clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = window.setTimeout(() => setAmbientFeedback(null), 2400);
  };

  const handleFixtureClick = (slot: DisplaySlot) => {
    onSelect(slot);

    if (!isEditMode) {
      const it = surfaces ? items.find(i => surfaces[slot].itemIds.includes(i.id)) : items.find(i => i.slot === slot);
      if (slot === 'lightstick' && it && onToggleLightstick) {
        onToggleLightstick();
        triggerFeedback(!isLightstickActive ? 'Đã bật ánh sáng fandom' : 'Đã tắt ánh sáng fandom');
      } else {
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
      {!compact && <div className="v7-room-social-bar">
        <div className="v7-social-left">
          {showVisitCount && (
            <span className="v7-visitor-counter">Phòng minh họa</span>
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
              <details className="presence-room-tools"><summary aria-label="Tùy chọn phòng"><MoreHorizontal size={20}/></summary><div>
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
              </div></details>
            </div>
          )}
        </div>
      </div>}

      <div className={`v6-display-scene ${isEditMode ? 'is-edit-mode' : 'is-view-mode'}`}>
        <img
          className="v6-room-art"
          src="/images/myspace-room-v2.png"
          width="1672"
          height="941"
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
          const bounds = ROOM_SURFACE_BOUNDS[f.slot];
          const isVinylSlot = f.slot === 'disc';
          const isLightSlot = f.slot === 'lightstick';
          const glowClass = isLightSlot && item && isLightstickActive ? 'v7-lightstick-glow' : '';

          return (
            <button
              id={`fixture-${f.slot}`}
              className={`v6-fixture v6-fixture-${f.slot} ${item ? 'occupied' : ''} ${glowClass} ${
                isEditMode ? 'edit-hotspot' : 'view-hotspot'
              }`}
              key={f.slot}
              style={{
                left: `${bounds.x}%`,
                top: `${bounds.y}%`,
                width: `${bounds.width}%`,
                height: `${bounds.height}%`,
                minWidth: 0,
                minHeight: 0,
                pointerEvents: 'auto',
              }}
              onClick={() => handleFixtureClick(f.slot)}
              aria-label={`${DISPLAY_SURFACES.find(surface => surface.id === f.slot)?.label}: ${surfaceObjects.length ? surfaceObjects.map(object => object.title).join(', ') : 'chưa trưng bày'}`}
              title={
                !isEditMode && isVinylSlot && item
                  ? 'Album trên giá trưng: Nhấn để xem vật phẩm'
                  : !isEditMode && isLightSlot && item
                  ? isLightstickActive ? 'Lightstick: Nhấn để tắt sáng' : 'Lightstick: Nhấn để bật sáng'
                  : isEditMode
                  ? `Chỉnh sửa vị trí ${f.label}`
                  : undefined
              }
            >
              {surfaceObjects.length ? (
                <span className="myspace-surface-composition">
                  {composition.map(({ item: object, anchor, focal }) => {
                    return <span key={object.id} className={`myspace-room-prop is-${surface.type} ${focal ? 'is-focal' : ''} ${object.id===previewItemId?'is-ghost':''}`} data-room-item={object.id}
                      style={{ left: `${anchor.x}%`, top: `${anchor.y}%`, width: `${anchor.width}%`, height: `${anchor.height}%`, zIndex: anchor.z, transformOrigin: `50% ${anchor.pivotY}%`, transform: `translate(-50%, -${anchor.pivotY}%) rotate(${anchor.rotate}deg)` }}>
                      <RoomPropVisual item={object}/>
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

        <button type="button" className="v6-room-avatar" onClick={onOpenAvatar} disabled={!onOpenAvatar} aria-label="Đổi diện mạo avatar">
          <AvatarRenderer
            appearance={fan.appearance}
            role="fan"
            size="preview"
            displayName={fan.name}
            digitalLook={fan.look}
            accessoryId={fan.accessory}
          />
          <span>{fan.name}</span>
        </button>
        {onOpenGuestbook&&!isEditMode&&<button type="button" className="presence-room-guestbook-trigger" onClick={onOpenGuestbook} aria-label="Sổ lưu bút"><img src="/images/presence-guestbook-table.webp" alt="" width="420" height="420"/><span>Sổ lưu bút</span></button>}
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
  onOpen,
  onOpenPrivacy,
  privacySettings: propPrivacy,
}: {
  onOpen: (panel: string) => void;
  onOpenPrivacy?: () => void;
  privacySettings?: SpacePrivacySettings;
}) {
  const { state, dispatch } = useApp();
  const [roomParams,setRoomParams]=useSearchParams();
  const privacy = propPrivacy || loadPrivacySettings(state.activeTenantId, state.fanProfile.id);

  const [roomMode, setRoomMode] = useState<'view' | 'edit' | 'visitor'>('view');
  const [activeDrawerSlot, setActiveDrawerSlot] = useState<DisplaySlot | null>(null);
  const [isLightstickActive, setIsLightstickActive] = useState(true);
  const [heartsCount, setHeartsCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPolaroidOpen, setIsPolaroidOpen] = useState(false);

  const lastTriggerButtonRef = useRef<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const displayed = useMemo(() => displayedItems(state), [state]);
  const allSlotOptions = useMemo(() => displayOptions(state), [state]);
  const selections = useMemo(() => readDisplaySurfaces(state.fanProfile, allSlotOptions), [state.fanProfile, allSlotOptions]);
  const [drawerNotice, setDrawerNotice] = useState('');
  const [preview,setPreview]=useState<{slot:DisplaySlot;selection:SurfaceSelection;from?:DisplaySlot}|null>(null);
  const [ghost,setGhost]=useState<typeof preview>(null);
  const [itemQuery,setItemQuery]=useState('');
  const projectPreview=(value:typeof preview)=>value?{...selections,...(value.from?{[value.from]:{...selections[value.from],itemIds:selections[value.from].itemIds.filter(id=>!value.selection.itemIds.includes(id))}}:{}),[value.slot]:value.selection}:selections;
  const selectedSurfaces=projectPreview(preview);
  const previewSurfaces=projectPreview(ghost||preview);
  useEffect(()=>{
    const itemId=roomParams.get('place');const slot=roomParams.get('surface') as DisplaySlot;
    const surface=DISPLAY_SURFACES.find(s=>s.id===slot);const item=allSlotOptions.find(i=>i.id===itemId);
    if(!item||!surface||!surfaceSupportsItem(surface,item)||selections[slot].itemIds.includes(item.id))return;
    const from=DISPLAY_SURFACES.find(s=>s.id!==slot&&selections[s.id].itemIds.includes(item.id))?.id;
    const selection={...selections[slot],itemIds:[...selections[slot].itemIds,item.id]};
    const profile=from?{...state.fanProfile,displaySurfaces:{...selections,[from]:{...selections[from],itemIds:selections[from].itemIds.filter(id=>id!==item.id)}}}:state.fanProfile;
    const problem=validateSurfaceSelection(profile,slot,selection,allSlotOptions);
    setActiveDrawerSlot(slot);if(problem){setDrawerNotice(problem);return;}
    setPreview({slot,selection,from});setDrawerNotice('Xem thử trong phòng. Chọn Đặt ở đây để lưu.');
  },[roomParams.get('place'),roomParams.get('surface')]);


  const slotEligibleItems = useMemo(() => {
    if (!activeDrawerSlot) return [];
    const surface = DISPLAY_SURFACES.find(item => item.id === activeDrawerSlot);
    return allSlotOptions.filter(item => surface && surfaceSupportsItem(surface, item)&&matchesVietnameseQuery(item.title,itemQuery));
  }, [allSlotOptions, activeDrawerSlot,itemQuery]);

  const activeFixtureConfig = DISPLAY_SURFACES.find(f => f.id === activeDrawerSlot);
  const currentSelection = activeDrawerSlot ? selectedSurfaces[activeDrawerSlot] : undefined;
  const currentSurfaceItems = currentSelection?.itemIds.map(id => allSlotOptions.find(item => item.id === id)).filter((item): item is (typeof displayed)[number] => Boolean(item)) || [];
  const currentUnits = currentSurfaceItems.reduce((total, item) => total + itemFootprint(item), 0);

  const handleSelectSlot = (slot: DisplaySlot, trigger?: HTMLElement) => {
    if(roomMode==='visitor')return;
    if(slot==='shirt'&&roomMode==='view'){onOpen('wardrobe');return;}
    setPreview(null);setGhost(null);setItemQuery('');
    setDrawerNotice('');
    lastTriggerButtonRef.current = trigger || document.getElementById(`fixture-${slot}`);
    setActiveDrawerSlot(slot);
  };

  const handleCloseDrawer = () => {
    setActiveDrawerSlot(null);setPreview(null);setGhost(null);if(roomParams.has('place'))setRoomParams({},{replace:true});
    lastTriggerButtonRef.current?.focus();
  };
  useDialogA11y(Boolean(activeDrawerSlot), handleCloseDrawer, drawerRef);

  const applySelection = (selection: SurfaceSelection, success: string) => {
    if (!activeDrawerSlot) return;
    const problem = validateSurfaceSelection(state.fanProfile, activeDrawerSlot, selection, allSlotOptions);
    if (problem) { setDrawerNotice(`${problem} Đổi món hoặc chọn chỗ khác.`); return; }
    setPreview({slot:activeDrawerSlot,selection});
    setGhost(null);
    setDrawerNotice('Xem thử trong phòng. Chọn Đặt ở đây để lưu.');
    void success;
  };

  const handleApplyItem = (itemId: string) => {
    if (!currentSelection) return;
    applySelection({ ...currentSelection, itemIds: [...currentSelection.itemIds, itemId], focalItemId: currentSelection.focalItemId || itemId }, 'Đã đặt món vào phòng.');
  };

  const previewCandidate=(itemId:string):typeof preview=>{
    if(!activeDrawerSlot||!currentSelection||currentSelection.itemIds.includes(itemId))return null;
    const item=allSlotOptions.find(i=>i.id===itemId);
    if(!item||Object.entries(selections).some(([id,s])=>id!==activeDrawerSlot&&s.itemIds.includes(itemId)))return null;
    const canFit=currentSurfaceItems.length<(activeFixtureConfig?.maxItems||0)&&currentUnits+itemFootprint(item)<=(activeFixtureConfig?.capacityUnits||0);
    const replaceId=currentSelection.focalItemId||currentSelection.itemIds[0];
    const selection=canFit?{...currentSelection,itemIds:[...currentSelection.itemIds,itemId],focalItemId:currentSelection.focalItemId||itemId}
      :{...currentSelection,itemIds:currentSelection.itemIds.map(id=>id===replaceId?itemId:id),focalItemId:itemId};
    if(!selection.itemIds.includes(itemId)||validateSurfaceSelection(state.fanProfile,activeDrawerSlot,selection,allSlotOptions))return null;
    return {slot:activeDrawerSlot,selection,from:preview?.from};
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
    <section className="v6-personal-room" data-preview-state={ghost?'hover':preview?'selected':undefined} aria-label="My Space — năm vị trí trưng bày">
      <DisplayRoomScene
        fan={{
          id: state.fanProfile.id,
          name: state.fanProfile.displayName,
          look: ownedDigitalLook(state),
          accessory: state.fanProfile.wardrobeChoice?.accessoryId,
          appearance: state.fanProfile.avatarPreset,
        }}
        items={allSlotOptions}
        surfaces={previewSurfaces}
        previewItemId={ghost?.selection.itemIds.find(id=>!currentSelection?.itemIds.includes(id))}
        onSelect={handleSelectSlot}
        isLightstickActive={isLightstickActive}
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
        onOpenAvatar={!isVisitorMode?()=>onOpen('avatar'):undefined}
        onOpenGuestbook={privacy.guestbookEnabled&&!isVisitorMode?()=>onOpen('guestbook'):undefined}
      />

      {!isVisitorMode && <nav className="myspace-mobile-surfaces" aria-label="Chọn khu vực trưng bày">
        {DISPLAY_SURFACES.map(surface => <button key={surface.id} type="button" onClick={event => handleSelectSlot(surface.id, event.currentTarget)}>
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
                {hasCatalogItemArt(item.id) ? <CatalogItemArt id={item.id} title={item.title}/> : item.image && (
                  <img
                    src={displayAssetUrl(item)}
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
            ref={drawerRef}
            tabIndex={-1}
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
              >
                <X size={18} />
              </button>
            </div>

            <p className="myspace-surface-capacity">
              {currentSurfaceItems.length}/{activeFixtureConfig?.maxItems || 5} món · {currentUnits}/{activeFixtureConfig?.capacityUnits || 0} sức chứa
            </p>
            {activeFixtureConfig && currentSurfaceItems.length > activeFixtureConfig.maxItems && <p className="myspace-drawer-notice" role="status">Bố cục cũ được giữ nguyên. Khu vực này hiện phù hợp tối đa {activeFixtureConfig.maxItems} món; bạn có thể cất bớt, không mất món trong Bộ sưu tập.</p>}
            <label className="presence-room-search">Tìm trong khu vực<input value={itemQuery} onChange={e=>setItemQuery(e.target.value)} placeholder="Tên vật phẩm…"/></label>
            {currentSurfaceItems.length > 0 && <div className="v7-slot-current-section">
              <span className="v7-slot-section-title">Đang trưng bày</span>
              {currentSurfaceItems.map(item => <div className="v7-slot-current-card" key={item.id}>
                <div className="v7-drawer-item-media">{hasCatalogItemArt(item.id)?<CatalogItemArt id={item.id} title={item.title}/>:displayAssetUrl(item) ? <img src={displayAssetUrl(item)} alt="" /> : <span className="v6-trophy">✦</span>}</div>
                <div className="v7-drawer-item-info"><strong>{item.title}</strong><small>Trong bộ sưu tập</small></div>
                <div className="myspace-surface-item-actions">
                  <button type="button" onClick={() => handleRemoveItem(item.id)}>Gỡ khỏi phòng</button>
                </div>
              </div>)}
            </div>}
            {drawerNotice && <p className="myspace-drawer-notice" role="status">{drawerNotice}</p>}
            {(currentSurfaceItems.length >= (activeFixtureConfig?.maxItems || 5) || currentUnits >= (activeFixtureConfig?.capacityUnits || 0)) && <p className="myspace-drawer-notice" role="status">Khu vực này đã đầy. Chọn Đổi món, hoặc chọn chỗ khác bên dưới.</p>}

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
                        {hasCatalogItemArt(item.id)?<CatalogItemArt id={item.id} title={item.title}/>:displayAssetUrl(item) ? (
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
                          <button type="button" className="v7-item-select-btn" disabled={isElsewhere || (!canFit && !currentSurfaceItems.length)} onMouseEnter={()=>setGhost(previewCandidate(item.id))} onMouseLeave={()=>setGhost(null)} onFocus={()=>setGhost(previewCandidate(item.id))} onBlur={()=>setGhost(null)} onClick={() => {
                            if (canFit) handleApplyItem(item.id);
                            else if (currentSelection) {
                              const replaceId = currentSelection.focalItemId || currentSelection.itemIds[0];
                              const next = { ...currentSelection, itemIds: currentSelection.itemIds.map(id => id === replaceId ? item.id : id), focalItemId: item.id };
                              const problem = validateSurfaceSelection(state.fanProfile, activeDrawerSlot, next, allSlotOptions);
                              if (problem) { setDrawerNotice('Món này chưa vừa chỗ. Cất bớt một món hoặc chọn khu vực khác.'); return; }
                              applySelection(next, 'Đã đổi món điểm nhấn. Món cũ vẫn ở Bộ sưu tập.');
                            }
                          }}>
                            <Plus size={14} /> {isElsewhere ? 'Đang ở chỗ khác' : canFit ? 'Đặt vào phòng' : 'Đổi món điểm nhấn'}
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

            {preview&&<div className="presence-room-preview-confirm"><button onClick={()=>{if(preview.from)dispatch({type:'SET_DISPLAY_SURFACE',surfaceId:preview.from,selection:selectedSurfaces[preview.from]});dispatch({type:'SET_DISPLAY_SURFACE',surfaceId:preview.slot,selection:preview.selection});if(roomParams.has('place'))setRoomParams({},{replace:true});setPreview(null);setGhost(null);setDrawerNotice('Đã lưu trong phòng.');}}>Đặt ở đây</button><button onClick={()=>{setPreview(null);setGhost(null);setDrawerNotice('');}}>Hủy xem thử</button></div>}
            <div className="v7-drawer-footer">
              <div className="myspace-other-surfaces" aria-label="Chọn chỗ khác">
                {DISPLAY_SURFACES.filter(surface => surface.id !== activeDrawerSlot).map(surface => <button key={surface.id} type="button" onClick={() => { setDrawerNotice('');setPreview(null);setGhost(null);setItemQuery(''); setActiveDrawerSlot(surface.id); }}>{surface.label}</button>)}
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

      <RoomPolaroidModal
        isOpen={isPolaroidOpen}
        onClose={() => setIsPolaroidOpen(false)}
        fanName={state.fanProfile.displayName}
        avatarPreset={state.fanProfile.avatarPreset}
        digitalLook={ownedDigitalLook(state)}
        accessoryId={state.fanProfile.wardrobeChoice?.accessoryId}
        mood={state.fanProfile.publicIdentity?.mood}
        companionDays={0}
        items={displayed}
        fanId={state.fanProfile.id}
      />
    </section>
  );
}
