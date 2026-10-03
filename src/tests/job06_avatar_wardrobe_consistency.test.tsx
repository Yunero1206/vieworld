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

import { render,screen } from '@testing-library/react';
import { describe,expect,it } from 'vitest';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { AvatarStage } from '../components/AvatarStage';
import { getAccessoryById,getAccessoryName,isFanAccessory } from '../world/assetManifest';

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
});
