import { useState } from 'react';
import { Leaf, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UtilityDialog } from './UtilityDialog';

export function AuthOverlay({ onClose, appearance, onToggleAppearance }: { onClose: () => void; appearance?: 'light' | 'dark'; onToggleAppearance?: () => void }) {
  const { state, localProfiles, registerDemoProfile, signInDemoProfile } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [selectedFanId, setSelectedFanId] = useState(state.fanProfile.id);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const profiles = localProfiles();
  const chosenFanId = profiles.some(profile => profile.fanId === selectedFanId) ? selectedFanId : profiles[0]?.fanId;
  const continueDemo = (provider: 'google' | 'facebook') => {
    const problem = mode === 'register'
      ? registerDemoProfile(displayName, provider)
      : chosenFanId ? signInDemoProfile(chosenFanId, provider) : 'Chưa có hồ sơ trên thiết bị. Hãy tạo một hồ sơ mới.';
    setError(problem);
    if (!problem) setDone(true);
  };
  return <UtilityDialog title={done ? 'Chào bạn, ghé chơi nhé.' : 'Một góc nhỏ cho điều mình yêu.'}
    subtitle="Mỗi hồ sơ demo có My Space và dữ liệu riêng trên thiết bị này." compact onClose={onClose} testId="demo-auth-overlay">
    {done ? <div className="vw-auth-success" role="status"><Leaf size={32}/><h3>Đã mở góc của {state.fanProfile.displayName}</h3>
      <p>{mode === 'register' ? 'Phòng mới bắt đầu trống; bạn tự chọn điều muốn giữ và trưng bày.' : 'Phòng, bộ sưu tập và hoạt động trước đây của hồ sơ này đã được giữ lại.'} Đăng nhập demo không tự cấp hội viên.</p>
      <button className="vw-utility-primary" onClick={onClose}>Tiếp tục từ đây</button></div> : <>
      <div className="vw-utility-segments" role="group" aria-label="Chọn đăng nhập hoặc đăng ký">
        <button aria-pressed={mode === 'login'} onClick={() => { setMode('login'); setError(null); }}>Đăng nhập</button>
        <button aria-pressed={mode === 'register'} onClick={() => { setMode('register'); setError(null); }}>Đăng ký</button>
      </div>
      <p className="vw-auth-intro">{mode === 'register' ? 'Tạo một hồ sơ mới, tách khỏi phòng mẫu của Linh.' : 'Chọn đúng hồ sơ đã lưu trên trình duyệt này để ghé lại.'}</p>
      {mode === 'register' ? <label className="vw-account-field" htmlFor="demo-display-name">Tên hiển thị trong VieWorld
        <input id="demo-display-name" value={displayName} onChange={event => setDisplayName(event.target.value)} maxLength={60} autoComplete="off" placeholder="Bạn muốn mọi người gọi mình là gì?" />
      </label> : <label className="vw-account-field" htmlFor="demo-profile-choice">Hồ sơ trên thiết bị
        <select id="demo-profile-choice" value={chosenFanId || ''} onChange={event => setSelectedFanId(event.target.value)}>
          {!profiles.length && <option value="">Chưa có hồ sơ</option>}
          {profiles.map(profile => <option key={profile.fanId} value={profile.fanId}>{profile.displayName}{profile.fanId === 'fan-linh' ? ' · hồ sơ mẫu' : ''}</option>)}
        </select>
      </label>}
      {error && <p className="vw-utility-error" role="alert">{error}</p>}
      <div className="vw-auth-providers">
        <button onClick={() => continueDemo('google')}><Mail size={21}/>Tiếp tục · mô phỏng Google<span>Demo</span></button>
        <button onClick={() => continueDemo('facebook')}><b className="vw-provider-f" aria-hidden="true">f</b>Tiếp tục · mô phỏng Facebook<span>Demo</span></button>
      </div>
      <aside className="vw-utility-note"><strong>Chỉ mô phỏng, không kết nối tài khoản thật.</strong>
        <p>Google/Facebook ở đây chỉ là lựa chọn giao diện. Không xác minh danh tính, không dùng mật khẩu và không đồng bộ thiết bị. Ai dùng chung trình duyệt đều có thể mở các hồ sơ demo đã lưu; đừng nhập thông tin thật.</p></aside>
      {onToggleAppearance && <button className="vw-utility-text" onClick={onToggleAppearance}>Chuyển sang giao diện {appearance === 'dark' ? 'sáng' : 'tối'}</button>}
      <button className="vw-utility-text" onClick={onClose}>Để sau, tiếp tục khám phá</button>
    </>}
  </UtilityDialog>;
}
