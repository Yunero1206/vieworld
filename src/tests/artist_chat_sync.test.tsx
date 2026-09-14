/**
 * Acceptance Tests: Synchronized Fan Chat Feature Across All Artists & Moments
 * Verifies that the chat frame is a unified feature across all artists and within Moments,
 * with dynamic and distinct data per artist and per event.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { FanChatPanel } from '../components/FanChatPanel';
import { ArtistBroadcast } from '../components/ArtistBroadcast';
import { ArtistCommunity } from '../components/ArtistCommunity';
import { getArtistChatMeta } from '../data/artistChatConfig';

describe('Synchronized Fan Chat Feature Across All Artists & Moments', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('1. Artist & Event Metadata Differentiation', () => {
    it('provides distinct companion days, fandom names, and viewer counts per artist', () => {
      const artistAMeta = getArtistChatMeta('artist-a');
      const miraMeta = getArtistChatMeta('artist-mira');
      const kaiMeta = getArtistChatMeta('artist-kai');
      const neonMeta = getArtistChatMeta('neon-sessions');

      // Companion days must differ per artist
      expect(artistAMeta.companionDays).toBe(128);
      expect(miraMeta.companionDays).toBe(210);
      expect(kaiMeta.companionDays).toBe(85);
      expect(neonMeta.companionDays).toBe(64);

      // Fandom names must differ
      expect(artistAMeta.fandomName).toBe('V-Stars');
      expect(miraMeta.fandomName).toBe('Moonies');
      expect(kaiMeta.fandomName).toBe('Pulse Crew');
      expect(neonMeta.fandomName).toBe('Night Owls');

      // Signature cues must differ
      expect(artistAMeta.signatureFanchant).toBe('VI-E-WORLD!');
      expect(miraMeta.signatureFanchant).toBe('MIRA IN THE MOONLIGHT! 🌙');
      expect(kaiMeta.signatureFanchant).toBe('KAI PULSE DROP THE BEAT! ⚡');

      // Lightsticks must have distinct names and colors
      expect(artistAMeta.signatureLightstick.name).toBe('Lightstick Sao Xanh');
      expect(miraMeta.signatureLightstick.name).toBe('Lightstick Ánh Trăng Tím');
      expect(kaiMeta.signatureLightstick.name).toBe('Lightstick Cyber Pulse');
    });

    it('differentiates event data between live house concert and drop-in chat', () => {
      const dropinMeta = getArtistChatMeta('artist-a', { id: 'session-dropin-01', worldId: 'artist-a', status: 'running', format: 'dropin' } as any);
      const concertMeta = getArtistChatMeta('artist-a', { id: 'session-house-01', worldId: 'artist-a', status: 'running', format: 'concert' } as any);

      // Concert vs drop-in viewer numbers
      expect(dropinMeta.viewerCount).toBe('2.1K');
      expect(concertMeta.viewerCount).toBe('3.8K');

      // Polls differ per event
      expect(dropinMeta.poll.prompt).toContain('nghe thêm ca khúc nào trong buổi giao lưu tối nay');
      expect(concertMeta.poll.prompt).toContain('Encore đêm nay');
    });
  });

  describe('2. FanChatPanel Dynamic Rendering', () => {
    it('renders Artist A specific loyalty days, viewer count, and fandom milestones', () => {
      render(
        <FanChatPanel
          sessionId="session-dropin-01"
          worldId="artist-a"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      // Viewer count
      expect(screen.getByText('2.1K')).toBeInTheDocument();

      // Loyalty badge
      const loyaltyBadge = screen.getByRole('button', { name: /Đồng hành cùng Artist A: 128 ngày/i });
      expect(loyaltyBadge).toBeInTheDocument();
      expect(screen.getByText('128 ngày')).toBeInTheDocument();

      // Open loyalty milestone popup
      fireEvent.click(loyaltyBadge);
      expect(screen.getByText(/Bạn đã đồng hành cùng/i)).toHaveTextContent('128 ngày');
      expect(screen.getByText(/Cột mốc Fandom \(V-Stars\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Lưu giữ 2 capsule khoảnh khắc/i)).toBeInTheDocument();
    });

    it('renders MIRA specific loyalty days (210 ngày), viewer count (4.2K), and Moonies milestones', () => {
      render(
        <FanChatPanel
          sessionId="session-mira-dropin"
          worldId="artist-mira"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      // Viewer count for Mira
      expect(screen.getByText('4.2K')).toBeInTheDocument();

      // Loyalty badge for Mira
      const loyaltyBadge = screen.getByRole('button', { name: /Đồng hành cùng MIRA: 210 ngày/i });
      expect(loyaltyBadge).toBeInTheDocument();
      expect(screen.getByText('210 ngày')).toBeInTheDocument();

      // Open loyalty popup
      fireEvent.click(loyaltyBadge);
      expect(screen.getByText(/Cột mốc Fandom \(Moonies\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Hội viên Moonies Hoàng Kim/i)).toBeInTheDocument();
    });

    it('renders KAI specific loyalty days (85 ngày), viewer count (2.7K), and Pulse Crew milestones', () => {
      render(
        <FanChatPanel
          sessionId="session-kai-pulse"
          worldId="artist-kai"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      // Viewer count for Kai
      expect(screen.getByText('2.7K')).toBeInTheDocument();

      // Loyalty badge for Kai
      const loyaltyBadge = screen.getByRole('button', { name: /Đồng hành cùng KAI: 85 ngày/i });
      expect(loyaltyBadge).toBeInTheDocument();
      expect(screen.getByText('85 ngày')).toBeInTheDocument();

      // Open loyalty popup
      fireEvent.click(loyaltyBadge);
      expect(screen.getByText(/Cột mốc Fandom \(Pulse Crew\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Thành viên Pulse Crew Đột Phá/i)).toBeInTheDocument();
    });
  });

  describe('3. Unified Live Chat in Moments', () => {
    it('renders integrated live chat inside ArtistBroadcast for Moments tab Live & Concert', () => {
      render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter>
            <ArtistBroadcast worldId="artist-a" format="dropin" />
          </MemoryRouter>
        </AppProvider>
      );

      // Avatar stage exists
      expect(screen.getByLabelText(/Khung phát avatar artist 2D/i)).toBeInTheDocument();

      // Link to full session exists
      expect(screen.getByRole('link', { name: 'Vào phiên · chat, câu hỏi & âm thanh →' })).toBeInTheDocument();

      // Embedded Live Chat dock is rendered
      expect(screen.getByLabelText(/Khung trò chuyện cộng đồng/i)).toBeInTheDocument();
      expect(screen.getByText('Live chat')).toBeInTheDocument();
      expect(screen.getByTestId('chat-input-field')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Gửi/i })).toBeInTheDocument();
    });

    it('displays distinct companion days in ArtistCommunity home tab per artist', () => {
      const { rerender } = render(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter>
            <ArtistCommunity worldId="artist-a" onOpen={() => {}} />
          </MemoryRouter>
        </AppProvider>
      );

      // Artist A has 128 days
      expect(screen.getByText(/✦ Đồng hành cùng Artist A 128 ngày/i)).toBeInTheDocument();

      // Re-render with Mira
      rerender(
        <AppProvider disableAutoHydrate={true}>
          <MemoryRouter>
            <ArtistCommunity worldId="artist-mira" onOpen={() => {}} />
          </MemoryRouter>
        </AppProvider>
      );

      // Mira has 210 days
      expect(screen.getByText(/✦ Đồng hành cùng MIRA 210 ngày/i)).toBeInTheDocument();
    });
  });
});
