import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  MessageCircleHeart,
  Music2,
  Radio,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Session, World } from '../domain/types';

type WorldZone = 'sessions' | 'archive' | 'membership' | 'shop';

interface WorldSceneProps {
  world: World;
  nextSession?: Session;
  sessionCount: number;
  benefitCount: number;
  productCount: number;
  linkedWorld?: World;
  onOpenZone: (zone: WorldZone) => void;
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

  return (
    <section
      className={`world-scene ${isArtist ? 'world-scene--artist' : 'world-scene--ip'}`}
      aria-label={`Bản đồ tương tác của ${world.name}`}
      data-testid={`world-scene-${world.id}`}
    >
      <div className="world-scene__sky" aria-hidden="true">
        <span className="world-scene__moon" />
        <span className="world-scene__star world-scene__star--one" />
        <span className="world-scene__star world-scene__star--two" />
        <span className="world-scene__star world-scene__star--three" />
        <span className="world-scene__beam world-scene__beam--left" />
        <span className="world-scene__beam world-scene__beam--right" />
      </div>

      <div className="world-scene__intro">
        <span className="world-scene__eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          {isArtist ? 'Đêm mở cửa tại Artist World' : 'Cổng chương trình đang mở'}
        </span>
        <h2>{isArtist ? 'Đi đâu trước, Linh?' : 'Chọn một cổng để bắt đầu'}</h2>
        <p>
          {nextSession?.status === 'running'
            ? 'Sân khấu đang sáng. Bạn có thể vào ngay hoặc ghé các góc khác trong world.'
            : 'Mỗi điểm sáng là một hoạt động thật trong bản thử nghiệm này.'}
        </p>
      </div>

      <div className="world-scene__ground" aria-hidden="true" />
      <div className="world-scene__stage" aria-hidden="true">
        <span className="world-scene__stage-ring" />
        <span className="world-scene__artist-figure">
          <span className="world-scene__artist-head" />
          <span className="world-scene__artist-body" />
        </span>
      </div>

      {nextSession ? (
        <Link
          className="world-hotspot world-hotspot--stage"
          to={`/sessions/${nextSession.id}`}
          aria-label={`Vào sân khấu: ${nextSession.title}`}
          id={`scene-enter-session-${nextSession.id}`}
        >
          <span className="world-hotspot__icon world-hotspot__icon--live">
            <Radio size={20} aria-hidden="true" />
          </span>
          <span>
            <small>{nextSession.status === 'running' ? 'Đang diễn ra · DEMO' : 'Khoảnh khắc kế tiếp · DEMO'}</small>
            <strong>Sân khấu trung tâm</strong>
            <em>{nextSession.title}</em>
          </span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          className="world-hotspot world-hotspot--stage"
          onClick={() => onOpenZone('sessions')}
        >
          <span className="world-hotspot__icon"><Radio size={20} aria-hidden="true" /></span>
          <span><small>Lịch đang cập nhật</small><strong>Sân khấu trung tâm</strong></span>
        </button>
      )}

      <button
        type="button"
        className="world-hotspot world-hotspot--music"
        onClick={() => onOpenZone('sessions')}
        aria-label={`Mở ${sessionCount} phiên âm nhạc`}
      >
        <span className="world-hotspot__icon"><Music2 size={19} aria-hidden="true" /></span>
        <span><small>{sessionCount} lịch hẹn</small><strong>Góc nghe nhạc</strong></span>
      </button>

      <button
        type="button"
        className="world-hotspot world-hotspot--message"
        onClick={() => onOpenZone('archive')}
        aria-label="Mở bảng kỷ niệm và replay"
      >
        <span className="world-hotspot__icon"><MessageCircleHeart size={19} aria-hidden="true" /></span>
        <span><small>Ký ức đã mở</small><strong>Bảng kỷ niệm</strong></span>
      </button>

      <button
        type="button"
        className="world-hotspot world-hotspot--membership"
        onClick={() => onOpenZone('membership')}
        aria-label={`Mở ${benefitCount} quyền lợi hội viên`}
      >
        <span className="world-hotspot__icon"><Award size={19} aria-hidden="true" /></span>
        <span><small>{benefitCount} quyền lợi</small><strong>Fan Club</strong></span>
      </button>

      <Link
        className="world-hotspot world-hotspot--shop"
        to={`/worlds/${world.id}/shop`}
        aria-label={`Vào VieSHOP với ${productCount} vật phẩm`}
      >
        <span className="world-hotspot__icon"><ShoppingBag size={19} aria-hidden="true" /></span>
        <span><small>{productCount} vật phẩm</small><strong>VieSHOP</strong></span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>

      {linkedWorld && (
        <Link
          className="world-scene__portal"
          to={`/worlds/${linkedWorld.id}`}
          aria-label={`Đi qua cổng đến ${linkedWorld.name}`}
        >
          <span className="world-scene__portal-orbit" aria-hidden="true" />
          <span><small>Cổng liên kết</small><strong>{linkedWorld.name}</strong></span>
        </Link>
      )}

      <div className="world-scene__hint">
        Chạm một điểm sáng để khám phá
      </div>
    </section>
  );
};
