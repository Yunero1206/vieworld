/**
 * Shared accent-normalized text comparison and search utilities for Vietnamese content.
 */

export function normalizeVietnameseText(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

export function matchesVietnameseQuery(target: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!target) return false;
  return normalizeVietnameseText(target).includes(normalizeVietnameseText(query));
}
