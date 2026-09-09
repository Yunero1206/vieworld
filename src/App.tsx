import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { DiscoverView } from './views/DiscoverView';
import { WorldsView } from './views/WorldsView';
import { WorldDetailView } from './views/WorldDetailView';
import { SessionView } from './views/SessionView';
import { MyWorldView } from './views/MyWorldView';
import { BenefitDetailView } from './views/BenefitDetailView';
import { ShopView } from './views/ShopView';
import { OrderDetailView } from './views/OrderDetailView';
import { SupportCaseDetailView } from './views/SupportCaseDetailView';
import { InboxView } from './views/InboxView';
import { StudioOverviewView } from './views/StudioOverviewView';
import { AvatarStudioView } from './views/AvatarStudioView';
import { OperatorConsoleView } from './views/OperatorConsoleView';
import { AboutDemoView } from './views/AboutDemoView';

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
            <Route path="worlds/:worldId/shop" element={<ShopView />} />
            <Route path="sessions/:sessionId" element={<SessionView />} />
            <Route path="me" element={<MyWorldView />} />
            <Route path="benefits/:benefitId" element={<BenefitDetailView />} />
            <Route path="orders/:orderId" element={<OrderDetailView />} />
            <Route path="support/:caseId" element={<SupportCaseDetailView />} />
            <Route path="inbox" element={<InboxView />} />
            <Route path="studio" element={<StudioOverviewView />} />
            <Route path="studio/avatar" element={<AvatarStudioView />} />
            <Route path="studio/operator" element={<OperatorConsoleView />} />
            <Route path="studio/operator/:sessionId" element={<OperatorConsoleView />} />
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
