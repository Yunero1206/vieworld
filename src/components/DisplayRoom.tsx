import { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, X, Check, SlidersHorizontal, Shield, Camera, MoreHorizontal, ArrowRight, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from './AvatarRenderer';
import { ownedDigitalLook } from '../world/merchCatalog';
import { DISPLAY_FIXTURES, displayedItems, displayOptions, displayAssetUrl, type DisplayItem, type DisplaySlot } from '../world/display';
import { DISPLAY_SURFACES, itemFootprint, readDisplaySurfaces, surfaceSupportsItem, validateDisplaySurfaces, planRoomPlacement, removeRoomItem, roomCandidates, type RoomSurfaces, type SurfaceSelection } from '../world/displaySurfaces';
import { roomItemLabel } from '../world/roomItemKinds';
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
  pendingItemIds?: string[];
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
  pendingItemIds = [],
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
                    return <span key={object.id} className={`myspace-room-prop is-${surface.type} ${focal ? 'is-focal' : ''} ${object.id===previewItemId||pendingItemIds.includes(object.id)?'is-ghost':''}`} data-room-item={object.id}
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
  const [draft,setDraft]=useState<RoomSurfaces|null>(null);
  const [ghost,setGhost]=useState<{surfaces:RoomSurfaces;itemId:string}|null>(null);
  const [replacement,setReplacement]=useState<{incoming?:string;outgoing?:string}|null>(null);
  const [itemQuery,setItemQuery]=useState('');
  const selectedSurfaces=draft||selections;
  const previewSurfaces=ghost?.surfaces||selectedSurfaces;
  useEffect(()=>{
    const itemId=roomParams.get('place');const slot=roomParams.get('surface') as DisplaySlot;
    const surface=DISPLAY_SURFACES.find(s=>s.id===slot);const item=allSlotOptions.find(i=>i.id===itemId);
    if(!item||!surface||!surfaceSupportsItem(surface,item)||selections[slot].itemIds.includes(item.id))return;
    const plan=planRoomPlacement(state.fanProfile,selections,slot,item.id,allSlotOptions);
    setActiveDrawerSlot(slot);
    if(plan.problem){setDrawerNotice(plan.problem);if(plan.problem==='Khu vực này đã đầy.')setReplacement({incoming:item.id});return;}
    setDraft(plan.surfaces!);setDrawerNotice('Đang xem thử trong phòng.');
  },[roomParams.get('place'),roomParams.get('surface')]);


  const candidates=activeDrawerSlot?roomCandidates(activeDrawerSlot,selectedSurfaces,allSlotOptions):[];
  const showItemSearch=candidates.length>=6;
  const slotEligibleItems=candidates.filter(item=>!showItemSearch||matchesVietnameseQuery(`${item.title} ${state.worlds[item.worldId||'']?.name||''}`,itemQuery));

  const activeFixtureConfig = DISPLAY_SURFACES.find(f => f.id === activeDrawerSlot);
  const currentSelection = activeDrawerSlot ? selectedSurfaces[activeDrawerSlot] : undefined;
  const currentSurfaceItems = currentSelection?.itemIds.map(id => allSlotOptions.find(item => item.id === id)).filter((item): item is (typeof displayed)[number] => Boolean(item)) || [];
  const currentUnits = currentSurfaceItems.reduce((total, item) => total + itemFootprint(item), 0);

  const handleSelectSlot = (slot: DisplaySlot, trigger?: HTMLElement) => {
    if(roomMode==='visitor')return;
    setGhost(null);setReplacement(null);setItemQuery('');
    setDrawerNotice('');
    lastTriggerButtonRef.current = trigger || document.getElementById(`fixture-${slot}`);
    setActiveDrawerSlot(slot);
  };

  const handleCloseDrawer = () => {
    setActiveDrawerSlot(null);setDraft(null);setGhost(null);setReplacement(null);setItemQuery('');if(roomParams.has('place'))setRoomParams({},{replace:true});
    lastTriggerButtonRef.current?.focus();
  };
  useDialogA11y(Boolean(activeDrawerSlot), handleCloseDrawer, drawerRef, undefined, false);

  const handleApplyItem = (itemId: string, replaceId=replacement?.outgoing) => {
    if (!activeDrawerSlot) return;
    const plan=planRoomPlacement(state.fanProfile,selectedSurfaces,activeDrawerSlot,itemId,allSlotOptions,replaceId);
    if(plan.problem){
      setGhost(null);setDrawerNotice(plan.problem);
      if(plan.problem==='Khu vực này đã đầy.')setReplacement({incoming:itemId});
      return;
    }
    setDraft(plan.surfaces!);setGhost(null);setReplacement(null);setDrawerNotice('Đang xem thử trong phòng.');
  };

  const previewCandidate=(itemId:string):typeof ghost=>{
    if(!activeDrawerSlot||!currentSelection||currentSelection.itemIds.includes(itemId))return null;
    const plan=planRoomPlacement(state.fanProfile,selectedSurfaces,activeDrawerSlot,itemId,allSlotOptions,replacement?.outgoing);
    return plan.surfaces?{surfaces:plan.surfaces,itemId}:null;
  };

  const handleRemoveItem = (itemId: string) => {
    if (!activeDrawerSlot) return;
    setDraft(removeRoomItem(selectedSurfaces,activeDrawerSlot,itemId));setGhost(null);setReplacement(null);
    setDrawerNotice('Đã gỡ trong bản xem thử. Món vẫn ở Bộ sưu tập.');
  };
  const itemDescription=(item:DisplayItem)=>[roomItemLabel(item),state.worlds[item.worldId||'']?.name].filter(Boolean).join(' · ');
  const hasRoomChanges=Boolean(draft&&JSON.stringify(draft)!==JSON.stringify(selections));
  const surfaceFull=Boolean(activeFixtureConfig&&(currentSurfaceItems.length>=activeFixtureConfig.maxItems||currentUnits>=activeFixtureConfig.capacityUnits));
  const saveRoom=()=>{
    if(!draft)return;
    const problem=validateDisplaySurfaces(state.fanProfile,draft,allSlotOptions);
    if(problem){setDrawerNotice(problem);return;}
    dispatch({type:'SET_DISPLAY_SURFACES',surfaces:draft});
    if(roomParams.has('place'))setRoomParams({},{replace:true});
    setDraft(null);setGhost(null);setReplacement(null);setDrawerNotice('Đã lưu thay đổi.');
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
    <section className="v6-personal-room" data-preview-state={ghost?'hover':hasRoomChanges?'selected':undefined} aria-label="My Space — năm vị trí trưng bày">
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
        previewItemId={ghost?.itemId}
        pendingItemIds={DISPLAY_SURFACES.flatMap(surface=>selectedSurfaces[surface.id].itemIds.filter(id=>!selections[surface.id].itemIds.includes(id)))}
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

      {!isVisitorMode && <nav className={`myspace-mobile-surfaces${activeDrawerSlot?' is-drawer-open':''}`} aria-label="Chọn khu vực trưng bày">
        {DISPLAY_SURFACES.map(surface => <button key={surface.id} type="button" onClick={event => handleSelectSlot(surface.id, event.currentTarget)}>
          <strong>{surface.label}</strong><small>{selectedSurfaces[surface.id].itemIds.length}/{surface.maxItems} món</small>
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
        <div className="v7-drawer-backdrop">
          <div
            ref={drawerRef}
            tabIndex={-1}
            className="v7-slot-picker-drawer"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="false"
            aria-label={`Trưng bày ${activeFixtureConfig?.label}`}
          >
            <div className="v7-drawer-header">
              <div>
                <h3>{activeFixtureConfig?.label}</h3>
                <p className="myspace-surface-capacity">{currentSurfaceItems.length}/{activeFixtureConfig?.maxItems} món</p>
              </div>
              <button
                className="v7-drawer-close-btn"
                onClick={handleCloseDrawer}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <label className="myspace-drawer-mobile-context">
              <span className="sr-only">Đổi khu vực trưng bày</span>
              <select value={activeDrawerSlot} onChange={event=>handleSelectSlot(event.target.value as DisplaySlot, event.currentTarget)}>
                {DISPLAY_SURFACES.map(surface=><option key={surface.id} value={surface.id}>{surface.label}</option>)}
              </select>
            </label>

            <div className="myspace-drawer-body">
            <div className="v7-slot-current-section">
              <h4 className="v7-slot-section-title">Đang trưng bày</h4>
              {!currentSurfaceItems.length&&<p className="myspace-drawer-empty-current">Chưa trưng bày món nào.</p>}
              {currentSurfaceItems.map(item => <div className="v7-slot-current-card" key={item.id}>
                <div className="v7-drawer-item-media">{hasCatalogItemArt(item.id)?<CatalogItemArt id={item.id} title={item.title}/>:displayAssetUrl(item) ? <img src={displayAssetUrl(item)} alt="" /> : <span className="v6-trophy">✦</span>}</div>
                <div className="v7-drawer-item-info"><strong>{item.title}</strong><small>{itemDescription(item)}</small></div>
                <div className="myspace-surface-item-actions">
                  <button type="button" onClick={() => handleRemoveItem(item.id)} aria-label={`Gỡ ${item.title}`}>Gỡ</button>
                  {(surfaceFull||replacement)&&candidates.length>0&&<button type="button" aria-label={replacement?.incoming?'Thay bằng món đã chọn':undefined} aria-pressed={replacement?.outgoing===item.id} onClick={()=>{
                    if(replacement?.incoming)handleApplyItem(replacement.incoming,item.id);
                    else{setReplacement({outgoing:item.id});setGhost(null);setDrawerNotice('Chọn món bên dưới để thay.');}
                  }}>Thay món này</button>}
                </div>
              </div>)}
            </div>
            {drawerNotice && <p className="myspace-drawer-notice" role="status">{drawerNotice}</p>}
            {surfaceFull&&drawerNotice!=='Khu vực này đã đầy.'&&<p className="myspace-drawer-notice">Khu vực này đã đầy.</p>}
            {replacement&&<div className="myspace-replacement-notice" role="status">
              <p>{replacement.incoming?`Chọn món đang trưng bày để thay bằng ${allSlotOptions.find(item=>item.id===replacement.incoming)?.title}.`:`Thay ${allSlotOptions.find(item=>item.id===replacement.outgoing)?.title} bằng một món bên dưới.`}</p>
              <button type="button" onClick={()=>{setReplacement(null);setGhost(null);setDrawerNotice('');}}>Hủy chọn</button>
            </div>}

            <div className="v7-slot-candidates-section">
              <h4 className="v7-slot-section-title">Có thể đặt ở đây</h4>
              {showItemSearch&&<label className="presence-room-search">Tìm trong Bộ sưu tập<input value={itemQuery} onChange={e=>setItemQuery(e.target.value)} placeholder="Tên vật phẩm…"/></label>}

              <div className="v7-drawer-items-list">
                {slotEligibleItems.map(item => {
                  const elsewhere=DISPLAY_SURFACES.find(surface=>surface.id!==activeDrawerSlot&&selectedSurfaces[surface.id].itemIds.includes(item.id));
                  return (
                    <div
                      key={item.id}
                      className="v7-drawer-item-card"
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
                        <small>{itemDescription(item)}</small>
                        {elsewhere&&<small className="myspace-item-location"><MapPin size={12}/>Đang ở {elsewhere.label}</small>}
                      </div>
                      <div className="v7-drawer-item-action">
                        <button type="button" className="v7-item-select-btn" onMouseEnter={()=>setGhost(previewCandidate(item.id))} onMouseLeave={()=>setGhost(null)} onFocus={()=>setGhost(previewCandidate(item.id))} onBlur={()=>setGhost(null)} onClick={()=>handleApplyItem(item.id)}>
                          {replacement?.outgoing?'Thay món này':elsewhere?'Chuyển tới đây':'Đặt vào đây'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {!slotEligibleItems.length && (
                  <div className="v7-drawer-empty">
                    <p>{showItemSearch&&itemQuery?'Không tìm thấy món phù hợp.':'Chưa có món phù hợp trong Bộ sưu tập.'}</p>
                    {!candidates.length&&!currentSurfaceItems.length&&<Link to="/shop" className="fw-text-button" onClick={handleCloseDrawer}>Khám phá VieCollect <ArrowRight size={16}/></Link>}
                  </div>
                )}
              </div>
            </div>
            </div>
            <div className="v7-drawer-footer">
              {hasRoomChanges&&<div className="presence-room-preview-confirm"><button type="button" onClick={()=>{setDraft(null);setGhost(null);setReplacement(null);setDrawerNotice('');}}>Hủy</button><button type="button" className="myspace-primary-action" onClick={saveRoom}>Lưu thay đổi</button></div>}
              <Link
                to="/me?section=collection"
                className="v7-drawer-collection-link"
                onClick={handleCloseDrawer}
              >
                Mở trong Bộ sưu tập riêng <ArrowRight size={16}/>
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
