import type { DisplayItem } from './display';
import type { DisplaySurface, SurfacePreset, SurfaceSelection } from './displaySurfaces';
import { itemFootprint } from './displaySurfaces';

export interface RoomAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  z: number;
}

type Layouts = Record<1 | 2 | 3 | 4 | 5, RoomAnchor[]>;
const a = (x: number, y: number, width: number, height: number, rotate = 0, z = 1): RoomAnchor => ({ x, y, width, height, rotate, z });

// Positions are relative to each illustrated surface, never saved to the fan profile.
// Each count is an art-directed composition; presets adjust emphasis without changing anchors.
export const ROOM_LAYOUTS: Record<DisplaySurface['type'], Layouts> = {
  rack: {
    1: [a(50, 52, 73, 92, 0, 3)],
    2: [a(65, 52, 55, 88, 2, 3), a(31, 54, 49, 83, -3, 2)],
    3: [a(51, 51, 48, 88, 0, 3), a(19, 55, 39, 77, -4, 1), a(82, 54, 39, 77, 4, 2)],
    4: [a(52, 50, 43, 83, 0, 4), a(17, 55, 34, 70, -4, 1), a(82, 55, 34, 70, 4, 2), a(36, 66, 29, 54, -2, 3)],
    5: [a(51, 49, 39, 79, 0, 5), a(13, 54, 30, 66, -4, 1), a(86, 54, 30, 66, 4, 2), a(33, 68, 26, 49, -3, 3), a(68, 68, 26, 49, 3, 4)],
  },
  wall: {
    1: [a(50, 50, 76, 86, -2, 3)],
    2: [a(38, 47, 54, 73, -3, 3), a(72, 59, 40, 60, 4, 2)],
    3: [a(48, 46, 48, 68, -2, 3), a(16, 59, 35, 53, -5, 1), a(81, 58, 34, 51, 4, 2)],
    4: [a(47, 41, 43, 61, -2, 4), a(16, 43, 32, 44, -5, 1), a(78, 42, 31, 46, 4, 2), a(66, 78, 35, 39, -3, 3)],
    5: [a(49, 38, 39, 56, -2, 5), a(16, 38, 30, 43, -5, 1), a(82, 39, 29, 42, 4, 2), a(29, 78, 31, 37, 3, 3), a(72, 77, 31, 38, -4, 4)],
  },
  shelf: {
    1: [a(50, 55, 70, 78, 0, 3)],
    2: [a(62, 54, 55, 74, 2, 3), a(29, 58, 41, 61, -4, 2)],
    3: [a(50, 50, 48, 68, 0, 3), a(20, 61, 37, 54, -4, 1), a(82, 61, 37, 54, 4, 2)],
    4: [a(50, 46, 45, 62, 0, 4), a(17, 52, 34, 48, -4, 1), a(82, 53, 34, 48, 4, 2), a(39, 78, 30, 39, -2, 3)],
    5: [a(50, 42, 42, 58, 0, 5), a(14, 48, 31, 45, -4, 1), a(84, 49, 30, 44, 4, 2), a(32, 80, 27, 36, -3, 3), a(70, 79, 27, 36, 3, 4)],
  },
  spotlight: {
    1: [a(50, 51, 92, 94, 0, 3)],
    2: [a(53, 47, 76, 84, 0, 3), a(73, 76, 47, 43, 5, 2)],
    3: [a(50, 44, 72, 78, 0, 3), a(18, 75, 43, 38, -5, 1), a(78, 76, 43, 38, 5, 2)],
    4: [a(51, 39, 65, 72, 0, 4), a(18, 68, 39, 35, -4, 1), a(81, 68, 39, 35, 4, 2), a(49, 84, 36, 28, 0, 3)],
    5: [a(50, 36, 61, 67, 0, 5), a(17, 61, 35, 31, -4, 1), a(83, 61, 35, 31, 4, 2), a(28, 83, 32, 27, -2, 3), a(72, 83, 32, 27, 2, 4)],
  },
  desk: {
    1: [a(50, 52, 74, 83, -2, 3)],
    2: [a(61, 48, 58, 76, -2, 3), a(25, 69, 43, 51, 4, 2)],
    3: [a(51, 45, 51, 68, -2, 3), a(17, 67, 39, 47, -5, 1), a(82, 66, 39, 47, 4, 2)],
    4: [a(49, 40, 47, 62, -2, 4), a(16, 48, 35, 47, -5, 1), a(82, 48, 35, 47, 4, 2), a(64, 80, 37, 35, -2, 3)],
    5: [a(49, 36, 43, 56, -2, 5), a(14, 42, 32, 42, -5, 1), a(84, 42, 32, 42, 4, 2), a(30, 78, 33, 33, 2, 3), a(71, 78, 33, 33, -3, 4)],
  },
};

export interface ComposedRoomItem { item: DisplayItem; anchor: RoomAnchor; focal: boolean; }

export function composeRoomSurface(surface: DisplaySurface, items: DisplayItem[], selection?: SurfaceSelection): ComposedRoomItem[] {
  if (!items.length) return [];
  const focalId = selection?.focalItemId && items.some(item => item.id === selection.focalItemId)
    ? selection.focalItemId : items[0].id;
  const ordered = [items.find(item => item.id === focalId)!, ...items.filter(item => item.id !== focalId)];
  const anchors = ROOM_LAYOUTS[surface.type][Math.min(5, ordered.length) as 1 | 2 | 3 | 4 | 5];
  const preset: SurfacePreset = selection?.layoutPreset || 'natural';
  return ordered.slice(0, 5).map((item, index) => {
    const base = anchors[index];
    const footprint = itemFootprint(item);
    const emphasis = preset === 'focus' ? (index === 0 ? 1.1 : .9) : 1;
    const size = Math.min(1.07, (footprint === 3 ? 1.04 : footprint === 1 ? .94 : 1) * emphasis);
    return { item, focal: index === 0, anchor: {
      ...base,
      width: Math.round(base.width * size), height: Math.round(base.height * size),
      rotate: preset === 'balanced' ? 0 : base.rotate,
    } };
  });
}
