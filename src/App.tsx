import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { DiscoverView } from './views/DiscoverView';
import { WorldsView } from './views/WorldsView';
import { WorldDetailView } from './views/WorldDetailView';
import { SessionView } from './views/SessionView';
import { MyWorldView } from './views/MyWorldView';
import { AboutDemoView } from './views/AboutDemoView';

const RoutePlaceholder: React.FC<{ title: string; packet: string; description: string }> = ({
  title,
  packet,
  description,
}) => (
  <div className="card" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
    <div style={{ display: 'inline-block', marginBottom: '12px' }}>
      <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}>
        LẬP TRÌNH THEO GÓI · {packet}
      </span>
    </div>
    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: '8px' }}>{title}</h2>
    <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '20px', lineHeight: 1.6 }}>
      {description}
    </p>
    <Link to="/" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
      Quay lại Khám phá
    </Link>
  </div>
);

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DiscoverView />} />
            <Route path="about-demo" element={<AboutDemoView />} />
            <Route path="worlds" element={<WorldsView />} />
            <Route path="worlds/:worldId" element={<WorldDetailView />} />
            <Route path="sessions/:sessionId" element={<SessionView />} />
            <Route path="me" element={<MyWorldView />} />
            <Route
              path="inbox"
              element={
                <RoutePlaceholder
                  title="Hộp thư thông báo trung thực (Inbox)"
                  packet="P10"
                  description="Các nhắc nhở cục bộ về phiên trực tiếp, xác nhận đơn hàng và cập nhật hỗ trợ sẽ có mặt tại P10."
                />
              }
            />
            <Route
              path="studio"
              element={
                <RoutePlaceholder
                  title="Bàn điều khiển Studio Demo"
                  packet="P11–P12"
                  description="Xem trước vai trò điều hành, quản lý phiên và duyệt avatar cho nghệ sĩ hư cấu."
                />
              }
            />
            <Route
              path="*"
              element={
                <div className="card" style={{ maxWidth: '480px', margin: '40px auto', textAlign: 'center' }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: '8px' }}>
                    Không tìm thấy trang
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginBottom: '16px' }}>
                    Đường dẫn không hợp lệ hoặc tính năng chưa được mở trong nguyên mẫu.
                  </p>
                  <Link to="/" className="btn btn-primary">
                    Về trang chủ
                  </Link>
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};
