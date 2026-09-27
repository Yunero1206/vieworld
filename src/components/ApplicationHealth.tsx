import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { buildStorageKey, collectLocalDemoBackup, SCHEMA_VERSION } from '../services/storageAdapter';
import { StatusNotice } from './StatusNotice';

/** Non-blocking device status. Never reload, reset data, or resume media automatically. */
export function ApplicationHealth() {
  const { persistenceConflict, state } = useApp();
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [exported, setExported] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  function backupCurrent() {
    const dump = collectLocalDemoBackup();
    dump[buildStorageKey(state.activeTenantId, state.fanProfile.id)] = JSON.stringify({ schemaVersion: SCHEMA_VERSION, savedAt: new Date().toISOString(), state });
    const url = URL.createObjectURL(new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'vieworld-current-tab-backup.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000); setExported(true);
  }
  return <>
    {offline && <StatusNotice message="Đang ngoại tuyến. Nội dung đã lưu đệm có thể vẫn mở được; nội dung chưa tải cần có mạng. Demo này không gửi dữ liệu đến máy chủ." type="warning"/>}
    {persistenceConflict && <section className="vw-device-notice" aria-label="Dữ liệu thay đổi ở tab khác">
      <p role="status">Dữ liệu demo vừa thay đổi ở tab khác. Tab này đã tạm dừng tự lưu để tránh ghi đè. Bạn có thể giữ bản của tab này trước khi tải lại dữ liệu mới.</p>
      <div><button type="button" className="btn btn-secondary" onClick={backupCurrent}>{exported ? 'Đã xuất bản của tab này' : 'Xuất bản sao tab này'}</button><button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Tải lại dữ liệu mới</button></div>
      <small>Bản sao có thể chứa thông tin liên hệ demo. Giữ riêng trên thiết bị; tính năng nhập lại bản sao chưa có trong UI.</small>
    </section>}
  </>;
}
