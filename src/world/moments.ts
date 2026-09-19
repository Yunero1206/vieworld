import { Product, Session } from '../domain/types';

export interface ProductFamily {
  id: string;
  familyId: string;
  worldId: string;
  title: string;
  image: string;
  description: string;
  variants: Product[];
  minPriceVND: number;
  maxPriceVND: number;
  deliveryTypes: ('physical' | 'digital' | 'bundle')[];
  variantCount: number;
}

/**
 * Group flat products into unified Product Families for an artist's world.
 * Matches variants (Physical, Digital, Bundle) by their familyId or product ID prefix.
 */
export function getProductFamilies(products: Product[], worldId: string): ProductFamily[] {
  const worldProducts = products.filter(
    p => p.worldId === worldId && p.isAvailable && p.image
  );

  const familyMap = new Map<string, Product[]>();

  for (const product of worldProducts) {
    const famId = product.familyId || product.id.replace(/-real|-digital|-bundle/g, '');
    if (!familyMap.has(famId)) {
      familyMap.set(famId, []);
    }
    familyMap.get(famId)!.push(product);
  }

  const families: ProductFamily[] = [];

  familyMap.forEach((variants, familyId) => {
    // Sort variants: physical first, then digital, then bundle
    const order: Record<string, number> = { physical: 0, digital: 1, bundle: 2 };
    variants.sort((a, b) => (order[a.delivery || 'physical'] ?? 9) - (order[b.delivery || 'physical'] ?? 9));

    // Derive main visual & description
    const primary = variants.find(v => v.delivery === 'physical') || variants[0];
    const prices = variants.map(v => v.priceVND).filter(p => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : primary.priceVND;
    const maxPrice = prices.length ? Math.max(...prices) : primary.priceVND;

    // Normalize family title (remove " · Digital", " · Duo", etc.)
    const cleanTitle = primary.title
      .replace(/\s*·\s*(Digital|Duo|Duo Set|Boxset|CD Album)$/i, '')
      .replace(/\s*\((Digital|Physical)\)$/i, '')
      .trim();

    const deliveryTypes = Array.from(new Set(variants.map(v => (v.delivery || 'physical') as 'physical' | 'digital' | 'bundle')));

    families.push({
      id: `fam-${familyId}`,
      familyId,
      worldId,
      title: cleanTitle,
      image: primary.image || 'shirt-physical',
      description: primary.description || variants.find(v => v.description)?.description || '',
      variants,
      minPriceVND: minPrice,
      maxPriceVND: maxPrice,
      deliveryTypes,
      variantCount: variants.length,
    });
  });

  return families;
}

/**
 * Determine the primary live session for an artist world.
 * Priority:
 * 1. Running session (broadcasting live right now)
 * 2. Waiting room session (status open)
 * 3. Nearest scheduled session
 * 4. Latest replay (ended session with replay available)
 */
export function getPrimaryLiveSession(
  sessions: Session[],
  worldId: string,
  selectedSessionId?: string
): Session | undefined {
  const worldSessions = sessions.filter(s => s.worldId === worldId && s.status !== 'cancelled');

  if (selectedSessionId) {
    const manual = worldSessions.find(s => s.id === selectedSessionId);
    if (manual) return manual;
  }

  // 1. Running
  const running = worldSessions.find(s => s.status === 'running' && (s.format === 'dropin' || s.format === 'concert'));
  if (running) return running;

  // 2. Open / Waiting
  const waiting = worldSessions.find(s => s.status === 'open' && (s.format === 'dropin' || s.format === 'concert'));
  if (waiting) return waiting;

  // 3. Nearest Scheduled
  const scheduled = worldSessions
    .filter(s => s.status === 'scheduled' && (s.format === 'dropin' || s.format === 'concert'))
    .sort((a, b) => a.scheduledStartTime.localeCompare(b.scheduledStartTime))[0];
  if (scheduled) return scheduled;

  // 4. Latest replay
  const replay = worldSessions
    .filter(s => s.status === 'ended' && s.replayStatus === 'available')
    .sort((a, b) => b.scheduledStartTime.localeCompare(a.scheduledStartTime))[0];
  if (replay) return replay;

  return worldSessions[0];
}
