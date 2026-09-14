import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  Clock,
  Compass,
  MessageCircleHeart,
  Music2,
  Radio,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Session, World } from '../domain/types';

export type WorldZone = 'sessions' | 'listening' | 'archive' | 'membership' | 'shop';

export interface WorldSceneProps {
  world: World;
  nextSession?: Session;
  sessionCount: number;
  benefitCount: number;
  productCount: number;
  linkedWorld?: World;
  onOpenZone: (zone: WorldZone) => void;
  fanDisplayName?: string;
}

export const WorldScene: React.FC<WorldSceneProps> = ({
  world,
  nextSession,
  sessionCount,
  benefitCount,
  productCount,
  linkedWorld,
  onOpenZone,
}) => {
  const isArtist = world.type === 'artist';
  const [artworkError, setArtworkError] = React.useState(false);

  return (
    <section
      className={`world-scene ${isArtist ? 'world-scene--artist' : 'world-scene--ip'}`}
      aria-label={`Bản đồ tương tác không gian ${world.name}`}
      data-testid={`world-scene-${world.id}`}
    >
      {/* Intro Header */}
      <div className="world-scene__intro">
        <span className="world-scene__eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          {isArtist ? 'Nhà nhạc thu nhỏ · Artist World' : 'Không gian trải nghiệm · IP World'}
        </span>
        <h2>{isArtist ? `Nhà nhạc ${world.name}` : world.name}</h2>
        <p>
          {nextSession?.status === 'running'
            ? 'Sân khấu đang sáng đèn với phiên trực tiếp. Bạn có thể bước vào giao lưu ngay hoặc ghé thăm các góc nhạc khác.'
            : isArtist
              ? 'Không gian âm nhạc 2.5D mộc mạc: sân khấu trung tâm, máy đĩa than, bảng lưu diễn và các quầy đặc quyền.'
              : 'Không gian âm nhạc điện tử 2.5D: sân khấu synthesizer, trạm âm thanh Lo-Fi, bảng neon lưu diễn và quầy đặc quyền.'}
        </p>
      </div>

      {/* 2.5D Diorama Venue Architecture */}
      <div
        className={`world-diorama ${isArtist ? 'world-diorama--artist' : 'world-diorama--ip'}`}
        role="region"
        aria-label={`Mô hình không gian nhà nhạc ${world.name}`}
      >
        {/* Ambient lighting & acoustic backdrop */}
        <div className="diorama-backdrop" aria-hidden="true">
          {isArtist && !artworkError && (
            <img
              src="/images/world-redesign/drafts/artist-a-scene-sample.png"
              alt=""
              className="diorama-backdrop-artwork"
              onError={() => setArtworkError(true)}
              data-testid="world-backdrop-artwork"
            />
          )}
          <div className="diorama-spotlight-beam" />
          <div className="diorama-slats-texture" />
        </div>

        {/* Cổng du hành liên kết (nếu có) */}
        {linkedWorld && (
          <Link
            className="diorama-portal"
            to={`/worlds/${linkedWorld.id}`}
            aria-label={`Đi qua cổng không gian sang ${linkedWorld.name}`}
            id="diorama-portal-link"
          >
            <span className="diorama-portal__orb" aria-hidden="true">✦</span>
            <div className="diorama-portal__text">
              <small>Cổng du hành liên kết</small>
              <strong>Sang {linkedWorld.name} →</strong>
            </div>
          </Link>
        )}

        {/* Centerpiece: Sân khấu Trung tâm (Stage) */}
        <div className="diorama-stage-centerpiece">
          <div className="diorama-stage-platform">
            {/* Stage Visual: Mic stand & Acoustic guitar SVG (Artist) vs Cyber Synth Console SVG (IP) */}
            <div className="diorama-stage-visual" aria-hidden="true">
              {isArtist ? (
                <svg className="diorama-stage-svg" viewBox="0 0 120 70" fill="none">
                  {/* Wooden stage deck bevel */}
                  <ellipse cx="60" cy="62" rx="56" ry="7" fill="rgba(0,0,0,0.4)" />
                  <path d="M6 56 C6 56 30 65 60 65 C90 65 114 56 114 56 L114 52 C114 52 90 61 60 61 C30 61 6 52 6 52 Z" fill="#78350F" />
                  {/* Acoustic guitar on stand */}
                  <g transform="translate(30, 18) scale(0.65)">
                    <path d="M12 28 C8 24 6 18 10 14 C14 10 20 14 20 18 C20 14 26 10 30 14 C34 18 32 24 28 28 C34 32 36 42 30 48 C24 54 16 54 10 48 C4 42 6 32 12 28 Z" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
                    <circle cx="20" cy="36" r="4" fill="#451A03" />
                    <line x1="20" y1="14" x2="20" y2="0" stroke="#78350F" strokeWidth="2.5" />
                    <rect x="17" y="-5" width="6" height="6" rx="1" fill="#451A03" />
                  </g>
                  {/* Mic stand */}
                  <g transform="translate(68, 8)">
                    <line x1="12" y1="52" x2="12" y2="16" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                    <line x1="6" y1="54" x2="18" y2="54" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
                    <ellipse cx="12" cy="11" rx="3" ry="1.5" fill="rgba(255,255,255,0.7)" />
                  </g>
                </svg>
              ) : (
                <svg
                  className="diorama-stage-svg diorama-stage-svg--synth"
                  viewBox="0 0 120 70"
                  fill="none"
                  data-testid="neon-synth-stage-visual"
                >
                  {/* Cyber stage deck bevel */}
                  <ellipse cx="60" cy="62" rx="56" ry="7" fill="rgba(6, 182, 212, 0.2)" />
                  <path d="M6 56 C6 56 30 65 60 65 C90 65 114 56 114 56 L114 52 C114 52 90 61 60 61 C30 61 6 52 6 52 Z" fill="#0F172A" stroke="#06B6D4" strokeWidth="0.8" />
                  {/* Neon Arches */}
                  <path d="M22 54 C22 18 98 18 98 54" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
                  <path d="M22 54 C22 18 98 18 98 54" stroke="#22D3EE" strokeWidth="0.8" strokeLinecap="round" fill="none" />
                  <path d="M30 54 C30 24 90 24 90 54" stroke="#F43F5E" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 3" fill="none" opacity="0.6" />
                  {/* Studio Monitors */}
                  <rect x="18" y="34" width="12" height="18" rx="2" fill="#1E293B" stroke="#06B6D4" strokeWidth="0.8" />
                  <circle cx="24" cy="40" r="3.5" fill="#0F172A" stroke="#22D3EE" strokeWidth="0.8" />
                  <circle cx="24" cy="47" r="2" fill="#0F172A" stroke="#F43F5E" strokeWidth="0.6" />
                  <rect x="90" y="34" width="12" height="18" rx="2" fill="#1E293B" stroke="#06B6D4" strokeWidth="0.8" />
                  <circle cx="96" cy="40" r="3.5" fill="#0F172A" stroke="#22D3EE" strokeWidth="0.8" />
                  <circle cx="96" cy="47" r="2" fill="#0F172A" stroke="#F43F5E" strokeWidth="0.6" />
                  {/* Synth Stand */}
                  <line x1="48" y1="56" x2="52" y2="38" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                  <line x1="72" y1="56" x2="68" y2="38" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                  {/* Synth Keyboard Deck */}
                  <rect x="36" y="32" width="48" height="12" rx="2" fill="#1E293B" stroke="#06B6D4" strokeWidth="1" />
                  {/* White & Black keys */}
                  <rect x="38" y="38" width="44" height="5" fill="#E2E8F0" rx="1" />
                  <line x1="42" y1="38" x2="42" y2="43" stroke="#0F172A" strokeWidth="0.8" />
                  <line x1="46" y1="38" x2="46" y2="43" stroke="#0F172A" strokeWidth="0.8" />
                  <line x1="50" y1="38" x2="50" y2="43" stroke="#0F172A" strokeWidth="0.8" />
                  <line x1="54" y1="38" x2="54" y2="43" stroke="#0F172A" strokeWidth="0.8" />
                  <line x1="58" y1="38" x2="58" y2="43" stroke="#0F172A" strokeWidth="0.8" />
                  <line x1="62" y1="38" x2="62" y2="43" stroke="#0F172A" strokeWidth="0.8" />
                  <line x1="66" y1="38" x2="66" y2="43" stroke="#0F172A" strokeWidth="0.8" />
                  <line x1="70" y1="38" x2="70" y2="43" stroke="#0F172A" strokeWidth="0.8" />
                  <line x1="74" y1="38" x2="74" y2="43" stroke="#0F172A" strokeWidth="0.8" />
                  <line x1="78" y1="38" x2="78" y2="43" stroke="#0F172A" strokeWidth="0.8" />
                  <rect x="40" y="38" width="2" height="3" fill="#0F172A" />
                  <rect x="44" y="38" width="2" height="3" fill="#0F172A" />
                  <rect x="52" y="38" width="2" height="3" fill="#0F172A" />
                  <rect x="56" y="38" width="2" height="3" fill="#0F172A" />
                  <rect x="60" y="38" width="2" height="3" fill="#0F172A" />
                  <rect x="68" y="38" width="2" height="3" fill="#0F172A" />
                  <rect x="72" y="38" width="2" height="3" fill="#0F172A" />
                  <rect x="76" y="38" width="2" height="3" fill="#0F172A" />
                  {/* Digital screen & LED EQ frequency bars */}
                  <rect x="48" y="24" width="24" height="9" rx="1.5" fill="#082F49" stroke="#22D3EE" strokeWidth="0.8" />
                  <rect x="50" y="28" width="2" height="3" fill="#22D3EE" />
                  <rect x="53" y="26" width="2" height="5" fill="#06B6D4" />
                  <rect x="56" y="25" width="2" height="6" fill="#F43F5E" />
                  <rect x="59" y="27" width="2" height="4" fill="#22D3EE" />
                  <rect x="62" y="25" width="2" height="6" fill="#FB7185" />
                  <rect x="65" y="28" width="2" height="3" fill="#06B6D4" />
                  <rect x="68" y="26" width="2" height="5" fill="#22D3EE" />
                </svg>
              )}
            </div>

            {/* Stage Status Pill */}
            <div className="diorama-stage-status">
              {nextSession?.status === 'running' ? (
                <span className="diorama-status-badge diorama-status-badge--live">
                  <Radio size={12} aria-hidden="true" />
                  <span>Đang diễn · LIVE</span>
                  <span className="diorama-demo-tag">DEMO</span>
                </span>
              ) : nextSession ? (
                <span className="diorama-status-badge diorama-status-badge--scheduled">
                  <Clock size={12} aria-hidden="true" />
                  <span>Sắp diễn · DEMO</span>
                </span>
              ) : (
                <span className="diorama-status-badge diorama-status-badge--idle">
                  <span>Chưa có lịch diễn trực tiếp</span>
                </span>
              )}
            </div>

            {/* Stage Direct Actionable Link / Button */}
            {nextSession ? (
              <Link
                to={`/sessions/${nextSession.id}`}
                id={`scene-enter-session-${nextSession.id}`}
                className="diorama-stage-cta"
                aria-label={`Vào sân khấu: ${nextSession.title}`}
              >
                <div className="diorama-stage-cta__meta">
                  <span className="diorama-stage-cta__label">Khu vực 01 · Sân khấu trung tâm</span>
                  <strong className="diorama-stage-cta__title">{nextSession.title}</strong>
                </div>
                <div className="diorama-stage-cta__action">
                  <span>{nextSession.status === 'running' ? 'Vào sân khấu · DEMO' : 'Xem chi tiết & RSVP'}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </div>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onOpenZone('sessions')}
                className="diorama-stage-cta"
                aria-label="Xem danh sách lịch hẹn sân khấu"
              >
                <div className="diorama-stage-cta__meta">
                  <span className="diorama-stage-cta__label">Khu vực 01 · Sân khấu</span>
                  <strong className="diorama-stage-cta__title">Lịch giao lưu đang cập nhật</strong>
                </div>
                <div className="diorama-stage-cta__action">
                  <span>Xem lịch các phiên</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* 4 Interactive Locations: Listening Nook, Tour Archive, Membership Desk, VieSHOP */}
        <div className="diorama-spots-grid">
          {/* Location 2: Góc Nghe Nhạc (Artist: Máy đĩa than vs IP: Trạm Lo-Fi) */}
          <button
            type="button"
            className="diorama-spot diorama-spot--music"
            onClick={() => onOpenZone('listening')}
            aria-label={isArtist ? `Mở góc nghe nhạc máy đĩa than (${sessionCount} phiên nghe)` : `Mở trạm âm thanh Lo-Fi (${sessionCount} phiên nghe)`}
            id="diorama-spot-music"
          >
            <div className="diorama-spot__visual" aria-hidden="true">
              {isArtist ? (
                <svg className="diorama-spot__svg" viewBox="0 0 54 54" fill="none">
                  {/* Turntable wood base */}
                  <rect x="4" y="8" width="46" height="38" rx="6" fill="#3E2723" stroke="#5D4037" strokeWidth="1.5" />
                  {/* Vinyl record with spinning cue */}
                  <circle cx="23" cy="27" r="15" fill="#18181B" stroke="#27272A" strokeWidth="1" />
                  <circle cx="23" cy="27" r="10" stroke="#3F3F46" strokeWidth="0.8" strokeDasharray="3 2" />
                  <circle cx="23" cy="27" r="5" fill="#F59E0B" />
                  <circle cx="23" cy="27" r="1.5" fill="#18181B" />
                  {/* Tonearm */}
                  <circle cx="41" cy="15" r="3" fill="#A1A1AA" />
                  <path d="M41 17 L39 30 L32 34" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="29" y="33" width="5" height="3" rx="1" fill="#EF4444" transform="rotate(-30 32 34)" />
                </svg>
              ) : (
                <svg className="diorama-spot__svg" viewBox="0 0 54 54" fill="none">
                  {/* Cyber Tape Deck base */}
                  <rect x="4" y="8" width="46" height="38" rx="6" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
                  {/* Glowing reels */}
                  <circle cx="18" cy="24" r="9" fill="#1E293B" stroke="#22D3EE" strokeWidth="1.2" />
                  <circle cx="18" cy="24" r="3" fill="#0891B2" />
                  <circle cx="36" cy="24" r="9" fill="#1E293B" stroke="#22D3EE" strokeWidth="1.2" />
                  <circle cx="36" cy="24" r="3" fill="#0891B2" />
                  <line x1="18" y1="33" x2="36" y2="33" stroke="#F43F5E" strokeWidth="1.5" />
                  {/* LED VU meters */}
                  <rect x="12" y="38" width="5" height="3" fill="#22D3EE" rx="0.5" />
                  <rect x="19" y="38" width="5" height="3" fill="#06B6D4" rx="0.5" />
                  <rect x="26" y="38" width="5" height="3" fill="#A855F7" rx="0.5" />
                  <rect x="33" y="38" width="5" height="3" fill="#F43F5E" rx="0.5" />
                </svg>
              )}
              <span className="diorama-spot__icon-badge">
                <Music2 size={14} aria-hidden="true" />
              </span>
            </div>
            <div className="diorama-spot__body">
              <span className="diorama-spot__tag">{isArtist ? 'Góc nghe đĩa than' : 'Trạm âm thanh Lo-Fi'}</span>
              <strong className="diorama-spot__name">{isArtist ? 'Máy đĩa than' : 'Trạm Lo-Fi'}</strong>
              <small className="diorama-spot__info">{sessionCount} phiên âm nhạc</small>
              <span className="diorama-spot__hint">
                <span>{isArtist ? 'Nghe liner notes' : 'Nghe Lo-Fi & stems'}</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </div>
          </button>

          {/* Location 3: Bảng Lưu Diễn & Ký Ức (Artist) vs Kho lưu trữ Show điện tử (IP) */}
          <button
            type="button"
            className="diorama-spot diorama-spot--archive"
            onClick={() => onOpenZone('archive')}
            aria-label={isArtist ? 'Mở bảng lưu diễn và xem lại ký ức replay' : 'Mở bảng neon lưu diễn và xem recap show'}
            id="diorama-spot-archive"
          >
            <div className="diorama-spot__visual" aria-hidden="true">
              {isArtist ? (
                <svg className="diorama-spot__svg" viewBox="0 0 54 54" fill="none">
                  {/* Corkboard wood frame */}
                  <rect x="4" y="6" width="46" height="42" rx="5" fill="#451A03" stroke="#78350F" strokeWidth="1.5" />
                  <rect x="7" y="9" width="40" height="36" rx="3" fill="#78350F" />
                  {/* Pinned concert ticket */}
                  <g transform="rotate(-6 18 19)">
                    <rect x="10" y="12" width="20" height="13" rx="2" fill="#FEF08A" stroke="#CA8A04" strokeWidth="0.8" />
                    <line x1="14" y1="16" x2="26" y2="16" stroke="#854D0E" strokeWidth="1.2" strokeDasharray="2 1" />
                  </g>
                  {/* Pinned polaroid photo */}
                  <g transform="rotate(8 33 28)">
                    <rect x="23" y="20" width="18" height="21" rx="2" fill="#FFFFFF" />
                    <rect x="25" y="22" width="14" height="13" rx="1" fill="#8B5CF6" />
                  </g>
                  <circle cx="20" cy="12" r="2" fill="#EF4444" />
                </svg>
              ) : (
                <svg className="diorama-spot__svg" viewBox="0 0 54 54" fill="none">
                  {/* Cyber LED frame */}
                  <rect x="4" y="6" width="46" height="42" rx="5" fill="#0F172A" stroke="#F43F5E" strokeWidth="1.5" />
                  <rect x="7" y="9" width="40" height="36" rx="3" fill="#1E1B4B" />
                  {/* Neon setlist bars */}
                  <line x1="12" y1="16" x2="34" y2="16" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="22" x2="42" y2="22" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="28" x2="28" y2="28" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="34" x2="38" y2="34" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="38" cy="16" r="1.5" fill="#22D3EE" />
                  <circle cx="34" cy="28" r="1.5" fill="#F43F5E" />
                  <circle cx="42" cy="34" r="1.5" fill="#A855F7" />
                </svg>
              )}
              <span className="diorama-spot__icon-badge">
                <MessageCircleHeart size={14} aria-hidden="true" />
              </span>
            </div>
            <div className="diorama-spot__body">
              <span className="diorama-spot__tag">{isArtist ? 'Kho lưu trữ & Replay' : 'Kho lưu trữ Show điện tử'}</span>
              <strong className="diorama-spot__name">{isArtist ? 'Bảng lưu diễn' : 'Bảng neon lưu diễn'}</strong>
              <small className="diorama-spot__info">{isArtist ? 'Ký ức & vé concert' : 'Lịch sử set & recap'}</small>
              <span className="diorama-spot__hint">
                <span>{isArtist ? 'Xem lại ký ức' : 'Xem recap show'}</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </div>
          </button>

          {/* Location 4: Quầy Hội Quán (Artist) vs Quầy Neon Pass (IP) */}
          <button
            type="button"
            className="diorama-spot diorama-spot--membership"
            onClick={() => onOpenZone('membership')}
            aria-label={isArtist ? `Mở quầy Hội Quán fandom (${benefitCount} đặc quyền)` : `Mở quầy Neon Pass VIP (${benefitCount} đặc quyền)`}
            id="diorama-spot-membership"
          >
            <div className="diorama-spot__visual" aria-hidden="true">
              {isArtist ? (
                <svg className="diorama-spot__svg" viewBox="0 0 54 54" fill="none">
                  {/* Counter reception surface */}
                  <rect x="5" y="22" width="44" height="26" rx="5" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
                  {/* VIP membership card */}
                  <g transform="rotate(-6 27 24)">
                    <rect x="12" y="11" width="30" height="19" rx="3" fill="#D97706" stroke="#FBBF24" strokeWidth="1" />
                    <circle cx="19" cy="18" r="3" fill="#FEF08A" />
                    <line x1="24" y1="16" x2="38" y2="16" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="24" y1="20" x2="33" y2="20" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />
                  </g>
                </svg>
              ) : (
                <svg className="diorama-spot__svg" viewBox="0 0 54 54" fill="none">
                  {/* Cyber terminal base */}
                  <rect x="5" y="22" width="44" height="26" rx="5" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
                  {/* Glowing cyber keycard */}
                  <g transform="rotate(-5 27 22)">
                    <rect x="12" y="9" width="30" height="19" rx="3" fill="#1E1B4B" stroke="#22D3EE" strokeWidth="1.2" />
                    <circle cx="19" cy="18" r="3.5" fill="#F43F5E" />
                    <line x1="25" y1="16" x2="38" y2="16" stroke="#22D3EE" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="25" y1="20" x2="34" y2="20" stroke="#06B6D4" strokeWidth="1.2" strokeLinecap="round" />
                  </g>
                  <line x1="10" y1="38" x2="44" y2="38" stroke="#22D3EE" strokeWidth="1.5" strokeDasharray="3 2" />
                </svg>
              )}
              <span className="diorama-spot__icon-badge">
                <Award size={14} aria-hidden="true" />
              </span>
            </div>
            <div className="diorama-spot__body">
              <span className="diorama-spot__tag">{isArtist ? 'Fandom & Đặc quyền' : 'Hội Quán Cyber VIP'}</span>
              <strong className="diorama-spot__name">{isArtist ? 'Quầy Hội Quán' : 'Quầy Neon Pass'}</strong>
              <small className="diorama-spot__info">{benefitCount} quyền lợi hội viên</small>
              <span className="diorama-spot__hint">
                <span>{isArtist ? 'Vào Hội quán' : 'Nhận Neon Pass'}</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </div>
          </button>

          {/* Location 5: Tiệm VieSHOP (Artist) vs VieSHOP Cyber Merch (IP) */}
          <Link
            to={`/worlds/${world.id}/shop`}
            className="diorama-spot diorama-spot--shop"
            aria-label={isArtist ? `Vào tiệm quà VieSHOP (${productCount} vật phẩm độc quyền)` : `Vào VieSHOP Cyber Merch (${productCount} vật phẩm giới hạn)`}
            id="diorama-spot-shop"
          >
            <div className="diorama-spot__visual" aria-hidden="true">
              {isArtist ? (
                <svg className="diorama-spot__svg" viewBox="0 0 54 54" fill="none">
                  {/* Boutique table stand */}
                  <rect x="6" y="24" width="42" height="24" rx="5" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
                  {/* Merchandise shopping bag with star */}
                  <g transform="translate(15, 6)">
                    <path d="M7 8 C7 3 17 3 17 8" stroke="#F43F5E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <rect x="2" y="8" width="20" height="22" rx="3" fill="#BE123C" stroke="#FDA4AF" strokeWidth="1" />
                    <circle cx="12" cy="17" r="3.5" fill="#FDE047" />
                    <polygon points="12,14 13,16 15,16.5 13.5,18 14,20 12,19 10,20 10.5,18 9,16.5 11,16" fill="#CA8A04" />
                  </g>
                </svg>
              ) : (
                <svg className="diorama-spot__svg" viewBox="0 0 54 54" fill="none">
                  {/* Cyber boutique pedestal */}
                  <rect x="6" y="24" width="42" height="24" rx="5" fill="#0F172A" stroke="#F43F5E" strokeWidth="1.5" />
                  {/* Cyber merch capsule */}
                  <g transform="translate(15, 6)">
                    <rect x="3" y="6" width="18" height="22" rx="3" fill="#1E1B4B" stroke="#F43F5E" strokeWidth="1.2" />
                    <circle cx="12" cy="15" r="4.5" fill="#0F172A" stroke="#22D3EE" strokeWidth="1" />
                    <polygon points="12,12 13.5,14.5 16,15 14,17 14.5,19.5 12,18 9.5,19.5 10,17 8,15 10.5,14.5" fill="#22D3EE" />
                    <line x1="6" y1="24" x2="18" y2="24" stroke="#F43F5E" strokeWidth="1" />
                  </g>
                </svg>
              )}
              <span className="diorama-spot__icon-badge">
                <ShoppingBag size={14} aria-hidden="true" />
              </span>
            </div>
            <div className="diorama-spot__body">
              <span className="diorama-spot__tag">{isArtist ? 'Boutique Fandom' : 'VieSHOP Cyber Merch'}</span>
              <strong className="diorama-spot__name">{isArtist ? 'Tiệm VieSHOP' : 'VieSHOP Cyber'}</strong>
              <small className="diorama-spot__info">{productCount} {isArtist ? 'vật phẩm độc quyền' : 'vật phẩm giới hạn'}</small>
              <span className="diorama-spot__hint">
                <span>{isArtist ? 'Ghé tiệm quà' : 'Khám phá Cyber Merch'}</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Text Shortcuts Bar — Quick Navigation Guarantee (Bible Rule 4) */}
      <nav className="diorama-shortcuts" aria-label="Lối tắt các khu vực trong nhà nhạc">
        <div className="diorama-shortcuts__header">
          <Compass size={14} aria-hidden="true" />
          <span>Lối tắt khu vực:</span>
        </div>
        <div className="diorama-shortcuts__list">
          {nextSession ? (
            <Link
              to={`/sessions/${nextSession.id}`}
              className="diorama-shortcut-btn diorama-shortcut-btn--stage"
              aria-label={`Lối tắt: Vào sân khấu (${nextSession.title})`}
              id="shortcut-stage"
            >
              <Radio size={14} aria-hidden="true" />
              <span>Sân khấu: {nextSession.title}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onOpenZone('sessions')}
              className="diorama-shortcut-btn diorama-shortcut-btn--stage"
              aria-label="Lối tắt: Xem lịch sân khấu"
              id="shortcut-stage"
            >
              <Radio size={14} aria-hidden="true" />
              <span>{isArtist ? 'Sân khấu trung tâm' : 'Sân khấu Cyber Synth'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenZone('listening')}
            className="diorama-shortcut-btn"
            aria-label={isArtist ? `Lối tắt: Máy đĩa than (${sessionCount} phiên)` : `Lối tắt: Trạm Lo-Fi (${sessionCount} phiên)`}
            id="shortcut-music"
          >
            <Music2 size={14} aria-hidden="true" />
            <span>{isArtist ? `Máy đĩa than (${sessionCount})` : `Trạm Lo-Fi (${sessionCount})`}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenZone('archive')}
            className="diorama-shortcut-btn"
            aria-label={isArtist ? 'Lối tắt: Bảng lưu diễn & Ký ức' : 'Lối tắt: Bảng neon lưu diễn'}
            id="shortcut-archive"
          >
            <MessageCircleHeart size={14} aria-hidden="true" />
            <span>{isArtist ? 'Bảng lưu diễn' : 'Bảng neon lưu diễn'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenZone('membership')}
            className="diorama-shortcut-btn"
            aria-label={isArtist ? `Lối tắt: Quầy Hội Quán (${benefitCount} đặc quyền)` : `Lối tắt: Quầy Neon Pass (${benefitCount} đặc quyền)`}
            id="shortcut-membership"
          >
            <Award size={14} aria-hidden="true" />
            <span>{isArtist ? `Quầy Hội Quán (${benefitCount})` : `Quầy Neon Pass (${benefitCount})`}</span>
          </button>

          <Link
            to={`/worlds/${world.id}/shop`}
            className="diorama-shortcut-btn"
            aria-label={isArtist ? `Lối tắt: Tiệm quà VieSHOP (${productCount} vật phẩm)` : `Lối tắt: VieSHOP Cyber (${productCount} vật phẩm)`}
            id="shortcut-shop"
          >
            <ShoppingBag size={14} aria-hidden="true" />
            <span>{isArtist ? `Tiệm VieSHOP (${productCount})` : `VieSHOP Cyber (${productCount})`}</span>
          </Link>

          {linkedWorld && (
            <Link
              to={`/worlds/${linkedWorld.id}`}
              className="diorama-shortcut-btn diorama-shortcut-btn--portal"
              aria-label={`Lối tắt: Du hành sang ${linkedWorld.name}`}
              id="shortcut-portal"
            >
              <span aria-hidden="true">✦</span>
              <span>Sang {linkedWorld.name}</span>
            </Link>
          )}
        </div>
      </nav>
    </section>
  );
};
