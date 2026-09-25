import { describe, expect, it } from 'vitest';
import type { DisplayItem } from '../world/display';
import { DISPLAY_SURFACES, readDisplaySurfaces, validateSurfaceSelection } from '../world/displaySurfaces';
import { composeRoomSurface, ROOM_LAYOUTS } from '../world/roomComposition';

const shelf = DISPLAY_SURFACES.find(surface => surface.type === 'shelf')!;
const item = (id: string, slot: DisplayItem['slot'] = 'ticket'): DisplayItem => ({ id, slot, title: id, detail: '', isDisplayCompatible: true });

describe('art-directed My Space surface composition', () => {
  it('has a fixed geometry for every surface and supported item count', () => {
    for (const surface of DISPLAY_SURFACES) {
      for (const count of [1, 2, 3, 4, 5] as const) {
        expect(ROOM_LAYOUTS[surface.type][count]).toHaveLength(count);
      }
    }
  });

  it('puts the selected focal item on the focal anchor without persisting coordinates', () => {
    const items = [item('ticket'), item('lightstick', 'lightstick'), item('badge', 'achievement')];
    const selection = { itemIds: items.map(value => value.id), focalItemId: 'lightstick', layoutPreset: 'natural' as const };
    const composed = composeRoomSurface(shelf, items, selection);
    expect(composed.map(value => value.item.id)).toEqual(['lightstick', 'ticket', 'badge']);
    expect(composed[0].focal).toBe(true);
    expect(composed[0].anchor).toEqual(ROOM_LAYOUTS.shelf[3][0]);
    expect(selection).toEqual({ itemIds: ['ticket', 'lightstick', 'badge'], focalItemId: 'lightstick', layoutPreset: 'natural' });
  });

  it('changes composition with preset while preserving ownership and legacy slots', () => {
    const items = [item('first'), item('second')];
    const balanced = composeRoomSurface(shelf, items, { itemIds: ['first', 'second'], layoutPreset: 'balanced' });
    const focused = composeRoomSurface(shelf, items, { itemIds: ['first', 'second'], layoutPreset: 'focus' });
    expect(balanced.every(value => value.anchor.rotate === 0)).toBe(true);
    expect(focused[0].anchor.width).toBeGreaterThan(balanced[0].anchor.width);
    expect(readDisplaySurfaces({ displaySlots: { ticket: 'first' } } as Parameters<typeof readDisplaySurfaces>[0]).ticket.itemIds).toEqual(['first']);
  });

  it('still enforces surface capacity before rendering', () => {
    const large = [item('a', 'disc'), item('b', 'disc'), item('c', 'disc'), item('d', 'disc')];
    expect(validateSurfaceSelection({} as Parameters<typeof validateSurfaceSelection>[0], 'disc', { itemIds: large.map(value => value.id) }, large)).toMatch(/đầy/);
  });
});
