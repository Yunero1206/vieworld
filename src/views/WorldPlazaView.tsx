import { lazy, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, FolderHeart, Image as ImageIcon, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { HomeActivity } from '../world/homeOrientation';
import { getHomeOrientation } from '../world/homeOrientation';
import { getArtistCover } from '../world/artistVisuals';
import mySpaceArt from '../assets/home/my-space.webp';
import productPin from '../assets/home/product-pin.jpg';

const FanWorldView = lazy(() => import('./FanWorldView').then(module => ({ default: module.FanWorldView })));

const filters: { id: 'all' | HomeActivity['category']; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'moment', label: 'Khoảnh khắc' },
  { id: 'event', label: 'Sự kiện' },
  { id: 'capsule', label: 'Capsule' },
  { id: 'shop', label: 'VieSHOP' },
];

function activityImage(activity: HomeActivity) {
  if (activity.mediaSrc) return activity.mediaSrc;
  if (activity.category === 'shop') return productPin;
  return getArtistCover(activity.worldId);
}

function ActivityIcon({ category }: { category: HomeActivity['category'] }) {
  if (category === 'event') return <CalendarDays size={15} aria-hidden="true" />;
  if (category === 'capsule') return <FolderHeart size={15} aria-hidden="true" />;
  if (category === 'shop') return <ShoppingBag size={15} aria-hidden="true" />;
  return <ImageIcon size={15} aria-hidden="true" />;
}

function formatWhen(value: string, demoTime: string) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit' }).format(date);
  const currentDay = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit' }).format(new Date(demoTime));
  const time = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }).format(date);
  return { day: day === currentDay ? 'Hôm nay' : day, time };
}

export function WorldPlazaView() {
  const { state } = useApp();
  const [params] = useSearchParams();
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
  const { now, recent, upcomingAll, continueWith } = getHomeOrientation(state);
  const fanName = state.fanProfile.displayName.trim().split(/\s+/)[0] || 'bạn';
  const demoDate = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(state.demoTime));
  const otherRecent = recent.filter(item => item.id !== `event-${now?.id}`);
  const shownRecent = filter === 'all' ? otherRecent.slice(0, 4) : recent.filter(item => item.category === filter).slice(0, 4);
  const featuredImage = continueWith.to.startsWith('/shop') ? productPin : continueWith.to.startsWith('/explore') ? getArtistCover() : continueWith.visual === 'space' ? mySpaceArt : getArtistCover(continueWith.worldId);

  useEffect(() => { document.title = 'Home · VieWorld'; }, []);

  // Historical panel links still open their original destination.
  if (params.get('panel') || params.get('zone') || params.get('drawer')) return <FanWorldView />;

  return <div className="vw-home-editorial">
    <div className="vw-home-layout">
      <header className="vw-home-intro">
        <h1>Chào {fanName}.</h1>
        <p>Những gì đáng chú ý, và những điều bạn muốn giữ lại. <span>Dữ liệu mẫu · {demoDate}</span></p>
      </header>

      {now && <Link className="vw-home-now" to={now.to}>
        <img src={getArtistCover(state.sessions[now.id]?.worldId)} alt=""/>
        <div className="vw-home-now-content"><span className="vw-home-now-label">Đang diễn ra <span>· {now.eyebrow}</span></span>
        <strong>{now.title}</strong><span className="vw-home-now-world">{now.detail}</span></div>
        <span className="vw-home-now-action">Ghé xem</span>
        <ArrowRight size={17} aria-hidden="true" />
      </Link>}

      <section className="vw-home-feature" aria-labelledby="vw-home-feature-title">
        <div className="vw-home-section-title">
          <h2 id="vw-home-feature-title">{continueWith.action === 'Ghé lại' ? 'Tiếp tục từ chỗ bạn dừng lại' : 'Một nơi để bắt đầu'}</h2>
        </div>
        <Link className="vw-home-feature-card" to={continueWith.to}>
          <div className="vw-home-feature-image">
            <img src={featuredImage} alt="" fetchPriority="high" />
            <span>{continueWith.action === 'Ghé lại' ? 'NƠI BẠN VỪA GHÉ' : 'MY SPACE'}</span>
          </div>
          <div className="vw-home-feature-copy">
            <span className="vw-home-feature-kicker">{continueWith.visual === 'world' ? 'Artist World' : continueWith.to.startsWith('/shop') ? 'VieSHOP' : continueWith.to.startsWith('/explore') ? 'Explore' : 'My Space'}</span>
            <h3>{continueWith.title}</h3>
            <p>{continueWith.detail}</p>
            <span className="vw-home-feature-action">{continueWith.action} <ArrowRight size={18} aria-hidden="true" /></span>
          </div>
        </Link>
      </section>

      <section className="vw-home-upcoming" aria-labelledby="vw-home-upcoming-title">
        <div className="vw-home-section-row">
          <div className="vw-home-section-title"><h2 id="vw-home-upcoming-title">Khoảnh khắc sắp tới</h2><p>Những cuộc hẹn phía trước.</p></div>
          <Link className="vw-home-see-all" to="/explore">Khám phá thêm <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        {upcomingAll.length ? <div className="vw-home-upcoming-grid">
          {upcomingAll.map(item => {
            const when = formatWhen(item.at || state.demoTime, state.demoTime);
            return <Link key={item.id} className="vw-home-upcoming-card" to={item.to} aria-label={`${item.title}, ${when.day} ${when.time}`}>
              <img src={getArtistCover(item.worldId)} alt="" loading="lazy" />
              <div className="vw-home-card-shade" />
              <span className="vw-home-upcoming-context">{item.related ? 'TỪ WORLD BẠN THEO DÕI' : 'KHÁM PHÁ'}</span>
              <div className="vw-home-upcoming-copy"><small>{when.day} · {when.time}</small><strong>{item.title}</strong><span>{item.detail}</span></div>
              <span className="vw-home-card-arrow"><ArrowRight size={18} aria-hidden="true" /></span>
            </Link>;
          })}
        </div> : <div className="vw-home-empty"><p>Chưa có lịch nào sắp tới. Không bỏ lỡ gì đâu.</p><Link to="/explore">Khám phá world khác <ArrowRight size={16} aria-hidden="true" /></Link></div>}
      </section>

      <section className="vw-home-recent" aria-labelledby="vw-home-recent-title">
        <div className="vw-home-section-row">
          <div className="vw-home-section-title"><h2 id="vw-home-recent-title">Gần đây</h2><p>Những điều mới và kỷ niệm đã giữ.</p></div>
          <div className="vw-home-filters" role="group" aria-label="Lọc nội dung gần đây">
            {filters.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
          </div>
        </div>
        {shownRecent.length ? <div className="vw-home-recent-grid">
          {shownRecent.map(item => <Link key={item.id} className="vw-home-recent-card" to={item.to} aria-label={`${item.label}: ${item.title}`}>
            <img src={activityImage(item)} alt="" loading="lazy" />
            <div className="vw-home-card-shade" />
            <div className="vw-home-recent-copy">
              <small><ActivityIcon category={item.category} />{item.label}</small>
              <strong>{item.title}</strong>
            </div>
            <span className="vw-home-card-arrow"><ArrowRight size={18} aria-hidden="true" /></span>
          </Link>)}
        </div> : <div className="vw-home-empty">
          <p>Chưa có {filter === 'all' ? 'điều gì cần xem thêm' : filters.find(item => item.id === filter)?.label.toLowerCase()} ở mục này.</p>
          <Link to={filter === 'shop' ? '/shop' : filter === 'capsule' ? '/me?panel=capsules' : '/explore'}>Dạo quanh tiếp <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>}
      </section>

      <footer className="vw-home-footer"><span>VieWorld</span><i /><small>MUSIC&nbsp; — &nbsp;PEOPLE&nbsp; — &nbsp;MEMORIES</small></footer>
    </div>
  </div>;
}
