import type { AppState, Question, Session } from '../domain/types';
import { MEMBER_QA_SESSION_ID } from '../world/hallRooms';
import { CANONICAL_INITIAL_DEMO_TIME } from './expandedUniverse';

/** One explicitly fictional official-depth fixture; no auto-reply or invented online count. */
export const ARTIST_A_QA_SESSION: Session = {
  id: MEMBER_QA_SESSION_ID, tenantId: 'vieworld-demo', version: 1, updatedAt: CANONICAL_INITIAL_DEMO_TIME,
  worldId: 'artist-a', title: 'Q&A với Artist A', format: 'dropin', status: 'running',
  hostRole: 'artist', artistPresence: 'present', segmentMode: 'live', aiUse: 'none',
  replayStatus: 'not_planned', scheduledStartTime: CANONICAL_INITIAL_DEMO_TIME,
  demo: true, rightsApproved: true, mediaStatus: 'cleared_local',
  rightsChecklist: { musicClearance: true, artistConsent: true, safetyReview: true },
};
export const ARTIST_A_QA_ANSWER: Question = {
  id: 'question-artist-a-qa-demo', tenantId: 'vieworld-demo', version: 1, updatedAt: CANONICAL_INITIAL_DEMO_TIME,
  sessionId: MEMBER_QA_SESSION_ID, fanId: 'demo-qa-fan', authorName: 'Fan mẫu',
  content: 'Bạn thường bắt đầu viết một bài hát từ đâu?', status: 'answered',
  answerText: 'Mình thường giữ lại một câu nói hoặc một cảm xúc trong ngày, rồi tìm giai điệu cho nó. Có khi một câu rất nhỏ lại mở ra cả bài hát.',
  answeredAt: CANONICAL_INITIAL_DEMO_TIME,
};
/** Add only missing demo context to saved profiles; never replace lifecycle or fan questions. */
export function withCommunityHallFixture(state: AppState): AppState {
  if (state.activeTenantId !== 'vieworld-demo' || state.worlds['artist-a']?.tenantId !== state.activeTenantId) return state;
  const session = state.sessions[MEMBER_QA_SESSION_ID];
  const answer = state.questions[ARTIST_A_QA_ANSWER.id];
  if (session && answer) return state;
  return { ...state,
    sessions: session ? state.sessions : { ...state.sessions, [MEMBER_QA_SESSION_ID]: structuredClone(ARTIST_A_QA_SESSION) },
    questions: answer ? state.questions : { ...state.questions, [ARTIST_A_QA_ANSWER.id]: structuredClone(ARTIST_A_QA_ANSWER) },
  };
}
