import { Session } from '../domain/types';

export interface ArtistNote {
  id: string; worldId: string; author: string; title: string; body: string;
  sessionId?: string; publishedAt: string;
}

// Authored fictional demo content; never live chat or generated impersonation.
export const ARTIST_NOTES: ArtistNote[] = [
  { id: 'acoustic-letter', worldId: 'artist-a', author: 'Artist A', title: 'Một chỗ ngồi, một câu chuyện.',
    body: 'Có những bài hát bắt đầu từ một câu chuyện rất nhỏ. Nhà nhạc hôm nay dành một khoảng yên để chúng mình nghe nhạc và chia sẻ những điều ấy. Bạn muốn mang câu chuyện nào tới buổi gặp?',
    sessionId: 'session-dropin-01', publishedAt: '2026-09-09T10:00:00+07:00' },
  { id: 'mira-letter', worldId: 'artist-mira', author: 'MIRA', title: 'Dưới ánh trăng và những tầng mây.',
    body: 'Đêm nay hãy cùng thả lỏng theo những giai điệu dream pop và lofi R&B êm dịu nhé. Đừng quên chuẩn bị chiếc Lunar Lightstick và một tách trà ấm.',
    sessionId: 'session-mira-dropin', publishedAt: '2026-09-12T20:00:00+07:00' },
  { id: 'kai-letter', worldId: 'artist-kai', author: 'KAI', title: 'Bật nhịp pulse cho đêm thành phố.',
    body: 'Future beats và những rung động bass điện tử đang sẵn sàng. Hãy mang Cyber Bomber và cùng KAI đếm ngược tới buổi live studio tiếp theo!',
    sessionId: 'session-kai-pulse', publishedAt: '2026-09-12T21:00:00+07:00' },
  { id: 'neon-letter', worldId: 'neon-sessions', author: 'Đội ngũ Neon Sessions', title: 'Hẹn nhau ở một nhịp khác.',
    body: 'Một góc nghe dành cho những người thích khám phá âm thanh. Ghé nhà nhạc, chọn một phiên và tìm nhịp điệu của riêng bạn. Lịch mới sẽ xuất hiện ngay tại sân khấu này.',
    publishedAt: '2026-09-09T11:00:00+07:00' },
];

export function nextMoment(sessions: Session[], worldId: string) {
  const rank: Partial<Record<Session['status'], number>> = { running: 0, open: 1, scheduled: 2, paused: 3 };
  return sessions.filter(s => s.worldId === worldId && rank[s.status] !== undefined)
    .sort((a, b) => rank[a.status]! - rank[b.status]! || Date.parse(a.scheduledStartTime) - Date.parse(b.scheduledStartTime))[0];
}

export function momentTime(value: string) {
  const time = new Date(value);
  return Number.isNaN(time.getTime()) ? 'Lịch đang cập nhật' : new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(time);
}
export const ORDER_LABELS = { pending: 'Chờ xác nhận', paid: 'Đã thanh toán · Chờ giao', fulfilled: 'Đã nhận', cancelled: 'Đã hủy', refunded: 'Đã hoàn tiền' };
