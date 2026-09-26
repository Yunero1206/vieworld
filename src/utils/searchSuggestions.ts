import { normalizeVietnameseText } from './textSearch';
export interface SearchSuggestion { id: string; label: string; context: string; target?: string; keywords?: string }
export function rankSuggestions(items: SearchSuggestion[], query: string, limit = 6) {
  const q = normalizeVietnameseText(query);
  const seen = new Set<string>();
  return items.filter(item => !seen.has(item.id) && Boolean(seen.add(item.id))).map((item, order) => {
    const label = normalizeVietnameseText(item.label);
    const text = `${label} ${normalizeVietnameseText(item.keywords ?? item.context)}`;
    const score = !q ? 0 : label === q ? 0 : label.startsWith(q) ? 1 : label.split(' ').some(word => word.startsWith(q)) ? 2 : text.includes(q) ? 3 : 99;
    return { item, score, order };
  }).filter(entry => entry.score < 99).sort((a, b) => a.score - b.score || a.order - b.order).slice(0, limit).map(entry => entry.item);
}
