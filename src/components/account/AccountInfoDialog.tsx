import { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { privateContact, validateContact, type PrivateContact } from '../../world/account';
import { UtilityDialog } from './UtilityDialog';

export function AccountInfoDialog({ onClose }: { onClose: () => void }) {
  const { state, dispatch, isMemoryFallback } = useApp();
  const [draft, setDraft] = useState(() => privateContact(state));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  function field(key: keyof PrivateContact, label: string, options: { type?: string; autoComplete?: string; maxLength: number }) {
    return <label className="vw-account-field" htmlFor={`account-${key}`}>{label}<input id={`account-${key}`} {...options}
      value={draft[key]} onChange={e => { setDraft({ ...draft, [key]: e.target.value }); setMessage(''); setError(''); }}/></label>;
  }
  return <UtilityDialog title="Thông tin tài khoản" subtitle="Liên hệ và nơi nhận — không phải hồ sơ My Space công khai." onClose={onClose}
    testId="account-info-dialog" footer={<><span role={error ? 'alert' : message ? 'status' : undefined} className={error ? 'vw-utility-error' : undefined}>
      {error || message || 'Không hiển thị trong phòng hay Hall.'}</span><button type="submit" form="private-account-form" className="vw-utility-primary">Lưu thông tin</button></>}>
    <aside className="vw-utility-note"><LockKeyhole size={19}/><div><strong>Hãy dùng dữ liệu giả để thử.</strong><p>Bản demo lưu cục bộ trong trình duyệt, chưa có bảo mật tài khoản hay giao hàng thật. Người dùng chung thiết bị vẫn có thể truy cập dữ liệu.</p></div></aside>
    <form id="private-account-form" className="vw-account-form" onSubmit={e => {
      e.preventDefault(); const issue = validateContact(draft);
      if (issue) { setError(issue); setMessage(''); return; }
      dispatch({ type: 'SAVE_PRIVATE_CONTACT', contact: draft }); setError('');
      setMessage(isMemoryFallback ? 'Đã giữ tạm trong phiên này; trình duyệt không cho lưu lâu dài.' : 'Đã lưu thông tin demo trong trình duyệt này.');
    }}>
      <fieldset><legend>Liên hệ</legend><p>Dùng khi cần liên hệ về đơn hàng. Không phải email Google/Facebook đã xác minh.</p>
        {field('email', 'Email liên hệ (không bắt buộc)', { type: 'email', autoComplete: 'email', maxLength: 254 })}
      </fieldset>
      <fieldset><legend>Nơi nhận hàng</legend><p>Có thể để trống toàn bộ. Khi thêm nơi nhận, điền đủ các trường bên dưới; thông tin này chưa tự áp vào đơn hàng cũ.</p>
        <div className="vw-account-grid">{field('recipient', 'Tên người nhận', { autoComplete: 'shipping name', maxLength: 100 })}
          {field('phone', 'Số điện thoại', { type: 'tel', autoComplete: 'shipping tel', maxLength: 30 })}
          {field('country', 'Quốc gia', { autoComplete: 'shipping country-name', maxLength: 80 })}
          {field('city', 'Tỉnh / thành phố', { autoComplete: 'shipping address-level1', maxLength: 100 })}</div>
        {field('address', 'Địa chỉ nhận (số nhà, đường, phường/xã)', { autoComplete: 'shipping street-address', maxLength: 240 })}
        {field('deliveryNote', 'Ghi chú giao hàng (không bắt buộc)', { maxLength: 200 })}
      </fieldset>
    </form>
  </UtilityDialog>;
}
