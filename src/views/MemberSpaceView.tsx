import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DisplayRoomScene } from '../components/DisplayRoom';
import type { DisplayItem } from '../world/display';
import { currentPublicFan, DEMO_FANS } from '../world/community';
import { MERCH_IMAGE_ROOT } from '../world/merchCatalog';
import { RoomGuestbook } from '../components/RoomGuestbook';
import { FandomPolaroidPass } from '../components/FandomPolaroidPass';
import { AvatarRenderer } from '../components/AvatarRenderer';

export function MemberSpaceView() {
  const { state } = useApp();
  const { fanId } = useParams();
  const [selected, setSelected] = useState<number | null>(null);
  const [isVinylPlaying, setIsVinylPlaying] = useState(false);
  const [isLightstickActive, setIsLightstickActive] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [heartsCount, setHeartsCount] = useState(38);
  const [isPassOpen, setIsPassOpen] = useState(false);

  const own = fanId === state.fanProfile.id;
  const fan = own ? currentPublicFan(state) : DEMO_FANS.find(f => f.id === fanId);

  if (!fan) {
    return (
      <div className="fw-empty">
        <h1>Chưa tìm thấy người bạn này.</h1>
        <Link to="/moments">Về Moments</Link>
      </div>
    );
  }

  const displayItems: DisplayItem[] =
    fan.displayItems ||
    fan.items.map((i, n) => ({
      ...i,
      id: `sample-${n}`,
      slot: i.image?.startsWith('lightstick')
        ? 'lightstick'
        : i.image?.startsWith('ticket')
        ? 'ticket'
        : i.image?.startsWith('cd')
        ? 'disc'
        : 'shirt',
    }));

  const visibleItems = fan.displayItems || fan.items;
  const item = selected === null ? undefined : visibleItems[selected];

  return (
    <div className="fw-experience v5-member-space vw-place-page">
      <header className="v7-space-header-block v7-member-header-block">
        <div className="v7-space-topbar">
          <Link className="v7-space-back-btn" to={own ? '/me' : '/moments?artist=artist-a&panel=hall'}>
            <ArrowLeft size={14} />
            <span>{own ? 'Quay lại phòng của tôi' : 'Về Hall hội viên'}</span>
          </Link>

          <div className="v7-space-utilities">
            <span className="v7-space-account-badge">ID: @{fan.id}</span>
            {own ? (
              <Link className="v7-space-util-btn" to="/me">
                Quay lại phòng của tôi ↗
              </Link>
            ) : (
              <button
                type="button"
                className="v7-space-pass-btn"
                onClick={() => setIsPassOpen(true)}
              >
                <Sparkles size={14} />
                <span>Xem Fandom Pass ↗</span>
              </button>
            )}
          </div>
        </div>

        <div className="v7-space-hero-row">
          <div className="v7-space-hero-left">
            <div className="v7-space-eyebrow-row">
              <span className="v7-space-eyebrow">KHÔNG GIAN FAN</span>
              {fan.sample && (
                <span className="v7-space-identity-pill">Không gian mẫu</span>
              )}
            </div>
            <h1 className="v7-space-title">
              Ghé nhà {fan.name}
              <span className="v7-space-title-sub">
                {fan.sample
                  ? 'Không gian trải nghiệm mô phỏng · Vật phẩm minh họa'
                  : 'Chế độ xem của khách ghé thăm · Lưu an toàn trên thiết bị của bạn'}
              </span>
            </h1>
            <p className="v7-space-subtitle">
              {fan.mood || 'Một góc nhỏ cho những điều mình yêu.'}
            </p>
          </div>

          <div className="v7-space-hero-right">
            <div className="v7-member-badge-card">
              <div className="v7-member-avatar-chip">
                <AvatarRenderer
                  appearance={fan.appearance}
                  role="fan"
                  size="sm"
                  displayName={fan.name}
                  digitalLook={fan.look}
                  accessoryId={fan.accessory}
                />
              </div>
              <div className="v7-member-chip-info">
                <strong>{fan.name}</strong>
                <small>{fan.sample ? 'Fandom VieWorld' : 'Thành viên cộng đồng'}</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      <DisplayRoomScene
        fan={fan}
        items={displayItems}
        onSelect={slot => {
          const i = displayItems.findIndex(v => v.slot === slot);
          setSelected(i < 0 ? null : i);
        }}
        isVinylPlaying={isVinylPlaying}
        isLightstickActive={isLightstickActive}
        onToggleVinyl={() => setIsVinylPlaying(p => !p)}
        onToggleLightstick={() => setIsLightstickActive(p => !p)}
        heartsCount={heartsCount}
        onLike={() => {
          setIsLiked(p => !p);
          setHeartsCount(c => (isLiked ? c - 1 : c + 1));
        }}
        isLiked={isLiked}
        isOwner={false}
        isEditMode={false}
      />

      <section className="v5-public-items" aria-label="Những món được trưng bày">
        <div className="v7-public-items-header">
          <h2>Kỷ vật và câu chuyện của {fan.name.split(' ')[0]}</h2>
          <p>Chạm vào một món trên kệ để xem câu chuyện.</p>
        </div>

        <div className="v5-public-item-links">
          {visibleItems.map((v, i) => (
            <button
              className={`fw-text-button ${selected === i ? 'active' : ''}`}
              key={i}
              onClick={() => setSelected(i)}
              aria-pressed={selected === i}
            >
              {v.title} ↗
            </button>
          ))}
        </div>

        {!visibleItems.length && <p>Chủ phòng chưa trưng bày kỷ vật nào.</p>}

        {item && (
          <article className="v5-item-detail" aria-live="polite">
            {item.image && (
              <img
                src={
                  item.image.startsWith('shirt')
                    ? '/images/world-v6/shirt-cutout.webp'
                    : `${MERCH_IMAGE_ROOT}/${item.image}.png`
                }
                alt={item.title}
              />
            )}
            <div>
              <span className="v7-item-detail-tag">Kỷ vật trưng bày</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <button className="fw-text-button" onClick={() => setSelected(null)}>
                Đóng xem nhanh
              </button>
            </div>
          </article>
        )}
      </section>

      <section className="v5-identity v7-identity-card">
        <div className="v7-identity-left">
          <p className="fw-eyebrow">THẺ THÔNG TIN CỦA {fan.name.toLocaleUpperCase('vi')}</p>
          <h2>{fan.mood}</h2>
          <p>{fan.bio}</p>
          {fan.badge && <span className="v5-badge">Người giữ ký ức · {fan.badge}</span>}
        </div>
        <div className="v7-identity-right">
          <h3>Đang mặc</h3>
          <p>
            {[
              fan.look?.shirt ? 'Áo Star Club' : null,
              fan.look?.hat ? 'Nón Everyday Star' : null,
              fan.look?.lightstick ? 'Star Light' : null,
            ]
              .filter(Boolean)
              .join(' · ') || 'Diện mạo cơ bản'}
          </p>
          <small>
            {fan.sample
              ? 'Tủ đồ dựng sẵn cho thành viên mẫu'
              : 'Trang phục hiện đang sử dụng'}
          </small>
        </div>
      </section>

      {/* Guestbook Wall */}
      <RoomGuestbook fanId={fan.id} isOwner={own} />

      {/* Polaroid Fandom Pass Modal for Member */}
      <FandomPolaroidPass
        isOpen={isPassOpen}
        onClose={() => setIsPassOpen(false)}
        fanName={fan.name}
        avatarPreset={fan.appearance}
        digitalLook={fan.look}
        accessoryId={fan.accessory}
        mood={fan.mood}
        badge={fan.badge}
        companionDays={fan.sample ? 95 : 128}
        items={displayItems}
        fanId={fan.id}
      />
    </div>
  );
}
