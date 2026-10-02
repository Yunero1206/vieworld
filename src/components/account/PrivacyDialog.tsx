import { useState } from 'react';
import { loadPrivacySettings, savePrivacySettings, type SpacePrivacySettings } from '../../world/privacy';
import { UtilityDialog } from './UtilityDialog';
import { useApp } from '../../context/AppContext';

export function PrivacyDialog({ onClose, onSave }: { onClose: () => void; onSave?: (settings: SpacePrivacySettings) => void }) {
  const { state, dispatch } = useApp();
  const [sharing, setSharing] = useState(state.fanProfile.sharing || { communityPresenceEnabled: false, hallPublicProjectionEnabled: false });
  const [draft, setDraft] = useState(() => loadPrivacySettings(state.activeTenantId, state.fanProfile.id));
  const toggles: { key: 'showVisitCount' | 'guestbookEnabled' | 'showMembershipSignal'; label: string; description: string }[] = [
    { key: 'showVisitCount', label: 'Hiện lượt ghé phòng', description: 'Một lời chào nhỏ, không dùng để xếp hạng fan.' },
    { key: 'guestbookEnabled', label: 'Hiện sổ lưu bút', description: 'Tắt để tạm ẩn sổ và dừng nhận lời nhắn. Những lời nhắn đã có không bị xóa.' },
    { key: 'showMembershipSignal', label: 'Hiện dấu hội viên trong My Space', description: 'Chỉ hiện khi bạn có hội viên đang hoạt động; không thay đổi quyền vào Hall hay badge trong chat.' },
  ];
  return <UtilityDialog title="Quyền riêng tư & chia sẻ" subtitle="Phòng, avatar và lời nhắn có lựa chọn riêng." onClose={onClose}
    testId="space-privacy-dialog" footer={<><button className="vw-utility-secondary" onClick={onClose}>Hủy</button><button className="vw-utility-primary" onClick={() => {
      savePrivacySettings(draft, state.activeTenantId, state.fanProfile.id); dispatch({ type: 'SET_FAN_SHARING', ...sharing }); onSave?.(draft); onClose();
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
    <h3>Hiện diện trong cộng đồng</h3>
    <label className="vw-privacy-option"><span><strong>Cho phép avatar xuất hiện cùng cộng đồng</strong><small>Không công khai tên, phòng hay lời nhắn. Demo chưa đưa avatar sang tài khoản khác.</small></span><input type="checkbox" checked={sharing.communityPresenceEnabled} onChange={e => setSharing({ ...sharing, communityPresenceEnabled: e.target.checked })}/></label>
    <h3>Lời nhắn trong Hall</h3>
    <label className="vw-privacy-option"><span><strong>Cho phép đề xuất lời nhắn ngoài Hall</strong><small>Vẫn cần bạn đồng ý ở từng lời nhắn và được duyệt. Tắt sẽ dừng mọi đề xuất, không xóa tin trong Hall.</small></span><input type="checkbox" checked={sharing.hallPublicProjectionEnabled} onChange={e => setSharing({ ...sharing, hallPublicProjectionEnabled: e.target.checked })}/></label>
    <p className="vw-utility-muted">Lựa chọn được lưu riêng cho tài khoản demo trên thiết bị này.</p>
  </UtilityDialog>;
}
