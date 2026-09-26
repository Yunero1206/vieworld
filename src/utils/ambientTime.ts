export type AmbientPeriod = 'morning' | 'day' | 'sunset' | 'night';

export interface AmbientDetails {
  period: AmbientPeriod;
  label: string;
  icon: string;
  greeting: string;
  themeHue: string;
  description: string;
}

export const AMBIENT_DETAILS: Record<AmbientPeriod, AmbientDetails> = {
  morning: {
    period: 'morning',
    label: 'Nắng sớm',
    icon: '🌅',
    greeting: 'Chào buổi sáng trong lành',
    themeHue: '#EAB308',
    description: 'Ánh sáng ban mai dịu mát, khởi đầu một ngày cùng những giai điệu mới.',
  },
  day: {
    period: 'day',
    label: 'Ban ngày',
    icon: '☀️',
    greeting: 'Chào ngày mới ngập tràn năng lượng',
    themeHue: '#3B82F6',
    description: 'Ánh sáng trong trẻo tự nhiên, khám phá mọi ngóc ngách của các thế giới.',
  },
  sunset: {
    period: 'sunset',
    label: 'Hoàng hôn',
    icon: '🌇',
    greeting: 'Chào buổi chiều hoàng hôn ấm áp',
    themeHue: '#F97316',
    description: 'Sắc vàng cam êm dịu, lắng nghe những bản acoustic sau ngày dài.',
  },
  night: {
    period: 'night',
    label: 'Đêm tĩnh lặng',
    icon: '🌙',
    greeting: 'Chào đêm tĩnh lặng và ấm cúng',
    themeHue: '#8B5CF6',
    description: 'Không gian lofi êm ái, đắm chìm trong giai điệu và thắp sáng căn phòng.',
  },
};

export const AMBIENT_PERIODS: AmbientPeriod[] = ['morning', 'day', 'sunset', 'night'];

/**
 * Determine ambient time-of-day based on given ISO time string (or current system time).
 * Evaluated in Asia/Ho_Chi_Minh (+07:00).
 */
export function getAmbientPeriodFromTime(isoString?: string): AmbientPeriod {
  try {
    const date = isoString ? new Date(isoString) : new Date();
    const hourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: 'numeric',
      hour12: false,
    }).format(date);
    const hour = parseInt(hourStr, 10);

    if (hour >= 5 && hour < 11) {
      return 'morning';
    } else if (hour >= 11 && hour < 17) {
      return 'day';
    } else if (hour >= 17 && hour < 20) {
      return 'sunset';
    } else {
      return 'night';
    }
  } catch {
    return 'night';
  }
}

export function cycleAmbientPeriod(current: AmbientPeriod): AmbientPeriod {
  const index = AMBIENT_PERIODS.indexOf(current);
  return AMBIENT_PERIODS[(index + 1) % AMBIENT_PERIODS.length];
}
