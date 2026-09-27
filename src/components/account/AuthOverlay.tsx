import { useState } from 'react';
import { Leaf, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UtilityDialog } from './UtilityDialog';

export function AuthOverlay({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [done, setDone] = useState(false);
  return <UtilityDialog title={done ? 'Chào bạn, ghé chơi nhé.' : 'Một góc nhỏ cho điều mình yêu.'}
    subtitle="Khám phá các world trước; đăng nhập khi bạn muốn thử góc riêng của mình." compact onClose={onClose} testId="demo-auth-overlay">
    {done ? <div className="vw-auth-success" role="status"><Leaf size={32}/><h3>Đã mở hồ sơ demo {state.fanProfile.displayName}</h3>
      <p>Đơn hàng, bộ sưu tập và phòng hiện có được giữ nguyên. Đăng nhập không tự cấp hội viên của nghệ sĩ.</p>
      <button className="vw-utility-primary" onClick={onClose}>Tiếp tục từ đây</button></div> : <>
      <div className="vw-utility-segments" role="group" aria-label="Chọn đăng nhập hoặc đăng ký">
        <button aria-pressed={mode === 'login'} onClick={() => setMode('login')}>Đăng nhập</button>
        <button aria-pressed={mode === 'register'} onClick={() => setMode('register')}>Đăng ký</button>
      </div>
      <p className="vw-auth-intro">{mode === 'register' ? 'Thử tạo góc fan của bạn — không cần điền địa chỉ giao hàng ngay.' : 'Ghé lại phòng, những món đã giữ và các world bạn theo dõi.'}</p>
      <div className="vw-auth-providers">
        <button onClick={() => { dispatch({ type: 'DEMO_SIGN_IN', provider: 'google', mode }); setDone(true); }}><Mail size={21}/>Tiếp tục với Google / Gmail<span>Demo</span></button>
        <button onClick={() => { dispatch({ type: 'DEMO_SIGN_IN', provider: 'facebook', mode }); setDone(true); }}><b className="vw-provider-f" aria-hidden="true">f</b>Tiếp tục với Facebook<span>Demo</span></button>
      </div>
      <aside className="vw-utility-note"><strong>Chỉ mô phỏng, không kết nối tài khoản thật.</strong>
        <p>Cả hai lựa chọn dùng hồ sơ mẫu {state.fanProfile.displayName} trong trình duyệt này. Không yêu cầu mật khẩu, không mở Google/Facebook và không đồng bộ thiết bị.</p></aside>
      <button className="vw-utility-text" onClick={onClose}>Để sau, tiếp tục khám phá</button>
    </>}
  </UtilityDialog>;
}
