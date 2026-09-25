import type { Session, World } from '../domain/types';

export interface StandeeEvent {
  kind: 'live' | 'open' | 'upcoming' | 'drop';
  eyebrow: string;
  title: string;
  actionLabel: string;
  to: string;
  artistName?: string;
  sessionTitle?: string;
  subtitle?: string;
  timeLabel?: string;
}

/**
 * Derives truthful session status taking into account demo time clock.
 * - 'live': actively broadcasting ('running')
 * - 'open': lobby is open for early admission ('open'), but broadcast hasn't started
 * - 'upcoming': scheduled session with scheduledStartTime >= demoTime
 * - 'ended': explicitly ended or scheduled in the past
 * - 'paused': temporarily paused
 * - 'cancelled': cancelled
 */
export function getTruthfulSessionStatus(
  session: Session,
  demoTime: string
): 'live' | 'open' | 'upcoming' | 'ended' | 'paused' | 'cancelled' {
  if (session.status === 'running') return 'live';
  if (session.status === 'open') return 'open';
  if (session.status === 'paused') return 'paused';
  if (session.status === 'cancelled') return 'cancelled';
  if (session.status === 'ended') return 'ended';

  if (session.status === 'scheduled') {
    if (session.scheduledStartTime && session.scheduledStartTime < demoTime) {
      return 'ended';
    }
    return 'upcoming';
  }

  return 'ended';
}

/**
 * Resolves the top standee banner event with deterministic priority:
 * 1. Running live broadcast (LIVE NOW)
 * 2. Open lobby admission (SẢNH ĐANG MỞ)
 * 3. Nearest valid upcoming scheduled session (SẮP TỚI, filtered by demoTime)
 * 4. Merch drop
 */
function cleanSessionTitle(title?: string, artistName?: string): string {
  if (!title) return '';
  if (artistName && title.startsWith(artistName)) {
    const cleaned = title.slice(artistName.length).replace(/^[\s:·\-–—]+/, '').trim();
    if (cleaned) return cleaned;
  }
  return title;
}

export function resolveStandeeEvent(
  sessions: Record<string, Session> | Session[],
  worlds: Record<string, World>,
  demoTime: string,
  override?: string | null
): StandeeEvent | null {
  if (override === 'none') return null;

  const sessionList = Array.isArray(sessions) ? sessions : Object.values(sessions || {});

  // 1. Priority 1: LIVE EVENT (sự kiện trọng điểm đang diễn ra)
  const runningSessions = sessionList.filter(s => s.status === 'running');
  if (override === 'live' || (override !== 'upcoming' && override !== 'drop' && runningSessions.length > 0)) {
    const s = runningSessions[0];
    const artist = s?.worldId ? worlds[s.worldId] : undefined;
    const artistName = artist?.name || 'Artist A';
    const cleanedTitle = cleanSessionTitle(s?.title, artistName) || 'Gặp gỡ Fandom';
    return {
      kind: 'live',
      eyebrow: 'THÔNG BÁO CHUNG',
      title: artistName,
      artistName,
      sessionTitle: cleanedTitle,
      subtitle: 'Sự kiện kết nối đặc biệt đang diễn ra trong Artist World',
      timeLabel: 'Đang diễn ra',
      actionLabel: 'THAM GIA NGAY →',
      to: s ? `/sessions/${encodeURIComponent(s.id)}` : '/explore',
    };
  }

  // 2. Priority 2: LOBBY OPEN (sảnh đang mở đón fan)
  const openSessions = sessionList.filter(s => s.status === 'open');
  if (override !== 'upcoming' && override !== 'drop' && openSessions.length > 0) {
    const s = openSessions[0];
    const artist = s?.worldId ? worlds[s.worldId] : undefined;
    const artistName = artist?.name || 'Artist A';
    return {
      kind: 'open',
      eyebrow: 'THÔNG BÁO CHUNG',
      title: artistName,
      artistName,
      sessionTitle: s?.title || 'Sảnh chờ buổi giao lưu',
      subtitle: 'Đang mở sảnh đón người hâm mộ vào giao lưu',
      timeLabel: 'Sảnh mở sớm',
      actionLabel: 'VÀO SẢNH NGAY →',
      to: s ? `/sessions/${encodeURIComponent(s.id)}` : '/explore',
    };
  }

  // 3. Priority 3: STARTING SOON / UPCOMING (sự kiện lớn sắp tới)
  const scheduledSessions = sessionList
    .filter(s => s.status === 'scheduled' && (!s.scheduledStartTime || s.scheduledStartTime >= demoTime))
    .sort((a, b) => (a.scheduledStartTime || '').localeCompare(b.scheduledStartTime || ''));

  if (override === 'upcoming' || (override !== 'drop' && scheduledSessions.length > 0)) {
    const s = scheduledSessions[0];
    const artist = s?.worldId ? worlds[s.worldId] : undefined;
    const artistName = artist?.name || 'KAI';
    const timeStr = s.scheduledStartTime ? new Date(s.scheduledStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
    return {
      kind: 'upcoming',
      eyebrow: 'THÔNG BÁO CHUNG',
      title: artistName,
      artistName,
      sessionTitle: s.title || 'Sự kiện âm nhạc mới',
      subtitle: timeStr ? `Lịch hẹn gặp gỡ lúc ${timeStr} hôm nay` : 'Lịch hẹn sự kiện mới trong Artist World',
      timeLabel: timeStr ? `${timeStr} hôm nay` : 'Sắp diễn ra',
      actionLabel: 'XEM LỊCH HẸN →',
      to: s ? `/sessions/${encodeURIComponent(s.id)}` : '/explore',
    };
  }

  // 4. Priority 4: NEW DROP (đợt phát hành vật phẩm kỷ niệm)
  if (override === 'drop') {
    return {
      kind: 'drop',
      eyebrow: 'THÔNG BÁO CHUNG',
      title: 'VieSHOP',
      artistName: 'VieSHOP',
      sessionTitle: 'Bộ sưu tập kỷ niệm giới hạn',
      subtitle: 'Mở bán độc quyền vật phẩm chính thức cho fandom',
      timeLabel: 'Vừa lên kệ',
      actionLabel: 'GHÉ SHOP NGAY →',
      to: '/shop',
    };
  }

  // 5. Default General Announcement (Quảng trường VieWorld)
  return {
    kind: 'upcoming',
    eyebrow: 'THÔNG BÁO CHUNG',
    title: 'ĐẠI HỘI VIEWORLD',
    artistName: 'VieWorld',
    sessionTitle: 'SỰ KIỆN QUẢNG TRƯỜNG',
    subtitle: 'Không gian kết nối người hâm mộ & gặp gỡ thần tượng',
    actionLabel: 'KHÁM PHÁ NGAY →',
    to: '/explore',
  };
}
