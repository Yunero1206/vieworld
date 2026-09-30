/**
 * VieWorld Versioned Storage Adapter (§4, §5.4 & docs/CONTRACTS.md)
 *
 * Implements tenant/fan namespacing, schema versioning, corruption recovery,
 * in-memory fallback on quota/storage denial, and isolated tenant resets.
 *
 * CRITICAL RULE: Never calls localStorage.clear().
 */

import { AppState, TenantId } from '../domain/types';
import { createInitialState, createFreshFanState, CANONICAL_WORLDS, CANONICAL_AVATARS, CANONICAL_SESSIONS } from '../data/fixtures';
import { withMerchCatalog } from '../world/merchCatalog';
import { freshGuestState } from '../world/account';
import { resetCurrentArtistSelections } from '../world/currentArtist';
import { idbGet, idbSet, idbDelete, clearTenantAsync, STORE_TENANT_STATE } from './indexedDbAdapter';

export const SCHEMA_VERSION = 1;
export const STORAGE_KEY_PREFIX = 'vieworld_v1';
const ACTIVE_FAN_PREFIX = 'vieworld:active-fan:';
const activeFanMemory = new Map<TenantId, string>();

export interface LocalDemoProfile { fanId: string; displayName: string }

/** Local profiles are a device-only demo picker, never an authentication provider. */
export function listLocalDemoProfiles(tenantId: TenantId): LocalDemoProfile[] {
  const prefix = `${STORAGE_KEY_PREFIX}_${tenantId}_`;
  const profiles: LocalDemoProfile[] = [];
  try {
    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index);
      if (!key?.startsWith(prefix) || key.endsWith('_recovery')) continue;
      try {
        const fanId = key.slice(prefix.length);
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const state = JSON.parse(raw).state;
        if (isPersistedState(state, tenantId, fanId) && typeof state.fanProfile.displayName === 'string') profiles.push({ fanId, displayName: state.fanProfile.displayName });
      } catch { /* One damaged profile must not hide the others. */ }
    }
  } catch { /* Storage may be blocked or one profile may be malformed. */ }
  for (const [key, raw] of Object.entries(memoryFallbackStore)) {
    if (!key.startsWith(prefix) || key.endsWith('_recovery')) continue;
    try {
      const fanId = key.slice(prefix.length);
      const state = JSON.parse(raw).state;
      if (isPersistedState(state, tenantId, fanId) && typeof state.fanProfile.displayName === 'string' && !profiles.some(profile => profile.fanId === fanId)) profiles.push({ fanId, displayName: state.fanProfile.displayName });
    } catch { /* Ignore a malformed in-memory copy. */ }
  }
  return profiles.sort((a, b) => a.displayName.localeCompare(b.displayName, 'vi'));
}

export function getActiveFanId(tenantId: TenantId): string {
  let fanId = activeFanMemory.get(tenantId);
  try { fanId = window.localStorage.getItem(`${ACTIVE_FAN_PREFIX}${tenantId}`) || fanId; } catch { /* Memory fallback. */ }
  return fanId && listLocalDemoProfiles(tenantId).some(profile => profile.fanId === fanId)
    ? fanId : createInitialState(tenantId).fanProfile.id;
}

export function setActiveFanId(tenantId: TenantId, fanId: string): void {
  activeFanMemory.set(tenantId, fanId);
  try { window.localStorage.setItem(`${ACTIVE_FAN_PREFIX}${tenantId}`, fanId); } catch { /* Memory fallback. */ }
}

export interface StorageLoadResult {
  state: AppState;
  isMemoryFallback: boolean;
  recoveredFromError?: boolean;
  notice?: string;
}

// In-memory fallback dictionary when localStorage is denied or throws QuotaExceededError
const memoryFallbackStore: Record<string, string> = {};
let memoryFallbackActive = false;

export function buildStorageKey(tenantId: TenantId, fanId: string = 'fan-linh'): string {
  return `${STORAGE_KEY_PREFIX}_${tenantId}_${fanId}`;
}

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
/** Validate the persisted envelope before selectors access its required collections. Optional additions remain optional. */
export function isPersistedState(value: unknown, tenantId: TenantId, fanId: string): value is AppState {
  if (!isRecord(value) || value.activeTenantId !== tenantId || !isRecord(value.fanProfile) || value.fanProfile.id !== fanId || typeof value.demoTime !== 'string' || !Number.isFinite(Date.parse(value.demoTime))) return false;
  const records = ['worlds', 'avatarAssets', 'sessions', 'memberships', 'benefits', 'participations', 'orders', 'supportCases', 'products', 'questions', 'polls', 'capsules', 'notifications'];
  const lists = ['followedWorldIds', 'rsvpdSessionIds', 'inLobbySessionIds'];
  return records.every(key => isRecord(value[key])) && lists.every(key => Array.isArray(value[key]));
}

function preserveRecoveryCopy(key: string, raw: string): void {
  // One bounded recovery slot per fan, kept out of the normal hydration path.
  memoryFallbackStore[`${key}_recovery`] = raw;
  try { window.localStorage.setItem(`${key}_recovery`, raw); } catch { /* Backup remains available for local export. */ }
}

/** Explicit local download only; never include unrelated browser storage. May contain private demo contact details. */
export function collectLocalDemoBackup(): Record<string, string> {
  const dump: Record<string, string> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.startsWith('vieworld:') || key.startsWith(`${STORAGE_KEY_PREFIX}_`) || key.startsWith('vieworld_guestbook_') || key === 'vieworld_privacy_settings')) dump[key] = window.localStorage.getItem(key) || '';
    }
  } catch { /* Memory-only sessions are still exportable. */ }
  return { ...dump, ...memoryFallbackStore };
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

  // Asynchronously back up state to IndexedDB in the background
  try {
    idbSet(STORE_TENANT_STATE, key, state).catch(() => {});
  } catch {
    // Ignore IndexedDB errors
  }

  if (!isLocalStorageAvailable() || memoryFallbackActive) {
    memoryFallbackStore[key] = payload;
    memoryFallbackActive = true;
    return false;
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
  const freshForFan = () => {
    const baseline = createInitialState(tenantId);
    return freshGuestState(fanId === baseline.fanProfile.id
      ? baseline : createFreshFanState(tenantId, fanId, 'Fan mới'));
  };
  const fallbackAvailable = isLocalStorageAvailable() && !memoryFallbackActive;

  if (!fallbackAvailable) {
    memoryFallbackActive = true;
    const raw = memoryFallbackStore[key];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!isPersistedState(parsed.state, tenantId, fanId)) throw new Error('Invalid cached state');
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
      state: freshForFan(),
      isMemoryFallback: true,
      notice: 'Chế độ lưu tạm trong bộ nhớ: dữ liệu sẽ không lưu sau khi đóng tab.',
    };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return {
        state: freshForFan(),
        isMemoryFallback: false,
      };
    }

    const parsed = JSON.parse(raw);

    // Schema version check and basic integrity validation
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION || !isPersistedState(parsed.state, tenantId, fanId)) {
      // Version mismatch or invalid structure: recover with fresh initial state
      const freshState = freshForFan();
      preserveRecoveryCopy(key, raw);
      const durable = saveState(freshState);
      return {
        state: freshState,
        isMemoryFallback: !durable,
        recoveredFromError: true,
        notice: 'Đã khôi phục dữ liệu mặc định do dữ liệu cũ thiếu trường hoặc phiên bản không tương thích. Bản gốc được giữ riêng để khôi phục, không dùng làm dữ liệu đang chạy.',
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
    const freshState = freshForFan();
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) preserveRecoveryCopy(key, raw);
    } catch {
      // Ignore
    }
    return {
      state: freshState,
      isMemoryFallback: false,
      recoveredFromError: true,
      notice: 'Dữ liệu không đọc được; đã khôi phục lại trạng thái ban đầu. Bản gốc được giữ riêng để kiểm tra/khôi phục.',
    };
  }
}

/**
 * Asynchronously loads state from IndexedDB if available,
 * gracefully falling back to synchronous loadState (localStorage / Memory).
 */
export async function loadStateAsync(
  tenantId: TenantId = 'vieworld-demo',
  fanId: string = 'fan-linh'
): Promise<StorageLoadResult> {
  const key = buildStorageKey(tenantId, fanId);
  try {
    const idbData = await idbGet<AppState>(STORE_TENANT_STATE, key);
    if (isPersistedState(idbData, tenantId, fanId)) {
      return {
        state: withMerchCatalog(idbData),
        isMemoryFallback: false,
      };
    }
  } catch {
    // Fall back to localStorage / memory
  }
  return loadState(tenantId, fanId);
}

/**
 * Resets storage for a designated tenant only.
 * Invariant: NEVER calls localStorage.clear()! Preserves all other tenants and browser data.
 */
export function resetTenantStorage(tenantId: TenantId): void {
  const prefix = `${STORAGE_KEY_PREFIX}_${tenantId}`;
  activeFanMemory.delete(tenantId);
  resetCurrentArtistSelections(tenantId);
  try { window.localStorage.removeItem(`${ACTIVE_FAN_PREFIX}${tenantId}`); } catch { /* Memory fallback. */ }

  // Reset in-memory entries for this tenant
  Object.keys(memoryFallbackStore).forEach((key) => {
    if (key.startsWith(prefix)) {
      delete memoryFallbackStore[key];
    }
  });

  // Also delete tenant state from IndexedDB
  try {
    idbDelete(STORE_TENANT_STATE, `${prefix}_fan-linh`).catch(() => {});
    clearTenantAsync(tenantId).catch(() => {});
  } catch {
    // Ignore access denial
  }

  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const keysToRemove: string[] = [];
    const personalPrefixes = [
      `${STORAGE_KEY_PREFIX}_${tenantId}_`,
      `vieworld:privacy:${tenantId}:`,
      `vieworld:guestbook:${tenantId}:`,
      `vieworld:current-artist:${tenantId}:`,
    ];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (personalPrefixes.some(item => k.startsWith(item)) ||
        (tenantId === 'vieworld-demo' && (k === 'vieworld_privacy_settings' || k.startsWith('vieworld_guestbook_') || k === 'vieworld:current-artist:vieworld-demo')))) {
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
