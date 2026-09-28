/** Presentation metadata only. Ownership, prices and equipment IDs stay in Product. */
export interface DigitalVisual {
  id: string;
  kind: 'shirt' | 'hoodie' | 'bomber' | 'cap' | 'headband' | 'lightstick';
  color: string;
  shade: string;
  accent: string;
  motif: 'star' | 'moon' | 'wave';
}

export const DIGITAL_VISUALS: Record<string, DigitalVisual> = {
  'star-shirt': { id: 'star-shirt', kind: 'shirt', color: '#efe6d3', shade: '#cabc9d', accent: '#54735b', motif: 'star' },
  'mira-hoodie': { id: 'mira-hoodie', kind: 'hoodie', color: '#c6b8db', shade: '#8d7caa', accent: '#f4eaff', motif: 'moon' },
  'kai-bomber': { id: 'kai-bomber', kind: 'bomber', color: '#38434b', shade: '#202b33', accent: '#6ed0c9', motif: 'wave' },
  'star-cap': { id: 'star-cap', kind: 'cap', color: '#78805c', shade: '#4c573e', accent: '#eee2b5', motif: 'star' },
  'mira-moon-headband': { id: 'mira-moon-headband', kind: 'headband', color: '#b6a0cc', shade: '#756089', accent: '#f5e8c6', motif: 'moon' },
  'star-light': { id: 'star-light', kind: 'lightstick', color: '#e8ead7', shade: '#829b78', accent: '#a3c78b', motif: 'star' },
  'mira-lightstick': { id: 'mira-lightstick', kind: 'lightstick', color: '#e8daef', shade: '#9b7bb6', accent: '#c59de3', motif: 'moon' },
  'kai-lightstick': { id: 'kai-lightstick', kind: 'lightstick', color: '#29454b', shade: '#183038', accent: '#61cfcf', motif: 'wave' },
  'c-lightstick-digital': { id: 'c-lightstick-digital', kind: 'lightstick', color: '#d5c7ee', shade: '#827098', accent: '#b79add', motif: 'star' },
};

export function digitalVisual(id?: string): DigitalVisual | undefined { return id ? DIGITAL_VISUALS[id] : undefined; }

const FAMILY_VISUAL: Record<string, string> = {
  'star-shirt': 'star-shirt', 'mira-hoodie': 'mira-hoodie', 'kai-bomber': 'kai-bomber',
  'star-cap': 'star-cap', 'star-light': 'star-light', 'mira-lightstick': 'mira-lightstick', 'kai-lightstick': 'kai-lightstick',
};

export function roomDigitalVisual(item: { digitalItemId?: string; familyId?: string; image?: string }): DigitalVisual | undefined {
  const explicit = digitalVisual(item.digitalItemId) || digitalVisual(FAMILY_VISUAL[item.familyId || '']);
  if (explicit) return explicit;
  const image = (item.image || '').replace(/-(physical|digital)$/, '');
  // Older persisted catalogues have no family metadata. Resolve known artwork only.
  const legacy: Record<string, string> = { shirt: 'star-shirt', cap: 'star-cap', lightstick: 'star-light', 'mira-hoodie': 'mira-hoodie', 'kai-bomber': 'kai-bomber', 'mira-lightstick': 'mira-lightstick', 'kai-lightstick': 'kai-lightstick' };
  return digitalVisual(legacy[image]);
}
