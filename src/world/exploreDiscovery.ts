import type { AppState, ChatMessage } from '../domain/types';
import { EXPANDED_PUBLIC_VOICES } from '../data/expandedUniverse';
import { isDemoSignedIn } from './account';

export interface PublicVoice {
  id: string;
  worldId: string;
  author: string;
  text: string;
  selectedBy: 'artist' | 'community';
  sourceContextId: string;
  isDemo: boolean;
  /** Known author only; never infer an avatar from a display name. */
  fanId?: string;
}

/** Editorial demo fixtures only. They do not imply an actual fan posted or opted in. */
const DEMO_PUBLIC_VOICES: PublicVoice[] = EXPANDED_PUBLIC_VOICES;

export function canProjectHallVoice(state: AppState, worldId: string, message: ChatMessage): boolean {
  // This local demo has no directory of other fans' privacy settings: unknown consent stays private.
  return isDemoSignedIn(state) && state.worlds[worldId]?.tenantId === state.activeTenantId
    && message.fanId === state.fanProfile.id && state.fanProfile.sharing?.hallPublicProjectionEnabled === true
    && message.explorePreviewConsent === true && message.explorePreviewStatus === 'approved'
    && !message.isReported && Boolean(message.text.trim());
}

/** Hall messages never leave Hall by default. Publication requires consent AND approval. */
function projectableVoices(state: AppState, worldId: string, sourceContextId?: string): PublicVoice[] {
  if (state.worlds[worldId]?.tenantId !== state.activeTenantId) return [];
  const curated = state.activeTenantId === 'vieworld-demo' ? DEMO_PUBLIC_VOICES.filter(voice => voice.worldId === worldId && (!sourceContextId || voice.sourceContextId === sourceContextId)) : [];
  const approved = (state.hallMessages?.[worldId] || [])
    .filter(message => canProjectHallVoice(state, worldId, message) && (!sourceContextId || message.sessionId === sourceContextId))
    .map(message => ({
      id: message.id,
      worldId,
      author: message.authorName,
      text: message.text,
      selectedBy: message.exploreSelectedBy || ('community' as const),
      sourceContextId: message.sessionId,
      isDemo: Boolean(message.isSample),
      fanId: message.fanId,
    }));
  return [...approved.reverse(), ...curated];
}

export function selectPublicVoices(state: AppState, worldId: string, sourceContextId?: string): PublicVoice[] {
  return projectableVoices(state,worldId,sourceContextId).slice(0,3);
}

/** Choose context before capping: consent permits publication, not arbitrary placement. */
export function selectWorldPulse(state: AppState, worldId: string, primaryContextId?: string): PublicVoice | undefined {
  const pool=projectableVoices(state,worldId);
  const activeContext=(id:string)=>{
    const session=state.sessions[id];
    return session?.tenantId===state.activeTenantId && session.rightsApproved===true
      && !['missing','expired'].includes(session.mediaStatus||'') && ['running','open','paused'].includes(session.status);
  };
  return pool.find(v=>v.sourceContextId===primaryContextId)
    || pool.find(v=>activeContext(v.sourceContextId))
    || pool.find(v=>v.selectedBy==='artist') || pool[0];
}

/** A public excerpt links back to its actual room; Hall still enforces membership. */
export function publicVoiceHallUrl(voice: PublicVoice): string {
  return `/artist/${encodeURIComponent(voice.worldId)}/hall?room=${encodeURIComponent(voice.sourceContextId)}&message=${encodeURIComponent(voice.id)}`;
}
