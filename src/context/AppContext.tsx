/**
 * VieWorld Central Application Context (§4, §5.4 & docs/CONTRACTS.md)
 */

import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { AppAction, AppState, TenantId } from '../domain/types';
import { appReducer } from '../domain/reducer';
import { scenarioPresets, createInitialState } from '../data/fixtures';
import { loadState, saveState, resetTenantStorage, isMemoryFallbackActive, buildStorageKey } from '../services/storageAdapter';

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
    const loadResult = loadState(tId);
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
      const presetFn = scenarioPresets[key];
      if (presetFn) {
        const scenarioState = presetFn(state.activeTenantId);
        dispatch({ type: 'LOAD_SCENARIO', scenarioState });
        setStorageNotice(`Đã áp dụng kịch bản thử nghiệm: ${key}`);
      }
    },
    [state.activeTenantId]
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
      const loadResult = loadState(targetTenantId);
      dispatch({ type: 'LOAD_SCENARIO', scenarioState: loadResult.state });
      if (loadResult.notice) {
        setStorageNotice(loadResult.notice);
      } else {
        setStorageNotice(`Đã chuyển sang không gian: ${targetTenantId}`);
      }
    },
    [state]
  );

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
