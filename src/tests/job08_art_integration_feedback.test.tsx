import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import fs from 'fs';
import path from 'path';

import { WorldScene } from '../components/WorldScene';
import { MyRoomScene } from '../components/MyRoomScene';
import { CallSampleCueBar } from '../components/CallSampleCueBar';
import { CallSampleCue } from '../domain/types';
import { CANONICAL_WORLDS, CANONICAL_SESSIONS } from '../data/fixtures';

describe('Job 08: Art Integration & Responsive Micro-Feedback', () => {
  const mockArtistWorld = CANONICAL_WORLDS['artist-a'];
  const mockIpWorld = CANONICAL_WORLDS['neon-sessions'];
  const mockSession = {
    ...CANONICAL_SESSIONS['session-house-01'],
    status: 'running' as const,
    title: 'Acoustic Sunset Live',
  };

  const mockCues: CallSampleCue[] = [
    {
      id: 'cue-01',
      cueText: 'VI-E-WORLD!',
      prompt: 'Hô vang tên cộng đồng cùng nghệ sĩ tại nhịp dạo đầu!',
      actionLabel: 'Hô vang: VIEWORLD',
    },
    {
      id: 'cue-03',
      cueText: 'LIGHTSTICK XANH!',
      prompt: 'Bật và vẫy lightstick ảo theo nhịp trống dồn!',
      actionLabel: 'Vẫy lightstick ảo',
    },
  ];

  /* -------------------------------------------------------------------------- */
  /* Test 1: WorldScene Artwork Integration & Graceful Error Fallback           */
  /* -------------------------------------------------------------------------- */
  describe('WorldScene Artwork Integration', () => {
    it('renders approved 2.5D backdrop artwork for artist world with HTML labels separated', () => {
      const handleOpenZone = vi.fn();

      render(
        <MemoryRouter>
          <WorldScene
            world={mockArtistWorld}
            nextSession={mockSession}
            sessionCount={3}
            benefitCount={2}
            productCount={4}
            onOpenZone={handleOpenZone}
          />
        </MemoryRouter>
      );

      // Artwork image exists with approved path
      const artwork = screen.getByTestId('world-backdrop-artwork');
      expect(artwork).toBeInTheDocument();
      expect(artwork).toHaveAttribute('src', '/images/world-redesign/drafts/artist-a-scene-sample.png');
      expect(artwork).toHaveClass('diorama-backdrop-artwork');

      // HTML/CSS labels remain rendered as code, NOT baked into artwork
      expect(screen.getByText('Nhà nhạc Artist A')).toBeInTheDocument();
      expect(screen.getByText('Khu vực 01 · Sân khấu trung tâm')).toBeInTheDocument();
      expect(screen.getByText('Acoustic Sunset Live')).toBeInTheDocument();
      expect(screen.getByText('Đang diễn · LIVE')).toBeInTheDocument();
      expect(screen.getByText('DEMO')).toBeInTheDocument();

      // All 4 interactive spots exist with HTML accessibility attributes
      expect(document.getElementById('diorama-spot-music')).toBeInTheDocument();
      expect(document.getElementById('diorama-spot-archive')).toBeInTheDocument();
      expect(document.getElementById('diorama-spot-membership')).toBeInTheDocument();
      expect(document.getElementById('diorama-spot-shop')).toBeInTheDocument();
    });

    it('gracefully falls back to CSS diorama graybox when artwork fails to load (onError)', () => {
      const handleOpenZone = vi.fn();

      render(
        <MemoryRouter>
          <WorldScene
            world={mockArtistWorld}
            nextSession={mockSession}
            sessionCount={3}
            benefitCount={2}
            productCount={4}
            onOpenZone={handleOpenZone}
          />
        </MemoryRouter>
      );

      const artwork = screen.getByTestId('world-backdrop-artwork');
      expect(artwork).toBeInTheDocument();

      // Simulate image failure
      fireEvent.error(artwork);

      // Artwork is cleanly unmounted
      expect(screen.queryByTestId('world-backdrop-artwork')).toBeNull();

      // Interactive diorama graybox and spots remain 100% operational
      const musicSpot = document.getElementById('diorama-spot-music')!;
      expect(musicSpot).toBeInTheDocument();
      fireEvent.click(musicSpot);
      expect(handleOpenZone).toHaveBeenCalledWith('listening');
    });

    it('does not render acoustic backdrop artwork for non-artist (IP) worlds', () => {
      const handleOpenZone = vi.fn();

      render(
        <MemoryRouter>
          <WorldScene
            world={mockIpWorld}
            sessionCount={2}
            benefitCount={1}
            productCount={3}
            onOpenZone={handleOpenZone}
          />
        </MemoryRouter>
      );

      // IP world should not render Artist A acoustic scene artwork
      expect(screen.queryByTestId('world-backdrop-artwork')).toBeNull();
      expect(screen.getByText('Neon Sessions')).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Test 2: MyRoomScene Artwork Integration & Fallback                         */
  /* -------------------------------------------------------------------------- */
  describe('MyRoomScene Artwork Integration', () => {
    it('renders approved 2.5D matte-clay fan room artwork with HTML hotspots preserved', () => {
      const handleOpenSection = vi.fn();
      const handleSlotClick = vi.fn();

      render(
        <MyRoomScene
          displayName="Minh Fan"
          accessoryName="Classic Star Badge"
          capsuleCount={2}
          benefitCount={1}
          orderCount={0}
          supportCount={0}
          upcomingCount={3}
          showcaseSlots={[
            { id: 'cap-1', title: 'Kỷ niệm #1' },
            null,
            null,
          ]}
          onSlotClick={handleSlotClick}
          onOpenSection={handleOpenSection}
        />
      );

      // Room backdrop image is rendered
      const artwork = screen.getByTestId('room-backdrop-artwork');
      expect(artwork).toBeInTheDocument();
      expect(artwork).toHaveAttribute('src', '/images/world-redesign/drafts/fan-room-scene-sample.png');
      expect(artwork).toHaveClass('room-backdrop-artwork');

      // Hotspots remain live HTML elements with full accessibility
      const calendarHotspot = screen.getByTestId('room-calendar-hotspot');
      expect(calendarHotspot).toBeInTheDocument();
      fireEvent.click(calendarHotspot);
      expect(handleOpenSection).toHaveBeenCalledWith('follows');

      // 3-slot showcase shelf remains live HTML
      expect(screen.getByTestId('room-shelf-hotspot')).toBeInTheDocument();
      expect(screen.getByTestId('shelf-slot-1')).toBeInTheDocument();
      expect(screen.getByTestId('shelf-slot-2')).toBeInTheDocument();
      expect(screen.getByTestId('shelf-slot-3')).toBeInTheDocument();

      // Wardrobe hotspot remains live HTML
      const wardrobeHotspot = screen.getByTestId('room-wardrobe-hotspot');
      expect(wardrobeHotspot).toBeInTheDocument();
      fireEvent.click(wardrobeHotspot);
      expect(handleOpenSection).toHaveBeenCalledWith('wardrobe');
    });

    it('gracefully falls back to CSS diorama window when room artwork errors out', () => {
      const handleOpenSection = vi.fn();

      render(
        <MyRoomScene
          displayName="Minh Fan"
          capsuleCount={1}
          benefitCount={1}
          orderCount={0}
          supportCount={0}
          upcomingCount={0}
          onOpenSection={handleOpenSection}
        />
      );

      const artwork = screen.getByTestId('room-backdrop-artwork');
      expect(artwork).toBeInTheDocument();

      // Trigger error
      fireEvent.error(artwork);

      // Artwork unmounts gracefully
      expect(screen.queryByTestId('room-backdrop-artwork')).toBeNull();

      // Calendar hotspot and wardrobe still clickable
      const wardrobeHotspot = screen.getByTestId('room-wardrobe-hotspot');
      expect(wardrobeHotspot).toBeInTheDocument();
      fireEvent.click(wardrobeHotspot);
      expect(handleOpenSection).toHaveBeenCalledWith('wardrobe');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Test 3: Local Lightstick Interaction & Truthful Invariants                */
  /* -------------------------------------------------------------------------- */
  describe('Local Lightstick & Call Sample Cues', () => {
    it('provides local visual feedback on lightstick trigger without fake crowd or capsule awards', () => {
      render(<CallSampleCueBar cues={mockCues} />);

      // Verify disclaimers exist
      const cueDisclaimer = screen.getByTestId('call-sample-cue-disclaimer');
      expect(cueDisclaimer).toHaveTextContent(/mô phỏng hiệu ứng tương tác cục bộ/i);
      expect(cueDisclaimer).toHaveTextContent(/không đồng bộ âm thanh webrtc/i);

      const lightstickDisclaimer = screen.getByTestId('lightstick-disclaimer');
      expect(lightstickDisclaimer).toHaveTextContent(/tuyệt đối không làm tăng số lượng khán giả ảo/i);
      expect(lightstickDisclaimer).toHaveTextContent(/không tự động cấp capsule/i);

      // Trigger lightstick cue
      const lightstickBtn = screen.getByTestId('trigger-cue-cue-03');
      expect(lightstickBtn).toHaveClass('cue-button--lightstick');
      fireEvent.click(lightstickBtn);

      // Feedback message confirms local scope
      const feedback = screen.getByTestId('cue-feedback-message');
      expect(feedback).toHaveTextContent(/đang vẫy lightstick ảo/i);
      expect(feedback).toHaveTextContent(/không tăng số lượng khán giả/i);

      // Active lightstick pulse badge is displayed
      const activePulse = screen.getByTestId('lightstick-local-feedback');
      expect(activePulse).toBeInTheDocument();
      expect(activePulse).toHaveTextContent(/chỉ hiển thị trên màn hình của bạn/i);
    });

    it('triggers standard cue feedback for non-lightstick chants', () => {
      render(<CallSampleCueBar cues={mockCues} />);

      const chantBtn = screen.getByTestId('trigger-cue-cue-01');
      fireEvent.click(chantBtn);

      const feedback = screen.getByTestId('cue-feedback-message');
      expect(feedback).toHaveTextContent(/bạn vừa hưởng ứng: "VI-E-WORLD!"/i);
      expect(feedback).toHaveTextContent(/mô phỏng hiệu ứng cục bộ/i);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Test 4: Reduced Motion & Tactile Micro-Interactions in CSS                 */
  /* -------------------------------------------------------------------------- */
  describe('CSS Micro-Interactions & Reduced Motion Rules', () => {
    it('contains prefers-reduced-motion media query guarding artwork, animations, and hotspots', () => {
      const cssContent = fs.readFileSync(path.resolve(__dirname, '../index.css'), 'utf-8');

      // Verifies reduced motion rules disable animations and transitions
      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(cssContent).toContain('.diorama-backdrop-artwork');
      expect(cssContent).toContain('.room-backdrop-artwork');
      expect(cssContent).toContain('.lightstick-active-badge');
      expect(cssContent).toContain('.avatar-renderer');

      // Verifies tactile micro-interaction active states
      expect(cssContent).toContain('.diorama-spot:active');
      expect(cssContent).toContain('.room-spot:active');
      expect(cssContent).toContain('transform: scale(0.98)');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Test 5: Asset Manifest & File Size Compliance (< 1.5 MB scene target)       */
  /* -------------------------------------------------------------------------- */
  describe('Asset Manifest & Bundle Size Audit', () => {
    it('verifies all integrated scene assets are registered in manifest.json with status approved', () => {
      const manifestPath = path.resolve(__dirname, '../../static/images/world-redesign/drafts/manifest.json');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest.globalStatus).toBe('APPROVED');

      const assetIds = manifest.assets.map((a: { id: string }) => a.id);
      expect(assetIds).toContain('artist-a-scene-sample');
      expect(assetIds).toContain('fan-room-scene-sample');

      const artistScene = manifest.assets.find((a: { id: string }) => a.id === 'artist-a-scene-sample');
      expect(artistScene.status).toBe('approved');
      expect(artistScene.constitutionalChecks.noPeopleOrCrowd).toBe(true);
      expect(artistScene.constitutionalChecks.noBakedLiveStatus).toBe(true);
      expect(artistScene.constitutionalChecks.noTextOrLabels).toBe(true);

      const fanRoom = manifest.assets.find((a: { id: string }) => a.id === 'fan-room-scene-sample');
      expect(fanRoom.status).toBe('approved');
      expect(fanRoom.constitutionalChecks.noPeopleOrCrowd).toBe(true);
      expect(fanRoom.constitutionalChecks.noTextOrLabels).toBe(true);
    });

    it('verifies actual file sizes of integrated assets are well below 1.5 MB', () => {
      const artistScenePath = path.resolve(__dirname, '../../static/images/world-redesign/drafts/artist-a-scene-sample.png');
      const fanRoomPath = path.resolve(__dirname, '../../static/images/world-redesign/drafts/fan-room-scene-sample.png');

      expect(fs.existsSync(artistScenePath)).toBe(true);
      expect(fs.existsSync(fanRoomPath)).toBe(true);

      const artistSceneSize = fs.statSync(artistScenePath).size;
      const fanRoomSize = fs.statSync(fanRoomPath).size;
      const totalSize = artistSceneSize + fanRoomSize;

      // Both files must be individually under 600 KB and combined under 1.5 MB (1,572,864 bytes)
      expect(artistSceneSize).toBeLessThan(600 * 1024);
      expect(fanRoomSize).toBeLessThan(600 * 1024);
      expect(totalSize).toBeLessThan(1500 * 1024);

      // Log sizes for documentation transparency
      console.log(`[Job 08 Asset Audit] artist-a-scene-sample.png: ${(artistSceneSize / 1024).toFixed(1)} KB`);
      console.log(`[Job 08 Asset Audit] fan-room-scene-sample.png: ${(fanRoomSize / 1024).toFixed(1)} KB`);
      console.log(`[Job 08 Asset Audit] Total background bundle size: ${(totalSize / 1024).toFixed(1)} KB (< 1.5 MB target)`);
    });
  });
});
