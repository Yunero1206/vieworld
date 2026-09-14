/**
 * Job 06 Acceptance Test Suite: Unified Avatar & Wardrobe Consistency
 *
 * Requirements (§Job 06 in ANTIGRAVITY_JOBS.md & VIEWORLD_WORLD_PLAN.md):
 * 1. "Đổi tủ đồ một lần, các màn thấy cùng một diện mạo":
 *    - Equipping an accessory in WardrobeCustomizer updates consistently across:
 *      a) AppShell desktop header user avatar
 *      b) Fan room diorama center stage avatar hotspot & wardrobe hotspot
 *      c) MyWorldView profile header avatar
 *    - Unsaved selection updates live preview box, but does not mutate equipped state until saved.
 * 2. Strict Segregation of Artist vs. Fan Characters:
 *    - Artist A: Indie acoustic singer (lavender sweater, guitar, role="artist").
 *    - Fan: Youthful music enthusiast (cream zip hoodie, indigo jeans, role="fan").
 *    - Never mix characters; Artist does not wear fan accessories; Fan does not use artist stage assets.
 * 3. Truthful Presence:
 *    - Artist avatars do NOT generate artificial presence from animations.
 *    - Disconnected / absent status halts motion (isFrozen).
 * 4. Defensive Fallbacks:
 *    - Unknown, retired, or missing accessory IDs fall back cleanly without breaking layout.
 * 5. Tenant Portability & Isolation:
 *    - Wardrobe choice is scoped per tenant without leakage.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { AppShell } from '../components/AppShell';
import { MyWorldView } from '../views/MyWorldView';
import { WardrobeCustomizer } from '../components/WardrobeCustomizer';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { AvatarStage } from '../components/AvatarStage';
import { getAccessoryById, getAccessoryName, isFanAccessory } from '../world/assetManifest';

describe('Job 06 Acceptance: Unified Avatar & Wardrobe Consistency', () => {
  describe('1. Asset Manifest & Defensive Fallbacks', () => {
    it('resolves recognized accessories by ID and localized Vietnamese name', () => {
      const earpiece = getAccessoryById('earpiece_glow');
      expect(earpiece).toBeDefined();
      expect(earpiece?.name).toBe('Tai nghe Neon Phát sáng');
      expect(earpiece?.previewColor).toBe('#10B981');

      const byName = getAccessoryById('Tai nghe Neon Phát sáng');
      expect(byName).toBeDefined();
      expect(byName?.id).toBe('earpiece_glow');

      const star = getAccessoryById('accessory_classic');
      expect(star).toBeDefined();
      expect(star?.name).toBe('Huy hiệu Ngôi sao Cổ điển');

      const visor = getAccessoryById('visor_neon');
      expect(visor).toBeDefined();
      expect(visor?.name).toBe('Kính thực tế ảo Cyber');
    });

    it('gracefully handles missing or unknown accessory IDs without crashing', () => {
      expect(getAccessoryById(undefined)).toBeUndefined();
      expect(getAccessoryById('')).toBeUndefined();
      expect(getAccessoryById('non_existent_item_999')).toBeUndefined();

      // getAccessoryName returns fallback or custom label
      expect(getAccessoryName(undefined)).toBe('');
      expect(getAccessoryName('Acoustic Pin')).toBe('Acoustic Pin');

      // Validation helper
      expect(isFanAccessory('earpiece_glow')).toBe(true);
      expect(isFanAccessory('non_existent_item_999')).toBe(false);
    });

    it('renders AvatarRenderer with fallback attributes for unknown accessories', () => {
      render(
        <AvatarRenderer
          role="fan"
          accessoryId="invalid_ghost_accessory"
          size="md"
          displayName="Người dùng"
          testId="fallback-avatar-test"
        />
      );

      const avatar = screen.getByTestId('fallback-avatar-test');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('data-accessory-fallback', 'true');
      expect(avatar).toHaveAttribute('data-accessory', 'none');
    });
  });

  describe('2. Strict Separation of Fan vs. Artist Characters', () => {
    it('renders distinct identities for Fan and Artist without mixing silhouettes', () => {
      const { rerender } = render(
        <AvatarRenderer
          role="fan"
          accessoryId="accessory_classic"
          size="lg"
          displayName="Fan Minh"
          testId="fan-renderer-test"
        />
      );

      const fanEl = screen.getByTestId('fan-renderer-test');
      expect(fanEl).toHaveAttribute('data-role', 'fan');
      // Fan has the star accessory
      expect(screen.getByTestId('preview-accessory-star')).toBeInTheDocument();

      // Rerender as Artist
      rerender(
        <AvatarRenderer
          role="artist"
          size="lg"
          displayName="Artist A"
          testId="artist-renderer-test"
        />
      );

      const artistEl = screen.getByTestId('artist-renderer-test');
      expect(artistEl).toHaveAttribute('data-role', 'artist');
      // Artist does NOT have fan accessories
      expect(screen.queryByTestId('preview-accessory-star')).not.toBeInTheDocument();
    });

    it('enforces that artist avatar presence is truthful and frozen when disconnected', () => {
      render(
        <AvatarStage
          avatar={{
            id: 'avatar-a-v1',
            tenantId: 'vieworld-demo',
            version: 1,
            updatedAt: '2026-09-09T20:00:00Z',
            status: 'approved',
            ownerWorldId: 'artist-a',
            allowedContexts: ['dropin', 'concert'],
            replayAllowed: true,
            parts: {
              base: 'acoustic_minimal',
              outfit: 'midnight_jacket',
              accessory: 'earpiece_glow',
            },
          }}
          artistPresence="disconnected"
        />
      );

      const stage = screen.getByLabelText('Sân khấu ảo Avatar 2D');
      expect(stage).toHaveAttribute('data-role', 'artist');
      expect(stage).toHaveAttribute('data-artist-presence', 'disconnected');
      expect(stage).toHaveAttribute('data-presence-truthful', 'true');

      // Graphic is frozen, disconnected notice displayed
      const graphic = screen.getByTestId('avatar-graphic');
      expect(graphic).toHaveAttribute('data-frozen', 'true');
      expect(screen.getByTestId('disconnected-stage-notice')).toBeInTheDocument();
      expect(screen.getByText(/Nghệ sĩ đã ngắt kết nối/i)).toBeInTheDocument();
      expect(screen.getByText(/không sử dụng AI để đóng giả/i)).toBeInTheDocument();
    });
  });

  describe('3. Wardrobe Customizer Live Preview vs. Saved State', () => {
    it('updates live preview box on accessory selection without triggering save until confirmed', () => {
      const onEquip = vi.fn();

      render(
        <WardrobeCustomizer
          equippedAccessoryId="earpiece_glow"
          onEquip={onEquip}
        />
      );

      // Initially equipped with earpiece
      expect(screen.getByTestId('equipped-badge-earpiece_glow')).toBeInTheDocument();
      expect(screen.getByTestId('preview-accessory-earpiece')).toBeInTheDocument();

      // Click Cyber Visor card to preview
      const visorCard = screen.getByTestId('accessory-card-visor_neon');
      fireEvent.click(visorCard);

      // Live preview box updates to visor
      expect(screen.getByTestId('preview-accessory-visor')).toBeInTheDocument();
      expect(screen.queryByTestId('preview-accessory-earpiece')).not.toBeInTheDocument();

      // But onEquip has NOT been called yet
      expect(onEquip).not.toHaveBeenCalled();

      // Click save button
      const saveBtn = screen.getByRole('button', { name: /Lưu lựa chọn 'Kính thực tế ảo Cyber'/i });
      fireEvent.click(saveBtn);

      expect(onEquip).toHaveBeenCalledWith('visor_neon');
      expect(screen.getByTestId('wardrobe-save-notice')).toBeInTheDocument();
    });
  });

  describe('4. Cross-Surface Consistency: "Đổi tủ đồ một lần, các màn thấy cùng một diện mạo"', () => {
    it('synchronizes equipped accessory across AppShell header, MyRoom diorama, and MyWorld profile', async () => {
      render(
        <MemoryRouter initialEntries={['/me']}>
          <AppProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/me" element={<MyWorldView />} />
              </Route>
            </Routes>
          </AppProvider>
        </MemoryRouter>
      );

      // 1. Initial State in AppShell Desktop Header
      const headerAvatar = screen.getByTestId('header-user-avatar');
      expect(headerAvatar).toBeInTheDocument();
      const headerRenderer = screen.getByTestId('header-avatar-renderer');
      expect(headerRenderer).toBeInTheDocument();
      expect(headerRenderer).toHaveAttribute('data-role', 'fan');
      expect(headerRenderer).toHaveAttribute('data-accessory', 'accessory_classic');

      // 2. Initial State in MyRoom Diorama Stage
      const roomAvatarBtn = screen.getByTestId('room-avatar-hotspot');
      expect(roomAvatarBtn).toBeInTheDocument();
      const roomRenderer = screen.getByTestId('room-avatar-renderer');
      expect(roomRenderer).toBeInTheDocument();
      expect(roomRenderer).toHaveAttribute('data-accessory', 'accessory_classic');
      expect(within(roomAvatarBtn).getByText(/Huy hiệu Ngôi sao Cổ điển/i)).toBeInTheDocument();

      // 3. Initial State in Wardrobe Cabinet Hotspot
      const wardrobeSpot = screen.getByTestId('room-wardrobe-hotspot');
      expect(wardrobeSpot).toHaveTextContent(/Đang mặc: Huy hiệu Ngôi sao Cổ điển/i);

      // 4. Initial State in Profile Header Avatar
      const profileAvatar = screen.getByTestId('profile-header-avatar');
      expect(profileAvatar).toBeInTheDocument();
      const profileRenderer = screen.getByTestId('profile-avatar-renderer');
      expect(profileRenderer).toHaveAttribute('data-accessory', 'accessory_classic');

      // 5. Open Wardrobe tab via hotspot
      fireEvent.click(wardrobeSpot);

      // Customizer is open
      expect(screen.getByTestId('wardrobe-customizer')).toBeInTheDocument();

      // Select 'Kính thực tế ảo Cyber' (visor_neon)
      const visorCard = screen.getByTestId('accessory-card-visor_neon');
      fireEvent.click(visorCard);

      // Save
      const saveBtn = screen.getByRole('button', { name: /Lưu lựa chọn 'Kính thực tế ảo Cyber'/i });
      fireEvent.click(saveBtn);

      // 6. VERIFY INSTANT CROSS-SURFACE SYNCHRONIZATION:
      // a) Header user avatar is now wearing cyber visor
      expect(headerRenderer).toHaveAttribute('data-accessory', 'visor_neon');

      // b) Room avatar is now wearing cyber visor
      expect(roomRenderer).toHaveAttribute('data-accessory', 'visor_neon');
      expect(within(roomAvatarBtn).getByText(/Kính thực tế ảo Cyber/i)).toBeInTheDocument();

      // c) Wardrobe hotspot shows cyber visor
      expect(wardrobeSpot).toHaveTextContent(/Đang mặc: Kính thực tế ảo Cyber/i);

      // d) Profile header avatar is now wearing cyber visor
      expect(profileRenderer).toHaveAttribute('data-accessory', 'visor_neon');
    });
  });
});
