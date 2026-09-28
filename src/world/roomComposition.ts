import type { DisplayItem, DisplaySlot } from './display';
import type { DisplaySurface, SurfaceSelection } from './displaySurfaces';
import { itemFootprint } from './displaySurfaces';
import { roomDigitalVisual } from './itemVisuals';
import { propAspect } from './propArtwork';

export interface RoomAnchor {
  x: number; y: number; width: number; height: number; rotate: number; z: number; pivotY: number;
}
// Fixed scene coordinates. Hit targets must never resize the underlying artwork.
export const ROOM_SURFACE_BOUNDS: Record<DisplaySlot, { x: number; y: number; width: number; height: number }> = {
  shirt: { x: 20, y: 41, width: 14, height: 25 },
  ticket: { x: 36.5, y: 28, width: 14, height: 20 },
  achievement: { x: 55.5, y: 30.5, width: 15, height: 26 },
  lightstick: { x: 68.5, y: 33, width: 4.2, height: 19 },
  disc: { x: 84.5, y: 48, width: 18, height: 22 },
};
const a = (x: number, y: number, width: number, height: number, rotate = 0, z = 1, pivotY = 100): RoomAnchor => ({ x, y, width, height, rotate, z, pivotY });
type Layouts = Record<1 | 2 | 3 | 4 | 5, RoomAnchor[]>;
// 4–5 compositions remain for old rooms; new placements obey furniture-specific limits.
export const ROOM_LAYOUTS: Record<DisplaySurface['type'], Layouts> = {
  rack: {
    1: [a(50,4,73,92,0,3,0)],
    2: [a(66,.5,57,85,0,3,0),a(30,8.5,53,80,0,2,0)],
    3: [a(50,5,50,80,0,3,0),a(23,10,45,74,0,1,0),a(77,1,45,74,0,2,0)],
    4: [a(51,4,45,75,0,4,0),a(18,12,39,70,0,1,0),a(81,1,39,70,0,2,0),a(37,8,39,70,0,3,0)],
    5: [a(51,4,42,72,0,5,0),a(15,12,36,66,0,1,0),a(85,1,36,66,0,2,0),a(33,8,36,66,0,3,0),a(69,3,36,66,0,4,0)],
  },
  wall: {
    1: [a(50,50,76,80,-2,3,50)],
    2: [a(28,47,43,64,-3,3,50),a(75,57,38,58,3,2,50)],
    3: [a(28,34,43,48,-2,3,50),a(77,35,34,44,3,1,50),a(64,78,44,34,-3,2,50)],
    4: [a(27,28,43,43,-2,4,50),a(77,29,35,40,3,1,50),a(25,76,35,39,2,2,50),a(75,77,43,40,-3,3,50)],
    5: [a(49,44,34,42,-2,5,50),a(18,22,29,34,-3,1,50),a(82,23,29,34,3,2,50),a(22,79,31,32,2,3,50),a(78,80,31,32,-2,4,50)],
  },
  shelf: {
    1: [a(50,61,47,33,0,3)],
    2: [a(58,61,43,33,0,3),a(33,23,38,23,0,2)],
    3: [a(51,61,43,33,0,3),a(31,23,38,23,0,1),a(71,83,35,22,0,2)],
    4: [a(54,61,40,32,0,4),a(28,23,34,23,0,1),a(75,23,32,23,0,2),a(31,83,34,27,0,3)],
    5: [a(54,61,38,32,0,5),a(28,23,32,23,0,1),a(75,23,30,23,0,2),a(27,83,32,27,0,3),a(76,83,30,26,0,4)],
  },
  spotlight: {
    1: [a(50,99,86,91,0,3)],
    2: [a(42,99,59,88,0,3),a(79,99,30,52,0,2)],
    3: [a(50,99,48,86,0,3),a(18,99,28,50,0,1),a(83,99,28,50,0,2)],
    4: [a(50,99,43,86,0,4),a(14,99,24,46,0,1),a(87,99,24,46,0,2),a(70,99,26,58,0,3)],
    5: [a(50,99,38,83,0,5),a(12,99,22,44,0,1),a(88,99,22,44,0,2),a(30,99,23,53,0,3),a(70,99,23,53,0,4)],
  },
  desk: {
    1: [a(51,58,43,62,-2,3)],
    2: [a(53,58,40,57,-2,3),a(21,40,29,38,-2,2)],
    3: [a(51,58,36,54,-2,3),a(17,40,27,36,-2,1),a(82,77,27,37,-2,2)],
    4: [a(50,58,32,50,-2,4),a(16,40,25,34,-2,1),a(83,77,25,35,-2,2),a(31,49,23,32,-2,3)],
    5: [a(50,58,30,48,-2,5),a(14,39,22,32,-2,1),a(86,79,22,33,-2,2),a(31,49,21,31,-2,3),a(69,69,21,31,-2,4)],
  },
};
export interface ComposedRoomItem { item: DisplayItem; anchor: RoomAnchor; focal: boolean; }
export function composeRoomSurface(surface: DisplaySurface, items: DisplayItem[], selection?: SurfaceSelection): ComposedRoomItem[] {
  if (!items.length) return [];
  const focal = items.find(item => item.id === selection?.focalItemId) || items[0];
  const supporting = items.filter(item => item.id !== focal.id);
  supporting.sort((left,right) => itemFootprint(right) - itemFootprint(left));
  const ordered = [focal, ...supporting];
  const anchors = ROOM_LAYOUTS[surface.type][Math.min(5,ordered.length) as 1 | 2 | 3 | 4 | 5];
  const bounds = ROOM_SURFACE_BOUNDS[surface.id];
  return ordered.slice(0,5).map((item,index) => {
    const base = anchors[index];
    const visual = roomDigitalVisual(item);
    const aspect = visual ? propAspect(visual.id) || (visual.kind === 'lightstick' ? .48 : ['cap','headband'].includes(visual.kind) ? 120/105 : .8) : item.slot === 'disc' ? .9 : item.slot === 'ticket' ? 1.35 : 1;
    const emphasis = selection?.layoutPreset === 'focus' ? index === 0 ? 1.06 : .94 : 1;
    let width = base.width;
    let height = width * bounds.width * (1672 / 941) / (aspect * bounds.height);
    const maxHeight = Math.min(base.height, base.pivotY === 100 ? base.y : base.pivotY === 0 ? 100-base.y : 2*Math.min(base.y,100-base.y));
    const fit = Math.min(1,maxHeight/height,2*Math.min(base.x,100-base.x)/width);
    width *= fit; height *= fit;
    const safeEmphasis = Math.min(emphasis,maxHeight/height,2*Math.min(base.x,100-base.x)/width);
    width *= safeEmphasis; height *= safeEmphasis;
    return { item, focal: index === 0, anchor: { ...base, width, height, rotate: selection?.layoutPreset === 'balanced' || surface.type !== 'wall' ? 0 : base.rotate } };
  });
}
