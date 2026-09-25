export type NotificationCategory =
  | 'artist'
  | 'moment'
  | 'shop'
  | 'system'
  | 'session'
  | 'capsule'
  | 'order'
  | 'support'
  | 'promotional'
  | 'space';

export interface DisplayNotification {
  id: string;
  type: NotificationCategory;
  categoryLabel: string;
  categoryDotColor: string;
  title: string;
  body?: string;
  createdAt?: string;
  timeAgo: string;
  read: boolean;
  targetRoute?: string;
  thumbnailUrl?: string;
  ctaLabel?: string;
  priority?: number;
}
