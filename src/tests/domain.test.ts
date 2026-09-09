/**
 * VieWorld Domain & Action Guards Acceptance Tests (T01)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { appReducer } from '../domain/reducer';
import { AppState } from '../domain/types';
import {
  createInitialState,
  scenarioPresets,
  CANONICAL_WORLDS,
  CANONICAL_BENEFITS,
  CANONICAL_PRODUCTS,
} from '../data/fixtures';

describe('T01 Acceptance: Canonical Fixtures & Invariant Action Guards', () => {
  let state: AppState;

  beforeEach(() => {
    state = createInitialState('vieworld-demo');
  });

  describe('1. Canonical Fixtures Verification', () => {
    it('contains exactly one artist world and one IP world in baseline', () => {
      expect(CANONICAL_WORLDS['artist-a']).toBeDefined();
      expect(CANONICAL_WORLDS['artist-a'].type).toBe('artist');

      expect(CANONICAL_WORLDS['neon-sessions']).toBeDefined();
      expect(CANONICAL_WORLDS['neon-sessions'].type).toBe('ip');

      // Verify linked world integrity without auto-following
      expect(CANONICAL_WORLDS['artist-a'].linkedWorldIds).toContain('neon-sessions');
      expect(CANONICAL_WORLDS['neon-sessions'].linkedWorldIds).toContain('artist-a');
    });

    it('contains two products and two benefits', () => {
      expect(CANONICAL_PRODUCTS['product-pin-01']).toBeDefined();
      expect(CANONICAL_PRODUCTS['product-shirt-01']).toBeDefined();

      expect(CANONICAL_BENEFITS['benefit-replay-01']).toBeDefined();
      expect(CANONICAL_BENEFITS['benefit-early-access-01']).toBeDefined();
    });

    it('contains all required scenario presets', () => {
      const newFan = scenarioPresets.newFan();
      expect(newFan.followedWorldIds).toHaveLength(0);
      expect(Object.keys(newFan.memberships)).toHaveLength(0);

      const activeMember = scenarioPresets.activeMember();
      expect(activeMember.memberships['member-a-01'].status).toBe('active');

      const benefitPending = scenarioPresets.benefitPending();
      expect(benefitPending.benefits['benefit-replay-01'].status).toBe('pending');

      const orderPaid = scenarioPresets.orderPaid();
      expect(Object.values(orderPaid.orders)[0].status).toBe('paid');

      const sessionDisconnected = scenarioPresets.sessionDisconnected();
      expect(sessionDisconnected.sessions['session-dropin-01'].artistPresence).toBe('disconnected');

      const replayExpired = scenarioPresets.replayExpired();
      expect(replayExpired.sessions['session-dropin-01'].replayStatus).toBe('expired');
    });
  });

  describe('2. Follow vs Membership Invariants', () => {
    it('following an unfollowed world toggles state and NEVER creates membership', () => {
      // Start with new fan scenario (0 follows, 0 memberships)
      state = scenarioPresets.newFan();
      expect(state.followedWorldIds).not.toContain('neon-sessions');
      expect(Object.keys(state.memberships)).toHaveLength(0);

      const next = appReducer(state, { type: 'TOGGLE_FOLLOW', worldId: 'neon-sessions' });
      expect(next.followedWorldIds).toContain('neon-sessions');

      // Crucial Invariant: Membership remains untouched
      expect(Object.keys(next.memberships)).toHaveLength(0);
      expect(next.lastError).toBeUndefined();
    });

    it('unfollowing removes from followed list without altering existing memberships', () => {
      expect(state.followedWorldIds).toContain('artist-a');
      expect(state.memberships['member-a-01']).toBeDefined();

      const next = appReducer(state, { type: 'TOGGLE_FOLLOW', worldId: 'artist-a' });
      expect(next.followedWorldIds).not.toContain('artist-a');

      // Membership is still active
      expect(next.memberships['member-a-01'].status).toBe('active');
    });
  });

  describe('3. RSVP Invariants & Cancellation Guard', () => {
    it('allows toggling RSVP for open / scheduled sessions', () => {
      // Already RSVPd in default fixture
      expect(state.rsvpdSessionIds).toContain('session-dropin-01');

      const unRsvp = appReducer(state, { type: 'TOGGLE_RSVP', sessionId: 'session-dropin-01' });
      expect(unRsvp.rsvpdSessionIds).not.toContain('session-dropin-01');

      const reRsvp = appReducer(unRsvp, { type: 'TOGGLE_RSVP', sessionId: 'session-dropin-01' });
      expect(reRsvp.rsvpdSessionIds).toContain('session-dropin-01');
    });

    it('rejects RSVP for cancelled sessions with a domain error', () => {
      state.sessions['session-dropin-01'].status = 'cancelled';

      const next = appReducer(state, { type: 'TOGGLE_RSVP', sessionId: 'session-dropin-01' });
      expect(next.lastError).toBeDefined();
      expect(next.lastError?.code).toBe('SESSION_CANCELLED');
    });
  });

  describe('4. Lobby vs Live Attendance vs Replay Distinction', () => {
    it('entering lobby NEVER creates a live_attendance record', () => {
      // Set session to open (not yet running)
      state.sessions['session-dropin-01'].status = 'open';

      const next = appReducer(state, { type: 'ENTER_LOBBY', sessionId: 'session-dropin-01' });
      expect(next.inLobbySessionIds).toContain('session-dropin-01');

      // Absolute Invariant: 0 live_attendance participations
      const liveRecords = Object.values(next.participations).filter((p) => p.kind === 'live_attendance');
      expect(liveRecords).toHaveLength(0);
    });

    it('joining running session grants live_attendance exactly once (idempotent)', () => {
      expect(state.sessions['session-dropin-01'].status).toBe('running');

      const step1 = appReducer(state, { type: 'JOIN_LIVE_SESSION', sessionId: 'session-dropin-01' });
      const liveRecords1 = Object.values(step1.participations).filter(
        (p) => p.sessionId === 'session-dropin-01' && p.kind === 'live_attendance'
      );
      expect(liveRecords1).toHaveLength(1);
      expect(step1.capsules['capsule_fan-linh_session-dropin-01']).toBeDefined();

      // Second join attempt must NOT duplicate the record
      const step2 = appReducer(step1, { type: 'JOIN_LIVE_SESSION', sessionId: 'session-dropin-01' });
      const liveRecords2 = Object.values(step2.participations).filter(
        (p) => p.sessionId === 'session-dropin-01' && p.kind === 'live_attendance'
      );
      expect(liveRecords2).toHaveLength(1);
    });

    it('cancelled session cannot be joined', () => {
      state.sessions['session-dropin-01'].status = 'cancelled';

      const next = appReducer(state, { type: 'JOIN_LIVE_SESSION', sessionId: 'session-dropin-01' });
      expect(next.lastError?.code).toBe('SESSION_CANCELLED');
      expect(Object.keys(next.participations)).toHaveLength(0);
    });

    it('watching replay creates replay_view and NEVER live_attendance', () => {
      // Set session to ended and replay available
      state.sessions['session-dropin-01'].status = 'ended';
      state.sessions['session-dropin-01'].replayStatus = 'available';

      const next = appReducer(state, { type: 'WATCH_REPLAY', sessionId: 'session-dropin-01' });
      expect(next.lastError).toBeUndefined();

      const replayRecords = Object.values(next.participations).filter(
        (p) => p.sessionId === 'session-dropin-01' && p.kind === 'replay_view'
      );
      expect(replayRecords).toHaveLength(1);

      // Invariant: Replay viewers NEVER receive live attendance
      const liveRecords = Object.values(next.participations).filter(
        (p) => p.sessionId === 'session-dropin-01' && p.kind === 'live_attendance'
      );
      expect(liveRecords).toHaveLength(0);
    });

    it('watching replay is rejected if replay is expired, withdrawn, or pending_review', () => {
      state.sessions['session-dropin-01'].status = 'ended';
      state.sessions['session-dropin-01'].replayStatus = 'pending_review';

      const resPending = appReducer(state, { type: 'WATCH_REPLAY', sessionId: 'session-dropin-01' });
      expect(resPending.lastError?.code).toBe('REPLAY_UNAVAILABLE');

      state.sessions['session-dropin-01'].replayStatus = 'expired';
      const resExpired = appReducer(state, { type: 'WATCH_REPLAY', sessionId: 'session-dropin-01' });
      expect(resExpired.lastError?.code).toBe('REPLAY_UNAVAILABLE');
    });
  });

  describe('5. Truthful Presence and Disconnection', () => {
    it('disconnecting artist immediately marks presence as disconnected without AI substitution', () => {
      expect(state.sessions['session-dropin-01'].artistPresence).toBe('present');

      const next = appReducer(state, { type: 'DISCONNECT_ARTIST', sessionId: 'session-dropin-01' });
      expect(next.sessions['session-dropin-01'].artistPresence).toBe('disconnected');
    });

    it('starting a session requires an approved avatar with matching format context', () => {
      // Try starting with draft avatar
      const failDraft = appReducer(state, {
        type: 'START_SESSION',
        sessionId: 'session-dropin-01',
        avatarAssetId: 'avatar-a-v2', // draft
      });
      expect(failDraft.lastError?.code).toBe('AVATAR_NOT_APPROVED');

      // Start with approved avatar
      const success = appReducer(state, {
        type: 'START_SESSION',
        sessionId: 'session-dropin-01',
        avatarAssetId: 'avatar-a-v1', // approved
      });
      expect(success.lastError).toBeUndefined();
      expect(success.sessions['session-dropin-01'].artistPresence).toBe('present');
    });
  });

  describe('6. Benefit Eligibility & Claims', () => {
    it('claiming an eligible benefit succeeds and is idempotent', () => {
      expect(state.benefits['benefit-replay-01'].status).toBe('eligible');

      const claim1 = appReducer(state, { type: 'CLAIM_BENEFIT', benefitId: 'benefit-replay-01' });
      expect(claim1.benefits['benefit-replay-01'].status).toBe('claimed');
      expect(claim1.lastError).toBeUndefined();

      // Repeating claim is an idempotent no-op
      const claim2 = appReducer(claim1, { type: 'CLAIM_BENEFIT', benefitId: 'benefit-replay-01' });
      expect(claim2.benefits['benefit-replay-01'].status).toBe('claimed');
      expect(claim2.lastError).toBeUndefined();
    });

    it('cannot claim a pending benefit', () => {
      expect(state.benefits['benefit-early-access-01'].status).toBe('pending');

      const next = appReducer(state, { type: 'CLAIM_BENEFIT', benefitId: 'benefit-early-access-01' });
      expect(next.lastError?.code).toBe('BENEFIT_NOT_ELIGIBLE');
      expect(next.benefits['benefit-early-access-01'].status).toBe('pending');
    });
  });

  describe('7. Orders, Simulated Payments & Support Recovery', () => {
    it('creating an order and simulated payment is idempotent by requestId', () => {
      const orderState = appReducer(state, {
        type: 'CREATE_ORDER',
        productId: 'product-pin-01',
        requestId: 'req-pin-unique-01',
      });

      const orderId = Object.keys(orderState.orders)[0];
      expect(orderState.orders[orderId].status).toBe('pending');

      // Simulate payment
      const paidState = appReducer(orderState, {
        type: 'SIMULATE_PAYMENT',
        orderId,
        requestId: 'req-pin-unique-01',
      });
      expect(paidState.orders[orderId].status).toBe('paid');

      // Paid is NOT automatically fulfilled
      expect(paidState.orders[orderId].status).not.toBe('fulfilled');

      // Double-click payment simulation is idempotent
      const paidAgain = appReducer(paidState, {
        type: 'SIMULATE_PAYMENT',
        orderId,
        requestId: 'req-pin-unique-01',
      });
      expect(paidAgain.orders[orderId].status).toBe('paid');

      // Fulfilment is a separate explicit action
      const fulfilled = appReducer(paidState, { type: 'SIMULATE_FULFILMENT', orderId });
      expect(fulfilled.orders[orderId].status).toBe('fulfilled');
    });

    it('opening support case for same subject reuses existing active case without duplication', () => {
      const step1 = appReducer(state, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'benefit',
        subjectId: 'benefit-early-access-01',
      });
      const cases1 = Object.values(step1.supportCases);
      expect(cases1).toHaveLength(1);

      // Repeat request
      const step2 = appReducer(step1, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'benefit',
        subjectId: 'benefit-early-access-01',
      });
      const cases2 = Object.values(step2.supportCases);
      expect(cases2).toHaveLength(1);
      expect(cases2[0].id).toBe(cases1[0].id);
    });
  });

  describe('8. Questions, Polls & Tenant Isolation', () => {
    it('selecting a question marks it as selected, NEVER answered', () => {
      const next = appReducer(state, { type: 'SELECT_QUESTION', questionId: 'question-01' });
      expect(next.questions['question-01'].status).toBe('selected');
      expect(next.questions['question-01'].status).not.toBe('answered');
    });

    it('poll allows only one vote per fan and reconciles totals', () => {
      const poll = state.polls['poll-01'];
      const initialVotes = poll.options[0].votes;

      const vote1 = appReducer(state, {
        type: 'VOTE_POLL',
        pollId: 'poll-01',
        optionId: 'opt-1',
      });
      expect(vote1.polls['poll-01'].options[0].votes).toBe(initialVotes + 1);
      expect(vote1.polls['poll-01'].userVotedOptionId).toBe('opt-1');

      // Attempting to vote again is blocked
      const vote2 = appReducer(vote1, {
        type: 'VOTE_POLL',
        pollId: 'poll-01',
        optionId: 'opt-2',
      });
      expect(vote2.lastError?.code).toBe('ALREADY_VOTED');
    });

    it('switching tenant isolates all state cleanly without data bleed', () => {
      state.followedWorldIds.push('custom-local-test');
      const mfanState = appReducer(state, { type: 'SWITCH_TENANT', targetTenantId: 'mfan-demo' });

      expect(mfanState.activeTenantId).toBe('mfan-demo');
      expect(mfanState.followedWorldIds).not.toContain('custom-local-test');
    });
  });
});
