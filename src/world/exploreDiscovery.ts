import type { AppState } from '../domain/types';
import { EXPANDED_PUBLIC_VOICES } from '../data/expandedUniverse';

export interface PublicVoice {
  id: string;
  worldId: string;
  author: string;
  text: string;
  selectedBy: 'artist' | 'community';
  sourceContextId: string;
  isDemo: boolean;
}

/** Editorial demo fixtures only. They do not imply an actual fan posted or opted in. */
const DEMO_PUBLIC_VOICES: PublicVoice[] = EXPANDED_PUBLIC_VOICES;

/** Hall messages never leave Hall by default. Publication requires consent AND approval. */
export function selectPublicVoices(state: AppState, worldId: string): PublicVoice[] {
  const curated = state.activeTenantId === 'vieworld-demo' ? DEMO_PUBLIC_VOICES.filter(voice => voice.worldId === worldId) : [];
  const approved = (state.hallMessages?.[worldId] || [])
    .filter(message => message.explorePreviewConsent === true && message.explorePreviewStatus === 'approved' && !message.isReported && message.text.trim())
    .map(message => ({
      id: message.id,
      worldId,
      author: message.authorName,
      text: message.text,
      selectedBy: message.exploreSelectedBy || ('community' as const),
      sourceContextId: message.sessionId,
      isDemo: Boolean(message.isSample),
    }));
  return [...approved.slice(-2), ...curated].slice(0, 3);
}
