import React from 'react';
import {
  Award,
  CalendarHeart,
  Gift,
  LifeBuoy,
  Package,
  Shirt,
  Sparkles,
} from 'lucide-react';

type RoomSection = 'capsules' | 'benefits' | 'orders' | 'support' | 'wardrobe' | 'follows';

interface MyRoomSceneProps {
  displayName: string;
  accessoryName?: string;
  capsuleCount: number;
  benefitCount: number;
  orderCount: number;
  supportCount: number;
  upcomingCount: number;
  onOpenSection: (section: RoomSection) => void;
}

export const MyRoomScene: React.FC<MyRoomSceneProps> = ({
  displayName,
  accessoryName,
  capsuleCount,
  benefitCount,
  orderCount,
  supportCount,
  upcomingCount,
  onOpenSection,
}) => (
  <section className="my-room" aria-label={`Căn phòng cá nhân của ${displayName}`} data-testid="my-room-scene">
    <div className="my-room__wash" aria-hidden="true" />
    <div className="my-room__window" aria-hidden="true">
      <span className="my-room__window-moon" />
      <span className="my-room__window-city" />
    </div>
    <div className="my-room__poster" aria-hidden="true">
      <span>NEON</span>
      <strong>MEMORIES</strong>
    </div>
    <div className="my-room__shelf" aria-hidden="true">
      <span className="my-room__ticket">A</span>
      <span className="my-room__star"><Sparkles size={19} /></span>
      <span className="my-room__record" />
    </div>
    <div className="my-room__rug" aria-hidden="true" />
    <div className="my-room__fan" aria-hidden="true">
      <span className="my-room__fan-head">{displayName.charAt(0)}</span>
      <span className="my-room__fan-body" />
      {accessoryName && <span className="my-room__fan-accessory">✦</span>}
    </div>

    <div className="my-room__copy">
      <span className="my-room__eyebrow"><Sparkles size={13} /> Không gian của bạn</span>
      <h1>{displayName}&apos;s World</h1>
      <p>Những gì bạn đã tham gia, chọn và giữ lại đều ở đây.</p>
    </div>

    <button className="room-hotspot room-hotspot--shelf" type="button" onClick={() => onOpenSection('capsules')}>
      <span><Gift size={18} /></span>
      <strong>Kệ kỷ niệm</strong>
      <small>{capsuleCount ? `${capsuleCount} capsule` : 'Đang chờ kỷ niệm đầu tiên'}</small>
    </button>

    <button className="room-hotspot room-hotspot--wardrobe" type="button" onClick={() => onOpenSection('wardrobe')}>
      <span><Shirt size={18} /></span>
      <strong>Tủ đồ</strong>
      <small>{accessoryName ? 'Đang mặc phụ kiện ✦' : 'Chọn phong cách'}</small>
    </button>

    <button className="room-hotspot room-hotspot--calendar" type="button" onClick={() => onOpenSection('follows')}>
      <span><CalendarHeart size={18} /></span>
      <strong>Lịch hẹn</strong>
      <small>{upcomingCount} sự kiện đã nhắc</small>
    </button>

    <button className="room-hotspot room-hotspot--benefit" type="button" onClick={() => onOpenSection('benefits')}>
      <span><Award size={18} /></span>
      <strong>Ví quyền lợi</strong>
      <small>{benefitCount} quyền lợi</small>
    </button>

    <button className="room-hotspot room-hotspot--parcel" type="button" onClick={() => onOpenSection('orders')}>
      <span><Package size={18} /></span>
      <strong>Góc sở hữu</strong>
      <small>{orderCount} đơn hàng</small>
    </button>

    <button className="room-hotspot room-hotspot--help" type="button" onClick={() => onOpenSection('support')}>
      <LifeBuoy size={17} />
      <span>{supportCount ? `${supportCount} hồ sơ hỗ trợ` : 'Cần trợ giúp?'}</span>
    </button>

    <div className="my-room__hint">Chạm vào đồ vật để mở</div>
  </section>
);
