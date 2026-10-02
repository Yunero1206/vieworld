import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { ArtistGalleryView } from '../views/ArtistGalleryView';
import { FanWorldView } from '../views/FanWorldView';
import { WorldPlazaView } from '../views/WorldPlazaView';
import { AvatarRenderer } from '../components/AvatarRenderer';
import { createInitialState } from '../data/fixtures';
import { saveState } from '../services/storageAdapter';
import { panelRoute, PANEL_HOME } from '../world/places';
function mount(path:string){return render(<AppProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/" element={<WorldPlazaView/>}/><Route path="/artists" element={<ArtistGalleryView/>}/><Route path="/moments" element={<FanWorldView/>}/><Route path="/archive" element={<FanWorldView/>}/><Route path="/worlds/:worldId" element={<FanWorldView/>}/><Route path="/me" element={<FanWorldView/>}/></Routes></MemoryRouter></AppProvider>);}
describe('World v4 consistency',()=>{
 beforeEach(()=>{localStorage.clear();saveState(createInitialState());});

 it('treats Neon Sessions as a program, not a standalone Artist World',()=>{const {container}=mount('/artists?q=neon');expect(container.querySelector('[data-world="neon-sessions"]')).toBeNull();expect(screen.queryByRole('link',{name:'Vào world của Neon Sessions'})).not.toBeInTheDocument();});




 it('maps cross-place actions to one feature owner',()=>{expect(PANEL_HOME.wardrobe).toBe('myspace');expect(panelRoute('capsules','neon-sessions')).toBe('/me?panel=capsules&section=collection');expect(panelRoute('concerts','artist-a')).toBe('/artist/artist-a');expect(panelRoute('news','artist-a')).toBe('/artist/artist-a');expect(panelRoute('hall','artist-a')).toBe('/artist/artist-a/hall');});

 it('uses canonical artist artwork for every artist identity',()=>{const {container,rerender}=render(<AvatarRenderer role="artist" artistId="artist-a"/>);expect(container.querySelector('img')).toHaveAttribute('src','/images/characters-v4/artist-a.png');rerender(<AvatarRenderer role="artist" artistId="artist-mira"/>);expect(container.querySelector('img')).toHaveAttribute('src','/images/characters-v4/artist-mira.png');rerender(<AvatarRenderer role="artist" artistId="artist-kai"/>);expect(container.querySelector('img')).toHaveAttribute('src','/images/characters-v4/artist-kai.png');rerender(<AvatarRenderer role="artist" artistId="neon-sessions"/>);expect(container.querySelector('img')).toHaveAttribute('src','/images/characters-v4/avatar-neon-sessions.webp');});
});
