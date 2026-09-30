import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider, useApp } from '../context/AppContext';
import { createFreshFanState, createInitialState } from '../data/fixtures';
import { RoomGuestbook, guestbookStorageKey } from '../components/RoomGuestbook';
import { getActiveFanId, listLocalDemoProfiles, loadState, resetTenantStorage, saveState } from '../services/storageAdapter';
import { loadPrivacySettings, savePrivacySettings } from '../world/privacy';
import { getCurrentArtistId, setCurrentArtistId } from '../world/currentArtist';
import { EMPTY_CONTACT, privateContact } from '../world/account';

beforeEach(() => localStorage.clear());

function ProfileHarness() {
  const { state, registerDemoProfile, signInDemoProfile, loadScenarioPreset } = useApp();
  return <>
    <span data-testid="current-profile">{state.fanProfile.displayName}</span>
    <button onClick={() => registerDemoProfile('Bạn Mới', 'google')}>Tạo hồ sơ B</button>
    <button onClick={() => registerDemoProfile('Người Khác', 'facebook')}>Tạo hồ sơ C</button>
    <button onClick={() => signInDemoProfile('fan-linh', 'google')}>Về Linh</button>
    <button onClick={() => loadScenarioPreset('activeMember')}>Thử preset</button>
    <RoomGuestbook fanId={state.fanProfile.id} isOwner />
  </>;
}

describe('Device-local demo profiles', () => {
  it('starts a new profile without Linh’s room, ownership, notices or fan history', () => {
    const fresh = createFreshFanState('vieworld-demo', 'fan-local-b', 'Bạn Mới');
    expect(fresh.fanProfile.id).toBe('fan-local-b');
    expect(fresh.fanProfile.displayName).toBe('Bạn Mới');
    expect(fresh.fanProfile.displaySurfaces).toBeUndefined();
    expect(fresh.followedWorldIds).toEqual([]);
    expect(fresh.rsvpdSessionIds).toEqual([]);
    for (const key of ['memberships', 'benefits', 'orders', 'capsules', 'notifications', 'supportCases'] as const) expect(fresh[key]).toEqual({});
    expect(fresh.products).toEqual(createInitialState().products);
  });

  it('switches between separately persisted profiles without carrying guestbook notes', () => {
    const linh = createInitialState();
    saveState(linh);
    render(<AppProvider initialState={linh}><MemoryRouter><ProfileHarness /></MemoryRouter></AppProvider>);
    expect(screen.getByTestId('current-profile')).toHaveTextContent('Linh Nguyễn');
    expect(screen.getByText(/Ghé phòng Linh/)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Tạo hồ sơ B' }));
    const bId = getActiveFanId('vieworld-demo');
    expect(bId).not.toBe('fan-linh');
    expect(screen.getByTestId('current-profile')).toHaveTextContent('Bạn Mới');
    expect(screen.getByText(/Chưa có mẩu giấy nhớ nào/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Dán thử lời nhắn' }));
    fireEvent.change(screen.getByPlaceholderText(/Viết vài dòng gửi chủ phòng/), { target: { value: 'Lời của B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Dán lên tường' }));
    expect(screen.getByText('Lời của B')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Thử preset' }));
    expect(screen.getByTestId('current-profile')).toHaveTextContent('Bạn Mới');
    expect(loadState('vieworld-demo', 'fan-linh').state.fanProfile.displayName).toBe('Linh Nguyễn');

    fireEvent.click(screen.getByRole('button', { name: 'Tạo hồ sơ C' }));
    const cId = getActiveFanId('vieworld-demo');
    expect(cId).not.toBe(bId);
    expect(screen.getByText(/Chưa có mẩu giấy nhớ nào/)).toBeVisible();
    expect(screen.queryByText('Lời của B')).toBeNull();
    expect(JSON.parse(localStorage.getItem(guestbookStorageKey('vieworld-demo', cId)) || '[]')).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: 'Về Linh' }));
    expect(screen.getByText(/Ghé phòng Linh/)).toBeVisible();
    expect(screen.queryByText('Lời của B')).toBeNull();
    expect(listLocalDemoProfiles('vieworld-demo')).toHaveLength(3);
    expect(loadState('vieworld-demo', bId).state.fanProfile.displayName).toBe('Bạn Mới');
  });

  it('keeps privacy, contact and artist selection under the matching fan ID', () => {
    const a = createInitialState();
    const b = createFreshFanState('vieworld-demo', 'fan-local-b', 'Bạn Mới');
    savePrivacySettings({ ...loadPrivacySettings(), roomVisibility: 'private' }, a.activeTenantId, a.fanProfile.id);
    expect(loadPrivacySettings(b.activeTenantId, b.fanProfile.id).roomVisibility).toBe('everyone');
    a.demoAccount!.contact = { ...EMPTY_CONTACT, email: 'linh@example.test' };
    expect(privateContact(a).email).toBe('linh@example.test');
    expect(privateContact(b).email).toBe('');
    setCurrentArtistId(a, 'artist-b');
    setCurrentArtistId(b, 'artist-c');
    expect(getCurrentArtistId(a)).toBe('artist-b');
    expect(getCurrentArtistId(b)).toBe('artist-c');
  });

  it('tenant reset removes only that tenant’s profile extras', () => {
    localStorage.setItem(guestbookStorageKey('vieworld-demo', 'fan-local-b'), '[]');
    savePrivacySettings({ ...loadPrivacySettings(), roomVisibility: 'private' }, 'vieworld-demo', 'fan-local-b');
    localStorage.setItem(guestbookStorageKey('mfan-demo', 'fan-local-b'), '[]');
    localStorage.setItem('unrelated', 'keep');
    resetTenantStorage('vieworld-demo');
    expect(localStorage.getItem(guestbookStorageKey('vieworld-demo', 'fan-local-b'))).toBeNull();
    expect(loadPrivacySettings('vieworld-demo', 'fan-local-b').roomVisibility).toBe('everyone');
    expect(localStorage.getItem(guestbookStorageKey('mfan-demo', 'fan-local-b'))).toBe('[]');
    expect(localStorage.getItem('unrelated')).toBe('keep');
  });
});
