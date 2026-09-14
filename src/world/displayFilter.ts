import type { DisplayItem, DisplaySlot } from './display';
import { normalizeVietnameseText, matchesVietnameseQuery } from '../utils/textSearch';

/**
 * Standard collection calendar timezone for VieWorld (Vietnam Standard Time / UTC+7).
 */
export const COLLECTION_TIMEZONE = 'Asia/Ho_Chi_Minh';

export const normalizeDisplayText = normalizeVietnameseText;

/**
 * Parses timestamp strings into epoch milliseconds in Asia/Ho_Chi_Minh timezone.
 * Handles ISO UTC ('...Z'), timezone offsets ('...+07:00'), and timestamps without timezone suffix.
 */
export function parseCollectionTimestamp(ts?: string): number | null {
  if (!ts || !ts.trim()) return null;
  let normalized = ts.trim();
  if (!normalized.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(normalized)) {
    normalized = normalized + '+07:00';
  }
  const ms = Date.parse(normalized);
  return isNaN(ms) ? null : ms;
}

/**
 * Formats a collection timestamp consistently using the platform collection calendar timezone.
 */
export function formatCollectionDate(ts?: string): string {
  if (!ts) return '';
  const ms = parseCollectionTimestamp(ts);
  if (ms === null) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: COLLECTION_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(ms));
}

/**
 * Computes next calendar day in YYYY-MM-DD for exclusive boundary comparison.
 */
export function getNextCalendarDay(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [y, m, d] = parts;
  const nextDate = new Date(Date.UTC(y, m - 1, d + 1));
  const nextY = nextDate.getUTCFullYear();
  const nextM = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
  const nextD = String(nextDate.getUTCDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
}

/**
 * Filters and sorts collection items with timezone-aware start and exclusive next-day boundaries.
 */
export function filterDisplayItems(
  items: DisplayItem[],
  filter: { slot: DisplaySlot | 'all'; query: string; artist: string; from: string; to: string }
): DisplayItem[] {
  let fromBoundaryMs: number | null = null;
  let toBoundaryExclusiveMs: number | null = null;

  if (filter.from && /^\d{4}-\d{2}-\d{2}$/.test(filter.from)) {
    fromBoundaryMs = Date.parse(`${filter.from}T00:00:00+07:00`);
  }

  if (filter.to && /^\d{4}-\d{2}-\d{2}$/.test(filter.to)) {
    const nextDay = getNextCalendarDay(filter.to);
    toBoundaryExclusiveMs = Date.parse(`${nextDay}T00:00:00+07:00`);
  }

  const isReversedRange =
    fromBoundaryMs !== null && toBoundaryExclusiveMs !== null && fromBoundaryMs >= toBoundaryExclusiveMs;

  return items
    .filter(i => {
      // Slot filtering
      if (filter.slot !== 'all' && i.slot !== filter.slot) {
        return false;
      }

      // Vietnamese accent-insensitive text search
      if (filter.query && !matchesVietnameseQuery(i.title, filter.query)) {
        return false;
      }

      // Artist / world scope
      if (filter.artist !== 'all' && i.worldId !== filter.artist) {
        return false;
      }

      // Date filtering with timezone boundaries
      if (fromBoundaryMs !== null || toBoundaryExclusiveMs !== null) {
        if (isReversedRange) return false;
        const itemMs = parseCollectionTimestamp(i.collectedAt);
        if (itemMs === null) return false;
        if (fromBoundaryMs !== null && itemMs < fromBoundaryMs) return false;
        if (toBoundaryExclusiveMs !== null && itemMs >= toBoundaryExclusiveMs) return false;
      }

      return true;
    })
    .sort(
      (a, b) =>
        (b.collectedAt || '').localeCompare(a.collectedAt || '') || a.title.localeCompare(b.title, 'vi')
    );
}
