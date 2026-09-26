import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createInitialState } from '../data/fixtures';
import { getCurrentArtistId, setCurrentArtistId } from '../world/currentArtist';
import { ArtistNavAvatar, GlobalNavigation } from '../components/GlobalNavigation';
import { getArtistCover } from '../world/artistVisuals';

describe('Current Artist navigation context', () => {
  beforeEach(() => localStorage.clear());

  it('chooses from featured artists once for an account without follows, then persists it', () => {
    const state = createInitialState('vieworld-demo');
    state.followedWorldIds = [];
    state.fanProfile.worldJourney = { visitedWorldIds: [], readNoteIds: [] };
    const random = vi.spyOn(Math, 'random').mockReturnValueOnce(0.99).mockReturnValueOnce(0);
    const first = getCurrentArtistId(state);
    expect(first).toBe('artist-b');
    expect(getCurrentArtistId(state)).toBe(first);
    expect(random).toHaveBeenCalledTimes(1);
    random.mockRestore();
  });

  it('keeps the last visited artist after leaving their world', () => {
    const state = createInitialState('vieworld-demo');
    expect(getCurrentArtistId(state)).toBe('artist-a');
    setCurrentArtistId(state, 'artist-b');
    expect(getCurrentArtistId(state)).toBe('artist-b');
    setCurrentArtistId(state, 'neon-sessions');
    expect(getCurrentArtistId(state)).toBe('artist-b');
  });

  it('keeps navigation usable before an artist is available', () => {
    render(<MemoryRouter><GlobalNavigation pathname="/explore" /></MemoryRouter>);
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getAllByRole('link').map(link => link.textContent)).toEqual(['Home', 'Explore', 'My Space', 'VieSHOP']);
  });

  it('keeps utility controls in the same desktop rail even without an artist', () => {
    render(<MemoryRouter><GlobalNavigation pathname="/" utilities={<button>Giao diện tối</button>} /></MemoryRouter>);
    const rail = document.querySelector('.fw-navigation-rail')!;
    expect(within(rail as HTMLElement).getByRole('navigation', { name: 'Điều hướng chính' })).toBeInTheDocument();
    expect(within(rail as HTMLElement).getByRole('button', { name: 'Giao diện tối' })).toBeInTheDocument();
  });

  it('uses a visible initial when artist artwork is absent or fails', () => {
    const { rerender } = render(<ArtistNavAvatar artist={{ id: 'missing-artist', name: 'Artist Z' }} />);
    expect(document.querySelector('.fw-artist-avatar')).toHaveAttribute('data-initial', 'A');
    rerender(<ArtistNavAvatar artist={{ id: 'artist-a', name: 'Artist A' }} />);
    const image = document.querySelector<HTMLImageElement>('.fw-artist-avatar img');
    expect(image).toBeInTheDocument();
    fireEvent.error(image!);
    expect(document.querySelector('.fw-artist-avatar img')).not.toBeInTheDocument();
    expect(document.querySelector('.fw-artist-avatar')).toHaveAttribute('data-initial', 'A');
  });

  it('keeps cover artwork specific to the current artist', () => {
    expect(getArtistCover('artist-b')).not.toBe(getArtistCover('artist-a'));
  });
});
