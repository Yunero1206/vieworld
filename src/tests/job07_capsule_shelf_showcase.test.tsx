import { beforeEach,describe,expect,it } from 'vitest';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { AppState,Capsule } from '../domain/types';
import { loadState,saveState } from '../services/storageAdapter';

describe('Job 07 Acceptance: 3-Slot Capsule Showcase Shelf & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('2. Reducer Unit Verification: SET_SHOWCASE_SLOT & CLEAR_SHOWCASE_SLOT', () => {
    it('ignores invalid slot indexes or unsaved/other fans capsules', () => {
      const baseState = createInitialState('vieworld-demo');
      const testCapsuleOtherFan: Capsule = {
        id: 'cap-other-01',
        tenantId: 'vieworld-demo',
        version: 1,
        fanId: 'fan-other-99',
        sessionId: 'session-dropin-01',
        worldId: 'artist-a',
        participationId: 'part-other-01',
        isSaved: true,
        updatedAt: '2026-09-10T20:00:00Z',
      };

      const stateWithOther: AppState = {
        ...baseState,
        capsules: {
          [testCapsuleOtherFan.id]: testCapsuleOtherFan,
        },
        fanProfile: {
          ...baseState.fanProfile,
          showcaseSlots: [null, null, null],
        },
      };

      // Trying to assign other fan's capsule -> rejected
      const stateAfterInvalid = appReducer(stateWithOther, {
        type: 'SET_SHOWCASE_SLOT',
        slotIndex: 0,
        capsuleId: 'cap-other-01',
      });
      expect(stateAfterInvalid.fanProfile.showcaseSlots).toEqual([null, null, null]);

      // Assigning valid saved capsule belonging to fan
      const testCapsuleOwn: Capsule = {
        id: 'cap-own-01',
        tenantId: 'vieworld-demo',
        version: 1,
        fanId: baseState.fanProfile.id,
        sessionId: 'session-dropin-01',
        worldId: 'artist-a',
        participationId: 'part-own-01',
        isSaved: true,
        updatedAt: '2026-09-10T20:00:00Z',
      };
      const stateWithOwn = {
        ...stateWithOther,
        capsules: { ...stateWithOther.capsules, [testCapsuleOwn.id]: testCapsuleOwn },
      };

      const stateAfterValid = appReducer(stateWithOwn, {
        type: 'SET_SHOWCASE_SLOT',
        slotIndex: 2,
        capsuleId: 'cap-own-01',
      });
      expect(stateAfterValid.fanProfile.showcaseSlots).toEqual([null, null, 'cap-own-01']);

      // CLEAR_SHOWCASE_SLOT clears slot 2
      const stateAfterClear = appReducer(stateAfterValid, {
        type: 'CLEAR_SHOWCASE_SLOT',
        slotIndex: 2,
      });
      expect(stateAfterClear.fanProfile.showcaseSlots).toEqual([null, null, null]);
    });
  });

  describe('3. Persistence & Backward-Compatible Migration', () => {
    it('persists showcaseSlots to storage and rehydrates after reload', () => {
      const baseState = createInitialState('vieworld-demo');
      const stateToSave: AppState = {
        ...baseState,
        fanProfile: {
          ...baseState.fanProfile,
          showcaseSlots: ['cap-saved-01', null, 'cap-saved-03'],
        },
      };

      saveState(stateToSave);

      const loaded = loadState('vieworld-demo', baseState.fanProfile.id);
      expect(loaded.state.fanProfile.showcaseSlots).toEqual(['cap-saved-01', null, 'cap-saved-03']);
    });

    it('migrates legacy storage payload missing showcaseSlots to [null, null, null] without data loss', () => {
      const baseState = createInitialState('vieworld-demo');
      const legacyStateWithoutSlots = {
        ...baseState,
        fanProfile: {
          ...baseState.fanProfile,
          showcaseSlots: undefined as unknown as [string | null, string | null, string | null],
        },
      };

      // Manually simulate existing pre-Job-07 localStorage JSON
      const serialized = JSON.stringify({
        schemaVersion: 1,
        savedAt: '2026-09-01T00:00:00Z',
        tenantId: 'vieworld-demo',
        state: legacyStateWithoutSlots,
      });
      localStorage.setItem('vieworld_v1_vieworld-demo_fan-linh', serialized);

      const loaded = loadState('vieworld-demo', 'fan-linh');
      expect(loaded.state.fanProfile.showcaseSlots).toEqual([null, null, null]);
      expect(loaded.isMemoryFallback).toBe(false);
    });

    it('isolates showcase slots between tenants (vieworld-demo vs mfan-demo)', () => {
      const baseStateVie = createInitialState('vieworld-demo');
      const baseStateMFan = createInitialState('mfan-demo');

      const vieworldState: AppState = {
        ...baseStateVie,
        activeTenantId: 'vieworld-demo',
        fanProfile: {
          ...baseStateVie.fanProfile,
          showcaseSlots: ['cap-vie-01', null, null],
        },
      };

      const mfanState: AppState = {
        ...baseStateMFan,
        activeTenantId: 'mfan-demo',
        fanProfile: {
          ...baseStateMFan.fanProfile,
          showcaseSlots: [null, 'cap-mfan-02', null],
        },
      };

      saveState(vieworldState);
      saveState(mfanState);

      const loadedVieWorld = loadState('vieworld-demo', baseStateVie.fanProfile.id);
      const loadedMFan = loadState('mfan-demo', baseStateMFan.fanProfile.id);

      expect(loadedVieWorld.state.fanProfile.showcaseSlots).toEqual(['cap-vie-01', null, null]);
      expect(loadedMFan.state.fanProfile.showcaseSlots).toEqual([null, 'cap-mfan-02', null]);
    });
  });
});
