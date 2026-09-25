import type { FanProfile } from '../domain/types';
import type { DisplayItem, DisplaySlot } from './display';

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
  { id: 'shirt', zoneId: 'left', label: 'Giá trang phục', type: 'rack', maxItems: 5, capacityUnits: 9, allowedItemTypes: ['shirt'] },
  { id: 'ticket', zoneId: 'wall', label: 'Bảng kỷ niệm', type: 'wall', maxItems: 5, capacityUnits: 7, allowedItemTypes: ['ticket', 'achievement'] },
  { id: 'achievement', zoneId: 'center', label: 'Kệ lưu niệm', type: 'shelf', maxItems: 5, capacityUnits: 8, allowedItemTypes: ['achievement', 'ticket', 'disc', 'lightstick'] },
  { id: 'lightstick', zoneId: 'spotlight', label: 'Góc ánh sáng', type: 'spotlight', maxItems: 5, capacityUnits: 6, allowedItemTypes: ['lightstick', 'achievement'] },
  { id: 'disc', zoneId: 'console', label: 'Góc âm nhạc', type: 'desk', maxItems: 5, capacityUnits: 7, allowedItemTypes: ['disc', 'lightstick', 'ticket'] },
];

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
  if (ids.length > surface.maxItems) return 'Khu vực này đã đầy.';
  const matched = ids.map(id => owned.find(item => item.id === id));
  if (matched.some(item => !item || !item.isDisplayCompatible || !item.slot || !surface.allowedItemTypes.includes(item.slot))) {
    return 'Món này không phù hợp với khu vực trưng bày.';
  }
  if (matched.reduce((sum, item) => sum + (item ? itemFootprint(item) : 0), 0) > surface.capacityUnits) return 'Khu vực này đã đầy.';
  if (selection.focalItemId && !ids.includes(selection.focalItemId)) return 'Điểm nhấn cần là một món đang trưng bày.';
  if (selection.layoutPreset && !['balanced', 'focus', 'natural'].includes(selection.layoutPreset)) return 'Kiểu sắp xếp chưa hợp lệ.';
  const elsewhere = Object.entries(readDisplaySurfaces(profile))
    .filter(([id]) => id !== surfaceId)
    .flatMap(([, current]) => current.itemIds);
  if (ids.some(id => elsewhere.includes(id))) return 'Món này đang ở khu vực khác. Hãy gỡ món trước khi chuyển.';
  return undefined;
}
