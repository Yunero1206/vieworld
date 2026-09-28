/** Resolve one catalog image to its canonical public asset without changing product IDs. */
export const MERCH_IMAGE_ROOT = '/images/merch-v2';

const sharedArtwork: Record<string, string> = {
  'kai-bomber-digital': 'kai-bomber-physical',
  'kai-lightstick-digital': 'kai-lightstick-physical',
  'mira-hoodie-digital': 'mira-hoodie-physical',
  'mira-lightstick-digital': 'mira-lightstick-physical',
};

const jpegArtwork = new Set([
  'kai-bomber-physical',
  'kai-cassette-physical',
  'kai-lightstick-physical',
  'mira-hoodie-physical',
  'mira-lightstick-physical',
  'mira-vinyl-physical',
]);

export function merchImageUrl(image: string): string {
  // Older persisted catalogues may contain the former absolute .png URL.
  const value = image.startsWith(`${MERCH_IMAGE_ROOT}/`) ? image.slice(MERCH_IMAGE_ROOT.length + 1) : image;
  if (/^(?:https?:)?\//.test(value)) return value;
  const name = value.replace(/\.(?:png|jpe?g|webp)$/i, '');
  const canonical = sharedArtwork[name] || name;
  return `${MERCH_IMAGE_ROOT}/${canonical}.${jpegArtwork.has(canonical) ? 'jpg' : 'png'}`;
}
