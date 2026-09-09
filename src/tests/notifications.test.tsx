import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { AppShell } from '../components/AppShell';
import { InboxView } from '../views/InboxView';
import { SessionView } from '../views/SessionView';
import { OrderDetailView } from '../views/OrderDetailView';
import { SupportCaseDetailView } from '../views/SupportCaseDetailView';
import { appReducer } from '../domain/reducer';
import { createInitialState } from '../data/fixtures';
import { AppState } from '../domain/types';

describe('T10 Acceptance: Notifications, Inbox, and Read States', () => {
  let state: AppState;

  beforeEach(() => {
    localStorage.clear();
    state = createInitialState('vieworld-demo');
  });

  describe('1. Domain Invariants & Transition-Triggered Notifications', () => {
    it('generates a session_reminder when fan RSVPs to a session and removes it when RSVP is toggled off', () => {
      // Un-RSVP initial dropin session first if set
      state = appReducer(state, { type: 'TOGGLE_RSVP', sessionId: 'session-dropin-01' });
      expect(state.rsvpdSessionIds).not.includes('session-dropin-01');

      // Now toggle RSVP ON
      const nextState = appReducer(state, { type: 'TOGGLE_RSVP', sessionId: 'session-dropin-01' });
      expect(nextState.rsvpdSessionIds).includes('session-dropin-01');

      const notif = nextState.notifications['notif-rsvp-session-dropin-01'];
      expect(notif).toBeDefined();
      expect(notif.type).toBe('session_reminder');
      expect(notif.targetRoute).toBe('/sessions/session-dropin-01');
      expect(notif.isRead).toBe(false);
      expect(notif.sourceAttribution).toBe('session_system');

      // Toggle RSVP OFF: reminder is removed
      const offState = appReducer(nextState, { type: 'TOGGLE_RSVP', sessionId: 'session-dropin-01' });
      expect(offState.rsvpdSessionIds).not.includes('session-dropin-01');
      expect(offState.notifications['notif-rsvp-session-dropin-01']).toBeUndefined();
    });

    it('generates capsule_ready notification when session ends with live participation', () => {
      // Fan participates live
      state = appReducer(state, { type: 'JOIN_LIVE_SESSION', sessionId: 'session-dropin-01' });

      // Session ends
      const nextState = appReducer(state, { type: 'END_SESSION', sessionId: 'session-dropin-01' });

      const capsuleNotif = nextState.notifications['notif-capsule-session-dropin-01'];
      expect(capsuleNotif).toBeDefined();
      expect(capsuleNotif.type).toBe('capsule_ready');
      expect(capsuleNotif.category).toBe('capsule');
      expect(capsuleNotif.targetRoute).toBe('/me');
      expect(capsuleNotif.isRead).toBe(false);

      // Calling END_SESSION again is idempotent: does not duplicate notification
      const secondEnd = appReducer(nextState, { type: 'END_SESSION', sessionId: 'session-dropin-01' });
      const matching = Object.values(secondEnd.notifications).filter(
        (n) => n.id === 'notif-capsule-session-dropin-01'
      );
      expect(matching.length).toBe(1);
    });

    it('generates order_update notifications on order creation and fulfilment', () => {
      const orderAction = {
        type: 'CREATE_ORDER' as const,
        productId: 'product-pin-01',
        requestId: 'req-test-notif-01',
      };

      const orderedState = appReducer(state, orderAction);
      const orders = Object.values(orderedState.orders);
      expect(orders.length).toBeGreaterThan(0);
      const order = orders[orders.length - 1];

      // Notification created
      const createNotif = orderedState.notifications[`notif-order-${order.id}-created`];
      expect(createNotif).toBeDefined();
      expect(createNotif.type).toBe('order_update');
      expect(createNotif.targetRoute).toBe(`/orders/${order.id}`);
      expect(createNotif.isRead).toBe(false);

      // Pay order then fulfill
      const paidState = appReducer(orderedState, {
        type: 'SIMULATE_PAYMENT',
        orderId: order.id,
        requestId: order.requestId,
      });
      const fulfilledState = appReducer(paidState, {
        type: 'SIMULATE_FULFILMENT',
        orderId: order.id,
      });

      const fulfillNotif = fulfilledState.notifications[`notif-order-${order.id}-fulfilled`];
      expect(fulfillNotif).toBeDefined();
      expect(fulfillNotif.type).toBe('order_update');
      expect(fulfillNotif.targetRoute).toBe(`/orders/${order.id}`);
      expect(fulfillNotif.title).toContain('hoàn tất');
    });

    it('generates support_update notification upon case resolution and benefit reconciliation', () => {
      // Open a case for benefit-early-access-01
      const openState = appReducer(state, {
        type: 'OPEN_SUPPORT_CASE',
        subjectType: 'benefit',
        subjectId: 'benefit-early-access-01',
      });
      const cases = Object.values(openState.supportCases);
      expect(cases.length).toBeGreaterThan(0);
      const sc = cases[0];

      // Resolve support case
      const resolvedState = appReducer(openState, {
        type: 'RESOLVE_SUPPORT_CASE',
        caseId: sc.id,
        resolution: 'Xác minh hồ sơ thành công.',
      });

      const resolveNotif = resolvedState.notifications[`notif-support-${sc.id}-resolved`];
      expect(resolveNotif).toBeDefined();
      expect(resolveNotif.type).toBe('support_update');
      expect(resolveNotif.targetRoute).toBe(`/support/${sc.id}`);
      expect(resolveNotif.body).toContain('Xác minh hồ sơ thành công.');

      // Reconcile benefit
      const reconciledState = appReducer(resolvedState, {
        type: 'RECONCILE_BENEFIT',
        benefitId: 'benefit-early-access-01',
      });

      const reconNotif = reconciledState.notifications['notif-reconcile-benefit-early-access-01'];
      expect(reconNotif).toBeDefined();
      expect(reconNotif.targetRoute).toBe('/benefits/benefit-early-access-01');
    });

    it('respects opted-out category preferences: disabling sessionReminders suppresses RSVP notification', () => {
      // Opt out of session reminders
      const optOutState = appReducer(state, {
        type: 'UPDATE_NOTIFICATION_PREFERENCES',
        preferences: { sessionReminders: false },
      });
      expect(optOutState.notificationPreferences.sessionReminders).toBe(false);

      // Reset RSVP on session-dropin-01 first
      const resetState = appReducer(optOutState, {
        type: 'TOGGLE_RSVP',
        sessionId: 'session-dropin-01',
      });

      // Now toggle RSVP ON with preference disabled
      const nextState = appReducer(resetState, {
        type: 'TOGGLE_RSVP',
        sessionId: 'session-dropin-01',
      });
      expect(nextState.rsvpdSessionIds).includes('session-dropin-01');

      // No new reminder notification should be created
      expect(nextState.notifications['notif-rsvp-session-dropin-01']).toBeUndefined();
    });

    it('marks individual notification as read and marks all as read cleanly', () => {
      // Check initial unread notifications exist
      const unreadInitial = Object.values(state.notifications).filter((n) => !n.isRead);
      expect(unreadInitial.length).toBeGreaterThan(0);
      const firstId = unreadInitial[0].id;

      // Mark single notification read
      const singleReadState = appReducer(state, {
        type: 'MARK_NOTIFICATION_READ',
        notificationId: firstId,
      });
      expect(singleReadState.notifications[firstId].isRead).toBe(true);

      // Mark all read
      const allReadState = appReducer(singleReadState, {
        type: 'MARK_ALL_NOTIFICATIONS_READ',
      });
      const remainingUnread = Object.values(allReadState.notifications).filter((n) => !n.isRead);
      expect(remainingUnread.length).toBe(0);
    });
  });

  describe('2. UI Integration, Attribution Truthfulness & End-to-End Journeys', () => {
    const renderApp = (initialRoute = '/inbox') => {
      return render(
        <MemoryRouter initialEntries={[initialRoute]}>
          <AppProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="inbox" element={<InboxView />} />
                <Route path="sessions/:sessionId" element={<SessionView />} />
                <Route path="orders/:orderId" element={<OrderDetailView />} />
                <Route path="support/:caseId" element={<SupportCaseDetailView />} />
              </Route>
            </Routes>
          </AppProvider>
        </MemoryRouter>
      );
    };

    it('renders InboxView with truthful disclosures, notification list, and category filtering', () => {
      renderApp('/inbox');

      // Heading and disclosures
      expect(screen.getByRole('heading', { level: 1, name: /Hộp thư thông báo/i })).toBeInTheDocument();
      expect(screen.getByText(/CAM KẾT MINH BẠCH & BẢO VỆ QUYỀN RIÊNG TƯ/i)).toBeInTheDocument();
      expect(screen.getByText(/100% thông báo diễn ra in-app/i)).toBeInTheDocument();
      expect(screen.getByText(/Không giả lập tin nhắn riêng tư/i)).toBeInTheDocument();

      // Ensure NO push permission request, email, or SMS prompts are shown
      expect(screen.queryByText(/yêu cầu quyền thông báo đẩy|nhập email|nhập số điện thoại/i)).not.toBeInTheDocument();

      // Check sidebar unread badge is visible
      const unreadBadge = screen.getByTestId('unread-notif-badge');
      expect(unreadBadge).toBeInTheDocument();

      // Notifications list is present
      expect(screen.getByTestId('notifications-list')).toBeInTheDocument();

      // Filter by "Moment Capsule" tab: currently empty, shows empty state
      const capsuleTab = screen.getByRole('tab', { name: /Moment Capsule/i });
      fireEvent.click(capsuleTab);
      expect(screen.getByTestId('empty-notifications-card')).toBeInTheDocument();

      // Filter by "Tất cả" tab: shows notifications
      const allTab = screen.getByRole('tab', { name: /Tất cả/i });
      fireEvent.click(allTab);
      expect(screen.getByTestId('notifications-list')).toBeInTheDocument();
    });

    it('marking single notification as read updates UI indicator and decreases unread count', () => {
      renderApp('/inbox');

      const initialCountTag = screen.getByTestId('inbox-unread-count-tag');
      const initialCountText = initialCountTag.textContent || '';
      const initialCount = parseInt(initialCountText, 10);
      expect(initialCount).toBeGreaterThan(0);

      // Find item "Đã đọc" button specifically
      const markReadBtn = screen.getByTestId('mark-read-btn-notif-rsvp-dropin');
      fireEvent.click(markReadBtn);

      // Unread count decreases by 1
      const updatedCountTag = screen.queryByTestId('inbox-unread-count-tag');
      if (initialCount === 1) {
        expect(updatedCountTag).not.toBeInTheDocument();
      } else {
        expect(updatedCountTag).toHaveTextContent(new RegExp(`${initialCount - 1} chưa đọc`));
      }
    });

    it('clicking "Đánh dấu đã đọc tất cả" clears all unread tags and unread badge', () => {
      renderApp('/inbox');

      const markAllBtn = screen.getByTestId('mark-all-read-btn');
      fireEvent.click(markAllBtn);

      // Unread count tag disappears
      expect(screen.queryByTestId('inbox-unread-count-tag')).not.toBeInTheDocument();
      // AppShell unread badge disappears
      expect(screen.queryByTestId('unread-notif-badge')).not.toBeInTheDocument();

      // "Chưa đọc" tab now shows empty state
      const unreadTab = screen.getByRole('tab', { name: /Chưa đọc \(0\)/i });
      fireEvent.click(unreadTab);
      expect(screen.getByTestId('empty-notifications-card')).toBeInTheDocument();
      expect(screen.getByText(/Tất cả thông báo đều đã được đọc/i)).toBeInTheDocument();
    });

    it('clicking a notification action button marks it as read and navigates to target object', () => {
      renderApp('/inbox');

      // Click "Đi tới đối tượng" for dropin session notification
      const actionBtn = screen.getByTestId('notif-action-btn-notif-rsvp-dropin');
      fireEvent.click(actionBtn);

      // Successfully navigates to /sessions/session-dropin-01
      expect(screen.getByRole('heading', { level: 1, name: /Artist A: Drop-in Trò chuyện/i })).toBeInTheDocument();
    });

    it('toggles notification preferences subpanel and persists settings', () => {
      renderApp('/inbox');

      // Open preferences
      const togglePrefBtn = screen.getByTestId('toggle-preferences-btn');
      fireEvent.click(togglePrefBtn);

      expect(screen.getByTestId('notification-preferences-panel')).toBeInTheDocument();
      expect(screen.getByText(/Tùy chọn nhận thông báo cục bộ/i)).toBeInTheDocument();

      // Verify separated event reminders vs promotional preferences exist
      const sessionPref = screen.getByTestId('pref-session-reminders');
      const promoPref = screen.getByTestId('pref-promotional');
      expect(sessionPref).toBeChecked();
      expect(promoPref).not.toBeChecked();

      // Toggle promotional to ON
      fireEvent.click(promoPref);
      expect(promoPref).toBeChecked();

      // Toggle session reminders to OFF
      fireEvent.click(sessionPref);
      expect(sessionPref).not.toBeChecked();
    });
  });
});
