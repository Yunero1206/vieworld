import { useState } from 'react';
import { loadPrivacySettings, savePrivacySettings, type SpacePrivacySettings } from '../../world/privacy';
import { UtilityDialog } from './UtilityDialog';
import { useApp } from '../../context/AppContext';

export function PrivacyDialog({ onClose, onSave }: { onClose: () => void; onSave?: (settings: SpacePrivacySettings) => void }) {
  const { state } = useApp();
  const [draft, setDraft] = useState(() => loadPrivacySettings(state.activeTenantId, state.fanProfile.id));
  const toggles: { key: 'showVisitCount' | 'guestbookEnabled' | 'showMembershipSignal'; label: string; description: string }[] = [
    { key: 'showVisitCount', label: 'Hiện lượt ghé phòng', description: 'Một lời chào nhỏ, không dùng để xếp hạng fan.' },
    { key: 'guestbookEnabled', label: 'Hiện sổ lưu bút', description: 'Tắt để tạm ẩn sổ và dừng nhận lời nhắn. Những lời nhắn đã có không bị xóa.' },
    { key: 'showMembershipSignal', label: 'Hiện dấu hội viên trong My Space', description: 'Chỉ hiện khi bạn có hội viên đang hoạt động; không thay đổi quyền vào Hall hay badge trong chat.' },
  ];
  return <UtilityDialog title="Quyền riêng tư My Space" subtitle="Chọn cách chia sẻ phòng của bạn, không phải toàn bộ bộ sưu tập." onClose={onClose}
    testId="space-privacy-dialog" footer={<><button className="vw-utility-secondary" onClick={onClose}>Hủy</button><button className="vw-utility-primary" onClick={() => {
      savePrivacySettings(draft, state.activeTenantId, state.fanProfile.id); onSave?.(draft); onClose();
    }}>Lưu lựa chọn</button></>}>
    <label className="vw-account-field" htmlFor="privacy-room-visibility">Ai có thể ghé phòng
      <select id="privacy-room-visibility" value={draft.roomVisibility} onChange={e => setDraft({ ...draft, roomVisibility: e.target.value as SpacePrivacySettings['roomVisibility'] })}>
        <option value="everyone">Mọi người</option><option value="users">Người đã đăng nhập VieWorld</option><option value="private">Chỉ mình tôi</option>
      </select>
    </label>
    <p className="vw-utility-muted">Khách chỉ xem những món bạn chọn trưng. Ghi chú kỷ niệm, đơn hàng và thông tin liên hệ không nằm trong hồ sơ công khai.</p>
    <div className="vw-privacy-options">{toggles.map(toggle => <label className="vw-privacy-option" key={toggle.key}>
      <span><strong>{toggle.label}</strong><small>{toggle.description}</small></span>
      <input type="checkbox" checked={draft[toggle.key]} onChange={e => setDraft({ ...draft, [toggle.key]: e.target.checked })}/>
    </label>)}</div>
    <aside className="vw-utility-note"><strong>Thiết lập trong bản demo</strong><p>Lựa chọn lưu trên trình duyệt này. Khi triển khai thật, quyền truy cập cần được kiểm tra ở máy chủ; đăng nhập demo không bảo vệ dữ liệu trên thiết bị dùng chung.</p></aside>
  </UtilityDialog>;
}
