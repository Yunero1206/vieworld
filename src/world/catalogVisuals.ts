type CatalogKind = 'poster' | 'photos' | 'book' | 'pick' | 'tote' | 'cup' | 'headband' | 'keychain' | 'stickers' | 'scarf' | 'pin' | 'light' | 'shirt';
interface CatalogVisual { kind: CatalogKind; src: string }

// Presentation aliases preserve saved product IDs and share real/digital design identity.
const entries: Record<string, [CatalogKind, string]> = {
  'product-pin-01': ['pin', 'a-star-pin'],
  'product-shirt-01': ['shirt', 'a-midnight-shirt'],
  'product-c-poster-real': ['poster', 'c-concert-poster'],
  'product-a-poster-soldout': ['poster', 'a-tour-poster'],
  'product-c-photocard-real': ['photos', 'c-photocards'],
  'product-mira-polaroid-real': ['photos', 'mira-polaroids'],
  'product-e-concept-preview': ['photos', 'e-concept-cards'],
  'product-d-songbook-real': ['book', 'd-songbook'],
  'product-d-pick-real': ['pick', 'd-guitar-picks'],
  'product-d-tote-real': ['tote', 'd-canvas-tote'],
  'product-mira-tea-cup-real': ['cup', 'mira-tea-cup'],
  'product-mira-digital-companion': ['headband', 'mira-headband'],
  'product-kai-keychain-real': ['keychain', 'kai-keychain'],
  'product-kai-stickers-real': ['stickers', 'kai-stickers'],
  'product-a-hanoi-towel': ['scarf', 'a-hanoi-towel'],
  'product-b-pin-real': ['pin', 'b-enamel-pin'],
  'product-c-lightstick-real': ['light', 'c-purple-lightstick'],
  'product-c-lightstick-digital': ['light', 'c-purple-lightstick'],
};

export function catalogVisual(id: string): CatalogVisual | undefined {
  const entry = entries[id];
  return entry ? { kind: entry[0], src: `${import.meta.env.BASE_URL}images/merch-studio/${entry[1]}.webp` } : undefined;
}
