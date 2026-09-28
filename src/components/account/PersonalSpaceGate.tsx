import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isDemoSignedIn } from '../../world/account';
import { AuthOverlay } from './AuthOverlay';

/** A route-level gate: hiding the account menu alone does not protect personal views. */
export function PersonalSpaceGate({ children }: { children: ReactNode }) {
  const { state } = useApp();
  const [authOpen, setAuthOpen] = useState(false);
  const signedIn = isDemoSignedIn(state);
  useEffect(() => { if (signedIn) setAuthOpen(false); }, [signedIn]);
  if (signedIn) return children;
  return <section className="vw-personal-gate" aria-labelledby="personal-gate-title">
    <Leaf size={30} aria-hidden="true"/><p className="fw-eyebrow">MY LITTLE CORNER</p>
    <h1 id="personal-gate-title">Một góc riêng, khi bạn sẵn sàng.</h1>
    <p>Đăng nhập demo để mở phòng, avatar và bộ sưu tập của hồ sơ mẫu. Khi chưa đăng nhập, thông tin cá nhân không được hiển thị ở đây.</p>
    <button className="fw-button" onClick={() => setAuthOpen(true)}>Đăng nhập / Đăng ký</button>
    <Link className="fw-text-button" to="/explore">Tiếp tục khám phá</Link>
    {authOpen && <AuthOverlay onClose={() => setAuthOpen(false)}/>}
  </section>;
}
