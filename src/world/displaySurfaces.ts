import type { FanProfile } from '../domain/types';
import type { DisplayItem, DisplaySlot } from './display';
import { roomDigitalVisual } from './itemVisuals';
import { legacyRoomKind, ROOM_KIND_SURFACES } from './roomItemKinds';

export type SurfacePreset = 'balanced' | 'focus' | 'natural';
export interface SurfaceSelection {
  itemIds: string[];
  focalItemId?: string;
  layoutPreset?: SurfacePreset;
}
export type RoomSurfaces = Record<DisplaySlot, SurfaceSelection>;

export interface DisplaySurface {
  id: DisplaySlot;
  zoneId: string;
  label: string;
  type: 'rack' | 'wall' | 'desk' | 'spotlight' | 'shelf';
  maxItems: number;
  capacityUnits: number;
  allowedItemTypes: DisplaySlot[];
}

// IDs remain the legacy fixture IDs so an existing room migrates without moving its objects.
export const DISPLAY_SURFACES: DisplaySurface[] = [
  { id: 'shirt', zoneId: 'left', label: 'Giá trang phục', type: 'rack', maxItems: 2, capacityUnits: 6, allowedItemTypes: ['shirt'] },
  { id: 'ticket', zoneId: 'wall', label: 'Bảng kỷ niệm', type: 'wall', maxItems: 4, capacityUnits: 5, allowedItemTypes: ['ticket'] },
  { id: 'achievement', zoneId: 'center', label: 'Kệ lưu niệm', type: 'shelf', maxItems: 3, capacityUnits: 6, allowedItemTypes: ['achievement', 'ticket', 'disc', 'lightstick'] },
  { id: 'lightstick', zoneId: 'spotlight', label: 'Góc ánh sáng', type: 'spotlight', maxItems: 1, capacityUnits: 3, allowedItemTypes: ['lightstick'] },
  { id: 'disc', zoneId: 'console', label: 'Góc âm nhạc', type: 'desk', maxItems: 3, capacityUnits: 5, allowedItemTypes: ['disc'] },
];

export function surfaceSupportsItem(surface: DisplaySurface, item: DisplayItem): boolean {
  if (!item.isDisplayCompatible) return false;
  const kind = item.itemKind || legacyRoomKind(item.slot);
  const supported = item.supportedSurfaces || (kind ? ROOM_KIND_SURFACES[kind] : []);
  if (!supported.includes(surface.id)) return false;
  const visual = roomDigitalVisual(item);
  // A cap rests on a shelf; its generic keepsake category must not pin it to a wall.
  if (!item.itemKind && !item.supportedSurfaces && visual?.kind === 'cap') return surface.type === 'shelf';
  return surface.type !== 'rack' || Boolean(item.roomPresentation === 'hanger' || item.roomAsset || visual && ['shirt','hoodie','bomber'].includes(visual.kind));
}

export function itemFootprint(item: DisplayItem): 1 | 2 | 3 {
  if (item.footprint) return item.footprint;
  if (item.slot === 'shirt') return 3;
  if (item.slot === 'disc' || item.slot === 'lightstick') return 2;
  return 1;
}

export function readDisplaySurfaces(profile: FanProfile, owned?: DisplayItem[]): RoomSurfaces {
  const seen = new Set<string>();
  return Object.fromEntries(DISPLAY_SURFACES.map(surface => {
    const saved = profile.displaySurfaces?.[surface.id];
    const oldId = profile.displaySlots?.[surface.id];
    const storedIds = saved ? [...new Set(saved.itemIds || [])] : oldId ? [oldId] : [];
    const itemIds = storedIds.filter(id => {
      const item=owned?.find(value=>value.id===id);
      if (seen.has(id) || owned && (!item || !surfaceSupportsItem(surface,item))) return false;
      seen.add(id);
      return true;
    });
    return [surface.id, {
      itemIds,
      focalItemId: itemIds.includes(saved?.focalItemId || '') ? saved?.focalItemId : itemIds[0],
      layoutPreset: saved?.layoutPreset || 'natural',
    }];
  })) as RoomSurfaces;
}

export function surfaceItems(profile: FanProfile, surfaceId: DisplaySlot, owned: DisplayItem[]): DisplayItem[] {
  const ids = readDisplaySurfaces(profile)[surfaceId].itemIds;
  return ids.map(id => owned.find(item => item.id === id)).filter((item): item is DisplayItem => Boolean(item));
}

export function validateSurfaceSelection(
  profile: FanProfile,
  surfaceId: DisplaySlot,
  selection: SurfaceSelection,
  owned: DisplayItem[],
): string | undefined {
  const surface = DISPLAY_SURFACES.find(candidate => candidate.id === surfaceId);
  if (!surface) return 'Không tìm thấy khu vực trưng bày.';
  const ids = selection.itemIds || [];
  if (ids.length !== new Set(ids).size) return 'Mỗi món chỉ được đặt một lần trong khu vực.';
  const previous = readDisplaySurfaces(profile)[surfaceId].itemIds;
  const retainingLegacy = ids.every(id => previous.includes(id));
  if (ids.length > surface.maxItems && !retainingLegacy) return 'Khu vực này đã đầy.';
  const matched = ids.map(id => owned.find(item => item.id === id));
  if (matched.some(item => !item || !surfaceSupportsItem(surface, item))) {
    return 'Món này không phù hợp với khu vực trưng bày.';
  }
  if (matched.reduce((sum, item) => sum + (item ? itemFootprint(item) : 0), 0) > surface.capacityUnits && !retainingLegacy) return 'Khu vực này đã đầy.';
  if (selection.focalItemId && !ids.includes(selection.focalItemId)) return 'Điểm nhấn cần là một món đang trưng bày.';
  if (selection.layoutPreset && !['balanced', 'focus', 'natural'].includes(selection.layoutPreset)) return 'Kiểu sắp xếp chưa hợp lệ.';
  const elsewhere = Object.entries(readDisplaySurfaces(profile))
    .filter(([id]) => id !== surfaceId)
    .flatMap(([, current]) => current.itemIds);
  if (ids.some(id => elsewhere.includes(id))) return 'Món này đang ở khu vực khác. Hãy gỡ món trước khi chuyển.';
  return undefined;
}

/** Validate the final room in one pass: a move must not leave a half-saved room. */
export function validateDisplaySurfaces(profile: FanProfile, next: RoomSurfaces, owned: DisplayItem[]): string | undefined {
  const previous = readDisplaySurfaces(profile, owned);
  const ids = DISPLAY_SURFACES.flatMap(surface => next[surface.id]?.itemIds || []);
  if (ids.length !== new Set(ids).size) return 'Mỗi món chỉ được trưng bày ở một khu vực.';
  for (const surface of DISPLAY_SURFACES) {
    if (!next[surface.id]) return 'Không tìm thấy khu vực trưng bày.';
    const context = { ...profile, displaySurfaces: { ...next, [surface.id]: previous[surface.id] } };
    const problem = validateSurfaceSelection(context, surface.id, next[surface.id], owned);
    if (problem) return problem;
  }
  return undefined;
}

export function removeRoomItem(surfaces: RoomSurfaces, surfaceId: DisplaySlot, itemId: string): RoomSurfaces {
  const selection = surfaces[surfaceId];
  const itemIds = selection.itemIds.filter(id => id !== itemId);
  return { ...surfaces, [surfaceId]: { ...selection, itemIds,
    focalItemId: selection.focalItemId === itemId ? itemIds[0] : selection.focalItemId } };
}

/** No implicit replacement. Callers must supply the outgoing ID chosen by the fan. */
export function planRoomPlacement(profile: FanProfile, surfaces: RoomSurfaces, surfaceId: DisplaySlot, itemId: string, owned: DisplayItem[], replaceId?: string): { surfaces?: RoomSurfaces; problem?: string } {
  const surface = DISPLAY_SURFACES.find(value => value.id === surfaceId);
  const item = owned.find(value => value.id === itemId);
  if (!surface || !item || !surfaceSupportsItem(surface, item)) return { problem: 'Món này không phù hợp với khu vực trưng bày.' };
  if (surfaces[surfaceId].itemIds.includes(itemId)) return { problem: 'Món này đã được đặt ở đây.' };
  if (replaceId && !surfaces[surfaceId].itemIds.includes(replaceId)) return { problem: 'Chọn món đang trưng bày để thay.' };
  let next = surfaces;
  for (const current of DISPLAY_SURFACES) {
    if (current.id !== surfaceId && next[current.id].itemIds.includes(itemId)) next = removeRoomItem(next, current.id, itemId);
  }
  if (replaceId) next = removeRoomItem(next, surfaceId, replaceId);
  const selection = next[surfaceId];
  next = { ...next, [surfaceId]: { ...selection, itemIds: [...selection.itemIds, itemId], focalItemId: selection.focalItemId || itemId } };
  const problem = validateDisplaySurfaces(profile, next, owned);
  return problem ? { problem } : { surfaces: next };
}

export function roomCandidates(surfaceId: DisplaySlot, surfaces: RoomSurfaces, owned: DisplayItem[]): DisplayItem[] {
  const surface = DISPLAY_SURFACES.find(value => value.id === surfaceId)!;
  return owned.filter(item => surfaceSupportsItem(surface, item) && !surfaces[surfaceId].itemIds.includes(item.id));
}
