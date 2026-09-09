/**
 * VieWorld Pure Domain Action Reducer & Guard Invariants (§5.3 & docs/CONTRACTS.md)
 */

import { AppAction, AppState, Order, Participation, Question, SupportCase } from './types';
import { createInitialState } from '../data/fixtures';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    /**
     * Follow Guard:
     * - Toggles relationship status in followedWorldIds.
     * - Invariant: Follow NEVER creates or modifies membership records.
     */
    case 'TOGGLE_FOLLOW': {
      const world = state.worlds[action.worldId];
      if (!world) {
        return {
          ...state,
          lastError: {
            code: 'WORLD_NOT_FOUND',
            message: `Không tìm thấy thế giới với mã ${action.worldId}.`,
          },
        };
      }

      const isFollowed = state.followedWorldIds.includes(action.worldId);
      const newFollowed = isFollowed
        ? state.followedWorldIds.filter((id) => id !== action.worldId)
        : [...state.followedWorldIds, action.worldId];

      return {
        ...state,
        followedWorldIds: newFollowed,
        lastError: undefined,
      };
    }

    /**
     * RSVP Guard:
     * - One RSVP per fan/session.
     * - Invariant: Reversible. Cancelled sessions cannot be joined or RSVP'd.
     */
    case 'TOGGLE_RSVP': {
      const session = state.sessions[action.sessionId];
      if (!session) {
        return {
          ...state,
          lastError: {
            code: 'SESSION_NOT_FOUND',
            message: 'Phiên sự kiện không tồn tại.',
          },
        };
      }

      if (session.status === 'cancelled') {
        return {
          ...state,
          lastError: {
            code: 'SESSION_CANCELLED',
            message: 'Phiên sự kiện đã bị hủy bỏ, không thể đăng ký tham gia.',
            actionableResolution: 'Vui lòng chọn sự kiện khác trong danh sách.',
          },
        };
      }

      const isRsvpd = state.rsvpdSessionIds.includes(action.sessionId);
      const newRsvp = isRsvpd
        ? state.rsvpdSessionIds.filter((id) => id !== action.sessionId)
        : [...state.rsvpdSessionIds, action.sessionId];

      return {
        ...state,
        rsvpdSessionIds: newRsvp,
        lastError: undefined,
      };
    }

    /**
     * Lobby Admission Guard:
     * - Admits fan to lobby view when session is 'open' or 'running'.
     * - Invariant: Lobby entry NEVER creates a live_attendance record!
     */
    case 'ENTER_LOBBY': {
      const session = state.sessions[action.sessionId];
      if (!session) {
        return {
          ...state,
          lastError: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên sự kiện.' },
        };
      }

      if (session.status === 'cancelled' || session.status === 'ended') {
        return {
          ...state,
          lastError: {
            code: 'SESSION_NOT_OPEN',
            message: 'Phòng chờ không mở cho phiên sự kiện đã kết thúc hoặc đã hủy.',
          },
        };
      }

      const inLobby = state.inLobbySessionIds.includes(action.sessionId);
      return {
        ...state,
        inLobbySessionIds: inLobby ? state.inLobbySessionIds : [...state.inLobbySessionIds, action.sessionId],
        lastError: undefined,
      };
    }

    case 'LEAVE_LOBBY': {
      return {
        ...state,
        inLobbySessionIds: state.inLobbySessionIds.filter((id) => id !== action.sessionId),
      };
    }

    /**
     * Live Attendance Guard:
     * - Fan can only earn live attendance while session is actively 'running'.
     * - Invariant: Exactly one live_attendance record per fan/session.
     * - Automatically creates a preliminary Moment Capsule record.
     */
    case 'JOIN_LIVE_SESSION': {
      const session = state.sessions[action.sessionId];
      if (!session) {
        return {
          ...state,
          lastError: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên sự kiện.' },
        };
      }

      if (session.status === 'cancelled') {
        return {
          ...state,
          lastError: {
            code: 'SESSION_CANCELLED',
            message: 'Phiên sự kiện đã bị hủy, không thể tham dự.',
          },
        };
      }

      if (session.status !== 'running') {
        return {
          ...state,
          lastError: {
            code: 'SESSION_NOT_RUNNING',
            message: 'Sự kiện chưa bắt đầu hoặc đã kết thúc. Không thể ghi nhận tham dự trực tiếp.',
            actionableResolution: session.status === 'open' ? 'Bạn đang ở phòng chờ. Vui lòng đợi host bắt đầu.' : undefined,
          },
        };
      }

      const fanId = state.fanProfile.id;
      const participationKey = `part_${fanId}_${session.id}_live`;

      // Idempotency: if already attended, do not duplicate record
      if (state.participations[participationKey]) {
        return state;
      }

      const participation: Participation = {
        id: participationKey,
        tenantId: state.activeTenantId,
        version: 1,
        updatedAt: state.demoTime,
        fanId,
        sessionId: session.id,
        kind: 'live_attendance',
        joinedAt: state.demoTime,
      };

      const capsuleKey = `capsule_${fanId}_${session.id}`;
      const capsule = state.capsules[capsuleKey] || {
        id: capsuleKey,
        tenantId: state.activeTenantId,
        version: 1,
        updatedAt: state.demoTime,
        fanId,
        sessionId: session.id,
        worldId: session.worldId,
        participationId: participationKey,
        isSaved: true,
      };

      return {
        ...state,
        participations: {
          ...state.participations,
          [participationKey]: participation,
        },
        capsules: {
          ...state.capsules,
          [capsuleKey]: capsule,
        },
        inLobbySessionIds: state.inLobbySessionIds.includes(session.id)
          ? state.inLobbySessionIds
          : [...state.inLobbySessionIds, session.id],
        lastError: undefined,
      };
    }

    /**
     * Watch Replay Guard:
     * - Requires session ended and replayStatus === 'available'.
     * - Invariant: Generates replay_view participation; NEVER live_attendance.
     * - Blocked if replayStatus is expired, withdrawn, or pending_review.
     */
    case 'WATCH_REPLAY': {
      const session = state.sessions[action.sessionId];
      if (!session) {
        return {
          ...state,
          lastError: { code: 'SESSION_NOT_FOUND', message: 'Không tìm thấy phiên sự kiện.' },
        };
      }

      if (session.status !== 'ended') {
        return {
          ...state,
          lastError: {
            code: 'SESSION_NOT_ENDED',
            message: 'Chỉ có thể xem lại bản ghi sau khi phiên sự kiện đã kết thúc.',
          },
        };
      }

      if (session.replayStatus !== 'available') {
        let message = 'Bản ghi không khả dụng để xem lại.';
        if (session.replayStatus === 'pending_review') {
          message = 'Bản ghi đang trong quá trình kiểm duyệt bản quyền và nội dung.';
        } else if (session.replayStatus === 'expired') {
          message = 'Thời hạn xem lại bản ghi của sự kiện này đã kết thúc.';
        } else if (session.replayStatus === 'withdrawn') {
          message = 'Bản ghi đã được rút lại theo yêu cầu của ban tổ chức.';
        }
        return {
          ...state,
          lastError: { code: 'REPLAY_UNAVAILABLE', message },
        };
      }

      const fanId = state.fanProfile.id;
      const replayParticipationKey = `part_${fanId}_${session.id}_replay`;

      if (state.participations[replayParticipationKey]) {
        return state;
      }

      const participation: Participation = {
        id: replayParticipationKey,
        tenantId: state.activeTenantId,
        version: 1,
        updatedAt: state.demoTime,
        fanId,
        sessionId: session.id,
        kind: 'replay_view',
        joinedAt: state.demoTime,
      };

      return {
        ...state,
        participations: {
          ...state.participations,
          [replayParticipationKey]: participation,
        },
        lastError: undefined,
      };
    }

    /**
     * Question Guard:
     * - Requires session to be 'running'.
     * - Validates non-empty content (max 200 chars).
     * - Invariant: Starts in 'submitted' state; no fake read receipts.
     */
    case 'SUBMIT_QUESTION': {
      const session = state.sessions[action.sessionId];
      if (!session || session.status !== 'running') {
        return {
          ...state,
          lastError: {
            code: 'QUESTION_SUBMISSION_CLOSED',
            message: 'Hàng đợi câu hỏi chỉ nhận phản hồi khi phiên trực tiếp đang diễn ra.',
          },
        };
      }

      const trimmed = action.content.trim();
      if (!trimmed || trimmed.length > 200) {
        return {
          ...state,
          lastError: {
            code: 'INVALID_QUESTION_LENGTH',
            message: 'Nội dung câu hỏi phải từ 1 đến 200 ký tự.',
          },
        };
      }

      // Idempotency check (§2.3, P05 Acceptance T05):
      // 1. By requestId if provided
      if (action.requestId) {
        const existingByReq = Object.values(state.questions).find(
          (q) => q.requestId === action.requestId
        );
        if (existingByReq) {
          return state;
        }
      }

      // 2. By identical content submitted by the same fan for the same session in submitted/under_review
      const existingDuplicate = Object.values(state.questions).find(
        (q) =>
          q.sessionId === session.id &&
          q.fanId === state.fanProfile.id &&
          q.content === trimmed &&
          (q.status === 'submitted' || q.status === 'under_review')
      );
      if (existingDuplicate) {
        return state;
      }

      const qId = `question_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newQuestion: Question = {
        id: qId,
        tenantId: state.activeTenantId,
        version: 1,
        updatedAt: state.demoTime,
        sessionId: session.id,
        fanId: state.fanProfile.id,
        authorName: state.fanProfile.displayName,
        content: trimmed,
        status: 'submitted',
        requestId: action.requestId,
      };

      return {
        ...state,
        questions: {
          ...state.questions,
          [qId]: newQuestion,
        },
        lastError: undefined,
      };
    }

    /**
     * Select Question Guard (Operator Demo action):
     * - Invariant: Fan sees 'selected', NOT 'answered'.
     */
    case 'SELECT_QUESTION': {
      const q = state.questions[action.questionId];
      if (!q) {
        return {
          ...state,
          lastError: { code: 'QUESTION_NOT_FOUND', message: 'Không tìm thấy câu hỏi.' },
        };
      }

      return {
        ...state,
        questions: {
          ...state.questions,
          [action.questionId]: {
            ...q,
            status: 'selected',
            updatedAt: state.demoTime,
          },
        },
      };
    }

    /**
     * Answer Question Guard:
     * - Invariant: Sets status to 'answered', strictly distinct from 'selected'.
     */
    case 'ANSWER_QUESTION': {
      const q = state.questions[action.questionId];
      if (!q) {
        return {
          ...state,
          lastError: { code: 'QUESTION_NOT_FOUND', message: 'Không tìm thấy câu hỏi.' },
        };
      }

      return {
        ...state,
        questions: {
          ...state.questions,
          [action.questionId]: {
            ...q,
            status: 'answered',
            updatedAt: state.demoTime,
          },
        },
      };
    }

    /**
     * Poll Voting Guard:
     * - Exactly one vote per fan per poll.
     */
    case 'VOTE_POLL': {
      const poll = state.polls[action.pollId];
      if (!poll || poll.status !== 'open') {
        return {
          ...state,
          lastError: { code: 'POLL_CLOSED', message: 'Bình chọn đã đóng.' },
        };
      }

      if (poll.userVotedOptionId) {
        return {
          ...state,
          lastError: { code: 'ALREADY_VOTED', message: 'Bạn đã tham gia bình chọn này.' },
        };
      }

      const updatedOptions = poll.options.map((opt) =>
        opt.id === action.optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );

      return {
        ...state,
        polls: {
          ...state.polls,
          [action.pollId]: {
            ...poll,
            options: updatedOptions,
            userVotedOptionId: action.optionId,
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    /**
     * Session Start Guard:
     * - Invariant: Requires approved avatar asset allowed for the format.
     * - Sets artistPresence to 'present' with DEMO flag.
     */
    case 'START_SESSION': {
      const session = state.sessions[action.sessionId];
      const avatar = state.avatarAssets[action.avatarAssetId];

      if (!session) {
        return { ...state, lastError: { code: 'SESSION_NOT_FOUND', message: 'Phiên không tồn tại.' } };
      }

      if (!avatar || avatar.status !== 'approved') {
        return {
          ...state,
          lastError: {
            code: 'AVATAR_NOT_APPROVED',
            message: 'Chỉ avatar đã được phê duyệt mới được phép sử dụng trong sự kiện.',
          },
        };
      }

      if (!avatar.allowedContexts.includes(session.format)) {
        return {
          ...state,
          lastError: {
            code: 'AVATAR_CONTEXT_DISALLOWED',
            message: `Avatar không được cấp phép cho định dạng sự kiện '${session.format}'.`,
          },
        };
      }

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            status: 'running',
            artistPresence: 'present',
            avatarAssetId: avatar.id,
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    /**
     * Disconnect Artist Guard:
     * - Invariant: Artist presence becomes 'disconnected' or 'reconnecting'.
     * - Never substituted by AI pretending to be the artist!
     */
    case 'DISCONNECT_ARTIST': {
      const session = state.sessions[action.sessionId];
      if (!session) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            artistPresence: 'disconnected',
            updatedAt: state.demoTime,
          },
        },
      };
    }

    case 'RECONNECT_ARTIST': {
      const session = state.sessions[action.sessionId];
      if (!session) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            artistPresence: 'present',
            updatedAt: state.demoTime,
          },
        },
      };
    }

    /**
     * End Session Guard:
     * - Stops artist presence. Sets replayStatus to 'pending_review'.
     */
    case 'END_SESSION': {
      const session = state.sessions[action.sessionId];
      if (!session) return state;
      if (session.status === 'ended') return state; // Idempotent: ending twice creates no duplicate

      const fanId = state.fanProfile.id;
      const livePartKey = `part_${fanId}_${session.id}_live`;
      const hasLiveParticipation = Boolean(state.participations[livePartKey]);

      // If fan attended live, ensure capsule exists
      let updatedCapsules = state.capsules;
      if (hasLiveParticipation) {
        const capsuleKey = `capsule_${fanId}_${session.id}`;
        if (!updatedCapsules[capsuleKey]) {
          updatedCapsules = {
            ...updatedCapsules,
            [capsuleKey]: {
              id: capsuleKey,
              tenantId: state.activeTenantId,
              version: 1,
              updatedAt: state.demoTime,
              fanId,
              sessionId: session.id,
              worldId: session.worldId,
              participationId: livePartKey,
              isSaved: true,
            },
          };
        }
      }

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            status: 'ended',
            artistPresence: 'absent',
            replayStatus: 'pending_review',
            updatedAt: state.demoTime,
          },
        },
        capsules: updatedCapsules,
      };
    }

    /**
     * Publish Replay Guard:
     * - Transitions replayStatus from 'pending_review' to 'available'.
     */
    case 'PUBLISH_REPLAY': {
      const session = state.sessions[action.sessionId];
      if (!session) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            replayStatus: 'available',
            updatedAt: state.demoTime,
          },
        },
      };
    }

    /**
     * Create Order Guard:
     * - Invariant: Verifies inventory and required benefit qualification.
     */
    case 'CREATE_ORDER': {
      const product = state.products[action.productId];
      if (!product || !product.isAvailable || product.stockCount <= 0) {
        return {
          ...state,
          lastError: {
            code: 'PRODUCT_UNAVAILABLE',
            message: 'Sản phẩm hiện không khả dụng hoặc đã hết hàng.',
          },
        };
      }

      if (product.requiredBenefitId) {
        const benefit = state.benefits[product.requiredBenefitId];
        if (!benefit || (benefit.status !== 'eligible' && benefit.status !== 'claimed')) {
          return {
            ...state,
            lastError: {
              code: 'BENEFIT_REQUIRED',
              message: 'Sản phẩm này yêu cầu quyền lợi hội viên hợp lệ để đặt mua.',
              actionableResolution: 'Vui lòng kiểm tra mục Quyền lợi trong My World.',
            },
          };
        }
      }

      // Check existing order by requestId for idempotency
      const existing = Object.values(state.orders).find((o) => o.requestId === action.requestId);
      if (existing) {
        return state;
      }

      const orderId = `order_${Date.now()}_${action.requestId.substring(0, 8)}`;
      const order: Order = {
        id: orderId,
        tenantId: state.activeTenantId,
        version: 1,
        updatedAt: state.demoTime,
        fanId: state.fanProfile.id,
        worldId: product.worldId,
        productId: product.id,
        status: 'pending',
        sourceRef: 'VieSHOP-SIM',
        requestId: action.requestId,
      };

      return {
        ...state,
        orders: {
          ...state.orders,
          [orderId]: order,
        },
        lastError: undefined,
      };
    }

    /**
     * Simulate Payment Guard:
     * - Invariant: Idempotent by requestId.
     * - Paid order is NOT automatically fulfilled.
     */
    case 'SIMULATE_PAYMENT': {
      const order = state.orders[action.orderId];
      if (!order) {
        return {
          ...state,
          lastError: { code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng.' },
        };
      }

      // Idempotency: already paid is a no-op success
      if (order.status === 'paid' || order.status === 'fulfilled') {
        return state;
      }

      if (order.requestId !== action.requestId) {
        return {
          ...state,
          lastError: { code: 'INVALID_REQUEST_ID', message: 'Mã yêu cầu thanh toán không khớp.' },
        };
      }

      return {
        ...state,
        orders: {
          ...state.orders,
          [order.id]: {
            ...order,
            status: 'paid',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    /**
     * Simulate Fulfilment Guard:
     * - Invariant: Only paid orders can be fulfilled.
     */
    case 'SIMULATE_FULFILMENT': {
      const order = state.orders[action.orderId];
      if (!order) {
        return { ...state, lastError: { code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng.' } };
      }

      if (order.status !== 'paid') {
        return {
          ...state,
          lastError: {
            code: 'ORDER_NOT_PAID',
            message: 'Chỉ đơn hàng đã hoàn tất thanh toán mô phỏng mới có thể xác nhận bàn giao.',
          },
        };
      }

      return {
        ...state,
        orders: {
          ...state.orders,
          [order.id]: {
            ...order,
            status: 'fulfilled',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    /**
     * Claim Benefit Guard:
     * - Invariant: Benefit must be in 'eligible' status.
     * - Invariant: 'pending' status cannot be claimed or bypassed!
     * - Idempotent: Claiming an already claimed benefit returns cleanly.
     */
    case 'CLAIM_BENEFIT': {
      const benefit = state.benefits[action.benefitId];
      if (!benefit) {
        return {
          ...state,
          lastError: { code: 'BENEFIT_NOT_FOUND', message: 'Không tìm thấy quyền lợi.' },
        };
      }

      if (benefit.status === 'claimed') {
        return state; // Idempotent
      }

      if (benefit.status !== 'eligible') {
        return {
          ...state,
          lastError: {
            code: 'BENEFIT_NOT_ELIGIBLE',
            message: `Quyền lợi đang ở trạng thái '${benefit.status}', chưa đủ điều kiện để kích hoạt.`,
            actionableResolution: benefit.nextAction,
          },
        };
      }

      return {
        ...state,
        benefits: {
          ...state.benefits,
          [benefit.id]: {
            ...benefit,
            status: 'claimed',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    /**
     * Support Case Guard:
     * - Invariant: Reuses existing open/investigating case for same subject to prevent duplicates.
     */
    case 'OPEN_SUPPORT_CASE': {
      const existing = Object.values(state.supportCases).find(
        (c) => c.subjectId === action.subjectId && c.status !== 'closed' && c.status !== 'resolved'
      );

      if (existing) {
        return state; // Reuses open case
      }

      const caseId = `case_${Date.now()}_${action.subjectId.substring(0, 6)}`;
      const newCase: SupportCase = {
        id: caseId,
        tenantId: state.activeTenantId,
        version: 1,
        updatedAt: state.demoTime,
        fanId: state.fanProfile.id,
        subjectType: action.subjectType,
        subjectId: action.subjectId,
        status: 'open',
        nextAction: 'Đội ngũ hỗ trợ mô phỏng đang tiếp nhận yêu cầu.',
      };

      return {
        ...state,
        supportCases: {
          ...state.supportCases,
          [caseId]: newCase,
        },
        lastError: undefined,
      };
    }

    /**
     * Resolve Support Case Guard:
     * - Invariant: Resolving support updates case outcome; does NOT automatically grant entitlement.
     */
    case 'RESOLVE_SUPPORT_CASE': {
      const sc = state.supportCases[action.caseId];
      if (!sc) return state;

      return {
        ...state,
        supportCases: {
          ...state.supportCases,
          [sc.id]: {
            ...sc,
            status: 'resolved',
            resolution: action.resolution,
            nextAction: 'Hồ sơ đã được xử lý xong.',
            updatedAt: state.demoTime,
          },
        },
      };
    }

    /**
     * Wardrobe Customization:
     * - Persists fan's accessory selection.
     */
    case 'EQUIP_WARDROBE': {
      return {
        ...state,
        fanProfile: {
          ...state.fanProfile,
          wardrobeChoice: {
            accessoryId: action.accessoryId,
            equippedAt: state.demoTime,
          },
        },
      };
    }

    /**
     * Save Capsule Guard:
     * - Attaches optional private note.
     */
    case 'SAVE_CAPSULE': {
      const capsule = state.capsules[action.capsuleId];
      if (!capsule) return state;

      return {
        ...state,
        capsules: {
          ...state.capsules,
          [capsule.id]: {
            ...capsule,
            isSaved: action.isSaved !== undefined ? action.isSaved : true,
            privateNote: action.privateNote !== undefined ? action.privateNote : capsule.privateNote,
            updatedAt: state.demoTime,
          },
        },
      };
    }

    /**
     * Tenant Switch:
     * - Resets active namespace cleanly without cross-tenant data bleed.
     */
    case 'SWITCH_TENANT': {
      return createInitialState(action.targetTenantId);
    }

    /**
     * Load Scenario:
     * - Installs a designated test scenario fixture.
     */
    case 'LOAD_SCENARIO': {
      return action.scenarioState;
    }

    /**
     * Demo Time Shift:
     */
    case 'ADVANCE_DEMO_TIME': {
      return {
        ...state,
        demoTime: action.newIsoTime,
      };
    }

    case 'CLEAR_ERROR': {
      return {
        ...state,
        lastError: undefined,
      };
    }

    default:
      return state;
  }
}
