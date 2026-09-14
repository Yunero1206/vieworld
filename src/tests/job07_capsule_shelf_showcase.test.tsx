import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { AppShell } from '../components/AppShell';
import { MyWorldView } from '../views/MyWorldView';
import { SessionView } from '../views/SessionView';
import { appReducer } from '../domain/reducer';
import { AppState, Capsule } from '../domain/types';
import { createInitialState } from '../data/fixtures';
import { loadState, saveState } from '../services/storageAdapter';

describe('Job 07 Acceptance: 3-Slot Capsule Showcase Shelf & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. 3-Slot Showcase Shelf UI & Interactions in MyWorldView', () => {
    it('allows fan to place a saved capsule into Ô 1, Ô 2, or Ô 3 and displays on diorama shelf', () => {
      const baseState = createInitialState('vieworld-demo');
      const testCapsule: Capsule = {
        id: 'cap-test-01',
        tenantId: 'vieworld-demo',
        version: 1,
        fanId: baseState.fanProfile.id,
        sessionId: 'session-dropin-01',
        worldId: 'artist-a',
        participationId: 'part-test-01',
        isSaved: true,
        privateNote: 'Đêm diễn acoustic tuyệt vời',
        updatedAt: '2026-09-10T20:00:00Z',
      };

      const customState: AppState = {
        ...baseState,
        capsules: {
          ...baseState.capsules,
          [testCapsule.id]: testCapsule,
        },
        fanProfile: {
          ...baseState.fanProfile,
          showcaseSlots: [null, null, null],
        },
      };

      saveState(customState);

      render(
        <AppProvider disableAutoHydrate={false}>
          <MemoryRouter initialEntries={['/me']}>
            <Routes>
              <Route path="/me" element={<MyWorldView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Verify diorama shelf is initially empty
      const shelfSpot = screen.getByTestId('room-shelf-hotspot');
      expect(shelfSpot).toBeInTheDocument();
      expect(within(shelfSpot).getByTestId('shelf-slot-1')).toHaveTextContent('Trống');
      expect(within(shelfSpot).getByTestId('shelf-slot-2')).toHaveTextContent('Trống');
      expect(within(shelfSpot).getByTestId('shelf-slot-3')).toHaveTextContent('Trống');

      // Go to capsules tab
      fireEvent.click(screen.getByTestId('tab-btn-my-capsules'));

      // Verify Showcase Shelf Manager exists with 0/3 occupied
      expect(screen.getByTestId('showcase-shelf-manager')).toBeInTheDocument();
      expect(screen.getByTestId('shelf-manager-status')).toHaveTextContent('0/3 ô đang trưng bày');

      // Place capsule into Ô 1 via card button
      const assignBtn1 = screen.getByTestId('slot-assign-btn-cap-test-01-0');
      expect(assignBtn1).toHaveTextContent('+ Ô 1');
      fireEvent.click(assignBtn1);

      // Verify card now shows badge and unassign button
      expect(screen.getByTestId('capsule-slot-badge-cap-test-01')).toHaveTextContent('⭐ Đang ở Ô 1');
      expect(screen.getByTestId('slot-unassign-btn-cap-test-01')).toBeInTheDocument();

      // Verify Showcase Shelf Manager updates to 1/3
      expect(screen.getByTestId('shelf-manager-status')).toHaveTextContent('1/3 ô đang trưng bày');
      expect(screen.getByTestId('shelf-cubby-title-0')).toBeInTheDocument();

      // Verify diorama shelf now shows Ô 1 occupied
      expect(within(shelfSpot).getByTestId('shelf-slot-1')).toHaveTextContent('Kỷ niệm #1');
    });

    it('enforces invariant: "Một capsule tối đa một ô" (moving to Ô 2 clears Ô 1)', () => {
      const baseState = createInitialState('vieworld-demo');
      const testCapsule: Capsule = {
        id: 'cap-test-02',
        tenantId: 'vieworld-demo',
        version: 1,
        fanId: baseState.fanProfile.id,
        sessionId: 'session-dropin-01',
        worldId: 'artist-a',
        participationId: 'part-test-02',
        isSaved: true,
        updatedAt: '2026-09-10T20:00:00Z',
      };

      // Initially placed in slot 0 (Ô 1)
      const customState: AppState = {
        ...baseState,
        capsules: {
          ...baseState.capsules,
          [testCapsule.id]: testCapsule,
        },
        fanProfile: {
          ...baseState.fanProfile,
          showcaseSlots: [testCapsule.id, null, null],
        },
      };

      saveState(customState);

      render(
        <AppProvider disableAutoHydrate={false}>
          <MemoryRouter initialEntries={['/me']}>
            <Routes>
              <Route path="/me" element={<MyWorldView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      fireEvent.click(screen.getByTestId('tab-btn-my-capsules'));

      // Check initially in Ô 1
      expect(screen.getByTestId('capsule-slot-badge-cap-test-02')).toHaveTextContent('⭐ Đang ở Ô 1');

      // Click "Chuyển sang Ô 2"
      const moveBtn2 = screen.getByTestId('slot-assign-btn-cap-test-02-1');
      expect(moveBtn2).toHaveTextContent('Chuyển sang Ô 2');
      fireEvent.click(moveBtn2);

      // Now badge shows Ô 2
      expect(screen.getByTestId('capsule-slot-badge-cap-test-02')).toHaveTextContent('⭐ Đang ở Ô 2');

      // Ô 1 is now empty, Ô 2 is occupied
      expect(screen.queryByTestId('shelf-cubby-title-0')).not.toBeInTheDocument();
      expect(screen.getByTestId('shelf-cubby-title-1')).toBeInTheDocument();

      // Diorama shelf shows Ô 1 empty and Ô 2 occupied
      const shelfSpot = screen.getByTestId('room-shelf-hotspot');
      expect(within(shelfSpot).getByTestId('shelf-slot-1')).toHaveTextContent('Trống');
      expect(within(shelfSpot).getByTestId('shelf-slot-2')).toHaveTextContent('Kỷ niệm #2');
    });

    it('enforces invariant: "Bỏ khỏi kệ không xóa capsule" (unslotting preserves saved capsule)', () => {
      const baseState = createInitialState('vieworld-demo');
      const testCapsule: Capsule = {
        id: 'cap-test-03',
        tenantId: 'vieworld-demo',
        version: 1,
        fanId: baseState.fanProfile.id,
        sessionId: 'session-dropin-01',
        worldId: 'artist-a',
        participationId: 'part-test-03',
        isSaved: true,
        privateNote: 'Kỷ niệm quý giá',
        updatedAt: '2026-09-10T20:00:00Z',
      };

      const customState: AppState = {
        ...baseState,
        capsules: {
          ...baseState.capsules,
          [testCapsule.id]: testCapsule,
        },
        fanProfile: {
          ...baseState.fanProfile,
          showcaseSlots: [testCapsule.id, null, null],
        },
      };

      saveState(customState);

      render(
        <AppProvider disableAutoHydrate={false}>
          <MemoryRouter initialEntries={['/me']}>
            <Routes>
              <Route path="/me" element={<MyWorldView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Unslot directly via diorama shelf remove button "×"
      const removeBtn = screen.getByTestId('shelf-remove-slot-1');
      fireEvent.click(removeBtn);

      // Diorama shelf slot 1 is now empty
      const shelfSpot = screen.getByTestId('room-shelf-hotspot');
      expect(within(shelfSpot).getByTestId('shelf-slot-1')).toHaveTextContent('Trống');

      // Go to capsules tab
      fireEvent.click(screen.getByTestId('tab-btn-my-capsules'));

      // Capsule card is STILL present and intact!
      expect(screen.getByTestId('capsule-card-cap-test-03')).toBeInTheDocument();
      expect(screen.getByText('Kỷ niệm quý giá')).toBeInTheDocument();
      // Badge is removed, but capsule is still saved
      expect(screen.queryByTestId('capsule-slot-badge-cap-test-03')).not.toBeInTheDocument();
      expect(screen.getByText('Đã lưu trữ')).toBeInTheDocument();
    });

    it('automatically removes capsule from showcase shelf if capsule is unsaved', () => {
      const baseState = createInitialState('vieworld-demo');
      const testCapsule: Capsule = {
        id: 'cap-test-04',
        tenantId: 'vieworld-demo',
        version: 1,
        fanId: baseState.fanProfile.id,
        sessionId: 'session-dropin-01',
        worldId: 'artist-a',
        participationId: 'part-test-04',
        isSaved: true,
        updatedAt: '2026-09-10T20:00:00Z',
      };

      const customState: AppState = {
        ...baseState,
        capsules: {
          ...baseState.capsules,
          [testCapsule.id]: testCapsule,
        },
        fanProfile: {
          ...baseState.fanProfile,
          showcaseSlots: [testCapsule.id, null, null],
        },
      };

      saveState(customState);

      render(
        <AppProvider disableAutoHydrate={false}>
          <MemoryRouter initialEntries={['/me']}>
            <Routes>
              <Route path="/me" element={<MyWorldView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      fireEvent.click(screen.getByTestId('tab-btn-my-capsules'));
      expect(screen.getByTestId('capsule-slot-badge-cap-test-04')).toBeInTheDocument();

      // Unsave the capsule via bookmark button
      const unsaveBtn = screen.getByTestId('toggle-capsule-save-cap-test-04');
      fireEvent.click(unsaveBtn);

      // Now capsule is unsaved, and automatically removed from showcase shelf
      expect(screen.queryByTestId('capsule-slot-badge-cap-test-04')).not.toBeInTheDocument();
      expect(screen.getByTestId('shelf-manager-status')).toHaveTextContent('0/3 ô đang trưng bày');
    });
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
          id: 'fan-01',
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
        fanId: 'fan-01',
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

  describe('4. Signature Loop & Constitutional Invariant: Replay Never Grants Live Capsule', () => {
    it('full loop: live participation → earns capsule → save note → slot onto room shelf', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/sessions/session-dropin-01']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="sessions/:sessionId" element={<SessionView />} />
                <Route path="me" element={<MyWorldView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // 1. Join live stage
      fireEvent.click(screen.getByRole('button', { name: /Vào sân khấu trực tiếp/i }));

      // 2. Simulate session end via review tool
      fireEvent.click(screen.getByText(/Công cụ review phiên/i));
      fireEvent.click(screen.getByRole('button', { name: /Mô phỏng: Kết thúc phiên sự kiện/i }));

      // 3. Navigate to My World / Phòng tôi
      const myWorldLink = document.getElementById('nav-my-world') || document.getElementById('mobile-nav-my-world');
      expect(myWorldLink).toBeTruthy();
      fireEvent.click(myWorldLink!);

      // 4. Open capsules tab
      fireEvent.click(screen.getByTestId('tab-btn-my-capsules'));

      // 5. Place the newly earned live capsule into Ô 1
      const assignBtn = screen.getAllByRole('button', { name: /\+ Ô 1/i })[0];
      fireEvent.click(assignBtn);

      // 6. Verify shelf manager and diorama reflect slot
      expect(screen.getByTestId('shelf-manager-status')).toHaveTextContent('1/3 ô đang trưng bày');
      const shelfSpot = screen.getByTestId('room-shelf-hotspot');
      expect(within(shelfSpot).getByTestId('shelf-slot-1')).toHaveTextContent('Kỷ niệm #1');
    });

    it('replay viewer receives no live capsule and shelf remains empty', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter initialEntries={['/sessions/session-listen-01']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="sessions/:sessionId" element={<SessionView />} />
                <Route path="me" element={<MyWorldView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Only enter lobby without attending live
      fireEvent.click(screen.getByRole('button', { name: /Vào phòng chờ/i }));

      // Navigate to My World / Phòng tôi
      const myWorldLink = document.getElementById('nav-my-world') || document.getElementById('mobile-nav-my-world');
      expect(myWorldLink).toBeTruthy();
      fireEvent.click(myWorldLink!);

      // Shelf and capsules remain empty
      expect(screen.getByTestId('capsules-empty-state')).toBeInTheDocument();
      const shelfSpot = screen.getByTestId('room-shelf-hotspot');
      expect(within(shelfSpot).getByTestId('shelf-slot-1')).toHaveTextContent('Trống');
      expect(within(shelfSpot).getByTestId('shelf-slot-2')).toHaveTextContent('Trống');
      expect(within(shelfSpot).getByTestId('shelf-slot-3')).toHaveTextContent('Trống');
    });
  });
});
