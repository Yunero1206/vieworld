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

const STORAGE_KEY = 'vieworld_privacy_settings';

export function loadPrivacySettings(): SpacePrivacySettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_PRIVACY,
        ...parsed,
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_PRIVACY;
}

export function savePrivacySettings(settings: SpacePrivacySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
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
