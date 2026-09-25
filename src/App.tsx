import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import { getCurrentArtistId } from './world/currentArtist';
import { getExploreMomentById } from './world/exploreRows';
import { sessionContextUrl } from './world/worldContext';
import { FanShell as AppShell } from './components/FanShell';
const FanWorldView = lazy(() => import('./views/FanWorldView').then(m => ({default:m.FanWorldView})));
const FanShopView = lazy(() => import('./views/FanShopView').then(m => ({default:m.FanShopView})));
import { WorldPlazaView } from './views/WorldPlazaView';
const SessionView = lazy(() => import('./views/SessionView').then(m => ({default:m.SessionView})));
const BenefitDetailView = lazy(() => import('./views/BenefitDetailView').then(m => ({default:m.BenefitDetailView})));
const OrderDetailView = lazy(() => import('./views/OrderDetailView').then(m => ({default:m.OrderDetailView})));
const SupportCaseDetailView = lazy(() => import('./views/SupportCaseDetailView').then(m => ({default:m.SupportCaseDetailView})));
const InboxView = lazy(() => import('./views/InboxView').then(m => ({default:m.InboxView})));
const StudioOverviewView = lazy(() => import('./views/StudioOverviewView').then(m => ({default:m.StudioOverviewView})));
const AvatarStudioView = lazy(() => import('./views/AvatarStudioView').then(m => ({default:m.AvatarStudioView})));
const OperatorConsoleView = lazy(() => import('./views/OperatorConsoleView').then(m => ({default:m.OperatorConsoleView})));

const CartView=lazy(()=>import('./views/CartView').then(m=>({default:m.CartView})));
const MemberSpaceView=lazy(()=>import('./views/MemberSpaceView').then(m=>({default:m.MemberSpaceView})));
const ArtistGalleryView=lazy(()=>import('./views/ArtistGalleryView').then(m=>({default:m.ArtistGalleryView})));
const ArtistWorldView=lazy(()=>import('./views/ArtistWorldView').then(m=>({default:m.ArtistWorldView})));
function LegacyWorldRedirect({ destination = 'home' }: { destination?: 'home' | 'archive' }) {
  const { worldId } = useParams();
  const { search, state } = useLocation();
  if (!worldId) return <Navigate to="/explore" replace />;
  const context = new URLSearchParams(search).get('context');
  const momentId = context?.startsWith('explore-moment:') ? context.slice('explore-moment:'.length) : undefined;
  const path = momentId ? `/artist/${worldId}/moment/${momentId}` : `/artist/${worldId}${destination === 'archive' ? '/archive' : ''}${search}`;
  return <Navigate to={path} state={state} replace />;
}
function LegacyMomentRedirect() {
  const { momentId } = useParams();
  const { state } = useApp();
  const artist = Object.values(state.worlds).find(world => world.type === 'artist' && momentId && getExploreMomentById(world.id, momentId));
  return <Navigate to={artist && momentId ? `/artist/${artist.id}/moment/${momentId}` : '/explore'} replace />;
}
function LegacyArchiveRedirect() {
  const { state } = useApp();
  const artistId = getCurrentArtistId(state);
  return <Navigate to={artistId ? `/artist/${artistId}/archive` : '/explore'} replace />;
}
function SessionContextRedirect() {
  const { sessionId } = useParams();
  const { state } = useApp();
  const session = sessionId ? state.sessions[sessionId] : undefined;
  const world = session ? state.worlds[session.worldId] : undefined;
  const artistId = world?.type === 'artist' ? world.id
    : world?.type === 'ip' ? world.linkedWorldIds.find(id => state.worlds[id]?.type === 'artist') : undefined;
  return session && artistId
    ? <Navigate to={session.rightsApproved === false ? `/artist/${artistId}` : sessionContextUrl(artistId, session.id)} replace />
    : <SessionView />;
}
export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<p className="vx-loading" role="status">Đang mở một góc của thế giới…</p>}><Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<WorldPlazaView />} />
            <Route path="about-demo" element={<Navigate to="/" replace />} />
            <Route path="worlds" element={<WorldPlazaView />} />
            <Route path="artist/:artistId" element={<ArtistWorldView />} />
            <Route path="artist/:artistId/hall" element={<ArtistWorldView />} />
            <Route path="artist/:artistId/archive" element={<ArtistWorldView />} />
            <Route path="artist/:artistId/moment/:momentId" element={<ArtistWorldView />} />
            <Route path="worlds/:worldId" element={<LegacyWorldRedirect />} />
            <Route path="worlds/:worldId/moments" element={<LegacyWorldRedirect />} />
            <Route path="worlds/:worldId/archive" element={<LegacyWorldRedirect destination="archive" />} />
            <Route path="artists" element={<ArtistGalleryView />} />
            <Route path="explore" element={<ArtistGalleryView />} />
            <Route path="moments" element={<Navigate to="/explore" replace />} />
            <Route path="moments/:momentId" element={<LegacyMomentRedirect />} />
            <Route path="archive" element={<LegacyArchiveRedirect />} />
            <Route path="cart" element={<CartView />} /><Route path="checkout/:checkoutId" element={<CartView />} /><Route path="members/:fanId" element={<MemberSpaceView />} />
            <Route path="shop" element={<FanShopView />} />
            <Route path="worlds/:worldId/shop" element={<FanShopView />} />
            <Route path="sessions/:sessionId" element={<SessionContextRedirect />} />
            <Route path="me" element={<FanWorldView />} />
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
        </Routes></Suspense>
      </BrowserRouter>
    </AppProvider>
  );
};
