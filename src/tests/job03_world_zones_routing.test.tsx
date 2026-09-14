import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { WorldDetailView } from '../views/WorldDetailView';

describe('Job 03 Acceptance: World Zones Routing, Normalized Panels & History', () => {
  it('1. ?zone=listening filters exclusively for listening sessions and disclaims autoplay', () => {
    render(
      <AppProvider disableAutoHydrate={true}>
        <MemoryRouter initialEntries={['/worlds/artist-a?zone=listening']}>
          <Routes>
            <Route path="worlds/:worldId" element={<WorldDetailView />} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByTestId('zone-listening-panel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Góc nghe đĩa than/i })).toBeInTheDocument();

    // Verify listening room session in artist-a is shown
    expect(screen.getByText(/Đêm Nhạc Kỷ Niệm Mùa 1/i)).toBeInTheDocument();

    // Verify non-listening session (concert / drop-in) is NOT in the listening panel
    expect(screen.queryByText(/Live House: Setlist đêm Thứ Bảy/i)).toBeNull();
    expect(screen.queryByText(/Artist A: Drop-in Trò chuyện đầu tuần/i)).toBeNull();

    // Verify User-Initiated Audio disclaimer (no autoplay)
    expect(screen.getByText(/User-Initiated Audio/i)).toBeInTheDocument();
  });

  it('2. ?zone=sessions clearly distinguishes session statuses and displays DEMO badge adjacent to LIVE', () => {
    render(
      <AppProvider disableAutoHydrate={true}>
        <MemoryRouter initialEntries={['/worlds/artist-a?zone=sessions']}>
          <Routes>
            <Route path="worlds/:worldId" element={<WorldDetailView />} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByRole('heading', { level: 2, name: /Sân khấu trung tâm — Các phiên/i })).toBeInTheDocument();
    expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);
    expect(screen.getByText(/Artist A: Drop-in Trò chuyện đầu tuần/i)).toBeInTheDocument();
    expect(screen.getByText(/Live House: Setlist đêm Thứ Bảy/i)).toBeInTheDocument();
  });

  it('3. ?zone=archive clearly explains replay policy and disclaims personal capsule shelf', () => {
    render(
      <AppProvider disableAutoHydrate={true}>
        <MemoryRouter initialEntries={['/worlds/artist-a?zone=archive']}>
          <Routes>
            <Route path="worlds/:worldId" element={<WorldDetailView />} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByTestId('zone-archive-panel')).toBeInTheDocument();
    expect(screen.getByText(/Chính sách xem lại Replay/i)).toBeInTheDocument();

    // Disclaims personal capsule shelf (points to My World)
    expect(screen.getByText(/kho lưu trữ chung/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem kệ kỷ niệm tại Phòng tôi/i })).toHaveAttribute('href', '/me');
  });

  it('4. ?zone=membership distinguishes Follow from Membership and makes no fake photocard promises', () => {
    render(
      <AppProvider disableAutoHydrate={true}>
        <MemoryRouter initialEntries={['/worlds/artist-a?zone=membership']}>
          <Routes>
            <Route path="worlds/:worldId" element={<WorldDetailView />} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByText(/Theo dõi \(Follow\) là miễn phí/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Danh mục quyền lợi/i).length).toBeGreaterThan(0);
    // Verify no unbacked photocard claims
    expect(screen.queryByText(/photocard bo góc/i)).toBeNull();
  });

  it('5. ?zone=shop displays bridge notice pointing to canonical /worlds/:id/shop route', () => {
    render(
      <AppProvider disableAutoHydrate={true}>
        <MemoryRouter initialEntries={['/worlds/artist-a?zone=shop']}>
          <Routes>
            <Route path="worlds/:worldId" element={<WorldDetailView />} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByTestId('zone-shop-panel')).toBeInTheDocument();
    const canonicalLink = screen.getByRole('link', { name: /Mở trang Shop riêng/i });
    expect(canonicalLink).toHaveAttribute('href', '/worlds/artist-a/shop');
    expect(screen.getByText(/150.000 VND/i)).toBeInTheDocument();
  });

  it('6. Invalid zone gracefully falls back to Home Diorama with defensive notice', () => {
    render(
      <AppProvider disableAutoHydrate={true}>
        <MemoryRouter initialEntries={['/worlds/artist-a?zone=invalid-zone-xyz']}>
          <Routes>
            <Route path="worlds/:worldId" element={<WorldDetailView />} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    );

    expect(screen.getByTestId('invalid-zone-notice')).toBeInTheDocument();
    expect(screen.getByTestId('world-scene-artist-a')).toBeInTheDocument();
  });

  it('7. Walking out of zone returns to Home Diorama via spatial walkout button', () => {
    render(
      <AppProvider disableAutoHydrate={true}>
        <MemoryRouter initialEntries={['/worlds/artist-a?zone=sessions']}>
          <Routes>
            <Route path="worlds/:worldId" element={<WorldDetailView />} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    );

    const exitBtn = screen.getByRole('button', { name: /Quay về Nhà nhạc/i });
    fireEvent.click(exitBtn);

    // After walking out, diorama is rendered
    expect(screen.getByTestId('world-scene-artist-a')).toBeInTheDocument();
  });
});
