import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorldScene } from '../components/WorldScene';
import { World, Session } from '../domain/types';

describe('Job 02 Acceptance: WorldScene 2.5D Graybox Diorama for Artist A', () => {
  const mockArtistWorld: World = {
    id: 'artist-a',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: '2026-09-10T00:00:00Z',
    type: 'artist',
    name: 'Artist A',
    description: 'Không gian âm nhạc mộc mạc và gần gũi.',
    linkedWorldIds: ['neon-sessions'],
  };

  const mockLinkedWorld: World = {
    id: 'neon-sessions',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: '2026-09-10T00:00:00Z',
    type: 'ip',
    name: 'Neon Sessions',
    description: 'Chương trình âm nhạc trực tiếp.',
    linkedWorldIds: ['artist-a'],
  };

  const mockRunningSession: Session = {
    id: 'session-artist-live-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: '2026-09-10T00:00:00Z',
    worldId: 'artist-a',
    title: 'Đêm nhạc Acoustic Trực Tiếp',
    format: 'concert',
    status: 'running',
    hostRole: 'artist',
    artistPresence: 'present',
    segmentMode: 'live',
    aiUse: 'none',
    replayStatus: 'available',
    scheduledStartTime: '2026-09-10T20:00:00Z',
    demo: true,
  };

  const mockScheduledSession: Session = {
    id: 'session-artist-sched-01',
    tenantId: 'vieworld-demo',
    version: 1,
    updatedAt: '2026-09-10T00:00:00Z',
    worldId: 'artist-a',
    title: 'Acoustic Weekend Chill',
    format: 'listening',
    status: 'scheduled',
    hostRole: 'artist',
    artistPresence: 'absent',
    segmentMode: 'recorded',
    aiUse: 'none',
    replayStatus: 'available',
    scheduledStartTime: '2026-09-12T19:00:00Z',
    demo: true,
  };

  it('1. Renders unified 2.5D graybox diorama without the old 5 vertical hero cards', () => {
    const handleOpenZone = vi.fn();

    const { container } = render(
      <MemoryRouter>
        <WorldScene
          world={mockArtistWorld}
          nextSession={mockRunningSession}
          sessionCount={4}
          benefitCount={3}
          productCount={2}
          linkedWorld={mockLinkedWorld}
          onOpenZone={handleOpenZone}
          fanDisplayName="An"
        />
      </MemoryRouter>
    );

    // Verify diorama container is present
    const diorama = container.querySelector('.world-diorama');
    expect(diorama).toBeInTheDocument();
    expect(diorama).toHaveClass('world-diorama--artist');

    // Verify old world-places-grid is NOT rendered
    expect(container.querySelector('.world-places-grid')).toBeNull();

    // Verify title uses dynamic data, no hardcoded "Linh"
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Nhà nhạc Artist A');
    expect(screen.queryByText(/Linh!/i)).toBeNull();
  });

  it('2. Features Sân khấu Trung tâm with DEMO badge adjacent to LIVE indicator', () => {
    const handleOpenZone = vi.fn();

    render(
      <MemoryRouter>
        <WorldScene
          world={mockArtistWorld}
          nextSession={mockRunningSession}
          sessionCount={4}
          benefitCount={3}
          productCount={2}
          onOpenZone={handleOpenZone}
        />
      </MemoryRouter>
    );

    // Sân khấu link with session title and direct ID
    const stageLink = screen.getByRole('link', { name: /Vào sân khấu: Đêm nhạc Acoustic Trực Tiếp/i });
    expect(stageLink).toBeInTheDocument();
    expect(stageLink).toHaveAttribute('href', '/sessions/session-artist-live-01');
    expect(stageLink).toHaveAttribute('id', 'scene-enter-session-session-artist-live-01');

    // Truthful badging: DEMO adjacent to LIVE
    expect(screen.getByText(/Đang diễn · LIVE/i)).toBeInTheDocument();
    expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);
  });

  it('3. Renders scheduled session with DEMO badge and handles empty session state', () => {
    const handleOpenZone = vi.fn();

    const { rerender } = render(
      <MemoryRouter>
        <WorldScene
          world={mockArtistWorld}
          nextSession={mockScheduledSession}
          sessionCount={4}
          benefitCount={3}
          productCount={2}
          onOpenZone={handleOpenZone}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Sắp diễn · DEMO/i)).toBeInTheDocument();

    // Rerender with no next session
    rerender(
      <MemoryRouter>
        <WorldScene
          world={mockArtistWorld}
          nextSession={undefined}
          sessionCount={0}
          benefitCount={0}
          productCount={0}
          onOpenZone={handleOpenZone}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Chưa có lịch diễn trực tiếp/i)).toBeInTheDocument();
    const stageButton = screen.getByRole('button', { name: /Xem danh sách lịch hẹn sân khấu/i });
    fireEvent.click(stageButton);
    expect(handleOpenZone).toHaveBeenCalledWith('sessions');
  });

  it('4. Interactive hotspots trigger corresponding zones and navigation', () => {
    const handleOpenZone = vi.fn();

    render(
      <MemoryRouter>
        <WorldScene
          world={mockArtistWorld}
          nextSession={mockRunningSession}
          sessionCount={5}
          benefitCount={3}
          productCount={7}
          linkedWorld={mockLinkedWorld}
          onOpenZone={handleOpenZone}
        />
      </MemoryRouter>
    );

    // Hotspot 2: Máy đĩa than (Góc nghe nhạc)
    const musicSpot = screen.getByRole('button', { name: /Mở góc nghe nhạc máy đĩa than/i });
    expect(musicSpot).toBeInTheDocument();
    fireEvent.click(musicSpot);
    expect(handleOpenZone).toHaveBeenCalledWith('listening');

    // Hotspot 3: Bảng lưu diễn (Ký ức & replay)
    const archiveSpot = screen.getByRole('button', { name: /Mở bảng lưu diễn và xem lại ký ức replay/i });
    expect(archiveSpot).toBeInTheDocument();
    fireEvent.click(archiveSpot);
    expect(handleOpenZone).toHaveBeenCalledWith('archive');

    // Hotspot 4: Quầy Hội Quán
    const membershipSpot = screen.getByRole('button', { name: /Mở quầy Hội Quán fandom/i });
    expect(membershipSpot).toBeInTheDocument();
    fireEvent.click(membershipSpot);
    expect(handleOpenZone).toHaveBeenCalledWith('membership');

    // Hotspot 5: Tiệm VieSHOP link
    const shopLink = screen.getByRole('link', { name: /Vào tiệm quà VieSHOP/i });
    expect(shopLink).toHaveAttribute('href', '/worlds/artist-a/shop');

    // Cổng du hành sang linked world
    const portalLink = screen.getByRole('link', { name: /Đi qua cổng không gian sang Neon Sessions/i });
    expect(portalLink).toHaveAttribute('href', '/worlds/neon-sessions');
  });

  it('5. Text shortcuts bar guarantees direct keyboard access to all venue areas (Bible Rule 4)', () => {
    const handleOpenZone = vi.fn();

    render(
      <MemoryRouter>
        <WorldScene
          world={mockArtistWorld}
          nextSession={mockRunningSession}
          sessionCount={5}
          benefitCount={3}
          productCount={7}
          linkedWorld={mockLinkedWorld}
          onOpenZone={handleOpenZone}
        />
      </MemoryRouter>
    );

    const shortcutsNav = screen.getByRole('navigation', { name: /Lối tắt các khu vực trong nhà nhạc/i });
    expect(shortcutsNav).toBeInTheDocument();

    // Verify all shortcut buttons / links
    const shortcutStage = screen.getByRole('link', { name: /Lối tắt: Vào sân khấu/i });
    expect(shortcutStage).toHaveAttribute('href', '/sessions/session-artist-live-01');

    const shortcutMusic = screen.getByRole('button', { name: /Lối tắt: Máy đĩa than/i });
    fireEvent.click(shortcutMusic);
    expect(handleOpenZone).toHaveBeenCalledWith('listening');

    const shortcutArchive = screen.getByRole('button', { name: /Lối tắt: Bảng lưu diễn/i });
    fireEvent.click(shortcutArchive);
    expect(handleOpenZone).toHaveBeenCalledWith('archive');

    const shortcutMembership = screen.getByRole('button', { name: /Lối tắt: Quầy Hội Quán/i });
    fireEvent.click(shortcutMembership);
    expect(handleOpenZone).toHaveBeenCalledWith('membership');

    const shortcutShop = screen.getByRole('link', { name: /Lối tắt: Tiệm quà VieSHOP/i });
    expect(shortcutShop).toHaveAttribute('href', '/worlds/artist-a/shop');

    const shortcutPortal = screen.getByRole('link', { name: /Lối tắt: Du hành sang Neon Sessions/i });
    expect(shortcutPortal).toHaveAttribute('href', '/worlds/neon-sessions');
  });
});
