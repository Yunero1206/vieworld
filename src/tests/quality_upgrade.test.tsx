import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import type { AppState } from '../domain/types';
import { equippedItemLabel } from '../world/merchCatalog';
import { DEMO_FANS } from '../world/community';
import { MemberSpaceView } from '../views/MemberSpaceView';
import { PersonalUtilityView } from '../views/PersonalUtilityView';
import { ContextStage } from '../components/ContextStage';
import { formatTimeAgo, mapDomainToDisplay } from '../components/notifications/notificationHelper';
import { queryWorldGuide } from '../data/guideKnowledge';
import { SessionView } from '../views/SessionView';
import { ArtistWorldView } from '../views/ArtistWorldView';

const originalLook = DEMO_FANS[0].look;
beforeEach(() => { localStorage.clear(); });
afterEach(() => { DEMO_FANS[0].look = originalLook; cleanup(); vi.restoreAllMocks(); });
const mount = (state: AppState, path: string, children: React.ReactNode) => render(<AppProvider initialState={state}><MemoryRouter initialEntries={[path]}>{children}</MemoryRouter></AppProvider>);

describe('Quality upgrade public look labels', () => {
  it('resolves each slot by tenant and item metadata, preferring a digital edition', () => {
    const state = createInitialState('vieworld-demo');
    expect(equippedItemLabel(state, 'shirt', 'star-shirt')).toBe('Áo Star Club');
    expect(equippedItemLabel(state, 'hat', 'star-cap')).toBe('Nón Everyday Star');
    expect(equippedItemLabel(state, 'lightstick', 'star-light')).toBe('Star Light');
    expect(equippedItemLabel(state, 'shirt', 'mira-hoodie')).toBe('Áo Hoodie MIRA Cloud Dream');
    expect(equippedItemLabel(state, 'shirt', 'kai-bomber')).toBe('Áo khoác Bomber KAI Pulse Wave');
    state.products['product-mira-hoodie-bundle'].title = 'Tên bundle không được ưu tiên';
    expect(equippedItemLabel(state, 'shirt', 'mira-hoodie')).toBe('Áo Hoodie MIRA Cloud Dream');
  });
  it('uses friendly fallbacks for missing, wrong-slot or foreign metadata without exposing IDs', () => {
    const state = createInitialState('vieworld-demo');
    expect(equippedItemLabel(state, 'shirt')).toBeUndefined();
    expect(equippedItemLabel(state, 'hat', 'mira-hoodie')).toBe('Nón đang sử dụng');
    for (const product of Object.values(state.products)) if (product.digitalItemId === 'mira-hoodie') product.tenantId = 'mfan-demo';
    expect(equippedItemLabel(state, 'shirt', 'mira-hoodie')).toBe('Áo đang sử dụng');
    expect(equippedItemLabel(state, 'lightstick', 'unknown-id')).toBe('Vật phẩm đang cầm');
    for (const product of Object.values(state.products)) if (product.digitalItemId === 'star-cap') product.title = ' · Digital';
    expect(equippedItemLabel(state, 'hat', 'star-cap')).toBe('Nón đang sử dụng');
  });
  it('renders the viewed fan look rather than the viewer look, without granting ownership', () => {
    const state = createInitialState('vieworld-demo'); state.fanProfile.digitalLook = { shirt: 'kai-bomber' };
    DEMO_FANS[0].look = { shirt: 'mira-hoodie' };
    mount(state, '/members/fan-mai', <Routes><Route path="/members/:fanId" element={<MemberSpaceView/>}/></Routes>);
    const identity = screen.getByRole('heading', { name: 'Đang mặc' }).parentElement!;
    expect(within(identity).getByText('Áo Hoodie MIRA Cloud Dream')).toBeVisible();
    expect(within(identity).queryByText('Áo Star Club')).toBeNull();
    expect(Object.keys(state.orders)).toHaveLength(0);
  });
});

describe('Quality upgrade Help results', () => {
  it.each(['xyz987-no-known-topic', 'Nghệ sĩ có bạn gái không?', '<script>alert("x")</script>'])('shows the real result for %s without mutation or remote requests', query => {
    const state = createInitialState('vieworld-demo'); let observed: AppState | undefined;
    function Probe() { observed = useApp().state; return null; }
    const request = vi.spyOn(globalThis, 'fetch');
    mount(state, '/account/help', <><PersonalUtilityView/><Probe/></>);
    const before = observed;
    fireEvent.change(screen.getByRole('textbox', { name: 'Tìm trong hướng dẫn' }), { target: { value: query } });
    const result = queryWorldGuide(query); expect(result.type).not.toBe('answered');
    if (result.type !== 'answered') expect(within(screen.getByRole('status')).getByText(result.message)).toBeVisible();
    if (result.type === 'unknown') {
      for (const card of result.suggestedTopics) {
        fireEvent.click(screen.getByText(card.title));
        expect(screen.getByRole('link', { name: `${card.actionLink.label} →` })).toHaveAttribute('href', card.actionLink.to);
      }
    }
    if (result.type === 'unsupported_topic') expect(screen.getByText(result.limitationReason)).toBeVisible();
    expect(observed).toBe(before); expect(request).not.toHaveBeenCalled();
    expect(document.querySelector('script')).toBeNull();
  });
  it('keeps empty topics and answered navigation, including unaccented Vietnamese input', () => {
    mount(createInitialState('vieworld-demo'), '/account/help', <PersonalUtilityView/>);
    expect(screen.getByText('Diện mạo, trang phục và phụ kiện')).toBeVisible();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hoi vien' } });
    expect(screen.getByText('Tư cách Hội viên & Điều kiện nâng cấp')).toBeVisible();
    expect(screen.queryByText('Chủ đề bạn có thể tìm:')).toBeNull();
  });
});

describe('Quality upgrade listening metadata', () => {
  it('does not expose foreign or invalid listening notes through the actual Artist route', () => {
    for (const invalid of ['foreign','rights','media'] as const) {
      const state=createInitialState('vieworld-demo'), session=state.sessions['session-listen-01'];
      if (invalid==='foreign') session.tenantId='mfan-demo';
      if (invalid==='rights') session.rightsApproved=false;
      if (invalid==='media') session.mediaStatus='missing';
      const view=mount(state,'/artist/artist-a?context=session:session-listen-01',<Routes><Route path="/artist/:artistId" element={<ArtistWorldView/>}/></Routes>);
      expect(screen.queryByText(/Bản thu & ghi chú/)).toBeNull();
      expect(screen.queryByText(session.trackNotes![0].notes)).toBeNull(); view.unmount();
    }
  });
  it('the legacy invalid-session fallback cannot reveal a foreign-tenant session', () => {
    const state=createInitialState('vieworld-demo'); state.sessions['session-dropin-01'].tenantId='mfan-demo';
    mount(state,'/sessions/session-dropin-01',<Routes><Route path="/sessions/:sessionId" element={<SessionView/>}/></Routes>);
    expect(screen.getByTestId('session-not-found-card')).toBeVisible();
    expect(screen.queryByTestId('avatar-graphic')).toBeNull();
  });
  it('does not render draft, foreign or different-artist avatar assets in an embedded stage', () => {
    for (const kind of ['draft','foreign','other-artist'] as const) {
      const state=createInitialState('vieworld-demo'), session=state.sessions['session-dropin-01'];
      const avatar=state.avatarAssets[session.avatarAssetId!];
      if (kind==='draft') avatar.status='draft';
      if (kind==='foreign') avatar.tenantId='mfan-demo';
      if (kind==='other-artist') avatar.ownerWorldId='artist-mira';
      const view=mount(state,'/',<ContextStage session={session} artistId="artist-a" artistName="Artist A" image="/image.webp"/>);
      expect(screen.getByTestId('fallback-avatar-torso')).toBeVisible(); view.unmount();
    }
  });
  it('opens real ordered liner notes inside Artist context without suggesting audio playback', () => {
    const state = createInitialState('vieworld-demo'), session = state.sessions['session-listen-01'];
    mount(state, '/artist/artist-a?context=session:session-listen-01', <ContextStage session={session} artistId="artist-a" artistName="Artist A" image="/image.webp"/>);
    fireEvent.click(screen.getByText(`Bản thu & ghi chú (${session.trackNotes!.length})`));
    expect(screen.getByText(session.trackNotes![0].notes)).toBeVisible();
    expect(screen.getByText('03:24 · Bản chọn trong demo')).toBeVisible();
    expect(screen.queryByText('Đang phát trong phòng nghe')).toBeNull();
    expect(screen.getByRole('link', { name: 'Về Trang chính' })).toHaveAttribute('href', '/artist/artist-a');
    expect(screen.getByRole('link', { name: 'Vào Hall' })).toHaveAttribute('href', '/artist/artist-a/hall?room=session-listen-01');
  });
  it('keeps concert setlist and omits a notes panel when metadata is empty', () => {
    const state = createInitialState('vieworld-demo'), concert = state.sessions['session-house-01'];
    const view = mount(state, '/', <ContextStage session={concert} artistId="artist-a" artistName="Artist A" image="/image.webp"/>);
    expect(screen.getByText('Chương trình biểu diễn')).toBeVisible(); view.unmount();
    mount(state, '/', <ContextStage session={{...state.sessions['session-listen-01'],trackNotes:[]}} artistId="artist-a" artistName="Artist A" image="/image.webp"/>);
    expect(screen.queryByText(/Bản thu & ghi chú/)).toBeNull();
  });
});

describe('Quality upgrade domain clock', () => {
  const now = '2026-09-09T13:00:00.000Z';
  it('uses an explicit reference instead of the device clock, and handles invalid or future timestamps', () => {
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2030-01-01T00:00:00Z').getTime());
    expect(formatTimeAgo('2026-09-09T12:58:00Z', now)).toBe('2 phút trước');
    expect(formatTimeAgo('2026-09-09T11:00:00Z', now)).toBe('2 giờ trước');
    expect(formatTimeAgo('2026-09-08T13:00:00Z', now)).toBe('Hôm qua');
    expect(formatTimeAgo(undefined, now)).toBe('Vừa xong');
    expect(formatTimeAgo('invalid', now)).toBe('Vừa xong');
    expect(formatTimeAgo(now, 'invalid')).toBe('Vừa xong');
    expect(formatTimeAgo('2026-09-10T13:00:00Z', now)).toBe('Vừa xong');
    expect(formatTimeAgo('2026-08-31T19:00:00Z', now)).toBe('1 thg 9');
  });
  it('maps every notification with the same domain reference and updates when it advances', () => {
    const state = createInitialState('vieworld-demo');
    const notification = Object.values(state.notifications)[0];
    const source = {...notification, createdAt: now, updatedAt: now};
    expect(mapDomainToDisplay(source, now).timeAgo).toBe('Vừa xong');
    expect(mapDomainToDisplay(source, '2026-09-09T14:00:00Z').timeAgo).toBe('1 giờ trước');
  });
});
