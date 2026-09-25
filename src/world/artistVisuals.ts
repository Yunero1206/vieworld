import concertNight from '../assets/home/concert-night.png';
import miraCover from '../assets/home/mira-cover.jpg';
import kaiCover from '../assets/home/kai-cover.jpg';
import bTriptych from '../assets/explore-demo/artist-b-triptych.jpg';
import cTriptych from '../assets/explore-demo/artist-c-triptych.jpg';
import dTriptych from '../assets/explore-demo/artist-d-triptych.jpg';
import eTriptych from '../assets/explore-demo/artist-e-triptych.jpg';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const covers: Record<string, string> = {
  'artist-a': concertNight,
  'artist-mira': miraCover,
  'artist-kai': kaiCover,
  'artist-b': bTriptych,
  'artist-c': cTriptych,
  'artist-d': dTriptych,
  'artist-e': eTriptych,
  'neon-sessions': asset('images/neon-sessions-cover.jpg'),
};

const portraits: Record<string, { src: string; crop: 'portrait' | 'triptych' }> = {
  'artist-a': { src: asset('images/characters-v4/avatar-artist-a.webp'), crop: 'portrait' },
  'artist-mira': { src: asset('images/characters-v4/avatar-artist-mira.webp'), crop: 'portrait' },
  'artist-kai': { src: asset('images/characters-v4/avatar-artist-kai.webp'), crop: 'portrait' },
  'artist-b': { src: bTriptych, crop: 'triptych' },
  'artist-c': { src: cTriptych, crop: 'triptych' },
  'artist-d': { src: dTriptych, crop: 'triptych' },
  'artist-e': { src: eTriptych, crop: 'triptych' },
};

export function getArtistCover(artistId?: string) {
  return artistId ? covers[artistId] || concertNight : concertNight;
}

/** Unknown or unavailable artwork intentionally has no image; navigation supplies a text fallback. */
export function getArtistNavPortrait(artistId: string) {
  return portraits[artistId];
}
