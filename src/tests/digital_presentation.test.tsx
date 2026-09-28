import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { DIGITAL_VISUALS, digitalVisual, roomDigitalVisual } from '../world/itemVisuals';
import { composeRoomSurface, ROOM_SURFACE_BOUNDS } from '../world/roomComposition';
import { DISPLAY_SURFACES, readDisplaySurfaces, surfaceSupportsItem, validateSurfaceSelection } from '../world/displaySurfaces';
import { productRoomPreviewItem, type DisplayItem } from '../world/display';
import { createInitialState } from '../data/fixtures';
import { NEW_MERCH } from '../world/merchCatalog';
import { EXPANDED_PRODUCTS } from '../data/expandedUniverse';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { DisplayRoomScene } from '../components/DisplayRoom';
import { RoomPropVisual } from '../components/RoomPropVisual';

const profile = createInitialState('vieworld-demo').fanProfile;
const known = Object.values({...NEW_MERCH,...EXPANDED_PRODUCTS}).filter(p => p.digitalItemId && p.digitalSlot);
const shirt = (id: string): DisplayItem => ({id,slot:'shirt',title:id,detail:'',image:'shirt-digital',isDisplayCompatible:true});

describe('digital item presentation', () => {
  it('covers every existing digital equipment ID without new product/ownership records', () => {
    expect(known.length).toBeGreaterThanOrEqual(9);
    for (const product of known) {
      expect(digitalVisual(product.digitalItemId), product.id).toBeDefined();
      expect(roomDigitalVisual(productRoomPreviewItem(product)), product.id).toBeDefined();
    }
    expect(digitalVisual('not-in-catalog')).toBeUndefined();
  });

  it('does not accept raw unknown studio pictures on the clothing rack', () => {
    expect(surfaceSupportsItem(DISPLAY_SURFACES[0], {...shirt('raw'),image:'unknown-studio'})).toBe(false);
    expect(surfaceSupportsItem(DISPLAY_SURFACES[0],shirt('known'))).toBe(true);
    const cap: DisplayItem = {id:'cap',slot:'achievement',title:'',detail:'',digitalItemId:'star-cap',isDisplayCompatible:true};
    expect(surfaceSupportsItem(DISPLAY_SURFACES[1],cap)).toBe(false);
    expect(surfaceSupportsItem(DISPLAY_SURFACES[2],cap)).toBe(true);
    expect(surfaceSupportsItem(DISPLAY_SURFACES[3],cap)).toBe(false);
  });

  it('retains old overfull rooms while allowing removal, focal changes and preset changes', () => {
    const objects = [shirt('a'),shirt('b'),shirt('c')];
    const old = {...profile,displaySurfaces:{shirt:{itemIds:['a','b','c'],layoutPreset:'natural' as const}}};
    const before = JSON.stringify(old);
    expect(readDisplaySurfaces(old,objects).shirt.itemIds).toEqual(['a','b','c']);
    expect(validateSurfaceSelection(old,'shirt',{itemIds:['a','b','c'],focalItemId:'c',layoutPreset:'focus'},objects)).toBeUndefined();
    expect(validateSurfaceSelection(old,'shirt',{itemIds:['a','b']},objects)).toBeUndefined();
    expect(validateSurfaceSelection(old,'shirt',{itemIds:['a','b','new']},[...objects,shirt('new')])).toMatch(/đầy/);
    expect(JSON.stringify(old)).toBe(before);
  });

  it('keeps geometry and bottom/top pivots inside the surface for all old counts and presets', () => {
    for (const surface of DISPLAY_SURFACES) for (const count of [1,2,3,4,5]) for (const preset of ['balanced','focus','natural'] as const) {
      const items = Array.from({length:count},(_,i): DisplayItem => ({id:String(i),slot:surface.allowedItemTypes[i%surface.allowedItemTypes.length],title:'',detail:'',isDisplayCompatible:true,digitalItemId:i%2?'mira-lightstick':undefined}));
      const composed = composeRoomSurface(surface,items,{itemIds:items.map(i=>i.id),layoutPreset:preset});
      expect(composed).toHaveLength(count);
      for (const {anchor} of composed) {
        expect(anchor.x-anchor.width/2).toBeGreaterThanOrEqual(-.001);
        expect(anchor.x+anchor.width/2).toBeLessThanOrEqual(100.001);
        expect(anchor.y-anchor.height*anchor.pivotY/100).toBeGreaterThanOrEqual(-.001);
        expect(anchor.y+anchor.height*(1-anchor.pivotY/100)).toBeLessThanOrEqual(100.001);
      }
    }
  });

  it('renders prepared digital art, never a product image, for every equipped look and appearance', () => {
    for (const appearance of ['original','wave','bob','curl'] as const) for (const visual of Object.values(DIGITAL_VISUALS)) {
      const slot = ['shirt','hoodie','bomber'].includes(visual.kind)?'shirt':visual.kind==='lightstick'?'lightstick':'hat';
      const view=render(<AvatarRenderer appearance={appearance} digitalLook={{[slot]:visual.id}}/>);
      expect(view.container.querySelector(`[data-visual-id="${visual.id}"]`)).not.toBeNull();
      expect(view.container.querySelector('.vw-equipped-fan')).toHaveAttribute('data-rig',appearance);
      expect(view.container.querySelector('image')?.getAttribute('href')).not.toContain('merch-v2');
      expect(view.container.querySelector('img')).toBeNull();
      view.unmount();
    }
  });

  it('does not grow artwork on mobile to achieve a 44px hit target', () => {
    const view=render(<DisplayRoomScene fan={{name:'Fan',look:{}}} items={[shirt('owned')]} onSelect={vi.fn()} compact/>);
    const fixture=view.container.querySelector<HTMLButtonElement>('#fixture-shirt')!;
    expect(fixture.style.width).toBe(`${ROOM_SURFACE_BOUNDS.shirt.width}%`);
    expect(fixture.style.minWidth).toBe('0');
    expect(fixture.querySelector('img')).toBeNull();
    expect(fixture.querySelector('[data-visual-id="star-shirt"]')).not.toBeNull();
    expect(view.container.querySelector('.v7-room-social-bar')).toBeNull();
  });

  it('has a deliberate keepsake fallback when an existing image fails', () => {
    render(<RoomPropVisual item={{id:'ticket',slot:'ticket',title:'Vé',detail:'',image:'ticket-digital'}}/>);
    const img=document.querySelector('img')!;
    fireEvent.error(img);
    expect(screen.getByText('✦')).toBeInTheDocument();
  });

  it('keeps the selected item identity when the character image cannot load',()=>{
    for (const visual of Object.values(DIGITAL_VISUALS)) {
      const slot=['shirt','hoodie','bomber'].includes(visual.kind)?'shirt':visual.kind==='lightstick'?'lightstick':'hat';
      const view=render(<AvatarRenderer digitalLook={{[slot]:visual.id}}/>);
      fireEvent.error(view.container.querySelector('image')!);
      expect(view.container.querySelector(`[data-visual-id="${visual.id}"]`)).not.toBeNull();
      expect(view.container.querySelector('.vw-equipped-fan')).toBeNull();
      view.unmount();
    }
  });
});
