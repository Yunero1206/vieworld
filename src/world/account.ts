import type { AppAction, AppState } from '../domain/types';

export type DemoProvider = 'google' | 'facebook';
export interface PrivateContact {
  email: string;
  recipient: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  deliveryNote: string;
}
export interface DemoAccount {
  tenantId: string;
  fanId: string;
  session: { provider: DemoProvider | 'legacy'; mode: 'login' | 'register' } | null;
  contact: PrivateContact;
}
export const EMPTY_CONTACT: PrivateContact = {
  email: '', recipient: '', phone: '', country: 'Việt Nam', city: '', address: '', deliveryNote: '',
};

function belongsToFan(state: AppState): boolean {
  return state.fanProfile.tenantId === state.activeTenantId && state.demoAccount?.fanId === state.fanProfile.id && state.demoAccount.tenantId === state.activeTenantId;
}

// A populated fan profile is not a login session. Missing/old sessions remain guests.
export function isDemoSignedIn(state: AppState): boolean {
  return belongsToFan(state) && ['google', 'facebook', 'legacy'].includes(state.demoAccount?.session?.provider || '');
}
export function privateContact(state: AppState): PrivateContact {
  return belongsToFan(state) && isDemoSignedIn(state) ? { ...EMPTY_CONTACT, ...state.demoAccount!.contact } : { ...EMPTY_CONTACT };
}
function accountForFan(state: AppState): DemoAccount {
  return belongsToFan(state) ? state.demoAccount! : {
    tenantId: state.activeTenantId, fanId: state.fanProfile.id, session: null, contact: { ...EMPTY_CONTACT },
  };
}
export function freshGuestState(state: AppState): AppState {
  return { ...state, demoAccount: { ...accountForFan(state), session: null } };
}
export function validateContact(value: PrivateContact): string | undefined {
  const limits: Record<keyof PrivateContact, number> = { email: 254, recipient: 100, phone: 30, country: 80, city: 100, address: 240, deliveryNote: 200 };
  for (const key of Object.keys(limits) as (keyof PrivateContact)[]) {
    if (typeof value?.[key] !== 'string' || value[key].length > limits[key] || /[\u0000-\u001f]/.test(value[key])) return 'Thông tin quá dài hoặc có ký tự không hợp lệ.';
  }
  if (value.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) return 'Kiểm tra lại địa chỉ email.';
  if (value.phone.trim() && !/^\+?[\d\s().-]{7,30}$/.test(value.phone.trim())) return 'Kiểm tra lại số điện thoại (ít nhất 7 ký tự).';
  const addressStarted = Boolean(value.address.trim() || value.city.trim() || value.recipient.trim() || value.phone.trim() || value.deliveryNote.trim());
  if (addressStarted && !(value.recipient.trim() && value.phone.trim() && value.country.trim() && value.city.trim() && value.address.trim())) return 'Để lưu nơi nhận, điền tên người nhận, số điện thoại, quốc gia, tỉnh/thành và địa chỉ.';
}

export function accountReducer(state: AppState, action: AppAction): AppState | undefined {
  if (action.type === 'DEMO_SIGN_IN') {
    if (!['google', 'facebook'].includes(action.provider) || !['login', 'register'].includes(action.mode)) return state;
    return { ...state, demoAccount: { ...accountForFan(state), session: { provider: action.provider, mode: action.mode } } };
  }
  if (action.type === 'DEMO_SIGN_OUT') {
    // Leaving the demo session never deletes ownership, cart, room placements, or contact drafts.
    return { ...state, demoAccount: { ...accountForFan(state), session: null } };
  }
  if (action.type === 'SAVE_PRIVATE_CONTACT') {
    if (!isDemoSignedIn(state)) return state;
    const error = validateContact(action.contact);
    if (error) return { ...state, lastError: { code: 'CONTACT_INVALID', message: error } };
    const contact = Object.fromEntries(Object.keys(EMPTY_CONTACT).map(key => [key, action.contact[key as keyof PrivateContact].trim()])) as unknown as PrivateContact;
    return { ...state, lastError: undefined, demoAccount: {
      ...accountForFan(state),
      // Legacy identity remains explicitly legacy; no fake OAuth connection is inferred.
      session: state.demoAccount?.session || { provider: 'legacy', mode: 'login' },
      contact,
    } };
  }
}
