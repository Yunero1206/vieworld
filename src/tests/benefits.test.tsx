/**
 * Acceptance T07: Membership and Eligible Benefits Only
 *
 * Tests all 12 required invariant criteria:
 * 1. Following a World does not create membership.
 * 2. Upgrading creates the intended simulated membership state once.
 * 3. Active membership does not automatically make every benefit eligible.
 * 4. A pending benefit cannot be claimed.
 * 5. An eligible benefit can be claimed exactly once.
 * 6. Repeated claim attempts remain idempotent.
 * 7. Refresh preserves membership and benefit state.
 * 8. Expired membership shows renewal without silently restoring eligibility.
 * 9. Expired or revoked benefits cannot be claimed.
 * 10. Switching tenant does not leak membership or benefit records.
 * 11. Eligibility reasons and next actions match the actual state.
 * 12. UI integration across WorldDetailView, MyWorldView, and BenefitDetailView.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { appReducer } from '../domain/reducer';
import { AppState } from '../domain/types';
import { createInitialState, scenarioPresets } from '../data/fixtures';
import { AppProvider } from '../context/AppContext';
import { AppShell } from '../components/AppShell';
import { WorldDetailView } from '../views/WorldDetailView';
import { MyWorldView } from '../views/MyWorldView';
import { BenefitDetailView } from '../views/BenefitDetailView';
import { MembershipCard } from '../components/MembershipCard';
import { saveState } from '../services/storageAdapter';

describe('T07 Acceptance: Membership and Eligible Benefits', () => {
  let state: AppState;

  beforeEach(() => {
    window.localStorage.clear();
    state = createInitialState('vieworld-demo');
  });

  describe('1. Domain Invariants & Action Guards', () => {
    it('1. Following a World does not create membership', () => {
      // Start as a new fan with 0 follows and 0 memberships
      const newFan = scenarioPresets.newFan('vieworld-demo');
      expect(newFan.followedWorldIds).toHaveLength(0);
      expect(Object.keys(newFan.memberships)).toHaveLength(0);

      // Follow artist-a
      const followed = appReducer(newFan, { type: 'TOGGLE_FOLLOW', worldId: 'artist-a' });
      expect(followed.followedWorldIds).toContain('artist-a');

      // Membership invariant: MUST NOT create membership
      expect(Object.keys(followed.memberships)).toHaveLength(0);

      // Follow neon-sessions
      const followedBoth = appReducer(followed, { type: 'TOGGLE_FOLLOW', worldId: 'neon-sessions' });
      expect(followedBoth.followedWorldIds).toContain('neon-sessions');
      expect(Object.keys(followedBoth.memberships)).toHaveLength(0);
    });

    it('2. Upgrading creates the intended simulated membership state once', () => {
      const newFan = scenarioPresets.newFan('vieworld-demo');
      expect(newFan.memberships['member-a-01']).toBeUndefined();

      // Upgrade membership for artist-a
      const upgraded = appReducer(newFan, { type: 'UPGRADE_MEMBERSHIP', worldId: 'artist-a' });
      const membership = upgraded.memberships['member-a-01'];

      expect(membership).toBeDefined();
      expect(membership.status).toBe('active');
      expect(membership.worldId).toBe('artist-a');
      expect(membership.fanId).toBe(newFan.fanProfile.id);
      expect(membership.expiresAt).toBeDefined();

      // Calling upgrade again is idempotent: returns same state without duplicating or changing IDs
      const upgradedAgain = appReducer(upgraded, { type: 'UPGRADE_MEMBERSHIP', worldId: 'artist-a' });
      expect(upgradedAgain).toBe(upgraded);
      expect(Object.keys(upgradedAgain.memberships)).toHaveLength(1);
    });

    it('3. Active membership does not automatically make every benefit eligible', () => {
      // Active member has active membership for artist-a
      const activeState = scenarioPresets.activeMember('vieworld-demo');
      expect(activeState.memberships['member-a-01'].status).toBe('active');

      // benefit-replay-01 is eligible
      expect(activeState.benefits['benefit-replay-01'].status).toBe('eligible');

      // Invariant: benefit-early-access-01 MUST REMAIN pending, not eligible!
      expect(activeState.benefits['benefit-early-access-01'].status).toBe('pending');
      expect(activeState.benefits['benefit-early-access-01'].reasonCode).toBe('PENDING_ORGANIZER_DISPATCH');

      // Upgrading an already active membership does NOT force early access to become eligible
      const afterUpgrade = appReducer(activeState, { type: 'UPGRADE_MEMBERSHIP', worldId: 'artist-a' });
      expect(afterUpgrade.benefits['benefit-early-access-01'].status).toBe('pending');
    });

    it('4. A pending benefit cannot be claimed', () => {
      expect(state.benefits['benefit-early-access-01'].status).toBe('pending');

      const failedClaim = appReducer(state, {
        type: 'CLAIM_BENEFIT',
        benefitId: 'benefit-early-access-01',
      });

      // Status remains pending
      expect(failedClaim.benefits['benefit-early-access-01'].status).toBe('pending');

      // Domain error is raised with explanation
      expect(failedClaim.lastError).toBeDefined();
      expect(failedClaim.lastError?.code).toBe('BENEFIT_NOT_ELIGIBLE');
      expect(failedClaim.lastError?.message).toContain('pending');
    });

    it('5. An eligible benefit can be claimed exactly once', () => {
      expect(state.benefits['benefit-replay-01'].status).toBe('eligible');

      const claimedState = appReducer(state, {
        type: 'CLAIM_BENEFIT',
        benefitId: 'benefit-replay-01',
      });

      expect(claimedState.benefits['benefit-replay-01'].status).toBe('claimed');
      expect(claimedState.benefits['benefit-replay-01'].nextAction).toContain('kích hoạt thành công');
      expect(claimedState.lastError).toBeUndefined();
    });

    it('6. Repeated claim attempts remain idempotent', () => {
      // First claim
      const claimedState = appReducer(state, {
        type: 'CLAIM_BENEFIT',
        benefitId: 'benefit-replay-01',
      });
      expect(claimedState.benefits['benefit-replay-01'].status).toBe('claimed');

      // Second claim attempt
      const secondClaim = appReducer(claimedState, {
        type: 'CLAIM_BENEFIT',
        benefitId: 'benefit-replay-01',
      });

      // No error, remains claimed, idempotent
      expect(secondClaim.benefits['benefit-replay-01'].status).toBe('claimed');
      expect(secondClaim.lastError).toBeUndefined();
      expect(secondClaim).toBe(claimedState);
    });

    it('8. Expired membership shows renewal without silently restoring eligibility', () => {
      // Set membership to expired
      const expiredState: AppState = {
        ...state,
        memberships: {
          ...state.memberships,
          'member-a-01': {
            ...state.memberships['member-a-01'],
            status: 'expired',
            expiresAt: '2026-01-01T00:00:00.000Z',
          },
        },
        benefits: {
          ...state.benefits,
          'benefit-replay-01': {
            ...state.benefits['benefit-replay-01'],
            status: 'expired',
            reasonCode: 'MEMBERSHIP_EXPIRED',
            nextAction: 'Gia hạn hội viên để xem xét lại quyền lợi.',
          },
        },
      };

      expect(expiredState.memberships['member-a-01'].status).toBe('expired');
      expect(expiredState.benefits['benefit-replay-01'].status).toBe('expired');

      // Expired benefit cannot be claimed directly
      const claimExpired = appReducer(expiredState, {
        type: 'CLAIM_BENEFIT',
        benefitId: 'benefit-replay-01',
      });
      expect(claimExpired.lastError?.code).toBe('BENEFIT_NOT_ELIGIBLE');

      // Renew membership via upgrade
      const renewedState = appReducer(expiredState, {
        type: 'UPGRADE_MEMBERSHIP',
        worldId: 'artist-a',
      });

      // Membership is renewed to active
      expect(renewedState.memberships['member-a-01'].status).toBe('active');

      // Invariant: Renewal must not silently mutate existing expired benefit status
      expect(renewedState.benefits['benefit-replay-01'].status).toBe('expired');
    });

    it('9. Expired or revoked benefits cannot be claimed', () => {
      const customState: AppState = {
        ...state,
        benefits: {
          ...state.benefits,
          'benefit-expired-test': {
            id: 'benefit-expired-test',
            tenantId: state.activeTenantId,
            version: 1,
            updatedAt: state.demoTime,
            fanId: state.fanProfile.id,
            worldId: 'artist-a',
            title: 'Quyền lợi đã hết hạn',
            status: 'expired',
            reasonCode: 'CAMPAIGN_ENDED',
            sourceRef: 'member-a-01',
            nextAction: 'Không thể sử dụng.',
          },
          'benefit-revoked-test': {
            id: 'benefit-revoked-test',
            tenantId: state.activeTenantId,
            version: 1,
            updatedAt: state.demoTime,
            fanId: state.fanProfile.id,
            worldId: 'artist-a',
            title: 'Quyền lợi bị thu hồi',
            status: 'revoked',
            reasonCode: 'POLICY_VIOLATION_SIM',
            sourceRef: 'member-a-01',
            nextAction: 'Liên hệ hỗ trợ.',
          },
        },
      };

      const claimExpired = appReducer(customState, {
        type: 'CLAIM_BENEFIT',
        benefitId: 'benefit-expired-test',
      });
      expect(claimExpired.lastError?.code).toBe('BENEFIT_NOT_ELIGIBLE');

      const claimRevoked = appReducer(customState, {
        type: 'CLAIM_BENEFIT',
        benefitId: 'benefit-revoked-test',
      });
      expect(claimRevoked.lastError?.code).toBe('BENEFIT_NOT_ELIGIBLE');
    });

    it('10. Switching tenant does not leak membership or benefit records', () => {
      // Modify vieworld-demo state
      const claimedState = appReducer(state, {
        type: 'CLAIM_BENEFIT',
        benefitId: 'benefit-replay-01',
      });
      expect(claimedState.benefits['benefit-replay-01'].status).toBe('claimed');

      // Add a custom membership in vieworld-demo
      claimedState.memberships['custom-member-test'] = {
        id: 'custom-member-test',
        tenantId: 'vieworld-demo',
        version: 1,
        updatedAt: state.demoTime,
        fanId: state.fanProfile.id,
        worldId: 'custom-world',
        status: 'active',
      };

      // Switch to mfan-demo
      const mfanState = appReducer(claimedState, {
        type: 'SWITCH_TENANT',
        targetTenantId: 'mfan-demo',
      });

      expect(mfanState.activeTenantId).toBe('mfan-demo');
      // In mfan-demo, benefit-replay-01 is eligible, NOT claimed from vieworld-demo
      expect(mfanState.benefits['benefit-replay-01'].status).toBe('eligible');
      // Custom membership from vieworld-demo does not leak
      expect(mfanState.memberships['custom-member-test']).toBeUndefined();
    });

    it('11. Eligibility reasons and next actions match the actual state', () => {
      const replayBenefit = state.benefits['benefit-replay-01'];
      expect(replayBenefit.reasonCode).toBe('ACTIVE_MEMBERSHIP_VERIFIED');
      expect(replayBenefit.sourceRef).toBe('member-a-01');
      expect(replayBenefit.status).toBe('eligible');
      expect(replayBenefit.nextAction).toContain('Nhấn để kích hoạt');

      const earlyBenefit = state.benefits['benefit-early-access-01'];
      expect(earlyBenefit.reasonCode).toBe('PENDING_ORGANIZER_DISPATCH');
      expect(earlyBenefit.sourceRef).toBe('member-a-01');
      expect(earlyBenefit.status).toBe('pending');
      expect(earlyBenefit.nextAction).toContain('đối soát');
    });
  });

  describe('2. UI Integration: WorldDetailView & MyWorldView Journeys', () => {
    it('7. Refresh preserves membership and benefit state in localStorage', async () => {
      // Render application at /me
      const { unmount } = render(
        <AppProvider>
          <MemoryRouter initialEntries={['/me']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="me" element={<MyWorldView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Navigate to Quyền lợi & Hội viên tab
      const benefitsTab = screen.getByRole('tab', { name: /Quyền lợi & Hội viên/i });
      fireEvent.click(benefitsTab);

      // Verify initial benefit status
      expect(screen.getByTestId('benefit-status-benefit-replay-01')).toHaveTextContent(/Đủ điều kiện/i);

      // Claim benefit-replay-01
      const claimBtn = screen.getByTestId('claim-benefit-btn-benefit-replay-01');
      fireEvent.click(claimBtn);

      // Verify claimed badge appears
      expect(screen.getByTestId('benefit-claimed-indicator-benefit-replay-01')).toBeInTheDocument();

      // Unmount simulating page refresh
      unmount();

      // Remount application
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/me']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="me" element={<MyWorldView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Re-enter Quyền lợi & Hội viên tab
      const benefitsTabAfter = screen.getByRole('tab', { name: /Quyền lợi & Hội viên/i });
      fireEvent.click(benefitsTabAfter);

      // Verify state was persisted in storage and restored
      expect(screen.getByTestId('benefit-claimed-indicator-benefit-replay-01')).toBeInTheDocument();
      expect(screen.getByTestId('benefit-status-benefit-replay-01')).toHaveTextContent(/Đã kích hoạt/i);
    });

    it('renders MembershipCard with active, inactive, and expired states truthfully', () => {
      const mockWorld = state.worlds['artist-a'];

      // Active state
      const { rerender } = render(
        <MembershipCard
          world={mockWorld}
          membership={{
            id: 'member-a-01',
            tenantId: 'vieworld-demo',
            version: 1,
            updatedAt: state.demoTime,
            fanId: 'fan-linh',
            worldId: 'artist-a',
            status: 'active',
            expiresAt: '2027-01-01T00:00:00.000Z',
          }}
        />
      );

      expect(screen.getByTestId('membership-status-active')).toBeInTheDocument();
      expect(screen.getByText(/Đã là hội viên chính thức/i)).toBeInTheDocument();

      // Inactive state
      rerender(
        <MembershipCard
          world={mockWorld}
          membership={undefined}
        />
      );
      expect(screen.getByTestId('membership-status-inactive')).toBeInTheDocument();
      expect(screen.getByText(/Mô phỏng: Nâng cấp hội viên/i)).toBeInTheDocument();

      // Expired state
      rerender(
        <MembershipCard
          world={mockWorld}
          membership={{
            id: 'member-a-01',
            tenantId: 'vieworld-demo',
            version: 1,
            updatedAt: state.demoTime,
            fanId: 'fan-linh',
            worldId: 'artist-a',
            status: 'expired',
            expiresAt: '2026-01-01T00:00:00.000Z',
          }}
        />
      );
      expect(screen.getByTestId('membership-status-expired')).toBeInTheDocument();
      expect(screen.getByText(/Mô phỏng: Gia hạn hội viên/i)).toBeInTheDocument();
    });

    it('renders WorldDetailView membership tab and allows upgrading membership', async () => {
      // Seed new fan scenario in storage so artist-a membership starts inactive
      saveState(scenarioPresets.newFan('vieworld-demo'));

      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/worlds/artist-a']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="worlds/:worldId" element={<WorldDetailView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Click on Hội viên & Quyền lợi tab
      const membershipTab = screen.getByRole('tab', { name: /Hội viên & Quyền lợi/i });
      fireEvent.click(membershipTab);

      // Verify inactive status
      expect(screen.getByTestId('membership-status-inactive')).toBeInTheDocument();

      // Click upgrade button
      const upgradeBtn = screen.getByTestId('upgrade-membership-btn-artist-a');
      fireEvent.click(upgradeBtn);

      // Membership is now active!
      expect(screen.getByTestId('membership-status-active')).toBeInTheDocument();

      // Replay benefit is now eligible
      expect(screen.getByTestId('benefit-status-benefit-replay-01')).toHaveTextContent(/Đủ điều kiện/i);

      // Early access benefit remains pending (Invariant: active membership does not automatically grant all benefits)
      expect(screen.getByTestId('benefit-status-benefit-early-access-01')).toHaveTextContent(/Đang chờ đối soát/i);
    });

    it('renders BenefitDetailView with qualification details and early access constitutional disclosure', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/benefits/benefit-early-access-01']}>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route path="benefits/:benefitId" element={<BenefitDetailView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Header and title
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Xác thực quyền mua sớm vé Live House');

      // Reason code displayed deterministically
      expect(screen.getAllByText('PENDING_ORGANIZER_DISPATCH')[0]).toBeInTheDocument();

      // Constitutional disclosure: early access != guaranteed inventory or artist contact
      expect(screen.getByText(/không đảm bảo chắc chắn còn hàng trong kho/i)).toBeInTheDocument();
      expect(screen.getByText(/không bao gồm quyền tương tác riêng với nghệ sĩ/i)).toBeInTheDocument();

      // Claim button is disabled because it is pending
      const claimBtn = screen.getByRole('button', { name: /Chờ đối soát từ ban tổ chức/i });
      expect(claimBtn).toBeDisabled();
    });
  });
});
