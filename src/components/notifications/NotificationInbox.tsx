import { CheckCheck, Leaf } from 'lucide-react';
import type { DisplayNotification } from './notification.types';
import { NotificationNotice } from './NotificationNotice';

/** One responsive inbox. Reading a notice never reorders the list under the pointer. */
export function NotificationInbox({ notifications, onSelectNotification, onMarkAllAsRead }: {
  notifications: DisplayNotification[];
  onSelectNotification: (item: DisplayNotification) => void;
  onMarkAllAsRead: () => void;
}) {
  const sorted = [...notifications].sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const unread = notifications.filter(item => !item.read).length;
  return <section className="vw-notification-inbox">
    <header className="vw-inbox-heading">
      <span className="vw-inbox-brand"><Leaf size={18} aria-hidden="true"/> VieWorld</span>
      <h2 id="vw-notif-dialog-title">Bảng thông báo</h2>
      <p>{unread ? `${unread} chưa đọc` : 'Bạn đã xem hết thông báo'} · {notifications.length} thông báo</p>
    </header>
    <div className="vw-inbox-scroll" role="region" aria-label="Tất cả thông báo" tabIndex={0}>
      {sorted.length ? <ul>{sorted.map((item,index) => <li key={item.id}>
        <NotificationNotice item={item} index={index} onSelect={onSelectNotification}/>
      </li>)}</ul> : <p className="vw-inbox-empty">Mọi thứ đều yên tĩnh. Chưa có thông báo nào.</p>}
    </div>
    <footer className="vw-inbox-footer"><span>Chọn một thông báo để mở.</span>
      <button type="button" disabled={!unread} onClick={onMarkAllAsRead}><CheckCheck size={16} aria-hidden="true"/>Đánh dấu tất cả đã đọc</button>
    </footer>
  </section>;
}
