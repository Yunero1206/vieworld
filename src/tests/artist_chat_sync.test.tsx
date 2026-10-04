/**
 * Acceptance Tests: Synchronized Fan Chat Feature Across All Artists & Moments
 * Verifies that the chat frame is a unified feature across all artists and within Moments,
 * with dynamic and distinct data per artist and per event.
 */

import { fireEvent,render,screen } from '@testing-library/react';
import { beforeEach,describe,expect,it } from 'vitest';
import { FanChatPanel } from '../components/FanChatPanel';
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
    it('renders editorial milestones without invented tenure or viewer count', () => {
      render(
        <FanChatPanel
          sessionId="session-dropin-01"
          worldId="artist-a"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      // Viewer count
      expect(screen.queryByText('2.1K')).toBeNull();

      // Loyalty badge
      const loyaltyBadge = screen.getByRole('button', { name: /Hành trình minh họa của Artist A/i });
      expect(loyaltyBadge).toBeInTheDocument();
      expect(screen.queryByText('128 ngày')).toBeNull();

      // Open loyalty milestone popup
      fireEvent.click(loyaltyBadge);
      expect(screen.getByText(/không ghi nhận thời gian đồng hành hay tham dự của bạn/)).toBeVisible();
      expect(screen.getByText(/Cột mốc Fandom \(V-Stars\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Lưu giữ 2 capsule khoảnh khắc/i)).toBeInTheDocument();
    });

    it('renders MIRA sample milestones without implying fan tenure', () => {
      render(
        <FanChatPanel
          sessionId="session-mira-dropin"
          worldId="artist-mira"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      // Viewer count for Mira
      expect(screen.queryByText('4.2K')).toBeNull();

      // Loyalty badge for Mira
      const loyaltyBadge = screen.getByRole('button', { name: /Hành trình minh họa của MIRA/i });
      expect(loyaltyBadge).toBeInTheDocument();
      expect(screen.queryByText('210 ngày')).toBeNull();

      // Open loyalty popup
      fireEvent.click(loyaltyBadge);
      expect(screen.getByText(/Cột mốc Fandom \(Moonies\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Hội viên Moonies Hoàng Kim/i)).toBeInTheDocument();
    });

    it('renders KAI sample milestones without implying fan tenure', () => {
      render(
        <FanChatPanel
          sessionId="session-kai-pulse"
          worldId="artist-kai"
          currentFanId="fan-linh"
          currentFanName="Linh Nguyễn"
        />
      );

      // Viewer count for Kai
      expect(screen.queryByText('2.7K')).toBeNull();

      // Loyalty badge for Kai
      const loyaltyBadge = screen.getByRole('button', { name: /Hành trình minh họa của KAI/i });
      expect(loyaltyBadge).toBeInTheDocument();
      expect(screen.queryByText('85 ngày')).toBeNull();

      // Open loyalty popup
      fireEvent.click(loyaltyBadge);
      expect(screen.getByText(/Cột mốc Fandom \(Pulse Crew\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Thành viên Pulse Crew Đột Phá/i)).toBeInTheDocument();
    });
  });
});
