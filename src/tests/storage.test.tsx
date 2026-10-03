/**
 * Acceptance T02: Persistence, Recovery, Reset, and Layout Tests
 */

import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import { createInitialState } from '../data/fixtures';
import {
_resetMemoryFallbackFlagForTesting,
loadState,
resetTenantStorage,
saveState,
STORAGE_KEY_PREFIX,
} from '../services/storageAdapter';

describe('T02 Acceptance: Storage Adapter & Persistence Invariants', () => {
  beforeEach(() => {
    window.localStorage.clear();
    _resetMemoryFallbackFlagForTesting();
  });

  afterEach(() => {
    window.localStorage.clear();
    _resetMemoryFallbackFlagForTesting();
    vi.restoreAllMocks();
  });

  describe('1. State Persistence & Reload across Sessions', () => {
    it('preserves followed worlds and RSVPs across save and reload cycles', () => {
      const state = createInitialState('vieworld-demo');
      state.followedWorldIds = ['artist-a', 'neon-sessions'];
      state.rsvpdSessionIds = ['session-dropin-01', 'session-listen-01'];

      // Save state
      const saved = saveState(state);
      expect(saved).toBe(true);

      // Load state (simulating browser reload)
      const loadResult = loadState('vieworld-demo', 'fan-linh');
      expect(loadResult.isMemoryFallback).toBe(false);
      expect(loadResult.recoveredFromError).toBeFalsy();
      expect(loadResult.state.followedWorldIds).toEqual(['artist-a', 'neon-sessions']);
      expect(loadResult.state.rsvpdSessionIds).toEqual(['session-dropin-01', 'session-listen-01']);
    });
  });

  describe('2. Corrupted JSON and Schema Migration Recovery', () => {
    it('recovers visibly when localStorage contains invalid / corrupted JSON', () => {
      const key = `${STORAGE_KEY_PREFIX}_vieworld-demo_fan-linh`;
      window.localStorage.setItem(key, '{{{corrupted_malformed_json_not_valid');

      const result = loadState('vieworld-demo', 'fan-linh');

      // Invariant: System does NOT crash; reinitializes clean defaults and reports recovery
      expect(result.recoveredFromError).toBe(true);
      expect(result.notice).toContain('khôi phục lại trạng thái ban đầu');
      expect(result.state.followedWorldIds).toEqual(['artist-a']);
    });

    it('recovers visibly when schemaVersion is mismatched', () => {
      const key = `${STORAGE_KEY_PREFIX}_vieworld-demo_fan-linh`;
      window.localStorage.setItem(
        key,
        JSON.stringify({
          schemaVersion: 9999, // Future/incompatible schema
          savedAt: new Date().toISOString(),
          state: { some: 'outdated_data' },
        })
      );

      const result = loadState('vieworld-demo', 'fan-linh');
      expect(result.recoveredFromError).toBe(true);
      expect(result.notice).toContain('không tương thích');
      expect(result.state.followedWorldIds).toEqual(['artist-a']);
    });
  });

  describe('3. Storage Denial & Fallback Resiliency', () => {
    it('falls back to in-memory store without crashing when localStorage throws SecurityError', () => {
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        const err = new Error('Access denied');
        err.name = 'SecurityError';
        throw err;
      });

      const state = createInitialState('vieworld-demo');
      state.followedWorldIds = ['neon-sessions'];

      // Must not throw exception
      expect(() => saveState(state)).not.toThrow();

      // State is retrievable from in-memory fallback
      const loadResult = loadState('vieworld-demo', 'fan-linh');
      expect(loadResult.isMemoryFallback).toBe(true);
      expect(loadResult.state.followedWorldIds).toEqual(['neon-sessions']);
    });
  });

  describe('4. Tenant Reset Isolation (Never calls localStorage.clear())', () => {
    it('resetTenant deletes ONLY the selected tenant namespace and preserves other tenants and unrelated data', () => {
      const vieworldKey = `${STORAGE_KEY_PREFIX}_vieworld-demo_fan-linh`;
      const mfanKey = `${STORAGE_KEY_PREFIX}_mfan-demo_fan-linh`;
      const foreignKey = 'unrelated_third_party_app_key';

      window.localStorage.setItem(vieworldKey, JSON.stringify({ state: 'vieworld_data' }));
      window.localStorage.setItem(mfanKey, JSON.stringify({ state: 'mfan_data' }));
      window.localStorage.setItem(foreignKey, 'important_browser_data');

      // Reset vieworld-demo only
      resetTenantStorage('vieworld-demo');

      // Invariant: vieworld-demo is removed
      expect(window.localStorage.getItem(vieworldKey)).toBeNull();

      // Invariant: mfan-demo and unrelated keys are 100% PRESERVED
      expect(window.localStorage.getItem(mfanKey)).not.toBeNull();
      expect(window.localStorage.getItem(foreignKey)).toBe('important_browser_data');
    });
  });
});
