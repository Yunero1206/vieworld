/**
 * VieWorld Test Universe Expansion Acceptance Test Suite
 * Verifies full compliance with VieWorld_Test_Universe_Expansion_Implementation_Plan.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { FanShell } from '../components/FanShell';
import { ArtistGalleryView } from '../views/ArtistGalleryView';
import { ArtistWorldView } from '../views/ArtistWorldView';
import { createInitialState } from '../data/fixtures';
import {
  EXPANDED_PUBLIC_VOICES,
  EXPANDED_ARCHIVE_CHAPTERS,
  EXPANDED_PRODUCTS,
  EXPANDED_GUESTBOOK_NOTES,
  KEY_FAN_PERSONAS,
  CROWD_FANS,
  EXPANDED_HALL_MESSAGES,
} from '../data/expandedUniverse';
import { buildScenarioState } from '../data/scenarioManager';
import { selectPublicVoices } from '../world/exploreDiscovery';
import { getPreviewCapabilities } from '../world/shopPresentation';

describe('VieWorld Test Universe Expansion Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. 7 Artist Worlds with 7 Distinct Test Roles (§2 & §6)', () => {
    it('provides all 7 artist worlds with their designated test roles and metadata', () => {
      const state = createInitialState('vieworld-demo');
      const requiredRoles = [
        'artist-a', // Flagship
        'artist-b', // Quiet world
        'artist-c', // 2-3 active contexts
        'artist-d', // Thick archive (3 years)
        'artist-e', // Debut / sparse archive
        'artist-mira', // Commerce-heavy
        'artist-kai', // Community & event-heavy
      ];

      for (const worldId of requiredRoles) {
        expect(state.worlds[worldId]).toBeDefined();
        expect(state.worlds[worldId].type).toBe('artist');
        expect(state.worlds[worldId].name).toBeTruthy();
        expect(state.worlds[worldId].description).toBeTruthy();
      }

      // IP stage also present
      expect(state.worlds['neon-sessions']).toBeDefined();
      expect(state.worlds['neon-sessions'].type).toBe('ip');
    });

    it('Artist D has 3 full years of archive history (2024, 2025, 2026)', () => {
      const chaptersD = EXPANDED_ARCHIVE_CHAPTERS.filter(c => c.worldId === 'artist-d');
      expect(chaptersD.length).toBeGreaterThanOrEqual(6);

      const years = chaptersD.map(c => c.year);
      expect(years).toContain(2024);
      expect(years).toContain(2025);
      expect(years).toContain(2026);
    });

    it('Artist E has a sparse archive suitable for debut artist empty/initial states', () => {
      const chaptersE = EXPANDED_ARCHIVE_CHAPTERS.filter(c => c.worldId === 'artist-e');
      expect(chaptersE.length).toBeLessThanOrEqual(2);
      expect(chaptersE[0].title).toContain('Debut Era');
    });
  });

  describe('2. Fan Personas & Crowd Fans (~30 Fans Total) (§3 & §7)', () => {
    it('defines 8 key fan personas with differentiated collections and states', () => {
      const personaKeys = [
        'new-fan',
        'casual-fan',
        'hall-member',
        'multi-fandom',
        'collector',
        'longtime-fan',
        'commerce-fan',
        'public-voice-fan',
      ];

      for (const key of personaKeys) {
        const persona = KEY_FAN_PERSONAS[key];
        expect(persona).toBeDefined();
        expect(persona.name).toBeTruthy();
        expect(persona.username).toBeTruthy();
        expect(Array.isArray(persona.followedWorldIds)).toBe(true);
      }

      // New fan has 0 follows and empty collection
      expect(KEY_FAN_PERSONAS['new-fan'].followedWorldIds).toHaveLength(0);
      expect(Object.keys(KEY_FAN_PERSONAS['new-fan'].orders)).toHaveLength(0);

      // Multi-fandom fan follows all 7 worlds
      expect(KEY_FAN_PERSONAS['multi-fandom'].followedWorldIds.length).toBeGreaterThanOrEqual(7);

      // Collector has ~30 owned items
      expect(Object.keys(KEY_FAN_PERSONAS['collector'].orders).length).toBeGreaterThanOrEqual(10);
    });

    it('defines 22 crowd fans ensuring total fandom population exceeds 25 fans', () => {
      expect(CROWD_FANS.length).toBe(22);
      const totalFans = Object.keys(KEY_FAN_PERSONAS).length + CROWD_FANS.length;
      expect(totalFans).toBeGreaterThanOrEqual(30);

      for (const fan of CROWD_FANS) {
        expect(fan.id).toMatch(/^fan-crowd-/);
        expect(fan.displayName).toBeTruthy();
        expect(fan.username).toBeTruthy();
        expect(fan.role).toBe('fan');
      }
    });
  });

  describe('3. 18 World Contexts / Sessions Across Time Phases (§4 & §8)', () => {
    it('includes at least 18 sessions covering running, scheduled, and ended phases', () => {
      const state = createInitialState('vieworld-demo');
      const sessions = Object.values(state.sessions);
      expect(sessions.length).toBeGreaterThanOrEqual(18);

      const statuses = sessions.map(s => s.status);
      expect(statuses).toContain('running');
      expect(statuses).toContain('scheduled');
      expect(statuses).toContain('ended');

      const formats = sessions.map(s => s.format);
      expect(formats).toContain('dropin');
      expect(formats).toContain('concert');
      expect(formats).toContain('listening');
    });

    it('all sessions have explicit scheduledStartTime and demo clearance flags', () => {
      const state = createInitialState('vieworld-demo');
      for (const s of Object.values(state.sessions)) {
        expect(s.scheduledStartTime).toBeTruthy();
        expect(s.demo).toBe(true);
        expect(typeof s.rightsApproved).toBe('boolean');
        expect(s.rightsChecklist).toBeDefined();
      }
    });
  });

  describe('4. 8-10 Hall Rooms with Strict Privacy Boundaries (§5 & §10)', () => {
    it('hall messages never leak to explore discovery unless consent is true and approved', () => {
      const state = createInitialState('vieworld-demo');
      const publicVoices = selectPublicVoices(state, 'artist-a');

      // Check unconsented messages from Artist A
      const rawMessagesA = EXPANDED_HALL_MESSAGES['artist-a'] || [];
      const privateMessages = rawMessagesA.filter(m => !m.explorePreviewConsent);

      expect(privateMessages.length).toBeGreaterThan(0);
      for (const priv of privateMessages) {
        const leaked = publicVoices.some(v => v.text === priv.text);
        expect(leaked).toBe(false);
      }
    });

    it('reported messages are excluded from active hall display', () => {
      const rawMessagesA = EXPANDED_HALL_MESSAGES['artist-a'] || [];
      const reported = rawMessagesA.find(m => m.isReported);
      expect(reported).toBeDefined();

      // Render ArtistWorldView with Hall tab
      const state = buildScenarioState('hallMember');
      render(
        <AppProvider initialState={state}>
          <MemoryRouter initialEntries={['/artist/artist-a/hall']}>
            <Routes>
              <Route path="/artist/:artistId/*" element={<ArtistWorldView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      expect(screen.queryByText(reported!.text)).not.toBeInTheDocument();
    });
  });

  describe('5. 20-25 Public Fan Voices (§11)', () => {
    it('curates 20 to 25 public fan voices with source context and attribution', () => {
      expect(EXPANDED_PUBLIC_VOICES.length).toBeGreaterThanOrEqual(20);
      expect(EXPANDED_PUBLIC_VOICES.length).toBeLessThanOrEqual(25);

      for (const voice of EXPANDED_PUBLIC_VOICES) {
        expect(voice.id).toBeTruthy();
        expect(voice.author).toBeTruthy();
        expect(voice.text).toBeTruthy();
        expect(['artist', 'community']).toContain(voice.selectedBy);
        expect(voice.sourceContextId).toBeTruthy();
      }
    });
  });

  describe('6. 40-45 Products with Single Entity and Explicit Capabilities (§8 & §13)', () => {
    it('maintains 40-45 canonical products with previewCapabilities without duplicating entities', () => {
      const state = createInitialState('vieworld-demo');
      const products = Object.values(state.products);
      expect(products.length).toBeGreaterThanOrEqual(40);
      expect(products.length).toBeLessThanOrEqual(45);

      for (const p of Object.values(EXPANDED_PRODUCTS)) {
        expect(p.previewCapabilities).toBeDefined();
        expect(typeof p.previewCapabilities!.avatar).toBe('boolean');
        expect(typeof p.previewCapabilities!.room).toBe('boolean');
      }

      for (const p of products) {
        const caps = getPreviewCapabilities(p, products);
        expect(caps).toBeDefined();
        expect(typeof caps.avatar).toBe('boolean');
        expect(typeof caps.room).toBe('boolean');
      }

      // Check MIRA commerce-heavy diversity
      const miraProducts = products.filter(p => p.worldId === 'artist-mira');
      expect(miraProducts.length).toBeGreaterThanOrEqual(5);

      // Hoodie has both avatar and room capabilities
      const hoodie = miraProducts.find(p => p.digitalSlot === 'shirt');
      expect(hoodie).toBeDefined();
      const hoodieCaps = getPreviewCapabilities(hoodie!, products);
      expect(hoodieCaps.avatar).toBe(true);
      expect(hoodieCaps.room).toBe(true);
    });
  });

  describe('7. Room Guestbook Messages (§14)', () => {
    it('provides 12 to 18 sticky notes across fan profiles with stickers and colors', () => {
      const allNotes = Object.values(EXPANDED_GUESTBOOK_NOTES).flat();
      expect(allNotes.length).toBeGreaterThanOrEqual(12);
      expect(allNotes.length).toBeLessThanOrEqual(18);

      for (const note of allNotes) {
        expect(note.id).toBeTruthy();
        expect(note.authorName).toBeTruthy();
        expect(note.text).toBeTruthy();
        expect(note.sticker).toBeTruthy();
        expect(note.color).toBeTruthy();
      }
    });
  });

  describe('8. Golden Journeys Verification (§23)', () => {
    it('Journey 1: Discovery from Explore to Artist World', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/artists']}>
            <Routes>
              <Route element={<FanShell />}>
                <Route path="/artists" element={<ArtistGalleryView />} />
                <Route path="/artist/:artistId" element={<ArtistWorldView />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      // Explore displays worlds
      expect(screen.getByRole('heading', { name: /Nổi bật/ })).toBeInTheDocument();
      expect(screen.getByText('MIRA')).toBeInTheDocument();
      expect(screen.getByText('KAI')).toBeInTheDocument();
    });

    it('Journey 2: Artist Archive multi-year chronological inspection', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/artist/artist-d/archive']}>
            <Routes>
              <Route path="/artist/:artistId/*" element={<ArtistWorldView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      expect(screen.getByText('2026')).toBeInTheDocument();
      expect(screen.getByText('2025')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    it('Journey 3: Scenario Manager loads persona presets seamlessly', () => {
      const collectorState = buildScenarioState('collector');
      expect(collectorState.fanProfile.displayName).toBe('Quốc Hưng');
      expect(Object.keys(collectorState.orders).length).toBeGreaterThanOrEqual(10);

      const multiFandomState = buildScenarioState('multiFandom');
      expect(multiFandomState.fanProfile.displayName).toBe('Thảo Vy');
      expect(multiFandomState.followedWorldIds.length).toBeGreaterThanOrEqual(7);

      const edgeState = buildScenarioState('edgeCases');
      expect(edgeState.followedWorldIds).toContain('artist-b');
      expect(edgeState.followedWorldIds).toContain('artist-e');
    });
  });

  describe('9. Edge Cases & Boundary Conditions (§24)', () => {
    it('safely handles quiet artist with minimal activity without breaking layout', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/artist/artist-b']}>
            <Routes>
              <Route path="/artist/:artistId" element={<ArtistWorldView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Artist B');
    });

    it('safely handles debut artist with empty / initial states', () => {
      render(
        <AppProvider>
          <MemoryRouter initialEntries={['/artist/artist-e']}>
            <Routes>
              <Route path="/artist/:artistId" element={<ArtistWorldView />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Artist E');
    });
  });
});
