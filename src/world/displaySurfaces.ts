import type { FanProfile } from '../domain/types';
import type { DisplayItem, DisplaySlot } from './display';
import { roomDigitalVisual } from './itemVisuals';

export type SurfacePreset = 'balanced' | 'focus' | 'natural';
export interface SurfaceSelection {
  itemIds: string[];
  focalItemId?: string;
  layoutPreset?: SurfacePreset;
}

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
  { id: 'ticket', zoneId: 'wall', label: 'Bảng kỷ niệm', type: 'wall', maxItems: 4, capacityUnits: 5, allowedItemTypes: ['ticket', 'achievement'] },
  { id: 'achievement', zoneId: 'center', label: 'Kệ lưu niệm', type: 'shelf', maxItems: 3, capacityUnits: 6, allowedItemTypes: ['achievement', 'ticket', 'disc', 'lightstick'] },
  { id: 'lightstick', zoneId: 'spotlight', label: 'Góc ánh sáng', type: 'spotlight', maxItems: 1, capacityUnits: 3, allowedItemTypes: ['lightstick', 'achievement'] },
  { id: 'disc', zoneId: 'console', label: 'Góc âm nhạc', type: 'desk', maxItems: 3, capacityUnits: 5, allowedItemTypes: ['disc', 'lightstick', 'ticket'] },
];

export function surfaceSupportsItem(surface: DisplaySurface, item: DisplayItem): boolean {
  if (!item.isDisplayCompatible || !item.slot || !surface.allowedItemTypes.includes(item.slot)) return false;
  const visual = roomDigitalVisual(item);
  // A cap rests on a shelf; its generic keepsake category must not pin it to a wall.
  if (visual?.kind === 'cap') return surface.type === 'shelf';
  return surface.type !== 'rack' || Boolean(item.roomAsset || visual && ['shirt','hoodie','bomber'].includes(visual.kind));
}

export function itemFootprint(item: DisplayItem): 1 | 2 | 3 {
  if (item.footprint) return item.footprint;
  if (item.slot === 'shirt') return 3;
  if (item.slot === 'disc' || item.slot === 'lightstick') return 2;
  return 1;
}

export function readDisplaySurfaces(profile: FanProfile, owned?: DisplayItem[]): Record<DisplaySlot, SurfaceSelection> {
  return Object.fromEntries(DISPLAY_SURFACES.map(surface => {
    const saved = profile.displaySurfaces?.[surface.id];
    const oldId = profile.displaySlots?.[surface.id];
    const storedIds = saved ? [...new Set(saved.itemIds || [])] : oldId ? [oldId] : [];
    const itemIds = owned ? storedIds.filter(id => owned.some(item => item.id === id && item.isDisplayCompatible)) : storedIds;
    return [surface.id, {
      itemIds,
      focalItemId: itemIds.includes(saved?.focalItemId || '') ? saved?.focalItemId : itemIds[0],
      layoutPreset: saved?.layoutPreset || 'natural',
    }];
  })) as Record<DisplaySlot, SurfaceSelection>;
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
  if (matched.some(item => !item || !item.isDisplayCompatible || (!previous.includes(item.id) && !surfaceSupportsItem(surface, item)))) {
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
