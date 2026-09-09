/**
 * VieWorld Central Application Context (§4, §5.4 & docs/CONTRACTS.md)
 */

import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { AppAction, AppState, TenantId } from '../domain/types';
import { appReducer } from '../domain/reducer';
import { scenarioPresets, createInitialState } from '../data/fixtures';
import { loadState, saveState, resetTenantStorage, isMemoryFallbackActive } from '../services/storageAdapter';

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isMemoryFallback: boolean;
  storageNotice: string | null;
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
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  initialTenantId = 'vieworld-demo',
  disableAutoHydrate = false,
}) => {
  const [isHydrated, setIsHydrated] = useState(disableAutoHydrate);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);

  // Initialize reducer with clean state
  const [state, dispatch] = useReducer(appReducer, initialTenantId, (tId) => {
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
    if (isHydrated) {
      saveState(state);
    } else {
      setIsHydrated(true);
    }
  }, [state, isHydrated]);

  const dismissNotice = useCallback(() => {
    setStorageNotice(null);
  }, []);

  const loadScenarioPreset = useCallback(
    (key: keyof typeof scenarioPresets) => {
      const presetFn = scenarioPresets[key];
      if (presetFn) {
        const scenarioState = presetFn(state.activeTenantId);
        dispatch({ type: 'LOAD_SCENARIO', scenarioState });
        saveState(scenarioState);
        setStorageNotice(`Đã áp dụng kịch bản thử nghiệm: ${key}`);
      }
    },
    [state.activeTenantId]
  );

  const resetActiveTenant = useCallback(() => {
    const tenantId = state.activeTenantId;
    resetTenantStorage(tenantId);
    const freshState = createInitialState(tenantId);
    dispatch({ type: 'LOAD_SCENARIO', scenarioState: freshState });
    saveState(freshState);
    setStorageNotice(`Đã thiết lập lại toàn bộ dữ liệu mẫu cho không gian '${tenantId}'.`);
  }, [state.activeTenantId]);

  const setTenant = useCallback(
    (targetTenantId: TenantId) => {
      // Save current tenant before switching
      saveState(state);
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
        isMemoryFallback: isMemoryFallbackActive(),
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
