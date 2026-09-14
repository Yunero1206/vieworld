/**
 * VieWorld Versioned Storage Adapter (§4, §5.4 & docs/CONTRACTS.md)
 *
 * Implements tenant/fan namespacing, schema versioning, corruption recovery,
 * in-memory fallback on quota/storage denial, and isolated tenant resets.
 *
 * CRITICAL RULE: Never calls localStorage.clear().
 */

import { AppState, TenantId } from '../domain/types';
import { createInitialState, CANONICAL_WORLDS, CANONICAL_AVATARS, CANONICAL_SESSIONS } from '../data/fixtures';
import { withMerchCatalog } from '../world/merchCatalog';

export const SCHEMA_VERSION = 1;
export const STORAGE_KEY_PREFIX = 'vieworld_v1';

export interface StorageLoadResult {
  state: AppState;
  isMemoryFallback: boolean;
  recoveredFromError?: boolean;
  notice?: string;
}

// In-memory fallback dictionary when localStorage is denied or throws QuotaExceededError
const memoryFallbackStore: Record<string, string> = {};
let memoryFallbackActive = false;

function buildStorageKey(tenantId: TenantId, fanId: string = 'fan-linh'): string {
  return `${STORAGE_KEY_PREFIX}_${tenantId}_${fanId}`;
}

/**
 * Checks whether localStorage is supported and accessible
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__vieworld_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves application state to localStorage or in-memory fallback
 */
export function saveState(state: AppState): boolean {
  const key = buildStorageKey(state.activeTenantId, state.fanProfile.id);
  const payload = JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state,
  });

  if (!isLocalStorageAvailable() || memoryFallbackActive) {
    memoryFallbackStore[key] = payload;
    memoryFallbackActive = true;
    return true;
  }

  try {
    window.localStorage.setItem(key, payload);
    return true;
  } catch {
    // Falls back to in-memory store on QuotaExceededError or SecurityError
    memoryFallbackActive = true;
    memoryFallbackStore[key] = payload;
    return false;
  }
}

/**
 * Loads application state from localStorage or in-memory fallback.
 * Gracefully catches malformed JSON or schema version mismatches.
 */
export function loadState(
  tenantId: TenantId = 'vieworld-demo',
  fanId: string = 'fan-linh'
): StorageLoadResult {
  const key = buildStorageKey(tenantId, fanId);
  const fallbackAvailable = isLocalStorageAvailable() && !memoryFallbackActive;

  if (!fallbackAvailable) {
    memoryFallbackActive = true;
    const raw = memoryFallbackStore[key];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          state: withMerchCatalog(parsed.state),
          isMemoryFallback: true,
          notice: 'Chế độ lưu tạm trong bộ nhớ: trình duyệt không cho phép lưu trữ cục bộ.',
        };
      } catch {
        // Fall through to initial state
      }
    }
    return {
      state: createInitialState(tenantId),
      isMemoryFallback: true,
      notice: 'Chế độ lưu tạm trong bộ nhớ: dữ liệu sẽ không lưu sau khi đóng tab.',
    };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return {
        state: createInitialState(tenantId),
        isMemoryFallback: false,
      };
    }

    const parsed = JSON.parse(raw);

    // Schema version check and basic integrity validation
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION || !parsed.state) {
      // Version mismatch or invalid structure: recover with fresh initial state
      const freshState = createInitialState(tenantId);
      saveState(freshState);
      return {
        state: freshState,
        isMemoryFallback: false,
        recoveredFromError: true,
        notice: 'Đã khôi phục dữ liệu mặc định do phiên bản lưu trữ trước đó không tương thích.',
      };
    }

    if (parsed.state?.fanProfile && !parsed.state.fanProfile.showcaseSlots) {
      parsed.state.fanProfile.showcaseSlots = [null, null, null];
    }

    if (parsed.state?.activeTenantId === 'vieworld-demo' && parsed.state?.worlds) {
      for (const [id, w] of Object.entries(CANONICAL_WORLDS)) {
        if (!parsed.state.worlds[id]) parsed.state.worlds[id] = structuredClone(w);
      }
      for (const [id, a] of Object.entries(CANONICAL_AVATARS)) {
        if (!parsed.state.avatarAssets[id]) parsed.state.avatarAssets[id] = structuredClone(a);
      }
      for (const [id, s] of Object.entries(CANONICAL_SESSIONS)) {
        if (!parsed.state.sessions[id]) parsed.state.sessions[id] = structuredClone(s);
      }
    }

    return {
      state: withMerchCatalog(parsed.state),
      isMemoryFallback: false,
    };
  } catch {
    // Malformed JSON or read error: recover cleanly without crashing
    const freshState = createInitialState(tenantId);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
    return {
      state: freshState,
      isMemoryFallback: false,
      recoveredFromError: true,
      notice: 'Đã phát hiện dữ liệu lưu trữ không hợp lệ. Hệ thống đã khôi phục lại trạng thái ban đầu an toàn.',
    };
  }
}

/**
 * Resets storage for a designated tenant only.
 * Invariant: NEVER calls localStorage.clear()! Preserves all other tenants and browser data.
 */
export function resetTenantStorage(tenantId: TenantId): void {
  const prefix = `${STORAGE_KEY_PREFIX}_${tenantId}`;

  // Reset in-memory entries for this tenant
  Object.keys(memoryFallbackStore).forEach((key) => {
    if (key.startsWith(prefix)) {
      delete memoryFallbackStore[key];
    }
  });

  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        keysToRemove.push(k);
      }
    }

    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Ignore access denial
  }
}

/**
 * Returns whether memory fallback is currently active
 */
export function isMemoryFallbackActive(): boolean {
  return memoryFallbackActive;
}

/**
 * Test utility to reset memory fallback flag
 */
export function _resetMemoryFallbackFlagForTesting(): void {
  memoryFallbackActive = false;
  Object.keys(memoryFallbackStore).forEach((k) => delete memoryFallbackStore[k]);
}
