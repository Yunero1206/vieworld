export interface SpacePrivacySettings {
  roomVisibility: 'everyone' | 'users' | 'private';
  showVisitCount: boolean;
  guestbookEnabled: boolean;
  showMembershipSignal: boolean;
}

export const DEFAULT_PRIVACY: SpacePrivacySettings = {
  roomVisibility: 'everyone',
  showVisitCount: true,
  guestbookEnabled: true,
  showMembershipSignal: true,
};

const LEGACY_STORAGE_KEY = 'vieworld_privacy_settings';
const storageKey = (tenantId: string, fanId: string) => `vieworld:privacy:${tenantId}:${fanId}`;

export function loadPrivacySettings(tenantId = 'vieworld-demo', fanId = 'fan-linh'): SpacePrivacySettings {
  try {
    // The old unscoped setting belongs only to the original Linh demo profile.
    const saved = localStorage.getItem(storageKey(tenantId, fanId)) ||
      (tenantId === 'vieworld-demo' && fanId === 'fan-linh' ? localStorage.getItem(LEGACY_STORAGE_KEY) : null);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        roomVisibility: ['everyone', 'users', 'private'].includes(parsed?.roomVisibility) ? parsed.roomVisibility : DEFAULT_PRIVACY.roomVisibility,
        showVisitCount: typeof parsed?.showVisitCount === 'boolean' ? parsed.showVisitCount : DEFAULT_PRIVACY.showVisitCount,
        guestbookEnabled: typeof parsed?.guestbookEnabled === 'boolean' ? parsed.guestbookEnabled : DEFAULT_PRIVACY.guestbookEnabled,
        showMembershipSignal: typeof parsed?.showMembershipSignal === 'boolean' ? parsed.showMembershipSignal : DEFAULT_PRIVACY.showMembershipSignal,
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_PRIVACY;
}

export function savePrivacySettings(settings: SpacePrivacySettings, tenantId = 'vieworld-demo', fanId = 'fan-linh'): void {
  try {
    localStorage.setItem(storageKey(tenantId, fanId), JSON.stringify(settings));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('vieworld-privacy-changed'));
}

export function canAccessRoom(
  settings: SpacePrivacySettings,
  isOwner: boolean,
  isLoggedInUser: boolean = true
): boolean {
  if (isOwner) return true;
  if (settings.roomVisibility === 'private') return false;
  if (settings.roomVisibility === 'users' && !isLoggedInUser) return false;
  return true;
}
