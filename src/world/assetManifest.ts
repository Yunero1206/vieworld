/**
 * VieWorld Asset Manifest & Registry
 *
 * Centralized registry of 2.5D character archetypes, accessories, and visual assets.
 * Enforces strict constitutional safeguards (§docs/CONSTITUTION.md):
 * 1. Strict segregation between Fan and Artist identities:
 *    - Artist A: Indie acoustic music artist (lavender knit sweater, acoustic guitar).
 *    - Fan Avatar: Youthful music enthusiast (cream zip hoodie, dark indigo jeans, star props).
 *    - Never mix Artist and Fan characters or interchange identities.
 * 2. Truthful Presence:
 *    - Loop animations NEVER generate artificial artist presence.
 *    - Disconnected/absent artist freeze motion truthfully.
 * 3. Graceful Defensiveness:
 *    - Unknown, retired, or missing accessories fall back cleanly without breaking layout.
 * 4. Free Personal Expression:
 *    - Wardrobe accessories are cosmetic and non-gated; they never alter session eligibility.
 */

import { PRESET_ACCESSORIES, WardrobeAccessory } from '../domain/types';

export type CharacterRole = 'fan' | 'artist';

export interface AccessoryDefinition extends WardrobeAccessory {
  category: 'badge' | 'audio' | 'eyewear' | 'clothing';
  assetType: 'svg_vector';
  role: 'fan';
  testId: string;
  glowColor?: string;
  badgeSymbol?: string;
}

export const ACCESSORY_REGISTRY: Record<string, AccessoryDefinition> = {
  accessory_classic: {
    id: 'accessory_classic',
    name: 'Huy hiệu Ngôi sao Cổ điển',
    description: 'Huy hiệu kim loại vàng kỷ niệm phong cách sân khấu cổ điển.',
    previewColor: '#F59E0B',
    category: 'badge',
    assetType: 'svg_vector',
    role: 'fan',
    testId: 'preview-accessory-star',
    badgeSymbol: '★',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  earpiece_glow: {
    id: 'earpiece_glow',
    name: 'Tai nghe Neon Phát sáng',
    description: 'Phụ kiện tai nghe sân khấu phát ánh sáng xanh ngọc dịu.',
    previewColor: '#10B981',
    category: 'audio',
    assetType: 'svg_vector',
    role: 'fan',
    testId: 'preview-accessory-earpiece',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  visor_neon: {
    id: 'visor_neon',
    name: 'Kính thực tế ảo Cyber',
    description: 'Kính viền neon hiện đại lấy cảm hứng từ thế giới Neon Sessions.',
    previewColor: '#8B5CF6',
    category: 'eyewear',
    assetType: 'svg_vector',
    role: 'fan',
    testId: 'preview-accessory-visor',
    glowColor: 'rgba(139, 92, 246, 0.5)',
  },
};

/**
 * Character Archetype Specifications (matching approved Job 05 draft turnaround sheets)
 */
export const FAN_CHARACTER_SPEC = {
  name: 'Fan Avatar',
  identity: 'music_enthusiast',
  role: 'fan' as const,
  palette: {
    skin: '#FDE68A',
    skinShadow: '#FCD34D',
    hair: '#451A03',
    hairHighlight: '#78350F',
    hoodie: '#FEF3C7',
    hoodieShadow: '#FDE68A',
    hoodieZip: '#F59E0B',
    jeans: '#312E81',
    shoes: '#F3F4F6',
  },
};

export const ARTIST_A_CHARACTER_SPEC = {
  name: 'Artist A',
  identity: 'indie_acoustic_singer',
  role: 'artist' as const,
  palette: {
    sweater: '#DDD6FE',
    sweaterShadow: '#C4B5FD',
    pants: '#FDFBF7',
    hair: '#312E81',
    guitarWood: '#C89D66',
  },
};

/**
 * Resolve accessory by ID or name with defensive fallback
 */
export function getAccessoryById(idOrName?: string): AccessoryDefinition | undefined {
  if (!idOrName) return undefined;

  // Direct ID lookup
  if (ACCESSORY_REGISTRY[idOrName]) {
    return ACCESSORY_REGISTRY[idOrName];
  }

  // Known legacy/fixture aliases
  if (idOrName === 'lightstick-star' || idOrName === 'star_badge') {
    return ACCESSORY_REGISTRY['accessory_classic'];
  }

  // Lookup by Vietnamese name or partial match
  const matchByName = Object.values(ACCESSORY_REGISTRY).find(
    (acc) => acc.name.toLowerCase() === idOrName.toLowerCase()
  );
  if (matchByName) {
    return matchByName;
  }

  // Check against domain PRESET_ACCESSORIES
  const matchPreset = PRESET_ACCESSORIES.find(
    (acc) => acc.id === idOrName || acc.name.toLowerCase() === idOrName.toLowerCase()
  );
  if (matchPreset && ACCESSORY_REGISTRY[matchPreset.id]) {
    return ACCESSORY_REGISTRY[matchPreset.id];
  }

  return undefined;
}

/**
 * Return friendly human-readable accessory name or fallback
 */
export function getAccessoryName(idOrName?: string): string {
  if (!idOrName) return '';
  const resolved = getAccessoryById(idOrName);
  if (resolved) {
    return resolved.name;
  }
  // Return verbatim if custom test label passed (e.g. "Acoustic Pin")
  return idOrName;
}

/**
 * Validates if the given string is a recognized fan accessory
 */
export function isFanAccessory(idOrName?: string): boolean {
  return getAccessoryById(idOrName) !== undefined;
}
