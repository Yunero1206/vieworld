import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CatalogItemArt } from '../components/CatalogItemArt';
import { catalogVisual } from '../world/catalogVisuals';
import { contextMedia } from '../world/artistPresentation';
import { selectHomePresence } from '../world/presenceDiscovery';
import { createInitialState } from '../data/fixtures';
import { hasAvatarFit } from '../world/avatarFit';
import { VieWorldLogo } from '../components/VieWorldLogo';

describe('Home context and mature merchandise presentation', () => {
  it('isolates logo gradients between hidden desktop and visible mobile navigation', () => {
    const { container } = render(<><VieWorldLogo/><VieWorldLogo/></>);
    const ids = Array.from(container.querySelectorAll('defs [id]')).map(el => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const logo of container.querySelectorAll('svg')) {
      const localIds = Array.from(logo.querySelectorAll('[id]')).map(el => el.id);
      for (const el of logo.querySelectorAll('[fill^="url"],[stroke^="url"],[filter^="url"]')) {
        for (const name of ['fill', 'stroke', 'filter']) {
          const value = el.getAttribute(name);
          if (value?.startsWith('url(#')) expect(localIds).toContain(value.slice(5, -1));
        }
      }
    }
  });
  it('uses different truthful images for concert, conversation and album launch', () => {
    const state = createInitialState('vieworld-demo');
    const home = selectHomePresence(state);
    expect(new Set([home.recent?.media.src, home.now?.media.src, home.next?.media.src]).size).toBe(3);
    expect(contextMedia('artist-a', state.sessions['session-dropin-01']).src).toContain('artist-a-dropin');
    expect(contextMedia('artist-a', state.sessions['session-a-album-drop']).src).toContain('artist-a-album-launch');
    expect(contextMedia('artist-c', state.sessions['session-dropin-01']).src).not.toContain('artist-a-dropin');
  });
  it('shares the same lightstick design for physical and digital editions', () => {
    expect(catalogVisual('product-c-lightstick-real')).toEqual(catalogVisual('product-c-lightstick-digital'));
  });
  it('delivers correct WebP files for every upgraded catalogue item', () => {
    const state = createInitialState('vieworld-demo');
    const visuals = Object.keys(state.products).map(catalogVisual).filter(Boolean);
    expect(visuals.length).toBeGreaterThanOrEqual(18);
    for (const visual of visuals) {
      const file = resolve('static', visual!.src.replace(/^\//, ''));
      expect(existsSync(file), file).toBe(true);
      const bytes = readFileSync(file);
      expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
      expect(bytes.toString('ascii', 8, 12)).toBe('WEBP');
    }
  });
  it('keeps studio backing out of room cutouts and uses the same asset', () => {
    const first = render(<CatalogItemArt id="product-mira-tea-cup-real" title="Luna"/>);
    const src = first.container.querySelector('img')!.getAttribute('src');
    expect(first.container.querySelector('[data-catalog-art]')).toHaveClass('is-studio');
    first.unmount();
    const room = render(<CatalogItemArt id="product-mira-tea-cup-real" title="Luna" cutout/>);
    expect(room.container.querySelector('img')).toHaveAttribute('src', src);
    expect(room.container.querySelector('[data-catalog-art]')).toHaveClass('is-cutout');
    expect(room.container.querySelector('svg')).toBeNull();
  });
  it('does not invent an avatar fit from a better product photograph', () => {
    expect(catalogVisual('product-mira-digital-companion')).toBeDefined();
    expect(hasAvatarFit('headband')).toBe(false);
    expect(catalogVisual('unknown-product')).toBeUndefined();
  });
});
