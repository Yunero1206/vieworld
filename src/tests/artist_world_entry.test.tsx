import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { FanShell } from '../components/FanShell';
import { ArtistWorldView } from '../views/ArtistWorldView';
import { ExploreView } from '../views/ExploreView';

function mount(path: string) {
  return render(<AppProvider><MemoryRouter initialEntries={[path]}><Routes><Route element={<FanShell />}>
    <Route path="/" element={<p>Home</p>} />
    <Route path="/explore" element={<ExploreView />} />
    <Route path="/artist/:artistId" element={<ArtistWorldView />} />
    <Route path="/artist/:artistId/hall" element={<ArtistWorldView />} />
    <Route path="/artist/:artistId/archive" element={<ArtistWorldView />} />
  </Route></Routes></MemoryRouter></AppProvider>);
}

describe('Artist World entry boundary', () => {
  beforeEach(() => localStorage.clear());

  it('keeps a persistent artist slot between Explore and My Space', () => {
    mount('/artist/artist-a');
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    const labels = within(nav).getAllByRole('link').map(link => link.getAttribute('aria-label'));
    expect(labels).toEqual(['Home', 'Explore', 'World của Artist A', 'My Space', 'VieSHOP']);
    expect(within(nav).getByRole('link', { name: 'World của Artist A' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).queryByRole('link', { name: 'Moments' })).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Trong world của Artist A' })).toBeInTheDocument();
  });

  it('opens Hall rooms and a chronological Archive under the same artist shell', () => {
    const hall = mount('/artist/artist-a/hall');
    expect(screen.getByRole('heading', { name: 'Đang tụ lại' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /^Trò chuyện trong / })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Phòng chung/ }));
    expect(screen.getByRole('region', { name: 'Trò chuyện trong Phòng chung' })).toBeInTheDocument();
    hall.unmount();
    mount('/artist/artist-a/archive');
    expect(screen.getByRole('heading', { name: '2026' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '2025' })).toBeInTheDocument();
  });

  it('keeps Hall conversations member-only while showing the room structure to visitors', () => {
    mount('/artist/artist-b/hall');
    expect(screen.getByRole('heading', { name: 'Đang tụ lại' })).toBeInTheDocument();
    expect(screen.getByText(/Cuộc trò chuyện chỉ dành cho hội viên/)).toBeInTheDocument();
    expect(screen.queryByRole('log', { name: 'Tin nhắn trong Hall' })).not.toBeInTheDocument();
  });

  it('uses top-shell search and never exposes unconsented fan voices in Explore', () => {
    mount('/');
    const input = screen.getByRole('combobox', { name: 'Tìm nghệ sĩ, world, sự kiện, capsule' });
    fireEvent.change(input, { target: { value: 'artist a' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByRole('heading', { name: /Nổi bật/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vào world của Artist A' })).toHaveAttribute('href', '/artist/artist-a');
    expect(screen.getByText(/Nay nghe setlist vậy/)).toBeInTheDocument();
    expect(screen.queryByText(/chỉ hiện khi người viết đồng ý/)).not.toBeInTheDocument();
  });
});
