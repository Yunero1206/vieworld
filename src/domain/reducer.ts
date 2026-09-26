/**
 * VieWorld Pure Domain Action Reducer & Guard Invariants (§5.3 & docs/CONTRACTS.md)
 */

import { AppAction, AppState, AvatarAsset, Membership, Order, Participation, Question, SupportCase } from './types';
import { createInitialState } from '../data/fixtures';
import { ARTIST_NOTES } from '../world/fanWorld';
import { getExploreMomentById } from '../world/exploreRows';
import { hallEntries, isArtistHallRoom } from '../world/artistPresentation';
import { canEnterHall, ownsDigitalProduct } from '../world/merchCatalog';
import { validRoomDesign } from '../world/places';
import { commerceReducer } from '../world/commerce';
import { shippingReducer } from '../world/shipping';
import { historyReducer } from '../world/history';
import { validHomeDestination } from '../world/homeDestination';

export function appReducer(state: AppState, action: AppAction): AppState {
  const featureState=commerceReducer(state,action) ?? historyReducer(state,action) ?? shippingReducer(state,action);
  if(featureState)return featureState;
  switch (action.type) {
    case 'SAVE_ROOM_DESIGN': {
      if(!validRoomDesign(action.design)) return {...state,lastError:{code:'ROOM_DESIGN_INVALID',message:'Bố cục phòng chưa hợp lệ. Chọn tối đa 8 món trong vùng sàn.'}};
      return {...state,lastError:undefined,fanProfile:{...state.fanProfile,roomDesign:{...action.design,layers:{...action.design.layers},items:action.design.items.map(i=>({...i}))}}};
    }
    case 'SEND_HALL_MESSAGE': {
      if (!canEnterHall(state, action.worldId)) return { ...state, lastError: { code: 'HALL_MEMBERSHIP_REQUIRED', message: 'Hall này dành cho hội viên đang hoạt động của đúng nhà nhạc.' } };
      const roomId = action.roomId || `hall-${action.worldId}`;
      if (!isArtistHallRoom(state, action.worldId, roomId)) {
        return { ...state, lastError: { code: 'HALL_ROOM_INVALID', message: 'Không tìm thấy phòng trò chuyện này trong world.' } };
      }
      const messages = state.hallMessages?.[action.worldId] || [];
      const value = action.text.trim();
      if (messages.some(m => m.id === action.requestId)) return state;
      if (action.replyToId && !hallEntries(state,action.worldId,roomId).some(item => item.id === action.replyToId)) return state;
      const momentIds = [...new Set(action.momentIds || [])];
      if (momentIds.length > 3 || momentIds.some(id => !getExploreMomentById(action.worldId,id))) return state;
      if (!value || value.length > 280) return { ...state, lastError: { code: 'HALL_MESSAGE_INVALID', message: 'Lời nhắn cần từ 1 đến 280 ký tự.' } };
      return { ...state, lastError: undefined, hallMessages: { ...state.hallMessages, [action.worldId]: [...messages, { id: action.requestId, sessionId: roomId, fanId: state.fanProfile.id, authorName: state.fanProfile.displayName, text: value, timestamp: state.demoTime, replyToId: action.replyToId, momentIds }].slice(-100) } };
    }
    case 'TOGGLE_HALL_REACTION': {
      if (!canEnterHall(state, action.worldId) || !isArtistHallRoom(state,action.worldId,action.roomId) || !hallEntries(state,action.worldId,action.roomId).some(item => item.id === action.messageId)) return state;
      const reactions = state.hallReactions?.[action.worldId] || {};
      const ids = reactions[action.messageId] || [];
      const fanId = state.fanProfile.id;
      return { ...state, hallReactions: { ...state.hallReactions, [action.worldId]: { ...reactions, [action.messageId]: ids.includes(fanId) ? ids.filter(id => id !== fanId) : [...ids,fanId] } } };
    }
    case 'SEND_ARTIST_LETTER': {
      const text = action.text.trim();
      if (!canEnterHall(state,action.worldId) || !isArtistHallRoom(state,action.worldId,`hall-${action.worldId}`) || !text || text.length > 1000) return state;
      const letters = state.artistLetters || [];
      if (letters.some(letter => letter.id === action.requestId)) return state;
      return { ...state, artistLetters: [...letters,{ id: action.requestId, worldId: action.worldId, fanId: state.fanProfile.id, text, createdAt: state.demoTime }].slice(-100) };
    }
    case 'REPORT_HALL_MESSAGE': {
      if (!canEnterHall(state, action.worldId)) return state;
      return { ...state, hallMessages: { ...state.hallMessages, [action.worldId]: (state.hallMessages?.[action.worldId] || []).map(m => m.id === action.messageId ? { ...m, isReported: true, reportRef: `report-${m.id}` } : m) } };
    }
    case 'TOGGLE_SAVED_PRODUCT': {
      if (!state.products[action.productId]) return state;
      const ids = state.fanProfile.savedProductIds || [];
      return { ...state, fanProfile: { ...state.fanProfile, savedProductIds: ids.includes(action.productId) ? ids.filter(id => id !== action.productId) : [...ids, action.productId] } };
    }
    case 'EQUIP_DIGITAL_PRODUCT': {
      const product = state.products[action.productId];
      if (!product?.digitalSlot || !ownsDigitalProduct(state, product)) return { ...state, lastError: { code: 'DIGITAL_NOT_OWNED', message: 'Chỉ mặc vật phẩm digital đã được bàn giao cho bạn. Thử trước không tạo quyền sở hữu.' } };
      return { ...state, lastError: undefined, fanProfile: { ...state.fanProfile, digitalLook: { ...state.fanProfile.digitalLook, [product.digitalSlot]: product.digitalItemId } } };
    }
    case 'REMOVE_DIGITAL_SLOT': {
      return { ...state, fanProfile: { ...state.fanProfile, digitalLook: { ...state.fanProfile.digitalLook, [action.slot]: undefined } } };
    }
    case 'REMEMBER_FAN_DESTINATION': {
      if (!validHomeDestination(state, action.to)) return state;
      const progress = state.fanProfile.worldJourney || { visitedWorldIds: [], readNoteIds: [] };
      if (progress.lastDestination === action.to) return state;
      return { ...state, fanProfile: { ...state.fanProfile, worldJourney: { ...progress, lastDestination: action.to } } };
    }
    case 'VISIT_FAN_WORLD': {
      if (!state.worlds[action.worldId]) return state;
      const progress = state.fanProfile.worldJourney || { visitedWorldIds: [], readNoteIds: [] };
      if (progress.lastWorldId === action.worldId && progress.visitedWorldIds.includes(action.worldId)) return state;
      return { ...state, fanProfile: { ...state.fanProfile, worldJourney: { ...progress,
        lastWorldId: action.worldId, visitedWorldIds: [...new Set([...progress.visitedWorldIds, action.worldId])] } } };
    }
    case 'READ_ARTIST_NOTE': {
      const note = ARTIST_NOTES.find(n => n.id === action.noteId);
      if (!note || !state.worlds[note.worldId]) return state;
      const progress = state.fanProfile.worldJourney || { visitedWorldIds: [], readNoteIds: [] };
      if (progress.readNoteIds.includes(note.id)) return state;
      return { ...state, fanProfile: { ...state.fanProfile, worldJourney: { ...progress,
        readNoteIds: [...progress.readNoteIds, note.id] } } };
    }
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

      const updatedNotifs = { ...state.notifications };
      const rsvpNotifId = `notif-rsvp-${action.sessionId}`;

      if (!isRsvpd) {
        if (state.notificationPreferences?.sessionReminders !== false) {
          updatedNotifs[rsvpNotifId] = {
            id: rsvpNotifId,
            tenantId: state.activeTenantId,
            version: 1,
            fanId: state.fanProfile.id,
            type: 'session_reminder',
            category: 'session',
            sourceAttribution: 'session_system',
            title: `Nhắc nhở: Bạn đã giữ chỗ cho "${session.title}"`,
            body: `Phiên tương tác ảo do Ban tổ chức quản lý sẽ diễn ra theo lịch trình. Sảnh chờ sẽ mở trước giờ diễn.`,
            isRead: false,
            targetRoute: `/sessions/${session.id}`,
            createdAt: state.demoTime,
            updatedAt: state.demoTime,
          };
        }
      } else {
        delete updatedNotifs[rsvpNotifId];
      }

      return {
        ...state,
        rsvpdSessionIds: newRsvp,
        notifications: updatedNotifs,
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
      const questionId = (action as any).questionId || (action as any).payload?.questionId;
      const q = state.questions[questionId];
      if (!q) {
        return {
          ...state,
          lastError: { code: 'QUESTION_NOT_FOUND', message: 'Không tìm thấy câu hỏi.' },
        };
      }

      const updatedQuestions = { ...state.questions };
      Object.values(updatedQuestions).forEach((item) => {
        if (item.sessionId === q.sessionId && item.status === 'selected' && item.id !== q.id) {
          updatedQuestions[item.id] = { ...item, status: 'submitted' };
        }
      });
      updatedQuestions[questionId] = {
        ...q,
        status: 'selected',
        updatedAt: state.demoTime,
      };

      return {
        ...state,
        questions: updatedQuestions,
      };
    }

    /**
     * Answer Question Guard:
     * - Invariant: Sets status to 'answered', strictly distinct from 'selected'.
     */
    case 'ANSWER_QUESTION': {
      const questionId = (action as any).questionId || (action as any).payload?.questionId;
      const q = state.questions[questionId];
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
          [questionId]: {
            ...q,
            status: 'answered',
            updatedAt: state.demoTime,
          },
        },
      };
    }

    case 'CLOSE_QUESTION': {
      const questionId = (action as any).questionId || (action as any).payload?.questionId;
      const q = state.questions[questionId];
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
          [questionId]: {
            ...q,
            status: 'closed',
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
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
      const avatarAssetId = (action as any).avatarAssetId || (action as any).payload?.avatarAssetId || session?.avatarAssetId;
      const avatar = state.avatarAssets[avatarAssetId];

      if (!session) {
        return { ...state, lastError: { code: 'SESSION_NOT_FOUND', message: 'Phiên không tồn tại.' } };
      }

      if (!avatar) {
        return {
          ...state,
          lastError: {
            code: 'AVATAR_NOT_FOUND',
            message: 'Không tìm thấy tài sản avatar.',
          },
        };
      }

      if (avatar.status === 'retired') {
        return {
          ...state,
          lastError: {
            code: 'AVATAR_RETIRED',
            message: 'Avatar này đã ngưng sử dụng (retired), không thể bắt đầu phiên sự kiện mới.',
          },
        };
      }

      if (avatar.status !== 'approved') {
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

      if (session.rightsApproved === false) {
        return {
          ...state,
          lastError: {
            code: 'RIGHTS_NOT_APPROVED',
            message: 'Cần hoàn tất danh mục kiểm tra bản quyền và sự đồng thuận của nghệ sĩ trước khi bắt đầu phiên sự kiện.',
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

    case 'OPEN_LOBBY': {
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
      if (!session) {
        return { ...state, lastError: { code: 'SESSION_NOT_FOUND', message: 'Phiên không tồn tại.' } };
      }
      if (session.status !== 'scheduled') {
        return {
          ...state,
          lastError: { code: 'INVALID_SESSION_STATE', message: 'Chỉ phiên đang lên lịch mới có thể mở phòng chờ.' },
        };
      }

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            status: 'open',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    case 'PAUSE_SESSION': {
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            status: 'paused',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    case 'RESUME_SESSION': {
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            status: 'running',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    case 'CANCEL_SESSION': {
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            status: 'cancelled',
            artistPresence: 'absent',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    case 'UPDATE_SEGMENT_MODE': {
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const segmentMode = (action as any).segmentMode || (action as any).payload?.segmentMode;
      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            segmentMode: segmentMode || (session.segmentMode === 'live' ? 'recorded' : 'live'),
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    case 'TOGGLE_CHAT_PAUSED': {
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
      if (!session) return state;

      const isPaused = (action as any).isPaused !== undefined
        ? (action as any).isPaused
        : (action as any).payload?.isPaused !== undefined
        ? (action as any).payload?.isPaused
        : !session.isChatPaused;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            isChatPaused: isPaused,
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    case 'APPROVE_SESSION_RIGHTS': {
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
      if (!session) return state;

      const checklist = (action as any).checklist || (action as any).payload?.checklist || {
        musicClearance: true,
        artistConsent: true,
        safetyReview: true,
      };

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            rightsApproved: true,
            rightsChecklist: checklist,
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
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
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
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
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
      let updatedNotifs = { ...state.notifications };

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

        if (state.notificationPreferences?.capsuleReady !== false) {
          const capsuleNotifId = `notif-capsule-${session.id}`;
          if (!updatedNotifs[capsuleNotifId]) {
            updatedNotifs[capsuleNotifId] = {
              id: capsuleNotifId,
              tenantId: state.activeTenantId,
              version: 1,
              fanId,
              type: 'capsule_ready',
              category: 'capsule',
              sourceAttribution: 'platform',
              title: 'Kỷ vật Moment Capsule đã sẵn sàng!',
              body: `Moment Capsule ghi nhận sự tham gia của bạn tại "${session.title}" đã được lưu trữ trong My World.`,
              isRead: false,
              targetRoute: '/me',
              createdAt: state.demoTime,
              updatedAt: state.demoTime,
            };
          }
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
        notifications: updatedNotifs,
      };
    }

    /**
     * Publish Replay Guard:
     * - Transitions replayStatus from 'pending_review' to 'available'.
     */
    case 'PUBLISH_REPLAY': {
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
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

    case 'WITHDRAW_REPLAY': {
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            replayStatus: 'withdrawn',
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
      if(Object.values(state.orders).some(o=>o.requestId===action.requestId && o.fanId===state.fanProfile.id))return state;
      const product = state.products[action.productId];
      if (product?.previewOnly) return { ...state, lastError: { code: 'PREVIEW_ONLY', message: 'Mẫu này chưa mở bán. Xem luồng hội viên hoặc lịch sự kiện riêng.' } };
      if (product?.sizes && !product.sizes.includes(action.optionLabel || '')) return { ...state, lastError: { code: 'SIZE_REQUIRED', message: 'Chọn đúng kích cỡ trước khi tạo đơn.' } };
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

      const orderId = `order_${Date.now()}_${encodeURIComponent(action.requestId)}`;
      const order: Order = {
        id: orderId,
        tenantId: state.activeTenantId,
        version: 1,
        updatedAt: state.demoTime,
        fanId: state.fanProfile.id,
        worldId: product.worldId,
        productId: product.id,
        status: 'pending',
        createdAt: state.demoTime,
        sourceRef: 'VieSHOP-SIM',
        requestId: action.requestId,
        optionLabel: action.optionLabel,
        unitPriceVND: product.priceVND,
        productTitle: product.title,
        quantity: 1,
      };

      const updatedNotifs = { ...state.notifications };
      if (state.notificationPreferences?.orderUpdates !== false) {
        const orderNotifId = `notif-order-${orderId}-created`;
        updatedNotifs[orderNotifId] = {
          id: orderNotifId,
          tenantId: state.activeTenantId,
          version: 1,
          fanId: state.fanProfile.id,
          type: 'order_update',
          category: 'order',
          sourceAttribution: 'platform',
          title: `Đơn hàng mới #${orderId}`,
          body: `Đơn hàng mô phỏng "${product.title}" đã được khởi tạo thành công tại VieSHOP.`,
          isRead: false,
          targetRoute: `/orders/${orderId}`,
          createdAt: state.demoTime,
          updatedAt: state.demoTime,
        };
      }

      return {
        ...state,
        orders: {
          ...state.orders,
          [orderId]: order,
        },
        notifications: updatedNotifs,
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
      if(order && (order.fanId!==state.fanProfile.id || order.tenantId!==state.activeTenantId))return {...state,lastError:{code:'ORDER_NOT_FOUND',message:'Không tìm thấy đơn hàng của bạn.'}};
      if(order?.checkoutId){
        if(order.fanId!==state.fanProfile.id || order.tenantId!==state.activeTenantId || order.requestId!==action.requestId)return {...state,lastError:{code:'INVALID_REQUEST_ID',message:'Yêu cầu thanh toán không khớp với đơn của bạn.'}};
        return commerceReducer(state,{type:'PAY_CHECKOUT',checkoutId:order.checkoutId})!;
      }
      if (!order) {
        return {
          ...state,
          lastError: { code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng.' },
        };
      }

      if (order.status === 'cancelled' || order.status === 'refunded') {
        return { ...state, lastError: { code: 'ORDER_CLOSED', message: 'Đơn đã hủy hoặc hoàn tiền không thể thanh toán lại. Vui lòng tạo đơn mới.' } };
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
            paidAt: state.demoTime,
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
      if(order && (order.fanId!==state.fanProfile.id || order.tenantId!==state.activeTenantId))return {...state,lastError:{code:'ORDER_NOT_FOUND',message:'Không tìm thấy đơn hàng của bạn.'}};
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

      const updatedNotifs = { ...state.notifications };
      if (state.notificationPreferences?.orderUpdates !== false) {
        const fulfillNotifId = `notif-order-${order.id}-fulfilled`;
        updatedNotifs[fulfillNotifId] = {
          id: fulfillNotifId,
          tenantId: state.activeTenantId,
          version: 1,
          fanId: order.fanId,
          type: 'order_update',
          category: 'order',
          sourceAttribution: 'platform',
          title: `Đơn hàng #${order.id} đã hoàn tất bàn giao`,
          body: `Vật phẩm mô phỏng đã được thêm vào Bộ sưu tập My World của bạn.`,
          isRead: false,
          targetRoute: `/orders/${order.id}`,
          createdAt: state.demoTime,
          updatedAt: state.demoTime,
        };
      }

      return {
        ...state,
        orders: {
          ...state.orders,
          [order.id]: {
            ...order,
            status: 'fulfilled',
            fulfilledAt: state.demoTime,
            updatedAt: state.demoTime,
          },
        },
        notifications: updatedNotifs,
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
        return state; // Idempotent: already claimed, no-op
      }

      if (benefit.status !== 'eligible') {
        let actionableResolution = benefit.nextAction;
        if (benefit.status === 'pending') {
          actionableResolution = 'Quyền lợi đang chờ đối soát từ ban tổ chức, vui lòng thử lại sau.';
        } else if (benefit.status === 'expired') {
          actionableResolution = 'Quyền lợi đã hết hạn sử dụng. Vui lòng gia hạn hội viên hoặc tham gia các chương trình mới.';
        } else if (benefit.status === 'revoked') {
          actionableResolution = 'Quyền lợi đã bị thu hồi do không đáp ứng điều kiện chương trình.';
        }

        return {
          ...state,
          lastError: {
            code: 'BENEFIT_NOT_ELIGIBLE',
            message: `Quyền lợi đang ở trạng thái '${benefit.status}', chưa đủ điều kiện để kích hoạt.`,
            actionableResolution,
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
            nextAction: 'Quyền lợi đã được kích hoạt thành công. Bạn có thể sử dụng ngay trong các phiên sự kiện hoặc kho tư liệu.',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    /**
     * Upgrade / Renew Membership Guard:
     * - Invariant: Upgrades/renews membership for the fan in the given world.
     * - Invariant: Simulated only — does not request payment or financial details.
     * - Invariant: Idempotent if already active.
     * - Invariant: Active membership does NOT automatically make every benefit eligible (e.g. early access remains pending).
     * - Invariant: Renewing an expired membership does not silently reset or mutate existing benefit state.
     */
    case 'UPGRADE_MEMBERSHIP': {
      const world = state.worlds[action.worldId];
      if (!world) {
        return {
          ...state,
          lastError: {
            code: 'WORLD_NOT_FOUND',
            message: `Không tìm thấy thế giới với mã định danh ${action.worldId}.`,
          },
        };
      }

      const fanId = state.fanProfile.id;
      const existingMembership = Object.values(state.memberships).find(
        (m) => m.worldId === action.worldId && m.fanId === fanId
      );

      // If already active, idempotent no-op
      if (existingMembership && existingMembership.status === 'active') {
        return state;
      }

      // Calculate 1-year expiry in demo time
      let expiresAt = '2027-09-09T13:00:00.000Z';
      try {
        const d = new Date(state.demoTime);
        d.setUTCFullYear(d.getUTCFullYear() + 1);
        expiresAt = d.toISOString();
      } catch {
        // fallback
      }

      const membershipId =
        existingMembership?.id ||
        (action.worldId === 'artist-a' ? 'member-a-01' : `member-${action.worldId}-${fanId}`);

      const newMembership: Membership = {
        startedAt: state.demoTime,
        id: membershipId,
        tenantId: state.activeTenantId,
        version: (existingMembership?.version || 0) + 1,
        updatedAt: state.demoTime,
        fanId,
        worldId: action.worldId,
        status: 'active',
        expiresAt,
      };

      // Check if benefits exist for this world.
      // If brand new fan with no benefits for this world, seed canonical benefits for artist-a:
      let updatedBenefits = state.benefits;
      const existingWorldBenefits = Object.values(state.benefits).filter((b) => b.worldId === action.worldId);

      if (existingWorldBenefits.length === 0 && action.worldId === 'artist-a') {
        updatedBenefits = {
          ...state.benefits,
          'benefit-replay-01': {
            id: 'benefit-replay-01',
            tenantId: state.activeTenantId,
            version: 1,
            updatedAt: state.demoTime,
            fanId,
            worldId: 'artist-a',
            title: 'Quyền xem lại kho lưu trữ Replay',
            status: 'eligible',
            reasonCode: 'ACTIVE_MEMBERSHIP_VERIFIED',
            sourceRef: membershipId,
            nextAction: 'Nhấn để kích hoạt quyền xem lại các phiên Drop-in đã kết thúc.',
          },
          'benefit-early-access-01': {
            id: 'benefit-early-access-01',
            tenantId: state.activeTenantId,
            version: 1,
            updatedAt: state.demoTime,
            fanId,
            worldId: 'artist-a',
            title: 'Xác thực quyền mua sớm vé Live House',
            status: 'pending',
            reasonCode: 'PENDING_ORGANIZER_DISPATCH',
            sourceRef: membershipId,
            nextAction: 'Hệ thống đang đối soát dữ liệu phân bổ đợt mở bán.',
          },
        };
      }

      return {
        ...state,
        memberships: {
          ...state.memberships,
          [membershipId]: newMembership,
        },
        benefits: updatedBenefits,
        lastError: undefined,
      };
    }

    /**
     * Support Case Guard:
     * - Invariant: Reuses existing active (open/acknowledged/investigating) case for same subject to prevent duplicates.
     * - Invariant: Validates subject existence; returns SUBJECT_NOT_FOUND if subject does not exist.
     */
    case 'OPEN_SUPPORT_CASE': {
      if (action.subjectType === 'benefit' && !state.benefits[action.subjectId]) {
        return {
          ...state,
          lastError: {
            code: 'SUBJECT_NOT_FOUND',
            message: `Không tìm thấy quyền lợi với mã định danh ${action.subjectId}.`,
            actionableResolution: 'Vui lòng kiểm tra lại danh sách quyền lợi trong My World.',
          },
        };
      }

      if (action.subjectType === 'order' && !state.orders[action.subjectId]) {
        return {
          ...state,
          lastError: {
            code: 'SUBJECT_NOT_FOUND',
            message: `Không tìm thấy đơn hàng với mã định danh ${action.subjectId}.`,
            actionableResolution: 'Vui lòng kiểm tra lại lịch sử đơn hàng trong My World.',
          },
        };
      }

      const existing = Object.values(state.supportCases).find(
        (c) => c.subjectId === action.subjectId && c.status !== 'closed' && c.status !== 'resolved'
      );

      if (existing) {
        return {
          ...state,
          lastError: undefined,
        }; // Reuses open active case idempotently
      }

      const caseId = `case_${Date.now()}_${action.subjectId.substring(0, 8)}`;
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

    case 'ACKNOWLEDGE_SUPPORT_CASE': {
      const sc = state.supportCases[action.caseId];
      if (!sc) {
        return {
          ...state,
          lastError: { code: 'CASE_NOT_FOUND', message: 'Không tìm thấy hồ sơ hỗ trợ.' },
        };
      }

      return {
        ...state,
        supportCases: {
          ...state.supportCases,
          [sc.id]: {
            ...sc,
            status: 'acknowledged',
            nextAction: 'Đội ngũ hỗ trợ đã tiếp nhận và đang xếp hàng xử lý.',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    case 'INVESTIGATE_SUPPORT_CASE': {
      const sc = state.supportCases[action.caseId];
      if (!sc) {
        return {
          ...state,
          lastError: { code: 'CASE_NOT_FOUND', message: 'Không tìm thấy hồ sơ hỗ trợ.' },
        };
      }

      return {
        ...state,
        supportCases: {
          ...state.supportCases,
          [sc.id]: {
            ...sc,
            status: 'investigating',
            nextAction: 'Đang tiến hành đối soát dữ liệu với ban tổ chức và hệ thống phân bổ.',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    /**
     * Resolve Support Case Guard:
     * - Invariant: Resolving support updates case outcome; does NOT automatically grant entitlement.
     * - Constitutional rule (§2.3): Resolution and reconciliation are strictly decoupled.
     */
    case 'RESOLVE_SUPPORT_CASE': {
      const sc = state.supportCases[action.caseId];
      if (!sc) {
        return {
          ...state,
          lastError: { code: 'CASE_NOT_FOUND', message: 'Không tìm thấy hồ sơ hỗ trợ.' },
        };
      }

      const updatedNotifs = { ...state.notifications };
      if (state.notificationPreferences?.supportUpdates !== false) {
        const supportNotifId = `notif-support-${sc.id}-resolved`;
        updatedNotifs[supportNotifId] = {
          id: supportNotifId,
          tenantId: state.activeTenantId,
          version: 1,
          fanId: sc.fanId,
          type: 'support_update',
          category: 'support',
          sourceAttribution: 'platform',
          title: `Cập nhật hồ sơ đối soát #${sc.id}`,
          body: `Bộ phận hỗ trợ đã có kết luận: "${action.resolution}"`,
          isRead: false,
          targetRoute: `/support/${sc.id}`,
          createdAt: state.demoTime,
          updatedAt: state.demoTime,
        };
      }

      return {
        ...state,
        supportCases: {
          ...state.supportCases,
          [sc.id]: {
            ...sc,
            status: 'resolved',
            resolution: action.resolution,
            nextAction: 'Hồ sơ đã được xử lý xong với kết luận cụ thể.',
            updatedAt: state.demoTime,
          },
        },
        notifications: updatedNotifs,
        lastError: undefined,
      };
    }

    case 'CLOSE_SUPPORT_CASE': {
      const sc = state.supportCases[action.caseId];
      if (!sc) return state;

      return {
        ...state,
        supportCases: {
          ...state.supportCases,
          [sc.id]: {
            ...sc,
            status: 'closed',
            nextAction: 'Hồ sơ đã được đóng lại.',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    /**
     * Reconcile Benefit Action:
     * - Explicit operator/system reconciliation action that mutates benefit state to eligible.
     * - Separated from case resolution.
     */
    case 'RECONCILE_BENEFIT': {
      const benefit = state.benefits[action.benefitId];
      if (!benefit) {
        return {
          ...state,
          lastError: { code: 'BENEFIT_NOT_FOUND', message: 'Không tìm thấy quyền lợi cần đối soát.' },
        };
      }

      const updatedNotifs = { ...state.notifications };
      if (state.notificationPreferences?.supportUpdates !== false) {
        const reconcileNotifId = `notif-reconcile-${benefit.id}`;
        updatedNotifs[reconcileNotifId] = {
          id: reconcileNotifId,
          tenantId: state.activeTenantId,
          version: 1,
          fanId: benefit.fanId,
          type: 'support_update',
          category: 'support',
          sourceAttribution: 'organizer',
          title: `Quyền lợi "${benefit.title}" đã được xác minh`,
          body: `Dữ liệu quyền lợi đã được ban tổ chức đồng bộ sang trạng thái Hợp lệ (ELIGIBLE). Bạn có thể kích hoạt và mua hàng ưu tiên.`,
          isRead: false,
          targetRoute: `/benefits/${benefit.id}`,
          createdAt: state.demoTime,
          updatedAt: state.demoTime,
        };
      }

      return {
        ...state,
        benefits: {
          ...state.benefits,
          [benefit.id]: {
            ...benefit,
            status: 'eligible',
            reasonCode: 'RECONCILED_ORGANIZER_APPROVED',
            nextAction: 'Dữ liệu phân bổ đã được xác minh thành công. Quyền lợi đã sẵn sàng để kích hoạt.',
            updatedAt: state.demoTime,
          },
        },
        notifications: updatedNotifs,
        lastError: undefined,
      };
    }

    /**
     * Reconcile Order Action:
     * - Explicit operator/system reconciliation action for order discrepancies.
     */
    case 'RECONCILE_ORDER': {
      const order = state.orders[action.orderId];
      if (!order) {
        return {
          ...state,
          lastError: { code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng cần đối soát.' },
        };
      }

      return {
        ...state,
        orders: {
          ...state.orders,
          [order.id]: {
            ...order,
            sourceRef: 'VieSHOP-RECONCILED',
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    /**
     * Wardrobe Customization:
     * - Persists fan's accessory selection.
     */
    case 'SET_AVATAR_PRESET': {
      if (!['original', 'wave', 'bob', 'curl'].includes(action.preset)) return state;
      return {...state, fanProfile: {...state.fanProfile, avatarPreset: action.preset}};
    }
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
     * Set Showcase Slot (§Job 07):
     * - Places a saved capsule belonging to the current fan into slot 0, 1, or 2.
     * - Invariant: "Một capsule tối đa một ô" (if capsule already in another slot, clear old slot).
     * - Invariant: "Bỏ khỏi kệ không xóa capsule" (unslotting does not delete or unsave capsule).
     * - Invariant: Only saved capsules belonging to fan can be slotted.
     */
    case 'SET_SHOWCASE_SLOT': {
      const targetSlot = action.slotIndex;
      if (targetSlot < 0 || targetSlot > 2) return state;

      const currentSlots: [string | null, string | null, string | null] = [
        state.fanProfile.showcaseSlots?.[0] ?? null,
        state.fanProfile.showcaseSlots?.[1] ?? null,
        state.fanProfile.showcaseSlots?.[2] ?? null,
      ];

      const newCapsuleId = action.capsuleId;

      if (newCapsuleId) {
        const capsule = state.capsules[newCapsuleId];
        // Must exist, belong to current fan, and be saved
        if (!capsule || capsule.fanId !== state.fanProfile.id || !capsule.isSaved) {
          return state;
        }
      }

      // "Một capsule tối đa một ô": clear if present in any other slot
      const nextSlots = currentSlots.map((id, idx) => {
        if (newCapsuleId && id === newCapsuleId && idx !== targetSlot) {
          return null;
        }
        if (idx === targetSlot) {
          return newCapsuleId;
        }
        return id;
      }) as [string | null, string | null, string | null];

      return {
        ...state,
        fanProfile: {
          ...state.fanProfile,
          showcaseSlots: nextSlots,
          updatedAt: state.demoTime,
        },
      };
    }

    /**
     * Clear Showcase Slot (§Job 07):
     * - Removes capsule from the specified slot (0, 1, or 2) without deleting capsule.
     */
    case 'CLEAR_SHOWCASE_SLOT': {
      const targetSlot = action.slotIndex;
      if (targetSlot < 0 || targetSlot > 2) return state;

      const currentSlots: [string | null, string | null, string | null] = [
        state.fanProfile.showcaseSlots?.[0] ?? null,
        state.fanProfile.showcaseSlots?.[1] ?? null,
        state.fanProfile.showcaseSlots?.[2] ?? null,
      ];

      const nextSlots = [...currentSlots] as [string | null, string | null, string | null];
      nextSlots[targetSlot] = null;

      return {
        ...state,
        fanProfile: {
          ...state.fanProfile,
          showcaseSlots: nextSlots,
          updatedAt: state.demoTime,
        },
      };
    }

    /**
     * Save Capsule Guard:
     * - Attaches optional private note.
     * - If unsaved, removes from showcase shelf automatically.
     */
    case 'SAVE_CAPSULE': {
      const capsule = state.capsules[action.capsuleId];
      if (!capsule) return state;

      const newIsSaved = action.isSaved !== undefined ? action.isSaved : true;
      let nextSlots = state.fanProfile.showcaseSlots;

      // If unsaved, remove from showcase shelf automatically
      if (!newIsSaved && nextSlots) {
        if (nextSlots.includes(capsule.id)) {
          nextSlots = nextSlots.map((id) => (id === capsule.id ? null : id)) as [
            string | null,
            string | null,
            string | null
          ];
        }
      }

      return {
        ...state,
        fanProfile: nextSlots !== state.fanProfile.showcaseSlots ? {
          ...state.fanProfile,
          showcaseSlots: nextSlots,
          updatedAt: state.demoTime,
        } : state.fanProfile,
        capsules: {
          ...state.capsules,
          [capsule.id]: {
            ...capsule,
            isSaved: newIsSaved,
            privateNote: action.privateNote !== undefined ? action.privateNote : capsule.privateNote,
            updatedAt: state.demoTime,
          },
        },
      };
    }

    case 'MARK_NOTIFICATION_READ': {
      const notif = state.notifications[action.notificationId];
      if (!notif || notif.isRead || notif.tenantId !== state.activeTenantId || notif.fanId !== state.fanProfile.id) return state;

      return {
        ...state,
        notifications: {
          ...state.notifications,
          [notif.id]: {
            ...notif,
            isRead: true,
            updatedAt: state.demoTime,
          },
        },
      };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const updated = { ...state.notifications };
      let changed = false;
      for (const id of Object.keys(updated)) {
        if (!updated[id].isRead && updated[id].tenantId === state.activeTenantId && updated[id].fanId === state.fanProfile.id) {
          updated[id] = { ...updated[id], isRead: true, updatedAt: state.demoTime };
          changed = true;
        }
      }
      if (!changed) return state;

      return {
        ...state,
        notifications: updated,
      };
    }

    case 'UPDATE_NOTIFICATION_PREFERENCES': {
      return {
        ...state,
        notificationPreferences: {
          ...state.notificationPreferences,
          ...action.preferences,
        },
      };
    }

    case 'CREATE_NOTIFICATION': {
      const notif = action.notification;
      const category =
        notif.category ||
        (notif.type.includes('session')
          ? 'session'
          : notif.type.includes('capsule')
          ? 'capsule'
          : notif.type.includes('support')
          ? 'support'
          : notif.type.includes('order')
          ? 'order'
          : 'promotional');
      const prefs = state.notificationPreferences;
      if (prefs) {
        if (category === 'session' && !prefs.sessionReminders) return state;
        if (category === 'capsule' && !prefs.capsuleReady) return state;
        if (category === 'support' && !prefs.supportUpdates) return state;
        if (category === 'order' && !prefs.orderUpdates) return state;
        if (category === 'promotional' && !prefs.promotional) return state;
      }

      return {
        ...state,
        notifications: {
          ...state.notifications,
          [notif.id]: notif,
        },
      };
    }

    case 'SAVE_AVATAR_DRAFT': {
      const assetData = (action as any).asset || (action as any).payload?.avatar || (action as any).payload?.asset;
      if (!assetData) return state;
      const existing = state.avatarAssets[assetData.id];
      const version = (existing?.version || 0) + 1;
      const draftAsset: AvatarAsset = {
        id: assetData.id,
        tenantId: state.activeTenantId,
        version,
        updatedAt: state.demoTime,
        ownerWorldId: assetData.ownerWorldId,
        status: 'draft',
        parts: assetData.parts,
        allowedContexts: assetData.allowedContexts,
        replayAllowed: assetData.replayAllowed,
      };

      return {
        ...state,
        avatarAssets: {
          ...state.avatarAssets,
          [draftAsset.id]: draftAsset,
        },
        lastError: undefined,
      };
    }

    case 'APPROVE_AVATAR_ASSET': {
      const assetId = (action as any).assetId || (action as any).payload?.assetId;
      const customApprovalRef = (action as any).approvalRef || (action as any).payload?.approvalRef;
      const asset = state.avatarAssets[assetId];
      if (!asset) {
        return {
          ...state,
          lastError: { code: 'AVATAR_NOT_FOUND', message: 'Không tìm thấy avatar để phê duyệt.' },
        };
      }

      const approvalRef = customApprovalRef || `APPROVAL-SIM-2026-${asset.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()}`;
      const approvedAsset: AvatarAsset = {
        ...asset,
        status: 'approved',
        approvalRef,
        version: asset.version + 1,
        updatedAt: state.demoTime,
      };

      // Also update owner world's avatarAssetId if it was the draft being published
      const world = state.worlds[asset.ownerWorldId];
      let updatedWorlds = state.worlds;
      if (world) {
        updatedWorlds = {
          ...state.worlds,
          [world.id]: {
            ...world,
            avatarAssetId: approvedAsset.id,
            updatedAt: state.demoTime,
          },
        };
      }

      return {
        ...state,
        avatarAssets: {
          ...state.avatarAssets,
          [approvedAsset.id]: approvedAsset,
        },
        worlds: updatedWorlds,
        lastError: undefined,
      };
    }

    case 'RETIRE_AVATAR_ASSET': {
      const assetId = (action as any).assetId || (action as any).payload?.assetId;
      const asset = state.avatarAssets[assetId];
      if (!asset) {
        return {
          ...state,
          lastError: { code: 'AVATAR_NOT_FOUND', message: 'Không tìm thấy avatar để ngưng sử dụng.' },
        };
      }

      const retiredAsset: AvatarAsset = {
        ...asset,
        status: 'retired',
        version: asset.version + 1,
        updatedAt: state.demoTime,
      };

      return {
        ...state,
        avatarAssets: {
          ...state.avatarAssets,
          [retiredAsset.id]: retiredAsset,
        },
        lastError: undefined,
      };
    }

    case 'REVERT_AVATAR_VERSION': {
      const worldId = (action as any).worldId || (action as any).payload?.worldId;
      const targetAssetId = (action as any).targetAssetId || (action as any).assetId || (action as any).payload?.assetId || (action as any).payload?.targetAssetId;
      const world = state.worlds[worldId];
      if (!world) {
        return {
          ...state,
          lastError: { code: 'WORLD_NOT_FOUND', message: 'Không tìm thấy thế giới.' },
        };
      }

      const targetAsset = state.avatarAssets[targetAssetId];
      if (!targetAsset || targetAsset.ownerWorldId !== worldId) {
        return {
          ...state,
          lastError: { code: 'AVATAR_NOT_FOUND', message: 'Avatar không thuộc thế giới này.' },
        };
      }

      if (targetAsset.status !== 'approved') {
        return {
          ...state,
          lastError: {
            code: 'AVATAR_NOT_APPROVED',
            message: 'Chỉ avatar đã được phê duyệt mới có thể kích hoạt làm avatar chính của thế giới.',
          },
        };
      }

      return {
        ...state,
        worlds: {
          ...state.worlds,
          [world.id]: {
            ...world,
            avatarAssetId: targetAsset.id,
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    case 'ASSIGN_AVATAR_TO_SESSION': {
      const sessionId = (action as any).sessionId || (action as any).payload?.sessionId;
      const avatarAssetId = (action as any).avatarAssetId || (action as any).payload?.avatarAssetId;
      const session = state.sessions[sessionId];
      if (!session) {
        return {
          ...state,
          lastError: { code: 'SESSION_NOT_FOUND', message: 'Phiên sự kiện không tồn tại.' },
        };
      }

      if (session.status === 'ended' || session.status === 'cancelled') {
        return {
          ...state,
          lastError: {
            code: 'SESSION_CLOSED',
            message: 'Không thể thay đổi avatar cho phiên đã kết thúc hoặc bị hủy.',
          },
        };
      }

      const avatar = state.avatarAssets[avatarAssetId];
      if (!avatar) {
        return {
          ...state,
          lastError: { code: 'AVATAR_NOT_FOUND', message: 'Không tìm thấy avatar.' },
        };
      }

      if (avatar.status === 'retired') {
        return {
          ...state,
          lastError: {
            code: 'AVATAR_RETIRED',
            message: 'Avatar đã ngưng sử dụng (retired), không thể gán cho phiên mới.',
          },
        };
      }

      if (avatar.status !== 'approved') {
        return {
          ...state,
          lastError: {
            code: 'AVATAR_NOT_APPROVED',
            message: 'Chỉ avatar đã được phê duyệt mới có thể gán vào phiên sự kiện.',
          },
        };
      }

      if (!avatar.allowedContexts.includes(session.format)) {
        return {
          ...state,
          lastError: {
            code: 'AVATAR_CONTEXT_DISALLOWED',
            message: `Avatar không được cấp phép cho định dạng '${session.format}'.`,
          },
        };
      }

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [session.id]: {
            ...session,
            avatarAssetId: avatar.id,
            updatedAt: state.demoTime,
          },
        },
        lastError: undefined,
      };
    }

    /**
     * Fan Profile Role Update:
     * - Allows local simulation of fan/artist/operator roles within active tenant.
     * - Invariant: Official role never transfers across tenant switches.
     */
    case 'SET_FAN_ROLE': {
      return {
        ...state,
        fanProfile: {
          ...state.fanProfile,
          role: action.role,
          updatedAt: state.demoTime,
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
