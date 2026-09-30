/**
 * VieWorld Central Application Context (§4, §5.4 & docs/CONTRACTS.md)
 */

import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { AppAction, AppState, TenantId } from '../domain/types';
import { appReducer } from '../domain/reducer';
import { scenarioPresets, createInitialState, createFreshFanState } from '../data/fixtures';
import { loadState, saveState, resetTenantStorage, isMemoryFallbackActive, buildStorageKey, getActiveFanId, setActiveFanId, listLocalDemoProfiles, type LocalDemoProfile } from '../services/storageAdapter';
import type { DemoProvider } from '../world/account';

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isMemoryFallback: boolean;
  storageNotice: string | null;
  persistenceConflict: boolean;
  loadScenarioPreset: (key: keyof typeof scenarioPresets) => void;
  resetActiveTenant: () => void;
  dismissNotice: () => void;
  setTenant: (tenantId: TenantId) => void;
  localProfiles: () => LocalDemoProfile[];
  registerDemoProfile: (displayName: string, provider: DemoProvider) => string | null;
  signInDemoProfile: (fanId: string, provider: DemoProvider) => string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export interface AppProviderProps {
  children: React.ReactNode;
  initialTenantId?: TenantId;
  disableAutoHydrate?: boolean; // Useful for isolated unit tests
  initialState?: AppState;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  initialTenantId = 'vieworld-demo',
  disableAutoHydrate = false,
  initialState,
}) => {
  const [isHydrated, setIsHydrated] = useState(disableAutoHydrate || !!initialState);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [memoryFallback, setMemoryFallback] = useState(isMemoryFallbackActive());
  const [persistenceConflict, setPersistenceConflict] = useState(false);
  const conflictingKey = useRef<string | null>(null);
  const warnedStorage = useRef(false);

  // Initialize reducer with clean state
  const [state, dispatch] = useReducer(appReducer, initialTenantId, (tId) => {
    if (initialState) {
      return initialState;
    }
    if (disableAutoHydrate) {
      return createInitialState(tId);
    }
    const loadResult = loadState(tId, getActiveFanId(tId));
    if (loadResult.notice) {
      // Defer notice setting until after initial render
      setTimeout(() => setStorageNotice(loadResult.notice || null), 0);
    }
    return loadResult.state;
  });

  // Sync to storage on state change
  useEffect(() => {
    if (isHydrated && conflictingKey.current !== buildStorageKey(state.activeTenantId, state.fanProfile.id)) {
      const durable = saveState(state);
      setMemoryFallback(isMemoryFallbackActive());
      if (!durable && !warnedStorage.current) {
        warnedStorage.current = true;
        setStorageNotice('Trình duyệt không lưu được dữ liệu. Thay đổi hiện chỉ ở tab này và có thể mất khi tải lại/đóng tab. Không dùng dữ liệu liên hệ thật trong demo.');
      }
    } else {
      setIsHydrated(true);
    }
  }, [state, isHydrated]);

  useEffect(() => {
    const key = buildStorageKey(state.activeTenantId, state.fanProfile.id);
    setPersistenceConflict(conflictingKey.current === key);
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== key || event.newValue === event.oldValue) return;
      try {
        // Opening a second tab can rewrite only savedAt. That is not a state conflict.
        if (event.newValue && event.oldValue && JSON.stringify(JSON.parse(event.newValue).state) === JSON.stringify(JSON.parse(event.oldValue).state)) return;
      } catch { /* An unreadable external write still requires visible recovery. */ }
      // Do not silently overwrite a newer state from another tab with this tab's stale snapshot.
      conflictingKey.current = key;
      setPersistenceConflict(true);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [state.activeTenantId, state.fanProfile.id]);

  const dismissNotice = useCallback(() => {
    setStorageNotice(null);
  }, []);

  const loadScenarioPreset = useCallback(
    (key: keyof typeof scenarioPresets) => {
      if (state.fanProfile.id !== createInitialState(state.activeTenantId).fanProfile.id) {
        setStorageNotice('Kịch bản mẫu chỉ áp dụng cho hồ sơ mẫu của không gian này; hồ sơ riêng của bạn được giữ nguyên.');
        return;
      }
      const presetFn = scenarioPresets[key];
      if (presetFn) {
        const scenarioState = presetFn(state.activeTenantId);
        dispatch({ type: 'LOAD_SCENARIO', scenarioState });
        setStorageNotice(`Đã áp dụng kịch bản thử nghiệm: ${key}`);
      }
    },
    [state.activeTenantId, state.fanProfile.id]
  );

  const resetActiveTenant = useCallback(() => {
    const tenantId = state.activeTenantId;
    conflictingKey.current = null;
    setPersistenceConflict(false);
    resetTenantStorage(tenantId);
    const freshState = createInitialState(tenantId);
    dispatch({ type: 'LOAD_SCENARIO', scenarioState: freshState });
    setStorageNotice(`Đã thiết lập lại toàn bộ dữ liệu mẫu cho không gian '${tenantId}'.`);
  }, [state.activeTenantId]);

  const setTenant = useCallback(
    (targetTenantId: TenantId) => {
      // Save current tenant before switching
      if (conflictingKey.current !== buildStorageKey(state.activeTenantId, state.fanProfile.id)) saveState(state);
      // Load target tenant
      const loadResult = loadState(targetTenantId, getActiveFanId(targetTenantId));
      dispatch({ type: 'LOAD_SCENARIO', scenarioState: loadResult.state });
      if (loadResult.notice) {
        setStorageNotice(loadResult.notice);
      } else {
        setStorageNotice(`Đã chuyển sang không gian: ${targetTenantId}`);
      }
    },
    [state]
  );

  const localProfiles = useCallback(() => listLocalDemoProfiles(state.activeTenantId), [state.activeTenantId]);
  const registerDemoProfile = useCallback((displayName: string, provider: DemoProvider): string | null => {
    const name = displayName.trim().replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 60 || /[\u0000-\u001f]/.test(name)) return 'Tên hiển thị cần từ 2–60 ký tự.';
    const randomId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const fanId = `fan-local-${randomId}`;
    if (conflictingKey.current !== buildStorageKey(state.activeTenantId, state.fanProfile.id)) saveState(state);
    const next = appReducer(createFreshFanState(state.activeTenantId, fanId, name), { type: 'DEMO_SIGN_IN', provider, mode: 'register' });
    saveState(next);
    setActiveFanId(state.activeTenantId, fanId);
    conflictingKey.current = null;
    setPersistenceConflict(false);
    dispatch({ type: 'LOAD_SCENARIO', scenarioState: next });
    return null;
  }, [state]);

  const signInDemoProfile = useCallback((fanId: string, provider: DemoProvider): string | null => {
    if (!listLocalDemoProfiles(state.activeTenantId).some(profile => profile.fanId === fanId)) return 'Hồ sơ này không còn trên thiết bị.';
    if (conflictingKey.current !== buildStorageKey(state.activeTenantId, state.fanProfile.id)) saveState(state);
    const loaded = loadState(state.activeTenantId, fanId);
    if (loaded.state.fanProfile.id !== fanId) return 'Không đọc được hồ sơ đã chọn.';
    const next = appReducer(loaded.state, { type: 'DEMO_SIGN_IN', provider, mode: 'login' });
    saveState(next);
    setActiveFanId(state.activeTenantId, fanId);
    conflictingKey.current = null;
    setPersistenceConflict(false);
    dispatch({ type: 'LOAD_SCENARIO', scenarioState: next });
    return null;
  }, [state]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        isMemoryFallback: memoryFallback,
        persistenceConflict,
        storageNotice,
        loadScenarioPreset,
        resetActiveTenant,
        dismissNotice,
        setTenant,
        localProfiles,
        registerDemoProfile,
        signInDemoProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
