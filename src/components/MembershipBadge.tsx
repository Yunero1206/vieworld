import { Moon, Star, Zap, Flower2, Music2, Heart, Leaf } from 'lucide-react';
import { MEMBERSHIP_MILESTONES } from '../world/membershipBadge';
export function MembershipBadge({ artistId, months, demo = false }: { artistId: string; months: number | null; demo?: boolean }) {
  if (months === null) return null;
  const tier = MEMBERSHIP_MILESTONES.filter(value => value <= Math.max(0, months)).length - 1;
  const registry: Record<string, number> = { 'artist-a':0, 'artist-mira':1, 'artist-kai':2, 'artist-b':3, 'artist-c':4, 'artist-d':5, 'artist-e':6 };
  const variant = registry[artistId] ?? [...artistId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 7;
  const Icon = [Star, Moon, Zap, Flower2, Music2, Heart, Leaf][variant];
  const label = `${demo ? 'Minh họa · ' : ''}Hội viên${months < 0 ? ' · chưa có ngày bắt đầu' : months === 0 ? ' mới' : ` · ${months} tháng đồng hành`}`;
  return <span className={`vw-member-badge badge-world-${variant} badge-tier-${tier}`} role="img" aria-label={label} title={label}><Icon size={13} aria-hidden="true" fill={tier >= 2 ? 'currentColor' : 'none'} />{tier >= 3 && <i aria-hidden="true"/>}</span>;
}
