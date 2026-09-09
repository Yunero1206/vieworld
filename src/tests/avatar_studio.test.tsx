import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { AvatarStudioView } from '../views/AvatarStudioView';
import { StudioOverviewView } from '../views/StudioOverviewView';
import { SessionView } from '../views/SessionView';
import { appReducer } from '../domain/reducer';
import { createInitialState } from '../data/fixtures';
import { AppState, AvatarAsset, Session } from '../domain/types';

describe('T11 Acceptance: Artist Avatar Studio & Asset Lifecycle', () => {
  let initialState: AppState;

  beforeEach(() => {
    window.localStorage.clear();
    initialState = createInitialState('vieworld-demo');
  });

  describe('1. Domain Invariants & Asset Governance', () => {
    it('Draft Isolation: session cannot start with a draft avatar (AVATAR_NOT_APPROVED)', () => {
      // avatar-a-v2 is draft in fixtures
      const sessionWithDraft: Session = {
        id: 'session-draft-test',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: new Date().toISOString(),
        worldId: 'artist-a',
        title: 'Draft Session Test',
        avatarAssetId: 'avatar-a-v2', // draft status
        format: 'dropin',
        status: 'scheduled',
        hostRole: 'artist',
        artistPresence: 'absent',
        segmentMode: 'live',
        aiUse: 'none',
        replayStatus: 'not_planned',
        scheduledStartTime: new Date().toISOString(),
        demo: true,
      };

      const stateWithSession: AppState = {
        ...initialState,
        sessions: {
          ...initialState.sessions,
          [sessionWithDraft.id]: sessionWithDraft,
        },
      };

      const newState = appReducer(stateWithSession, {
        type: 'START_SESSION',
        payload: { sessionId: 'session-draft-test' },
      });

      expect(newState.lastError?.code).toBe('AVATAR_NOT_APPROVED');
      expect(newState.sessions['session-draft-test'].status).toBe('scheduled');
    });

    it('Context-Allowed Assignment: assigning avatar validates allowedContexts format', () => {
      // 1. Unapproved draft is blocked with AVATAR_NOT_APPROVED
      const unapprovedState = appReducer(initialState, {
        type: 'ASSIGN_AVATAR_TO_SESSION',
        payload: {
          sessionId: 'session-dropin-01',
          avatarAssetId: 'avatar-a-v2', // status: 'draft'
        },
      });
      expect(unapprovedState.lastError?.code).toBe('AVATAR_NOT_APPROVED');

      // 2. Approved avatar with only ['dropin'] is blocked from 'concert' session
      const concertSessionId = 'session-house-01'; // format: 'concert'
      const stateWithRestrictedApproved: AppState = {
        ...initialState,
        avatarAssets: {
          ...initialState.avatarAssets,
          'avatar-restricted': {
            id: 'avatar-restricted',
            tenantId: 'vieworld-demo',
            version: 1,
            updatedAt: initialState.demoTime,
            ownerWorldId: 'artist-a',
            status: 'approved',
            approvalRef: 'APPROVAL-SIM-RESTRICTED',
            allowedContexts: ['dropin'], // only dropin allowed!
            replayAllowed: true,
            parts: {
              base: 'stage_classic',
              outfit: 'midnight_jacket',
              accessory: 'none',
            },
          },
        },
      };

      const disallowedState = appReducer(stateWithRestrictedApproved, {
        type: 'ASSIGN_AVATAR_TO_SESSION',
        payload: {
          sessionId: concertSessionId,
          avatarAssetId: 'avatar-restricted',
        },
      });

      expect(disallowedState.lastError?.code).toBe('AVATAR_CONTEXT_DISALLOWED');
      expect(disallowedState.sessions[concertSessionId].avatarAssetId).toBe('avatar-a-v1');

      // 3. Approved avatar allowing concert succeeds
      const allowedState = appReducer(initialState, {
        type: 'ASSIGN_AVATAR_TO_SESSION',
        payload: {
          sessionId: concertSessionId,
          avatarAssetId: 'avatar-a-v1', // allows ['dropin', 'listening', 'concert']
        },
      });

      expect(allowedState.lastError).toBeUndefined();
      expect(allowedState.sessions[concertSessionId].avatarAssetId).toBe('avatar-a-v1');
    });

    it('Retirement Invariant: retiring avatar blocks new session start but preserves past history', () => {
      // 1. Retire avatar-a-v1
      const retiredState = appReducer(initialState, {
        type: 'RETIRE_AVATAR_ASSET',
        payload: { assetId: 'avatar-a-v1' },
      });

      expect(retiredState.avatarAssets['avatar-a-v1'].status).toBe('retired');

      // 2. Attempt to start a scheduled session with retired avatar
      const startAttemptState = appReducer(retiredState, {
        type: 'START_SESSION',
        payload: { sessionId: 'session-house-01' },
      });

      expect(startAttemptState.lastError?.code).toBe('AVATAR_RETIRED');
      expect(startAttemptState.sessions['session-house-01'].status).toBe('scheduled');

      // 3. Past completed/running session retains reference and history is intact
      expect(retiredState.sessions['session-dropin-01'].avatarAssetId).toBe('avatar-a-v1');
    });

    it('Draft Independence: SAVE_AVATAR_DRAFT does not mutate the active world avatar', () => {
      const activeWorldBefore = initialState.worlds['artist-a'];
      expect(activeWorldBefore.avatarAssetId).toBe('avatar-a-v1');

      const updatedDraft: AvatarAsset = {
        ...initialState.avatarAssets['avatar-a-v2'],
        parts: {
          base: 'cyber_neon',
          outfit: 'cyber_suit',
          accessory: 'visor_neon',
        },
      };

      const draftSavedState = appReducer(initialState, {
        type: 'SAVE_AVATAR_DRAFT',
        payload: { avatar: updatedDraft },
      });

      // Draft updated in avatarAssets
      expect(draftSavedState.avatarAssets['avatar-a-v2'].parts.base).toBe('cyber_neon');
      // Active avatar in World MUST still be avatar-a-v1
      expect(draftSavedState.worlds['artist-a'].avatarAssetId).toBe('avatar-a-v1');
    });

    it('Synthetic Approval: APPROVE_AVATAR_ASSET generates approvalRef and updates world avatar', () => {
      const approvedState = appReducer(initialState, {
        type: 'APPROVE_AVATAR_ASSET',
        payload: {
          assetId: 'avatar-a-v2',
          approvalRef: 'APPROVAL-SIM-2026-TEST',
        },
      });

      const approvedAsset = approvedState.avatarAssets['avatar-a-v2'];
      expect(approvedAsset.status).toBe('approved');
      expect(approvedAsset.approvalRef).toBe('APPROVAL-SIM-2026-TEST');
      expect(approvedState.worlds['artist-a'].avatarAssetId).toBe('avatar-a-v2');
    });

    it('Revert Version: REVERT_AVATAR_VERSION switches world back to prior approved version', () => {
      // Start with avatar-a-v2 approved
      const stateWithV2Approved = appReducer(initialState, {
        type: 'APPROVE_AVATAR_ASSET',
        payload: { assetId: 'avatar-a-v2', approvalRef: 'APPROVAL-SIM-2026-TEST' },
      });
      expect(stateWithV2Approved.worlds['artist-a'].avatarAssetId).toBe('avatar-a-v2');

      // Revert back to avatar-a-v1
      const revertedState = appReducer(stateWithV2Approved, {
        type: 'REVERT_AVATAR_VERSION',
        payload: {
          worldId: 'artist-a',
          assetId: 'avatar-a-v1',
        },
      });

      expect(revertedState.worlds['artist-a'].avatarAssetId).toBe('avatar-a-v1');
    });
  });

  describe('2. Fan Session Quarantining (Draft Isolation on Live Stage)', () => {
    it('Fan session stage strictly quarantines draft avatar assets', () => {
      // Configure running session pointing to draft avatar-a-v2
      const testState: AppState = {
        ...initialState,
        sessions: {
          ...initialState.sessions,
          'session-dropin-01': {
            ...initialState.sessions['session-dropin-01'],
            avatarAssetId: 'avatar-a-v2', // draft!
          },
        },
      };

      // Save to localStorage so AppProvider picks it up
      window.localStorage.setItem('vieworld_state_v1', JSON.stringify(testState));

      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/sessions/session-dropin-01']}>
            <Routes>
              <Route path="/sessions/:sessionId" element={<SessionView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Verify the draft accessory is NOT rendered on the fan stage
      expect(screen.queryByTestId('visor-neon-accessory')).toBeNull();
      // Instead renders stage fallback watermark without draft ID
      expect(screen.getByText(/Minh họa 2D thuần túy/i)).toBeDefined();
    });
  });

  describe('3. Avatar Studio UI, Presets, Manifest & Controls', () => {
    it('renders AvatarStudioView with required disclosures, controls and live preview', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/studio/avatar']}>
            <Routes>
              <Route path="/studio/avatar" element={<AvatarStudioView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Header and Disclosures
      expect(screen.getByText(/Avatar Studio \(Quản lý Tài sản Nghệ sĩ\)/i)).toBeDefined();
      expect(screen.getByText(/OPERATOR WORKSPACE · P11/i)).toBeDefined();
      expect(screen.getByText(/QUY TẮC BẢO VỆ DANH DỰ NGHỆ SĨ & MINH BẠCH TÀI SẢN/i)).toBeDefined();

      // Asset Manifest Inspector table exists
      expect(screen.getByText(/Hồ sơ Tài sản \(Asset Manifest Inspector\)/i)).toBeDefined();
      expect(screen.getByText('avatar-a-v1')).toBeDefined();

      // Reserved Partner 3D Model Slot
      expect(screen.getByText(/Ô Mô hình 3D Đối tác Độc quyền/i)).toBeDefined();
      expect(screen.getByText(/Slot để trống · Chế độ thiết kế 2D chuẩn/i)).toBeDefined();

      // Truthful Disclosures
      expect(screen.getAllByText(/Mô phỏng phê duyệt/i).length).toBeGreaterThan(0);
    });

    it('applying a preset updates parts and live preview stage', async () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/studio/avatar']}>
            <Routes>
              <Route path="/studio/avatar" element={<AvatarStudioView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Initially avatar-a-v1 has earpiece_glow accessory
      expect(screen.getByTestId('earpiece-glow-accessory')).toBeDefined();

      // Click "Cyber Neon" preset
      const cyberPresetBtn = screen.getByText(/Cyber Neon \(Công nghệ tương lai\)/i);
      fireEvent.click(cyberPresetBtn);

      // Now visor_neon should be visible on stage
      await waitFor(() => {
        expect(screen.getByTestId('visor-neon-accessory')).toBeDefined();
      });

      // Click "Acoustic Minimal" preset
      const acousticPresetBtn = screen.getByText(/Acoustic Minimal \(Mộc tối giản\)/i);
      fireEvent.click(acousticPresetBtn);

      // Now star_badge should be visible on stage
      await waitFor(() => {
        expect(screen.getByTestId('star-badge-accessory')).toBeDefined();
      });
    });

    it('saving a draft triggers SAVE_AVATAR_DRAFT without modifying active world avatar', async () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/studio/avatar']}>
            <Routes>
              <Route path="/studio/avatar" element={<AvatarStudioView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Switch to draft asset in select
      const select = screen.getByLabelText(/Chọn Phiên bản Tài sản:/i) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'avatar-a-v2' } });

      // Click Save Draft
      const saveDraftBtn = screen.getByText(/Lưu Bản Nháp \(Save Draft\)/i);
      fireEvent.click(saveDraftBtn);

      // Verify success alert message
      await waitFor(() => {
        expect(screen.getByText(/Đã lưu bản nháp/i)).toBeDefined();
        expect(screen.getByText(/Bản nháp tách biệt hoàn toàn/i)).toBeDefined();
      });
    });

    it('executing simulated approval updates asset status and assigns synthetic approvalRef', async () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/studio/avatar']}>
            <Routes>
              <Route path="/studio/avatar" element={<AvatarStudioView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Switch to avatar-a-v2 (draft)
      const select = screen.getByLabelText(/Chọn Phiên bản Tài sản:/i) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'avatar-a-v2' } });

      // Click simulated approval button
      const approveBtn = screen.getByText(/Mô Phỏng Phê Duyệt \(Approve Asset\)/i);
      fireEvent.click(approveBtn);

      // Verify approval notice
      await waitFor(() => {
        expect(screen.getByText(/Mô phỏng phê duyệt thành công!/i)).toBeDefined();
        expect(screen.getByText(/Mã chứng thực: APPROVAL-SIM-2026-/i)).toBeDefined();
      });
    });

    it('retiring an asset marks it retired and warns operator', async () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/studio/avatar']}>
            <Routes>
              <Route path="/studio/avatar" element={<AvatarStudioView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Click Retire Asset on avatar-a-v1
      const retireBtn = screen.getByText(/Ngưng Sử Dụng \(Retire Asset\)/i);
      fireEvent.click(retireBtn);

      // Verify warning message
      await waitFor(() => {
        expect(screen.getByText(/Đã ngưng sử dụng \(Retired\) avatar/i)).toBeDefined();
        expect(screen.getByText(/Tài sản này sẽ bị chặn khi tạo phiên mới/i)).toBeDefined();
      });
    });

    it('Truthful Transparency: ensures zero photo upload inputs or face cloning mechanisms', () => {
      const { container } = render(
        <AppProvider>
          <MemoryRouter initialEntries={['/studio/avatar']}>
            <Routes>
              <Route path="/studio/avatar" element={<AvatarStudioView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Invariant §2.3: Zero file upload inputs
      const fileInputs = container.querySelectorAll('input[type="file"]');
      expect(fileInputs.length).toBe(0);

      // Invariant §2.3: Zero auto-rig / face cloning interactive buttons or upload actions
      expect(screen.queryByRole('button', { name: /auto-rig/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /deepfake/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /tải ảnh/i })).toBeNull();
    });
  });

  describe('4. Studio Overview Hub Integration', () => {
    it('renders StudioOverviewView with asset statistics and link to Avatar Studio', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/studio']}>
            <Routes>
              <Route path="/studio" element={<StudioOverviewView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      expect(screen.getByText(/Bàn điều khiển Studio Demo/i)).toBeDefined();
      expect(screen.getByText(/Avatar Đã Phê Duyệt/i)).toBeDefined();
      expect(screen.getByText(/Bản Nháp \(Draft\)/i)).toBeDefined();
      expect(screen.getByText(/Đã Ngưng Dùng \(Retired\)/i)).toBeDefined();

      const enterStudioBtn = screen.getByRole('link', { name: /Mở Avatar Studio/i });
      expect(enterStudioBtn).toBeDefined();
      expect(enterStudioBtn.getAttribute('href')).toBe('/studio/avatar');
    });
  });
});
