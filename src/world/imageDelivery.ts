import manifest from '../data/imageDelivery.json';

const optimized = new Map(manifest.assets.filter(asset => asset.source.startsWith('static/'))
  .map(asset => [asset.source.slice('static'.length), asset.target.slice('static'.length)]));

/** Delivery alias only: no item identity, crop, footprint or entitlement changes. */
export function optimizedImageUrl(url: string): string {
  const match = url.match(/^([^?#]*)([?#].*)?$/);
  if (!match) return url;
  return (optimized.get(match[1]) || match[1]) + (match[2] || '');
}
